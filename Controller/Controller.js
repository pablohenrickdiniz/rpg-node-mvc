var express = require('express');
module.exports = {
    __constructor:function(){
        var self = this;
        self.name = null;
        self.modelName = null;
        self.request = null;
        self.response = null;
    },
    router:null,
    getRouter:function(){
        var self = this;
        if(self.router == null){
            self.router = express.Router();
        }
        return self.router;
    },
    json:function(data){
        this.response.write(JSON.stringify(data));
    },
    endJson:function(data){
        this.response.end(JSON.stringify(data));
    }
};




