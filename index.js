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
} = require('discord.js');

const http = require('http');

// =====================================================
// ENVIRONMENT
// =====================================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const ROLE_LANE_CHANNEL_ID = process.env.ROLE_LANE_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const LAMPOON_GIF_URL = process.env.LAMPOON_GIF_URL;

// =====================================================
// ROLE IDs
// =====================================================

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
  versatile: process.env.ROLE_VERSATILE,
};

// =====================================================
// HERO ROLES
// =====================================================

const ROLES = {
  fighter: {
    name: 'Fighter',
    emoji: '⚔️',
    description:
      'ᴅᴜʀᴀʙʟᴇ ᴍᴇʟᴇᴇ ʜᴇʀᴏᴇs ᴀɴᴅ ᴅᴜᴇʟɪsᴛs.',
  },

  tank: {
    name: 'Tank',
    emoji: '🛡️',
    description:
      'ꜰʀᴏɴᴛʟɪɴᴇ ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ ᴛʜᴇ ᴛᴇᴀᴍ.',
  },

  assassin: {
    name: 'Assassin',
    emoji: '🗡️',
    description:
      'ʜɪɢʜ-ʙᴜʀsᴛ ʜᴇʀᴏᴇs ᴡʜᴏ ᴇʟɪᴍɪɴᴀᴛᴇ ᴘʀɪᴏʀɪᴛʏ ᴛᴀʀɢᴇᴛs.',
  },

  mage: {
    name: 'Mage',
    emoji: '🔮',
    description:
      'ᴍᴀɢɪᴄ ᴅᴀᴍᴀɢᴇ ᴀɴᴅ ᴄʀᴏᴡᴅ-ᴄᴏɴᴛʀᴏʟ sᴘᴇᴄɪᴀʟɪsᴛs.',
  },

  marksman: {
    name: 'Marksman',
    emoji: '🏹',
    description:
      'ʀᴀɴɢᴇᴅ ʜᴇʀᴏᴇs ᴘʀᴏᴠɪᴅɪɴɢ ᴄᴏɴsɪsᴛᴇɴᴛ ᴅᴀᴍᴀɢᴇ.',
  },

  support: {
    name: 'Support',
    emoji: '🛟',
    description:
      'ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ, ᴇᴍᴘᴏᴡᴇʀ, ʜᴇᴀʟ, ᴏʀ ᴄᴏɴᴛʀᴏʟ.',
  },
};

// =====================================================
// LANES
// =====================================================

const LANES = {
  clashlane: {
    name: 'Clashlane',
    emoji: '<:clashlane:1550553783304589443>',
    description:
      'sᴏʟᴏ ʟᴀɴᴇ ꜰᴏʀ ᴅᴜᴇʟɪɴɢ ᴀɴᴅ sᴘʟɪᴛ ᴘᴜsʜɪɴɢ.',
  },

  jungler: {
    name: 'Jungler',
    emoji: '<:jungler:1550553875562500248>',
    description:
      'ᴊᴜɴɢʟᴇ ʀᴇsᴏᴜʀᴄᴇs, ᴏʙᴊᴇᴄᴛɪᴠᴇs, ᴀɴᴅ ᴍᴀᴘ ᴘʀᴇssᴜʀᴇ.',
  },

  midlane: {
    name: 'Midlane',
    emoji: '<:midlane:1550553955501871124>',
    description:
      'ᴡᴀᴠᴇ ᴄʟᴇᴀʀɪɴɢ, ʀᴏᴛᴀᴛɪᴏɴs, ᴀɴᴅ ᴛᴇᴀᴍ ꜰɪɢʜᴛs.',
  },

  farmlane: {
    name: 'Farmlane',
    emoji: '<:farmlane:1550554057448361984>',
    description:
      'ɢᴏʟᴅ ꜰᴀʀᴍɪɴɢ ᴀɴᴅ ᴘʀɪᴍᴀʀʏ ᴅᴀᴍᴀɢᴇ.',
  },

  roamer: {
    name: 'Roamer',
    emoji: '<:roamer:1550554124473466920>',
    description:
      'ᴍᴀᴘ sᴜᴘᴘᴏʀᴛ, ɪɴɪᴛɪᴀᴛɪᴏɴ, ᴀɴᴅ ᴛᴇᴀᴍ ᴀssɪsᴛᴀɴᴄᴇ.',
  },

  versatile: {
    name: 'Versatile',
    emoji: '<:versatile:1550554190496014366>',
    description:
      'ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ ᴀᴅᴀᴘᴛɪɴɢ ᴛᴏ ᴍᴜʟᴛɪᴘʟᴇ ʟᴀɴᴇs.',
  },
};

// =====================================================
// DISCORD CLIENT
// =====================================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// =====================================================
// RENDER HEALTH SERVER
// =====================================================

const PORT = Number(process.env.PORT) || 10000;

const healthServer = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
  });

  if (req.url === '/health') {
    return res.end('OK');
  }

  res.end('LAMPOON Role & Lane Bot is online.');
});

healthServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Health server listening on port ${PORT}`);
});

// =====================================================
// MAIN EMBED
// =====================================================

function createMainEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle('⚔️ ROLE & 🛣️ LANE SELECTION')
    .setDescription(
      '**Your selection automatically updates your LAMPOON Discord roles.**\n\n' +
        '◀️ **Role**\n' +
        'Choose one or more Hero Roles you are comfortable playing in-game.\n\n' +
        '▶️ **Lane**\n' +
        'Choose one or more Lane Roles to gain their corresponding server colors.\n\n' +
        'You can change your Role or Lane selections anytime.'
    )
    .setFooter({
      text: 'LAMPOON • Role & Lane Selection',
    });

  if (LAMPOON_GIF_URL) {
    embed.setThumbnail(LAMPOON_GIF_URL);
  }

  return embed;
}

// =====================================================
// MAIN BUTTONS
// =====================================================

function createMainButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lampoon_open_roles')
      .setLabel('Choose Role')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('lampoon_open_lanes')
      .setLabel('Choose Lane')
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Secondary)
  );
}

// =====================================================
// POPUP EMBED
// =====================================================

function createPopupEmbed(
  member,
  data,
  title,
  section
) {
  const selected = Object.entries(data)
    .filter(([id]) => {
      const roleId = ROLE_IDS[id];

      return (
        roleId &&
        member.roles.cache.has(roleId)
      );
    })
    .map(([, item]) => {
      return `${item.emoji} **${item.name}**`;
    });

  const body = Object.values(data)
    .map((item) => {
      return `${item.emoji} **${item.name}**\n> ${item.description}`;
    })
    .join('\n\n');

  const icon =
    section === 'Hero Roles'
      ? '⚔️'
      : '🛣️';

  return new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle(title)
    .setDescription(
      `Select the ${section} you are comfortable playing in-game.\n\n` +
        `╭──────────── ${icon} ${section.toUpperCase()} ────────────╮\n\n` +
        `${body}\n\n` +
        `╰────────────────────────────────────╯\n\n` +
        '✦ **CURRENTLY SELECTED** ✦\n' +
        (
          selected.length
            ? selected.join(' • ')
            : 'None selected.'
        )
    )
    .setFooter({
      text: 'Click an option to add or remove it.',
    });
}

function createRoleEmbed(member) {
  return createPopupEmbed(
    member,
    ROLES,
    '⚔️ CHOOSE YOUR ROLE',
    'Hero Roles'
  );
}

function createLaneEmbed(member) {
  return createPopupEmbed(
    member,
    LANES,
    '🛣️ CHOOSE YOUR LANE',
    'Lanes'
  );
}

// =====================================================
// OPTION BUTTONS
// =====================================================

function createOptionRows(
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
    const row =
      new ActionRowBuilder();

    for (
      const [id, item]
      of entries.slice(i, i + perRow)
    ) {
      const roleId =
        ROLE_IDS[id];

      const selected =
        roleId &&
        member.roles.cache.has(roleId);

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(
            `${prefix}${id}`
          )
          .setLabel(item.name)
          .setEmoji(item.emoji)
          .setStyle(
            selected
              ? ButtonStyle.Success
              : ButtonStyle.Secondary
          )
      );
    }

    rows.push(row);
  }

  return rows;
}

// =====================================================
// ROLE BUTTONS
// 3 PER ROW
// =====================================================

function createRoleButtons(member) {
  return [
    ...createOptionRows(
      member,
      ROLES,
      'lampoon_role_',
      3
    ),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          'lampoon_close_role_popup'
        )
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(
          ButtonStyle.Primary
        )
    ),
  ];
}

// =====================================================
// LANE BUTTONS
// 2 PER ROW
// =====================================================

function createLaneButtons(member) {
  return [
    ...createOptionRows(
      member,
      LANES,
      'lampoon_lane_',
      2
    ),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          'lampoon_close_lane_popup'
        )
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(
          ButtonStyle.Primary
        )
    ),
  ];
}

// =====================================================
// LOGGING
// =====================================================

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
        embeds: [embed],
      });
    }
  } catch (error) {
    console.error(
      '❌ Failed to send log:',
      error
    );
  }
}

// =====================================================
// MAIN PANEL
// =====================================================

async function sendOrFindPanel() {
  try {
    const channel =
      await client.channels.fetch(
        ROLE_LANE_CHANNEL_ID
      );

    if (
      !channel ||
      !channel.isTextBased()
    ) {
      throw new Error(
        'ROLE_LANE_CHANNEL_ID is not a text channel.'
      );
    }

    const messages =
      await channel.messages.fetch({
        limit: 100,
      });

    const existingPanel =
      messages.find(
        (message) =>
          message.author.id ===
            client.user.id &&
          message.embeds.length > 0 &&
          message.embeds[0].title ===
            '⚔️ ROLE & 🛣️ LANE SELECTION'
      );

    // UPDATE EXISTING PANEL
    if (existingPanel) {
      await existingPanel.edit({
        embeds: [
          createMainEmbed(),
        ],
        components: [
          createMainButtons(),
        ],
      });

      console.log(
        `✅ Existing panel updated: ${existingPanel.id}`
      );

      return;
    }

    // CREATE NEW PANEL
    const panel =
      await channel.send({
        embeds: [
          createMainEmbed(),
        ],
        components: [
          createMainButtons(),
        ],
      });

    console.log(
      `✅ New panel sent: ${panel.id}`
    );
  } catch (error) {
    console.error(
      '❌ Failed to create/update main panel:',
      error
    );
  }
}

// =====================================================
// SLASH COMMANDS
// =====================================================

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
    ),
].map((command) =>
  command.toJSON()
);

// =====================================================
// READY
// =====================================================

client.once(
  'ready',
  async () => {
    console.log(
      `🤖 Logged in as ${client.user.tag}`
    );

    console.log(
      `🆔 Bot ID: ${client.user.id}`
    );

    try {
      const rest =
        new REST({
          version: '10',
        }).setToken(TOKEN);

      await rest.put(
        Routes.applicationGuildCommands(
          CLIENT_ID,
          GUILD_ID
        ),
        {
          body: commands,
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

// =====================================================
// INTERACTIONS
// =====================================================

client.on(
  'interactionCreate',
  async (interaction) => {
    try {

      // =================================================
      // SLASH COMMANDS
      // =================================================

      if (
        interaction.isChatInputCommand()
      ) {
        const member =
          interaction.member;

        // -----------------------------------------------
        // /my-selection
        // -----------------------------------------------

        if (
          interaction.commandName ===
          'my-selection'
        ) {
          const selectedRoles =
            Object.entries(ROLES)
              .filter(
                ([id]) =>
                  ROLE_IDS[id] &&
                  member.roles.cache.has(
                    ROLE_IDS[id]
                  )
              )
              .map(
                ([, item]) =>
                  `${item.emoji} **${item.name}**`
              );

          const selectedLanes =
            Object.entries(LANES)
              .filter(
                ([id]) =>
                  ROLE_IDS[id] &&
                  member.roles.cache.has(
                    ROLE_IDS[id]
                  )
              )
              .map(
                ([, item]) =>
                  `${item.emoji} **${item.name}**`
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
                      ? selectedRoles.join('\n')
                      : 'None selected.'
                  ) +
                  '\n\n' +
                  '**🛣️ Lanes**\n' +
                  (
                    selectedLanes.length
                      ? selectedLanes.join('\n')
                      : 'None selected.'
                  )
              )
              .setFooter({
                text:
                  'LAMPOON • Role & Lane Selection',
              });

          return interaction.reply({
            embeds: [embed],
            ephemeral: true,
          });
        }

        // -----------------------------------------------
        // /reset-selection
        // -----------------------------------------------

        if (
          interaction.commandName ===
          'reset-selection'
        ) {
          const roleIds = [
            ...Object.keys(ROLES),
            ...Object.keys(LANES),
          ]
            .map(
              (id) => ROLE_IDS[id]
            )
            .filter(
              (roleId) =>
                roleId &&
                member.roles.cache.has(
                  roleId
                )
            );

          if (roleIds.length) {
            try {
              await member.roles.remove(
                roleIds
              );
            } catch (error) {
              console.error(
                '❌ Failed to reset roles:',
                error
              );

              return interaction.reply({
                content:
                  '❌ I could not reset your roles. Check **Manage Roles** and role hierarchy.',
                ephemeral: true,
              });
            }
          }

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

          return interaction.reply({
            content:
              '✅ Your Hero Roles and Lanes have been reset.',
            ephemeral: true,
          });
        }
      }

      // =================================================
      // BUTTONS
      // =================================================

      if (!interaction.isButton()) {
        return;
      }

      const member =
        interaction.member;

      // -----------------------------------------------
      // OPEN ROLE POPUP
      // -----------------------------------------------

      if (
        interaction.customId ===
        'lampoon_open_roles'
      ) {
        return interaction.reply({
          embeds: [
            createRoleEmbed(member),
          ],
          components:
            createRoleButtons(member),
          ephemeral: true,
        });
      }

      // -----------------------------------------------
      // OPEN LANE POPUP
      // -----------------------------------------------

      if (
        interaction.customId ===
        'lampoon_open_lanes'
      ) {
        return interaction.reply({
          embeds: [
            createLaneEmbed(member),
          ],
          components:
            createLaneButtons(member),
          ephemeral: true,
        });
      }

      // -----------------------------------------------
      // CLOSE ROLE POPUP
      // -----------------------------------------------

      if (
        interaction.customId ===
        'lampoon_close_role_popup'
      ) {
        return interaction.update({
          content:
            '✅ **Role selection saved.** You can click **◀️ Choose Role** again anytime to change it.',
          embeds: [],
          components: [],
        });
      }

      // -----------------------------------------------
      // CLOSE LANE POPUP
      // -----------------------------------------------

      if (
        interaction.customId ===
        'lampoon_close_lane_popup'
      ) {
        return interaction.update({
          content:
            '✅ **Lane selection saved.** You can click **▶️ Choose Lane** again anytime to change it.',
          embeds: [],
          components: [],
        });
      }

      // =================================================
      // ROLE SELECTION
      // =================================================

      if (
        interaction.customId.startsWith(
          'lampoon_role_'
        )
      ) {
        const id =
          interaction.customId.replace(
            'lampoon_role_',
            ''
          );

        const roleId =
          ROLE_IDS[id];

        if (
          !ROLES[id] ||
          !roleId
        ) {
          return interaction.reply({
            content:
              '❌ This role is not configured correctly.',
            ephemeral: true,
          });
        }

        const hadRole =
          member.roles.cache.has(
            roleId
          );

        try {
          if (hadRole) {
            await member.roles.remove(
              roleId
            );
          } else {
            await member.roles.add(
              roleId
            );
          }
        } catch (error) {
          console.error(
            '❌ Failed to update Hero Role:',
            error
          );

          return interaction.reply({
            content:
              '❌ I could not update that role. Check **Manage Roles** and role hierarchy.',
            ephemeral: true,
          });
        }

        const freshMember =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        await interaction.update({
          embeds: [
            createRoleEmbed(
              freshMember
            ),
          ],
          components:
            createRoleButtons(
              freshMember
            ),
        });

        void sendLog(
          new EmbedBuilder()
            .setColor(0x3299DB)
            .setTitle(
              hadRole
                ? '➖ HERO ROLE REMOVED'
                : '➕ HERO ROLE ADDED'
            )
            .setDescription(
              `${interaction.user} ${
                hadRole
                  ? 'removed'
                  : 'selected'
              } **${ROLES[id].name}**.`
            )
            .setTimestamp()
        );

        return;
      }

      // =================================================
      // LANE SELECTION
      // =================================================

      if (
        interaction.customId.startsWith(
          'lampoon_lane_'
        )
      ) {
        const id =
          interaction.customId.replace(
            'lampoon_lane_',
            ''
          );

        const roleId =
          ROLE_IDS[id];

        if (
          !LANES[id] ||
          !roleId
        ) {
          return interaction.reply({
            content:
              '❌ This lane is not configured correctly.',
            ephemeral: true,
          });
        }

        const hadRole =
          member.roles.cache.has(
            roleId
          );

        try {
          if (hadRole) {
            await member.roles.remove(
              roleId
            );
          } else {
            await member.roles.add(
              roleId
            );
          }
        } catch (error) {
          console.error(
            '❌ Failed to update Lane Role:',
            error
          );

          return interaction.reply({
            content:
              '❌ I could not update that lane. Check **Manage Roles** and role hierarchy.',
            ephemeral: true,
          });
        }

        const freshMember =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        await interaction.update({
          embeds: [
            createLaneEmbed(
              freshMember
            ),
          ],
          components:
            createLaneButtons(
              freshMember
            ),
        });

        void sendLog(
          new EmbedBuilder()
            .setColor(0x3299DB)
            .setTitle(
              hadRole
                ? '➖ LANE ROLE REMOVED'
                : '➕ LANE ROLE ADDED'
            )
            .setDescription(
              `${interaction.user} ${
                hadRole
                  ? 'removed'
                  : 'selected'
              } **${LANES[id].name}**.`
            )
            .setTimestamp()
        );

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
        await interaction
          .reply({
            content:
              '❌ Something went wrong. Check the bot permissions and role hierarchy.',
            ephemeral: true,
          })
          .catch(() => {});
      }
    }
  }
);

// =====================================================
// DISCORD ERROR HANDLING
// =====================================================

client.on(
  'error',
  (error) => {
    console.error(
      '❌ Discord Client Error:',
      error
    );
  }
);

client.on(
  'warn',
  (warning) => {
    console.warn(
      '⚠️ Discord Warning:',
      warning
    );
  }
);

client.on(
  'shardError',
  (error) => {
    console.error(
      '❌ Discord Shard Error:',
      error
    );
  }
);

client.on(
  'shardDisconnect',
  (event, shardId) => {
    console.warn(
      `⚠️ Discord Shard ${shardId} disconnected.`,
      event
    );
  }
);

// =====================================================
// STARTUP VALIDATION
// =====================================================

const REQUIRED_ENV = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'GUILD_ID',
  'ROLE_LANE_CHANNEL_ID',

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
  'ROLE_VERSATILE',
];

const missingEnv =
  REQUIRED_ENV.filter(
    (name) =>
      !process.env[name]
  );

if (missingEnv.length > 0) {
  console.error(
    '❌ Missing environment variables:'
  );

  console.error(
    missingEnv.join(', ')
  );

  process.exit(1);
}

console.log(
  '✅ Environment variables validated.'
);

// =====================================================
// LOGIN
// =====================================================

client
  .login(TOKEN)
  .catch((error) => {
    console.error(
      '❌ Discord login failed:',
      error
    );

    process.exit(1);
  });
