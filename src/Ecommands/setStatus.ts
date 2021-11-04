import { SlashCommandBuilder } from "@discordjs/builders";
import { embed } from "../tools";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setstatus")
    .setDescription("Sets my Status!")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("What status")
        .setRequired(true)
        .addChoice("Do not Disturb", "dnd")
        .addChoice("Idle", "idle")
        .addChoice("Invisible", "invisible")
        .addChoice("Online", "online")
    )
    .addStringOption((option) =>
      option
        .setName("activity")
        .setDescription("Set my Activity to..")
        .setRequired(true)
    ),
  async execute(interaction) {
    const client = interaction.client;

    if (interaction.user.toString() == "<@97470053615673344>") {
      client.user.setPresence({
        status: interaction.options.getString("status"),
      });

      const activity = interaction.options.getString("activity");

      client.user.setActivity(activity, { type: "LISTENING" });

      await interaction.reply({
        content:
          "Setting my status to, " +
          "```" +
          interaction.options.getString("status") +
          "``` and setting my activity to ```" +
          activity +
          "```",
        ephemeral: false,
      });
    } else {
      await interaction.reply({
        content: "Hey! Your not one of my Devs!",
        ephemeral: true,
      });
    }
  },
};
