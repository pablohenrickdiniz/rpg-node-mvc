var fs = require('fs');
module.exports ={
    exists:function (file){
        try{
            var stats = fs.lstatSync(file);
            if(stats.isDirectory() || stats.isFile()){
                return true;
            }
        }
        catch(e){

        }
        return false;
    },
    list:function(dir){
        return fs.readdirSync(dir);
    },
    module_exists:function(module){
        try{
            require(module);
        } catch(err){
            if(err.code === 'MODULE_NOT_FOUND'){
                return false;
            }
        }

        return true;
    }
};
