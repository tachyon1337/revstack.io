/// Generic Repository prototype extensions
elliptical.module = (function (app) {
    var GenericRepository=elliptical.GenericRepository;

    GenericRepository.prototype.dateRange=function(params,prop){
        var dte;
        var List=this.Enumerable();
        if(prop===undefined){
            prop='date';
        }
        var start=params.start;
        var end=params.end;
        return List.Where(function(x){
            if(start && end){
                dte=moment(x[prop]);
                return (dte >=start && dte <=end);
            }else{
                dte=moment(x[prop]);
                return (dte >=params);
            }
        });
    };

    GenericRepository.prototype.sum=function(params,callback){
        var dateValue=params.dateValue;
        var prop=params.prop || null;
        var dateProp=params.dateProp || 'date';
        var model=this.model;
        if(model && model.length && model.length >0){
            if(!prop || prop===undefined){
                callback(null,model.length);
            }else{
                var sum=this.dateRange(dateValue,dateProp)
                    .Select(function(x){
                        return parseFloat(x[prop]);
                    }).Sum("$");

                return callback(null,sum.toFixed(2));
            }
        }
    };


    return app;
})(elliptical.module);

















