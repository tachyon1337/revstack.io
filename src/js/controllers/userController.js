elliptical.module = (function (app) {

    var container=app.container;
    var PAGE_SIZE=app.PAGE_SIZE;

    var Controller = new elliptical.Controller(app, 'User');
    Controller('/@action/:id', {
        List: function (req, res, next) {
            var Try=container.getType('Try');
            var serviceLabel="users";
            var User=container.getType('User');
            var user=new User();
            var page=req.params.id;

            Try(next,function(){
                var keys = Object.keys( req.query );
                var query;
                if(keys[0]){
                    query=req.query[keys[0]];
                    var decoded=decodeURIComponent(query);
                    serviceLabel += ' match "' + decoded + '"';
                }
                user
                    .paginate({
                        baseUrl:'/User/List',
                        rawUrl:req.url,
                        page:page,
                        pageSize:PAGE_SIZE
                    })
                    .filter(query)
                    .get(function(err,result){
                        res.dispatch(err,next,function(){
                            res.context.users=result.data;
                            res.context.pagination=result.pagination;
                            res.context.count=result.pagination.count;
                            res.context.label=serviceLabel;
                            res.render(res.context);
                        });
                    });
            });

        },

        Detail:function(req,res,next){
            var id=req.params.id;
            var User=container.getType('User');
            var Event=container.getType('Event');
            var Try=container.getType('Try');
            Event.emit('route.search.morph',{});
            Try(next,function(){
                User.get({id:id},function(err,data){
                    res.dispatch(err,next,function(){
                        res.context.user=data;
                        res.context.method='put';
                        res.context.activeHide=(data.active) ? '' : 'hide';
                        res.context.blockHide=(data.active) ? 'hide' : '';
                        res.render(res.context);
                    });
                });
            });
        },

        Create:function(req,res,next){
            var User=container.getType('User');
            var Event=container.getType('Event');
            var Try=container.getType('Try');
            Event.emit('route.search.morph',{});
            Try(next,function(){
                res.context.user={};
                res.render(res.context);
            });
        }
    });

    return app;

})(elliptical.module);