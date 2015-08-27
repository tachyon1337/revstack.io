elliptical.module = (function (app) {
    var container=app.container;
    var Controller = new elliptical.Controller(app,'Settings');

    Controller('/@action', {
        Index:function(req,res,next){
            var Try=container.getType('Try');
            Try(next,function(){
                var Settings=container.getType('Settings');
                res.context.settings=Settings.getDashboard();
                res.render(res.context);
            });
        }

    });

    return app;
})(elliptical.module);