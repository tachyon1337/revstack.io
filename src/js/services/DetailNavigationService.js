elliptical.module = (function (app) {
    var Service = elliptical.Service;
    var container = app.container;
    var $Navigation=elliptical.providers.$Navigation;
    var Location=container.getType('Location');

    var DetailNavigationService = Service.extend({
        "@resource": null,
        $navigationProvider:null,
        nav:null,

        navigation:function(params,callback){
            var self=this;
            var id=params.id;
            var baseUrl=params.baseUrl;
            var referrer=Location.referrer;
            if(referrer){
                var req={};
                req.query=Location.query;
                if(req.query.dir){
                    this._navigation(id,this.nav,baseUrl,callback);
                }else{
                    var query=Location.getQuery(referrer);
                    if(!query){
                        query={};
                    }
                    this.$navigationProvider.get({filter:query.$filter},function(err,data){
                        self.nav=data;
                        self._navigation(id,data,baseUrl,callback);
                    });
                }
            }else{
                var navigation_=$Navigation.get({id:id});
                callback(null,navigation_);
            }
        },

        _navigation:function(id,data,baseUrl,callback){
            var navigation_=$Navigation.get({id:id, data:data, baseUrl:baseUrl});
            callback(null,navigation_);
        }

    }, {

        navigation:function(params,callback){
            this.constructor.navigation(params,callback);
        }
    });



    container.registerType('DetailNavigationService', DetailNavigationService);

    return app;
})(elliptical.module);