var excelView = function(){
	this.selector = null;
	this.editable = false;
	this.options = null;
	this.defaultOptions = {
			minColumns : 50,
			minRows : 50,
			editable : false,
			keyNavigation : true,
			OnCellClick : {},
			title : false,
			field_annotation : false,
			onColResize : function(){},
			onRowResize : function(){},
			onColSort : false
	};
	
	
	
	var eanbleAnnotations=function(selector,callbacks){
		
		$(document).off("click",selector+" .fa-comment");
		$(document).on("click",selector+" .fa-comment",function(e) {
			e.stopPropagation();
			 
			var element = $(this);
			var nodeId = element.closest("td").attr("nodeid");
			var annotationMgr = new AnnotationManager(nodeId);
			annotationMgr.show(nodeId);
			
		});
	};
	
	var navigateToRight = function(cell,selector) {
		var index = cell.index();
		var navAttr = cell.attr("navIndx");
		/*if (typeof navAttr != "undefined" && navAttr !== false) {
			index = parseInt(cell.attr("navIndx"));
		}*/
		var nextcell=cell.parent().find("td").eq(index);
		if (nextcell.length > 0 ){
			if(nextcell.css("display") === "none"){
				var all=nextcell.nextAll(":visible");
				if(all.length > 0){
					$(all[0]).focus();
					$(all[0]).attr("navIndx",index);
					cell.removeClass("cellfocus");
					$(all[0]).addClass("cellfocus");
					setCurrent($(all[0]),selector);
				}
			}else{
				nextcell.focus();
				if (typeof navAttr !== typeof undefined && navAttr !== false) {
					cell.removeAttr("navIndx");
				}
				cell.removeClass("cellfocus");
				nextcell.addClass("cellfocus");
				setCurrent(nextcell,selector);
			}
		}
	};
	
	var navigateToLeft = function(cell,selector) {
		var index = parseInt(cell.index())-2;
		var navAttr = cell.attr("navIndx");
		if (index < 0 ) {
			return false;
		}
		var prevcell = cell.parent().find("td").eq(index);
		if (prevcell.length > 0) {
			if(prevcell.css("display") === "none"){
				var all=prevcell.prevAll(":visible");
				if(all.length > 0){
					$(all[0]).focus();
					$(all[0]).attr("navIndx",index);
					cell.removeClass("cellfocus");
					$(all[0]).addClass("cellfocus");
					setCurrent($(all[0]),selector);
				}
			}else{
				$(prevcell).focus();
				if (typeof navAttr !== typeof undefined && navAttr !== false) {
					cell.removeAttr("navIndx");
				}
				cell.removeClass("cellfocus");
				prevcell.addClass("cellfocus");
				setCurrent(prevcell,selector);
			}
		}
	};
	
	var navigateToUp = function(cell,selector) {
		var index = cell.index();
		var navAttr = cell.attr("navIndx");
		if (typeof navAttr != "undefined" && navAttr !== false) {
			index = parseInt(cell.attr("navIndx"))+1;
		}
		var element = cell.parent().prev().find("td").eq(index-1);
		if (element.length > 0 ) {
			if(element.css("display") === "none"){
				var all=element.prevAll(":visible");
				if(all.length > 0){
					$(all[0]).focus();
					$(all[0]).attr("navIndx",index-1);
					cell.removeClass("cellfocus");
					$(all[0]).addClass("cellfocus");
					setCurrent($(all[0]),selector);
				}
			}else{
				element.focus();
				if (typeof navAttr !== typeof undefined && navAttr !== false) {
					cell.removeAttr("navIndx");
				}
				cell.removeClass("cellfocus");
				element.addClass("cellfocus");
				setCurrent(element,selector);
			}
		}
	};
	
	var navigateToDown = function(cell,selector) {
		var index = cell.index();
		var navAttr = cell.attr("navIndx");
		if (typeof navAttr != "undefined" && navAttr !== false) {
			index = parseInt(cell.attr("navIndx"))+1;
		}
		var element = cell.parent().next().find("td").eq(index-1);
		if (element.length > 0) {
			if(element.css("display") === "none"){
				var all=element.prevAll(":visible");
				if(all.length > 0){
					$(all[0]).focus();
					$(all[0]).attr("navIndx",index-1);
					cell.removeClass("cellfocus");
					$(all[0]).addClass("cellfocus");
					setCurrent($(all[0]),selector);
				}
			}else{
				if (typeof navAttr !== typeof undefined && navAttr !== false) {
					cell.removeAttr("navIndx");
				}
				element.focus();
				cell.removeClass("cellfocus");
				element.addClass("cellfocus");
				setCurrent(element,selector);
			}
		}
	};
	
	var setCurrent = function (element,selector) {
		if (element.length > 0) {
			var ofcet = element.offset();
			var width = element.outerWidth();
			var height = element.outerHeight();
		    var borders=$(selector).find(".current");
		    $(borders[0]).offset({"left":ofcet.left,"top":ofcet.top}).css({"display":"block","width":width+"px","height":"2px"});
		    $(borders[1]).offset({"left":ofcet.left+width,"top":ofcet.top}).css({"display":"block","width":"2px","height":height});
		    $(borders[2]).offset({"left":ofcet.left,"top":ofcet.top+height-2}).css({"display":"block","width":width+"px","height":"2px"});
		    $(borders[3]).offset({"left":ofcet.left,"top":ofcet.top}).css({"display":"block","width":"2px","height":height});
		}
	};
	
	var setInput = function(element,selector){
		
		 var ofcet = element.offset();
		 var InputHolder=$(selector).find(".InputHolder");
		 var isVisible = InputHolder.css("display");
		 if(isVisible !== "none"){
			 InputHolder.offset({"left":ofcet.left,"top":ofcet.top});
		 } 
	};
	
	var eanbleClick = function(selector,callbacks,field_annotation){
		
		$(document).off("click",selector+" .lc_master table td");
		$(document).on("click",selector+" .lc_master table td",function(e) {
			e.stopPropagation();
			// DO default preprocesing
			var element = $(this);
			setCurrent(element,selector);
			var cell=element.closest("tbody").find("td.cellfocus");
			var input =element.find("input");
			if(input && input.length > 0){
				return true;
			}else{
				cell.find("input").trigger("blur");
			}
			cell.removeClass("cellfocus");
			element.addClass("cellfocus");
			element.focus();
		});
		
		$(document).off("dblclick",selector+" .lc_master table td");
		$(document).on("dblclick",selector+" .lc_master table td",function(e) {
			
			e.stopPropagation();
			// DO default preprocesing
			var element = $(this);
			element.closest("tbody").find("td.cellfocus").removeClass("cellfocus");
			element.addClass("cellfocus");
			
			if(typeof callbacks !== "undefined"){
				$.each(callbacks,function(key,val){
					if(element.hasClass(key)){
						if ("function" == typeof val) {
							val(element);
						}
					}
				});
			}
			// DO default postprocessing
			
		});
	};
	
	this.enableColSort = function(callback) {
		var c = this,
			selector = c.selector;
		$(document).off("click",selector+" .columnHeading");
		$(document).on("click",selector+" .columnHeading",function(e) {
			e.stopPropagation();
			
			if(typeof callback == "function") {
				callback($(this));
			}
		});
	};
	
	this.enableKeyNavigation = function(){
		var c = this,
			selector = c.selector;
		$(document).off("click",selector);
		$(document).on("click",selector,function(e) {
			e.stopPropagation();
			var element = $(selector);
			var cell=element.find("td.cellfocus");
			cell.focus();
		});
	
		$(document).off("keypress",selector+" .lc_master table td.cellfocus");
		$(document).on("keypress",selector+" .lc_master table td.cellfocus",function(e){
			
			var element = $(this);
			if(c.editable && element.hasClass("input") && !element.hasClass("editing")){
				var inp = String.fromCharCode(event.keyCode);
				element.empty();
				element.text(inp);
				element.addClass("editing");
				element.trigger("dblclick");
				return false;
			}
		});
		
		$(document).off("keydown",selector+" .lc_master table td.cellfocus");
		$(document).on("keydown",selector+" .lc_master table td.cellfocus",function(e){
			e.stopPropagation();
			if(e.shiftKey){
				switch (e.keyCode) {
				//tab
				case 9:
					e.preventDefault();
					navigateToLeft($(this),selector);
					break;
				//Enter
				case 13:
					e.preventDefault();
					navigateToUp($(this),selector);
					break;
				}
			}else{
				switch (e.keyCode) {
				// left arrow
				case 37:
					e.preventDefault();
					navigateToLeft($(this),selector);
					break;
				// tab or right arrow
				case 9:
				case 39:
					e.preventDefault();
					navigateToRight($(this),selector);
					break;	
				// enter and down arrow 
				case 13:
				case 40:
					e.preventDefault();
					navigateToDown($(this),selector);
					break;
				// up arrow
				case 38:
					e.preventDefault();
					navigateToUp($(this),selector);
					break;
				/*case 46:
					e.preventDefault();
					var element = $(this);
					if(c.editable && element.hasClass("input")){
						$(element).data("cellVal",element.text());
						element.empty();
					}
					break;
				case 27:
					e.stopPropagation();
					$(this).text($(this).data("cellVal"));
					$(this).focus();
					break;*/
				case 32:
					e.preventDefault();
					break;
				default:
					break;
				}
			}
			
		});
		
	};

	//This method provides column names for the grid
	this.colName=function(n) {
		var s = "";
		while (n >= 0) {
			s = String.fromCharCode(n % 26 + 65) + s;
			n = Math.floor(n / 26) - 1;
		}
		return s;
	};

	this.createTable = function(type) {
		var table = $("<table>");
		var colGroup = $("<colgroup>");
		var thead = $("<thead>");
		var headRow = $("<tr>"); 
		var tbody = $("<tbody>");
		
		thead.append(headRow);
		table.append(colGroup);
		table.append(thead);
		table.append(tbody);
		
		return table;
		
	};
	
	this.setCellFocus = function() {
		return '<div style="position: absolute; top: 0px; left: 0px;">\
		<div class="wtBorder current" style=" background-color: rgb(82, 146, 247);"></div>\
		<div class="wtBorder current" style=" background-color: rgb(82, 146, 247);"></div>\
		<div class="wtBorder current" style=" background-color: rgb(82, 146, 247);"></div>\
		<div class="wtBorder current" style=" background-color: rgb(82, 146, 247);">\
	    </div>';
	};
	
	this.freezCols = function(noCols,noRows) {
		var c = this,
			el = c.selector;
		var master_Cols = $(el).find(".lc_master table col");
		var colHeds = $(el).find(".lc_master table thead tr");
		var rows = $(el).find(".lc_master table tbody tr");
		var topLeftTable = $(el).find(".lc_clone_corner table");
		$(topLeftTable).find("colgroup").empty().append(master_Cols);
		$(topLeftTable).find("thead tr").empty(colHeds).append(colHeds);
		
		$.each(rows,function(i,row){
			if (i <= noRows) {
				
			}
		});
		
	};
	
	
	//This method renders the excel like Grid
	this.getGrid = function(selector,options) {
		var c = this;
		c.options = options;
		c.selector = selector;
		var root = $(selector);
		var minColumns = c.defaultOptions.minColumns;
		var minRows = c.defaultOptions.minRows;
		var editable=c.defaultOptions.editable;
		var keyNavigation= c.defaultOptions.keyNavigation;
		var oncellClick= c.defaultOptions.OnCellClick;
		var userTitle= c.defaultOptions.title;
		var field_annotation =  c.defaultOptions.field_annotation;
		var onColResize =  c.defaultOptions.onColResize;
		var onRowResize =  c.defaultOptions.onRowResize;
		var onColsort = c.defaultOptions.onColsort;
		if (options) {
			if ("undefined" != typeof options.minColumns) { minColumns = options.minColumns; }
			if ("undefined" != typeof options.minRows) { minRows = options.minRows; }
			if ("undefined" != typeof options.editable) { editable = options.editable;}
			if ("undefined" != typeof options.keyNavigation) { keyNavigation = options.keyNavigation; }
			if ("undefined" != typeof options.OnCellClick) { oncellClick = options.OnCellClick; }
			if ("undefined" != typeof options.title) { userTitle = options.title; }
			if ("undefined" != typeof options.field_annotation) { field_annotation = options.field_annotation; }
			if ("undefined" != typeof options.onColResize) { onColResize = options.onColResize; }
			if ("undefined" != typeof options.onRowResize) { onRowResize = options.onRowResize; }
			if ("undefined" != typeof options.onColsort) { onColsort = options.onColsort; }
		}else{
			
		}
		
		var border='<div style="position: absolute; top: 0px; left: 0px;">\
			<div class="wtBorder current" style=" background-color: rgb(82, 146, 247);"></div>\
			<div class="wtBorder current" style=" background-color: rgb(82, 146, 247);"></div>\
			<div class="wtBorder current" style=" background-color: rgb(82, 146, 247);"></div>\
			<div class="wtBorder current" style=" background-color: rgb(82, 146, 247);">\
		</div>';
		var input = '<div class="InputHolder" style="display: none;position: absolute;">\
		<textarea class="handsontableInput" style="overflow-y: hidden;"></textarea></div>';
		var temp='<span class="tempInputHolder" style="display: none;"></span>';
		
		var titleWrapper = $("<div class='title_wrapper'>");
		var title = $("<div class='title'>");
		titleWrapper.append(title);
		
		
		var coreContainer = $("<div class='gridWrapper'>");
		var masterGrid = $("<div class='lc_master'>");
		var topGrid = $("<div class='lc_clone_top'>");
		var leftGrid = $("<div class='lc_clone_left'>");
		var cornerGrid = $("<div class='lc_clone_corner'>");
		
		
		$(selector).append(coreContainer);
		coreContainer.append(masterGrid);
		coreContainer.append(topGrid);
		coreContainer.append(leftGrid);
		coreContainer.append(cornerGrid);
		coreContainer.append(input);
		coreContainer.append(temp);
		
		topGrid.css({"position":"absolute","left":0,"top":0,"overflow":"hidden","box-shadow":"0px 1px 1px 1px grey"});
		leftGrid.css({"position":"absolute","left":0,"top":0,"overflow":"hidden","box-shadow":"0px 1px 1px 1px grey"});
		cornerGrid.css({"position":"absolute","left":0,"top":0,"overflow":"hidden","box-shadow":"0px 1px 1px 1px grey"});
		
		var masterTable = this.createTable();
		var topTable = this.createTable();
		var leftTable = this.createTable();
		var cornerTable = this.createTable();
		
		masterGrid.append(masterTable);
		topGrid.append(topTable);
		leftGrid.append(leftTable);
		cornerGrid.append(cornerTable);
		
		masterGrid.append(this.setCellFocus());
		topGrid.append(this.setCellFocus());
		leftGrid.append(this.setCellFocus());
		cornerGrid.append(this.setCellFocus());
		
		
		for ( var columnIndex = -1; columnIndex < minColumns; columnIndex++) {
			var th = $("<th>");
			var col = $("<col>");
			var columns = masterGrid.find("colgroup");
			if (columnIndex == -1 ) {
				th.append();
				col.css("width","40px").addClass("Header");
			} else {
				var colname = this.colName(columnIndex);
				th.append(colname);
				th.attr("column-name", colname);
				col.css("width","100px");
			}
			columns.append(col);
			masterGrid.find("thead tr").append(th);
		}

		for ( var rowIndex = 0; rowIndex < minRows; rowIndex++) {
			var row = $("<tr>");
			var th = $('<th>');
			row.attr("row-no", rowIndex + 1);
			th.append(rowIndex + 1);
			row.append(th);
			for ( var columnIndex = 0; columnIndex < minColumns; columnIndex++) {
				var td = $('<td>');
				td.attr("tabindex", 0);
				td.attr("row-no", rowIndex + 1);
				td.attr("cell-id", this.colName(columnIndex) + (rowIndex + 1));
				row.append(td);
			}
			masterGrid.find("tbody").append(row);
		}
		
		var cloneCol= masterGrid.find("col").clone();
		var cloneHeadCol = masterGrid.find("col").clone();
		var cornerHeadCol = masterGrid.find("col").clone();
		var cloneHead = masterGrid.find("thead tr th").clone();
		var rowHead = masterGrid.find("tbody tr").clone();
		rowHead.find("td").remove();
		topGrid.find("colgroup").append(cloneCol);
		topGrid.find("thead tr").append(cloneHead);
		leftGrid.find("colgroup").append(cloneHeadCol[0]);
		leftGrid.find("tbody").append(rowHead);
		leftGrid.find("tbody").first().prepend('<tr><th></th></tr>');
		cornerGrid.find("colgroup").append(cornerHeadCol[0]);
		cornerGrid.find("thead tr").append("<th></th>");
		
		
		var colHdr = $(selector).find(".lc_clone_top th");
		var rowHdr = $(selector).find(".lc_clone_left th");
		this.col_Resizer(colHdr);
		this.row_Resizer(rowHdr);
		$(selector).append('<div class="resize-handler"></div>');
		$(selector).append('<div class="row-resize-handler"></div>');
		$(selector).off("scroll").scroll(function(event) {
			event.stopPropagation();
			
			c.scrollPos = {};
			c.scrollPos["scroll_l"] = $(selector).scrollLeft();
			c.scrollPos["scroll_t"] = $(selector).scrollTop();
			
			var element = $(this).find(".cellfocus");
			setInput(element,selector);
			setCurrent(element,selector);
			
			var left=$(this).scrollLeft();
			var top=$(this).scrollTop();
			topGrid.css({"left":-left+"px"});
			leftGrid.css({"top":-top+"px"});
			
		});
		
		
		c.enableColSort(onColsort);
		
		if (Util.parseBoolean(field_annotation)){
			eanbleAnnotations(selector);
		}
		
		if (Util.parseBoolean(keyNavigation)) {
			c.enableKeyNavigation();
		}
		if (Util.parseBoolean(editable)) {
			c.editable = Util.parseBoolean(editable);
			eanbleClick(selector,oncellClick,field_annotation);
		}else{
			eanbleClick(selector);
		}
	};

	//This method unbinds the column resize event
	
	this.unbindResize = function(elements) {
		if (elements && elements.lenght > 0) {
			$.each(elements,function(i,hdr){
				if($(hdr).hasClass("ui-resizable")) {
					$(hdr).resizable( "destroy" );
				}
			});
		}
	};
	
	this.unbind_col_resizer= function(){
		var c = this, 
			selector = c.selector,
			clnRowHdrs = $( selector).find(".lc_clone_top th"),
			mstrRowHdrs = $( selector).find(".lc_master tbody tr:first-child td");
		//c.unbindResize(clnRowHdrs);
		c.unbindResize(mstrRowHdrs);
	};
	
	this.unbind_row_resizer= function(){
		var c = this, 
			selector = c.selector, 
			clnRowHdrs = $( selector).find(".lc_clone_left th"),
			mstrRowHdrs = $( selector).find(".lc_master tbody tr td:nth-child(2)");
		//c.unbindResize(clnRowHdrs);
		c.unbindResize(mstrRowHdrs);
	};

	//This method binds the column resize event
	this.col_Resizer= function(element){
		
		var c = this,
			selector = c.selector,
			options = c.options,
			onColResize =  c.defaultOptions.onColResize;
		if (options) {
			if ("undefined" != typeof options.onColResize) { onColResize= options.onColResize; }
		}
		c.unbind_col_resizer();
		if (selector && element && element.length > 0) {
			$.each(element,function(i,hdr){
				if ($(hdr).is("td") && i == 0 ) {
					c.resize(hdr);
				} else {
					$(hdr).resizable({
						handles: "e",
						minWidth: 100,
						helper: "ui-resizable-helper",
						resize:function(event, ui ){
							var ofcet=ui.helper.offset();
							$(".resize-handler").offset({"left":ofcet.left+ui.helper.width()+1.5,"top":ofcet.top});
						},
						stop: function(event,ui){
							var width = ui.size.width;
							$(".resize-handler").css("display","none");
							var header = $(this).closest("table");
							var coreGrid=$(selector).find('.lc_master');
							header.find('col:eq('+$(this).index()+')').css("width",width+"px");
							coreGrid.find('table col:eq('+$(this).index()+')').css("width",width+"px");
							var element = $(selector).find(".cellfocus");
							setCurrent(element,selector);
							if(typeof onColResize == "function") {
								onColResize($(this));
							}
						},
						start : function(){
							var height=$(this).closest('div.ui-widget-content').height();
							$(".resize-handler").css({"display":"block","height":height+"px"});
						}
					});
				}
			});
		}
	};
	
	this.resize = function(cell) {
		var c = this,
			selector = c.selector,
			options = c.options,
			onColResize =  c.defaultOptions.onColResize,
			onRowResize =  c.defaultOptions.onRowResize;
		if (options) {
			if ("undefined" != typeof options.onColResize) { onColResize= options.onColResize; }
			if ("undefined" != typeof options.onRowResize) { onRowResize= options.onRowResize; }
		}
		if (!$(cell).hasClass("ui-resizable")) {
			$(cell).resizable({
				handles : "s,e",
				minHeight : 20,
				minWidth: 100,
				helper : "ui-resizable-helper1 ui-resizable-helper",
				resize : function (event, ui ) {
					var ofcet = ui.helper.offset();
					$(".resize-handler").offset({"left":ofcet.left+ui.helper.width()+1.5,"top":ofcet.top});
					$(".row-resize-handler").offset({"left":ofcet.left,"top":ofcet.top+ui.helper.height()+1.5});
				},
				stop: function(event,ui){
					
					var width = ui.size.width;
					$(".resize-handler").css("display","none");
					var header = $(this).closest("table");
					var coreGrid=$(selector).find('.lc_master');
					header.find('col:eq('+$(this).index()+')').css("width",width+"px");
					coreGrid.find('table col:eq('+$(this).index()+')').css("width",width+"px");
					var element = $(selector).find(".cellfocus");
					setCurrent(element,selector);
					
					var row_no = $(this).parent().attr("row-no");
					$(".row-resize-handler").css("display","none");
					var coreGrid=$(selector).find('.lc_master');
					coreGrid.find('table tr[row-no="'+row_no+'"]').css("height",ui.size.height+"px");
					$(this).parent().css("height",ui.size.height+"px");
					
					var element = coreGrid.find(".cellfocus");
					setCurrent(element,selector);
					
					if(typeof onRowResize == "function") {
						onRowResize($(this));
					}
					if(typeof onColResize == "function") {
						onColResize($(this));
					}
				},
				start:function(){
					
					$(".ui-resizable-helper1").width($(".rowHeader").width());
					var width=$(this).closest('div.ui-widget-content').width();
					$(".row-resize-handler").css({"display":"block","width":width+"px"});
					var height=$(this).closest('div.ui-widget-content').height();
					$(".resize-handler").css({"display":"block","height":height+"px"});
				}
			});
		}
	};
	
	//This method binds the column resize event
	this.row_Resizer= function(element){
		var c = this,
			selector = c.selector,
			options = c.options,
			onRowResize =  c.defaultOptions.onRowResize;
		if (options) {
			if ("undefined" != typeof options.onRowResize) { onRowResize= options.onRowResize; }
		}
		
		c.unbind_row_resizer();
		if (selector && element && element.length > 0) {
			$.each(element,function(i,hdr){
				
				if ($(hdr).is("td") && $(hdr).attr("row-no") == 1) {
					c.resize(hdr);
				} else {
					$(hdr).resizable({
						handles : "s",
						minHeight : 20,
						helper : "ui-resizable-helper1",
						resize : function (event, ui ) {
							var ofcet = ui.helper.offset();
							$(".row-resize-handler").offset({"left":ofcet.left,"top":ofcet.top+ui.helper.height()+1.5});
						},
						stop: function(event,ui){
							var row_no = $(this).parent().attr("row-no");
							$(".row-resize-handler").css("display","none");
							var coreGrid=$(selector).find('.lc_master');
							coreGrid.find('table tr[row-no="'+row_no+'"]').css("height",ui.size.height+"px");
							$(this).parent().css("height",ui.size.height+"px");
							
							var element = coreGrid.find(".cellfocus");
							setCurrent(element,selector);
							if(typeof onRowResize == "function") {
								onRowResize($(this));
							}
						},
						start:function(){
							
							$(".ui-resizable-helper1").width($(".rowHeader").width());
							var width=$(this).closest('div.ui-widget-content').width();
							$(".row-resize-handler").css({"display":"block","width":width+"px"});
						}
					});
				}
			});
			
		}
	};

	
	this.showHeaders = function(){
		var c = this,
			selector = c.selector,
			options = c.options;
			
		if (selector) {
			$(selector).find("thead").show();
			$(selector).find("tbody th").show();
			$(selector).find("col.Header").show();
		}
		/*if (options) {
			var colHdr = $(selector).find(".lc_clone_top th");
			var rowHdr = $( selector).find(".lc_clone_left th");//" .lc_master tbody tr td:first-child"
			var onColResize =  c.defaultOptions.onColResize;
			var onRowResize =  c.defaultOptions.onRowResize;
			if ("undefined" != typeof options.onColResize) { onColResize= options.onColResize; }
			if ("undefined" != typeof options.onRowResize) { onRowResize= options.onRowResize; }
			c.col_Resizer(colHdr);
			c.row_Resizer(rowHdr);
		} */
	};
	
	this.hideHeaders = function() {
		
		var c = this,
			selector = c.selector,
			options = c.options,
			colHdr = $(selector).find(".lc_master tbody tr:first-child td"),
			rowHdr = $( selector).find(".lc_master tbody tr td:nth-child(2)");
		if (selector) {
			$(selector).find("thead").hide();
			$(selector).find("tbody th").hide();
			$(selector).find("col.Header").hide();
		}
		if (options) {
			c.col_Resizer(colHdr);
			c.row_Resizer(rowHdr);
		} 
	};
	
	
	this.showGridLines = function(){
		var c = this,
			selector = c.selector;
		if (selector) {
			$(selector).removeClass("noGridLines");
		}
	};
	
	this.hideGridLines = function() {
		
		var c = this,
			selector = c.selector;
		if (selector) {
			$(selector).addClass("noGridLines");
		}
		
	};
	return this;
};