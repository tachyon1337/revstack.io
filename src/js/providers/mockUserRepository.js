elliptical.module = (function (app) {

    var GenericRepository=elliptical.GenericRepository;
    var container = app.container;

    //------------ users model population---------------
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateModel(MAX){
        var _model=[];
        for(var i=0;i<MAX;i++){
            var orderNumber= ((i % 4)===0) ? getRandomInt(1,10) : 0;

            var user={
                id:faker.random.uuid(),
                avatar:faker.image.avatar(),
                firstName:faker.name.firstName(),
                lastName:faker.name.lastName(),
                email:faker.internet.email(),
                street:faker.address.streetAddress(),
                city:faker.address.city(),
                state:faker.address.stateAbbr(),
                zipCode:faker.address.zipCode(),
                phone:faker.phone.phoneNumber(),
                dateRegistered:faker.date.recent(365).toLocaleDateString(),
                orderNumber:orderNumber,
                active:true
            };
            _model.push(user);
        }

        return _model;
    }


    //--------------end-------------------------------------------

    var model=generateModel(500);
    var repo=new GenericRepository(model,['firstName','lastName','city']);

    //overload the repo
    repo.resetPassword=function(params,callback){
        callback(null,params);
    };

    repo.getFilter=function(params){
        if(params.$filter && params.$filter !==undefined){
            var startsWith=this.startsWithPredicate();
            return {
                val:params.$filter,
                fn:startsWith
            };
        }else{
            return null;
        }
    };

    container.registerType('$UserRepository', repo);

    return app;
})(elliptical.module);