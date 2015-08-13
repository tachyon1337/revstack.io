elliptical.module = (function (app) {

    var Store=elliptical.Store;
    var container = app.container;

    var Settings=Store.extend({
        "@resource":"Settings",
        getDashboard:function(key){return this.$provider.getDashboard(key)},
        setDashboard:function(key,value){this.$provider.setDashboard(key,value)},
        getDisplayModel:function(){return this.$provider.getDisplayModel()}
    },{
        getDashboard:function(key){return this.constructor.getDashboard(key)},
        setDashboard:function(key,value){this.constructor.setDashboard(key,value)},
        getDisplayModel:function(){return this.constructor.getDisplayModel()}
    });


    container.mapType(Settings, '$Settings');

    return app;
})(elliptical.module);