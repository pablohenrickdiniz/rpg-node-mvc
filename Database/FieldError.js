var util = require('util');

var FieldError = function(field,mensagem,props){
    Error.call(this,mensagem);
    var self = this;
    self.field = field;
    self.props = props;
};

util.inherits(FieldError,Error);

FieldError.prototype.toJSON = function(){
    var self = this;
    var field = self.field;
    var json = {};
    json[field] = self.props;
    return json;
};



module.exports= FieldError;