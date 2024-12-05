;(function($) {
    $.fn.getCursorPosition = function() {
        var input = this.get(0);
        if (!input) return; // No (input) element found
        if ('selectionStart' in input) {
            // Standard-compliant browsers
            return input.selectionStart;
        } else if (document.selection) {
            // IE
            input.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -input.value.length);
            return sel.text.length - selLen;
        }
    };

    $.fn.setCursorPosition = function (pos) {
        this.each(function (index, elem) {
            if (elem.setSelectionRange) {
                elem.setSelectionRange(pos, pos);
            } else if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        });
        return this;
    };
})(jQuery);





var LayoutControl = VidiViciControl.extend({


	constructor : function(options){
		VidiViciControl.apply(this,arguments);

		if("undefined" != typeof options){
			if("undefined" != typeof options.model){this.Model= options.model;}
			else { this.Model=null; }
			if ("undefined" != typeof options.selector) { this.selector = options.selector; }
			else { this.selector=null; }
			if ( "undefined" != typeof options.blockDef) { this.blockDef = options.blockDef; }
			else { this.blockDef=null; }
		}else{
			this.Model=null;
			this.modelId=null;
			this.blockDef=null;
			this.selector=null;
			this.vappId = null;
			this.workspaceId = null;
		}
		var c = this;
		c.showMsrLbls = true;
		
		this.layoutBuilder = null;
		this.layoutType = "default";
		this.editedCells = {};
		this.blocks = [];
		this.columnHeaders = {};
		this.sheet = new excelView();
		this.fieldAnnotation = false;
		this.isFilterable = true;
		this.colHierarchy = {};
		this.colSpans = [];
		this.colsAtLevel = [];
		this.ttlNrmColsAtLevel = [];
		this.aggAtLevel = [];
		this.rowNcolDims = {};
		this.filteredData = {};
		this.filteredAggData = {};
		this.colOreFltrDta = {};
		this.colOreAggFltrDta = {};
		this.dataFmtter = new VdVcDataFmtManager();
		this.onClick=function(element){
			var input =$(element).find("textarea");
			if(input && input.length > 0){
				return false;
			}
			var attr= c.getAttributes();
			var msr=$(element).data("msrObj");
			var compound=$(element).data("root");
			var inpVal = $(element).text().trim();
			if (msr.dataType == "Percentage" && inpVal != "") {
				inpVal += "%";
			}
			var dataValidator = new VdVcDtaValidationMgr();
			var dataObj = c.dataFmtter.handleDataFormat(inpVal, msr);
			var OriginalContent = dataObj.unFmtData;
			if (dataObj.dataType == "Percentage") {
				if ( !isNaN(parseFloat(dataObj.unFmtData))) {
					 dataObj.unFmtData = dataObj.unFmtData * 100;
					 OriginalContent = dataObj.unFmtData+"%";
				 }
			}
			var parent = $(element).closest(".gridWrapper");
			var inputHolder = parent.find(".InputHolder");
			var css = {};
			var css1={};
			css.display = "block";
			css.position="absolute";
			css1.width = $(element).outerWidth()+"px";
			css1.height = $(element).outerHeight()+"px";
			css1["max-width"] = "400px";
			css1["min-width"] = $(element).outerWidth()+"px";
			css1.visibility="visible";
			var ofcet = $(element).offset();


			inputHolder.css(css).offset({"left":ofcet.left,"top":ofcet.top});
			inputHolder.find("textarea").css(css1);

			inputHolder.find("textarea").focus();
			inputHolder.find("textarea").off('click').click(function(e){
				 e.stopPropagation();
			});
			inputHolder.find("textarea").val(OriginalContent);
			inputHolder.find("textarea").setCursorPosition(1);
			inputHolder.find("textarea").data("cell",$(element));
			inputHolder.find("textarea").keypress(function(e) {
				e.stopPropagation();
			 });

			inputHolder.find("textarea").off('keydown').keydown(function(e) {
				 var parent = $(this).data("cell");
				 switch (e.keyCode) {
					// left arrow
					case 37:
						e.stopPropagation();
						var cursorPosition = $(this).getCursorPosition();
						if(cursorPosition == 0){
							e.preventDefault();
						}
						break;
					// right arrow
					case 39:
						e.stopPropagation();
						var cursorPosition = $(this).getCursorPosition();
						var inputVal = $(this).val().trim();
						if(cursorPosition == inputVal.length){
							e.preventDefault();
						}
						break;
					// down arrow
					case 40:
						e.stopPropagation();
						e.preventDefault();
						break;
					// up arrow
					case 38:
						e.stopPropagation();
						e.preventDefault();
						break;
					case 27:
						e.stopPropagation();
						$(this).val(parent.data("cellVal"));
						//$(this).trigger("blur");
						parent.focus();
						break;
					case 8:
						e.stopPropagation();
						break;
					case 13:
						e.preventDefault();
						parent.focus();
						var press = $.Event("keydown");
						if(e.shiftKey){
							press.shiftKey=true;
						}
						press.keyCode = 13;
						parent.trigger(press);
						break;
					case 9:
						e.preventDefault();
						parent.focus();
						var press = $.Event("keydown");
						if(e.shiftKey){
							press.shiftKey=true;
						}
						press.keyCode = 9;
						parent.trigger(press);
						break;
					default:
						var value = $(this).val();
						var span = $(this).closest(".gridWrapper").find(".tempInputHolder");
						span.css('font-size',$(this).css('font-size')+"px");
						span.text(value);
						var currentwidth = $(span).outerWidth();
						var cellHeight = $(parent).outerHeight();
						var cellWidth = $(parent).outerWidth();
						if(cellHeight < this.scrollHeight){
							//this.style.height = this.scrollHeight + "px";
						}
						if(cellWidth < currentwidth && currentwidth < 400){
							this.style.width = currentwidth + "px";
						}
						e.stopPropagation();
						break;
					}

			 });
			 inputHolder.find("textarea").off('blur').blur(function() {

				 $(this).parent().css("display","none");
				 var isValid = dataValidator.validate($(this).val().trim(), msr);
				 if (!isValid) {
					Util.showMessage($(this).val().trim() +" is not Valid");
					$(this).val($(element).data("cellVal"));
				 }
				 dataObj = c.dataFmtter.handleDataFormat($(this).val().trim(), msr);
				 var newContent = dataObj.unFmtData;
				 compound[msr.name]=newContent;
				 compound[msr.name+".ORG"]=$(this).val().trim();
				 var cell =  $(this).data("cell");
				 cell.removeClass("editing");
				 cell.data("measure", newContent);
				 if (dataObj.isNumber) {
					 cell.addClass("vdvc-number");
				 }else {
					 cell.removeClass("vdvc-text");
				 }
				 cell.text(dataObj.fmtData);

				 var grid = cell.closest(".gridBody");
				 var colHeader=grid.siblings('.gridHeader');
				 var rowHeader=grid.siblings('.rowHeader');
				 colHeader.find('table col:eq('+cell.index()+')').css("width",$(this).outerWidth()+"px");
				 grid.find('table col:eq('+cell.index()+')').css("width",$(this).outerWidth()+"px");

				 var row_no = $(cell).parent().attr("row-no");
				 rowHeader.find('table tr[row-no="'+row_no+'"]').css("height",cell.outerHeight()+"px");

				 if(Util.parseBoolean(attr["field-annotation"])){
					 //cell.addClass("lc-field-commnet");
				 }
				 if( newContent !== null  && typeof newContent !== "undefined" ){
						delete compound.children;
						console.log(JSON.stringify([compound]));
						c.saveCell([compound],cell,newContent);
				 }
			});
		};
		this.permissions=null;
		this.editedValues=[];
	},
	saveCell : function(data ,cell,value) {
		var c = this;
		var oldVal = cell.data("cellVal");
		var screen=c.getScreen();
		var model= screen.getModel();
		var modelId = model.id;
		var vappId = c.vappId;
		var workspaceId = c.workspaceId;
		if (value != oldVal){
			 $(cell).addClass("edited");
			if (modelId || (vappId && workspaceId )){
				var url ="layout/savedata/model/"+modelId;
				if (c.mode != "design") {
					url = "workspace/change/"+vappId+"/"+workspaceId;
				}
				Util.ajaxPost(url,data,function(result) {
				    if (!result.Status) {
					   Util.showMessage(result.Message);
					} else {
						if(window.vAppController) {
							if(vAppController.vapp) {
								vAppController.vapp.isChanged = true;
							}
						}
						cell.data("cellVal",value);
						var node = cell.attr("nodeid");
						c.editedCells[node] = data[0];
						console.log(JSON.stringify(c.editedCells));
					}
				});
			}
		}
	},
	setModelId:function(modelId){
		this.modelId = modelId;
	},
	getModelId:function(){
		return this.modelId;
	},
	setSelector:function(selector){
		this.selector = selector;
	},

	getSelector:function(){
		return this.selector;
	},

	setModel:function(model){
		this.Model = model;
	},

	getModel:function(){
		return this.Model;
	},

	setBlockDef:function(blockDef){
		this.blockDef = blockDef;
	},

	getBlockDef:function(){
		return this.blockDef;
	},

	eanbleAnnotations : function() {
		var c = this;
		var parent = c.selector;

		$(document).off("click",parent+" .fa-comment");
		$(document).on("click",parent+" .fa-comment",function(e) {
			e.stopPropagation();
			var element = $(parent).find(".cellfocus");
			var nodeId = element.attr("nodeid");
			if (nodeId) {
				var annotationMgr = new AnnotationManager(nodeId);
				annotationMgr.show(nodeId);
				var nodes = $(parent).find('td[nodeid="'+nodeId+'"]');
				annotationMgr.saveCallBack = function() {
					if (nodes) {
						nodes.addClass("lc-field-commnet");
					}
				};
			}
		});
	},

	launchConfig : function (customData) {

		var c = this;
		console.log ("Launch layout configuration invoked ...!!");
	    var selector = ".LayoutControlConfig";
		var model = c.getScreen().model;
		var attributes = c.getAttributes();
		var options ={};
		options.model=model;
		options.blockDef=c.blockDef;
		options.selector=selector;
		var lc = new LayoutControl(options);
		lc.mode = "design";
	    lc.designerData = customData;
	    lc.attributes = attributes;

	    this.propmtLayoutConfig(
	    		c.name,
				function(){
					lc.LaunchControl();
				},function(){
					var data = lc.saveControl();
					c.setCustomDesignerData(data);
					$(c.launchLayoutDlg).dialog("close");
					c.render();

				}, function(){
					var data = lc.saveControl();
					Util.promptDialog ("Do you want to save the changes ?",
					function(){
						c.setCustomDesignerData(data);
						c.render();
						$(c.launchLayoutDlg).dialog("close");
					},
					function(){
						$(c.launchLayoutDlg).dialog("close");
					},
					null
					);
				},
				function() {
					lc.layoutBuilder.dialog("destroy");
				}
			);
	},

	propmtLayoutConfig : function (title, onOpen,save,cancel,close){

		var c = this;
		var configUi = $('<div ui-role="LayoutControlConfig" class="LayoutControlConfig" ></div>');
		var isExist = $('body').find('div[ui-role="LayoutControlConfig"]');

		if (isExist.length != 0){
			return;
		}

		var dlgButtons = {};
		var dlg;
		dlg = $(configUi).dialog({
			      modal: true,
			      width: window.innerWidth-100,
			      height:window.innerHeight-100,
			      title: title,
			      resizable: false,
			      open: function(){
			    	 if(typeof onOpen === "function"){
			    		 onOpen();
			    	 }
			      },
			      close:function(){
			    	  if(typeof close === "function"){
			    		  close();
			    	  }
			    	  $( this ).dialog( "destroy" );
			      },
			      buttons: dlgButtons
		    });

		addButton($(dlg), dlgButtons, "Save", save);
		addButton($(dlg), dlgButtons, "Cancel", cancel);

		c.launchLayoutDlg = dlg;

		$(dlg).dialog({buttons:dlgButtons});

		function addButton(dlg, map, key, fn) {
			if ("function" == typeof fn) {
				map[key] = function(arg1, arg2) {
				     fn();
				 //    $(dlg).dialog("close");
				};
			}
		}
	},

	addEvents : function(){

		var c = this;
		Control.prototype.addEvents.call(this,c.selector);
		if (c.selector) {
			var parent = c.selector;

			$(document).off("click",parent+ " .fa-history").on("click",parent+ " .fa-history",function(e) {
				e.stopPropagation();
				var historyManager = new HistoryManager();
				var element = $(parent).find(".cellfocus");
				var nodeId = element.attr("nodeid");
				if (nodeId) {
					historyManager.show(nodeId);
				}

			});

			$(document).off("dblclick",parent+" .ui-tabs-anchor");
			$(document).on("dblclick",parent+" .ui-tabs-anchor",function(event){
				event.stopPropagation();
				var tab = this;
				var OriginalContent = $(tab).text();
				 $(tab).html("<input type='text' value='" + OriginalContent+ "' style='width:100%;height:100%;' />");
				 $(tab).children().first().focus();
				$(tab).children().first().blur(function() {
					var newContent = $(this).val();
					if( newContent !== null  && typeof newContent !== "undefined" && newContent.trim() !=="" ){
						$(this).parent().text(newContent);
					}else{

						$(this).parent().text(OriginalContent);
					}
				});
			});

			$(document).off("click",parent+" .gridWrapper .ui-icon");
			$(document).on("click",parent+" .gridWrapper .ui-icon",function(event) {
				event.stopPropagation();
				var children=$(this).data("children");
				var sheet = $(this).closest("div.lc-tabs");
				var tr=$(this).closest("tr");
				var level=$(tr).attr("level");
				var rows=$(tr).nextUntil('tr[level="'+level+'"]');

				if(typeof children=== "undefined"){
					children=[];
					$(this).data("children",children);
				}

				if(rows.length>0){
					if($(this).hasClass("ui-icon-minusthick")){
						$.each(rows,function(i,v){
							if($(v).css("display") !== "none"){
								var rowNo=$(v).attr("row-no");
								children.push(rowNo);
								$(sheet).find('tr[row-no="'+rowNo+'"]').hide();
							}
						});
					}
					if($(this).hasClass("ui-icon-plusthick")){
						$.each(children,function(i,v){
							$(sheet).find('tr[row-no="'+v+'"]').show();
						});
						$(this).data("children",[]);
					}
				}
				$(this).toggleClass("ui-icon-minusthick").toggleClass("ui-icon-plusthick");
			});
		}
	},

	bindBuilderEvents : function() {
		var c = this;
		if (c.layoutBuilder) {

			c.layoutBuilder.find(' .dragdata li input[type="checkbox"]').off("change");
			c.layoutBuilder.find(' .dragdata li input[type="checkbox"]').on("change",function(event) {
				event.stopPropagation();
				
				var isChkd = $(this).is(":checked");
				var role = $(this).siblings("li.ui-draggable").attr("role");
				var elementId = $(this).siblings("li.ui-draggable").attr("id");
				if (!isChkd) {
					c.removeDimension(elementId);
					c.renderGrid();
				} else if(isChkd && role == "measure"){
					c.addMeasureToValues(elementId);
				}
			});

			
			c.layoutBuilder.find('.layoutType input[type="checkbox"]').off("change");
			c.layoutBuilder.find(' .layoutType input[type="checkbox"]').on("change",function(event) {
				event.stopPropagation();
				
				if ($(this).val() == "msrLabels") {
					
					if ($(this).is(":checked")) {
						c.showMsrLbls = true;
					} else {
						c.showMsrLbls = false;
					}
				} else if ($(this).is(":checked")) {
					$(this).siblings(".lt").prop('checked',false);
					c.layoutType = $(this).val();
				} else {
					c.layoutType = "default";
				}
				c.renderGrid();
			});

			c.layoutBuilder.find('.dragdata li input[type="checkbox"]').off("click");
			c.layoutBuilder.find('.dragdata li input[type="checkbox"]').on("click",function(event) {
				event.stopPropagation();
				var flag = $(this).prop("checked");
				var role = $(this).siblings("li.ui-draggable").attr("role");
				if (flag && role != "measure") {
					return false;
				}
			});

			c.layoutBuilder.find(" .box-header .ui-icon").off("click");
			c.layoutBuilder.find(" .box-header .ui-icon").on("click",function(event) {
				event.stopPropagation();
						$(this).toggleClass("ui-icon-minusthick").toggleClass(
								"ui-icon-plusthick");
						$(this).parents(".box:first").find(".box-content").toggle();
			});

			c.layoutBuilder.find(" button.indent_rgt_Btn").off("click");
			c.layoutBuilder.find(" button.indent_rgt_Btn").on("click",function(event) {
				event.stopPropagation();
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
						c.renderGrid();
					}

				}
			});

			c.layoutBuilder.find(" button.indent_lft_Btn").off("click");
			c.layoutBuilder.find(" button.indent_lft_Btn").on("click",function(event) {
				event.stopPropagation();
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
						c.renderGrid();
					}
				}
			});

		}
	},

	
	orderRows : function(rows) {
		var c = this,
		orderedRows = [],
		clonedRows = $.extend(true,{},rows);
		if(c.sortOrder && $.isArray(c.sortOrder) && clonedRows) {
			$.each(c.sortOrder,function(i,v){
				if($.isArray(v)) {
					$.each(clonedRows,function(k,row){
						if (v[0] == row.value) {
							orderedRows.push(row);
							delete clonedRows[k];
							return false;
						}
					});
				}
			});	
			if (!$.isEmptyObject(clonedRows)) {
				$.each(clonedRows,function(i,obj){
					orderedRows.push(obj);
				});
			}
		}
		if (orderedRows.length > 0) {
			rows = orderedRows;
		}
		return rows;
	},
	
	getRowsData :function(){

		var c= this;
		if(c.layoutBuilder){
			var rows=c.layoutBuilder.find("div[data-holder='rows']").find("li.ui-draggable");
			var row=[];
			var a=[];
			$.each(rows,function(index,object){
				var id =$(object).attr("data-id");
				var dim=c.layoutBuilder.find("#"+id).data("dimObj");
				var currentLevel=$(object).attr("level");
				if (typeof row[index] == "undefined" ) {
					row[index] = [];
				}
				var values=dim.values.slice(0);
				$.each(values,function(i,v){
					var cell={};
					cell.root={};
					var parentDim=$(object).prevAll('li[level="'+(currentLevel-1)+'"]');
					var childDim=$(object).nextAll('li[level]');
					if(parentDim.length>0){
						cell.parent=$(parentDim[0]).attr("dim-name");
					}else{
						cell.parent=null;
					}
					if(childDim.length>0){
						cell.children=[];
						$.each(childDim,function(l,k){
						if(currentLevel < $(k).attr("level")){
							var obj={};
							var id=$(k).attr("data-id");
							var dimobj=c.layoutBuilder.find("#"+id).data("dimObj");
							obj[dimobj.name]="*";
							cell.children.push(obj);
						}else{
							return false;
						}
						});
					}else{
						cell.children=null;
					}
					cell.level=$(object).attr("level");
					cell.block=$(object).attr("block");
					cell.dimName=dim.name;
					cell.value=v;
					cell.root[dim.name]=v;
					cell.root["children"]=cell.children;
					cell.editable=true;
					row[index].push(cell);
				});
			});

			if (row.length > 0) {
				a = row[0];
				for(var i=0;i<row.length;i++){
					a=c.createRows(a,row[i+1]);
				}
			}
			
			a = c.orderRows(a);
			
			return a;
		}

	},

	createRows:function(a1,a2){
		var c = this;
		var newarray=[];
		if (typeof a1 !== "undefined" ) {
			$.each(a1,function(i,v){
				newarray.push(v);
				if (typeof a2 !== "undefined" ) {
					$.each(a2,function(index,val){
						val.type = "normall";
						if(v.dimName === val.parent){
							if (v.value !== "*" || val.dimName == "Grp"){

								if (val.dimName == "Grp" && v.value == "*"){
									val.type = "aggregates";
								}
								v.editable=false;
								var temp = val.root.children;
								val.root=$.extend({}, val.root, v.root);
								val.root.children = temp;
								var cell = JSON.parse(JSON.stringify(val));
								cell.parentVal = v.value;
								newarray.push(cell);
							}
						}
					});
				}
			});
		}
		a1=newarray;
		return a1;
	},

	setColumnHierarchy : function() {

		var c = this;
		c.colHierarchy = {};
		var columns = c.layoutBuilder.find(" div[data-holder='columns']").find("li.ui-draggable");
		$.each(columns,function(index,object){
			//var id =$(object).attr("data-id");
			//var dimObj=$(parent).find("#"+id).data("dimObj");
			var level = $(object).attr("level");
			if(typeof c.colHierarchy[level] == "undefined"){
				c.colHierarchy[level]=[];
			}
			c.colHierarchy[level].push(object);
		});
	},

	SubColums : function(dims,level) {

		var c = this;
		var colsAtLevel = c.colsAtLevel;
		var obj = {};
		obj["aggCols"] = 0;
		obj["normCols"] = 0;
		obj["totalNormCos"] = 0;

		if(dims && dims.length > 0) {
			$.each(dims,function(i,v){
				var id =$(v).attr("data-id");
				var dimObj=c.layoutBuilder.find("#"+id).data("dimObj");
				if(c.hasAggregate(dimObj.values)){
					obj["aggCols"] = obj["aggCols"]+1;
					obj["normCols"] = obj["normCols"]+(dimObj.values.length-1);
				} else {
					obj["normCols"] = obj["normCols"]+(dimObj.values.length);
				}
			});
			if (colsAtLevel.length > 0) {
				obj["totalNormCos"] = colsAtLevel[level-1]*obj["normCols"];
			} else {
				obj["totalNormCos"] = obj["normCols"];
			}
		}
		return obj;
	},

	ColsAtEachLevel: function() {
		var c = this;
		c.colsAtLevel = [];
		c.aggAtLevel = [];
		c.ttlNrmColsAtLevel = [];
		if (!$.isEmptyObject(c.colHierarchy)) {
			var cols = Object.keys(c.colHierarchy);
			$.each(cols,function(i,v){
				var dims = c.colHierarchy[i];
				var subColums = c.SubColums(dims,i);
				c.colsAtLevel.push(subColums["normCols"]);
				c.aggAtLevel.push(subColums["aggCols"]);
				c.ttlNrmColsAtLevel.push(subColums["totalNormCos"]);
			});
		}
	},

	TotalTableCols : function() {

		var c = this;
		var colSpans = c.colSpans;
		var colsAtLevel = c.colsAtLevel;
		var aggAtLevel = c.aggAtLevel;
		var count = 0;
		if (colSpans.length > 0 && colsAtLevel.length > 0 && aggAtLevel.length > 0) {
			count = colsAtLevel[0]*colSpans[0]+aggAtLevel[0];
		}
		return count;
	},

	computeColSpans: function() {

		var c = this;
		c.ColsAtEachLevel();
		var colsAtLevel = c.colsAtLevel.reverse();
		var aggAtLevel = c.aggAtLevel.reverse();
		c.colSpans = [];
		if (!$.isEmptyObject(c.colHierarchy)) {
			var cols = Object.keys(c.colHierarchy);
			cols.reverse();
			$.each(cols,function(i,v){
				if(i==0){
					c.colSpans.push(1);
				}else {
					var prevColspan = c.colSpans[i-1];
					var value = prevColspan*colsAtLevel[i-1]+aggAtLevel[i-1];
					c.colSpans.push(value);
				}

			});
		}
		c.aggAtLevel.reverse();
		c.colsAtLevel.reverse();
		c.colSpans.reverse();
		return c.colSpans;
	},

	createColumn: function(dim) {
		var c = this;
		var id =$(dim).attr("data-id");
		var dimObj=c.layoutBuilder.find("#"+id).data("dimObj");
		var col = [];
		$.each(dimObj.values, function(i,v){
			var cell = {};
			cell["dim"] = dim;
			cell["value"] = v;
			cell["type"] = "normal";
			if(v == "*") {
				cell["type"] = "agg";
			}
			col.push(cell);
		});
		return col;
	},


	/*
	 getColumnsData:function(){
		var c = this;
		var parent = c.getSelector();
		var colsAtLevel = c.colsAtLevel;

		var level={};
		var columns = $(parent).find(" div[data-holder='columns']").find("li.ui-draggable");
		var col=[];
		var col1=[];

		if (!$.isEmptyObject(c.colHierarchy)) {
			$.each(c.colHierarchy,function(i,dimlist){
				var l=col1[i];
				$.each(dimlist,function(indx,dim){
					if (l) {
						col1[i]=l.concat(c.createColumn(dim));
					} else {
						col1[i]=c.createColumn(dim);
					}
				});
				if (i > 0 && colsAtLevel.length > 0) {
					var noColsAtLevel = colsAtLevel[i-1];
					var newValues = [];
					for (var k=0;k < noColsAtLevel; k++) {
						newValues = newValues.concat(col1[i]);
					}
					col1[i] = newValues;
				}
			});
		}

		$.each(columns,function(index,object){
			var id =$(object).attr("data-id");
			var dimObj=$(parent).find("#"+id).data("dimObj");
			var l=level[$(object).attr("level")];
			if(l){
				level[$(object).attr("level")]=l.concat(dimObj.values);
			}else{
				level[$(object).attr("level")]=dimObj.values;
			}

		});
		$.each(level,function(key,val){
			col[key]=val;
		});
		return col;
	},
	 */


	getColumnsData:function(){
		var c = this;
		var ttlNrmColsAtLevel = c.ttlNrmColsAtLevel;
		var col=[];
		if (!$.isEmptyObject(c.colHierarchy)) {
			$.each(c.colHierarchy,function(i,dimlist){
				$.each(dimlist,function(indx,dim){
					if (col[i]) {
						col[i]=col[i].concat(c.createColumn(dim));
					} else {
						col[i]=c.createColumn(dim);
					}
				});
				if (i > 0 && ttlNrmColsAtLevel.length > 0) {
					var noColsAtLevel = ttlNrmColsAtLevel[i-1];

					var newValues = [];
					for (var k = 0; k < noColsAtLevel; k++) {
						newValues = newValues.concat(col[i]);
					}
					col[i] = newValues;
				}
			});
		}
		return col;
	},

	hasAggregate : function(data) {
		var hasAgg = false;
		if ( data && data.length > 0) {
			var index = data.indexOf("*");
			if(index > -1){
				hasAgg = true;
			}
		}
		return hasAgg;
	},

	getColumnInfo:function(msrs) {

		var c = this;
		c.setColumnHierarchy();
		var colspans = c.computeColSpans();
		var cols=c.getColumnsData();
		var noOfCols = c.TotalTableCols();
		if (c.layoutType == "interleaved" && msrs) {
			var NoOfMsrs = msrs.length || 1;
			$.each(colspans,function(i,colspan){
				colspans[i] = colspan*NoOfMsrs;
			});
			noOfCols *= NoOfMsrs;
		}
		return {
			colspans : colspans,
			TotalNoOfColumns : noOfCols,
			columns:cols
		};
	},

	addLevel:function(element, level,TotalNoOfRows,agg) {
		if(element.length > 0) {
			$(element).attr("level", level);
			var letter = $(element).attr("cell-id").match(/\D+/);
			var no = $(element).attr("cell-id").match(/\d+/);
			var row = $(element).parent();
			row.nextAll().each(function(i, value) {
				var n = parseInt(no) + i + 1;
				if(n <= TotalNoOfRows ){
					var cell = $(value).find('td[cell-id="' + letter + n + '"]').attr("level", level);
					if(agg) {
						$(cell).addClass("aggregates");
					}

				}else{
					return false;
				}
			});
		}
	},

	addCellInfo : function(cell,type,data,from,to,agg){

		if(type === "col"){
			
			var block=data.attr("block");
			var dimname=data.attr("dim-name");
			var cellVal=$(cell).text();
			var cellType = $(cell).hasClass("total");
			var table = $(cell).closest("tbody");
			var colgroup=$(table).find("tr").slice(from,to);
			var index = $(cell).index();
			$.each(colgroup,function(i,v){
				var td=$(v).children('td:eq(' + (index-1) + ')');
				//$(td).css("background","blue");
				if (agg){
					$(td).addClass(agg);
				}
				var root=$(td).data("root");
				var obj={};
				obj["BlockName"]=block;
				if(cellType){
					obj[dimname]="*";
				}else{
					obj[dimname]=cellVal;
				}
				if(jQuery.isEmptyObject(root)){
					$(td).data("root",obj);
				}else{
					var newObj=$.extend({}, root, obj);
					$(td).data("root",newObj);
				}
			});
		}
		if(type ==="row"){

			data.root["BlockName"]=data.block;
			var rowGroup=$(cell).nextAll();
			$.each(rowGroup,function(i,v){
				var root=$(v).data("root");
				if(jQuery.isEmptyObject(root)){
					$(v).data("root",data.root);
				}else{
					var newObj=$.extend({}, root, data.root);
					$(v).data("root",newObj);
				}
			});
		}

		if (type == "msr") {
			
			var table=$(cell).closest("tbody");
			var colgroup=$(table).find("tr").slice(from,to);
			var index = $(cell).index();
			$.each(colgroup,function(i,v){
				var td=$(v).children('td:eq(' + (index-1) + ')');
				//$(td).css("background","red");

				$(td).data("msrObj",data);
				if (!$(td).hasClass("aggregates")) {
					//$(td).css("background","blue");
					$(td).addClass("input normalcell");
				}
			});
		}
	},

	calculateExtraCols: function(cols) {

		var c = this;
		var extracols = 0;
		var ccolwidth = cols*100;
		var selector = c.getSelector();
		var w = $(selector).width();
		if (ccolwidth < w) {
			extracols = (w-ccolwidth)/100;
		}
		//return Math.round(extracols)+1;
		return 0;
	},

	calculateExtraRows: function(rows) {
		var c = this;
		var extrarows = 0;
		var crowsheight = rows*20;
		var selector = c.getSelector();
		var h = $(selector).height();
		if (crowsheight < h) {
			extrarows = (h-crowsheight)/20;
		}
		//return Math.round(extrarows);
		return 0;
	},

	hideHeaders: function() {
		var c = this,sheet = c.sheet;
		if (sheet) {
			sheet.hideHeaders();
		}
	},

	showHeaders : function() {
		var c = this,sheet = c.sheet;
		if (sheet) {
			sheet.showHeaders();
		}
	},
	
	
	hideGridLines: function() {
		var c = this,sheet = c.sheet;
		if (sheet) {
			sheet.hideGridLines();
		}
	},

	showGridLines : function() {
		var c = this,sheet = c.sheet;
		if (sheet) {
			sheet.showGridLines();
		}
	},

	createPivotGrid : function() {

		var c = this;
		var parent =c.getSelector();
		var attr = c.getAttributes();
		var values = c.layoutBuilder.find("div[data-holder='values']").find("li.ui-draggable");
		var id = $(values[0]).attr("data-id");
		var msrobj = c.layoutBuilder.find("#"+id).data("msrObj");
		var columninfo = c.getColumnInfo(values);
		var rowdata=c.getRowsData();
		var columns=columninfo.columns;
		var columnHeadingLevels = columns.length;
		var colspans = columninfo.colspans;
		var TotalNoOfColumns = columninfo.TotalNoOfColumns || 1;
		var TotalNoOfRows = 0;
		var extcols = c.calculateExtraCols(TotalNoOfColumns);

		if (rowdata.length > 0 ) {
			TotalNoOfRows=rowdata.length*values.length+columnHeadingLevels+values.length;
		} else {
			TotalNoOfRows = values.length+columnHeadingLevels;
		}
		var extrows = c.calculateExtraRows(TotalNoOfRows);

		$(parent).find(".pivoteContainer").empty();
		c.sheet.getGrid(parent+" .pivoteContainer", {
			minColumns : TotalNoOfColumns + 1, //extcols ,
			minRows : TotalNoOfRows,//+extrows,
			editable:attr["editable"],
			OnCellClick:{"input":c.getOnClick()},
			title:attr.title,
			field_annotation:attr["field-annotation"],
			onColResize : function(col){c.OncolResize(col);},
			onRowResize : function(row){c.OnrowResize(row);},
			onColsort : function(col) {c.colSort(col);}
		});

		var table = $(parent).find(".pivoteContainer .lc_master table");
		if (columns.length > 0) {
			for ( var k = 0; k < columns.length; k++) {
				var tr = $(table).find('tbody tr:nth-child(' + (k + 1) + ')');
				var b = 3;
				var column = columns[k];
				var a = 0;
				for ( var l = 0; l < column.length; l++) {
					var _td = $(tr).find('td:nth-child(' + (a + b) + ')');
					if ( $(_td).hasClass("invalid") ) {
						a++;
						_td = $(tr).find('td:nth-child(' + (a + b) + ')');
					}
					var colCell = column[l];
					var dim = colCell["dim"];
					$(tr).addClass("columnHeading ");
					$(_td).addClass("columnHeading");
					if (colCell["type"] == "normal") {
						$(_td).append(colCell["value"]);
						c.addCellInfo(_td,"col",$(dim),columnHeadingLevels,TotalNoOfRows);
						$(_td).attr("colspan", colspans[k]).css("width",(colspans[k])*109-8+"px");

						for ( var d = 0; d < colspans[k] - 1; d++) {
							a++;
							var tdcell = $(tr).find('td:nth-child(' + (a + b) + ')');
							$(tdcell).append(colCell["value"]);
							c.addCellInfo($(tdcell),"col",$(dim),columnHeadingLevels,TotalNoOfRows);
							$(tdcell).hide();
						}
					} else if (colCell["type"] == "agg") {

						var rowNo = $(tr).attr("row-no");
						var aggregateFun="None";
						if(msrobj && typeof msrobj.aggregateFun !== "undefined"){
							aggregateFun=msrobj.aggregateFun+"()";
						}
						$(_td).addClass("columnHeading total").attr("rowspan",columnHeadingLevels-k).append(aggregateFun);
						for(var z=1;z < columnHeadingLevels-k;z++){
						   rowNo++;
						   $('tr[row-no='+rowNo+']').find('td:nth-child(' + (a + b) + ')').addClass("invalid").hide();
						}
						c.addLevel(_td, k + 1,TotalNoOfRows,"aggregates");
					    c.addCellInfo(_td,"col",$(dim),columnHeadingLevels,TotalNoOfRows);
					}
					a++;
				}
			}
		}
		for(var v=0;v<values.length;v++){

			columnHeadingLevels++;
			var block=$(values[v]).attr("block");
			var id = $(values[v]).attr("data-id");
			var msrobj=c.layoutBuilder.find("#"+id).data("msrObj");
			var noOfCols = TotalNoOfColumns;
			var tr = $(table).find('tbody tr:nth-child(' + (columnHeadingLevels) + ')');
			
			
			
			var td = $(tr).find('td:nth-child(2)');
			$(td).css("background","#FCFACE");
			
			
			// Label
			if (msrobj.label && c.showMsrLbls) {
				$(td).append(msrobj.label);
			} else {
				$(td).append(block+"."+msrobj.name);
			}
			
			
			
			
			
			
			
			
			if (rowdata.length > 0) {
				noOfCols = noOfCols+1;
				$(td).attr("colspan",(noOfCols));
				$(td).css("width",(noOfCols*109-8)+"px");
				var nextCells=$(td).nextAll();
				for (var l=0; l < noOfCols-1;l++) {
					$(nextCells[l]).hide();
					if($(nextCells[l]).hasClass("aggregates")){
						$(nextCells[l]).removeClass("aggregates");
					}
				}
			}

			if (rowdata.length > 0) {
				for (var i=0;i<rowdata.length;i++) {
					columnHeadingLevels++;
					var cell = rowdata[i];
					var tr = $(table).find('tbody tr:nth-child(' + (columnHeadingLevels) + ')');
					$(tr).attr("level",cell.level);
					var td = $(tr).find('td:nth-child(2)');
					$(td).css("padding-left", (cell.level)*10+"px");
					c.addCellInfo(td,"row",cell);
					if (cell.value === "*" || cell.type == "aggregates") {
						if (cell.type == "aggregates") {
							$(td).append(cell.value);
						} else {
							if (msrobj && msrobj.aggregateFun){
								cell.func =cell.dimName+"."+msrobj.aggregateFun+"()";
								if (cell.parentVal) {
									cell.func = cell.parentVal+"."+msrobj.aggregateFun+"()";
								}
							}
							$(td).append(cell.func);
						}

						$(td).css("padding-left", (cell.level)*10+20+"px");
						for ( var n = 0; n < TotalNoOfColumns; n++) {
							var tdcell=$(tr).find('td:nth-child(' + (n+ 3) + ')');
							$(tdcell).data("msrObj",msrobj);
							if (!$(tdcell).hasClass("aggregates")) {
								$(tdcell).addClass("aggregates");
							}
						}
					} else {
						if (cell.editable) {

							$(td).append(cell.value);
							$(td).css("padding-left", (cell.level)*10+20+"px");
							for ( var n = 0; n < TotalNoOfColumns; n++) {
								var tdcell=$(tr).find('td:nth-child(' + (n+ 3) + ')');
								$(tdcell).data("msrObj",msrobj);
								if (!$(tdcell).hasClass("aggregates")) {
									$(tdcell).addClass("input normalcell");
								}
							}
						} else {
							var cellwrp = '<div style="width:100%;white-space: nowrap;">\
								<span class="ui-icon ui-icon-minusthick" style="float:left;cursor: pointer;border: 1px solid blue;margin-right: 4px;">\
								</span>'+cell.value+'</div>';
							$(td).append(cellwrp);
							for ( var n = 0; n < TotalNoOfColumns; n++) {
								var tdcell=$(tr).find('td:nth-child(' + (n+ 3) + ')');
								$(tdcell).data("msrObj",msrobj);
								if (!$(tdcell).hasClass("aggregates")) {
									$(tdcell).addClass("aggregates").html(cell.func);
								}
							}
						}
					}
				}
			} else {

				//columnHeadingLevels++;
				var tr = $(table).find('tbody tr:nth-child(' + (columnHeadingLevels) + ')');
				for (var l=0; l < TotalNoOfColumns;l++){
					var tdcell = $(tr).find('td:nth-child(' + (l + 3) + ')');
					$(tdcell).data("msrObj",msrobj);
					if (!$(tdcell).hasClass("aggregates")) {
						$(tdcell).addClass("input normalcell");
					}
				}
			}
		}
	},

	removeCells:function(element, upto) {
		if (upto > 1) {
			upto = upto - 1;
			var index = $(element).index() - 1;
			$(element).parent().nextAll('*:lt(' + upto + ')').each(function(i, value) {
						$(value).find('td:eq(' + index + ')').remove();
	        });
		}
	},

	getBuilder:function(opt){

		var c = this,
			selector = this.getSelector(),
			w =$(selector).width() * 0.4,
			h = $(selector).height() * 0.9;
		c.layoutBuilder = $('<div class="laoutRgtContainer" builder="'+selector+'"></div>');
		var markup='<div class="content">\
			<div class="layoutType">\
				<input type="checkbox" class="lt" value="column" style="margin-right: 3px;">ColumnLayout\
				<input type="checkbox" class="lt" value="interleaved" style="margin-right: 3px;">Interleaved\
				<input type="checkbox" value="msrLabels" style="margin-right: 3px;" checked>Measure Labels\
			</div>\
			<div class="left">\
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
				<div class="box" id="filter">\
					<div class="box-header ui-widget-header">Filters</div>\
					<div class="box-content " data-holder="filter"></div>\
				</div>\
				<div id="slices" class="box">\
					<div class="box-header ui-widget-header">Slices</div>\
					<div class="box-content " data-holder="slices"></div>\
				</div>\
			</div>\
			<div class="right">\
				<div class="blockfields">\
					<div class="box-header ui-widget-header">Blocks</div>\
					<div class="box-content "></div>\
				</div>\
			</div>\
		</div>';
		c.layoutBuilder.dialog({
			autoOpen : opt,
			resizable : false,
			draggable : true,
			closeText: "",
			title : "Layout Builder",
			dialogClass : "layoutBuilder",
			appendTo : "body",
			width : (400 > w) ? 400 : w,
			height : h,//(600 > h) ? 600 : h,
			position : {
				my : 'right top',
				at : 'right top',
				of : selector
			},
			create: function(){
				$(this).append(markup);
				c.makeSortable();
			}
		});

	},

	getLayout : function(){

		var c = this;
		var selector = c.getSelector();
		var attributes = c.attributes;
		$(selector).find(".ctrl-wrapper").remove();

		var ctrlMarkup = '<div class="ctrl-wrapper grid-stack-item-content">\
							<div class="ctrl-toolbar">\
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
								  <span class="fa fa-comment" style="margin:2px;float:right;" title="Comment"></span>\
								  <span class="fa fa-history" style="margin:2px;float:right;" title="History"></span>\
			                      <span class="fa fa-tag" style="margin:2px;float:right;" title="Tag"></span>\
								  <span class="fa fa-comments" style="margin:2px;float:right;" title="Comment"></span>\
								 </div>\
							</div>\
							<div class="ctrl-title"></div>\
							<div class="ctrl-content"></div>\
					  </div>';
		$(selector).append(ctrlMarkup);
		if (attributes["title"]) {
			$(selector).find(".ctrl-title").show().height(20);
			$(selector).find(".ctrl-title").append(attributes["title"]);
		} else {
			$(selector).find(".ctrl-title").hide().height(0);
		}

		$(selector).find(".ctrl-name").append(c.name);


		var controlHeight = $(selector).height();
		var contentHeight = controlHeight-($(selector).find(".ctrl-title").height()+$(selector).find(".ctrl-toolbar").height());

		var id = selector.split("#");
		var markup='<div class="layoutLftContainer">\
			<div class="gridContainer">\
				<div  class="gridtabs tabs-bottom style-grid-tabs">\
					<ul>\
						<li><a href="#'+id[1]+'-tabs-1">Tab 1</a></li>\
					</ul>\
					<div class="tabs-spacer"></div>\
					<div id="'+id[1]+'-tabs-1" class="lc-tabs">\
						<div class="pivoteContainer"></div>\
					</div>\
				</div>\
			</div>\
		</div>';
		$(selector).find(".ctrl-content").height(contentHeight).append(markup);
		$(".pivoteContainer").css("width", $(selector).width() * 1);
		$(selector+" .gridtabs").tabs({});
		$(selector+" .tabs-bottom .ui-tabs-nav,"+selector+" .tabs-bottom .ui-tabs-nav > *").removeClass(
				"ui-corner-all ui-corner-top").addClass("ui-corner-bottom");
		$(selector+" .tabs-bottom .ui-tabs-nav").appendTo(selector+" .tabs-bottom");
		$(selector).find(".lc-tabs").height(contentHeight-25);
	},

	makeSortable:function(){
		var c = this;
		var parent = c.getSelector();
		if (c.layoutBuilder) {
			c.layoutBuilder.find(" div[data-holder='rows'],div[data-holder='columns'],div[data-holder='slices'],div[data-holder='filter']").sortable(
					{
						connectWith : " div[data-holder='rows'],div[data-holder='columns'],div[data-holder='slices'],div[data-holder='filter']",
						cursor : "move",
						helper:"clone",
						revert: "invalid",
						receive : function(event, ui) {
							$(ui.item).siblings('input[type="checkbox"]').prop("checked", true);
						},
						update : function(event, ui) {

								var blockName = $(ui.item).attr("block"),
								    dimName = $(ui.item).attr("dim-name"),
								    dropedOn=$(this).attr("data-holder");

								$(ui.item).text(blockName+"."+dimName);
								switch (dropedOn) {
								case "columns":
									$(ui.item).find('button').remove();
									$(ui.item).prepend('<button class="indent_lft_Btn"><span class="ui-icon  ui-icon-triangle-1-w"></span></button>\
									<button class="indent_rgt_Btn"><span class="ui-icon ui-icon-triangle-1-e"></span></button>');
									$(ui.item).data("children-id", []);
									$(ui.item).attr("parent-id", null);
									$(ui.item).data("parent-id", null);
									c.setIndentPosition($(ui.item),"columns");
									break;
								case "rows":
									$(ui.item).find('button').remove();
									$(ui.item).prepend('<button class="indent_lft_Btn"><span class="ui-icon  ui-icon-triangle-1-w"></span></button>\
									<button class="indent_rgt_Btn"><span class="ui-icon ui-icon-triangle-1-e"></span></button>');
									$(ui.item).data("children-id", []);
									$(ui.item).data("parent-id", null);
									$(ui.item).attr("parent-id", null);
									c.setIndentPosition($(ui.item),"rows");
									break;
								case "slices":
									$(ui.item).find('button').remove();
									break;
								case "filter":
									$(ui.item).find('button').remove();
									break;
								}

						},
						stop:function(){
							c.renderGrid();
						},
						zIndex : 1000000000000,
						appendTo : "body",
						helper : "clone"
						/*helper : function(event, ui) {
							return $('<div class="ui-widget-content">'
									+ $(ui).text() + '</div>');
						}*/
					});

				c.layoutBuilder.find("div[data-holder='values']").sortable(
							{
								connectWith : "div[data-holder='values']",
								cursor : "move",
								revert: "invalid",
								receive : function(event, ui) {

									$(ui.item).siblings('input[type="checkbox"]').prop("checked", true);
									var id=$(ui.item).attr("id");
									c.enablOrDsiablDims(id,"enable");
								},
								update : function(event, ui) {

									if (this === ui.item.parent()[0]){
										var blockName = $(ui.item).attr("block"),
										    msrName = $(ui.item).attr("msr-name");
										$(ui.item).text(blockName+"."+msrName);
									}
								},
								stop:function(event,ui){
									c.renderGrid();
								},
								zIndex : 1000000000000,
								appendTo : "body",
								helper : function(event, ui) {

									return $('<div class="ui-widget-content">'
											+ $(ui).text() + '</div>');
								}
							});

				c.layoutBuilder.find(".box").addClass(
					"ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
					.find(".box-header").addClass("ui-widget-header ui-corner-all")
					.prepend("<span class='ui-icon ui-icon-minusthick'></span>").end()
					.find(".box-content");

				c.layoutBuilder.find(".left").sortable({
						connectWith : " .left",
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

					c.layoutBuilder.find(".blockfields .box-content").droppable({
						greedy : true,
						accept : ".left .box-content li",
						drop : function(event, ui) {
							var elementId = ui.draggable.attr("data-id");
							$("#" + elementId).siblings('input[type="checkbox"]').prop("checked", false);
							c.removeDimension(elementId);
						}
					});
		}


				/*$(parent).find(".layoutLftContainer").resizable({
					handles : "e",
					alsoResizeReverse : ".laoutRgtContainer",
					alsoResize : ".pivoteContainer",
					maxWidth : $(".layoutCotainer").width() * 0.6,
					minHeight : $(".layoutCotainer").height(),
					minWidth : $(".layoutCotainer").width() * 0.3
				});*/

	},

	addMeasureToValues : function(id) {
		var c = this;
		var li = c.layoutBuilder.find("#"+id);
		var holder = c.layoutBuilder.find("div[data-holder='values']");
		var blockName = $(li).attr("block"),
	    msrName = $(li).attr("msr-name");
		var nli = $(li).clone().text(blockName+"."+msrName);
		$(nli).removeAttr("id");
		$(holder).append(nli);
		c.renderGrid();
	},
	
	
	removeDimension :function(id) {

		var c = this;
		var removedType = c.layoutBuilder.find("#"+id).attr("role");
		if(removedType === "measure"){
			c.enablOrDsiablDims(id,"disable");
			c.layoutBuilder.find('.left li[data-id="' + id + '"]').remove();
		}else if(removedType === "dimension"){
			var nextDims=c.layoutBuilder.find('.left li[data-id="' + id + '"]').nextAll();
			if(nextDims.length > 0){
				$.each(nextDims,function(i,v){
					var level=$(v).attr("level");
					if(level >0){
						$(v).attr("level",level-1);
						$(v).find("button.indent_rgt_Btn").css("margin-right", (level-1)*10+"px");
					}
				});
			}
			c.layoutBuilder.find('.left li[data-id="' + id + '"]').remove();
		}
	},

	enablOrDsiablDims:function(id,option){
		var c = this;
		var block=c.layoutBuilder.find("#"+id).closest(".root");
		var dims=$(block).find("li[role=dimension]");
		var msr=c.layoutBuilder.find('.left li[data-id="'+id+'"]');
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
	},

	setBlocks : function(blockName) {
		var c = this;
		if ($.inArray(blockName , c.blocks) == -1) {
			c.blocks.push(blockName);
		}
	},

	recurse:function(data) {
		var c = this;
		var ul = $("<ul/>");
		$.each(data,function(key, value) {

			//c.setBlocks(value.name);
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
						zIndex : 1000000000000,
						appendTo : "body",
						helper : function(event, ui) {
							var blockName = $(this).attr("block");
							//$(this).attr("data-id",$(this).attr("id"));
							return $('<div class="ui-widget-content">'+blockName+'.'+ $(this).text()+ '</div>');
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
							if (isMsrSelected) {
								if(status) {
									return false;
								}
							} else {
								return false;
							}
						}

					});
					_li.uniqueId();
					$(_li).attr("data-id",$(_li).attr("id"));
					_li.css("display", "flex");
					_li.append(v.name);
					_li.data("dimObj",v);
					//_li.data("ranges", v.values);
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
						zIndex : 1000000000000,
						appendTo : "body",
						helper : function(event, ui) {
							var blockName = $(this).attr("block");
							return $('<div class="ui-widget-content">'+blockName+'.'+ $(this).text()+ '</div>');
						},
						start : function(event, ui) {
							var status = $(this).siblings("input[type='checkbox']").prop('checked');
							var role=$(this).attr("role");
							if (!status && role === "dimension") {
								return false;
							}

							// Temporary code needs to be removed
							var measures = c.layoutBuilder.find("div[data-holder='values']").find("li.ui-draggable");
							if (measures && measures.length > 0 ){
								var blkName = $(measures[0]).attr("block");
								var b = $(this).attr("block");
								if (blkName != b) {
									return false;
								}
							}

						}

					});
					_li.uniqueId();
					$(_li).attr("data-id",$(_li).attr("id"));
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
	},



	createLayout :function(opt){

		var c = this;
		var mode = c.getMode();
		var blockdef=c.getBlockDef();
		c.getLayout();
		c.getBuilder(opt);
		if (blockdef) {
			var ul = c.recurse(blockdef);
			c.layoutBuilder.find(".blockfields .box-content").append(ul);
		}

	},

	setIndentPosition:function(element,dropedIn) {
		var c = this;
		var dims=c.layoutBuilder.find('div[data-holder="'+dropedIn+'"]').find("li[role=dimension]");
		if(dims.length >0){
			$.each(dims,function(i,v){
				if(i === 0){
					$(v).find("button").prop("disabled",true);
				}
				$(v).attr("level",i);
				$(v).find("button.indent_rgt_Btn").css("margin-right", (i)*10+"px");
			});
		}

	},

	filterData: function(block,dimension) {

		var c = this;
		var dimPerms= c.getPermissions();
		var values=[];
		var filter = c.getAppliedFilters(block+"."+dimension.name);

		if( dimPerms && dimPerms.length > 0){
			var agg = null;
			$.each(dimPerms,function(i,v){
				if(v.block === block && v.dimension === dimension.name){
					var val = v.value.trim();
					/*if ( filter && filter.length > 0 ) {
						if ( $.inArray(val,filter) != -1 ){
							values.push(val);
						}
					} else if (val !=="") {
						values.push(val);
					}*/
					if(val == "*") {
						agg = val;
					} else {
						values.push(val);
					}

				}
			});
			if(agg) {
				values.push(agg);
			}
			dimension.values=values;
		}
		c[block+"."+dimension.name] = dimension;
	},

	setUserSelections : function (config,value,mode) {
		
		var c = this;
		if (config == "layout_type") {
			c.layoutType = value;
			c.layoutBuilder.find(" .layoutType").find('input[value="'+value+'"]').prop("checked",true);
		}
		
		if(config == "showMsrLbls") {
			c.showMsrLbls = value;
			c.layoutBuilder.find(" .layoutType").find('input[value="msrLabels"]').prop("checked",value);
		}
		
		if (config == "appliedFilters") {
			c.appliedFilters = value;
		}

		if($.isArray(value)){
			$.each(value,function(i,v){
				c.setBlocks(v.blockName);
				if(config === "values"){

					var dim=c.layoutBuilder.find(" .blockfields").find('li[role="measure"][block="'+v.blockName+'"][msr-name="'+v.name+'"]');
					var clonedim=$(dim).clone();
					$(clonedim).data($(dim).data());
					$(clonedim).text(v.blockName+"."+v.name);
					$(clonedim).attr("data-id",$(clonedim).attr("id"));
					$(clonedim).removeAttr("id");
					c.layoutBuilder.find(' div[data-holder="'+config+'"]').append(clonedim);
					if(mode === "Launch"){
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
					}


				}
				if(config === "rows" || config === "columns"){
					var dim=c.layoutBuilder.find(" .blockfields").find('li[role="dimension"][block="'+v.blockName+'"][dim-name="'+v.name+'"]');
					var clonedim=$(dim).clone();
					var dimension=$(dim).data();
					if((mode === "render" || mode === "compare") && dimension.dimObj.name != "Grp"){
						c.filterData(v.blockName,dimension.dimObj);
					}
					$(clonedim).data(dimension);
					$(clonedim).text(v.blockName+"."+v.name);
					if(config==="columns" || config === "rows"){
						$(clonedim).prepend('<button class="indent_lft_Btn"><span class="ui-icon  ui-icon-triangle-1-w"></span></button>\
						<button class="indent_rgt_Btn" style="margin-right: '+(v.level)*10+'px;"><span class="ui-icon ui-icon-triangle-1-e"></span></button>');
					}
					$(clonedim).attr("level",v.level);
					$(clonedim).attr("data-id",$(clonedim).attr("id"));
					$(clonedim).removeAttr("id");
					c.layoutBuilder.find(' div[data-holder="'+config+'"]').append(clonedim);
					if(mode === "Launch"){
						$(dim).siblings('input[type="checkbox"]').prop("checked",true);
					}
				}
			});
		}
	},

	process : function(mode) {

		var c = this;
		var designerData=c.getDesignerData();
		if(typeof designerData !== "undefined" && !jQuery.isEmptyObject(designerData)){
			$.each(designerData,function(key,val){
				c.setUserSelections(key,val,mode);
			});
		}

		c.renderGrid();
	},

	LaunchControl:function(){
		var c = this;
		this.addEvents();
		this.createLayout(true);
		this.process("Launch");
		if (c.layoutBuilder) {
			c.layoutBuilder.dialog("option", "dialogClass", "layoutBuilder no-close");
		}
		c.bindBuilderEvents();
	},

	setDesignerData:function(data){
		this.designerData= data;
	},

	getDesignerData:function(){
		return this.designerData;
	},

	createDimension: function(v,i) {
		var c = this;
		var id =$(v).attr("data-id");
		var dimObj=c.layoutBuilder.find("#"+id).data("dimObj");
		var obj={};
		obj.name=dimObj.name;
		obj.level=$(v).attr("level");
		obj.position=i;
		obj.blockName=$(v).attr("block");

		return obj;
	},

	createMeasure: function(v,i) {
		var c= this;
		var id =$(v).attr("data-id");
		var msrObj = c.layoutBuilder.find("#"+id).data("msrObj");
		var obj={};
		obj.name=msrObj.name;
		obj.level=$(v).attr("level");
		obj.position=i;
		obj.blockName=$(v).attr("block");

		return obj;
	},

	saveControl : function() {
		
		var c = this,mdlLayout = c.designerData || {};
		var type = c.layoutBuilder.find(".layoutType").find('.lt:checked');
		var showMsrLbls = c.layoutBuilder.find(".layoutType").find('input[type="checkbox"][value="msrLabels"]').is(":checked");
		var rowDims = c.layoutBuilder.find(".left #rows").find('li[role="dimension"]');
		var colDims = c.layoutBuilder.find(".left #columns").find('li[role="dimension"]');
		var slicesDims = c.layoutBuilder.find(".left #slices").find('li[role="dimension"]');
		var filtersDims = c.layoutBuilder.find(".left #filters").find('li[role="dimension"]');
		var valMsrs = c.layoutBuilder.find(".left #values").find('li[role="measure"]');

		
		mdlLayout["showMsrLbls"] = showMsrLbls;
		
		if(type.length > 0) {
			mdlLayout["layout_type"] = $(type).val();
		} else {
			mdlLayout["layout_type"] = "default";
		}

		if(rowDims.length > 0){
			mdlLayout.rows=[];
			$.each(rowDims,function(i,v){
				var obj=c.createDimension(v,i);
				mdlLayout.rows.push(obj);
			});
		} else {
			delete mdlLayout.rows;
		}
		if(colDims.length > 0){
			mdlLayout.columns=[];
			$.each(colDims,function(i,v){
				var obj=c.createDimension(v,i);
				mdlLayout.columns.push(obj);
			});
		} else {
			delete mdlLayout.columns;
		}
		if(slicesDims.length > 0){
			mdlLayout.slices=[];
			$.each(slicesDims,function(i,v){
				var obj=c.createDimension(v,i);
				mdlLayout.slices.push(obj);
			});
		} else {
			delete mdlLayout.slices;
		}
		if(filtersDims.length > 0){
			mdlLayout.filters=[];
			$.each(filtersDims,function(i,v){
				var obj=c.createDimension(v,i);
				mdlLayout.filters.push(obj);
			});
		} else {
			delete mdlLayout.filters;
		}
		if(valMsrs.length > 0){
			mdlLayout.values=[];
			$.each(valMsrs,function(i,v){
				var obj=c.createMeasure(v,i);
				mdlLayout.values.push(obj);
			});
		} else {
			delete mdlLayout.values;
		}
		return mdlLayout;
	},

	setOnClick:function(func){
		this.onClick = func;
	},

	getOnClick:function(){
		return this.onClick;
	},

	setPermissions:function(perms){
		this.permissions = perms;
	},

	getPermissions:function(){
		return this.permissions;
	},

	updateData : function() {
		var c = this;
		var screen = c.getScreen();
		if(screen) {
			if ($.isEmptyObject(c.XfilterObjs) ){
				c.XfilterObjs = screen.getXfilterObj();
			}
			if($.isEmptyObject(c.dataSets)){
				c.dataSets = screen.getDataSet();
			}
			if ($.isEmptyObject(c.aggXfilterObjs) ){
				c.aggXfilterObjs = screen.getAggXfilterObj();
			}
			if($.isEmptyObject(c.aggDataSets)){
				c.aggDataSets = screen.getAggDataSet();
			}
		}
	},

	renderLayout : function() {
		
		var c = this;
		var el = c.renderContainer();
		var attr = c.attributes;
		el.find(".layoutLftContainer").remove();
		el.find(".ui-dialog").remove();
		
		el = Control.prototype.renderLayout.call(this);
		
		$.each(attr,function(key,val){
			switch(key){
			case "editable":
				break;
			case "title":
				el.find(".title").append(val);
				break;
			}
		});
		var id=$(el).attr("id");
		c.setSelector("#"+id);
		
		return el;
	},

	renderGrid : function() {

		var c = this,type = c.layoutType;
		switch(type) {
		case "column" :
			c.createColumnGrid();
			break;
		case "interleaved":
			c.createInterLeavedGrid();
			break;
		case "default" :
			c.createPivotGrid();
			break;
		}

		c.setColConfig();
		c.setRowConfig();
		c.initCellDrag();
	},

	initCellDrag : function() {
		
		var c = this;
		var selector = c.getSelector();
		$(selector).find('td.normalcell,td.aggregates').draggable({
		      cursor: "move",
		      appendTo: "body",
		      cursorAt: { top: 0, left: 0 },
		      helper: "clone",
		      zIndex: 10012, 
	   });
	},
	
	render : function(mode){

		var c = this,
			mode = c.mode,
			attr = c.attributes,
			el = c.renderContainer();
		c.updateData();
		c.renderLayout();
		c.addEvents();

		c.filteredData = {};
		c.filteredAggData = {};
		c.columns = [];

		if (mode && mode == "compare") {
			c.createLayout(false);
			c.process(mode);
			el.find("td.input").addClass("locked").removeClass("input");
		}else {
			c.createLayout(false);
			c.removeVirtualDim("rows");
			c.process("render");
		}

		if(Util.parseBoolean(attr["field-annotation"])){
			c.fieldAnnotation = true;
			c.eanbleAnnotations();
		}
		if(!Util.parseBoolean(attr["showheaders"])){
			c.hideHeaders();
		}
		
		if(Util.parseBoolean(attr["hideGrid"])){
			c.hideGridLines();
		}
		
		
		c.applyFilters();

		if (c.layoutType != "column"){
			c.showLayoutData();
		}
	},

	update : function (appliedFilters,dim,msr) {

		var c = this;
		if (appliedFilters && dim ) {
			c.setAppliedFilters(msr, dim, appliedFilters);
		}
		c.render();
		c.disposeDimensions();

	},

	compare : function() {

		var c = this;
		c.mode = "compare";
		c.XfilterObjs = {};
		c.dataSets = {};
		c.aggXfilterObjs = {};
		c.aggDataSets = {};


		var screen = c.getScreen();

		if(screen) {
			if ($.isEmptyObject(c.XfilterObjs) ){
				c.XfilterObjs = screen.getXfilterObj();
			}
			if($.isEmptyObject(c.dataSets)){
				c.dataSets = screen.getDataSet();
			}
			if ($.isEmptyObject(c.aggXfilterObjs) ){
				c.aggXfilterObjs = screen.getAggXfilterObj();
			}
			if($.isEmptyObject(c.aggDataSets)){

				c.aggDataSets = screen.getAggDataSet();
			}
		}
		c.removeVirtualDim("rows");
		c.addVirtualDim("rows");
		c.render("compare");
	},

	applyFilters : function() {
		var c = this;
		var allFilters = c.getAppliedFilters();
		if(!$.isEmptyObject(allFilters)) {
			$.each(allFilters,function(blkName,msrFilter){
				$.each(msrFilter,function(msr,dimFilters){
					var filters = Object.keys(dimFilters);
					$.each(filters,function(i,key) {
						var val = dimFilters[key];
						val = val.slice(0,val.length);
						var dimension = c.createDimensions(blkName+"."+key);
						var aggDimension = c.createAggDimensions(blkName+"."+key);
						c.filter(val,dimension);
						val.push("*");
						c.filter(val,aggDimension);
						if (i == filters.length-1) {
							//var blockName = c.getBlockNameFromDim(key);
							c.filteredData[blkName+"."+msr] = dimension.top(Infinity);
							c.filteredAggData[blkName+"."+msr] = aggDimension.top(Infinity);
							if (!c.colOreFltrDta[blkName]) {
								c.colOreFltrDta[blkName] = {};
							}
							if (!c.colOreAggFltrDta[blkName]){
								c.colOreAggFltrDta[blkName] = {};
							}
							c.colOreFltrDta[blkName][msr] = dimension.top(Infinity);
							c.colOreAggFltrDta[blkName][msr] = aggDimension.top(Infinity);
							console.log(JSON.stringify(c.filteredAggData[blkName+"."+msr]));
						}
					});
				});

			});
		}
	},


	getFilteredData : function(criteria,cellType) {
		var c = this;
		var blockName = criteria["BlockName"];
		var msr = criteria["msr"];
		var blockData = [];
		if (cellType === "aggregate") {

			blockData = c.filteredAggData[msr];
			if ( typeof blockData == "undefined" ) {
				blockData = c.getAggDataSet(blockName);
			}
		}  
		if (cellType === "normal") {
			blockData = c.filteredData[msr];
			if ( typeof blockData == "undefined" ) {
				blockData = c.getDataSet(blockName);
			}
		}
		return blockData;
	},

	getCellVal : function(criteria,cellType) {

		var c = this;
		var blockData = c.getFilteredData(criteria,cellType);
		if ( blockData.length > 0) {
			$.each(criteria,function(key,val){
				var group=[];
				if (key !== "BlockName" && key != "msr") {
					$.each(blockData, function(index, value) {
						if(value[key] == val){
						group.push(value);
					}
					});
					blockData=group;
				}
			});
			return blockData;
		}else{
			return [];
		}
	},

	createCriteria : function(root,cell,cellType) {
		var criteria={};
		if (cellType == "normal") {
			$.each(root,function(key,val){
				cell.attr(key,val);
				if (key === "BlockName") {
					criteria[key]=val;
				}else if (key !== "children") {
					criteria[root.BlockName+"."+key]=val;
				}
			});
		}
		if (cellType == "aggregate") {
			$.each(root,function(key,val){
				cell.attr(key,val);
				if(key !== "BlockName" ){
					if(key === "children" && val && val.length > 0){
						$.each(val,function(ind,vals){
							$.each(vals,function(t,s){
								criteria[root.BlockName+"."+t]=s;
							});
						});
					}else{
						criteria[root.BlockName+"."+key]=val;
					}
				}else{
					criteria[key]=val;
				}
			});
		}
		return criteria;
	},

	isEdited : function (nodeId) {
		var c = this;
		var status = false;
		if(!$.isEmptyObject(c.editedCells)) {
			if (c.editedCells[nodeId]) {
				status = true;
			}
		}
		return status;
	},

	getEditedValue : function(nodeId,measure) {
		var c = this;
		return c.editedCells[nodeId][measure].toString();
	},

	showLayoutData : function() {
		var c = this;
		var mode = c.getMode();
		var attr = c.getAttributes();
		var el = c.renderContainer();
		var propEditable = Util.parseBoolean(attr["editable"]);
		var hasAnnotations =Util.parseBoolean(attr["field-annotation"]);
		var cellNodes = el.find(".normalcell");

		var aggCellNodes=el.find(".aggregates");
		$.each(cellNodes,function(i,v){
			var msr= $(v).data("msrObj");
			var root =$(v).data("root");
			if (root && msr) {

				var criteria = c.createCriteria(root,$(v),"normal");
				criteria["msr"] = root.BlockName+"."+msr.name;
				var result = c.getCellVal(criteria,"normal");
				if (result.length > 0) {
					$.each(result,function(k,obj){
						if (typeof obj[root.BlockName+"."+msr.name] !=="undefined") {

							var nodeId = obj[root.BlockName+"."+msr.name+".NodeId"];
							var value = obj[root.BlockName+"."+msr.name];
							var valDiff = Util.parseBoolean(obj[root.BlockName+"."+msr.name+".Diff"]);
							var isEditable = Util.parseBoolean(obj[root.BlockName+".Edit"]);
							var isFormulaCell = Util.parseBoolean(obj[root.BlockName+"."+msr.name+".isFormula"]);

							$(v).attr("nodeId",nodeId);
							if (c.isEdited(nodeId)) {
								value = c.getEditedValue(nodeId,msr.name);
							}
							if(typeof value !== "undefined" && value !== null ) {
								 var dataObj = c.dataFmtter.handleDataFormat(value.trim(), msr);
								 $(v).text(dataObj.fmtData);
								 $(v).data("cellVal",dataObj.unFmtData);
								 if (!dataObj.isNumber) {
									 $(v).addClass("vdvc-text");
								 }else {
									 $(v).removeClass("vdvc-text");
								 }

							}
							if (valDiff) {
								$(v).addClass("diff");
							}
							if(hasAnnotations){
								$(v).attr("hasAnnotation",true);
								if ( obj[root.BlockName+"."+msr.name+".notes"]){
									$(v).addClass("lc-field-commnet");
								}
							}

							if (mode == "design") {
								if ( isFormulaCell) {
									$(v).removeClass("input");
									$(v).addClass("locked");
								}
							} else {

								if (isFormulaCell || !isEditable || !propEditable) {
									$(v).removeClass("input");
									$(v).addClass("locked");
								}
							}
						}
					});
				}
			}
		});

		$.each(aggCellNodes,function(i,v){

			if(!$(v).hasClass("invalid")){
				var msr= $(v).data("msrObj");
				var root=$(v).data("root");
				if (root && msr) {

					var criteria=c.createCriteria(root,$(v),"aggregate");
					criteria["msr"] = root.BlockName+"."+msr.name;
					var result = c.getCellVal(criteria,"aggregate");
					if(result.length > 0){
						$.each(result,function(k,obj){
							if(typeof obj[root.BlockName+"."+msr.name] !=="undefined"){
								var value = obj[root.BlockName+"."+msr.name];
								var valDiff = obj[root.BlockName+"."+msr.name+".Diff"];
								if (Util.parseBoolean(valDiff)) {
									$(v).addClass("diff");
								}
								if(typeof value !== "undefined" && value !== null ){
									var dataObj = c.dataFmtter.handleDataFormat(value.trim(), msr);
									$(v).text(dataObj.fmtData);
								}
								$(v).attr("nodeId",obj[root.BlockName+"."+msr.name+".NodeId"]);
								if(hasAnnotations){
									$(v).attr("hasAnnotation",true);
									if ( obj[root.BlockName+"."+msr.name+".notes"]){
										$(v).addClass("lc-field-commnet");
									}
								}
							}
						});
					}
				}
			}
		});
	},


	addEditedValue:function(val){
		this.editedValues.push(val);
	},

	clearEditedValue:function(){
		this.editedValues.splice(0);
	},

	removeVirtualDim : function(config) {
		var c = this;
		if (c.mode !== "design") {
			var blockName;
			var blockdef=c.getBlockDef();
			var designerData = c.designerData;
			if(config === "rows" && designerData && blockdef) {
				var rows = designerData.rows;
				if (rows && rows.length>0) {
					blockName = rows[rows.length-1].blockName;
					$.each(rows,function(i,v) {
						if (v.name ===  "Grp") {
							rows.splice(i, 1);
							return false;
						}
					});
					$.each(blockdef,function(i,v) {
						if (v.name ===  blockName) {
							$.each(v.dimensions,function(indx,val) {
								if (val.name === "Grp") {
									v.dimensions.splice(indx, 1);
								}
							});
						}
					});
				}
			}
		}
	},

	addVirtualDim : function(config) {
		var c = this;
		var blockName,level;
		var blockdef=c.getBlockDef();
		var designerData = c.designerData;
		if(config === "rows") {
			var rows = designerData.rows;
			var cols = designerData.columns;
			if (rows && rows.length>0) {
				var obj1 = {};
				var obj2 = {};
				blockName = rows[rows.length-1].blockName;
				level = rows[rows.length-1].level*1;
				var dataSet = c.getDataSet(blockName);
				var d = c.getDimensionInputs(dataSet,blockName+".Grp");
				obj1[ "position"] = rows[rows.length-1].position+1;
				obj1[ "level"] = (level+1)+"";
				obj1[ "name"] = "Grp";
				obj1[ "blockName"] = blockName;

				obj2[ "dimId"] = null;
				obj2[ "name"] = "Grp";
				obj2[ "values"] = d;
				obj2[ "needAggregate"] = true;
				obj2[ "ordered"] = false;
				rows.push(obj1);
				$.each(blockdef,function(i,v) {
					if (v.name ===  blockName) {
						v.dimensions.push(obj2);
						return false;
					}
				});
			} else if(cols && cols.length > 0) {
				rows = designerData.rows = [];
				var obj1 = {};
				var obj2 = {};
				blockName = cols[cols.length-1].blockName;
				level = 1;
				var dataSet = c.getDataSet(blockName);
				var d = c.getDimensionInputs(dataSet,blockName+".Grp");
				obj1[ "position"] = 1;
				obj1[ "level"] =1+"";
				obj1[ "name"] = "Grp";
				obj1[ "blockName"] = blockName;

				obj2[ "dimId"] = null;
				obj2[ "name"] = "Grp";
				obj2[ "values"] = d;
				obj2[ "needAggregate"] = true;
				obj2[ "ordered"] = false;
				rows.push(obj1);
				$.each(blockdef,function(i,v) {
					if (v.name ===  blockName) {
						v.dimensions.push(obj2);
						return false;
					}
				});
			}
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

	resetFilters : function() {
		var c = this,
			allFilters = c.getAppliedFilters(),
			dgnrData = c.designerData;
		if(!$.isEmptyObject(allFilters)) {
			$.each(allFilters,function(blkName,msr) {
				$.each(msr,function(msrName,dimFiltrs){
					$.each(dimFiltrs,function(dim,val){
						var dimension = c.createDimensions(blkName+"."+dim);
						dimension.filterAll();
					});
				});
			});
			if (dgnrData) {
				delete dgnrData["appliedFilters"];
			}
			c.appliedFilters = {};
			c.render();
			c.onFilter();
		}
	},

	addColumnData : function(block,data) {
		var c = this, column = c.columnHeaders[block];
		if (column && $.isArray(column)) {
			column.push(data);
		}else {
			c.columnHeaders[block] =[];
			c.columnHeaders[block].push(data);
		}
	},


	setColOrntDim : function(dims) {
		var c = this;
		$.each(dims,function(index,object){
			var data = {};
			var block = $(object).attr("block");
			var dim = $(object).attr("block")+"."+$(object).attr("dim-name");
			var id =$(object).attr("data-id");
			var dimObj = c.layoutBuilder.find("#"+id).data("dimObj");

			data["lable"] = dim;
			data["block"] = block;
			data["type"] = "dimension";
			data["dimObj"] = dimObj;

			c.addColumnData(block, data);
		});
	},

	setColumnOrientedData : function() {
		var c = this;
		if (c.layoutBuilder) {
			var values=c.layoutBuilder.find("div[data-holder='values']").find("li.ui-draggable");
			var columns = c.layoutBuilder.find("div[data-holder='columns']").find("li.ui-draggable");
			var rows = c.layoutBuilder.find("div[data-holder='rows']").find("li.ui-draggable");

			if (columns.length > 0) {
				c.setColOrntDim(columns);
			}

			if (rows.length > 0) {
				c.setColOrntDim(rows);
			}

			$.each(values,function(index,object){
				var id =$(object).attr("data-id");
				var msrObj = c.layoutBuilder.find("#"+id).data("msrObj");
				var data = {};
				var mes = $(object).attr("block")+"."+$(object).attr("msr-name");
				
				//Label
				
				if (msrObj && msrObj.label && c.showMsrLbls) {
					mes = msrObj.label;
				}
				
				var block = $(object).attr("block");

				data["lable"] = mes;
				data["block"] = block;
				data["type"] = "measure";
				data["msrObj"] = msrObj;

				c.addColumnData(block, data);
			});
		}

	},


	getNoOfRowsforColGrd : function() {
		
		var c = this;
		var rowCount = 1;
		/*if ( c.blocks.length > 0 ) {
			if (!$.isEmptyObject(c.filteredData)) {
				$.each(c.blocks,function(i,v){
					var blkdata = c.filteredData[v];
					if (blkdata && $.isArray(blkdata)) {
						if (blkdata.length >  rowCount) {
							rowCount = blkdata.length;
						}
					}
				});
			} else if(!$.isEmptyObject(c.dataSets)) {
				$.each(c.blocks,function(i,v){
					var blkdata = c.dataSets[v];
					if (blkdata && $.isArray(blkdata)) {
						if (blkdata.length >  rowCount) {
							rowCount = blkdata.length;
						}
					}
				});
			}
		}*/
		
		
		if ( c.blocks.length > 0 ) {
			$.each(c.blocks,function(i,v){
				
				var nr = c.NoOfRowsPerBlock(v);
				
				if( nr > rowCount) {
					rowCount = nr;
				}
				
			});
		}

		return rowCount;
	},

	NoOfRowsPerBlock : function(block) {
		var c = this;
		var rowCount = 0;
		
		if(!$.isEmptyObject(c.dataSets)) {
			var blkdata = c.dataSets[block];
			if (blkdata && $.isArray(blkdata)) {
				rowCount = blkdata.length;
			}
		}
		
		/*if (!$.isEmptyObject(c.colOreFltrDta)) {
			var blkdata = c.colOreFltrDta[block];
			if (blkdata) {
				$.each(blkdata,function(msr,rec){
					if($.isArray(rec) && rowCount < rec.length ) {
						rowCount = rec.length;
					}
				});
			}
		} else if(!$.isEmptyObject(c.dataSets)) {
			var blkdata = c.dataSets[block];
			if (blkdata && $.isArray(blkdata)) {
				rowCount = blkdata.length;
			}
		}*/
		
		/*if (!$.isEmptyObject(c.filteredData)) {
			var blkdata = c.filteredData[block];
			if (blkdata && $.isArray(blkdata)) {
				rowCount = blkdata.length;
			}
		} else if(!$.isEmptyObject(c.dataSets)) {
			var blkdata = c.dataSets[block];
			if (blkdata && $.isArray(blkdata)) {
				rowCount = blkdata.length;
			}
		}*/

		return rowCount+1;
	},

	NoOfColsPerBlock : function(block) {
		var c = this;
		var colCount = 0;
		var cols = c.columnHeaders[block];
		if (cols && $.isArray(cols)) {
			colCount = cols.length;
		}

		return colCount;
	},

	setColAttr : function(cell,data) {
		var c = this;
		var rows = c.NoOfRowsPerBlock(data["block"]);
		var col = cell.parent().nextAll();
		var index = cell.index();
		if (col.length > 0) {
			$.each(col,function(i,tr){
				if(i == rows) {
					return false;
				}
				var td = $(tr).find("td").eq(index-1);
				$(td).attr("block",data["block"]);
				if (data["type"] == "dimension") {
					//td.css("background","red");
				}
				if (data["type"] == "measure") {
					//td.css("background","blue");
				}

			});
		}
	},

	getBlockData : function(block) {
		
		var c = this;
		var blkdata = c.dataSets[block];
		/*if (!$.isEmptyObject(c.colOreFltrDta)) {
			blkdata = [];
			var dta = c.colOreFltrDta[block];
			if(dta) {
				$.each(dta,function(i,v){
					if($.isArray(v)) {
						blkdata = blkdata.concat(v);
					}
				});
			}
		}*/
		
		return blkdata;
	},

	getColOreFilteredData : function(block,msr) {
		var c = this,
			blkdata = [];
		if (!$.isEmptyObject(c.colOreFltrDta)) {
			var dta = c.colOreFltrDta[block];
			if(dta) {
				$.each(dta,function(i,v){
					if(i == msr) {
						blkdata = v;
						return false;
					}
				});
			}
		}
		
		return blkdata;
	},
	
	findColOreFilteredRec : function(block,msr,rec) {
		var c = this,
			Rec = null;
		var msrRecs = c.getColOreFilteredData(block,msr);
		if (msrRecs.length > 0) {
			$.each(msrRecs,function(i,v){
				if(_.isEqual(v,rec)) {
					Rec = v;
					return false;
				}
			});
		}
		
		return Rec || rec;
	},
	
	renderRows : function(block,columns) {
		
		var c = this;
		var attr = c.getAttributes();
		var hasAnnotations =Util.parseBoolean(attr["field-annotation"]);
		var mode = c.mode;
		var noOfCols = c.NoOfColsPerBlock(block);
		var noOfRows = c.NoOfRowsPerBlock(block);
		var blkdata = c.getBlockData(block);
		var parent = c.getSelector();
		var blkRows = $(parent).find('.lc_master tbody tr:first').nextAll();
		
		
		
		// Temp code for dimension sorting
		if($.isArray(c.dimSortOrdr) && c.sortedDim) {
			var srtData = [];
			$.each(c.dimSortOrdr,function(i,val){
				var key = block+"."+c.sortedDim;
				var blockData = $.extend(true, {}, blkdata);
				
				$.each(blockData, function(index, value) {
					if(value[key] == val){
						srtData.push(value);
					}
				});
			});
			
			if (srtData.length > 0) {
				blkdata = srtData;
			}
		}
		
		
		
		
		
		
		if (blkRows && blkRows.length > 0 && blkdata && blkdata.length > 0) {
			$.each(blkRows,function(i,row){
				if (i == noOfRows) {
					return false;
				}
				
				var rec = blkdata[i];
				
				
				// Temp Implimentation for messure sorting 
				
				if (c.sortOrder && $.isArray(c.sortOrder[i]) && $.isArray(c.coldimOrder) ) {
					
					if (c.coldimOrder.length == c.sortOrder[i].length) {
						var criteria = {};
						criteria["BlockName"] = block;
						if($.isArray(c.sortOrder[i])) {
							$.each(c.sortOrder[i],function(indx,val){
								var key = block+"."+c.coldimOrder[indx];
								criteria[key] = val;
							});
						}
						
						if(!$.isEmptyObject(criteria)) {
							var blockData = $.extend(true, {}, blkdata);
							$.each(criteria,function(key,val){
								var group=[];
								if (key !== "BlockName" && key != "msr") {
									$.each(blockData, function(index, value) {
										if(value[key] == val){
										group.push(value);
									}
									});
									blockData = group;
								}
							});
							rec = blockData[0];
						}
					}
				}
				
				
				
				var root = {};
				root["BlockName"] = block;
				$.each(columns,function(j,col){
					var key = col["lable"];
					var cell = $(row).find('td[block="'+block+'"]').eq(j);
					if (col["type"] == "dimension") {
						cell.text(rec[key]);
						cell.addClass("locked");
						var dim = col["dimObj"];
						root[dim.name] = rec[key];
					}
					
					if (col["type"] == "measure") {
						cell.data("msrObj",col["msrObj"]);
						cell.data("root",root);
						filRec = c.findColOreFilteredRec(block,col["msrObj"].name,rec);
						if (filRec) {
							var nodeId = filRec[key+".NodeId"];
							var value = filRec[key];
							var valDiff = Util.parseBoolean(filRec[key+".Diff"]);
							var isEditable = Util.parseBoolean(filRec[block+".Edit"]);
							var isFormulaCell = Util.parseBoolean(filRec[key+".isFormula"]);
							if (c.isEdited(nodeId)) {
								value = c.getEditedValue(nodeId,col["msrObj"].name);
							}

							if(typeof value !== "undefined" && value !== null ) {
								 var dataObj = c.dataFmtter.handleDataFormat(value.trim(), col["msrObj"]);
								 cell.text(dataObj.fmtData);
								 cell.data("cellVal",dataObj.unFmtData);
								 if (!dataObj.isNumber) {
									cell.addClass("vdvc-text");
								 }else {
									 cell.removeClass("vdvc-text");
								 }

							}
							if (valDiff) {
								cell.addClass("diff");
							}
							cell.attr("nodeId",nodeId);
							if(hasAnnotations){
								cell.attr("hasAnnotation",true);
								if ( filRec[key+".notes"]){
									cell.addClass("lc-field-commnet");
								}
							}

							if (mode == "design") {
								if ( isFormulaCell) {
									cell.removeClass("input");
									cell.addClass("locked");
								}
							} else {
								if (isFormulaCell || !isEditable ) {
									cell.removeClass("input");
									cell.addClass("locked");
								}
							}

							cell.addClass("input");
						}
						
					}
				});
			});
		}
	},

	createColumnGrid : function() {
		
		var c = this,
				TotalNoOfColumns=0,
				TotalNoOfRows=0,
				blockData;

		c.columnHeaders = {};
		if(c.mode == "run") {
			c.applyFilters();
		}
		
		c.setColumnOrientedData();
		var columnConfig = c.columnHeaders;
		var parent =c.getSelector();
		var attr = c.getAttributes();

		if (!$.isEmptyObject(columnConfig)){
			$.each(columnConfig,function(key,obj){
				TotalNoOfColumns += obj.length;
			});
			TotalNoOfRows = c.getNoOfRowsforColGrd();
			var extcols = c.calculateExtraCols(TotalNoOfColumns);
			var extrows = c.calculateExtraRows(TotalNoOfRows);
			$(parent).find(".pivoteContainer").empty();
			c.sheet.getGrid(parent+" .pivoteContainer", {
				minColumns : TotalNoOfColumns + extcols ,
				minRows : TotalNoOfRows+extrows,
				editable:attr["editable"],
				OnCellClick:{"input":c.getOnClick()},
				title:attr.title,
				field_annotation:attr["field-annotation"],
				onColResize : function(col){c.OncolResize(col);},
				onRowResize : function(row){c.OnrowResize(row);},
				onColsort : function(col) {c.colSort(col);}
			});

			var table = $(parent).find(".pivoteContainer .lc_master table");
			if (c.blocks.length > 0) {
				$.each(c.blocks,function(i,v){
					var columns = c.columnHeaders[v];
					var tr = $(table).find('tbody tr:first');
					for ( var k = 0; k < columns.length; k++) {
						var col = columns[k];
						var td = $(tr).find('td').eq(k);
						if(col.type == "measure") {
							$(td).addClass("msr");
							$(td).data("msrObj",col.msrObj);
						}
						
						if(col.type == "dimension") {
							$(td).addClass("dim");
							$(td).attr("dim",col.dimObj.name);
						}
						
						$(td).attr("block",col.block);
						$(td).append(col["lable"]);
						$(td).addClass("columnHeading");
						c.setColAttr($(td), col);

					}
					c.renderRows(v,columns);
				});
			}
		}
	},

	resetControlCache : function() {
		var c = this;
		c.editedCells = {};
	},


	// InterLeaved layout control

	setRowSpan : function(cell,rowspan,index) {
		var tr = cell.parent();
		cell.addClass("columnHeading total").attr("rowspan",rowspan);
		for(var z=1;z < rowspan ;z++){
			var nxtR = $(tr).next();
			$(nxtR).find('td:nth-child(' + index + ')').addClass("invalid").hide();
		}
	},

	
	sortTopCol : function(columns) {
		var c = this,
			order = c.dimSortOrdr;
		
		if ($.isArray(columns) && $.isArray(columns[0])) {
			function getIndex(val) {
				var index = -1;
				$.each(columns[0],function(i,obj){
					if(obj.value == val) {
						index = i;
						return true;
					}
				});
				
				return index;
			}
			$.each(order,function(i,val){
				var indx = getIndex(val);
				if(indx != -1) {
					var temp = columns[0][i];
					columns[0][i] = columns[0][indx];
					columns[0][indx] = temp;
					
				}
			});
		}
		
	},
	
	
	createInterLeavedGrid : function() {

		var c = this;
		var parent =c.getSelector();
		var attr = c.getAttributes();
		var values = c.layoutBuilder.find("div[data-holder='values']").find("li.ui-draggable");
		var id = $(values[0]).attr("data-id");
		var msrobj = c.layoutBuilder.find("#"+id).data("msrObj");
		var columninfo =c.getColumnInfo(values);
		var rowdata=c.getRowsData();
		var columns=columninfo.columns;
		var columnHeadingLevels = columns.length;
		var colspans = columninfo.colspans;
		var TotalNoOfColumns = columninfo.TotalNoOfColumns || values.length ;
		var TotalNoOfRows = 0;
		//var extcols = c.calculateExtraCols(TotalNoOfColumns);

		if (rowdata.length > 0 ) {
			TotalNoOfRows=rowdata.length+columnHeadingLevels;
		} else {
			TotalNoOfRows=2*values.length+columnHeadingLevels;
		}
		//var extrows = c.calculateExtraRows(TotalNoOfRows);

		$(parent).find(".pivoteContainer").empty();
		c.sheet.getGrid(parent+" .pivoteContainer", {
			minColumns : TotalNoOfColumns +1,// extcols ,
			minRows : TotalNoOfRows,//+extrows,
			editable:attr["editable"],
			OnCellClick:{"input":c.getOnClick()},
			title:attr.title,
			field_annotation:attr["field-annotation"],
			onColResize : function(col){c.OncolResize(col);},
			onRowResize : function(row){c.OnrowResize(row);},
			onColsort : function(col) {c.colSort(col);}
		});

		
		
		
		var table = $(parent).find(".pivoteContainer .lc_master table");
		if (columns.length > 0) {
			
			// Temp code for sorting dimension values 
			if(c.dimSortOrdr) {
				c.sortTopCol(columns);
			}
			
			
			for ( var k = 0; k < columns.length+1; k++) {
				if (k < columns.length) {
					var tr = $(table).find('tbody tr:nth-child(' + (k + 1) + ')');
					var a = 0,b = 2;
					if(rowdata.length > 0) {
						b = 3;
					}
					var column = columns[k];

					for ( var l = 0; l < column.length; l++) {
						var _td = $(tr).find('td:nth-child(' + (a + b) + ')');
						while($(_td).hasClass("invalid")) {
							a++;
							_td = $(tr).find('td:nth-child(' + (a + b) + ')');
						}
						var colCell = column[l];
						var dim = colCell["dim"];
						$(tr).addClass("columnHeading");
						$(_td).addClass("columnHeading dim");
						if (colCell["type"] == "normal") {
							$(_td).append(colCell["value"]);
							c.addCellInfo(_td,"col",$(dim),k,TotalNoOfRows+1);
							$(_td).attr("colspan", colspans[k]).css("width",(colspans[k])*109-8+"px");

							for ( var d = 0; d < colspans[k] - 1; d++) {
								a++;
								var tdcell = $(tr).find('td:nth-child(' + (a + b) + ')');
								$(tdcell).append(colCell["value"]);
								c.addCellInfo($(tdcell),"col",$(dim),k,TotalNoOfRows+1);
								$(tdcell).hide();
							}
						} else if (colCell["type"] == "agg") {
							var rowspan = columnHeadingLevels-k;
							var aggregateFun="Aggregate";
							/*if(msrobj && typeof msrobj.aggregateFun !== "undefined"){
								aggregateFun=msrobj.aggregateFun+"()";
							}*/
							$(_td).addClass("columnHeading total dim").attr("rowspan",rowspan).append(aggregateFun);
							$(_td).attr("colspan", values.length).css("width",(values.length)*109-8+"px");
							c.addLevel(_td, k + 1,TotalNoOfRows);
						    c.addCellInfo(_td,"col",$(dim),k,TotalNoOfRows+1,"aggregates");

							for(var z=1;z < rowspan ;z++){
							   var nxtR = $(tr).next();
							   $(nxtR).find('td:nth-child(' + (a + b) + ')').addClass("invalid").hide();
							}
							for ( var d = 0; d < values.length - 1; d++) {
								a++;
								var tdcell = $(tr).find('td:nth-child(' + (a + b) + ')');
								$(tdcell).append(colCell["value"]);
								c.addCellInfo($(tdcell),"col",$(dim),k,TotalNoOfRows+1,"aggregates");
								$(tdcell).hide();
								for(var z=1;z < rowspan ;z++){
									var nxtR = $(tr).next();
									$(nxtR).find('td:nth-child(' + (a + b) + ')').addClass("invalid").hide();
								}
							}
						}
						a++;
					}
				}

				if(k == columns.length) {
					columnHeadingLevels++;
					var tr = $(table).find('tbody tr:nth-child(' + (columnHeadingLevels) + ')').addClass("columnHeading");
					var b = 0;
					if(rowdata.length > 0) {
						b = 1;
					}
					for(var j=0;j<TotalNoOfColumns;){
						for(var v=0;v<values.length;v++){

							var id = $(values[v]).attr("data-id");
							var msrobj=c.layoutBuilder.find("#"+id).data("msrObj");
							var td = $(tr).find('td').eq(b);
							$(td).addClass("columnHeading msr");
							if ($(td).hasClass("aggregates")){
								aggregateFun=msrobj.aggregateFun;
								$(td).append(msrobj.name+"("+aggregateFun+")");
								$(td).addClass("total");
							} else {
								
								// Label
								
								if (msrobj.label && c.showMsrLbls) {
									$(td).append(msrobj.label);
								} else {
									$(td).append(msrobj.name);
								}
								
								
								
								$(td).data("msrObj",msrobj);
							}
							c.addCellInfo(td,"msr",msrobj,columnHeadingLevels,TotalNoOfRows+1);
							b++;
						}
						j += values.length;

					}
				}
			}
		} else if( rowdata.length > 0) {
			columnHeadingLevels++;
			var tr = $(table).find('tbody tr:nth-child(' + (columnHeadingLevels) + ')').addClass("columnHeading");
			var b = 0;
			if(rowdata.length > 0) {
				b = 1;
			}
			for(var v=0;v<values.length;v++){

				var id = $(values[v]).attr("data-id");
				var msrobj=c.layoutBuilder.find("#"+id).data("msrObj");
				var td = $(tr).find('td').eq(b);
				$(td).addClass("columnHeading msr");
				$(td).data("msrObj",msrobj);
				if ($(td).hasClass("aggregates")){
					aggregateFun=msrobj.aggregateFun;
					$(td).append(msrobj.name+"("+aggregateFun+")");
				} else {
					
					
					
					
					// Label
					if (msrobj.label && c.showMsrLbls) {
						$(td).append(msrobj.label);
					} else {
						$(td).append(msrobj.name);
					}
					
					
					
				}
				c.addCellInfo(td,"msr",msrobj,columnHeadingLevels,TotalNoOfRows+1);
				b++;
			}
		}

		if (rowdata.length > 0) {
			for (var i=0;i<rowdata.length;i++) {
				columnHeadingLevels++;

				var cell = rowdata[i];
				var tr = $(table).find('tbody tr:nth-child(' + (columnHeadingLevels) + ')');
				$(tr).attr("level",cell.level);
				var td = $(tr).find('td:nth-child(2)');
				$(td).css("padding-left", (cell.level)*10+"px");
				c.addCellInfo(td,"row",cell);
				if (cell.value === "*" || cell.type == "aggregates") {
					if (cell.type == "aggregates") {
						$(td).append(cell.value);
					} else {
						if (msrobj && msrobj.aggregateFun){
							cell.func =cell.dimName+"."+msrobj.aggregateFun+"()";
							if (cell.parentVal) {
								cell.func = cell.parentVal+"."+msrobj.aggregateFun+"()";
							}
						}
						$(td).append(cell.func);
					}

					$(td).css("padding-left", (cell.level)*10+20+"px");
					for ( var n = 0; n < TotalNoOfColumns; n++) {
						var tdcell=$(tr).find('td:nth-child(' + (n+ 3) + ')');
						$(tdcell).addClass("aggregates");
						$(tdcell).removeClass("input normalcell");
					}
				} else {
					if (cell.editable) {
						$(td).append(cell.value);
						$(td).css("padding-left", (cell.level)*10+20+"px");
					} else {
						var cellwrp = '<div style="width:100%;white-space: nowrap;">\
							<span class="ui-icon ui-icon-minusthick" style="float:left;cursor: pointer;border: 1px solid blue;margin-right: 4px;">\
							</span>'+cell.value+'</div>';
						$(td).append(cellwrp);
						for ( var n = 0; n < TotalNoOfColumns; n++) {
							var tdcell=$(tr).find('td:nth-child(' + (n+ 3) + ')');
							if (!$(tdcell).hasClass("aggregates")) {
								$(tdcell).addClass("aggregates");
								$(tdcell).removeClass("input normalcell");
							}
						}
					}
				}
			}
		}
	},

	OncolResize : function(col){
		var c = this,config = c.designerData;
		if (config && col) {
			if (!config["colAttr"]) {
				config["colAttr"] = {};
			}
			config["colAttr"][col.index()] = col.outerWidth();
			c.setCustomDesignerData(config);
		}
	},

	OnrowResize : function(row){
		var c = this,config = c.designerData;
		if (config && row) {
			if (!config["rowAttr"]) {
				config["rowAttr"] = {};
			}
			var row_no = row.parent().attr("row-no");
			config["rowAttr"][row_no] = row.outerHeight();
			c.setCustomDesignerData(config);
		}
	},

	setColConfig : function() {
		var c = this;config = c.designerData;
		var parent = c.getSelector();
		var table = $(parent).find(".pivoteContainer table");
		if (config && config["colAttr"]) {
			var colAttr = config["colAttr"];
			$.each(colAttr,function(i,v){
				$(table).find('col:eq('+i+')').width(v);
			});
		}
	},
	setRowConfig : function() {

		var c = this;config = c.designerData;
		var parent = c.getSelector();
		var tbody = $(parent).find(".pivoteContainer table tbody");
		if (config && config["rowAttr"]) {
			var rowAttr = config["rowAttr"];
			$.each(rowAttr,function(i,v){
				$(tbody).find('tr[row-no="'+i+'"]').css("height",v+"px");
			});
		}
	},
	
	colSort : function(col) {
		
		var c = this,
			SortSpec = {},
			config = c.designerData,
			cellId = col.attr("cell-id"),
			colLevel = col.attr("row-no")*1;
			
			
		if (c.layoutType == "default") {
			return false;
		}
		if (col.hasClass("total")) {
			return false;
		}
		if (col.hasClass("dim")) {
			if (colLevel != 1) {
				return false;
			}
			SortSpec["block"] = col.attr("block");
			SortSpec["sortType"] = "Dimension";
			SortSpec["dimension"] = c.sortedDim = col.attr("dim");
			if(!$.isEmptyObject(col.data("root"))) {
				var root = col.data("root");
				$.each(root,function(key,val){
					if(key == "BlockName") {
						SortSpec["block"] = val;
					} else {
						SortSpec["dimension"] = key;
					}
				});
			}
			
			c.sortOrder = null;
			c.coldimOrder = null;
			
			//return false;
		}
		
		if(col.hasClass("sorting_Asc")) {
			SortSpec["sortAsc"] = false;
			col.closest("tbody").find(".sorting_Asc").removeClass("sorting_Asc").addClass("sorting");
			col.addClass("sorting_dsc").removeClass("sorting");
		} else {
			SortSpec["sortAsc"] = true;
			col.closest("tbody").find(".sorting_dsc").removeClass("sorting_dsc").addClass("sorting");
			col.addClass("sorting_Asc").removeClass("sorting");
		}
		
		if(col.hasClass("msr")) {
			
			if(c.layoutType == "column") {
				SortSpec["block"] = col.attr("block");
			}
			var msrObj = col.data("msrObj");
			var dims = col.data("root");
			SortSpec["sortType"] = "Measure";
			if(msrObj && !$.isEmptyObject(msrObj) && config) {
				SortSpec["measure"] = msrObj.name;
				if(dims && !$.isEmptyObject(dims)) {
					SortSpec["dimNames"] = [];
					SortSpec["dimValues"] = [];
					SortSpec["block"] = [];
					$.each(dims,function(key,val){
						if(key == "BlockName") {
							SortSpec["block"] = val;
						} else {
							SortSpec["dimNames"].push(key);
							SortSpec["dimValues"].push(val);
						}
					});
				}
				
				if(config.rows && c.layoutType == "interleaved") {
					if (config.rows.length <= 1) {
						SortSpec["retDims"] = [];
						$.each(config.rows,function(i,obj){
							SortSpec["retDims"].push(obj.name);
							//SortSpec["dimension"] = obj.name;
						});
					} else {
						Util.showMessage("sorting is not supported");
						col.removeClass("sorting sorting_Asc sorting_dsc");
						return false;
					}
				}
				
				if(c.layoutType == "column") {
					SortSpec["retDims"] = [];
					if(config.columns) {
						$.each(config.columns,function(i,obj){
							SortSpec["retDims"].push(obj.name);
						});
					}
					if(config.rows) {
						$.each(config.rows,function(i,obj){
							SortSpec["retDims"].push(obj.name);
						});
					}
					c.coldimOrder = SortSpec["retDims"];
				}
				
			}
			c.sortedDim = null;
			c.dimSortOrdr = null;
		}
		
		if(!$.isEmptyObject(SortSpec) && window.vAppController) {
			if(vAppController.vapp) {
				var wid = vAppController.vapp.currentWorkspace;
				var mdlId = vAppController.vapp.modelId;
				Util.ajaxPost("workspace/sortorder/"+mdlId+"/"+wid,SortSpec,function(result){
					
					if(result.Status) {
						if (SortSpec["sortType"] == "Measure") {
							c.sortOrder = result.Data;
						} else if(SortSpec["sortType"] == "Dimension") {
							c.dimSortOrdr = result.Data;
						}
						
						if(($.isArray(c.sortOrder) && c.sortOrder.length > 0) || ($.isArray(c.dimSortOrdr) && c.dimSortOrdr.length > 0)) {
							c.render();
							
							if(c.sheet && c.sheet.scrollPos) {
								$(c.sheet.selector).scrollLeft(c.sheet.scrollPos["scroll_l"] || 0);
								$(c.sheet.selector).scrollTop(c.sheet.scrollPos["scroll_t"] || 0);
							}
							
						} else {
							Util.showMessage("received sort Order is Empty");
						}
						
						var ncol = $(c.el).find('td[cell-id="'+cellId+'"]');
						if(SortSpec["sortAsc"]) {
							ncol.closest("tbody").find(".sorting_dsc").removeClass("sorting_dsc").addClass("sorting");
							ncol.addClass("sorting_Asc").removeClass("sorting");
						} else {
							ncol.closest("tbody").find(".sorting_Asc").removeClass("sorting_Asc").addClass("sorting");
							ncol.addClass("sorting_dsc").removeClass("sorting");
						}
					//	c.sortOrder = null;
					//	c.coldimOrder = null;
					//	c.sortedDim = null;
					//	c.dimSortOrdr = null;
					} else {
						Util.showMessage(result.Message);
					}
				},false,true);
				
			}
		}
	}
});


LayoutControl.cellManager = function(instance) {

};

