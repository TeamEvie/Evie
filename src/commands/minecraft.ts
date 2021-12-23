import { SlashCommandBuilder } from "@discordjs/builders";
const getJSON = require("get-json");
import { embed } from "../tools";
const ms = require("ms");
import * as Hypixel from "hypixel-api-reborn";
import util from "minecraft-server-util";
import * as evie from "../tools";
import { CommandInteraction } from "discord.js";
import imgur from "imgur";
import { axo } from "../axologs";
import fetch from "node-fetch";
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HYPIXEL: string;
    }
  }
}
type TSMPMcmmoResp = {
  repair: number;
  fishing: number;
  axes: number;
  swords: number;
  powerLevel: number;
  alchemy: number;
  Herbalism: number;
  mining: number;
  error: boolean;
  acrobatics: number;
  woodcutting: number;
  excavation: number;
  unarmed: number;
  archery: number;
  taming: number;
};
const hypixel = new Hypixel.Client(process.env.HYPIXEL);
module.exports = {
  data: new SlashCommandBuilder()
    .setName("minecraft")
    .setDescription("Minecraft Related Commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("serverstats")
        .setDescription("Replies with Minecraft Server Stats!")
        .addStringOption((option) =>
          option
            .setName("ip")
            .setDescription(
              "Minecraft Java Server Address (If empty it will pull up TristanSMP Info"
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("hypixel")
        .setDescription("Pull up player stats on Hypixel")
        .addStringOption((option) =>
          option
            .setName("username")
            .setDescription("Username of the player you want to query")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("tristansmp")
        .setDescription("Pull up player stats on TristanSMP")
        .addStringOption((option) =>
          option
            .setName("username")
            .setDescription("Username of the player you want to query")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand == "serverstats") {
      let realInput: string =
        (await interaction.options.getString("ip")) ?? "tristansmp.com";

      util
        .status(realInput) // port is default 25565
        .then((response) => {
          interaction.deferReply();
          let data = response.favicon; // your image data
          const base64Data = data!.replace(/^data:image\/png;base64,/, "");
          imgur
            .uploadBase64(base64Data)
            .then(async (json) => {
              axo.log("[SERVER STATS CACHE] " + json.link);
              const serverIconLink = json.link;
              let exampleEmbed = await embed(interaction.guild);
              exampleEmbed
                .setColor("#0099ff")
                .setTitle("Server Stats")
                .setDescription("**Server Address**: " + "`" + realInput + "`")
                .addFields(
                  {
                    name: "Online Players",
                    value:
                      response.onlinePlayers!.toString() +
                      "/" +
                      response.maxPlayers!.toString(),
                  },
                  {
                    name: "Motd",
                    value:
                      "```" +
                      response.description!.descriptionText.toString() +
                      "```",
                  },
                  {
                    name: "Server Version",
                    value: "```" + response.version + "```",
                  },
                  {
                    name: "Server Icon",
                    value: ":point_down:",
                  }
                )
                .setImage(serverIconLink)
                .setTimestamp();

              interaction.editReply({
                embeds: [exampleEmbed],
              });
            })
            .catch((error) => {
              axo.err(error.message);
            });
        })
        .catch((err) => {
          axo.err(err.message);
        });
    }
    if (subcommand == "tristansmp") {
      await interaction.deferReply();
      const url =
        "http://202.131.88.29:25571/player/" +
        interaction.options.getString("username") +
        "/raw";
      try {
        getJSON(url, async function (error, response) {
          const username = interaction.options.getString("username");

          if (error === null) {
            axo.log("Fetched JSON for " + username);
          } else {
            axo.err("[Player Stats, Get JSON] " + error);
          }

          const uuid: string = response.BASE_USER.uuid;
          const faceUrl = "https://crafatar.com/renders/body/" + uuid;

          const skinDL = "https://crafatar.com/skins/" + uuid;

          const res: TSMPMcmmoResp = await fetch(
            `https://api.tristansmp.com/player/${response.uuid}/mcmmo`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          ).then((res) => res.json());

          if (res.error) {
            return interaction.editReply({
              content: "Player needs to at least level up their skills once.",
            });
          }

          const applySkin =
            "https://www.minecraft.net/profile/skin/remote?url=" +
            skinDL +
            ".png&model=slim";

          let firstDate = "Couldn't Find Data";
          const unixTime = new Date(response.BASE_USER.registered);

          firstDate = unixTime.toUTCString();

          let exampleEmbed = await embed(interaction.guild);
          exampleEmbed
            .setTitle("Player Stats on TristanSMP for " + username)
            .setDescription(
              "Hey, " +
                interaction.user.toString() +
                " heres a list of stats for " +
                username
            )
            .addFields(
              {
                name: "Play Time",
                value: ms(response.world_times.times.world.times.SURVIVAL, {
                  long: true,
                }),
              },
              {
                name: "Times Kicked",
                value: response.BASE_USER.timesKicked,
              },
              {
                name: "First Time Joining tristansmp.com",
                value: firstDate,
              },
              {
                name: "Player Deaths",
                value: response.death_count,
              },
              {
                name: "Repair",
                value: res.repair.toString(),
              },
              {
                name: "Fishing",
                value: res.fishing.toString(),
              },
              {
                name: "Axes",
                value: res.axes.toString(),
              },
              {
                name: "Swords",
                value: res.swords.toString(),
              },
              {
                name: "Archery",
                value: res.archery.toString(),
              },
              {
                name: "Taming",
                value: res.taming.toString(),
              },
              {
                name: "Unarmed",
                value: res.unarmed.toString(),
              },
              {
                name: "Woodcutting",
                value: res.woodcutting.toString(),
              },
              {
                name: "Mining",
                value: res.mining.toString(),
              },
              {
                name: "Alchemy",
                value: res.alchemy.toString(),
              },
              {
                name: "Acrobatics",
                value: res.acrobatics.toString(),
              },
              {
                name: "Excavation",
                value: res.excavation.toString(),
              },
              {
                name: "Skin",
                value:
                  "[Download](" +
                  skinDL +
                  ")" +
                  " | " +
                  "[Apply Skin](" +
                  applySkin +
                  ")",
              }
            )
            .setThumbnail(faceUrl)
            .setTimestamp();

          await interaction.client.users
            .fetch(`97470053615673344`)
            .then((user) =>
              user.send(`Debug: \`\`\`${exampleEmbed.toJSON()}\`\`\``)
            );

          interaction.editReply("Fetched <:applesparkle:841615919428141066>");

          interaction.editReply({ embeds: [exampleEmbed] });
        });
      } catch (err) {
        interaction.editReply("Failed fetching data");
      }
    }
    if (subcommand == "hypixel") {
      let pembed = await embed(interaction.guild);
      let i: CommandInteraction = interaction;
      hypixel
        .getPlayer(i.options.getString("username") ?? "twisttaan")
        .then(async (player) => {
          // Title
          pembed.setTitle("Hypixel Stats for " + player.nickname);
          // Thumbnail
          pembed.setThumbnail(
            `https://crafatar.com/renders/body/${player.uuid}`
          );
          // Stats
          pembed.addField("Player Level", player.level.toString());
          pembed.addField("Player Rank", player.rank, true);
          pembed.addField(
            "First Login",
            player.firstLogin.toLocaleDateString(),
            true
          );
          pembed.addField(
            "Bedwars Final Kills",
            player.stats?.bedwars?.finalKills.toString() ?? "None",
            true
          );
          pembed.addField(
            "Bedwars Kills",
            player.stats?.bedwars?.kills.toString() ?? "None",
            true
          );
          pembed.addField(
            "Bedwars KD",
            player.stats?.bedwars?.KDRatio.toString() ?? "None",
            true
          );
          pembed.addField(
            "Bedwars Wins",
            player.stats?.bedwars?.wins.toString() ?? "None",
            true
          );
          pembed.addField(
            "Bedwars Current Winstreak",
            player.stats?.bedwars?.winstreak.toString() ?? "None",
            true
          );
          pembed.addField(
            "Duels Wins",
            player.stats?.duels?.wins.toString() ?? "None",
            true
          );
          pembed.addField(
            "Skywars KD",
            player.stats?.skywars?.KDRatio.toString() ?? "None",
            true
          );
          pembed.addField(
            "Skywars Kills",
            player.stats?.skywars?.kills.toString() ?? "None",
            true
          );
          pembed.addField(
            "Skywars Wins",
            player.stats?.skywars?.wins.toString() ?? "None",
            true
          );
          pembed.addField(
            "Skywars Current Winstreak",
            player.stats?.skywars?.winstreak.toString() ?? "None",
            true
          );
          i.reply({ embeds: [pembed] });
        })

        .catch(async (e) => {
          console.error(e);
          const er = await evie.embed(interaction.guild!);
          er.setDescription(`Error: That player doesn't seem to exist`);
          i.reply({
            embeds: [er],
          });
        });
    }
  },
};
