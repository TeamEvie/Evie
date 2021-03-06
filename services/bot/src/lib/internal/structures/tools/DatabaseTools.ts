import type { AirportSettings, GuildSettings, ModerationSettings } from "@prisma/client";
import * as Sentry from "@sentry/node";
import type { Guild, GuildMember } from "discord.js";

export class DatabaseTools {
	public async FetchGuildSettings(guild: Guild): Promise<
		GuildSettings & {
			moderationSettings: ModerationSettings | null;
			airportSettings: AirportSettings | null;
		}
	> {
		try {
			const guildSettings = await guild.client.prisma.guildSettings.upsert({
				where: {
					id: guild.id,
				},
				create: {
					id: guild.id,
				},
				update: {},
				include: {
					moderationSettings: true,
					airportSettings: true,
				},
			});

			if (!guildSettings.airportSettings) {
				await guild.client.prisma.airportSettings.create({
					data: {
						guildId: guild.id,
					},
				});

				return await this.FetchGuildSettings(guild);
			}

			if (!guildSettings.moderationSettings) {
				await guild.client.prisma.moderationSettings.create({
					data: {
						guildId: guild.id,
					},
				});

				return await this.FetchGuildSettings(guild);
			}

			return guildSettings;
		} catch (error) {
			Sentry.captureException(error);
			throw error;
		}
	}

	public async UpdateGuildSettings(guild: Guild, settingsPatch: Partial<GuildSettings>) {
		try {
			return await guild.client.prisma.guildSettings.update({
				where: {
					id: guild.id,
				},
				data: {
					...settingsPatch,
					id: undefined,
				},
			});
		} catch (error) {
			Sentry.captureException(error);
			throw error;
		}
	}

	public async UpdateModSettings(guild: Guild, settingsPatch: Partial<ModerationSettings>) {
		try {
			return await guild.client.prisma.moderationSettings.update({
				where: {
					guildId: guild.id,
				},
				data: {
					...settingsPatch,
					guildId: undefined,
				},
			});
		} catch (error) {
			Sentry.captureException(error);
			throw error;
		}
	}

	public async UpdateAirPortSettings(guild: Guild, settingsPatch: Partial<AirportSettings>) {
		try {
			return await guild.client.prisma.airportSettings.update({
				where: {
					guildId: guild.id,
				},
				data: settingsPatch,
			});
		} catch (error) {
			Sentry.captureException(error);
			throw error;
		}
	}

	public async HasModRole(member: GuildMember): Promise<boolean> {
		try {
			const result = await this.FetchGuildSettings(member.guild);

			if (!result.moderatorRole) return false;

			return member.roles.cache.has(result.moderatorRole);
		} catch (error) {
			Sentry.captureException(error);
			return false;
		}
	}

	public async FetchTags(guild: Guild) {
		try {
			return await guild.client.prisma.evieTag.findMany({
				where: {
					guildId: guild.id,
				},
			});
		} catch (error) {
			Sentry.captureException(error);
			throw error;
		}
	}

	public async FetchPickupRoles(guild: Guild) {
		try {
			return await guild.client.prisma.pickupRole.findMany({
				where: {
					guildID: guild.id,
				},
			});
		} catch (error) {
			Sentry.captureException(error);
			throw error;
		}
	}

	public async FetchGuildProperty(
		guild: Guild,
		property: keyof GuildSettings,
	): Promise<GuildSettings[typeof property]> {
		try {
			const settings = await this.FetchGuildSettings(guild);
			return settings[property];
		} catch (error) {
			Sentry.captureException(error);
			throw error;
		}
	}

	/** Fetches every mod action targeted at a member */
	public async getModActions(m: GuildMember) {
		try {
			return await m.client.prisma.modAction.findMany({
				where: {
					targetID: m.id,
					guildId: m.guild.id,
				},
			});
		} catch (error) {
			Sentry.captureException(error);
			throw error;
		}
	}
}
