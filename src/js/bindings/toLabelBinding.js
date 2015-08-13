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