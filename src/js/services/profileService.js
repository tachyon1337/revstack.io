elliptical.module = (function (app) {
    var Service = elliptical.Service;

    var container = app.container;
    var Profile = Service.extend({
        "@resource": 'Profile',
        get: function(){
            var $Cookie=container.getType('$Cookie');
            return $Cookie.get('profile');
        },

        login: function (params,callback) {

            this.$provider.login(params,function(err,data){
                if(!err){
                    //success
                    var profile=data;
                    var Location=container.getType('Location');
                    var $Cookie=container.getType('$Cookie');
                    $Cookie.set('profile',profile);
                    var Event=container.getType('Event');
                    Event.emit('app.login',profile);
                    Location.redirect('/');

                }else{
                    //failure
                    var notify=container.getType('Notify');
                    notify.show('Invalid Login');
                }
            });
        },

        logout:function(params,callback){
            this.$provider.logout(params,function(err,data){
                if(!err){
                    var $Cookie=container.getType('$Cookie');
                    $Cookie.delete('profile');
                    var Event=container.getType('Event');
                    Event.emit('app.logout',null);
                    if(callback){
                        callback(null,{message:'You have been logged out from your account...'});
                    }
                }else{
                    if(callback){
                        callback(err,null);
                    }
                }

            });
        },

        authenticated:function(){
            var $Cookie=container.getType('$Cookie');
            var profile=$Cookie.get('profile');
            return (profile !==undefined && profile) ? profile : null;
        }

    }, {});


    container.mapType(Profile, '$ProfileProvider');

    return app;
})(elliptical.module);