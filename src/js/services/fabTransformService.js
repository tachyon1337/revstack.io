elliptical.module=(function (app) {

    var Dialog = elliptical.Dialog;
    var container=app.container;

    var FabTransform=Dialog.extend({
        '@resource':'FabTransform',
        listen:function(element){return this.$provider.listen(element)}
    },{
        listen:function(element){return this.constructor.listen(element)}
    });


    container.mapType(FabTransform,'$FabTransformProvider');

    return app;

})(elliptical.module);
