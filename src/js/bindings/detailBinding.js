// generic detail view binding
/// node element with the ea binding in the view should have the following attributes set:
/// service,label


elliptical.module = (function (app) {
    var container = app.container;

    elliptical.binding('detail', function (node) {
        var $node=$(node);
        var serviceName=$node.attr('service');
        var label=$node.attr('label');
        var Service=container.getType(serviceName);
        var ConfirmDialog=container.getType('ConfirmDialog');
        var Notify=container.getType('Notify');

        var deleteItem=$node.find('[action="delete"]');
        this.event($node,this.click,'[action="delete"]:not(.disabled)',onDelete);

        function onDelete(event){
            var dialog=new ConfirmDialog();
            dialog.setContent('Confirm Delete','Are you sure you wish to delete this ' + label.toLowerCase() + '?');
            dialog.show(function(confirmed){
                if(confirmed){
                    _handleDelete();
                }
            });
        }

        function _handleDelete(){
            var id=deleteItem[0].dataset.id;
            var notify= new Notify();
            Service.delete({id:id},function(err,data){
                var message=(err) ? 'Error: Error deleting ' + label.toLowerCase() : label + ' has been deleted';
                notify.show(message);
                _addDisabledClass();
            });
        }

        function _addDisabledClass(){
            deleteItem.addClass('disabled');
        }

    });


    return app;
})(elliptical.module);