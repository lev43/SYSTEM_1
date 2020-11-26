const Discord  = module.require("discord.js");
const fs = require("fs");
module.exports.run = async (bot, message, args) => {
	if(!message.member.hasPermission("KICK_MEMBERS")) return bot.send("Вы не имеете права выгонять пользователей");
	if(!args[1])return bot.send("Пользовательне указан");
	let user=message.guild.member(message.mentions.users.first()||message.guild.members.cache.get(args[1]));
	if(!user)return bot.send("Пользователь не найден");
	let p="Причина не указана";
	if(args[2])p=message.content.slice(7+args[1].length);
	user.send("Вас выгнал "+message.author.username+'\nПо причине \"'+p+'\"');
	message.guild.member(user).kick(p);
	message.delete();
};
module.exports.help = {
	name: "kick"
};