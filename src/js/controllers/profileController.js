elliptical.module = (function (app) {
    var container=app.container;
    var Controller = new elliptical.Controller(app, 'Profile');

    Controller('/@action', {
        Index: function (req, res, next) {
            var Try = container.getType('Try');
            Try(next, function () {
                var $Cookie=container.getType('$Cookie');
                var profile=$Cookie.get('profile');
                var Profile=container.getType('Profile');
                Profile.get({id:profile.id},function(err,data){
                    res.dispatch(err,next,function(){
                        res.context.user=data;
                        res.context.method='put';
                        res.render(res.context);
                    });
                });
            });
        },

        Login: function (req, res, next) {
            var Try = container.getType('Try');
            Try(next, function () {
                res.context.method='login';
                res.render(res.context);
            });
        },

        Logout: function (req, res, next) {
            var Try = container.getType('Try');
            Try(next, function () {
                var $Cookie=container.getType('$Cookie');
                var profile=$Cookie.get('profile');
                var Profile=container.getType('Profile');
                Profile.logout({id:profile.id},function(err,data){
                    res.dispatch(err,next,function(){
                        res.context.message=(err) ? err.message : data.message;
                        res.render(res.context);
                    });
                });
            });
        },

        Password: function (req, res, next) {
            var Try = container.getType('Try');
            Try(next, function () {
                var $Cookie=container.getType('$Cookie');
                res.context.user=$Cookie.get('profile');
                res.context.method='password';
                res.render(res.context);
            });
        }

    });

    return app;

})(elliptical.module);