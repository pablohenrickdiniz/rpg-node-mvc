var paths = require('./paths');
var regex = require('./regex');
var express = require('express');
var app = express();
var ucfirst = require('ucfirst');
var app_config = require(paths.APP_ROOT+'/config/app');
var file = require('node-mvc/config/file');
var moment = require('moment');
var annotation = require('annotation');
var controllers_dir = paths.APP_CONTROLLER;
var defaultController = require('node-mvc/Controller/Controller');
var deepmerge = require('deepmerge');
var ModelRegistry = require('node-mvc/Mongo/ModelRegistry');
var _ = require('lodash');


_initializeHeaders();
_initializeLocale();
_initializeBehaviors(['file']);
_initializeControllers(function(){
    app.listen(app_config.port);
    console.log('server is running at http://localhost:'+app_config.port);
});


function _initializeHeaders(){
    app.use(function (req, res, next) {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        // Pass to next layer of middleware
        next();
    });
}



/*
 Controller.prototype._parseRequest = function(){
 var self = this;
 var router = self._getRouter();
 router.all('/*',function(req,res,next){
 self.request = req;
 self.response = res;
 next();
 });

 router.get('/*',function(req,res,next){
 self.list();
 });

 router.post('/*',function(req,res,next){
 self.add();
 });

 router.put('/*',function(req,res,next){
 self.edit();
 });

 router.delete('/*',function(req,res,next){
 self.deleteAll();
 });

 };*/



function _initializeControllers(callback){
    if (file.file_exists(controllers_dir)) {
        var file_list = file.file_list(controllers_dir);
        var controllers = [];
        file_list.forEach(function(file){
            if(regex.controller_file.test(file)){
                controllers.push(file);
            }
        });
    }
    _recursiveCheckAnotations(controllers,callback);
}

function _recursiveCheckAnotations(files,callback){
    if(files.length > 0){
        var file = files.pop();
        var file_path = controllers_dir+'/'+file;
        var controller= require(file_path);
        controller = deepmerge(defaultController,controller);

        var modelName = controller.modelName;
        if(modelName != null){
            controller[modelName] = ModelRegistry.get(modelName);
        }

        var router_name = controller.name;
        var router = express.Router();
        annotation(file_path,function(AnnotationReader){
            //get annotations related to the class
            var routes_created = false;
            Object.keys(controller.methods).forEach(function(method){
                var annotations = AnnotationReader.getMethodAnnotations(method);
                var requestMethods = _getAnnotationValuesByKey('RequestMethod',annotations);
                var contentType = _getAnnotationValueByKey('ContentType',annotations);

                if(requestMethods.length > 0){
                    requestMethods = requestMethods.map(function(val){
                        return val.toUpperCase();
                    });

                    requestMethods = _.unique(requestMethods,true);
                    var uri = _getAnnotationValueByKey('uri',annotations);
                    if(uri == null){
                        uri =  '/'+method;
                    }

                    if(contentType == null){
                        contentType = 'text/html';
                    }


                    var action = function(req,res,next){
                        res.writeHead(200, {"Content-Type": contentType});
                        controller.methods[method].apply(controller);
                        next();
                    };

                    router.all('/*',function(req,res,next){
                        controller.request = req;
                        controller.response = res;
                        next();
                    });
                    routes_created = true;
                    console.log(router_name+uri);

                    requestMethods.forEach(function(requestMethod){
                        switch(requestMethod){
                            case 'GET':
                                router.get(uri,action);
                                break;
                            case 'POST':
                                router.post(uri,action);
                                break;
                            case 'PUT':
                                router.put(uri,action);
                                break;
                            case 'DELETE':
                                router.delete(uri,action);
                                break;
                            default:
                                throw new Error('method '+requestMethod+' doesn\'t exists');
                        }
                    });
                }
            });

            if(routes_created){
                app.use('/'+router_name,router);
            }
            
            _recursiveCheckAnotations(files,callback);
        });
    }
    else{
        callback();
    }
}


function _getAnnotationValueByKey(key,annotations){
    var size = annotations.length;
    for(var i = 0; i < size;i++){
        if(annotations[i].key == key){
            return annotations[i].value;
        }
    }
    return null;
}

function _getAnnotationValuesByKey(key,annotations){
    var values = [];
    var size = annotations.length;
    for(var i = 0; i < size;i++){
        if(annotations[i].key == key){
            values.push(annotations[i].value);
        }
    }
    return values;
}


function _initializeBehaviors(behaviors){
    if(behaviors instanceof  Array){
        behaviors.forEach(function(name){
            var behaviorFile = 'node-mvc/Behavior/'+ucfirst(name)+'Behavior';
            var behavior_class = require(behaviorFile);
            var behavior_instance = new behavior_class();
            behavior_instance._initialize(app);
        });
    }
}

function _initializeLocale(){
    var defaultLocale = app_config.defaultLocale;
    if(defaultLocale == undefined || defaultLocale.lang == undefined){
        throw new TypeError('Locale is not configured');
    }
    else{
        moment.locale(defaultLocale.lang,defaultLocale.options);
    }
}



function _isRequest(request){
    return ['GET','POST','PUT','PATCH','DELETE'].indexOf(request.toUpperCase()) != -1;
}

