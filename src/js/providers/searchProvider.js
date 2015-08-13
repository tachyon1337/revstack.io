elliptical.module = (function (app) {
    var container=app.container;
    var Location=container.getType('Location');


    function SearchProvider(){
        this.find=function(url,val){
            var path=this._getSearchUrl(url,val,'$filter');
            Location.redirect(path);
        };

        this.sort=function(url,field,sortOrder){
            var queryVar=(sortOrder==='asc') ? '$orderBy' : '$orderByDesc';
            var path=this._getSortUrl(url,field,queryVar);
            Location.redirect(path);
        };

        this.sorted=function(url){
            if (url.indexOf('$orderBy') <= -1) {
                return null;
            } else {
                var field = Location.url.queryString(url, '$orderBy');
                if (field && field !== undefined) {
                    return {
                        field: field,
                        sort: 'asc'
                    };
                } else {
                    return {
                        field: Location.url.queryString(url, '$orderByDesc'),
                        sort: 'desc'
                    }
                }
            }
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

        this._getSortUrl=function(url,val,queryVar){
            var index=url.indexOf('$orderBy');
            var str = queryVar + '=' + encodeURIComponent(val);
            if(index > -1){
                url=url.substr(0, index) + str;
                return url;
            }else{
                url+= (url.indexOf('?') > -1) ? '&' + str : '?' + str;
                return url;
            }
        };



    }

    container.registerType('$SearchProvider', new SearchProvider());

    return app;
})(elliptical.module);