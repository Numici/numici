
var MdlLayoutManager = (function($){
	
	
	//Event binding On initialization 
	$(document).on("change",'#blockfields .box-content input[type="checkbox"]',function() {
		
				if (!$(this).is(":checked")) {
					var elementId = $(this).siblings("li.ui-draggable").attr("id");
					removeDimension(elementId);
					createPivotGrid();
		}
	});
	
	$(document).on("click", ".dragdata li input[type='checkbox']", function() {
		var flag = $(this).prop("checked");
		if (flag) {
			return false;
		}
	});
	
	$(document).on("click",".box-header .ui-icon",function() {
				$(this).toggleClass("ui-icon-minusthick").toggleClass(
						"ui-icon-plusthick");
				$(this).parents(".box:first").find(".box-content").toggle();
	});
	
	$(document).on("click","button.indent_rgt_Btn",function() {
		var $element = $(this).parent();
		var CurrIndent = $element.attr("level")*1;
		var prevDim = $element.prev("li[role=dimension]");
		if(prevDim.length > 0){
			var prevIndent=prevDim.attr("level")*1;
			if (prevIndent - CurrIndent >= 0) {
				CurrIndent++;
				$element.attr("level",CurrIndent);
				$element.find("button.indent_rgt_Btn").css("margin-right",CurrIndent*10+"px");
				$.each($element.nextAll("li[role=dimension]"),function(i,obj){
					$(obj).attr("level",($(obj).attr("level")*1)+1);
					$(obj).find("button.indent_rgt_Btn").css("margin-right",$(obj).attr("level")*10+"px");
				});
				createPivotGrid();
			}
			
		}
	});
	
	$(document).on("click","button.indent_lft_Btn",function() {
		var $element = $(this).parent();
		var CurrIndent = $element.attr("level")*1;
		var prevDim = $element.prev("li[role=dimension]");
		if(prevDim.length > 0){
			if(CurrIndent > 0){
				CurrIndent--;
				$element.attr("level",CurrIndent);
				$element.find("button.indent_rgt_Btn").css("margin-right",CurrIndent*10+"px");
				$.each($element.nextAll("li[role=dimension]"),function(i,obj){
					var level=$(obj).attr("level");
					if(level > 0){
						$(obj).attr("level",($(obj).attr("level")*1)-1);
						$(obj).find("button.indent_rgt_Btn").css("margin-right",$(obj).attr("level")*10+"px");
					}
					
				});
				createPivotGrid();
			}
		}
	});	
	
	
	//Private Members
	var _model=null;
	var _selector=null;
	var _layout=null;
	var _layoutBuilder="#laoutRgtContainer";
	var _layoutObj=null;
	
	var getRowsData=function(){
		var level={};
		var rows=$("div[data-holder='rows']").find("li.ui-draggable");
		var row=[];
		var a=[];
		$.each(rows,function(index,object){
			var dim=$(object).data("dimObj");
			var currentLevel=$(object).attr("level");
			var l=level[currentLevel];
			if(typeof l !== undefined){
				l=level[currentLevel]=[];
			}
			var values=dim.values.slice(0);
			values.push("Total");
			$.each(values,function(i,v){
				var cell={};
				var parentDim=$(object).prevAll('li[level="'+(currentLevel-1)+'"]');
				if(parentDim.length>0){
					cell.parent=$(parentDim[0]).data("dimObj").name;
				}else{
					cell.parent=null;
				}
				cell.level=$(object).attr("level");
				cell.block=$(object).attr("block");
				cell.dimName=dim.name;
				cell.func=dim.aggregateFun;
				cell.value=v;
				cell.root={};
				//var obj={};
				cell.root[dim.name]=v;
				//cell.root.push(obj);
				cell.editable=true;
				l.push(cell);
			});	
		});
		$.each(level,function(key,val){
			row[key]=val;
		});
		if(row.length > 1){
			for(var i=1;i<row.length;i++){
				if(i===1){
					a=arrange(row[i-1],row[i]);
				}else{
					a=arrange(a,row[i]);
				}
				
			}
		}else{
			return row[0];
		}
		
		return a;
	};
	
	var arrange=function(a1,a2){
		var newarray=[];
		$.each(a1,function(i,v){
			newarray.push(v);
			
			if(v.value !=="Total"){
				$.each(a2,function(index,val){
					if(v.dimName===val.parent){
						//val.editable=true;
						v.editable=false;
						//val.root=[];
						//val.root=val.root.concat(v.root);
						val.root=$.extend({}, val.root, v.root);
						newarray.push(JSON.parse(JSON.stringify(val)));
					}
				});
			}
			
		});
		
		a1=newarray;
		console.log(a1);
		return a1;
	};
	
	var getColumnsData=function(){
		
		var level={};
		var columns = $("div[data-holder='columns']").find("li.ui-draggable");
		var col=[];
		$.each(columns,function(index,object){
			var l=level[$(object).attr("level")];
			if(l){
				level[$(object).attr("level")]=l.concat($(object).data("ranges"));
			}else{
				level[$(object).attr("level")]=$(object).data("ranges");
			}
			
		});
		$.each(level,function(key,val){
			col[key]=val;
		});
		return col;
	};
	
	var getColumnInfo=function(columns) {
		var cols=getColumnsData();
		var colspans = [];
		var colLengths = [];
		var NoOfColumnsEachLevel = 1;
		var TotalNoOfColumns = 0;
		for ( var k = 0; k < cols.length; k++) {
			NoOfColumnsEachLevel = NoOfColumnsEachLevel
					* $(cols[k]).length;
			colspans.push(NoOfColumnsEachLevel);
			TotalNoOfColumns = TotalNoOfColumns + NoOfColumnsEachLevel;
			colLengths.push(TotalNoOfColumns);
		}
		return {
			colspans : colspans,
			colLengths : colLengths,
			NoOfColumnsEachLevel : NoOfColumnsEachLevel,
			TotalNoOfColumns : TotalNoOfColumns,
			columns:cols
		};
	};

	var addAttribute=function(element, level) {
		$(element).addClass("total").attr("level", level);
		var letter = $(element).attr("cell-id").match(/\D+/);
		var no = $(element).attr("cell-id").match(/\d+/);

		$(element).parent().nextAll().each(
				function(i, value) {
					var n = parseInt(no) + i + 1;
					$(value).find('td[cell-id="' + letter + n + '"]').addClass(
							"total").attr("level", level);
				});
	};
	var onclick=function(element){
		
		var msr=$(element).data("msrObj");
		var compound=$(element).data("root");
		var OriginalContent = $(element).text();
		 $(element).html("<input type='text' value='" + OriginalContent+ "' style='width:100%;height:100%;' placeholder='"+msr.name+"'/>");
		 $(element).children().first().focus();
		$(element).children().first().blur(function() {
			var newContent = $(this).val();
			compound[msr.name]=newContent;
			$(this).parent().data("measure", newContent);
			$(this).parent().text(newContent);
			
			if(typeof newContent !== undefined && newContent.trim() !==""){
				Util.ajaxPost("layout/savedata/model/"+_model.id,[compound],function(result){
					if(!result.Status){
						Util.showMessage(result.Message);
					}
				});
			}
		});
	};
	var addCellInfo=function(cell,type,data){
		
		if(type === "col"){
			
			var block=data["belongsTo"];//$(columnsobj[k]).data("belongsTo");
			var dimname=data["dimObj"].name;//$(columnsobj[k]).data("dimObj").name;
			var cellVal=$(cell).text();
			var tr=$(cell).closest("tr");
			var colgroup=$(tr).nextAll();
			var index = $(cell).index();
			$.each(colgroup,function(i,v){
				var td=$(v).children('td:eq(' + index + ')');
				var root=$(td).data("root");
				var obj={};
				obj["BlockName"]=block;
				obj[dimname]=cellVal;
				if(jQuery.isEmptyObject(root)){
					$(td).data("root",obj);
				}else{
					var newObj=$.extend({}, root, obj);
					$(td).data("root",newObj);
				}
			});
		}
		if(type ==="row"){
			
			var rowGroup=$(cell).nextAll();
			$.each(rowGroup,function(i,v){
				var root=$(v).data("root");
				//root["BlockName"]=block;
				if(jQuery.isEmptyObject(root)){
					$(v).data("root",data.root);
				}else{
					var newObj=$.extend({}, root, data.root);
					$(v).data("root",newObj);
				}
			});
		}
	};
	var createPivotGrid= function() {
		var table = $(".gridBody table");
		var values=$("div[data-holder='values']").find("li.ui-draggable");
		var columnsobj = $("div[data-holder='columns']").find("li.ui-draggable");
		var rows = $("div[data-holder='rows']").find("li.ui-draggable");
		var columnHeadingLevels = columns.length || 1;
		var colspans = [];
		var colLengths = [];
		var currentDataLength;
		var TotalNoOfColumns = 0;
		var TotalNoOfRows=0;
		var rowdata=[];
		if(rows.length > 0){
			rowdata=getRowsData();
			TotalNoOfRows=rowdata.length*values.length+columnHeadingLevels+values.length;
		}
		if (columnsobj.length > 0) {
			
			var columninfo = getColumnInfo(columnsobj);
			columns=columninfo.columns;
			var temp = [];
			columnHeadingLevels = columns.length;
			colspans = columninfo.colspans;
			colLengths = columninfo.colLengths;
			NoOfColumnsEachLevel = columninfo.NoOfColumnsEachLevel;
			TotalNoOfColumns = columninfo.TotalNoOfColumns;
			$(".pivoteContainer").empty();
			excelView.getGrid(".pivoteContainer", {
				minColumns : TotalNoOfColumns + 2,
				minRows : TotalNoOfRows,
				editable:true,
				OnCellClick:{"input":onclick}
			});
			table = $(".gridBody table");
			for ( var k = 0; k < columns.length; k++) {
				currentDataLength = columns[k].length;//$(columns[k]).data("ranges").length;
				var tr = $(table).find('tbody tr:nth-child(' + (k + 1) + ')');
				var prevLength = 1;
				var cdata = columns[k];//$(columns[k]).data("ranges");
				if (k == 0) {
					temp = cdata;
				} else {
					var _cdata = [];
					_cdata = _cdata.concat(cdata);
					_cdata.push("Total");
					prevLength = colspans[k - 1];
					temp = [];
					for ( var j = 0; j < prevLength; j++) {
						temp = temp.concat(_cdata);
					}
				}
				
				var a = 0;
				for ( var l = 0; l < temp.length; l++) {
					var _td = $(tr).find('td:nth-child(' + (a + 2) + ')');
					$(tr).addClass("columnHeading");
					$(_td).addClass("columnHeading");
					$(_td).append(temp[l]);
		
					addCellInfo(_td,"col",$(columnsobj[k]).data());
					
					
					if ((l + 1) % (currentDataLength + 1) == 0) {

						$(_td).attr("rowspan", columnHeadingLevels - k);
						addAttribute($(_td), k + 1);
						removeCells($(_td), columnHeadingLevels - k);

					} else {
						if (k !== columns.length - 1) {
							var cspan = Math.floor(TotalNoOfColumns / colspans[k]);
							$(_td).attr("colspan", cspan).css("width",(cspan)*109-8+"px");
							for ( var d = 0; d < cspan - 1; d++) {
								a++;
								$(tr).find('td:nth-child(' + (a + 2) + ')').append(temp[l]);
								$(tr).find('td:nth-child(' + (a + 2) + ')').hide();
								addCellInfo($(tr).find('td:nth-child(' + (a + 2) + ')'),"col",$(columnsobj[k]).data());
								
							}
						}
						if (k == 0 && l == temp.length - 1) {
						   $(tr).find('td:nth-child(' + (a + 2) + ')').next('td')
								//	.data("block", $(columns[k]).data("belongsTo"))
									.addClass("columnHeading").attr("rowspan",columnHeadingLevels).append("Total");
							addAttribute($(tr).find('td:nth-child(' + (a + 2) + ')').next('td'), k + 1);
						}
					}
					a++;
				}
			}
		}
		if (rows.length > 0) {
			if(rowdata.length > 0){
				
			for(var v=0;v<values.length;v++){
				var msrobj=$(values[v]).data("msrObj");
				var block=$(values[v]).attr("block");
				columnHeadingLevels++;
				var tr = $(table).find('tbody tr:nth-child(' + (columnHeadingLevels) + ')');
				var td = $(tr).find('td:nth-child(1)').append(block+"."+msrobj.name);
				$(td).attr("colspan",TotalNoOfColumns+2).css("background","#FCFACE");
				$(td).css("width",((TotalNoOfColumns+2)*109-8)+"px");
				$(td).nextAll().hide();
				for(var i=0;i<rowdata.length;i++){
					columnHeadingLevels++;
					var cell=rowdata[i];
					var tr = $(table).find('tbody tr:nth-child(' + (columnHeadingLevels) + ')');
					$(tr).attr("level",cell.level);
					var td = $(tr).find('td:nth-child(1)');
					$(td).css("padding-left", (cell.level)*10+"px");
					//$(td).attr("level",cell.level);
					addCellInfo(td,"row",cell);
					
					if(cell.value === "Total"){
						$(td).append(cell.dimName+"."+cell.value);
						$(td).css("padding-left", (cell.level)*10+20+"px");
					}else{
						
						if(cell.editable){
							$(td).css("padding-left", (cell.level)*10+20+"px");
							for ( var n = 0; n < TotalNoOfColumns; n++) {
								var tdcell=$(tr).find('td:nth-child(' + (n+ 2) + ')');
								var x = $(tdcell).attr("class");
								if (x !== "total") {
									$(tdcell).data("msrObj",msrobj);
									$(tdcell).addClass("input");
								} 
							}
						}else{
							$(td).append('<span class="ui-icon ui-icon-minusthick" style="float:left;cursor: pointer;border: 1px solid blue;margin-right: 4px;"></span>');
							for ( var n = 0; n < TotalNoOfColumns; n++) {
								var x = $(tr).find('td:nth-child(' + (n+ 2) + ')').attr("class");
								if (x !== "total") {
									$(tr).find('td:nth-child(' + (n+ 2) + ')').html(cell.func);
								} 
							}
						}
						$(td).append(cell.value);
					}
					
				}
			}
				
			}

		}
	};
	
	var removeCells=function(element, upto) {
		if (upto > 1) {
			upto = upto - 1;
			var index = $(element).index() - 1;
			$(element).parent().nextAll('*:lt(' + upto + ')').each(function(i, value) {
						$(value).find('td:eq(' + index + ')').remove();
            });
		}
	};
	
	var getBuilder=function(selector){
		
		var w =$(selector).width() * 0.4;
		var h = $(selector).height() * 0.9;
		var markup='<div class="header">\
			<span style="float: left; margin-top: 6px;"></span>\
				<span style="float: right; margin-top: 6px;">Layout Designer</span>\
		</div>\
		<div class="content">\
			<div class="left">\
				<div class="box" id="filter">\
					<div class="box-header ui-widget-header">Filters</div>\
					<div class="box-content " data-holder="filter"></div>\
				</div>\
				<div id="slices" class="box">\
					<div class="box-header ui-widget-header">Slices</div>\
					<div class="box-content " data-holder="slices"></div>\
				</div>\
				<div id="rows" class="box">\
					<div class="box-header ui-widget-header">Rows</div>\
					<div class="box-content " data-holder="rows"></div>\
				</div>\
				<div id="columns" class="box">\
					<div class="box-header ui-widget-header">Columns</div>\
					<div class="box-content " data-holder="columns"></div>\
				</div>\
				<div id="values" class="box">\
					<div class="box-header ui-widget-header">Values</div>\
					<div class="box-content" data-holder="values"></div>\
				</div>\
			</div>\
			<div class="right">\
				<div id="blockfields">\
					<div class="box-header ui-widget-header">Blocks</div>\
					<div class="box-content "></div>\
				</div>\
			</div>\
		</div>';
		$('<div id="laoutRgtContainer"></div>').dialog({
			//autoOpen : false,
			resizable : false,
			draggable : true,
			closeText: "",
			dialogClass : "layoutBuilder",
			appendTo : selector,
			width : (400 > w) ? 400 : w,
			height : (600 > h) ? 600 : h,
			position : {
				my : 'right top',
				at : 'right top',
				of : selector
			},
			create: function(){
				$(this).append(markup);
				makeSortable();
			}
		});
	};
	
	var getLayout=function(selector){
		_layout=selector;
		var markup='<div id="layoutLftContainer">\
			<div class="gridContainer">\
				<div id="gridtabs" class="tabs-bottom style-grid-tabs">\
					<ul>\
						<li><a href="#tabs-1">Basic Grid</a></li>\
					</ul>\
					<div class="tabs-spacer"></div>\
					<div id="tabs-1">\
						<div class="pivoteContainer"></div>\
					</div>\
				</div>\
			</div>\
		</div>';
		$(selector).append(markup);
		$(".pivoteContainer").css("width", $(selector).width() * 1);
		$("#gridtabs").tabs({});
		$(".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *").removeClass(
				"ui-corner-all ui-corner-top").addClass("ui-corner-bottom");
		$(".tabs-bottom .ui-tabs-nav").appendTo(".tabs-bottom");
		
		/*$("<div id='layoutCotainer'></div>").dialog({
			autoOpen : false,
			resizable : false,
			draggable : false,
			appendTo : "#rightcontainer",
			dialogClass : "layoutBg",
			width : $("#rightcontainer").width() - 10,
			height : $("#rightcontainer").height() ,//old -42
			focus : function(event, ui) {
				$("#laoutRgtContainer").dialog("moveToTop");
			},
			position : {
				my : 'top',//old value top+42
				at : 'top',
				of : '#rightcontainer'
			},
			open:function(){
				
				$(this).append(markup);
				
				$(".pivoteContainer").css("width", $("#layoutLftContainer").width() * 0.75);
				$("#gridtabs").tabs({});
				$(".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *").removeClass(
						"ui-corner-all ui-corner-top").addClass("ui-corner-bottom");
				$(".tabs-bottom .ui-tabs-nav").appendTo(".tabs-bottom");
			}
		});//.dialog("widget").find(".ui-dialog-titlebar").remove();*/	
	};
	
	var makeSortable=function(){
		$("div[data-holder='rows'],div[data-holder='columns'],div[data-holder='slices'],div[data-holder='filter']").sortable(
				{
					connectWith : "div[data-holder='rows'],div[data-holder='columns'],div[data-holder='slices'],div[data-holder='filter']",
					cursor : "move",
					revert: "invalid",
					receive : function(event, ui) {
						$(ui.item).siblings('input[type="checkbox"]').prop("checked", true);
					},
					update : function(event, ui) {
						
							console.log("update");
							if (!ui.item.data("ranges")) {
								$(ui.item).data({
									"ranges" : $("#data").data("ranges"),
									"belongsTo" : $("#data").data("belongsTo"),
									"dimObj":$("#data").data("dimObj"),
								});
								$(ui.item).attr("data-id",$("#data").attr("data-id"));
								$(ui.item).text($("#data").data("belongsTo")+"."+$(ui.item).data("dimObj").name);
							}
							var dropedOn=$(this).attr("data-holder");
							switch (dropedOn) {
							case "columns":
								$(ui.item).find('button').remove();
								$(ui.item).prepend(
												'<button class="indent_lft_Btn"><span class="ui-icon  ui-icon-triangle-1-w"></span></button>\
								<button class="indent_rgt_Btn"><span class="ui-icon ui-icon-triangle-1-e"></span></button>');
								$(ui.item).data("children-id", []);
								$(ui.item).attr("parent-id", null);
								$(ui.item).data("parent-id", null);
								setIndentPosition($(ui.item),"columns");
								//createPivotGrid();
								break;
							case "rows":
								$(ui.item).find('button').remove();
								$(ui.item)
										.prepend(
												'<button class="indent_lft_Btn"><span class="ui-icon  ui-icon-triangle-1-w"></span></button>\
									<button class="indent_rgt_Btn"><span class="ui-icon ui-icon-triangle-1-e"></span></button>');
								$(ui.item).data("children-id", []);
								$(ui.item).data("parent-id", null);
								$(ui.item).attr("parent-id", null);
								setIndentPosition($(ui.item),"rows");
								//createPivotGrid();
								break;
							case "slices":
								$(ui.item).find('button').remove();
								//createPivotGrid();
								break;
							case "filter":
								$(ui.item).find('button').remove();
								//createPivotGrid();
								break;
							}
						
					},
					stop:function(){
						
						console.log("stop");
						createPivotGrid();
					},
					zIndex : 10000,
					appendTo : "body",
					helper : function(event, ui) {
						return $('<div class="ui-widget-content">'
								+ $(ui).text() + '</div>');
					}
				});

				$("div[data-holder='values']").sortable(
						{
							connectWith : "div[data-holder='values']",
							cursor : "move",
							revert: "invalid",
							receive : function(event, ui) {
								$(ui.item).siblings('input[type="checkbox"]').prop("checked", true);
								var id=$(ui.item).attr("id");
								enablOrDsiablDims(id,"enable");
							},
							update : function(event, ui) {
								
								if (this === ui.item.parent()[0]){
									console.log("update");
									if (!ui.item.data("ranges")) {
										$(ui.item).data({
											"msrObj" : $("#data").data("msrObj"),
											"belongsTo" : $("#data").data("belongsTo"),
										});
										$(ui.item).attr("data-id",$("#data").attr("data-id"));
										$(ui.item).text($("#data").data("belongsTo")+"."+$(ui.item).data("msrObj").name);
									}
									var dropedOn=$(this).attr("data-holder");
									if(dropedOn === "values"){
										
									}
								}
								
							},
							stop:function(event,ui){
								createPivotGrid();
							},
							zIndex : 10000,
							appendTo : "body",
							helper : function(event, ui) {
								return $('<div class="ui-widget-content">'
										+ $(ui).text() + '</div>');
							}
						});
				
				$(".box").addClass(
				"ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
				.find(".box-header").addClass("ui-widget-header ui-corner-all")
				.prepend("<span class='ui-icon ui-icon-minusthick'></span>").end()
				.find(".box-content");
				
				$(".left").sortable({
					connectWith : ".left",
					containment : "parent",
					handle : ".box-header",
					revert : true,
					start : function(event, ui) {
						ui.placeholder.height(ui.item.height() + 20);
					}
				});
				$(".box-content").resizable({
					handles : "s",
					minHeight : 80
				});
				
				
				
				$("#blockfields .box-content").droppable(
						{
							accept : ".left .box-content li",
							drop : function(event, ui) {
								var elementId = ui.draggable.attr("data-id");
								$("#" + elementId).siblings('input[type="checkbox"]').prop("checked", false);
								removeDimension(elementId);
							}
						});
				
				$("#layoutLftContainer").resizable({
					handles : "e",
					alsoResizeReverse : "#laoutRgtContainer",
					alsoResize : ".pivoteContainer",
					maxWidth : $("#layoutCotainer").width() * 0.6,
					minHeight : $("#layoutCotainer").height(),
					minWidth : $("#layoutCotainer").width() * 0.3
				});

	};
	
	var removeDimension=function(id) {
		var removedType = $("#"+id).attr("role");
		if(removedType === "measure"){
			enablOrDsiablDims(id,"disable");
			$('li[data-id="' + id + '"]').remove();
		}else if(removedType === "dimension"){
			var nextDims=$('li[data-id="' + id + '"]').nextAll();
			if(nextDims.length > 0){
				$.each(nextDims,function(i,v){
					var level=$(v).attr("level");
					if(level >0){
						$(v).attr("level",level-1);
						$(v).find("button.indent_rgt_Btn").css("margin-right", (level-1)*10+"px");
					}
				});
			}
			$('li[data-id="' + id + '"]').remove();
		}
	};

	var enablOrDsiablDims=function(id,option){
		
		var block=$("#"+id).closest(".root");
		var dims=$(block).find("li[role=dimension]");
		var msr=$('li[data-id="'+id+'"]');
		var msrsiblings=$(msr).siblings("li[role=measure]");
		if(option === "enable"){
			$.each(dims,function(i,v){
				$(v).parent().removeClass("disable");
				$(v).siblings("input[type=checkbox]").prop("disabled",false);
			});
		}
		if(option === "disable"){
			var match=true;
			var root=$(msr).attr("block");
			if(msrsiblings.length > 0){
				$.each(msrsiblings,function(i,v){
					if( root === $(v).attr("block") ){
						match=false;
					}
				});
			}
			if(match){
				var rltDims=$(".left").find('li[block="'+root+'"]');
				if(rltDims.length > 0){
					$.each(rltDims,function(i,v){
						$(v).remove();
						$("#"+$(v).attr("data-id")).siblings("input[type=checkbox]").prop('checked', false);
					});
				}
				$.each(dims,function(i,v){
					$(v).parent().addClass("disable");
					$(v).siblings("input[type=checkbox]").prop("disabled",true);
				});
			}
		}
	};
	
	var recurse=function recurse(data) {
		
		var ul = $("<ul/>");
		$.each(data,function(key, value) {
			var li = $("<li/>");
			ul.append(li);
			li.append(value.name + " :");
			li.addClass("root");
			li.attr("role","block");
			li.data("block",value);
			var ul2=$("<ul/>");
			li.append(ul2);
			if(value.dimensions){
				var li1=$("<li/>");
				li1.append("Dimensions :");
				ul2.append(li1);
				var dimul=$("<ul/>");
				li1.append(dimul);
				$.each(value.dimensions,function(i,v){
					var checkbox = $('<input type="checkbox" style="float:left;display:inline;" disabled="disabled">');
					var dimli=$("<li/>");
					var _li = $("<li/>").draggable({
						connectToSortable : "div[data-holder='rows'],div[data-holder='columns'],div[data-holder='slices'],div[data-holder='filter']",
						helper : "clone",
						cursor : "move",
						revert: "invalid",
						zIndex : 10000,
						appendTo : "body",
						helper : function(event, ui) {
							var blk=$(this).closest(".root").data("block");
							return $('<div class="ui-widget-content">'+blk.name+'.'+ $(this).text()+ '</div>');
						},
						start : function(event, ui) {
							var status = $(this).siblings("input[type='checkbox']").prop('checked');
							var block=$(this).closest(".root");
							var msr=$(block).find("li[role='measure']");
							var isMsrSelected= false;
							if(msr.length > 0){
								$.each(msr,function(i,v){
									var selected=$(v).siblings('input[type="checkbox"]').prop('checked');
									if(selected){
										isMsrSelected=true;
										return false;
									}
								});
							}
							if (!status && isMsrSelected) {
								$("#data").data({
									"ranges" : $(this).data("ranges"),
									"dimObj":$(this).data("dimObj"),
									"belongsTo" : value.name,
								});
								$("#data").attr("data-id",$(this).attr("id"));
							}else{
								return false;
							}
						}
					
					});
					
					_li.uniqueId();
					_li.css("display", "flex");
					_li.append(v.name);
					_li.data("dimObj",v);
					_li.data("ranges", v.values);
					_li.attr("role","dimension");
					_li.attr("block",value.name);
					_li.attr("dim-name",v.name);
					dimli.append(checkbox);
					dimli.append(_li);
					dimli.addClass("disable");
					dimul.append(dimli);
					dimul.addClass("dragdata");
				});
				
				
			}
			if(value.measures){
				
				var li1=$("<li/>");
				li1.append("Measure :");
				ul2.append(li1);
				var dimul=$("<ul/>");
				li1.append(dimul);
				$.each(value.measures,function(i,v){
					var checkbox = $('<input type="checkbox" style="float:left;display:inline;">');
					var dimli=$("<li/>");
					var _li = $("<li/>").draggable({
						connectToSortable : ".left div[data-holder='values']",
						helper : "clone",
						revert: "invalid",
						cursor : "move",
						zIndex : 10000,
						appendTo : "body",
						helper : function(event, ui) {
							var blk=$(this).closest(".root").data("block");
							return $('<div class="ui-widget-content">'+blk.name+'.'+ $(this).text()+ '</div>');
						},
						start : function(event, ui) {
							var status = $(this).siblings("input[type='checkbox']").prop('checked');
							var role=$(this).attr("role");
							if (!status) {
								if(role === "dimension"){
									return false;
								}else{
									$("#data").data({
										"msrObj":$(this).data("msrObj"),
										"belongsTo" : value.name,
									});
									$("#data").attr("data-id",$(this).attr("id"));
								}
							}else{
								return false;
							}
						}
					
					});
					_li.uniqueId();
					_li.css("display", "flex");
					_li.append(v.name);
					_li.data("name",v.name);
					_li.data("msrObj",v);
					_li.attr("role","measure");
					_li.attr("block",value.name);
					_li.attr("msr-name",v.name);
					dimli.append(checkbox);
					dimli.append(_li);
					dimul.append(dimli);
					dimul.addClass("dragdata");
				});
			}
		});
		return ul;
	};
	
	var promptSave=function(Save,Cancel,Discard){
		var dialogMarkup = '<div class="layoutPromt"></div>';
		var dlgButtons = {};
		var dlg=$(dialogMarkup).dialog({
			width:400,
			height:200,
			open:function(){
				var markup='Layout Name: <input type="text" data-name="layoutName">';
				$(this).append(markup);
			},
			close:function(){
				$(this).dialog("destroy");
			},
			 buttons: dlgButtons,
		});
		addButton($(dlg), dlgButtons, "Save", Save);
		addButton($(dlg), dlgButtons, "Cancel", Cancel);
		addButton($(dlg), dlgButtons, "Discard", Discard);
		$(dlg).dialog({buttons:dlgButtons});
		
		function addButton(dlg, map, key, fn) {
			if ("function" == typeof fn) {
				map[key] = function() {
					//$(dlg).dialog("close");
					fn();
				};
			}
		}
		
	};
	
	var openLayout=function(){
		createLayout();
		$(_layoutBuilder).dialog( "option", "title", _layoutObj.layoutName );
		$(_layoutBuilder).data( "layout",_layoutObj);
		process();
	};
	
	var closeNopenLayout=function(){
		close();
		openLayout();
	};
	
	var close = function(){
		$(_layout).empty();
		$(_layoutBuilder).dialog("destroy");
	};
	
	var closeNopenNew=function(){
		$(".layoutPromt").dialog("close");
		close();
		createLayout();
		$(_layoutBuilder).dialog( "option", "title", "New Layout" );
		$(_layoutBuilder).data("model",_model);
		$(_layoutBuilder).data("isNew",true);
	};
	
	var save=function(){
		if ($(_layoutBuilder).hasClass('ui-dialog-content')) {
			
			if($(_layoutBuilder).data("isNew")){
				promptSave(function(){
					var name=$("input[data-name='layoutName'").val();
					if(typeof name !=="undefined" && name.trim() !== ""){
						$(".layoutPromt").dialog("close");
						saveMdlLayout(name);
						close();
					}else{
						Util.showMessage("Please Enter the layout Name");
					}
				},function(){$(".layoutPromt").dialog("close");},function(){close();$(".layoutPromt").dialog("close");});
			}else{
				
				var lyotObj=$(_layoutBuilder).data("layout");
				updateLayout(lyotObj);
				close();
			}
		} 
	};
	
	var saveNopenLayout=function(){
		promptSave(function(){
			var name=$("input[data-name='layoutName'").val();
			if(typeof name !=="undefined" && name.trim() !== ""){
				$(".layoutPromt").dialog("close");
				saveMdlLayout(name);
				closeNopenLayout();
			}else{
				Util.showMessage("Please Enter the layout Name");
			}
		},function(){$(".layoutPromt").dialog("close");},function(){$(".layoutPromt").dialog("close");closeNopenLayout();});
	};
	
	var saveNopenNew=function(){
		promptSave(function(){
			var name=$("input[data-name='layoutName'").val();
			if(typeof name !=="undefined" && name.trim() !== ""){
				$(".layoutPromt").dialog("close");
				saveMdlLayout(name);
				closeNopenNew();
			}else{
				Util.showMessage("Please Enter the layout Name");
			}
		},function(){$(".layoutPromt").dialog("close");},closeNopenNew);
	};
	
	var updateNopenLayout=function(){
		var lyotObj=$(_layoutBuilder).data("layout");
		updateLayout(lyotObj);
		closeNopenLayout();
	};
	
	var updateNopenNew=function(){
		var lyotObj=$(_layoutBuilder).data("layout");
		updateLayout(lyotObj);
		closeNopenNew();
	};
	
	var updateLayout=function(mdlLayout){
		mdlLayout.filters=[];
		mdlLayout.slices=[];
		mdlLayout.rows=[];
		mdlLayout.columns=[];
		mdlLayout.values=[];
		var rowDims=$(".left #rows").find('li[role="dimension"]');
		var colDims=$(".left #columns").find('li[role="dimension"]');
		var slicesDims=$(".left #slices").find('li[role="dimension"]');
		var filtersDims=$(".left #filters").find('li[role="dimension"]');
		var valMsrs=$(".left #values").find('li[role="measure"]');
		
		if(rowDims.length > 0){
			$.each(rowDims,function(i,v){
				var dimObj=$(v).data("dimObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.rows.push(obj);
			});
		}
		if(colDims.length > 0){
			$.each(colDims,function(i,v){
				var dimObj=$(v).data("dimObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.columns.push(obj);
			});
		}
		if(slicesDims.length > 0){
			$.each(slicesDims,function(i,v){
				var dimObj=$(v).data("dimObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.slices.push(obj);
			});
		}
		if(filtersDims.length > 0){
			$.each(filtersDims,function(i,v){
				var dimObj=$(v).data("dimObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.filters.push(obj);
			});
		}
		if(valMsrs.length > 0){
			$.each(valMsrs,function(i,v){
				var dimObj=$(v).data("msrObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.values.push(obj);
			});
		}
		
		Util.ajaxPost("home/saveLayout",mdlLayout,function(result){
			Util.showMessage(result.Message);
			if(result.Status){
				
			}else{
				
			}
		});
	};
	
	var saveMdlLayout=function(layoutName){
		var mdlLayout={};
		var mdl=$(_layoutBuilder).data("model");
		mdlLayout.layoutName=layoutName;
		mdlLayout.modelId=mdl.id;
		mdlLayout.filters=[];
		mdlLayout.slices=[];
		mdlLayout.rows=[];
		mdlLayout.columns=[];
		mdlLayout.values=[];
		var rowDims=$(".left #rows").find('li[role="dimension"]');
		var colDims=$(".left #columns").find('li[role="dimension"]');
		var slicesDims=$(".left #slices").find('li[role="dimension"]');
		var filtersDims=$(".left #filters").find('li[role="dimension"]');
		var valMsrs=$(".left #values").find('li[role="measure"]');
		
		if(rowDims.length > 0){
			$.each(rowDims,function(i,v){
				var dimObj=$(v).data("dimObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.rows.push(obj);
			});
		}
		if(colDims.length > 0){
			$.each(colDims,function(i,v){
				var dimObj=$(v).data("dimObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.columns.push(obj);
			});
		}
		if(slicesDims.length > 0){
			$.each(slicesDims,function(i,v){
				var dimObj=$(v).data("dimObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.slices.push(obj);
			});
		}
		if(filtersDims.length > 0){
			$.each(filtersDims,function(i,v){
				var dimObj=$(v).data("dimObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.filters.push(obj);
			});
		}
		if(valMsrs.length > 0){
			$.each(valMsrs,function(i,v){
				var dimObj=$(v).data("msrObj");
				var obj={};
				obj.name=dimObj.name;
				obj.level=$(v).attr("level");
				obj.position=i;
				obj.blockName=$(v).attr("block");
				mdlLayout.values.push(obj);
			});
		}
		
		Util.ajaxPost("home/saveLayout",mdlLayout,function(result){
			Util.showMessage(result.Message);
			if(result.Status){
				
			}else{
				
			}
		});
	};
	
	var createLayout=function(){
		getLayout(_selector);
		getBuilder(_selector);
		excelView.getGrid(".pivoteContainer", {
			minColumns : 200,
			minRows : 50
		});
		
		/*Util.ajaxGet("model/blockdimensions/"+_model.id,function(result){
			
			if(result.Status){
				$("#laoutRgtContainer .header span:nth-child(1)").html("Model:"+_model.name);
				if (result.Blocks ) {
					var ul = recurse(result.Blocks);
					$("#blockfields .box-content").append(ul);
				}
			}else{
				Util.showMessage(result.Message);
			}
		});*/
		
		
		$("#laoutRgtContainer .header span:nth-child(1)").html("Model:"+_model.name);
		if (_model.modelDefinition ) {
			var ul = recurse(_model.modelDefinition.Blocks);
			$("#blockfields .box-content").append(ul);
		}
		//_makeGridEditable(_selector);
	};
	
	var setIndentPosition=function(element,dropedIn) {
		var dims=$('div[data-holder="'+dropedIn+'"]').find("li[role=dimension]");
		if(dims.length >0){
			$.each(dims,function(i,v){
				if(i === 0){
					$(v).find("button").prop("disabled",true);
				}
				$(v).attr("level",i);
				$(v).find("button.indent_rgt_Btn").css("margin-right", (i)*10+"px");
			});
		}
		
	};
	
	var process = function() {
		//_makeGridEditable(_selector);
		
		function place(section,value){
			if(value){
				$.each(value,function(i,v){
					if(section === "values"){
						var dim=$("#blockfields").find('li[role="measure"][block="'+v.blockName+'"][msr-name="'+v.name+'"]');
						var clonedim=$(dim).clone();
						$(clonedim).data($(dim).data());
						$(clonedim).data("belongsTo",$(dim).attr("block"));
						$(clonedim).text(v.blockName+"."+v.name);
						$(clonedim).attr("data-id",$(clonedim).attr("id"));
						$(clonedim).removeAttr("id");
						$('div[data-holder="'+section+'"]').append(clonedim);
						$(dim).siblings('input[type="checkbox"]').prop("disabled",false);
						$(dim).siblings('input[type="checkbox"]').prop("checked",true);
						$(dim).parent("li").removeClass("disable");
						var dimensions=$(dim).closest(".root").find("li.disable");
						$.each(dimensions,function(i,v){
							if($(v).hasClass("disable")){
								$(v).removeClass("disable");
								$(v).find("input[type='checkbox']").prop("disabled",false);
							}
						});
						
					}else{
						
						var dim=$("#blockfields").find('li[role="dimension"][block="'+v.blockName+'"][dim-name="'+v.name+'"]');
						var clonedim=$(dim).clone();
						$(clonedim).data($(dim).data());
						$(clonedim).data("belongsTo",$(dim).attr("block"));
						$(clonedim).text(v.blockName+"."+v.name);
						if(section==="columns" || section === "rows"){
							$(clonedim).prepend('<button class="indent_lft_Btn"><span class="ui-icon  ui-icon-triangle-1-w"></span></button>\
							<button class="indent_rgt_Btn" style="margin-right: '+(v.level)*10+'px;"><span class="ui-icon ui-icon-triangle-1-e"></span></button>');
						}
						$(clonedim).attr("level",v.level);
						$(clonedim).attr("data-id",$(clonedim).attr("id"));
						$(clonedim).removeAttr("id");
						$('div[data-holder="'+section+'"]').append(clonedim);
						$(dim).siblings('input[type="checkbox"]').prop("checked",true);
					}
				});
			}
			
		}
		
		if(_layoutObj){
			$.each(_layoutObj,function(key,val){
				switch(key){
				case "values":
					place("values",val);
					break;
				case "rows":
					place("rows",val);
					break;
				case "columns":
					place("columns",val);
					break;
				case "slices":
					place("slices",val);
					break;
				case "filters":
					place("filters",val);
					break;
				}

			});
			
			createPivotGrid();
			
		}
	};
	
	//Public Functions
	
	this.getAllModelLayouts=function(Model,selector){
		_model=Model;
		_selector=selector;
		var div=$("<div id='layoutList'></div>");
		Util.ajaxGet("home/layouts/"+Model.id,function(result){
			if(result.length > 0){
				$.each(result,function(i,v){
					var p=$("<p/>");
					$(p).data("layoutInfo",v);
					$(p).on("click",function(){
						$("#layoutList").find("p").removeClass("selected_layout");
						$(this).addClass("selected_layout");
					});
					$(p).append(v.layoutName);
					$(div).append(p);
				});
				$(div).dialog({
					width:700,
					height:400,
					open:function(){
						
					},
					close:function(){
						$(this).dialog("destroy");
					},
					buttons:{
						Open:function(){
							_layoutObj=$(".selected_layout").data("layoutInfo");
							$(this).dialog("close");
							if ($(_layoutBuilder).hasClass('ui-dialog-content')) {
								if($(_layoutBuilder).data("isNew")){
									Util.promptDialog("Do you want save the layout",saveNopenLayout,closeNopenLayout);
								}else{
									Util.promptDialog("Do you want save the layout",updateNopenLayout,closeNopenLayout);
								}
							}else{
								openLayout();
							}
						},
						Cancel:function(){
							$(this).dialog("close");
						}
					}
				});
			}else{
				Util.showMessage("This Model doesnt have Layouts");
			}
		});
	};

	var _makeGridEditable=function(selector){
		
		$(selector+' td.input').unbind("click");
		$(document).on('click',selector+' td.input',function(e) {
			var element = $(this);
			element.closest("tbody").find("td.cellfocus").removeClass("cellfocus");
			element.addClass("cellfocus");
			//var position=element.offset();
			//$(".input-box").css({"top" : position.top+"px","left":position.left+"px","max-width":"none","max-height":"none","width":element.width(),"height":element.height()-2+"px","overflow": "hidden" });
			var msr=$(element).data();
			var OriginalContent = $(element).text();
			 $(this).html("<input type='text' value='" + OriginalContent+ "' style='width:100%;height:100%;' placeholder='"+msr.name+"'/>");
			 $(this).children().first().focus();
			$(element).children().first().blur(function() {
				var newContent = $(this).val();
				$(this).parent().data("measure", newContent);
				$(this).parent().text(newContent);
				//$(this).parent().text(OriginalContent);
			});
		});
	};
	
	
	this.newLayout=function(Model,selector){
		_model=Model;
		_selector=selector;
		
		if ($(_layoutBuilder).hasClass('ui-dialog-content')) {
			if($(_layoutBuilder).data("isNew")){
				Util.promptDialog("Do you want save the layout",saveNopenNew,closeNopenNew);
			}else{
				Util.promptDialog("Do you want save the layout",updateNopenNew,closeNopenNew);
			}
			
		} else {
			createLayout();
			$(_layoutBuilder).dialog( "option", "title", "New Layout" );
			$(_layoutBuilder).data("model",Model);
			$(_layoutBuilder).data("isNew",true);
		}
	};
	
	this.saveLayout=function(){
		save();
	};
	this.closeLayout=function(){
		if ($(_layoutBuilder).hasClass('ui-dialog-content')) {
			Util.promptDialog("Do you want save the layout",save,close,function(){});
		}
	};
	this.openBuilder=function(){
		
		if ($(_layoutBuilder).hasClass('ui-dialog-content')) {
			var isOpen = $(_layoutBuilder).dialog( "isOpen" );
			if(!isOpen){
				$(_layoutBuilder).dialog("open");
			}
		} else {
		    // it is not initialized yet
		}
	};
	
	return this;
	
})(jQuery);
