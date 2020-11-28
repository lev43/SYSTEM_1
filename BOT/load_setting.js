var propertiesReader = require('properties-reader');//Загружаем библиотеку для работы с файлами .properties
var properties = propertiesReader('./DATA/setting.properties');//Указываем путь к файлу и получаем содержимое

propertiesI=Object.keys(properties.path())//Получаем ключу к переменным что-бы использовать их как ключи уже в global


console.log("Loading of settings starts")//Начинаем передачу данных в global
for(let i=0;i<propertiesI.length;i++){
  global[propertiesI[i]]=properties.path()[propertiesI[i]]//Получаем и записываем значение
  //console.log(`  ${propertiesI[i]}:`, properties.path()[propertiesI[i]])//Выводим по желанию
}
console.log("Loading settings ends")//Заканчиваем передачу