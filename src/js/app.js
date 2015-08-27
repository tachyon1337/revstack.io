elliptical.module=(function (app) {

    app = elliptical(); //create the app

    var Service = elliptical.Service;
    var Location = elliptical.Router.Location;
    var Event=elliptical.Event;
    var $Cookie=elliptical.providers.$Cookie;

    var container=app.container; //app Dependency Injection container

    //app title
    app.context.siteTitle='My Dashboard';

    //views root
    var viewsRoot='/views';

    //define the Dashboard Service "interface"
    elliptical.DashboardService=Service.extend({
        "@resource":'DashBoardService',
        element:null,
        show:function(element){this.$provider.show(element)},
        hide:function(key){
            var Settings=container.getType('Settings');
            var component=Settings.getDashboard(key);
            component.active=false;
            Settings.setDashboard(key,component);
        },
        refresh:function(element){this.$provider.refresh(element)},
        setElement:function(element) {this.element=element},
        onAfterGet:function(element,scope) {this.$provider.onAfterGet(element,scope)},
        action:function(element,params) {this.$provider.action(element,params)}
    },{
        element:null,
        show:function(element){this.constructor.show(element)},
        hide:function(key){this.constructor.hide(key)},
        refresh:function(element){this.constructor.refresh(element)},
        setElement:function(element){this.element=element},
        onAfterGet:function(element,scope){this.constructor.onAfterGet(element,scope)},
        action:function(element,params) {this.constructor.action(element,params)}

    });

    //extend service class for reporting
    elliptical.ReportService=Service.extend({
        getFilter:function(params){return this.$provider.getFilter(params)},
        sum:function(dateValue,prop,type,callback){this.$provider.sum(dateValue,prop,type,callback)}
    },{
        getFilter:function(params){return this.constructor.getFilter(params)},
        sum:function(dateValue,prop,type,callback){this.constructor.sum(dateValue,prop,type,callback)}
    });

    //extend the generic repository for common predicates
    var GenericRepository=elliptical.GenericRepository;

    GenericRepository.prototype.dateRangePredicate=function(param,prop){
        if(prop===undefined){
            prop='date';
        }
        if(param.start && param.end){
            return function(obj,val){
                var dte=moment(obj[prop]);
                return (dte >=val.start && dte <=val.end);
            }
        }else{
            return function(obj,val){
                var dte=moment(obj[prop]);
                return (dte >=val);
            }
        }
    };
    GenericRepository.prototype.startsWithPredicate=function(){
        return function(obj,val){
            if(!val || val==='' || val===undefined){
                return false;
            }

            val=decodeURIComponent(val);
            var firstName=(obj.billingAddress) ? obj.billingAddress.firstName : obj.firstName;
            firstName=firstName.toLowerCase();
            var lastName=(obj.billingAddress) ? obj.billingAddress.lastName : obj.lastName;
            lastName=lastName.toLowerCase();
            var city=(obj.billingAddress) ? obj.billingAddress.city : obj.city;
            city=city.toLowerCase();
            val=val.toLowerCase();
            var result=((firstName.indexOf(val)===0) || (lastName.indexOf(val)===0) || (city.indexOf(val)===0));
            if(result){
                return true;
            }else{
                var words=val.split(' ');
                if(words.length < 2){
                    return false;
                }
                return (firstName.indexOf(words[0])===0 && lastName.indexOf(words[1])===0)
            }
        }
    };
    GenericRepository.prototype.findPredicate=function(prop){
        return function(obj,val){
            if(!val || val==='' || val===undefined){
                return false;
            }
            return (obj[prop]===val);
        };
    };

    GenericRepository.prototype.sum=function(params,callback){
        var dateValue=params.dateValue;
        var prop=params.prop || null;
        var dateProp=params.dateProp || 'date';
        var type=params.type || null;
        var query={};
        query.filter={
            val:dateValue,
            fn:this.dateRangePredicate(dateValue,dateProp)
        };
        this.get({},null,query,function(err,result){
            if(result && result.length && result.length >0){
                if(!prop || prop===undefined){
                    callback(null,result.length);
                }else{
                    var sum=0;
                    var length=result.length;
                    for(var i=0;i<length;i++){
                        sum+=(type==='float') ? parseFloat(result[i][prop]) : parseInt(result[i][prop]);
                    }
                    return callback(null,sum);
                }
            }else{
                return callback(null,0);
            }
        });
    };

    //register Location,Event $Cookie with the container
    //container.registerType({string} name <optional>,{object} service <required>,{object} provider <optional>)
    container.registerType('Location',Location);
    container.registerType('Event',Event);
    container.registerType('$Cookie',$Cookie);

    //inject the app container to implement the web component service locator
    //$.element.serviceLocator({function} fn <required>, {object} container <required>)
    $.element.serviceLocator(container.getType,container);


    app.configure(function(){
        //use hashTags for url routing
        app.PAGE_SIZE=20;
        app.GRID_SIZE=10;
        app.hashTag=true;

        // middleware service locator
        app.use(elliptical.serviceLocator());

        ///global callback to handle route authentication
        app.use(elliptical.globalCallback(function (req, res, next) {
            var profileCookie=req.cookies.profile;
            if(profileCookie===undefined  && req.route !=='/profile/login'){
                res.redirect('/Profile/Login');
            }else{
                next();
            }
        }));

        //app.router
        app.use(app.router);

        //error
        app.use(elliptical.httpError());

        //http 404
        app.use(elliptical.http404());
    });


    /* listen */
    app.listen(true,function(){
        //load in the menu and toolbar into the global layout on page load
        $.get(viewsRoot + '/shared/md-menu.html',function(data){
            var menuPlaceholder=$('[data-menu-placeholder]');
            menuPlaceholder.html(data);
        });
        $.get(viewsRoot + '/shared/md-toolbar.html',function(data){
            var toolbarPlaceholder=$('[data-toolbar-placeholder]');
            toolbarPlaceholder.html(data);
        });
        //set site title in title tag
        $('title').html(app.context.siteTitle);

    }); //single page app

    return app;

})(elliptical.module);