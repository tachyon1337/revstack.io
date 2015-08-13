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