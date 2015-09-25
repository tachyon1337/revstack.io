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
            setTimeout(function(){
                datePicker.dbDatepicker('clear');
            },1000);


        }
    });

    return app;
})(elliptical.module);