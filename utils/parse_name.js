module.exports = {
    validateRegex: /^[A-Za-z0-9]+(\[([A-Za-z0-9]+|)\])*$/,
    keyRegex:/^[A-Za-z0-9]+(?=\[)|[A-Za-z0-9]+/,
    propRegex:/([A-Za-z0-9]+|)(?=\])/,
    propBracketsRegex:/\[([A-Za-z0-9]+)?\]/,
    validate:function(name){
        return this.validateRegex.test(name);
    },
    parseObj:function(name,content){
        var obj = {};
        if(this.validate(name)) {
            var key = this.keyRegex.exec(name);
            name = name.replace(this.keyRegex, '');
            obj[key[0]] = this.getChildObject(name,content);
        }
        return obj;

    },
    getChildObject:function(name,content){
        if(name.length == 0) {
            return content;
        }
        else{
            var obj = null;
            var key = this.propRegex.exec(name);
            name = name.replace(this.propBracketsRegex,'');
            if(key[0] == ''){
                obj = [];
                obj.push(this.getChildObject(name,content));
            }
            else{
                obj = {};
                obj[key[0]] = this.getChildObject(name,content);
            }
            return obj;
        }
    }
};