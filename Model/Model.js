var m = require('rpg-node-mvc');


var FieldError = m.FieldError,
    ModelRegistry = m.ModelRegistry,
    parse_messages = m.parseMessages;

var Model = {
    name: 'Model',
    _validate: {},
    _schema: {},
    _methods: {},
    _statics: {
        save: function (data, callback) {
            var self = this;
            var instance = new self(data);
            instance.save(function (err, result) {
                if (err) {
                    var errors = {};
                    var errors_json = {};
                    if (err.errors == undefined) {
                        errors = err.toJSON();
                    }
                    else {
                        errors = err.errors;
                    }
                    var config = ModelRegistry.getModelConfig(self.modelName);
                    errors = parse_messages(errors, config._messages);
                }

                callback(errors, data);
            });
        }
    },
    _virtuals: {}
};


module.exports = Model;