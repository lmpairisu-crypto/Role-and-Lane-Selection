// ==========================================
// LAMPOON ROLE & LANE BOT
// Discord.js v14
// Render + Discord Log System
// ==========================================

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    PermissionsBitField,
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

// ==========================================
// ROLE IDs
// Put these IDs in Render Environment Variables
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
// ROLE DETAILS
// ==========================================

const ROLES = {

    fighter: {
        name: "Fighter",
        emoji: "⚔️",
        description:
            "Durable melee heroes and duelists."
    },

    tank: {
        name: "Tank",
        emoji: "🛡️",
        description:
            "Frontline heroes who protect the team."
    },

    assassin: {
        name: "Assassin",
        emoji: "🗡️",
        description:
            "High-burst heroes who eliminate priority targets."
    },

    mage: {
        name: "Mage",
        emoji: "🔮",
        description:
            "Magic damage and crowd-control specialists."
    },

    marksman: {
        name: "Marksman",
        emoji: "🏹",
        description:
            "Ranged heroes providing consistent damage."
    },

    support: {
        name: "Support",
        emoji: "🛟",
        description:
            "Heroes who protect, empower, heal, or control."
    }

};

// ==========================================
// LANE DETAILS
// ==========================================

const LANES = {

    clashlane: {
        name: "Clashlane",
        emoji: "<:Clashlane:1513825292148277388>",
        description:
            "Solo lane for dueling and split pushing."
    },

    jungler: {
        name: "Jungler",
        emoji: "<:Jungler:1513825401326145546>",
        description:
            "Jungle resources, objectives, and map pressure."
    },

    midlane: {
        name: "Midlane",
        emoji: "<:Midlane:1513825531382988881>",
        description:
            "Wave clearing, rotations, and team fights."
    },

    farmlane: {
        name: "Farmlane",
        emoji: "<:Farmlane:1513825643517968485>",
        description:
            "Gold farming and primary damage."
    },

    roamer: {
        name: "Roamer",
        emoji: "<:Roamer:1513825726212735107>",
        description:
            "Map support, initiation, and team assistance."
    },

    versatile: {
        name: "Versatile",
        emoji: "<:Versatile:1517379377686380594>",
        description:
            "Comfortable adapting to multiple lanes."
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
        .setName("setup-role-lane")
        .setDescription(
            "Create the LAMPOON Role & Lane selection panel."
        )
        .setDefaultMemberPermissions(
            PermissionsBitField.Flags.Administrator
        ),

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
// DISCORD LOG FUNCTION
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
// REGISTER SLASH COMMANDS
// ==========================================

client.once("ready", async () => {

    console.log(
        `✅ Logged in as ${client.user.tag}`
    );

    console.log(
        `🟢 Discord Bot is online.`
    );

    if (LOG_CHANNEL_ID) {

        console.log(
            `📋 Log Channel configured: ${LOG_CHANNEL_ID}`
        );

    } else {

        console.warn(
            "⚠️ LOG_CHANNEL_ID is not configured."
        );

    }

    try {

        const rest = new REST({
            version: "10"
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
            "✅ Slash commands registered successfully."
        );

    } catch (error) {

        console.error(
            "❌ Failed to register slash commands:",
            error
        );

    }

});

// ==========================================
// CREATE ROLE MENU
// ==========================================

function createRoleMenu() {

    const menu =
        new StringSelectMenuBuilder()

            .setCustomId(
                "lampoon_role_select"
            )

            .setPlaceholder(
                "◀️ Choose Your Role"
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

                            .setValue(id)

                            .setEmoji(
                                role.emoji
                            )
                )

            );

    return new ActionRowBuilder()
        .addComponents(menu);

}

// ==========================================
// CREATE LANE MENU
// ==========================================

function createLaneMenu() {

    const menu =
        new StringSelectMenuBuilder()

            .setCustomId(
                "lampoon_lane_select"
            )

            .setPlaceholder(
                "Choose Your Lane ▶️"
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

                            .setValue(id)

                            .setEmoji(
                                lane.emoji
                            )
                )

            );

    return new ActionRowBuilder()
        .addComponents(menu);

}

// ==========================================
// CREATE MAIN EMBED
// ==========================================

function createMainEmbed() {

    return new EmbedBuilder()

        .setTitle(
            "🎭 LAMPOON ROLE & LANE"
        )

        .setDescription(

            "**Please choose your main role and lane.**\n\n" +

            "<:AI:1549055579362828309> Select the Hero Role and Lane that best " +
            "represent your playstyle in Honor of Kings.\n\n" +

            "Your selections will automatically update " +
            "your LAMPOON Discord roles."

        )

        // ==================================
        // LEFT COLUMN — ROLE
        // ==================================

        .addFields({

            name:
                "◀️ 🎭 CHOOSE YOUR ROLE",

            value:

                "⚔️ **Fighter**\n" +
                "Durable fighters and duelists.\n\n" +

                "🛡️ **Tank**\n" +
                "Frontline heroes who protect the team.\n\n" +

                "🗡️ **Assassin**\n" +
                "High-burst priority target eliminators.\n\n" +

                "🔮 **Mage**\n" +
                "Magic damage and control specialists.\n\n" +

                "🏹 **Marksman**\n" +
                "Ranged consistent damage dealers.\n\n" +

                "💠 **Support**\n" +
                "Protect, empower, heal, and control."

        })

        // ==================================
        // RIGHT COLUMN — LANE
        // ==================================

        .addFields({

            name:
                "🛣️ CHOOSE YOUR LANE ▶️",

            value:

                "⚔️ **Clashlane**\n" +
                "Solo lane and dueling.\n\n" +

                "🌲 **Jungler**\n" +
                "Jungle resources and objectives.\n\n" +

                "🔮 **Midlane**\n" +
                "Wave clearing and rotations.\n\n" +

                "🏹 **Farmlane**\n" +
                "Gold farming and primary damage.\n\n" +

                "🛡️ **Roamer**\n" +
                "Map support and initiation.\n\n" +

                "🔄 **Versatile**\n" +
                "Flexible across multiple lanes."

        })

        // ==================================
        // INSTRUCTIONS
        // ==================================

        .addFields({

            name:
                "📌 PLEASE CHOOSE YOUR MAIN ROLE & LANE",

            value:

                "🎭 **Main Role:** Select the Hero Role you mainly play.\n" +
                "🛣️ **Main Lane:** Select the lane you mainly play.\n\n" +

                "💡 You may select multiple roles and lanes " +
                "if they apply to you.\n\n" +

                "👇 Use the selection menus below to update your roles."

        })

        .setFooter({

            text:
                "LAMPOON • Honor of Kings Community"

        })

        .setTimestamp();

}

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

            if (interaction.isChatInputCommand()) {

                // ==================================
                // SETUP
                // ==================================

                if (
                    interaction.commandName ===
                    "setup-role-lane"
                ) {

                    if (
                        !interaction.member.permissions.has(
                            PermissionsBitField.Flags.Administrator
                        )
                    ) {

                        return interaction.reply({

                            content:
                                "❌ You need Administrator permission to use this command.",

                            ephemeral: true

                        });

                    }

                    await interaction.channel.send({

                        embeds: [
                            createMainEmbed()
                        ],

                        components: [

                            createRoleMenu(),
                            createLaneMenu()

                        ]

                    });

                    await sendLog(

                        new EmbedBuilder()

                            .setTitle(
                                "📋 Role & Lane Panel Created"
                            )

                            .setDescription(
                                `${interaction.user} created the LAMPOON Role & Lane panel.`
                            )

                            .addFields({

                                name: "Channel",
                                value:
                                    `${interaction.channel}`

                            })

                            .setTimestamp()

                    );

                    return interaction.reply({

                        content:
                            "✅ LAMPOON Role & Lane selection panel created.",

                        ephemeral: true

                    });

                }

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
                // RESET
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

                return interaction.reply({

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

                    ephemeral: true

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

                return interaction.reply({

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

                    ephemeral: true

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
// ENVIRONMENT VARIABLE VALIDATION
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

// ==========================================
// LOGIN
// ==========================================
console.log("🔄 Attempting Discord login...");
console.log("Token exists:", !!TOKEN);
console.log("Client ID exists:", !!CLIENT_ID);
console.log("Guild ID exists:", !!GUILD_ID);
console.log("Log Channel ID exists:", !!LOG_CHANNEL_ID);

client.once("ready", () => {
    console.log(`🤖 BOT READY: ${client.user.tag}`);
});
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
