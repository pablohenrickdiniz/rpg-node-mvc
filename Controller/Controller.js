module.exports = {
    name:null,
    modelName:null,
    request:null,
    response:null,
    write:function(content){
        var self = this;
        self.response.write(content);
    },
    end:function(content){
        var self = this;
        self.response.end(content);
    }
};