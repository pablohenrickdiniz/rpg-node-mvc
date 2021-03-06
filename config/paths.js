var path = require('path'),
    root = require('app-root-path').path;

var paths = {
    root:root,
    appConfig:path.join(root,'app','config','app'),
    webroot:path.join(root,'app','webroot'),
    tmp:path.join(root,'tmp'),
    models:path.join(root,'app','src','Model'),
    controllers:path.join(root,'app','src','Controller'),
    components:path.join(root,'app','src','Controller','Component'),
    filters:path.join(root,'app','src','Filter')
};

module.exports = function(name){
    if(paths[name] != undefined){
        return paths[name];
    }
    return '';
};