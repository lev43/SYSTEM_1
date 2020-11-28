                  require("./load_setting.js")//Загружаем настройки. Настройки будут отправленны в global
const Discord=    require('discord.js');
const nodemailer= require('nodemailer');
const fs=         require('fs');
const readline=   require('readline');//Загружаем библиотеку для работы с консолью
let generator=    require("./channelGenerate.js");
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const rl=readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt:'> ',
});
const DATA={//Создаем обьект с путями до файлов
    admin: "./DATA/admin.json",
    person_table: "./DATA/person_table.json",
    persons: "./DATA/persons.json",
    personsID: "./DATA/personsID.json"
}

let token = global.config.token;
let prefix = global.config.prefix;
let admins=JSON.parse(fs.readFileSync(DATA.admin, "utf8"));
var guild;
let start=false;//Задаем переменную которая не позволит запустится раньше времени некоторым функциям
//После запуска бота можно запускать определенные функции

//Данная функция призвана сократить +'-'+
function name(){     
    let name=arguments[0];
    for(let i=1;i<arguments.length;i++){
      name+='-'+arguments[i]
    }
    return name
}

function delay(time){
    var startTime=new Date().getTime();
    for(var i=0;i<1e7;i++){
        if((new Date().getTime()-startTime)>time){
            break;
        }
    }
}


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
        user: global.mail.bot.mail,
        pass: global.mail.bot.password
    }
});


var persons, personsID, person_table;
persons=JSON.parse(fs.readFileSync(DATA.persons, "utf8"))
personsID=JSON.parse(fs.readFileSync(DATA.personsID, "utf8"))


fs.readdir('./BOT/cmds/', (err, files) => {
    if (err) console.log(err);

    files = files.filter(f => f.split(".").pop() === "js")

    if (files.length <= 0) console.log("not commands")
    console.log(`Loaded ${files.length} command(s)`)

    files.forEach((f, i) => {
        let props = require(`./cmds/${f}`)
        console.log(`${i+1}.${f} Loaded!`)
        bot.commands.set(props.help.name, props)
    });
});



rl.prompt();
commands={//Обьект с коммандами консоли
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
    	console.log(global.config);
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

function update_roles(){//Функция обработчик ролей сервера
    persons=JSON.parse(fs.readFileSync(DATA.persons, "utf8"))
    person_table=JSON.parse(fs.readFileSync(DATA.person_table, "utf8"));
    
    person_table.forEach((person, i)=>{//Обрабатываем таблицу пользователей полученную при помощи converter.py из google-table
        if(person['№']=='~'){
            person_table.splice(i, 1)
        }else{
            person['№']=parseInt(person['№'])
            if(person.patronymic==undefined){
                let full_name=person.full_name.split(' ')
                person.name=full_name[1]
                person.family=full_name[0]
                person.patronymic=full_name[2]
            }
            
            //Изначально эти данные приходят в виде строк и их надо превратить в массив строк
            if(typeof person.position=='string')person.position=person.position.toLowerCase().split(', ')
            if(typeof person.club=='string')person.club=person.club.toLowerCase().split(', ')
            if(typeof person.direction=='string')person.direction=person.direction.toLowerCase().split(', ')
        }
    })
    
    persons=person_table;
    fs.writeFileSync(DATA.persons, JSON.stringify(person_table), (err)=>{if(err)throw err})
    
    //Проходим по всем членам гильдии и даем/забираем роли
    guild.members.fetch().then(members=>{members.each(member=>{if(!member.user.bot && member.user.id!=guild.ownerID){
        //Боты не являются участниками. Мы не можем присваивать роли главе сервера, поэтому проверяем что-бы это был не он
        
        function findRole(roleName){
            return guild.roles.cache.find(role=>role.name==roleName)
        }
        function createRole(roleName, roleHexColor){
            let role=guild.roles.cache.find(role=>role.name==roleName)
            if(!role)return guild.roles.create({data: {name: roleName, color: roleHexColor}})
            return undefined
        }
        
        let person;
        persons.forEach(_person=>{//Проверяем заегистрирован-ли пользователь
            if(personsID[_person.mail])
            if(personsID[_person.mail].id==member.user.id){
                person=_person;
            }
        })

        if(person){
            member.setNickname(person.full_name)

            guild.roles.fetch().then(roles=>{
                let role=findRole("зарегистрирован")
                if(role)member.roles.add(role)
                else createRole("зарегистрирован", global.roles.colors.system).then(role=>member.roles.add(role))
            })

            //Нам надо выдать/забрать нужные роли. Роли сортируются по клубам(молодость, парус и т.п.) и категориям(тех, спорт, и т.д.)
            person.club.forEach(club=>{
                //Идем по позициям(педагог, ученик, методист, родитель и т.п.)
                person.position.filter(pos=>pos.toLowerCase().split('-').shift()==club).forEach(position=>{
                    
                    let posName=position.toLowerCase().split('-').pop(), 
                    posDep=position.toLowerCase().split('-')[1]
                    
                    //Идем по направлениям(робототехника, рисование, шахматы и т.п.)
                    person.direction.filter(dir=>dir.toLowerCase().split('-').shift()==club).forEach(direction=>{
                        
                        let roleName='NULL',
                        color=global.roles.colors.default
                        
                        let dirName=direction.toLowerCase().split('-').pop(), 
                            dirDep=direction.toLowerCase().split('-')[1]
                            
                        switch(posName){//Шаблон создания имени роли
                            case 'педагог':
                                roleName=name(club, posName, dirDep, dirName)
                                break
                            case 'методист':
                            case 'пдо':
                                roleName=name(club, posName, posDep)
                                break
                            case 'руководитель':
                                roleName=name(club, posName)
                                break
                                case 'директор':
                                roleName=posName
                                break
                        }
                        

                        if(roleName!='NULL' && !member.roles.cache.find(rol=>rol.name==roleName)){
                            let role=findRole(roleName)
                            if(role)member.roles.add(role)
                            else createRole(roleName, global.roles.colors.default).then(_role=>member.roles.add(_role))
                            console.log(member.user.username, 'получил', roleName)
                        }
                    })

                    //Сечас будем убирать лишние роли
                    member.roles.cache.filter(role=>role.hexColor==global.roles.colors.default).each(role=>{
                        let roleY=false;//Переменной запомним должна-ли быть эта роль у пользователя
                        
                        person.club.forEach(club=>{
                            person.position.filter(pos=>pos.toLowerCase().split('-').shift()==club).forEach(position=>{
                                
                                //posName: Хранит имя позиции         (педагог, методист и т.п.)
                                //posDep:  Хранит департамент позиции (тех, спорт и т.д.)
                                let posName=position.toLowerCase().split('-').pop(), 
                                posDep=position.toLowerCase().split('-')[1];
                                
                                person.direction.filter(dir=>dir.toLowerCase().split('-').shift()==club).forEach(direction=>{
                                    
                                    //roleName: хранит имя роли которое будет сгенерировано по шаблону
                                    let roleName='NULL'
                                    
                                    //dirName: хранит имя направления
                                    //dirDep:  хранит департамент направления
                                    let dirName=direction.toLowerCase().split('-').pop(), 
                                        dirDep=direction.toLowerCase().split('-')[1];
                                        
                                        switch(posName){//Шаблон создания имени роли
                                            case 'педагог':
                                            roleName=name(club, posName, dirDep, dirName)
                                            break
                                        case 'методист':
                                            case 'пдо':
                                            roleName=name(club, posName, posDep)
                                            break
                                        case 'руководитель':
                                            roleName=name(club, posName)
                                            break
                                        case 'директор':
                                            roleName=posName
                                            break
                                    }

                                    if(role.name==roleName)roleY=true;
                                })
                            })
                        })

                        if(!roleY){
                            member.roles.remove(role).then(member_=>
                                console.log(member.user.username, 'потерял', role.name)
                                );
                        }
                    })
                })
            })
        }else{
            guild.roles.fetch().then(roles=>{
                let role=findRole("зарегистрирован")
                if(role)member.roles.remove(role)
                else createRole("зарегистрирован", global.roles.colors.system)
            })
        }
    }})})
}


function mailing(){//Рассылка писем
    let mailsLetters=0;//Подсчет ящиков на которые надо отправить письма
    for(i in personsID){
        if(personsID[i].letter==false)mailsLetters++;
    }

    if(mailsLetters>0)console.log("Начинаю рассылку писем")
    else return

    persons.forEach(person=>{
        if(!personsID[person.mail])personsID[person.mail]={letter:false}
        let pin='13243';
        
        if(!personsID[person.mail].letter && !personsID[person.mail].id && !personsID[person.mail].ignore){
            
            function checkPin(){//Проеверяет существует-ли пин
                for(i in personsID)
                    if(personsID[i].pin==pin){
                        return true; 
                    }
                    return false
            }
            
            while(checkPin())pin=String(Math.floor(Math.random()*100000))//Подборка не существующего пароля
            

            mail.sendMail({
                from: '"Система" <system.ds.bot@gmail.com>',
                to: person.mail,
                subject: "Регистрация",
                text: "Ваш пароль для входа "+pin+"\nЧто-бы продолжить перейдите на дискорд сервер\nЯ вам напишу, напишите в ответ <strong>"+pin+"</strong>",
                html: "Ваш пароль для входа <strong>"+pin+"</strong>\nЧто-бы продолжить перейдите по этой ссылке на <a href='"+global.config.invite+"'>дискорд сервер</a>\nЯ вам напишу, напишите в ответ <strong>"+pin+"</strong>"
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
        }
    })
}


bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    
    guild=bot.guilds.cache.get(global.config.guildID)
    start=true

    setInterval(()=>{
        guild.members.cache.each(member=>{if(!member.user.bot){
            let sign=false;
            persons.forEach(person=>{
                if(personsID[person.mail])
                if(personsID[person.mail].id==member.user.id){
                    sign=true;
                }
            })
            if(!sign && member.user.id!=guild.ownerID && member.nickname!='регистрация'){
                member.setNickname('регистрация').then(nickname=>{
                    member.send("Здраствуйте, пожайлуста войдите.\nДля этого напишите свой пароль входа.")
                })
            }
        }})
        update_roles()
        generator(guild)
        mailing()
    }, 1000)
});
bot.login(token);


bot.on('message', async message => {
    if (message.author.bot) return


    bot.send=function (msg){//Замена длинному message.channel.send();
        message.channel.send(msg);
    };
    
    
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

    
    //Специальная проверка, позволяет пользователю написать в личные соощения пароль входа и войти без комманды
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