elliptical.module = (function (app) {
    var Store = elliptical.Store;
    var providers = elliptical.providers;
    var container = app.container;

    var Session=Store.extend({
        "@resource":"Session"
    },{});

    var $Session=providers.$Session;
    container.registerType(Session,$Session);

    return app;
})(elliptical.module);