const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  MessageFlags
} = require('discord.js');

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).send('LAMPOON Role & Lane Bot is online.');
});

app.listen(PORT, () => {
  console.log(`🌐 Health server running on port ${PORT}`);
});

// ==============================
// ENVIRONMENT VARIABLES
// ==============================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const ROLE_LANE_CHANNEL_ID =
  process.env.ROLE_LANE_CHANNEL_ID;

const LOG_CHANNEL_ID =
  process.env.LOG_CHANNEL_ID;

const LAMPOON_GIF_URL =
  process.env.LAMPOON_GIF_URL;

// ==============================
// ROLE IDs
// ==============================

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

// ==============================
// ROLE DATA
// ==============================

const HERO_ROLES = {
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

// ==============================
// CLIENT
// ==============================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// ==============================
// MAIN PUBLIC EMBED
// ==============================

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

// ==============================
// MAIN BUTTONS
// ==============================

function mainButtons() {
  return [
    new ActionRowBuilder().addComponents(
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
    )
  ];
}

// ==============================
// PRIVATE SELECTION EMBED
// ==============================

function selectionEmbed(member, data, title, section) {
  const selected = Object.entries(data)
    .filter(([id]) => {
      const roleId = ROLE_IDS[id];

      return (
        roleId &&
        member.roles.cache.has(roleId)
      );
    })
    .map(([, info]) =>
      `${info.emoji} **${info.name}**`
    );

  const body = Object.entries(data)
    .map(
      ([, info]) =>
        `${info.emoji} **${info.name}**\n> ${info.description}`
    )
    .join('\n\n');

  return new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle(title)
    .setDescription(
      `Select the ${section} you are comfortable playing in-game.\n\n` +
      `╭──────────── ${
        section === 'Hero Roles'
          ? '⚔️'
          : '🛣️'
      } ${section.toUpperCase()} ────────────╮\n\n` +
      `${body}\n\n` +
      `╰────────────────────────────────────╯\n\n` +
      `✦ **CURRENTLY SELECTED** ✦\n` +
      `${
        selected.length
          ? selected.join(' • ')
          : 'None selected.'
      }`
    )
    .setFooter({
      text: 'Click an option to add or remove it.'
    });
}

// ==============================
// SELECTION BUTTONS
// ==============================

function selectionButtons(
  member,
  data,
  prefix,
  doneId,
  columns
) {
  const rows = [];
  let row = new ActionRowBuilder();

  let count = 0;

  for (const [id, info] of Object.entries(data)) {
    const roleId = ROLE_IDS[id];

    const selected =
      roleId &&
      member.roles.cache.has(roleId);

    const button = new ButtonBuilder()
      .setCustomId(`${prefix}_${id}`)
      .setLabel(info.name)
      .setEmoji(info.emoji)
      .setStyle(
        selected
          ? ButtonStyle.Success
          : ButtonStyle.Secondary
      );

    row.addComponents(button);
    count++;

    if (count === columns) {
      rows.push(row);
      row = new ActionRowBuilder();
      count = 0;
    }
  }

  if (count > 0) {
    rows.push(row);
  }

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(doneId)
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Primary)
    )
  );

  return rows;
}

// ==============================
// LOGGING
// ==============================

async function sendLog(guild, member, action, role) {
  try {
    if (!LOG_CHANNEL_ID) return;

    const channel =
      await guild.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null);

    if (!channel || !channel.isTextBased()) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(
        action === 'Added'
          ? 0x57F287
          : 0xED4245
      )
      .setTitle('LAMPOON Role Update')
      .setDescription(
        `${member} **${action}** ${role}`
      )
      .setTimestamp();

    await channel.send({
      embeds: [embed]
    });
  } catch (error) {
    console.error(
      '❌ Log error:',
      error
    );
  }
}

// ==============================
// SAFE INTERACTION ERROR
// ==============================

async function safeInteractionError(
  interaction,
  message
) {
  try {
    if (!interaction.isRepliable()) {
      return;
    }

    if (
      interaction.replied ||
      interaction.deferred
    ) {
      await interaction
        .editReply({
          content: message
        })
        .catch(() => {});

      return;
    }

    await interaction
      .reply({
        flags: MessageFlags.Ephemeral,
        content: message
      })
      .catch(() => {});
  } catch {}
}

// ==============================
// ROLE SELECTION QUEUE
// ==============================

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

  next
    .finally(() => {
      if (
        selectionQueues.get(userId) === next
      ) {
        selectionQueues.delete(userId);
      }
    })
    .catch(() => {});

  return next;
}

// ==============================
// PANEL
// ==============================

async function sendOrFindPanel() {
  try {
    const channel =
      await client.channels
        .fetch(ROLE_LANE_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.error(
        '❌ ROLE_LANE_CHANNEL_ID is not a text channel.'
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
          message.author.id === client.user.id &&
          message.embeds[0]?.title ===
            '⚔️ ROLE & 🛣️ LANE SELECTION'
      );

    if (existing) {
      await existing.edit({
        embeds: [mainEmbed()],
        components: mainButtons()
      });

      console.log(
        '✅ Existing Role & Lane panel updated.'
      );

      return;
    }

    await channel.send({
      embeds: [mainEmbed()],
      components: mainButtons()
    });

    console.log(
      '✅ New Role & Lane panel sent.'
    );
  } catch (error) {
    console.error(
      '❌ Panel error:',
      error
    );
  }
}

// ==============================
// READY
// ==============================

client.once('clientReady', async () => {
  console.log(
    `✅ Logged in as ${client.user.tag}`
  );

  try {
    const guild =
      await client.guilds.fetch(GUILD_ID);

    const commands = [
      new SlashCommandBuilder()
        .setName('my-selection')
        .setDescription(
          'View your current Role & Lane selection.'
        ),

      new SlashCommandBuilder()
        .setName('reset-selection')
        .setDescription(
          'Reset all your Role & Lane selections.'
        )
    ];

    await guild.commands.set(
      commands.map(command =>
        command.toJSON()
      )
    );

    console.log(
      '✅ Slash commands registered.'
    );
  } catch (error) {
    console.error(
      '❌ Slash command registration error:',
      error
    );
  }

  await sendOrFindPanel();
});

// ==============================
// INTERACTIONS
// ==============================

client.on(
  'interactionCreate',
  async interaction => {
    try {
      // ============================
      // SLASH COMMANDS
      // ============================

      if (interaction.isChatInputCommand()) {
        if (
          interaction.commandName ===
          'my-selection'
        ) {
          const member =
            await interaction.guild.members.fetch(
              interaction.user.id
            );

          const roles = Object.entries(
            HERO_ROLES
          )
            .filter(
              ([id]) =>
                ROLE_IDS[id] &&
                member.roles.cache.has(
                  ROLE_IDS[id]
                )
            )
            .map(
              ([, info]) =>
                `${info.emoji} ${info.name}`
            );

          const lanes = Object.entries(
            LANES
          )
            .filter(
              ([id]) =>
                ROLE_IDS[id] &&
                member.roles.cache.has(
                  ROLE_IDS[id]
                )
            )
            .map(
              ([, info]) =>
                `${info.emoji} ${info.name}`
            );

          const embed =
            new EmbedBuilder()
              .setColor(0x3299DB)
              .setTitle(
                '✦ YOUR LAMPOON SELECTION ✦'
              )
              .addFields(
                {
                  name: '⚔️ Hero Roles',
                  value:
                    roles.length
                      ? roles.join('\n')
                      : 'None selected.'
                },
                {
                  name: '🛣️ Lanes',
                  value:
                    lanes.length
                      ? lanes.join('\n')
                      : 'None selected.'
                }
              );

          await interaction.reply({
            flags: MessageFlags.Ephemeral,
            embeds: [embed]
          });

          return;
        }

        if (
          interaction.commandName ===
          'reset-selection'
        ) {
          const member =
            await interaction.guild.members.fetch(
              interaction.user.id
            );

          const allRoles = [
            ...Object.values(HERO_ROLES),
            ...Object.values(LANES)
          ];

          let removed = 0;

          for (const info of allRoles) {
            const id =
              Object.keys({
                ...HERO_ROLES,
                ...LANES
              }).find(
                key =>
                  (
                    HERO_ROLES[key] ||
                    LANES[key]
                  ) === info
              );

            if (!id) continue;

            const roleId = ROLE_IDS[id];

            if (
              roleId &&
              member.roles.cache.has(roleId)
            ) {
              await member.roles
                .remove(roleId)
                .catch(() => {});

              removed++;
            }
          }

          await interaction.reply({
            flags: MessageFlags.Ephemeral,
            content:
              removed > 0
                ? `✅ Removed **${removed}** Role/Lane selection(s).`
                : 'ℹ️ You had no Role/Lane selections.'
          });

          return;
        }
      }

      // ============================
      // OPEN HERO ROLES
      // ============================

      if (
        interaction.isButton() &&
        interaction.customId ===
          'lampoon_open_roles'
      ) {
        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        await interaction.reply({
          flags: MessageFlags.Ephemeral,
          embeds: [
            selectionEmbed(
              member,
              HERO_ROLES,
              '⚔️ CHOOSE YOUR HERO ROLES',
              'Hero Roles'
            )
          ],
          components:
            selectionButtons(
              member,
              HERO_ROLES,
              'lampoon_role',
              'lampoon_roles_done',
              3
            )
        });

        return;
      }

      // ============================
      // OPEN LANES
      // ============================

      if (
        interaction.isButton() &&
        interaction.customId ===
          'lampoon_open_lanes'
      ) {
        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        await interaction.reply({
          flags: MessageFlags.Ephemeral,
          embeds: [
            selectionEmbed(
              member,
              LANES,
              '🛣️ CHOOSE YOUR LANES',
              'Lanes'
            )
          ],
          components:
            selectionButtons(
              member,
              LANES,
              'lampoon_lane',
              'lampoon_lanes_done',
              2
            )
        });

        return;
      }

      // ============================
      // DONE BUTTONS
      // ============================

      if (
        interaction.isButton() &&
        (
          interaction.customId ===
            'lampoon_roles_done' ||
          interaction.customId ===
            'lampoon_lanes_done'
        )
      ) {
        await interaction.update({
          content: '✅ Selection saved.',
          embeds: [],
          components: []
        });

        return;
      }

      // ============================
      // ROLE / LANE BUTTONS
      // ============================

      if (
        interaction.isButton() &&
        (
          interaction.customId.startsWith(
            'lampoon_role_'
          ) ||
          interaction.customId.startsWith(
            'lampoon_lane_'
          )
        )
      ) {
        const isRole =
          interaction.customId.startsWith(
            'lampoon_role_'
          );

        const prefix = isRole
          ? 'lampoon_role_'
          : 'lampoon_lane_';

        const id =
          interaction.customId.slice(
            prefix.length
          );

        const data = isRole
          ? HERO_ROLES
          : LANES;

        if (!data[id]) {
          return;
        }

        await queueSelection(
          interaction.user.id,
          async () => {
            const member =
              await interaction.guild.members.fetch(
                interaction.user.id
              );

            const roleId = ROLE_IDS[id];

            if (!roleId) {
              await safeInteractionError(
                interaction,
                '❌ This role is not configured.'
              );

              return;
            }

            const hasRole =
              member.roles.cache.has(roleId);

            if (hasRole) {
              await member.roles.remove(
                roleId
              );

              await sendLog(
                interaction.guild,
                member,
                'Removed',
                data[id].name
              );
            } else {
              await member.roles.add(
                roleId
              );

              await sendLog(
                interaction.guild,
                member,
                'Added',
                data[id].name
              );
            }

            const freshMember =
              await interaction.guild.members.fetch(
                interaction.user.id
              );

            await interaction.update({
              embeds: [
                selectionEmbed(
                  freshMember,
                  data,
                  isRole
                    ? '⚔️ CHOOSE YOUR HERO ROLES'
                    : '🛣️ CHOOSE YOUR LANES',
                  isRole
                    ? 'Hero Roles'
                    : 'Lanes'
                )
              ],
              components:
                selectionButtons(
                  freshMember,
                  data,
                  prefix.replace(/_$/, ''),
                  isRole
                    ? 'lampoon_roles_done'
                    : 'lampoon_lanes_done',
                  isRole ? 3 : 2
                )
            });
          }
        );
      }
    } catch (error) {
      console.error(
        '❌ Interaction error:',
        error
      );

      await safeInteractionError(
        interaction,
        '❌ Something went wrong. Please try again.'
      );
    }
  }
);

// ==============================
// DISCORD ERRORS
// ==============================

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

// ==============================
// LOGIN
// ==============================

client
  .login(TOKEN)
  .catch(error =>
    console.error(
      '❌ Discord login failed:',
      error
    )
  );
