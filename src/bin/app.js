elliptical.module=(function (app) {

    app = elliptical(); //create the app

    var Service = elliptical.Service;
    var Location = elliptical.Router.Location;
    var Event=elliptical.Event;
    var $Cookie=elliptical.providers.$Cookie;

    var container=app.container; //app Dependency Injection container

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
        $.get('/views/shared/md-menu.html',function(data){
            var menuPlaceholder=$('[data-menu-placeholder]');
            menuPlaceholder.html(data);
        });
        $.get('/views/shared/md-toolbar.html',function(data){
            var toolbarPlaceholder=$('[data-toolbar-placeholder]');
            toolbarPlaceholder.html(data);
        });
    }); //single page app

    return app;

})(elliptical.module);
/// binds the Dashboard icon cards to dashboard datepicker changes

elliptical.module = (function (app) {

    var container = app.container;
    var EVENT_NAME='db.datapicker.change';

    elliptical.binding('cards', function (node) {
        var $node=$(node);
        var Event=container.getType('Event');
        var DatePicker=null;
        var handle=Event.on(EVENT_NAME,populate);

        this.onDestroy=function(){
          Event.off(handle);
        };

        function populate(dateValue){
            var Async=container.getType('Async');
            var Order=container.getType('Order');
            var User=container.getType('User');
            var StatisticsGraph=container.getType('StatisticsGraph');

            Async([
                function(callback){Order.sum(dateValue,function(err,data){callback(err,data)})},
                function(callback){Order.sales(dateValue,function(err,data){callback(err,data)})},
                function(callback){User.sum(dateValue,function(err,data){callback(err,data)})},
                function(callback){StatisticsGraph.sum(dateValue,function(err,data){callback(err,data)})}
            ],function(err,results){
                updateOrders(results[0]);
                updateSales(results[1]);
                updateUsers(results[2]);
                updateVisits(results[3]);
                updateDateRange();
            });
        }


        function updateOrders(data){
            var span=$node.find('[data-id="orders"]');
            span.text(data);
        }

        function updateSales(data){
            var span=$node.find('[data-id="sales"]');
            var sales=data.toFixed(2);
            span.text(sales);
        }

        function updateUsers(data){
            var span=$node.find('[data-id="users"]');
            span.text(data);
        }

        function updateVisits(data){
            var span=$node.find('[data-id="visits"]');
            span.text(data);
        }

        function updateDateRange(){
            var span=$('[data-id="date-range"]');
            var range=DatePicker.getDateRange();
            if(range){
                span.text(range);
            }
        }

        var datePicker=container.getType('DatePicker');
        DatePicker=datePicker;
        var dateValue=datePicker.getDate();
        populate(dateValue);
    });


    return app;
})(elliptical.module);
///Dashboard Settings Binding: Listens for changes in the switch settings in Settings > Dashboard and calls the Settings service
/// to update the persistence store

elliptical.module = (function (app) {
    var container = app.container;

    elliptical.binding('dashboard-settings', function (node) {
        this.event($(document),'md.switch.change',onChange);

        function onChange(event,data){
            var Settings=container.getType('Settings');
            var component=Settings.getDashboard(data.id);
            component.active=data.checked;
            Settings.setDashboard(data.id,component);
        }
    });


    return app;
})(elliptical.module);
/// Calls the Dialog service when the FAB is clicked

elliptical.module = (function (app) {
    var container=app.container;
    elliptical.binding('fab',function(node){

        this.event($(node),this.click,onClick);

        function onClick(event){
            var service=container.getType('FabTransform');
            service.show();
        }
        var type=node.getAttribute('fab-type');
        if(type==='orders'){
            forOrders();
        }

        function forOrders(){
            var datePicker=$('db-datepicker');
            datePicker.dbDatepicker('clear');

        }
    });

    return app;
})(elliptical.module);
/// Handles setting the correct menu path on page load
/// also handles menu 404--menu can't match menu item to a route(applies mainly to history events, i.e back button)

elliptical.module = (function (app) {
    var container = app.container;

    elliptical.binding('menu', function (node) {
        this.event($(document),'md.menu.url.404',onUrl404);

        var menuService=container.getType('MenuService');
        menuService.setElement($(node));
        var Location=container.getType('Location');
        var path=Location.path;
        menuService.show(path);

        function onUrl404(event,data){
            console.log(data);
        }

    });


    return app;
})(elliptical.module);
/// order detail view binding

elliptical.module = (function (app) {
    var container = app.container;

    elliptical.binding('order-detail', function (node) {
        var Order=container.getType('Order');
        var ConfirmDialog=container.getType('ConfirmDialog');
        var Notify=container.getType('Notify');

        var $node=$(node);
        var navList=$node.find('nav-list');
        var deleteItem=$node.find('[action="delete"]');
        var editItem=$node.find('[action="edit"]');


        this.event($node,this.click,'[action="delete"]:not(.disabled)',onDelete);
        this.event($(document),'md.radio.change',onStatusChange);

        function onDelete(event){
            var dialog=new ConfirmDialog();
            dialog.setContent('Confirm Delete','Are you sure you wish to delete this order?');
            dialog.show(function(confirmed){
                if(confirmed){
                    _handleDelete();
                }
            });
        }

        function _handleDelete(){
            var id=deleteItem[0].dataset.id;
            var notify= new Notify();
            Order.delete({id:id},function(err,data){
                var message=(err) ? "Error: Error deleting order" : "Order has been deleted";
                notify.show(message);
                _addDisabledClass();
            });
        }

        function _addDisabledClass(){
            deleteItem.addClass('disabled');
            editItem.addClass('disabled');
        }

        function onStatusChange(event,data){
            var orderId=navList[0].dataset.id;
            var status=data.id;
            var orderStatus=$node.find('[order-status]');
            orderStatus.attr('class','')
                .addClass(status)
                .text(status);

            Order.get({id:orderId},function(err,data){
                data.status=status;
                Order.put(data);
            });
        }




    });


    return app;
})(elliptical.module);
/// order grid view binding

elliptical.module = (function (app) {

    var EVT_CHANNEL='list.change';
    var container=app.container;

     elliptical.binding('order-grid',function(node){

         var Order=container.getType('Order');
         var ConfirmDialog=container.getType('ConfirmDialog');
         var Notify=container.getType('Notify');
         var Event=container.getType('Event');
         var Location=container.getType('Location');

         var $node=$(node);
         var deleteItem=$node.find('[action="delete"]');
         var viewItem=$node.find('[action="view"]');

         this.event($(document),'md.checkbox.change',onCheckboxChange);
         this.event($node,this.click,'[action="delete"]:not(.disabled)',onDelete);
         this.event($node,this.click,'[action="view"]:not(.disabled)',onView);

         function onCheckboxChange(event,data){
             if(data.checked){
                 _removeDisabledClass();
             }else{
                 if(!_multiChecked()){
                     _addDisabledClass();
                 }
             }
         }

         function onDelete(event){
             var dialog=new ConfirmDialog();
             dialog.setContent('Confirm Delete','Are you sure you wish to delete the selected order(s)?');
             dialog.show(function(confirmed){
                 if(confirmed){
                     _handleDelete();
                 }
             });
         }

         function onView(event){
             var checked=_getMultiChecked();
             var id=checked[0].dataset.id;
             var url='/Order/Detail/' + id;
             Location.redirect(url);
         }

         function _removeDisabledClass(){
             deleteItem.removeClass('disabled');
             viewItem.removeClass('disabled');
         }

         function _addDisabledClass(){
             deleteItem.addClass('disabled');
             viewItem.addClass('disabled');
         }

         function _getMultiChecked(){
             return $node.find('md-checkbox[checked]');
         }

         function _multiChecked(){
             var checked=_getMultiChecked();
             return (checked.length > 1);
         }

         function _handleDelete(){
             var checked=_getMultiChecked();
             var notify= new Notify();
             if(checked.length<2){
                 var id=checked[0].dataset.id;
                 _deleteFromDOM(id);
                 Order.delete({id:id},function(err,data){
                     (err) ? notify.show('Error: Error deleting order') : onDeletions('Order has been deleted',1,notify);
                 });

             }else{
                 var ids=_getIds(checked);
                 _deleteIdsFromDOM(ids);
                 Order.delete({ids:ids},function(err,data){
                     (err) ? notify.show('Error: Error deleting orders') : onDeletions('Orders have been deleted',ids.length,notify);
                 });
             }
         }

         function onDeletions(msg,count,notify){
             notify.show(msg);
             _addDisabledClass();
             Event.emit(EVT_CHANNEL,{removed:count});
         }

         function _deleteIdsFromDOM(ids){
             ids.forEach(function(id){
                _deleteFromDOM(id);
             });
         }

         function _deleteFromDOM(id){
             $node.find('grid-item[data-id="' + id + '"]').remove();
         }

         function _getIds(checked){
             var ids=[];
             var length=checked.length;
             for(var i=0; i<length; i++){
                 ids.push(checked[i].dataset.id);
             }
             return ids;
         }

     });

    return app;
})(elliptical.module);
/// integrates elliptical service locator with Polymer components

elliptical.module = (function (app) {
    var container=app.container;
    elliptical.binding('paper-service',function(node){
        setTimeout(function(){
            node.service=function(name){
                return container.getType(name);
            }
        },800);

    });


    return app;
})(elliptical.module);
//Profile Binding: sets/updates the Avatar dropdown profile content

elliptical.module = (function (app) {
    var container = app.container;

    elliptical.binding('profile', function (node) {
        var $node=$(node);
        var Event=container.getType('Event');
        var handleLogin=Event.on('app.login',setUser);
        var handleLogout=Event.on('app.logout',setGuest);

        this.onDestroy=function(){
            Event.off(handleLogin);
            Event.off(handleLogout);
        };

        function init(){
            var Profile=container.getType('Profile');
            var _profile=Profile.authenticated();
            if(!_profile){
                setGuest();
            }else{
                setUser(_profile);
            }
        }

        function setGuest(){
            var obj={
                name:'Guest',
                link:'/Profile/Login',
                label:'Sign In'
            };
            updateDom(obj);
        }

        function setUser(p){
            var obj={
                name: p.firstName + ' ' + p.lastName,
                link:'/Profile/Logout',
                label:'Sign Out'
            };
            updateDom(obj);
        }

        function updateDom(obj){
            var profileName=$node.find('[data-profile-name]');
            profileName.text(obj.name);
            var link=$node.find('[data-profile-link]');
            link.attr('href',obj.link);
            link.html(obj.label);
        }

        init();
    });


    return app;
})(elliptical.module);
/*

 elliptical.binding binds a closure to any mutated element(i.e,  elements added to the DOM) that has an "ea" attribute.
 The binding passes a reference to the HTML node to the closure

 <html-tag ea="my-binding"></html-tag>

 elliptical.binding("my-binding",function(node){
         ///the callback instance
 });

any callback instance automatically has this.event,this.OnDestroy, this.click, this.jsonParseMessage bound

because a closure with a bound element reference is a recipe for memory leaks in SPA apps, most events should be registered
using this.event which guarantees event unbinding on element destruction. If a handler is not registered with this.event, the handler should
be unbound using the this.OnDestroy.

unbound event handlers==memory leaks in SPAs

that being said, the closure is set to null when the element instance is destroyed, to snuff out the leaks


this.click is a click/touch event that replaces 'click'

 */

/// toolbar search binding

elliptical.module = (function (app) {
    var container=app.container;

    elliptical.binding('search', function (node) {
        var Search=container.getType('Search');
        var Location=container.getType('Location');
        var $node=$(node);
        this.event($node,this.click,'button',onClick);
        this.event($node,'keypress',onKeypress);

        function onClick(event){
            var input=$(node).find('input');
            var val=input.val();
            var search=new Search();
            var url=_getUrl();
            if(val !==''){
                input.val('');
                search.find(url,val);
            }
        }

        function onKeypress(event){
            if (event.which !== 13) {
                return;
            }
            onClick(event);
        }

        function _getUrl(){
            return Location.href;
        }
    });


    return app;
})(elliptical.module);
elliptical.module = (function (app) {
    var container = app.container;
    var EVENT_NAME='db.datapicker.change';

    elliptical.binding('stats-graph', function (node) {
        var $node=$(node);
        var Event=container.getType('Event');
        var handle=Event.on(EVENT_NAME,refresh);

        this.onDestroy=function(){
            Event.off(handle);
        };

        function refresh(){

            $node.dbBarchart('refresh','line');
        }
    });


    return app;
})(elliptical.module);
/// updates pagination labels on list/grid deletions

elliptical.module = (function (app) {
    var container=app.container;
    var EVT_CHANNEL='list.change';

    elliptical.binding('to-label', function (node) {
        var Event=container.getType('Event');
        var count={
            _value:null,
            get value(){
               if(this._value){
                   return this._value;
               }else{
                   this._value=parseInt($(node).text());
                   return this._value;
               }
            },

            set value(val){
                this._value=val;
            }
        };

        var listen=Event.on(EVT_CHANNEL,onChange);

        this.onDestroy=function(){
            Event.off(listen);
        };

        function onChange(data){
            var _count=count.value;
            _count=(data.removed) ? _count - data.removed : _count + data.added;
            $(node).text(_count);
            count.value=_count;
        }

    });


    return app;
})(elliptical.module);
/// clears the document of tooltips on tooltip clicks, otherwise hovered tooltips will persist on screen when clicked because the
/// the SPA will clear the element when loading a new view but the tooltip is bound to Document, not to the content placeholder element

elliptical.module = (function (app) {
    elliptical.binding('tooltip',function(node){
        this.event($(node),this.click,function(event){
            $(document).tooltip('clear');
        });
    });

    return app;
})(elliptical.module);
/// user detail view binding

elliptical.module = (function (app) {

    var container=app.container;

     elliptical.binding('user-detail',function(node){
         var User=container.getType('User');
         var ConfirmDialog=container.getType('ConfirmDialog');
         var Notify=container.getType('Notify');

         var $node=$(node);
         var deleteItem=$node.find('[action="delete"]');
         var passwordItem=$node.find('[action="password"]');
         var blockItem=$node.find('[action="block"]');
         var activeItem=$('[active]');
         var blockedItem=$('[blocked]');

         this.event($node,this.click,'[action="delete"]:not(.disabled)',onDelete);
         this.event($node,this.click,'[action="password"]:not(.disabled)',onResetPassword);
         this.event($node,this.click,'[action="block"]:not(.disabled)',onBlock);


         function onDelete(event){
             var dialog=new ConfirmDialog();
             dialog.setContent('Confirm Delete','Are you sure you wish to delete this user?');
             dialog.show(function(confirmed){
                 if(confirmed){
                     _handleDelete();
                 }
             });
         }

         function onResetPassword(event){
             var dialog=new ConfirmDialog();
             dialog.setContent("Confirm Reset Password","Are you sure you wish to reset this user's password?");
             dialog.show(function(confirmed){
                 if(confirmed){
                     _handleResetPassword();
                 }
             });
         }

         function onBlock(event){
             var message=_getBlockMessage();
             var dialog=new ConfirmDialog();
             dialog.setContent(message.title,message.text);
             dialog.show(function(confirmed){
                 if(confirmed){
                     _handleBlockUser();
                 }
             });
         }


         function _handleDelete(){
             var id=deleteItem[0].dataset.id;
             var notify= new Notify();
             User.delete({id:id},function(err,data){
                 var message=(err) ? "Error: Error deleting user" : "User has been deleted";
                 notify.show(message);
             });
         }

         function _handleResetPassword(){
             var id=passwordItem[0].dataset.id;
             var notify= new Notify();
             User.resetPassword({id:id},function(err,data){
                 var message=(err) ? "Error: Error resetting user's password " : "User's password has been reset";
                 notify.show(message);
             });
         }

         function _handleBlockUser(){
             var status=_getBlockStatus();
             var notify= new Notify();
             _getUser(function(err,user){
                 if(!err){
                     User.put(user,function(err,data){
                         var message=(err) ? status.error : status.success;
                         notify.show(message);
                         _updateDOM(user.active);
                     });
                 }else{
                     notify.show('Error retieving user');
                 }
             });
         }


         function _getUserStatus(){
             return blockItem[0].dataset.active;
         }


         function _getBlockMessage(){
             var message={};
             var active=_getUserStatus();
             if(active==="true"){
                 message.title="Confirm Block User";
                 message.text="Are you sure you wish to block this user's account?";
             }else{
                 message.title="Confirm Unblock User";
                 message.text="Are you sure you wish to re-enable this user's account?";
             }
             return message;
         }

         function _getBlockStatus(){
             var message={};
             var active=_getUserStatus();
             if(active==="true"){
                 message.success="The user account has been blocked";
                 message.error="Error: Error blocking user";
             }else{
                 message.success="The user account has been re-enabled";
                 message.error="Error: Error unblocking user";
             }
             return message;
         }

         function _getUser(callback){
             var active=_getUserStatus();
             active=!(active==='true');
             var id=deleteItem[0].dataset.id;
             User.get({id:id},function(err,data){
                 data.active=active;
                 callback(err,data);
             });
         }

         function _updateDOM(active){
             if(active){
                 activeItem.removeClass('hide');
                 blockedItem.addClass('hide');
             }else{
                 activeItem.addClass('hide');
                 blockedItem.removeClass('hide');
             }

             blockItem[0].dataset.active=active;
         }

     });

    return app;
})(elliptical.module);
/// user-list view binding

elliptical.module = (function (app) {

    var EVT_CHANNEL='list.change';
    var container=app.container;

     elliptical.binding('user-list',function(node){
         var User=container.getType('User');
         var ConfirmDialog=container.getType('ConfirmDialog');
         var Notify=container.getType('Notify');
         var Event=container.getType('Event');
         var Location=container.getType('Location');

         var $node=$(node);
         var deleteItem=$node.find('[action="delete"]');
         var editItem=$node.find('[action="edit"]');

         this.event($(document),'md.checkbox.change',onCheckboxChange);
         this.event($node,this.click,'[action="delete"]:not(.disabled)',onDelete);
         this.event($node,this.click,'[action="edit"]:not(.disabled)',onEdit);

         function onCheckboxChange(event,data){
             if(data.checked){
                 _removeDisabledClass();
             }else{
                 if(!_multiChecked()){
                     _addDisabledClass();
                 }
             }
         }

         function onDelete(event){
             var dialog=new ConfirmDialog();
             dialog.setContent('Confirm Delete','Are you sure you wish to delete the selected user(s)?');
             dialog.show(function(confirmed){
                 if(confirmed){
                     _handleDelete();
                 }
             });
         }

         function onEdit(event){
             var checked=_getMultiChecked();
             var id=checked[0].dataset.id;
             var url='/User/Detail/' + id;
             Location.redirect(url);
         }

         function _removeDisabledClass(){
             deleteItem.removeClass('disabled');
             editItem.removeClass('disabled');
         }

         function _addDisabledClass(){
             deleteItem.addClass('disabled');
             editItem.addClass('disabled');
         }

         function _getMultiChecked(){
             return $node.find('md-checkbox[checked]');
         }

         function _multiChecked(){
             var checked=_getMultiChecked();
             return (checked.length > 1);
         }

         function _handleDelete(){
             var checked=_getMultiChecked();
             var notify= new Notify();
             if(checked.length<2){
                 var id=checked[0].dataset.id;
                 _deleteFromDOM(id);
                 User.delete({id:id},function(err,data){
                     (err) ? notify.show('Error: Error deleting user') : onDeletions('User has been deleted',1,notify);
                 });

             }else{
                 var ids=_getIds(checked);
                 _deleteIdsFromDOM(ids);
                 User.delete({ids:ids},function(err,data){
                     (err) ? notify.show('Error: Error deleting users') : onDeletions('Users have been deleted',ids.length,notify);
                 });
             }
         }

         function onDeletions(msg,count,notify){
             notify.show(msg);
             _addDisabledClass();
             Event.emit(EVT_CHANNEL,{removed:count});
         }

         function _deleteIdsFromDOM(ids){
             ids.forEach(function(id){
                _deleteFromDOM(id);
             });
         }

         function _deleteFromDOM(id){
             $node.find('li[data-id="' + id + '"]').remove();
         }

         function _getIds(checked){
             var ids=[];
             var length=checked.length;
             for(var i=0; i<length; i++){
                 ids.push(checked[i].dataset.id);
             }
             return ids;
         }

     });

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var Controller = new elliptical.Controller(app,'Help');
    Controller('/@action', {
        Index:function(req,res,next){
            var Try=req.service('Try');
            Try(next,function(){
                res.render(res.context);
            });
        }

    });


    return app;
})(elliptical.module);

elliptical.module=(function (app) {
    var Controller = new elliptical.Controller(app,'Home');
    Controller('/@action', {
        Index:function(req,res,next){
            var Try=req.service('Try');
            Try(next,function(){
                var Settings=req.service('Settings');
                var displayModel=Settings.getDisplayModel();
                res.context.displayModel=displayModel;
                res.render(res.context);
            });
        }
    });


    return app;

})(elliptical.module);

elliptical.module = (function (app) {

    var Controller = new elliptical.Controller(app, 'Order');
    Controller('/@action/:id', {
        List: function (req, res, next) {
            var Try=req.service('Try');
            var PAGE_SIZE=app.GRID_SIZE;
            var serviceLabel="orders";
            var Order=req.service('Order');
            var order=new Order();
            var page=req.params.id;
            Try(next,function(){
                var query=order.getFilter(req.query);
                if(query){
                    var decodedQuery=decodeURIComponent(req.query.$filter);
                    serviceLabel+=' match "' + order.getLabel(decodedQuery) + '"';
                }
                order
                    .paginate({
                        baseUrl:'/Order/List',
                        rawUrl:req.url,
                        page:page,
                        pageSize:PAGE_SIZE
                    })
                    .filter(query)
                    .orderBy(req.query.$orderBy)
                    .orderByDesc(req.query.$orderByDesc)
                    .get(function(err,result){
                        res.context.orders=result.data;
                        res.context.pagination=result.pagination;
                        res.context.count=result.pagination.count;
                        res.context.label=serviceLabel;
                        res.render(res.context);
                    });
            });

        },

        Detail:function(req,res,next){
            var Try=req.service('Try');
            var id=req.params.id;
            var User=req.service('Order');
            var Event=req.service('Event');
            Event.emit('route.search.morph',{});
            Try(next,function(){
                User.get({id:id},function(err,data){
                    res.context.order=data;
                    res.context.method='put';
                    res.context.statusOptions=[{option:'open'},{option:'closed'}];
                    res.render(res.context);
                });
            });
        }

    });

    return app;

})(elliptical.module);
elliptical.module = (function (app) {

    var Controller = new elliptical.Controller(app, 'Profile');

    Controller('/@action', {
        Index: function (req, res, next) {
            var Try = req.service('Try');
            Try(next, function () {
                var $Cookie=req.service('$Cookie');
                var profile=$Cookie.get('profile');
                var Profile=req.service('Profile');
                Profile.get({id:profile.id},function(err,data){
                    res.context.user=data;
                    res.context.method='put';
                    res.render(res.context);
                });
            });
        },

        Login: function (req, res, next) {
            var Try = req.service('Try');
            Try(next, function () {
                res.context.method='login';
                res.render(res.context);
            });
        },

        Logout: function (req, res, next) {
            var Try = req.service('Try');
            Try(next, function () {
                var $Cookie=req.service('$Cookie');
                var profile=$Cookie.get('profile');
                var Profile=req.service('Profile');
                Profile.logout({id:profile.id},function(err,data){
                    res.context.message=data;
                    res.render(res.context);
                });
            });
        },

        Password: function (req, res, next) {
            var Try = req.service('Try');
            Try(next, function () {
                var $Cookie=req.service('$Cookie');
                res.context.user=$Cookie.get('profile');
                res.context.method='password';
                res.render(res.context);
            });
        }

    });

    return app;

})(elliptical.module);

/*

 Controller is a factory that behave similar to asp.net controllers.
 The Controller constructor takes the app function and the controller name
 The Controller prototype takes a string route and an singleton(object literal) whose methods correspond to the controller's actions
 The string param is parsed by the Controller. The '@action' param corresponds to the action name, params prefaced by a colon : are route
 variables bound to the req.params object.

 /List/1  --> req.params.page=1

 Like asp/.net mvc, actions views should be named the same as the action and placed under a folder named the same as the controller, all placed
 under the "views" folder in the public root.

 root --> Views-->Orders-->list.html

 dust.js is the template engine.
 {#prop} --> forEach iterator over model property 'prop', acts as both an array and object iterator

 var Controller = new elliptical.Controller(app,'Orders');
 Controller('/@action/:page', {
    List:function(req,res,next){
       var Try=req.service('Try');
       Try(next,function(){
         res.render(res.context);  -->res.render==View, res.context==Model
       });
    }
 });



 */

elliptical.module = (function (app) {

    var Controller = new elliptical.Controller(app,'Settings');
    Controller('/@action', {
        Index:function(req,res,next){
            var Try=req.service('Try');
            Try(next,function(){
                var Settings=req.service('Settings');
                res.context.dashboard=Settings.getDashboard();
                res.render(res.context);
            });

        }

    });

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var PAGE_SIZE=app.PAGE_SIZE;

    var Controller = new elliptical.Controller(app, 'User');
    Controller('/@action/:id', {
        List: function (req, res, next) {
            var Try=req.service('Try');
            var serviceLabel="users";
            var User=req.service('User');
            var user=new User();
            var page=req.params.id;

            Try(next,function(){
                var query=user.getFilter(req.query);
                if(query){
                    var decoded=decodeURIComponent(req.query.$filter);
                    serviceLabel += ' match "' + decoded + '"';
                }
                user
                    .paginate({
                        baseUrl:'/User/List',
                        rawUrl:req.url,
                        page:page,
                        pageSize:PAGE_SIZE
                    })
                    .filter(query)
                    .get(function(err,result){
                        res.context.users=result.data;
                        res.context.pagination=result.pagination;
                        res.context.count=result.pagination.count;
                        res.context.label=serviceLabel;
                        res.render(res.context);
                    });
            });

        },

        Detail:function(req,res,next){
            var id=req.params.id;
            var User=req.service('User');
            var Event=req.service('Event');
            var Try=req.service('Try');
            Event.emit('route.search.morph',{});
            Try(next,function(){
                User.get({id:id},function(err,data){
                    res.context.user=data;
                    res.context.method='put';
                    res.context.activeHide=(data.active) ? '' : 'hide';
                    res.context.blockHide=(data.active) ? 'hide' : '';
                    res.render(res.context);
                });
            });
        },

        Create:function(req,res,next){
            var User=req.service('User');
            var Event=req.service('Event');
            var Try=req.service('Try');
            Event.emit('route.search.morph',{});
            Try(next,function(){
                res.context.user={};
                res.render(res.context);
            });
        }
    });

    return app;

})(elliptical.module);
elliptical.module = (function (app) {

    var Controller = new elliptical.Controller(app, 'UserOrder');
    Controller('/@action/:userid/:page', {
        List: function (req, res, next){
            var Try=req.service('Try');
            var PAGE_SIZE=app.GRID_SIZE;
            var userId=req.params.userid;
            var page=req.params.page;
            var User=req.service('User');
            var Order=req.service('Order');
            var order=new Order();
            Try(next,function(){
                var query=order.getFilter(req.params);
                var Async=req.service('Async');
                Async([
                    function(callback){
                        User.get({id:userId},function(err,data){callback(err,data)})
                    },
                    function(callback){
                        order.paginate({
                            baseUrl:'/UserOrder/List/' + userId,
                            rawUrl:req.url,
                            page:page,
                            pageSize:PAGE_SIZE
                        })
                            .filter(query)
                            .orderBy(req.query.$orderBy)
                            .orderByDesc(req.query.$orderByDesc)
                            .get({userId:userId},function(err,result){callback(err,result)})
                    }
                ],function(err,results){
                    res.context.user=results[0];
                    res.context.orders=results[1].data;
                    res.context.pagination=results[1].pagination;
                    res.context.count=results[1].pagination.count;
                    res.context.hide=(res.context.count > 0) ? '' : 'hide-important';
                    res.render(res.context);
                });
            });
        }
    });

    return app;

})(elliptical.module);
elliptical.module = (function (app) {
    var menuService=null;
    app.history(function(params,container){
        var route=params.route;
        if(!menuService){
            menuService=container.getType('MenuService');
        }
        menuService.show(route);

    });


    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var container = app.container;

    function ConfirmDialogProvider(){
        this.element=null;
        this.getElement=function(){
            if(this.element){
                return this.element;
            }else{
                return $('paper-confirm')[0];
            }
        };

        this.show=function(fn){
            var element=this.getElement();
            element.show(fn);
        };

        this.setContent=function(title,message){
            var element=this.getElement();
            element.setContent(title,message,false);
        };
    }

    container.registerType('$ConfirmDialogProvider', new ConfirmDialogProvider());

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var container = app.container;
    var EVENT_NAME='db.datapicker.change';
    var FORMATTER='MMMM D, YYYY';

    function $DatePicker(){
        this.type=null;
        this.value=null;
        this.dateValue=null;
        this.dateRange=null;

        this.set=function(type,val){
            var filter='';
            var url='/Order/List/1?$filter=';
            var Location=container.getType('Location');
            var Moment=container.getType('Moment');
            var now=Moment().format('l');
            var _now=Moment(now);
            var strNow=_now.format(FORMATTER);
            if(type==='today'){
                filter=this.setToday(now,_now,strNow);

            }else if(type==='year-to-date'){
                filter=this.setYearToDate(Moment,strNow);

            }else if(type==='month-to-date'){
                filter=this.setMonthToDate(Moment,strNow)

            }else if(type==='range'){
                filter=this.setRange(Moment,val);
            }
            url+=filter;
            var currentPath=Location.path;
            if(currentPath !=='/'){
                Location.redirect(url);
            }else{
                var Event=container.getType('Event');
                Event.emit(EVENT_NAME,this.dateValue);
            }
        };

        this.get=function(){
            return this.value;
        };

        this.getDate=function(){
            return this.dateValue;
        };

        this.getType=function(){
            return this.type;
        };

        this._getDateRange=function(obj){
            var Moment=container.getType('Moment');
            var now=Moment().format('l');
            var _now=Moment(now);
            var strNow=_now.format(FORMATTER);
            return obj.format(FORMATTER) + ' - ' + strNow;
        };

        this.setToday=function(now,_now,strNow){
            var filter='Date eq ' + now;
            this.value='today';
            this.type='today';
            this.dateValue=_now;
            this.dateRange=strNow;
            return filter;
        };

        this.setYearToDate=function(Moment,strNow){
            var currentYear=Moment().format('YYYY');
            var yearDate='1/1/' + currentYear;
            var filter='Date ge ' + yearDate;
            this.value='year to date';
            this.type='year-to-date';
            this.dateValue=Moment(yearDate);
            this.dateRange=this.dateValue.format(FORMATTER) + ' - ' + strNow;
            return filter;
        };

        this.setMonthToDate=function(Moment,strNow){
            var currentMonth=Moment().format('MM');
            var currentYear=Moment().format('YYYY');
            var monthDate=currentMonth + '/1/' + currentYear;
            var filter='Date ge ' + monthDate;
            this.value='month to date';
            this.type='month-to-date';
            this.dateValue=Moment(monthDate);
            this.dateRange=this.dateValue.format(FORMATTER) + ' - ' + strNow;
            return filter;
        };

        this.setRange=function(Moment,val){
            var filter='Date ge ' + val.start + ' le ' + val.end;
            this.value=val.start + ' - ' + val.end;
            this.type='range';
            this.dateValue={
                start:Moment(val.start),
                end:Moment(val.end)
            };
            this.dateRange=this.dateValue.start.format(FORMATTER) + ' - ' + this.dateValue.end.format(FORMATTER);
            return filter;
        };
    }

    container.registerType('$DatePickerProvider',new $DatePicker());

    return app;
})(elliptical.module);
elliptical.module = (function (app) {
    var container = app.container;

    function FabTransformProvider(){
        this.dialog=null;
        this.getDialog=function(element){
            if(this.dialog){
                return this.dialog;
            }else{
                return $('md-dialog');
            }
        };

        this.show=function(element){
            var dialog=this.getDialog(element);
            dialog.mdDialog('show');
        };

        this.hide=function(){};

        this.listen=function(element){
            $(window).on('md.dialog.hide',function(event){
                element.mdFabTransform('reset');
            });
        };


    }

    container.registerType('$FabTransformProvider', new FabTransformProvider());



    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var container = app.container;

    function MenuProvider(){
        this.element=null;
        this.show=function(url){
            var element=this.element;
            element.mdMenu('show',url);
        };
        this.setElement=function(element){
            this.element=element;
        }
    }

    container.registerType('$MenuProvider', new MenuProvider());

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var Provider = elliptical.Provider;
    var container = app.container;
    var GenericRepository=elliptical.GenericRepository;

    ///////////Statistics Graph
    //create a 14 months worth of mock traffic data
    var trafficStart = moment('05/01/2014');

    var now = moment();
    var trafficModel=[];
    for (var m = trafficStart; m.isBefore(now); m.add(1, 'days')) {
        var clone=m.format('YYYY-MM-DD');
        var c=moment(clone);

        var trafficObj={

           visits:faker.random.number({min:50,max:1000}),
           pageViews:faker.random.number({min:500,max:5000}),
           date:c,
           month: parseInt(c.format('MM')),
           monthM: c.format('MMM'),
           day:parseInt(c.format('D')),
           dayOfWeek: c.format('ddd'),
           dayOfWeekD: parseInt(c.format('d')),
           year: parseInt(c.format('YYYY'))

         };

        trafficModel.push(trafficObj);
    }

    var $statsRepo=new GenericRepository(trafficModel);
    container.registerType('$StatisticsGraphProvider',$statsRepo);

    /////////////Browser Usage
    var colors1=['#48b401','#f65700','#00b78a','#ffc107','#ff7e06','#8bc34a'];
    var $BrowserUsage=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data=[
                {label: "Chrome", value: 40},
                {label: "Safari", value: 25},
                {label: "IE", value: 15},
                {label: "Firefox", value: 10},
                {label: "Opera", value: 5},
                {label: "Other",value:5}
            ];
            model.colors=colors1;
            model.legend={
                label:'Percentage Browser Usage'
            };
            callback(null,model);
        }

    },{});

    container.registerType('$BrowserUsageProvider',$BrowserUsage);


    //////////Device Usage
    var colors2=['#00a3d8','#2fbbe8','#8bc34a','#ffc107'];
    var $DeviceUsage=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data=[
                {label: "Desktop", value: 60},
                {label: "Android", value: 25},
                {label: "iOS", value: 10},
                {label: "Other",value:5}
            ];
            model.colors=colors2;
            model.legend={
                label:'Percentage Device Usage'
            };
            callback(null,model);
        }

    },{});

    container.registerType('$DeviceUsageProvider',$DeviceUsage);


    //////// Trends Graph
    var $TrendsGraph=Provider.extend({

    },{});

    container.registerType('$TrendsGraphProvider',$TrendsGraph);




    //////// Trends Graph Orders
    var color='#a748ca';
    var $TrendsGraphOrders=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data='51';
            model.opts={
                barColor:color,
                scaleColor:false,
                trackColor:'#f9f9f9',
                lineCap:'square',
                lineWidth:5,
                size:140
            };
            callback(null,model);
        }

    },{});

    container.registerType('$TrendsGraphOrdersProvider',$TrendsGraphOrders);


    //////////// Trends Graph Sales
    var color2='#48b401';
    var $TrendsGraphSales=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data='63';
            model.opts={
                barColor:color2,
                scaleColor:false,
                trackColor:'#f9f9f9',
                lineCap:'square',
                lineWidth:5,
                size:140
            };
            callback(null,model);
        }

    },{});

    container.registerType('$TrendsGraphSalesProvider',$TrendsGraphSales);


    ////////// Trends Graph Traffic
    var color3='#00b78a';
    var $TrendsGraphTraffic=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data='71';
            model.opts={
                barColor:color3,
                scaleColor:false,
                trackColor:'#f9f9f9',
                lineCap:'square',
                lineWidth:5,
                size:140
            };
            callback(null,model);
        }

    },{});

    container.registerType('$TrendsGraphTrafficProvider',$TrendsGraphTraffic);


    ///// Trends Graph Users
    var $TrendsGraphUsers=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data='43';
            model.opts={
                barColor:color,
                scaleColor:false,
                trackColor:'#f9f9f9',
                lineCap:'square',
                lineWidth:5,
                size:140
            };
            callback(null,model);
        }

    },{});

    container.registerType('$TrendsGraphUsersProvider',$TrendsGraphUsers);


    //////// Social Graph
    var $SocialGraphProvider=Provider.extend({
        get:function(params,resource,query,callback){
            var model=[];
            var obj={
                name:'Bob Jackson',
                time:'15 minutes ago',
                content:'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim...'
            };
            model.push(obj);
            var obj2={
                name:'Linda Davis',
                time:'About an hour ago',
                content:'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim...'
            };
            model.push(obj2);

            var obj3={
                name:'Carlos Casteneda',
                time:'About a decade ago',
                content:'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim...'
            };
            model.push(obj3);

            callback(null,model);
        },

        onAfterGet:function(element,scope){
            var carousel=element.find('ui-carousel');
            carousel.carousel('runInit');
        }

    },{});

    container.registerType('$SocialGraphProvider',$SocialGraphProvider);



    //////// RealtimeGraph
    var $RealTimeGraph=Provider.extend({

    },{});

    container.registerType('$RealTimeGraphProvider',$RealTimeGraph);


    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var GenericRepository=elliptical.GenericRepository;
    var container = app.container;

    //------------ mock orders generation---------------
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function orderStatus(index){
        return (index < 4) ? 'open' : 'closed';
    }

    function generateModel(MAX,userId){
        var _model=[];
        for(var i=0;i<MAX;i++){
            if(userId===undefined){
                userId=faker.random.uuid();
            }
            var order={
                id:faker.random.number({min:100,max:50000}),
                userId:userId,
                userAvatar:faker.image.avatar(),
                billingAddress:{
                    firstName:faker.name.firstName(),
                    lastName:faker.name.lastName(),
                    email:faker.internet.email(),
                    street:faker.address.streetAddress(),
                    city:faker.address.city(),
                    state:faker.address.stateAbbr(),
                    zipCode:faker.address.zipCode(),
                    phone:faker.phone.phoneNumber()
                }
            };
            var shippingAddress={
                firstName:order.billingAddress.firstName,
                lastName:order.billingAddress.lastName,
                email:order.billingAddress.email,
                street:order.billingAddress.street,
                city:order.billingAddress.city,
                state:order.billingAddress.state,
                zipCode:order.billingAddress.zipCode,
                phone:order.billingAddress.phone
            };
            order.shippingAddress=shippingAddress;
            var transaction=faker.helpers.createTransaction();
            order.subtotal=transaction.amount;
            order.salesTax=0;
            order.total=order.subtotal;
            order.date=faker.date.recent(365).toLocaleDateString();
            order.quantity=getRandomInt(1,8);
            order.status=orderStatus(i);
            order.shipTotal=0;
            order.discount=0;
            order.payment={
                paymentType:'Credit Card',
                expirationDate:faker.date.recent(365).toLocaleDateString(),
                cardNumber:'xxxx-xxxx-xxxx-1234'
            };
            order.shipping={
                shippingType:'UPS',
                shippingMethod:'Ground Shipping',
                dateShipped:faker.date.recent(365).toLocaleDateString()
            };


            _model.push(order);
        }

        return _model;
    }


    //callback that handles creating mock order detail items
    function callback(result,method,params,fn){
        if((method==='get') && params && params.id){
            if(!result){
                result=model[0];
            }
            result.details=[
                {
                    item:'Item One',
                    description:'Item One Description',
                    price:29.99,
                    quantity:1,
                    total:29.99
                },
                {
                    item:'Item Two',
                    description:'Item Two Description',
                    price:19.99,
                    quantity:1,
                    total:19.99
                },
                {
                    item:'Item Three',
                    description:'Item Three Description',
                    price:41.25,
                    quantity:2,
                    total:82.50
                },
                {
                    item:'Item Four',
                    description:'Item Four Description',
                    price:9.99,
                    quantity:3,
                    total:29.97
                }
            ]
        }else if(method==='get' && params && params.userId){
            result={data:generateModel(7,params.userId),count:7};
        }

        if(fn && typeof fn==='function'){
            fn(null,result);
        }

    }
    //--------------end-------------------------------------------

    //generate mock model
    var model=generateModel(200);


    //create the mock repository
    var repo=new GenericRepository(model,callback);


    container.registerType('$OrderRepository', repo);

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var GenericRepository=elliptical.GenericRepository;
    var container = app.container;

    //------------ users model population---------------
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateModel(MAX){
        var _model=[];
        for(var i=0;i<MAX;i++){
            var orderNumber= ((i % 4)===0) ? getRandomInt(1,10) : 0;

            var user={
                id:faker.random.uuid(),
                avatar:faker.image.avatar(),
                firstName:faker.name.firstName(),
                lastName:faker.name.lastName(),
                email:faker.internet.email(),
                street:faker.address.streetAddress(),
                city:faker.address.city(),
                state:faker.address.stateAbbr(),
                zipCode:faker.address.zipCode(),
                phone:faker.phone.phoneNumber(),
                dateRegistered:faker.date.recent(365).toLocaleDateString(),
                orderNumber:orderNumber,
                active:true
            };
            _model.push(user);
        }

        return _model;
    }


    //--------------end-------------------------------------------

    var model=generateModel(500);
    var repo=new GenericRepository(model,['firstName','lastName','city']);

    //overload the repo
    repo.resetPassword=function(params,callback){
        callback(null,params);
    };

    repo.getFilter=function(params){
        if(params.$filter && params.$filter !==undefined){
            var startsWith=this.startsWithPredicate();
            return {
                val:params.$filter,
                fn:startsWith
            };
        }else{
            return null;
        }
    };

    container.registerType('$UserRepository', repo);

    return app;
})(elliptical.module);
elliptical.module = (function (app) {
    var GenericRepository=elliptical.GenericRepository;
    var container = app.container;

    function createProfile(){
        var obj={
            id:1,
            email:'demo@misonline.biz',
            password:'demo',
            firstName:'Bob',
            lastName:'Jackson'
        };
        var model=[];
        model.push(obj);
        return model;
    }


    var repo=new GenericRepository(createProfile());

    repo.loginPredicate=function(){
        return function(obj,val){
            return (obj.email===val.email && obj.password===val.password);
        }
    };

    repo.login=function(username,password){

    };

    container.registerType('$ProfileProvider', repo);

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var container = app.container;

    function SearchMorphProvider(){
        this.toggleStatus=false;
        this.showElement=null;
        this.toggleElement=null;
        this.Event=null;

        this.listen=function(showElement,toggleElement){
            this.showElement=showElement;
            this.toggleElement=toggleElement;
            this.Event=container.getType('Event');
            this._onListen();
        };

        this._onListen=function(){
            this.Event.on('OnRouteDispatch',this._onDispatchHandler.bind(this));
            this.Event.on('route.search.morph',this._onListenHandler.bind(this));
            //var toggleElement=this.toggleElement;
            //toggleElement.on('touchclick',this._toggleElementOut.bind(this));
        };

        this._onListenHandler=function(){
            this.toggleStatus=true;
            this._animateShowElementOut();
        };

        this._onDispatchHandler=function(){
            if(this.toggleStatus){
                this.toggleStatus=false;
                this._animateToggleElementOut();
            }
        };

        this._animateShowElementOut=function(){
            var self=this;
            var showElement=this.showElement;
            var show=showElement[0];
            move(show)
                .set('opacity', 0)
                .duration('.3s')
                .ease('snap')
                .end(function () {
                    self._animateToggleElementIn();
                });
        };

        this._animateToggleElementIn=function(){
            var toggleElement=this.toggleElement;
            var toggle=toggleElement[0];
            toggleElement.addClass('opacity-0')
                .addClass('inline-important');
            move(toggle)
                .set('opacity',1)
                .duration('.3s')
                .ease('snap')
                .end(function(){
                    toggleElement.removeClass('opacity-0');
                });
        };



        this._animateShowElementIn=function(){
            var self=this;
            var showElement=this.showElement;
            var show=showElement[0];
            move(show)
                .set('opacity', 1)
                .duration('.3s')
                .ease('snap')
                .end(function () {
                    self._clearStyles();
                });
        };


        this._animateToggleElementOut=function(){
            var self=this;
            var toggleElement=this.toggleElement;
            var toggle=toggleElement[0];
            move(toggle)
                .set('opacity', 0)
                .duration('.3s')
                .ease('snap')
                .end(function () {
                    toggleElement.removeClass('inline');
                    self._animateShowElementIn();
                });
        };

        this._clearStyles=function(){
            var showElement=this.showElement;
            var toggleElement=this.toggleElement;
            showElement.attr('style','');
            toggleElement.attr('style','');
            toggleElement.removeClass('inline-important');
        };

    }

    container.registerType('$SearchMorphProvider', new SearchMorphProvider());

    return app;
})(elliptical.module);
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
elliptical.module = (function (app) {

    var Provider = elliptical.Provider;
    var $Local=elliptical.providers.$Local;
    var container = app.container;


    function _get(model,key){
        return _.find(model,function(obj){
            return obj.key===key;
        })
    }

    function _replace(model,key,newObj){
        var old=_get(model,key);
        for(var k in old){
            if(old.hasOwnProperty(k)){
                if(newObj[k] !==undefined){
                    old[k]=newObj[k];
                }
            }
        }
    }

    function _Settings(){

        this.init=function(){
            var model={
                range:'month-to-date',
                type:'month-to-date',
                dateValue:null,
                dateRange:null,
                now:null,
                dashboard:[]
            };

            model.dashboard.push(this.createComponent('StatisticsGraph','Statistics Graph',true));
            model.dashboard.push(this.createComponent('TrendsGraph','Trends Graph',true));
            model.dashboard.push(this.createComponent('RealTimeGraph','Real Time Graph',true));
            model.dashboard.push(this.createComponent('SocialGraph','Social Graph',true));
            model.dashboard.push(this.createComponent('BrowserUsage','Browser Usage',true));
            model.dashboard.push(this.createComponent('DeviceUsage','Device Usage',true));

            return model;
        };

        this.createComponent=function(key,name,active){
            return{
                key:key,
                name:name,
                active:active
            }
        }
    }


    var $Settings = Provider.extend({
        key:'Settings',
        create:function(){
            var settings=new _Settings();
            var obj=settings.init();
            $Local.set(this.key,obj);
            return obj;
        },

        get: function (key) {
            var settings=$Local.get(this.key);
            if(!settings && settings !==undefined){
                settings=this.create();
            }
            if(key){
                return settings[key];
            }else{
                return settings;
            }
        },

        set:function(key,value){
            var settings=this.get();
            settings[key]=value;
            $Local.set(this.key,settings);
        },

        getDashboard:function(key){
            var settings=this.get();
            if(key===undefined){
                return settings.dashboard;
            }else{
                return _.find(settings.dashboard,function(obj){
                    return obj.key===key;
                });
            }
        },

        setDashboard:function(key,value){
            var settings=this.get();
            var dashboard=settings.dashboard;
            _replace(dashboard,key,value);
            $Local.set(this.key,settings);
        },

        getDisplayModel:function(){
            var settings=this.get();
            var dashboard=settings.dashboard;
            var display={};
            for(var i=0;i<dashboard.length;i++){
                display[dashboard[i].key]= (dashboard[i].active) ? {} : '';
            }

            return display;
        }

    }, {});

    container.registerType('$Settings', $Settings);

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var container = app.container;

    function ToastProvider(){
        this.element=null;
        this.getElement=function(){
            if(this.element){
                return this.element;
            }else{
                return $('paper-toast')[0];
            }
        };

        this.show=function(text,duration){
            var element=this.getElement();
            if(duration===undefined){
                duration=3000;
            }
            element.text=text;
            if(!element.visible){
                element.duration=duration;
                element.show();
            }
        };

        this.hide=function(){
            var element=this.getElement();
            element.hide();
        };

        this.visible=function(){
            var element=this.getElement();
            return element.visible;
        }
    }

    container.registerType('$NotifyProvider', new ToastProvider());

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var container = app.container;

    container.registerType('Async', window.async.series);

    return app;
})(elliptical.module);
elliptical.module = (function (app) {
    var container = app.container;
    var Dialog=elliptical.Dialog;
    var ConfirmDialog=Dialog.extend({
        '@resource':'ConfirmDialog',
        setContent:function(title,message){return this.$provider.setContent(title,message)}
    },{
        setContent:function(title,message){ return this.constructor.setContent(title,message)}
    });


    container.mapType(ConfirmDialog,'$ConfirmDialogProvider');

    return app;
})(elliptical.module);
elliptical.module = (function (app) {
    var container=app.container;
    var DashboardService=elliptical.DashboardService;

    //// Statistics Graph Service
    var StatisticsGraph=DashboardService.extend({
        "@resource":'StatisticsGraph',
        get:function(params,callback){
            var self=this;
            var datePicker=container.getType('DatePicker');
            var dateValue=datePicker.getDate();
            var type=datePicker.getType();
            var query={};
            query.filter={
                val:dateValue,
                fn:this.$provider.dateRangePredicate(dateValue)
            };
            var viewModel=this._initViewModel();
            this.$provider.get({},query,function(err,data){

                //need to format the data to the chart view model
                switch(type){
                    case 'today':
                        viewModel.data.labels.push('today');
                        viewModel.data.series.push([data[0].visits]);
                        viewModel.data.series.push([data[0].pageViews]);

                        callback(null,viewModel);

                        break;

                    case 'month-to-date':
                        var monthToDate=self._monthToDateData(data);
                        viewModel.data.labels=monthToDate.labels;
                        viewModel.data.series.push(monthToDate.visitSeries);
                        viewModel.data.series.push(monthToDate.pageSeries);

                        callback(null,viewModel);

                        break;

                    case 'year-to-date':
                        var yearToDate=self._yearToDateData(data);
                        viewModel.data.labels=yearToDate.labels;
                        viewModel.data.series.push(yearToDate.visitSeries);
                        viewModel.data.series.push(yearToDate.pageSeries);

                        callback(null,viewModel);
                        break;

                    case 'range':
                        var rangeDates=self._rangeData(data);
                        viewModel.data.labels=rangeDates.labels;
                        viewModel.data.series.push(rangeDates.visitSeries);
                        viewModel.data.series.push(rangeDates.pageSeries);

                        callback(null,viewModel);
                        break;
                }
            });
        },

        _initViewModel:function(){
            var viewModel={
                legend:[{
                    label:'Unique Visits',
                    color:'color-1'
                },{
                    label:'Page Views',
                    color:'color-2'
                }],
                data:{
                    labels:[],
                    series:[]
                }
            };

            return viewModel;
        },

        _monthToDateData:function(data){
            //12 x-coordinates MAX
            var labels=[];
            var pageSeries=[];
            var visitSeries=[];
            var day=parseInt(moment().format('D'));

            if(day > 12){
                incrementDataModels('days 1-7',0,7,data,labels,pageSeries,visitSeries);
                if(day < 14){
                    incrementDataModels('days 8-' + day.toString(),8,day,data,labels,pageSeries,visitSeries);
                }else if(day < 21){
                    incrementDataModels('days 8-14',8,14,data,labels,pageSeries,visitSeries);
                    incrementDataModels('days 14-' + day,14,day,data,labels,pageSeries,visitSeries);
                }else{
                    incrementDataModels('days 8-14',8,14,data,labels,pageSeries,visitSeries);
                    incrementDataModels('days 14-21',14,21,data,labels,pageSeries,visitSeries);
                    incrementDataModels('days 21-' + day,21,day,data,labels,pageSeries,visitSeries);
                }
            }else{
                for(var i=0;i<day;i++){
                    var theDay=i+1;
                    labels.push(theDay.toString());
                    pageSeries.push(data[i].pageViews);
                    visitSeries.push(data[i].visits);
                }
            }

            return{
                labels:labels,
                pageSeries:pageSeries,
                visitSeries:visitSeries
            };

            function calculateSum(arr,prop,start,end){
                var sum=0;
                for(var k=start;k<end;k++){
                    sum+=arr[k][prop];
                }
                return sum;
            }
            function incrementDataModels(label,start,end,data,labelsArray,pageSeries,visitSeries){
                labelsArray.push(label);
                var pageSeriesSum=calculateSum(data,'pageViews',start,end);
                pageSeries.push(pageSeriesSum);
                var visitSeriesSum=calculateSum(data,'visits',start,end);
                visitSeries.push(visitSeriesSum);
            }
        },

        _yearToDateData:function(data){

            var currentMonth=parseInt(moment().format('M'));
            var labels=getLabels(currentMonth);
            var series=getDataSeries(data,currentMonth);
            return{
                labels:labels,
                pageSeries:series.page,
                visitSeries:series.visit
            };

            function getLabels(currentMonth){
                var labels=[];
                for(var i=0;i<currentMonth;i++){
                    var strMonth=(i+1).toString();
                    var strDate=strMonth + '/1/2015';
                    var dte=moment(strDate);
                    var mon=dte.format('MMM');
                    labels.push(mon);
                }

                return labels;
            }

            function getDataSeries(data){
                var _pageSeries=[];
                var _visitSeries=[];
                var length=data.length;
                var curMonth=1;
                var pageSum=0;
                var visitSum=0;
                for(var i=0;i<length;i++){
                    var month=data[i].month;
                    if(month===curMonth){
                        pageSum+=data[i].pageViews;
                        visitSum+=data[i].visits;
                    }else{
                        _pageSeries.push(pageSum);
                        _visitSeries.push(visitSum);
                        pageSum=0;
                        visitSum=0;
                        curMonth++;
                    }
                }
                return{
                    page:_pageSeries,
                    visit:_visitSeries
                }
            }
        },

        _rangeData:function(data){
            var labels=getLabels(data);
            var series=getDataSeries(data);
            return{
                labels:labels,
                pageSeries:series.page,
                visitSeries:series.visit
            };

            function getLabels(data){
                var length=data.length;
                var labels=[];
                var curMonth=null;
                var month_;
                for(var i=0;i<length;i++){
                    var month=data[i].month;
                    var date=data[i].date;
                    if(curMonth){
                        if(month!==curMonth){
                            month_=moment(date).format('MMM');
                            labels.push(month_);
                            curMonth=month;
                        }

                    }else{
                        curMonth=month;
                        month_=moment(date).format('MMM');
                        labels.push(month_);
                    }
                }

                return labels;
            }

            function getDataSeries(data){
                var _pageSeries=[];
                var _visitSeries=[];
                var length=data.length;
                var curMonth=null;
                var pageSum=0;
                var visitSum=0;
                for(var i=0;i<length;i++){
                    var month=data[i].month;
                    if(!curMonth){
                        curMonth=month;
                        pageSum+=data[i].pageViews;
                        visitSum+=data[i].visits;
                    }else{
                        if(month===curMonth){
                            pageSum+=data[i].pageViews;
                            visitSum+=data[i].visits;
                        }else{
                            _pageSeries.push(pageSum);
                            _visitSeries.push(visitSum);
                            pageSum=0;
                            visitSum=0;
                            curMonth++;
                        }
                    }
                }
                if(pageSum >0 && visitSum >0){
                    _pageSeries.push(pageSum);
                    _visitSeries.push(visitSum);
                }
                return{
                    page:_pageSeries,
                    visit:_visitSeries
                }
            }
        },


        //icon cards
        sum:function(dateValue,callback){
            var query={};
            query.filter={
                val:dateValue,
                fn:this.$provider.dateRangePredicate(dateValue)
            };
            this.$provider.get({},query,function(err,data){
                var sum=0;
                var length=data.length;
                for(var i=0;i<length;i++){
                    sum+=data[i].visits;
                }
                return callback(null,sum);
            });
        }

    },{
        sum:function(dateValue,callback){this.constructor.sum(dateValue,callback)}
    });





    var BrowserUsage=DashboardService.extend({
        "@resource":'BrowserUsage'
    },{});

    var DeviceUsage=DashboardService.extend({
        "@resource":'DeviceUsage'
    },{});

    var TrendsGraph=DashboardService.extend({
        "@resource":'TrendsGraph'
    },{});


    var TrendsGraphSales=DashboardService.extend({
        "@resource":'TrendsGraphSales'
    },{});

    var TrendsGraphTraffic=DashboardService.extend({
        "@resource":'TrendsGraphTraffic'
    },{});

    var TrendsGraphUsers=DashboardService.extend({
        "@resource":'TrendsGraphUsers'
    },{});

    var TrendsGraphOrders=DashboardService.extend({
        "@resource":'TrendsGraphOrders'
    },{});



    var SocialGraph=DashboardService.extend({},{});

    var RealTimeGraph=DashboardService.extend({},{});



    container.mapType(BrowserUsage, '$BrowserUsageProvider');
    container.mapType(DeviceUsage, '$DeviceUsageProvider');
    container.mapType(TrendsGraph, '$TrendsGraphProvider');
    container.mapType(TrendsGraphSales, '$TrendsGraphSalesProvider');
    container.mapType(TrendsGraphTraffic, '$TrendsGraphTrafficProvider');
    container.mapType(TrendsGraphUsers, '$TrendsGraphUsersProvider');
    container.mapType(TrendsGraphOrders, '$TrendsGraphOrdersProvider');
    container.mapType(StatisticsGraph, '$StatisticsGraphProvider');
    container.mapType('SocialGraph',SocialGraph,'$SocialGraphProvider');
    container.mapType('RealTimeGraph',RealTimeGraph,'$RealTimeGraphProvider');

    return app;
})(elliptical.module);
///DatePicker Service:
/// Sets Dates and Date Ranges from Selections made by the FAB Dashboard Datepicker
/// Also returns the current selections, get-->returns a text label for the selected range. getDate-->returns a valid JS date/date range
/// If get returns nothing, the service will set a default 'month-to-date' date range
/// the service will also update Settings values from an injected $Settings provider. This is to allow persistence across sessions
/// Finally, the service will set the Url filter string and notify any listeners of updated values
elliptical.module = (function (app) {

    var container = app.container;
    var FORMATTER='MMMM D, YYYY';

    function DatePicker(){
        this.$provider=this.constructor.$provider;
        this.set=function(type,val){
            this.$provider.set(type,val);
            var Settings=container.getType('$Settings');
            var value=this.$provider.value;
            var dateValue=this.$provider.dateValue;
            var dateRange=this.$provider.dateRange;
            var _type=this.$provider.type;
            var Moment=container.getType('Moment');
            var now=Moment();
            Settings.set('range',value);
            Settings.set('dateValue',dateValue);
            Settings.set('dateRange',dateRange);
            Settings.set('now',now);
            Settings.set('type',_type);
        };
        this.get=function(){
            return this.$provider.get();
        };
        this.getDate=function(){
            ///return dateValue
            var Moment=container.getType('Moment');
            var value=this.$provider.getDate();
            var Settings=container.getType('$Settings');
            var type=Settings.get('type');

            ///if range and value, return value (range is not dependent on a 'to-date' to today calculation)
            if(value && type==='range'){
                return value;
            }else if(type==='range'){
                var _dateValue=Settings.get('dateValue');
                if(_dateValue){
                    var start_=Moment(_dateValue.start);
                    var end_=Moment(_dateValue.end);
                    return {start:start_,end:end_};
                }
            }

            var invalidNow=true;
            var now=Moment().format('l');
            var _now=Moment(now);
            var strNow=_now.format(FORMATTER);
            var settingsNow=Settings.get('now');
            if(settingsNow){
                settingsNow=Moment(settingsNow);
                invalidNow=(_now===settingsNow);
            }

            ///if settings now is a valid now and value exists, return value
            if(value && !invalidNow){
                return value;
            }

            //if no type in settings, defaults to 'month-to-date'
            if(!type){
                type='month-to-date';
            }
            ///else, we need to update the settings now
            ///e.g., avoid Datepicker set for 'today', login a week later and getting 'today' as last week's value
            switch(type){
                case 'today':{
                    this.$provider.setToday(now,_now,strNow);
                    return this.$provider.dateValue;
                }
                case 'month-to-date':{
                    this.$provider.setMonthToDate(Moment,strNow);
                    return this.$provider.dateValue;
                }
                case 'year-to-date':{
                    this.$provider.setYearToDate(Moment,strNow);
                    return this.$provider.dateValue;
                }

            }

            return null;
        };

        this.getType=function(){
            var type=this.$provider.type;
            if(!type){
                var Settings=container.getType('$Settings');
                type=Settings.get('type');
                if(!type){
                    return 'month-to-date';
                }else{
                    return type;
                }
            }else{
                return type;
            }
        };

        this.getDateRange=function(){
            var range=this.$provider.dateRange;
            if(range){
                return range;
            }else{
                var Settings=container.getType('$Settings');
                range=Settings.get('dateRange');
                if(range){
                    this.$provider.dateRange=range;
                }
                return range;
            }
        };


    }


    container.mapType('DatePicker',new DatePicker(), '$DatePickerProvider');

    return app;
})(elliptical.module);
elliptical.module=(function (app) {

    var Dialog = elliptical.Dialog;
    var container=app.container;

    var FabTransform=Dialog.extend({
        '@resource':'FabTransform',
        listen:function(element){return this.$provider.listen(element)}
    },{
        listen:function(element){return this.constructor.listen(element)}
    });


    container.mapType(FabTransform,'$FabTransformProvider');

    return app;

})(elliptical.module);

elliptical.module = (function (app) {
    var container=app.container;
    function MenuService(){
        this.element=null;
        this.$provider=null;
        this.show=function(params){this.$provider.show(params)};
        this.setElement=function(element){this.$provider.setElement(element)};
    }
    container.mapType('MenuService', new MenuService(),'$MenuProvider');

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var container = app.container;

    container.registerType('Moment', window.moment);

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var Notify=elliptical.Notify;
    var container = app.container;

    container.mapType(Notify, '$NotifyProvider');

    return app;
})(elliptical.module);
elliptical.module = (function (app) {
    var ReportService = elliptical.ReportService;
    var container=app.container;

    var Order = ReportService.extend({
        "@resource": 'Order',

        getFilter:function(params){
            if(params.$filter && params.$filter !==undefined){
                var filter=params.$filter;
                var isDate=(filter.indexOf('Date') > -1);
                if(isDate){
                    var datePicker=container.getType('DatePicker');
                    var dateValue=datePicker.getDate();

                    return {
                        val:dateValue,
                        fn:this.$provider.dateRangePredicate(dateValue)
                    };
                }else{
                    return {
                        val:params.$filter,
                        fn:this.$provider.startsWithPredicate()
                    };
                }

            }else if(params.userid){
                return{
                    val:params.userid,
                    fn:this.$provider.findPredicate('userid')
                }
            }else{
                return null;
            }
        },

        getLabel:function(filter){
            var isDate=(filter.indexOf('Date') > -1);
            if(isDate){
                var datePicker=container.getType('DatePicker');
                return datePicker.get(filter);
            }else{
                return filter;
            }
        },
        sum:function(dateValue,callback){return this.$provider.sum({dateValue:dateValue},callback)},
        sales:function(dateValue,callback){return this.$provider.sum({dateValue:dateValue,prop:'total',type:'float'},callback)}
    }, {

        getLabel:function(param){return this.constructor.getLabel(param)},
        sum:function(dateValue,callback){return this.constructor.sum({dateValue:dateValue},callback)},
        sales:function(dateValue,callback){return this.constructor.sales({dateValue:dateValue},callback)}
    });

    container.mapType(Order,'$OrderRepository');

    return app;
})(elliptical.module);
elliptical.module = (function (app) {
    var Service = elliptical.Service;

    var container = app.container;

    var Profile = Service.extend({
        "@resource": 'Profile',
        login: function (params,callback) {
            var query={};
            query.filter = {
                val: { email: params.email, password: params.password},
                fn: this.$provider.loginPredicate()
            };
            this.$provider.get({},query,function(err,data){
                if(data && data[0]){
                    //success
                    var profile=data[0];
                    var Location=container.getType('Location');
                    var $Cookie=container.getType('$Cookie');
                    $Cookie.set('profile',profile);
                    var Event=container.getType('Event');
                    Event.emit('app.login',profile);
                    Location.redirect('/');
                }else{
                    //failure
                    var notify=container.getType('Notify');
                    notify.show('invalid login');
                }
            });
        },

        password:function(params,callback){
            var self=this;
            this.$provider.get({id:params.id},function(err,data){
                data.password=params.password;
                self.$provider.put(data);
                var notify=container.getType('Notify');
                notify.show('password has been updated');
            });
        },

        logout:function(params,callback){
            var $Cookie=container.getType('$Cookie');
            $Cookie.delete('profile');
            var Event=container.getType('Event');
            Event.emit('app.logout',null);
            callback(null,'You have been successfully logged out of your account...');
        },

        authenticated:function(){
            var $Cookie=container.getType('$Cookie');
            var profile=$Cookie.get('profile');
            return (profile !==undefined && profile) ? profile : null;
        }

    }, {});


    container.mapType(Profile, '$ProfileProvider');

    return app;
})(elliptical.module);
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
elliptical.module = (function (app) {
    var Store = elliptical.Store;
    var providers = elliptical.providers;
    var container = app.container;

    var Session=Store.extend({
        "@resource":"Session"
    },{});

    var $Session=providers.$Session;
    container.registerType(Session,$Session);

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var Store=elliptical.Store;
    var container = app.container;

    var Settings=Store.extend({
        "@resource":"Settings",
        getDashboard:function(key){return this.$provider.getDashboard(key)},
        setDashboard:function(key,value){this.$provider.setDashboard(key,value)},
        getDisplayModel:function(){return this.$provider.getDisplayModel()}
    },{
        getDashboard:function(key){return this.constructor.getDashboard(key)},
        setDashboard:function(key,value){this.constructor.setDashboard(key,value)},
        getDisplayModel:function(){return this.constructor.getDisplayModel()}
    });


    container.mapType(Settings, '$Settings');

    return app;
})(elliptical.module);
elliptical.module = (function (app) {

    var container=app.container;
    container.registerType('Try', elliptical.Try);

    return app;
})(elliptical.module);

elliptical.module = (function (app) {
    var ReportService = elliptical.ReportService;
    var container=app.container;

    var User = ReportService.extend({
        "@resource": 'User',
        resetPassword:function(params,callback){return this.$provider.resetPassword(params,callback)},
        sum:function(dateValue,callback){return this.$provider.sum({dateValue:dateValue,dateProp:'dateRegistered'},callback)}

    }, {
        resetPassword:function(params,callback){return this.constructor.resetPassword(params,callback)},
        sum:function(dateValue,callback){return this.constructor.sum(dateValue,callback)}
    });


    container.mapType(User,'$UserRepository');


    return app;
})(elliptical.module);