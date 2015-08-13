elliptical.module = (function (app) {

    var container = app.container;

    function SearchMorphService(){
        this.$provider=this.constructor.$provider;
        this.listen=function(showElement,toggleElement){
            this.$provider.listen(showElement,toggleElement);
        }
    }


    container.mapType('SearchMorphService',SearchMorphService, '$SearchMorphProvider');

    return app;
})(elliptical.module);