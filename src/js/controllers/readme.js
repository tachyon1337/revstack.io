
/*

 Controller is a factory that behave similar to asp.net controllers.
 The Controller constructor takes the app function and the controller name
 The Controller prototype takes a string route and an singleton(object literal) whose methods correspond to the controller's actions
 The string param is parsed by the Controller. The '@action' param corresponds to the action name, params prefaced by a colon : are route
 variables bound to the req.params object.

 /List/1  --> req.params.page=1

 Like asp/.net mvc, actions views should be named the same as the action and placed under a folder named the same as the controller, all placed
 under the "views" folder in the public root.

 root --> Views-->Orders-->list.html

 dust.js is the template engine.
 {#prop} --> forEach iterator over model property 'prop', acts as both an array and object iterator

 var Controller = new elliptical.Controller(app,'Orders');
 Controller('/@action/:page', {
    List:function(req,res,next){
       var Try=req.service('Try');
       Try(next,function(){
         res.render(res.context);  -->res.render==View, res.context==Model
       });
    }
 });



 */
