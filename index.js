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
   ENVIRONMENT
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
   ALL SELECTIONS
========================================================= */

const ALL_SELECTIONS = {
  ...ROLES,
  ...LANES
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
   RENDER HEALTH SERVER
========================================================= */

http
  .createServer((req, res) => {
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
  })
  .listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `🌐 Render Health Server running on port ${PORT}`
      );
    }
  );

/* =========================================================
   USER SESSIONS
========================================================= */

/*
   A session stores the UI state for each user.

   This is what makes rapid tapping reliable.

   Discord is the persistent source of truth.
   The session is the temporary UI state while the popup
   is open.
*/

const sessions = new Map();

/* =========================================================
   USER QUEUES
========================================================= */

const queues = new Map();

function queueForUser(userId, task) {
  const previous =
    queues.get(userId) ||
    Promise.resolve();

  const next =
    previous.then(task, task);

  queues.set(userId, next);

  next.finally(() => {
    if (queues.get(userId) === next) {
      queues.delete(userId);
    }
  }).catch(() => {});

  return next;
}

/* =========================================================
   SESSION CREATION
========================================================= */

async function createSession(
  interaction,
  type
) {
  const member =
    await interaction.guild.members.fetch({
      user: interaction.user.id,
      force: true
    });

  const data =
    type === 'role'
      ? ROLES
      : LANES;

  const selected =
    new Set();

  for (const id of Object.keys(data)) {
    const roleId =
      ROLE_IDS[id];

    if (
      roleId &&
      member.roles.cache.has(roleId)
    ) {
      selected.add(id);
    }
  }

  const session = {
    type,
    selected,
    interaction
  };

  sessions.set(
    interaction.user.id,
    session
  );

  return session;
}

/* =========================================================
   SESSION CLEANUP
========================================================= */

function closeSession(userId) {
  sessions.delete(userId);
}

/* =========================================================
   SELECTED OPTIONS
========================================================= */

function selectedOptions(
  data,
  selected
) {
  return Object.entries(data)
    .filter(([id]) =>
      selected.has(id)
    )
    .map(([, option]) => option);
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
          'lampoon_open_roles'
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
          'lampoon_open_lanes'
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

function popupEmbed(
  session
) {
  const data =
    session.type === 'role'
      ? ROLES
      : LANES;

  const title =
    session.type === 'role'
      ? '⚔️ CHOOSE YOUR ROLE'
      : '🛣️ CHOOSE YOUR LANE';

  const section =
    session.type === 'role'
      ? 'Hero Roles'
      : 'Lanes';

  const color =
    session.type === 'role'
      ? 0xC0C0C0
      : 0xD4AF37;

  const selected =
    selectedOptions(
      data,
      session.selected
    );

  const body =
    Object.entries(data)
      .map(([, option]) =>
        `${option.emoji} **${option.name}**\n` +
        `> ${option.description}`
      )
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
              .map(
                option =>
                  `${option.emoji} **${option.name}**`
              )
              .join(' • ')
          : 'None selected.'
      }`
    )
    .setFooter({
      text:
        'Click an option to add or remove it.'
    });
}

/* =========================================================
   OPTION BUTTONS
========================================================= */

function optionButtons(
  session
) {
  const data =
    session.type === 'role'
      ? ROLES
      : LANES;

  const prefix =
    session.type === 'role'
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

    entries
      .slice(i, i + 2)
      .forEach(
        ([id, option]) => {

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
                session.selected.has(id)
                  ? ButtonStyle.Success
                  : ButtonStyle.Secondary
              )
          );
        }
      );

    rows.push(row);
  }

  rows.push(
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(
            session.type === 'role'
              ? 'lampoon_close_role'
              : 'lampoon_close_lane'
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
   SEND / FIND MAIN PANEL
========================================================= */

async function sendOrFindPanel() {
  try {
    if (!ROLE_LANE_CHANNEL_ID) {
      console.error(
        '❌ ROLE_LANE_CHANNEL_ID is missing.'
      );
      return;
    }

    const channel =
      await client.channels.fetch(
        ROLE_LANE_CHANNEL_ID,
        { force: true }
      );

    if (
      !channel ||
      !channel.isTextBased()
    ) {
      console.error(
        '❌ Role & Lane channel is invalid.'
      );
      return;
    }

    console.log(
      `📍 Role & Lane channel: #${channel.name} (${channel.id})`
    );

    const permissions =
      channel.permissionsFor(
        client.user
      );

    if (
      !permissions ||
      !permissions.has('ViewChannel') ||
      !permissions.has('SendMessages') ||
      !permissions.has('EmbedLinks')
    ) {
      console.error(
        '❌ Bot needs View Channel, Send Messages and Embed Links.'
      );
      return;
    }

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
      console.log(
        `✅ Existing Role & Lane panel found: ${existing.id}`
      );
      return;
    }

    const panel =
      await channel.send({
        embeds: [
          mainEmbed()
        ],
        components: [
          mainButtons()
        ]
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
   INTERACTIONS
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

          const member =
            await interaction.guild.members.fetch({
              user: interaction.user.id,
              force: true
            });

          const roleSelected =
            selectedOptions(
              ROLES,
              new Set(
                Object.keys(ROLES)
                  .filter(id =>
                    member.roles.cache.has(
                      ROLE_IDS[id]
                    )
                  )
              )
            );

          const laneSelected =
            selectedOptions(
              LANES,
              new Set(
                Object.keys(LANES)
                  .filter(id =>
                    member.roles.cache.has(
                      ROLE_IDS[id]
                    )
                  )
              )
            );

          return interaction.reply({
            flags:
              MessageFlags.Ephemeral,

            embeds: [
              new EmbedBuilder()
                .setColor(0x3299DB)
                .setTitle(
                  '📋 YOUR LAMPOON SELECTION'
                )
                .setDescription(

                  `**⚔️ Hero Roles**\n` +

                  (
                    roleSelected.length
                      ? roleSelected
                          .map(
                            option =>
                              `${option.emoji} **${option.name}**`
                          )
                          .join('\n')
                      : 'None selected.'
                  ) +

                  `\n\n**🛣️ Lanes**\n` +

                  (
                    laneSelected.length
                      ? laneSelected
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

          await queueForUser(
            interaction.user.id,
            async () => {

              const member =
                await interaction.guild.members.fetch({
                  user: interaction.user.id,
                  force: true
                });

              const ids =
                Object.keys(ALL_SELECTIONS)
                  .map(
                    id => ROLE_IDS[id]
                  )
                  .filter(Boolean)
                  .filter(
                    id =>
                      member.roles.cache.has(id)
                  );

              if (ids.length) {
                await member.roles.remove(ids);
              }
            }
          );

          closeSession(
            interaction.user.id
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
         BUTTONS ONLY
      ===================================================== */

      if (!interaction.isButton()) {
        return;
      }

      /* =====================================================
         OPEN ROLE POPUP

         Acknowledge immediately, then fetch the member.
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_open_roles'
      ) {

        await interaction.deferReply({
          flags:
            MessageFlags.Ephemeral
        });

        const session =
          await createSession(
            interaction,
            'role'
          );

        session.interaction =
          interaction;

        return interaction.editReply({
          embeds: [
            popupEmbed(session)
          ],
          components:
            optionButtons(session)
        });
      }

      /* =====================================================
         OPEN LANE POPUP
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_open_lanes'
      ) {

        await interaction.deferReply({
          flags:
            MessageFlags.Ephemeral
        });

        const session =
          await createSession(
            interaction,
            'lane'
          );

        session.interaction =
          interaction;

        return interaction.editReply({
          embeds: [
            popupEmbed(session)
          ],
          components:
            optionButtons(session)
        });
      }

      /* =====================================================
         DONE
      ===================================================== */

      if (
        interaction.customId ===
        'lampoon_close_role' ||
        interaction.customId ===
        'lampoon_close_lane'
      ) {

        await interaction.update({
          content:
            interaction.customId ===
            'lampoon_close_role'
              ? '✅ **Role selection saved.**\nYou can click ⚔️ **Choose Role** again anytime.'
              : '✅ **Lane selection saved.**\nYou can click 🛣️ **Choose Lane** again anytime.',

          embeds: [],

          components: []
        }).catch(() => {});

        closeSession(
          interaction.user.id
        );

        return;
      }

      /* =====================================================
         ROLE / LANE BUTTON
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

      /* =====================================================
         ACKNOWLEDGE IMMEDIATELY

         Nothing goes before this.
      ===================================================== */

      await interaction.deferUpdate()
        .catch(() => {
          return;
        });

      /* =====================================================
         GET SESSION
      ===================================================== */

      let session =
        sessions.get(
          interaction.user.id
        );

      /*
         If the bot restarted while the popup was open,
         rebuild the session from Discord.
      */

      if (
        !session ||
        session.type !==
          (isRole ? 'role' : 'lane')
      ) {

        const member =
          await interaction.guild.members.fetch({
            user: interaction.user.id,
            force: true
          });

        const data =
          isRole
            ? ROLES
            : LANES;

        session = {
          type:
            isRole
              ? 'role'
              : 'lane',

          selected:
            new Set(
              Object.keys(data)
                .filter(id =>
                  member.roles.cache.has(
                    ROLE_IDS[id]
                  )
                )
            ),

          interaction
        };

        sessions.set(
          interaction.user.id,
          session
        );
      }

      session.interaction =
        interaction;

      /* =====================================================
         GET EXACT CLICKED ID
      ===================================================== */

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
         TOGGLE EXACT BUTTON

         This happens synchronously in memory.

         Rapid clicks therefore cannot overwrite each
         other's UI state.
      ===================================================== */

      if (
        session.selected.has(id)
      ) {
        session.selected.delete(id);
      } else {
        session.selected.add(id);
      }

      const desired =
        session.selected.has(id);

      /* =====================================================
         UPDATE SAME POPUP IMMEDIATELY
      ===================================================== */

      await interaction.editReply({
        embeds: [
          popupEmbed(session)
        ],

        components:
          optionButtons(session)
      }).catch(() => {});

      console.log(
        `[CLICK] ${interaction.user.id} ${interaction.customId} -> ${desired ? 'ON' : 'OFF'}`
      );

      /* =====================================================
         QUEUE ACTUAL ROLE CHANGE
      ===================================================== */

      void queueForUser(
        interaction.user.id,
        async () => {

          try {

            const member =
              await interaction.guild.members.fetch({
                user: interaction.user.id,
                force: true
              });

            const actual =
              member.roles.cache.has(
                roleId
              );

            /*
             * Set the role to the desired state.
             *
             * We DO NOT blindly toggle here.
             * That is the important protection against
             * rapid-click corruption.
             */

            if (
              actual !== desired
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
              `[ROLE] ${interaction.user.id} ${data[id].name} = ${desired ? 'ON' : 'OFF'}`
            );

            /* ---------------------------------------------
               LOG
            --------------------------------------------- */

            const finalMember =
              await interaction.guild.members.fetch({
                user: interaction.user.id,
                force: true
              });

            const selected =
              selectedOptions(
                data,
                new Set(
                  Object.keys(data)
                    .filter(optionId =>
                      finalMember.roles.cache.has(
                        ROLE_IDS[optionId]
                      )
                    )
                )
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

          } catch (error) {

            console.error(
              `❌ Failed to update ${data[id].name}:`,
              error
            );
          }
        }
      );

      return;

    } catch (error) {

      console.error(
        '❌ Interaction error:',
        error
      );

      /*
       * Never try to acknowledge an interaction a second time.
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
        // Ignore secondary interaction errors.
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
    )
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
