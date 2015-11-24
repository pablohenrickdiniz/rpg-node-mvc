var paths = require('node-mvc/config/paths');
var multer = require('multer');
var crypto = require('crypto');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;
var name_parser = require('node-mvc/config/name_parser');
var deepmerge = require('deepmerge');
var bodyParser = require('body-parser');

var FileBehavior = function(){};

FileBehavior.prototype._initialize = function(app){
    console.log('initializing file behavior..');
    var self = this;
    var storage_config = {
        destination:paths.TMP_FILES,
        filename:function(req,file,cb){
            crypto.randomBytes(15,function(ex,buf){
                cb(null,buf.toString('hex')+'.tmp');
            });
        }
    };
    var upload = multer({
        storage:multer.diskStorage(storage_config)
    }).any();
    app.post('/*',upload,function(req,res,next){
        if(req.header('content-type').indexOf('multipart/form-data') != -1 && req.files != undefined){
            self._prepareFiles(req,0,next)
        }
        else{
            next();
        }
    });

    app.put('/*',upload,function(req,res,next){
        if(req.header('content-type').indexOf('multipart/form-data') != -1 && req.files != undefined){
            self._prepareFiles(req,0,next)
        }
        else{
            next();
        }
    });

    app.post('/*',bodyParser.urlencoded({extended:true}));
    app.put('/*',bodyParser.urlencoded({extended:true}));
};

FileBehavior.prototype._prepareFiles = function(req,index,finish){
    var self = this;
    if(index < req.files.length){
        var file = req.files[index];
        var magic = new Magic(mmm.MAGIC_MIME);
        magic.detectFile(file.path,function(err,result){
            if (!err) {
                result = result.split(';').map(function(attr){return attr.trim()});
                file.mimetype = result[0];
                file.encoding = result[1].replace('charset=','');
            }
            self._prepareFiles(req,index+1,finish)
        });
    }
    else{
        var body = {};
        req.files.forEach(function(file){
            var tmp = name_parser.parseObj(file.fieldname,file);
            delete file.fieldname;
            body = deepmerge(body,tmp);
        });
        delete req.files;
        req.body = deepmerge(req.body,body);
        finish();
    }
};

module.exports = FileBehavior;