/// clears the document of tooltips on tooltip clicks, otherwise hovered tooltips will persist on screen when clicked because the
/// the SPA will clear the element when loading a new view but the tooltip is bound to Document, not to the content placeholder element

elliptical.module = (function (app) {
    elliptical.binding('tooltip',function(node){
        this.event($(node),this.click,function(event){
            $(document).tooltip('clear');
        });
    });

    return app;
})(elliptical.module);