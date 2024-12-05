var CompositeChartControl = ChartControl.extend({
	constructor : function (options) {

		this.blockDef=null;
		
		ChartControl.apply(this,arguments);
		
		this.showMsrlbls = false;
		
		this.measures = [];
		this.groups = {};
		this.columns = [];
		this.instance = null;
		this.isFilterable = true;
		this.filterControlId = null;
		this.currentGrp = null;
		this.xAxisDims = [];
		this.xs = {};
		this.Xaxis = null;
		this.colours =  ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
		this.defaultConfig = {
			    "bindto": "",
			    "padding": {
			        "top": 0,
			        "right": 80,
			        "bottom": 10,
			        "left": 80,
			    },
			    "size": {
				       "height": 200,
				       "width": 200
				    },
			    "data": {
			    	"x": "x",
		            "columns" : [["x","a","b",3,4,5],["y",0,0,0,0,0]]
		        },
		        /*"subchart": {
		            "show": true,
		            "size": {
		                "height": 20
		              }
		        },*/
		        "axis": {
		       	 "x": {
		       		"label": {
		                "text": "X-axis",
		                "position": 'outer-center'
		            },
		             "type": 'category',
		             "tick": {
		                // "count": 1,
		            	 "culling": {
		                     //"max": 5
		                 },
		                 "fit": true
		             }
		            },
		            "y": {
		            	"label": {
		                    "text": "Y-axis",
		                    "position": 'outer-center'
		                },
		                "tick": {
		                  //  format: d3.format("$,")
		                },
		               /* "padding": {
		                	 "top": 0,
			                 "bottom": 0
		                }*/
		            },
		            "y2": {
		                "show": false,
		                "label": {
		                    "text": "Y2-axis",
		                    "position": 'outer-center'
		                },
		                "tick": {
		                  //  format: d3.format("$,"),
		                },
		                "padding": {
		                	 "top": 0,
			                 "bottom": 0
		                }
		            }

		       },
		        "legend": {

		        },
		        "grid": [],
		        "tooltip": {
		            "grouped": false
		        },
		        "color": {
		            "pattern": ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
		        },
		        "zoom": {
		            "enabled": true,
		            "rescale": true
		        }
			};
	},

	setDesignerData : function(data){
		this.designerData= data;
	},

	getDesignerData : function(){
		return this.designerData;
	},
	
	setInstance : function (chart) {
		this.instance = chart;
	},

	getInstance : function () {
		return this.instance;
	},

	resetConfig : function () {
		var c = this;
		c.defaultConfig = {
			    "bindto": "",
			    "padding": {
			        "top": 10,
			        "right": 80,
			        "bottom": 10,
			        "left": 80,
			    },
			    "size": {
				       "height": 200,
				       "width": 200
				    },
			    "data": {
			    	"x": "x",
		            "columns" : [["x","a","b",3,4,5],["y",0,0,0,0,0]]
		           // "type": "bar"
		        },
		       /* "subchart": {
		            "show": true,
		            "size": {
		                "height": 20
		              }
		        },*/
		        "axis": {
		       	 "x": {
		       		"label": {
		                "text": "X-axis",
		                "position": 'outer-center'
		            },
		             "type": 'category',
		             "tick": {
		                // "count": 1,
		            	 "culling": {
		                    // "max": 5
		                 },
		                 "fit": true
		             }
		            },
		            "y": {
		            	"label": {
		                    "text": "Y-axis",
		                    "position": 'outer-center'
		                },
		                "tick": {
		                  //  format: d3.format("$,")
		                },
		               /* "padding": {
		                	 "top": 0,
			                 "bottom": 0
		                }*/
		            },
		            "y2": {
		                "show": false,
		                "label": {
		                    "text": "Y2-axis",
		                    "position": 'outer-center'
		                },
		                "tick": {
		                  //  format: d3.format("$,")
		                },
		                "padding": {
		                	 "top": 0,
			                 "bottom": 0
		                }
		            }

		       },
		        "legend": {

		        },
		        "grid": [],
		        "tooltip": {
		            "grouped": false
		        },
		        "zoom": {
		            "enabled": true,
		            "rescale": true
		        }
			};
	},

	restructureData: function (data) {
		var obj = {};

		obj.chart = data.chart;
		obj.measure = data.measure;
		obj.showMeasureLabels = data.showMeasureLabels;
		obj.chartType = data.chartType;
		obj.stackDimension = data.stackDimension;
		obj.clusterDimension = data.clusterDimension;

		if (data.xAxis != "NONE") {
			obj.xAxis = {};
			obj.xAxis.dimension = data.xAxis;
			obj.xAxis.label = data.xAxisLabel;
			obj.xAxis.format = data.xAxisFormat;
			obj.xAxis.minScale = data.xAxisMinScale;
			obj.xAxis.maxScale = data.xAxisMaxScale;
			obj.xAxis.stepScale = data.xAxisStepScale;
		}

		if (data.yAxisType != "NONE") {
			obj.yAxis = {};
			obj.yAxis.type = data.yAxisType;
			obj.yAxis.dimension = data.yAxis;
			obj.yAxis.label = data.yAxisLabel;
			obj.yAxis.format = data.yAxisFormat;
			obj.yAxis.minScale = data.yAxisMinScale;
			obj.yAxis.maxScale = data.yAxisMaxScale;
			obj.yAxis.stepScale = data.yAxisStepScale;
		}

		return obj;
	},

	readDesignDataProperties: function () {
	 	var properties = $(".designDataUserInputs");
		var designData={};

		if (properties.length == 0)
			return;

		if (properties.length > 0) {
		 	$.each(properties,function(i,v){
		 	 	if ($(v).attr("typeattr") == "boolean") {
		 	 		designData[$(v).attr("dataattr")] = $(v).prop('checked');
		 		} else {
		 			designData[$(v).attr("dataattr")] = $(v).val();
		 		}
			});
		}
		var object = this.restructureData(designData);
		return object;
	},

	saveDesignerData: function () {
		var mode= this.mode;
		console.log ("Saving the composite control designer data ...!!");
		var data = {};

		if (!this.addMeasureData(false)){
			return false;
		}

		if (!this.measures.length){
			console.log ("No measures to save ...!!");
		}

		data.Measures = this.measures;

		this.setCustomDesignerData(data);
		var scrn = this.getScreen();
		if ( mode === "design") {
			scrn.setState(scrn.getVappStates().UnderProcess);
		}
		console.log ("Composite Control JSON: "+JSON.stringify(data));
		this.render();

		return true;
	},

	isMeasurePresent: function (obj){
		if (this.measures && this.measures.length > 0) {
			for (var i=0; i<this.measures.length; i++){
				if (this.measures[i].measure == obj.measure){
					return true;
				}
			}
		}
		return false;
	},

	getMeasureIndex: function (obj) {
		var index = -1;
		if (this.measures && this.measures.length > 0) {
			for (var i=0; i<this.measures.length; i++){
				if (this.measures[i].measure == obj.measure){
					index = i;
					break;
				}
			}
		}
		

		return index;
	},

	validDesignDataProperties: function (data) {
		console.log ("Validation the chart propetires");
		var obj = {};

		obj.status = true;
		obj.msg = null;

		if (!data) {
			obj.msg = "Invalid designer data ..!!";
			obj.status = false;
			return obj;
		}

		if (!data.measure || data.measure == "NONE") {
			obj.msg = "Please select valid measure";
			obj.status = false;
			return obj;
		}

		if (!data.chart || data.chart == "NONE") {
			obj.msg = "Please select valid chart type";
			obj.status = false;
			return obj;
		}

		if (!data.xAxis || data.xAxis.dimension == "NONE") {
			obj.msg = "Please select valid XAxis";
			obj.status = false;
			return obj;
		}

		if (!data.yAxis || data.yAxis.type == "NONE") {
			obj.msg = "Please select valid Y Axis Type";
			obj.status = false;
			return obj;
		}

		return obj;
	},

	addMeasureData: function (warn) {
		console.log ("Adding the measure to local designer data ...!!");

		var div =  $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='measure']");
		var curMeasure = div.val();
		if (warn && curMeasure == "NONE") {
			Util.showMessage ("Please select a valid Measure");
			return false;
		}

		var data = this.readDesignDataProperties();
		var validObj = this.validDesignDataProperties(data);
		if (!validObj.status) {
			Util.showMessage (validObj.msg);
			return false;
		}

		if (!this.isMeasurePresent(data)) {
			this.measures.push(data);
			if (warn)
				Util.showMessage ("Meausre :"+data.measure+ " added successfully");
		} else {
			var index = this.getMeasureIndex(data);
			this.measures[index] = data;
			if (warn)
				Util.showMessage ("Meausre :"+data.measure+ " updated successfully");
		}

		return true;
	},

	removeMeasureData: function() {
		var measure =  $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='measure']").val();

		console.log ("Removing the measure: "+measure);

		if (measure == "NONE") {
			Util.showMessage ("Please select a measure to remove");
			return;
		}
		var c = this;
		var mObj = this.getMeasureData (this.measures, measure);
		if (!mObj) {
			Util.showMessage ("Measure ("+measure+") is not available in saved data to remove ..!!");
			return;
		} else {
			Util.promptDialog ("Do you really want to delete the measure: "+ measure + " ?",
					function(){
						var index = c.getMeasureIndex(mObj);
						c.measures.splice (index, 1);
						$('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='chart']").val(0);
						$('div[ui-role="cmpstchartCnfg"]').find(".dynamicMeasure").remove();
						Util.showMessage ("Measure: "+ measure + " deleted sucessfully ...!!");
						return;
					},
					function () {
						console.log ("No button was selected by user in deleting the measure ...!!");
					},
					null);
		}
	},

	promptUserForCompoisteChartConfig : function (message, title) {
		var c = this;
		var cofigUi = $('<div ui-role="cmpstchartCnfg" ></div>');
		var isExist = $('body').find('div[ui-role="cmpstchartCnfg"]');

		if (isExist.length == 0) {
			$(cofigUi).dialog({
				width :  400,
				height : 400,
				title : title,
				dialogClass : "cmpstchartCnfg",
				close : function () {
					$(this).dialog("destroy");
				},
				open : function (event,ui) {
					$(".cmpstchartCnfg").css("background","rgba(255, 255, 255, 0.901961)");
					 $(this).empty();
			    	  $(this).append(message);
				},
				buttons : {
					"Save" : function(event) {
						if (c.saveDesignerData ())
							$(this).dialog("close");
					},
					"Remove" : function(event) {
						c.removeMeasureData ();
					},
					"Apply" : function(event) {
						c.addMeasureData (true);
					},
					"Cancel" : function(event) {
						$(this).dialog("close");
					}
				}
			});
		}
	},

	addHtmlMeasure: function (customData) {
		var modelBlocks=this.getScreen().model.blocks;
		var markup = '<tr> <td>';
		markup += "Measure";
		markup += '</td>';
		markup += '<td>';
		var val=null;

		var txt = '<select class="designDataUserInputs" dataAttr="measure" typeAttr="string">';
		var none = "NONE";
		txt += '<option value='+none+'>'+none+'</option>';

		for (var l=0; l<modelBlocks.length; l++){
			var blk = modelBlocks[l];
			for (var m=0; blk.measures && m<blk.measures.length; m++){
				var opt = blk.name+"."+blk.measures[m].name;
				if (opt == val)
					txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
				else
					txt += '<option value='+opt+'>'+opt+'</option>';
			}
		}
		txt += '</select>';
		markup += txt;
		markup += '</td> </tr>';
		return markup;

	},

	addHtmlMeasureLabel : function (customData){
		var markup = '<tr> <td>';
		markup += "Show Measure Labels";
		markup += '</td>';
		markup += '<td>';
	 	 	
		markup += '<input type="checkbox"  class="designDataUserInputs" dataAttr="showMeasureLabels" typeAttr="boolean">';
		markup += '</td> </tr>';
		return markup;
	},
	
	addHtmlChartType: function (customData){
		var vappgenControls=this.getScreen().vappgen.completeControls;
		var markup = '<tr> <td>';
		markup += "Chart Type";
		markup += '</td>';
		markup += '<td>';
		var val=null;

		var txt = '<select class="designDataUserInputs" dataAttr="chart" typeAttr="string">';
		var none = "NONE";
		txt += '<option value='+none+'>'+none+'</option>';

		for (var l=0; l<vappgenControls.length; l++){
			var ctrl = vappgenControls[l];

			if (ctrl.subControl && (ctrl.subControlGroupList.indexOf("AxisCharts") != -1)) {
				var opt = ctrl.name;
				if (opt == val)
					txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
				else
					txt += '<option value='+opt+'>'+opt+'</option>';
			}
		}
		txt += '</select>';
		markup += txt;
		markup += '</td> </tr>';
		return markup;

	},

	getDesignerDataValue: function (obj, measure, attr) {
		var val = null;

		if (obj.measure == measure) {
			switch (attr){
			case "xAxis":
				val = (obj.xAxis ? obj.xAxis.dimension : null);
				break;
			case "xAxisLabel":
				val = (obj.xAxis ? obj.xAxis.label : null);
				break;
			case "xAxisFormat":
				val = (obj.xAxis ? obj.xAxis.format : null);
				break;
			case "xAxisMinScale":
				val = (obj.xAxis ? obj.xAxis.minScale : null);
				break;
			case "xAxisMaxScale":
				val = (obj.xAxis ? obj.xAxis.maxScale : null);
				break;
			case "xAxisStepScale":
				val = (obj.xAxis ? obj.xAxis.stepScale : null);
				break;
			case "yAxisType":
				val = (obj.yAxis ? obj.yAxis.type : null);
				break;
			case "yAxisLabel":
				val = (obj.yAxis  ? obj.yAxis.label : null);
				break;
			case "yAxisFormat":
				val = (obj.yAxis  ? obj.yAxis.format : null);
				break;
			case "yAxisMinScale":
				val = (obj.yAxis  ? obj.yAxis.minScale : null);
				break;
			case "yAxisMaxScale":
				val = (obj.yAxis  ? obj.yAxis.maxScale : null);
				break;
			case "yAxisStepScale":
				val = (obj.yAxis  ? obj.yAxis.stepScale : null);
				break;
			case "chart":
				val = obj.chart;
				break;
			case "measure":
				val = obj.measure;
				break;
			case "chartType":
				val = obj.chartType;
				break;
			case "stackDimension":
				val = obj.stackDimension;
				break;
			case "clusterDimension":
				val = obj.clusterDimension;
				break;
			}
		}

		return val;
	},

	listChartAttributes: function (measureName, control, data){
		if (!control) {
			console.log ("Failed to list the control props:"+control);
			return;
		}

		console.log ("List chart attributes: "+control.name);
		var markup = '<table border="1" style="width:100%" class="dynamicMeasure">';

		for (var i=0; control.attributes && i<control.attributes.length; i++) {
			var p = control.attributes[i];
			var attrName = (p.caption ? p.caption : p.name);
			var val = (data ? this.getDesignerDataValue (data, measureName, p.name) : null);

			markup += '<tr> <td>';
			markup += attrName;
			markup += '</td>';
			markup += '<td>';

			if (p.type == "DimensionMeasure") {
				var modelBlocks = this.getScreen().model.blocks;
			 	var txt = '<select class="designDataMeasureProps designDataUserInputs" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
			 	var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';
				for (var j=0; j<modelBlocks.length; j++){
					var blk = modelBlocks[j];
					for (var k=0; blk.dimensions && k<blk.dimensions.length; k++){
						var opt = blk.name+"."+blk.dimensions[k].name;
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
					for (var l=0; blk.measures && l<blk.measures.length; l++){
						var opt = blk.name+"."+blk.measures[l].name;
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
				}
				txt += '</select>';
				markup += txt;
			} else if(p.type == "boolean") {
			 	if (val == true || val == "true")
					markup += '<input type="checkbox" class="designDataMeasureProps designDataUserInputs" dataAttr="'+p.name +'" checked dataType="'+p.type+'">';
				else
		 			markup += '<input type="checkbox" class="designDataMeasureProps designDataUserInputs" dataAttr="'+p.name +'" dataType="'+p.type+'">';
			} else if (p.type == "StaticValues"){
				var txt = '<select class="designDataMeasureProps designDataUserInputs" dataAttr="'+p.name+'">';

				var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';

				for (var k=0; k<p.possibleValues.length; k++){
					var opt = p.possibleValues[k];
					if (opt == val)
						txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
					else
						txt += '<option value='+opt+'>'+opt+'</option>';
				}
				txt += '</select>';
				markup += txt;
			} else if (p.type == "Measure") {
				var modelBlocks = this.getScreen().model.blocks;
				var txt = '<select class="designDataMeasureProps designDataUserInputs" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
				var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';

				for (var l=0; l<modelBlocks.length; l++){
					var blk = modelBlocks[l];
					for (var m=0; blk.measures && m<blk.measures.length; m++){
						var opt = blk.name+"."+blk.measures[m].name;
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
				}
				txt += '</select>';
				markup += txt;
			} else if (p.type == "Dimension") {
				var modelBlocks = this.getScreen().model.blocks;
				var txt = '<select class="designDataMeasureProps designDataUserInputs" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
				var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';

				for (var l=0; l<modelBlocks.length; l++){
					var blk = modelBlocks[l];
					for (var m=0; blk.dimensions && m<blk.dimensions.length; m++){
						var opt = blk.name+"."+blk.dimensions[m].name;
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
				}
				txt += '</select>';
				markup += txt;
			} else {
				if(!p.editable){
					markup += '<input type="text" class="designDataMeasureProps designDataUserInputs" dataAttr="'+p.name+'" style="width:100%" name="inp_value"   value="'+(val == undefined?"":val)+'" disabled>';
				}else{
					markup += '<input type="text" class="designDataMeasureProps designDataUserInputs" dataAttr="'+p.name+'" style="width:100%" name="inp_value"   value="'+(val == undefined?"":val)+'">';
				}
			}
			markup += '</td> </tr>';
		}

		markup += '</table>';

		var dialog = $('body').find('div[ui-role="cmpstchartCnfg"]');
		dialog.find(".dynamicMeasure").remove();
		dialog.append(markup);
		var c = this;

		$( document ).off("change","select[dataattr='xAxis']").on("change","select[dataattr='xAxis']",function() {
			var element = $(this);
			var val = element.val();
			var xAxis =element.find('option[value="'+val+'"]').text();

			console.log ("XAxis value is: "+xAxis);

			// Reset both xAxis and stacked Dimension values
			var measure = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='measure']").val();
			var stackDimDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='stackDimension']");
			var clusterDimDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='clusterDimension']");
			var block = measure.substr(0, measure.indexOf('.'));
			c.filterXAxisDimensions (stackDimDiv, block, "NONE");
			c.filterXAxisDimensions (clusterDimDiv, block, "NONE");


			if (xAxis != "NONE") {
				stackDimDiv.find('option[value="'+xAxis+'"]').remove();
				clusterDimDiv.find('option[value="'+xAxis+'"]').remove();
			}

			return;
		});


		$( document ).off("change","select[dataattr='stackDimension']").on("change","select[dataattr='stackDimension']",function() {
		 	var element = $(this);
			var val = element.val();
			var stackDimVal =element.find('option[value="'+val+'"]').text();
			var clusterDimDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='clusterDimension']");
			var xAxisDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='xAxis']");
			var measure = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='measure']").val();
			var block = measure.substr(0, measure.indexOf('.'));

			if (xAxisDiv.val() == "NONE") {
				Util.showMessage ("Please select a valid X Axis Dimension value");
				return;
			}

			console.log ("Selected Stack Dimension value is: "+stackDimVal);
			if (stackDimVal == "NONE") {
				c.filterXAxisDimensions (clusterDimDiv, block, xAxisDiv.val());
				clusterDimDiv.find('option[value="'+xAxisDiv.val()+'"]').remove();

				c.filterXAxisDimensions (element, block, xAxisDiv.val());
				element.find('option[value="'+xAxisDiv.val()+'"]').remove();
				return;
			}

			var clusterDimVal = clusterDimDiv.val();
			c.filterXAxisDimensions (clusterDimDiv, block, xAxisDiv.val());
			clusterDimDiv.find('option[value="'+xAxisDiv.val()+'"]').remove();
			clusterDimDiv.find('option[value="'+stackDimVal+'"]').remove();
			clusterDimDiv.find('option[value="'+clusterDimVal+'"]').attr("selected", "selected");


		});

		$( document ).off("change","select[dataattr='clusterDimension']").on("change","select[dataattr='clusterDimension']",function() {
			  	var element = $(this);
				var val = element.val();
				var clusterDimVal =element.find('option[value="'+val+'"]').text();

				var stackDimDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='stackDimension']");
				var xAxisDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='xAxis']");
				var measure = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='measure']").val();
				var block = measure.substr(0, measure.indexOf('.'));

				if (xAxisDiv.val() == "NONE") {
					Util.showMessage ("Please select a valid X Axis Dimension value");
					return;
				}

				console.log ("Selected Cluster Dimension value is: "+clusterDimVal);
				if (clusterDimVal == "NONE") {
					c.filterXAxisDimensions (stackDimDiv, block, xAxisDiv.val());
					stackDimDiv.find('option[value="'+xAxisDiv.val()+'"]').remove();

					c.filterXAxisDimensions (element, block, xAxisDiv.val());
					element.find('option[value="'+xAxisDiv.val()+'"]').remove();
					return;
				}

				var stackDimVal = stackDimDiv.val();
				c.filterXAxisDimensions (stackDimDiv, block, xAxisDiv.val());
				stackDimDiv.find('option[value="'+xAxisDiv.val()+'"]').remove();
				stackDimDiv.find('option[value="'+clusterDimVal+'"]').remove();
				stackDimDiv.find('option[value="'+stackDimVal+'"]').attr("selected", "selected");

			});
	},

	getControlProps: function (chartName){
		var vappgenControls=this.getScreen().vappgen.completeControls;
		var ctrlProps = null;

		for (var i=0; i<vappgenControls.length; i++){
			if (vappgenControls[i].name == chartName) {
				ctrlProps = vappgenControls[i];
				break;
			}
		}

		return ctrlProps;
	},

	getMeasureData: function(data, measure) {
		console.log ("get measure data ...!!");
		var obj = null;

		for (var i=0; data && i<data.length; i++){
			if (data[i].measure == measure) {
				obj = data[i];
				break;
			}
		}

		if (!obj){
			console.log("No measure found in the data ....!!");
		}

		return obj;
	},

	resetMeasureValues: function () {
		var vals = $('div[ui-role="cmpstchartCnfg"]').find(".designDataMeasureProps");

		if (!vals.length)
			return;

		$.each(vals,function(i,v){
			if ($(v).is("input")) {
				$(v).val("");
			}
			if ($(v).is("select")) {
				$(v).val(0);
			}
		});
	},

	filterXAxisDimensions: function (div, blockName, val) {
		div.empty();
		div.append('<option value="NONE">NONE</option>');
		var modelBlocks = this.getScreen().model.blocks;

		for (var l=0; l<modelBlocks.length; l++){
			var blk = modelBlocks[l];
			if (blockName == "NONE" || blk.name == blockName) {
				for (var k=0; blk.dimensions && k<blk.dimensions.length; k++){
					var opt = blk.name+"."+blk.dimensions[k].name;
					if (opt == val)
						div.append('<option selected="selected" value='+opt+'>'+opt+'</option>');
					else
						div.append('<option value='+opt+'>'+opt+'</option>');
				}
			}
		}
	},

	launchConfig : function(customData) {

		$( document ).off("change","select[dataattr='measure']").on("change","select[dataattr='measure']",function() {
			var element = $(this);
			var val = element.val();
			var measureName =element.find('option[value="'+val+'"]').text();
			var chartDiv =  $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='chart']");
			var measureLabelDiv =  $('div[ui-role="cmpstchartCnfg"]').find("input[dataattr='showMeasureLabels']");
				 
			measureLabelDiv.prop('checked', false); // reset to false;
			if (measureName == "NONE" || !data) {
				chartDiv.val(0); // Set chart to "NONE"

				// Remove all the chart based prpoperties.
				 $('div[ui-role="cmpstchartCnfg"]').find(".dynamicMeasure").remove();
				return;
			}

			// Set chart from saved/custom data.
			if (data && data.length > 0) {
				var mObj = c.getMeasureData (data, measureName);
				if (mObj) {
					var chartName = mObj.chart;
					
					measureLabelDiv.prop('checked', mObj.showMeasureLabels);
		 			chartDiv.val(chartName);
					chartDiv.trigger("change");

				} else {
					chartDiv.val(0);

					// Remove all the chart based prpoperties.
					$('div[ui-role="cmpstchartCnfg"]').find(".dynamicMeasure").remove();
				}
			} else {
				chartDiv.trigger("change");
			}

		});

		$( document ).off("change","select[dataattr='chart']").on("change","select[dataattr='chart']",function() {
			var element = $(this);
			var val = element.val();

			var curMeasure =  $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='measure']").val();
			if (curMeasure == "NONE") {
				Util.showMessage ("Please select a valid Measure");
				return;
			}

			var chartName=element.find('option[value="'+val+'"]').text();
			if (chartName == "NONE") {
				// Remove all the chart based prpoperties.
				 $('div[ui-role="cmpstchartCnfg"]').find(".dynamicMeasure").remove();
				return;
			} else {
				var ctrl = c.getControlProps (chartName);
				var obj = c.getMeasureData (data, curMeasure);
				c.listChartAttributes (curMeasure, ctrl, obj);
			}

			var xAxisDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='xAxis']");
			var stackDimDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='stackDimension']");
			var clusterDimDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='clusterDimension']");
			if (xAxisDiv.length && stackDimDiv.length && clusterDimDiv.length) {
				var block = curMeasure.substr(0, curMeasure.indexOf('.'));
				c.filterXAxisDimensions (xAxisDiv, block, xAxisDiv.val());
				c.filterXAxisDimensions (stackDimDiv, block, stackDimDiv.val());
				c.filterXAxisDimensions (clusterDimDiv, block, clusterDimDiv.val());
				if (xAxisDiv.val() != "NONE") {
					stackDimDiv.find('option[value="'+xAxisDiv.val()+'"]').remove();
					clusterDimDiv.find('option[value="'+xAxisDiv.val()+'"]').remove();
				}
			}

			var yAxisTypeDiv = $('div[ui-role="cmpstchartCnfg"]').find("select[dataattr='yAxisType']");
			if (yAxisTypeDiv.length) {
			//	var val = yAxisTypeDiv.val();
				var val = "NONE";
				yAxisTypeDiv.find('option[value="'+val+'"]').remove();

			}
		});

		var c = this;
		var title = "Compoiste Chart Configuration";
		var data = null;
		c.measures = [];
 
		if (customData && customData.Measures) {
			c.measures = customData.Measures;
		}
		data = c.measures;

		var markup = '<table border="1" style="width:100%"> <tr>\
			  <th>Attribute Name</th>\
			  <th>Attribute Value</th>\
			  </tr>';

		markup += c.addHtmlMeasure(data);
		markup += c.addHtmlMeasureLabel(data);
		markup += c.addHtmlChartType(data);
		markup += '</table>';

		c.promptUserForCompoisteChartConfig (markup, title);

		if (data && data.length >0) {
			var defaultMeasure = data[0].measure;
			if (defaultMeasure) {
				$("select[dataattr='measure']").val(defaultMeasure);
				$("select[dataattr='measure']").trigger("change");
			}
		}

	},

	bindEvents : function () {
		var c = this;
		var el = c.renderContainer();
		el.addClass("vapp-control");
		var id=el.attr("id");
		var parent="#"+id;
		Control.prototype.addEvents.call(this ,parent);
		
		$(el).find(".ctrl-content .chart").off("mousedown").on("mousedown",function(e){
			e.stopPropagation();
		});
	},

	parseToData : function (id,xaxis,data) {

		var topData = data.top(Infinity);
		var parsedData = [];
		parsedData.push(id);
		$.each(xaxis,function(i,v){
			$.each(topData,function(indx,val){
				if(v === val.key){
					if(!isNaN(val.value)){
						parsedData.push(val.value);
					}else{
						parsedData.push(0);
					}
					return false;
				}else if(topData.length-1 == indx){
					parsedData.push(0);
				}
			});
		});
		return parsedData;
	},

	getData : function (data,blockName) {
		var array = [];
		$.each(data,function (i,v) {
			if (blockName === v["BlockName"]) {
				array = v["BlockData"];
				return false;
			}
		});
		return array;
	},




	getChartType : function (type) {
		var chart = "line";
		switch (type) {
		case "ColumnChart" :
			chart = "bar";
			break;
		case "LineChart" :
			chart = "line";
			break;
		case "AreaChart" :
			chart = "area";
			break;
		}
		return chart;
	},

	setYaxisNCahrtType : function(yAxisType,chart,obj) {
		var c =  this;
		var config = c.defaultConfig;
		if ( obj.ids && obj.ids.length > 0 ) {
			$.each(obj.ids,function(i,v){
				config.data.types[v] = chart;
			//	config.data.colors[v] = c.colours[i];
				switch(yAxisType) {
				case "Primary":
					config.data.axes[v] = "y";
					break;
				case "Secondary":
					config.data.axes[v] = "y2";
					break;
				}
			});
		}
	},

	
	isDimValFiltered : function(key,val) {
		
		var c = this,status = true;
		if (c.appliedFilters && c.appliedFilters.DimensionFilters) {
			var dimFltrs =c.appliedFilters.DimensionFilters;
			$.each(dimFltrs,function(i,v){
				if (key == v.filterKye) {
					status = (_.contains(v.values,val));
					return false; 
				}
				
			});
		}
		return status;
	},
	
	
	isMsrFiltered : function(msr) {
		var c = this,status = false;
		if (c.appliedFilters && c.appliedFilters.MeasureFilters ) {
			status = !_.contains(c.appliedFilters.MeasureFilters,msr);
		}
		return status;
	},
	
	getChartConfig : function () {
	
		var c =  this;
		var configData = c.getCustomDesignerData();
		if (configData && configData["appliedFilters"]) {
			c.appliedFilters = configData["appliedFilters"];
		}
		c.Xaxis = c.getXAxis();
		var config = c.defaultConfig;
		config.data.colors = {};
		c.getYAxis();

		if (c.mode !== "compare") {
			config.data.axes={};
			config.data.types = {};
			config.data.groups=[];
		}
		if ( c.Xaxis.length > 0 ) {
			//config.axis.x.categories=c.Xaxis;

			var x = ["x"];
			x = x.concat(c.Xaxis);
			c.columns.push(x);
		}


		if (configData && configData.Measures && configData.Measures.length > 0 ) {
			$.each(configData.Measures,function (i,obj) {
				
				c.showMsrlbls = obj["showMeasureLabels"]; 
				
				var mes = obj["measure"];
				if(!c.isMsrFiltered(mes)) {
					var chart = c.getChartType(obj["chart"]);
					var stack = obj["stackDimension"];
					var cluster = obj["clusterDimension"];
					var dim = obj["xAxis"]["dimension"];
					var yAxisType = obj["yAxis"]["type"];
					c.applyFilters();
					if (stack !== "NONE" && cluster !== "NONE") {
						var obj = c.getTriDimData(dim,cluster,stack,mes,c.Xaxis);
						c.columns = c.columns.concat(obj["data"]);
						c.setYaxisNCahrtType(yAxisType,chart,obj);
						if(obj.groups.length > 0) {
							$.each(obj.groups,function(i,v) {
								config.data.groups.push(v);
							});
						}
					} else if ( stack !== "NONE" ) {
						var obj = c.getBiDimData(dim,stack,mes,c.Xaxis);
						config.data.groups.push(obj.ids);
						c.columns = c.columns.concat(obj["data"]);
						c.setYaxisNCahrtType(yAxisType,chart,obj);

					} else if (cluster !== "NONE"  ) {
						var obj = c.getBiDimData(dim,cluster,mes,c.Xaxis);
						c.columns = c.columns.concat(obj["data"]);
						c.setYaxisNCahrtType(yAxisType,chart,obj);
					} else {
						var dataId = mes;
						if (c.currentGrp) {
							dataId = c.currentGrp+"."+dataId;
						}
						
						var msrLbl = c.getMeasureLabel(mes);
						if (msrLbl && c.showMsrlbls)  {
							dataId = msrLbl;
							if(c.currentGrp) {
								dataId = c.currentGrp+"."+dataId;
							}
						}
						var group = c.groupData(dim,mes);
						var groupdata=c.parseToData(dataId,c.Xaxis,group);
						c.columns.push(groupdata);
						var id = groupdata[0];
						config.data.types[id] = chart;
						if (yAxisType == "Primary") {
							config.data.axes[id] = "y";
						}
						if (yAxisType == "Secondary") {
							config.data.axes[id] = "y2";
						}
					}
					c.disposeDimensions();
				}	
			});
		}
		console.log(config.data.colors);
		return config;
	},

	setScale : function(axis,config) {

		var max = parseFloat(config.maxScale);
		var min = parseFloat(config.minScale);
		var step = parseFloat(config.stepScale);

		if (max && !isNaN(max)) {
			axis.max = max;
		}
		if (min && !isNaN(min) ) {
			axis.min =min;
		}
	},

	getYAxis : function () {

		var c = this;
		var yAxis = [];
		var config = c.defaultConfig;
		var configData = c.getCustomDesignerData();
		if (configData && configData.Measures && configData.Measures.length > 0 ) {
			$.each(configData.Measures,function (i,obj) {
				yAxis.push(obj["yAxis"]);
			});
		}
		if ( yAxis.length > 0){
			$.each(yAxis, function (i,v){
				if ( v.type == "Primary") {
					config.axis.y.label.text = v["label"];
					c.setScale(config.axis.y,v);
				}
				if (v.type == "Secondary") {
					config.axis.y2.show = true;
					config.axis.y2.label.text = v["label"];
					c.setScale(config.axis.y2,v);
				}

			});

		}
	},

	
	getXaxisTypeAndValues : function(dataSet,blkName,dim) {
		
		var c = this, 
			blkDef = c.blockDef,
			axisObj = {};
		axisObj.axisVals = [];
	//	var d = c.getWrkSpaceDimValuesByPermissions(blkName,dim); //c.getDimensionInputs(dataSet,dim);
		var dimName = c.getDimNameFromBlockDim(dim);
		if (blkDef) {
			$.each(blkDef,function(i,obj){
				if(obj && obj.name == blkName) {
					var dims = obj["dimensions"];
					if ($.isArray(dims)) {
						$.each(dims,function(j,dimObj){
							if(dimName == dimObj.name && dimObj.values ){
								axisObj.type = dimObj.dataType;
								var d = c.getWrkSpaceDimValuesByPermissions(blkName,dimObj);
								$.each(d.values,function(k,v){
									if(c.isDimValFiltered(dim,v)) {
										axisObj.axisVals.push(v);
									}
								});
								return false;
							}
						});
					}
				}
			});
		}
		
		return axisObj;
	},
	
	getXAxis : function () {
		
		var c = this,
			attr = c.attributes,
			el = c.renderContainer(),
			width = $(el).width()-160;
		c.xAxisDims = [];
		var xAxis = [];
		var range = [];
		var config = c.defaultConfig;
		var configData = c.getCustomDesignerData();
		if (configData && configData.Measures && configData.Measures.length > 0 ) {
			$.each(configData.Measures,function (i,obj) {
				xAxis.push(obj["xAxis"]);
			});
		}
		if ( xAxis.length > 0){
			//config.axis.x.tick.count = (width)/100 || xAxis.length;
			var max = (width)/100 || xAxis.length;
			//config.axis.x.extent = [0, max];
			$.each(xAxis, function (i,v){
				if ( i == 0 && v["label"] && v["label"].trim() !== "") {
					config.axis.x.label.text = v["label"];
				}
				c.xAxisDims.push(v["dimension"]);
				var newAxis = c.xs[v["dimension"]];
				if (newAxis && newAxis.length > 0 ) {
					range = c.xs[v["dimension"]];
				} else {
					
					var blockName = c.getBlockNameFromDim(v["dimension"]);
					var dataSet = c.getDataSet(blockName);
					var axisObj = c.getXaxisTypeAndValues(dataSet,blockName,v["dimension"]);
					if (axisObj.type == "Date") {
						config.axis.x.type = "timeseries";
						config.axis.x.tick.format = '%Y-%m-%d';
						config.data.xFormat = '%Y-%m-%d';
					}
					if (axisObj.type == "Number") {
						config.axis.x.type = "indexed";
					}
					if (axisObj.type == "Text") {
						config.axis.x.type = "category";
					}
					range = range.concat(axisObj.axisVals);
				}
			});
			range = _.uniq(range);
		}
		return range;
	},



	groupData : function (dim,mes) {
		var c = this;
		var dimension = c.createDimensions(dim,true);
		var group=dimension.group().reduceSum(function(d) {
			if(typeof d[mes] !== "undefined" && d[mes] !== null && typeof d[mes] !== "undefined" && d[mes] !== "#VALUE!"){
				return d[mes];
			}else{
				return 0;
			}

		});
		dimension.dispose();
		c.groups[dim+mes] = group;
		return group;
	},

	createCompositeDim : function (dims,blockName) {
		var c = this;
		var XfilterObj = c.getXfilterObj(blockName);
		var dimension = XfilterObj.dimension(function(d){
			if (dims && dims.length > 0) {
				var compositeKey = '';
				$.each(dims, function (i,v) {
					if(typeof v !== "undefined" && typeof d[v] !== "undefined" ){
						if (i !== dims.length-1){
							compositeKey += d[v]+"/";
						}else {
							compositeKey += d[v];
						}
					}
				});
				return compositeKey;
				c.dimensions[dim] = dimension;
			}
		});
		return dimension;
	},

	getCompositeDimData : function (compositeDim,mes,range) {
		var data = compositeDim.group().reduceSum(function(d) {
			if(typeof d[mes] !== "undefined" && d[mes] !== null && d[mes] !== "#VALUE!"){
				return d[mes];
			}else{
				return 0;
			}
		}).all();

		if (data && data.length > 0) {
			$.each(data , function (i,rec) {
				var compKey = rec["key"];
				var k = compKey.split("/");
				var prim = k[0];
				k.shift();
				var key = k.join("->");
				var topData = data.top(Infinity);
				var parsedData = [];
				parsedData.push(id);
				$.each(xaxis,function(i,v){
					$.each(topData,function(key,val){
						if(v === val.key){
							if(!isNaN(val.value)){
								parsedData.push(val.value);
							}else{
								parsedData.push(0);
							}

							return false;
						}
					});
				});
				return parsedData;
			});
		}
	},

	getMeasureLabel : function(mes) {
		
		var c = this;
		var blockName = c.getBlockNameFromDim(mes);
		if (!$.isEmptyObject(c.dataSets) && c.dataSets[blockName] && c.dataSets[blockName].length > 0) {
			return c.dataSets[blockName][0][mes+".Label"];
		}
		return null;
	},
	
	
	getTriDimData : function (dim1,dim2,dim3,mes,range) {
		var c = this,
			sums = [],
			stackIds = [],
			clusterGrp = [],
			chartData = [];

		var blockName = c.getBlockNameFromDim(dim1);
		var dimension = c.createDimensions(dim1,true);
		var clusterDim =  c.createDimensions(dim2);
		var stackDim =  c.createDimensions(dim3);

		
		
		clusterDim.group().all().forEach(function(val){
			var grp = [];
			stackDim.group().all().forEach(function(v) {
				
				var id = blockName+"."+val.key+"."+v.key+"("+mes+")";
				if(c.currentGrp) {
					id = c.currentGrp+"."+id;
				}
				
				var msrLbl = c.getMeasureLabel(mes);
				if (msrLbl && c.showMsrlbls)  {
					id = blockName+"."+val.key+"."+v.key+"("+msrLbl+")";
					if(c.currentGrp) {
						id = c.currentGrp+"."+id;
					}
				}
				
				stackIds.push(id);
				grp.push(id);
				sums.push(dimension.group().reduceSum(function(d){

					if(d[dim3]==v.key && d[dim2] == val.key){

						if(typeof d[mes] !== "undefined" && d[mes] !== null  && d[mes] !== "#VALUE!"){
							return d[mes];
						}else{
							return 0;
						}
					}else{
						return 0;
					}

				})
	            );
			});
			clusterGrp.push(grp);
		});

		for (var i=0;i<sums.length;i++) {
			var data = c.parseToData(stackIds[i],range,sums[i]);
			chartData.push(data);
			//c.columns.push(chartData);
		}
		dimension.dispose();
		return {"ids": stackIds , "data":chartData,"groups":clusterGrp};
	},

	getBiDimData : function (dim1,dim2,mes,range) {
		var c = this,
			sums = [],
			stackIds = [],
			chartData = [];
		var blockName = c.getBlockNameFromDim(dim2);
		var dimension = c.createDimensions(dim1,true);
		var stackDim =c.createDimensions(dim2);
		

		stackDim.group().all().forEach(function(val){
			
			var id = blockName+"."+val.key+"("+mes+")";
			
			if(c.currentGrp) {
				id = c.currentGrp+"."+id;
			}
			
			var msrLbl = c.getMeasureLabel(mes);
			if (msrLbl && c.showMsrlbls)  {
				id = blockName+"."+val.key+"("+msrLbl+")";
				if(c.currentGrp) {
					id = c.currentGrp+"."+id;
				}
			}
			
			stackIds.push(id);
			
			sums.push(dimension.group().reduceSum(function(d){
				if(d[dim2]==val.key && d[dim2] != "*"){
					if(typeof d[mes] !== "undefined" && d[mes] !== null  && d[mes] !== "#VALUE!"){
						return d[mes];
					}else{
						return 0;
					}
				}else{
					return 0;
				}

			})
            );

		});

		for (var i=0;i<sums.length;i++) {
			var parsedData = c.parseToData(stackIds[i],range,sums[i]);
			chartData.push(parsedData);
			//c.columns.push(chartData);
		}
		dimension.dispose();
		return {"ids": stackIds , "data":chartData};
	},

	createCtrlLayout : function() {
		var c = this;
		var options = c.getAttributes();
		var el=c.renderContainer();
		var attributes = c.attributes;
		
		var ctrlMarkup = '<div class="ctrl-toolbar">\
			 <div class="ctrl-titlebar"  style="width:50%;float:left;">\
			  <span class="ctrl-name"></span>\
			 </div>\
			 <div class="ctrl-tools"  style="width:40%;float:right;">\
			  <span class="fa fa-gear" style="margin:2px;float:right;"  data-menu="config">\
				<div class="vdvc-flymenu" menu-id="config">\
					<div class="vdvc-top-arrow"></div>\
					<span menu-item="props" class="vdvc-menu-item">Properties</span>\
					<span menu-item="config" class="vdvc-menu-item">Config</span>\
	 			</div>\
			 </span>\
			 <span class="fa fa-tag" style="margin:2px;float:right;" title="Tag"></span>\
			 <span class="fa fa-comments" style="margin:2px;float:right;" title="Comment"></span>\
			 </div>\
		</div>\
		<div class="ctrl-title"></div>\
		<div class="ctrl-content">\
			<div class="chart"></div>\
			<div class="cust-legend" style="overflow:auto;padding:5px 20px 0px 20px;font-size: .85em;"></div>\
		</div>';
		
		
		if (el.find(".ctrl-wrapper").length == 0) {
			el.append('<div class="ctrl-wrapper grid-stack-item-content"/>');
		} else {
			el.find(".ctrl-wrapper").empty();
		}
		el.find(".ctrl-wrapper").append(ctrlMarkup);

		
		
		el.find(".ctrl-title").append(attributes["title"]);
		el.find(".ctrl-name").append(c.name);
		var wrapperHgt = el.find(".ctrl-wrapper").height();
		el.find(".ctrl-content").height(wrapperHgt-40);
		if (Util.parseBoolean(options.showLegend) === true) {
			el.find(".ctrl-content .chart").height(wrapperHgt-90);
			el.find(".ctrl-content .cust-legend").height(50);
		} else {
			el.find(".ctrl-content .chart").height(wrapperHgt-40);
			el.find(".ctrl-content .cust-legend").height(0);
		}
		c.bindEvents();
	},

	getDataIds : function (data) {
		var ids = [];
		$.each(data,function(i,array){
			if (array.length > 0 && array[0] != "x") {
				ids.push(array[0]);
			}
		});

		return ids;
	},

	showLegend : function() {
		var c = this;
		var el=c.renderContainer();
		el.find(".ctrl-content .cust-legend").empty();
		var options = c.getAttributes();
		if(Util.parseBoolean(options.showLegend) === true){
			var chart = c.getInstance();
			var dataIds = c.getDataIds(c.columns);
			var leg = d3.select('.cust-legend').selectAll('span')
		    .data(dataIds)
		    .enter().append('span')
		    .attr('data-id', function (id) { return id; })
		    .attr('class', "item")
		    .html(function (id) {
		    	return '<input type="checkbox" data-id="'+id+'" checked >\
		    	<i class="fa fa-stop" ></i><span>'+id+'</span>' ;
		    })
		    .each(function (id) {
		        d3.select(this).selectAll('i').style('color', chart.color(id));
		    })
		    .on('mouseover', function (id) {
		    	chart.focus(id);
		    })
		    .on('mouseout', function (id) {
		    	chart.revert();
		    });

			leg.selectAll("input").on('change', function () {
		       var id = $(this).attr("data-id");
		       chart.toggle(id);
		    });

		}
	},

	render : function() {
		
		var c = this;
		var screen = c.getScreen();
		if(screen) {
			if ($.isEmptyObject(c.XfilterObjs) ){
				c.XfilterObjs = screen.getXfilterObj();
			}
			if($.isEmptyObject(c.dataSets)){
				c.dataSets = screen.getDataSet();
			}
		}
		c.resetConfig();
		c.columns = [];
		var config = c.defaultConfig;
		var grid={
	            "x": {
	                "show": false
	            },
	            "y": {
	                "show": false
	            }
	        };
		var legend= {
	        "show": false,
	    };
		var el=c.renderContainer();
		c.createCtrlLayout();
		var id=el.attr("id");
		var container="#"+id;
		el.find(".ctrl-content .chart").empty();
		config.bindto= "#"+id+" .ctrl-content .chart";

		var options = c.getAttributes();
		var _margins={top : 10,
				left : 50,
				right : 10,
				bottom : 40};



		
		var margins={};
		var parentWidth = $(container).parent().width();
		var parentHeight = $(container).parent().height();
	//	var width=(options.width)*parentWidth/100;
	//	var height=(options.height)*parentHeight/100-30;
		var width = $(container).width();
		var height= options.height;
		config.size.height = el.find(".ctrl-content .chart").height();
		config.size.width = width;

		margins.top = (options["margin-top"])*parentHeight/100;
		margins.bottom = (options["margin-bottom"])*parentHeight/100;
		margins.left = (options["margin-left"])*parentWidth/100;
		margins.right = (options["margin-right"])*parentWidth/100;

		if(Util.parseBoolean(options.showGrid) === true){
			grid.x={};
			grid.y={};
			grid.x.show= true;
			grid.y.show= true;
			config.grid = grid;
		}


		/*legend.show = Util.parseBoolean(options.showLegend);
		legend.position='bottom';*/
		config.legend = legend;

		if (c.mode === "compare") {
			c.compare();
		} else {
			c.getChartConfig();
			if (c.columns.length > 0) {
				config.data.columns = c.columns;
			}
			var chart = c3.generate(config);
			c.setInstance(chart);
			c.disposeDimensions();
			c.showLegend();
		}

	},

	filter : function(appliedFilters,dim) {
		dim.filterAll();
		$.each(appliedFilters,function(i,v){
			dim.filterFunction(function(d,i){
        		if($.inArray(d,appliedFilters) !== -1){
        			return d;
        		}
        	});
    	});
	},

	resetFilters : function(filters) {
		var c = this,
		allFilters = c.getAppliedFilters(),
		dgnrData = c.designerData;
		if(!$.isEmptyObject(allFilters) && allFilters.DimensionFilters && allFilters.DimensionFilters.length > 0) {
			$.each(allFilters.DimensionFilters,function(i,dimfltr) {
				var dimension = c.createDimensions(dimfltr.filterKye);
				dimension.filterAll();
			});
			if (dgnrData) {
				delete dgnrData["appliedFilters"];
			}
			c.appliedFilters = {};
			c.render();
			c.onFilter();
		}
	},

	applyFilters : function() {
		var c = this;
		var allFilters = c.appliedFilters;
		
		if(!$.isEmptyObject(allFilters)) {
			if ($.isArray(allFilters.DimensionFilters)) {
				var dimFltrs = allFilters.DimensionFilters;
				$.each(dimFltrs,function(i,v){
					var dimension = c.createDimensions(v.filterKye);
					c.filter(v.values,dimension);
				});
			}
		}
		
		
	},

	isAxisFilter : function(dim){
		var c = this;
		var status = false;
		if (c.xAxisDims.length > 0 ) {
			$.each(c.xAxisDims,function(i,v) {
				if (v == dim) {
					status = true;
					return false;
				}
			});
		}
		return status;
	},

	setFilteredAxis : function(newAxis,dim) {
		var c = this;
		c.xs[dim] = newAxis;
	},
	
	updateChartData : function() {
		
		var c = this;
		c.Xaxis = c.getXAxis();
		if ( c.Xaxis.length > 0 ) {
			var x = ["x"];
			x = x.concat(c.Xaxis);
			c.columns.push(x);
		}
		var configData = c.getCustomDesignerData();
		if (configData && configData.Measures && configData.Measures.length > 0 ) {
			$.each(configData.Measures,function (i,obj) {
				
				c.showMsrlbls = obj["showMeasureLabels"]; 
				
				var mes = obj["measure"];
				if (!c.isMsrFiltered(mes)) {
					var stack = obj["stackDimension"];
					var cluster = obj["clusterDimension"];
					var dim = obj["xAxis"]["dimension"];
					if (stack !== "NONE" && cluster !== "NONE") {
						
						var obj = c.getTriDimData(dim,cluster,stack,mes,c.Xaxis);
						c.columns = c.columns.concat(obj["data"]);
					} else if ( stack !== "NONE" ) {
						var obj = c.getBiDimData(dim,stack,mes,c.Xaxis);
						c.columns = c.columns.concat(obj["data"]);
					} else if (cluster !== "NONE"  ) {
						var obj = c.getBiDimData(dim,cluster,mes,c.Xaxis);
						c.columns = c.columns.concat(obj["data"]);
					} else {
						var dataId = mes;
						if (c.currentGrp) {
							dataId = c.currentGrp+"."+dataId;
						}
						
						var msrLbl = c.getMeasureLabel(mes);
						if (msrLbl && c.showMsrlbls)  {
							dataId = msrLbl;
							if(c.currentGrp) {
								dataId = c.currentGrp+"."+dataId;
							}
						}
						var group = c.groupData(dim,mes);
						var groupdata=c.parseToData(dataId,c.Xaxis,group);
						c.columns.push(groupdata);
					}
				}
			});
		}
		
	},
	
	update : function () {
		
		var c = this;
		c.columns = [];
		var appliedFilters = c.appliedFilters;
		if (appliedFilters) {
			c.setAppliedFilters(appliedFilters);
			/*if(c.isAxisFilter(dim)) {
				//c.setFilteredAxis(appliedFilters, dim);
			}*/
		}
		if (c.mode === "compare") {
			c.processCompareData();
		} else if(appliedFilters) {
			c.applyFilters();
			c.updateChartData();
			
		} else {
			c.getChartConfig();
		}

		var data = c.columns;
		var inst = c.getInstance();
		console.log(JSON.stringify(data));
		if(inst && data.length > 0){
			setTimeout(function () {
				
				var unload = inst.data() ? true : false;
				inst.load({columns: data,unload: unload });
				c.showLegend();
			},100);
			
			
		}
		c.disposeDimensions();
	},

	addGrpKey : function(data,key) {
		if(data && data.length > 0) {
			$.each(data,function(i,v){
				if(v && v.length > 0){
					var id = v[0];
					v[0] = id+"."+key;
				}
			});
		}
	},

	processCompareData : function() {

		var c = this;
		var XfilterObjs = c.XfilterObjs;
		var dataSets = c.dataSets;
		var virtualDimValues = null;
		var grpDims = [];
		var groups = {};
		c.columns = [];
		var config = c.defaultConfig;

		config.data.axes={};
		config.data.types = {};
		config.data.groups=[];
		config.legend.hide = [];
		if ( !$.isEmptyObject(dataSets) ) {
			var blocks = Object.keys(dataSets);
			if (blocks && blocks.length > 0) {
				var data = c.getDataSet(blocks[0]);
				virtualDimValues = c.getDimensionInputs(data,blocks[0]+".Grp");
			}
		}

		if (!$.isEmptyObject(XfilterObjs) && virtualDimValues && virtualDimValues.length > 0) {
			$.each(XfilterObjs , function(key,val){
				var dim = key+".Grp";
				var dimension = c.createVirtualDim(dim);
				grpDims.push(dimension);
			});
			if (grpDims.length > 0 ) {
				
				$.each(virtualDimValues , function(i,v){
					$.each(grpDims , function(indx,val){
						val.filterAll();
						val.filterFunction(function(d,i){
			        		if( d === v ){
			        			return d;
			        		}
			        	});
					});
					c.currentGrp = v;
					c.getChartConfig();
					if(c.columns.length > 0) {
						$.each(c.columns,function(index,value){
							if (Object.prototype.toString.call( groups[index] ) !== '[object Array]'){
								groups[index] = [];
							}
							groups[index].push(value);
						});
					}
					c.columns = [];
				});
			}
		}
		if ( !$.isEmptyObject(groups) ) {
			var indices = Object.keys(groups);
			$.each(indices,function(i,val){
				c.columns=c.columns.concat(groups[val]);
				/*if (i !== indices.length-1) {
					var sep = [];
					sep.push("s"+i);
					sep.push(0);
					c.columns.push(sep);
					config.legend.hide.push("s"+i);
				}*/
			});
		}
		c.disposeVirtualDims();
		c.currentGrp = null;
	},

	compare : function( ) {
		
		var c = this;
		c.processCompareData();
		var config = c.defaultConfig;
		var el=c.renderContainer();
		el.find(".ctrl-content .chart").empty();
		if (c.columns.length > 0) {
			config.data.columns = c.columns;
		}
		var chart = c3.generate(config);
		c.setInstance(chart);
		c.disposeDimensions();
		c.showLegend();
	}
});
