
elliptical.module = (function (app) {
    var ReportService = elliptical.ReportService;
    var container=app.container;

    var User = ReportService.extend({
        "@resource": 'User',
        resetPassword:function(params,callback){return this.$provider.resetPassword(params,callback)},
        sum:function(dateValue,callback){return this.$provider.sum({dateValue:dateValue,dateProp:'dateRegistered'},callback)}

    }, {
        resetPassword:function(params,callback){return this.constructor.resetPassword(params,callback)},
        sum:function(dateValue,callback){return this.constructor.sum(dateValue,callback)}
    });


    container.mapType(User,'$UserRepository');


    return app;
})(elliptical.module);