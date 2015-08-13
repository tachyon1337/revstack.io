elliptical.module = (function (app) {

    var container=app.container;
    container.registerType('Try', elliptical.Try);

    return app;
})(elliptical.module);