elliptical.module = (function (app) {
    var menuService=null;
    app.history(function(params,container){
        var route=params.route;
        if(!menuService){
            menuService=container.getType('MenuService');
        }
        menuService.show(route);

    });


    return app;
})(elliptical.module);