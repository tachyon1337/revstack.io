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