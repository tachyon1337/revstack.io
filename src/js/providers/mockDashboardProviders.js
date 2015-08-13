elliptical.module = (function (app) {

    var Provider = elliptical.Provider;
    var container = app.container;
    var GenericRepository=elliptical.GenericRepository;

    ///////////Statistics Graph
    //create a 14 months worth of mock traffic data
    var trafficStart = moment('05/01/2014');

    var now = moment();
    var trafficModel=[];
    for (var m = trafficStart; m.isBefore(now); m.add(1, 'days')) {
        var clone=m.format('YYYY-MM-DD');
        var c=moment(clone);

        var trafficObj={

           visits:faker.random.number({min:50,max:1000}),
           pageViews:faker.random.number({min:500,max:5000}),
           date:c,
           month: parseInt(c.format('MM')),
           monthM: c.format('MMM'),
           day:parseInt(c.format('D')),
           dayOfWeek: c.format('ddd'),
           dayOfWeekD: parseInt(c.format('d')),
           year: parseInt(c.format('YYYY'))

         };

        trafficModel.push(trafficObj);
    }

    var $statsRepo=new GenericRepository(trafficModel);
    container.registerType('$StatisticsGraphProvider',$statsRepo);

    /////////////Browser Usage
    var colors1=['#48b401','#f65700','#00b78a','#ffc107','#ff7e06','#8bc34a'];
    var $BrowserUsage=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data=[
                {label: "Chrome", value: 40},
                {label: "Safari", value: 25},
                {label: "IE", value: 15},
                {label: "Firefox", value: 10},
                {label: "Opera", value: 5},
                {label: "Other",value:5}
            ];
            model.colors=colors1;
            model.legend={
                label:'Percentage Browser Usage'
            };
            callback(null,model);
        }

    },{});

    container.registerType('$BrowserUsageProvider',$BrowserUsage);


    //////////Device Usage
    var colors2=['#00a3d8','#2fbbe8','#8bc34a','#ffc107'];
    var $DeviceUsage=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data=[
                {label: "Desktop", value: 60},
                {label: "Android", value: 25},
                {label: "iOS", value: 10},
                {label: "Other",value:5}
            ];
            model.colors=colors2;
            model.legend={
                label:'Percentage Device Usage'
            };
            callback(null,model);
        }

    },{});

    container.registerType('$DeviceUsageProvider',$DeviceUsage);


    //////// Trends Graph
    var $TrendsGraph=Provider.extend({

    },{});

    container.registerType('$TrendsGraphProvider',$TrendsGraph);




    //////// Trends Graph Orders
    var color='#a748ca';
    var $TrendsGraphOrders=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data='51';
            model.opts={
                barColor:color,
                scaleColor:false,
                trackColor:'#f9f9f9',
                lineCap:'square',
                lineWidth:5,
                size:140
            };
            callback(null,model);
        }

    },{});

    container.registerType('$TrendsGraphOrdersProvider',$TrendsGraphOrders);


    //////////// Trends Graph Sales
    var color2='#48b401';
    var $TrendsGraphSales=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data='63';
            model.opts={
                barColor:color2,
                scaleColor:false,
                trackColor:'#f9f9f9',
                lineCap:'square',
                lineWidth:5,
                size:140
            };
            callback(null,model);
        }

    },{});

    container.registerType('$TrendsGraphSalesProvider',$TrendsGraphSales);


    ////////// Trends Graph Traffic
    var color3='#00b78a';
    var $TrendsGraphTraffic=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data='71';
            model.opts={
                barColor:color3,
                scaleColor:false,
                trackColor:'#f9f9f9',
                lineCap:'square',
                lineWidth:5,
                size:140
            };
            callback(null,model);
        }

    },{});

    container.registerType('$TrendsGraphTrafficProvider',$TrendsGraphTraffic);


    ///// Trends Graph Users
    var $TrendsGraphUsers=Provider.extend({
        get:function(params,resource,query,callback){
            var model={};
            model.data='43';
            model.opts={
                barColor:color,
                scaleColor:false,
                trackColor:'#f9f9f9',
                lineCap:'square',
                lineWidth:5,
                size:140
            };
            callback(null,model);
        }

    },{});

    container.registerType('$TrendsGraphUsersProvider',$TrendsGraphUsers);


    //////// Social Graph
    var $SocialGraphProvider=Provider.extend({
        get:function(params,resource,query,callback){
            var model=[];
            var obj={
                name:'Bob Jackson',
                time:'15 minutes ago',
                content:'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim...'
            };
            model.push(obj);
            var obj2={
                name:'Linda Davis',
                time:'About an hour ago',
                content:'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim...'
            };
            model.push(obj2);

            var obj3={
                name:'Carlos Casteneda',
                time:'About a decade ago',
                content:'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim...'
            };
            model.push(obj3);

            callback(null,model);
        },

        onAfterGet:function(element,scope){
            var carousel=element.find('ui-carousel');
            carousel.carousel('runInit');
        }

    },{});

    container.registerType('$SocialGraphProvider',$SocialGraphProvider);



    //////// RealtimeGraph
    var $RealTimeGraph=Provider.extend({

    },{});

    container.registerType('$RealTimeGraphProvider',$RealTimeGraph);


    return app;
})(elliptical.module);