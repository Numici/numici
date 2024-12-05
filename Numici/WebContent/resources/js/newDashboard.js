var VappPerms={};var vdvcModels = {};
var mrgnds=[],modelName="Model";
var width= window.innerWidth;
var height=window.innerHeight;

var modelDomIndex;



var ModelManager=(function(mdls){
	
	var self = this;
	var ModelPerms={};
	var _applyModelPerms=function(){
		var user=$("#userselect").val();
		if(user != "default"){
			var perms=[];
	   	  	var grantedPerms=$('input[name="prm_granted"]:checked');
	   	  	$.each(grantedPerms,function(i,v){
	   		  perms.push($(v).val());
	   	  	});
	   	  	ModelPerms[user]=perms;
		}else{
			 Util.showMessage("Please Select The User");
		}
	};
	
	//Events
	/*$(document).on("click","#mymodels .vdvc-mdl",function(e){
		e.stopPropagation();
		modelDomIndex=$("#mymodels .vdvc-mdl").index(this);
		$("#mymodels .vdvc-mdl").removeClass("selectedModel");
		$(this).addClass("selectedModel");

		var model=$(this).data();
		console.log(model);


		$('button[data-btn-role="view_model"]').button( "disable" );
		$('button[data-btn-role="vApps"]').button( "disable" );
		$('button[data-btn-role="view_model"]').button( "disable" );
		$('button[data-btn-role="usr_perms"]').button( "disable" );
		$('button[data-btn-role="delete_model"]').button( "disable" );
		$('button[data-btn-role="publishToMail"]').button( "disable" );
		$('button[data-btn-role="publish_vApp"]').button( "disable" );
		$('button[data-btn-role="vAppgen"]').button( "disable" );
		$('button[data-btn-role="csvImport"]').button( "disable" );
		$('button[data-btn-role="tagModel"]').button( "disable" );
		$("#Importmenu").find(".main-menu").addClass("ui-state-disabled");
		if(model.owner){
			$('button[data-btn-role="delete_model"]').button( "enable" );
			switch (model.status) {
			case "Ready for Visualization":
				if (typeof model.error === "undefined") {
					$('button[data-btn-role="csvImport"]').button( "enable" );
					$("#Importmenu").find(".main-menu").removeClass("ui-state-disabled");
					
					$('button[data-btn-role="vApps"]').button( "enable" );
					$('button[data-btn-role="view_model"]').button( "enable" );
					$('button[data-btn-role="usr_perms"]').button( "enable" );
					$('button[data-btn-role="publishToMail"]').button( "enable" );
					$('button[data-btn-role="publish_vApp"]').button( "enable" );
					$('button[data-btn-role="vAppgen"]').button( "enable" );
					$('button[data-btn-role="tagModel"]').button( "enable" );
				}
				break;
			case "Model Created":
				break;
			}
		}else{
			if (model.status == "Ready for Visualization") {
				$('button[data-btn-role="view_model"]').button( "enable" );
				$('button[data-btn-role="vApps"]').button( "enable" );
			}
		}
	});*/

	$(document).on("change","#userselect",function(e){

		e.stopPropagation();
		var model=$(".selectedModel").data();
		var user = $(this).val();
		$('input[name="prm_granted"]').prop("checked",false);
		if(user === "default"){
			$(".modelperms").prop("disabled",true);
		}else{
			$(".modelperms").prop("disabled",false);
			var url="model/permissions/"+model.id+"/"+user;
			Util.ajaxGet(url,function(result){
				console.log(result);
				if(result.Status){
					var perms=ModelPerms[user];
					if(perms){
						$.each(perms,function(index,val){
							$('input[value="'+val+'"]').prop("checked",true);
						});
					}else if(result.Permissions){
						$.each(result.Permissions,function(index,val){
							$('input[value="'+val+'"]').prop("checked",true);
						});
					}
				}else{
					Util.showMessage(result.Message);
				}
			},false,true);
		}

	});


	var _delete=function(model){

		var clouser=this;
		var modelName= model.name;
		var modelId= model.id;
		Util.ajaxDelete("model/delete/"+modelId,null, function(result) {
			if(result.Status){
				clouser.getAllModels();
				Util.showMessage("The Model \""+modelName+"\" is Deleted");
			}else{
				Util.showMessage("The Model \""+modelName+" \" is Not Deleted");
			}

		},false,true);
	};

	var _showModels=function(models){
		$("#page-wrapper").empty();
		$("#page-wrapper").append('<div class="row" style="height: 100%;">\
				<div id="mymodels" class="row"></div>\
			</div>');
		if ( models && models.length>0) {
			
			for(var i=0;i<models.length;i++){
				var modelwrap= $("<div  class='col-xs-12 col-sm-3' style='margin-bottom:15px;'>");
				var mdl= $("<div class='vdvc-mdl' style='height:126px;box-shadow: 1px 1px 4px 0px gray;' >");
				var lable = '<div class="row" ><div class="col-xs-1 fa fa-cubes" style="height:25px;padding:3px;" ></div>\
					<div class="col-xs-11 vdvc-txt-wrap" style="height:30px;padding:3px;" data-toggle="tooltip" title="'+models[i].name+'">'+models[i].name+'</div></div>\
					<div class="row" ><div class="col-xs-1" style="height:30px;padding:3px;" ></div><div class="col-xs-11" style="height:30px;padding:3px;font-size:0.8em;" >'+new Date(models[i].createdOn).toLocaleString()+'</div></div>\
					<div class="row" ><div class="col-xs-1" style="height:30px;padding:3px;" ></div><div class="col-xs-11" style="height:30px;padding:3px;font-size:0.8em;" >'+models[i].permissions.join(",")+'</div></div>\
					<div class="row mdl-ft" ><div class="col-xs-12" style="height:30px;" >'+self.createModelMenu(models[i])+'</div></div>';
				mdl.data(models[i]);
				modelwrap.append(mdl);
				mdl.append(lable);
				$("#mymodels").append(modelwrap);
			}
			$("#mymodels").append('<input type="file" class="file-upload" value="Import" style="position: absolute;top:0px;left: 0px;" />');
			$(".context-title").html("Models");
			$(".vdvc-context").attr("vdvc-context","models");
			$.contextMenu( 'destroy' );
			
			
			/*$.contextMenu.types.label = function(item, opt, root) {
		        // this === item.$node

		        $('<span>CSV</span><ul>'
		            + '<li class="label1" title="label 1"><input type="file" class="file-upload" value="Import" style="position: absolute;top:0px;left: 0px;" /></li></ul>')
		            .appendTo(this);
		    };*/
			
			
			
			$.contextMenu({
		        selector: '#mymodels .fa-ellipsis-v', 
		        trigger: 'left',
		        callback: function(key, options) {
		            var m = "clicked: " + key;
		          //  window.console && console.log(m) || alert(m); 
		            var menu_role = key;
		            switch(menu_role){
		            case "delete":
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							ModelManager.deleteModel(model);
						}
						break;
					case "csvImport":
						$(".file-upload").trigger("click");
						$(".file-upload").fileupload({
							  url: 'CsvImport',
							  done: function(e,data){
								   console.log ("Import filename :"+data.result.ImportedFile);
								  var importedFile = data.result.ImportedFile;
								  var originalFile = data.result.OriginalFile;
								  var model=$(".selectedModel").data();
								  if("undefined" !== typeof model){
									  var impz = new ImportWizard ();
									  impz.importModel(importedFile, originalFile, model.id);
								  }
							  }
						});
						break;
					case "dividendHistory" : 
						Util.showMessage("Not yet Implemented");
						break;
					case "quoteHistory" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finDtaWiz = new finDataImportWizard(model.id);
							finDtaWiz.createFinDataImprtDlg();
						}
						break;
					case "balanceSheetHistory" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finBalanceSheetWiz = new finEdgarDataImportWizard(model.id,menu_role);
							finBalanceSheetWiz.createFinEdgarDataImprtDlg();
						}
						break;
					case "incomeStatementHistory" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finIncomeStatementWiz = new finEdgarDataImportWizard(model.id,menu_role);
							finIncomeStatementWiz.createFinEdgarDataImprtDlg();
						}
						break;
					case "cashFlowStatementHistory" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finCashFlowStatementWiz = new finEdgarDataImportWizard(model.id,menu_role);
							finCashFlowStatementWiz.createFinEdgarDataImprtDlg();
						}
						break;
					case "valuationRatiosHistory" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finValuationRatiosWiz = new finEdgarDataImportWizard(model.id,menu_role);
							finValuationRatiosWiz.createFinEdgarDataImprtDlg();
						}
						break;
					case "profitabilityRatiosHistory" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finProfitabilityRatiosWiz = new finEdgarDataImportWizard(model.id,menu_role);
							finProfitabilityRatiosWiz.createFinEdgarDataImprtDlg();
						}
						break;
					case "balanceSheetHistory2" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finBalanceSheetWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
							finBalanceSheetWiz2.createFinEdgarDataImprtDlg();
						}
						break;
					case "incomeStatementHistory2" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finIncomeStatementWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
							finIncomeStatementWiz2.createFinEdgarDataImprtDlg();
						}
						break;
					case "cashFlowStatementHistory2" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finCashFlowStatementWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
							finCashFlowStatementWiz2.createFinEdgarDataImprtDlg();
						}
						break;
					case "valuationRatiosHistory2" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finValuationRatiosWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
							finValuationRatiosWiz2.createFinEdgarDataImprtDlg();
						}
						break;
					case "profitabilityRatiosHistory2" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finProfitabilityRatiosWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
							finProfitabilityRatiosWiz2.createFinEdgarDataImprtDlg();
						}
						break;
					case "beaGDPbyIndustryHistory" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finBEAGDPbyIndustryWiz = new finBEADataImportWizard(model.id,menu_role);
							finBEAGDPbyIndustryWiz.createFinBEADataImprtDlg();
						}
						break;
					case "blsConsumerPriceIndexHistory" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finBLSConsumerPriceIndexWiz = new finBLSDataImportWizard(model.id,menu_role);
							finBLSConsumerPriceIndexWiz.createFinBLSDataImprtDlg();
						}
						break;
					case "blsProductPriceIndexHistory" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var finBLSProductPriceIndexWiz = new finBLSDataImportWizard(model.id,menu_role);
							finBLSProductPriceIndexWiz.createFinBLSDataImprtDlg();
						}
						break;
		 			case "dbDataImport" : 
						var model=$(".selectedModel").data();
						if("undefined" !== typeof model){
							var dbDataImportWiz = new dbDataImpWizard(model.id,menu_role);
							dbDataImportWiz.createDBDataImprtDlg();
						}
						break;
					default:
						break;
				}
		        },
		        items: {
		        	 "fold1": {
			                "name": "Import data", 
			                "items": {
			                    "csvImport": {"name": "CSV","icon":"file" },
			                    "dbDataImport": {"name": "DB Data","icon":"database"},
			                    "financial": {
			                        "name": "Financial Data", 
			                        "icon" : "finance",
			                        "items": {
			                            "quoteHistory": {"name": "Quote History"},
			                            "dividendHistory": {"name": "Dividend History"},
			                            "EdgarData": {
					                        "name": "Edgar Data", 
					                        "items": {
					                            "balanceSheetHistory": {"name": "Balance Sheet"},
					                            "incomeStatementHistory": {"name": "Income Statement"},
					                            "cashFlowStatementHistory": {"name": "Cash Flow"},
					                            "valuationRatiosHistory": {"name": "Valuation Ratios"},
					                            "profitabilityRatiosHistory": {"name": "Profitability Ratios"}
					                        }
					                    },
					                    "EdgarData2": {
					                        "name": "Edgar Data 2", 
					                        "items": {
					                        	"balanceSheetHistory2": {"name": "Balance Sheet"},
					                            "incomeStatementHistory2": {"name": "Income Statement"},
					                            "cashFlowStatementHistory2": {"name": "Cash Flow"},
					                            "valuationRatiosHistory2": {"name": "Valuation Ratios"},
					                            "profitabilityRatiosHistory2": {"name": "Profitability Ratios"}
					                        }
					                    },
					                    "BEAData": {
					                        "name": "BEA Data", 
					                        "items": {
					                            "beaGDPbyIndustryHistory": {"name": "GDP by Industry"}
					                        }
					                    },
					                    "BLSData": {
					                        "name": "BLS Data", 
					                        "items": {
					                            "blsConsumerPriceIndexHistory": {"name": "Consumer Price Index"},
					                            "blsProductPriceIndexHistory": {"name": "Product Price Index"}
					                        }
					                    }
			                        }
			                    }
			                },
			                "icon": "import"
			            },
		            "sep1": "---------",
		            "delete": {"name": "Delete", "icon": "delete"}, 
		        }
		    });
			

		} else {
			Util.showMessage("No Models Found");
		}
	};

	this.createModelMenu = function(model) {
		var c = this,mrk="";
		mrk += '<div class="row" style="text-align: center;"></div>';
		
		if(model.owner){
			switch (model.status) {
			case "Ready for Visualization":
				if (typeof model.error === "undefined") {
					
					mrk +='<div class="col-xs-2">\
							<button class="btn btn-sm btn-primary fa fa-folder-open" data-btn-role="openModel" data-toggle="tooltip" title="Open"></button>\
						</div>\
						<div class="col-xs-2">\
							<button class="btn btn-sm btn-primary fa fa-tag" data-btn-role="tagModel" data-toggle="tooltip" title="Tag"></button>\
						</div>\
						<div class="col-xs-2" >\
							<button class="btn btn-sm btn-primary fa fa-share-alt-square" data-btn-role="usr_perms" data-toggle="tooltip" title="permissions"></button>\
						</div>\
						<div class="col-xs-2">\
							<button class="btn btn-sm btn-primary fa fa-share-square-o" data-btn-role="exportModel" data-toggle="tooltip" title="Export Model"></button>\
						</div>\
						<div class="col-xs-2">\
							<button class="btn btn-sm btn-primary fa fa-tasks" data-btn-role="vApps" data-toggle="tooltip" title="Vapps"></button>\
						</div>\
						<div class="col-xs-2">\
							<button class="btn btn-sm btn-primary fa fa-ellipsis-v" data-btn-role="mdlmenu"></button>\
						</div>';
				}else {
					mrk +='<div class="col-xs-2">\
							<button class="btn btn-sm btn-primary fa fa-folder-open" data-btn-role="openModel" data-toggle="tooltip" title="Open"></button>\
						</div>\
						<div class="col-xs-2" >\
							<button class="btn btn-sm btn-primary fa fa-trash" data-btn-role="delete_model" data-toggle="tooltip" title="Delete"></button>\
						</div>';
				}
				break;
			case "Model Created":
				mrk +='<div class="col-xs-2">\
						<button class="btn btn-sm btn-primary fa fa-folder-open" data-btn-role="openModel" data-toggle="tooltip" title="Open"></button>\
					</div>\
					<div class="col-xs-2" >\
						<button class="btn btn-sm btn-primary fa fa-trash" data-btn-role="delete_model" data-toggle="tooltip" title="Delete"></button>\
					</div>';
				break;
			}
		}else{
			if (model.status == "Ready for Visualization") {
				mrk +='<div class="col-xs-2">\
						<button class="btn btn-sm btn-primary fa fa-folder-open" data-btn-role="openModel" data-toggle="tooltip" title="Open"></button>\
					</div>\
					<div class="col-xs-2">\
						<button class="btn btn-sm btn-primary fa fa-tasks" data-btn-role="vApps" data-toggle="tooltip" title="Vapps"></button>\
					</div>';
			}
		}
		
		mrk += '</div>';
		
		return mrk;
	} ;
	

	this.getBuilderModles=function(){
		Util.ajaxGet("model/list/builder", function(models) {
			if(models.Status){
				_showModels(models.Models);
			}else{
				Util.showMessage(models.Message);
			}
		},false,true);
	};

	this.getModelDimensions=function(model,cb){
		Util.ajaxGet("model/blockdimensions/"+model.id,function(result){
			if(result.Status){
				if(typeof cb === "function"){
					cb(result.Blocks);
				}
			}else{
				Util.showMessage(result.Status);
			}
		},false,true);
	};

	this.getExcelModels=function(){
		Util.ajaxGet("model/list/excel", function(models) {
			if(models.Status){
				_showModels(models.Models);
			}else{
				Util.showMessage(models.Message);
			}
		},false,true);
	};

	this.getAllModels=function(){

		Util.ajaxGet("model/list/all", function(models) {
			if(models.Status){
				_showModels(models.Models);
			}else{
				Util.showMessage(models.Message);
			}
		},false,true);
	};

	this.deleteModel=function(model){
		modelName=model.name;
		Util.promptDialog("Do you want to delete the Model \""+modelName+"\"?",function(){_delete(model);},function(){},function(){});
	};
	this.visualizeModel=function(model){
		if(!model.nativeModel){
			//$(_propertiesWindow).dialog("close");
			$(_layoutWindow).dialog("close");
			$(_graphicalWindow).dialog("close");

			modelName=model.name;
			Util.ajaxGet("home/getSheets?modelId="+model.id, function(modeldata) {

			toggleButton("formulaview");
			toggleButton("dataTree");

			if(modeldata != null){
				$(_layoutWindow).dialog("option","title","Model: "+modelName);
				$(_graphicalWindow).dialog("option","title","Model: "+modelName);
				$("#excellviewtabs ul").empty();
				$("#excellviewtabs div").remove();

				var mrgnodes=[];
				var length=modeldata.modelSheets.length;
				for(var i=0;i<length;i++){

					var label = modeldata.modelSheets[i].id,li="",div="";
					var sheetname=modeldata.modelSheets[i].sheetName;
					var sheetPositon=modeldata.modelSheets[i].sheetPosition;

					 li +='<li><a href='+"#tab"+sheetPositon+' data-sheet="'+label+'">'+sheetname+'</a></li>';
					 div += "<div id='tab"+sheetPositon+"' style='height:90%;'><div class='tab"+sheetPositon+"' data-sheet='"+label+"' style='height:100%;overflow:hidden;' ></div></div>";

					 $("#excellviewtabs ul").append( li );

					$("#excellviewtabs").append(div );

					//console.log(excelView.colName(10));
					excelView.getGrid(".tab"+sheetPositon, {
						minColumns : 100,
						minRows : 100
					});

					for(var k=0;k<modeldata.modelDatas.length;k++){
						if(modeldata.modelDatas[k].sheetId === label ){
							var cellid=modeldata.modelDatas[k].columnName+modeldata.modelDatas[k].rowIndex;
							if(modeldata.modelDatas[k].displayXlValue){
								$('.tab'+sheetPositon+' td[cell-id="'+cellid+'"]').text(modeldata.modelDatas[k].displayXlValue);
								$('.tab'+sheetPositon+' td[cell-id="'+cellid+'"]').data(modeldata.modelDatas[k]);
							}

						}

					}

					var node = {};
					node.label = sheetname;
					node.object= modeldata.modelSheets[i];
					var sheet = [];
					var mergedNodeList = modeldata.mergedNodes;
					////console.log("total:"+modeldata.mergedNodes.length);
					for(var a=0;a<mergedNodeList.length;a++){
						var mergdNode=mergedNodeList[a];
					if(mergdNode.sheetId == label ){

						h(mergdNode);
					function h(mergdNode){
						var node1={};
						if(mergdNode.mergeLevel > 1 && mergdNode.mergeLevel !== 1000 ){
							 if( mergdNode.columnNameFrom && mergdNode.rowIndexFrom && mergdNode.rowIndexTo && mergdNode.columnNameTo){
								// mergedNodeList.splice(a,1);
								// a--;
								 mergdNode.isUsed=true;
								 node1.label=mergdNode.columnNameFrom+"["+mergdNode.rowIndexFrom+":"+mergdNode.rowIndexTo+"]:"+mergdNode.columnNameTo+"["+mergdNode.rowIndexFrom+":"+mergdNode.rowIndexTo+"]";
								 node1.object = mergdNode;
								 var mrgdnode_2d=[];
								 $.each(mergdNode.components,function(i,v){
									 for(var b=0;b<mergedNodeList.length;b++){

										 var value = mergedNodeList[b];
										 h(v);
										 if(value.id===v){
											// mergedNodeList.splice(b,1);
											 //b--;
											 //a--;
											 value.isUsed=true;
											 var node2={};
											 if(value.columnName && value.rowIndexFrom && value.rowIndexTo){
													node2.label =value.columnName+value.rowIndexFrom+":"+value.columnName+value.rowIndexTo;
													node2.object = value;
													mrgdnode_2d.push(node2);
												}else if(value.columnNameFrom && value.rowIndex && value.columnNameTo){
													node2.label =value.columnNameFrom+value.rowIndex+":"+value.columnNameTo+value.rowIndex;
													node2.object = value;
													mrgdnode_2d.push(node2);
												}
											 node1.children=mrgdnode_2d;
										 }
									 }
								});
							 }
							 sheet.push(node1);
						}
					}

				}
			}
					$.each(mergedNodeList,function(i,v){
						var node1={};
						if(v.isUsed && v.mergeLevel === 1000){
							delete v.isUsed;
						}else{
							if(v.columnName && v.rowIndexFrom && v.rowIndexTo){
								node1.label =v.columnName+v.rowIndexFrom+":"+v.columnName+v.rowIndexTo;
								node1.object =v;
								sheet.push(node1);
							}else if(v.columnNameFrom && v.rowIndex && v.columnNameTo){
								node1.label =v.columnNameFrom+v.rowIndex+":"+v.columnNameTo+v.rowIndex;
								node1.object =v;
								sheet.push(node1);
							}
						}

					});
				node.children=sheet;
				mrgnodes.push(node);
				//console.log(node);
			}
				mrgnds=mrgnodes;
				var excelltabs= $( "#excellviewtabs" ).tabs();
				$(".bottom-tabs .ui-tabs-nav, .bottom-tabs .ui-tabs-nav > *").removeClass(
				"ui-corner-all ui-corner-top").addClass("ui-corner-bottom");
				$(".bottom-tabs .ui-tabs-nav").appendTo(".bottom-tabs");
				//$(_propertiesWindow).dialog("open");
				$(_layoutWindow).dialog("open");
				$(_graphicalWindow).dialog("open");
				NodeTreeView.getNodeTree(mrgnds,"#mrg_node_tree",modelName);
				excelltabs.tabs("refresh");

			}else{
				Util.showMessage("You dont have permission to access");
			}

		});
		}else{
			Util.showMessage("Yet to be Implemented");
		}
	};

	this.exportModel = function(model) {
		var modelId = model.id;
		Util.ajaxGet_download("model/export/"+modelId,function(result){

		});
	};


	this.grantPermissionsToModel=function(model){

		var _modelPermissions=$('<div id="grant_permissions"></div>');
		var isExists =  $("body").find("#grant_permissions");
		if(isExists.length > 0){
			isExists.dialog("close");
		}
		
		_modelPermissions.dialog({
			closeText: false,
			width: 800,
			height: 400,
			buttons: [ { text: "Apply", click: function() {
							_applyModelPerms();
							$(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
						} },
			          { text: "Cancel", click: function() { $(this).dialog( "close" ); } },
			          { text: "Grant", click: function() {
			        	  var current = this;
				          var data={};
			        	  var model=$(".selectedModel").data();
			        	  Util.ajaxPost("model/grant/"+model.id,JSON.stringify(ModelPerms),function(result){
			        		  if(result.Status){
			        			  $(current).dialog( "close" );
			        			//  VappPerms={};
			        				if(result.Permissions.length > 0){
			        					Util.showMessage("Successfully Granted the permissions to "+result.Permissions.join(", "));
				        			}
			        		  }else{
			        			  Util.showMessage(result.Message);
			        		  }
			        	  },false,true);

			          }
		          }
			],
			close:function(){
				$(this).dialog("destroy");
			},
			create:function(){

				ModelPerms={};
				$(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
				var model=$(".selectedModel").data();
				$(this).dialog("option","title",model.name);
				Util.ajaxGet("user/list", function(result) {
					if(result.Status){
						var markup ="User: <select id='userselect'><option value='default'>Select</option>";
						if(result.Users){
							for(var i =0 ; i< result.Users.length;i++){
								markup += '<option value='+result.Users[i].loginId+'>'+result.Users[i].loginId+'</option>';
							}
							markup += '</select><br><br>';

							Util.ajaxGet("model/permissions/"+model.id, function(result) {
								if(result.Status){
									$.each(result.Permissions,function(index,val){
										markup += '<input type="checkbox" class="modelperms" name="prm_granted" value="'+val+'">'+val+'<br>';
									});
									$("#grant_permissions").append(markup);
									$(".modelperms").prop("disabled",true);
								}else{
									Util.showMessage(result.Message);
								}
							});
						}
					}else{
						Util.showMessage(result.Message);
					}
				});
			}
		});
	};

	this.importModel = function(fileUplodUi) {
		var c = this;
		var dlg = $("<div>").dialog({
			width : 400,
			height : 200,
			create : function(event,ui) {
				$(this).append('<input type="text" placeholder="Model Name"/>');
			},
			close : function(event,ui) {
				$(this).dialog("destroy");
			},
			buttons :{
				"Cancel" : function() {
					$(this).dialog("close");
				}
			}
		});
		return dlg;
	};

	return this;

})( vdvcModels || (vdvcModels = {}));








var vAppManager = {};

;(function(vapMngr){
	var self = vapMngr;
	
	self.vappType = "model";
	self.model = null;
	vapMngr.getUserVapps = function(){

		var url = "vapp/list/user";
		if (self.model && self.vappType == "model") {
			url = "vapp/list/"+self.model.id+"/user";
		}
		Util.ajaxGet(url,function (result) {
			if(result.Status){
				
				$("#page-wrapper").empty();
				$("#page-wrapper").append('<div class="row" style="height: 100%;">\
						<div id="myVapps" class="row"></div>\
					</div>');
				var vappList=result.Vapps;
				if( vappList){
					for(var i=0;i<vappList.length;i++){
						
						
						var vappwrap = $("<div  class='col-xs-12 col-sm-3' style='margin-bottom:15px;'>");
						var vapp = $("<div class='vdvc-vapp' style='height:126px;box-shadow: 1px 1px 4px 0px gray;' >");
						var lable = '<div class="row" ><div class="col-xs-1 fa fa-tasks" style="height:25px;padding:3px;" ></div>\
							<div class="col-xs-11 vdvc-txt-wrap" style="height:30px;padding:3px;" data-toggle="tooltip" title="'+vappList[i].appName+'">'+vappList[i].appName+'</div></div>\
							<div class="row" ><div class="col-xs-1" style="height:30px;padding:3px;" ></div>\
							<div class="col-xs-11" style="height:30px;padding:3px;font-size:0.8em;" >'+vappList[i].analystName+'</div></div>\
							<div class="row" ><div class="col-xs-1" style="height:30px;padding:3px;" >\
							</div><div class="col-xs-11" style="height:30px;padding:3px;font-size:0.8em;" >'+new Date(vappList[i].createdOn).toLocaleString()+'</div></div>\
							<div class="row vapp-ft" ><div class="col-xs-1" style="height:30px;padding:3px;" >\
							</div><div class="col-xs-11" style="height:30px;" >'+self.createVappMenu(vappList[i])+'</div></div>';
						vapp.data(vappList[i]);
						vappwrap.append(vapp);
						vapp.append(lable);
						$("#myVapps").append(vappwrap);
						
					}
					
					$(".context-title").html("vApps");
					$(".vdvc-context").attr("vdvc-context","vApps");
					
					
					$.contextMenu({
				        selector: '#myVapps .fa-ellipsis-v', 
				        trigger: 'left',
				        callback: function(key, options) {
				            var m = "clicked: " + key;
				          //  window.console && console.log(m) || alert(m); 
				           switch(key) {
				           case "cloneVapp":
								
								$(".selectedVapp").removeClass("selectedVapp");
								$(this).closest(".vdvc-vapp").addClass("selectedVapp");
								
								var vapp=$(".selectedVapp").data();
								
								vAppManager.cloneVApp (vapp.id);
								break;
					       	case "deleteVapp":
								
								$(".selectedVapp").removeClass("selectedVapp");
								$(this).closest(".vdvc-vapp").addClass("selectedVapp");
								
								var vapp=$(".selectedVapp").data();
								var model=$(".selectedModel").data();
								if("undefined" !== typeof vapp && "undefined" !== typeof model){
									var vappName=vapp.appName;
									Util.promptDialog("Do you want to delete the VApp \""+vappName+"\"?",function(){vAppManager.deletevApp(vapp,model);},function(){},function(){});
								}
	
								break;
				           }
				        },
				        items: {
				        	"cloneVapp": {"name": "Clone", "icon": "clone"}, 
				            "deleteVapp": {"name": "Delete", "icon": "delete"}  
				        }
				    });
					
				} 
			}else{
				Util.showMessage(result.Message);
			}
		},false,true);
	};

	vapMngr.createVappMenu = function(vapp){
		
		var c = this,mrk="";
		var userid = Util.userinfo ? Util.userinfo["UserId"] : "";
		
		mrk += '<div class="row" style="text-align: center;">';
		if (userid.toLowerCase() == vapp.analystId.toLowerCase()) {
			mrk += '<div class="col-xs-2" >\
					<button class="btn btn-sm btn-primary fa fa-play-circle-o" data-btn-role="runVapp" data-toggle="tooltip" title="Run Vapp"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-share-alt-square" data-btn-role="publish_vApp" data-toggle="tooltip" title="Publish"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-pencil-square-o" data-btn-role="editVapp" data-toggle="tooltip" title="Edit"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-tag" data-btn-role="tagVapp" data-toggle="tooltip" title="Tag"></button>\
				</div>\
				<div class="col-xs-2">\
					<button class="btn btn-sm btn-primary fa fa-ellipsis-v" data-btn-role="vappmenu"></button>\
				</div>';
		} else {
			mrk += '<div class="col-xs-2" >\
				<button class="btn btn-sm btn-primary fa fa-play-circle-o" data-btn-role="runVapp" data-toggle="tooltip" title="Run Vapp"></button>\
			</div>\
			<div class="col-xs-2">\
				<button class="btn btn-sm btn-primary fa fa-tag" data-btn-role="tagVapp" data-toggle="tooltip" title="Tag"></button>\
			</div>';
		}
		mrk += '</div>';
		return mrk;
	};
	
	vapMngr.deletevApp = function(vapp){
		var vappId=vapp.id;
		var vappName=vapp.appName;
		Util.ajaxDelete("vapp/"+vappId,null, function(result) {
			if(result.Status){
				Util.showMessage("VApp ("+vappName+") is deleted successfully");
				vapMngr.getUserVapps();
			}else{
				Util.showMessage("Could not delete VApp ("+vappName+")");
			}
		},false,true);
	};
	
	
	vapMngr.cloneVApp = function(vappId) {
		
		var cloneDiv = '<div></div>';
		var title = "Clone vApp";
		var msg = '<table style="width:100%; border-collapse: collapse"> \
					<tr>\
						<td>vApp Name</td>\
		    			<td><input type="text" name="vappName" placeholder="enter vApp name" style="width:100%"></td>\
					</tr>\
					</table>';

		 $(cloneDiv).dialog({
		      modal: true,
		      width: 400,
		      height:150,
		      resizable: false,
		      title: title,
		      open: function(){
		    	  $(this).empty();
		    	  $(this).append(msg);
		      },
		      close:function(){
		    	  $( this ).dialog( "destroy" );
		      },
		      buttons: [
	    		          { text: "Cancel", click:
	    		        	  function()
	    		        	  {
	    		        	  	$(this).dialog( "close" );
	    		        	  }
	    		          },
	    		          { text: "Save", click:
	    		        	  function()
	    		        	  {
	    		        	  	   	var fileName = $(this).find('input[type="text"]').val();
		    		        	  	if (!fileName) {
		    		        	  		Util.showMessage("Enter valid vAppname");
		    		        	  	} else {

						        	  var current=this;
							      	  Util.ajaxPost("vapp/clone/"+vappId, {"vapp-name":fileName},function(result){

						      				 $(current).dialog( "close" );
						      				 if(result.Status){
						      					Util.showMessage("vApp Cloned successfully");
						      					vAppManager.getUserVapps();
						      				 }else{
						      					Util.showMessage("Failed to Clone the vApp");
						      				 }
						      			},false,true);

		    		        	  	}
		    		         }
	    		          }
	    		],
		    });

	}

	
	
	return vapMngr;
})(vAppManager);

Date.prototype.yyyymmdd = function() {

    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();

    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};



function createVapp(){

	var model=$(".selectedModel").data();
	Util.ajaxPost("vapp/create/"+model.id, vapp, function (result) {

		var vAppData={};
		vAppData.modelId=model.id;
		vAppData.revenues=revenue;
		vAppData.rates=growthRate;

		Util.ajaxPost("proto1scenario/createdata/"+model.id+"/"+result.id, vAppData, function (result) {
			if (result) {
				//alert("A new vApp "+result.appName+" has been created");
				Util.showMessage("A new vApp "+result.appName+" has been created");
			} else {
				//alert("It seems like something failed. Please report to dev team");
				Util.showMessage("It seems like something failed. Please report to dev team");
			}
			ModelManager.getAllModels();
		});

	});
}



function getDimValues(model,dimension){
	var set = [];
	$.each(model, function(index, value) {
		if ($.inArray(value[dimension], set) == -1) {
			set.push(value[dimension]);
		}
	});
	return set.sort();
}
function getChildNode(nodeName,nodevals){
	var node={};
	node.data=nodeName;
	node.children=[];
	$.each(nodevals,function(i,v){
		var nd={};
		nd.data=v;
		nd.children=null;
		node.children.push(nd);
	});

	return node;
}



function getList(name,dimname,dim){

	mark='<li><div class="dimLabel">'+name+'---------------------------------------------------------</div><div class="dimperms" data-node="middleNode">\
	<input type="checkbox" name="'+name.toLowerCase()+'" value="Edit"><input type="checkbox" name="'+name.toLowerCase()+'" value="View" ></div><ul>';
	$.each(dim,function(i,v){
		name=name.toLowerCase();
		mark +='<li><div class="dimLabel">'+v+'---------------------------------------------------------\
		</div><div class=" dimperms" data-node="leafNode" data-parent="'+name+'" ><input type="checkbox" name="'+v+'" data-dim="'+dimname+'" value="Edit"><input type="checkbox" name="'+v+'" data-dim="'+dimname+'" value="View"></div></li>';
	});
	mark +='</ul></li>';
	return mark;
}
function getVappData(model, cb) {
	Util.ajaxGet("proto1scenario/getrevenue/"+model.id+"/"+model.scenario.vappId, function(revenue) {
		var geo=getDimValues(revenue,"geo");
		var product=getDimValues(revenue,"product");
		var year=getDimValues(revenue,"fiscalYear");

		/*var geoNode=getChildNode("Geo", geo);
		var productNode=getChildNode("Product", product);
		var yearNode=getChildNode("Fiscal Year", year);
		console.log(geo);
		console.log(product);
		console.log(year);
		var node={};
		node.data="Revene";
		node.children=[];
		node.attr={"role":"ui"};
		node.children.push(geoNode);
		node.children.push(productNode);
		node.children.push(yearNode);
		renderDimPermissions(node,"#dimPermUI");
		$("li[role='ui']").append('amar');*/

	    var	markup ="<ul><li><div class='dimLabel'>Revenue---------------------------------------------------------" +
				"</div><div class=' dimperms' data-node='rootNode' ><input type='checkbox' name='revenue' value='Edit'>" +
				"<input type='checkbox' name='revenue' value='View'></div><ul>";
		var a=getList("Geo","geo",geo);
		markup +=""+a;
		var b=getList("Product","product",product);
		markup +=""+ b;
		var c=getList("Fiscal Year","fiscalYear",year);
		markup += ""+c;
		markup +='</li></ul>';
		$("#dimPermUI").empty();
		$("#dimPermUI").append(markup);
		$('.dimperms>input').prop("disabled",true);

		if ("function" == typeof cb) {
			cb(revenue);
		}

	});
}

function ApplyVaapPerms(){
	 var user=$("#vAppUser").val();
	 if(user !== "default"){
		 var checkboxes= $("div[data-node='leafNode']").find("input[value='Edit'][type='checkbox']");
    	 var perms = [];
    	 $.each(checkboxes,function(i,v){

    		 var dataParent, dataName;
			 dataParent = $(v).attr('data-dim');
			 dataName = $(v).attr('name');
			 var vE = $(v).closest('.dimperms').find("input[type='checkbox'][value='View']");
			 if($(v).is(":checked") || $(vE).is(":checked")){
				 perms.push({
     				"dimension":dataParent, "value":dataName, "editPerms":$(v).is(":checked"), "viewPerms":$(vE).is(":checked")
     			 });
			 }

    	 });
    	 console.log(perms);
    	 VappPerms[user]=perms;
    	 return true;
	 }else{
		 Util.showMessage("Please Select The User");
	 }
}





$(document).on("click","#dimPermUI input[type='checkbox']",function(e){
	e.stopPropagation();
	var perm= $(this).val();
	var node=$(this).closest(".dimperms");
	var nodeType=node.attr("data-node");
	$(".ui-dialog-buttonpane button:contains('Apply')").button('enable');
	if($(this).is(':checked')){
		switch(nodeType){
		case "rootNode":

			var block=$(this).closest("li");
			block.find('input[value="'+perm+'"]').prop("checked","checked");
			break;
		case "middleNode":
			$(node).siblings("ul").find('input[value='+perm+']').prop("checked","checked");
			var midNodes=$("div[data-node='middleNode'");
			$.each(midNodes,function(i,v){
				var flag1=false;
				var flag2=$(v).find('input[value='+perm+']').is(':checked');
				if(!flag2){
					return false;
				}else{
					flag1=true;
				}
				if(midNodes.length == i+1 && flag1){
					$("div[data-node='rootNode'").find('input[value='+perm+']').prop("checked","checked");
				}
			});
			break;
		case "leafNode":
			var siblings= $(node).closest("li").siblings();
			$.each(siblings,function(i,v){
				var flag1=false;
				var flag2=$(v).find('input[value='+perm+']').is(':checked');
				if(!flag2){
					return false;
				}else{
					flag1=true;
				}
				if(siblings.length == i+1 && flag1){
					$(v).closest("ul").parent().find('input[value='+perm+']').prop("checked","checked");
					}
			});
			break;
		}
	}else{
		switch(nodeType){
		case "rootNode":
			$('#dimPermUI input[value='+perm+']').prop("checked",false);
			break;
		case "middleNode":
			$(node).siblings("ul").find('input[value='+perm+']').prop("checked",false);
			$("div[data-node='rootNode'").find('input[value='+perm+']').prop("checked",false);
			break;
		case "leafNode":
			var checkbox=$(this).closest("ul").parent().find('input[value='+perm+']')[0];
			$("div[data-node='rootNode'").find('input[value='+perm+']').prop("checked",false);
			$(checkbox).prop("checked",false);
			break;
		}
	}


	console.log($(this).val());

});

function renderDimPermissions(data, id) {
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
			}).on("select_node.jstree",function(e,data){e.stopPropagation();});
}






$(function() {
	
	if (Util.userinfo) {
		$("#loginUser").html(Util.userinfo["UserName"]);
	}
	
	$('[data-toggle="tooltip"]').tooltip(); 
	
	$("#active li").on("click",function() {
		$("li.selected").removeClass("selected");
		$(this).addClass("selected");
		var role = $(this).attr("role");
		
		switch(role) {
		
		case "vdvcUserVapps":
			vAppManager.model = null;
			vAppManager.vappType = "user";
			vAppManager.getUserVapps();
			break;
		case "vdvcModels":
			ModelManager.getAllModels();
			break;
			
		case "vdvcDocs":
			vdvcDocManager.getRootFolder();
			break;
			
		case "vdvcSharedDocs":
			//vdvcDocManager.shared.getAllSharedDocs();
			vdvcDocManager.getAllSharedDocs();
			break;
			
		}
	});
 


	$("#Importmenu").menu();
	$(document).on("click",".btn",function(event){
		
		event.stopPropagation();
		var btn_role=$(this).attr("data-btn-role");
		var current=this;

		switch(btn_role){
			case "refresh_model":
				ModelManager.getAllModels();
				break;
			case "csvImport":
				
				$(".selectedModel").removeClass("selectedModel");
				$(this).closest(".vdvc-mdl").addClass("selectedModel");
				$(current).fileupload({
					  url: 'CsvImport',
					  done: function(e,data){
						   console.log ("Import filename :"+data.result.ImportedFile);
						  var importedFile = data.result.ImportedFile;
						  var originalFile = data.result.OriginalFile;
						  var model=$(".selectedModel").data();
						  if("undefined" !== typeof model){
							  var impz = new ImportWizard ();
							  impz.importModel(importedFile, originalFile, model.id);
						  }
					  }
				});
				break;
			case "img_upload":
				$(current).fileupload({
					  url: 'ImageUpload',					   
					  done: function(e,data){
						console.log ("Image upload completed sucessfully...!!");
						console.log ("Original image file name: "+data.result.OriginalImageFile);
						console.log ("Uploaded image file name: "+data.result.UploadedImageURL);
					  }
				});
				break;
			case "file_upload":
				$(current).fileupload({
					  url: 'Upload',
					  add: function(e, data) {

						  data.Mode = "Excel";
						  data.submit();
					  },
					  done: function(e,data){
						  ModelManager.getAllModels();
					  }
				});
				break;
			case "vApps":
				$(".selectedModel").removeClass("selectedModel");
				$(this).closest(".vdvc-mdl").addClass("selectedModel");
				var model=$(".selectedModel").data();
				vAppManager.model = model;
				vAppManager.vappType = "model";
				vAppManager.getUserVapps();
				
				break;
			case "vAppgen":
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					_windowController.openWindow("vappgenJQuery.html?model_id="+model.id, model.id+"-NewVAppGen");
				}
				break;
				/*
			case "vAppgenJQuery":
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					window.open("vappgenJQuery.html?model_id="+model.id);
				}
				break;
				*/
			case "create_vApp":
				createVapp();
				break;
			case "usr_perms":
				$(".selectedModel").removeClass("selectedModel");
				$(this).closest(".vdvc-mdl").addClass("selectedModel");
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					ModelManager.grantPermissionsToModel(model);
				}
				break;
			case "publish_vApp":
				//$("#publish_vApp").dialog("open");
				
				$(".selectedVapp").removeClass("selectedVapp");
				$(this).closest(".vdvc-vapp").addClass("selectedVapp");
				var pv = new PublishView({"id": $(".selectedVapp").data().modelId });
				pv.show();
				break;
			case "view_model":
				
				$(".selectedModel").removeClass("selectedModel");
				$(this).closest(".vdvc-mdl").addClass("selectedModel");
				var model = $(".selectedModel").data();
				if("undefined" !== typeof model){
					ModelManager.visualizeModel(model);
				}

				break;
				
				
			case "openModel":
				
				$(".selectedModel").removeClass("selectedModel");
				$(this).closest(".vdvc-mdl").addClass("selectedModel");
				var model = $(".selectedModel").data();
				if("undefined" !== typeof model){
					var pathnaemArray=window.location.pathname.split( '/' );
					var _context="/" + pathnaemArray[1];
					_windowController.openWindow(_context+"/vidivicibuilder.html?modelId="+model.id,"vdvcBuilder"+model.id);
				}

				break;	
			case "mdlmenu":
				$(".selectedModel").removeClass("selectedModel");
				$(this).closest(".vdvc-mdl").addClass("selectedModel");
				break;
			case "delete_model":
				$(".selectedModel").removeClass("selectedModel");
				$(this).closest(".vdvc-mdl").addClass("selectedModel");
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					ModelManager.deleteModel(model);
				}
				break;
			case "exportModel":
				$(".selectedModel").removeClass("selectedModel");
				$(this).closest(".vdvc-mdl").addClass("selectedModel");
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					
					ModelManager.exportModel(model);
				}
				break;
			case "importModel":
				$(current).fileupload({
			        dataType: 'json',
			        multipart: false,
			        add: function (e, data) {
			        	
			        	var dlg = ModelManager.importModel($(current));
			        	data.Ui = dlg;
			        	 data.context = $('<button style="margin-left:10px;"/>').text('Import').appendTo(dlg).click(function () {
			        		 
			        		 	var modelName = dlg.find("input").val();
			        		 	if (modelName && modelName.trim() != "") {
			        		 		$(current).fileupload("option",'url','api/model/model.import/'+modelName);
				                  //data.context = $('<p/>').text('Uploading...').replaceAll($(this));
				                    data.submit();
			        		 	} else {
			        		 		dlg.append("<div style='color:red;'>Model Name is required</div>");
			        		 	}
			                });
			        },
			        done: function (e, data) {
			        	var result = JSON.parse(data.jqXHR.responseText);
			        	if (result.Status) {
			        		// data.context.text('Upload finished.');
			        		 data.Ui.dialog("close");
			        	} else {
			        		Util.showMessage(result.Message);
			        	}
			           
			        }
			    });
				break;
			case "deleteVapp":
				
				$(".selectedVapp").removeClass("selectedVapp");
				$(this).closest(".vdvc-vapp").addClass("selectedVapp");
				
				var vapp=$(".selectedVapp").data();
				var model=$(".selectedModel").data();
				if("undefined" !== typeof vapp && "undefined" !== typeof model){
					var vappName=vapp.appName;
					Util.promptDialog("Do you want to delete the VApp \""+vappName+"\"?",function(){vAppManager.deletevApp(vapp,model);},function(){},function(){});
				}

				break;
				
			case "vappmenu":
				
				$(".selectedVapp").removeClass("selectedVapp");
				$(this).closest(".vdvc-vapp").addClass("selectedVapp");
				break;
				
			/*case "editVapp":
				
				$(".selectedVapp").removeClass("selectedVapp");
				$(this).closest(".vdvc-vapp").addClass("selectedVapp");
				var vapp=$(".selectedVapp").data();
				if("undefined" !== typeof vapp){
					_windowController.openWindow("vappgenJQuery.html?vapp_id="+vapp.id+"&model_id="+vapp.modelId, vapp.appName+"EditVAppGen");
				}

				break;
*/				
			case "editVapp":
				$(".selectedVapp").removeClass("selectedVapp");
				$(this).closest(".vdvc-vapp").addClass("selectedVapp");
				var vapp=$(".selectedVapp").data();
				if("undefined" !== typeof vapp){
					_windowController.openWindow("vappGrid.html?vapp_id="+vapp.id+"&model_id="+vapp.modelId, vapp.appName+"EditVAppGenG");
				}
				break;
				
			case "tagModel":
				$(".selectedModel").removeClass("selectedModel");
				$(this).closest(".vdvc-mdl").addClass("selectedModel");
				var model = $(".selectedModel").data();
				if("undefined" !== typeof model){
					var tag = {};
					tag["Type"] = "Model";
					tag["TopObjectId"] = model.id;
					var tagMgr = new vdvcTagManager(tag);
					tagMgr.createTag();
				}

				break;
			case "tagVapp":
				
				$(".selectedVapp").removeClass("selectedVapp");
				$(this).closest(".vdvc-vapp").addClass("selectedVapp");
				
				var vapp=$(".selectedVapp").data();
				if("undefined" !== typeof vapp){
					var tag = {};
					tag["Type"] = "Vapp";
					tag["TopObjectId"] = vapp.id;
					var tagMgr = new vdvcTagManager(tag);
					tagMgr.createTag();
				}

				break;
			case "cloneVapp":
				
				$(".selectedVapp").removeClass("selectedVapp");
				$(this).closest(".vdvc-vapp").addClass("selectedVapp");
				
				var vapp=$(".selectedVapp").data();
				var model=$(".selectedModel").data();
				vAppManager.cloneVApp (vapp.id);
				break;
				/*
			case "editVappJQuery":
				var vapp=$(".selectedVapp").data();
				if("undefined" !== typeof vapp){
					window.open("vappgenJQuery.html?vapp_id="+vapp.id+"&model_id="+vapp.modelId);
				}

				break;
				*/
			case "runVapp":
				$(".selectedVapp").removeClass("selectedVapp");
				$(this).closest(".vdvc-vapp").addClass("selectedVapp");
				
				openVappG();
				break;
			case "publishToMail":
				$("#publishToMail").dialog("open");
				break;
			case "addModel":
			case "vdvcBuilder":
				_windowController.openWindow("vidivicibuilder.html","vdvcBuilder");
				break;
			case "vdvcNotes":
				_windowController.openWindow("home.html","vdvcNotes");
				break;
			case "open_folder":
				
				$(".selectedFolder").removeClass("selectedFolder");
				$(this).closest(".vdvc-fldr").addClass("selectedFolder");
				var folder = $(".selectedFolder").data();
				vdvcDocManager.rootFolder = folder;
				vdvcDocManager.getAllDocs(folder.id);
				break;
			case "open_notes":
				
				var pathnaemArray=window.location.pathname.split( '/' );
				var _context="/" + pathnaemArray[1];
				$(".selectedDoc").removeClass("selectedDoc");
				$(this).closest(".vdvc-doc").addClass("selectedDoc");
				
				var doccument = $(".selectedDoc").data();
				window["vdvcDoc"] = doccument.doc;
				var doc = doccument.doc || null;
				if ( doc && doc.id && doc.vidiviciNotes) {
					_windowController.openWindow(_context+"/vdvcDocViewer.html?doc="+doc.id,doc.id);
				} else if(doc) {
					_windowController.openWindow(_context+"/api/notes/upload/view/"+doc.fileId,doc.fileId);
				}
				break;
			case "fldrMenu":
				$(".selectedFolder").removeClass("selectedFolder");
				$(this).closest(".vdvc-fldr").addClass("selectedFolder");
				break;
				
			case "share_folder":
				$(".selectedFolder").removeClass("selectedFolder");
				$(this).closest(".vdvc-fldr").addClass("selectedFolder");
				var folder = $(".selectedFolder").data();
				vdvcDocManager.FolderPerms.shareFolder(folder);
				break;
				
			case "share_doc":
				$(".selectedDoc").removeClass("selectedDoc");
				$(this).closest(".vdvc-doc").addClass("selectedDoc");;
				var doccument = $(".selectedDoc").data();
				var doc = doccument.doc || null;
				vdvcDocManager.DocPerms.shareDocument(doc);
				break;
				
			case "docMenu":
				$(".selectedDoc").removeClass("selectedDoc");
				$(this).closest(".vdvc-doc").addClass("selectedDoc");
				break;
				
			case "tagDoc":
				$(".selectedDoc").removeClass("selectedDoc");
				$(this).closest(".vdvc-doc").addClass("selectedDoc");
				var doccument = $(".selectedDoc").data();
				var doc = doccument.doc || undefined;
				if("undefined" !== typeof doc){
					var tag = {};
					tag["Type"] = "Document";
					tag["TopObjectId"] = doc.id;
					var tagMgr = new vdvcTagManager(tag);
					tagMgr.createTag();
				}
				break;
				
			case "tagFolder":
				$(".selectedFolder").removeClass("selectedFolder");
				$(this).closest(".vdvc-fldr").addClass("selectedFolder");
				var folder = $(".selectedFolder").data();
				
				if("undefined" !== typeof folder){
					var tag = {};
					tag["Type"] = "Folder";
					tag["TopObjectId"] = folder.id;
					var tagMgr = new vdvcTagManager(tag);
					tagMgr.createTag();
				}
				break;
				
			case "commentDoc":
				$(".selectedDoc").removeClass("selectedDoc");
				$(this).closest(".vdvc-doc").addClass("selectedDoc");
				var doccument = $(".selectedDoc").data();
				
				var doc = doccument.doc || undefined;
				
				if("undefined" !== typeof doc){
					var nodeId = doc.id;
					if (nodeId) {
						var annotationMgr = new AnnotationManager(nodeId);
						annotationMgr.resourceId = nodeId;
						annotationMgr.type = "document";
						annotationMgr.show(nodeId);
					}
				}
				break;
				
			case "commentFolder":
				$(".selectedFolder").removeClass("selectedFolder");
				$(this).closest(".vdvc-fldr").addClass("selectedFolder");
				var folder = $(".selectedFolder").data();
				
				if("undefined" !== typeof folder){
					var nodeId = folder.id;
					if (nodeId) {
						var annotationMgr = new AnnotationManager(nodeId);
						annotationMgr.type = "document";
						annotationMgr.resourceId = nodeId;
						annotationMgr.show(nodeId);
					}
				}
				break;
				
			default:
				break; 
		}

	});
	
	
	$(document).on("click",".menu-action",function(event){
		event.stopPropagation();
		var menu_role=$(this).attr("data-btn-role");
		var current=this;
		
		switch(menu_role){
			case "csvImport":
				$(current).fileupload({
					  url: 'CsvImport',
					  done: function(e,data){
						   console.log ("Import filename :"+data.result.ImportedFile);
						  var importedFile = data.result.ImportedFile;
						  var originalFile = data.result.OriginalFile;
						  var model=$(".selectedModel").data();
						  if("undefined" !== typeof model){
							  var impz = new ImportWizard ();
							  impz.importModel(importedFile, originalFile, model.id);
						  }
					  }
				});
				break;
			case "dividendHistory" : 
				Util.showMessage("Not yet Implemented");
				break;
			case "quoteHistory" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finDtaWiz = new finDataImportWizard(model.id);
					finDtaWiz.createFinDataImprtDlg();
				}
				break;
			case "balanceSheetHistory" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finBalanceSheetWiz = new finEdgarDataImportWizard(model.id,menu_role);
					finBalanceSheetWiz.createFinEdgarDataImprtDlg();
				}
				break;
			case "incomeStatementHistory" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finIncomeStatementWiz = new finEdgarDataImportWizard(model.id,menu_role);
					finIncomeStatementWiz.createFinEdgarDataImprtDlg();
				}
				break;
			case "cashFlowStatementHistory" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finCashFlowStatementWiz = new finEdgarDataImportWizard(model.id,menu_role);
					finCashFlowStatementWiz.createFinEdgarDataImprtDlg();
				}
				break;
			case "valuationRatiosHistory" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finValuationRatiosWiz = new finEdgarDataImportWizard(model.id,menu_role);
					finValuationRatiosWiz.createFinEdgarDataImprtDlg();
				}
				break;
			case "profitabilityRatiosHistory" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finProfitabilityRatiosWiz = new finEdgarDataImportWizard(model.id,menu_role);
					finProfitabilityRatiosWiz.createFinEdgarDataImprtDlg();
				}
				break;
			case "balanceSheetHistory2" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finBalanceSheetWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
					finBalanceSheetWiz2.createFinEdgarDataImprtDlg();
				}
				break;
			case "incomeStatementHistory2" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finIncomeStatementWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
					finIncomeStatementWiz2.createFinEdgarDataImprtDlg();
				}
				break;
			case "cashFlowStatementHistory2" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finCashFlowStatementWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
					finCashFlowStatementWiz2.createFinEdgarDataImprtDlg();
				}
				break;
			case "valuationRatiosHistory2" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finValuationRatiosWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
					finValuationRatiosWiz2.createFinEdgarDataImprtDlg();
				}
				break;
			case "profitabilityRatiosHistory2" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finProfitabilityRatiosWiz2 = new finEdgarDataImportWizard2(model.id,menu_role);
					finProfitabilityRatiosWiz2.createFinEdgarDataImprtDlg();
				}
				break;
			case "beaGDPbyIndustryHistory" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finBEAGDPbyIndustryWiz = new finBEADataImportWizard(model.id,menu_role);
					finBEAGDPbyIndustryWiz.createFinBEADataImprtDlg();
				}
				break;
			case "blsConsumerPriceIndexHistory" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finBLSConsumerPriceIndexWiz = new finBLSDataImportWizard(model.id,menu_role);
					finBLSConsumerPriceIndexWiz.createFinBLSDataImprtDlg();
				}
				break;
			case "blsProductPriceIndexHistory" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var finBLSProductPriceIndexWiz = new finBLSDataImportWizard(model.id,menu_role);
					finBLSProductPriceIndexWiz.createFinBLSDataImprtDlg();
				}
				break;
 			case "dbDataImport" : 
				var model=$(".selectedModel").data();
				if("undefined" !== typeof model){
					var dbDataImportWiz = new dbDataImpWizard(model.id,menu_role);
					dbDataImportWiz.createDBDataImprtDlg();
				}
				break;
			default:
				break;
		}
	});
	
	
	ModelManager.getAllModels();

	


	function openVapp(){

		var vapp=$(".selectedVapp").data();
		var vappId=vapp.id;
		var modelId=vapp.modelId;
		var workspaceId=vapp.userWorkspaceId;
		var appName= vapp.appName;
		var assembledScenarioId=vapp.assembledScenarioId;
		var pathnaemArray=window.location.pathname.split( '/' );
		var _context="/" + pathnaemArray[1];
		if(assembledScenarioId){
			_windowController.openWindow(_context + "/vAppDefault.jsp?vappId="+vappId+"&modelId="+modelId+"&scenarioId="+assembledScenarioId+"&flag=true",appName);
		}else{
			_windowController.openWindow(_context + "/vAppDefault.jsp?vappId="+vappId+"&modelId="+modelId+"&scenarioId="+workspaceId+"&flag=true",appName);
		}
	}

	function openVappG(){

		var vapp=$(".selectedVapp").data();
		var vappId=vapp.id;
		var modelId=vapp.modelId;
		var workspaceId=vapp.userWorkspaceId;
		var appName= vapp.appName;
		var assembledScenarioId=vapp.assembledScenarioId;
		var pathnaemArray=window.location.pathname.split( '/' );
		var _context="/" + pathnaemArray[1];
		if(assembledScenarioId){
			_windowController.openWindow(_context + "/vAppDefaultG.jsp?vappId="+vappId+"&modelId="+modelId+"&scenarioId="+assembledScenarioId+"&flag=true",appName+"G");
		}else{
			_windowController.openWindow(_context + "/vAppDefaultG.jsp?vappId="+vappId+"&modelId="+modelId+"&scenarioId="+workspaceId+"&flag=true",appName+"G");
		}
	}
	
	$(document).on("dblclick","#myVapps tbody tr",function(e){
		e.stopPropagation();
		openVapp();
	});





	$(document).on("click",'.modelperms',function(event){
		event.stopPropagation();
		$(".ui-dialog-buttonpane button:contains('Apply')").button('enable');

	});

});




/*
 * This View popup is to allow the planner/model owner to publish/maintain vApp access to collaborators
 */
var PublishView = function(mdl) {
	if ($("#publish_vApp").length == 0) {
		// yet to decide - for future use - currently not using this - Jaideep
	}
	var self = this;
	this._model = mdl;
	this._vappId=null;
	this._workspaceId = null;
	this._dimensions = [];
	this._vApps=[];
	this.vappPerms = {};
	this.markup = '<table style="width: 100%;">\
					<tbody>\
						<tr style="height: 50px;">\
							<td>Model :</td>\
							<td><input type="text" data-id="model_name" style="width: 500px;" disabled="disabled"/></td>\
						</tr>\
						<tr style="height: 50px;">\
							<td>vApp  :</td>\
							<td><select id="vlist" width="400" style="width: 500px;"></select></td>\
						</tr>\
						<tr style="height: 50px;">\
							<td>Workspaces :</td>\
							<td><select type="text" id="wslist" data-id="workspaces" style="width: 500px;"></select></td>\
						</tr>\
						<tr style="height: 50px;">\
							<td>Approver  :</td>\
							<td><select id="Approver" width="400" style="width: 500px"><option value="default">Select</option></select></td>\
						</tr>\
						<tr style="height: 50px;">\
							<td>User  :</td>\
							<td><select id="vAppUser" width="400" style="width: 500px"><option value="default">Select</option></select></td>\
						</tr>\
						<tr style="height: 50px;">\
							<td>Workspace Name :</td>\
							<td><input type="text" data-id="suggested-name" style="width: 500px;" /></td>\
						</tr>\
					</tbody>\
				</table>\
				<div style="width:100%;">\
					<div style="width:55%;height:30px;float:left;overflow:hidden;"></div>\
					<div style="width:45%;height:30px;float:left;" class="permSet">\
				</div>\
				</div>\
					<div style="width: 100%;height: 275px;overflow-y: scroll !important;overflow-x: hidden;" id="dimPermUI"></div>\
				</div>';

	this.dlg = $('<div id="publish_vApp">').dialog({
		autoOpen: false,
		closeText: false,
		width: 800,
		height: 600,
		resizable: false,
		title: "Publish vApp",
		buttons: [
		          { text: "Apply", click: function() {
		        	 var applied = self.applyPermissions();
		        	 if (applied) {
		        		 $(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
		        	 } else {
		        		 $(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
		        	 }
		          	}
		          },
		          { text: "Cancel", click: function() {
		        	  self.vappPerms = {};
		        	  $(this).find("#vlist").prop("disabled",false);
		        	  $(this).dialog( "close" );
		        	  }
		          },
		          { text: "Publish", click: function() {
		        	  self.publish();
		          }
	          }
		],
		create : function(event,ui){
			$(this).html(self.markup);
		},
		open: function(event,ui) {
			$(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
			self.getPublishView();
			/*var model = self._model;
			self.getUsers(model);
			self.getAllVapps(model);
			self.getModelDimsWithPerms(model);*/

		},
		close: function(event,ui){
			$(this).dialog("destroy");
		}
	});

	this.bindEvents = function() {
		var c = this;
		$(document).off("change","#vlist").on("change","#vlist",function(event){
			c.handleVappChangeEvent(event,$(this));
		});
		$(document).off("change","#vAppUser").on("change","#vAppUser",function(event){
			c.handleUserChangeEvent(event,$(this));
		});
		$(document).off("change",'select[data-id="workspaces"]').on("change",'select[data-id="workspaces"]',function(event){
			c.handleWrkSpaceChangeEvent(event,$(this));
		});
	};

	this.getPublishView = function() {
		var c = this;
		var model = c._model;
		$.when(
				Util.diff_ajaxGet("vapp/list/"+model.id+"/user",function (result) {
					if(result.Status){
						var markup="";
						for(var i=0;i<result.Vapps.length;i++){
							markup +='<option value="'+result.Vapps[i].id+'">'+result.Vapps[i].appName+'</option>';
						}
						$("#vlist").html(markup);
					}else{
						Util.showMessage(result.Message);
					}
				}),
				Util.diff_ajaxGet("user/list", function(result) {
					if(result.Status){

						if(result.Users.length > 0){
							$('input[data-id="vapp_name"]').empty();
							$('input[data-id="model_name"]').empty();
							$('input[data-id="model_name"]').val(model.name);
							$("#vAppUser").empty();
							$("#Approver").empty();
							var markup ="<option value='default'>Select</option>";
							for(var i =0 ; i< result.Users.length;i++){
								markup += '<option value='+result.Users[i].loginId+'>'+result.Users[i].firstName+" "+result.Users[i].lastName+'</option>';
							}
							$("#vAppUser").append(markup);
							$("#Approver").append(markup);
						}
					}else{
						Util.showMessage(result.Message);
					}
				})/*,
				Util.diff_ajaxGet("model/blockdimensions/"+model.id,function(result){
					if(result.Status){
						Util.ajaxGet("vapp/permissionset",function(perms){
							if(perms.Status){
								c.dimUi(result.Blocks, perms.Permissions);
							}else{
								Util.showMessage(perms.Message);
							}
						});

					}else{
						Util.showMessage(result.Message);
					}
				})*/
		).then(function( data, textStatus, jqXHR ) {
			c.bindEvents();
			$(c.dlg).find("#vlist").trigger("change");
		});
	};

	this.handleWrkSpaceChangeEvent = function(event,target) {
		event.stopPropagation();
		var c = this;
		c._workspaceId = target.val();
		c.updateWorkspaceName();
		c.getWrkSpaceDimsWithPerms(c._workspaceId);
	};

	this.handleUserChangeEvent = function(event,target) {
		event.stopPropagation();
		var c = this;
		var selectedUser=target.val();
		if(selectedUser ==="default"){
			$("#dimPermUI").find('input[type="checkbox"]').prop("checked",false);
			$(".dimperms>input").prop("disabled",true);
		}else{
			$(".dimperms>input").prop("disabled",false);
			$("#dimPermUI").find('input[type="checkbox"]').prop("checked",false);
			if(!$.isEmptyObject(VappPerms)){
				var perms=VappPerms[selectedUser];
				if(perms){
					$.each(perms,function(i,v){
						var dim=v.dimension;
						var value=v.value;
						var editPerms= v.editPerms;
						var viewPerms=v.viewPerms;

						if(editPerms){
							var checkbox=$("div[data-node='leafNode']").find('input[type="checkbox"][name="'+value+'"][data-dim="'+dim+'"][value="Edit"]');
							$(checkbox).trigger("click");
							 $(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
						}
						if(viewPerms){
							var checkbox=$("div[data-node='leafNode']").find('input[type="checkbox"][name="'+value+'"][data-dim="'+dim+'"][value="View"]');
							$(checkbox).trigger("click");
							 $(".ui-dialog-buttonpane button:contains('Apply')").button('disable');
						}
					});
				}
			}
		}

		c.updateWorkspaceName();
	};

	this.handleVappChangeEvent = function(event,target) {
		var c = this;
		event.stopPropagation();
		var vappId = target.val();
		/*Util.ajaxGet("vapp/permissions/"+vappId,function(result){
			if(result.Status){
				Util.ajaxGet("vapp/permissionset",function(perms){
					if(perms.Status){
						c.dimUi(result.Blocks,perms.Permissions);
					}else{
						Util.showMessage(perms.Message);
					}
				});

			}else{
				Util.showMessage(result.Message);
			}
		});*/

		Util.ajaxGet("workspace/list/"+c._model.id+"/"+vappId,function(result){
			 if (result.Status === true) {
				c.updateWrkSpaceList(result.Workspaces);
			 } else {
				 Util.showMessage(result.Message);
			 }
		 },false,true);
	};

	this.updateWorkspaceName = function() {

		var c = this;
		var selectedwrkspace = $(c.dlg).find("select[data-id='workspaces']");
		var User = $(c.dlg).find("#vAppUser").find('option:selected').text();
		$(c.dlg).find("input[data-id='suggested-name']").val('');
		if (selectedwrkspace.length > 0 && User && User !== "Select") {
			var workspaceName = $(selectedwrkspace).find('option:selected').text();
			var suggestedName = workspaceName+"-"+User;
			$(c.dlg).find("input[data-id='suggested-name']").val(suggestedName);
		}
	};

	this.updateWrkSpaceList = function(wrkspaceList) {

		var c = this;
		if (wrkspaceList && wrkspaceList.length > 0) {
			//var data_id = "workspaces";
			var markup = '';
			$.each(wrkspaceList,function(i,wrkspace){
				markup += '<option value='+wrkspace["id"]+' name='+wrkspace["name"]+'>'+wrkspace["name"]+'</option>';
			});
			$(c.dlg).find('select[data-id="workspaces"]').html(markup);
			c.updateWorkspaceName();
			$(c.dlg).find('select[data-id="workspaces"]').trigger("change");
		}
	};

	this.getAllVapps = function(model) {
		Util.ajaxGet("vapp/list/"+model.id+"/user",function (result) {
			if(result.Status){
				//self.setVapps(result.Vapps);
				var markup="";
				for(var i=0;i<result.Vapps.length;i++){
					markup +='<option value="'+result.Vapps[i].id+'">'+result.Vapps[i].appName+'</option>';
				}
				$("#vlist").html(markup);
			}else{
				Util.showMessage(result.Message);
			}
		});
	};

	this.getWrkSpaceDimsWithPerms = function(workspaceId) {
		var c = this;
		
		Util.ajaxGet("workspace/dimensions/"+workspaceId,function(result){
			if(result.Status){
				Util.ajaxGet("vapp/permissionset",function(perms){
					if(perms.Status){
						c.dimUi(result.Dimensions, perms.Permissions);
					}else{
						Util.showMessage(perms.Message);
					}
				});

			}else{
				Util.showMessage(result.Message);
			}
		});
	};
	
	this.getModelDimsWithPerms = function(model) {
		var c = this;
		Util.ajaxGet("model/blockdimensions/"+model.id,function(result){
			if(result.Status){
				Util.ajaxGet("vapp/permissionset",function(perms){
					if(perms.Status){
						c.dimUi(result.Blocks, perms.Permissions);
					}else{
						Util.showMessage(perms.Message);
					}
				});

			}else{
				Util.showMessage(result.Message);
			}
		});
	};

	this.getUsers = function(model) {
		var c = this;
		Util.ajaxGet("user/list", function(result) {
			if(result.Status){
				if(result.Users.length > 0){
					$('input[data-id="vapp_name"]').empty();
					$('input[data-id="model_name"]').empty();
					$('input[data-id="model_name"]').val(model.name);
					$("#vAppUser").empty();
					var markup ="<option value='default'>Select</option>";
					for(var i =0 ; i< result.Users.length;i++){
						markup += '<option value='+result.Users[i].loginId+'>'+result.Users[i].loginId+'</option>';
					}
					$("#vAppUser").append(markup);
				}
			}else{
				Util.showMessage(result.Message);
			}
		});
	};



	this.setVapps=function(vapps){
		this._vApps=vapps;
	};
	this.getModelvApps=function(model){
		Util.ajaxGet("vapp/list/"+model.id,function (result) {

			if(result.Status){
				self.setVapps(result.Vapps);
				var markup="";
				for(var i=0;i<result.Vapps.length;i++){
					markup +='<option value="'+result.Vapps[i].id+'">'+result.Vapps[i].appName+'</option>';
				}
				$("#vlist").empty();
				$("#vlist").append(markup);
			}else{
				Util.showMessage(result.Message);
			}
		});
	};

	this.publish = function() {
		self._workspaceId =$(this.dlg).find("#wslist").val();
		var c = this,postdata = {};
		postdata["users"] = self.vappPerms ;
		postdata["approver"] = $(this.dlg).find("#Approver").val();
		
		Util.ajaxPost("vapp/publish/"+c._vappId+"/"+c._workspaceId, JSON.stringify(postdata), function(result) {
			$(self.dlg).dialog("close");
			if (result) {
				if (result.Status === true) {
					self.vappPerms = {};
    				Util.showMessage(result.Message);

    			} else {
    				//Util.showMessage("Failed to publish the vapp to "+result.PublishedTo.join(", ")+". Please report to the dev team.");
    				Util.showMessage(result.Message);
    			}
			}
		},false,true);
	};

	this.applyPermissions = function() {
		var c = this;
		$(this.dlg).find("#vlist").prop("disabled",true);
		 var user = $(this.dlg).find("#vAppUser").val();
		 var approver = $(this.dlg).find("#Approver").val();
		 self._vappId =$(this.dlg).find("#vlist").val();
		 if(user !== "default" && approver !== "default") {
			 var leaf = $(this.dlg).find(".perms");
	    	 var perms = {};
	    	 perms.workspaceName = $(c.dlg).find('input[data-id="suggested-name"]').val();
	    	 perms.permissions = [];
	    	 $.each(leaf, function(i, v) {
	    		 var checkboxes=$(v).find("input[type='checkbox']");
	    		 var permObj={};
	    		 var block=$(v).attr('data-block');
    			 var Dim = $(v).attr('data-dim');
				 var Val = $(v).attr('data-val');
				 permObj["block"]=block;
				 permObj["dimension"]=Dim;
				 permObj["value"]=Val;
	    		 $.each(checkboxes,function(index,val){
	    			var permType =$(val).val();
	    			permObj[permType]=$(val).is(":checked");

	    		 });
	    		 perms.permissions.push(permObj);
	    	 });

	    	 this.vappPerms[user] = perms;
	    	 
	    	 var areValid = this.validatePerms(perms.permissions);

	    	 if (!areValid) {
				 Util.showMessage("Please check the permissions you have asisgned and try again");
	    	 }
	    	 return areValid;
		 } else {
			 Util.showMessage("Please select a user/Approver to choose the permissions to be published");
		 }
	};

	this.validatePerms = function(perms) {
		var dimCount = {};
		var allfound = true;

		$.each(perms, function(i, perm) {
			var dc = dimCount[perm.dimension];
			if ("undefined" == typeof dc) {
				dimCount[perm.dimension] = 1;
			} else {
				dimCount[perm.dimension] = dc+1;
			}
		});
		$.each(this._dimensions, function(i, dim) {
			if ("undefined" == typeof(dimCount[dim])) {
				allfound = false;
			}
		});

		return allfound;
	};

	this.show = function() {
		$(this.dlg).dialog("open");
	};

	this.dimUi = function(data, permsSet) {
		var permsMark='';
		$.each(permsSet,function(i,v){
			permsMark +='<span style="margin: 0px 10px 0px 5px;">'+v+'</span>';
		});

		var ul = $("<ul/>");
		$.each(data, function(key, value) {
			var li = $("<li/>");
			if (ul.find('li[data-block="'+value.blockName+'"]').length > 0) {
				li = ul.find('li[data-block="'+value.blockName+'"]');
			} else {
				var markup1 = '\
					<div class="dimLabel">'+value.blockName+'---------------------------------------------------------</div>\
					<div class="dimperms" data-node="rootNode">'+self.permsUi(permsSet,{"dimName":null,"dimVal":null,"block":value.blockName})+'</div>';

				
				ul.append(li);
				li.append(markup1);
				li.attr('data-block',value.blockName);
			}
			
			var dimul = $("<ul/>");
			li.append(dimul);
			
			var markup = '\
				<div class="dimLabel">'+value.name+'---------------------------------------------------------</div>\
				<div class="dimperms" data-node="middleNode" >'+self.permsUi(permsSet,{"dimName":value.name,"dimVal":value.name,"block":value.blockName})+'</div>';
			var dimli = $("<li/>");
			var _li = $("<li/>");
			var valUl = $("<ul/>");
			
			$.each(value.values, function(index, val) {
				var markup ='\
					<div class="dimLabel">'+val.stringValue+'---------------------------------------------------------</div>\
					<div class="dimperms perms" data-node="leafNode" data-block="'+value.blockName+'" data-dim="'+value.name+'" data-val="'+val.stringValue+'" >\
						'+self.permsUi(permsSet,{"dimName":value.name,"dimVal":val.stringValue,"block":value.blockName})+'</div>';
				var valLi = $("<li/>");
				valLi.append(markup);
				valUl.append(valLi);
			});
			
			_li.append(markup);
			_li.append(valUl);
			dimli.append(_li);
			dimul.append(dimli);
		});

		$("#dimPermUI").empty();
		$(".permSet").empty();
		$(".permSet").append(permsMark);
		$("#dimPermUI").append(ul);
		$('.dimperms>input').prop("disabled",true);
	};

	this.checkIfAnyMeasureHasAggregate = function(measures) {
		var has = false;
		if (measures) {
			$.each(measures, function(i, m) {
				has = has || (m.aggregateFun != "NONE");
			});
		}

		return has;
	};

	this.permsUi = function(permsSet, data) {
		var checkMark = '';
		$.each(permsSet, function(i, v) {
			checkMark += '<input type="checkbox" value="'+v+'" data-block="'+data["block"]+'" data-dim="'+data["dimName"]+'" data-val="'+data["dimVal"]+'">';
		});
		return checkMark;
	};

	return this;
};

