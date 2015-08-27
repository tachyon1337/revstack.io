
elliptical.module=(function (app) {
    var container=app.container;
    var Controller = new elliptical.Controller(app,'Home');

    Controller('/@action', {
        Index:function(req,res,next){
            var Try=container.getType('Try');
            Try(next,function(){
                var Settings=container.getType('Settings');
                var dashboard;
                if(app.context.disableDashboard && app.context.disableDashboard !==undefined){
                    dashboard=null;
                }else{
                    dashboard=Settings.getDisplayModel();
                }
                res.context.dashboard=dashboard;
                res.render(res.context);
            });
        }
    });

    return app;
})(elliptical.module);
