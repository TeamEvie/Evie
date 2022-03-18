/* 
Copyright 2022 Team Evie

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { prisma } from "#utils/database/index";
import { MessageEmbed, TextChannel, type Guild } from "discord.js";

export class EvieGuildLogger {
  public async log(guild: Guild, embed: MessageEmbed) {
    await prisma.evieGuild
      .findFirst({
        where: {
          id: guild.id,
        },
      })
      .then((g) => {
        if (!g) return;
        if (!g.logChannelID) return;

        const channel = guild.client.channels.fetch(g.logChannelID);
        if (!channel) return;
        if (!(channel instanceof TextChannel)) return;
        try {
          channel.send({ embeds: [embed] });
        } catch (e) {
          console.error(e);
        }
      });
  }
}