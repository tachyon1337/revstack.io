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
                name: p.name,
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