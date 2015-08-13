/// user detail view binding

elliptical.module = (function (app) {

    var container=app.container;

     elliptical.binding('user-detail',function(node){
         var User=container.getType('User');
         var ConfirmDialog=container.getType('ConfirmDialog');
         var Notify=container.getType('Notify');

         var $node=$(node);
         var deleteItem=$node.find('[action="delete"]');
         var passwordItem=$node.find('[action="password"]');
         var blockItem=$node.find('[action="block"]');
         var activeItem=$('[active]');
         var blockedItem=$('[blocked]');

         this.event($node,this.click,'[action="delete"]:not(.disabled)',onDelete);
         this.event($node,this.click,'[action="password"]:not(.disabled)',onResetPassword);
         this.event($node,this.click,'[action="block"]:not(.disabled)',onBlock);


         function onDelete(event){
             var dialog=new ConfirmDialog();
             dialog.setContent('Confirm Delete','Are you sure you wish to delete this user?');
             dialog.show(function(confirmed){
                 if(confirmed){
                     _handleDelete();
                 }
             });
         }

         function onResetPassword(event){
             var dialog=new ConfirmDialog();
             dialog.setContent("Confirm Reset Password","Are you sure you wish to reset this user's password?");
             dialog.show(function(confirmed){
                 if(confirmed){
                     _handleResetPassword();
                 }
             });
         }

         function onBlock(event){
             var message=_getBlockMessage();
             var dialog=new ConfirmDialog();
             dialog.setContent(message.title,message.text);
             dialog.show(function(confirmed){
                 if(confirmed){
                     _handleBlockUser();
                 }
             });
         }


         function _handleDelete(){
             var id=deleteItem[0].dataset.id;
             var notify= new Notify();
             User.delete({id:id},function(err,data){
                 var message=(err) ? "Error: Error deleting user" : "User has been deleted";
                 notify.show(message);
             });
         }

         function _handleResetPassword(){
             var id=passwordItem[0].dataset.id;
             var notify= new Notify();
             User.resetPassword({id:id},function(err,data){
                 var message=(err) ? "Error: Error resetting user's password " : "User's password has been reset";
                 notify.show(message);
             });
         }

         function _handleBlockUser(){
             var status=_getBlockStatus();
             var notify= new Notify();
             _getUser(function(err,user){
                 if(!err){
                     User.put(user,function(err,data){
                         var message=(err) ? status.error : status.success;
                         notify.show(message);
                         _updateDOM(user.active);
                     });
                 }else{
                     notify.show('Error retieving user');
                 }
             });
         }


         function _getUserStatus(){
             return blockItem[0].dataset.active;
         }


         function _getBlockMessage(){
             var message={};
             var active=_getUserStatus();
             if(active==="true"){
                 message.title="Confirm Block User";
                 message.text="Are you sure you wish to block this user's account?";
             }else{
                 message.title="Confirm Unblock User";
                 message.text="Are you sure you wish to re-enable this user's account?";
             }
             return message;
         }

         function _getBlockStatus(){
             var message={};
             var active=_getUserStatus();
             if(active==="true"){
                 message.success="The user account has been blocked";
                 message.error="Error: Error blocking user";
             }else{
                 message.success="The user account has been re-enabled";
                 message.error="Error: Error unblocking user";
             }
             return message;
         }

         function _getUser(callback){
             var active=_getUserStatus();
             active=!(active==='true');
             var id=deleteItem[0].dataset.id;
             User.get({id:id},function(err,data){
                 data.active=active;
                 callback(err,data);
             });
         }

         function _updateDOM(active){
             if(active){
                 activeItem.removeClass('hide');
                 blockedItem.addClass('hide');
             }else{
                 activeItem.addClass('hide');
                 blockedItem.removeClass('hide');
             }

             blockItem[0].dataset.active=active;
         }

     });

    return app;
})(elliptical.module);