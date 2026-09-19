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

/* =========================================================
   ENVIRONMENT VARIABLES
========================================================= */

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const ROLE_LANE_CHANNEL_ID = process.env.ROLE_LANE_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const LAMPOON_GIF_URL = process.env.LAMPOON_GIF_URL;

/* =========================================================
   ROLE IDs
========================================================= */

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

/* =========================================================
   HERO ROLES
========================================================= */

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

/* =========================================================
   LANES
========================================================= */

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

/* =========================================================
   DISCORD CLIENT
========================================================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

/* =========================================================
   RENDER HEALTH SERVER
========================================================= */

const PORT = Number(process.env.PORT) || 10000;

http
  .createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8'
    });

    if (req.url === '/health') {
      res.end('OK');
      return;
    }

    res.end('LAMPOON Role & Lane Bot is online.');
  })
  .listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Render Health Server running on port ${PORT}`);
  });

/* =========================================================
   PER-USER OPERATION QUEUE
========================================================= */

/*
   Every user gets their own queue.

   This prevents:

   Tap A
   Tap B
   Tap C

   from racing against each other.

   Different users can still operate simultaneously.
*/

const selectionQueues = new Map();

function queueSelection(userId, task) {
  const previous =
    selectionQueues.get(userId) ||
    Promise.resolve();

  const next = previous.then(task, task);

  selectionQueues.set(userId, next);

  next.finally(() => {
    if (selectionQueues.get(userId) === next) {
      selectionQueues.delete(userId);
    }
  }).catch(() => {});

  return next;
}

/* =========================================================
   MAIN PANEL EMBED
========================================================= */

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

/* =========================================================
   MAIN PANEL BUTTONS
========================================================= */

function mainButtons() {
  return new ActionRowBuilder()
    .addComponents(

      new ButtonBuilder()
        .setCustomId('lampoon_open_roles')
        .setLabel('Choose Role')
        .setEmoji('⚔️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('lampoon_open_lanes')
        .setLabel('Choose Lane')
        .setEmoji('🛣️')
        .setStyle(ButtonStyle.Secondary)

    );
}

/* =========================================================
   GET SELECTED OPTIONS
========================================================= */

function getSelectedOptions(member, data) {
  return Object.entries(data)
    .filter(([id]) => {
      const roleId = ROLE_IDS[id];

      return (
        roleId &&
        member.roles.cache.has(roleId)
      );
    })
    .map(([, option]) => option);
}

/* =========================================================
   POPUP EMBED
========================================================= */

function popupEmbed(
  member,
  data,
  title,
  section,
  color
) {
  const selected = getSelectedOptions(member, data);

  const body = Object.entries(data)
    .map(([, option]) => {
      return (
        `${option.emoji} **${option.name}**\n` +
        `> ${option.description}`
      );
    })
    .join('\n\n');

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(
      `Select the ${section} you are comfortable playing in-game.\n\n` +

      `${body}\n\n` +

      `✦ **CURRENTLY SELECTED** ✦\n` +

      `${
        selected.length
          ? selected
              .map(option => `${option.emoji} **${option.name}**`)
              .join(' • ')
          : 'None selected.'
      }`
    )
    .setFooter({
      text: 'Click an option to add or remove it.'
    });
}

/* =========================================================
   ROLE POPUP
========================================================= */

function roleEmbed(member) {
  return popupEmbed(
    member,
    ROLES,
    '⚔️ CHOOSE YOUR ROLE',
    'Hero Roles',
    0xC0C0C0
  );
}

/* =========================================================
   LANE POPUP
========================================================= */

function laneEmbed(member) {
  return popupEmbed(
    member,
    LANES,
    '🛣️ CHOOSE YOUR LANE',
    'Lanes',
    0xD4AF37
  );
}

/* =========================================================
   BUTTON BUILDER
========================================================= */

function buttons(
  member,
  data,
  prefix,
  perRow
) {
  const entries = Object.entries(data);

  const rows = [];

  for (
    let i = 0;
    i < entries.length;
    i += perRow
  ) {
    const row = new ActionRowBuilder();

    entries
      .slice(i, i + perRow)
      .forEach(([id, option]) => {

        const roleId = ROLE_IDS[id];

        const selected =
          roleId &&
          member.roles.cache.has(roleId);

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

/* =========================================================
   ROLE BUTTONS
========================================================= */

function roleButtons(member) {
  return [
    ...buttons(
      member,
      ROLES,
      'lampoon_role_',
      2
    ),

    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('lampoon_close_role_popup')
          .setLabel('Done')
          .setEmoji('✅')
          .setStyle(ButtonStyle.Primary)
      )
  ];
}

/* =========================================================
   LANE BUTTONS
========================================================= */

function laneButtons(member) {
  return [
    ...buttons(
      member,
      LANES,
      'lampoon_lane_',
      2
    ),

    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('lampoon_close_lane_popup')
          .setLabel('Done')
          .setEmoji('✅')
          .setStyle(ButtonStyle.Primary)
      )
  ];
}

/* =========================================================
   LOGGING
========================================================= */

async function sendLog(embed) {
  if (!LOG_CHANNEL_ID) {
    return;
  }

  try {
    const channel =
      await client.channels.fetch(
        LOG_CHANNEL_ID
      );

    if (
      channel &&
      channel.isTextBased()
    ) {
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

/* =========================================================
   SAFE INTERACTION ERROR HANDLER
========================================================= */

async function safeInteractionError(
  interaction,
  message
) {
  try {
    if (
      !interaction.isRepliable()
    ) {
      return;
    }

    if (
      interaction.replied ||
      interaction.deferred
    ) {
      await interaction.editReply({
        content: message
      }).catch(() => {});

      return;
    }

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: message
    }).catch(() => {});

  } catch {
    // Ignore secondary interaction errors.
  }
}

/* =========================================================
   SEND OR FIND MAIN PANEL
========================================================= */

async function sendOrFindPanel() {
  try {
    if (!ROLE_LANE_CHANNEL_ID) {
      console.error('❌ ROLE_LANE_CHANNEL_ID is missing.');
      return;
    }

    const channel = await client.channels.fetch(
      ROLE_LANE_CHANNEL_ID,
      { force: true }
    );

    if (!channel) {
      console.error(
        `❌ Cannot find channel: ${ROLE_LANE_CHANNEL_ID}`
      );
      return;
    }

    console.log(
      `📍 Role & Lane channel: #${channel.name} (${channel.id})`
    );

    if (!channel.isTextBased()) {
      console.error(
        `❌ Channel ${channel.id} is not a text-based channel.`
      );
      return;
    }

    /* Check permissions */
    const permissions = channel.permissionsFor(client.user);

    if (!permissions) {
      console.error(
        '❌ Could not determine bot permissions in this channel.'
      );
      return;
    }

    if (!permissions.has('ViewChannel')) {
      console.error(
        '❌ Bot does not have View Channel permission.'
      );
      return;
    }

    if (!permissions.has('SendMessages')) {
      console.error(
        '❌ Bot does not have Send Messages permission.'
      );
      return;
    }

    if (!permissions.has('EmbedLinks')) {
      console.error(
        '❌ Bot does not have Embed Links permission.'
      );
      return;
    }

    console.log(
      '✅ Bot has View Channel, Send Messages and Embed Links permissions.'
    );

    /* Fetch recent messages */
    const messages = await channel.messages.fetch({
      limit: 100
    });

    const existingPanel = messages.find(message =>
      message.author.id === client.user.id &&
      message.embeds?.some(
        embed =>
          embed.title ===
          '⚔️ ROLE & 🛣️ LANE SELECTION'
      )
    );

    if (existingPanel) {
      console.log(
        `✅ Existing Role & Lane panel found: ${existingPanel.id}`
      );

      console.log(
        `📍 Panel is in #${channel.name} (${channel.id})`
      );

      return;
    }

    console.log(
      '📤 No existing panel found. Sending new panel...'
    );

    const panel = await channel.send({
      embeds: [
        mainEmbed()
      ],
      components: [
        mainButtons()
      ]
    });

    console.log(
      `✅ Role & Lane panel sent successfully: ${panel.id}`
    );

  } catch (error) {
    console.error(
      '❌ FAILED TO SEND ROLE & LANE PANEL:',
      error
    );
  }
}

/* =========================================================
   SLASH COMMANDS
========================================================= */

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

/* =========================================================
   BOT READY
========================================================= */

client.once(
  'clientReady',
  async () => {

    console.log(
      `🤖 Logged in as ${client.user.tag}`
    );

    try {

      const rest =
        new REST({
          version: '10'
        }).setToken(TOKEN);

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
        '✅ Slash commands registered.'
      );

    } catch (error) {

      console.error(
        '❌ Slash command registration failed:',
        error
      );
    }

    await sendOrFindPanel();
  }
);

/* =========================================================
   INTERACTION HANDLER
========================================================= */

client.on(
  'interactionCreate',
  async interaction => {

    try {

      /* =====================================================
         SLASH COMMANDS
      ===================================================== */

      if (interaction.isChatInputCommand()) {

        /* ---------------------------------------------------
           /my-selection
        --------------------------------------------------- */

        if (
          interaction.commandName ===
          'my-selection'
        ) {

          const member =
            await interaction.guild.members.fetch({
              user: interaction.user.id,
              force: true
            });

          const selectedRoles =
            getSelectedOptions(
              member,
              ROLES
            );

          const selectedLanes =
            getSelectedOptions(
              member,
              LANES
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

                  (
                    selectedRoles.length
                      ? selectedRoles
                          .map(
                            option =>
                              `${option.emoji} **${option.name}**`
                          )
                          .join('\n')
                      : 'None selected.'
                  ) +

                  `\n\n**🛣️ Lanes**\n` +

                  (
                    selectedLanes.length
                      ? selectedLanes
                          .map(
                            option =>
                              `${option.emoji} **${option.name}**`
                          )
                          .join('\n')
                      : 'None selected.'
                  )
                )
            ]
          });
        }

        /* ---------------------------------------------------
           /reset-selection
        --------------------------------------------------- */

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

              const member =
                await interaction.guild.members.fetch({
                  user: interaction.user.id,
                  force: true
                });

              const allSelectionRoleIds =
                [
                  ...Object.keys(ROLES),
                  ...Object.keys(LANES)
                ]
                  .map(
                    key => ROLE_IDS[key]
                  )
                  .filter(Boolean)
                  .filter(
                    roleId =>
                      member.roles.cache.has(roleId)
                  );

              if (
                allSelectionRoleIds.length
              ) {

                await member.roles.remove(
                  allSelectionRoleIds
                );
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

      /* =====================================================
         IGNORE NON-BUTTON INTERACTIONS
      ===================================================== */

      if (!interaction.isButton()) {
        return;
      }

      /* =====================================================
         OPEN ROLE POPUP
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_open_roles'
      ) {

        const member =
          await interaction.guild.members.fetch({
            user: interaction.user.id,
            force: true
          });

        return interaction.reply({
          flags: MessageFlags.Ephemeral,

          embeds: [
            roleEmbed(member)
          ],

          components:
            roleButtons(member)
        });
      }

      /* =====================================================
         OPEN LANE POPUP
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_open_lanes'
      ) {

        const member =
          await interaction.guild.members.fetch({
            user: interaction.user.id,
            force: true
          });

        return interaction.reply({
          flags: MessageFlags.Ephemeral,

          embeds: [
            laneEmbed(member)
          ],

          components:
            laneButtons(member)
        });
      }

      /* =====================================================
         CLOSE ROLE POPUP
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_close_role_popup'
      ) {

        if (
          !interaction.deferred &&
          !interaction.replied
        ) {

          return interaction.update({
            content:
              '✅ **Role selection saved.**\nYou can click ⚔️ **Choose Role** again anytime.',

            embeds: [],

            components: []
          });
        }

        return;
      }

      /* =====================================================
         CLOSE LANE POPUP
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_close_lane_popup'
      ) {

        if (
          !interaction.deferred &&
          !interaction.replied
        ) {

          return interaction.update({
            content:
              '✅ **Lane selection saved.**\nYou can click 🛣️ **Choose Lane** again anytime.',

            embeds: [],

            components: []
          });
        }

        return;
      }

      /* =====================================================
         ROLE / LANE OPTION
      ===================================================== */

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

      const prefix =
        isRole
          ? 'lampoon_role_'
          : 'lampoon_lane_';

      const id =
        interaction.customId.slice(
          prefix.length
        );

      const data =
        isRole
          ? ROLES
          : LANES;

      const roleId =
        ROLE_IDS[id];

      /* =====================================================
         VALIDATE BUTTON
      ===================================================== */

      if (
        !data[id] ||
        !roleId
      ) {

        if (
          !interaction.replied &&
          !interaction.deferred
        ) {

          return interaction.reply({
            flags: MessageFlags.Ephemeral,
            content:
              '❌ This option is not configured correctly.'
          });
        }

        return;
      }

      /* =====================================================
         IMPORTANT:
         FETCH MEMBER BEFORE ACKNOWLEDGING.

         This allows us to immediately calculate the
         next state and update the popup with no long
         loading period.
      ===================================================== */

      const member =
        await interaction.guild.members.fetch({
          user: interaction.user.id,
          force: true
        });

      const currentlySelected =
        member.roles.cache.has(roleId);

      const willBeSelected =
        !currentlySelected;

      /*
         Create the UI state that should be displayed
         immediately after the click.

         We clone the member's current role state locally
         instead of waiting for Discord's role API.
      */

      const simulatedRoleIds =
        new Set(member.roles.cache.keys());

      if (willBeSelected) {
        simulatedRoleIds.add(roleId);
      } else {
        simulatedRoleIds.delete(roleId);
      }

      /*
         Make a lightweight member-like object for
         rendering the popup.

         Only roles.cache.has() is needed by the UI.
      */

      const simulatedMember = {
        roles: {
          cache: {
            has: id =>
              simulatedRoleIds.has(id)
          }
        }
      };

      /* =====================================================
         IMMEDIATELY ACKNOWLEDGE + UPDATE

         This is the important fix for the loading delay.

         We use interaction.update() directly instead of
         waiting for the role API.
      ===================================================== */

      await interaction.update({

        embeds: [
          isRole
            ? roleEmbed(simulatedMember)
            : laneEmbed(simulatedMember)
        ],

        components:
          isRole
            ? roleButtons(simulatedMember)
            : laneButtons(simulatedMember)
      });

      console.log(
        `[BUTTON] ${interaction.user.id} clicked ${interaction.customId}`
      );

      /* =====================================================
         QUEUE THE REAL ROLE CHANGE
      ===================================================== */

      void queueSelection(
        interaction.user.id,
        async () => {

          try {

            /*
               Fetch again inside the queue.

               This is intentional.

               If the user rapidly clicked:

               Roamer
               Farmlane
               Clashlane

               each operation gets the newest Discord
               member state when its turn arrives.
            */

            const currentMember =
              await interaction.guild.members.fetch({
                user: interaction.user.id,
                force: true
              });

            const actualSelected =
              currentMember.roles.cache.has(
                roleId
              );

            /*
               If the state has already changed to what
               this click wants, do nothing.

               This protects against duplicate processing.
            */

            if (
              actualSelected ===
              willBeSelected
            ) {

              console.log(
                `[ROLE] ${interaction.user.id} ${willBeSelected ? 'ADD' : 'REMOVE'} ${roleId}`
              );

            } else {

              if (willBeSelected) {

                await currentMember.roles.add(
                  roleId
                );

              } else {

                await currentMember.roles.remove(
                  roleId
                );
              }

              console.log(
                `[ROLE] ${interaction.user.id} ${willBeSelected ? 'ADDED' : 'REMOVED'} ${roleId}`
              );
            }

            /* ---------------------------------------------
               LOG
            --------------------------------------------- */

            const finalMember =
              await interaction.guild.members.fetch({
                user: interaction.user.id,
                force: true
              });

            const selected =
              getSelectedOptions(
                finalMember,
                data
              );

            void sendLog(
              new EmbedBuilder()
                .setColor(
                  isRole
                    ? 0xC0C0C0
                    : 0xD4AF37
                )
                .setTitle(
                  isRole
                    ? '⚔️ HERO ROLE UPDATED'
                    : '🛣️ LANE UPDATED'
                )
                .setDescription(

                  `${interaction.user} updated their ` +
                  `${isRole ? 'Hero Role' : 'Lane'} selection.\n\n` +

                  `**Selected:** ` +

                  `${
                    selected.length
                      ? selected
                          .map(
                            option =>
                              option.name
                          )
                          .join(', ')
                      : 'None'
                  }`
                )
                .setTimestamp()
            );

            console.log(
              `[DONE] ${interaction.user.id} ${interaction.customId}`
            );

          } catch (error) {

            console.error(
              `❌ Role mutation failed for ${interaction.user.id}:`,
              error
            );

            /*
               IMPORTANT:

               The interaction was already acknowledged and
               its popup was already updated.

               We do NOT attempt another interaction.reply()
               or interaction.update() here.

               This prevents 40060 errors.
            */
          }
        }
      );

    } catch (error) {

      console.error(
        '❌ Interaction error:',
        error
      );

      /*
         Never blindly reply/update after an interaction
         has already been acknowledged or expired.
      */

      await safeInteractionError(
        interaction,
        '❌ Something went wrong. Please check my **Manage Roles** permission and role hierarchy.'
      );
    }
  }
);

/* =========================================================
   DISCORD EVENTS
========================================================= */

client.on(
  'error',
  error => {
    console.error(
      '❌ Discord Client Error:',
      error
    );
  }
);

client.on(
  'warn',
  warning => {
    console.warn(
      '⚠️ Discord Warning:',
      warning
    );
  }
);

client.on(
  'shardError',
  error => {
    console.error(
      '❌ Discord Shard Error:',
      error
    );
  }
);

/* =========================================================
   LOGIN
========================================================= */

client
  .login(TOKEN)
  .catch(error => {
    console.error(
      '❌ Discord login failed:',
      error
    );
  });
