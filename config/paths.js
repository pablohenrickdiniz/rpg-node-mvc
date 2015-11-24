var path = require('path'),
    www_dir = path.resolve(__dirname+'/../../..');

var paths = {};
paths.WWW_DIR = www_dir;
paths.APP_ROOT = www_dir+'/app';
paths.WWW_ROOT = paths.APP_ROOT+'/webroot';
paths.APP_SRC = paths.APP_ROOT+'/src';
paths.TMP_FILES = www_dir+'/tmp';
paths.APP_MODEL = paths.APP_SRC+'/Model';
paths.APP_CONTROLLER = paths.APP_SRC+'/Controller';
paths.APP_COMPONENT = paths.APP_CONTROLLER+'/Component';


module.exports = paths;