module.exports = {
    Model:require('./Model/Model'),
    DbRegistry:require('./Database/DbRegistry'),
    ModelRegistry:require('./Database/ModelRegistry'),
    bootstrap:require('./config/bootstrap'),
    parseMessages:require('./utils/parse_messages'),
    parseName:require('./utils/parse_name'),
    FieldError:require('./Database/FieldError'),
    paths:require('./config/paths'),
    config:function(name){


    }
};