const Discord  = module.require("discord.js");
const fs = require("fs");


//Данная функция призвана сократить +'-'+
function name(){
  if(typeof arguments[0]=='object')arguments=arguments[0]
  let Name=arguments[0];
  for(let i=1;i<arguments.length;i++){
    Name+='-'+arguments[i]
  }
  return Name
}


//Функция обработчик каналов
function Generator(guild){

  function addpermisions(role, channel){
    channel.createOverwrite(role, {VIEW_CHANNEL: true, SEND_MESSAGES: true}, "update")
  }

  function addpermisions(role, channel){
    guild.roles.fetch().then(roles=>channel.createOverwrite(roles.cache.find(_role=>_role.name==role), {VIEW_CHANNEL: true, SEND_MESSAGES: true}, "update"))
  }

  function findChannel(){
    return guild.channels.cache.find(channel=>channel.name==name(arguments))
  }

  function createChannel(channelName, category){
    guild.channels.create(channelName, {parent: category, type: 'text'})
  }
  function createChannel(channelName){
    guild.channels.create(channelName, {type: 'text'})
  }


  //Идем по ролям
  guild.roles.fetch().then(roles=>roles.cache.filter(role=>role.hexColor==global.roles.colors.default).each(role=>{
    //param: хранит разделенное на части имя роли
    let param=role.name.toLowerCase().split("-");
    let channel

    if(param[0]=="директор"){
      //В будущем сделаю
    }else{
      let category=findChannel(param[0])
      if(!category){
        guild.channelnels.create(param[0], {type: 'category'})
        return 0
      }else 
        switch(param[1]){//Шаблон создания каналов
          case "методист":
          case "пдо":
            channel=findChannel(param[0], param[2], param[1])
            if(!channel){
              createChannel(name(param[0], param[2], param[1]), category)
              return 0
            }else{
              addpermisions(role, channel)
            }
            break;
          case "педагог":
            channel=findChannel(param[0], param[3])
            if(!channel){
              createChannel(name(param[0], param[3]), category)
              return 0
            }else{
              addpermisions(role, channel)
              //Этот канал должны видеть некоторые другие роли, поэтому даем права и им
              addpermisions(name(param[0], "методист", param[2]), channel)
              addpermisions(name(param[0], "пдо", param[2]), channel)
            }
            break;
        }
    }
  }))
}
module.exports=Generator;