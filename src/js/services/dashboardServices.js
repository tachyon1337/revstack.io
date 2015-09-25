elliptical.module = (function (app) {
    var container=app.container;
    //define the Dashboard Service "interface"
    var DashboardService=elliptical.Service.extend({
        "@resource":'DashBoardService',
        element:null,
        show:function(element){this.$provider.show(element)},
        hide:function(key){
            var Settings=container.getType('Settings');
            var component=Settings.getDashboard(key);
            component.active=false;
            Settings.setDashboard(key,component);
        },
        refresh:function(element){this.$provider.refresh(element)},
        setElement:function(element) {this.element=element},
        onAfterGet:function(element,scope) {this.$provider.onAfterGet(element,scope)},
        action:function(element,params) {this.$provider.action(element,params)}
    },{
        element:null,
        show:function(element){this.constructor.show(element)},
        hide:function(key){this.constructor.hide(key)},
        refresh:function(element){this.constructor.refresh(element)},
        setElement:function(element){this.element=element},
        onAfterGet:function(element,scope){this.constructor.onAfterGet(element,scope)},
        action:function(element,params) {this.constructor.action(element,params)}

    });

    //// Statistics Graph Service
    var StatisticsGraph=DashboardService.extend({
        "@resource":'StatisticsGraph',
        get:function(params,callback){
            var self=this;
            var datePicker=container.getType('DatePicker');
            var dateValue=datePicker.getDate();
            var type=datePicker.getType();
            var query={};
            query.filter=dateValue;
            var viewModel=this._initViewModel();
            this.$provider.get({},query,function(err,data){

                //need to format the data to the chart view model
                data=data.ToArray();
                switch(type){
                    case 'today':
                        viewModel.data.labels.push('today');
                        viewModel.data.series.push([data[0].visits]);
                        viewModel.data.series.push([data[0].pageViews]);

                        callback(null,viewModel);

                        break;

                    case 'month-to-date':
                        var monthToDate=self._monthToDateData(data);
                        viewModel.data.labels=monthToDate.labels;
                        viewModel.data.series.push(monthToDate.visitSeries);
                        viewModel.data.series.push(monthToDate.pageSeries);

                        callback(null,viewModel);

                        break;

                    case 'year-to-date':
                        var yearToDate=self._yearToDateData(data);
                        viewModel.data.labels=yearToDate.labels;
                        viewModel.data.series.push(yearToDate.visitSeries);
                        viewModel.data.series.push(yearToDate.pageSeries);

                        callback(null,viewModel);
                        break;

                    case 'range':
                        var rangeDates=self._rangeData(data);
                        viewModel.data.labels=rangeDates.labels;
                        viewModel.data.series.push(rangeDates.visitSeries);
                        viewModel.data.series.push(rangeDates.pageSeries);

                        callback(null,viewModel);
                        break;
                }
            });
        },

        _initViewModel:function(){
            var viewModel={
                legend:[{
                    label:'Unique Visits',
                    color:'color-1'
                },{
                    label:'Page Views',
                    color:'color-2'
                }],
                data:{
                    labels:[],
                    series:[]
                }
            };

            return viewModel;
        },

        _monthToDateData:function(data){
            //12 x-coordinates MAX
            var labels=[];
            var pageSeries=[];
            var visitSeries=[];
            var day=parseInt(moment().format('D'));

            if(day > 12){
                incrementDataModels('days 1-7',0,7,data,labels,pageSeries,visitSeries);
                if(day < 14){
                    incrementDataModels('days 8-' + day.toString(),8,day,data,labels,pageSeries,visitSeries);
                }else if(day < 21){
                    incrementDataModels('days 8-14',8,14,data,labels,pageSeries,visitSeries);
                    incrementDataModels('days 14-' + day,14,day,data,labels,pageSeries,visitSeries);
                }else{
                    incrementDataModels('days 8-14',8,14,data,labels,pageSeries,visitSeries);
                    incrementDataModels('days 14-21',14,21,data,labels,pageSeries,visitSeries);
                    incrementDataModels('days 21-' + day,21,day,data,labels,pageSeries,visitSeries);
                }
            }else{
                for(var i=0;i<day;i++){
                    var theDay=i+1;
                    labels.push(theDay.toString());
                    pageSeries.push(data[i].pageViews);
                    visitSeries.push(data[i].visits);
                }
            }

            return{
                labels:labels,
                pageSeries:pageSeries,
                visitSeries:visitSeries
            };

            function calculateSum(arr,prop,start,end){
                var sum=0;
                for(var k=start;k<end;k++){
                    sum+=arr[k][prop];
                }
                return sum;
            }
            function incrementDataModels(label,start,end,data,labelsArray,pageSeries,visitSeries){
                labelsArray.push(label);
                var pageSeriesSum=calculateSum(data,'pageViews',start,end);
                pageSeries.push(pageSeriesSum);
                var visitSeriesSum=calculateSum(data,'visits',start,end);
                visitSeries.push(visitSeriesSum);
            }
        },

        _yearToDateData:function(data){

            var currentMonth=parseInt(moment().format('M'));
            var labels=getLabels(currentMonth);
            var series=getDataSeries(data,currentMonth);
            return{
                labels:labels,
                pageSeries:series.page,
                visitSeries:series.visit
            };

            function getLabels(currentMonth){
                var labels=[];
                for(var i=0;i<currentMonth;i++){
                    var strMonth=(i+1).toString();
                    var strDate=strMonth + '/1/2015';
                    var dte=moment(strDate);
                    var mon=dte.format('MMM');
                    labels.push(mon);
                }

                return labels;
            }

            function getDataSeries(data){
                var _pageSeries=[];
                var _visitSeries=[];
                var length=data.length;
                var curMonth=1;
                var pageSum=0;
                var visitSum=0;
                for(var i=0;i<length;i++){
                    var month=data[i].month;
                    if(month===curMonth){
                        pageSum+=data[i].pageViews;
                        visitSum+=data[i].visits;
                    }else{
                        _pageSeries.push(pageSum);
                        _visitSeries.push(visitSum);
                        pageSum=0;
                        visitSum=0;
                        curMonth++;
                    }
                }
                return{
                    page:_pageSeries,
                    visit:_visitSeries
                }
            }
        },

        _rangeData:function(data){
            var labels=getLabels(data);
            var series=getDataSeries(data);
            return{
                labels:labels,
                pageSeries:series.page,
                visitSeries:series.visit
            };

            function getLabels(data){
                var length=data.length;
                var labels=[];
                var curMonth=null;
                var month_;
                for(var i=0;i<length;i++){
                    var month=data[i].month;
                    var date=data[i].date;
                    if(curMonth){
                        if(month!==curMonth){
                            month_=moment(date).format('MMM');
                            labels.push(month_);
                            curMonth=month;
                        }

                    }else{
                        curMonth=month;
                        month_=moment(date).format('MMM');
                        labels.push(month_);
                    }
                }

                return labels;
            }

            function getDataSeries(data){
                var _pageSeries=[];
                var _visitSeries=[];
                var length=data.length;
                var curMonth=null;
                var pageSum=0;
                var visitSum=0;
                for(var i=0;i<length;i++){
                    var month=data[i].month;
                    if(!curMonth){
                        curMonth=month;
                        pageSum+=data[i].pageViews;
                        visitSum+=data[i].visits;
                    }else{
                        if(month===curMonth){
                            pageSum+=data[i].pageViews;
                            visitSum+=data[i].visits;
                        }else{
                            _pageSeries.push(pageSum);
                            _visitSeries.push(visitSum);
                            pageSum=0;
                            visitSum=0;
                            curMonth++;
                        }
                    }
                }
                if(pageSum >0 && visitSum >0){
                    _pageSeries.push(pageSum);
                    _visitSeries.push(visitSum);
                }
                return{
                    page:_pageSeries,
                    visit:_visitSeries
                }
            }
        },


        //icon cards
        sum:function(dateValue,callback){
            var query={};
            query.filter=dateValue;
            this.$provider.get({},query,function(err,data){
                data=data.ToArray();
                var sum=0;
                var length=data.length;
                for(var i=0;i<length;i++){
                    sum+=data[i].visits;
                }
                return callback(null,sum);
            });
        }

    },{
        sum:function(dateValue,callback){this.constructor.sum(dateValue,callback)}
    });





    var BrowserUsage=DashboardService.extend({
        "@resource":'BrowserUsage'
    },{});

    var DeviceUsage=DashboardService.extend({
        "@resource":'DeviceUsage'
    },{});

    var TrendsGraph=DashboardService.extend({
        "@resource":'TrendsGraph'
    },{});


    var TrendsGraphSales=DashboardService.extend({
        "@resource":'TrendsGraphSales'
    },{});

    var TrendsGraphTraffic=DashboardService.extend({
        "@resource":'TrendsGraphTraffic'
    },{});

    var TrendsGraphUsers=DashboardService.extend({
        "@resource":'TrendsGraphUsers'
    },{});

    var TrendsGraphOrders=DashboardService.extend({
        "@resource":'TrendsGraphOrders'
    },{});



    var SocialGraph=DashboardService.extend({},{});

    var RealTimeGraph=DashboardService.extend({},{});



    container.mapType(BrowserUsage, '$BrowserUsageProvider');
    container.mapType(DeviceUsage, '$DeviceUsageProvider');
    container.mapType(TrendsGraph, '$TrendsGraphProvider');
    container.mapType(TrendsGraphSales, '$TrendsGraphSalesProvider');
    container.mapType(TrendsGraphTraffic, '$TrendsGraphTrafficProvider');
    container.mapType(TrendsGraphUsers, '$TrendsGraphUsersProvider');
    container.mapType(TrendsGraphOrders, '$TrendsGraphOrdersProvider');
    container.mapType(StatisticsGraph, '$StatisticsGraphProvider');
    container.mapType('SocialGraph',SocialGraph,'$SocialGraphProvider');
    container.mapType('RealTimeGraph',RealTimeGraph,'$RealTimeGraphProvider');

    return app;
})(elliptical.module);