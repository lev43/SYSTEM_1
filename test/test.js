var propertiesReader = require('properties-reader');
var properties = propertiesReader('./setting.properties');

//console.log(properties.get('main.test.a'))
//console.log(properties.path().main.test.t)

properties.each((key, value) => {
  console.log(key, value)
  global[key]=value
});