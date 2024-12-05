var chartController=function(){
	
	var chartObj=null;
	var chartConfig={};
	var readConfig=function(){
		
		$("#resultChart").remove();
		var $div=$("<div>");
		$div.attr("id","resultChart");
		$(".chartWrapper").append($div);
		$("#resultChart").data({});
		var dim="fiscalYear";
		var mes="revenue";
		var range=vdvcInputs.getDimensionInputs(Model,dim);
		var dimension=ndx.dimension(function(d){
			return d["fiscalYear"];
		});
		var group1=dimension.group().reduceSum(function(d) {
			return d["marketdata"];
		});
		var products = ndx.dimension(function(d){return d["product"];});
		var sums = [];
		
		var chartObj1 = dc.compositeChart("#resultChart");
		chartObj1.height(300 || _height)
			//.width(options.width || _width)
			.margins({top : 20,
				left : 60,
				right : 60,
				bottom : 40})
			.x(d3.scale.ordinal().domain(range))
			.xUnits(dc.units.ordinal)
			.xAxisLabel("Fiscal Year")
			.yAxisLabel("Revenue")
			.rightYAxisLabel("Market Data")
			.renderHorizontalGridLines(true)
			.brushOn(false)
			.elasticY(true)
			.legend(dc.legend().x(80).y(0).itemHeight(13).gap(5))
			.yAxis().tickFormat(function(v) {
				return "$"+(v/1000000) +" M";
			});
		chartObj1.rightYAxis().tickFormat(function(v) {
		return "$"+(v/1000000000) +" B";
	});
		
		
		 products.group().all().forEach(function(val,i){
			 
			 var o= dc.barChart(chartObj1)
			 	.colors(d3.scale.category20().range()[i])
		        .dimension(dimension)
		        .centerBar(true)
		        .group(dimension.group().reduceSum(function(d){
	            	return d["product"]==val.key?d[mes]:0;}
	            ),val.key)
		        .gap(500/5 || 1);
			 sums.push(o);  
	        });
			var linechart=dc.lineChart(chartObj1)
	        .group(group1, "Market Data")
	        .colors("brown")
	        .dotRadius(10)
	        .useRightYAxis(true);
			sums.push(linechart);
		
			chartObj1.compose(sums)
			.renderlet(function (chart) {
							var x=-70;
							for(var i=0;i<sums.length;i++){
								x +=10;
								chart.selectAll("g.sub._"+i).attr("transform", "translate("+x+" , 0)");
							}
						  });
			chartObj1.render();
	};
	var dlg=$('<div class="chrt_ctl"></div>').dialog({
		autoOpen : false,
		title: "Chart Configurator" ,
		resizable: false,
		width : 700,
		height : 400,
		modal:true,
		open : function(event, ui) {
			var markup='<table style="width:100%;" class="table">\
				<tr>\
				<td>vApp :</td>\
				<td>:</td>\
				<td colspan=3>'+vApp.appName+'</td>\
				</tr>\
				<tr>\
				<td>Chart :</td>\
				<td>:</td>\
				<td colspan=3>Result Chart</td>\
				</tr>\
				<tr>\
				<td></td>\
				<td></td>\
				<td>Measure/Dimensions</td>\
				<td>Chart type</td>\
				<td>Detail</td>\
				</tr>\
				<tr>\
				<td axis="x">X-Axis</td>\
				<td>:</td>\
				<td>Fiscal Year</td>\
				<td></td>\
				<td></td>\
				</tr>\
				<tr axis="prim_y">\
				<td>Y-Axis:Primary</td>\
				<td>:</td>\
				<td>Revenue</td>\
				<td><select class="chartType">\
				<option value="CS">Stacked Column</option>\
				<option value="CC">Clustered Column</option>\
				<option value="L">Line</option>\
				</select></td>\
				<td><select class="chartDetail">\
				<option value="product">Product</option>\
				<option value="geo">GEO</option>\
				</select></td>\
				</tr>\
				<tr axis="sec_y">\
				<td>Y-Axis:Secondary</td>\
				<td>:</td>\
				<td>Market Size</td>\
				<td><select class="chartType">\
				<option value="L">Line</option>\
				</select></td>\
				<td><select class="chartDetail">\
				<option value="product">Product</option>\
				<option value="geo">GEO</option>\
				</select></td>\
				</tr>\
				</table>';
			$(this).append(markup);
		},
		close:function(){
			$( this ).dialog( "destroy" );
		},
		buttons : {
			"Cancel" : function() {
				$(this).dialog("close");
			},
			"Save" : function() {
				readConfig();
			}
		}
	});
	
	
	
	this.open=function(chart){
		console.log(ndx);
		chartObj=chart;
		$(dlg).dialog("open");
		};
	return this;
};





var k={
    "id": null,
    "position": 1,
    "name": "Bar Chart",
    "controlType": "BarChart",
    "attributes": {
      "YAxisLabel2": "",
      "YAxis": "RC.Revenue",
      "MarginBottom": "1.50",
      "XAxisLabel": "Fiscal Year",
      "YAxisLabel": "Revenue",
      "YAxis2": "RC.Geo",
      "Height": "64.67",
      "Width": "57.28",
      "MarginRight": "0.77",
      "MarginTop": "1.50",
      "XAxis": "RC.FY",
      "MarginLeft": "41.79"
    },
    "controls": null
  };

var vdvcChart=(function(){
	
	var _margins={top : 10,
			left : 50,
			right : 10,
			bottom : 40};
	var _width=300;
	var _height=300;
	
	
	this.N_barChart = function(container,data,Model,options){
		
		var margins={};
		var parentWidth = $(container).parent().width();
		var parentHeight = $(container).parent().height();
		var width=(options.width)*parentWidth/100;
		var height=(options.height)*parentHeight/100;
		margins.top = (options["margin-top"])*parentHeight/100;
		margins.bottom = (options["margin-bottom"])*parentHeight/100;
		margins.left = (options["margin-left"])*parentWidth/100;
		margins.right = (options["margin-right"])*parentWidth/100;
		var barChart = dc.barChart(container);
		
		
		var dim=options.xAxis;
		var mes=options.yAxis;
		var range=vdvcInputs.getDimensionInputs(Model,dim);
		
		var min=d3.min(range);
		var max=d3.max(range);
		var linearScale = d3.scale.linear().domain([min,max]).range([min,max]);
		var dimension=data.dimension(function(d){
			return d[dim];
			
		});
		
		var group=dimension.group().reduceSum(function(d) {
			if(d[mes].Value !== null && typeof d[mes].Value !== "undefined"){
				return d[mes].Value;
			}else{
				return 0;
			}
			
		});
		
		barChart.height( height)
		.width(width)
		.margins(_margins)
		.dimension(dimension)
		.group(group)
		.centerBar(true)
		.gap(width/range.length+1 || 1)
		.x(d3.scale.ordinal().domain(range))
		.xUnits(dc.units.ordinal)
		.xAxisLabel(options.XAxisLabel)
		.yAxisLabel(options.YAxisLabel)
		.renderHorizontalGridLines(true)
		.elasticY(true)
		.yAxisPadding(100)
		.elasticX(true)
		.brushOn(true)
		.renderTitle(true);
		
		barChart.renderlet(function (chart) {
			 chart.selectAll(".bar").attr("width", "10");
			  });
		barChart.render();
	};
	
	
	var vdvcBarchart=function(container,crossfilterObj,options,Model){
	
		/*var parseDate = d3.time.format("%Y").parse;
		revWithMD.forEach(function(d) {
			d.FiscalYear = parseDate(d.FiscalYear);

		});*/
		
		$(container).empty();
		
		var dim=options.dimension;
		var mes=options.measure;
		var range=vdvcInputs.getDimensionInputs(Model,dim);
		var dimension=crossfilterObj.dimension(function(d){
			return d[dim];
			
		});
		
		var group=dimension.group().reduceSum(function(d) {
			return d[mes];
		});
		
		var barChart = dc.barChart(container);
		barChart.height(options.height || _height)
				//.width(options.width || _width)
				.margins(_margins)
				.dimension(dimension)
				.group(group)
				.centerBar(true)
				.gap(600/range.length || 1)
				.x(d3.scale.ordinal().domain(range))
				.xUnits(dc.units.ordinal)
				.xAxisLabel(options.xaxisLabel)
				.yAxisLabel(options.yaxisLabel)
				.renderHorizontalGridLines(true)
				.elasticY(true)
				.elasticX(true)
				.xAxisPadding(range.length*10)
				.brushOn(false)
				.renderTitle(true);
				
				barChart.yAxis().tickFormat(function(v) {
					return "$"+(v/1000000) +" M";
				});
		
		var fil=filters[barChart.anchorName()];
		if(fil){
			for(var a=0;a<fil.length;a++){
				barChart.filter(fil[a]);
			}
		}
		barChart.on("filtered", function(chart, filter){
			filters[chart.anchorName()]=chart.filters();
		});
		
		//chartObjects.push(barChart);
		barChart.render();
		return barChart;
	};
	
	var vdvcRowchart=function(container,crossfilterObj,options){
		$(container).empty();
		var rowChart = dc.rowChart(container);
		var dimension=crossfilterObj.dimension(function(d){
			return d[options.dimension];
		});
		var group=dimension.group().reduceSum(function(d) {
			return d[options.measure];
		});
		rowChart.height(options.height || _height)
				.group(group)
				.dimension(dimension)
				.colors(d3.scale.category20())
				.margins(_margins)
				.gap(7)
				.xAxis()
				.ticks(2);
		
		rowChart.on("filtered", function(chart, filter){
			
		});
		rowChart.render();
		return rowChart;
	};
	
	var vdvcDataTable=function(container,crossfilterObj,options,records){
		var dim=options.dimension;
		var mes=options.measure;
		var dataTable = dc.dataTable(container);
		var dimension=crossfilterObj.dimension(function(d){
			return d[dim];
		});
		
		var records=[];
		var count=-1;
		 column=options.columnToDisplay;
		 for(var a=0;a<column.length;a++){

			 records[a]=function(d, i){
			
				 if (i == 0) {
					 if ("undefined" == typeof column[count+1]) { count = -1; }
					 ++count;
				 }
				
				 return d[column[count]];
			 };
		 }
		
		dataTable.dimension(dimension)
				 .group(function(d) {
					return "";
				 })
				 .size(1000 ||options.size)
				 .columns(records)
				 .on("postRedraw", function(chart){
					dataTableUi();
				 }).on("postRender", function(chart){
					dataTableUi();
				 });
		dataTable.render();
	
};
	var vdvcPiechart=function(container,crossfilterObj,options){
		$(container).empty();
		var pieChart = dc.pieChart(container);
		var dimension=crossfilterObj.dimension(function(d){
			return d[options.dimension];
		});
		var group=dimension.group().reduceSum(function(d) {
			return d[options.measure];
		});
		
		pieChart.height(300)
				.dimension(dimension)
				.group(group)
				.colors(d3.scale.category20())
				.innerRadius(100)
				.renderLabel(false)
				.legend(dc.legend().x(40).y(90).itemHeight(10).gap(5)); 
		
		var fil=filters[pieChart.anchorName()];
		if(fil){
			for(var a=0;a<fil.length;a++){
				pieChart.filter(fil[a]);
			}
		}
		
		pieChart.on("filtered", function(chart, filter){
			filters[chart.anchorName()]=chart.filters();
			console.log(chartObjects[0].filter());
		});
		
		chartObjects.push(pieChart);
		
		pieChart.render();
	};
	
	
	var vdvcPiechart1=function(container,crossfilterObj,options){
		$(container).empty();
		var pieChart = dc.pieChart(container);
		var dimension=crossfilterObj.dimension(function(d){
			return d[options.dimension];
		});
		var group=dimension.group().reduceSum(function(d) {
			return d[options.measure];
		});
		
		pieChart.height(500)
				.dimension(dimension)
				.group(group)
				.colors(d3.scale.category20())
				.renderLabel(false)
				.legend(dc.legend().x(40).y(0).itemHeight(10).gap(5)); ; 
		
		var fil=filters[pieChart.anchorName()];
		if(fil){
			for(var a=0;a<fil.length;a++){
				pieChart.filter(fil[a]);
			}
		}
		
		pieChart.on("filtered", function(chart, filter){
			filters[chart.anchorName()]=chart.filters();
		});
		
		//chartObjects.push(pieChart);
		pieChart.render();
	};
	
	var vdvcLinechart= function(container,crossfilterObj,options){
		$(container).empty();
		var parseDate = d3.time.format("%Y").parse;
		Model.forEach(function(d) {
			d.FiscalYear = parseDate(d.FiscalYear);

		});
		var dim=options.dimension;
		var mes=options.measure;
		var lineChart = dc.lineChart(container);
		var dimension=crossfilterObj.dimension(function(d){
			return d[dim];
		});
		var group=dimension.group().reduceSum(function(d) {
			return d[mes];
		});
		var maxYear = dimension.top(1)[0].FiscalYear;
		var minYear = dimension.bottom(1)[0].FiscalYear;
		lineChart
	    .width(options.width || _width) 
	    .height(options.height || _height) 
	    .transitionDuration(500) 
	    .margins(_margins)
	    .dimension(dimension) 
	    .group(group) 
	    .x(d3.time.scale().domain([minYear,maxYear]))
	    .xAxisLabel(dim)
		.yAxisLabel(mes)
	    .renderHorizontalGridLines(true)
	    .renderVerticalGridLines(true)
	    .renderArea(true)
	    .brushOn(true)
	    .dotRadius(10)
	    .elasticY(true)
	    .yAxis().tickFormat(function(v) {
					return "$"+(v/1000000) +" M";
				});
		
		lineChart.render();
	};
	
	
	this.barLineChart=function(container,crossfilterObj,options){
		$(container).empty();
		
		var dim="fiscalYear";
		var mes="revenue";
		var range=vdvcInputs.getDimensionInputs(Model,dim);
		var dimension=crossfilterObj.dimension(function(d){
			return d[dim];
		});
		var products = crossfilterObj.dimension(function(d){return d["product"];});
		var sums = [];
		var legends=[];
		 products.group().all().forEach(function(val){
	            sums.push(dimension.group().reduceSum(function(d){
	            	return d["product"]==val.key?d[mes]:0;}
	            ));  
	            legends.push(val.key);
	        });
		var group1=dimension.group().reduceSum(function(d) {
			return d["marketdata"];
		});
		var compositeChart = dc.compositeChart(container);
		compositeChart.height(300 || _height)
				//.width(options.width || _width)
				.margins({top : 20,
					left : 60,
					right : 60,
					bottom : 40})
				.x(d3.scale.ordinal().domain(range))
				.xUnits(dc.units.ordinal)
				.xAxisLabel("Fiscal Year")
				.yAxisLabel("Revenue")
				.rightYAxisLabel("Market Data")
				.renderHorizontalGridLines(true)
				.brushOn(false)
				.elasticY(true)
				.legend(dc.legend().x(80).y(0).itemHeight(13).gap(5))
				.yAxis().tickFormat(function(v) {
					return "$"+(v/1000000) +" M";
				});
		compositeChart.rightYAxis().tickFormat(function(v) {
			return "$"+(v/1000000000) +" B";
		});
		var barchart= dc.barChart(compositeChart)
        .colors(d3.scale.category20())
        .dimension(dimension)
        .centerBar(true)
        .group(sums[0],legends[0])
        .gap(500/range.length || 1);
		
		for(var i=0;i<sums.length;i++){
			if(i !==0){
				barchart.stack(sums[i],legends[i]);
			}
		}
		var linechart=dc.lineChart(compositeChart)
        .group(group1, "Market Data")
        .colors("brown")
        .dotRadius(10)
        .useRightYAxis(true);
		
		compositeChart.compose([barchart,linechart])
					  .renderlet(function (chart) {
						  chart.selectAll("g.sub._1").attr("transform", "translate(40 , 0)");
						  document.oncontextmenu = function() {return false;};
						  d3.select(container).select("svg").on("mousedown",function(){
							  if( event.which == 3 ) { 
								  chartController().open(chart);
							      return false; 
							    } 
							    return true; 
							});
						  });
		
		compositeChart.render();
	};
	
	this.barLineChart1=function(container,crossfilterObj,options){
		$(container).empty();
		
		var dim="fiscalYear";
		var mes="revenue";
		var range=vdvcInputs.getDimensionInputs(Model,dim);
		var dimension=crossfilterObj.dimension(function(d){
			return d[dim];
		});
		var group=dimension.group().reduceSum(function(d) {
			return d[mes];
		});
		
		var group1=dimension.group().reduceSum(function(d) {
			return d["marketdata"];
		});
		var compositeChart = dc.compositeChart(container);
		compositeChart.height(300 || _height)
				//.width(options.width || _width)
				.margins({top : 20,
					left : 60,
					right : 60,
					bottom : 40})
				.x(d3.scale.ordinal().domain(range))
				.xUnits(dc.units.ordinal)
				.xAxisLabel("Fiscal Year")
				.yAxisLabel("Revenue")
				.rightYAxisLabel("Market Data")
				.renderHorizontalGridLines(true)
				.brushOn(false)
				.elasticY(true)
				.legend(dc.legend().x(80).y(0).itemHeight(13).gap(5))
				.yAxis().tickFormat(function(v) {
					return "$"+(v/1000000) +" M";
				});
		compositeChart.rightYAxis().tickFormat(function(v) {
			return "$"+(v/1000000000) +" B";
		});
		compositeChart.compose([
		                        dc.lineChart(compositeChart)
		                          .colors("blue")
		                          .dimension(dimension)
		                          .group(group,"Published")
		                          .renderArea(true),
		                        dc.lineChart(compositeChart)
		                          .group(group1, "Market Data")
		                          .colors("brown")
		                          .dotRadius(10)
		                          .useRightYAxis(true)
		                          .renderArea(true)

				]).renderlet(function (chart) {
					chart.selectAll("g._0").attr("transform", "translate(20 , 0)");
					chart.selectAll("g._1").attr("transform", "translate(20 , 0)");
				});
		
		
		compositeChart.render();
	};
	
	this.compositeChart=function(container,crossfilterObj,options){
		$(container).empty();
		
		var dim="fiscalYear";
		var mes="revenue";
		var range=vdvcInputs.getDimensionInputs(Model,dim);
		var dimension=crossfilterObj.dimension(function(d){
			return d[dim];
		});
		var group=dimension.group().reduceSum(function(d) {
			return d[mes];
		});
		
		var group1=dimension.group().reduceSum(function(d) {
			return d["revenue2"];
		});
		
		var group2=dimension.group().reduceSum(function(d) {
			return d["marketdata"];
		});
		var compositeChart = dc.compositeChart(container);
		compositeChart.height(300 || _height)
				//.width(options.width || _width)
				.margins({top : 20,
					left : 60,
					right : 60,
					bottom : 40})
				.x(d3.scale.ordinal().domain(range))
				.xUnits(dc.units.ordinal)
				.xAxisLabel("Fiscal Year")
				.yAxisLabel("Revenue")
				.rightYAxisLabel("Market Data")
				.renderHorizontalGridLines(true)
				.elasticY(true)
				.elasticX(true)
				.xAxisPadding(range.length*10)
				.legend(dc.legend().x(80).y(0).itemHeight(13).gap(5))
				.yAxis().tickFormat(function(v) {
					return "$"+(v/1000000) +" M";
				});
		compositeChart.rightYAxis().tickFormat(function(v) {
			return "$"+(v/1000000000) +" B";
		});
		compositeChart.compose([
	                dc.barChart(compositeChart)
	                  .colors("blue")
					  .dimension(dimension)
					  .group(group,"Published")
					  .gap(500/range.length || 1),
	                dc.barChart(compositeChart)
	                  .colors("brown")
					  .dimension(dimension)
					  .group(group1,"Received")
					  .gap(500/range.length || 1),
					dc.lineChart(compositeChart)
		              .group(group2, "Market Data")
                      .colors("orange")
                      .dotRadius(10)
                      .useRightYAxis(true)

				]).renderlet(function (chart) {
					chart.selectAll("g._0").attr("transform", "translate(-14 , 0)");
					chart.selectAll("g._1").attr("transform", "translate(16 , 0)");
					chart.selectAll("g._2").attr("transform", "translate(55 , 0)");
				});
		compositeChart.render();
	};
	
	
	this.compositeChart1=function(container,crossfilterObj,options){
		$(container).empty();
		
		var dim="fiscalYear";
		var mes="revenue";
		var range=vdvcInputs.getDimensionInputs(Model,dim);
		var dimension=crossfilterObj.dimension(function(d){
			return d[dim];
		});
		var group=dimension.group().reduceSum(function(d) {
			return d[mes];
		});
		
		var group1=dimension.group().reduceSum(function(d) {
			return d["revenue2"];
		});
		
		var group2=dimension.group().reduceSum(function(d) {
			return d["marketdata"];
		});
		var compositeChart = dc.compositeChart(container);
		compositeChart.height(300 || _height)
				//.width(options.width || _width)
				.margins({top : 20,
					left : 60,
					right : 60,
					bottom : 40})
				.x(d3.scale.ordinal().domain(range))
				.xUnits(dc.units.ordinal)
				.xAxisLabel("Fiscal Year")
				.yAxisLabel("Market Data")
				.rightYAxisLabel("Revenue")
				.renderHorizontalGridLines(true)
				.elasticY(true)
				.elasticX(true)
				.xAxisPadding(range.length*10)
				.legend(dc.legend().x(80).y(0).itemHeight(13).gap(5))
				.yAxis().tickFormat(function(v) {
					return "$"+(v/1000000000) +" B";
				});
		compositeChart.rightYAxis().tickFormat(function(v) {
			
			return "$"+(v/1000000) +" M";
		});
		compositeChart.compose([
	                dc.barChart(compositeChart)
	                  .colors("brown")
					  .dimension(dimension)
					  .group(group2,"Market Data")
					  .gap(500/range.length || 1),
					  dc.barChart(compositeChart)
	                  .colors("blue")
					  .dimension(dimension)
					  .group(group,"Published")
					  .gap(500/range.length || 1)
					  .useRightYAxis(true),
					 

				]).renderlet(function (chart) {
					chart.selectAll("g._0").attr("transform", "translate(-14 , 0)");
					chart.selectAll("g._1").attr("transform", "translate(16 , 0)");
				});
		compositeChart.render();
	};
	
	
	this.compareDimensions=function(container,crossfilterObj,options){
		$(container).empty();
		
		var dim="fiscalYear";
		var mes="revenue";
		var range=vdvcInputs.getDimensionInputs(Model,dim);
		var dimension=crossfilterObj.dimension(function(d){
			return d[dim];
		});
		var group=dimension.group().reduceSum(function(d) {
			return d[mes];
		});
		
		var group1=dimension.group().reduceSum(function(d) {
			return d["revenue2"];
		});
		
		var group2=dimension.group().reduceSum(function(d) {
			return d["marketdata"];
		});
		var compositeChart = dc.compositeChart(container);
		compositeChart.height(300 || _height)
				//.width(options.width || _width)
				.margins({top : 20,
					left : 60,
					right : 60,
					bottom : 40})
				.x(d3.scale.ordinal().domain(range))
				.xUnits(dc.units.ordinal)
				.xAxisLabel("Fiscal Year")
				.yAxisLabel("Revenue")
				.rightYAxisLabel("Market Data")
				.renderHorizontalGridLines(true)
				.elasticY(true)
				.elasticX(true)
				.xAxisPadding(range.length*10)
				.legend(dc.legend().x(80).y(0).itemHeight(13).gap(5))
				.yAxis().tickFormat(function(v) {
					return "$"+(v/1000000) +" M";
				});
		compositeChart.rightYAxis().tickFormat(function(v) {
			return "$"+(v/1000000000) +" B";
		});
		compositeChart.compose([
	                dc.barChart(compositeChart)
	                  .colors("blue")
					  .dimension(dimension)
					  .group(group,"Published")
					  .gap(500/range.length || 1),
	                dc.barChart(compositeChart)
	                  .colors("brown")
					  .dimension(dimension)
					  .group(group1,"Received")
					  .gap(500/range.length || 1),
					dc.lineChart(compositeChart)
		              .group(group2, "Market Data")
                      .colors("orange")
                      .dotRadius(10)
                      .useRightYAxis(true)

				]).renderlet(function (chart) {
					chart.selectAll("g._0").attr("transform", "translate(-14 , 0)");
					chart.selectAll("g._1").attr("transform", "translate(16 , 0)");
					chart.selectAll("g._2").attr("transform", "translate(55 , 0)");
				});
		compositeChart.render();
	};
	
	this.getChart=function(container,crossfilterObj,config,records,Model){
	
	var options={};
		var chartType=config.chartType;
		switch(chartType){
		case "Barchart":
			options.width=config.width;
			options.height=config.height;
			options.dimension=config.dimension.name;
			options.measure=config.measure.name;
			options.xaxisLabel=config.dimension.label;
			options.yaxisLabel=config.measure.label;
			vdvcBarchart(container,crossfilterObj,options,Model);
			
			break;
		case "Rowchart":
			options.width=config.width;
			options.height=config.height;
			options.dimension=config.dimension.name;
			options.measure=config.measure.name;
			
			vdvcRowchart(container,crossfilterObj,options);
			break;
		case "dataTable":
			options.width=config.width;
			options.height=config.height;
			options.dimension=config.dimension.name;
			options.measure=null;
			options.size=config.noofRows;
			options.columnToDisplay=config.columnToDisplay;
			options.columnLabels=config.columnLabels;
			var $table=$("<table>");
			var $thead=$("<thead>");
			var $row = $("<tr>");
			$table.addClass("excelView table table-hover table-condensed table-bordered table-striped");
			$table.append($thead);
			$thead.append($row);
			for(var a=0;a<config.columnLabels.length;a++){
			
				var $th=$("<th>");
				$th.text(config.columnLabels[a]);
				$row.append($th);
			}
			$(container).empty();
			$(container).append($table);
			$(container).height(config.height);
			$(container).css("overflow","scroll");
			vdvcDataTable(".table",crossfilterObj,options,records);
			break;
		case "Piechart":
			options.width=config.width;
			options.height=config.height;
			options.dimension=config.dimension.name;
			options.measure=config.measure.name;
			
			//vdvcRowchart(container,crossfilterObj,options);
			vdvcPiechart(container,crossfilterObj,options);
			break;
		case "Piechart1":
			options.width=config.width;
			options.height=config.height;
			options.dimension=config.dimension.name;
			options.measure=config.measure.name;
			
			//vdvcRowchart(container,crossfilterObj,options);
			vdvcPiechart1(container,crossfilterObj,options);
			break;
		case "Linechart":
			options.width=config.width;
			options.height=config.height;
			options.dimension=config.dimension.name;
			options.measure=config.measure.name;
			options.xaxisLabel=config.dimension.label;
			options.yaxisLabel=config.measure.label;
			
			
			vdvcLinechart(container,crossfilterObj,options);
			break;
		}
		
	};
	
	
	return this;
})();