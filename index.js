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

/* =========================================================
   CONFIG
========================================================= */

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const ROLE_LANE_CHANNEL_ID = process.env.ROLE_LANE_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const LAMPOON_GIF_URL = process.env.LAMPOON_GIF_URL;

const AVISALA = '<a:Avisala:1542448826265243660>';

/* =========================================================
   ROLES
========================================================= */

const ROLES = {
  fighter: {
    name: 'Fighter',
    emoji: '⚔️',
    description:
      'ᴅᴜʀᴀʙʟᴇ ᴍᴇʟᴇᴇ ʜᴇʀᴏᴇs ᴀɴᴅ ᴅᴜᴇʟɪsᴛs.',
    env: 'ROLE_FIGHTER',
  },

  tank: {
    name: 'Tank',
    emoji: '🛡️',
    description:
      'ꜰʀᴏɴᴛʟɪɴᴇ ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ ᴛʜᴇ ᴛᴇᴀᴍ.',
    env: 'ROLE_TANK',
  },

  assassin: {
    name: 'Assassin',
    emoji: '🗡️',
    description:
      'ʜɪɢʜ-ʙᴜʀsᴛ ʜᴇʀᴏᴇs ᴡʜᴏ ᴇʟɪᴍɪɴᴀᴛᴇ ᴘʀɪᴏʀɪᴛʏ ᴛᴀʀɢᴇᴛs.',
    env: 'ROLE_ASSASSIN',
  },

  mage: {
    name: 'Mage',
    emoji: '🔮',
    description:
      'ᴍᴀɢɪᴄ ᴅᴀᴍᴀɢᴇ ᴀɴᴅ ᴄʀᴏᴡᴅ-ᴄᴏɴᴛʀᴏʟ sᴘᴇᴄɪᴀʟɪsᴛs.',
    env: 'ROLE_MAGE',
  },

  marksman: {
    name: 'Marksman',
    emoji: '🏹',
    description:
      'ʀᴀɴɢᴇᴅ ʜᴇʀᴏᴇs ᴘʀᴏᴠɪᴅɪɴɢ ᴄᴏɴsɪsᴛᴇɴᴛ ᴅᴀᴍᴀɢᴇ.',
    env: 'ROLE_MARKSMAN',
  },

  support: {
    name: 'Support',
    emoji: '🛟',
    description:
      'ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ, ᴇᴍᴘᴏᴡᴇʀ, ʜᴇᴀʟ, ᴏʀ ᴄᴏɴᴛʀᴏʟ.',
    env: 'ROLE_SUPPORT',
  },
};

/* =========================================================
   LANES
========================================================= */

const LANES = {
  clashlane: {
    name: 'Clashlane',
    emoji: '<:clashlane:1550553783304589443>',
    description:
      'sᴏʟᴏ ʟᴀɴᴇ ꜰᴏʀ ᴅᴜᴇʟɪɴɢ ᴀɴᴅ sᴘʟɪᴛ ᴘᴜsʜɪɴɢ.',
    env: 'ROLE_CLASHLANE',
  },

  jungler: {
    name: 'Jungler',
    emoji: '<:jungler:1550553875562500248>',
    description:
      'ᴊᴜɴɢʟᴇ ʀᴇsᴏᴜʀᴄᴇs, ᴏʙᴊᴇᴄᴛɪᴠᴇs, ᴀɴᴅ ᴍᴀᴘ ᴘʀᴇssᴜʀᴇ.',
    env: 'ROLE_JUNGLER',
  },

  midlane: {
    name: 'Midlane',
    emoji: '<:midlane:1550553955501871124>',
    description:
      'ᴡᴀᴠᴇ ᴄʟᴇᴀʀɪɴɢ, ʀᴏᴛᴀᴛɪᴏɴs, ᴀɴᴅ ᴛᴇᴀᴍ ꜰɪɢʜᴛs.',
    env: 'ROLE_MIDLANE',
  },

  farmlane: {
    name: 'Farmlane',
    emoji: '<:farmlane:1550554057448361984>',
    description:
      'ɢᴏʟᴅ ꜰᴀʀᴍɪɴɢ ᴀɴᴅ ᴘʀɪᴍᴀʀʏ ᴅᴀᴍᴀɢᴇ.',
    env: 'ROLE_FARMLANE',
  },

  roamer: {
    name: 'Roamer',
    emoji: '<:roamer:1550554124473466920>',
    description:
      'ᴍᴀᴘ sᴜᴘᴘᴏʀᴛ, ɪɴɪᴛɪᴀᴛɪᴏɴ, ᴀɴᴅ ᴛᴇᴀᴍ ᴀssɪsᴛᴀɴᴄᴇ.',
    env: 'ROLE_ROAMER',
  },

  versatile: {
    name: 'Versatile',
    emoji: '<:versatile:1550554190496014366>',
    description:
      'ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ ᴀᴅᴀᴘᴛɪɴɢ ᴛᴏ ᴍᴜʟᴛɪᴘʟᴇ ʟᴀɴᴇs.',
    env: 'ROLE_VERSATILE',
  },
};

/* =========================================================
   CLIENT
========================================================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

/* =========================================================
   HELPERS
========================================================= */

function getRoleId(data) {
  return process.env[data.env];
}

function getSelectedItems(member, data) {
  return Object.entries(data).filter(([key, item]) => {
    const roleId = getRoleId(item);
    return roleId && member.roles.cache.has(roleId);
  });
}

function selectedText(member, data) {
  const selected = getSelectedItems(member, data);

  if (!selected.length) {
    return 'None selected';
  }

  return selected
    .map(([, item]) => `${item.emoji} **${item.name}**`)
    .join(' • ');
}

/* =========================================================
   MAIN PUBLIC EMBED
========================================================= */

function mainEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle('🎮 LAMPOON ROLE & LANE SELECTION')
    .setDescription(
      [
        `${AVISALA} **Choose your Role and Lane**`,
        '',
        `${AVISALA} Your selection automatically updates your **LAMPOON Discord roles**.`,
        '',
        `${AVISALA} You can change your Role or Lane selections anytime.`,
      ].join('\n')
    );

  if (LAMPOON_GIF_URL) {
    embed.setImage(LAMPOON_GIF_URL);
  }

  return embed;
}

/* =========================================================
   MAIN BUTTONS
========================================================= */

function mainButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_open_roles')
        .setLabel('Choose Role')
        .setEmoji('⚔️')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('lampoon_open_lanes')
        .setLabel('Choose Lane')
        .setEmoji('🛣️')
        .setStyle(ButtonStyle.Primary)
    ),
  ];
}

/* =========================================================
   ROLE EMBED
========================================================= */

function roleEmbed(member) {
  const description = [
    `${AVISALA} **ROLE GUIDE**`,
    'Choose the role that best matches your preferred playstyle.',
    'You can select multiple roles and change your selections anytime.',
    'Your selected roles automatically update your LAMPOON Discord roles.',
    '',
    '⚔️ **Fighter**',
    `${AVISALA} ᴅᴜʀᴀʙʟᴇ ᴍᴇʟᴇᴇ ʜᴇʀᴏᴇs ᴀɴᴅ ᴅᴜᴇʟɪsᴛs.`,
    '',
    '🛡️ **Tank**',
    `${AVISALA} ꜰʀᴏɴᴛʟɪɴᴇ ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ ᴛʜᴇ ᴛᴇᴀᴍ.`,
    '',
    '🗡️ **Assassin**',
    `${AVISALA} ʜɪɢʜ-ʙᴜʀsᴛ ʜᴇʀᴏᴇs ᴡʜᴏ ᴇʟɪᴍɪɴᴀᴛᴇ ᴘʀɪᴏʀɪᴛʏ ᴛᴀʀɢᴇᴛs.`,
    '',
    '🔮 **Mage**',
    `${AVISALA} ᴍᴀɢɪᴄ ᴅᴀᴍᴀɢᴇ ᴀɴᴅ ᴄʀᴏᴡᴅ-ᴄᴏɴᴛʀᴏʟ sᴘᴇᴄɪᴀʟɪsᴛs.`,
    '',
    '🏹 **Marksman**',
    `${AVISALA} ʀᴀɴɢᴇᴅ ʜᴇʀᴏᴇs ᴘʀᴏᴠɪᴅɪɴɢ ᴄᴏɴsɪsᴛᴇɴᴛ ᴅᴀᴍᴀɢᴇ.`,
    '',
    '🛟 **Support**',
    `${AVISALA} ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ, ᴇᴍᴘᴏᴡᴇʀ, ʜᴇᴀʟ, ᴏʀ ᴄᴏɴᴛʀᴏʟ.`,
    '',
    '✦ **CURRENTLY SELECTED** ✦',
    selectedText(member, ROLES),
  ];

  return new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle('⚔️ ROLE SELECTION')
    .setDescription(description.join('\n'));
}

/* =========================================================
   ROLE BUTTONS
========================================================= */

function roleButtons(member) {
  const keys = [
    ['fighter', 'tank'],
    ['assassin', 'mage'],
    ['marksman', 'support'],
  ];

  const rows = keys.map((pair) => {
    return new ActionRowBuilder().addComponents(
      ...pair.map((key) => {
        const item = ROLES[key];
        const roleId = getRoleId(item);
        const selected = roleId && member.roles.cache.has(roleId);

        return new ButtonBuilder()
          .setCustomId(`lampoon_role_${key}`)
          .setLabel(item.name)
          .setEmoji(item.emoji)
          .setStyle(
            selected
              ? ButtonStyle.Success
              : ButtonStyle.Secondary
          );
      })
    );
  });

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_role_done')
        .setLabel('Done')
        .setEmoji('↩️')
        .setStyle(ButtonStyle.Secondary)
    )
  );

  return rows;
}

/* =========================================================
   LANE EMBED
========================================================= */

function laneEmbed(member) {
  const description = [
    `${AVISALA} **LANE GUIDE**`,
    'Choose the lane that best matches your preferred position.',
    'You can select multiple lanes and change your selections anytime.',
    'Your selected lanes automatically update your LAMPOON Discord roles.',
    '',
    '<:clashlane:1550553783304589443> **Clashlane**',
    `${AVISALA} sᴏʟᴏ ʟᴀɴᴇ ꜰᴏʀ ᴅᴜᴇʟɪɴɢ ᴀɴᴅ sᴘʟɪᴛ ᴘᴜsʜɪɴɢ.`,
    '',
    '<:jungler:1550553875562500248> **Jungler**',
    `${AVISALA} ᴊᴜɴɢʟᴇ ʀᴇsᴏᴜʀᴄᴇs, ᴏʙᴊᴇᴄᴛɪᴠᴇs, ᴀɴᴅ ᴍᴀᴘ ᴘʀᴇssᴜʀᴇ.`,
    '',
    '<:midlane:1550553955501871124> **Midlane**',
    `${AVISALA} ᴡᴀᴠᴇ ᴄʟᴇᴀʀɪɴɢ, ʀᴏᴛᴀᴛɪᴏɴs, ᴀɴᴅ ᴛᴇᴀᴍ ꜰɪɢʜᴛs.`,
    '',
    '<:farmlane:1550554057448361984> **Farmlane**',
    `${AVISALA} ɢᴏʟᴅ ꜰᴀʀᴍɪɴɢ ᴀɴᴅ ᴘʀɪᴍᴀʀʏ ᴅᴀᴍᴀɢᴇ.`,
    '',
    '<:roamer:1550554124473466920> **Roamer**',
    `${AVISALA} ᴍᴀᴘ sᴜᴘᴘᴏʀᴛ, ɪɴɪᴛɪᴀᴛɪᴏɴ, ᴀɴᴅ ᴛᴇᴀᴍ ᴀssɪsᴛᴀɴᴄᴇ.`,
    '',
    '<:versatile:1550554190496014366> **Versatile**',
    `${AVISALA} ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ ᴀᴅᴀᴘᴛɪɴɢ ᴛᴏ ᴍᴜʟᴛɪᴘʟᴇ ʟᴀɴᴇs.`,
    '',
    '✦ **CURRENTLY SELECTED** ✦',
    selectedText(member, LANES),
  ];

  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🛣️ LANE SELECTION')
    .setDescription(description.join('\n'));
}

/* =========================================================
   LANE BUTTONS
========================================================= */

function laneButtons(member) {
  const keys = [
    ['clashlane', 'jungler'],
    ['midlane', 'farmlane'],
    ['roamer', 'versatile'],
  ];

  const rows = keys.map((pair) => {
    return new ActionRowBuilder().addComponents(
      ...pair.map((key) => {
        const item = LANES[key];
        const roleId = getRoleId(item);
        const selected = roleId && member.roles.cache.has(roleId);

        return new ButtonBuilder()
          .setCustomId(`lampoon_lane_${key}`)
          .setLabel(item.name)
          .setEmoji(item.emoji)
          .setStyle(
            selected
              ? ButtonStyle.Success
              : ButtonStyle.Secondary
          );
      })
    );
  });

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_lane_done')
        .setLabel('Done')
        .setEmoji('↩️')
        .setStyle(ButtonStyle.Secondary)
    )
  );

  return rows;
}

/* =========================================================
   LOGGING
========================================================= */

async function logAction(message) {
  if (!LOG_CHANNEL_ID) return;

  try {
    const channel = await client.channels.fetch(LOG_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) return;

    await channel.send({
      content: message,
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    console.error('Logging error:', error.message);
  }
}

/* =========================================================
   TOGGLE ROLE
========================================================= */

async function toggleRole(member, item) {
  const roleId = getRoleId(item);

  if (!roleId) {
    throw new Error(
      `Missing environment variable: ${item.env}`
    );
  }

  const role = member.guild.roles.cache.get(roleId);

  if (!role) {
    throw new Error(
      `Discord role not found for ${item.name}: ${roleId}`
    );
  }

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(roleId);
    return false;
  }

  await member.roles.add(roleId);
  return true;
}

/* =========================================================
   PUBLIC PANEL
========================================================= */

async function sendOrFindPanel() {
  try {
    const channel = await client.channels.fetch(
      ROLE_LANE_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) {
      throw new Error('ROLE_LANE_CHANNEL_ID is not a text channel.');
    }

    const messages = await channel.messages.fetch({
      limit: 100,
    });

    const existing = messages.find(
      (message) =>
        message.author.id === client.user.id &&
        message.embeds.length > 0 &&
        message.embeds[0].title ===
          '🎮 LAMPOON ROLE & LANE SELECTION'
    );

    if (existing) {
      await existing.edit({
        embeds: [mainEmbed()],
        components: mainButtons(),
      });

      console.log('✅ Existing Role & Lane panel updated.');
      return;
    }

    await channel.send({
      embeds: [mainEmbed()],
      components: mainButtons(),
    });

    console.log('✅ New Role & Lane panel sent.');
  } catch (error) {
    console.error('Panel error:', error);
  }
}

/* =========================================================
   SLASH COMMANDS
========================================================= */

const commands = [
  new SlashCommandBuilder()
    .setName('my-selection')
    .setDescription('View your current Role and Lane selections.'),

  new SlashCommandBuilder()
    .setName('reset-selection')
    .setDescription('Reset all your Role and Lane selections.'),
].map((command) => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    {
      body: commands,
    }
  );

  console.log('✅ Slash commands registered.');
}

/* =========================================================
   INTERACTIONS
========================================================= */

client.on('interactionCreate', async (interaction) => {
  try {
    /* -----------------------------------------------
       SLASH COMMANDS
    ------------------------------------------------ */

    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'my-selection') {
        const member = await interaction.guild.members.fetch(
          interaction.user.id
        );

        const embed = new EmbedBuilder()
          .setColor(0x3299DB)
          .setTitle('🎮 YOUR LAMPOON SELECTION')
          .setDescription(
            [
              `${AVISALA} **Roles**`,
              selectedText(member, ROLES),
              '',
              `${AVISALA} **Lanes**`,
              selectedText(member, LANES),
            ].join('\n')
          );

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });

        return;
      }

      if (interaction.commandName === 'reset-selection') {
        const member = await interaction.guild.members.fetch(
          interaction.user.id
        );

        const allSelections = [
          ...Object.values(ROLES),
          ...Object.values(LANES),
        ];

        let removed = 0;

        for (const item of allSelections) {
          const roleId = getRoleId(item);

          if (
            roleId &&
            member.roles.cache.has(roleId)
          ) {
            await member.roles.remove(roleId);
            removed++;
          }
        }

        await interaction.reply({
          content:
            `${AVISALA} Your Role and Lane selections have been reset.`,
          ephemeral: true,
        });

        await logAction(
          `🔄 **Selection Reset**\n` +
          `User: ${interaction.user.tag} (${interaction.user.id})\n` +
          `Roles removed: ${removed}`
        );

        return;
      }
    }

    /* -----------------------------------------------
       BUTTONS
    ------------------------------------------------ */

    if (!interaction.isButton()) return;

    /* -----------------------------------------------
       OPEN ROLE PANEL
    ------------------------------------------------ */

    if (interaction.customId === 'lampoon_open_roles') {
      const member = await interaction.guild.members.fetch(
        interaction.user.id
      );

      await interaction.reply({
        embeds: [roleEmbed(member)],
        components: roleButtons(member),
        ephemeral: true,
      });

      return;
    }

    /* -----------------------------------------------
       OPEN LANE PANEL
    ------------------------------------------------ */

    if (interaction.customId === 'lampoon_open_lanes') {
      const member = await interaction.guild.members.fetch(
        interaction.user.id
      );

      await interaction.reply({
        embeds: [laneEmbed(member)],
        components: laneButtons(member),
        ephemeral: true,
      });

      return;
    }

    /* -----------------------------------------------
       ROLE SELECTION
    ------------------------------------------------ */

    if (
      interaction.customId.startsWith('lampoon_role_') &&
      interaction.customId !== 'lampoon_role_done'
    ) {
      const key = interaction.customId.replace(
        'lampoon_role_',
        ''
      );

      const item = ROLES[key];

      if (!item) return;

      const member = await interaction.guild.members.fetch(
        interaction.user.id
      );

      const added = await toggleRole(member, item);

      const updatedMember =
        await interaction.guild.members.fetch(
          interaction.user.id
        );

      await interaction.update({
        embeds: [roleEmbed(updatedMember)],
        components: roleButtons(updatedMember),
      });

      await logAction(
        `${added ? '🟢' : '🔴'} **Role ${added ? 'Added' : 'Removed'}**\n` +
        `User: ${interaction.user.tag} (${interaction.user.id})\n` +
        `Role: ${item.name}`
      );

      return;
    }

    /* -----------------------------------------------
       ROLE DONE
    ------------------------------------------------ */

    if (interaction.customId === 'lampoon_role_done') {
      const member = await interaction.guild.members.fetch(
        interaction.user.id
      );

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3299DB)
            .setTitle('🎮 YOUR LAMPOON SELECTION')
            .setDescription(
              [
                `${AVISALA} Your selections have been saved.`,
                '',
                `⚔️ **Roles**`,
                selectedText(member, ROLES),
                '',
                `🛣️ **Lanes**`,
                selectedText(member, LANES),
              ].join('\n')
            ),
        ],
        components: [],
      });

      return;
    }

    /* -----------------------------------------------
       LANE SELECTION
    ------------------------------------------------ */

    if (
      interaction.customId.startsWith('lampoon_lane_') &&
      interaction.customId !== 'lampoon_lane_done'
    ) {
      const key = interaction.customId.replace(
        'lampoon_lane_',
        ''
      );

      const item = LANES[key];

      if (!item) return;

      const member = await interaction.guild.members.fetch(
        interaction.user.id
      );

      const added = await toggleRole(member, item);

      const updatedMember =
        await interaction.guild.members.fetch(
          interaction.user.id
        );

      await interaction.update({
        embeds: [laneEmbed(updatedMember)],
        components: laneButtons(updatedMember),
      });

      await logAction(
        `${added ? '🟢' : '🔴'} **Lane ${added ? 'Added' : 'Removed'}**\n` +
        `User: ${interaction.user.tag} (${interaction.user.id})\n` +
        `Lane: ${item.name}`
      );

      return;
    }

    /* -----------------------------------------------
       LANE DONE
    ------------------------------------------------ */

    if (interaction.customId === 'lampoon_lane_done') {
      const member = await interaction.guild.members.fetch(
        interaction.user.id
      );

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3299DB)
            .setTitle('🎮 YOUR LAMPOON SELECTION')
            .setDescription(
              [
                `${AVISALA} Your selections have been saved.`,
                '',
                `⚔️ **Roles**`,
                selectedText(member, ROLES),
                '',
                `🛣️ **Lanes**`,
                selectedText(member, LANES),
              ].join('\n')
            ),
        ],
        components: [],
      });

      return;
    }
  } catch (error) {
    console.error('Interaction error:', error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content:
          `${AVISALA} Something went wrong while updating your selection.`,
        ephemeral: true,
      });
    } else if (interaction.isButton()) {
      try {
        await interaction.followUp({
          content:
            `${AVISALA} Something went wrong while updating your selection.`,
          ephemeral: true,
        });
      } catch {}
    }
  }
});

/* =========================================================
   READY
========================================================= */

client.once('clientReady', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    await registerCommands();
    await sendOrFindPanel();
  } catch (error) {
    console.error('Startup error:', error);
  }
});

/* =========================================================
   HEALTH SERVER
========================================================= */

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
    });

    res.end('OK');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain',
  });

  res.end('LAMPOON Role & Lane Bot is running.');
});

server.listen(
  process.env.PORT || 10000,
  () => {
    console.log(
      `🌐 Health server running on port ${
        process.env.PORT || 10000
      }`
    );
  }
);

/* =========================================================
   LOGIN
========================================================= */

client.login(TOKEN);
