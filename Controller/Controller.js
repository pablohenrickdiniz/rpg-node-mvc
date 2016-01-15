var express = require('express');
module.exports = {
    __constructor:function(){
        var self = this;
        self.name = null;
        self.modelName = null;
    },
    router:null,
    getRouter:function(){
        var self = this;
        if(self.router == null){
            self.router = express.Router();
        }
        return self.router;
    }
};




