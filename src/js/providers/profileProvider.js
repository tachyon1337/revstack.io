elliptical.module = (function (app) {
    var GenericRepository=elliptical.GenericRepository;
    var container = app.container;

    function createProfile(){
        var obj={
            id:1,
            email:'demo@misonline.biz',
            password:'demo',
            firstName:'Bob',
            lastName:'Jackson'
        };
        var model=[];
        model.push(obj);
        return model;
    }


    var repo=new GenericRepository(createProfile());

    repo.loginPredicate=function(){
        return function(obj,val){
            return (obj.email===val.email && obj.password===val.password);
        }
    };

    repo.login=function(username,password){

    };

    container.registerType('$ProfileProvider', repo);

    return app;
})(elliptical.module);