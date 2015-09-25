elliptical.module = (function (app) {

    var container = app.container;
    var Search=elliptical.Search;

    container.mapType('Search',Search,'$SearchProvider');

    return app;
})(elliptical.module);