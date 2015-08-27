elliptical.module = (function (app) {

    var container = app.container;
    var profile={
        id:1,
        username:'demo@revstack.io',
        password:'demo',
        name:'Admin'
    };

    function $ProfileProvider(){
        this.login=function(params,callback){
            if(params.username===profile.username && params.password===profile.password){
                callback(null,profile);
            }else{
                callback({statusCode:401,message:'Invalid Login'},null);
            }
        };

        this.logout=function(params,callback){
            callback(null,true);
        }
    }

    container.registerType('$ProfileProvider', new $ProfileProvider());

    return app;
})(elliptical.module);