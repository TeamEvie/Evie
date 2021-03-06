import { inlineCode } from "@discordjs/builders";
import { adminGuilds } from "@evie/config";
import { ReplyStatusEmbed } from "@evie/internal";
import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import type { AutocompleteInteraction, CommandInteraction } from "discord.js";
import ShapeGlobalCommandsToChoices from "#root/utils/misc/ShapeGlobalCommandsToChoices";
@ApplyOptions<Command.Options>({
	description: "Delete global commands.",
	preconditions: ["OwnerOnly"],
})
export class DeleteGlobalCommand extends Command {
	public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
		const query = interaction.options.getString("query");
		if (!query) return;
		const command = await this.container.client.application?.commands.fetch(query);
		if (!command) return void ReplyStatusEmbed(false, "No command found.", interaction);

		try {
			await command.delete();
			return void ReplyStatusEmbed(true, `Deleted command ${command.name} (${inlineCode(command.id)})`, interaction);
		} catch (err) {
			return void ReplyStatusEmbed(false, "Error deleting command.", interaction);
		}
	}

	public override async autocompleteRun(interaction: AutocompleteInteraction) {
		await interaction.respond(await ShapeGlobalCommandsToChoices(interaction));
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			{
				name: this.name,
				description: this.description,
				options: [
					{
						name: "query",
						description: "Command to delete",
						type: "STRING",
						autocomplete: true,
						required: true,
					},
				],
			},
			{
				guildIds: adminGuilds,
				behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
			},
		);
	}
}
