const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
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
        GatewayIntentBits.Guilds
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
            "◀️ **Role**\n" +
            "Choose your comfortable Hero Role in-game.\n\n" +
            "▶️ **Lane**\n" +
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
    return new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId("lampoon_open_roles")
            .setLabel("Choose Role")
            .setEmoji("◀️")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("lampoon_open_lanes")
            .setLabel("Choose Lane")
            .setEmoji("▶️")
            .setStyle(ButtonStyle.Secondary)

    );
}

// =====================================================
// ROLE POPUP EMBED
// =====================================================

function createRolePopupEmbed(member) {

    const selected = Object.entries(ROLES)
        .filter(([id]) => {

            const roleId = ROLE_IDS[id];

            return (
                roleId &&
                member.roles.cache.has(roleId)
            );

        })
        .map(([, role]) =>
            `${role.emoji} **${role.name}**`
        );

    return new EmbedBuilder()
        .setColor(0x3299DB)
        .setTitle("⚔️ CHOOSE YOUR ROLE")
        .setDescription(

            "Select the Hero Roles you are comfortable playing in-game.\n\n" +

            "**Available Roles**\n" +

            Object.entries(ROLES)
                .map(([, role]) =>
                    `${role.emoji} **${role.name}** — ${role.description}`
                )
                .join("\n") +

            "\n\n**Currently Selected**\n" +

            (
                selected.length
                    ? selected.join(", ")
                    : "None selected."
            )

        )
        .setFooter({
            text: "Click a role to add or remove it."
        });
}

// =====================================================
// LANE POPUP EMBED
// =====================================================

function createLanePopupEmbed(member) {

    const selected = Object.entries(LANES)
        .filter(([id]) => {

            const roleId = ROLE_IDS[id];

            return (
                roleId &&
                member.roles.cache.has(roleId)
            );

        })
        .map(([, lane]) =>
            `${lane.emoji} **${lane.name}**`
        );

    return new EmbedBuilder()
        .setColor(0x3299DB)
        .setTitle("🛣️ CHOOSE YOUR LANE")
        .setDescription(

            "Select the Lane Roles you are comfortable playing in-game.\n\n" +

            "**Available Lanes**\n" +

            Object.entries(LANES)
                .map(([, lane]) =>
                    `${lane.emoji} **${lane.name}** — ${lane.description}`
                )
                .join("\n") +

            "\n\n**Currently Selected**\n" +

            (
                selected.length
                    ? selected.join(", ")
                    : "None selected."
            )

        )
        .setFooter({
            text: "Click a lane to add or remove it."
        });
}

// =====================================================
// ROLE BUTTONS
// =====================================================

function createRoleButtons(member) {

    const entries = Object.entries(ROLES);
    const rows = [];

    for (let i = 0; i < entries.length; i += 3) {

        const row = new ActionRowBuilder();

        entries
            .slice(i, i + 3)
            .forEach(([id, role]) => {

                const roleId = ROLE_IDS[id];

                const selected =
                    roleId &&
                    member.roles.cache.has(roleId);

                row.addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `lampoon_role_${id}`
                        )
                        .setLabel(role.name)
                        .setEmoji(role.emoji)
                        .setStyle(
                            selected
                                ? ButtonStyle.Success
                                : ButtonStyle.Secondary
                        )

                );

            });

        rows.push(row);
    }

    rows.push(

        new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(
                    "lampoon_close_role_popup"
                )
                .setLabel("Done")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Primary)

        )

    );

    return rows;
}

// =====================================================
// LANE BUTTONS
// =====================================================

function createLaneButtons(member) {

    const entries = Object.entries(LANES);
    const rows = [];

    for (let i = 0; i < entries.length; i += 3) {

        const row = new ActionRowBuilder();

        entries
            .slice(i, i + 3)
            .forEach(([id, lane]) => {

                const roleId = ROLE_IDS[id];

                const selected =
                    roleId &&
                    member.roles.cache.has(roleId);

                row.addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `lampoon_lane_${id}`
                        )
                        .setLabel(lane.name)
                        .setEmoji(lane.emoji)
                        .setStyle(
                            selected
                                ? ButtonStyle.Success
                                : ButtonStyle.Secondary
                        )

                );

            });

        rows.push(row);
    }

    rows.push(

        new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(
                    "lampoon_close_lane_popup"
                )
                .setLabel("Done")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Primary)

        )

    );

    return rows;
}

// =====================================================
// LOGGING
// =====================================================

async function sendLog(embed) {

    if (!LOG_CHANNEL_ID) return;

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
            "❌ Failed to send log:",
            error
        );

    }
}

// =====================================================
// FIND OR CREATE MAIN PANEL
// =====================================================

async function sendOrFindPanel() {

    try {

        if (!ROLE_LANE_CHANNEL_ID) {

            console.error(
                "❌ ROLE_LANE_CHANNEL_ID is missing."
            );

            return;
        }

        console.log(
            `🔎 Fetching Role & Lane channel: ${ROLE_LANE_CHANNEL_ID}`
        );

        const channel =
            await client.channels.fetch(
                ROLE_LANE_CHANNEL_ID
            );

        if (!channel) {

            console.error(
                "❌ Role & Lane channel not found."
            );

            return;
        }

        if (!channel.isTextBased()) {

            console.error(
                "❌ ROLE_LANE_CHANNEL_ID is not a text-based channel."
            );

            return;
        }

        const permissions =
            channel.permissionsFor(
                client.user
            );

        if (permissions) {

            console.log(
                `📌 View Channel: ${permissions.has("ViewChannel")}`
            );

            console.log(
                `📌 Send Messages: ${permissions.has("SendMessages")}`
            );

            console.log(
                `📌 Embed Links: ${permissions.has("EmbedLinks")}`
            );

            console.log(
                `📌 Read Message History: ${permissions.has("ReadMessageHistory")}`
            );

        }

        const messages =
            await channel.messages.fetch({
                limit: 100
            });

        const existingPanel =
            messages.find(message =>

                message.author.id ===
                    client.user.id &&

                message.embeds.length > 0 &&

                message.embeds[0].title ===
                    "⚔️ ROLE & 🛣️ LANE SELECTION"

            );

        if (existingPanel) {

            console.log(
                `✅ Existing Role & Lane panel found: ${existingPanel.id}`
            );

            return;
        }

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
            `✅ New Role & Lane panel sent: ${panel.id}`
        );

    } catch (error) {

        console.error(
            "❌ FAILED TO SEND ROLE & LANE PANEL:"
        );

        console.error(error);

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

].map(command =>
    command.toJSON()
);

// =====================================================
// READY
// =====================================================

client.once("ready", async () => {

    console.log(
        `🤖 Logged in as ${client.user.tag}`
    );

    console.log(
        `🆔 Bot ID: ${client.user.id}`
    );

    console.log(
        `🎭 Role & Lane Channel: ${
            ROLE_LANE_CHANNEL_ID
                ? "OK"
                : "MISSING"
        }`
    );

    console.log(
        `🖼️ GIF URL: ${
            LAMPOON_GIF_URL
                ? "OK"
                : "MISSING"
        }`
    );

    try {

        const rest =
            new REST({
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
            "✅ Slash commands registered."
        );

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

client.on(
    "interactionCreate",
    async interaction => {

        // =================================================
        // SLASH COMMANDS
        // =================================================

        if (
            interaction.isChatInputCommand()
        ) {

            // ---------------------------------------------
            // /my-selection
            // ---------------------------------------------

            if (
                interaction.commandName ===
                "my-selection"
            ) {

                const member =
                    interaction.member;

                const selectedRoles = [];
                const selectedLanes = [];

                for (
                    const [id, role]
                    of Object.entries(ROLES)
                ) {

                    const roleId =
                        ROLE_IDS[id];

                    if (
                        roleId &&
                        member.roles.cache.has(
                            roleId
                        )
                    ) {

                        selectedRoles.push(
                            `${role.emoji} **${role.name}**`
                        );

                    }

                }

                for (
                    const [id, lane]
                    of Object.entries(LANES)
                ) {

                    const roleId =
                        ROLE_IDS[id];

                    if (
                        roleId &&
                        member.roles.cache.has(
                            roleId
                        )
                    ) {

                        selectedLanes.push(
                            `${lane.emoji} **${lane.name}**`
                        );

                    }

                }

                const embed =
                    new EmbedBuilder()
                        .setColor(0x3299DB)
                        .setTitle(
                            "📋 YOUR LAMPOON SELECTION"
                        )
                        .setDescription(

                            "**⚔️ Hero Roles**\n" +

                            (
                                selectedRoles.length
                                    ? selectedRoles.join("\n")
                                    : "None selected."
                            ) +

                            "\n\n**🛣️ Lanes**\n" +

                            (
                                selectedLanes.length
                                    ? selectedLanes.join("\n")
                                    : "None selected."
                            )

                        )
                        .setFooter({
                            text:
                                "LAMPOON • Role & Lane Selection"
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
                interaction.commandName ===
                "reset-selection"
            ) {

                const member =
                    interaction.member;

                const rolesToRemove = [];

                for (
                    const id
                    of Object.keys(ROLES)
                ) {

                    const roleId =
                        ROLE_IDS[id];

                    if (
                        roleId &&
                        member.roles.cache.has(
                            roleId
                        )
                    ) {

                        rolesToRemove.push(
                            roleId
                        );

                    }

                }

                for (
                    const id
                    of Object.keys(LANES)
                ) {

                    const roleId =
                        ROLE_IDS[id];

                    if (
                        roleId &&
                        member.roles.cache.has(
                            roleId
                        )
                    ) {

                        rolesToRemove.push(
                            roleId
                        );

                    }

                }

                if (
                    rolesToRemove.length > 0
                ) {

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

                const logEmbed =
                    new EmbedBuilder()
                        .setColor(0x3299DB)
                        .setTitle(
                            "🔄 SELECTION RESET"
                        )
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

        if (
            interaction.isButton()
        ) {

            // ---------------------------------------------
            // OPEN ROLE POPUP
            // ---------------------------------------------

            if (
                interaction.customId ===
                "lampoon_open_roles"
            ) {

                const member =
                    interaction.member;

                return interaction.reply({

                    embeds: [
                        createRolePopupEmbed(
                            member
                        )
                    ],

                    components:
                        createRoleButtons(
                            member
                        ),

                    ephemeral: true

                });

            }

            // ---------------------------------------------
            // OPEN LANE POPUP
            // ---------------------------------------------

            if (
                interaction.customId ===
                "lampoon_open_lanes"
            ) {

                const member =
                    interaction.member;

                return interaction.reply({

                    embeds: [
                        createLanePopupEmbed(
                            member
                        )
                    ],

                    components:
                        createLaneButtons(
                            member
                        ),

                    ephemeral: true

                });

            }

            // ---------------------------------------------
            // CLOSE ROLE POPUP
            // ---------------------------------------------

            if (
                interaction.customId ===
                "lampoon_close_role_popup"
            ) {

                return interaction.update({

                    content:
                        "✅ **Role selection saved.**\nYou can click ◀️ **Choose Role** again anytime to change it.",

                    embeds: [],

                    components: []

                });

            }

            // ---------------------------------------------
            // CLOSE LANE POPUP
            // ---------------------------------------------

            if (
                interaction.customId ===
                "lampoon_close_lane_popup"
            ) {

                return interaction.update({

                    content:
                        "✅ **Lane selection saved.**\nYou can click **Choose Lane ▶️** again anytime to change it.",

                    embeds: [],

                    components: []

                });

            }

            // =================================================
            // ROLE BUTTON
            // =================================================

            if (
                interaction.customId.startsWith(
                    "lampoon_role_"
                )
            ) {

                const id =
                    interaction.customId.replace(
                        "lampoon_role_",
                        ""
                    );

                const role =
                    ROLES[id];

                const roleId =
                    ROLE_IDS[id];

                if (
                    !role ||
                    !roleId
                ) {

                    return interaction.reply({

                        content:
                            "❌ This role is not configured correctly.",

                        ephemeral: true

                    });

                }

                const member =
                    interaction.member;

                try {

                    if (
                        member.roles.cache.has(
                            roleId
                        )
                    ) {

                        await member.roles.remove(
                            roleId
                        );

                    } else {

                        await member.roles.add(
                            roleId
                        );

                    }

                    const freshMember =
                        await interaction.guild.members.fetch(
                            interaction.user.id
                        );

                    const selectedNames =
                        Object.entries(ROLES)
                            .filter(
                                ([roleKey]) => {

                                    const configuredRoleId =
                                        ROLE_IDS[
                                            roleKey
                                        ];

                                    return (
                                        configuredRoleId &&
                                        freshMember.roles.cache.has(
                                            configuredRoleId
                                        )
                                    );

                                }
                            )
                            .map(
                                ([, item]) =>
                                    item.name
                            );

                    const logEmbed =
                        new EmbedBuilder()
                            .setColor(0x3299DB)
                            .setTitle(
                                "⚔️ HERO ROLE UPDATED"
                            )
                            .setDescription(

                                `${interaction.user} updated their Hero Role selection.\n\n` +

                                `**Selected:** ${
                                    selectedNames.length
                                        ? selectedNames.join(", ")
                                        : "None"
                                }`

                            )
                            .setTimestamp();

                    await sendLog(
                        logEmbed
                    );

                    return interaction.update({

                        embeds: [
                            createRolePopupEmbed(
                                freshMember
                            )
                        ],

                        components:
                            createRoleButtons(
                                freshMember
                            )

                    });

                } catch (error) {

                    console.error(
                        "❌ Failed to update Hero Role:",
                        error
                    );

                    return interaction.reply({

                        content:
                            "❌ I couldn't update that role. Please check my **Manage Roles** permission and make sure the bot's highest role is above the selectable roles.",

                        ephemeral: true

                    });

                }

            }

            // =================================================
            // LANE BUTTON
            // =================================================

            if (
                interaction.customId.startsWith(
                    "lampoon_lane_"
                )
            ) {

                const id =
                    interaction.customId.replace(
                        "lampoon_lane_",
                        ""
                    );

                const lane =
                    LANES[id];

                const roleId =
                    ROLE_IDS[id];

                if (
                    !lane ||
                    !roleId
                ) {

                    return interaction.reply({

                        content:
                            "❌ This lane is not configured correctly.",

                        ephemeral: true

                    });

                }

                const member =
                    interaction.member;

                try {

                    if (
                        member.roles.cache.has(
                            roleId
                        )
                    ) {

                        await member.roles.remove(
                            roleId
                        );

                    } else {

                        await member.roles.add(
                            roleId
                        );

                    }

                    const freshMember =
                        await interaction.guild.members.fetch(
                            interaction.user.id
                        );

                    const selectedNames =
                        Object.entries(LANES)
                            .filter(
                                ([laneKey]) => {

                                    const configuredRoleId =
                                        ROLE_IDS[
                                            laneKey
                                        ];

                                    return (
                                        configuredRoleId &&
                                        freshMember.roles.cache.has(
                                            configuredRoleId
                                        )
                                    );

                                }
                            )
                            .map(
                                ([, item]) =>
                                    item.name
                            );

                    const logEmbed =
                        new EmbedBuilder()
                            .setColor(0x3299DB)
                            .setTitle(
                                "🛣️ LANE UPDATED"
                            )
                            .setDescription(

                                `${interaction.user} updated their Lane selection.\n\n` +

                                `**Selected:** ${
                                    selectedNames.length
                                        ? selectedNames.join(", ")
                                        : "None"
                                }`

                            )
                            .setTimestamp();

                    await sendLog(
                        logEmbed
                    );

                    return interaction.update({

                        embeds: [
                            createLanePopupEmbed(
                                freshMember
                            )
                        ],

                        components:
                            createLaneButtons(
                                freshMember
                            )

                    });

                } catch (error) {

                    console.error(
                        "❌ Failed to update Lane:",
                        error
                    );

                    return interaction.reply({

                        content:
                            "❌ I couldn't update that lane. Please check my **Manage Roles** permission and make sure the bot's highest role is above the selectable roles.",

                        ephemeral: true

                    });

                }

            }

        }

    }
);

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

if (!TOKEN) {
    console.error(
        "❌ DISCORD_TOKEN is missing."
    );
}

if (!CLIENT_ID) {
    console.error(
        "❌ CLIENT_ID is missing."
    );
}

if (!GUILD_ID) {
    console.error(
        "❌ GUILD_ID is missing."
    );
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

for (
    const variable
    of requiredRoleVariables
) {

    if (!process.env[variable]) {

        console.warn(
            `⚠️ ${variable} is missing.`
        );

    }

}

// =====================================================
// LOGIN
// =====================================================

client.login(TOKEN).catch(error => {

    console.error(
        "❌ Discord login failed:",
        error
    );

});
