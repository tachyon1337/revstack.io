elliptical.module = (function (app) {

    var container = app.container;

    function ConfirmDialogProvider(){
        this.element=null;
        this.getElement=function(){
            if(this.element){
                return this.element;
            }else{
                return $('paper-confirm')[0];
            }
        };

        this.show=function(fn){
            var element=this.getElement();
            element.show(fn);
        };

        this.setContent=function(title,message){
            var element=this.getElement();
            element.setContent(title,message,false);
        };
    }

    container.registerType('$ConfirmDialogProvider', new ConfirmDialogProvider());

    return app;
})(elliptical.module);