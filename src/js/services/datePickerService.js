///DatePicker Service:
/// Sets Dates and Date Ranges from Selections made by the FAB Dashboard Datepicker
/// Also returns the current selections, get-->returns a text label for the selected range. getDate-->returns a valid JS date/date range
/// If get returns nothing, the service will set a default 'month-to-date' date range
/// the service will also update Settings values from an injected $Settings provider. This is to allow persistence across sessions
/// Finally, the service will set the Url filter string and notify any listeners of updated values
elliptical.module = (function (app) {

    var container = app.container;
    var FORMATTER='MMMM D, YYYY';

    function DatePicker(){
        this.$provider=this.constructor.$provider;
        this.set=function(type,val){
            this.$provider.set(type,val);
            var Settings=container.getType('$Settings');
            var value=this.$provider.value;
            var dateValue=this.$provider.dateValue;
            var dateRange=this.$provider.dateRange;
            var _type=this.$provider.type;
            var Moment=container.getType('Moment');
            var now=Moment();
            Settings.set('range',value);
            Settings.set('dateValue',dateValue);
            Settings.set('dateRange',dateRange);
            Settings.set('now',now);
            Settings.set('type',_type);
        };
        this.get=function(){
            return this.$provider.get();
        };
        this.getDate=function(){
            ///return dateValue
            var Moment=container.getType('Moment');
            var value=this.$provider.getDate();
            var Settings=container.getType('$Settings');
            var type=Settings.get('type');

            ///if range and value, return value (range is not dependent on a 'to-date' to today calculation)
            if(value && type==='range'){
                return value;
            }else if(type==='range'){
                var _dateValue=Settings.get('dateValue');
                if(_dateValue){
                    var start_=Moment(_dateValue.start);
                    var end_=Moment(_dateValue.end);
                    return {start:start_,end:end_};
                }
            }

            var invalidNow=true;
            var now=Moment().format('l');
            var _now=Moment(now);
            var strNow=_now.format(FORMATTER);
            var settingsNow=Settings.get('now');
            if(settingsNow){
                settingsNow=Moment(settingsNow);
                invalidNow=(_now===settingsNow);
            }

            ///if settings now is a valid now and value exists, return value
            if(value && !invalidNow){
                return value;
            }

            //if no type in settings, defaults to 'month-to-date'
            if(!type){
                type='month-to-date';
            }
            ///else, we need to update the settings now
            ///e.g., avoid Datepicker set for 'today', login a week later and getting 'today' as last week's value
            switch(type){
                case 'today':{
                    this.$provider.setToday(now,_now,strNow);
                    return this.$provider.dateValue;
                }
                case 'month-to-date':{
                    this.$provider.setMonthToDate(Moment,strNow);
                    return this.$provider.dateValue;
                }
                case 'year-to-date':{
                    this.$provider.setYearToDate(Moment,strNow);
                    return this.$provider.dateValue;
                }

            }

            return null;
        };

        this.getType=function(){
            var type=this.$provider.type;
            if(!type){
                var Settings=container.getType('$Settings');
                type=Settings.get('type');
                if(!type){
                    return 'month-to-date';
                }else{
                    return type;
                }
            }else{
                return type;
            }
        };

        this.getDateRange=function(){
            var range=this.$provider.dateRange;
            if(range){
                return range;
            }else{
                var Settings=container.getType('$Settings');
                range=Settings.get('dateRange');
                if(range){
                    this.$provider.dateRange=range;
                }
                return range;
            }
        };


    }


    container.mapType('DatePicker',new DatePicker(), '$DatePickerProvider');

    return app;
})(elliptical.module);