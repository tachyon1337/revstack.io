elliptical.module = (function (app) {

    var PAGE_SIZE=app.PAGE_SIZE;

    var Controller = new elliptical.Controller(app, 'User');
    Controller('/@action/:id', {
        List: function (req, res, next) {
            var Try=req.service('Try');
            var serviceLabel="users";
            var User=req.service('User');
            var user=new User();
            var page=req.params.id;

            Try(next,function(){
                var query=user.getFilter(req.query);
                if(query){
                    var decoded=decodeURIComponent(req.query.$filter);
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
                        res.context.users=result.data;
                        res.context.pagination=result.pagination;
                        res.context.count=result.pagination.count;
                        res.context.label=serviceLabel;
                        res.render(res.context);
                    });
            });

        },

        Detail:function(req,res,next){
            var id=req.params.id;
            var User=req.service('User');
            var Event=req.service('Event');
            var Try=req.service('Try');
            Event.emit('route.search.morph',{});
            Try(next,function(){
                User.get({id:id},function(err,data){
                    res.context.user=data;
                    res.context.method='put';
                    res.context.activeHide=(data.active) ? '' : 'hide';
                    res.context.blockHide=(data.active) ? 'hide' : '';
                    res.render(res.context);
                });
            });
        },

        Create:function(req,res,next){
            var User=req.service('User');
            var Event=req.service('Event');
            var Try=req.service('Try');
            Event.emit('route.search.morph',{});
            Try(next,function(){
                res.context.user={};
                res.render(res.context);
            });
        }
    });

    return app;

})(elliptical.module);