var ModelRegistry = require('node-mvc/Mongo/ModelRegistry');
var bcryt = require('bcrypt');
var deepmerge = require('deepmerge');

module.exports = {
    req:null,
    config:{
        model:'',
        fields:{
            login:'username',
            password:'password'
        }
    },
    setUser:function(user) {
        var self = this;
        self.req.session.user = user;
    },
    getUser:function(){
        var self = this;
        return self.req.session.user;
    },
    logout:function(){
        this.req.session.reset();
    },
    login:function(user,callback){
        var self = this;
        var login_field = self.fields.login;
        var password_field = self.fields.password;

        var password = user[password_field];
        var login = user[login_field];
        var Model = ModelRegistry.get(this.config.model);
        var conditions = {};
        conditions[login_field] = login;

        Model.findOne(conditions,function(err,doc){
            if(err){
                callback(new Error('Esse login não existe'),{});
            }
            else{
                var db_hash = doc[password_field];
                bcryt.compare(password,db_hash,function(err,res){
                    if(err){
                        callback(new Error('Login ou senha incorretos'),{});
                    }
                    else if(res){
                        delete doc[password_field];
                        delete doc[login_field];
                        self.setUser(doc);
                        callback(null,doc);
                    }
                });
            }
        });
    },
    getUserData:function(){
        var self = this;
        var login = self.fields.login;
        var password = self.fields.password;
        var user = {
            login:'',
            password:''
        };
        if(self.req.body[login] != undefined){
            user.login = self.req.body[login];
        }
        if(self.req.body[password] != undefined){
            user.password = self.req.body[password];
        }
        return user;
    },
    configure:function(config){
        this.config = deepmerge(this.config,config);
    }
};