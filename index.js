require('dotenv').config();

const http = require('http');

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
  MessageFlags,
} = require('discord.js');


 // ==========================================
 // RENDER HEALTH / DIAGNOSTICS
 // ==========================================

 const PORT = Number(process.env.PORT) || 10000;
 const startupState = {
   startedAt: new Date().toISOString(),
   readyAt: null,
   lastDisconnectAt: null,
   lastDisconnectCode: null,
   tasks: {
     slashCommands: 'pending',
     roleLanePanel: 'pending',
     contentCreatorPanel: 'pending',
     giveawayPanel: 'pending',
     giveawayRecovery: 'pending',
   },
   lastInteractionAt: null,
   interactionsSeen: 0,
   interactionErrors: 0,
   lastInteractionErrorAt: null,
   lastInteractionError: null,
};

 function healthSnapshot() {
   const discordReady = Boolean(client?.isReady?.());
   const taskValues = Object.values(startupState.tasks);
   const startupComplete = taskValues.every(value => value === 'ok');
   const startupFailed = taskValues.some(value => value === 'failed');
   return {
     status: discordReady && startupComplete && !startupFailed ? 'healthy' : 'degraded',
     web: 'online',
     discord: discordReady ? 'connected' : 'disconnected',
     bot: client?.user?.tag ?? null,
     startup: {
       complete: startupComplete,
       tasks: startupState.tasks,
       startedAt: startupState.startedAt,
       readyAt: startupState.readyAt,
     },
     diagnostics: {
       lastDisconnectAt: startupState.lastDisconnectAt,
       lastDisconnectCode: startupState.lastDisconnectCode,
       lastInteractionAt: startupState.lastInteractionAt,
       interactionsSeen: startupState.interactionsSeen,
       interactionErrors: startupState.interactionErrors,
       lastInteractionErrorAt: startupState.lastInteractionErrorAt,
       lastInteractionError: startupState.lastInteractionError,
     },
     uptimeSeconds: Math.floor(process.uptime()),
     timestamp: new Date().toISOString(),
   };
 }

 const server = http.createServer((req, res) => {
   const pathname = new URL(req.url, 'http://localhost').pathname;
   if (pathname === '/health' || pathname === '/health/ready') {
     const snapshot = healthSnapshot();
     // Keep /health HTTP 200 while the web process is alive so Render's
     // liveness probe does not restart a bot merely during Discord reconnects.
     // Use /health/ready when a strict readiness status code is desired.
     const readyEndpoint = pathname === '/health/ready';
     const isReady = snapshot.status === 'healthy';
     res.writeHead(readyEndpoint && !isReady ? 503 : 200, {
       'Content-Type': 'application/json; charset=utf-8',
       'Cache-Control': 'no-store',
     });
     return res.end(JSON.stringify(snapshot, null, 2));
   }

   res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
   res.end('LAMPOON Role & Lane Bot health server is online. See /health for diagnostics.');
 });

 server.on('error', error => {
   console.error('❌ Health HTTP server error:', error);
 });

 server.listen(PORT, '0.0.0.0', () => {
   console.log(`🌐 Health server running on port ${PORT}`);
 });

// ==========================================
// ENVIRONMENT VARIABLES
// ==========================================

const {
  DISCORD_TOKEN,
  CLIENT_ID,
  GUILD_ID,

  ROLE_LANE_CHANNEL_ID,
  LOG_CHANNEL_ID,

  LAMPOON_GIF_URL,

  ROLE_FIGHTER,
  ROLE_TANK,
  ROLE_ASSASSIN,
  ROLE_MAGE,
  ROLE_MARKSMAN,
  ROLE_SUPPORT,

  ROLE_CLASHLANE,
  ROLE_JUNGLER,
  ROLE_MIDLANE,
  ROLE_FARMLANE,
  ROLE_ROAMER,
  ROLE_VERSATILE,

  GIVEAWAY_CHANNEL_ID,
  GIVEAWAY_LOG_CHANNEL_ID,
  STAFF_ROLE_ID,
} = process.env;

// ==========================================
// CONSTANTS
// ==========================================

const AVISALA = '<a:Avisala:1542448826265243660>';

const GIVEAWAY_ROLE_ID = '1546589750549418044';

// Giveaway role expires after 24 hours
const GIVEAWAY_ROLE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

// Timers are rebuilt from durable tracker messages in the Discord Giveaway Log on every startup.
const giveawayExpirationTimers = new Map();
const giveawayClaims = new Map();
const GIVEAWAY_TRACKER_TITLE = '🎁 GIVEAWAY CLAIM TRACKER';

// ==========================================
// VALIDATION
// ==========================================

if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN is missing.');
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error('❌ CLIENT_ID is missing.');
  process.exit(1);
}

if (!GUILD_ID) {
  console.error('❌ GUILD_ID is missing.');
  process.exit(1);
}

if (!ROLE_LANE_CHANNEL_ID) {
  console.error('❌ ROLE_LANE_CHANNEL_ID is missing.');
  process.exit(1);
}

if (!LOG_CHANNEL_ID) {
  console.error('❌ LOG_CHANNEL_ID is missing.');
  process.exit(1);
}

if (!GIVEAWAY_CHANNEL_ID) {
  console.error('❌ GIVEAWAY_CHANNEL_ID is missing.');
  process.exit(1);
}

// ==========================================
// ROLE DATA
// ==========================================

const ROLES = [
  {
    key: 'fighter',
    name: 'Fighter',
    emoji: '⚔️',
    description: 'ᴅᴜʀᴀʙʟᴇ ᴍᴇʟᴇᴇ ʜᴇʀᴏᴇs ᴀɴᴅ ᴅᴜᴇʟɪsᴛs.',
    env: ROLE_FIGHTER,
  },
  {
    key: 'tank',
    name: 'Tank',
    emoji: '🛡️',
    description: 'ꜰʀᴏɴᴛʟɪɴᴇ ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ ᴛʜᴇ ᴛᴇᴀᴍ.',
    env: ROLE_TANK,
  },
  {
    key: 'assassin',
    name: 'Assassin',
    emoji: '🗡️',
    description: 'ʜɪɢʜ-ʙᴜʀsᴛ ʜᴇʀᴏᴇs ᴡʜᴏ ᴇʟɪᴍɪɴᴀᴛᴇ ᴘʀɪᴏʀɪᴛʏ ᴛᴀʀɢᴇᴛs.',
    env: ROLE_ASSASSIN,
  },
  {
    key: 'mage',
    name: 'Mage',
    emoji: '🔮',
    description: 'ᴍᴀɢɪᴄ ᴅᴀᴍᴀɢᴇ ᴀɴᴅ ᴄʀᴏᴡᴅ-ᴄᴏɴᴛʀᴏʟ sᴘᴇᴄɪᴀʟɪsᴛs.',
    env: ROLE_MAGE,
  },
  {
    key: 'marksman',
    name: 'Marksman',
    emoji: '🏹',
    description: 'ʀᴀɴɢᴇᴅ ʜᴇʀᴏᴇs ᴘʀᴏᴠɪᴅɪɴɢ ᴄᴏɴsɪsᴛᴇɴᴛ ᴅᴀᴍᴀɢᴇ.',
    env: ROLE_MARKSMAN,
  },
  {
    key: 'support',
    name: 'Support',
    emoji: '🛟',
    description: 'ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ, ᴇᴍᴘᴏᴡᴇʀ, ʜᴇᴀʟ, ᴏʀ ᴄᴏɴᴛʀᴏʟ.',
    env: ROLE_SUPPORT,
  },
];

// ==========================================
// LANE DATA
// ==========================================

const LANES = [
  {
    key: 'clashlane',
    name: 'Clashlane',
    emoji: '<:clashlane:1550553783304589443>',
    description: 'sᴏʟᴏ ʟᴀɴᴇ ꜰᴏʀ ᴅᴜᴇʟɪɴɢ ᴀɴᴅ sᴘʟɪᴛ ᴘᴜsʜɪɴɢ.',
    env: ROLE_CLASHLANE,
  },
  {
    key: 'jungler',
    name: 'Jungler',
    emoji: '<:jungler:1550553875562500248>',
    description: 'ᴊᴜɴɢʟᴇ ʀᴇsᴏᴜʀᴄᴇs, ᴏʙᴊᴇᴄᴛɪᴠᴇs, ᴀɴᴅ ᴍᴀᴘ ᴘʀᴇssᴜʀᴇ.',
    env: ROLE_JUNGLER,
  },
  {
    key: 'midlane',
    name: 'Midlane',
    emoji: '<:midlane:1550553955501871124>',
    description: 'ᴡᴀᴠᴇ ᴄʟᴇᴀʀɪɴɢ, ʀᴏᴛᴀᴛɪᴏɴs, ᴀɴᴅ ᴛᴇᴀᴍ ꜰɪɢʜᴛs.',
    env: ROLE_MIDLANE,
  },
  {
    key: 'farmlane',
    name: 'Farmlane',
    emoji: '<:farmlane:1550554057448361984>',
    description: 'ɢᴏʟᴅ ꜰᴀʀᴍɪɴɢ ᴀɴᴅ ᴘʀɪᴍᴀʀʏ ᴅᴀᴍᴀɢᴇ.',
    env: ROLE_FARMLANE,
  },
  {
    key: 'roamer',
    name: 'Roamer',
    emoji: '<:roamer:1550554124473466920>',
    description: 'ᴍᴀᴘ sᴜᴘᴘᴏʀᴛ, ɪɴɪᴛɪᴀᴛɪᴏɴ, ᴀɴᴅ ᴛᴇᴀᴍ ᴀssɪsᴛᴀɴᴄᴇ.',
    env: ROLE_ROAMER,
  },
  {
    key: 'versatile',
    name: 'Versatile',
    emoji: '<:versatile:1550554190496014366>',
    description: 'ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ ᴀᴅᴀᴘᴛɪɴɢ ᴛᴏ ᴍᴜʟᴛɪᴘʟᴇ ʟᴀɴᴇs.',
    env: ROLE_VERSATILE,
  },
];

// ==========================================
// DISCORD CLIENT
// ==========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User],
});

// ==========================================
// HELPERS
// ==========================================

function getRoleId(item) {
  return item.env;
}

function getSelectedItems(member, items) {
  return items.filter(item => {
    const roleId = getRoleId(item);

    if (!roleId) return false;

    return member.roles.cache.has(roleId);
  });
}

function selectedText(member, items) {
  const selected = getSelectedItems(member, items);

  if (!selected.length) {
    return '`None selected`';
  }

  return selected
    .map(item => `${item.emoji} **${item.name}**`)
    .join('\n');
}

// ==========================================
// MAIN EMBED
// ==========================================

function mainEmbed() {
  return new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle('🎮 LAMPOON ROLE & LANE SELECTION')
    .setDescription(
      `${AVISALA} **ROLE & LANE GUIDE**

**Your selection automatically updates your LAMPOON Discord roles.**

⚔️ **Role**
Choose one or more Hero Roles you are comfortable playing in-game.

🛣️ **Lane**
Choose one or more Lane Roles to gain their corresponding server colors.

You can change your Role or Lane selections anytime.`
    )
    .setThumbnail(LAMPOON_GIF_URL)
    .setFooter({
      text: 'LAMPOON • Role & Lane Selection',
    });
}

// ==========================================
// ROLE EMBED
// ==========================================

function roleEmbed() {
  return new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle('⚔️ ROLE SELECTION')
    .setDescription(
      `${AVISALA} **Choose your Hero Roles**

Select one or more roles that represent the heroes you are comfortable playing.

Your selection is private and only affects your own Discord roles.`
    )
    .setThumbnail(LAMPOON_GIF_URL)
    .setFooter({
      text: 'LAMPOON • Role Selection',
    });
}

// ==========================================
// LANE EMBED
// ==========================================

function laneEmbed() {
  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🛣️ LANE SELECTION')
    .setDescription(
      `${AVISALA} **Choose your Lanes**

Select one or more lanes you are comfortable playing.

Your selection is private and automatically gives you the corresponding LAMPOON lane roles and server colors.`
    )
    .setThumbnail(LAMPOON_GIF_URL)
    .setFooter({
      text: 'LAMPOON • Lane Selection',
    });
}

// ==========================================
// ROLE MENU
// ==========================================

function roleMenu(member) {
  const selected = getSelectedItems(member, ROLES);

  const menu = new StringSelectMenuBuilder()
    .setCustomId('lampoon_role_select')
    .setPlaceholder('Select your Hero Roles')
    .setMinValues(1)
    .setMaxValues(ROLES.length)
    .addOptions(
      ROLES.map(role =>
        new StringSelectMenuOptionBuilder()
          .setLabel(role.name)
          .setDescription(role.description)
          .setValue(role.key)
          .setEmoji(role.emoji)
          .setDefault(
            selected.some(x => x.key === role.key)
          )
      )
    );

  return new ActionRowBuilder().addComponents(menu);
}

// ==========================================
// LANE MENU
// ==========================================

function laneMenu(member) {
  const selected = getSelectedItems(member, LANES);

  const menu = new StringSelectMenuBuilder()
    .setCustomId('lampoon_lane_select')
    .setPlaceholder('Select your Lanes')
    .setMinValues(1)
    .setMaxValues(LANES.length)
    .addOptions(
      LANES.map(lane =>
        new StringSelectMenuOptionBuilder()
          .setLabel(lane.name)
          .setDescription(lane.description)
          .setValue(lane.key)
          .setEmoji(lane.emoji)
          .setDefault(
            selected.some(x => x.key === lane.key)
          )
      )
    );

  return new ActionRowBuilder().addComponents(menu);
}

// ==========================================
// PANEL BUTTONS
// ==========================================

function rolePanelButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_role_done')
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('lampoon_switch_lane')
        .setLabel('Switch to Lane')
        .setEmoji('🛣️')
        .setStyle(ButtonStyle.Secondary)
    ),
  ];
}

function lanePanelButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_lane_done')
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('lampoon_switch_role')
        .setLabel('Switch to Role')
        .setEmoji('⚔️')
        .setStyle(ButtonStyle.Secondary)
    ),
  ];
}

function mainButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_role')
        .setLabel('Role')
        .setEmoji('⚔️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('lampoon_lane')
        .setLabel('Lane')
        .setEmoji('🛣️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('lampoon_current')
        .setLabel('My Selection')
        .setEmoji('🔎')
        .setStyle(ButtonStyle.Primary)
    ),
  ];
}

// ==========================================
// CURRENT SELECTION EMBED
// ==========================================

function currentSelectionEmbed(member) {
  return new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle('✦ CURRENTLY SELECTED ✦')
    .setDescription(
      `${AVISALA} **Your current selections are private.**

⚔️ **Hero Roles**
${selectedText(member, ROLES)}

🛣️ **Lanes**
${selectedText(member, LANES)}

Only you can view this selection.`
    )
    .setThumbnail(LAMPOON_GIF_URL)
    .setFooter({
      text: 'LAMPOON • Private Selection',
    });
}

// ==========================================
// CURRENT SELECTION BUTTONS
// ==========================================

function currentSelectionButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_switch_role')
        .setLabel('Switch Role')
        .setEmoji('⚔️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('lampoon_switch_lane')
        .setLabel('Switch Lane')
        .setEmoji('🛣️')
        .setStyle(ButtonStyle.Secondary)
    ),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_clear_roles')
        .setLabel('Clear Roles')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId('lampoon_clear_lanes')
        .setLabel('Clear Lanes')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger)
    ),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_close')
        .setLabel('Close')
        .setEmoji('✖️')
        .setStyle(ButtonStyle.Secondary)
    ),
  ];
}

// ==========================================
// LOG EMBEDS
// ==========================================

function roleLogEmbed(member, added, removed) {
  const embed = new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle('⚔️ ROLE SELECTION LOG')
    .setThumbnail(member.user.displayAvatarURL())
    .addFields({
      name: '👤 Member',
      value: `${member}`,
      inline: false,
    });

  if (added.length) {
    embed.addFields({
      name: '➕ Added',
      value: added
        .map(item => `${item.emoji} **${item.name}**`)
        .join('\n'),
      inline: false,
    });
  }

  if (removed.length) {
    embed.addFields({
      name: '➖ Removed',
      value: removed
        .map(item => `${item.emoji} **${item.name}**`)
        .join('\n'),
      inline: false,
    });
  }

  if (!added.length && !removed.length) {
    embed.addFields({
      name: 'ℹ️ Changes',
      value: '`No changes`',
      inline: false,
    });
  }

  embed.setTimestamp();

  return embed;
}

function laneLogEmbed(member, added, removed) {
  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🛣️ LANE SELECTION LOG')
    .setThumbnail(member.user.displayAvatarURL())
    .addFields({
      name: '👤 Member',
      value: `${member}`,
      inline: false,
    });

  if (added.length) {
    embed.addFields({
      name: '➕ Added',
      value: added
        .map(item => `${item.emoji} **${item.name}**`)
        .join('\n'),
      inline: false,
    });
  }

  if (removed.length) {
    embed.addFields({
      name: '➖ Removed',
      value: removed
        .map(item => `${item.emoji} **${item.name}**`)
        .join('\n'),
      inline: false,
    });
  }

  if (!added.length && !removed.length) {
    embed.addFields({
      name: 'ℹ️ Changes',
      value: '`No changes`',
      inline: false,
    });
  }

  embed.setTimestamp();

  return embed;
}

// ==========================================
// UPDATE ROLE SELECTION
// ==========================================

async function updateRoleSelection(member, values) {
  const selectedKeys = new Set(values);

  const current = getSelectedItems(member, ROLES);

  const added = [];
  const removed = [];

  for (const role of ROLES) {
    const roleId = getRoleId(role);

    if (!roleId) continue;

    const hasRole = member.roles.cache.has(roleId);
    const shouldHaveRole = selectedKeys.has(role.key);

    if (shouldHaveRole && !hasRole) {
      await member.roles.add(roleId);
      added.push(role);
    }

    if (!shouldHaveRole && hasRole) {
      await member.roles.remove(roleId);
      removed.push(role);
    }
  }

  if (added.length || removed.length) {
    const logChannel = await client.channels
      .fetch(LOG_CHANNEL_ID)
      .catch(() => null);

    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({
        embeds: [
          roleLogEmbed(member, added, removed),
        ],
      });
    }
  }

  return {
    current,
    added,
    removed,
  };
}

// ==========================================
// UPDATE LANE SELECTION
// ==========================================

async function updateLaneSelection(member, values) {
  const selectedKeys = new Set(values);

  const current = getSelectedItems(member, LANES);

  const added = [];
  const removed = [];

  for (const lane of LANES) {
    const roleId = getRoleId(lane);

    if (!roleId) continue;

    const hasRole = member.roles.cache.has(roleId);
    const shouldHaveRole = selectedKeys.has(lane.key);

    if (shouldHaveRole && !hasRole) {
      await member.roles.add(roleId);
      added.push(lane);
    }

    if (!shouldHaveRole && hasRole) {
      await member.roles.remove(roleId);
      removed.push(lane);
    }
  }

  if (added.length || removed.length) {
    const logChannel = await client.channels
      .fetch(LOG_CHANNEL_ID)
      .catch(() => null);

    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({
        embeds: [
          laneLogEmbed(member, added, removed),
        ],
      });
    }
  }

  return {
    current,
    added,
    removed,
  };
}

// ==========================================
// CLEAR ROLE SELECTION
// ==========================================

async function clearRoles(member) {
  const selected = getSelectedItems(member, ROLES);

  for (const role of selected) {
    const roleId = getRoleId(role);

    if (!roleId) continue;

    await member.roles.remove(roleId);
  }

  if (selected.length) {
    const logChannel = await client.channels
      .fetch(LOG_CHANNEL_ID)
      .catch(() => null);

    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({
        embeds: [
          roleLogEmbed(member, [], selected),
        ],
      });
    }
  }

  return selected;
}

// ==========================================
// CLEAR LANE SELECTION
// ==========================================

async function clearLanes(member) {
  const selected = getSelectedItems(member, LANES);

  for (const lane of selected) {
    const roleId = getRoleId(lane);

    if (!roleId) continue;

    await member.roles.remove(roleId);
  }

  if (selected.length) {
    const logChannel = await client.channels
      .fetch(LOG_CHANNEL_ID)
      .catch(() => null);

    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({
        embeds: [
          laneLogEmbed(member, [], selected),
        ],
      });
    }
  }

  return selected;
}


// ==========================================
// CONTENT CREATOR TYPE & PLATFORM SELECTION
// ==========================================

const CONTENT_CREATOR_ROLE_ID = '1537899709686087781';
const CONTENT_CREATOR_HELP_CHANNEL_ID = '1538957346729103480';

const CONTENT_CREATOR_TYPES = [
  {
    key: 'artist',
    name: 'Artist',
    emoji: '🎨',
    roleId: '1538257357212094554',
  },
  {
    key: 'streamer',
    name: 'Streamer',
    emoji: '📽️',
    roleId: '1538257196599607387',
  },
  {
    key: 'general_cc',
    name: 'General CC',
    emoji: '🎮',
    roleId: '1537897642380492820',
  },
  {
    key: 'satirical_cc',
    name: 'Satirical CC',
    emoji: '🎬',
    roleId: '1537897725968908470',
  },
];

const CONTENT_CREATOR_PLATFORMS = [
  {
    key: 'tiktok',
    name: 'TikTok',
    emoji: '<:Tiktok:1542438653094268969>',
    roleId: '1540023447785177218',
    color: 0x000000,
  },
  {
    key: 'facebook',
    name: 'Facebook',
    emoji: '<:Facebook:1542438933244416100>',
    roleId: '1562680703114551306',
    color: 0x1877F2,
  },
  {
    key: 'youtube',
    name: 'YouTube',
    emoji: '<:YouTube:1562770729471316051>',
    roleId: '1562680791828402308',
    color: 0xFF0000,
  },
  {
    key: 'twitch',
    name: 'Twitch',
    emoji: '<:Twitch:1562770473153073254>',
    roleId: '1562680863991402556',
    color: 0x9146FF,
  },
];

const CONTENT_CREATOR_REACTIONS = ['📽️', '🎨', '🎬', '🎮'];
const pendingPlatformSelections = new Map();

// Always verify eligibility against a freshly fetched GuildMember before granting
// Content Creator type or platform roles. This prevents stale interaction caches
// or a direct/old component interaction from bypassing the approved-role gate.
async function fetchApprovedContentCreatorMember(guild, userId) {
  if (!guild || !userId) return null;
  try {
    const member = await guild.members.fetch({ user: userId, force: true });
    return member.roles.cache.has(CONTENT_CREATOR_ROLE_ID) ? member : null;
  } catch (error) {
    console.error('Could not verify approved Content Creator role:', error.message);
    return null; // Fail closed: never grant roles if approval cannot be verified.
  }
}

function contentCreatorPanelEmbed() {
  return new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle('🎥 LAMPOON CONTENT CREATOR SELECTION')
    .setDescription(
      `${AVISALA} **CONTENT CREATOR TYPE**

React with the matching emoji below to receive a Content Creator type role. You must already have the <@&${CONTENT_CREATOR_ROLE_ID}> role. You can react to multiple types.

📽️ **Streamer**
🎨 **Artist**
🎬 **Satirical CC**
🎮 **General CC**

After choosing a type, click **Select Platforms** below to privately choose multiple social platforms, then press **Done** to receive those roles.

If you do not have the Content Creator role, please visit <#${CONTENT_CREATOR_HELP_CHANNEL_ID}>.`
    )
    .setThumbnail(LAMPOON_GIF_URL)
    .setFooter({ text: 'LAMPOON • Content Creator Selection' });
}

function contentCreatorTypeButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_cc_open_platforms')
        .setLabel('Select Platforms')
        .setEmoji('🌐')
        .setStyle(ButtonStyle.Primary)
    ),
  ];
}

function contentCreatorPlatformEmbed(_color = 0xC0C0C0, selectedPlatform = null) {
  const selectedText = selectedPlatform
    ? `\n\n${selectedPlatform.emoji} **\`${selectedPlatform.name}\`** role selected.`
    : '';

  return new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle('🌐 CONTENT CREATOR PLATFORMS')
    .setDescription(
      `${AVISALA} **Choose your social media platforms privately.**

Choose one or more platforms from the menu below.

• Press **Done** to receive the selected platform roles.
• Press **Remove Role** to remove the selected platform roles if you chose the wrong ones.

<:Tiktok:1542438653094268969> **\`TikTok\`**
<:Facebook:1542438933244416100> **\`Facebook\`**
<:YouTube:1562770729471316051> **\`YouTube\`**
<:Twitch:1562770473153073254> **\`Twitch\`**${selectedText}`
    )
    .setThumbnail(LAMPOON_GIF_URL)
    .setFooter({ text: 'LAMPOON • Private Content Creator Selection' });
}

function contentCreatorPlatformButtons() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('lampoon_cc_platform_select')
    .setPlaceholder('Choose one or more platforms')
    .setMinValues(1)
    .setMaxValues(CONTENT_CREATOR_PLATFORMS.length)
    .addOptions(CONTENT_CREATOR_PLATFORMS.map(platform => ({
      label: platform.name,
      value: platform.key,
      description: `Select the ${platform.name} role`,
      emoji: { id: platform.key === 'tiktok' ? '1542438653094268969' : platform.key === 'facebook' ? '1542438933244416100' : platform.key === 'youtube' ? '1562770729471316051' : '1562770473153073254', name: platform.key === 'tiktok' ? 'Tiktok' : platform.key === 'facebook' ? 'Facebook' : platform.key === 'youtube' ? 'YouTube' : 'Twitch' },
    })));
  return [
    new ActionRowBuilder().addComponents(menu),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_cc_platform_done')
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('lampoon_cc_platform_remove')
        .setLabel('Remove Role')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger)
    ),
  ];
}

async function sendContentCreatorLog(member, added, removed) {
  if (!added.length && !removed.length) return;

  const logChannel = await client.channels
    .fetch(LOG_CHANNEL_ID)
    .catch(() => null);

  if (logChannel && logChannel.isTextBased()) {
    await logChannel.send({
      embeds: [roleLogEmbed(member, added, removed)],
    });
  }
}

async function selectContentCreatorType(member, selectedType) {
  const eligibleMember = await fetchApprovedContentCreatorMember(member.guild, member.id);
  if (!eligibleMember) {
    const error = new Error('Member does not have the approved Content Creator role.');
    error.code = 'CONTENT_CREATOR_APPROVAL_REQUIRED';
    throw error;
  }
  if (eligibleMember.roles.cache.has(selectedType.roleId)) return false;

  await eligibleMember.roles.add(selectedType.roleId, 'Approved Content Creator type selection');
  await sendContentCreatorLog(
    eligibleMember,
    [{ name: selectedType.name, emoji: selectedType.emoji }],
    []
  );
  return true;
}

async function selectContentCreatorPlatform(member, platform) {
  // This check lives inside the grant helper too, so every caller is protected.
  const eligibleMember = await fetchApprovedContentCreatorMember(member.guild, member.id);
  if (!eligibleMember) {
    const error = new Error('Member does not have the approved Content Creator role.');
    error.code = 'CONTENT_CREATOR_APPROVAL_REQUIRED';
    throw error;
  }
  if (eligibleMember.roles.cache.has(platform.roleId)) {
    return false;
  }

  await eligibleMember.roles.add(platform.roleId, 'Approved Content Creator platform selection');
  const logChannel = await client.channels
    .fetch(LOG_CHANNEL_ID)
    .catch(() => null);

  if (logChannel && logChannel.isTextBased()) {
    await logChannel.send({
      embeds: [
        roleLogEmbed(
          eligibleMember,
          [{ name: platform.name, emoji: platform.emoji }],
          []
        ),
      ],
    });
  }

  return true;
}

async function setupContentCreatorPanel() {
  const channel = await client.channels
    .fetch(ROLE_LANE_CHANNEL_ID)
    .catch(() => null);

  if (!channel || !channel.isTextBased()) {
    console.error('❌ Content Creator selection channel not found.');
    return;
  }

  const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);

  if (!messages) {
    console.error('❌ Could not fetch messages for Content Creator panel.');
    return;
  }

  const existing = messages.find(message =>
    message.author.id === client.user.id &&
    message.embeds.some(embed =>
      embed.title === '🎥 LAMPOON CONTENT CREATOR SELECTION'
    )
  );

  const payload = {
    embeds: [contentCreatorPanelEmbed()],
    components: contentCreatorTypeButtons(),
  };

  let panelMessage;
  if (existing) {
    panelMessage = await existing.edit(payload);
    console.log('Existing Content Creator panel updated.');
  } else {
    panelMessage = await channel.send(payload);
    console.log('New Content Creator panel created.');
  }

  // Actual type-emoji Discord reactions for Content Creator type roles.
  for (const emoji of CONTENT_CREATOR_REACTIONS) {
    try { await panelMessage.react(emoji); }
    catch (error) { console.error(`Could not add reaction ${emoji}:`, error.message); }
  }
}

// ==========================================
// FIND / CREATE ROLE & LANE PANEL
// ==========================================

async function sendOrFindPanel() {
  const channel = await client.channels
    .fetch(ROLE_LANE_CHANNEL_ID)
    .catch(() => null);

  if (!channel || !channel.isTextBased()) {
    console.error('❌ Role & Lane channel not found.');
    return;
  }

  const messages = await channel.messages
    .fetch({ limit: 100 })
    .catch(() => null);

  if (!messages) {
    console.error('❌ Could not fetch channel messages.');
    return;
  }

  const existing = messages.find(message => {
    if (message.author.id !== client.user.id) {
      return false;
    }

    if (!message.embeds.length) {
      return false;
    }

    return (
      message.embeds[0].title ===
      '🎮 LAMPOON ROLE & LANE SELECTION'
    );
  });

  const payload = {
    embeds: [mainEmbed()],
    components: mainButtons(),
  };

  if (existing) {
    await existing.edit(payload);

    console.log('Existing LAMPOON panel updated.');

    return;
  }

  await channel.send(payload);

  console.log('New LAMPOON panel created.');
}

// ==========================================
// GIVEAWAY LOG HELPER
// ==========================================

async function sendGiveawayLog(embed) {
  if (!GIVEAWAY_LOG_CHANNEL_ID) {
    console.log(
      'ℹ️ GIVEAWAY_LOG_CHANNEL_ID is not configured. Giveaway log skipped.'
    );
    return;
  }

  const logChannel = await client.channels
    .fetch(GIVEAWAY_LOG_CHANNEL_ID)
    .catch(() => null);

  if (!logChannel || !logChannel.isTextBased()) {
    console.error('❌ Giveaway log channel not found.');
    return;
  }

  return await logChannel.send({
    embeds: [embed],
  }).catch(error => {
    console.error(
      '❌ Failed to send Giveaway log:',
      error
    );
  });
}

// ==========================================
// GIVEAWAY LOG EMBED
// ==========================================

function giveawayLogEmbed(member, action, reason = '—') {
  return new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle('🎁 GIVEAWAY LOG')
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      {
        name: '👤 Member',
        value: `${member}\n\`${member.user.tag}\``,
        inline: false,
      },
      {
        name: '📌 Action',
        value: action,
        inline: false,
      },
      {
        name: '📝 Reason',
        value: reason || '—',
        inline: false,
      }
    )
    .setTimestamp()
    .setFooter({
      text: 'LAMPOON • Giveaway Logs',
    });
}

// ==========================================
// DURABLE GIVEAWAY CLAIM TRACKER
// The Discord log message itself stores the deadline/status so Render restarts
// do not erase pending expirations (unlike setTimeout-only storage).
// ==========================================

function clearGiveawayExpirationTimer(memberId) {
  const timer = giveawayExpirationTimers.get(memberId);
  if (timer) clearTimeout(timer);
  giveawayExpirationTimers.delete(memberId);
}

function giveawayTrackerEmbed(record, member = null) {
  const expiresAt = new Date(record.expiresAt);
  const claimedAt = new Date(record.claimedAt);
  const colorByStatus = { ACTIVE: 0x3498DB, 'TICKET OPEN': 0xF1C40F, CLOSED: 0x2ECC71, EXPIRED: 0xE74C3C };
  const embed = new EmbedBuilder()
    .setColor(colorByStatus[record.status] || 0xC0C0C0)
    .setTitle(GIVEAWAY_TRACKER_TITLE)
    .setDescription('Persistent status record for a temporary @Giveaways role claim.')
    .addFields(
      { name: '👤 Member', value: `<@${record.memberId}>`, inline: true },
      { name: '🆔 Member ID', value: record.memberId, inline: true },
      { name: '📊 Status', value: record.status, inline: true },
      { name: '🕒 Claimed At', value: `<t:${Math.floor(claimedAt.getTime() / 1000)}:F>`, inline: false },
      { name: '⏰ Expires At', value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:F>`, inline: false },
      { name: '📅 Expiration ISO', value: expiresAt.toISOString(), inline: false },
      { name: '🎟️ Tickety Ticket Channel', value: record.ticketChannelId ? `<#${record.ticketChannelId}> (${record.ticketChannelId})` : 'Not detected yet', inline: false },
      { name: '📝 Latest Update', value: record.note || 'Role claimed; waiting for ticket creation.', inline: false },
    )
    .setTimestamp(new Date())
    .setFooter({ text: 'LAMPOON • Persistent Giveaway Claim Tracker' });
  if (member?.user) embed.setThumbnail(member.user.displayAvatarURL());
  return embed;
}

async function saveGiveawayClaimRecord(record, member = null) {
  if (!GIVEAWAY_LOG_CHANNEL_ID) {
    console.error('❌ GIVEAWAY_LOG_CHANNEL_ID is not configured; giveaway claim persistence cannot be saved.');
    return false;
  }
  const channel = await client.channels.fetch(GIVEAWAY_LOG_CHANNEL_ID).catch(() => null);
  if (!channel?.isTextBased()) {
    console.error('❌ Cannot save giveaway tracker: Giveaway Log channel is missing or not text-based.');
    return false;
  }
  const embed = giveawayTrackerEmbed(record, member);
  if (record.logMessageId) {
    const message = await channel.messages.fetch(record.logMessageId).catch(() => null);
    if (message) {
      await message.edit({ embeds: [embed] }).catch(error => console.error('Could not update giveaway tracker:', error.message));
      return true;
    }
  }
  const message = await channel.send({ embeds: [embed] }).catch(error => {
    console.error('Could not create giveaway tracker message:', error.message);
    return null;
  });
  if (!message) return false;
  record.logMessageId = message.id;
  giveawayClaims.set(record.memberId, record);
  // Persist the message ID as well by updating the tracker with the latest record.
  await message.edit({ embeds: [giveawayTrackerEmbed(record, member)] }).catch(() => {});
  return true;
}

async function updateGiveawayClaimStatus(record, status, note, member = null) {
  record.status = status;
  record.note = note;
  record.updatedAt = new Date().toISOString();
  giveawayClaims.set(record.memberId, record);
  if (status !== 'ACTIVE') clearGiveawayExpirationTimer(record.memberId);
  await saveGiveawayClaimRecord(record, member);
}

async function expireGiveawayClaim(memberId) {
  const record = giveawayClaims.get(memberId);
  if (!record || record.status !== 'ACTIVE') return;
  try {
    const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
    const member = guild ? await guild.members.fetch(memberId).catch(() => null) : null;
    if (member?.roles.cache.has(GIVEAWAY_ROLE_ID)) {
      await member.roles.remove(GIVEAWAY_ROLE_ID, 'Giveaway claim expired after 24 hours without a Tickety ticket');
      await sendGiveawayLog(giveawayLogEmbed(member, '⏰ Giveaway Role Expired', `The role was removed because no Tickety ticket was detected within 24 hours. Expired at: ${new Date().toISOString()}`));
    }
    await updateGiveawayClaimStatus(record, 'EXPIRED', 'No Tickety ticket was detected within 24 hours; the Giveaway role was removed.', member);
  } catch (error) {
    console.error(`❌ Failed to expire Giveaway role for ${memberId}:`, error);
    // Keep the ACTIVE tracker so a later restart can retry the overdue expiry.
  } finally {
    clearGiveawayExpirationTimer(memberId);
  }
}

function scheduleGiveawayRoleExpiration(memberId) {
  clearGiveawayExpirationTimer(memberId);
  const record = giveawayClaims.get(memberId);
  if (!record || record.status !== 'ACTIVE') return;
  const remaining = Math.max(0, new Date(record.expiresAt).getTime() - Date.now());
  const timer = setTimeout(() => expireGiveawayClaim(memberId), remaining);
  timer.unref?.();
  giveawayExpirationTimers.set(memberId, timer);
  console.log(`⏰ Giveaway role expiration scheduled for ${memberId} at ${record.expiresAt}.`);
}

async function recoverGiveawayClaimTrackers() {
  if (!GIVEAWAY_LOG_CHANNEL_ID) {
    console.warn('⚠️ GIVEAWAY_LOG_CHANNEL_ID is not configured; persistent expiration recovery is unavailable.');
    return;
  }
  const channel = await client.channels.fetch(GIVEAWAY_LOG_CHANNEL_ID).catch(() => null);
  if (!channel?.isTextBased()) {
    console.error('❌ Cannot recover giveaway expirations: Giveaway Log channel unavailable.');
    return;
  }
  const latestByMember = new Map();
  let before;
  // Read historical tracker messages in pages, up to 100 pages (5,000 messages).
  for (let page = 0; page < 100; page++) {
    const batch = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) }).catch(() => null);
    if (!batch?.size) break;
    for (const message of batch.values()) {
      const embed = message.embeds.find(item => item.title === GIVEAWAY_TRACKER_TITLE);
      if (!embed) continue;
      const fields = new Map((embed.fields || []).map(field => [field.name, field.value]));
      const memberId = fields.get('🆔 Member ID');
      const status = fields.get('📊 Status');
      const expiresRaw = fields.get('📅 Expiration ISO');
      const claimedRaw = fields.get('🕒 Claimed At');
      if (!memberId || !status || !expiresRaw || !claimedRaw) continue;
      // Newer tracker edits keep the same message ID. Compare embed timestamps.
      const prior = latestByMember.get(memberId);
      const stamp = new Date(embed.timestamp || message.createdAt).getTime();
      if (!prior || stamp > prior.stamp) {
        const claimedUnix = Number((claimedRaw.match(/<t:(\d+):/) || [])[1]);
        latestByMember.set(memberId, {
          stamp,
          record: {
            memberId, status,
            claimedAt: Number.isFinite(claimedUnix) && claimedUnix ? new Date(claimedUnix * 1000).toISOString() : message.createdAt.toISOString(),
            expiresAt: expiresRaw,
            ticketChannelId: ((fields.get('🎟️ Tickety Ticket Channel') || '').match(/\((\d{15,})\)/) || [])[1] || null,
            note: fields.get('📝 Latest Update') || 'Recovered from Giveaway Log.',
            logMessageId: message.id,
          },
        });
      }
    }
    before = batch.last().id;
    if (batch.size < 100) break;
  }
  for (const { record } of latestByMember.values()) {
    giveawayClaims.set(record.memberId, record);
    if (record.status === 'ACTIVE') scheduleGiveawayRoleExpiration(record.memberId);
  }
  console.log(`♻️ Recovered ${giveawayClaims.size} persistent giveaway claim tracker(s) from Discord logs.`);
}

async function detectTicketyTicketCreated(channel) {
  if (!channel?.guild || channel.guild.id !== GUILD_ID || !channel.permissionOverwrites?.cache) return;
  const overwriteIds = [...channel.permissionOverwrites.cache.keys()];
  for (const record of giveawayClaims.values()) {
    if (record.status !== 'ACTIVE' || !overwriteIds.includes(record.memberId)) continue;
    record.ticketChannelId = channel.id;
    const member = await channel.guild.members.fetch(record.memberId).catch(() => null);
    await updateGiveawayClaimStatus(record, 'TICKET OPEN', 'Tickety ticket channel detected; the 24-hour no-ticket expiry has been cancelled. The Giveaway role will be removed when this ticket channel closes.', member);
    if (member) await sendGiveawayLog(giveawayLogEmbed(member, '🎟️ Giveaway Ticket Opened', `Tickety ticket channel detected: <#${channel.id}>. The 24-hour no-ticket expiry was cancelled.`));
  }
}

async function detectTicketyTicketClosed(channel) {
  if (!channel?.guild || channel.guild.id !== GUILD_ID) return;
  for (const record of giveawayClaims.values()) {
    if (record.status !== 'TICKET OPEN') continue;
    const matchedById = record.ticketChannelId === channel.id;
    const matchedByOverwrite = channel.permissionOverwrites?.cache?.has(record.memberId);
    if (!matchedById && !matchedByOverwrite) continue;
    const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
    const member = guild ? await guild.members.fetch(record.memberId).catch(() => null) : null;
    if (member?.roles.cache.has(GIVEAWAY_ROLE_ID)) {
      await member.roles.remove(GIVEAWAY_ROLE_ID, 'Tickety giveaway ticket closed');
    }
    await updateGiveawayClaimStatus(record, 'CLOSED', `Tickety ticket channel ${channel.name || channel.id} closed/deleted; Giveaway role removed.`, member);
    if (member) await sendGiveawayLog(giveawayLogEmbed(member, '🔒 Giveaway Role Removed — Ticket Closed', `Tickety ticket channel ${channel.name || channel.id} closed. The Giveaway role was removed. Closed at: ${new Date().toISOString()}`));
  }
}

client.on('channelCreate', channel => {
  detectTicketyTicketCreated(channel).catch(error => console.error('Tickety ticket-detection error:', error));
});
client.on('channelDelete', channel => {
  detectTicketyTicketClosed(channel).catch(error => console.error('Tickety ticket-close handler error:', error));
});
client.on('channelUpdate', (oldChannel, newChannel) => {
  if (!newChannel?.permissionOverwrites?.cache) return;
  const looksClosedByName = /closed|archiv/i.test(newChannel.name || '');
  const memberDenyDetected = [...giveawayClaims.values()].some(record => {
    if (record.status !== 'TICKET OPEN' || record.ticketChannelId !== newChannel.id) return false;
    const overwrite = newChannel.permissionOverwrites.cache.get(record.memberId);
    return Boolean(overwrite?.deny?.has('SendMessages'));
  });
  if (looksClosedByName || memberDenyDetected) {
    detectTicketyTicketClosed(newChannel).catch(error => console.error('Tickety ticket-close update handler error:', error));
  }
});

// ==========================================
// GIVEAWAY EMBED
// ==========================================

function createGiveawayEmbed() {
  return new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle('🎁 GIVEAWAY ROLE CLAIM')
    .setDescription(
      [
        'Congratulations to all eligible giveaway winners! 🎉',
        '',
        '### 🎁 CLAIM YOUR REWARD',
        '',
        'Click **@Giveaways** below to receive your temporary Giveaway role.',
        '',
        'After claiming the role, proceed to the designated giveaway ticket to complete your reward claim with the staff team.',
        '',
        '### ⚠️ IMPORTANT REMINDERS',
        '',
        `${AVISALA} 𝖳𝗁𝖾 @Giveaways 𝗋𝗈𝗅𝖾 𝗂𝗌 𝗈𝗇𝗅𝗒 𝖿𝗈𝗋 𝗆𝖾𝗆𝖻𝖾𝗋𝗌 𝗐𝗁𝗈 𝖺𝗋𝖾 𝖼𝗎𝗋𝗋𝖾𝗇𝗍𝗅𝗒 𝖼𝗅𝖺𝗂𝗆𝗂𝗇𝗀 𝖺 𝗀𝗂𝗏𝖾𝖺𝗐𝖺𝗒 𝗋𝖾𝗐𝖺𝗋𝖽.`,
        '',
        `${AVISALA} 𝖣𝗈 𝗇𝗈𝗍 𝖼𝗅𝖺𝗂𝗆 𝗍𝗁𝖾 𝗋𝗈𝗅𝖾 𝗂𝖿 𝗒𝗈𝗎 𝖺𝗋𝖾 𝗇𝗈𝗍 𝖼𝗅𝖺𝗂𝗆𝗂𝗇𝗀 𝖺 𝗋𝖾𝗐𝖺𝗋𝖽.`,
        '',
        `${AVISALA} 𝖪𝖾𝖾𝗉 𝗒𝗈𝗎𝗋 𝗋𝖾𝗐𝖺𝗋𝖽 𝖼𝗅𝖺𝗂𝗆 𝖺𝗇𝖽 𝗍𝗂𝖼𝗄𝖾𝗍 𝗉𝗋𝗂𝗏𝖺𝗍𝖾.`,
        '',
        `${AVISALA} 𝖣𝗈 𝗇𝗈𝗍 𝗌𝖼𝗋𝖾𝖾𝗇𝗌𝗁𝗈𝗍 𝗈𝗋 𝖾𝗑𝗉𝗈𝗌𝖾 𝗍𝗁𝖾 𝗉𝗋𝗂𝗏𝖺𝗍𝖾 𝗍𝗂𝖼𝗄𝖾𝗍.`,
        '',
        `${AVISALA} 𝖣𝗈 𝗇𝗈𝗍 𝗌𝗁𝖺𝗋𝖾 𝗍𝗁𝖾 𝗍𝗂𝖼𝗄𝖾𝗍 𝖼𝗈𝗇𝗍𝖾𝗇𝗍𝗌 𝗈𝗋 𝗍𝗁𝖾 𝗌𝖾𝗇𝖽𝖾𝗋'𝗌 𝗂𝗇𝖿𝗈𝗋𝗆𝖺𝗍𝗂𝗈𝗇.`,
        '',
        `${AVISALA} 𝖥𝗈𝗅𝗅𝗈𝗐 𝗍𝗁𝖾 𝗂𝗇𝗌𝗍𝗋𝗎𝖼𝗍𝗂𝗈𝗇𝗌 𝗉𝗋𝗈𝗏𝗂𝖽𝖾𝖽 𝖻𝗒 𝗍𝗁𝖾 𝗌𝗍𝖺𝖿𝖿 𝗍𝖾𝖺𝗆.`,
        '',
        `${AVISALA} 𝖶𝗁𝖾𝗇 𝗒𝗈𝗎𝗋 𝗀𝗂𝗏𝖾𝖺𝗐𝖺𝗒𝗌 𝗍𝗂𝖼𝗄𝖾𝗍 𝗂𝗌 𝖼𝗅𝗈𝗌𝖾𝖽, 𝗍𝗂𝖼𝗄𝖾𝗍𝗒 𝖻𝗈𝗍 𝗐𝗂𝗅𝗅 𝗋𝖾𝗆𝗈𝗏𝖾 𝗍𝗁𝖾 @Giveaways 𝗋𝗈𝗅𝖾.`,
        '',
        '🎁 **Ready to claim your reward?**',
        '',
        'Click **@Giveaways** below to claim your role.',
      ].join('\n')
    )
    .setFooter({
      text: 'LAMPOON • GIVEAWAY ROLE CLAIM',
    });
}

// ==========================================
// GIVEAWAY BUTTON
// ==========================================

function createGiveawayButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('claim_giveaways')
      .setLabel('@Giveaways')
      .setEmoji('🎁')
      .setStyle(ButtonStyle.Secondary)
  );
}

// ==========================================
// FIND / UPDATE GIVEAWAY PANEL
// ==========================================

async function setupGiveawayPanel() {
  try {
    const channel = await client.channels.fetch(
      GIVEAWAY_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) {
      console.error(
        '❌ Giveaway channel could not be found or is not a text channel.'
      );
      return;
    }

    const messages = await channel.messages.fetch({
      limit: 50,
    });

    const existingPanel = messages.find(
      message =>
        message.author.id === client.user.id &&
        message.components.some(row =>
          row.components.some(
            component =>
              component.customId === 'claim_giveaways'
          )
        )
    );

    const embed = createGiveawayEmbed();
    const row = createGiveawayButton();

    if (existingPanel) {
      await existingPanel.edit({
        embeds: [embed],
        components: [row],
      });

      console.log(
        `🎁 Giveaway claim panel updated in #${channel.name}`
      );
    } else {
      await channel.send({
        embeds: [embed],
        components: [row],
      });

      console.log(
        `🎁 Giveaway claim panel sent in #${channel.name}`
      );
    }
  } catch (error) {
    console.error(
      '❌ Failed to setup Giveaway claim panel:',
      error
    );
  }
}

// ==========================================
// GIVEAWAY STAFF CHECK
// ==========================================

function isGiveawayStaff(interaction) {
  if (
    interaction.memberPermissions &&
    interaction.memberPermissions.has('ManageGuild')
  ) {
    return true;
  }

  if (
    STAFF_ROLE_ID &&
    interaction.member &&
    interaction.member.roles &&
    interaction.member.roles.cache.has(STAFF_ROLE_ID)
  ) {
    return true;
  }

  return false;
}

// ==========================================
// SLASH COMMANDS
// ==========================================

const commands = [
  new SlashCommandBuilder()
    .setName('my-selection')
    .setDescription('View your current Role and Lane selections.'),

  new SlashCommandBuilder()
    .setName('reset-selection')
    .setDescription('Clear all of your Role and Lane selections.'),

  new SlashCommandBuilder()
    .setName('giveaway-punish')
    .setDescription('Apply a staff action to a Giveaway role claimant.')
    .addUserOption(option =>
      option
        .setName('member')
        .setDescription('The member to take action on.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Choose the staff action.')
        .setRequired(true)
        .addChoices(
          {
            name: 'Warning',
            value: 'warning',
          },
          {
            name: 'Remove Giveaway Role',
            value: 'remove_role',
          },
          {
            name: 'Timeout',
            value: 'timeout',
          }
        )
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the staff action.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('Timeout duration in minutes. Maximum 40320.')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(40320)
    ),
].map(command => command.toJSON());

// ==========================================
// REGISTER SLASH COMMANDS
// ==========================================

async function registerSlashCommands() {
  const rest = new REST({
    version: '10',
  }).setToken(DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      CLIENT_ID,
      GUILD_ID
    ),
    {
      body: commands,
    }
  );

  console.log('Slash commands registered.');
}

// ==========================================
// INTERACTIONS
// ==========================================

client.on('interactionCreate', async interaction => {
  const interactionStartedAt = Date.now();
  const interactionKind = interaction.isChatInputCommand()
    ? `command:${interaction.commandName}`
    : interaction.isButton()
      ? `button:${interaction.customId}`
      : interaction.isStringSelectMenu()
        ? `select:${interaction.customId}`
        : `other:${interaction.type}`;
  startupState.lastInteractionAt = new Date().toISOString();
  startupState.interactionsSeen += 1;
  console.log(`📨 Interaction received: ${interactionKind} (id=${interaction.id})`);

  try {
    // ========================================
    // SLASH COMMANDS
    // ========================================

    if (interaction.isChatInputCommand()) {
      const member = interaction.member;

      // --------------------------------------
      // MY SELECTION
      // --------------------------------------

      if (interaction.commandName === 'my-selection') {
        await interaction.reply({
          embeds: [
            currentSelectionEmbed(member),
          ],
          components: currentSelectionButtons(),
          flags: MessageFlags.Ephemeral,
        });

        return;
      }

      // --------------------------------------
      // RESET SELECTION
      // --------------------------------------

      if (interaction.commandName === 'reset-selection') {
        // Acknowledge before role and log API calls can exceed Discord's 3-second limit.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await clearRoles(member);
        await clearLanes(member);

        await interaction.editReply({
          embeds: [currentSelectionEmbed(member)],
          components: currentSelectionButtons(),
        });

        return;
      }

      // --------------------------------------
      // GIVEAWAY PUNISH
      // --------------------------------------

      if (interaction.commandName === 'giveaway-punish') {
        if (!isGiveawayStaff(interaction)) {
          await interaction.reply({
            content:
              '❌ You do not have permission to use this command.',
            flags: MessageFlags.Ephemeral,
          });

          return;
        }

        const targetUser =
          interaction.options.getUser('member');

        const action =
          interaction.options.getString('action');

        const reason =
          interaction.options.getString('reason');

        const duration =
          interaction.options.getInteger('duration');

        const guild = interaction.guild;

        if (!guild) {
          await interaction.reply({
            content:
              '❌ This command can only be used inside the server.',
            flags: MessageFlags.Ephemeral,
          });

          return;
        }

        // Acknowledge before network/API operations that may exceed 3 seconds.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const targetMember = await guild.members
          .fetch(targetUser.id)
          .catch(() => null);

        if (!targetMember) {
          await interaction.editReply({
            content:
              '❌ I could not find that member in the server.',
            flags: MessageFlags.Ephemeral,
          });

          return;
        }

        // ------------------------------------
        // WARNING
        // ------------------------------------

        if (action === 'warning') {
          await sendGiveawayLog(
            giveawayLogEmbed(
              targetMember,
              '⚠️ Staff Warning',
              reason
            )
          );

          await interaction.editReply({
            content:
              `⚠️ Warning recorded for ${targetMember}.\n\n**Reason:** ${reason}`,
            flags: MessageFlags.Ephemeral,
          });

          console.log(
            `⚠️ ${targetMember.user.tag} received a Giveaway warning from ${interaction.user.tag}. Reason: ${reason}`
          );

          return;
        }

        // ------------------------------------
        // REMOVE GIVEAWAY ROLE
        // ------------------------------------

        if (action === 'remove_role') {
          if (
            !targetMember.roles.cache.has(
              GIVEAWAY_ROLE_ID
            )
          ) {
            await interaction.editReply({
              content:
                `ℹ️ ${targetMember} does not currently have the **@Giveaways** role.`,
              flags: MessageFlags.Ephemeral,
            });

            return;
          }

          await targetMember.roles.remove(
            GIVEAWAY_ROLE_ID,
            `Giveaway staff action: ${reason}`
          );

          clearGiveawayExpirationTimer(
            targetMember.id
          );

          await sendGiveawayLog(
            giveawayLogEmbed(
              targetMember,
              '🗑️ Giveaway Role Removed',
              reason
            )
          );

          await interaction.editReply({
            content:
              `🗑️ The **@Giveaways** role was removed from ${targetMember}.\n\n**Reason:** ${reason}`,
            flags: MessageFlags.Ephemeral,
          });

          console.log(
            `🗑️ @Giveaways removed from ${targetMember.user.tag} by ${interaction.user.tag}. Reason: ${reason}`
          );

          return;
        }

        // ------------------------------------
        // TIMEOUT
        // ------------------------------------

        if (action === 'timeout') {
          if (!duration) {
            await interaction.editReply({
              content:
                '❌ You must provide a **duration** when using the Timeout action.',
              flags: MessageFlags.Ephemeral,
            });

            return;
          }

          const timeoutMs = duration * 60 * 1000;

          await targetMember.timeout(
            timeoutMs,
            `Giveaway staff action: ${reason}`
          );

          await sendGiveawayLog(
            giveawayLogEmbed(
              targetMember,
              `⏱️ Timeout — ${duration} minute(s)`,
              reason
            )
          );

          await interaction.editReply({
            content:
              `⏱️ ${targetMember} has been timed out for **${duration} minute(s)**.\n\n**Reason:** ${reason}`,
            flags: MessageFlags.Ephemeral,
          });

          console.log(
            `⏱️ ${targetMember.user.tag} was timed out for ${duration} minute(s) by ${interaction.user.tag}. Reason: ${reason}`
          );

          return;
        }

        return;
      }

      return;
    }

    // ========================================
    // BUTTONS
    // ========================================

    if (interaction.isButton()) {

      // --------------------------------------
      // GIVEAWAY ROLE CLAIM
      // --------------------------------------

      if (interaction.customId === 'claim_giveaways') {

        if (interaction.channelId !== GIVEAWAY_CHANNEL_ID) {
          await interaction.reply({
            content:
              '❌ The Giveaway role can only be claimed in the designated giveaway channel.',
            flags: MessageFlags.Ephemeral,
          });

          return;
        }

        const member = interaction.member;

        if (!member) {
          await interaction.reply({
            content:
              '❌ I could not find your server membership.',
            flags: MessageFlags.Ephemeral,
          });

          return;
        }

        if (member.roles.cache.has(GIVEAWAY_ROLE_ID)) {
          await interaction.reply({
            content:
              '🎁 You already have the **@Giveaways** role. You can proceed with your reward claim.',
            flags: MessageFlags.Ephemeral,
          });

          return;
        }

        // Acknowledge the click before role assignment or logging.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        await member.roles.add(
          GIVEAWAY_ROLE_ID,
          'Giveaway reward claim'
        );

        // Persist exact claim and expiration timestamps in the separate Giveaway Log.
        const claimedAt = new Date();
        const record = {
          memberId: member.id,
          claimedAt: claimedAt.toISOString(),
          expiresAt: new Date(claimedAt.getTime() + GIVEAWAY_ROLE_EXPIRATION_MS).toISOString(),
          status: 'ACTIVE',
          ticketChannelId: null,
          note: 'Role claimed; waiting for Tickety ticket creation. Expires in 24 hours if no ticket is detected.',
          logMessageId: null,
        };
        giveawayClaims.set(member.id, record);
        await saveGiveawayClaimRecord(record, member);
        scheduleGiveawayRoleExpiration(member.id);
        await sendGiveawayLog(giveawayLogEmbed(member, '🎁 Giveaway Role Claimed', `Claimed at: ${claimedAt.toISOString()}\nExpires at: ${record.expiresAt}\nStatus: ACTIVE — waiting for Tickety ticket creation.`));

        await interaction.editReply({
          content:
            '🎁 **Giveaway role claimed successfully!**\n\nCreate your Tickety giveaway ticket to keep the claim active. If no ticket is detected within **24 hours**, the role will expire automatically. When your ticket closes, the Giveaway role will be removed.',
        });

        console.log(
          `🎁 ${member.user.tag} claimed the Giveaway role.`
        );

        return;
      }

      // --------------------------------------
      // CONTENT CREATOR TYPE SELECTION
      // --------------------------------------

      if (interaction.customId.startsWith('lampoon_cc_type_')) {
        const member = await fetchApprovedContentCreatorMember(interaction.guild, interaction.user.id);

        if (!member) {
          await interaction.reply({
            content:
              `❌ You must already have the approved/verified <@&${CONTENT_CREATOR_ROLE_ID}> role before selecting a Content Creator type. Please visit <#${CONTENT_CREATOR_HELP_CHANNEL_ID}>.`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const typeKey = interaction.customId.replace('lampoon_cc_type_', '');
        const selectedType = CONTENT_CREATOR_TYPES.find(type => type.key === typeKey);

        if (!selectedType) {
          await interaction.reply({
            content: '❌ This Content Creator type is not configured.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        // Role assignment performs Discord API calls; acknowledge within Discord's
        // 3-second deadline before attempting to grant the role.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const typeAdded = await selectContentCreatorType(member, selectedType);

        await interaction.editReply({
          content: typeAdded
            ? `✅ **${selectedType.name}** role granted. You may select another type if applicable.`
            : `ℹ️ You already have the **${selectedType.name}** role. You can still choose your platforms below.`,
          embeds: [contentCreatorPlatformEmbed()],
          components: contentCreatorPlatformButtons(),
        });

        return;
      }

      // Open ephemeral multi-select platform menu. Discord reaction events cannot themselves create ephemeral replies.
      if (interaction.customId === 'lampoon_cc_open_platforms') {
        const member = await fetchApprovedContentCreatorMember(interaction.guild, interaction.user.id);
        if (!member) {
          await interaction.reply({ content: `❌ You must already have the approved/verified <@&${CONTENT_CREATOR_ROLE_ID}> role first. Please visit <#${CONTENT_CREATOR_HELP_CHANNEL_ID}>.`, flags: MessageFlags.Ephemeral });
          return;
        }
        // Acknowledge immediately before constructing and sending the private menu.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        pendingPlatformSelections.set(interaction.user.id, []);
        await interaction.editReply({ content: 'Choose one or more platforms, then press **Done** to grant the selected roles.', embeds: [contentCreatorPlatformEmbed()], components: contentCreatorPlatformButtons() });
        return;
      }

      // --------------------------------------
      // PRIVATE CONTENT CREATOR PLATFORM ROLE
      // --------------------------------------

      if (interaction.customId.startsWith('lampoon_cc_platform_')) {
        const isRemovalAction = interaction.customId === 'lampoon_cc_platform_remove';
        const eligibleMember = await fetchApprovedContentCreatorMember(interaction.guild, interaction.user.id);
        // Members may always remove platform roles, even if approval was revoked.
        const member = eligibleMember || (isRemovalAction
          ? await interaction.guild.members.fetch({ user: interaction.user.id, force: true }).catch(() => null)
          : null);

        if (!member || (!eligibleMember && !isRemovalAction)) {
          await interaction.reply({
            content:
              `❌ You must already have the approved/verified <@&${CONTENT_CREATOR_ROLE_ID}> role before selecting a Content Creator platform. Please visit <#${CONTENT_CREATOR_HELP_CHANNEL_ID}>.`,
            flags: MessageFlags.Ephemeral,
          });
          pendingPlatformSelections.delete(interaction.user.id);
          return;
        }

        if (interaction.customId === 'lampoon_cc_platform_remove') {
          // Acknowledge immediately before Discord role API calls.
          await interaction.deferUpdate();
          const selectedKeys = pendingPlatformSelections.get(interaction.user.id) || [];
          if (!selectedKeys.length) {
            await interaction.editReply({
              content: '⚠️ First choose the platform role(s) you want to remove from the menu above, then press **Remove Role**.',
              embeds: [contentCreatorPlatformEmbed()],
              components: contentCreatorPlatformButtons(),
            });
            return;
          }

          const removed = [];
          const notOwned = [];
          const failed = [];
          for (const key of selectedKeys) {
            const platform = CONTENT_CREATOR_PLATFORMS.find(item => item.key === key);
            if (!platform) continue;
            try {
              if (member.roles.cache.has(platform.roleId)) {
                await member.roles.remove(platform.roleId, 'Member removed an incorrect Content Creator platform selection');
                removed.push(platform);
                await sendContentCreatorLog(member, [], [{ name: platform.name, emoji: platform.emoji }]);
              } else {
                notOwned.push(platform.name);
              }
            } catch (error) {
              failed.push(platform.name);
              console.error(`Could not remove ${platform.name} role:`, error);
            }
          }
          pendingPlatformSelections.delete(interaction.user.id);
          const messages = [];
          if (removed.length) messages.push(`🗑️ Removed: ${removed.map(p => `**${p.name}**`).join(', ')}.`);
          if (notOwned.length) messages.push(`ℹ️ You did not have: ${notOwned.join(', ')}.`);
          if (failed.length) messages.push(`❌ Could not remove: ${failed.join(', ')}. Check the bot's role hierarchy and permissions.`);
          await interaction.editReply({
            content: messages.join('\n') || 'No platform roles were selected for removal.',
            embeds: [contentCreatorPlatformEmbed()],
            components: contentCreatorPlatformButtons(),
          });
          return;
        }

        if (interaction.customId === 'lampoon_cc_platform_done') {
          // Acknowledge immediately to avoid Discord's 3-second interaction timeout.
          await interaction.deferUpdate();
          const selectedKeys = pendingPlatformSelections.get(interaction.user.id) || [];
          const granted = [];
          const failed = [];
          for (const key of selectedKeys) {
            const platform = CONTENT_CREATOR_PLATFORMS.find(item => item.key === key);
            if (platform) {
              try {
                const added = await selectContentCreatorPlatform(member, platform);
                if (added) granted.push(platform);
              } catch (error) {
                failed.push(platform.name);
                console.error(`Could not grant ${platform.name} role:`, error);
              }
            }
          }
          pendingPlatformSelections.delete(interaction.user.id);
          await interaction.editReply({
            content: selectedKeys.length
              ? `✅ **Platform selection completed.** ${selectedKeys.map(key => { const name = CONTENT_CREATOR_PLATFORMS.find(p => p.key === key)?.name; return name ? `\`${name}\`` : null; }).filter(Boolean).join(', ')} selected. ${granted.length} new role(s) granted.${failed.length ? ` Failed to grant: ${failed.join(', ')}. Check the bot's role hierarchy and permissions.` : ''}`
              : 'No platforms selected. You can reopen the menu and choose platforms.',
            embeds: [],
            components: [],
          });
          return;
        }

        const platformKey = interaction.customId.replace('lampoon_cc_platform_', '');
        const platform = CONTENT_CREATOR_PLATFORMS.find(item => item.key === platformKey);

        if (!platform) {
          await interaction.reply({
            content: '❌ This platform is not configured.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        // Acknowledge before role assignment and logging to avoid Discord's 3-second timeout.
        await interaction.deferUpdate();
        let added = false;
        let roleError = null;
        try {
          added = await selectContentCreatorPlatform(member, platform);
        } catch (error) {
          roleError = error;
          console.error(`Could not grant ${platform.name} role:`, error);
        }

        await interaction.editReply({
          content: roleError
            ? `❌ Could not grant the **\`${platform.name}\`** role. Please check the bot's role hierarchy and permissions, then try again.`
            : added
              ? `✅ ${platform.emoji} **\`${platform.name}\` role granted.** You can select more platforms, or press **Done** to close this private menu.`
              : `ℹ️ You already have the ${platform.emoji} **\`${platform.name}\`** role. You can select more platforms, or press **Done** to close this private menu.`,
          embeds: [contentCreatorPlatformEmbed(0xC0C0C0, platform)],
          components: contentCreatorPlatformButtons(),
        });

        return;
      }

      const member = interaction.member;

      // --------------------------------------
      // OPEN ROLE MENU
      // --------------------------------------

      if (interaction.customId === 'lampoon_role') {
        // Defer first so Discord receives an acknowledgement before menu work.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.editReply({
          embeds: [roleEmbed()],
          components: [roleMenu(member), ...rolePanelButtons()],
        });
        return;
      }

      // --------------------------------------
      // OPEN LANE MENU
      // --------------------------------------

      if (interaction.customId === 'lampoon_lane') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.editReply({
          embeds: [laneEmbed()],
          components: [laneMenu(member), ...lanePanelButtons()],
        });
        return;
      }

      // --------------------------------------
      // CURRENT SELECTION
      // --------------------------------------

      if (interaction.customId === 'lampoon_current') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.editReply({
          embeds: [currentSelectionEmbed(member)],
          components: currentSelectionButtons(),
        });
        return;
      }

      // --------------------------------------
      // SWITCH TO ROLE
      // --------------------------------------

      if (interaction.customId === 'lampoon_switch_role') {
        await interaction.update({
          embeds: [roleEmbed()],
          components: [
            roleMenu(member),
            ...rolePanelButtons(),
          ],
        });

        return;
      }

      // --------------------------------------
      // SWITCH TO LANE
      // --------------------------------------

      if (interaction.customId === 'lampoon_switch_lane') {
        await interaction.update({
          embeds: [laneEmbed()],
          components: [
            laneMenu(member),
            ...lanePanelButtons(),
          ],
        });

        return;
      }

      // --------------------------------------
      // ROLE DONE
      // --------------------------------------

      if (interaction.customId === 'lampoon_role_done') {
        await interaction.update({
          embeds: [
            currentSelectionEmbed(member),
          ],
          components: currentSelectionButtons(),
        });

        return;
      }

      // --------------------------------------
      // LANE DONE
      // --------------------------------------

      if (interaction.customId === 'lampoon_lane_done') {
        await interaction.update({
          embeds: [
            currentSelectionEmbed(member),
          ],
          components: currentSelectionButtons(),
        });

        return;
      }

      // --------------------------------------
      // CLEAR ROLES
      // --------------------------------------

      if (interaction.customId === 'lampoon_clear_roles') {
        await interaction.deferUpdate();

        await clearRoles(member);

        await interaction.editReply({
          embeds: [
            currentSelectionEmbed(member),
          ],
          components: currentSelectionButtons(),
        });

        return;
      }

      // --------------------------------------
      // CLEAR LANES
      // --------------------------------------

      if (interaction.customId === 'lampoon_clear_lanes') {
        await interaction.deferUpdate();

        await clearLanes(member);

        await interaction.editReply({
          embeds: [
            currentSelectionEmbed(member),
          ],
          components: currentSelectionButtons(),
        });

        return;
      }

      // --------------------------------------
      // CLOSE
      // --------------------------------------

      if (interaction.customId === 'lampoon_close') {
        await interaction.update({
          content: '✦ **LAMPOON selection closed.**',
          embeds: [],
          components: [],
        });

        return;
      }

      // --------------------------------------
      // UNKNOWN BUTTON
      // --------------------------------------

      await interaction.reply({
        content: '❌ This button is not configured.',
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    // ========================================
    // SELECT MENUS
    // ========================================

    if (interaction.isStringSelectMenu()) {
      const member = interaction.member;

      // Handle the private Content Creator platform menu here, not inside
      // the button handler, so the select-menu interaction is actually reached.
      if (interaction.customId === 'lampoon_cc_platform_select') {
        await interaction.deferUpdate();
        pendingPlatformSelections.set(interaction.user.id, interaction.values);
        return;
      }

      // --------------------------------------
      // ROLE SELECT
      // --------------------------------------

      if (interaction.customId === 'lampoon_role_select') {
        await interaction.deferUpdate();

        await updateRoleSelection(
          member,
          interaction.values
        );

        await interaction.editReply({
          embeds: [roleEmbed()],
          components: [
            roleMenu(member),
            ...rolePanelButtons(),
          ],
        });

        return;
      }

      // --------------------------------------
      // LANE SELECT
      // --------------------------------------

      if (interaction.customId === 'lampoon_lane_select') {
        await interaction.deferUpdate();

        await updateLaneSelection(
          member,
          interaction.values
        );

        await interaction.editReply({
          embeds: [laneEmbed()],
          components: [
            laneMenu(member),
            ...lanePanelButtons(),
          ],
        });

        return;
      }

      // Never leave an unrecognized select-menu interaction unacknowledged.
      await interaction.reply({
        content: '❌ This selection menu is not configured. Please reopen the panel and try again.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

  } catch (error) {
    startupState.interactionErrors += 1;
    startupState.lastInteractionErrorAt = new Date().toISOString();
    startupState.lastInteractionError = String(error?.code || error?.name || 'Error').slice(0, 80);
    console.error(`❌ Interaction failed: ${interactionKind} (id=${interaction.id}, elapsedMs=${Date.now() - interactionStartedAt}, acknowledged=${interaction.deferred || interaction.replied})`, error);

    try {
      const response = {
        content:
          '❌ Something went wrong while processing your selection. Please try again.',
        embeds: [],
        components: [],
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(response);
      } else if (interaction.isRepliable()) {
        await interaction.reply({
          ...response,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (replyError) {
      // The interaction may already have expired; do not let this mask the original error.
      console.error(
        `❌ Could not send interaction error response for ${interactionKind} (id=${interaction.id}, code=${replyError?.code || 'unknown'}):`,
        replyError.message || replyError
      );
    }
  }
});

// ==========================================
// CONTENT CREATOR TYPE EMOJI REACTION ROLE GRANTS
// ==========================================

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch();
    const message = reaction.message;
    if (!message.guild || message.author?.id !== client.user.id) return;
    if (!message.embeds.some(embed => embed.title === '🎥 LAMPOON CONTENT CREATOR SELECTION')) return;

    const emoji = reaction.emoji.name;
    const typeByReaction = { '📽️': 'streamer', '🎨': 'artist', '🎬': 'satirical_cc', '🎮': 'general_cc' };
    if (!Object.prototype.hasOwnProperty.call(typeByReaction, emoji)) return;
    const type = CONTENT_CREATOR_TYPES.find(item => item.key === typeByReaction[emoji]);
    if (!type) return;

    const member = await fetchApprovedContentCreatorMember(message.guild, user.id);
    if (!member) {
      // Required behavior: remove only this member's reaction. Never DM,
      // reply publicly, or attempt an ephemeral response from a raw reaction.
      await reaction.users.remove(user.id).catch(error => {
        console.error('Could not remove reaction from member without Content Creator role:', error.message);
      });
      return;
    }

    // Role-add logging is handled by the dedicated role log. Do not emit a
    // duplicate 'Content Creator Type Role Selection' add event here.
    await selectContentCreatorType(member, type);
  } catch (error) {
    console.error('Content Creator reaction role error:', error);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  try {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch();
    const message = reaction.message;
    if (!message.guild || message.author?.id !== client.user.id) return;
    if (!message.embeds.some(embed => embed.title === '🎥 LAMPOON CONTENT CREATOR SELECTION')) return;

    const emoji = reaction.emoji.name;
    const typeByReaction = { '📽️': 'streamer', '🎨': 'artist', '🎬': 'satirical_cc', '🎮': 'general_cc' };
    if (!Object.prototype.hasOwnProperty.call(typeByReaction, emoji)) return;
    const type = CONTENT_CREATOR_TYPES.find(item => item.key === typeByReaction[emoji]);
    if (!type) return;

    const member = await message.guild.members.fetch({ user: user.id, force: true });
    // Removing the reaction opts out of this role. Other selected type roles remain unchanged.
    if (!member.roles.cache.has(type.roleId)) return;
    await member.roles.remove(type.roleId, 'Content Creator type reaction removed');

    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (logChannel?.isTextBased()) {
      const logEmbed = new EmbedBuilder()
        .setColor(0xD4AF37)
        .setTitle('Content Creator Type Role Removed')
        .setDescription(`${AVISALA} ${user} removed the **${type.name}** role by removing their emoji reaction.`)
        .addFields({ name: 'Role Removed', value: `<@&${type.roleId}>`, inline: true })
        .setTimestamp();
      await logChannel.send({ embeds: [logEmbed] });
    }
  } catch (error) {
    console.error('Content Creator reaction role removal error:', error);
  }
});


 // ==========================================
// DISCORD CONNECTION DIAGNOSTICS
// ==========================================

client.on('error', error => {
  console.error('❌ Discord client error:', error);
});

client.on('shardError', (error, shardId) => {
  console.error(`❌ Discord Gateway shard ${shardId} error:`, error);
});

client.on('shardReady', shardId => {
  console.log(`✅ Discord Gateway shard ${shardId} is ready.`);
});

// Discord.js debug messages help distinguish a Gateway/network stall from an
// authentication rejection. Avoid logging any token or authorization header.
client.on('debug', message => {
  if (/gateway|websocket|identify|heartbeat|connect|close|error/i.test(message)) {
    console.log('🔎 Discord.js debug:', message);
  }
});

client.on('shardDisconnect', (event, shardId) => {
  startupState.lastDisconnectAt = new Date().toISOString();
  startupState.lastDisconnectCode = event?.code ?? null;
  console.warn(`⚠️ Discord shard ${shardId} disconnected (code=${event?.code ?? 'unknown'}, clean=${event?.wasClean ?? 'unknown'}).`);
});

client.on('shardReconnecting', shardId => {
  console.warn(`🔄 Discord shard ${shardId} reconnecting...`);
});

client.on('shardResume', (shardId, replayedEvents) => {
  console.log(`✅ Discord shard ${shardId} resumed; replayedEvents=${replayedEvents}.`);
});

client.on('warn', message => {
  console.warn('⚠️ Discord.js warning:', message);
});

// ==========================================
// BOT READY / STARTUP TASKS
// ==========================================

client.once('clientReady', async () => {
  startupState.readyAt = new Date().toISOString();
  console.log(`✅ Discord login successful: ${client.user.tag}`);

  const runStartupTask = async (key, label, task) => {
    startupState.tasks[key] = 'running';
    console.log(`🔄 Startup task started: ${label}`);
    try {
      await task();
      startupState.tasks[key] = 'ok';
      console.log(`✅ Startup task completed: ${label}`);
    } catch (error) {
      startupState.tasks[key] = 'failed';
      console.error(`❌ Startup task failed: ${label}`, error);
    }
  };

  // Run tasks independently so one panel failure does not prevent later panels
  // from being refreshed. Health reports each task's status separately.
  await runStartupTask('slashCommands', 'register slash commands', registerSlashCommands);
  await runStartupTask('roleLanePanel', 'set up Role & Lane panel', sendOrFindPanel);
  await runStartupTask('contentCreatorPanel', 'set up Content Creator panel', setupContentCreatorPanel);
  await runStartupTask('giveawayPanel', 'set up Giveaway panel', setupGiveawayPanel);
  await runStartupTask('giveawayRecovery', 'recover persistent giveaway expiration records', recoverGiveawayClaimTrackers);

  const failedTasks = Object.entries(startupState.tasks)
    .filter(([, status]) => status !== 'ok')
    .map(([name]) => name);
  if (failedTasks.length) {
    console.error(`⚠️ Startup finished with failed tasks: ${failedTasks.join(', ')}`);
  } else {
    console.log('✅ Startup tasks finished successfully.');
  }
});

// ==========================================
// LOGIN
// ==========================================

console.log('🔄 Attempting Discord login...');

let loginSettled = false;
const loginWatchdog = setTimeout(() => {
  if (!loginSettled && !client.isReady()) {
    console.error('⏱️ Discord login is still pending after 20 seconds. Check the Gateway debug/error messages above; the HTTP health server being online does not mean Discord is connected.');
  }
}, 20_000);
loginWatchdog.unref?.();

client.login(DISCORD_TOKEN).then(() => {
  loginSettled = true;
  clearTimeout(loginWatchdog);
  console.log('✅ Discord login promise resolved.');
}).catch(error => {
  loginSettled = true;
  clearTimeout(loginWatchdog);
  console.error('❌ Discord login failed:', error);
});

process.on('unhandledRejection', reason => {
  console.error('❌ Unhandled promise rejection:', reason);
});

process.on('uncaughtException', error => {
  // Log before exiting: continuing after an uncaught exception can leave the bot
  // in an unknown state. Render will restart the process and startup diagnostics
  // will show which stage was reached.
  console.error('❌ Uncaught exception; exiting so Render can restart safely:', error);
  process.exit(1);
});
