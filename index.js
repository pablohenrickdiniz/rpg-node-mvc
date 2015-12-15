module.exports = {
    Model:require('./Model/Model'),
    DbRegistry:require('./Mongo/DbRegistry'),
    ModelRegistry:require('./Mongo/ModelRegistry'),
    bootstrap:require('./config/bootstrap'),
    parseMessages:require('./utils/parse_messages'),
    parseName:require('./utils/parse_name'),
    FieldError:require('./Mongo/FieldError'),
    paths:require('./config/paths')
};