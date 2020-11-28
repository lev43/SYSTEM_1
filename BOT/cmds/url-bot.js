const Discord  = module.require("discord.js");
const fs = require("fs");
module.exports.run = async (bot, message, args) => {
	if(!bot.checkAdmin())return;
	bot.generateInvite("ADMINISTRATOR").then(link => {message.channel.send(link)})
	message.delete();
};
module.exports.help = {
	name: "url-bot"
};