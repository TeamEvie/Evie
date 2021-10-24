const { SlashCommandBuilder } = require("@discordjs/builders");
import { MessageEmbed } from "discord.js";
var getJSON = require("get-json");
var ms = require("ms");
const { axo } = require("../axologs");
const ee = require("../botconfig/embed.json");
const {
  js_to_date,
  unix_to_date,
  filetime_to_date,
  ntp_to_date,
  network_ntp_to_date,
  hfs_to_date,
  ole_to_date,
  ldap_to_date,
  dos_to_date,
  to_date,
} = require("time-stamps");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playerstats")
    .setDescription("Replies with stats for a Minecraft Player")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("The Minecraft Java Username")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.reply(
      "<a:loading:877782934696919040> Fetching Info `(This will hang if " +
        interaction.options.getString("username") +
        " hasn't visited the End and the Nether and died atleast once)`"
    );
    var url =
      "http://202.131.88.29:25571/player/" +
      interaction.options.getString("username") +
      "/raw";

    try {
      getJSON(url, function (error, response) {
        var username = interaction.options.getString("username");
        var url = "http://202.131.88.29:25571/player/" + username + "/raw";
        var uuid = "ec4b0c12-484e-4544-8346-cc1f1bdd10df";
        var whyjavalol = "com.djrapitops.plan.gathering.domain.WorldTimes";

        var currentChannel = interaction.currentChannel;

        if (error === null) {
          axo.log("Fetched JSON for " + username);
        } else {
          axo.err("[Player Stats, Get JSON] " + error);
        }

        // undefined

        //console.log("D1: "+response.per_server_data["ec4b0c12-484e-4544-8346-cc1f1bdd10df"].sessions[0].extraData.data["com.djrapitops.plan.gathering.domain.WorldTimes"].times.world.times.SURVIVAL);
        //
        //console.log("D1: "+response.world_times.times.world.times.SURVIVAL);

        //SKIN STUFF HERE

        if (response.BASE_USER === "undefined") {
          throw "DBNOEXIST";
        }
        if (response.world_times.times.world.times.SURVIVAL === "undefined") {
          throw "DIM";
        }
        if (
          response.world_times.times.world_nether.times.SURVIVAL === "undefined"
        ) {
          throw "DIM";
        }
        if (
          response.world_times.times.world_the_end.times.SURVIVAL ===
          "undefined"
        ) {
          throw "DIM";
        }
        if (response.death_count === "undefined") {
          throw "DIE";
        }

        var uuid: string = response.BASE_USER.uuid;
        var faceUrl = "https://crafatar.com/renders/body/" + uuid;

        var skinDL = "https://crafatar.com/skins/" + uuid;

        var applySkin =
          "https://www.minecraft.net/profile/skin/remote?url=" +
          skinDL +
          ".png&model=slim";

        let firstDate = "Couldn't Find Data";
        const unixTime = new Date(response.BASE_USER.registered);

        firstDate = unixTime.toUTCString();

        // interaction.reply(response.url);
        const exampleEmbed = new MessageEmbed()
          .setColor("#0099ff")
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
              value:
                "Overworld: " +
                "```" +
                ms(response.world_times.times.world.times.SURVIVAL, {
                  long: true,
                }) +
                "```" +
                "Nether: " +
                "```" +
                ms(response.world_times.times.world_nether.times.SURVIVAL, {
                  long: true,
                }) +
                "```" +
                "End: " +
                "```" +
                ms(response.world_times.times.world_the_end.times.SURVIVAL, {
                  long: true,
                }) +
                "```",
            },
            {
              name: "Times Kicked",
              value: "```" + response.BASE_USER.timesKicked + "```",
            },
            {
              name: "First Time Joining tristansmp.com",
              value: "```" + firstDate + "```",
            },
            {
              name: "Player Deaths",
              value: "```" + response.death_count + "```",
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
          .setImage(faceUrl)
          .setImage(faceUrl)
          .setTimestamp()
          .setFooter(ee.footertext, ee.footericon);

        interaction.editReply("Fetched <:applesparkle:841615919428141066>");

        interaction.editReply({ embeds: [exampleEmbed] });
      });
    } catch (err) {
      axo.err("ERROR TRYING TO LOAD PLAYERSTATS: " + err);
      if (err == "ReferenceError: url is not defined") {
        await interaction.editReply(
          "```" +
            "Player Doesn't Exist On Database, They need to login to tristansmp.com atleast once" +
            "```"
        );
      } else {
        await interaction.editReply(
          "```" + "ERROR TRYING TO LOAD PLAYERSTATS" + "```"
        );
      }
    }

    process.on("uncaughtException", function (err) {
      if (err.toString() == "DBNOEXIST") {
        interaction.editReply(
          "```" +
            "Player Doesn't Exist On Database, They need to login to tristansmp.com at least once" +
            "```"
        );
      }
      if (err.toString() == "DIM") {
        interaction.editReply(
          "```" +
            "Player Hasn't Visted Every Dimension, They need to atleast visit every dimension once on tristansmp.com" +
            "```"
        );
      }
      if (err.toString() == "DIE") {
        interaction.editReply(
          "```" +
            "Player Hasn't Died Before, They need to atleast die once on tristansmp.com for me to pull up stats as deaths is a stat" +
            "```"
        );
      }
      axo.err(err);
    });
  },
};
