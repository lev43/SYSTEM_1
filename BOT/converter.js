var YandexDisk = require('yandex-disk').YandexDisk;
var disk = new YandexDisk('lev43.fiolent', '13243231423');
console.log(disk)
disk.readdir('/', function(err) {
  if(err)throw err
});

disk.readFile('test.txt', 'utf8', function(err, content) {
  if(err)throw err
  console.log(content)
});