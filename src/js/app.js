elliptical.module=(function (app) {

    app = elliptical(); //create the app

    var Service = elliptical.Service;
    var Location = elliptical.Router.Location;
    var Event=elliptical.Event;
    var $Cookie=elliptical.providers.$Cookie;
    var Sort = elliptical.Sort;
    var $Sort = elliptical.providers.$Sort;

    var container=app.container; //app Dependency Injection container

    //app title
    app.context.siteTitle='My Dashboard';//
    app.context.displayTitle='hide';///==='hide', to hide

    //disable dashboard widgets && floating action button(fab)
    app.context.disableDashboard=''; ///=='disabled', to disable
    app.context.fabHide=''; ///=='hide', to hide

    //views root
    var viewsRoot='/views';
    //var $Template = elliptical.providers.$Template; ///template provider
    //$Template.setRoot(viewsRoot);  ///set views root

    //registrations
    container.registerType('Location',Location);
    container.registerType('Event',Event);
    container.registerType('$Cookie',$Cookie);
    container.mapType(Sort, $Sort);

    //inject the app container to implement the web component service locator
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