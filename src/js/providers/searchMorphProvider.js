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