elliptical.module = (function (app) {

    var container = app.container;
    function Search(){
        this.$provider=this.constructor.$provider;
        this.find=function(url,val){
            this.$provider.find(url,val);
        };

        this.getFilter=function(params){
            return this.$provider.getFilter(params);
        };

        this.getQueryFilter=function(params){
            return this.$provider.getQueryFilter(params);
        };

        this.setQueryLabel=function(params){
            return this.$provider.setQueryLabel(params);
        };

        this.sort=function(url,params,sortOrder){
            this.$provider.sort(url,params,sortOrder);
        };
        this.sorted=function(url){
            return this.$provider.sorted(url);
        }
    }

    container.mapType('Search',Search,'$SearchProvider');

    return app;
})(elliptical.module);