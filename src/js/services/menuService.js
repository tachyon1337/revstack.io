elliptical.module = (function (app) {
    var container=app.container;
    function MenuService(){
        this.element=null;
        this.$provider=null;
        this.show=function(params){this.$provider.show(params)};
        this.setElement=function(element){this.$provider.setElement(element)};
    }
    container.mapType('MenuService', new MenuService(),'$MenuProvider');

    return app;
})(elliptical.module);