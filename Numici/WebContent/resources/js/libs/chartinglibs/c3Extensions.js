/**
 * New node file
 */

var mobiledevice = false;
var isMobile =function(){
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		
		mobiledevice = true;
	}else{
		mobiledevice=false;
	}
};
	 
isMobile();


/*var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
*/
//var device = isMobile.iOS();
//Extension code 
    
var redrawArc = c3.chart.internal.fn.redrawArc;
//var drag=c3.chart.internal.fn.drag;
//var dragstart= c3.chart.internal.fn.dragstart;
//var dragend =c3.chart.internal.fn.dragend;

var generateEventRectsForSingleX =  c3.chart.internal.fn.generateEventRectsForSingleX;
var generateEventRectsForMultipleXs=c3.chart.internal.fn.generateEventRectsForMultipleXs ;



var generateEventRectsForSingleXExt=function(eventRectEnter){
	
	generateEventRectsForMultipleXs.apply(this, [eventRectEnter]);
	var $$ = this, d3 = $$.d3, config = $$.config;
	 if(mobiledevice) {
		 eventRectEnter.call(function(){return;});
		}else{
			 eventRectEnter.call(function(){return;});
		}
};

var generateEventRectsForMultipleXsExt=function(eventRectEnter){
	generateEventRectsForMultipleXs.apply(this, [eventRectEnter]);
	var $$ = this, d3 = $$.d3, config = $$.config;
	 if(mobiledevice) {
		 eventRectEnter.call(function(){return;});
		}else{
			 eventRectEnter.call(function(){return;});
		}

         
};
var redrawArcExt = function (duration, durationForExit, withTransform){
	redrawArc.apply(this, [duration, durationForExit, withTransform]);
	console.log("we are at redrawArcExt");
	var $$ = this, main = $$.main,
    mainArc;
	mainArc = main.selectAll('.' + $$.CLASS.arcs).selectAll('.' + $$.CLASS.arc);
	if(mobiledevice) {
		
		mainArc.on('mouseover', null);
		mainArc.on('mouseout', null);
		mainArc.on('touchstart', function (d, i) {
			
	        var updated = $$.updateAngle(d),
	            arcData = $$.convertToArcData(updated);
	        if ($$.toggleShape) { $$.toggleShape(this, arcData, i); }
	        $$.config.data_onclick.call($$.api, arcData, this);
	    });
		mainArc.on('touchmove', function (d, i) {
			
			var updated = $$.updateAngle(d),
	        arcData = $$.convertToArcData(updated),
	        selectedData = [arcData];
			$$.showTooltip(selectedData, d3.mouse(this));
	        setTimeout(function(){
	        	  $$.hideTooltip();
	        }, 10000);
	       
	    });
	}
	
	
	
};


/*var dragExt = function(mouse){
	
	if(mobiledevice) {
		return;
	}else{
		drag.apply(this,[mouse]);
	}
};


var dragstartExt = function(mouse){
	
	if(mobiledevice) {
		return;
	}else{
		dragstart.apply(this,[mouse]);
	}
};


var dragendExt = function(){
	
	if(mobiledevice) {
		return;
	}else{
		dragend.apply(this);
	}
};
*/

c3.chart.internal.fn.redrawArc=redrawArcExt;
//c3.chart.internal.fn.drag=dragExt;
//c3.chart.internal.fn.dragstart=dragstartExt;
//c3.chart.internal.fn.dragend=dragendExt;
c3.chart.internal.fn.generateEventRectsForSingleX=generateEventRectsForSingleXExt;
c3.chart.internal.fn.generateEventRectsForMultipleXs=generateEventRectsForMultipleXsExt;