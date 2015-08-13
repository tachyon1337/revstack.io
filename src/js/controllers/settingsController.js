elliptical.module = (function (app) {

    var Controller = new elliptical.Controller(app,'Settings');
    Controller('/@action', {
        Index:function(req,res,next){
            var Try=req.service('Try');
            Try(next,function(){
                var Settings=req.service('Settings');
                res.context.dashboard=Settings.getDashboard();
                res.render(res.context);
            });

        }

    });

    return app;
})(elliptical.module);