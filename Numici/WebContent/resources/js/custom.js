//Global variables
var currentIndent, previousIndent, DataTypes = null;
var _blockName;
var block={};
var measure=[];
var dimensions=[];


function checkBlockName(){
	var blockName=$('input[name="block_name"]').val();
	if(blockName){
		return true;
	}else{
		Util.showMessage("Please Enter Block Name");
		return false;
	}
	
}

function SaveOrUpdateBlock(saveOrUpdate,blockId){
	
	var b={};
	var m=[];
	var d=[];
	b.name=$('input[name="block_name"]').val();
	var measuredata=$(".measure_list tbody tr");
	$.each(measuredata,function(i,v){
		m.push($(v).data());
	});
	var dim=$(".dimension_list tbody tr");
	$.each(dim,function(i,v){
		d.push($(v).data());
	});
	b.measures=m;
	b.dimensions=d;
	if(saveOrUpdate === "save"){
		Util.ajaxPost("home/saveUserBlock",JSON.stringify(b),function(result){
			if(result.status){
				Util.showMessage(result.message);
				BlockManager.getUserBlocks();
			}else{
				Util.showMessage(result.message);
			}
		});
	}
	if(saveOrUpdate === "update" ){
		b.id=blockId;
		Util.ajaxPost("home/updateUserBlock",JSON.stringify(b),function(result){
			if(result.status){
				Util.showMessage(result.message);
				BlockManager.getUserBlocks();
			}else{
				Util.showMessage(result.message);
			}
		});
	}
	
	
}



function showFormula(element, upto) {
	var cells = [];
	var index = $(element).index() - 1;
	$(element).parent().nextAll('*:lt(' + upto + ')').each(function(i, value) {
		cells.push($(value).find('td:eq(' + index + ')').attr("cell-id"));
	});
	return '=sum(' + cells.join(",") + ')';
}

function AggregateData(element) {
	var totals = $(element).nextAll(".total");
	$(totals).each(function(i, v) {
		$(v).trigger("sum");
	});
}

$(document).on("sum",".total",function(event){
	var level = parseInt($(this).attr("level")) + 1;
	var element = $(this).prevAll('.total[level="' + level + '"]');
	var total = 0;
	if (element.length > 0) {
		$(element).each(function(i, v) {
			total += !isNaN(parseFloat($(v).text())) ? parseFloat($(v).text()) : 0;
		});
	}else {
		$(this).prevUntil('.total').filter(".input").each(function(i, v) {
			total += !isNaN(parseFloat($(v).text())) ? parseFloat($(v).text()) : 0;
		});
	}
	$(this).text(total);
});




function mergedNodeTree(data, id) {
	$(id).jstree(
			{
				"json_data" : {
					"data" : data
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
				"plugins" : [ "themes", "json_data", "crrm" ,"ui"]
			}).on("select_node.jstree",function(e,data){
				var node=data.rslt.obj.data("data");
				//console.log(node);
				var index = $('#excellviewtabs a[data-sheet="'+node.sheetName+'"]').parent().index();
				var sheetwrapper= $( '#excellviewtabs div[data-sheet="'+node.sheetName+'"]' );
				$('#excellviewtabs').tabs("option","active",index);

				$('#excellviewtabs td').removeClass("mergednode");

				if(node.columnNameFrom && node.rowIndex && node.columnNameTo){
					var columnNameFrom = node.columnNameFrom;
					var rowIndex=node.rowIndex;
					var columnNameTo=node.columnNameTo;
					var cellid=columnNameTo+rowIndex;
					var position = $(sheetwrapper).find('.gridBody tr[row-no='+rowIndex+']').position();
					var hrz_position=$(sheetwrapper).find('.gridBody td[cell-id='+columnNameFrom+rowIndex+']').position();
					var $row =$('#excellviewtabs div[data-sheet="'+node.sheetName+'"] td[cell-id='+columnNameFrom+rowIndex+']');

					//alert( hrz_position.left);
					$(".gridBody").scrollTop( position.top);
					$(".gridBody").scrollLeft( hrz_position.left );
					//$(".gridBody").animate({scrollTop: position.top}, '500', 'swing');
					//$(".gridBody").animate({scrollLeft: hrz_position.left-100}, '500', 'swing');

					$row.nextUntil('td[cell-id='+cellid+']')
					.addBack().add('td[cell-id='+cellid+']').addClass("mergednode").data();

				}else if(node.columnName && node.rowIndexFrom && node.rowIndexTo){
					var columnName = node.columnName;
					var rowIndexFrom= node.rowIndexFrom;
					var rowIndexTo = node.rowIndexTo;
					var position = $(sheetwrapper).find('tr[row-no='+rowIndexFrom+']').position();
					var hrz_position=$(sheetwrapper).find('td[cell-id='+columnName+rowIndexFrom+']').position();

					$(".gridBody").scrollTop( position.top);
					$(".gridBody").scrollLeft( hrz_position.left );
					//$(".gridBody").animate({scrollTop: position.top}, '500', 'swing');
					//$(".gridBody").animate({scrollLeft: hrz_position.left-100}, '500', 'swing');
					while(rowIndexFrom <= rowIndexTo ){
						var $cell = $('#excellviewtabs div[data-sheet="'+node.sheetName+'"] td[cell-id='+columnName+rowIndexFrom+']');
						$cell.addClass("mergednode");
						rowIndexFrom++;
					}

				}else if(node.columnNameFrom && node.columnNameTo && node.rowIndexFrom && node.rowIndexTo){
					var columnNameFrom = node.columnNameFrom;
					var columnNameTo= node.columnNameTo;
					var rowIndexFrom = node.rowIndexFrom;
					var rowIndexTo = node.rowIndexTo;
					var position = $(sheetwrapper).find('tr[row-no='+rowIndexFrom+']').position();
					var hrz_position=$(sheetwrapper).find('td[cell-id='+columnNameFrom+rowIndexFrom+']').position();
					$(sheetwrapper).scrollTop( position.top);
					$(sheetwrapper).scrollLeft( hrz_position.left );
					//$(".gridBody").animate({scrollTop: position.top}, '500', 'swing');
					//$(".gridBody").animate({scrollLeft: hrz_position.left-100}, '500', 'swing');
					while(rowIndexFrom <= rowIndexTo ){
						var $cell= $('#excellviewtabs div[data-sheet="'+node.sheetName+'"] td[cell-id='+columnNameFrom+rowIndexFrom+']');
						$cell.nextUntil(' td[cell-id='+columnNameTo+rowIndexFrom+']')
						.addBack().add('td[cell-id='+columnNameTo+rowIndexFrom+']').addClass("mergednode");
						rowIndexFrom++;
					}

				}
			});
}

// Event to change datatype format based on dataType selection in New Model
// block definition
$(document).on(
		"change",
		"#data_types",
		function() {

			var dtypeFormat = [], markup = "";
			$("#data_type_format").empty();
			var dis = $(this).val();
			$.each(DataTypes, function(index, value) {

				if (value.dataType === dis) {
					dtypeFormat = value.dataTypeFormat;
					return false;
				}

			});
			for ( var i = 0; i < dtypeFormat.length; i++) {
				markup += '<option value=' + dtypeFormat[i] + '>'
						+ dtypeFormat[i] + '</option>';
			}
			$("#data_type_format").append(markup);
		});

// Retriving data from MongoDb
function GetVdvclBlocks() {

	Util.ajaxGet("home/vdvcblocks", function(vdvcblocks) {
		if (vdvcblocks.length) {
			var sysblocks = [];
			var bizblocks = [];

			$.each(vdvcblocks, function(index, object) {
				if (object.parent === null) {
					function findChildren(id) {
						var childrenarray = [];
						$.each(vdvcblocks, function(i, v) {
							if (id === v.parent) {
								var children = findChildren(v.id);
								var node1=Util.jstreeNode(v.blockName,children,{"role" : v.role},{"data" : v});
								childrenarray.push(node1);
							}
						});

						return childrenarray;
					}
					var nodeChildren=findChildren(object.id);
					var rootNode=Util.jstreeNode(object.blockName,nodeChildren,{"role" : object.role},{"data" : object});
					console.log("rootNode :"+rootNode);
					switch (object.role) {
					case "sys":
						sysblocks.push(rootNode);
						break;
					case "biz":
						bizblocks.push(rootNode);
						break;
					}
				}

			});
			blockHierarchy.render(sysblocks, "#sysblocks");
			blockHierarchy.render(bizblocks, "#Bizblocks");
			}
		 });
}



function getMergedNodes(){
	Util.ajaxGet("home/getModels", function(mergedNodes) {
		if(mergedNodes.length>0){
			//console.log(mergedNodes);
			$("#visuals").empty();
			var json={};
			json.name="Models";
			json.children=mergedNodes;
			init(json);

			$("#visuals").dialog("open");
		}
	});
}


function getexcellModels(){

	Util.ajaxGet("home/getModels", function(models) {
		$("#modelsList").empty();
		if(models.length>0){

			var mark="";
			for(var i=0;i<models.length;i++){
				var title=models[i].name.toString();
				mark += '<div onclick="getSheets(\''+models[i].id+'\',\''+title+'\')" style="margin: 3px;background: grey;height: auto;padding: 5px;text-indent: 6px;\
				cursor: pointer;">'+models[i].name+'</div>';
			}
			//alert(mark);
			$("#modelsList").append(mark);
			 $( "#filelist" ).accordion({
			      collapsible: true,
			      heightStyle: "content"
			    });
			//$("#excellsheets").dialog("open");
		}
	});


}

function GetModelBlocks() {

	Util.ajaxGet("home/models", function(Models) {
		if (Models.length) {
			var modelTree = [];

			for ( var j = 0; j < Models.length; j++) {
				var node = {};
				node.children = [];
				node.data = Models[j].modelName;
				node.attr = {
					"role" : "model"
				};

				node.metadata = {};
				var userBlocks = Models[j].userBlocks;

				for ( var i = 0; i < userBlocks.length; i++) {
					var a = {
						"data" : userBlocks[i].blockName,
						"attr" : {
							"role" : userBlocks[i].role
						},
						"metadata" : {
							"data" : userBlocks[i]
						}
					};
					a.children = [];
					for ( var k = 0; k < userBlocks[i].dimensions.length; k++) {

						a.children
								.push({
									"data" : userBlocks[i].dimensions[k].blockName,
									"attr" : {
										"role" : userBlocks[i].dimensions[k].role
									},
									"metadata" : {
										"data" : userBlocks[i].dimensions[k]
									},
									"children" : []
								});

					}

					node.children.push(a);
				}
				;
				modelTree.push(node);

			}

			// console.log(JSON.stringify(modelTree));
			blockHierarchy.render(modelTree, "#modelblocks");
		}
	});

}






function toggleButton(type){
	switch(type){
	case "valueview":
		$("#val_famla_switch").addClass("valueview");
		$("#val_famla_switch").removeClass("formulaview");
		$("#val_famla_switch").find("span").text("Show Values");
		break;
	case "formulaview":
		$("#val_famla_switch").addClass("formulaview");
		$("#val_famla_switch").removeClass("valueview");
		$("#val_famla_switch").find("span").text("Show Formulas");
		break;
	}
}



$(function() {
	
	UIinitializer();
	
	
	$(document).on("click","#listLayouts",function(event){
		event.stopPropagation();
		var bldr_mdl_selected=$(".bldr_mdl_selected");
		
		if(bldr_mdl_selected.length >0){
			
			var model=$(bldr_mdl_selected).data("data");
			MdlLayoutManager.getAllModelLayouts(model,"#rightcontainer");
		}
	});
	
	$(document).on("focus",'input[name="block_name"]',function(){
		//_blockName=$('input[name="block_name"]').val();
	});
	/*$(document).on("blur",'input[name="block_name"]',function(){
		
		var block=$('input[name="block_name"]').val();
		if(block){
			Util.ajaxPost("home/isBlockExists/"+block,null,function(result){
				if(result){
					Util.showMessage("The Block Name already Exists ");
				}
			});
		}
		
	});*/
	
	
	
	$(document).on("click",".formulaview",function(){
		toggleButton("valueview");
		var tables=$("#excellviewtabs div table tbody");
		for(var i=0;i<tables.length;i++){
			//console.log($(tables[i]));
			var $row=$(tables[i]).children();
			$.each($row,function(i,v){
				var cell= $(v).children();
				$.each(cell,function(k,val){
					var data=$(val).data();
					if(!jQuery.isEmptyObject( data )){
						if(data.formula !== null){
							$(this).text(data.formula);
						}
					}
				});

			});
		}


	});
	$(document).on("click",".valueview",function(){
		toggleButton("formulaview");
		var tables=$("#excellviewtabs div table tbody");
		for(var i=0;i<tables.length;i++){
			//console.log($(tables[i]));
			var $row=$(tables[i]).children();
			$.each($row,function(i,v){
				var cell= $(v).children();
				$.each(cell,function(k,val){
					var data=$(val).data();
					if(!jQuery.isEmptyObject( data )){
						if(data.displayValue !== null){
							$(this).text(data.displayValue );
						}
					}
				});

			});
		}
	});
	
	$("#mergedNodes").click(function(){getMergedNodes();});
	$("#excels").on("click",function(){
		getexcellModels();
		$("#mdl_properties_window").dialog("open");
		$("#mdl_layout_window").dialog("open");
		$("#mdl_graphical_window").dialog("open");
		});

	

	// Fucntionality to Menu Items
	$("#newLayout").click(function() {
		var bldr_mdl_selected=$(".bldr_mdl_selected");
		
		if(bldr_mdl_selected.length >0){
			//$("#layoutCotainer").dialog("open");
			MdlLayoutManager.newLayout($(bldr_mdl_selected).data("data"),"#rightcontainer");
		}
		
	});

	$("#saveLayout").click(function() {
		MdlLayoutManager.saveLayout();
	});
	$("#closeLayout").click(function() {
		MdlLayoutManager.closeLayout();
	});
	


	$("#newModel").click(function(){
		VdVcModelManager.createNewModel();
	});
	
	//Shared Dimension Events
	$("#newShrdDim").click(function(e) {
		
		BlockManager.addDimensionDialog(e,"Shared Dimension","ShrdDim");
		
	});
	
	$("#openShrdDim").click(function(e) {
		BlockManager.editShrdDimension(e);
	});
	
	$("#deleteShrdDim").click(function(e) {
		e.stopPropagation();
		if ($(".shrdDimSelected").length > 0) {
			var block = $(".shrdDimSelected").data("data");
			BlockManager.deleteShrdDim(block);
		}
	});
	
	

	
	$('.pivoteContainer').on('scroll', function() {

		if ($(this).scrollLeft() == 21110) {
			// console.log($(this).scrollLeft());
		}
	});
	

	$(document).on("click",".gridBody .ui-icon",function() {
		
		var children=$(this).data("children");
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
						$(v).hide();
						$('.rowHeader tr[row-no="'+rowNo+'"]').hide();
					}
				});
			}
			if($(this).hasClass("ui-icon-plusthick")){
				$.each(children,function(i,v){
					$('.rowHeader tr[row-no="'+v+'"],.gridBody tr[row-no="'+v+'"]').show();
				});
				$(this).data("children",[]);
			}
		}
		$(this).toggleClass("ui-icon-minusthick").toggleClass("ui-icon-plusthick");
	});

	function neutraliseIndentation(element) {
		var siblings = $(element).siblings("li");
		$(siblings).data("indent", 1);
		$(siblings).each(function(i, v) {
			$(v).find("button.indent_rgt_Btn").css("margin-right", "10px");
		});
	}
	
	
	

	// check box change listener in layout designer for pivot table creation
	
	$(window).resize(
			function() {
				$('#layoutCotainer').dialog('option', 'position', {
					my : 'top',// Old code add 42
					at : 'top',
					of : $('#rightcontainer')
				});
				$('#layoutCotainer').dialog('option', 'width',
						$("#rightcontainer").width() - 10);
				$('#layoutCotainer').dialog('option', 'height',
						$("#rightcontainer").height() - 42);
				$("#laoutRgtContainer").dialog('option', 'width',
						$("#rightcontainer").width() * 0.4);
				$("#laoutRgtContainer").dialog('option', 'height',
						$("#rightcontainer").height() * 0.9);
			});

	$("#layoutBuilder").on("click", function() {
		MdlLayoutManager.openBuilder();
	});

		// Event for new model creation
	$(document).on("keypress", "#modelname", function(event) {
		if (event.which == 13) {
			if ($("#modelname").val()) {

				$("#mode_msg").empty();
				$("#mode_msg").append("Definition Mode");
				$("#mode_msg").position({
					of : $(this),
					my : "right center",
					at : "right-20 center"
				});

			} else {
				alert("Please Enter Model Name");
			}
		}
	});

	// Function to create new modelBlock UI
	$("#createNew_Mblock").click(function() {
		
		VdVcModelManager.createNewModel();
	});
	
	$("#openModel").on('click', function(e) {
		e.stopPropagation();
		var modelId = "";
		var bldr_mdl_selected=$(".bldr_mdl_selected");
		
		if(bldr_mdl_selected.length >0){
			modelId = $(bldr_mdl_selected).data("data").id;
			VdVcModelManager.openModel(modelId);
		}
		
	});
	
	$("#cloneModel").on('click', function(e) {
		e.stopPropagation();
		var modelId = "";
		var bldr_mdl_selected=$(".bldr_mdl_selected");
		
		if(bldr_mdl_selected.length >0){
			modelId = $(bldr_mdl_selected).data("data").id;
			var newModel = $.extend({}, $(bldr_mdl_selected).data("data"));
			delete newModel.id;
			VdVcModelManager.createNewModel(newModel);
		}
	});
	
	$("#cloneBlock").on('click', function(e) {
		
		e.stopPropagation();
		var bldr_blk_selected=$(".bldr_blk_selected");
		if(bldr_blk_selected.length >0){
			var newBlk = $.extend({}, $(bldr_blk_selected).data("data"));
			delete newBlk.id;
			BlockManager.open(newBlk,"clone");
		}
	});
	
	
	$("#userBlock, #newBlock").click(function(e) {
		e.stopPropagation();
		BlockManager.createBlock();
	});
	
	$("#openBlock").off('click').on('click', function(e) {
		e.stopPropagation();
		if ($(".bldr_blk_selected").length > 0) {
			var block = $(".bldr_blk_selected").data("data");
			BlockManager.open(block,"view");
		}
	});
	
	$("#deleteBlock").off('click').on('click', function(e) {
		e.stopPropagation();
		if ($(".bldr_blk_selected").length > 0) {
			var block = $(".bldr_blk_selected").data("data");
			BlockManager.deleteBlk(block);
		}
	});
	
	
	
	$(document).on(
			"click",
			".button",
			function() {
				
				var role=$(this).attr("data-btn-role");
				switch(role){
				case "addMeasure1":
					if(checkBlockName()){
						$(".measureUI").dialog("open");
						
						
						$(".measureUI").dialog("option", "buttons",[{ text: "Cancel", click: function() {$(this).dialog("close");} },
						                                            { text: "Save", click: function(event) {
						                								$(this).dialog("close");
						                								
						                								var obj={};
						                								
						                								
						                								var closure = this;
						                								var measure=$(closure).find("input[name='measureName']").val();
						                								var dataType=$(closure).find(".dataType").val();
						                								var dataFormat=$(closure).find(".dataFormat").val();
						                								
						                								obj.name=measure;
						                								obj.dataType=dataType;
						                								obj.format=dataFormat;
						                						
					                									var tr=$('<tr>');
					                									$(tr).data(obj);
					                									$(tr).append("<td>"+measure+"</td>");
					                									$(tr).append("<td>"+dataType+"</td>");
					                									$(tr).append("<td>"+dataFormat+"</td>");
					                									$(".measure_list tbody").append(tr);
						                								
						                								
						                							} }]);
					 
					}
					
					break;
				case "editMeasure1":
					
					var msr=$(".Measure_slctd").data();
					if(!jQuery.isEmptyObject( msr )){
						$(".measureUI").dialog("open");
						$(".measureUI").dialog("option", "buttons",[{ text: "Cancel", click: function() {$(this).dialog("close");} },
						                                            { text: "Update", click: function(event) {
						                								$(this).dialog("close");
						                								var msr=$(".Measure_slctd").data();
						                								var obj={};
						                								
						                								
						                								var closure = this;
						                								var measure=$(closure).find("input[name='measureName']").val();
						                								var dataType=$(closure).find(".dataType").val();
						                								var dataFormat=$(closure).find(".dataFormat").val();
						                								
						                								obj.name=measure;
						                								obj.dataType=dataType;
						                								obj.format=dataFormat;
						                								if(msr){
						                									$(".Measure_slctd").data(obj);
						                									var td=$(".Measure_slctd").find('td');
						                									$(td[0]).text(measure);
						                									$(td[1]).text(dataType);
						                									$(td[2]).text(dataFormat);
						                								}
						                								
						                							} }]);
						
						
						
						
						
						$('input[name="measureName"]').val(msr.name);
						$('.dataType').val(msr.dataType);
						$('.dataFormat').val(msr.format);
					}
					
					break;
				case "deleteMeasure1":
					
					var msr=$(".Measure_slctd");
					if(msr.length > 0){
						Util.promptDialog("Do you want delete the Measure",function(){$(msr).remove();},function(){});
					}
					break;
				case "addDimension1":
					if(checkBlockName()){
						$(".dimensionUI").dialog("open");
						
						
						$(".dimensionUI").dialog("option", "buttons",[{ text: "Cancel", click: function() {$(this).dialog("close");} },
						                                            { text: "Save", click: function(event) {
						                                            	$(this).dialog("close");
						                                				
						                                				var closure = this;
						                                				var dimName=$(closure).find("input[name='dimensionName']").val();
						                                				var aggregateFun=$(closure).find(".aggregateFunctions").val();
						                                				var dimValues=$(closure).find("input[name='dimvalues']");
						                                				var values=[];
						                                				$.each(dimValues,function(index,obj){
						                                					if($(obj).val()){
						                                						values.push($(obj).val());
						                                					}
						                                				});
						                                				var obj={};
						                                				obj.name=dimName;
						                                				obj.values=values;
						                                				obj.aggregateFun=aggregateFun;
						                                				var anchor=$('<a href="#">Values</a>');
						                                				$(anchor).data("values",values);
						                                				var td=$('<td>');
						                                				$(td).append(anchor);
						                                				var tr=$('<tr>');
						                                				$(tr).data(obj);
						                                				$(tr).append("<td>"+dimName+"</td>");
						                                				$(tr).append(td);
						                                				$(tr).append("<td>"+aggregateFun+"</td>");
						                                				$(".dimension_list tbody").append(tr);
						                								
						                								
						                							} }]);
					 
					}
					break;
				case "editDimension1":
					
					var dim=$(".Dimension_slctd").data();
					if(!jQuery.isEmptyObject( dim )){
						$(".dimensionUI").dialog("open");
						$(".dimensionUI").dialog("option", "buttons",[{ text: "Cancel", click: function() {$(this).dialog("close");} },
						                                            { text: "Update", click: function(event) {
						                								$(this).dialog("close");
						                								
						                								var closure = this;
						                                				var dimName=$(closure).find("input[name='dimensionName']").val();
						                                				var aggregateFun=$(closure).find(".aggregateFunctions").val();
						                                				var dimValues=$(closure).find("input[name='dimvalues']");
						                                				var values=[];
						                                				$.each(dimValues,function(index,obj){
						                                					if($(obj).val()){
						                                						values.push($(obj).val());
						                                					}
						                                				});
						                                				var obj={};
						                                				obj.name=dimName;
						                                				obj.values=values;
						                                				obj.aggregateFun=aggregateFun;
						                                				
						                                				$(".Dimension_slctd").data(obj);
						                                				var td=$(".Dimension_slctd").find('td');
						                                				$(td[0]).text(dimName);
					                									$(td[1]).find('a').data("values",values);
					                									$(td[2]).text(aggregateFun);
						                								
						                							} }]);
						
						
						
						
						
						$('input[name="dimensionName"]').val(dim.name);
						$('.aggregateFunctions').val(dim.aggregateFun);
        				$.each(dim.values,function(index,val){
        					if(index===0){
        						$(".dimensionUI").find("input[name='dimvalues']").val(val);
        					}else{
        						var markup='<tr>\
            						<td style="width: 30%;vertical-align: top;">Values :</td>\
            						<td style="width: 70%;">\
            						<input type="text" name="dimvalues" value="'+val+'" >\
            						</td>\
            						</tr>';
        						$(".dimensionUI").find("table tbody").append(markup);
        					}
        					
        				});
						
					}
					break;
				case "dimValue1":
					var markup='<tr>\
						<td style="width: 30%;vertical-align: top;">Values :</td>\
						<td style="width: 70%;">\
							<input type="text" name="dimvalues" >\
							<button><span class="ui-icon ui-icon-circle-close"></span></button>\
						</td>\
					</tr>';
					$(".dimensionUI").find("table tbody").append(markup);
					break;
				case "deleteDimension1":
					var dim=$(".Dimension_slctd");
					if(dim.length > 0){
						Util.promptDialog("Do you want delete the Dimension",function(){$(dim).remove();},function(){});
					}
					break;
				default:
					break;
				}

			});
	
	
	
	
	

	// Event to update modelblock name on New model dialog
	$(document).on(
			"blur",
			"#model_name",
			function() {
				if ($(this).val()) {
					$("#model_block").dialog('option', 'title',
							'Block: ' + $(this).val());
				}

			});


	$('#new_model_core').on('scroll', function() {
		$('#new_model_Dim').scrollTop($(this).scrollTop());
	});
	$('#new_model_Dim').on('scroll', function() {
		$('#new_model_core').scrollTop($(this).scrollTop());
	});

	// To search Sys, biz and model Blocks
	$("#syssearch_btn").click(function() {

		$("#sysblocks").jstree("search", $("#syssearch").val());

	});

	$("#bizsearch_btn").click(function() {

		$("#Bizblocks").jstree("search", $("#biz_search").val());

	});
	$("#model_search_btn").click(function() {

		$("#modelblocks").jstree("search", $("#model_search").val());

	});

	// To get previous Indent in New Model block definition
	function getPreviousIndent(current) {
		var preElement = $(current).closest("tr").prev().find(
				'td:nth-child(2) input');
		var indentValue = $(preElement).data("indentCounter");

		return indentValue;

	}
	// Indentation In Layout designer
	function getIndent(current) {
		var indent = $(current).prev('li').data("indent");
		return indent;
	}
	function changeParentChildRelation(element) {

	}

	

	
	
	// Auto Indent in New Model block definition UI
	$(document).on("click", "#new_model_core table tr td input", function() {
		var indentValue;
		if ($(this).closest('td').attr("class") === "lastRow") {
			var tr;
			var dd = $("#new_model_Dim").find('table tr:last-child')[0];
			// console.log(dd);
			$(dd).clone().insertAfter(dd);
			tr = $(this).closest('tr');
			$(tr).clone().insertAfter(tr);
			$(this).closest('td').removeClass("lastRow");
			$("#new_model_Dim").animate({
				scrollTop : $("#new_model_Dim table").height()
			}, "slow");
		}
		$(this).closest("td").prev().find("button").attr("disabled", false);
		currentIndent = $(this).data("indentCounter");
		previousIndent = getPreviousIndent(this);
		if (currentIndent) {
			indentValue = currentIndent;
		} else {
			currentIndent = indentValue = previousIndent;
		}
		if (indentValue) {
			var space = 10 * indentValue;
			$(this).data("indentCounter", indentValue);
			$(this).css("text-indent", space + "px");
		} else {
			if ($(this).attr("data-type") !== "block") {
				$(this).css("text-indent", "10px");
				$(this).data("indentCounter", 1);
			}
		}
	});

	// Indentation In New model Block definiton
	// Left Indentation
	$(document).on("click", "#removeIndent", function() {
		var space = 10;
		var element = $(this).closest("td").next().find("input");
		if (currentIndent > 1) {
			space = (space * (currentIndent - 1));
			// alert(space);
			element.data("indentCounter", currentIndent - 1);
			currentIndent = currentIndent - 1;
			element.css("text-indent", space + "px");
		}

	});

	// Right Indentation
	$(document).on("click", "#addIndent", function() {
		var space = 10;
		var element = $(this).closest("td").next().find("input");

		if (currentIndent - previousIndent == 0) {
			space *= (currentIndent + 1);
			element.data("indentCounter", currentIndent + 1);
			currentIndent = currentIndent + 1;
			element.css("text-indent", space + "px");
		}

	});
	// Prevent tab event on New Modelblock definition
	$(document).on("keydown", "#new_model_core table input[type='text']",
			function(objEvent) {
				if (objEvent.keyCode == 9) {
					objEvent.preventDefault();
				}
			});
	 
	$(document).on(
			"click",
			"li[role='model']",
			function() {
				console.log(JSON.stringify($(this).data()));
				$("li[role='model']").removeClass("bldr_mdl_selected");
				$(this).addClass("bldr_mdl_selected");
			});
	
	$(document).on(
			"click",
			"li[role='block']",
			function() {
				console.log(JSON.stringify($(this).data()));
				$("li[role='block']").removeClass("bldr_blk_selected");
				$(this).addClass("bldr_blk_selected");
			});

});




