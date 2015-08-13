elliptical.module = (function (app) {
    var container = app.container;

    function FabTransformProvider(){
        this.dialog=null;
        this.getDialog=function(element){
            if(this.dialog){
                return this.dialog;
            }else{
                return $('md-dialog');
            }
        };

        this.show=function(element){
            var dialog=this.getDialog(element);
            dialog.mdDialog('show');
        };

        this.hide=function(){};

        this.listen=function(element){
            $(window).on('md.dialog.hide',function(event){
                element.mdFabTransform('reset');
            });
        };


    }

    container.registerType('$FabTransformProvider', new FabTransformProvider());



    return app;
})(elliptical.module);