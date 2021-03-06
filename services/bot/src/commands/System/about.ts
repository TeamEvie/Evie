import { lang, registeredGuilds } from "@evie/config";
import { EvieEmbed } from "@evie/internal";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { Emojis } from "#root/Enums";
import { aboutButtons } from "#root/constants/index";

export class AboutCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: "about",
			description: "View information about Evie and useful links.",
		});
	}

	public override async chatInputRun(interaction: CommandInteraction) {
		const ephemeral = interaction.options.getBoolean("hide") ?? false;

		await interaction.deferReply({ ephemeral });

		const embed = new EvieEmbed().setDescription(await resolveKey(interaction, "commands/getstarted:description"));

		const { shard } = this.container.client;

		if (!shard) throw "no shard manager owo";

		const { guilds, users } = (await shard.broadcastEval((c) => c.stats.shardStats())).reduce(
			(acc, cur) => {
				acc.guilds += cur.guilds;
				acc.users += cur.users;
				return acc;
			},
			{ guilds: 0, users: 0 },
		);

		const growth = [`Users: ${users}`, `Servers: ${guilds}`].map((line) => `${Emojis.bulletPoint} ${line}`);

		embed.setFooter({
			text: `Shard: ${interaction.guild?.shardId ?? 0}`,
		});

		const commandStats = await this.container.client.prisma.commandStats.findMany();

		const formatted = commandStats
			.sort((firstCommand, secondCommand) => secondCommand.uses - firstCommand.uses)
			.map((command, index) => `${index + 1}. ${command.name}: ${command.uses.toLocaleString("en-US")}`)
			.filter((_, index) => index < 5);

		embed.addFields([
			{
				name: "Growth (all shards)",
				value: growth.join("\n"),
			},
			{
				name: "Top 5 Commands:",
				value: formatted.join("\n"),
			},
		]);

		const row = new MessageActionRow();

		row.addComponents([
			new MessageButton().setLabel("Privacy Policy").setURL(aboutButtons.privacyPolicy).setStyle("LINK"),
			new MessageButton().setLabel("Terms of Service").setURL(aboutButtons.tos).setStyle("LINK"),
			new MessageButton().setLabel("Support / Community").setURL(aboutButtons.support).setStyle("LINK"),
		]);

		await interaction.editReply({
			embeds: [embed],
			components: [row],
		});
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			{
				name: this.name,
				description: this.description,
				options: [
					{
						name: lang.HIDE_COMMAND_OPTION_NAME,
						description: lang.HIDE_COMMAND_OPTION_DESCRIPTION,
						type: "BOOLEAN",
						required: false,
					},
				],
			},
			{
				guildIds: registeredGuilds,
				behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
				idHints: ["992655610422235156"],
			},
		);
	}
}
