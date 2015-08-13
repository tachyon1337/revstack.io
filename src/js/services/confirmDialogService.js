elliptical.module = (function (app) {
    var container = app.container;
    var Dialog=elliptical.Dialog;
    var ConfirmDialog=Dialog.extend({
        '@resource':'ConfirmDialog',
        setContent:function(title,message){return this.$provider.setContent(title,message)}
    },{
        setContent:function(title,message){ return this.constructor.setContent(title,message)}
    });


    container.mapType(ConfirmDialog,'$ConfirmDialogProvider');

    return app;
})(elliptical.module);