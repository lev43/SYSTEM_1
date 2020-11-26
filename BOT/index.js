const Discord = require('discord.js');
const nodemailer = require('nodemailer');
const fs = require('fs');
const readline=require('readline');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const rl=readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt:'> ',
});
const DATA={
    admin: "./DATA/admin.json",
    person_table: "./DATA/person_table.json",
    persons: "./DATA/persons.json",
    personsID: "./DATA/personsID.json",
    config: "../DATA/botconfig.json"
}
let generator=require("./channelGenerate.js");
let config = require(DATA.config)
let token = config.token;
let prefix = config.prefix;
let admins=JSON.parse(fs.readFileSync(DATA.admin, "utf8"));
let start=false;
bot.on('ready', ()=>start=true)
function rolename(){
    let roleName=arguments[0];
    for(let i=1;i<arguments.length;i++){
        roleName+='-'+arguments[i]
    }
    return roleName
}
function delay(time){
    var startTime=new Date().getTime();
    for(var i=0;i<1e7;i++){
        if((new Date().getTime()-startTime)>time){
            break;
        }
    }
}
//let testEmailAccount = nodemailer.createTestAccount();
   
let mail = nodemailer.createTransport({
    service: 'gmail',
    secureConnection: false,
    port: 465,
    requireTLS: true, 
    tls: {
        rejectUnauthorized: false,
        secureProtocol: "TLSv1_method" 
    },
    auth: {
        user: 'system.ds.bot@gmail.com',
        pass: 'SYSTEM-bot312-lev43-:)'
    }
});


var persons, personsID, person_table;
persons=JSON.parse(fs.readFileSync(DATA.persons, "utf8"))
personsID=JSON.parse(fs.readFileSync(DATA.personsID, "utf8"))
setInterval(()=>{
    persons=JSON.parse(fs.readFileSync(DATA.persons, "utf8"))
    personsID=JSON.parse(fs.readFileSync(DATA.personsID, "utf8"))
}, 500)

fs.readdir('./BOT/cmds/', (err, files) => {
    if (err) console.log(err);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if (jsfiles.length <= 0) console.log("not commands");
    console.log(`Loaded ${jsfiles.length} command(s)`);
    jsfiles.forEach((f, i) => {
        let props = require(`./cmds/${f}`);
        console.log(`${i+1}.${f} Loaded!`);
        bot.commands.set(props.help.name, props);
    });
});
var guild;
bot.on('ready', ()=>{
    guild=bot.guilds.cache.get(config.guildID)
    setInterval(()=>{
        guild.members.cache.each(member=>{if(!member.user.bot){
            let sign=false;
            persons.forEach(person=>{
                if(personsID[person.mail])
                if(personsID[person.mail].id==member.user.id){
                    sign=true;
                }
            })
            if(!sign && member.user.id!='633732275753844774' && member.nickname!='регистрация'){
                member.setNickname('регистрация').then(nickname=>{
                    member.send("Здраствуйте, пожайлуста войдите.\nДля этого напишите свой пароль входа.")
                })
            }
        }})
    }, 1000)
})
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    bot.generateInvite("ADMINISTRATOR").then(link => {console.log(link);});
});
bot.login(token);

rl.prompt();
commands={
    help(){
        console.log('Commands:');
        console.log(Object.keys(commands));
    },
    channelSend(channelID, msg){
    	try{
    	msg=msg.slice(channelID.length+13);
    	let chan = bot.channels.cache.get(channelID);// ID канала куда отправить
        const message=new Discord.MessageEmbed().setColor("# E10000").addField("Server:", msg);
        chan.send(message);
        }catch(err){console.log('Not channel');};
    },
    get(t, id){
    	try{
    	id=id.slice(4);
        command=id.split("/");
    	id=id.split("->");
        if(id[0]==='')id=[];
        obj=bot;
        console.log(id);
        console.log(command);
    	for(i=0;i<id.length;i++){
    	    var o=10;
    	    for(j=0;j<command.length;j++){
                if(id[i]==='/'+command[j]){
                    var y=command[j].split('(');
                    y=y[1].split(')');
                    y=y[0];
                    var c=id[i].split('(');
                    c=c[0].slice(1);
                    obj=obj[c](y);
                    o=0;
                    break;
                };
            };
            if(o>5){obj=obj[id[i]];};
        };
        console.log(obj);
        }catch(err){console.log(err);};
    },
    getConfig(){
    	console.log(config);
    },
    getAdmin(){
        admins.forEach(adminID=>{
            let admin=bot.users.cache.find(admin=>admin.id==adminID);
            if(admin)console.log(adminID+':', admin.username+'# '+admin.discriminator);
            else console.log('Not admin '+adminID);
        });
    },
    addAdmin(id){
        admins.push(parseInt(id));
        console.log('Add admin',id);
    },
    delAdmin(id){
        let admin=admins.findIndex(admin=>admin==parseInt(id));
        if(admin>0){
            admins.splice(admin,1);
            console.log('Delete admin',id);
        }else console.log('Not admin',id);
    },
    clear(){
    	console.clear();
    },
    exit(){
        rl.close();
    }
};
rl.on('line', line=>{
	line=line.trim();
	let lineArray = line.split(" ");
	const command=commands[lineArray[0]];
	if(command)command(lineArray[1], line);
	else console.log('Не найдена комманда \''+line+'\'');
	rl.prompt();
}).on('close', ()=>{
    console.log('Bot close');
    fs.writeFileSync(DATA.admin, JSON.stringify(admins), (err)=>{if(err)throw err;});
	process.exit(0);
});

function update_roles(){
    persons=JSON.parse(fs.readFileSync(DATA.persons, "utf8"))
    person_table=JSON.parse(fs.readFileSync(DATA.person_table, "utf8"));
    person_table.forEach((person, i)=>{
        if(person['№']=='~'){
            person_table.splice(i, 1);
        }else{
            person['№']=parseInt(person['№'])
            if(person.patronymic==undefined){
                let full_name=person.full_name.split(' ');
                person.name=full_name[1];
                person.family=full_name[0];
                person.patronymic=full_name[2];
            }
            if(typeof person.position=='string')person.position=person.position.toLowerCase().split(', ');
            if(typeof person.club=='string')person.club=person.club.toLowerCase().split(', ');
            if(typeof person.direction=='string')person.direction=person.direction.toLowerCase().split(', ');
            //console.log(person)
        }
    })
    persons=person_table;
    fs.writeFileSync(DATA.persons, JSON.stringify(person_table), (err)=>{if(err)throw err;});
    if(start){
        guild=bot.guilds.cache.get(config.guildID)
        guild.members.fetch().then(members=>{members.each(member=>{if(!member.user.bot){
            let person;
            persons.forEach(_person=>{
                if(personsID[_person.mail])
                if(personsID[_person.mail].id==member.user.id){
                    person=_person;
                }
            })
            if(person){
                if(member.user.id!='633732275753844774'){
                member.setNickname(person.full_name)
                guild.roles.fetch().then(roles=>{
                    let role=roles.cache.find(role=>role.name=="зарегистрирован")
                    if(role)member.roles.add(role)
                    else guild.roles.create({data: {name: "зарегистрирован", color: 'd4ff00'}}).then(role_=>member.roles.add(role_))
                })
                person.club.forEach(club=>{
                    person.position.filter(pos=>pos.toLowerCase().split('-').shift()==club).forEach(position=>{
                        let posName=position.toLowerCase().split('-').pop(), posDep=position.toLowerCase().split('-')[1];
                        person.direction.filter(dir=>dir.toLowerCase().split('-').shift()==club).forEach(direction=>{
                            let roleName='NULL'
                            let color='GREEN'
                            let dirName=direction.toLowerCase().split('-').pop(), dirDep=direction.toLowerCase().split('-')[1];
                            switch(posName){
                                case 'педагог':
                                    roleName=rolename(club, posName, dirName)
                                    //color='fce514'
                                    break
                                case 'методист':
                                case 'пдо':
                                    roleName=rolename(club, posName, posDep)
                                    break
                                case 'руководитель':
                                    roleName=rolename(club, posName)
                                    //color='dce82c'
                                    break
                                case 'директор':
                                    roleName=posName
                                    break
                            }
                            if(roleName!='NULL')
                            if(!member.roles.cache.find(rol=>rol.name==roleName)){
                                let role=guild.roles.cache.find(rol=>rol.name==roleName)
                                if(role){
                                    member.roles.add(role);
                                }else{
                                    guild.roles.create({data:{name:roleName, color: color}}).then(_role=>member.roles.add(_role));
                                }
                                console.log(member.user.username, 'получил', roleName)
                            }
                        })
                        member.roles.cache.each(_role=>{
                            let roleY=false;
                            person.club.forEach(club=>{
                                person.position.filter(pos=>pos.toLowerCase().split('-').shift()==club).forEach(position=>{
                                    let posName=position.toLowerCase().split('-').pop(), posDep=position.toLowerCase().split('-')[1];
                                    person.direction.filter(dir=>dir.toLowerCase().split('-').shift()==club).forEach(direction=>{
                                        let roleName='NULL'
                                        let dirName=direction.toLowerCase().split('-').pop(), dirDep=direction.toLowerCase().split('-')[1];
                                        switch(posName){
                                            case 'педагог':
                                                roleName=rolename(club, posName, dirName)
                                                break
                                            case 'методист':
                                            case 'пдо':
                                                roleName=rolename(club, posName, posDep)
                                                break
                                            case 'руководитель':
                                                roleName=rolename(club, posName)
                                                break
                                            case 'директор':
                                                roleName=posName
                                                break
                                        }
                                        if(_role.name==roleName)roleY=true;
                                    })
                                })
                            })
                            if(_role.name!='@everyone' && _role.name!='Администратор' && _role.name!='зарегистрирован' && !roleY){
                                member.roles.remove(_role).then(member_=>console.log(member_.user.username, 'потерял', _role.name));
                            }
                        })
                    })
                })}
            }else if(member.user.id!='633732275753844774')
                guild.roles.fetch().then(roles=>{
                    let role=roles.cache.find(role=>role.name=="зарегистрирован")
                    if(role)member.roles.remove(role)
                    else guild.roles.create({data: {name: "зарегистрирован", color: 'd4ff00'}})
                })
        }})})
    }
}
setInterval(()=>{
    let mailsLetters=0;
    for(i in personsID){
        if(personsID[i].letter==false)mailsLetters++;
    }
    if(mailsLetters>0)console.log("Начинаю рассылку писем")
    persons.forEach(person=>{
        if(person['№']!='~'){
        if(!personsID[person.mail])personsID[person.mail]={letter:false}
        let pin='000';
        if(!personsID[person.mail].letter && !personsID[person.mail].id && !personsID[person.mail].ignore){
            function checkPin(){
                for(i in personsID)
                    if(personsID[i].pin==pin){
                        return true; 
                    }
                return false
            }
            while(checkPin())pin=String(Math.floor(Math.random()*100000))
            mail.sendMail({
                from: '"Система" <system.ds.bot@gmail.com>',
                to: person.mail,
                subject: "Регистрация",
                text: "Ваш пароль для входа "+pin+"\nЧто-бы продолжить перейдите на дискорд сервер\nЯ вам напишу, напишите в ответ <strong>"+pin+"</strong>",
                html: "Ваш пароль для входа <strong>"+pin+"</strong>\nЧто-бы продолжить перейдите по этой ссылке на <a href='https://discord.gg/jDWpCeG'>дискорд сервер</a>\nЯ вам напишу, напишите в ответ <strong>"+pin+"</strong>"
            }, (err, info)=>{
                if(err)if(err.code=='EENVELOPE'){
                    console.log("Не верная почта: ", person.mail);
                }else if(err.code=='ETIMEDOUT' || err.errno=='ECONNRESET' || err.code=='EAUTH')console.log(err.code)//console.log('Error\ncode:', err.code, '\nerrno:', err.errno)
                else throw err
                else{
                    personsID[person.mail].pin=pin
                    fs.writeFileSync(DATA.personsID, JSON.stringify(personsID), (err)=>{if(err)throw err;});
                    console.log("Письмо отправленно на адрес:", person.mail, '\n'+info.response, '\npin: '+pin+'\n')
                }
            });
            personsID[person.mail].letter=true
            fs.writeFileSync(DATA.personsID, JSON.stringify(personsID), (err)=>{if(err)throw err;});
        }}
    })
    update_roles()
}, 10000)
bot.on('message', async message => {
    if (message.author.bot) return;
    generator(guild)
    update_roles()
    bot.send=function (msg){//Замена длинному message.channel.send();
    	message.channel.send(msg);};
    bot.checkAdmin=function (id) {//Проверка, является ли данный человек администратором
        if(message.member.hasPermission("ADMINISTRATOR"))return true;
        if(!admins.find(adminID=>adminID==id)){
        	const NOT=new Discord.MessageEmbed().setTitle('Вы не администратор!');
            bot.send(NOT);
            return false;
        }else return true;
    };
    let mentions;
    if(message.mentions)mentions=message.mentions.users;
    let userName = message.author.username;
    let userID = message.author.id;
    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(prefix.lenght);
    //let user=message.guild.member(message.mentions.users.first()||message.guild.members.cache.get(args[0]));
    //console.log(user);
    //user.send('Hello');
    if (!message.content.startsWith(prefix)){
        if(!message.member){
            let y=false;
            for(i in personsID)if(personsID[i].id==message.author.id)y=true;
            if(y)return
            else{
                let sign = bot.commands.get('sign-up');
                sign.run(bot, message, args, mentions, guild, true);
            }
        }
        return
    }
    let cmd = bot.commands.get(command.slice(prefix.length));
    if (cmd) {
        cmd.run(bot, message, args, mentions, guild);
    }
});

