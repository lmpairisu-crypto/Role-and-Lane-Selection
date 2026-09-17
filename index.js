// ==========================================
// LAMPOON ROLE & LANE BOT
// Discord.js v14
// Render + GitHub
//
// FEATURES
// - Automatically sends the Role & Lane panel
// - No /setup-role-lane command
// - Two small buttons side-by-side
// - Buttons privately open the dropdown menus
// - Embed thumbnail uses an image URL
// - Prevents duplicate panels
// - Keeps /my-selection and /reset-selection
// ==========================================

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

const http = require("http");

// ==========================================
// ENVIRONMENT VARIABLES
// ==========================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const ROLE_LANE_CHANNEL_ID = process.env.ROLE_LANE_CHANNEL_ID;

// Image URL for the embed thumbnail
const LAMPOON_IMAGE_URL = process.env.LAMPOON_IMAGE_URL;

// ==========================================
// ROLE IDs
// ==========================================

const ROLE_IDS = {

    // HERO ROLES
    fighter: process.env.ROLE_FIGHTER,
    tank: process.env.ROLE_TANK,
    assassin: process.env.ROLE_ASSASSIN,
    mage: process.env.ROLE_MAGE,
    marksman: process.env.ROLE_MARKSMAN,
    support: process.env.ROLE_SUPPORT,

    // LANES
    clashlane: process.env.ROLE_CLASHLANE,
    jungler: process.env.ROLE_JUNGLER,
    midlane: process.env.ROLE_MIDLANE,
    farmlane: process.env.ROLE_FARMLANE,
    roamer: process.env.ROLE_ROAMER,
    versatile: process.env.ROLE_VERSATILE

};

// ==========================================
// HERO ROLE DETAILS
// ==========================================

const ROLES = {

    fighter: {
        name: "Fighter",
        emoji: "⚔️",
        description: "Durable melee heroes and duelists."
    },

    tank: {
        name: "Tank",
        emoji: "🛡️",
        description: "Frontline heroes who protect the team."
    },

    assassin: {
        name: "Assassin",
        emoji: "🗡️",
        description: "High-burst heroes who eliminate priority targets."
    },

    mage: {
        name: "Mage",
        emoji: "🔮",
        description: "Magic damage and crowd-control specialists."
    },

    marksman: {
        name: "Marksman",
        emoji: "🏹",
        description: "Ranged heroes providing consistent damage."
    },

    support: {
        name: "Support",
        emoji: "🛟",
        description: "Heroes who protect, empower, heal, or control."
    }

};

// ==========================================
// LANE DETAILS
// ==========================================

const LANES = {

    clashlane: {
        name: "Clashlane",
        emoji: "<:Clashlane:1513825292148277388>",
        description: "Solo lane for dueling and split pushing."
    },

    jungler: {
        name: "Jungler",
        emoji: "<:Jungler:1513825401326145546>",
        description: "Jungle resources, objectives, and map pressure."
    },

    midlane: {
        name: "Midlane",
        emoji: "<:Midlane:1513825531382988881>",
        description: "Wave clearing, rotations, and team fights."
    },

    farmlane: {
        name: "Farmlane",
        emoji: "<:Farmlane:1513825643517968485>",
        description: "Gold farming and primary damage."
    },

    roamer: {
        name: "Roamer",
        emoji: "<:Roamer:1513825726212735107>",
        description: "Map support, initiation, and team assistance."
    },

    versatile: {
        name: "Versatile",
        emoji: "<:Versatile:1517379377686380594>",
        description: "Comfortable adapting to multiple lanes."
    }

};

// ==========================================
// DISCORD CLIENT
// ==========================================

const client = new Client({

    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]

});

// ==========================================
// RENDER HEALTH SERVER
// ==========================================

const PORT = Number(process.env.PORT) || 10000;

const server = http.createServer((req, res) => {

    if (req.url === "/health") {

        res.writeHead(200, {
            "Content-Type": "text/plain; charset=utf-8"
        });

        return res.end("OK");
    }

    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("LAMPOON Role & Lane Bot is online.");

});

server.listen(PORT, "0.0.0.0", () => {

    console.log(
        `🌐 Render Health Server running on port ${PORT}`
    );

});

// ==========================================
// SLASH COMMANDS
// ==========================================

const commands = [

    new SlashCommandBuilder()
        .setName("my-selection")
        .setDescription(
            "View your current LAMPOON Role & Lane selections."
        ),

    new SlashCommandBuilder()
        .setName("reset-selection")
        .setDescription(
            "Reset all your LAMPOON Role & Lane selections."
        )

].map(command => command.toJSON());

// ==========================================
// SEND LOG
// ==========================================

async function sendLog(embed) {

    try {

        if (!LOG_CHANNEL_ID) {
            return;
        }

        const channel =
            await client.channels.fetch(LOG_CHANNEL_ID);

        if (!channel) {

            console.error(
                "❌ Log channel could not be found."
            );

            return;
        }

        if (!channel.isTextBased()) {

            console.error(
                "❌ LOG_CHANNEL_ID is not a text channel."
            );

            return;
        }

        await channel.send({
            embeds: [embed]
        });

    } catch (error) {

        console.error(
            "❌ Failed to send Discord log:",
            error
        );

    }

}

// ==========================================
// MAIN EMBED
// ==========================================

function createMainEmbed() {

    const embed = new EmbedBuilder()

        .setColor(0x5865F2)

        .setTitle(
            "🎭 LAMPOON • ROLE & LANE"
        )

        .setDescription(

            "Select the **Hero Roles** and **Lanes** " +
            "that match your playstyle.\n\n" +

            "Your selections automatically update " +
            "your LAMPOON Discord roles."

        )

        .addFields(

            {
                name: "🎭 Hero Role",
                value:
                    "Choose the roles you regularly play.",
                inline: true
            },

            {
                name: "🛣️ Lane",
                value:
                    "Choose the lanes you regularly play.",
                inline: true
            }

        )

        .setFooter({

            text:
                "LAMPOON • Honor of Kings Community"

        });

    // Add thumbnail only if the URL exists
    if (LAMPOON_IMAGE_URL) {

        embed.setThumbnail(
            LAMPOON_IMAGE_URL
        );

    }

    return embed;

}

// ==========================================
// MAIN BUTTONS
// ==========================================

function createMainButtons() {

    return new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

                .setCustomId(
                    "lampoon_open_roles"
                )

                .setLabel(
                    "Choose Role"
                )

                .setEmoji(
                    "🎭"
                )

                .setStyle(
                    ButtonStyle.Secondary
                ),

            new ButtonBuilder()

                .setCustomId(
                    "lampoon_open_lanes"
                )

                .setLabel(
                    "Choose Lane"
                )

                .setEmoji(
                    "🛣️"
                )

                .setStyle(
                    ButtonStyle.Secondary
                )

        );

}

// ==========================================
// ROLE DROPDOWN
// ==========================================

function createRoleMenu() {

    const menu =
        new StringSelectMenuBuilder()

            .setCustomId(
                "lampoon_role_select"
            )

            .setPlaceholder(
                "Choose your Hero Roles"
            )

            .setMinValues(0)

            .setMaxValues(6)

            .addOptions(

                Object.entries(ROLES).map(
                    ([id, role]) =>

                        new StringSelectMenuOptionBuilder()

                            .setLabel(
                                role.name
                            )

                            .setDescription(
                                role.description
                            )

                            .setValue(
                                id
                            )

                            .setEmoji(
                                role.emoji
                            )
                )

            );

    return new ActionRowBuilder()
        .addComponents(menu);

}

// ==========================================
// LANE DROPDOWN
// ==========================================

function createLaneMenu() {

    const menu =
        new StringSelectMenuBuilder()

            .setCustomId(
                "lampoon_lane_select"
            )

            .setPlaceholder(
                "Choose your Lanes"
            )

            .setMinValues(0)

            .setMaxValues(6)

            .addOptions(

                Object.entries(LANES).map(
                    ([id, lane]) =>

                        new StringSelectMenuOptionBuilder()

                            .setLabel(
                                lane.name
                            )

                            .setDescription(
                                lane.description
                            )

                            .setValue(
                                id
                            )

                            .setEmoji(
                                lane.emoji
                            )
                )

            );

    return new ActionRowBuilder()
        .addComponents(menu);

}

// ==========================================
// SEND OR FIND PANEL
// ==========================================

async function sendOrFindPanel() {

    try {

        if (!ROLE_LANE_CHANNEL_ID) {

            console.error(
                "❌ ROLE_LANE_CHANNEL_ID is missing from Render."
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
                "❌ ROLE_LANE_CHANNEL_ID is not a valid text channel."
            );

            return;
        }

        // Look through recent messages
        const messages =
            await channel.messages.fetch({
                limit: 100
            });

        const existingPanel =
            messages.find(

                message =>

                    message.author.id ===
                    client.user.id &&

                    message.embeds.some(

                        embed =>
                            embed.title ===
                            "🎭 LAMPOON • ROLE & LANE"

                    )

            );

        if (existingPanel) {

            console.log(
                `✅ Existing Role & Lane panel found: ${existingPanel.id}`
            );

            return;
        }

        // ==================================
        // SEND NEW PANEL
        // ==================================

        const panel =
            await channel.send({

                embeds: [
                    createMainEmbed()
                ],

                components: [
                    createMainButtons()
                ]

            });

        console.log(
            `✅ Role & Lane panel sent: ${panel.id}`
        );

        await sendLog(

            new EmbedBuilder()

                .setColor(
                    0x5865F2
                )

                .setTitle(
                    "📋 Role & Lane Panel Created"
                )

                .setDescription(
                    `The automatic LAMPOON Role & Lane panel was sent to ${channel}.`
                )

                .setTimestamp()

        );

    } catch (error) {

        console.error(
            "❌ Failed to send/find Role & Lane panel:",
            error
        );

    }

}

// ==========================================
// BOT READY
// ==========================================

client.once(
    "clientReady",
    async () => {

        console.log(
            `✅ Logged in as ${client.user.tag}`
        );

        console.log(
            "🟢 Discord Bot is online."
        );

        console.log(
            "Token exists:",
            !!TOKEN
        );

        console.log(
            "Client ID exists:",
            !!CLIENT_ID
        );

        console.log(
            "Guild ID exists:",
            !!GUILD_ID
        );

        console.log(
            "Log Channel ID exists:",
            !!LOG_CHANNEL_ID
        );

        console.log(
            "Role/Lane Channel ID exists:",
            !!ROLE_LANE_CHANNEL_ID
        );

        console.log(
            "Image URL exists:",
            !!LAMPOON_IMAGE_URL
        );

        // ==================================
        // REGISTER COMMANDS
        // ==================================

        try {

            const rest =
                new REST({
                    version: "10"
                })
                .setToken(TOKEN);

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
                "✅ Slash commands registered successfully."
            );

        } catch (error) {

            console.error(
                "❌ Failed to register slash commands:",
                error
            );

        }

        // ==================================
        // AUTOMATIC PANEL
        // ==================================

        await sendOrFindPanel();

    }
);

// ==========================================
// INTERACTION HANDLER
// ==========================================

client.on(
    "interactionCreate",
    async interaction => {

        try {

            // ==================================
            // SLASH COMMANDS
            // ==================================

            if (
                interaction.isChatInputCommand()
            ) {

                // ==================================
                // MY SELECTION
                // ==================================

                if (
                    interaction.commandName ===
                    "my-selection"
                ) {

                    const member =
                        interaction.member;

                    const roleNames =
                        Object.entries(ROLES)

                            .filter(
                                ([id]) =>
                                    ROLE_IDS[id] &&
                                    member.roles.cache.has(
                                        ROLE_IDS[id]
                                    )
                            )

                            .map(
                                ([id, role]) =>
                                    `${role.emoji} ${role.name}`
                            );

                    const laneNames =
                        Object.entries(LANES)

                            .filter(
                                ([id]) =>
                                    ROLE_IDS[id] &&
                                    member.roles.cache.has(
                                        ROLE_IDS[id]
                                    )
                            )

                            .map(
                                ([id, lane]) =>
                                    `${lane.emoji} ${lane.name}`
                            );

                    const embed =
                        new EmbedBuilder()

                            .setColor(
                                0x5865F2
                            )

                            .setTitle(
                                "🎭 Your LAMPOON Selection"
                            )

                            .addFields(

                                {
                                    name:
                                        "🎭 Hero Roles",

                                    value:
                                        roleNames.length
                                            ? roleNames.join("\n")
                                            : "None selected."
                                },

                                {
                                    name:
                                        "🛣️ Lanes",

                                    value:
                                        laneNames.length
                                            ? laneNames.join("\n")
                                            : "None selected."
                                }

                            )

                            .setTimestamp();

                    return interaction.reply({

                        embeds: [
                            embed
                        ],

                        ephemeral: true

                    });

                }

                // ==================================
                // RESET SELECTION
                // ==================================

                if (
                    interaction.commandName ===
                    "reset-selection"
                ) {

                    const member =
                        interaction.member;

                    const allIds = [

                        ...Object.keys(ROLES),

                        ...Object.keys(LANES)

                    ];

                    let removed = 0;

                    for (
                        const id of allIds
                    ) {

                        const discordRoleId =
                            ROLE_IDS[id];

                        if (
                            discordRoleId &&
                            member.roles.cache.has(
                                discordRoleId
                            )
                        ) {

                            await member.roles.remove(
                                discordRoleId
                            );

                            removed++;

                        }

                    }

                    await sendLog(

                        new EmbedBuilder()

                            .setColor(
                                0x5865F2
                            )

                            .setTitle(
                                "🔄 Selection Reset"
                            )

                            .setDescription(
                                `${interaction.user} reset their LAMPOON Role & Lane selections.`
                            )

                            .addFields({

                                name:
                                    "Roles Removed",

                                value:
                                    `${removed}`

                            })

                            .setTimestamp()

                    );

                    return interaction.reply({

                        content:

                            `🔄 Your LAMPOON selections have been reset.\n\n` +

                            `Roles removed: **${removed}**`,

                        ephemeral: true

                    });

                }

            }

            // ==================================
            // CHOOSE ROLE BUTTON
            // ==================================

            if (

                interaction.isButton() &&

                interaction.customId ===
                    "lampoon_open_roles"

            ) {

                return interaction.reply({

                    content:
                        "🎭 Select your Hero Roles:",

                    components: [
                        createRoleMenu()
                    ],

                    ephemeral: true

                });

            }

            // ==================================
            // CHOOSE LANE BUTTON
            // ==================================

            if (

                interaction.isButton() &&

                interaction.customId ===
                    "lampoon_open_lanes"

            ) {

                return interaction.reply({

                    content:
                        "🛣️ Select your Lanes:",

                    components: [
                        createLaneMenu()
                    ],

                    ephemeral: true

                });

            }

            // ==================================
            // ROLE SELECT
            // ==================================

            if (

                interaction.isStringSelectMenu() &&

                interaction.customId ===
                    "lampoon_role_select"

            ) {

                const member =
                    interaction.member;

                const selected =
                    interaction.values;

                for (
                    const [id] of
                    Object.entries(ROLES)
                ) {

                    const discordRoleId =
                        ROLE_IDS[id];

                    if (!discordRoleId) {
                        continue;
                    }

                    if (
                        selected.includes(id)
                    ) {

                        if (
                            !member.roles.cache.has(
                                discordRoleId
                            )
                        ) {

                            await member.roles.add(
                                discordRoleId
                            );

                        }

                    } else {

                        if (
                            member.roles.cache.has(
                                discordRoleId
                            )
                        ) {

                            await member.roles.remove(
                                discordRoleId
                            );

                        }

                    }

                }

                await sendLog(

                    new EmbedBuilder()

                        .setColor(
                            0x5865F2
                        )

                        .setTitle(
                            "🎭 Hero Role Selection"
                        )

                        .setDescription(
                            `${interaction.user} updated their Hero Roles.`
                        )

                        .addFields({

                            name:
                                "Selected Roles",

                            value:
                                selected.length

                                    ? selected
                                        .map(
                                            id =>
                                                `${ROLES[id].emoji} ${ROLES[id].name}`
                                        )
                                        .join("\n")

                                    : "None selected."

                        })

                        .setTimestamp()

                );

                return interaction.update({

                    content:

                        `🎭 **Role selection updated!**\n\n` +

                        (

                            selected.length

                                ? selected
                                    .map(
                                        id =>
                                            `${ROLES[id].emoji} ${ROLES[id].name}`
                                    )
                                    .join(" • ")

                                : "No roles selected."

                        ),

                    components: []

                });

            }

            // ==================================
            // LANE SELECT
            // ==================================

            if (

                interaction.isStringSelectMenu() &&

                interaction.customId ===
                    "lampoon_lane_select"

            ) {

                const member =
                    interaction.member;

                const selected =
                    interaction.values;

                for (
                    const [id] of
                    Object.entries(LANES)
                ) {

                    const discordRoleId =
                        ROLE_IDS[id];

                    if (!discordRoleId) {
                        continue;
                    }

                    if (
                        selected.includes(id)
                    ) {

                        if (
                            !member.roles.cache.has(
                                discordRoleId
                            )
                        ) {

                            await member.roles.add(
                                discordRoleId
                            );

                        }

                    } else {

                        if (
                            member.roles.cache.has(
                                discordRoleId
                            )
                        ) {

                            await member.roles.remove(
                                discordRoleId
                            );

                        }

                    }

                }

                await sendLog(

                    new EmbedBuilder()

                        .setColor(
                            0x5865F2
                        )

                        .setTitle(
                            "🛣️ Lane Selection"
                        )

                        .setDescription(
                            `${interaction.user} updated their Lanes.`
                        )

                        .addFields({

                            name:
                                "Selected Lanes",

                            value:
                                selected.length

                                    ? selected
                                        .map(
                                            id =>
                                                `${LANES[id].emoji} ${LANES[id].name}`
                                        )
                                        .join("\n")

                                    : "None selected."

                        })

                        .setTimestamp()

                );

                return interaction.update({

                    content:

                        `🛣️ **Lane selection updated!**\n\n` +

                        (

                            selected.length

                                ? selected
                                    .map(
                                        id =>
                                            `${LANES[id].emoji} ${LANES[id].name}`
                                    )
                                    .join(" • ")

                                : "No lanes selected."

                        ),

                    components: []

                });

            }

        } catch (error) {

            console.error(
                "❌ Interaction Error:",
                error
            );

            try {

                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    await interaction.reply({

                        content:
                            "❌ Something went wrong while processing your request.",

                        ephemeral: true

                    });

                }

            } catch (replyError) {

                console.error(
                    "❌ Failed to send error reply:",
                    replyError
                );

            }

        }

    }
);

// ==========================================
// DISCORD CLIENT ERROR
// ==========================================

client.on(
    "error",
    error => {

        console.error(
            "❌ Discord Client Error:",
            error
        );

    }
);

// ==========================================
// ENVIRONMENT VALIDATION
// ==========================================

if (!TOKEN) {

    console.error(
        "❌ DISCORD_TOKEN is missing from Render."
    );

    process.exit(1);

}

if (!CLIENT_ID) {

    console.error(
        "❌ CLIENT_ID is missing from Render."
    );

    process.exit(1);

}

if (!GUILD_ID) {

    console.error(
        "❌ GUILD_ID is missing from Render."
    );

    process.exit(1);

}

if (!ROLE_LANE_CHANNEL_ID) {

    console.error(
        "❌ ROLE_LANE_CHANNEL_ID is missing from Render."
    );

    process.exit(1);

}

if (!LAMPOON_IMAGE_URL) {

    console.warn(
        "⚠️ LAMPOON_IMAGE_URL is missing. The embed will have no thumbnail."
    );

}

// ==========================================
// LOGIN
// ==========================================

console.log(
    "🔄 Attempting Discord login..."
);

client.login(TOKEN)

    .then(() => {

        console.log(
            "🔐 Discord login successful."
        );

    })

    .catch(error => {

        console.error(
            "❌ Discord login failed:",
            error
        );

        process.exit(1);

    });
