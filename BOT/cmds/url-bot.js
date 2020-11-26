const Discord  = module.require("discord.js");
const fs = require("fs");
module.exports.run = async (bot, message, args) => {
	if(!bot.checkAdmin())return;
	message.member.send('https://discordapp.com/api/oauth2/authorize?client_id=708681258753982514&permissions=0&scope=bot');
	message.delete();
};
module.exports.help = {
	name: "url-bot"
};