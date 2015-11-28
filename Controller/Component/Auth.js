var ModelRegistry = require('node-mvc/Mongo/ModelRegistry');
var bcryt = require('bcrypt');

module.exports = {
    req:null,
    setUser:function(user){
        var self = this;
        self.req.session.user = {
            profile:user.profile,
            role:user.role
        };
    },
    logout:function(){
        this.req.session.reset();
    },
    login:function(user){
        var password = user.password;
        var username = user.username;
    }
};