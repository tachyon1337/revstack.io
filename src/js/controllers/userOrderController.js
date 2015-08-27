elliptical.module = (function (app) {
    var container=app.container;
    var Controller = new elliptical.Controller(app, 'UserOrder');
    Controller('/@action/:userid/:page', {
        List: function (req, res, next){
            var Try=container.getType('Try');
            var PAGE_SIZE=app.GRID_SIZE;
            var userId=req.params.userid;
            var page=req.params.page;
            var User=container.getType('User');
            var Order=container.getType('Order');
            var order=new Order();
            Try(next,function(){
                var query=order.getFilter(req.params);
                var Async=container.getType('Async');
                Async([
                    function(callback){
                        User.get({id:userId},function(err,data){callback(err,data)})
                    },
                    function(callback){
                        order.paginate({
                            baseUrl:'/UserOrder/List/' + userId,
                            rawUrl:req.url,
                            page:page,
                            pageSize:PAGE_SIZE
                        })
                            .filter(query)
                            .orderBy(req.query.$orderBy)
                            .orderByDesc(req.query.$orderByDesc)
                            .get({userId:userId},function(err,result){callback(err,result)})
                    }
                ],function(err,results){
                    res.dispatch(err,next,function(){
                        res.context.user=results[0];
                        res.context.orders=results[1].data;
                        res.context.pagination=results[1].pagination;
                        res.context.count=results[1].pagination.count;
                        res.context.hide=(res.context.count > 0) ? '' : 'hide-important';
                        res.render(res.context);
                    });
                });
            });
        }
    });

    return app;

})(elliptical.module);