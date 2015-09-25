/// Handles setting the correct menu path on page load
/// also handles menu 404--menu can't match menu item to a route(applies mainly to history events, i.e back button)

elliptical.module = (function (app) {
    var container = app.container;

    elliptical.binding('menu', function (node) {
        this.event($(document),'md.menu.url.404',onUrl404);

        var menuService=container.getType('MenuService');
        menuService.setElement($(node));
        var Location=container.getType('Location');
        var path=Location.path;
        menuService.show(path);

        function onUrl404(event,data){

        }

    });


    return app;
})(elliptical.module);