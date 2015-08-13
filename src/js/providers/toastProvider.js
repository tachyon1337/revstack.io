elliptical.module = (function (app) {

    var container = app.container;

    function ToastProvider(){
        this.element=null;
        this.getElement=function(){
            if(this.element){
                return this.element;
            }else{
                return $('paper-toast')[0];
            }
        };

        this.show=function(text,duration){
            var element=this.getElement();
            if(duration===undefined){
                duration=3000;
            }
            element.text=text;
            if(!element.visible){
                element.duration=duration;
                element.show();
            }
        };

        this.hide=function(){
            var element=this.getElement();
            element.hide();
        };

        this.visible=function(){
            var element=this.getElement();
            return element.visible;
        }
    }

    container.registerType('$NotifyProvider', new ToastProvider());

    return app;
})(elliptical.module);