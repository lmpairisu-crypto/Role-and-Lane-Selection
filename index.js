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

// ==============================
// ENVIRONMENT
// ==============================

const TOKEN =
  process.env.DISCORD_TOKEN;

const CLIENT_ID =
  process.env.CLIENT_ID;

const GUILD_ID =
  process.env.GUILD_ID;

const ROLE_LANE_CHANNEL_ID =
  process.env.ROLE_LANE_CHANNEL_ID;

const LOG_CHANNEL_ID =
  process.env.LOG_CHANNEL_ID;

const LAMPOON_GIF_URL =
  process.env.LAMPOON_GIF_URL;

// ==============================
// ROLE IDS
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
// HERO ROLES
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

// ==============================
// LANES
// ==============================

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
// RENDER HEALTH SERVER
// ==============================

const PORT =
  Number(process.env.PORT) || 10000;

http
  .createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type':
        'text/plain; charset=utf-8'
    });

    if (req.url === '/health') {
      res.end(
        'LAMPOON Role & Lane Bot is online.'
      );
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
        `🌐 Health server running on port ${PORT}`
      );
    }
  );

// ==============================
// MAIN PUBLIC EMBED
// ==============================

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

        '🔒 **Your selections are private to you.**\n' +
        'Other members cannot see your selected Roles or Lanes.\n\n' +

        'You can change your selections anytime.'
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

// ==============================
// MAIN PUBLIC BUTTONS
// ==============================

function mainButtons() {
  return [
    new ActionRowBuilder()
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
      )
  ];
}

// ==============================
// PRIVATE ROLE EMBED
// ==============================

function roleEmbed(member) {
  const selected =
    Object.entries(HERO_ROLES)
      .filter(
        ([id]) =>
          ROLE_IDS[id] &&
          member.roles.cache.has(
            ROLE_IDS[id]
          )
      )
      .map(
        ([, role]) =>
          `${role.emoji} **${role.name}**`
      );

  return new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle(
      '⚔️ ROLE SELECTION'
    )
    .setDescription(
      'Choose one or more Hero Roles you are comfortable playing in-game.\n\n' +

      '✦ **CURRENTLY SELECTED** ✦\n' +

      (
        selected.length
          ? selected.join('\n')
          : 'None selected.'
      )
    )
    .setFooter({
      text:
        'Your selection is private to you.'
    });
}

// ==============================
// PRIVATE LANE EMBED
// ==============================

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
        ([, lane]) =>
          `${lane.emoji} **${lane.name}**`
      );

  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle(
      '🛣️ LANE SELECTION'
    )
    .setDescription(
      'Choose one or more Lanes you are comfortable playing in-game.\n\n' +

      '✦ **CURRENTLY SELECTED** ✦\n' +

      (
        selected.length
          ? selected.join('\n')
          : 'None selected.'
      )
    )
    .setFooter({
      text:
        'Your selection is private to you.'
    });
}

// ==============================
// PRIVATE ROLE BUTTONS
// ==============================

function roleButtons(member) {
  const entries =
    Object.entries(HERO_ROLES);

  const rows = [];

  for (
    let i = 0;
    i < entries.length;
    i += 3
  ) {
    const row =
      new ActionRowBuilder();

    entries
      .slice(i, i + 3)
      .forEach(
        ([id, role]) => {

          const selected =
            ROLE_IDS[id] &&
            member.roles.cache.has(
              ROLE_IDS[id]
            );

          row.addComponents(
            new ButtonBuilder()
              .setCustomId(
                `lampoon_role_${id}`
              )
              .setLabel(
                role.name
              )
              .setEmoji(
                role.emoji
              )
              .setStyle(
                selected
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
            'lampoon_close_role'
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

// ==============================
// PRIVATE LANE BUTTONS
// ==============================

function laneButtons(member) {
  const entries =
    Object.entries(LANES);

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
        ([id, lane]) => {

          const selected =
            ROLE_IDS[id] &&
            member.roles.cache.has(
              ROLE_IDS[id]
            );

          row.addComponents(
            new ButtonBuilder()
              .setCustomId(
                `lampoon_lane_${id}`
              )
              .setLabel(
                lane.name
              )
              .setEmoji(
                lane.emoji
              )
              .setStyle(
                selected
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
            'lampoon_close_lane'
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

// ==============================
// SELECTION QUEUE
// ==============================

const selectionQueues =
  new Map();

function queueSelection(
  userId,
  task
) {
  const previous =
    selectionQueues.get(userId) ||
    Promise.resolve();

  const next =
    previous.then(
      task,
      task
    );

  selectionQueues.set(
    userId,
    next
  );

  next
    .finally(() => {
      if (
        selectionQueues.get(
          userId
        ) === next
      ) {
        selectionQueues.delete(
          userId
        );
      }
    })
    .catch(() => {});

  return next;
}

// ==============================
// LOGGING
// ==============================

async function sendLog({
  guild,
  user,
  type,
  action,
  selected
}) {
  try {
    if (!LOG_CHANNEL_ID) {
      return;
    }

    const channel =
      await guild.channels.fetch(
        LOG_CHANNEL_ID
      );

    if (
      !channel ||
      !channel.isTextBased()
    ) {
      return;
    }

    const isRole =
      type === 'role';

    const embed =
      new EmbedBuilder()
        .setColor(
          isRole
            ? 0xC0C0C0
            : 0xFFD700
        )
        .setTitle(
          isRole
            ? '⚔️ LAMPOON ROLE UPDATE'
            : '🛣️ LAMPOON LANE UPDATE'
        )
        .setDescription(
          `${user} **${action}** their ${
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
        .setTimestamp();

    await channel.send({
      embeds: [embed]
    });

  } catch (error) {
    console.error(
      '❌ Failed to send log:',
      error
    );
  }
}

// ==============================
// FIND / UPDATE PUBLIC PANEL
// ==============================

async function sendOrFindPanel() {
  try {
    if (
      !ROLE_LANE_CHANNEL_ID
    ) {
      console.error(
        '❌ ROLE_LANE_CHANNEL_ID is missing.'
      );
      return;
    }

    const channel =
      await client.channels.fetch(
        ROLE_LANE_CHANNEL_ID
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

    const messages =
      await channel.messages.fetch({
        limit: 100
      });

    // Find the existing Role & Lane panel.
    const existing =
      messages.find(
        message =>
          message.author.id ===
            client.user.id &&
          (
            message.embeds[0]?.title ===
              '⚔️ ROLE & 🛣️ LANE SELECTION'
          )
      );

    if (existing) {
      await existing.edit({
        embeds: [
          mainEmbed()
        ],
        components:
          mainButtons()
      });

      console.log(
        `✅ Existing Role & Lane panel updated: ${existing.id}`
      );

      return;
    }

    const panel =
      await channel.send({
        embeds: [
          mainEmbed()
        ],
        components:
          mainButtons()
      });

    console.log(
      `✅ New Role & Lane panel created: ${panel.id}`
    );

  } catch (error) {
    console.error(
      '❌ FAILED TO SEND ROLE & LANE PANEL:',
      error
    );
  }
}

// ==============================
// SLASH COMMANDS
// ==============================

const commands = [

  new SlashCommandBuilder()
    .setName(
      'my-selection'
    )
    .setDescription(
      'View your current Hero Role and Lane selections.'
    ),

  new SlashCommandBuilder()
    .setName(
      'reset-selection'
    )
    .setDescription(
      'Reset all of your Hero Role and Lane selections.'
    )

].map(
  command =>
    command.toJSON()
);

// ==============================
// READY
// ==============================

client.once(
  'clientReady',
  async () => {

    console.log(
      `✅ Logged in as ${client.user.tag}`
    );

    // Register slash commands.
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
        '❌ Slash command registration failed:',
        error
      );

    }

    // Update existing panel or create it.
    await sendOrFindPanel();
  }
);

// ==============================
// INTERACTIONS
// ==============================

client.on(
  'interactionCreate',
  async interaction => {

    try {

      // ==========================
      // SLASH COMMANDS
      // ==========================

      if (
        interaction.isChatInputCommand()
      ) {

        const member =
          interaction.member;

        // --------------------------
        // /my-selection
        // --------------------------

        if (
          interaction.commandName ===
          'my-selection'
        ) {

          const selectedRoles =
            Object.entries(
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
                ([, role]) =>
                  `${role.emoji} **${role.name}**`
              );

          const selectedLanes =
            Object.entries(
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
                ([, lane]) =>
                  `${lane.emoji} **${lane.name}**`
              );

          const embed =
            new EmbedBuilder()
              .setColor(0x3299DB)
              .setTitle(
                '📋 YOUR LAMPOON SELECTION'
              )
              .setDescription(
                '**⚔️ Hero Roles**\n' +

                (
                  selectedRoles.length
                    ? selectedRoles.join(
                        '\n'
                      )
                    : 'None selected.'
                ) +

                '\n\n' +

                '**🛣️ Lanes**\n' +

                (
                  selectedLanes.length
                    ? selectedLanes.join(
                        '\n'
                      )
                    : 'None selected.'
                )
              );

          return interaction.reply({
            flags:
              MessageFlags.Ephemeral,
            embeds: [
              embed
            ]
          });
        }

        // --------------------------
        // /reset-selection
        // --------------------------

        if (
          interaction.commandName ===
          'reset-selection'
        ) {

          let removed = 0;

          const allSelections = {
            ...HERO_ROLES,
            ...LANES
          };

          for (
            const id of
              Object.keys(
                allSelections
              )
          ) {

            const roleId =
              ROLE_IDS[id];

            if (
              roleId &&
              member.roles.cache.has(
                roleId
              )
            ) {

              await member.roles
                .remove(
                  roleId
                )
                .catch(
                  () => {}
                );

              removed++;
            }
          }

          await sendLog({
            guild:
              interaction.guild,
            user:
              interaction.user,
            type:
              'role',
            action:
              'reset',
            selected:
              []
          });

          return interaction.reply({
            flags:
              MessageFlags.Ephemeral,
            content:
              `✅ Your Hero Roles and Lanes have been reset.\n\n**Roles removed:** ${removed}`
          });
        }

        return;
      }

      // ==========================
      // BUTTONS ONLY
      // ==========================

      if (
        !interaction.isButton()
      ) {
        return;
      }

      // ==========================
      // OPEN PRIVATE ROLE PANEL
      // ==========================

      if (
        interaction.customId ===
        'lampoon_open_roles'
      ) {

        const member =
          await interaction.guild.members
            .fetch(
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

      // ==========================
      // OPEN PRIVATE LANE PANEL
      // ==========================

      if (
        interaction.customId ===
        'lampoon_open_lanes'
      ) {

        const member =
          await interaction.guild.members
            .fetch(
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

      // ==========================
      // CLOSE PRIVATE ROLE PANEL
      // ==========================

      if (
        interaction.customId ===
        'lampoon_close_role'
      ) {

        return interaction.update({
          content:
            '✅ **Role selection saved.**\n\nYour selection is private to you.',

          embeds: [],

          components: []
        });
      }

      // ==========================
      // CLOSE PRIVATE LANE PANEL
      // ==========================

      if (
        interaction.customId ===
        'lampoon_close_lane'
      ) {

        return interaction.update({
          content:
            '✅ **Lane selection saved.**\n\nYour selection is private to you.',

          embeds: [],

          components: []
        });
      }

      // ==========================
      // ROLE / LANE SELECTION
      // ==========================

      if (
        interaction.customId.startsWith(
          'lampoon_role_'
        ) ||
        interaction.customId.startsWith(
          'lampoon_lane_'
        )
      ) {

        const isRole =
          interaction.customId.startsWith(
            'lampoon_role_'
          );

        const prefix =
          isRole
            ? 'lampoon_role_'
            : 'lampoon_lane_';

        const id =
          interaction.customId.replace(
            prefix,
            ''
          );

        const data =
          isRole
            ? HERO_ROLES
            : LANES;

        const roleId =
          ROLE_IDS[id];

        // --------------------------
        // Validate
        // --------------------------

        if (
          !data[id] ||
          !roleId
        ) {

          return interaction.reply({
            flags:
              MessageFlags.Ephemeral,
            content:
              '❌ This option is not configured correctly.'
          });
        }

        // --------------------------
        // Immediately acknowledge
        // the private interaction.
        // --------------------------

        await interaction.deferUpdate();

        // --------------------------
        // Queue changes per user.
        // --------------------------

        await queueSelection(
          interaction.user.id,
          async () => {

            const member =
              await interaction.guild.members
                .fetch(
                  interaction.user.id
                );

            const hasRole =
              member.roles.cache.has(
                roleId
              );

            // Toggle role.
            if (hasRole) {

              await member.roles
                .remove(
                  roleId
                );

            } else {

              await member.roles
                .add(
                  roleId
                );
            }

            // Get fresh member state.
            const fresh =
              await interaction.guild.members
                .fetch(
                  interaction.user.id
                );

            // Update ONLY the user's
            // private ephemeral panel.
            await interaction.editReply({
              embeds: [
                isRole
                  ? roleEmbed(fresh)
                  : laneEmbed(fresh)
              ],

              components:
                isRole
                  ? roleButtons(fresh)
                  : laneButtons(fresh)
            });

            // --------------------------
            // Build selected list.
            // --------------------------

            const selected =
              Object.entries(data)
                .filter(
                  ([key]) =>
                    ROLE_IDS[key] &&
                    fresh.roles.cache.has(
                      ROLE_IDS[key]
                    )
                )
                .map(
                  ([, item]) =>
                    item.name
                );

            // --------------------------
            // Log update.
            // --------------------------

            await sendLog({
              guild:
                interaction.guild,

              user:
                interaction.user,

              type:
                isRole
                  ? 'role'
                  : 'lane',

              action:
                hasRole
                  ? 'removed from'
                  : 'selected',

              selected
            });
          }
        );

        return;
      }

    } catch (error) {

      console.error(
        '❌ Interaction error:',
        error
      );

      try {

        if (
          interaction.isRepliable()
        ) {

          if (
            interaction.replied ||
            interaction.deferred
          ) {

            await interaction.editReply({
              content:
                '❌ Something went wrong. Please check that the bot has **Manage Roles** permission and that its role is above the selectable roles.'
            }).catch(
              () => {}
            );

          } else {

            await interaction.reply({
              flags:
                MessageFlags.Ephemeral,

              content:
                '❌ Something went wrong. Please check that the bot has **Manage Roles** permission and that its role is above the selectable roles.'
            }).catch(
              () => {}
            );
          }
        }

      } catch {}
    }
  }
);

// ==============================
// DISCORD EVENTS
// ==============================

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

// ==============================
// LOGIN
// ==============================

client
  .login(TOKEN)
  .catch(
    error =>
      console.error(
        '❌ Discord login failed:',
        error
      )
  );
