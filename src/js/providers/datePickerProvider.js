elliptical.module = (function (app) {

    var container = app.container;
    var EVENT_NAME='db.datapicker.change';
    var FORMATTER='MMMM D, YYYY';

    function $DatePicker(){
        this.type=null;
        this.value=null;
        this.dateValue=null;
        this.dateRange=null;

        this.set=function(type,val){
            var filter='';
            var url='/Order/List/1?$filter=';
            var Location=container.getType('Location');
            var Moment=container.getType('Moment');
            var now=Moment().format('l');
            var _now=Moment(now);
            var strNow=_now.format(FORMATTER);
            if(type==='today'){
                filter=this.setToday(now,_now,strNow);

            }else if(type==='year-to-date'){
                filter=this.setYearToDate(Moment,strNow);

            }else if(type==='month-to-date'){
                filter=this.setMonthToDate(Moment,strNow)

            }else if(type==='range'){
                filter=this.setRange(Moment,val);
            }
            url+=filter;
            var currentPath=Location.path;
            if(currentPath !=='/'){
                Location.redirect(url);
            }else{
                var Event=container.getType('Event');
                Event.emit(EVENT_NAME,this.dateValue);
            }
        };

        this.get=function(){
            return this.value;
        };

        this.getDate=function(){
            return this.dateValue;
        };

        this.getType=function(){
            return this.type;
        };

        this._getDateRange=function(obj){
            var Moment=container.getType('Moment');
            var now=Moment().format('l');
            var _now=Moment(now);
            var strNow=_now.format(FORMATTER);
            return obj.format(FORMATTER) + ' - ' + strNow;
        };

        this.setToday=function(now,_now,strNow){
            var filter='Date eq ' + now;
            this.value='today';
            this.type='today';
            this.dateValue=_now;
            this.dateRange=strNow;
            return filter;
        };

        this.setYearToDate=function(Moment,strNow){
            var currentYear=Moment().format('YYYY');
            var yearDate='1/1/' + currentYear;
            var filter='Date ge ' + yearDate;
            this.value='year to date';
            this.type='year-to-date';
            this.dateValue=Moment(yearDate);
            this.dateRange=this.dateValue.format(FORMATTER) + ' - ' + strNow;
            return filter;
        };

        this.setMonthToDate=function(Moment,strNow){
            var currentMonth=Moment().format('MM');
            var currentYear=Moment().format('YYYY');
            var monthDate=currentMonth + '/1/' + currentYear;
            var filter='Date ge ' + monthDate;
            this.value='month to date';
            this.type='month-to-date';
            this.dateValue=Moment(monthDate);
            this.dateRange=this.dateValue.format(FORMATTER) + ' - ' + strNow;
            return filter;
        };

        this.setRange=function(Moment,val){
            var filter='Date ge ' + val.start + ' le ' + val.end;
            this.value=val.start + ' - ' + val.end;
            this.type='range';
            this.dateValue={
                start:Moment(val.start),
                end:Moment(val.end)
            };
            this.dateRange=this.dateValue.start.format(FORMATTER) + ' - ' + this.dateValue.end.format(FORMATTER);
            return filter;
        };
    }

    container.registerType('$DatePickerProvider',new $DatePicker());

    return app;
})(elliptical.module);