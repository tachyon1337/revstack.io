
elliptical.module=(function (app) {
    var Controller = new elliptical.Controller(app,'Home');
    Controller('/@action', {
        Index:function(req,res,next){
            var Try=req.service('Try');
            Try(next,function(){
                var Settings=req.service('Settings');
                var displayModel=Settings.getDisplayModel();
                res.context.displayModel=displayModel;
                res.render(res.context);
            });
        }
    });


    return app;

})(elliptical.module);
