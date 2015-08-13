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