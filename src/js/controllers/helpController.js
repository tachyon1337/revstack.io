elliptical.module = (function (app) {
    var container=app.container;
    var Controller = new elliptical.Controller(app,'Help');
    Controller('/@action', {
        Index:function(req,res,next){
            var Try=container.getType('Try');
            Try(next,function(){
                res.render(res.context);
            });
        }
    });

    return app;
})(elliptical.module);