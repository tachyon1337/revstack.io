elliptical.module = (function (app) {

    var Controller = new elliptical.Controller(app, 'Profile');

    Controller('/@action', {
        Index: function (req, res, next) {
            var Try = req.service('Try');
            Try(next, function () {
                var $Cookie=req.service('$Cookie');
                var profile=$Cookie.get('profile');
                var Profile=req.service('Profile');
                Profile.get({id:profile.id},function(err,data){
                    res.context.user=data;
                    res.context.method='put';
                    res.render(res.context);
                });
            });
        },

        Login: function (req, res, next) {
            var Try = req.service('Try');
            Try(next, function () {
                res.context.method='login';
                res.render(res.context);
            });
        },

        Logout: function (req, res, next) {
            var Try = req.service('Try');
            Try(next, function () {
                var $Cookie=req.service('$Cookie');
                var profile=$Cookie.get('profile');
                var Profile=req.service('Profile');
                Profile.logout({id:profile.id},function(err,data){
                    res.context.message=data;
                    res.render(res.context);
                });
            });
        },

        Password: function (req, res, next) {
            var Try = req.service('Try');
            Try(next, function () {
                var $Cookie=req.service('$Cookie');
                res.context.user=$Cookie.get('profile');
                res.context.method='password';
                res.render(res.context);
            });
        }

    });

    return app;

})(elliptical.module);