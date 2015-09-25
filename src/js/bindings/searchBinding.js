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
                search.find({url:url,value:val});
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