var paths =  require('../config/paths'),
    database_config = require(paths.APP_ROOT+'/config/app').database,
    mongoose = require('mongoose');

module.exports = {
    conn: [],
    get: function (connectionName) {
        var self = this;
        if (self.conn[connectionName] == undefined) {
            if (database_config[connectionName] != undefined) {
                var config = database_config[connectionName];
                var uri = ['mongodb://',config.host,':',config.port,'/',config.database].join('');
                console.log('connection mongo database in '+uri+'...');
                self.conn[connectionName] = mongoose.createConnection(uri, {
                    user:config.user,
                    pass:config.pass,
                    server: config.server,
                    replset: config.replset,
                    db:config.db
                });
                console.log('database '+config.database+' connected!');
            }
            else {
                throw new Error('Database connection ' + connectionName + ' not defined');
            }
        }

        return self.conn[connectionName];
    }
};