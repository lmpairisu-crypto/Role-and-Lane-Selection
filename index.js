const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  REST,
  Routes,
  SlashCommandBuilder,
  MessageFlags
} = require('discord.js');

const http = require('http');

// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const ROLE_LANE_CHANNEL_ID = process.env.ROLE_LANE_CHANNEL_ID;
const LAMPOON_GIF_URL = process.env.LAMPOON_GIF_URL;

// ============================================================
// ROLE IDs
// ============================================================

const ROLE_IDS = {
  fighter: process.env.ROLE_FIGHTER,
  tank: process.env.ROLE_TANK,
  assassin: process.env.ROLE_ASSASSIN,
  mage: process.env.ROLE_MAGE,
  marksman: process.env.ROLE_MARKSMAN,
  support: process.env.ROLE_SUPPORT,

  clashlane: process.env.ROLE_CLASHLANE,
  jungler: process.env.ROLE_JUNGLER,
  midlane: process.env.ROLE_MIDLANE,
  farmlane: process.env.ROLE_FARMLANE,
  roamer: process.env.ROLE_ROAMER,
  versatile: process.env.ROLE_VERSATILE
};

// ============================================================
// HERO ROLES
// ============================================================

const ROLES = {
  fighter: {
    name: 'Fighter',
    emoji: '⚔️',
    description: 'ᴅᴜʀᴀʙʟᴇ ᴍᴇʟᴇᴇ ʜᴇʀᴏᴇs ᴀɴᴅ ᴅᴜᴇʟɪsᴛs.'
  },

  tank: {
    name: 'Tank',
    emoji: '🛡️',
    description: 'ꜰʀᴏɴᴛʟɪɴᴇ ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ ᴛʜᴇ ᴛᴇᴀᴍ.'
  },

  assassin: {
    name: 'Assassin',
    emoji: '🗡️',
    description: 'ʜɪɢʜ-ʙᴜʀsᴛ ʜᴇʀᴏᴇs ᴡʜᴏ ᴇʟɪᴍɪɴᴀᴛᴇ ᴘʀɪᴏʀɪᴛʏ ᴛᴀʀɢᴇᴛs.'
  },

  mage: {
    name: 'Mage',
    emoji: '🔮',
    description: 'ᴍᴀɢɪᴄ ᴅᴀᴍᴀɢᴇ ᴀɴᴅ ᴄʀᴏᴡᴅ-ᴄᴏɴᴛʀᴏʟ sᴘᴇᴄɪᴀʟɪsᴛs.'
  },

  marksman: {
    name: 'Marksman',
    emoji: '🏹',
    description: 'ʀᴀɴɢᴇᴅ ʜᴇʀᴏᴇs ᴘʀᴏᴠɪᴅɪɴɢ ᴄᴏɴsɪsᴛᴇɴᴛ ᴅᴀᴍᴀɢᴇ.'
  },

  support: {
    name: 'Support',
    emoji: '🛟',
    description: 'ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ, ᴇᴍᴘᴏᴡᴇʀ, ʜᴇᴀʟ, ᴏʀ ᴄᴏɴᴛʀᴏʟ.'
  }
};

// ============================================================
// LANES
// ============================================================

const LANES = {
  clashlane: {
    name: 'Clashlane',
    emoji: '<:clashlane:1550553783304589443>',
    description: 'sᴏʟᴏ ʟᴀɴᴇ ꜰᴏʀ ᴅᴜᴇʟɪɴɢ ᴀɴᴅ sᴘʟɪᴛ ᴘᴜsʜɪɴɢ.'
  },

  jungler: {
    name: 'Jungler',
    emoji: '<:jungler:1550553875562500248>',
    description: 'ᴊᴜɴɢʟᴇ ʀᴇsᴏᴜʀᴄᴇs, ᴏʙᴊᴇᴄᴛɪᴠᴇs, ᴀɴᴅ ᴍᴀᴘ ᴘʀᴇssᴜʀᴇ.'
  },

  midlane: {
    name: 'Midlane',
    emoji: '<:midlane:1550553955501871124>',
    description: 'ᴡᴀᴠᴇ ᴄʟᴇᴀʀɪɴɢ, ʀᴏᴛᴀᴛɪᴏɴs, ᴀɴᴅ ᴛᴇᴀᴍ ꜰɪɢʜᴛs.'
  },

  farmlane: {
    name: 'Farmlane',
    emoji: '<:farmlane:1550554057448361984>',
    description: 'ɢᴏʟᴅ ꜰᴀʀᴍɪɴɢ ᴀɴᴅ ᴘʀɪᴍᴀʀʏ ᴅᴀᴍᴀɢᴇ.'
  },

  roamer: {
    name: 'Roamer',
    emoji: '<:roamer:1550554124473466920>',
    description: 'ᴍᴀᴘ sᴜᴘᴘᴏʀᴛ, ɪɴɪᴛɪᴀᴛɪᴏɴ, ᴀɴᴅ ᴛᴇᴀᴍ ᴀssɪsᴛᴀɴᴄᴇ.'
  },

  versatile: {
    name: 'Versatile',
    emoji: '<:versatile:1550554190496014366>',
    description: 'ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ ᴀᴅᴀᴘᴛɪɴɢ ᴛᴏ ᴍᴜʟᴛɪᴘʟᴇ ʟᴀɴᴇs.'
  }
};

// ============================================================
// DISCORD CLIENT
// ============================================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ============================================================
// RENDER HEALTH SERVER
// ============================================================

const PORT = Number(process.env.PORT) || 10000;

http
  .createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8'
    });

    res.end(
      req.url === '/health'
        ? 'OK'
        : 'LAMPOON Role & Lane Bot is online.'
    );
  })
  .listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Render Health Server running on port ${PORT}`);
  });

// ============================================================
// PER-USER CLICK QUEUE
//
// IMPORTANT:
// This fixes rapid/finger clicking.
//
// Every click is processed in the exact order Discord
// receives it. The clicked button is NEVER guessed from
// the previous popup state.
// ============================================================

const selectionQueues = new Map();

function queueSelection(userId, task) {
  const previous = selectionQueues.get(userId) || Promise.resolve();

  const next = previous.then(task, task);

  selectionQueues.set(userId, next);

  next.finally(() => {
    if (selectionQueues.get(userId) === next) {
      selectionQueues.delete(userId);
    }
  }).catch(() => {});

  return next;
}

// ============================================================
// MAIN EMBED
// ============================================================

function mainEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle('⚔️ ROLE & 🛣️ LANE SELECTION')
    .setDescription(
      '**Your selection automatically updates your LAMPOON Discord roles.**\n\n' +
      '⚔️ **Role**\n' +
      'Choose one or more Hero Roles you are comfortable playing in-game.\n\n' +
      '🛣️ **Lane**\n' +
      'Choose one or more Lane Roles to gain their corresponding server colors.\n\n' +
      'You can change your Role or Lane selections anytime.'
    )
    .setFooter({
      text: 'LAMPOON • Role & Lane Selection'
    });

  if (LAMPOON_GIF_URL) {
    embed.setThumbnail(LAMPOON_GIF_URL);
  }

  return embed;
}

// ============================================================
// MAIN BUTTONS
//
// Discord does NOT support custom Gold/Silver button colors.
// Role uses Primary as the closest strong accent.
// Lane uses Secondary, which is Discord's native gray/silver.
// ============================================================

function mainButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lampoon_open_roles')
      .setLabel('Choose Role')
      .setEmoji('⚔️')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('lampoon_open_lanes')
      .setLabel('Choose Lane')
      .setEmoji('🛣️')
      .setStyle(ButtonStyle.Secondary)
  );
}

// ============================================================
// POPUP EMBED
// ============================================================

function popupEmbed(member, data, title, section, color) {
  const selected = Object.entries(data)
    .filter(
      ([id]) =>
        ROLE_IDS[id] &&
        member.roles.cache.has(ROLE_IDS[id])
    )
    .map(
      ([, option]) =>
        `${option.emoji} **${option.name}**`
    );

  const body = Object.entries(data)
    .map(
      ([, option]) =>
        `${option.emoji} **${option.name}**\n> ${option.description}`
    )
    .join('\n\n');

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(
      `Select the ${section} you are comfortable playing in-game.\n\n` +
      `${body}\n\n` +
      `✦ **CURRENTLY SELECTED** ✦\n` +
      `${selected.length ? selected.join(' • ') : 'None selected.'}`
    )
    .setFooter({
      text: 'Click an option to add or remove it.'
    });
}

// ============================================================
// ROLE / LANE POPUP EMBEDS
// ============================================================

function roleEmbed(member) {
  return popupEmbed(
    member,
    ROLES,
    '⚔️ CHOOSE YOUR ROLE',
    'Hero Roles',
    0xF1C40F
  );
}

function laneEmbed(member) {
  return popupEmbed(
    member,
    LANES,
    '🛣️ CHOOSE YOUR LANE',
    'Lanes',
    0x95A5A6
  );
}

// ============================================================
// OPTION BUTTON GENERATOR
//
// Selected = Green
// Unselected = Gray
// ============================================================

function buttons(member, data, prefix, perRow) {
  const entries = Object.entries(data);
  const rows = [];

  for (let i = 0; i < entries.length; i += perRow) {
    const row = new ActionRowBuilder();

    entries
      .slice(i, i + perRow)
      .forEach(([id, option]) => {
        const selected =
          ROLE_IDS[id] &&
          member.roles.cache.has(ROLE_IDS[id]);

        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`${prefix}${id}`)
            .setLabel(option.name)
            .setEmoji(option.emoji)
            .setStyle(
              selected
                ? ButtonStyle.Success
                : ButtonStyle.Secondary
            )
        );
      });

    rows.push(row);
  }

  return rows;
}

// ============================================================
// ROLE BUTTONS
//
// 2 PER ROW
//
// Fighter     Tank
// Assassin    Mage
// Marksman    Support
// ============================================================

function roleButtons(member) {
  return [
    ...buttons(member, ROLES, 'lampoon_role_', 2),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_close_role_popup')
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Primary)
    )
  ];
}

// ============================================================
// LANE BUTTONS
//
// 2 PER ROW
//
// Clashlane   Jungler
// Midlane     Farmlane
// Roamer      Versatile
// ============================================================

function laneButtons(member) {
  return [
    ...buttons(member, LANES, 'lampoon_lane_', 2),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_close_lane_popup')
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Primary)
    )
  ];
}

// ============================================================
// LOGGING
// ============================================================

async function sendLog(embed) {
  if (!LOG_CHANNEL_ID) return;

  try {
    const channel = await client.channels.fetch(
      LOG_CHANNEL_ID
    );

    if (channel?.isTextBased()) {
      await channel.send({
        embeds: [embed]
      });
    }
  } catch (error) {
    console.error(
      '❌ Failed to send log:',
      error
    );
  }
}

// ============================================================
// FIND EXISTING PANEL OR CREATE ONE
// ============================================================

async function sendOrFindPanel() {
  try {
    if (!ROLE_LANE_CHANNEL_ID) {
      return console.error(
        '❌ ROLE_LANE_CHANNEL_ID is missing.'
      );
    }

    const channel = await client.channels.fetch(
      ROLE_LANE_CHANNEL_ID
    );

    if (!channel?.isTextBased()) {
      return console.error(
        '❌ Role & Lane channel is invalid.'
      );
    }

    const messages = await channel.messages.fetch({
      limit: 100
    });

    const oldPanel = messages.find(
      message =>
        message.author.id === client.user.id &&
        message.embeds[0]?.title ===
          '⚔️ ROLE & 🛣️ LANE SELECTION'
    );

    if (oldPanel) {
      console.log(
        `✅ Existing Role & Lane panel found: ${oldPanel.id}`
      );
      return;
    }

    const panel = await channel.send({
      embeds: [mainEmbed()],
      components: [mainButtons()]
    });

    console.log(
      `✅ New Role & Lane panel sent: ${panel.id}`
    );
  } catch (error) {
    console.error(
      '❌ FAILED TO SEND ROLE & LANE PANEL:',
      error
    );
  }
}

// ============================================================
// SLASH COMMANDS
// ============================================================

const commands = [
  new SlashCommandBuilder()
    .setName('my-selection')
    .setDescription(
      'View your current Hero Role and Lane selections.'
    ),

  new SlashCommandBuilder()
    .setName('reset-selection')
    .setDescription(
      'Reset all of your Hero Role and Lane selections.'
    )
].map(command => command.toJSON());

// ============================================================
// READY
// ============================================================

client.once('clientReady', async () => {
  console.log(
    `🤖 Logged in as ${client.user.tag}`
  );

  try {
    await new REST({
      version: '10'
    })
      .setToken(TOKEN)
      .put(
        Routes.applicationGuildCommands(
          CLIENT_ID,
          GUILD_ID
        ),
        {
          body: commands
        }
      );

    console.log(
      '✅ Slash commands registered.'
    );
  } catch (error) {
    console.error(
      '❌ Slash command registration failed:',
      error
    );
  }

  await sendOrFindPanel();
});

// ============================================================
// INTERACTIONS
// ============================================================

client.on('interactionCreate', async interaction => {
  try {

    // ========================================================
    // SLASH COMMANDS
    // ========================================================

    if (interaction.isChatInputCommand()) {
      const member = interaction.member;

      // ------------------------------------------------------
      // /my-selection
      // ------------------------------------------------------

      if (interaction.commandName === 'my-selection') {
        const selectedRoles = Object.entries(ROLES)
          .filter(
            ([id]) =>
              ROLE_IDS[id] &&
              member.roles.cache.has(ROLE_IDS[id])
          )
          .map(
            ([, option]) =>
              `${option.emoji} **${option.name}**`
          );

        const selectedLanes = Object.entries(LANES)
          .filter(
            ([id]) =>
              ROLE_IDS[id] &&
              member.roles.cache.has(ROLE_IDS[id])
          )
          .map(
            ([, option]) =>
              `${option.emoji} **${option.name}**`
          );

        return interaction.reply({
          flags: MessageFlags.Ephemeral,
          embeds: [
            new EmbedBuilder()
              .setColor(0x3299DB)
              .setTitle(
                '📋 YOUR LAMPOON SELECTION'
              )
              .setDescription(
                `**⚔️ Hero Roles**\n` +
                `${
                  selectedRoles.length
                    ? selectedRoles.join('\n')
                    : 'None selected.'
                }\n\n` +
                `**🛣️ Lanes**\n` +
                `${
                  selectedLanes.length
                    ? selectedLanes.join('\n')
                    : 'None selected.'
                }`
              )
          ]
        });
      }

      // ------------------------------------------------------
      // /reset-selection
      // ------------------------------------------------------

      if (
        interaction.commandName ===
        'reset-selection'
      ) {
        await interaction.deferReply({
          flags: MessageFlags.Ephemeral
        });

        await queueSelection(
          interaction.user.id,
          async () => {
            const freshMember =
              await interaction.guild.members.fetch({
                user: interaction.user.id,
                force: true
              });

            const roleIds = [
              ...Object.keys(ROLES),
              ...Object.keys(LANES)
            ]
              .map(key => ROLE_IDS[key])
              .filter(
                roleId =>
                  roleId &&
                  freshMember.roles.cache.has(roleId)
              );

            if (roleIds.length) {
              await freshMember.roles.remove(roleIds);
            }
          }
        );

        void sendLog(
          new EmbedBuilder()
            .setColor(0x3299DB)
            .setTitle(
              '🔄 SELECTION RESET'
            )
            .setDescription(
              `${interaction.user} reset their Role & Lane selection.`
            )
            .setTimestamp()
        );

        return interaction.editReply({
          content:
            '✅ Your Hero Roles and Lanes have been reset.'
        });
      }

      return;
    }

    // ========================================================
    // IGNORE NON-BUTTON INTERACTIONS
    // ========================================================

    if (!interaction.isButton()) {
      return;
    }

    // ========================================================
    // OPEN ROLE POPUP
    // ========================================================

    if (
      interaction.customId ===
      'lampoon_open_roles'
    ) {
      const freshMember =
        await interaction.guild.members.fetch({
          user: interaction.user.id,
          force: true
        });

      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        embeds: [
          roleEmbed(freshMember)
        ],
        components:
          roleButtons(freshMember)
      });
    }

    // ========================================================
    // OPEN LANE POPUP
    // ========================================================

    if (
      interaction.customId ===
      'lampoon_open_lanes'
    ) {
      const freshMember =
        await interaction.guild.members.fetch({
          user: interaction.user.id,
          force: true
        });

      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        embeds: [
          laneEmbed(freshMember)
        ],
        components:
          laneButtons(freshMember)
      });
    }

    // ========================================================
    // CLOSE ROLE POPUP
    // ========================================================

    if (
      interaction.customId ===
      'lampoon_close_role_popup'
    ) {
      return interaction.update({
        content:
          '✅ **Role selection saved.**\n' +
          'You can click ⚔️ **Choose Role** again anytime to change it.',
        embeds: [],
        components: []
      });
    }

    // ========================================================
    // CLOSE LANE POPUP
    // ========================================================

    if (
      interaction.customId ===
      'lampoon_close_lane_popup'
    ) {
      return interaction.update({
        content:
          '✅ **Lane selection saved.**\n' +
          'You can click 🛣️ **Choose Lane** again anytime to change it.',
        embeds: [],
        components: []
      });
    }

    // ========================================================
    // ROLE OR LANE BUTTON
    //
    // EXACT TOGGLE:
    //
    // Click Fighter -> add Fighter
    // Click Fighter again -> remove Fighter
    //
    // Click Roamer -> add Roamer
    // Click Farmlane -> add Farmlane
    // Click Clashlane -> add Clashlane
    // Click Farmlane again -> remove ONLY Farmlane
    //
    // NO OTHER ROLE/LANE IS TOUCHED.
    // ========================================================

    const isRole =
      interaction.customId.startsWith(
        'lampoon_role_'
      );

    const isLane =
      interaction.customId.startsWith(
        'lampoon_lane_'
      );

    if (!isRole && !isLane) {
      return;
    }

    // --------------------------------------------------------
    // GET THE EXACT BUTTON THAT WAS CLICKED
    // --------------------------------------------------------

    const prefix = isRole
      ? 'lampoon_role_'
      : 'lampoon_lane_';

    const id =
      interaction.customId.replace(
        prefix,
        ''
      );

    const data = isRole
      ? ROLES
      : LANES;

    const roleId = ROLE_IDS[id];

    if (!data[id] || !roleId) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          '❌ This option is not configured correctly.'
      });
    }

    // --------------------------------------------------------
    // ACKNOWLEDGE THE CLICK IMMEDIATELY
    //
    // This prevents Discord's interaction timeout while
    // the queue is processing previous finger taps.
    // --------------------------------------------------------

    await interaction.deferUpdate();

    // --------------------------------------------------------
    // QUEUE THIS EXACT CLICK
    // --------------------------------------------------------

    await queueSelection(
      interaction.user.id,
      async () => {

        // ----------------------------------------------------
        // ALWAYS FETCH THE LATEST DISCORD ROLE STATE
        // ----------------------------------------------------

        const member =
          await interaction.guild.members.fetch({
            user: interaction.user.id,
            force: true
          });

        // ----------------------------------------------------
        // CHECK ONLY THE ROLE BELONGING TO THE BUTTON
        // THAT WAS CLICKED.
        // ----------------------------------------------------

        const isSelected =
          member.roles.cache.has(roleId);

        if (isSelected) {

          // ==================================================
          // SECOND CLICK
          // REMOVE ONLY THIS EXACT ROLE
          // ==================================================

          await member.roles.remove(
            roleId
          );

        } else {

          // ==================================================
          // FIRST CLICK
          // ADD ONLY THIS EXACT ROLE
          //
          // Other selected roles/lanes stay untouched.
          // ==================================================

          await member.roles.add(
            roleId
          );
        }

        // ----------------------------------------------------
        // FETCH AGAIN AFTER THE ROLE CHANGE
        // ----------------------------------------------------

        const freshMember =
          await interaction.guild.members.fetch({
            user: interaction.user.id,
            force: true
          });

        // ----------------------------------------------------
        // UPDATE THE SAME EPHEMERAL POPUP
        // ----------------------------------------------------

        await interaction.editReply({
          embeds: [
            isRole
              ? roleEmbed(freshMember)
              : laneEmbed(freshMember)
          ],

          components:
            isRole
              ? roleButtons(freshMember)
              : laneButtons(freshMember)
        });

        // ----------------------------------------------------
        // LOG AFTER UI UPDATE
        // ----------------------------------------------------

        const selected =
          Object.entries(data)
            .filter(
              ([key]) =>
                ROLE_IDS[key] &&
                freshMember.roles.cache.has(
                  ROLE_IDS[key]
                )
            )
            .map(
              ([, option]) =>
                option.name
            );

        void sendLog(
          new EmbedBuilder()
            .setColor(
              isRole
                ? 0xF1C40F
                : 0x95A5A6
            )
            .setTitle(
              isRole
                ? '⚔️ HERO ROLE UPDATED'
                : '🛣️ LANE UPDATED'
            )
            .setDescription(
              `${interaction.user} updated their ${
                isRole
                  ? 'Hero Role'
                  : 'Lane'
              } selection.\n\n` +
              `**Selected:** ${
                selected.length
                  ? selected.join(', ')
                  : 'None'
              }`
            )
            .setTimestamp()
        );
      }
    );

  } catch (error) {

    console.error(
      '❌ Interaction error:',
      error
    );

    if (
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction
        .reply({
          flags: MessageFlags.Ephemeral,
          content:
            '❌ Something went wrong. Please check my **Manage Roles** permission and role hierarchy.'
        })
        .catch(() => {});
    } else {
      await interaction
        .editReply({
          content:
            '❌ Something went wrong. Please check my **Manage Roles** permission and role hierarchy.'
        })
        .catch(() => {});
    }
  }
});

// ============================================================
// DISCORD ERROR HANDLERS
// ============================================================

client.on('error', error => {
  console.error(
    '❌ Discord Client Error:',
    error
  );
});

client.on('warn', warning => {
  console.warn(
    '⚠️ Discord Warning:',
    warning
  );
});

client.on('shardError', error => {
  console.error(
    '❌ Discord Shard Error:',
    error
  );
});

// ============================================================
// LOGIN
// ============================================================

client
  .login(TOKEN)
  .catch(error => {
    console.error(
      '❌ Discord login failed:',
      error
    );
  });
