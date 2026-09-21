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
// RENDER HEALTH CHECK
// ==========================================

const PORT = Number(process.env.PORT) || 10000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
    });

    return res.end('OK');
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
  });

  res.end('LAMPOON Role & Lane Bot is online.');
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
} = process.env;

// ==========================================
// CONSTANTS
// ==========================================

const AVISALA = '<a:Avisala:1542448826265243660>';
const GIVEAWAY_ROLE_ID = '1546589750549418044';

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
  ],
  partials: [Partials.GuildMember],
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
        'If you are **claiming your giveaway reward**, click the **@Giveaways** button below to receive the Giveaway role.',
        '',
        '### 🎁 CLAIM YOUR REWARD',
        '',
        'Click **@Giveaways** to claim your temporary Giveaway role.',
        '',
        'After claiming the role, proceed with the designated giveaway ticket to complete your reward claim with the staff team.',
        '',
        '### ⚠️ IMPORTANT REMINDERS',
        '',
        `${AVISALA} ᴛʜᴇ @Giveaways ʀᴏʟᴇ ɪs ᴏɴʟʏ ғᴏʀ ᴍᴇᴍʙᴇʀs ᴡʜᴏ ᴀʀᴇ ᴄᴜʀʀᴇɴᴛʟʏ ᴄʟᴀɪᴍɪɴɢ ᴀ ɢɪᴠᴇᴀᴡᴀʏ ʀᴇᴡᴀʀᴅ.`,
        `${AVISALA} ᴅᴏ ɴᴏᴛ ᴄʟᴀɪᴍ ᴛʜᴇ ʀᴏʟᴇ ɪғ ʏᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴄʟᴀɪᴍɪɴɢ ᴀ ʀᴇᴡᴀʀᴅ.`,
        `${AVISALA} ᴋᴇᴇᴘ ʏᴏᴜʀ ʀᴇᴡᴀʀᴅ ᴄʟᴀɪᴍ ᴀɴᴅ ᴛɪᴄᴋᴇᴛ ᴘʀɪᴠᴀᴛᴇ.`,
        `${AVISALA} ᴅᴏ ɴᴏᴛ sᴄʀᴇᴇɴsʜᴏᴛ ᴏʀ ᴇxᴘᴏsᴇ ᴛʜᴇ ᴘʀɪᴠᴀᴛᴇ ᴛɪᴄᴋᴇᴛ.`,
        `${AVISALA} ᴅᴏ ɴᴏᴛ sʜᴀʀᴇ ᴛʜᴇ ᴛɪᴄᴋᴇᴛ ᴄᴏɴᴛᴇɴᴛs ᴏʀ ᴛʜᴇ sᴇɴᴅᴇʀ's ɪɴғᴏʀᴍᴀᴛɪᴏɴ.`,
        `${AVISALA} ғᴏʟʟᴏᴡ ᴛʜᴇ ɪɴsᴛʀᴜᴄᴛɪᴏɴs ᴘʀᴏᴠɪᴅᴇᴅ ʙʏ ᴛʜᴇ sᴛᴀғғ ᴛᴇᴀᴍ.`,
        `${AVISALA} ᴡʜᴇɴ ʏᴏᴜʀ ɢɪᴠᴇᴀᴡᴀʏ ᴛɪᴄᴋᴇᴛ ɪs ᴄʟᴏsᴇᴅ, ᴛɪᴄᴋᴇᴛʏ ʙᴏᴛ ᴡɪʟʟ ʀᴇᴍᴏᴠᴇ ᴛʜᴇ @Giveaways ʀᴏʟᴇ.`,
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
// SLASH COMMANDS
// ==========================================

const commands = [
  new SlashCommandBuilder()
    .setName('my-selection')
    .setDescription('View your current Role and Lane selections.'),

  new SlashCommandBuilder()
    .setName('reset-selection')
    .setDescription('Clear all of your Role and Lane selections.'),
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
  try {
    // ========================================
    // SLASH COMMANDS
    // ========================================

    if (interaction.isChatInputCommand()) {
      const member = interaction.member;

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

      if (interaction.commandName === 'reset-selection') {
        await clearRoles(member);
        await clearLanes(member);

        await interaction.reply({
          embeds: [
            currentSelectionEmbed(member),
          ],
          components: currentSelectionButtons(),
          flags: MessageFlags.Ephemeral,
        });

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

        await member.roles.add(
          GIVEAWAY_ROLE_ID,
          'Giveaway reward claim'
        );

        await interaction.reply({
          content:
            '🎁 **Giveaway role claimed successfully!**\n\nYou now have the **@Giveaways** role and can proceed with your reward claim.',
          flags: MessageFlags.Ephemeral,
        });

        console.log(
          `🎁 ${member.user.tag} claimed the Giveaway role.`
        );

        return;
      }

      const member = interaction.member;

      // --------------------------------------
      // OPEN ROLE MENU
      // --------------------------------------

      if (interaction.customId === 'lampoon_role') {
        await interaction.reply({
          embeds: [roleEmbed()],
          components: [
            roleMenu(member),
            ...rolePanelButtons(),
          ],
          flags: MessageFlags.Ephemeral,
        });

        return;
      }

      // --------------------------------------
      // OPEN LANE MENU
      // --------------------------------------

      if (interaction.customId === 'lampoon_lane') {
        await interaction.reply({
          embeds: [laneEmbed()],
          components: [
            laneMenu(member),
            ...lanePanelButtons(),
          ],
          flags: MessageFlags.Ephemeral,
        });

        return;
      }

      // --------------------------------------
      // CURRENT SELECTION
      // --------------------------------------

      if (interaction.customId === 'lampoon_current') {
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

      return;
    }

  } catch (error) {
    console.error('❌ Interaction error:', error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content:
            '❌ Something went wrong while processing your selection. Please try again.',
          embeds: [],
          components: [],
        });
      } else {
        await interaction.reply({
          content:
            '❌ Something went wrong while processing your selection. Please try again.',
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (replyError) {
      console.error(
        '❌ Could not send error response:',
        replyError
      );
    }
  }
});

// ==========================================
// BOT READY
// ==========================================

client.once('clientReady', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await registerSlashCommands();
    await sendOrFindPanel();
    await setupGiveawayPanel();
  } catch (error) {
    console.error(
      '❌ Startup task error:',
      error
    );
  }
});

// ==========================================
// LOGIN
// ==========================================

client.login(DISCORD_TOKEN);
