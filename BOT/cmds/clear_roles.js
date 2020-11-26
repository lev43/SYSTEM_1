const Discord = module.require("discord.js"); 
const fs = require("fs"); 
module.exports.run = async (bot,message,args,mentions,guild) => { 
    let delRol=0;
	if(!bot.checkAdmin())return;
    try{
        guild.roles.fetch().then(roles=>roles.cache.each(role=>{if(role.rawPosition==1){role.delete();delRol++}}))
        message.channel.send(`Удалено ${delRol} ролей`).then(msg => setTimeout(()=>msg.delete(), 5000)) 
    }catch(err){ console.log(err) } 
}; 
module.exports.help = { 
    name: "clear_roles" 
};