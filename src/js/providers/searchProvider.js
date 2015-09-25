elliptical.module = (function (app) {
    var container=app.container;
    var Location=container.getType('Location');


    function SearchProvider(){
        this.find=function(params){
            var url=params.url;
            var val=params.value;
            Location.href=this._getSearchUrl(url,val,'$filter');
        };


        this._getSearchUrl=function(url,val,queryVar){
            var str = queryVar + '=' + encodeURIComponent(val);
            var baseUserUrl='/User/List/1';
            var baseOrderUrl='/Order/List/1';
            var isExistingQuery=(url.indexOf('?') > -1);
            var searchUrl=(url.indexOf('/Order')>-1 || url.indexOf('/UserOrder')>-1) ? baseOrderUrl : baseUserUrl;
            searchUrl+=(isExistingQuery) ? '&' + str : '?' + str;
            return searchUrl;
        };


    }

    container.registerType('$SearchProvider', new SearchProvider());

    return app;
})(elliptical.module);