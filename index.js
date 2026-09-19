require('dotenv').config();

// ==========================================
// RENDER HEALTH CHECK
// ==========================================

const http = require('http');

const PORT = Number(process.env.PORT) || 10000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
    });

    return res.end('OK');
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
  });

  res.end('LAMPOON Role & Lane Bot is online.');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Health server running on port ${PORT}`);
});

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
  MessageFlags,
} = require('discord.js');

const {
  DISCORD_TOKEN,
  CLIENT_ID,
  GUILD_ID,
  ROLE_LANE_CHANNEL_ID,
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
  ROLE_VERSATILE,
} = process.env;

const AVISALA = '<a:Avisala:1542448826265243660>';

const ROLES = [
  {
    key: 'fighter',
    name: 'Fighter',
    emoji: '⚔️',
    description: 'ᴅᴜʀᴀʙʟᴇ ᴍᴇʟᴇᴇ ʜᴇʀᴏᴇs ᴀɴᴅ ᴅᴜᴇʟɪsᴛs.',
    env: ROLE_FIGHTER,
  },
  {
    key: 'tank',
    name: 'Tank',
    emoji: '🛡️',
    description: 'ꜰʀᴏɴᴛʟɪɴᴇ ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ ᴛʜᴇ ᴛᴇᴀᴍ.',
    env: ROLE_TANK,
  },
  {
    key: 'assassin',
    name: 'Assassin',
    emoji: '🗡️',
    description: 'ʜɪɢʜ-ʙᴜʀsᴛ ʜᴇʀᴏᴇs ᴡʜᴏ ᴇʟɪᴍɪɴᴀᴛᴇ ᴘʀɪᴏʀɪᴛʏ ᴛᴀʀɢᴇᴛs.',
    env: ROLE_ASSASSIN,
  },
  {
    key: 'mage',
    name: 'Mage',
    emoji: '🔮',
    description: 'ᴍᴀɢɪᴄ ᴅᴀᴍᴀɢᴇ ᴀɴᴅ ᴄʀᴏᴡᴅ-ᴄᴏɴᴛʀᴏʟ sᴘᴇᴄɪᴀʟɪsᴛs.',
    env: ROLE_MAGE,
  },
  {
    key: 'marksman',
    name: 'Marksman',
    emoji: '🏹',
    description: 'ʀᴀɴɢᴇᴅ ʜᴇʀᴏᴇs ᴘʀᴏᴠɪᴅɪɴɢ ᴄᴏɴsɪsᴛᴇɴᴛ ᴅᴀᴍᴀɢᴇ.',
    env: ROLE_MARKSMAN,
  },
  {
    key: 'support',
    name: 'Support',
    emoji: '🛟',
    description: 'ʜᴇʀᴏᴇs ᴡʜᴏ ᴘʀᴏᴛᴇᴄᴛ, ᴇᴍᴘᴏᴡᴇʀ, ʜᴇᴀʟ, ᴏʀ ᴄᴏɴᴛʀᴏʟ.',
    env: ROLE_SUPPORT,
  },
];

const LANES = [
  {
    key: 'clashlane',
    name: 'Clashlane',
    emoji: '<:clashlane:1550553783304589443>',
    description: 'sᴏʟᴏ ʟᴀɴᴇ ꜰᴏʀ ᴅᴜᴇʟɪɴɢ ᴀɴᴅ sᴘʟɪᴛ ᴘᴜsʜɪɴɢ.',
    env: ROLE_CLASHLANE,
  },
  {
    key: 'jungler',
    name: 'Jungler',
    emoji: '<:jungler:1550553875562500248>',
    description: 'ᴊᴜɴɢʟᴇ ʀᴇsᴏᴜʀᴄᴇs, ᴏʙᴊᴇᴄᴛɪᴠᴇs, ᴀɴᴅ ᴍᴀᴘ ᴘʀᴇssᴜʀᴇ.',
    env: ROLE_JUNGLER,
  },
  {
    key: 'midlane',
    name: 'Midlane',
    emoji: '<:midlane:1550553955501871124>',
    description: 'ᴡᴀᴠᴇ ᴄʟᴇᴀʀɪɴɢ, ʀᴏᴛᴀᴛɪᴏɴs, ᴀɴᴅ ᴛᴇᴀᴍ ꜰɪɢʜᴛs.',
    env: ROLE_MIDLANE,
  },
  {
    key: 'farmlane',
    name: 'Farmlane',
    emoji: '<:farmlane:1550554057448361984>',
    description: 'ɢᴏʟᴅ ꜰᴀʀᴍɪɴɢ ᴀɴᴅ ᴘʀɪᴍᴀʀʏ ᴅᴀᴍᴀɢᴇ.',
    env: ROLE_FARMLANE,
  },
  {
    key: 'roamer',
    name: 'Roamer',
    emoji: '<:roamer:1550554124473466920>',
    description: 'ᴍᴀᴘ sᴜᴘᴘᴏʀᴛ, ɪɴɪᴛɪᴀᴛɪᴏɴ, ᴀɴᴅ ᴛᴇᴀᴍ ᴀssɪsᴛᴀɴᴄᴇ.',
    env: ROLE_ROAMER,
  },
  {
    key: 'versatile',
    name: 'Versatile',
    emoji: '<:versatile:1550554190496014366>',
    description: 'ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ ᴀᴅᴀᴘᴛɪɴɢ ᴛᴏ ᴍᴜʟᴛɪᴘʟᴇ ʟᴀɴᴇs.',
    env: ROLE_VERSATILE,
  },
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

function getRoleId(item) {
  return item.env;
}

function getSelectedItems(member, items) {
  return items.filter(item => {
    const roleId = getRoleId(item);

    if (!roleId) return false;

    return member.roles.cache.has(roleId);
  });
}

function selectedText(member, items) {
  const selected = getSelectedItems(member, items);

  if (!selected.length) {
    return '`None selected`';
  }

  return selected
    .map(item => `${item.emoji} **${item.name}**`)
    .join('\n');
}

function mainEmbed() {
  return new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle('🎮 LAMPOON ROLE & LANE SELECTION')
    .setDescription(
      [
        `${AVISALA} **ROLE & LANE GUIDE**`,
        '',
        '**Your selection automatically updates your LAMPOON Discord roles.**',
        '',
        '⚔️ **Role**',
        'Choose one or more Hero Roles you are comfortable playing in-game.',
        '',
        '🛣️ **Lane**',
        'Choose one or more Lane Roles to gain their corresponding server colors.',
        '',
        'You can change your Role or Lane selections anytime.',
      ].join('\n')
    )
    .setThumbnail(LAMPOON_GIF_URL)
    .setFooter({
      text: 'LAMPOON • Role & Lane Selection',
    });
}

function mainButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_role')
        .setLabel('Role')
        .setEmoji('⚔️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('lampoon_lane')
        .setLabel('Lane')
        .setEmoji('🛣️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('lampoon_current')
        .setLabel('My Selection')
        .setEmoji('🔎')
        .setStyle(ButtonStyle.Primary),
    ),
  ];
}

function roleEmbed() {
  const description = [
    `${AVISALA} **ROLE GUIDE**`,
    'Choose the role that best matches your preferred playstyle.',
    '',
    'You can select multiple roles and change your selections anytime.',
    '',
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
  ];

  return new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle('⚔️ ROLE SELECTION')
    .setDescription(description.join('\n'));
}

function laneEmbed() {
  const description = [
    `${AVISALA} **LANE GUIDE**`,
    'Choose the lane that best matches your preferred position.',
    '',
    'You can select multiple lanes and change your selections anytime.',
    '',
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
  ];

  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🛣️ LANE SELECTION')
    .setDescription(description.join('\n'));
}

function roleMenu(member) {
  const selected = getSelectedItems(member, ROLES);

  const menu = new StringSelectMenuBuilder()
    .setCustomId('lampoon_role_select')
    .setPlaceholder('Select your Hero Roles')
    .setMinValues(1)
    .setMaxValues(ROLES.length)
    .addOptions(
      ROLES.map(role =>
        new StringSelectMenuOptionBuilder()
          .setLabel(role.name)
          .setDescription(role.description)
          .setValue(role.key)
          .setEmoji(role.emoji)
          .setDefault(selected.some(x => x.key === role.key))
      )
    );

  return new ActionRowBuilder().addComponents(menu);
}

function laneMenu(member) {
  const selected = getSelectedItems(member, LANES);

  const menu = new StringSelectMenuBuilder()
    .setCustomId('lampoon_lane_select')
    .setPlaceholder('Select your Lanes')
    .setMinValues(1)
    .setMaxValues(LANES.length)
    .addOptions(
      LANES.map(lane =>
        new StringSelectMenuOptionBuilder()
          .setLabel(lane.name)
          .setDescription(lane.description)
          .setValue(lane.key)
          .setDefault(selected.some(x => x.key === lane.key))
      )
    );

  return new ActionRowBuilder().addComponents(menu);
}

function currentSelectionEmbed(member) {
  return new EmbedBuilder()
    .setColor(0x3299DB)
    .setTitle('✦ CURRENTLY SELECTED ✦')
    .setDescription(
      [
        'Your current Role and Lane selections are **private**.',
        '',
        '⚔️ **Role**',
        selectedText(member, ROLES),
        '',
        '🛣️ **Lane**',
        selectedText(member, LANES),
      ].join('\n')
    )
    .setFooter({
      text: 'LAMPOON • Role & Lane Selection',
    });
}

function currentSelectionButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_switch_role')
        .setLabel('Switch Role')
        .setEmoji('⚔️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('lampoon_switch_lane')
        .setLabel('Switch Lane')
        .setEmoji('🛣️')
        .setStyle(ButtonStyle.Secondary),
    ),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_clear_roles')
        .setLabel('Clear Roles')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId('lampoon_clear_lanes')
        .setLabel('Clear Lanes')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger),
    ),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_close')
        .setLabel('Close')
        .setStyle(ButtonStyle.Secondary),
    ),
  ];
}

function rolePanelButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_role_done')
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('lampoon_switch_lane')
        .setLabel('Switch Lane')
        .setEmoji('🛣️')
        .setStyle(ButtonStyle.Secondary),
    ),
  ];
}

function lanePanelButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lampoon_lane_done')
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('lampoon_switch_role')
        .setLabel('Switch Role')
        .setEmoji('⚔️')
        .setStyle(ButtonStyle.Secondary),
    ),
  ];
}

function roleLogEmbed(member, action, roleName) {
  return new EmbedBuilder()
    .setColor(0xC0C0C0)
    .setTitle('⚔️ ROLE SELECTION LOG')
    .setDescription(
      [
        `**Member:** ${member}`,
        `**Action:** ${action}`,
        `**Role:** ${roleName}`,
      ].join('\n')
    )
    .setTimestamp();
}

function laneLogEmbed(member, action, laneName) {
  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🛣️ LANE SELECTION LOG')
    .setDescription(
      [
        `**Member:** ${member}`,
        `**Action:** ${action}`,
        `**Lane:** ${laneName}`,
      ].join('\n')
    )
    .setTimestamp();
}

async function sendRoleLog(member, action, roleName) {
  try {
    const channel = member.guild.channels.cache.get(LOG_CHANNEL_ID);

    if (!channel) return;

    await channel.send({
      embeds: [roleLogEmbed(member, action, roleName)],
    });
  } catch (error) {
    console.error('Role log error:', error);
  }
}

async function sendLaneLog(member, action, laneName) {
  try {
    const channel = member.guild.channels.cache.get(LOG_CHANNEL_ID);

    if (!channel) return;

    await channel.send({
      embeds: [laneLogEmbed(member, action, laneName)],
    });
  } catch (error) {
    console.error('Lane log error:', error);
  }
}

async function updateRoleSelection(member, values) {
  const selectedKeys = new Set(values);

  for (const role of ROLES) {
    const roleId = getRoleId(role);

    if (!roleId) continue;

    const hasRole = member.roles.cache.has(roleId);
    const shouldHaveRole = selectedKeys.has(role.key);

    if (shouldHaveRole && !hasRole) {
      await member.roles.add(roleId);
      await sendRoleLog(member, 'Added', role.name);
    }

    if (!shouldHaveRole && hasRole) {
      await member.roles.remove(roleId);
      await sendRoleLog(member, 'Removed', role.name);
    }
  }
}

async function updateLaneSelection(member, values) {
  const selectedKeys = new Set(values);

  for (const lane of LANES) {
    const roleId = getRoleId(lane);

    if (!roleId) continue;

    const hasRole = member.roles.cache.has(roleId);
    const shouldHaveRole = selectedKeys.has(lane.key);

    if (shouldHaveRole && !hasRole) {
      await member.roles.add(roleId);
      await sendLaneLog(member, 'Added', lane.name);
    }

    if (!shouldHaveRole && hasRole) {
      await member.roles.remove(roleId);
      await sendLaneLog(member, 'Removed', lane.name);
    }
  }
}

async function clearAllRoles(member) {
  for (const role of ROLES) {
    const roleId = getRoleId(role);

    if (!roleId) continue;

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      await sendRoleLog(member, 'Removed', role.name);
    }
  }
}

async function clearAllLanes(member) {
  for (const lane of LANES) {
    const roleId = getRoleId(lane);

    if (!roleId) continue;

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      await sendLaneLog(member, 'Removed', lane.name);
    }
  }
}

async function sendOrFindPanel() {
  const guild = client.guilds.cache.get(GUILD_ID);

  if (!guild) {
    console.error('Guild not found.');
    return;
  }

  const channel = guild.channels.cache.get(ROLE_LANE_CHANNEL_ID);

  if (!channel) {
    console.error('Role/Lane channel not found.');
    return;
  }

  const messages = await channel.messages.fetch({
    limit: 50,
  });

  const existing = messages.find(
    message =>
      message.author.id === client.user.id &&
      message.embeds.length &&
      message.embeds[0].title === '🎮 LAMPOON ROLE & LANE SELECTION'
  );

  if (existing) {
    await existing.edit({
      embeds: [mainEmbed()],
      components: mainButtons(),
    });

    console.log('Existing LAMPOON panel updated.');
    return;
  }

  await channel.send({
    embeds: [mainEmbed()],
    components: mainButtons(),
  });

  console.log('LAMPOON panel created.');
}

const commands = [
  new SlashCommandBuilder()
    .setName('my-selection')
    .setDescription(
      'View your current Role and Lane selections privately.'
    ),

  new SlashCommandBuilder()
    .setName('reset-selection')
    .setDescription(
      'Reset all of your Role and Lane selections.'
    ),
].map(command => command.toJSON());

async function registerCommands() {
  try {
    const rest = new REST({
      version: '10',
    }).setToken(DISCORD_TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      {
        body: commands,
      }
    );

    console.log('Slash commands registered.');
  } catch (error) {
    console.error('Command registration error:', error);
  }
}

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'my-selection') {
        const member = interaction.member;

        await interaction.reply({
          embeds: [currentSelectionEmbed(member)],
          components: currentSelectionButtons(),
          flags: MessageFlags.Ephemeral,
        });

        return;
      }

      if (interaction.commandName === 'reset-selection') {
        const member = interaction.member;

        await clearAllRoles(member);
        await clearAllLanes(member);

        await interaction.reply({
          embeds: [currentSelectionEmbed(member)],
          components: currentSelectionButtons(),
          flags: MessageFlags.Ephemeral,
        });

        return;
      }
    }

    if (interaction.isButton()) {
      const member = interaction.member;

      if (interaction.customId === 'lampoon_role') {
        await interaction.reply({
          embeds: [roleEmbed()],
          components: [
            roleMenu(member),
            ...rolePanelButtons(),
          ],
          flags: MessageFlags.Ephemeral,
        });

        return;
      }

      if (interaction.customId === 'lampoon_lane') {
        await interaction.reply({
          embeds: [laneEmbed()],
          components: [
            laneMenu(member),
            ...lanePanelButtons(),
          ],
          flags: MessageFlags.Ephemeral,
        });

        return;
      }

      if (interaction.customId === 'lampoon_current') {
        await interaction.reply({
          embeds: [currentSelectionEmbed(member)],
          components: currentSelectionButtons(),
          flags: MessageFlags.Ephemeral,
        });

        return;
      }

      if (interaction.customId === 'lampoon_switch_role') {
        await interaction.update({
          embeds: [roleEmbed()],
          components: [
            roleMenu(member),
            ...rolePanelButtons(),
          ],
        });

        return;
      }

      if (interaction.customId === 'lampoon_switch_lane') {
        await interaction.update({
          embeds: [laneEmbed()],
          components: [
            laneMenu(member),
            ...lanePanelButtons(),
          ],
        });

        return;
      }

      if (interaction.customId === 'lampoon_role_done') {
        await interaction.update({
          embeds: [currentSelectionEmbed(member)],
          components: currentSelectionButtons(),
        });

        return;
      }

      if (interaction.customId === 'lampoon_lane_done') {
        await interaction.update({
          embeds: [currentSelectionEmbed(member)],
          components: currentSelectionButtons(),
        });

        return;
      }

      if (interaction.customId === 'lampoon_clear_roles') {
        await clearAllRoles(member);

        await interaction.update({
          embeds: [currentSelectionEmbed(member)],
          components: currentSelectionButtons(),
        });

        return;
      }

      if (interaction.customId === 'lampoon_clear_lanes') {
        await clearAllLanes(member);

        await interaction.update({
          embeds: [currentSelectionEmbed(member)],
          components: currentSelectionButtons(),
        });

        return;
      }

      if (interaction.customId === 'lampoon_close') {
        await interaction.update({
          content: 'Selection panel closed.',
          embeds: [],
          components: [],
        });

        return;
      }
    }

    if (interaction.isStringSelectMenu()) {
      const member = interaction.member;

      if (interaction.customId === 'lampoon_role_select') {
        await updateRoleSelection(member, interaction.values);

        await interaction.update({
          embeds: [roleEmbed()],
          components: [
            roleMenu(member),
            ...rolePanelButtons(),
          ],
        });

        return;
      }

      if (interaction.customId === 'lampoon_lane_select') {
        await updateLaneSelection(member, interaction.values);

        await interaction.update({
          embeds: [laneEmbed()],
          components: [
            laneMenu(member),
            ...lanePanelButtons(),
          ],
        });

        return;
      }
    }
  } catch (error) {
    console.error('Interaction error:', error);

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'Something went wrong. Please try again.',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: 'Something went wrong. Please try again.',
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (replyError) {
      console.error('Error response failed:', replyError);
    }
  }
});

client.once('clientReady', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  await registerCommands();
  await sendOrFindPanel();
});

client.on('error', error => {
  console.error('Discord client error:', error);
});

client.login(DISCORD_TOKEN);
