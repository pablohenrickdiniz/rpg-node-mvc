var express = require('express');
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
        require();
    },
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
    beforeFilter:function(){}
};




