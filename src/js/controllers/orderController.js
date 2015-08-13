elliptical.module = (function (app) {

    var Controller = new elliptical.Controller(app, 'Order');
    Controller('/@action/:id', {
        List: function (req, res, next) {
            var Try=req.service('Try');
            var PAGE_SIZE=app.GRID_SIZE;
            var serviceLabel="orders";
            var Order=req.service('Order');
            var order=new Order();
            var page=req.params.id;
            Try(next,function(){
                var query=order.getFilter(req.query);
                if(query){
                    var decodedQuery=decodeURIComponent(req.query.$filter);
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
                        res.context.orders=result.data;
                        res.context.pagination=result.pagination;
                        res.context.count=result.pagination.count;
                        res.context.label=serviceLabel;
                        res.render(res.context);
                    });
            });

        },

        Detail:function(req,res,next){
            var Try=req.service('Try');
            var id=req.params.id;
            var Order=req.service('Order');
            var Event=req.service('Event');
            Event.emit('route.search.morph',{});
            Try(next,function(){
                Order.get({id:id},function(err,data){
                    res.context.order=data;
                    res.context.method='put';
                    res.context.statusOptions=[{option:'open'},{option:'closed'}];
                    res.render(res.context);
                });
            });
        }

    });

    return app;

})(elliptical.module);