/// integrates elliptical service locator with Polymer components

elliptical.module = (function (app) {
    var container=app.container;
    elliptical.binding('paper-service',function(node){
        setTimeout(function(){
            node.service=function(name){
                return container.getType(name);
            }
        },800);

    });


    return app;
})(elliptical.module);