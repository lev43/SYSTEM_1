const Discord  = module.require("discord.js");
const fs = require("fs");
function Generator(guild){
  let skip=false
  //guild.roles.fetch().then(roles=>roles.cache.each(role=>console.log(role.name, role.hexColor)))
  guild.roles.fetch().then(roles=>roles.cache.filter(role=>role.hexColor=='#2ecc71').each(role=>{
    if(!skip){
      let ch=role.name.toLowerCase().split("-");
      /*console.log("~~~~~~~~~~~~~~~~~~~~")
      console.log(ch[0])
      console.log(ch[1])
      console.log(ch[2])
      console.log(ch[3])*/
      let chan
      let rootChan=guild.channels.cache.find(chan=>chan.name==ch[0])
      //console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
      //console.log(rootChan, ch[0])
      //guild.channels.cache.each(chan_=>console.log(chan_.name))
      if(ch[0]=="директор"){
      }else{
        if(!rootChan){
          guild.channels.create(ch[0], {type: 'category'})
          skip=true
        }else 
          switch(ch[1]){
            case "методист":
            case "пдо":
              chan=guild.channels.cache.find(chan=>chan.name==ch[0]+'-'+ch[2]+'-'+ch[1])
              //console.log(!chan, ch[0]+'-'+ch[2]+'-'+ch[1])
              if(!chan){
                guild.channels.create(ch[0]+'-'+ch[2]+'-'+ch[1], {parent: rootChan, type: 'text'})
                skip=true
              }else{
                chan.createOverwrite(role, {VIEW_CHANNEL: true, SEND_MESSAGES: true}, "update")
              }
              break;
            case "педагог":
              chan=guild.channels.cache.find(chan=>chan.name==ch[0]+'-'+ch[2])
              if(!chan){
                guild.channels.create(ch[0]+'-'+ch[2], {parent: rootChan, type: 'text'})
                skip=true
              }else{
                chan.createOverwrite(role, {VIEW_CHANNEL: true, SEND_MESSAGES: true}, "update")
              }
              break;
            default:
        
          }
      }
    }
  }))
}
module.exports=Generator;