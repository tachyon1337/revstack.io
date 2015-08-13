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