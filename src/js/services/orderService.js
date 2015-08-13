elliptical.module = (function (app) {
    var ReportService = elliptical.ReportService;
    var container=app.container;

    var Order = ReportService.extend({
        "@resource": 'Order',

        getFilter:function(params){
            if(params.$filter && params.$filter !==undefined){
                var filter=params.$filter;
                var isDate=(filter.indexOf('Date') > -1);
                if(isDate){
                    var datePicker=container.getType('DatePicker');
                    var dateValue=datePicker.getDate();

                    return {
                        val:dateValue,
                        fn:this.$provider.dateRangePredicate(dateValue)
                    };
                }else{
                    return {
                        val:params.$filter,
                        fn:this.$provider.startsWithPredicate()
                    };
                }

            }else if(params.userid){
                return{
                    val:params.userid,
                    fn:this.$provider.findPredicate('userid')
                }
            }else{
                return null;
            }
        },

        getLabel:function(filter){
            var isDate=(filter.indexOf('Date') > -1);
            if(isDate){
                var datePicker=container.getType('DatePicker');
                return datePicker.get(filter);
            }else{
                return filter;
            }
        },
        sum:function(dateValue,callback){return this.$provider.sum({dateValue:dateValue},callback)},
        sales:function(dateValue,callback){return this.$provider.sum({dateValue:dateValue,prop:'total',type:'float'},callback)}
    }, {

        getLabel:function(param){return this.constructor.getLabel(param)},
        sum:function(dateValue,callback){return this.constructor.sum({dateValue:dateValue},callback)},
        sales:function(dateValue,callback){return this.constructor.sales({dateValue:dateValue},callback)}
    });

    container.mapType(Order,'$OrderRepository');

    return app;
})(elliptical.module);