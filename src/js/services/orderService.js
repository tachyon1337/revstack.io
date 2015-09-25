elliptical.module = (function (app) {
    var Service = elliptical.Service;
    var container=app.container;

    var Order = Service.extend({
        "@resource": 'Order',

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