elliptical.module = (function (app) {

    var container = app.container;

    container.registerType('Moment', window.moment);

    return app;
})(elliptical.module);