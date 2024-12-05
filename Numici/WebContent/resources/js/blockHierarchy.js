
// The module provides blocks related functionality

var blockHierarchy =(function() {


		//This public method returns the blocks hierarchy 
		//This method uses jstree plugin and provides drag and drop feature.
		this.render= function(data,selector,cb){
			$(selector).jstree(
					{
						"json_data" : {
							"data" : data
						},
						"dnd" : {
							"drag_check":function(data){
								
								if(data.r.attr("role") == "model") {
									return false;
								}
								return { 
									after : false, 
									before : false, 
									inside : true 
								};
							},
							"drop_finish" : function(data) {
								var role = data.o.attr("role");
								if ( role === "block"){
									var span=$('<span class="dropedDim">');
									$(span).draggable({ revert: "invalid", helper: "clone" });
									$(span).append(data.o.data("data").name);
									
									$(span).data("name",data.o.data("data").name);
									$(span).data("block",data.o.data("data"));
									if(data.r.hasClass("jstree-drop")){
										$(data.r).append(span);
									}
								}
								if (role === "dimension") {
									var dim = data.o.data("data");
									var dimension = {};
									if (dim) {
										$.each(dim,function (key,val) {
											if (key === "id"){
												dimension["dimId"] = val;
											}else {
												dimension[key] = val;
											}
										});
									}
									var dVals = dim.values ? dim.values.join(',') : 'N/A';
									$("#new_block .dimension_list table tbody").append('\
										<tr>\
											<td>'+dim.name+'</td>\
											<td>'+dim.dataType+'</td>\
											<td>'+(dim.needAggregate ? "Yes" : "No")+'</td>\
											<td>'+dVals+'</td>\
										</tr>\
									');
									$("#new_block .dimension_list table tbody tr:last-child").data(dimension);
								}
								
								
							},
							"drop_check" : function(data) {
								
								var role = data.o.attr("role");
								
								if (role === "block" && data.r.hasClass("mdlBlocks")) {
									var dims=$(".dropedDim");
									for ( var k = 0; k < dims.length; k++) {
										//console.log(data.o.data());
										if ($(dims[k]).data("name") === data.o
												.data("data").name) {
											return false;
										}
									}
								} else if (role === "dimension" && data.r.hasClass("dimension_list")) {
									var validDrop = false;
									var dim = data.o.data("data");
									var drpdDims = $(".dimension_list tbody tr");
									if ( drpdDims && drpdDims.length > 0 ) {
										$.each(drpdDims , function (i,v) {
											var drpdDim = $(v).data();
											if (dim.name === drpdDim.name ){
												validDrop = false;
												return false;
											}else {
												validDrop = true;
											}
										});
									} else {
										validDrop = true;
									}
									return validDrop;
								}else {
									return false;
								}
								
								return {
									after : false,
									before : false,
									inside : true
								};
							}
						},
						"search" : {
							"case_insensitive" : true,
						// "show_only_matches": true
						},
						"themes" : {
							"theme" : "classic",
							"dots" : false,
							"icons" : false
						},
						 "crrm" : {
						        "move" : {
						          "check_move" : function (m) {
						            return false;
						          }
						        }
						      },
						      "ui" : {
						    	  "select_limit":1,
						    	  "disable_selecting_children":true
								},
						"contextmenu": {"items": customMenu},
						"plugins" : [ "themes", "json_data", "crrm","dnd", "search","contextmenu" ]
					}).bind("loaded.jstree", function (event, data) {
						if (typeof cb == "function") {
							cb();
						}
					});
		};
		
		//This method provides context menus for blocks
		this.customMenu= function(node) {


		    // The default set of all items
		    var items = {
		        Edit: { // The "rename" menu item
		            label: "Edit",
		            action: function (object) {
		            	//openBlock(object);
		            	Open(object);
		            },
		            "separator_after"   : true
		        },
		        deleteItem: { // The "delete" menu item
		            label: "Delete",
		            action: function (object) {
		            	deleteBlock(object);
		            }
		        },
		        AddRanges: { // The "rename" menu item
		            label: "AddRanges",
		            action: function (object) {
		            	InstansiateBlock(object);
		            }
		        },
		        deleteModel:{
		        	label:"Delete",
		        	action: function(object){
		        		alert("model");
		        	}
		        }
		    };
		    if($(node).data("data")){
		    	
		    	 switch($(node).attr("role")){
		    	    case "sys":
		    	    	//delete items.deleteItem;
		    	    	//delete items.AddRanges;
		    	    	break;
		    	    case "biz":
		    	    	//delete items.deleteItem;
		    	    	//delete items.AddRanges;
		    	    	break;
		    	    case "block":
		    	    	delete items.deleteItem;
		    	    	delete items.AddRanges;
		    	    	delete items.deleteModel;
		    	    	delete items.Edit;
		    	    	break;
		    	    case "model":
		    	    	delete items.deleteItem;
		    	    	delete items.deleteModel;
		    	    	delete items.AddRanges;
		    	    	delete items.Edit;
		    	    	break;
		    	    default:
		    	    	delete items.deleteItem;
		    	    	delete items.deleteModel;
		    	    	delete items.AddRanges;
		    	    	delete items.Edit;
		    	    	break;

		    	    }
		    	  return items;
		    }else return false;

		};
		
		
		this.deleteBlock=function(object){
			var block=$(object).data("data");
			Util.promptDialog("Do you want delete the block",
			function(){
				Util.ajaxPost("home/deleteUserBlock/"+block.id,null,function(result){
					if(result.status){
						Util.showMessage(result.message);
						getUserBlocks();
					}else{
						Util.showMessage(result.message);
					}
				});
			},function(){
				$( "#new_block" ).dialog( "close" );}
			);
		};
		//This method shows block as grid and is called from context menu
		this.openBlock=function(object){
			
			var block=$(object).data("data");
			var isOpen = $("#model_block").dialog("isOpen");
			if (isOpen) {
					$("#modelBlock_save_confi").dialog("open");
				} else {
					$("new_model_core").empty();
					$("new_model_Dim").empty();

					//console.log($(object).data("data"));


					ModelGrid({
						id : "new_model_core",
						type : "Core",
						rows : block.categories.length==0? 3 :block.categories.length+1,
						columns : 4
					});
					ModelGrid({
						id : "new_model_Dim",
						type : "Dim",
						rows : block.categories.length==0? 3 :block.categories.length+1,
						columns : block.dimensions.length==0 ? 1 : block.dimensions.length+1
					});
					$('#model_block').dialog({
					position : {
							my : 'center',
							at : 'center',
							of : $('#rightcontainer')
						}
					});

					$("#model_name").val(block.name);
					$("#data_types option").each(function(){
						  if ($(this).val() == block.blockDataType)
						    $(this).attr('selected','selected');
						});
					$("#data_type_format option").each(function(){
						  if ($(this).val() == block.blockDTFormat)
						    $(this).attr('selected','selected');
						});
					$("#model_block").dialog('option', 'title', 'Block: '+block.name);
					$("#model_block").dialog("open");
				}

		};

		//This method is called from context menu and provides Instantiating the block
		this.InstansiateBlock =function(object){

			$("#blkInstance").remove();
			var div = $("<div id='blkInstance'>");
			var input=$("<input type='text' >");
			$(div).append(input);

			$(div).dialog();
			$("#blkInstance").dialog("option",{
				autoOpen : false,
				modal : true,
				width : 400,
				height : 200,
				show : {
					effect : "blind",
					duration : 500
				},
				hide : {
					effect : "blind",
					duration : 500
				},
				buttons : {
					"Save" : function() {
						//$(this).dialog("close");
						var data=[];
						var ranges=$("#blkInstance input");
						$(ranges).each(function(index,value){
							if($(value).val()){
								data.push($(value).val());
							}
						});

						//console.log(data);
					},
					"Add" : function() {
						var input=$("<input type='text' >");
						$(this).append(input);

					}
				}
			});

		};
		
		this.Open=function(obj){
			
			var isOpen = $( "#new_block" ).dialog( "isOpen" );
			var block=$(obj).data("data");
			console.log(block);
			var blockId=block.id;
			var blockName=block.name;
			var measure=block.measures;
			var dimensions=block.dimensions;
			if(isOpen){
				Util.promptDialog("Do you want save changes",function(){SaveOrUpdateBlock("update",blockId);$( "#new_block" ).dialog( "close" );},function(){$( "#new_block" ).dialog( "close" );});
			}else{
				$("#new_block").dialog("option", "buttons",[{ text: "Cancel", click: function() {$(this).dialog("close");} },
				                                            { text: "Update", click: function(event) {SaveOrUpdateBlock("update",blockId);} }]);
				
				$("#new_block").dialog("open");
				
				if(blockName){
					$('input[name="block_name"]').prop('disabled', true);
					$('input[name="block_name"]').val(blockName);
				}
				if(dimensions && dimensions.length > 0){
					$(".dimension_list tbody").empty();
					$.each(dimensions,function(i,v){
						var anchor=$('<a href="#">Values</a>');
        				$(anchor).data("values",v.values);
        				var td=$('<td>');
        				$(td).append(anchor);
        				var tr=$('<tr>');
        				$(tr).data(v);
        				$(tr).append("<td>"+v.name+"</td>");
        				$(tr).append(td);
        				$(tr).append("<td>"+v.aggregateFun+"</td>");
        				$(".dimension_list tbody").append(tr);
					});
				}
				if(measure && measure.length > 0){
					$(".measure_list tbody").empty();
					$.each(measure,function(i,v){
						
						var tr=$('<tr>');
						$(tr).data(v);
						$(tr).append("<td>"+v.name+"</td>");
						$(tr).append("<td>"+v.dataType+"</td>");
						$(tr).append("<td>"+v.format+"</td>");
						$(".measure_list tbody").append(tr);
					});
				}
				
			}
			
		};

		return this;

})();