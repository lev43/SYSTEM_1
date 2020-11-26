const Discord  = module.require("discord.js");
const fs = require("fs");
module.exports.run = async (bot, message, args, mentions, guild, y=false) => {
    let pin;
    if(y)pin=args[0]
    else pin=args[1]
    let persons=JSON.parse(fs.readFileSync("./DATA/persons.json", "utf8"))
    let personsID=JSON.parse(fs.readFileSync("./DATA/personsID.json", "utf8"))
	if(!pin){
        bot.send("Напишите пароль входа")
        return
    }
    bot.send("Выполняю вход")
    let mail;
    for(key in personsID){
        if(personsID[key].pin==pin){
            mail=key
            break
        }
    }
    if(!mail){
        bot.send("Мы не смогли вас найти, проверьте правильность пароля.\nЕсли все равно не получается попробуйте позже.")
        return
    }
    let person=persons.find(person=>person.mail==mail)
    if(person.id==message.author.id){
        bot.send("Вы уже вошли")
        return
    }else{
        if(!personsID[mail])personsID[mail]={id:0}
        personsID[mail].id=message.author.id;
        bot.send('Вы успешно вошли\nОжидайте.')
        fs.writeFileSync("./DATA/personsID.json", JSON.stringify(personsID), (err)=>{if(err)throw err;});
    }
};
module.exports.help = {
	name: "sign-up"
};