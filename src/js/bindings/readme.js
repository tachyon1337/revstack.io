/*

 elliptical.binding binds a closure to any mutated element(i.e,  elements added to the DOM) that has an "ea" attribute.
 The binding passes a reference to the HTML node to the closure

 <html-tag ea="my-binding"></html-tag>

 elliptical.binding("my-binding",function(node){
         ///the callback instance
 });

any callback instance automatically has this.event,this.OnDestroy, this.click, this.jsonParseMessage bound

because a closure with a bound element reference is a recipe for memory leaks in SPA apps, most events should be registered
using this.event which guarantees event unbinding on element destruction. If a handler is not registered with this.event, the handler should
be unbound using the this.OnDestroy.

unbound event handlers==memory leaks in SPAs

that being said, the closure is set to null when the element instance is destroyed, to snuff out the leaks


this.click is a click/touch event that replaces 'click'

 */
