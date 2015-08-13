elliptical.module = (function (app) {

    var Notify=elliptical.Notify;
    var container = app.container;

    container.mapType(Notify, '$NotifyProvider');

    return app;
})(elliptical.module);