
$.datepicker.parseDate = function(format, value) {
    return moment(value, format).toDate();
};
$.datepicker.formatDate = function (format, value) {
    return moment(value).format(format);
};


var VdVcMdlManager = {};
var VdVcBlkManager = {};
var VdVcModelManager = (function(mngr){
	
	var self = mngr;
	self.isBuilderCreated = false;
	mngr.getWebSocketUrl = function() {
		var url = window.location.host;
		var index = url.indexOf(":");
		if (index > 0) {
			url = url.substring(0, index);
		}
		var pathnaemArray=window.location.pathname.split( '/' );
		//url = "ws://"+url+":8080/mb";
		url = "ws://"+url+":"+window.location.port+"/" + pathnaemArray[1] + "/mb";

		return url;
	};

	mngr.createModelBuilder = function(modelId) {
		var c = this;
		c.dlg = $("<div class='vdvc-mdl-builder'></div>").dialog({
			autoOpen : false,
			resizable: false,
			appendTo: "body",
			draggable: false ,
			title : "Model Builder - New Model",
			minHeight: 200,
			width : $("#rightcontainer").width()-10,
			height : $("#rightcontainer").height(),
			position : { my : 'top', at : 'top', of : '#rightcontainer' },
			show : { effect : "blind", duration : 500 },
			hide : { effect : "blind", duration : 500 },
			buttons : [{
			     "text" : "Cancel",
			     "click" :  function() {
			      $(this).dialog("close");
			     }
			    },{
			     "text" : "Save",
			     "id" : "modelBuilderSave",
			     "click" :   function() {
			      c.SaveModel(modelId);
			     }
			}],
			create : function(event,ui) {
				c.isBuilderCreated = true;
			},
			close: function(){
				$(this).dialog("destroy");
				c.isBuilderCreated = false;
			}
		});
	};

	mngr.getMarkup = function() {
		return '\
		<div class="vdvc-errMsg" style="height:20px;color:red;"></div>\
		<table style="width:100%;">\
			<tr>\
				<td style="width: 20%;">Model Name :</td>\
				<td style="width: 80%;"><input type="text" name="model_name" placeholder="Model Name"></td>\
			</tr>\
			<tr>\
				<td style="width: 20%;">ModelDefinition</td>\
				<td style="width: 80%;"><div><img data-id="trash" src="resources/images/trash.png" style="float:right;"></div></td>\
			</tr>\
			<tr>\
				<td style="width: 20%;vertical-align:top;text-align:center;">Blocks :</td>\
				<td style="width: 80%;">\
					<div class="mdlBlocks jstree-drop" style="height:100px;width:100%;background-color:rgb(210, 233, 241);" placeholder="Drop dimensions Here"></div>\
				</td>\
			</tr>\
			<tr class="sclr-vals-container">\
				<td style="width: 20%;vertical-align:top;">Scalar :</td>\
				<td style="width: 80%;">\
					<div class="sclr-toolbar" style="height:25px;width:100%;background-color:rgba(125, 148, 7, 0.2);" >\
						<button class="btn " style="float:right;" data-action="delete" title="Delete">\
							<span class="ui-icon ui-icon-trash"></span>\
						</button>\
						<button class="btn" style="float:right;" data-action="edit" title="Edit">\
							<span class="ui-icon ui-icon-pencil"></span>\
						</button>\
						<button class="btn" style="float:right;" data-action="add" title="Add">\
							<span class="ui-icon ui-icon-plus"></span>\
						</button>\
					</div>\
					<div class="sclr-vals" style="height:150px;width:100%;background-color:white;overflow:hidden;border:none;" >\
						<div style=" height:20px;width: 100%;background-color: white;overflow: auto;box-shadow: 0px 0px 12px 2px rgb(89, 92, 58);margin-bottom: 2px;">\
						<table style="width:100%;">\
							<thead>\
								<tr style="background:rgba(125, 148, 7, 0.2);height:20px;"><th>Name</th><th>Data Type</th><th>Value</th></tr>\
							</thead>\
						</table>\
						</div>\
						<div style="height:130px;width:100%;background-color:white;overflow:auto;">\
						<table style="width:100%;">\
							<tbody></tbody>\
						</table>\
						</div>\
					</div>\
				</td>\
			</tr>\
			<tr class="fmla-errs" style="display:none">\
				<td style="width: 20%;vertical-align:top;text-align:center;">Formula Errors :</td>\
				<td style="width: 80%;">\
					<div class="errors" style="height:100px;width:100%;background-color:white;overflow:auto;" ></div>\
				</td>\
			</tr>\
			<tr>\
				<td style="width: 20%;vertical-align:top;">Formulas :</td>\
				<td style="width: 80%;"><textarea rows="4" cols="80" name="formulas"></textarea></td>\
			</tr>\
			<tr>\
				<td style="width: 20%;">DataImport :</td>\
				<td style="width: 80%;"></td>\
			</tr>\
			<tr>\
				<td style="width: 20%;vertical-align:top;text-align:center;">Correspondence :</td>\
				<td style="width: 80%;"><textarea rows="4" cols="80" name="Correspondence"></textarea></td>\
			</tr>\
			<tr>\
				<td style="width: 20%;vertical-align:top;text-align:center;">Sources :</td>\
				<td style="width: 80%;"></td>\
			</tr>\
			<tr>\
				<td style="width: 20%;vertical-align:top;text-align:right;">Name :</td>\
				<td style="width: 80%;"><input type="text" name="source_name" ></td>\
			</tr>\
			<tr>\
				<td style="width: 20%;vertical-align:top;text-align:right;">Type :</td>\
				<td style="width: 80%;"><input type="text" name="source_Type" ></td>\
			</tr>\
			<tr>\
				<td style="width: 20%;vertical-align:top;text-align:right;">IMName :</td>\
				<td style="width: 80%;"><input type="text" name="source_IMName" ></td>\
			</tr>\
		</table>';
	};

	mngr.handleScalarValueCURDOperations =  function(dlg,action) {
		switch(action) {
		case "add" : 
			
			if (dlg && dlg.length > 0) {
				var sui = new ScalarValuePopup(null);
				sui.show(function(sclr) {
					$(dlg).find(".sclr-vals table tbody").append('\
						<tr>\
							<td>'+sclr.name+'</td>\
							<td>'+sclr.dataType+'</td>\
							<td>'+sclr.value+'</td>\
						</tr>'
						);
					$(dlg).find(".sclr-vals table tbody tr:last-child").data(sclr);
				});
			}
			break;
		case "edit" : 
			
			if (dlg && dlg.length > 0) {
				var scalar = $(dlg).find(".scalar_slctd").data();
				if (scalar) {
					var sui = new ScalarValuePopup(scalar);
					sui.show(function(sclr) {
						$(dlg).find(".scalar_slctd").data(sclr);
						$(dlg).find(".scalar_slctd").html('\
								<td>'+sclr.name+'</td>\
								<td>'+sclr.dataType+'</td>\
								<td>'+sclr.value+'</td>'
						);
					});
				} else {
					$(dlg).find(".vdvc-errMsg").html("Please select the Scalar to Edit");
				}
			}
			
			break;
		case "delete" : 
			if (dlg && dlg.length > 0) {
				var sclr = $(dlg).find(".scalar_slctd");
				if(sclr.length > 0){
					Util.promptDialog("Do you want delete the Scalar",
						function() {
							$(sclr).remove();
						},
						function() { } );
				} else {
					$(dlg).find(".vdvc-errMsg").html("Please select the Scalar to Delete");
				}
			}
			break;
		}
	};
	
	mngr.bindEvents = function(dlg) {

		var c = this;
		if (dlg) {
			$(dlg).find('button.btn').off('click').on('click', function(e){
				c.handleScalarValueCURDOperations(dlg,$(this).attr("data-action"));
			});
			$(document).off("click",".sclr-vals tbody tr").on("click",".sclr-vals tbody tr", function(e) {
				$(dlg).find(".sclr-vals tbody tr").removeClass("scalar_slctd");
				$(this).addClass("scalar_slctd");
			});
		}
	};
	
	
	mngr.openModel = function(modelId) {
		var c = this;
		Util.ajaxGet("model/"+modelId, function(result){
			console.log(result);
			if (!result.Status) { return ; }
			var model = result.Model;
			if (c.isBuilderCreated) {
				if (c.dlg && c.dlg.length > 0) {
					$( c.dlg ).dialog( "moveToTop" );
				}
				Util.showMessage("Please close the Model Builder");
			} else {
				c.createModelBuilder(model.id);
				if (c.dlg && c.dlg.length > 0) {
					$(c.dlg).dialog("option", "title", "Model Builder - "+model.name);
					$(c.dlg).on( "dialogopen", function( event, ui ) {
						$(this).append(c.getMarkup());
						
						c.bindEvents($(this));
						
						c.renderModel(this, model);
						$(this).find( "img[data-id='trash']" ).droppable({
						      drop: function( event, ui ) {
						    	  $(ui.draggable).remove();
						    	  $(this).css({"height":"32px","width":"32px"});
						      },
						      over:function(){
						    	  $(ui.helper).css("background","red");
						    	  $(this).css({"height":"64px","width":"64px"});
						      },
						      out:function(){
						    	  $(this).css({"height":"32px","width":"32px"});
						      }
						});
					});
					$(c.dlg).dialog("open");
				}
			}
		},false,true);
	};

	mngr.renderModel = function(el, model) {
		$(el).find("input[name=model_name]").val(model.name);
		var blocks = model.modelDefinition["Blocks"];
		var bc = $(el).find(".jstree-drop");
		$.each(blocks, function(i, block) {
			var span=$('<span class="dropedDim">');
			$(span).draggable({ revert: "invalid", helper: "clone" });
			$(span).append(block.name);
			$(span).data("name", block.name);
			$(span).data("block", block);
			$(bc).append(span);
		});
		if (model.formulas) {
			var formulas = model.formulas.join("&");
			$(el).find("textarea[name=formulas]").val(formulas);
		}
		if (model.scalars) {
			$.each(model.scalars, function(i, sclr) {
				var tr = $('<tr>');
				tr.data(sclr);
				tr.append('\
					<td>'+sclr.name+'</td>\
					<td>'+sclr.dataType+'</td>\
					<td>'+sclr.value+'</td>'
				);
				$(el).find(".sclr-vals table tbody").append(tr);
			});
		}
	};

	mngr.createNewModel = function(model){
		var c = this;
		if (c.isBuilderCreated) {
			if (c.dlg && c.dlg.length > 0) {
				$( c.dlg ).dialog( "moveToTop" );
			}
			Util.showMessage("Please close the Model Builder");
		} else {
			c.createModelBuilder();
			if (c.dlg && c.dlg.length > 0) {
				$(c.dlg).dialog("option", "title", "Model Builder - New Model");
				$(c.dlg).on( "dialogopen", function( event, ui ) {
					$(this).append(c.getMarkup());
					
					c.bindEvents($(this));
					
					if (model) {
						$(this).dialog("option", "title", "Model Builder - Clone Model("+model.name+")");
						model.name = "";
						c.renderModel(this, model);
					}

					$(this).find( "img[data-id='trash']" ).droppable({
					      drop: function( event, ui ) {
					    	  $(ui.draggable).remove();
					    	  $(this).css({"height":"32px","width":"32px"});
					      },
					      over:function(){
					    	  $(ui.helper).css({"background":"red","width":"0.5em","height":"0.5em"});
					    	  $(this).css({"height":"64px","width":"64px"});
					      },
					      out:function(){
					    	  $(this).css({"height":"32px","width":"32px"});
					      }
					});
				});
				$(c.dlg).dialog("open");
			}
		}
	};

	mngr.extractDataImportSection = function(sourceName, sourceType, sourceIMName, corrText) {
		var dataImport = {
			Sources: { }
		};

		if (sourceName) {
			dataImport.Sources.Name=sourceName;
		}

		if (sourceType) {
			dataImport.Sources.Type = sourceType;
		}

		if (sourceIMName) {
			dataImport.Sources.IMName = sourceIMName;
		}

		if (corrText) {
			dataImport.Correspondence = corrText.split("&");
		}

		return dataImport;
	};

	mngr.extractBlockDefinitions = function(domBlocks) {
		var blocks = [];
		$.each(domBlocks,function(i,v) {
			blocks.push($(v).data("block"));
		});

		return blocks;
	};

	mngr.getScalars = function() {
		var c = this, dlg = c.dlg;
		var scalars = [];
		var sclrsList = $(dlg).find(".sclr-vals table tbody tr");
		if (sclrsList && sclrsList.length > 0 ) {
			$.each(sclrsList,function(i,v){
				if (!$.isEmptyObject($(v).data())) {
					scalars.push($(v).data());
				}
			});
		}
		return scalars;
	};
	
	mngr.retrieveModelFromUI = function() {
		
		var c = this, dlg = c.dlg;
		var sourceName = $(dlg).find('input[name="source_name"]').val().trim();
		var sourceType =  $(dlg).find('input[name="source_Type"]').val().trim();
		var sourceIMName =  $(dlg).find('input[name="source_IMName"]').val().trim();
		var corrText =  $(dlg).find('textarea[name="Correspondence"]').val().trim();
		var formulas =  $(dlg).find('textarea[name="formulas"]').val().trim();
		
		var obj = {
			name:  $(dlg).find('input[name="model_name"]').val(),
			modelType: "Builder Created Model",
			scalars : c.getScalars(),
			modelDefinition: {
				Blocks: this.extractBlockDefinitions($(".dropedDim"))
			},
			dataImport: this.extractDataImportSection(sourceName, sourceType, sourceIMName, corrText),
			formulas: formulas ? formulas.split("&") : null
		};

		return obj;
	};

	mngr.validateFormula = function (obj) {
		var c = this,dlg = c.dlg;
		var status = false;
		var fmlaErrors = $(dlg).find(".fmla-errs");
		Util.ajaxSyncPost("model/formula/validate",obj,function(result){
			if (result.Status) {
				if (typeof result.Data != "undefined" && result.Data != null) {
					fmlaErrors.show();
					fmlaErrors.find("div.errors").empty();
					var markup = "<ul style='list-style-type: none;padding: 5px 0px 0px 5px;'>";
					$.each(result.Data, function(i,v){
						if (typeof v !== "undefined" && v != null) {
							var errMsg ="<i style='color:red;' title='"+v.message+"'>error</i>";
							var errIndx = v.pos;
							var output = [v.formula.slice(0, errIndx), errMsg, v.formula.slice(errIndx)].join('');
							markup +="<li>"+output+"</li>";
						}
					});
					markup += "</ul>";
					fmlaErrors.find("div.errors").append(markup);
				} else {
					status = true;
					fmlaErrors.hide();
				}
			} else {
				Util.showMessage(result.Message);
			}
		});

		return status;
	};

	mngr.validateModel = function(model) {
		var status = false;
		var mdlBlocks = model.modelDefinition.Blocks;
		if (typeof model.name !== "undefined" && model.name.trim() !== "") {
			status = true;
			$('input[name="model_name"]').closest("td").css("border","none");
		} else {
			status = false;
			$('input[name="model_name"]').closest("td").css("border","2px solid red");
			$('input[name="model_name"]').focus();
			//Util.showMessage("Please Enter the Model Name");
			return status;
		}

		if ( mdlBlocks && mdlBlocks.length > 0 ) {
			if (model.formulas && model.formulas.length > 0) {
				var obj = {};
				obj["mdl"] = mdlBlocks;
				obj["formula"] = model.formulas;
				obj["scalars"] = model.scalars;
				status = this.validateFormula(obj);
			}
		}
		return status;
	};

	mngr.SaveModel=function(modelId) {
		var c = this,dlg = c.dlg;
		var obj = this.retrieveModelFromUI();
		var isValid = this.validateModel(obj);
		if ( isValid ) {
			if ("undefined" != typeof modelId) {
				obj.id = modelId;
			}
			Util.ajaxPost("model/save", obj, function(result){
				if(result.Status){
					var userInfo= Util.getUserInfo();
					var ws = new WebSocket(c.getWebSocketUrl());
				     ws.onmessage = function (message) {
				      alert(message.data);
				     };
				     ws.onopen = function() {
				    	if(!jQuery.isEmptyObject( userInfo )){
				    		var data = {modelId:result.ModelId, userId:userInfo.UserId, userName:userInfo.UserName, orgName:userInfo.Organization};
					        ws.send(JSON.stringify(data));
				    	}
				     };
					Util.showMessage(result.Message);
					c.getBuilderModels();
					if (dlg && dlg.length > 0) {
						$(dlg).dialog("close");
					}
				} else {
					Util.showMessage(result.Message);
				}
			});
		}
	};

	mngr.getBuilderModels = function(){
		Util.ajaxGet("model/list/builder", function(results) {

			if(results.Status){
				$("#modelblocks").empty();
				if (results.Models && results.Models.length > 0) {
					var modelBlocks = [];
					$.each(results.Models, function(index, object) {
						var childrenarray = [];
						if(object.modelDefinition){
							if(object.modelDefinition.Blocks){
								$.each(object.modelDefinition.Blocks,function(i,v){
									var node=Util.jstreeNode(v.name,object.dimensions,{"class" : "block"},{"data" : v});
									childrenarray.push(node);
								});
							}
						}

						var node1=Util.jstreeNode(object.name,childrenarray,{"role" : "model","class":"model"},{"data" : object});
						modelBlocks.push(node1);

					});
					
					if (self.modelId) {
						$( "#tabs" ).tabs( "option", "active", 3);
						blockHierarchy.render(modelBlocks, "#modelblocks",function(){
							var vdvc_mdls = $("#modelblocks").find('li[role=model]'); 
							if (vdvc_mdls && vdvc_mdls.length > 0) {
								$.each(vdvc_mdls,function(i,v){
									var id = $(v).data().data ? $(v).data().data.id : null;
									if (id == self.modelId) {
										$(v).trigger("click");
										return false;
									}
								});
							}
							self.openModel(self.modelId);
							self.modelId = null;
						});
					} else {
						blockHierarchy.render(modelBlocks, "#modelblocks");
					}
				}
			}else{
				Util.showMessage(results.Message);
			}
		},false,true);
	};

	return mngr;

})(VdVcMdlManager);

var BlockManager = (function(mngr) {
	var self = mngr;
	mngr._block = false;
	mngr.isBuilderCreated = false;
	mngr.getUserBlocks = function() {
		Util.ajaxGet("userblock/list", function(result) {
			$("#UserBlocks").empty();
			var results = result.Blocks;
			if (results.length > 0) {
				var modelBlocks = [];

				$.each(results, function(index, object) {
					var childrenarray = [];
					if(object.dimensions){
						$.each(object.dimensions,function(i,v){
							var node=Util.jstreeNode(v.name,object.dimensions,{"role" : "dimension","class":"dimension"},{"data" : v});
							childrenarray.push(node);
						});
					}
					if(object.measures){
						$.each(object.measures,function(i,v){
							var node=Util.jstreeNode(v.name,object.measures,{"role" : "measure","class":"measure"},{"data" : v});
							childrenarray.push(node);
						});
					}

					var node1=Util.jstreeNode(object.name,childrenarray,{"role" : "block","class":"block"},{"data" : object});
					modelBlocks.push(node1);

				});
				blockHierarchy.render(modelBlocks, "#UserBlocks");
			}
		},false,true);
	};

	mngr.ceateBlkBuilder = function() {

		var c = this;
		c.dlg = $('<div id="new_block">').dialog({
			resizable: false,
			minHeight: 200,
			autoOpen : false,
			appendTo : "body",
			width: $("#rightcontainer").width()-10,
			height: $("#rightcontainer").height(),
			title: 'Block Builder - New Block',
			position: { my : 'top', at : 'top', of : '#rightcontainer' },
			show: { effect : "blind", duration : 500 },
			hide: { effect : "blind", duration : 500 },
			buttons: [{ text: "Cancel", "click" : function(e) { $(this).dialog("close"); } },
                      { text: "Save",id : "dlgBlkSave", "click" :function(e) { c.saveBlock(e);  } }],
            create : function(event,ui) {
            	c.isBuilderCreated = true;
          	},
			close: function() {
				$(this).dialog("destroy");
				c._block = null;
				c.isBuilderCreated = false;
			}
		});
		return c.dlg;
	};

	mngr.getBlockMarkup = function() {
		return '\
		<div class="vdvc-errMsg" style="height:20px;color:red;"></div>\
		<table style="width:100%;">\
			<tr>\
				<td style="width: 20%;">Name :</td>\
				<td style="width: 80%;"><input type="text" name="block_name" placeholder="Block Name"></td>\
			</tr>\
			<tr>\
				<td style="width: 20%;">Measure</td>\
				<td style="width: 80%;">\
					<button data-btn-role="addMeasure" class="button">Add</button>\
					<button data-btn-role="editMeasure" class="button">Edit</button>\
					<button data-btn-role="deleteMeasure" class="button">Delete</button>\
				</td>\
			</tr>\
		</table>\
		<div class="measure_list" style="height:150px;overflow: auto;">\
			<table style="width:100%;">\
				<thead>\
					<tr>\
						<th>Measure</th>\
						<th>Label</th>\
						<th>Data Type</th>\
						<th>Format</th>\
						<th>Aggregate Function</th>\
					</tr>\
				</thead>\
				<tbody>\
				</tbody>\
			</table>\
		</div>\
		<table style="width:100%;">\
			<tr>\
				<td style="width: 20%;">Dimension</td>\
				<td style="width: 80%;">\
					<button data-btn-role="addDimension" class="button">Add</button>\
					<button data-btn-role="editDimension" class="button">Edit</button>\
					<button data-btn-role="deleteDimension" class="button">Delete</button>\
				</td>\
			</tr>\
		</table>\
		<div class="dimension_list jstree-drop" style="height:150px;overflow: auto;">\
			<table style="width:100%;">\
				<thead>\
					<tr>\
						<th>Dimension</th>\
						<th>Value Type</th>\
						<th>Generate Aggregate Cells</th>\
						<th>Values</th>\
					</tr>\
				</thead>\
				<tbody>\
				</tbody>\
			</table>\
		</div>';
	};


	mngr.bindEvents = function() {

		var c = this,dlg = c.dlg;
		if (dlg) {
			$(dlg).find('button[data-btn-role="addMeasure"]').off('click').on('click', function(e){
				c.addMeasureDialog(e);
			});
			$(dlg).find('button[data-btn-role="editMeasure"]').off('click').on('click', function(e){
				c.editMeasureDialog(e);
			});
			$(dlg).find('button[data-btn-role="deleteMeasure"]').off('click').on('click', function(e){
				c.deleteMeasure(e);
			});

			$(dlg).find('button[data-btn-role="addDimension"]').off('click').on('click',function(e){
				c.addDimensionDialog(e);
			} );
			$(dlg).find('button[data-btn-role="editDimension"]').off('click').on('click', function(e){
				c.editDimensionDialog(e);
			});
			$(dlg).find('button[data-btn-role="deleteDimension"]').off('click').on('click',function(e){
				c.deleteDimension(e);
			});


			$(document).off("click",".measure_list tbody tr").on("click",".measure_list tbody tr", function(e) {
				$(dlg).find(".measure_list tbody tr").removeClass("Measure_slctd");
				$(this).addClass("Measure_slctd");
			});
			$(document).off("click",".dimension_list tbody tr").on("click",".dimension_list tbody tr", function(e) {
				$(dlg).find(".dimension_list tbody tr").removeClass("Dimension_slctd");
				$(this).addClass("Dimension_slctd");
			});
		}
	};

	mngr.createBlock = function() {
		var c = this;
		if (self.isBuilderCreated) {
			if (c.dlg && c.dlg.length > 0) {
				$( c.dlg ).dialog( "moveToTop" );
			}
			Util.showMessage("Please close the Block Builder");
		} else {
			var dlg = c.ceateBlkBuilder();
			if (dlg && dlg.length > 0) {
				$(dlg).dialog("option", "title", "Block Builder - New Block");
				$(dlg).on( "dialogopen", function( event, ui ) {
					$(this).append(c.getBlockMarkup());
				});
				$(c.dlg).dialog("open");
				c.bindEvents();
			}
		}
	};

	mngr.open = function(block,mode) {

		var c = this;
		c._block = block;
		if (self.isBuilderCreated) {
			if (c.dlg && c.dlg.length > 0) {
				$( c.dlg ).dialog( "moveToTop" );
			}
			Util.showMessage("Please close the Block Builder");
		} else {
			var dlg = c.ceateBlkBuilder();
			if (dlg && dlg.length > 0) {
				$(dlg).on( "dialogopen", function( event, ui ) {
					if (block) {
						if (mode == "clone") {
							$(dlg).dialog("option", "title", "Block Builder - Clone of "+block.name);
							block.name = "";
						} else if(mode == "view") {
							$(dlg).dialog("option", "title", "Block Builder - "+block.name);
						}

						$(this).append(c.getBlockMarkup());
						c.renderUserBlock(block);
					}
				});
				$(c.dlg).dialog("open");
				c.bindEvents();
			}
		}

	};

	mngr.deleteBlk = function(block) {
		var c = this, dlg = c.dlg;
		Util.promptDialog("Do you want delete the block("+block.name+")?",
		function() {
			Util.ajaxDelete("userblock/"+block.id, null, function(result) {
				if (result.Status) {
					self.refreshUserBlocks();
				} else {
					Util.showMessage(result.Message);
				}
			});
			
			if(dlg && dlg.length > 0 && c._block && c._block.id == block.id) {
				$( dlg ).dialog( "close" );
				c._block = null;
			}
		}, function() {
			
		}
		);
	};
	mngr.deleteShrdDim = function (dim) {
		Util.promptDialog("Do you want delete the Dimension("+dim.name+")?",
				function() {
					Util.ajaxDelete("dimension/"+dim.id, null, function(result) {
						if (result.Status) {
							self.listShrdDim();
						} else {
							Util.showMessage(result.Message);
						}
					}, function() { });
				}, function() {
					}
				);
	};
	mngr.addMeasureDialog = function(e) {
		e.stopPropagation();
		var c = this,dlg = c.dlg;
		if (dlg && dlg.length > 0) {
			var mui = new MeasurePopup(null);
			mui.show(function(meas) {
				$(dlg).find(".measure_list table tbody").append('\
					<tr>\
						<td>'+meas.name+'</td>\
						<td>'+meas.label+'</td>\
						<td>'+meas.dataType+'</td>\
						<td>'+meas.format+'</td>\
						<td>'+meas.aggregateFun+'</td>\
					</tr>\
				');
				$(dlg).find(".measure_list table tbody tr:last-child").data(meas);
			});
		}
	};

	mngr.editMeasureDialog = function(e) {
		e.stopPropagation();
		var c = this,dlg = c.dlg;
		if (dlg && dlg.length > 0) {
			var measure = $(dlg).find(".Measure_slctd").data();
			if (measure) {
				var mui = new MeasurePopup(measure);
				mui.show(function(meas) {
					$(dlg).find(".Measure_slctd").data(meas);
					$(dlg).find(".Measure_slctd").html('\
						<td>'+meas.name+'</td>\
						<td>'+meas.label+'</td>\
						<td>'+meas.dataType+'</td>\
						<td>'+meas.format+'</td>\
						<td>'+meas.aggregateFun+'</td>\
					');
				});
			} else {
				$(dlg).find(".vdvc-errMsg").html("Please select the measure to Edit");
			}
		}
	};

	mngr.deleteMeasure = function(e) {
		e.stopPropagation();
		var c = this;
		if (c.dlg && c.dlg.length > 0) {
			var msr = $(c.dlg).find(".Measure_slctd");
			if(msr.length > 0){
				Util.promptDialog("Do you want delete the Measure",
					function() {
						$(msr).remove();
					},
					function() { } );
			} else {
				$(dlg).find(".vdvc-errMsg").html("Please select the measure to Delete");
			}
		}
	};


	mngr.addDimensionDialog = function(e,title, mode) {
		e.stopPropagation();
		var c = this,dlg = c.dlg;
		var dui = new DimensionPopup(null);
		if (typeof title !== "undefined" ) {
			dui.dlg.dialog("option","title",title);
		}
		if (mode === "ShrdDim" ) {
			dui.show(c.saveShrdDim);
		} else {
			dui.show(function(dim) {
				var dVals = dim.values ? dim.values.join(',') : 'N/A';
				$(dlg).find(".dimension_list table tbody").append('\
					<tr>\
						<td>'+dim.name+'</td>\
						<td>'+dim.dataType+'</td>\
						<td>'+(dim.needAggregate ? "Yes" : "No")+'</td>\
						<td>'+dVals+'</td>\
					</tr>\
				');
				$(dlg).find(".dimension_list table tbody tr:last-child").data(dim);
			});
		}
	};

	mngr.saveShrdDim = function(dim) {
		Util.ajaxPost("dimension/save",dim,function (result) {
			if (result.Status) {
				self.listShrdDim();
			}else {

			}
		});
	};

	mngr.listShrdDim = function() {
		Util.ajaxGet("dimension/list",function (result) {

			var dims = [];
			if ( result.Status) {
				var shrdDims = result.Data;
				if (shrdDims.length > 0) {
					$.each(shrdDims, function(index, object) {
						var node=Util.jstreeNode(object.name,object,{"role" : "dimension","class":"dimension"},{"data" : object});
						dims.push(node);
					});
					blockHierarchy.render(dims, "#shrdDims");
				}else {
					blockHierarchy.render(dims, "#shrdDims");
				}
			}
		});
	};

	mngr.editShrdDimension = function(e) {

		e.stopPropagation();
		var current = this;
		var dimension = $(".shrdDimSelected").data("data");
		var dui = new DimensionPopup(dimension);
		dui.show(current.saveShrdDim);
	};

	mngr.editDimensionDialog = function(e) {

		e.stopPropagation();
		var c = this,dlg = c.dlg;
		if (dlg && dlg.length > 0) {
			var dimension = $(dlg).find(".Dimension_slctd").data();
			if (dimension) {
				var dui = new DimensionPopup(dimension);
				dui.mode = "edit";
				dui.show(function(dim) {
					var dVals = dim.values ? dim.values.join(',') : 'N/A';

					$(dlg).find(".Dimension_slctd").html('\
						<td>'+dim.name+'</td>\
						<td>'+dim.dataType+'</td>\
						<td>'+(dim.needAggregate ? "Yes" : "No")+'</td>\
						<td>'+dVals+'</td>\
					');
				});
			} else {
				$(dlg).find(".vdvc-errMsg").html("Please select the Dimension to Edit");
			}
		}
	};

	mngr.deleteDimension = function(e) {
		e.stopPropagation();
		var c = this,dlg = c.dlg;
		if (dlg && dlg.length > 0) {
			var dim = $(dlg).find(".Dimension_slctd");
			if(dim.length > 0){
				Util.promptDialog("Do you want delete the Dimension",
					function() {
						$(dim).remove();
					},
					function() { } );
			} else {
				$(dlg).find(".vdvc-errMsg").html("Please select the Dimension to Delete");
			}
		}
	};

	mngr.renderMeasures = function(measures) {
		var c = this,dlg = c.dlg;
		if (dlg && dlg.length > 0){
			var mEl = $(dlg).find(".measure_list table tbody");
			if(measures){
				$.each(measures, function(i, m) {
					$(mEl).append('\
						<tr>\
							<td>'+m.name+'</td>\
							<td>'+(m.label || "")+'</td>\
							<td>'+m.dataType+'</td>\
							<td>'+m.format+'</td>\
							<td>'+m.aggregateFun+'</td>\
						</tr>\
					');
					$(mEl).find('tr:last-child').data(m);
				});
			}
		}
	};

	mngr.renderDimensions = function(dimensions) {
		var c = this,dlg = c.dlg;
		if (dlg && dlg.length > 0){
			var dEl = $(dlg).find(".dimension_list table tbody");
			if (dimensions) {
				$.each(dimensions, function(i, d) {
					var dVals = d.values ? d.values.join(',') : 'N/A';

					$(dEl).append('\
						<tr>\
							<td>'+d.name+'</td>\
							<td>'+d.dataType+'</td>\
							<td>'+(d.needAggregate ? "Yes" : "No")+'</td>\
							<td>'+dVals+'</td>\
						</tr>\
					');
					$(dEl).find('tr:last-child').data(d);
				});
			}
		}
	};

	mngr.renderUserBlock = function(block) {
		var c = this;dlg = c.dlg;
		$(dlg).find('input[name=block_name]').val(block.name);
		this.renderMeasures(block.measures);
		this.renderDimensions(block.dimensions);
	};

	mngr.retrieveBlockFromUI = function() {
		var b = {};
		var m = [];
		var d = [];
		b.name = $('input[name="block_name"]').val();
		$.each($(".measure_list tbody tr"), function(i, v) {
			m.push($(v).data());
		});
		$.each($(".dimension_list tbody tr"), function(i, v) {
			d.push($(v).data());
		});

		b.measures = m;
		b.dimensions = d;

		return b;
	};

	mngr.validateBlock = function(block) {
		var status = false;
		if (block && block.name.trim() != "" && /^[a-zA-Z0-9]*$/.test(block.name)) {
			status = true;
		}
		return status;
	};

	mngr.saveBlock = function(e) {
		
		var c = this,
			dlg = c.dlg,
		    b = c.retrieveBlockFromUI();
		if (!self.validateBlock(b)) {
			//Util.showMessage("Please Enter the Block Name");
			$(dlg).find(".vdvc-errMsg").html("Block name is Mandatory and should not contain Space and Special characters")
			return false;
		}
		if (self._block != null) {
			b.id = self._block.id;
		}
		Util.ajaxPost("userblock/save", JSON.stringify(b), function(result) {
			if(result.Status){

				self.refreshUserBlocks();
				if (self.dlg && self.dlg.length > 0){
					$(self.dlg).dialog("close");
				}
			}else{
				Util.showMessage(result.Message);
			}
		});
	};

	mngr.refreshUserBlocks = function() {
		var c = this;
		Util.ajaxGet("userblock/list", function(result) {
			c.renderUserBlocks($("#UserBlocks"), result.Blocks);
		});
	};

	mngr.renderUserBlocks = function(el, blocks) {
		$(el).empty();
		if (blocks.length > 0) {
			var modelBlocks = [];

			$.each(blocks, function(index, block) {
				var childrenarray = [];
				if(block.dimensions) {
					$.each(block.dimensions, function(i, v) {
						var node = Util.jstreeNode(v.name, block.dimensions, {"role" : "dimension","class":"dimension"}, {"data" : v});
						childrenarray.push(node);
					});
				}
				if(block.measures){
					$.each(block.measures,function(i,v){
						var node = Util.jstreeNode(v.name, block.measures, {"role" : "measure","class":"measure"}, {"data" : v});
						childrenarray.push(node);
					});
				}

				var node1 = Util.jstreeNode(block.name, childrenarray, {"role" : "block","class":"block"}, {"data" : block});
				modelBlocks.push(node1);

			});
			blockHierarchy.render(modelBlocks, el);
		}
	};

	return mngr;
})(VdVcBlkManager);

var MeasurePopup = function(measure) {
	var self = this;
	this._measure = measure;
	this.dlg = $(".measureUI").dialog({
		autoOpen: false,
		modal: true,
		dialogClass: "stack",
		resizable: false,
		minHeight: 200,
		width: 500,
		height: 300,
		show: { effect: "blind", duration: 500 },
		hide: { effect: "blind", duration: 500 },
		buttons: [{ text: "Cancel", click: function() { $(this).dialog("close"); } },
		          { text: "Save", click: function(e) { self.onSaveMeasure(e); } }],
		open: function(event, ui) {
			var c = $(this);
			c.empty();
			var markup='\
				<table style="width:100%;">\
					<tr>\
						<td style="width: 20%;">Measure :</td>\
						<td style="width: 80%;">\
							<input type="text" name="measureName">\
						</td>\
					</tr>\
					<tr>\
						<td style="width: 20%;">Label :</td>\
						<td style="width: 80%;">\
							<input type="text" name="measureLabel">\
						</td>\
					</tr>\
					<tr>\
						<td style="width: 20%;">Data Type :</td>\
						<td style="width: 80%;">\
							<select class="dataType"></select>\
						</td>\
					</tr>\
					<tr>\
						<td style="width: 20%;">Format :</td>\
						<td style="width: 80%;">\
							<select class="dataFormat"></select>\
						</td>\
					</tr>\
					<tr>\
						<td style="width: 20%;">Aggregate function</td>\
						<td style="width: 80%;">\
							<select class="aggregateFunctions"></select>\
						</td>\
					</tr>\
				</table>';
			c.append(markup);
			Util.populateDropdown(c.find('select.aggregateFunctions'), AggFuncManager.getAggFunctions(), 'operatorCode', 'operatorName');
			Util.populateDropdown(c.find('select.dataType'), DataTypeManager.getDataTypes(), 'name', 'name');

			c.find('select.dataType').off("change").on("change",function(e) {
				e.stopPropagation();
				var dataTypes = DataTypeManager.getDataTypes();
				var selected = $(this).val();
				c.find('select.dataFormat').empty();
				if (dataTypes && dataTypes.length > 0) {
					$.each(dataTypes, function(i,v) {
						if (selected == v["name"]) {
							var formats = v["formats"];
							if (formats && formats.length > 0) {
								 $.each(formats, function(k,val) {
									 c.find('select.dataFormat').append('<option value="'+val+'">'+val+'</option>');
								 });
							} else {
								//c.find('select.dataFormat').append('<option value="'+val+'">'+val+'</option>');
							}
							return false;
						}
					});
				}
			});

			if (self._measure != null) {

				$(this).find('input[name=measureName]').val(self._measure.name);
				$(this).find('input[name=measureLabel]').val(self._measure.label);
				$(this).find('select.dataType').val(self._measure.dataType);
				$(this).find('select.dataType').trigger("change");
				$(this).find('select.dataFormat').val(self._measure.format);
				$(this).find('select.aggregateFunctions').val(self._measure.aggregateFun);
			} else {
				self._measure = {};
			}
		}
	});

	this.show = function(onSave) {
		if (onSave) { this.onSave = onSave; }
		$(this.dlg).dialog("open");
	};

	this.onSaveMeasure = function(e) {
		if ("function" == typeof this.onSave) {
			this._measure.name = $(this.dlg).find('input[name=measureName]').val();
			this._measure.label = $(this.dlg).find('input[name=measureLabel]').val();
			this._measure.dataType = $(this.dlg).find('select.dataType').val();
			this._measure.format = $(this.dlg).find('select.dataFormat').val();
			this._measure.aggregateFun = $(this.dlg).find('select.aggregateFunctions').val();

			this.onSave(this._measure);
		}
		$(this.dlg).dialog("close");
	};
};

var ScalarValuePopup = function(scalar) {
	
	var self = this;
	this._scalar = scalar;
	this.dlg = $("<div class='vdvc-sclr-values' >").dialog({
		autoOpen: false,
		modal: true,
		dialogClass: "stack",
		resizable: false,
		minHeight: 200,
		width: 500,
		height: 300,
		show: { effect: "blind", duration: 500 },
		hide: { effect: "blind", duration: 500 },
		buttons: [{ text: "Cancel", click: function() { $(this).dialog("close"); } },
		          { text: "Save", click: function(e) { self.onSaveScalar(e); } }],
		close : function() {
			$(this).dialog("destroy");
		},
		open: function(event, ui) {
			var c = $(this);
			c.empty();
			var markup='\
				<table style="width:100%;">\
					<tr>\
						<td style="width: 20%;">Name :</td>\
						<td style="width: 80%;">\
							<input type="text" name="scalarName">\
						</td>\
					</tr>\
					<tr>\
						<td style="width: 20%;">Data Type :</td>\
						<td style="width: 80%;">\
							<select class="dataType"></select>\
						</td>\
					</tr>\
					<tr>\
						<td style="width: 20%;">Value :</td>\
						<td style="width: 80%;">\
							<input type="text" name="scalarValue">\
						</td>\
					</tr>\
				</table>';
			c.append(markup);
			Util.populateDropdown(c.find('select.dataType'), DataTypeManager.getDataTypes(), 'name', 'name');
			if (self._scalar != null) {

				$(this).find('input[name=scalarName]').val(self._scalar.name);
				$(this).find('select.dataType').val(self._scalar.dataType);
				$(this).find('input[name=scalarValue]').val(self._scalar.value);
			} else {
				self._scalar = {};
			}
		}
	});

	this.show = function(onSave) {
		if (onSave) { this.onSave = onSave; }
		$(this.dlg).dialog("open");
	};

	this.onSaveScalar = function(e) {
		if ("function" == typeof this.onSave) {
			this._scalar.name = $(this.dlg).find('input[name=scalarName]').val();
			this._scalar.dataType = $(this.dlg).find('select.dataType').val();
			this._scalar.value = $(this.dlg).find('input[name=scalarValue]').val();

			this.onSave(this._scalar);
		}
		$(this.dlg).dialog("close");
	};
};

var DimensionPopup = function(dimension) {
	var self = this;
	this.dimDataTypes = [];
	this._dimension = dimension;
	this.mode = "save";
	this.errMsgs = ["years",
	            	"months",
	            	"days",
	            	"hours",
	            	"minutes",
	            	"seconds",
	            	"milliseconds"];
	
	this.constructor = function() {

		Util.sync_ajaxGet("dimension/valuetypes",function(result){
			
			if (result.Status) {
				self.dimDataTypes = result.Data;
			} else {
				Util.showMessage(result.Message);
			}
		});
	};

	this.getUiMarkup = function() {
		var c = this,markup = "";
		markup ='\
			<div class="errMsg" style="height: 30px;color:red;"></div>\
			<div class="content">\
				<table style="width:100%;">\
					<tr>\
						<td style="width: 30%;">Dimension Name</td>\
						<td style="width: 70%;"><input type="text" name="dimensionName"></td>\
					</tr>\
					<tr>\
						<td style="width: 30%;">Dimension Value Types</td>\
						<td style="width: 70%;"><select name="dimvalueTypes"></select></td>\
					</tr>\
					<tr>\
						<td style="width: 30%;">Dimension Value Formats</td>\
						<td style="width: 70%;"><select name="dimvalueFormats"></select></td>\
					</tr>\
					<tr>\
						<td style="width: 30%;">Generate Aggregate Cells</td>\
						<td style="width: 70%;"><input type="checkbox" name="needAggregate"></td>\
					</tr>\
					<tr>\
						<td style="width: 30%;vertical-align: top;">Values</td>\
				 		<td style="width: 70%;">\
							<button data-btn-role="dimValue" class="button">Add</button>\
				 		</td>\
					</tr>\
				</table>\
			</div>';
		return markup;
	};

	this.setInputsAsCalander = function(elements) {
		var c = this,format = $(c.dlg).find('select[name="dimvalueFormats"]').val();
		$(elements).datepicker({
		      changeMonth: true,
		      changeYear: true,
		      dateFormat : format,
		      constrainInput: true,
		      yearRange: "2000:2100"
		});
	};
	
	this.setInputsAsNumber = function(elements) {
		var c = this;
		if($(elements).hasClass("hasDatepicker")) {
			$(elements).datepicker( "destroy" );
		}
	};
	
	this.setInputsAsText = function(elements) {
		var c = this;
		if($(elements).hasClass("hasDatepicker")) {
			$(elements).datepicker( "destroy" );
		}
	};
	
	this.updateDimInputs = function(elements,type) {
		var c = this;
		switch(type) {
		case "Date":
			c.setInputsAsCalander(elements);
			break;
		case "Number":
			c.setInputsAsNumber(elements);
			break;
		case "Text" :
			c.setInputsAsText(elements);
			break;
		}
		c.validate(elements);
	};
	
	this.getFormats = function(dtaType) {
		var c = this,formats = null;
		if(c.dimDataTypes) {
			$.each(c.dimDataTypes,function(i,v){
				if(v.name == dtaType) {
					formats = v.formats;
					return false;
				}
			});
		}
		return formats;
	};
	
	this.handleDtaTypeChange = function(e,source) {
		var c = this,
			dlg = c.dlg,
			mrkup = '',
			type = source.val(),
			formats = c.getFormats(type),
			inputs = $(dlg).find('input[name="dimvalues"]');
		if(inputs && inputs.length > 0) {
			Util.promptDialog("Do You want removes previous entries",function(){
				
				$(dlg).find('select[name="dimvalueFormats"]').empty();
				source.data("current",type).val(type);
				if (formats) {
					$.each(formats,function(i,v){
						mrkup += '<option value="'+v+'">'+v+'</oprion>';
					});
				}
				$(dlg).find('select[name="dimvalueFormats"]').html(mrkup);
				$(inputs).closest("tr").remove();
			},function(){
				
				source.val(source.data("current"));
			},
			function(){
				
				source.val(source.data("current"));
			});
		} else {
			source.data("current",type);
			$(dlg).find('select[name="dimvalueFormats"]').empty();
			if (formats) {
				$.each(formats,function(i,v){
					mrkup += '<option value="'+v+'">'+v+'</oprion>';
				});
			}
			$(dlg).find('select[name="dimvalueFormats"]').html(mrkup);
		}
	};
	
	this.handleDtaFmtChange = function(e,source) {
		var c = this,
			dlg = c.dlg,
			format = source.val(),
			inputs = $(dlg).find('input[name="dimvalues"]');
		if (inputs && inputs.length > 0) {
			$.each(inputs,function(i,v){
				//var val = $(v).val();
				//var orgfmt = $(v).data("format");
				//var out = moment(val,orgfmt).format(format);
				//$(v).val(out);
				$(v).data("format",format);
			});
		}
		$(inputs).datepicker("option","dateFormat",format);	
		$(inputs).attr("placeholder",format);
	};
	
	this.bindEvents = function() {
		var c = this;dlg = this.dlg;
		$(dlg).find('button[data-btn-role=dimValue]').off('click').on('click',function(e){
			self.addValueRow();
		});
		$(dlg).find('select[name="dimvalueTypes"]').off('change').on('change',function(e){
			c.handleDtaTypeChange(e,$(this));
		});
		
		$(dlg).find('select[name="dimvalueFormats"]').off('change').on('change',function(e){
			c.handleDtaFmtChange(e,$(this));
		});
		
		$(document).off("click",'.dimensionUI button[data-btn-role=removeValue]')
		.on('click','.dimensionUI button[data-btn-role=removeValue]', function(e){
			$(this).closest("tr").remove();
		});
	};
	
	this.dlg = $(".dimensionUI").dialog({
		autoOpen: false,
		modal: true,
		dialogClass: "stack",
		resizable: false,
		minHeight: 200,
		width: 500,
		height: 400,
		show: { effect: "blind", duration: 500 },
		hide: { effect: "blind", duration: 500 },
		buttons: [{ text: "Cancel", click: function() { $(this).dialog("close"); } },
		          { text: "Save", click: function(e) { self.onSaveDimension(e); } }],
		open: function(event, ui) {
			$(this).empty();
			var mrkup = self.getUiMarkup();
			var pos = $(this).position();
			$(this).find(".errMsg").clone().css({"left":pos.left+"pox","top": pos.top+"px","position":"absolute"});
			$(this).append(mrkup);
			self.bindEvents();
			if (self.dimDataTypes.length > 0) {
				var select = $(this).find('select[name="dimvalueTypes"]');
				$(select).append("<option value='none'>None</option>");
				$.each(self.dimDataTypes,function(i,v){
					$(select).append("<option value='"+v.name+"'>"+v.name+"</option>");
				});
			}
			if (self._dimension != null) {
				
				$(this).find('input[name="dimensionName"]').val(self._dimension.name);
				$(this).find('input[name="needAggregate"]').prop('checked', self._dimension.needAggregate);
				$(this).find('select[name="dimvalueTypes"]').val(self._dimension.dataType);
				$(this).find('select[name="dimvalueTypes"]').trigger("change");
				$(this).find('select[name="dimvalueFormats"]').val(self._dimension.dataFormat);
				self.renderDimensionValues();
				
				var inputs = $(this).find("input[name='dimvalues']");
				if(inputs && inputs.length > 0) {
					self.updateDimInputs(inputs,self._dimension.dataType);
				}
			} else {
				self._dimension = {};
			}
			$(this).find('select[name="dimvalueTypes"]').data("current",$(this).find('select[name="dimvalueTypes"]').val());
		}
	});

	this.checkDimension = function (dim) {
		if (self.mode == "save") {
			var isValid = false;
			if (dim) {
				var drpdDims = $(".dimension_list tbody tr");
				if ( drpdDims && drpdDims.length > 0 ) {
					$.each(drpdDims , function (i,v) {
						var drpdDim = $(v).data();
						if (dim.name === drpdDim.name ){
							isValid = false;
							return false;
						}else {
							isValid = true;
						}
					});
				} else {
					isValid = true;
				}
			}
			 if( !isValid ){
				 Util.showMessage('Dimension "'+dim.name+'" is  Exists');
			 }
			 return isValid;
		} else if (self.mode == "edit") {
			return true;
		}
	};

	this.renderDimensionValues = function() {
		if (self._dimension.values){
			$.each(self._dimension.values, function(index, val) {
				if(self._dimension.dataType == "Date") {
					val = moment(val,"YYYY-MM-DD").format(self._dimension.dataFormat);
				}
				var markup='<tr>\
					<td style="width: 30%;vertical-align: top;">&nbsp;</td>\
					<td style="width: 70%;">\
					<input type="text" name="dimvalues" value="'+val+'" >\
					<button data-btn-role="removeValue"><span class="ui-icon ui-icon-circle-close"></span></button>\
					</td>\
					</tr>';
				$(".dimensionUI").find("table tbody").append(markup);
			});
		}
	};

	this.addValueRow = function() {
		var c = this,
			datatype = $(c.dlg).find('select[name="dimvalueTypes"]').val(),
			dataFormat = $(c.dlg).find('select[name="dimvalueFormats"]').val();
		$(c.dlg).find(".errMsg").html();
		var rowMarkup = '';
		if (datatype != "none") {
			rowMarkup += '<tr>\
				<td style="width: 30%;vertical-align: top;">&nbsp;</td><td style="width: 70%;">';
			
			switch(datatype) {
			case "Date":
				rowMarkup += '<input type="text" data-type="Date" name="dimvalues" placeholder="'+dataFormat+'" readonly="readonly">';
				break;
			case "Number":
				rowMarkup += '<input type="text" data-type="Number" name="dimvalues" placeholder="eg. 1234">';
				break;
			case "Text":
				rowMarkup += '<input type="text"  data-type="Text" name="dimvalues">';
				break;
			}
			rowMarkup += '<button data-btn-role="removeValue"><span class="ui-icon ui-icon-circle-close"></span></button>\
				</td></tr>';
			
			if(rowMarkup && rowMarkup.trim() != ""){
				$(c.dlg).find("table tbody").append(rowMarkup);
				var inputs = $(c.dlg).find("input[name='dimvalues']");
				if (inputs && inputs.length > 0) {
					$(c.dlg).find("input[name='dimvalues']").off("blur").on("blur",function(e){
						c.validate([$(this)]);
					});
					c.updateDimInputs(inputs,datatype);
				}
			}
		} else {
			$(c.dlg).find(".errMsg").html("Please Select Dimension value types");
		}
	};

	this.validate = function(input) {
		var c = this,
		status = false,
		datatype = $(c.dlg).find('select[name="dimvalueTypes"]').val();
		$(c.dlg).find(".errMsg").empty();
		if(input && input.length > 0) {
			$.each(input,function(i,v){
				val = $(v).val();
				$(v).css("border","none");
				$(c.dlg).find(".errMsg").html();
				if (datatype && val && val.trim() != "") {
					switch(datatype) {
					case "none":
						$(c.dlg).find(".errMsg").html("Please Select Dimension value types");
						break;
					case "Date":
						
						/*var date = Date.parse(val);
						if (!isNaN(date)) {
							var out = val;
							var format = $(dlg).find('select[name="dimvalueFormats"]').val();
							if($(v).data("format")) {
								out = moment(val,$(v).data("format"));//.format(format);
							} else {
								out = moment(val);//.format(format);
							}
							if(out._pf.empty == false && out._pf.overflow <= -1 && out._pf.invalidMonth == null &&
									out._pf.unusedTokens.length == 0 && out._pf.unusedInput.length == 0 ) {
								$(v).val(out.format(format));
								$(v).data("format",format);
								status = true;
							} else {
								$(v).css("border","2px solid red");
								var i = out.invalidAt();
								var msg = c.errMsgs[i];
								$(c.dlg).find(".errMsg").html("invalid "+msg);
							}
						}else {
							$(v).css("border","2px solid red");
							$(c.dlg).find(".errMsg").html("invalid date");
						}*/
						var format = $(dlg).find('select[name="dimvalueFormats"]').val();
						$(v).data("format",format);
						status = true;
						break;
					case "Number":
						if (isNaN(val)) {
							$(c.dlg).find(".errMsg").html("Invalid Number");
							$(v).css("border","2px solid red");
						} else {
							status = true;
						}
						break;
					case "Text":
						status = true;
						break;
					}
				}
			});
		}
		
		return status;
	};
	
	this.show = function(onSave) {
		if (onSave) { this.onSave = onSave; }
		$(this.dlg).dialog("open");
	};

	this.onSaveDimension = function(e) {
		var c = this;
		var status = false;
		
		
		
		if ("function" == typeof this.onSave) {
			c._dimension.name = $(this.dlg).find('input[name="dimensionName"]').val();
			c._dimension.needAggregate = $(this.dlg).find('input[name="needAggregate"]').is(':checked');
			c._dimension.dataType = $(this.dlg).find('select[name="dimvalueTypes"]').val();
			c._dimension.dataFormat = $(this.dlg).find('select[name="dimvalueFormats"]').val();
			var dimValues = $(this.dlg).find("input[name='dimvalues']");
			var values = [ ];
			if (c._dimension.name && this._dimension.name.trim() !=""  ) {
				status = this.checkDimension(this._dimension);
			} else {
				Util.showMessage("Please enter Dimension Name");
			}
			
			$.each(dimValues, function(index, obj) {
				
				var st = c.validate([$(obj)]);
				if(st == false)
					status = false;
				if ($(obj).val()) {
					if(c._dimension.dataType == "Date" ) {
						var val = moment($(obj).val(),c._dimension.dataFormat).format("YYYY-MM-DD");
						values.push(val);
					} else {
						values.push($(obj).val());
					}
					
				}
			});
			c._dimension.values = values;
			
			if (status){
				this.onSave(this._dimension);
				$(this.dlg).dialog("close");
			}
		}
	};

	this.constructor();
};


var AggFuncManager=(function(){

	var _aggFunctions=[];

	Util.ajaxGet("userblock/aggregations",function(result){
		if(result.Status){

			_aggFunctions=result.Aggregates;
		}else{
			Util.showMessage(result.Message);
		}
	});

	this.getAggFunctions=function(){
		return _aggFunctions;
	};
	return this;
})();

var DataTypeManager = (function() {
	var DataTyeps = [];

	Util.ajaxGet("measure/valuetypes",function(result){

		if(result.Status){
			DataTyeps=result.Data;
		}else{
			Util.showMessage(result.Message);
		}
	});

	this.getDataTypes = function() {
		return DataTyeps;
	};

	return this;
})();




function UIinitializer(){
	
	moment.utc().format();
	VdVcMdlManager.modelId = Util.getURLParameter("modelId");
	$("#blocksNdims").accordion({
		heightStyle: "fill"
	});

	$(document).on("click","#shrdDims li ",function (e){
		$("#shrdDims").find(".shrdDimSelected").removeClass("shrdDimSelected");
		$(this).addClass("shrdDimSelected");
	});

	BlockManager.getUserBlocks();
	BlockManager.listShrdDim();
	VdVcModelManager.getBuilderModels();
	$(document).tooltip();



	//Initialize visualizer windows

	$("#mdl_properties_window").dialog({
		"title" : "Block Properties",
		autoOpen: false,
		width: $('#container').width()/2,
		height: $('#container').height()/2,
		position : {
			my : 'left top',
			at : 'left top',
			of : '#container'
		},
		closeText: false,
		minWidth: 500,
		minHeight:350
	}).dialogExtend({
        "closable" : true,
        "maximizable" : true,
        "minimizable" : true,
        "collapsable" : true,
        "dblclick" : "collapse",

        "minimizeLocation" : "right",
        "icons" : {
          "close" : "ui-icon-circle-close",
          "maximize" : "ui-icon-circle-plus",
          "minimize" : "ui-icon-circle-minus",
          "collapse" : "ui-icon-triangle-1-s",
          "restore" : "ui-icon-bullet"
        }
      });
	$("#mdl_layout_window").dialog({
		"title" : "Model Layout",
		autoOpen: false,
		width: $('#container').width()/2,
		height: $('#container').height()/2,
		closeText: false,
		position : {
			my : 'left bottom',
			at : 'left bottom',
			of : '#container'
		},
		minWidth: 500,
		minHeight:350
	}).dialogExtend({
        "closable" : true,
        "maximizable" : true,
        "minimizable" : true,
        "collapsable" : true,
        "dblclick" : "collapse",

        "minimizeLocation" : "right",
        "icons" : {
          "close" : "ui-icon-circle-close",
          "maximize" : "ui-icon-circle-plus",
          "minimize" : "ui-icon-circle-minus",
          "collapse" : "ui-icon-triangle-1-s",
          "restore" : "ui-icon-bullet"
        },
        "maximize": function(){
        	excelView.unbind_col_resizer();
        	excelView.col_Resizer();
        },
        "restore" : function(evt) {
        	excelView.unbind_col_resizer();
        	excelView.col_Resizer();
        	}
      });

	$("#blk_prpts_tab").tabs({});
	$("#mdl_graphical_window").dialog({
		"title" : "Model Graphical view",
		autoOpen: false,
		width: $('#container').width()/2,
		height: $('#container').height()/2,
		closeText: false,
		position : {
			my : 'right bottom',
			at : 'right bottom',
			of : '#container'
		},
		minWidth: 500,
		minHeight:350
	}).dialogExtend({
        "closable" : true,
        "maximizable" : true,
        "minimizable" : true,
        "collapsable" : true,
        "dblclick" : "collapse",

        "minimizeLocation" : "right",
        "icons" : {
          "close" : "ui-icon-circle-close",
          "maximize" : "ui-icon-circle-plus",
          "minimize" : "ui-icon-circle-minus",
          "collapse" : "ui-icon-triangle-1-s",
          "restore" : "ui-icon-bullet"
        }
      });

	// Initialising tabs

	$("#tabs").tabs({});


	// Initializing UI buttons
	$("button").button();

	// Initializing Menus
	$( ".builderMenu" ).menu();





	$("#visuals").dialog({
		autoOpen : false,
		width : $("#rightcontainer").width() - 10,
		height : $("#rightcontainer").height() - 42,
		position : {
			my : 'top+42',
			at : 'top',
			of : '#rightcontainer'
		},
		show : {
			effect : "blind",
			duration : 500
		},
		hide : {
			effect : "blind",
			duration : 500
		}
	});

	$("#excellsheets").dialog({
		autoOpen : false,
		width : $("#container").width(),
		height : $("#container").height(),
		position : {
			my : 'top+42',
			at : 'top',
			of : '#container'
		},
		show : {
			effect : "blind",
			duration : 500
		},
		hide : {
			effect : "blind",
			duration : 500
		}
	});
	$("#modelBlock_save_confi").dialog({
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
			"No" : function() {
				$(this).dialog("close");
				$("#model_block").dialog("close");
			},
			"Yes" : function() {
				$(this).dialog("close");
				if ($("#model_name").val()) {
					blockCreator.saveModelBlocks();
					$(this).dialog("close");
				} else {
					Util.showMessage("Please Enter BlockName");
				}

			}
		}
	});





	// Nwe model dialog
	$("#model_block").dialog({
		autoOpen : false,
		// resizable: false,
		 minHeight: 200,
		width : $("#rightcontainer").width() * 0.9,
		height : $("#rightcontainer").height() * 0.7,
		show : {
			effect : "blind",
			duration : 500
		},
		hide : {
			effect : "blind",
			duration : 500
		},
		buttons : {
			"Cancel" : function() {
				$(this).dialog("close");
			},
			"Save" : function() {
				if ($("#model_name").val()) {
					blockCreator.saveModelBlocks();
				} else {
					Util.showMessage("Please Enter BlockName");
				}

			}
		},
		open : function(event, ui) {
			// GetBlockDtDf();
		}
	});



	$(document).on("click",".dropedDim",function(){
		$(".dropedDim").removeClass("dropedDimSlct");
		$(this).addClass("dropedDimSlct");
	});




	// Positoning new modelblock definition UI
	$('#new_model_block').position({
		my : 'left-40 top-40',
		at : 'left-40 top-40',
		of : $('#model_block')
	});
}

