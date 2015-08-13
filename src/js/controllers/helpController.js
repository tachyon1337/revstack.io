elliptical.module = (function (app) {

    var Controller = new elliptical.Controller(app,'Help');
    Controller('/@action', {
        Index:function(req,res,next){
            var Try=req.service('Try');
            Try(next,function(){
                res.render(res.context);
            });
        }

    });


    return app;
})(elliptical.module);