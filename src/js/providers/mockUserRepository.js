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
    var repo=new GenericRepository(model);

    //overload the repo
    repo.resetPassword=function(params,callback){
        callback(null,params);
    };

    repo.query=function(filter){
        filter=filter.toLowerCase();
        return this.Enumerable().Where(function(x){
            return ((x.firstName.toLowerCase().indexOf(filter)==0) || (x.lastName.toLowerCase().indexOf(filter)==0) || (x.city.toLowerCase().indexOf(filter)==0));
        }).ToArray();
    };

    container.registerType('$UserRepository', repo);

    return app;
})(elliptical.module);