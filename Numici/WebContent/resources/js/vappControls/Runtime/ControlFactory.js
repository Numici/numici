/**
 * New node file
 */


var ControlFactory = {
	_map: {
		"GroupControl":function(){
			return new GroupControlContainer();
		},
		"ResultArea":function(){
			return new ResultAreaContainer();
		},
		"BarChart":function(){
			return new BarChartControl();
		},
		"ColumnChart":function(){
			return new ColumnChartControl();
		},
		"Layout":function(){
			return new LayoutControl();
		},
		"InputArea" : function(){
			return new InputAreaContainer();
		},
		"FilterArea" : function(){
			return new FilterAreaContainer();
		},
		"Button":function(){
			return new Button();
		},
		"Menubar":function(){
			return new MenubarControl();
		},
		"CompositeChart":function(){
			return new CompositeChartControl();
		},
		"CompositeFilter":function(){
			return new CompositeFilterControl();
		},
		"PlannerControl" : function() {
			return new PlannerControl();
		},
		"WorkFlowDashBoardControl" : function() {
			return new WorkFlowDashBoardControl();
		},
		"TextControl" : function() {
			return new TextControl();
		},
		"AnnotationControl" : function() {
			return new AnnotationControl();
		},
		"TagControl" : function() {
			return new TagControl();
		},
		"ScalarControl" : function() {
			return new ScalarControl();  
		}
	},
	
	createInstance: function (ctrlType) {
		if ("function" == typeof this._map[ctrlType]) {
			return this._map[ctrlType]();
		} else {
			return null;
		}
	}
};