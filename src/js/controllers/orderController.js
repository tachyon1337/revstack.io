elliptical.module = (function (app) {
    var container=app.container;
    var Controller = new elliptical.Controller(app, 'Order');
    Controller('/@action/:id', {
        List: function (req, res, next) {
            var Try=container.getType('Try');
            var PAGE_SIZE=app.GRID_SIZE;
            var serviceLabel="orders";
            var Order=container.getType('Order');
            var order=new Order();
            var page=req.params.id;
            Try(next,function(){
                //var query=order.getFilter(req.query);
                var query=req.query.$filter;
                if(query){
                    var decodedQuery=decodeURIComponent(query);
                    serviceLabel+=' match "' + order.getLabel(decodedQuery) + '"';
                }
                order
                    .paginate({
                        baseUrl:'/Order/List',
                        rawUrl:req.url,
                        page:page,
                        pageSize:PAGE_SIZE
                    })
                    .filter(query)
                    .orderBy(req.query.$orderBy)
                    .orderByDesc(req.query.$orderByDesc)
                    .get(function(err,result){
                        res.dispatch(err,next,function(){
                            res.context.orders=result.data;
                            res.context.pagination=result.pagination;
                            res.context.count=result.pagination.count;
                            res.context.label=serviceLabel;
                            res.render(res.context);
                        });
                    });
            });
        },

        Detail:function(req,res,next){
            var Try=container.getType('Try');
            var id=req.params.id;
            var Order=container.getType('Order');
            var Event=container.getType('Event');
            Event.emit('route.search.morph',{});
            Try(next,function(){
                Order.get({id:id},function(err,data){
                    res.dispatch(err,next,function(){
                        res.context.order=data;
                        res.context.method='put';
                        res.context.statusOptions=[{option:'open'},{option:'closed'}];
                        res.render(res.context);
                    });
                });
            });
        }

    });

    return app;

})(elliptical.module);