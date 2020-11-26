const Discord = module.require("discord.js"); 
const fs = require("fs"); 
module.exports.run = async (bot,message,args) => { 
	if(!bot.checkAdmin())return;
    try{ 
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("У вас нет прав"); 
        if(args[1]>100) return bot.send("Укажите значение меньше 100"); 
        if(args[1]<1) return bot.send("Укажите значение больше 1"); 
        clearMessagesN=args[1]++;
        message.channel.bulkDelete(clearMessagesN).then(() =>{ message.channel.send(`Удалено ${clearMessagesN} сообщений`).then(msg => setTimeout(()=>msg.delete(), 5000))}); 
    }catch(err){ console.log(err) } 
}; 
module.exports.help = { 
    name: "clear" 
};