elliptical.module = (function (app) {
    var Service = elliptical.Service;

    var container = app.container;

    var Profile = Service.extend({
        "@resource": 'Profile',
        login: function (params,callback) {
            var query={};
            query.filter = {
                val: { email: params.email, password: params.password},
                fn: this.$provider.loginPredicate()
            };
            this.$provider.get({},query,function(err,data){
                if(data && data[0]){
                    //success
                    var profile=data[0];
                    var Location=container.getType('Location');
                    var $Cookie=container.getType('$Cookie');
                    $Cookie.set('profile',profile);
                    var Event=container.getType('Event');
                    Event.emit('app.login',profile);
                    Location.redirect('/');
                }else{
                    //failure
                    var notify=container.getType('Notify');
                    notify.show('invalid login');
                }
            });
        },

        password:function(params,callback){
            var self=this;
            this.$provider.get({id:params.id},function(err,data){
                data.password=params.password;
                self.$provider.put(data);
                var notify=container.getType('Notify');
                notify.show('password has been updated');
            });
        },

        logout:function(params,callback){
            var $Cookie=container.getType('$Cookie');
            $Cookie.delete('profile');
            var Event=container.getType('Event');
            Event.emit('app.logout',null);
            callback(null,'You have been successfully logged out of your account...');
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