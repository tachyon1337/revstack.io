elliptical.module = (function (app) {

    var container = app.container;

    container.registerType('Async', window.async.series);

    return app;
})(elliptical.module);