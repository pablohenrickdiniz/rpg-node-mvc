module.exports = function(app,callback){
    var paths = require('./paths');
    var express = require('express');
    var session = require('express-session');
    var app_config = require(paths.APP_ROOT+'/config/app');
    var annotation = require('annotation');
    var controllers_dir = paths.APP_CONTROLLER;
    var defaultController = _transformClass(require('../Controller/Controller'));
    var ModelRegistry = require('../Mongo/ModelRegistry');
    var _ = require('lodash');

    _initializeHeaders();
    _initializeLocale();
    _initializeSession(app);
    _initializeBodyParser(app);
    _initializeControllers(callback);


    function _initializeSession(app){
        var session = require('express-session');
        var sess = session({
            secret:'secret',
            resave:true,
            saveUninitialized:true,
            cookie:{
                httpOnly:false,
                expires:false
            },
            store:new session.MemoryStore()
        });
        app.use(sess);
    }


    function _initializeHeaders(){
        app.use(function (req, res, next) {
            // Website you wish to allow to connect
            if(req.headers.origin){
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            }

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            // Pass to next layer of middleware
            next();
        });
    }


    function _initializeBodyParser(app){
        var bodyParser = require('body-parser');
        app.post('/*',bodyParser.json({ type: 'application/*+json' }));
        app.put('/*',bodyParser.json({ type: 'application/*+json' }));
    }


    function _initializeControllers(callback){
        var file = require('../config/file');
        var regex = require('./regex');
        if (file.exists(controllers_dir)) {
            var file_list = file.list(controllers_dir);
            var controllers = [];
            file_list.forEach(function(fileItem){
                if(regex.controller_file.test(fileItem)){
                    controllers.push(fileItem);
                }
            });
        }
        _recursiveCheckAnotations(controllers,callback);
    }


    function _transformClass(obj){
        var newClass = null;
        if(typeof obj.__constructor == 'function'){
            newClass = obj.__constructor;
        }
        else{
            newClass = function(){}
        }
        Object.keys(obj).forEach(function(key){
            if(key != '__constructor' && key != 'methods' && typeof obj[key] == 'function'){
                newClass.prototype[key] = obj[key];
            }
        });

        if(obj.methods != undefined && obj.methods.constructor == {}.constructor){
            Object.keys(obj.methods).forEach(function(key){
                newClass.prototype[key] = obj.methods[key];
            });
        }

        return newClass;
    }


    function _inherit(classA,classB){
        var old_prototype = classA.prototype;
        classA.prototype = Object.create(classB.prototype);
        Object.keys(old_prototype).forEach(function(key){
            classA.prototype[key] = old_prototype[key];
        });
        classA.constructor = classA;
    }



    function _recursiveCheckAnotations(files,callback){
        if(files.length > 0){
            var file = files.pop();
            var file_path = controllers_dir+'/'+file;
            var controller= require(file_path);

            var controller_class = _transformClass(controller);
            _inherit(controller_class,defaultController);


            var controller_instance = new controller_class();


            var modelName = controller_instance.modelName;
            if(modelName != null){
                controller_instance[modelName] = ModelRegistry.get(modelName);
            }


            var router_name = controller_instance.name;
            var router = controller_instance.getRouter();
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

                        requestMethods = _.uniq(requestMethods,true);
                        var uri = _getAnnotationValueByKey('Uri',annotations);
                        if(uri == null){
                            uri =  '/'+method;
                        }

                        if(contentType == null){
                            contentType = 'text/html';
                        }

                        var args = [uri].concat(controller_instance[method]);

                        args = args.map(function(func){
                            if(typeof func == 'function'){
                                return function(req,res,next){
                                    controller_instance.request = req;
                                    controller_instance.response = res;
                                    func.apply(controller_instance,[req,res,next]);
                                };
                            }
                            return func;
                        });

                        routes_created = true;
                        requestMethods.forEach(function(requestMethod){
                            switch(requestMethod){
                                case 'GET':
                                    router.get.apply(router,args);
                                    break;
                                case 'POST':
                                    router.post.apply(router,args);
                                    break;
                                case 'PUT':
                                    router.put.apply(router,args);
                                    break;
                                case 'DELETE':
                                    router.delete.apply(router,args);
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

    function _initializeFilters(controller_instance){
        if(controller_instance._filters.constructor == {}.constructor){
            var ucfirst = require('ucfirst');
            var router = controller_instance.getRouter();
            Object.keys(controller_instance._filters).forEach(function(method){
                var filters = controller_instance._filters[method];
                filters = [].concat(filters);
                filters.forEach(function(filter){
                    var file_path = paths.APP_FILTER+'/'+ucfirst(filter)+'Filter';
                    var file = require(file_path);

                });
            });
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

    /*
     function _initializeBehaviors(behaviors){
     var ucfirst = require('ucfirst');
     if(behaviors instanceof  Array){
     behaviors.forEach(function(name){
     var behaviorFile = 'node-mvc/Behavior/'+ucfirst(name)+'Behavior';
     var behavior_class = require(behaviorFile);
     var behavior_instance = new behavior_class();
     behavior_instance._initialize(app);
     });
     }
     }*/

    function _initializeLocale(){
        var moment = require('moment');
        var defaultLocale = app_config.defaultLocale;
        if(defaultLocale == undefined || defaultLocale.lang == undefined){
            throw new TypeError('Locale is not configured');
        }
        else{
            moment.locale(defaultLocale.lang,defaultLocale.options);
        }
    }
};
