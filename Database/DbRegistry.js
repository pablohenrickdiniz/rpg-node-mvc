var paths =  require('../config/paths'),
    database_config = require(paths('appConfig')).database,
    mongoose = require('mongoose');

module.exports = {
    conn: [],
    get: function (connectionName) {
        var self = this;
        if (self.conn[connectionName] == undefined) {
            if (database_config[connectionName] != undefined) {
                var config = database_config[connectionName];
                var uri = ['mongodb://',config.host,':',config.port,'/',config.database].join('');
                var conn = mongoose.createConnection(uri, {
                    user:config.user,
                    pass:config.pass,
                    server: config.server,
                    replset: config.replset,
                    db:config.db
                });
                console.log('conectando a '+config.database);

                conn.on('connected',function(){
                    console.log(config.database+' conectado!');
                });

                conn.on('error',function(err){
                    console.log('erro ao conectar com '+config.database+':'+err);
                });

                conn.on('disconnected',function(){
                    console.log('database '+config.database+' disconectado');
                });

                self.conn[connectionName] = conn;
            }
            else {
                throw new Error('Conexão ' + connectionName + ' não definida');
            }
        }

        return self.conn[connectionName];
    },
    disconnectAll:function(callback,keys){
        var self = this;
        keys = keys == undefined?Object.keys(self.conn):keys;
        if(keys.length > 0){
            var connectionName = keys.pop();
            self.disconnect(connectionName,function(){
                self.disconnectAll(callback,keys);
            });
        }
        else{
            callback();
        }
    },
    disconnect:function(connectionName,callback){
        var self = this;
        if(self.conn[connectionName] != undefined){
            self.conn[connectionName].close(function(){
                delete self.conn[connectionName];
                callback();
            });
        }
        else{
            callback();
        }
    }
};