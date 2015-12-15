module.exports = function(errors,messages){
    Object.keys(messages).forEach(function(key){
        if(errors[key] != undefined){
            var field_messages = messages[key];
            var keys =  Object.keys(field_messages);
            for(var j = 0; j < keys.length;j++){
                var restriction = keys[j];
                if(errors[key] != undefined && errors[key].kind == restriction){
                    errors[key].message = field_messages[restriction];
                    break;
                }
            }
        }
    });


    return errors;
};