var FieldError = require('node-mvc/Mongo/FieldError');
var ModelRegistry = require('node-mvc/Mongo/ModelRegistry');
var parse_messages = require('node-mvc/Mongo/parse_messages');

var Model = {
    name:'Model',
    _validate:{},
    _schema:{},
    _methods:{},
    _statics:{
        save:function(data,callback){
            var self = this;
            var instance = new self(data);
            instance.save(function(err,result){
                if(err){
                    var errors = {};
                    var errors_json = {};
                    if(err.errors == undefined){
                        errors = err.toJSON();
                    }
                    else{
                        errors = err.errors;
                    }
                    var config = ModelRegistry.getModelConfig(self.modelName);
                    errors = parse_messages(errors,config._messages);
                }

                callback(errors,data);
            });

        }
    },
    _virtuals:{},
    _refs:null,
    getRefs:function(){
        var self = this;
        if(self._refs == null){
            self._refs = {};
            Object.keys(self._schema).forEach(function(field){
                var field_obj =  self._schema[field];

                if(field_obj instanceof Array && field_obj[0] != undefined && field_obj[0].ref != undefined){
                    self._refs[field] = field_obj[0];
                    self._refs[field].multiple = true;
                }
                else if(self._schema[field].ref!= undefined){
                    self._refs[field] = field_obj;
                }
            });
        }
        return self._refs;
    }
};


module.exports = Model;