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
   ENV
========================================================= */

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const ROLE_LANE_CHANNEL_ID =
  process.env.ROLE_LANE_CHANNEL_ID;

const LOG_CHANNEL_ID =
  process.env.LOG_CHANNEL_ID;

const LAMPOON_GIF_URL =
  process.env.LAMPOON_GIF_URL;

const PORT =
  Number(process.env.PORT) || 10000;

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
    description:
      'ᴅᴜʀᴀʙʟᴇ ᴍᴇʟᴇᴇ ʜᴇʀᴏᴇs ᴀɴᴅ ᴅᴜᴇʟɪsᴛs.'
  },

  tank: {
    name: 'Tank',
    emoji: '🛡️',
    description:
      'ꜰʀᴏɴᴛʟɪɴᴇ ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ ᴛʜᴇ ᴛᴇᴀᴍ.'
  },

  assassin: {
    name: 'Assassin',
    emoji: '🗡️',
    description:
      'ʜɪɢʜ-ʙᴜʀsᴛ ʜᴇʀᴏᴇs ᴡʜᴏ ᴇʟɪᴍɪɴᴀᴛᴇ ᴘʀɪᴏʀɪᴛʏ ᴛᴀʀɢᴇᴛs.'
  },

  mage: {
    name: 'Mage',
    emoji: '🔮',
    description:
      'ᴍᴀɢɪᴄ ᴅᴀᴍᴀɢᴇ ᴀɴᴅ ᴄʀᴏᴡᴅ-ᴄᴏɴᴛʀᴏʟ sᴘᴇᴄɪᴀʟɪsᴛs.'
  },

  marksman: {
    name: 'Marksman',
    emoji: '🏹',
    description:
      'ʀᴀɴɢᴇᴅ ʜᴇʀᴏᴇs ᴘʀᴏᴠɪᴅɪɴɢ ᴄᴏɴsɪsᴛᴇɴᴛ ᴅᴀᴍᴀɢᴇ.'
  },

  support: {
    name: 'Support',
    emoji: '🛟',
    description:
      'ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ, ᴇᴍᴘᴏᴡᴇʀ, ʜᴇᴀʟ, ᴏʀ ᴄᴏɴᴛʀᴏʟ.'
  }
};

/* =========================================================
   LANES
========================================================= */

const LANES = {
  clashlane: {
    name: 'Clashlane',
    emoji: '<:clashlane:1550553783304589443>',
    description:
      'sᴏʟᴏ ʟᴀɴᴇ ꜰᴏʀ ᴅᴜᴇʟɪɴɢ ᴀɴᴅ sᴘʟɪᴛ ᴘᴜsʜɪɴɢ.'
  },

  jungler: {
    name: 'Jungler',
    emoji: '<:jungler:1550553875562500248>',
    description:
      'ᴊᴜɴɢʟᴇ ʀᴇsᴏᴜʀᴄᴇs, ᴏʙᴊᴇᴄᴛɪᴠᴇs, ᴀɴᴅ ᴍᴀᴘ ᴘʀᴇssᴜʀᴇ.'
  },

  midlane: {
    name: 'Midlane',
    emoji: '<:midlane:1550553955501871124>',
    description:
      'ᴡᴀᴠᴇ ᴄʟᴇᴀʀɪɴɢ, ʀᴏᴛᴀᴛɪᴏɴs, ᴀɴᴅ ᴛᴇᴀᴍ ꜰɪɢʜᴛs.'
  },

  farmlane: {
    name: 'Farmlane',
    emoji: '<:farmlane:1550554057448361984>',
    description:
      'ɢᴏʟᴅ ꜰᴀʀᴍɪɴɢ ᴀɴᴅ ᴘʀɪᴍᴀʀʏ ᴅᴀᴍᴀɢᴇ.'
  },

  roamer: {
    name: 'Roamer',
    emoji: '<:roamer:1550554124473466920>',
    description:
      'ᴍᴀᴘ sᴜᴘᴘᴏʀᴛ, ɪɴɪᴛɪᴀᴛɪᴏɴ, ᴀɴᴅ ᴛᴇᴀᴍ ᴀssɪsᴛᴀɴᴄᴇ.'
  },

  versatile: {
    name: 'Versatile',
    emoji: '<:versatile:1550554190496014366>',
    description:
      'ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ ᴀᴅᴀᴘᴛɪɴɢ ᴛᴏ ᴍᴜʟᴛɪᴘʟᴇ ʟᴀɴᴇs.'
  }
};

/* =========================================================
   CLIENT
========================================================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

/* =========================================================
   RENDER HEALTH
========================================================= */

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type':
      'text/plain; charset=utf-8'
  });

  if (req.url === '/health') {
    res.end('OK');
    return;
  }

  res.end(
    'LAMPOON Role & Lane Bot is online.'
  );
}).listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `🌐 Render Health Server running on port ${PORT}`
    );
  }
);

/* =========================================================
   PER-USER POPUP STATE
========================================================= */

/*
   One temporary selection state per user.

   This allows:

   Fighter
   Tank
   Mage
   Tank again

   to correctly become:

   Fighter + Mage
*/

const popupStates = new Map();

/* =========================================================
   PER-USER ROLE QUEUE
========================================================= */

const selectionQueues = new Map();

function queueSelection(userId, task) {
  const previous =
    selectionQueues.get(userId) ||
    Promise.resolve();

  const next =
    previous.then(task, task);

  selectionQueues.set(
    userId,
    next
  );

  next.finally(() => {
    if (
      selectionQueues.get(userId) === next
    ) {
      selectionQueues.delete(userId);
    }
  }).catch(() => {});

  return next;
}

/* =========================================================
   MEMBER ROLE IDs
========================================================= */

function getMemberRoleIds(member) {
  if (!member?.roles) {
    return new Set();
  }

  if (member.roles.cache) {
    return new Set(
      member.roles.cache.keys()
    );
  }

  if (Array.isArray(member.roles)) {
    return new Set(
      member.roles
    );
  }

  return new Set();
}

/* =========================================================
   CREATE POPUP STATE
========================================================= */

function createPopupState(
  interaction,
  type,
  member
) {
  const data =
    type === 'role'
      ? ROLES
      : LANES;

  const memberRoles =
    getMemberRoleIds(member);

  const selected =
    new Set();

  for (
    const id of Object.keys(data)
  ) {
    const roleId =
      ROLE_IDS[id];

    if (
      roleId &&
      memberRoles.has(roleId)
    ) {
      selected.add(id);
    }
  }

  const state = {
    type,
    selected
  };

  popupStates.set(
    interaction.user.id,
    state
  );

  return state;
}

/* =========================================================
   MAIN EMBED
========================================================= */

function mainEmbed() {
  const embed =
    new EmbedBuilder()
      .setColor(0x3299DB)
      .setTitle(
        '⚔️ ROLE & 🛣️ LANE SELECTION'
      )
      .setDescription(
        '**Your selection automatically updates your LAMPOON Discord roles.**\n\n' +

        '⚔️ **Role**\n' +
        'Choose one or more Hero Roles you are comfortable playing in-game.\n\n' +

        '🛣️ **Lane**\n' +
        'Choose one or more Lane Roles to gain their corresponding server colors.\n\n' +

        'You can change your Role or Lane selections anytime.'
      )
      .setFooter({
        text:
          'LAMPOON • Role & Lane Selection'
      });

  if (LAMPOON_GIF_URL) {
    embed.setThumbnail(
      LAMPOON_GIF_URL
    );
  }

  return embed;
}

/* =========================================================
   MAIN BUTTONS
========================================================= */

function mainButtons() {
  return new ActionRowBuilder()
    .addComponents(

      new ButtonBuilder()
        .setCustomId(
          'lampoon_open_role_popup'
        )
        .setLabel(
          'Choose Role'
        )
        .setEmoji('⚔️')
        .setStyle(
          ButtonStyle.Secondary
        ),

      new ButtonBuilder()
        .setCustomId(
          'lampoon_open_lane_popup'
        )
        .setLabel(
          'Choose Lane'
        )
        .setEmoji('🛣️')
        .setStyle(
          ButtonStyle.Secondary
        )

    );
}

/* =========================================================
   POPUP EMBED
========================================================= */

function buildPopupEmbed(state) {
  const data =
    state.type === 'role'
      ? ROLES
      : LANES;

  const color =
    state.type === 'role'
      ? 0xC0C0C0
      : 0xD4AF37;

  const title =
    state.type === 'role'
      ? '⚔️ CHOOSE YOUR ROLE'
      : '🛣️ CHOOSE YOUR LANE';

  const selected =
    Object.entries(data)
      .filter(([id]) =>
        state.selected.has(id)
      )
      .map(([, option]) =>
        option
      );

  const optionText =
    Object.entries(data)
      .map(([, option]) =>
        `${option.emoji} **${option.name}**\n` +
        `> ${option.description}`
      )
      .join('\n\n');

  const selectedText =
    selected.length
      ? selected
          .map(
            option =>
              `${option.emoji} **${option.name}**`
          )
          .join(' • ')
      : 'None selected.';

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(
      `Select the ${
        state.type === 'role'
          ? 'Hero Roles'
          : 'Lanes'
      } you want.\n\n` +

      `${optionText}\n\n` +

      `✦ **CURRENTLY SELECTED** ✦\n` +
      selectedText
    )
    .setFooter({
      text:
        'Click an option to toggle it.'
    });
}

/* =========================================================
   POPUP BUTTONS
========================================================= */

function buildPopupButtons(state) {
  const data =
    state.type === 'role'
      ? ROLES
      : LANES;

  const prefix =
    state.type === 'role'
      ? 'lampoon_role_'
      : 'lampoon_lane_';

  const entries =
    Object.entries(data);

  const rows = [];

  for (
    let i = 0;
    i < entries.length;
    i += 2
  ) {
    const row =
      new ActionRowBuilder();

    const pair =
      entries.slice(
        i,
        i + 2
      );

    for (
      const [id, option] of pair
    ) {

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(
            `${prefix}${id}`
          )
          .setLabel(
            option.name
          )
          .setEmoji(
            option.emoji
          )
          .setStyle(
            state.selected.has(id)
              ? ButtonStyle.Success
              : ButtonStyle.Secondary
          )
      );
    }

    rows.push(row);
  }

  rows.push(
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(
            state.type === 'role'
              ? 'lampoon_role_done'
              : 'lampoon_lane_done'
          )
          .setLabel('Done')
          .setEmoji('✅')
          .setStyle(
            ButtonStyle.Primary
          )
      )
  );

  return rows;
}

/* =========================================================
   LOG
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
      '❌ Log error:',
      error
    );
  }
}

/* =========================================================
   FIND OR CREATE MAIN PANEL
========================================================= */

async function sendOrFindPanel() {
  try {

    const channel =
      await client.channels.fetch(
        ROLE_LANE_CHANNEL_ID,
        {
          force: true
        }
      );

    if (
      !channel ||
      !channel.isTextBased()
    ) {
      console.error(
        '❌ Invalid Role & Lane channel.'
      );
      return;
    }

    console.log(
      `📍 Role & Lane channel: #${channel.name} (${channel.id})`
    );

    const messages =
      await channel.messages.fetch({
        limit: 100
      });

    const existing =
      messages.find(message =>
        message.author.id ===
          client.user.id &&
        message.embeds?.some(
          embed =>
            embed.title ===
            '⚔️ ROLE & 🛣️ LANE SELECTION'
        )
      );

    if (existing) {

      /*
       * Update the existing panel instead of
       * sending another copy.
       */

      await existing.edit({
        embeds: [
          mainEmbed()
        ],
        components: [
          mainButtons()
        ]
      });

      console.log(
        `✅ Existing Role & Lane panel updated: ${existing.id}`
      );

      return;
    }

    const message =
      await channel.send({
        embeds: [
          mainEmbed()
        ],
        components: [
          mainButtons()
        ]
      });

    console.log(
      `✅ New Role & Lane panel sent: ${message.id}`
    );

  } catch (error) {

    console.error(
      '❌ Panel error:',
      error
    );
  }
}

/* =========================================================
   SLASH COMMANDS
========================================================= */

const commands = [

  new SlashCommandBuilder()
    .setName(
      'my-selection'
    )
    .setDescription(
      'View your current Role & Lane selection.'
    ),

  new SlashCommandBuilder()
    .setName(
      'reset-selection'
    )
    .setDescription(
      'Reset all your Role & Lane selections.'
    )

].map(command =>
  command.toJSON()
);

/* =========================================================
   READY
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
        }).setToken(
          TOKEN
        );

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
        '❌ Slash registration error:',
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

      if (
        interaction.isChatInputCommand()
      ) {

        /* ---------------------------------------------------
           MY SELECTION
        --------------------------------------------------- */

        if (
          interaction.commandName ===
          'my-selection'
        ) {

          await interaction.deferReply({
            flags:
              MessageFlags.Ephemeral
          });

          const member =
            await interaction.guild.members.fetch({
              user: interaction.user.id,
              force: true
            });

          const memberRoles =
            getMemberRoleIds(member);

          const roleNames =
            Object.entries(ROLES)
              .filter(
                ([id]) =>
                  memberRoles.has(
                    ROLE_IDS[id]
                  )
              )
              .map(
                ([, option]) =>
                  `${option.emoji} **${option.name}**`
              );

          const laneNames =
            Object.entries(LANES)
              .filter(
                ([id]) =>
                  memberRoles.has(
                    ROLE_IDS[id]
                  )
              )
              .map(
                ([, option]) =>
                  `${option.emoji} **${option.name}**`
              );

          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(0x3299DB)
                .setTitle(
                  '📋 YOUR LAMPOON SELECTION'
                )
                .setDescription(
                  `**⚔️ Hero Roles**\n` +
                  (
                    roleNames.length
                      ? roleNames.join('\n')
                      : 'None selected.'
                  ) +

                  `\n\n**🛣️ Lanes**\n` +

                  (
                    laneNames.length
                      ? laneNames.join('\n')
                      : 'None selected.'
                  )
                )
            ]
          });
        }

        /* ---------------------------------------------------
           RESET
        --------------------------------------------------- */

        if (
          interaction.commandName ===
          'reset-selection'
        ) {

          await interaction.deferReply({
            flags:
              MessageFlags.Ephemeral
          });

          await queueSelection(
            interaction.user.id,
            async () => {

              const member =
                await interaction.guild.members.fetch({
                  user: interaction.user.id,
                  force: true
                });

              const roleIds =
                Object.values(
                  ROLE_IDS
                ).filter(Boolean);

              const existing =
                roleIds.filter(
                  roleId =>
                    member.roles.cache.has(
                      roleId
                    )
                );

              if (existing.length) {
                await member.roles.remove(
                  existing
                );
              }
            }
          );

          popupStates.delete(
            interaction.user.id
          );

          void sendLog(
            new EmbedBuilder()
              .setColor(0x3299DB)
              .setTitle(
                '🔄 SELECTION RESET'
              )
              .setDescription(
                `${interaction.user} reset all Role & Lane selections.`
              )
              .setTimestamp()
          );

          return interaction.editReply({
            content:
              '✅ All Role & Lane selections have been reset.'
          });
        }

        return;
      }

      /* =====================================================
         BUTTONS
      ===================================================== */

      if (!interaction.isButton()) {
        return;
      }

      /* =====================================================
         OPEN ROLE POPUP

         IMPORTANT:
         reply() is the FIRST network operation.

         No fetch happens before the reply.
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_open_role_popup'
      ) {

        const member =
          interaction.member;

        const state =
          createPopupState(
            interaction,
            'role',
            member
          );

        /*
         * PRIVATE EPHEMERAL POPUP
         */

        return interaction.reply({
          flags:
            MessageFlags.Ephemeral,

          embeds: [
            buildPopupEmbed(state)
          ],

          components:
            buildPopupButtons(state)
        });
      }

      /* =====================================================
         OPEN LANE POPUP
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_open_lane_popup'
      ) {

        const member =
          interaction.member;

        const state =
          createPopupState(
            interaction,
            'lane',
            member
          );

        /*
         * PRIVATE EPHEMERAL POPUP
         */

        return interaction.reply({
          flags:
            MessageFlags.Ephemeral,

          embeds: [
            buildPopupEmbed(state)
          ],

          components:
            buildPopupButtons(state)
        });
      }

      /* =====================================================
         DONE - ROLE
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_role_done'
      ) {

        popupStates.delete(
          interaction.user.id
        );

        return interaction.update({
          content:
            '✅ **Role selection saved.**',

          embeds: [],

          components: []
        });
      }

      /* =====================================================
         DONE - LANE
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_lane_done'
      ) {

        popupStates.delete(
          interaction.user.id
        );

        return interaction.update({
          content:
            '✅ **Lane selection saved.**',

          embeds: [],

          components: []
        });
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

      if (
        !data[id] ||
        !roleId
      ) {
        return;
      }

      /* =====================================================
         GET EXISTING POPUP STATE
      ===================================================== */

      let state =
        popupStates.get(
          interaction.user.id
        );

      /*
         This only happens if the bot restarted while
         somebody still had an old ephemeral popup open.
      */

      if (!state) {

        state =
          createPopupState(
            interaction,
            isRole
              ? 'role'
              : 'lane',
            interaction.member
          );
      }

      /* =====================================================
         EXACT TOGGLE
      ===================================================== */

      const wasSelected =
        state.selected.has(id);

      const desired =
        !wasSelected;

      if (desired) {
        state.selected.add(id);
      } else {
        state.selected.delete(id);
      }

      popupStates.set(
        interaction.user.id,
        state
      );

      /* =====================================================
         UPDATE SAME EPHEMERAL MESSAGE

         This does NOT send a new message.
      ===================================================== */

      await interaction.update({
        embeds: [
          buildPopupEmbed(state)
        ],

        components:
          buildPopupButtons(state)
      });

      /* =====================================================
         ACTUAL DISCORD ROLE CHANGE

         Queued separately so the UI doesn't wait.
      ===================================================== */

      void queueSelection(
        interaction.user.id,
        async () => {

          try {

            const member =
              await interaction.guild.members.fetch({
                user: interaction.user.id,
                force: true
              });

            const currentlyHasRole =
              member.roles.cache.has(
                roleId
              );

            /*
             * Exact desired state.
             *
             * Never blindly toggle Discord's current state.
             */

            if (
              currentlyHasRole !== desired
            ) {

              if (desired) {

                await member.roles.add(
                  roleId
                );

              } else {

                await member.roles.remove(
                  roleId
                );
              }
            }

            console.log(
              `✅ ${interaction.user.tag}: ${data[id].name} = ${
                desired
                  ? 'SELECTED'
                  : 'REMOVED'
              }`
            );

            /* ---------------------------------------------
               LOG
            --------------------------------------------- */

            const fresh =
              await interaction.guild.members.fetch({
                user: interaction.user.id,
                force: true
              });

            const selected =
              Object.entries(data)
                .filter(
                  ([optionId]) =>
                    fresh.roles.cache.has(
                      ROLE_IDS[optionId]
                    )
                )
                .map(
                  ([, option]) =>
                    `${option.emoji} ${option.name}`
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
                  `${interaction.user} ${
                    desired
                      ? 'selected'
                      : 'removed'
                  } **${data[id].name}**.\n\n` +

                  `**Current ${isRole ? 'Roles' : 'Lanes'}:**\n` +

                  (
                    selected.length
                      ? selected.join('\n')
                      : 'None'
                  )
                )
                .setTimestamp()
            );

          } catch (error) {

            console.error(
              `❌ Failed to update ${data[id].name}:`,
              error
            );
          }
        }
      ).catch(error => {
        console.error(
          '❌ Selection queue error:',
          error
        );
      });

      return;
    }

    catch (error) {

      console.error(
        '❌ Interaction error:',
        error
      );

      /*
       * Only respond if this interaction has NOT
       * already been acknowledged.
       */

      try {

        if (
          interaction.isRepliable() &&
          !interaction.replied &&
          !interaction.deferred
        ) {

          await interaction.reply({
            flags:
              MessageFlags.Ephemeral,

            content:
              '❌ Something went wrong. Please try again.'
          });
        }

      } catch {
        // Interaction may already have expired.
      }
    }
  }
);

/* =========================================================
   DISCORD ERRORS
========================================================= */

client.on(
  'error',
  error =>
    console.error(
      '❌ Discord Client Error:',
      error
    )
);

client.on(
  'warn',
  warning =>
    console.warn(
      '⚠️ Discord Warning:',
      warning
    )
);

client.on(
  'shardError',
  error =>
    console.error(
      '❌ Discord Shard Error:',
      error
    );

/* =========================================================
   LOGIN
========================================================= */

client
  .login(TOKEN)
  .catch(error =>
    console.error(
      '❌ Discord login failed:',
      error
    )
  );
