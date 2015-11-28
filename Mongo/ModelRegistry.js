var paths = require('node-mvc/config/paths');
var database_config = require(paths.APP_ROOT+'/config/app').database;
var ucfirst = require('ucfirst');
var file = require('node-mvc/config/file');
var mongoose = require('mongoose');
var FieldError = require('./FieldError');
var moment = require('moment');
var app_config = require(paths.APP_ROOT+'/config/app');

module.exports = {
    models: [],
    configs: [],
    conn: [],
    get: function (modelName) {
        var self = this;
        if (self.models[modelName] == undefined) {
            var model_config = self.getModelConfig(modelName);
            var con = self.connection('default');
            var model_schema = new mongoose.Schema(model_config._schema);
            Object.keys(model_config._methods).forEach(function (key) {
                model_schema.methods[key] = model_config._methods[key];
            });
            Object.keys(model_config._statics).forEach(function (key) {
                model_schema.statics[key] = model_config._statics[key];
            });
            Object.keys(model_config._virtuals).forEach(function (key) {
                var config = model_config._virtuals[key];
                if (config.get != undefined && typeof config.get == 'function') {
                    model_schema.virtual(key).get(config.get);
                }
                if (config.set != undefined && typeof config.get == 'function') {
                    model_schema.virtual(key).set(config.set);
                }
            });

            var model = con.model(modelName, model_schema);
            self.prepareModelCallbacks(model_config._schema, model_schema, model);
            self.models[modelName] = model;
        }

        return self.models[modelName];
    },
    getModelConfig: function (modelName) {
        modelName = ucfirst(modelName);
        var self = this;
        if (self.configs[modelName] == undefined) {
            var module = paths.APP_MODEL + '/' + modelName;
            var model_config = require(module);
            self.configs[modelName] = model_config;
        }

        return self.configs[modelName];
    },
    connection: function (connectionName) {
        var self = this;
        if (self.conn[connectionName] == undefined) {
            if (database_config[connectionName] != undefined) {
                var config = database_config[connectionName];
                var uri = ['mongodb://', config.host, '/', config.database, ':', config.port].join('');
                self.conn[connectionName] = mongoose.createConnection(uri, {
                    user: config.user,
                    pass: config.pass,
                    db: config.db,
                    server: config.server,
                    replset: config.replset
                });
            }
            else {
                throw new Error('Database connection ' + connectionName + ' not defined');
            }
        }

        return self.conn[connectionName];
    },
    prepareModelCallbacks: function (fields, schema, model, parent) {
        var self = this;
        Object.keys(fields).forEach(function (key) {
            var field = fields[key];
            var fieldName = parent == undefined ? key : parent + '.' + key;
            if (field.constructor == {}.constructor && field.type == undefined) {
                self.prepareModelCallbacks(field, schema, model, fieldName);
            }
            else if (field.unique || field.index && field.index.unique) {
                schema.post('validate', function (doc, next, err) {
                    var conditions = {};
                    conditions[fieldName] = eval('doc.' + fieldName);
                    model.find(conditions, function (err, docs) {
                        if (!docs.length) {
                            next();
                        }
                        else {
                            var error = new FieldError(fieldName, 'Campo não é unico', {
                                kind: 'unique',
                                message: 'O campo ' + fieldName + ' é unico',
                                path: fieldName,
                                value: doc[fieldName]
                            });
                            next(error);
                        }
                    });
                });
            }

            if (field.type == Date) {
                schema.pre('validate', function (next) {
                    moment.locale(app_config.defaultLocale.lang);
                    var data = moment(this[key]);

                    if (data.isValid()) {
                        eval('this.' + fieldName + ' = data.toDate()');
                        next();
                    }
                    else {
                        var error = new FieldError(key, 'Data inválida', {
                            kind: 'Date',
                            message: 'Essa data é inválida',
                            path: key,
                            value: this[key]
                        });
                        next(error);
                    }
                });
            }
        });
    }
};