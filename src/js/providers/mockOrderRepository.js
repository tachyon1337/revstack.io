elliptical.module = (function (app) {

    var GenericRepository=elliptical.GenericRepository;
    var container = app.container;

    //------------ mock orders generation---------------
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function orderStatus(index){
        return (index < 4) ? 'open' : 'closed';
    }

    function generateModel(MAX,userId){
        var _model=[];
        for(var i=0;i<MAX;i++){
            if(userId===undefined){
                userId=faker.random.uuid();
            }
            var order={
                id:faker.random.number({min:100,max:50000}),
                userId:userId,
                userAvatar:faker.image.avatar(),
                billingAddress:{
                    firstName:faker.name.firstName(),
                    lastName:faker.name.lastName(),
                    email:faker.internet.email(),
                    street:faker.address.streetAddress(),
                    city:faker.address.city(),
                    state:faker.address.stateAbbr(),
                    zipCode:faker.address.zipCode(),
                    phone:faker.phone.phoneNumber()
                }
            };
            var shippingAddress={
                firstName:order.billingAddress.firstName,
                lastName:order.billingAddress.lastName,
                email:order.billingAddress.email,
                street:order.billingAddress.street,
                city:order.billingAddress.city,
                state:order.billingAddress.state,
                zipCode:order.billingAddress.zipCode,
                phone:order.billingAddress.phone
            };
            order.shippingAddress=shippingAddress;
            var transaction=faker.helpers.createTransaction();
            order.subtotal=transaction.amount;
            order.salesTax=0;
            order.total=order.subtotal;
            order.date=faker.date.recent(365).toLocaleDateString();
            order.quantity=getRandomInt(1,8);
            order.status=orderStatus(i);
            order.shipTotal=0;
            order.discount=0;
            order.payment={
                paymentType:'Credit Card',
                expirationDate:faker.date.recent(365).toLocaleDateString(),
                cardNumber:'xxxx-xxxx-xxxx-1234'
            };
            order.shipping={
                shippingType:'UPS',
                shippingMethod:'Ground Shipping',
                dateShipped:faker.date.recent(365).toLocaleDateString()
            };


            _model.push(order);
        }

        return _model;
    }


    //callback that handles creating mock order detail items
    function callback(result,method,params,fn){
        if((method==='get') && params && params.id){
            if(!result){
                result=model[0];
            }
            result.details=[
                {
                    item:'Item One',
                    description:'Item One Description',
                    price:29.99,
                    quantity:1,
                    total:29.99
                },
                {
                    item:'Item Two',
                    description:'Item Two Description',
                    price:19.99,
                    quantity:1,
                    total:19.99
                },
                {
                    item:'Item Three',
                    description:'Item Three Description',
                    price:41.25,
                    quantity:2,
                    total:82.50
                },
                {
                    item:'Item Four',
                    description:'Item Four Description',
                    price:9.99,
                    quantity:3,
                    total:29.97
                }
            ]
        }else if(method==='get' && params && params.userId){
            result={data:generateModel(7,params.userId),count:7};
        }

        if(fn && typeof fn==='function'){
            fn(null,result);
        }

    }
    //--------------end-------------------------------------------

    //generate mock model
    var model=generateModel(200);


    //create the mock repository
    var repo=new GenericRepository(model,callback);

    repo.query=function(filter,asEnumerable){
        var List=this.Enumerable();
        var result;
        if(typeof filter==='string'){
            filter=filter.toLowerCase();
            result=_filter(List,filter);
            return (asEnumerable) ? result : result.ToArray();
        }else{
            var userId=filter.userId;
            result=_filterByUserId(List,userId);
            return (asEnumerable) ? result : result.ToArray();
        }

        function _filter(List,filter){
            return List.Where(function(x){
                var firstName=(x.billingAddress) ? x.billingAddress.firstName : x.firstName;
                firstName=firstName.toLowerCase();
                var lastName=(x.billingAddress) ? x.billingAddress.lastName : x.lastName;
                lastName=lastName.toLowerCase();
                var city=(x.billingAddress) ? x.billingAddress.city : x.city;
                city=city.toLowerCase();
                var result=((firstName.indexOf(filter)===0) || (lastName.indexOf(filter)===0) || (city.indexOf(filter)===0));
                if(result){
                    return true;
                }else{
                    var words=filter.split(' ');
                    if(words.length < 2){
                        return false;
                    }
                    return (firstName.indexOf(words[0])===0 && lastName.indexOf(words[1])===0)
                }

            });
        }

        function _filterByUserId(List,userId){
            return List.Where("$.userId == '" + userId + "'");
        }
    };


    container.registerType('$OrderRepository', repo);

    return app;
})(elliptical.module);