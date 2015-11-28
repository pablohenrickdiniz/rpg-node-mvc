module.exports = {
    write:function(content){
        var self = this;
        self.response.write(content);
    },
    end:function(content){
        var self = this;
        self.response.end(content);
    },
    initialize:function(){

    },
    loadComponent:function(name){

    },
    __constructor:function(){
        var self = this;
        self.name = null;
        self.modelName = null;
        self.request = null;
        self.response = null;
    }
};




