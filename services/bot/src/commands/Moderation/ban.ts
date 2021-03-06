import { checkPerm } from "#root/utils/misc/permChecks";
import { time } from "@discordjs/builders";
import { lang, registeredGuilds } from "@evie/config";
import { EditReplyStatusEmbed, ReplyStatusEmbed } from "@evie/internal";
import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import * as Sentry from "@sentry/node";
import { AutocompleteInteraction, CommandInteraction, Permissions } from "discord.js";
@ApplyOptions<Command.Options>({
	description: "Ban a user",
	preconditions: ["ModOrBanPermsOnly"],
	requiredClientPermissions: ["BAN_MEMBERS"],
})
export class Ban extends Command {
	public override async chatInputRun(interaction: CommandInteraction) {
		if (!interaction.inCachedGuild()) return;

		const userToBeBanned = interaction.options.getMember("user");
		const reason = interaction.options.getString("reason");
		const days = interaction.options.getString("days");
		const show = !interaction.options.getBoolean("show") || false;

		const expiresAt = days ? new Date(Date.now() + parseInt(days, 10) * 86400000) : undefined;

		if (!userToBeBanned) {
			await ReplyStatusEmbed(false, "You must specify a user to ban.", interaction);
			return;
		}

		await interaction.deferReply({ ephemeral: show });

		try {
			await interaction.client.punishments.banGuildMember(
				userToBeBanned,
				{
					reason: reason ?? "No reason provided.",
				},
				expiresAt,
				interaction.member,
			);
			await EditReplyStatusEmbed(
				true,
				`Banned ${userToBeBanned.toString()} (${userToBeBanned.id}) ${
					expiresAt ? time(expiresAt, "R") : `indefinitely`
				} for \`${reason ?? "no reason :("}\`.`,
				interaction,
			);
			return;
		} catch (e) {
			Sentry.captureException(e);
			console.log(e);
			void EditReplyStatusEmbed(false, "Failed to ban user.", interaction);
		}
	}

	public override async autocompleteRun(interaction: AutocompleteInteraction) {
		if (!interaction.inCachedGuild()) return;

		if (!(await checkPerm(interaction.member, Permissions.FLAGS.BAN_MEMBERS))) {
			return interaction.respond([
				{
					name: await resolveKey(interaction.guild, "permissions:mod"),
					value: "notadmin",
				},
			]);
		}

		const query = interaction.options.getString("days") ?? "0";

		// when theres no query show some suggestions such as 5 Days, 1 Day, etc.
		if (!query) {
			return interaction.respond([
				{
					name: "24 Hours",
					value: `${1}`,
				},
				{
					name: "3 Day",
					value: `${3}`,
				},
				{
					name: "1 Week",
					value: `${7}`,
				},
				{
					name: "1 Month",
					value: `${30}`,
				},
				{
					name: "1 Year",
					value: `${365}`,
				},
			]);
		}
		const days = parseInt(query, 10);

		if (days === 0) {
			return interaction.respond([
				{
					name: "Invalid number.",
					value: "invalid",
				},
			]);
		}
		return interaction.respond([
			{
				name: `${days} Days`,
				value: `${days}`,
			},
			{
				name: `${days} Weeks`,
				value: `${days * 7}`,
			},
			{
				name: `${days} Months`,
				value: `${days * 30}`,
			},
			{
				name: `${days} Years`,
				value: `${days * 365}`,
			},
		]);
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			{
				name: this.name,
				description: this.description,
				options: [
					{
						name: "user",
						description: "The user to ban",
						type: "USER",
						required: true,
					},
					{
						name: "days",
						description: "Days to ban the user for",
						type: "STRING",
						required: false,
						autocomplete: true,
					},
					{
						name: "reason",
						description: "Reason for the ban",
						type: "STRING",
						required: false,
					},
					{
						name: lang.SHOW_COMMAND_OPTION_NAME,
						description: lang.SHOW_COMMAND_OPTION_DESCRIPTION,
						type: "BOOLEAN",
						required: false,
					},
				],
			},
			{
				guildIds: registeredGuilds,
				behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
				idHints: ["954547077994655785"],
			},
		);
	}
}
