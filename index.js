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

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const ROLE_LANE_CHANNEL_ID = process.env.ROLE_LANE_CHANNEL_ID;
const LAMPOON_GIF_URL = process.env.LAMPOON_GIF_URL;

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

/* =========================
   DESCRIPTION ANIMATED EMOJI
========================= */

const DETAIL_EMOJI =
  '<a:Avisala:1542448826265243660>';

/* =========================
   HERO ROLES
========================= */

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

/* =========================
   LANES
========================= */

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

/* =========================
   CLIENT
========================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

/* =========================
   RENDER HEALTH SERVER
========================= */

const PORT = Number(process.env.PORT) || 10000;

http
  .createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type':
        'text/plain; charset=utf-8'
    });

    res.end(
      req.url === '/health'
        ? 'OK'
        : 'LAMPOON Role & Lane Bot is online.'
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

/* =========================
   PUBLIC MAIN EMBED
========================= */

function mainEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle(
      '⚔️ ROLE & 🛣️ LANE SELECTION'
    )
    .setDescription(
      '**Your selection automatically updates your LAMPOON Discord roles.**\n\n' +

      '◀ **Role**\n' +
      'Choose one or more Hero Roles you are comfortable playing in-game.\n\n' +

      '▶ **Lane**\n' +
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

/* =========================
   PUBLIC MAIN BUTTONS
========================= */

function mainButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          'lampoon_open_roles'
        )
        .setLabel('Choose Role')
        .setEmoji('◀')
        .setStyle(
          ButtonStyle.Secondary
        ),

      new ButtonBuilder()
        .setCustomId(
          'lampoon_open_lanes'
        )
        .setLabel('Choose Lane')
        .setEmoji('▶')
        .setStyle(
          ButtonStyle.Secondary
        )
    )
  ];
}

/* =========================
   PRIVATE ROLE EMBED
========================= */

function roleEmbed(member) {
  const selected =
    Object.entries(ROLES)
      .filter(
        ([id]) =>
          ROLE_IDS[id] &&
          member.roles.cache.has(
            ROLE_IDS[id]
          )
      )
      .map(
        ([, x]) =>
          `${x.emoji} **${x.name}**`
      );

  const body =
    Object.values(ROLES)
      .map(
        x =>
          `${x.emoji} **${x.name}**\n` +
          `${DETAIL_EMOJI} ${x.description}`
      )
      .join('\n\n');

  return new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle('⚔️ ROLE SELECTION')
    .setDescription(
      `${body}\n\n` +

      `✦ **CURRENTLY SELECTED** ✦\n` +

      `${
        selected.length
          ? selected.join(' • ')
          : 'None selected.'
      }`
    )
    .setFooter({
      text:
        'Select your roles, then press Done.'
    });
}

/* =========================
   PRIVATE LANE EMBED
========================= */

function laneEmbed(member) {
  const selected =
    Object.entries(LANES)
      .filter(
        ([id]) =>
          ROLE_IDS[id] &&
          member.roles.cache.has(
            ROLE_IDS[id]
          )
      )
      .map(
        ([, x]) =>
          `${x.emoji} **${x.name}**`
      );

  const body =
    Object.values(LANES)
      .map(
        x =>
          `${x.emoji} **${x.name}**\n` +
          `${DETAIL_EMOJI} ${x.description}`
      )
      .join('\n\n');

  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🛣️ LANE SELECTION')
    .setDescription(
      `${body}\n\n` +

      `✦ **CURRENTLY SELECTED** ✦\n` +

      `${
        selected.length
          ? selected.join(' • ')
          : 'None selected.'
      }`
    )
    .setFooter({
      text:
        'Select your lanes, then press Done.'
    });
}

/* =========================
   PRIVATE ROLE BUTTONS

   Fighter | Tank
   Assassin | Mage
   Marksman | Support
   Done
========================= */

function roleButtons(member) {
  const rows = [];
  const entries =
    Object.entries(ROLES);

  for (
    let i = 0;
    i < entries.length;
    i += 2
  ) {
    const row =
      new ActionRowBuilder();

    for (
      const [id, x]
      of entries.slice(i, i + 2)
    ) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(
            `lampoon_role_${id}`
          )
          .setLabel(x.name)
          .setEmoji(x.emoji)
          .setStyle(
            ROLE_IDS[id] &&
            member.roles.cache.has(
              ROLE_IDS[id]
            )
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
            'lampoon_close_role_popup'
          )
          .setLabel('Done')
          .setEmoji('↩️')
          .setStyle(
            ButtonStyle.Primary
          )
      )
  );

  return rows;
}

/* =========================
   PRIVATE LANE BUTTONS

   Clashlane | Jungler
   Midlane   | Farmlane
   Roamer    | Versatile
   Done
========================= */

function laneButtons(member) {
  const rows = [];
  const entries =
    Object.entries(LANES);

  for (
    let i = 0;
    i < entries.length;
    i += 2
  ) {
    const row =
      new ActionRowBuilder();

    for (
      const [id, x]
      of entries.slice(i, i + 2)
    ) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(
            `lampoon_lane_${id}`
          )
          .setLabel(x.name)
          .setEmoji(x.emoji)
          .setStyle(
            ROLE_IDS[id] &&
            member.roles.cache.has(
              ROLE_IDS[id]
            )
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
            'lampoon_close_lane_popup'
          )
          .setLabel('Done')
          .setEmoji('↩️')
          .setStyle(
            ButtonStyle.Primary
          )
      )
  );

  return rows;
}

/* =========================
   LOGGING
========================= */

async function sendLog(embed) {
  if (!LOG_CHANNEL_ID) return;

  try {
    const channel =
      await client.channels.fetch(
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

/* =========================
   FIND OLD PUBLIC PANEL

   The existing public message
   is reused. No duplicate panel.
========================= */

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
        ROLE_LANE_CHANNEL_ID
      );

    if (!channel?.isTextBased()) {
      console.error(
        '❌ Role & Lane channel is invalid.'
      );
      return;
    }

    const messages =
      await channel.messages.fetch({
        limit: 100
      });

    const existing =
      messages.find(
        message =>
          message.author.id ===
            client.user.id &&
          [
            '⚔️ ROLE & 🛣️ LANE SELECTION',
            '⚔️ ROLE SELECTION',
            '🛣️ LANE SELECTION'
          ].includes(
            message.embeds[0]?.title
          )
      );

    if (existing) {
      await existing.edit({
        embeds: [mainEmbed()],
        components: mainButtons()
      });

      console.log(
        `✅ Existing public panel reused: ${existing.id}`
      );

      return;
    }

    const panel =
      await channel.send({
        embeds: [mainEmbed()],
        components: mainButtons()
      });

    console.log(
      `✅ New public panel sent: ${panel.id}`
    );
  } catch (error) {
    console.error(
      '❌ FAILED TO SEND ROLE & LANE PANEL:',
      error
    );
  }
}

/* =========================
   SLASH COMMANDS
========================= */

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

/* =========================
   READY
========================= */

client.once(
  'clientReady',
  async () => {
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
  }
);

/* =========================
   INTERACTIONS
========================= */

client.on(
  'interactionCreate',
  async interaction => {
    try {
      /* =====================
         SLASH COMMANDS
      ===================== */

      if (
        interaction.isChatInputCommand()
      ) {
        const member =
          interaction.member;

        /* MY SELECTION */

        if (
          interaction.commandName ===
          'my-selection'
        ) {
          const roles =
            Object.entries(ROLES)
              .filter(
                ([id]) =>
                  ROLE_IDS[id] &&
                  member.roles.cache.has(
                    ROLE_IDS[id]
                  )
              )
              .map(
                ([, x]) =>
                  `${x.emoji} **${x.name}**`
              );

          const lanes =
            Object.entries(LANES)
              .filter(
                ([id]) =>
                  ROLE_IDS[id] &&
                  member.roles.cache.has(
                    ROLE_IDS[id]
                  )
              )
              .map(
                ([, x]) =>
                  `${x.emoji} **${x.name}**`
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
                  `${
                    roles.length
                      ? roles.join('\n')
                      : 'None selected.'
                  }\n\n` +

                  `**🛣️ Lanes**\n` +
                  `${
                    lanes.length
                      ? lanes.join('\n')
                      : 'None selected.'
                  }`
                )
            ]
          });
        }

        /* RESET SELECTION */

        if (
          interaction.commandName ===
          'reset-selection'
        ) {
          const ids = [
            ...Object.keys(ROLES),
            ...Object.keys(LANES)
          ]
            .map(
              key => ROLE_IDS[key]
            )
            .filter(
              id =>
                id &&
                member.roles.cache.has(id)
            );

          if (ids.length) {
            await member.roles.remove(
              ids
            );
          }

          await sendLog(
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

          return interaction.reply({
            flags:
              MessageFlags.Ephemeral,

            content:
              '✅ Your Hero Roles and Lanes have been reset.'
          });
        }

        return;
      }

      if (!interaction.isButton()) {
        return;
      }

      /* =====================
         OPEN PRIVATE ROLE
         SELECTOR
      ===================== */

      if (
        interaction.customId ===
        'lampoon_open_roles'
      ) {
        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        return interaction.reply({
          flags:
            MessageFlags.Ephemeral,

          embeds: [
            roleEmbed(member)
          ],

          components:
            roleButtons(member)
        });
      }

      /* =====================
         OPEN PRIVATE LANE
         SELECTOR
      ===================== */

      if (
        interaction.customId ===
        'lampoon_open_lanes'
      ) {
        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        return interaction.reply({
          flags:
            MessageFlags.Ephemeral,

          embeds: [
            laneEmbed(member)
          ],

          components:
            laneButtons(member)
        });
      }

      /* =====================
         DONE ROLE
      ===================== */

      if (
        interaction.customId ===
        'lampoon_close_role_popup'
      ) {
        await interaction.deferUpdate();

        return interaction.editReply({
          content:
            '✅ Role selection saved.',
          embeds: [],
          components: []
        });
      }

      /* =====================
         DONE LANE
      ===================== */

      if (
        interaction.customId ===
        'lampoon_close_lane_popup'
      ) {
        await interaction.deferUpdate();

        return interaction.editReply({
          content:
            '✅ Lane selection saved.',
          embeds: [],
          components: []
        });
      }

      /* =====================
         ROLE BUTTON
      ===================== */

      if (
        interaction.customId.startsWith(
          'lampoon_role_'
        )
      ) {
        await interaction.deferUpdate();

        const id =
          interaction.customId.replace(
            'lampoon_role_',
            ''
          );

        const roleData =
          ROLES[id];

        const roleId =
          ROLE_IDS[id];

        if (
          !roleData ||
          !roleId
        ) {
          return interaction.editReply({
            content:
              '❌ This role is not configured correctly.'
          });
        }

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        const hasRole =
          member.roles.cache.has(
            roleId
          );

        try {
          if (hasRole) {
            await member.roles.remove(
              roleId
            );
          } else {
            await member.roles.add(
              roleId
            );
          }

          const fresh =
            await interaction.guild.members.fetch(
              interaction.user.id
            );

          await interaction.editReply({
            content: '',
            embeds: [
              roleEmbed(fresh)
            ],
            components:
              roleButtons(fresh)
          });

          const selected =
            Object.entries(ROLES)
              .filter(
                ([key]) =>
                  ROLE_IDS[key] &&
                  fresh.roles.cache.has(
                    ROLE_IDS[key]
                  )
              )
              .map(
                ([, x]) => x.name
              );

          await sendLog(
            new EmbedBuilder()
              .setColor(0xC0C0C0)
              .setTitle(
                '⚔️ HERO ROLE UPDATED'
              )
              .setDescription(
                `${interaction.user} ${
                  hasRole
                    ? 'removed'
                    : 'selected'
                } a Hero Role.\n\n` +

                `**Selected:** ${
                  selected.length
                    ? selected.join(', ')
                    : 'None'
                }`
              )
              .setTimestamp()
          );
        } catch (error) {
          console.error(
            '❌ Role update failed:',
            error
          );

          await interaction.editReply({
            content:
              '❌ I could not update that role. Please check my **Manage Roles** permission and role hierarchy.'
          }).catch(() => {});
        }

        return;
      }

      /* =====================
         LANE BUTTON
      ===================== */

      if (
        interaction.customId.startsWith(
          'lampoon_lane_'
        )
      ) {
        await interaction.deferUpdate();

        const id =
          interaction.customId.replace(
            'lampoon_lane_',
            ''
          );

        const laneData =
          LANES[id];

        const roleId =
          ROLE_IDS[id];

        if (
          !laneData ||
          !roleId
        ) {
          return interaction.editReply({
            content:
              '❌ This lane is not configured correctly.'
          });
        }

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        const hasRole =
          member.roles.cache.has(
            roleId
          );

        try {
          if (hasRole) {
            await member.roles.remove(
              roleId
            );
          } else {
            await member.roles.add(
              roleId
            );
          }

          const fresh =
            await interaction.guild.members.fetch(
              interaction.user.id
            );

          await interaction.editReply({
            content: '',
            embeds: [
              laneEmbed(fresh)
            ],
            components:
              laneButtons(fresh)
          });

          const selected =
            Object.entries(LANES)
              .filter(
                ([key]) =>
                  ROLE_IDS[key] &&
                  fresh.roles.cache.has(
                    ROLE_IDS[key]
                  )
              )
              .map(
                ([, x]) => x.name
              );

          await sendLog(
            new EmbedBuilder()
              .setColor(0xFFD700)
              .setTitle(
                '🛣️ LANE UPDATED'
              )
              .setDescription(
                `${interaction.user} ${
                  hasRole
                    ? 'removed'
                    : 'selected'
                } a Lane.\n\n` +

                `**Selected:** ${
                  selected.length
                    ? selected.join(', ')
                    : 'None'
                }`
              )
              .setTimestamp()
          );
        } catch (error) {
          console.error(
            '❌ Lane update failed:',
            error
          );

          await interaction.editReply({
            content:
              '❌ I could not update that lane role. Please check my **Manage Roles** permission and role hierarchy.'
          }).catch(() => {});
        }

        return;
      }

    } catch (error) {
      console.error(
        '❌ Interaction error:',
        error
      );

      if (
        !interaction.replied &&
        !interaction.deferred
      ) {
        await interaction.reply({
          flags:
            MessageFlags.Ephemeral,

          content:
            '❌ Something went wrong. Please check my **Manage Roles** permission and role hierarchy.'
        }).catch(() => {});
      }
    }
  }
);

/* =========================
   ERROR HANDLERS
========================= */

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

/* =========================
   LOGIN
========================= */

client
  .login(TOKEN)
  .catch(error =>
    console.error(
      '❌ Discord login failed:',
      error
    )
  );
