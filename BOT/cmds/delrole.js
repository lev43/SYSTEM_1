const Discord  = module.require("discord.js");
const fs = require("fs");
module.exports.run = async (bot, message, args, mentions) => {
	if(!bot.checkAdmin(message.author.id))return;
    message.guild.roles.fetch(args[1]).then(role=>{
        if(role){
            if(mentions[0])message.guild.members.fetch(mentions.find(m=>true)).then(member=>member.roles.remove(role));
            else message.member.roles.remove(role)
            bot.send(`**${mentions?mentions.find(m=>true).username:message.author.username}** потерял роль **${role.name}**`)
        }else bot.send(`Не найдена роль с ID: **${args[1]}**`)
    });
    message.delete();
};
module.exports.help = {
	name: "delrole"
};
