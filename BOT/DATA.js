class DATA{
  constructor(path='./DATA/'){
    this.path=path
    this.files=[]
  }
  addFile(){
    for(let i=0;i<arguments.length;i+=2){
      this.files[arguments[i]]=arguments[i+1];
    }
    return this.files;
  }
  delFile(file){
    let _file=this.files[file]
    delete this.files[file]
    return _file
  }
  load(file){
    return require('.'+this.file(file))
  }
  file(file){
    return this.path+this.files[file]
  }
  path(path){
    this.path=path;
  }
}

module.exports=DATA