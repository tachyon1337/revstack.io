/// user-list view binding

elliptical.module = (function (app) {

    var EVT_CHANNEL='list.change';
    var container=app.container;

     elliptical.binding('user-list',function(node){
         var User=container.getType('User');
         var ConfirmDialog=container.getType('ConfirmDialog');
         var Notify=container.getType('Notify');
         var Event=container.getType('Event');
         var Location=container.getType('Location');

         var $node=$(node);
         var deleteItem=$node.find('[action="delete"]');
         var editItem=$node.find('[action="edit"]');

         this.event($(document),'md.checkbox.change',onCheckboxChange);
         this.event($node,this.click,'[action="delete"]:not(.disabled)',onDelete);
         this.event($node,this.click,'[action="edit"]:not(.disabled)',onEdit);

         function onCheckboxChange(event,data){
             if(data.checked){
                 _removeDisabledClass();
             }else{
                 if(!_multiChecked()){
                     _addDisabledClass();
                 }
             }
         }

         function onDelete(event){
             var dialog=new ConfirmDialog();
             dialog.setContent('Confirm Delete','Are you sure you wish to delete the selected user(s)?');
             dialog.show(function(confirmed){
                 if(confirmed){
                     _handleDelete();
                 }
             });
         }

         function onEdit(event){
             var checked=_getMultiChecked();
             var id=checked[0].dataset.id;
             var url='/User/Detail/' + id;
             Location.redirect(url);
         }

         function _removeDisabledClass(){
             deleteItem.removeClass('disabled');
             editItem.removeClass('disabled');
         }

         function _addDisabledClass(){
             deleteItem.addClass('disabled');
             editItem.addClass('disabled');
         }

         function _getMultiChecked(){
             return $node.find('md-checkbox[checked]');
         }

         function _multiChecked(){
             var checked=_getMultiChecked();
             return (checked.length > 1);
         }

         function _handleDelete(){
             var checked=_getMultiChecked();
             var notify= new Notify();
             if(checked.length<2){
                 var id=checked[0].dataset.id;
                 _deleteFromDOM(id);
                 User.delete({id:id},function(err,data){
                     (err) ? notify.show('Error: Error deleting user') : onDeletions('User has been deleted',1,notify);
                 });

             }else{
                 var ids=_getIds(checked);
                 _deleteIdsFromDOM(ids);
                 User.delete({ids:ids},function(err,data){
                     (err) ? notify.show('Error: Error deleting users') : onDeletions('Users have been deleted',ids.length,notify);
                 });
             }
         }

         function onDeletions(msg,count,notify){
             notify.show(msg);
             _addDisabledClass();
             Event.emit(EVT_CHANNEL,{removed:count});
         }

         function _deleteIdsFromDOM(ids){
             ids.forEach(function(id){
                _deleteFromDOM(id);
             });
         }

         function _deleteFromDOM(id){
             $node.find('li[data-id="' + id + '"]').remove();
         }

         function _getIds(checked){
             var ids=[];
             var length=checked.length;
             for(var i=0; i<length; i++){
                 ids.push(checked[i].dataset.id);
             }
             return ids;
         }

     });

    return app;
})(elliptical.module);