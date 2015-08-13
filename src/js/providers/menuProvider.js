elliptical.module = (function (app) {

    var container = app.container;

    function MenuProvider(){
        this.element=null;
        this.show=function(url){
            var element=this.element;
            element.mdMenu('show',url);
        };
        this.setElement=function(element){
            this.element=element;
        }
    }

    container.registerType('$MenuProvider', new MenuProvider());

    return app;
})(elliptical.module);