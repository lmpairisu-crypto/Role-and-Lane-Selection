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

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const ROLE_LANE_CHANNEL_ID = process.env.ROLE_LANE_CHANNEL_ID;
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
    versatile: process.env.ROLE_VERSATILE
};

// =====================================================
// HERO ROLES
// =====================================================

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

// =====================================================
// LANES
// =====================================================

const LANES = {
    clashlane: {
        name: "Clashlane",
        emoji: "<:clashlane:1550553783304589443>",
        description: "Solo lane for dueling and split pushing."
    },

    jungler: {
        name: "Jungler",
        emoji: "<:jungler:1550553875562500248>",
        description: "Jungle resources, objectives, and map pressure."
    },

    midlane: {
        name: "Midlane",
        emoji: "<:midlane:1550553955501871124>",
        description: "Wave clearing, rotations, and team fights."
    },

    farmlane: {
        name: "Farmlane",
        emoji: "<:farmlane:1550554057448361984>",
        description: "Gold farming and primary damage."
    },

    roamer: {
        name: "Roamer",
        emoji: "<:roamer:1550554124473466920>",
        description: "Map support, initiation, and team assistance."
    },

    versatile: {
        name: "Versatile",
        emoji: "<:versatile:1550554190496014366>",
        description: "Comfortable adapting to multiple lanes."
    }
};

// =====================================================
// DISCORD CLIENT
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// =====================================================
// RENDER HEALTH SERVER
// =====================================================

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
    console.log(`🌐 Render Health Server running on port ${PORT}`);
});

// =====================================================
// MAIN EMBED
// =====================================================

function createMainEmbed() {
    const embed = new EmbedBuilder()
        .setColor(0x3299DB)
        .setTitle("⚔️ ROLE & 🛣️ LANE SELECTION")
        .setDescription(
            "**Your selection automatically updates your LAMPOON Discord roles.**\n\n" +
            "⚔️ **Role**\n" +
            "Choose your comfortable Hero Role in-game.\n\n" +
            "🛣️ **Lane**\n" +
            "Choose your comfortable Lane Role to gain its corresponding color in the server.\n\n" +
            "You can change your Role or Lane anytime."
        )
        .setFooter({
            text: "LAMPOON • Role & Lane Selection"
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
    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("lampoon_open_roles")
                .setLabel("Choose Role")
                .setEmoji("⚔️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("lampoon_open_lanes")
                .setLabel("Choose Lane")
                .setEmoji("🛣️")
                .setStyle(ButtonStyle.Secondary)

        );
}

// =====================================================
// ROLE DROPDOWN
// =====================================================

function createRoleMenu() {
    const menu = new StringSelectMenuBuilder()
        .setCustomId("lampoon_role_select")
        .setPlaceholder("Choose your Hero Roles")
        .setMinValues(0)
        .setMaxValues(6)
        .addOptions(

            Object.entries(ROLES).map(([id, role]) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(role.name)
                    .setDescription(role.description)
                    .setValue(id)
                    .setEmoji(role.emoji)
            )

        );

    return new ActionRowBuilder().addComponents(menu);
}

// =====================================================
// LANE DROPDOWN
// =====================================================

function createLaneMenu() {
    const menu = new StringSelectMenuBuilder()
        .setCustomId("lampoon_lane_select")
        .setPlaceholder("Choose your Lanes")
        .setMinValues(0)
        .setMaxValues(6)
        .addOptions(

            Object.entries(LANES).map(([id, lane]) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(lane.name)
                    .setDescription(lane.description)
                    .setValue(id)
                    .setEmoji(lane.emoji)
            )

        );

    return new ActionRowBuilder().addComponents(menu);
}

// =====================================================
// LOGGING
// =====================================================

async function sendLog(embed) {
    if (!LOG_CHANNEL_ID) return;

    try {
        const channel = await client.channels.fetch(LOG_CHANNEL_ID);

        if (channel) {
            await channel.send({
                embeds: [embed]
            });
        }

    } catch (error) {
        console.error("❌ Failed to send log:", error);
    }
}

// =====================================================
// FIND OR CREATE PANEL
// =====================================================

async function sendOrFindPanel() {
    try {
        const channel = await client.channels.fetch(
            ROLE_LANE_CHANNEL_ID
        );

        if (!channel) {
            console.error("❌ Role & Lane channel not found.");
            return;
        }

        const messages = await channel.messages.fetch({
            limit: 100
        });

        const existingPanel = messages.find(message =>
            message.author.id === client.user.id &&
            message.embeds.length > 0 &&
            message.embeds[0].title === "⚔️ ROLE & 🛣️ LANE SELECTION"
        );

        if (existingPanel) {
            console.log(
                `✅ Existing Role & Lane panel found: ${existingPanel.id}`
            );

            return;
        }

        const panel = await channel.send({
            embeds: [createMainEmbed()],
            components: [createMainButtons()]
        });

        console.log(
            `✅ New Role & Lane panel sent: ${panel.id}`
        );

    } catch (error) {
        console.error(
            "❌ Failed to send/find Role & Lane panel:",
            error
        );
    }
}

// =====================================================
// SLASH COMMANDS
// =====================================================

const commands = [

    new SlashCommandBuilder()
        .setName("my-selection")
        .setDescription(
            "View your current Hero Role and Lane selections."
        ),

    new SlashCommandBuilder()
        .setName("reset-selection")
        .setDescription(
            "Reset all of your Hero Role and Lane selections."
        )

].map(command => command.toJSON());

// =====================================================
// READY
// =====================================================

client.once("ready", async () => {

    console.log(`🤖 Logged in as ${client.user.tag}`);
    console.log(`🆔 Bot ID: ${client.user.id}`);

    console.log(
        `🎭 Role & Lane Channel: ${
            ROLE_LANE_CHANNEL_ID ? "OK" : "MISSING"
        }`
    );

    console.log(
        `🖼️ GIF URL: ${
            LAMPOON_GIF_URL ? "OK" : "MISSING"
        }`
    );

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

        console.log("✅ Slash commands registered.");

    } catch (error) {

        console.error(
            "❌ Failed to register slash commands:",
            error
        );

    }

    await sendOrFindPanel();
});

// =====================================================
// INTERACTIONS
// =====================================================

client.on("interactionCreate", async interaction => {

    // =================================================
    // SLASH COMMANDS
    // =================================================

    if (interaction.isChatInputCommand()) {

        // ---------------------------------------------
        // /my-selection
        // ---------------------------------------------

        if (interaction.commandName === "my-selection") {

            const member = interaction.member;

            const selectedRoles = [];
            const selectedLanes = [];

            for (const [id, role] of Object.entries(ROLES)) {

                const roleId = ROLE_IDS[id];

                if (
                    roleId &&
                    member.roles.cache.has(roleId)
                ) {
                    selectedRoles.push(
                        `${role.emoji} **${role.name}**`
                    );
                }
            }

            for (const [id, lane] of Object.entries(LANES)) {

                const roleId = ROLE_IDS[id];

                if (
                    roleId &&
                    member.roles.cache.has(roleId)
                ) {
                    selectedLanes.push(
                        `${lane.emoji} **${lane.name}**`
                    );
                }
            }

            const embed = new EmbedBuilder()
                .setColor(0x3299DB)
                .setTitle("📋 YOUR LAMPOON SELECTION")
                .setDescription(
                    `**⚔️ Hero Roles**\n` +
                    (
                        selectedRoles.length
                            ? selectedRoles.join("\n")
                            : "None selected."
                    ) +
                    `\n\n**🛣️ Lanes**\n` +
                    (
                        selectedLanes.length
                            ? selectedLanes.join("\n")
                            : "None selected."
                    )
                )
                .setFooter({
                    text: "LAMPOON • Role & Lane Selection"
                });

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        // ---------------------------------------------
        // /reset-selection
        // ---------------------------------------------

        if (
            interaction.commandName === "reset-selection"
        ) {

            const member = interaction.member;

            const rolesToRemove = [];

            for (const id of Object.keys(ROLES)) {

                const roleId = ROLE_IDS[id];

                if (
                    roleId &&
                    member.roles.cache.has(roleId)
                ) {
                    rolesToRemove.push(roleId);
                }
            }

            for (const id of Object.keys(LANES)) {

                const roleId = ROLE_IDS[id];

                if (
                    roleId &&
                    member.roles.cache.has(roleId)
                ) {
                    rolesToRemove.push(roleId);
                }
            }

            if (rolesToRemove.length > 0) {

                try {

                    await member.roles.remove(
                        rolesToRemove
                    );

                } catch (error) {

                    console.error(
                        "❌ Failed to reset roles:",
                        error
                    );

                    return interaction.reply({
                        content:
                            "❌ I couldn't reset your roles. Please check my **Manage Roles** permission and role hierarchy.",
                        ephemeral: true
                    });

                }
            }

            const logEmbed = new EmbedBuilder()
                .setColor(0x3299DB)
                .setTitle("🔄 SELECTION RESET")
                .setDescription(
                    `${interaction.user} reset their Role & Lane selection.`
                )
                .setTimestamp();

            await sendLog(logEmbed);

            return interaction.reply({
                content:
                    "✅ Your Hero Roles and Lanes have been reset.",
                ephemeral: true
            });
        }
    }

    // =================================================
    // BUTTONS
    // =================================================

    if (interaction.isButton()) {

        // ---------------------------------------------
        // CHOOSE ROLE
        // ---------------------------------------------

        if (
            interaction.customId ===
            "lampoon_open_roles"
        ) {

            return interaction.reply({
                content:
                    "⚔️ **CHOOSE YOUR ROLE**\n\n" +
                    "Select the Hero Roles you are comfortable playing in-game.",
                components: [createRoleMenu()],
                ephemeral: true
            });
        }

        // ---------------------------------------------
        // CHOOSE LANE
        // ---------------------------------------------

        if (
            interaction.customId ===
            "lampoon_open_lanes"
        ) {

            return interaction.reply({
                content:
                    "🛣️ **CHOOSE YOUR LANE**\n\n" +
                    "Select the Lane Roles you are comfortable playing in-game.",
                components: [createLaneMenu()],
                ephemeral: true
            });
        }
    }

    // =================================================
    // HERO ROLE SELECT
    // =================================================

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId ===
            "lampoon_role_select"
    ) {

        const member = interaction.member;
        const selected = interaction.values;

        try {

            for (const [id] of Object.entries(ROLES)) {

                const roleId = ROLE_IDS[id];

                if (!roleId) continue;

                if (selected.includes(id)) {

                    if (
                        !member.roles.cache.has(roleId)
                    ) {
                        await member.roles.add(roleId);
                    }

                } else {

                    if (
                        member.roles.cache.has(roleId)
                    ) {
                        await member.roles.remove(roleId);
                    }
                }
            }

            const selectedNames = selected.length
                ? selected
                    .map(id => ROLES[id].name)
                    .join(", ")
                : "None";

            const logEmbed = new EmbedBuilder()
                .setColor(0x3299DB)
                .setTitle("⚔️ HERO ROLE UPDATED")
                .setDescription(
                    `${interaction.user} updated their Hero Role selection.\n\n` +
                    `**Selected:** ${selectedNames}`
                )
                .setTimestamp();

            await sendLog(logEmbed);

            return interaction.update({
                content:
                    "✅ **Hero Role selection updated!**\n\n" +
                    "Your Discord roles have been updated.",
                components: [createRoleMenu()]
            });

        } catch (error) {

            console.error(
                "❌ Failed to update Hero Roles:",
                error
            );

            return interaction.update({
                content:
                    "❌ I couldn't update your Hero Roles. Please check my **Manage Roles** permission and role hierarchy.",
                components: []
            });
        }
    }

    // =================================================
    // LANE SELECT
    // =================================================

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId ===
            "lampoon_lane_select"
    ) {

        const member = interaction.member;
        const selected = interaction.values;

        try {

            for (const [id] of Object.entries(LANES)) {

                const roleId = ROLE_IDS[id];

                if (!roleId) continue;

                if (selected.includes(id)) {

                    if (
                        !member.roles.cache.has(roleId)
                    ) {
                        await member.roles.add(roleId);
                    }

                } else {

                    if (
                        member.roles.cache.has(roleId)
                    ) {
                        await member.roles.remove(roleId);
                    }
                }
            }

            const selectedNames = selected.length
                ? selected
                    .map(id => LANES[id].name)
                    .join(", ")
                : "None";

            const logEmbed = new EmbedBuilder()
                .setColor(0x3299DB)
                .setTitle("🛣️ LANE UPDATED")
                .setDescription(
                    `${interaction.user} updated their Lane selection.\n\n` +
                    `**Selected:** ${selectedNames}`
                )
                .setTimestamp();

            await sendLog(logEmbed);

            return interaction.update({
                content:
                    "✅ **Lane selection updated!**\n\n" +
                    "Your Discord roles have been updated.",
                components: [createLaneMenu()]
            });

        } catch (error) {

            console.error(
                "❌ Failed to update Lanes:",
                error
            );

            return interaction.update({
                content:
                    "❌ I couldn't update your Lanes. Please check my **Manage Roles** permission and role hierarchy.",
                components: []
            });
        }
    }
});

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

if (!TOKEN) {
    console.error("❌ DISCORD_TOKEN is missing.");
}

if (!CLIENT_ID) {
    console.error("❌ CLIENT_ID is missing.");
}

if (!GUILD_ID) {
    console.error("❌ GUILD_ID is missing.");
}

if (!ROLE_LANE_CHANNEL_ID) {
    console.error(
        "❌ ROLE_LANE_CHANNEL_ID is missing."
    );
}

if (!LAMPOON_GIF_URL) {
    console.warn(
        "⚠️ LAMPOON_GIF_URL is missing. The embed will have no GIF thumbnail."
    );
}

// =====================================================
// REQUIRED ROLE VARIABLES
// =====================================================

const requiredRoleVariables = [

    "ROLE_FIGHTER",
    "ROLE_TANK",
    "ROLE_ASSASSIN",
    "ROLE_MAGE",
    "ROLE_MARKSMAN",
    "ROLE_SUPPORT",

    "ROLE_CLASHLANE",
    "ROLE_JUNGLER",
    "ROLE_MIDLANE",
    "ROLE_FARMLANE",
    "ROLE_ROAMER",
    "ROLE_VERSATILE"

];

for (const variable of requiredRoleVariables) {

    if (!process.env[variable]) {
        console.warn(
            `⚠️ ${variable} is missing.`
        );
    }
}

// =====================================================
// LOGIN
// =====================================================

client.login(TOKEN);
