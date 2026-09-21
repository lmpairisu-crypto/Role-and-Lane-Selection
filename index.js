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
  MessageFlags
} = require('discord.js');

// ==========================================
// ENVIRONMENT VARIABLES
// ==========================================

const {
  DISCORD_TOKEN,
  CLIENT_ID,
  GUILD_ID,

  ROLE_LANE_CHANNEL_ID,
  GIVEAWAY_CHANNEL_ID,
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
  ROLE_VERSATILE
} = process.env;

// ==========================================
// REQUIRED ENVIRONMENT VARIABLES
// ==========================================

const requiredEnv = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'GUILD_ID',
  'ROLE_LANE_CHANNEL_ID',
  'GIVEAWAY_CHANNEL_ID',
  'LOG_CHANNEL_ID',

  'ROLE_FIGHTER',
  'ROLE_TANK',
  'ROLE_ASSASSIN',
  'ROLE_MAGE',
  'ROLE_MARKSMAN',
  'ROLE_SUPPORT',

  'ROLE_CLASHLANE',
  'ROLE_JUNGLER',
  'ROLE_MIDLANE',
  'ROLE_FARMLANE',
  'ROLE_ROAMER',
  'ROLE_VERSATILE'
];

const missingEnv = requiredEnv.filter(
  (key) => !process.env[key]
);

if (missingEnv.length > 0) {
  console.error(
    `❌ Missing environment variables: ${missingEnv.join(', ')}`
  );

  process.exit(1);
}

// ==========================================
// CONSTANTS
// ==========================================

const AVISALA = '<a:Avisala:1542448826265243660>';

const GIVEAWAY_ROLE_ID = '1546589750549418044';

const ROLE_LANE_COLOR = 0x3299DB;
const ROLE_EMBED_COLOR = 0xC0C0C0;
const LANE_EMBED_COLOR = 0xD4AF37;
const GIVEAWAY_EMBED_COLOR = 0xC0C0C0;

// ==========================================
// ROLE DATA
// ==========================================

const ROLE_DATA = [
  {
    name: 'Fighter',
    emoji: '⚔️',
    id: ROLE_FIGHTER
  },
  {
    name: 'Tank',
    emoji: '🛡️',
    id: ROLE_TANK
  },
  {
    name: 'Assassin',
    emoji: '🗡️',
    id: ROLE_ASSASSIN
  },
  {
    name: 'Mage',
    emoji: '🔮',
    id: ROLE_MAGE
  },
  {
    name: 'Marksman',
    emoji: '🏹',
    id: ROLE_MARKSMAN
  },
  {
    name: 'Support',
    emoji: '🛟',
    id: ROLE_SUPPORT
  }
];

// ==========================================
// LANE DATA
// ==========================================

const LANE_DATA = [
  {
    name: 'Clashlane',
    emoji: '<:clashlane:1550553783304589443>',
    id: ROLE_CLASHLANE
  },
  {
    name: 'Jungler',
    emoji: '<:jungler:1550553875562500248>',
    id: ROLE_JUNGLER
  },
  {
    name: 'Midlane',
    emoji: '<:midlane:1550553955501871124>',
    id: ROLE_MIDLANE
  },
  {
    name: 'Farmlane',
    emoji: '<:farmlane:1550554057448361984>',
    id: ROLE_FARMLANE
  },
  {
    name: 'Roamer',
    emoji: '<:roamer:1550554124473466920>',
    id: ROLE_ROAMER
  },
  {
    name: 'Versatile',
    emoji: '<:versatile:1550554190496014366>',
    id: ROLE_VERSATILE
  }
];

// ==========================================
// DISCORD CLIENT
// ==========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],

  partials: [
    Partials.GuildMember
  ]
});

// ==========================================
// RENDER HEALTH CHECK
// ==========================================

const PORT = Number(process.env.PORT) || 10000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });

    return res.end('OK');
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });

  res.end('LAMPOON Role & Lane Bot is online.');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Health server running on port ${PORT}`);
});

// ==========================================
// HELPERS
// ==========================================

function getRoleById(id) {
  return ROLE_DATA.find(role => role.id === id);
}

function getLaneById(id) {
  return LANE_DATA.find(lane => lane.id === id);
}

function getSelectedRoles(member) {
  return ROLE_DATA.filter(role =>
    member.roles.cache.has(role.id)
  );
}

function getSelectedLanes(member) {
  return LANE_DATA.filter(lane =>
    member.roles.cache.has(lane.id)
  );
}

function formatSelections(items, emptyText = 'None selected') {
  if (!items.length) {
    return emptyText;
  }

  return items
    .map(item => `${item.emoji} **${item.name}**`)
    .join('\n');
}

// ==========================================
// LOGGING
// ==========================================

async function sendLog(embed) {
  try {
    const channel = await client.channels.fetch(LOG_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.error('❌ Log channel is not a text channel.');
      return;
    }

    await channel.send({
      embeds: [embed]
    });
  } catch (error) {
    console.error('❌ Failed to send log:', error);
  }
}

// ==========================================
// ROLE UPDATE LOG
// ==========================================

async function logRoleChange(member, added, removed) {
  const addedText = added.length
    ? added.map(role => `${role.emoji} ${role.name}`).join(', ')
    : 'None';

  const removedText = removed.length
    ? removed.map(role => `${role.emoji} ${role.name}`).join(', ')
    : 'None';

  const embed = new EmbedBuilder()
    .setColor(ROLE_EMBED_COLOR)
    .setTitle(`${AVISALA} ROLE SELECTION UPDATED`)
    .setDescription(
      `**Member:** ${member}\n\n` +
      `**Added:**\n${addedText}\n\n` +
      `**Removed:**\n${removedText}`
    )
    .setThumbnail(
      member.user.displayAvatarURL({
        extension: 'png',
        size: 256
      })
    )
    .setFooter({
      text: 'LAMPOON • Role Selection Log'
    })
    .setTimestamp();

  await sendLog(embed);
}

// ==========================================
// LANE UPDATE LOG
// ==========================================

async function logLaneChange(member, added, removed) {
  const addedText = added.length
    ? added.map(lane => `${lane.emoji} ${lane.name}`).join(', ')
    : 'None';

  const removedText = removed.length
    ? removed.map(lane => `${lane.emoji} ${lane.name}`).join(', ')
    : 'None';

  const embed = new EmbedBuilder()
    .setColor(LANE_EMBED_COLOR)
    .setTitle(`${AVISALA} LANE SELECTION UPDATED`)
    .setDescription(
      `**Member:** ${member}\n\n` +
      `**Added:**\n${addedText}\n\n` +
      `**Removed:**\n${removedText}`
    )
    .setThumbnail(
      member.user.displayAvatarURL({
        extension: 'png',
        size: 256
      })
    )
    .setFooter({
      text: 'LAMPOON • Lane Selection Log'
    })
    .setTimestamp();

  await sendLog(embed);
}

// ==========================================
// MAIN ROLE & LANE EMBED
// ==========================================

function createMainEmbed() {
  return new EmbedBuilder()
    .setColor(ROLE_LANE_COLOR)
    .setTitle('🎮 LAMPOON ROLE & LANE SELECTION')
    .setDescription(
      `${AVISALA} **ROLE & LANE GUIDE**\n\n` +

      `**Your selection automatically updates your LAMPOON Discord roles.**\n\n` +

      `⚔️ **Role**\n` +
      `Choose one or more Hero Roles you are comfortable playing in-game.\n\n` +

      `🛣️ **Lane**\n` +
      `Choose one or more Lane Roles to gain their corresponding server colors.\n\n` +

      `You can change your Role or Lane selections anytime.`
    )
    .setImage(LAMPOON_GIF_URL)
    .setFooter({
      text: 'LAMPOON • Role & Lane Selection'
    });
}

// ==========================================
// MAIN BUTTONS
// ==========================================

function createMainButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lampoon_role')
      .setLabel('Role')
      .setEmoji('⚔️')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('lampoon_lane')
      .setLabel('Lane')
      .setEmoji('🛣️')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('lampoon_my_selection')
      .setLabel('My Selection')
      .setEmoji('🔎')
      .setStyle(ButtonStyle.Secondary)
  );
}

// ==========================================
// ROLE EMBED
// ==========================================

function createRoleEmbed() {
  return new EmbedBuilder()
    .setColor(ROLE_EMBED_COLOR)
    .setTitle(`${AVISALA} ROLE SELECTION`)
    .setDescription(
      `Choose the Hero Roles you are comfortable playing.\n\n` +
      `You can select **multiple roles**.\n\n` +
      `Your Discord roles will update automatically.`
    )
    .setFooter({
      text: 'LAMPOON • Role Selection'
    });
}

// ==========================================
// LANE EMBED
// ==========================================

function createLaneEmbed() {
  return new EmbedBuilder()
    .setColor(LANE_EMBED_COLOR)
    .setTitle(`${AVISALA} LANE SELECTION`)
    .setDescription(
      `Choose the Lanes you are comfortable playing.\n\n` +
      `You can select **multiple lanes**.\n\n` +
      `Your Discord roles will update automatically.`
    )
    .setFooter({
      text: 'LAMPOON • Lane Selection'
    });
}

// ==========================================
// ROLE SELECT MENU
// ==========================================

function createRoleSelectMenu(member) {
  const selected = new Set(
    getSelectedRoles(member).map(role => role.id)
  );

  const options = ROLE_DATA.map(role => {
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(role.name)
      .setValue(role.id)
      .setEmoji(role.emoji);

    if (selected.has(role.id)) {
      option.setDefault(true);
    }

    return option;
  });

  return new StringSelectMenuBuilder()
    .setCustomId('lampoon_role_select')
    .setPlaceholder('⚔️ Select your Role(s)')
    .setMinValues(0)
    .setMaxValues(ROLE_DATA.length)
    .addOptions(options);
}

// ==========================================
// LANE SELECT MENU
// ==========================================

function createLaneSelectMenu(member) {
  const selected = new Set(
    getSelectedLanes(member).map(lane => lane.id)
  );

  const options = LANE_DATA.map(lane => {
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(lane.name)
      .setValue(lane.id)
      .setEmoji(lane.emoji);

    if (selected.has(lane.id)) {
      option.setDefault(true);
    }

    return option;
  });

  return new StringSelectMenuBuilder()
    .setCustomId('lampoon_lane_select')
    .setPlaceholder('🛣️ Select your Lane(s)')
    .setMinValues(0)
    .setMaxValues(LANE_DATA.length)
    .addOptions(options);
                          }

// ==========================================
// ROLE SELECTION EMBED VIEW
// ==========================================

function createRoleSelectionView(member) {
  const selected = getSelectedRoles(member);

  const embed = new EmbedBuilder()
    .setColor(ROLE_EMBED_COLOR)
    .setTitle(`${AVISALA} CURRENTLY SELECTED • ROLE`)
    .setDescription(
      selected.length
        ? formatSelections(selected)
        : 'No Role selected yet.'
    )
    .setFooter({
      text: 'LAMPOON • Role Selection'
    });

  const selectMenu = createRoleSelectMenu(member);

  const row = new ActionRowBuilder().addComponents(
    selectMenu
  );

  const navigationRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lampoon_role')
      .setLabel('Role')
      .setEmoji('⚔️')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('lampoon_lane')
      .setLabel('Lane')
      .setEmoji('🛣️')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('lampoon_my_selection')
      .setLabel('My Selection')
      .setEmoji('🔎')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('lampoon_done')
      .setLabel('Done')
      .setEmoji('↩️')
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [row, navigationRow]
  };
}

// ==========================================
// LANE SELECTION EMBED VIEW
// ==========================================

function createLaneSelectionView(member) {
  const selected = getSelectedLanes(member);

  const embed = new EmbedBuilder()
    .setColor(LANE_EMBED_COLOR)
    .setTitle(`${AVISALA} CURRENTLY SELECTED • LANE`)
    .setDescription(
      selected.length
        ? formatSelections(selected)
        : 'No Lane selected yet.'
    )
    .setFooter({
      text: 'LAMPOON • Lane Selection'
    });

  const selectMenu = createLaneSelectMenu(member);

  const row = new ActionRowBuilder().addComponents(
    selectMenu
  );

  const navigationRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lampoon_role')
      .setLabel('Role')
      .setEmoji('⚔️')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('lampoon_lane')
      .setLabel('Lane')
      .setEmoji('🛣️')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('lampoon_my_selection')
      .setLabel('My Selection')
      .setEmoji('🔎')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('lampoon_done')
      .setLabel('Done')
      .setEmoji('↩️')
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [row, navigationRow]
  };
}

// ==========================================
// MY SELECTION VIEW
// ==========================================

function createMySelectionView(member) {
  const roles = getSelectedRoles(member);
  const lanes = getSelectedLanes(member);

  const embed = new EmbedBuilder()
    .setColor(ROLE_LANE_COLOR)
    .setTitle(`${AVISALA} YOUR CURRENT SELECTION`)
    .setDescription(
      `### ⚔️ ROLES\n` +
      `${formatSelections(roles)}\n\n` +

      `### 🛣️ LANES\n` +
      `${formatSelections(lanes)}`
    )
    .setFooter({
      text: 'LAMPOON • My Selection'
    });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lampoon_role')
      .setLabel('Role')
      .setEmoji('⚔️')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('lampoon_lane')
      .setLabel('Lane')
      .setEmoji('🛣️')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('lampoon_done')
      .setLabel('Done')
      .setEmoji('↩️')
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [buttons]
  };
}

// ==========================================
// UPDATE ROLE SELECTION
// ==========================================

async function updateRoleSelection(member, selectedIds) {
  const selectedSet = new Set(selectedIds);

  const currentRoles = getSelectedRoles(member);

  const added = [];
  const removed = [];

  for (const role of ROLE_DATA) {
    const hasRole = member.roles.cache.has(role.id);
    const shouldHave = selectedSet.has(role.id);

    if (shouldHave && !hasRole) {
      try {
        await member.roles.add(
          role.id,
          'LAMPOON Role Selection'
        );

        added.push(role);
      } catch (error) {
        console.error(
          `❌ Failed to add role ${role.name}:`,
          error
        );
      }
    }

    if (!shouldHave && hasRole) {
      try {
        await member.roles.remove(
          role.id,
          'LAMPOON Role Selection'
        );

        removed.push(role);
      } catch (error) {
        console.error(
          `❌ Failed to remove role ${role.name}:`,
          error
        );
      }
    }
  }

  if (added.length || removed.length) {
    await logRoleChange(
      member,
      added,
      removed
    );
  }

  return {
    added,
    removed
  };
}

// ==========================================
// UPDATE LANE SELECTION
// ==========================================

async function updateLaneSelection(member, selectedIds) {
  const selectedSet = new Set(selectedIds);

  const added = [];
  const removed = [];

  for (const lane of LANE_DATA) {
    const hasRole = member.roles.cache.has(lane.id);
    const shouldHave = selectedSet.has(lane.id);

    if (shouldHave && !hasRole) {
      try {
        await member.roles.add(
          lane.id,
          'LAMPOON Lane Selection'
        );

        added.push(lane);
      } catch (error) {
        console.error(
          `❌ Failed to add lane ${lane.name}:`,
          error
        );
      }
    }

    if (!shouldHave && hasRole) {
      try {
        await member.roles.remove(
          lane.id,
          'LAMPOON Lane Selection'
        );

        removed.push(lane);
      } catch (error) {
        console.error(
          `❌ Failed to remove lane ${lane.name}:`,
          error
        );
      }
    }
  }

  if (added.length || removed.length) {
    await logLaneChange(
      member,
      added,
      removed
    );
  }

  return {
    added,
    removed
  };
}

// ==========================================
// CLEAR ALL ROLE SELECTIONS
// ==========================================

async function clearRoles(member) {
  const currentRoles = getSelectedRoles(member);

  if (!currentRoles.length) {
    return;
  }

  for (const role of currentRoles) {
    try {
      await member.roles.remove(
        role.id,
        'LAMPOON Reset Role Selection'
      );
    } catch (error) {
      console.error(
        `❌ Failed to remove role ${role.name}:`,
        error
      );
    }
  }

  await logRoleChange(
    member,
    [],
    currentRoles
  );
}

// ==========================================
// CLEAR ALL LANE SELECTIONS
// ==========================================

async function clearLanes(member) {
  const currentLanes = getSelectedLanes(member);

  if (!currentLanes.length) {
    return;
  }

  for (const lane of currentLanes) {
    try {
      await member.roles.remove(
        lane.id,
        'LAMPOON Reset Lane Selection'
      );
    } catch (error) {
      console.error(
        `❌ Failed to remove lane ${lane.name}:`,
        error
      );
    }
  }

  await logLaneChange(
    member,
    [],
    currentLanes
  );
}

// ==========================================
// FIND OR CREATE ROLE & LANE PANEL
// ==========================================

async function sendOrFindPanel() {
  try {
    const channel = await client.channels.fetch(
      ROLE_LANE_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) {
      console.error(
        '❌ ROLE_LANE_CHANNEL_ID is not a text channel.'
      );

      return;
    }

    const messages = await channel.messages.fetch({
      limit: 50
    });

    const existing = messages.find(message =>
      message.author.id === client.user.id &&
      message.embeds.some(embed =>
        embed.title === '🎮 LAMPOON ROLE & LANE SELECTION'
      )
    );

    const payload = {
      embeds: [
        createMainEmbed()
      ],
      components: [
        createMainButtons()
      ]
    };

    if (existing) {
      await existing.edit(payload);

      console.log(
        `✅ Role & Lane panel updated: ${existing.id}`
      );

      return;
    }

    const message = await channel.send(payload);

    console.log(
      `✅ Role & Lane panel created: ${message.id}`
    );

  } catch (error) {
    console.error(
      '❌ Failed to setup Role & Lane panel:',
      error
    );
  }
}

// ==========================================
// GIVEAWAY EMBED
// ==========================================

function createGiveawayEmbed() {
  return new EmbedBuilder()
    .setColor(GIVEAWAY_EMBED_COLOR)
    .setDescription(
      `Congratulations to all eligible giveaway winners! 🎉\n\n` +

      `If you are **claiming your giveaway reward**, click the **@Giveaways** button below to receive the Giveaway role.\n\n` +

      `### 🎁 CLAIM YOUR REWARD\n\n` +

      `Click **@Giveaways** to claim your temporary Giveaway role.\n\n` +

      `After claiming the role, proceed with the designated giveaway ticket to complete your reward claim with the staff team.\n\n` +

      `### ⚠️ IMPORTANT REMINDERS\n\n` +

      `${AVISALA} The **@Giveaways** role is only for members who are currently claiming a giveaway reward.\n` +
      `${AVISALA} **Do not claim the role if you are not claiming a reward.**\n` +
      `${AVISALA} When your giveaway ticket is closed, **Tickety Bot will remove the @Giveaways role**.\n\n` +

      `🎁 **Ready to claim your reward?**\n\n` +

      `Click **@Giveaways** below to claim your role.`
    )
    .setFooter({
      text: 'LAMPOON • GIVEAWAY ROLE CLAIM'
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
// FIND OR CREATE GIVEAWAY PANEL
// ==========================================

async function setupGiveawayPanel() {
  try {
    const channel = await client.channels.fetch(
      GIVEAWAY_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) {
      console.error(
        '❌ GIVEAWAY_CHANNEL_ID is not a text channel.'
      );

      return;
    }

    const messages = await channel.messages.fetch({
      limit: 50
    });

    const existing = messages.find(message =>
      message.author.id === client.user.id &&
      message.components.some(row =>
        row.components.some(component =>
          component.customId === 'claim_giveaways'
        )
      )
    );

    const payload = {
      embeds: [
        createGiveawayEmbed()
      ],
      components: [
        createGiveawayButton()
      ]
    };

    if (existing) {
      await existing.edit(payload);

      console.log(
        `✅ Giveaway panel updated: ${existing.id}`
      );

      return;
    }

    const message = await channel.send(payload);

    console.log(
      `✅ Giveaway panel created: ${message.id}`
    );

  } catch (error) {
    console.error(
      '❌ Failed to setup Giveaway panel:',
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
    .setDescription(
      'View your current Role and Lane selections.'
    ),

  new SlashCommandBuilder()
    .setName('reset-selection')
    .setDescription(
      'Reset all of your Role and Lane selections.'
    )
].map(command => command.toJSON());

// ==========================================
// REGISTER SLASH COMMANDS
// ==========================================

async function registerSlashCommands() {
  try {
    const rest = new REST({
      version: '10'
    }).setToken(DISCORD_TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      {
        body: commands
      }
    );

    console.log(
      '✅ Slash commands registered successfully.'
    );

  } catch (error) {
    console.error(
      '❌ Failed to register slash commands:',
      error
    );
  }
}

// ==========================================
// INTERACTION HANDLER
// ==========================================

client.on(
  'interactionCreate',
  async interaction => {

    try {

      // ========================================
      // SLASH COMMANDS
      // ========================================

      if (interaction.isChatInputCommand()) {

        if (
          interaction.commandName ===
          'my-selection'
        ) {

          const member =
            await interaction.guild.members.fetch(
              interaction.user.id
            );

          return interaction.reply({
            ...createMySelectionView(member),
            flags: MessageFlags.Ephemeral
          });
        }

        if (
          interaction.commandName ===
          'reset-selection'
        ) {

          const member =
            await interaction.guild.members.fetch(
              interaction.user.id
            );

          await clearRoles(member);
          await clearLanes(member);

          return interaction.reply({
            content:
              `${AVISALA} Your **Role and Lane selections** have been reset.`,
            flags: MessageFlags.Ephemeral
          });
        }
      }

      // ========================================
      // GIVEAWAY BUTTON
      // ========================================

      if (
        interaction.isButton() &&
        interaction.customId === 'claim_giveaways'
      ) {

        if (
          interaction.channelId !==
          GIVEAWAY_CHANNEL_ID
        ) {

          return interaction.reply({
            content:
              `${AVISALA} Please use the **@Giveaways** button in the designated Giveaway channel.`,
            flags: MessageFlags.Ephemeral
          });
        }

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        if (
          member.roles.cache.has(
            GIVEAWAY_ROLE_ID
          )
        ) {

          return interaction.reply({
            content:
              `${AVISALA} You already have the **@Giveaways** role. Please proceed to the designated giveaway ticket.`,
            flags: MessageFlags.Ephemeral
          });
        }

        try {

          await member.roles.add(
            GIVEAWAY_ROLE_ID,
            'Giveaway reward claim'
          );

          return interaction.reply({
            content:
              `${AVISALA} **@Giveaways** has been added to your account.\n\n` +
              `Please proceed to the designated **Giveaway Ticket** to claim your reward.`,
            flags: MessageFlags.Ephemeral
          });

        } catch (error) {

          console.error(
            '❌ Failed to add Giveaway role:',
            error
          );

          return interaction.reply({
            content:
              `${AVISALA} I could not assign the **@Giveaways** role. Please contact the staff team.`,
            flags: MessageFlags.Ephemeral
          });
        }
      }

      // ========================================
      // ROLE PANEL BUTTON
      // ========================================

      if (
        interaction.isButton() &&
        interaction.customId === 'lampoon_role'
      ) {

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        return interaction.update(
          createRoleSelectionView(member)
        );
      }

      // ========================================
      // LANE PANEL BUTTON
      // ========================================

      if (
        interaction.isButton() &&
        interaction.customId === 'lampoon_lane'
      ) {

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        return interaction.update(
          createLaneSelectionView(member)
        );
      }

      // ========================================
      // MY SELECTION BUTTON
      // ========================================

      if (
        interaction.isButton() &&
        interaction.customId ===
        'lampoon_my_selection'
      ) {

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        return interaction.update(
          createMySelectionView(member)
        );
      }

      // ========================================
      // DONE BUTTON
      // ========================================

      if (
        interaction.isButton() &&
        interaction.customId ===
        'lampoon_done'
      ) {

        return interaction.update({
          embeds: [
            createMainEmbed()
          ],
          components: [
            createMainButtons()
          ]
        });
      }

      // ========================================
      // ROLE SELECT MENU
      // ========================================

      if (
        interaction.isStringSelectMenu() &&
        interaction.customId ===
        'lampoon_role_select'
      ) {

        await interaction.deferUpdate();

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        await updateRoleSelection(
          member,
          interaction.values
        );

        const refreshedMember =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        return interaction.editReply(
          createRoleSelectionView(
            refreshedMember
          )
        );
      }

      // ========================================
      // LANE SELECT MENU
      // ========================================

      if (
        interaction.isStringSelectMenu() &&
        interaction.customId ===
        'lampoon_lane_select'
      ) {

        await interaction.deferUpdate();

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        await updateLaneSelection(
          member,
          interaction.values
        );

        const refreshedMember =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        return interaction.editReply(
          createLaneSelectionView(
            refreshedMember
          )
        );
      }

      // ========================================
      // UNKNOWN BUTTON FALLBACK
      // ========================================

      if (interaction.isButton()) {

        if (interaction.replied || interaction.deferred) {
          return;
        }

        return interaction.reply({
          content:
            '❌ This button is not configured.',
          flags: MessageFlags.Ephemeral
        });
      }

    } catch (error) {

      console.error(
        '❌ Interaction error:',
        error
      );

      if (
        interaction.replied ||
        interaction.deferred
      ) {
        return;
      }

      try {

        await interaction.reply({
          content:
            '❌ Something went wrong while processing this interaction.',
          flags: MessageFlags.Ephemeral
        });

      } catch (replyError) {

        console.error(
          '❌ Failed to send interaction error:',
          replyError
        );
      }
    }
  }
);

// ==========================================
// BOT READY
// ==========================================

client.once(
  'clientReady',
  async () => {

    console.log(
      `✅ Logged in as ${client.user.tag}`
    );

    console.log(
      `🌐 LAMPOON Role & Lane Bot is online.`
    );

    await registerSlashCommands();

    await sendOrFindPanel();

    await setupGiveawayPanel();
  }
);

// ==========================================
// LOGIN
// ==========================================

client.login(DISCORD_TOKEN);
