import { Precondition } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { CommandInteraction, GuildMember, Message, Permissions } from "discord.js";
import { checkPerm } from "#root/utils/misc/permChecks";
export class ModOrBanPermsOnlyPrecondition extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction) {
		if (!interaction.inCachedGuild())
			return this.error({
				message: await resolveKey(interaction, "errors:notInCachedGuild"),
				context: { silent: true },
			});
		return this.checkPerm(interaction.member, interaction);
	}

	public override messageRun(message: Message) {
		return this.checkPerm(message.member, message);
	}

	private async checkPerm(member: GuildMember | null, messageOrInteraction: Message | CommandInteraction) {
		if (!member)
			return this.error({
				message:
					"This command can only be used by a moderator therefore it **must** be used in a guild, so how did we get here 🤷",
				context: { silent: true },
			});

		return (await checkPerm(member, Permissions.FLAGS.BAN_MEMBERS)) ||
			(await this.container.client.db.HasModRole(member))
			? this.ok()
			: this.error({
					message: await resolveKey(messageOrInteraction, "permissions:mod"),
					context: { silent: true },
			  });
	}
}

declare module "@sapphire/framework" {
	interface Preconditions {
		ModOrBanPermsOnly: never;
	}
}
