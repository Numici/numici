//controler 

var vdvcAppController = {};

// Model
var vAppModel = function(vappId,modelId,wrkspaceId,isFromLocal){
	var _vappId=vappId;
	var _currentUser="";
	var _modelId=modelId;
	var _workspaceId=wrkspaceId;
	var _vApp=null;
	var _vAppData=null;
	var _crossFilterObj=null;
	var _isFromLocal=isFromLocal;
	var _model=null;
	var _dimPerms=null;
	var _blockDef=null;
	var _chartControls = null;
	var _errorMsgs = {};
	var _screens = [];
	var model={
			isFromLocal:_isFromLocal,
			hasNoErrors : true,
			currentWorkspace : wrkspaceId,
			vappId : vappId,
			currentUser: "",
			modelId : modelId,
			rootWrkSpace : wrkspaceId,
			isChanged : false,
			userPrefs : [],
			btnActions : {},
			ctrlProps : {},
			screenId : 1,
			textCtrlData : null
	};

	model.setScreen = function(screen) {
		_screens.push(screen);
	};

	model.getScreen = function() {
		return _screens;
	};

	model.setChartControls = function(ctrls) {
		_chartControls=ctrls;
	};

	model.getChartControls = function() {
		return _chartControls;
	};


	model.setCurrentUser=function(user){
		_currentUser=user;
	};

	model.getCurrentUser=function(){
		return _currentUser;
	};

	model.setDimPerms=function(perms){
		_dimPerms=perms;
	};

	model.getDimPerms=function(){
		return _dimPerms;
	};

	model.setBlockDef=function(blockDef){
		_blockDef = $.extend(true,{},blockDef);
	};

	model.getBlockDef=function(){
		return _blockDef;
	};

	model.setModel=function(model){
		_model=model;
	};

	model.getModel=function(){
		return _model;
	};

	model.setCrossFilterObj=function(vappData){
		_crossFilterObj=crossfilter(vappData);
	};

	model.getCrossFilterObj=function(){
		return _crossFilterObj;
	};
	model.setModelId=function(modelId){
		_modelId=modelId;
	};

	model.getModelId=function(){
		return _modelId;
	};

	model.setVappId=function(vappId){
		_vappId=vappId;
	};
	model.getVappId=function(){
		return _vappId;
	};

	model.setWorkspaceId=function(wrkspaceId){
		_workspaceId = wrkspaceId;
	};

	model.getWorkspaceId=function(){
		return _workspaceId;
	};
	model.setVapp=function(vapp){
		_vApp=vapp;
	};
	model.setVappData=function(vappData){
		_vAppData=vappData;
	};

	model.getVappData=function(){
		return _vAppData;
	};

	model.getVapp=function(){
		return _vApp;
	};

	model.setErrorMessage = function (msgKey,Msg) {
		_errorMsgs[msgKey]=Msg;
	};

	model.getErrorMessage = function (msgKey) {
		if (msgKey) { return _errorMsgs[msgKey]; }
		else { return _errorMsgs; }
	};

	return model;
};





// Controller
var vAppController = (function(controller){
	
	controller.cscrnIndex = 1;
	controller.mode = "run";
	var setVappInfo=function(vapp){

		var app=vapp.getVapp();
		$('div[data-holder="vApp_name"]').empty();
		$('div[data-holder="ent_name"]').empty();
		$('div[data-holder="user_details"]').empty();
		$('div[data-holder="vApp_name"]').append(app.appName);
		$('div[data-holder="ent_name"]').append(app.organizationName);
		$('div[data-holder="user_details"]').append(vapp.getCurrentUser());
	};



	controller.createControls = function(controls,scrn,vapp,parent){
		var c = this,ctrlObj=[];

		$.each(controls,function(key,val){

			item++;
			var ctrl = ControlFactory.createInstance(val.controlType);
			ctrl.setScreen(scrn);
			ctrl.setParent(parent);
			ctrl.setName(val.name);
			ctrl.setControlType(val.controlType);
			ctrl.updatedOn = val.updatedOn;
			ctrl.objectId = val.id;
			var ctrlAttrs = scrn.getMatchingControlAttrs(val.controlType);
			ctrl.setVapggenAttributes(ctrlAttrs);
			if(val.controlType === "Layout"){
				ctrl.vappId = vappId;
				ctrl.workspaceId = workspaceId;
				ctrl.blockDef = $.extend(true,{},vapp.getBlockDef());
				ctrl.designerData = val.designerData;
				ctrl.setPermissions(vapp.getDimPerms());
			}
			if(val.controlType === "CompositeChart" || val.controlType === "CompositeFilter"){
				ctrl.designerData = val.designerData;
				ctrl.blockDef = $.extend(true,{},vapp.getBlockDef());
			}
			if(val.controlType === "Menubar"){
				//Added for testing needs to be removed
				var	designerData=MenuGroup;
				ctrl.setDesignerData(designerData);
			}
			if(val.controlType === "PlannerControl" || val.controlType === "WorkFlowDashBoardControl") {
				ctrl.vappId = vappId;
				ctrl.modelId = modelId;
				ctrl.workspaceId = workspaceId;
				ctrl.appName = vapp.getVapp().appName;
			}
			ctrl.addAttributes(val.attributes);
			
			ctrl.el=$('<div>');
			
			/*if(ctrlId == val.id) {
				ctrl.el=$('<div style="border:solid 3px red;"></div>');
			} else {
				ctrl.el=$('<div>');
			}*/
			
			ctrl.el.attr("id",val.controlType+item);
			if(val.controls){
				var ctrls = c.createControls(val.controls,scrn,vapp,ctrl);
				ctrl.addControl(ctrls);
			}
			
			ctrlObj.push(ctrl);
		});
		return ctrlObj;
	};

	controller.createScreen = function(vapp,Xfilter,appData) {
		var c = this,app = vapp.getVapp();
		var screens=app.screens;
		if(screens && screens.length > 0){

			$.each(screens,function(index,value){

				var options= {};
				options.model={};
				options.vappgen={};


				options.vappgen.completeControls = vapp.ctrlProps;
				options.vappgen.actions = vapp.btnActions;

				//options.vappgenControls = vapp.getChartControls();
				options.model.blocks = vapp.getBlockDef();
			//	options.vappgen.completeControls = vapp.getChartControls();
				var dh = value.defaultHeight || 1;
				var dw = value.defaultWidth || 1;
				var h = value.height || 1;
				var w = value.width || 1;
				
			
				
				var scrn= ScreenFactory.createInstance(value.type,options);
				vapp.setScreen(scrn);
				scrn.index=value.index;
				scrn.name=value.title;
				scrn.type=value.type;
				scrn.el=$('<div id="app-scrn-'+scrn.index+'" index="'+scrn.index+'" class="inactive" ></div>');
				$(".vdvc-screen").append(scrn.el);
				
				//scrn.setXfilter(Xfilter);
				scrn.setVappData(appData);
				var ah = scrn.el.height();
				scrn.dwidth = dw;
				scrn.dheight = dh;
				scrn.height = h;
				scrn.width = w;
				
				var sw = $(scrn.el).width();
				var ar = sw/w;
				scrn.el.height(h*ar);
				
				if (scrn.index != c.cscrnIndex) {
					scrn.el.hide();
				}
				
				var controls=value.controls;
				var menuItems = value.menuItems;
				if (menuItems) {
					var mnu = $(".vdvc-vapp-menu");
					mnu.empty();
					$.each(menuItems,function(i,m){
						if (m.required) {
							switch(m.role) {
							case "Tags":
								var mrkup = '<button  id="tag-items" class="btn btn-default" role="Tags">Tags</button>\
									<div style="display: none; width:350px;position: absolute;height: 350px;background: white;  box-shadow: 0px 4px 4px 4px gray;ovrerflow:hidden;" class="tagList">\
								</div>';
								mnu.append(mrkup);
								break;
							case "Calculate" :
								var mrkup = '<button class="btn btn-default customButton" role="Calculate" action="calculate">Calculate</button>';
								mnu.append(mrkup);
								break;
							}
						}
					});
				}
				if(controls){
					var ctrls = c.createControls(controls,scrn,vapp,scrn);
					scrn.addControl(ctrls);
				}
			});
		}

	};

	controller.updateScrnNavigation = function() {
		var c = this,
		vapp = c.vapp;
		var screens = vapp.getScreen();
		$('button[role="prevScrn"]').attr("disabled",true);
		$('button[role="nextScrn"]').attr("disabled",true);
		if (c.cscrnIndex > 1) {
			$('button[role="prevScrn"]').attr("disabled",false);
		}
		if (c.cscrnIndex < screens.length) {
			$('button[role="nextScrn"]').attr("disabled",false);
		}
	};
	
	controller.renderScreen = function() {
		var c = this,
			vapp = c.vapp;
		var screens = vapp.getScreen();
		
		/*if (screens) {
			$.each(screens,function(i,scrn){
				if (c.cscrnIndex == scrn.index) {
					
					scrn.el.addClass("active");
					scrn.el.removeClass("inactive");
					scrn.el.show();
					scrn.renderLayout();
					if (c.mode == "run") {
						scrn.render();
					}
					if (c.mode == "compare") {
						scrn.compare();
					}
					
					if (ctrlId) {
						scrn.focusControl(ctrlId);
					}
				} else {
					scrn.el.addClass("inactive");
					scrn.el.removeClass("active");
					scrn.el.hide();
				}
			});
		}
		
		c.updateScrnNavigation();*/
		
		Util.ajaxGet ("workspace/getconfig/"+c.vapp.currentWorkspace+"/"+c.cscrnIndex, function(config){
			if (config.Status) {
				if (screens) {
					vapp.userPrefs = config.VappConfiguration;
					$.each(screens,function(i,scrn){
						
						if (c.cscrnIndex == scrn.index) {
							
							var ctrls = scrn.controls;
							if (ctrls && ctrls.length > 0) {
								$.each(ctrls,function(j,ctrl){
									c.setUsrCtrlPrefs(ctrl);
									if (ctrl.controlType == "Layout") {
										ctrl.workspaceId = vapp.currentWorkspace;
									}
								});
							}
							
							scrn.el.addClass("active");
							scrn.el.removeClass("inactive");
							scrn.el.show();
							scrn.renderLayout();
							if (c.mode == "run") {
								scrn.render();
							}
							if (c.mode == "compare") {
								scrn.compare();
							}
							
							if (ctrlId) {
								scrn.focusControl(ctrlId);
							}
						} else {
							scrn.el.addClass("inactive");
							scrn.el.removeClass("active");
							scrn.el.hide();
						}
					});
					c.updateScrnNavigation();
				}
			} else {
				Util.showMessage(config.Message);
			}
		},false,true);
	};
	
	controller.setUsrCtrlPrefs = function(ctrl) {
			
			var c = this,
				vapp = c.vapp,
				scrn = ctrl.screen;
			if (vapp.userPrefs.length > 0 && typeof scrn.index != "undefined") {
				$.each(vapp.userPrefs,function(i,cnfg){
					if (cnfg["controlName"] == ctrl.name && cnfg["screenIndex"] == scrn.index ) {
						var vappCtrlDate = new Date(ctrl.updatedOn);
						var usrCtrlPrefDate = new Date(cnfg["updatedOn"]);
						if (_.isDate(vappCtrlDate) && _.isDate(usrCtrlPrefDate)) {
							if (usrCtrlPrefDate > vappCtrlDate) {
								var attr = cnfg["attributes"] || {},
									props = attr["dimensionProperties"],
									designerData = attr["designerProperties"];
								if (props) {
									ctrl.addAttributes(props);
								}
								if (designerData) {
									ctrl.designerData = designerData;
								}
							}
						}
						return false;
					}
				});
			}
		};

	controller.updateWrkSpaceView = function() {
		var c = this;
		var vapp = c.vapp;
		if (c.modelWorkspaces && c.modelWorkspaces.length > 0) {
			var markup ='';
			$.each(c.modelWorkspaces,function(i,obj){
				markup += '<option value="'+obj["id"]+'">'+obj["name"]+'</option>';
			});

			$("select[data-role='workspaceList']").html(markup);
			$("select[data-role='workspaceList']").val(vapp.currentWorkspace);

		}
	};

	controller.getModelWorkSpaces = function(callback) {
		var c = this;
		Util.ajaxGet("workspace/list/"+modelId+"/"+vappId,function(result){
			 if (result.Status === true) {
				c.modelWorkspaces = result.Workspaces;
				c.updateWrkSpaceView();
				if (typeof callback == "function") {
					callback();
				}
			 } else {
				 Util.showMessage(result.Message);
			 }
		 },false,true);
	};

	controller.handleWorkSpaceChange = function(ui,workspaceId) {
		var c = this, vapp = c.vapp;
		if (vapp.isChanged) {
			Util.promptDialog("Do You want save the changes",function(){
				c.saveWorkspace();
				c.switchWorkspace(workspaceId);
				},function(){
					c.switchWorkspace(workspaceId);
				},function(){
					ui.val(vapp.currentWorkspace);
				});
		} else {
			c.switchWorkspace(workspaceId);
		}
	};

	controller.switchWorkspace = function(workspaceId) {
		var c = this,vapp = c.vapp;
		var url = "workspace/"+vapp.modelId+"/"+vapp.vappId+"/"+workspaceId;

		Util.ajaxGet(url,function(result){
			if(result.Status){
				Util.showSpinner();
				vapp.currentWorkspace = workspaceId;
				var screen = vapp.getScreen();
				/*Util.sync_ajaxGet("workspace/gettext/"+workspaceId,function(textRslt){
					if(result.Status){
						vapp.textCtrlData = textRslt.WorkspaceText;
					}else{
						Util.showMessage(textRslt.Message);
					}
				});*/
				
				Util.sync_ajaxGet("annotate/get/"+modelId+"/"+vappId+"/"+workspaceId,function(annotationsData){
					if(annotationsData.Status){
						vapp.annotations = annotationsData.Data;
					}else{
						Util.showMessage(annotationsData.Message);
					}
				});
				Util.sync_ajaxGet("workspace/getscalars/"+workspaceId,function(scalardata){
					if(scalardata.Status){
						
						vapp.scalars = scalardata.WorkspaceText;
					}else{
						Util.showMessage(scalardata.Message);
					}
				});
				Util.ajaxGet ("workspace/getconfig/"+workspaceId+"/"+c.cscrnIndex, function(config){
					if (config.Status) {
						vapp.userPrefs = config.VappConfiguration;
						$.each(screen,function(i,scrn){
							var ctrls = scrn.controls;
							if (ctrls && ctrls.length > 0) {
								$.each(ctrls,function(j,ctrl){
									c.setUsrCtrlPrefs(ctrl);
									if (ctrl.controlType == "Layout") {
										ctrl.workspaceId = vapp.currentWorkspace;
									}
								});
							}
							scrn.setVappData(result.Data);
							scrn.resetControlCache();
							if (c.cscrnIndex == scrn.index) {
								c.mode = "run";
								scrn.render();
							}
							$('select[data-role="workspaceList"]').val(workspaceId);
							Util.hideSpinner();
						});
					} else {
						Util.showMessage(config.Message);
					}
				});
			}else{
				Util.showMessage(result.Message);
				$('select[data-role="workspaceList"]').val(vapp.currentWorkspace);
			}
		},false,true);
	};

	controller.compare = function(ui) {

		var c = this,vapp = c.vapp;
		var screen = vapp.getScreen();
		var workspaces = {};
		var wschkbox = ui.find('input:checked');
		if (wschkbox && wschkbox.length > 0) {
			$.each(wschkbox,function(i,v){
				var wsname = $(v).attr("name");
				var wsId = $(v).val();
				workspaces[wsname] = [wsId];
			});
		}
		if (!$.isEmptyObject(workspaces)) {
			Util.ajaxPost("workspace/compare/"+vapp.vappId+"/"+vapp.currentWorkspace, workspaces, function(result) {
				if (result.Status) {
					ui.dialog("close");
					$.each(screen,function(i,scrn){
						scrn.setVappData(result.Data);
						if (c.cscrnIndex == scrn.index){
							c.mode = "compare";
							scrn.compare();
						}
					});
				} else {
					Util.showMessage(result.Message);
				}
			},false,true);
		}
	};

	controller.compareWorkspace = function() {
		var c = this;
		var dlg = $("<div>").dialog({
			width : 500,
			height : 400,
			modal : true,
			create : function() {
				if (c.modelWorkspaces && c.modelWorkspaces.length > 0) {
					var markup ='<div style="padding-left:1em;"><form>';
					$.each(c.modelWorkspaces,function(i,obj){
						/*if (obj["id"] != c.vapp.currentWorkspace) {
							markup += '<label class="checkbox">\
								  <input type="checkbox" value="'+obj["id"]+'" name="'+obj["name"]+'">'+obj["name"]+'</label>';
						}*/

						markup += '<label class="checkbox">\
							  <input type="checkbox" value="'+obj["id"]+'" name="'+obj["name"]+'">'+obj["name"]+'</label>';
					});
					markup += '</form></div>';
					$(this).html(markup);
				}
			},
			close : function() {
				$(this).dialog("destroy");
			},
			buttons: {
				"Compare" : function() {
					c.compare($(this));
				},
				"Cancel" : function() {
					$(this).dialog("destroy");
				}
			}
		});
	};

	controller.cloneOrcreateWorkspace = function(wrkspacename,dlg,option) {

		var c = this,url;
		var currentWorkspace = c.vapp.currentWorkspace;
		var postdata = {};
		postdata["workspaceName"] = wrkspacename;
		if (option == "New Workspace") {
			url = "workspace/new/"+modelId+"/"+vappId;
		}
		if (option == "Clone Workspace") {
			url = "workspace/clone/"+currentWorkspace;
		}
		if (url) {
			Util.ajaxPost(url,postdata,function(result){
				 if (result.Status === true) {
					 $(dlg).dialog("close");
					 if (result.Workspace) {
						// c.vapp.currentWorkspace = result.Workspace.id;
						 c.getModelWorkSpaces(function(){
							 c.switchWorkspace(result.Workspace.id);
						 });
					 }
				 } else {
					 Util.showMessage(result.Message);
				 }
			 },false,true);
		}
	};

	controller.handleWorkSpaceCreation = function(option) {
		var c = this, vapp = c.vapp;
		if (vapp.isChanged) {
			Util.promptDialog("Do You want save the changes",function(){
				c.saveWorkspace();
				c.createWorkspace(option);
				},function(){
					c.createWorkspace(option);
				});
		} else {
			c.createWorkspace(option);
		}
	};

	controller.createWorkspace = function(option) {
		var c = this;
		var dlg = $("<div></div>").dialog({
			width : 400,
			height: 200,
			title : option,
			create : function(event,ui) {
				var markup = '<table style="width: 100%;"><tbody><tr>\
					<td>Workspace Name</td>\
					<td><input type="text" name="wrkspacename" style="width: 100%;"></td>\
					</table></tbody></tr>';
				$(this).append(markup);
			},
			close : function(event,ui) {
				$(this).dialog("destroy");
			},
			buttons : {
				"Save" : function() {
					var wrkspace = $('input[name="wrkspacename"]');
					var wrkspacename = $(wrkspace).val();
					$(wrkspace).removeClass("vdvc-error");
					if (wrkspacename && wrkspacename.trim() != ""){
						c.cloneOrcreateWorkspace(wrkspacename,dlg,option);
					} else {
						$(wrkspace).addClass("vdvc-error");
					}
				},
				"Cancel" : function() {
					$(this).dialog("close");
				}
			}
		});
	};


	controller.saveWorkspace = function() {
		var c = this,vapp = c.vapp,currentWorkspace = vapp.currentWorkspace,vappId = vapp.vappId;
		var url = "workspace/save/"+vappId+"/"+currentWorkspace;
		if (vapp.isChanged) {
			Util.ajaxSyncPost(url,null,function(result){
				if(result.Status) {
					vapp.isChanged = false;
					Util.showMessage("Changes are saved");
				}else {
					Util.showMessage(result.Message);
				}
			},false,true);
		}
	};

	controller.createVapp=function(vapp){
		var c = this,appData = vapp.getVappData();
		var XfilterObj=vapp.getCrossFilterObj();
		setVappInfo(vapp);
		c.createScreen(vapp,XfilterObj,appData);
		c.renderScreen();
	};

	controller.submitVapp=function(vapp){
		var appId=vapp.getVappId();
		var wrkSpaceId=vapp.getWorkspaceId();
		Util.ajaxPost("vapp/submit/input/"+appId+"/"+wrkSpaceId,null,function(result){
			 if (result.Status === true) {
				 Util.showMessage("Message has been sent to the Analyst");
			 }
		 },false,true);
	};

	controller.submitApproval=function(vapp){
		var appId= vapp.getVappId();
		Util.ajaxPost("vapp/submit/approval/"+appId,null,function(result){
			 if (result.Status) {
				 Util.showMessage("Submitted to CEO for Approval");
			 } else {
				 Util.showMessage(result.Message);
			 }
		 },false,true);
	};
	controller.getAssembledData=function(vapp){
		$.when(
				Util.diff_ajaxGet(url,function(result){
					if(result.Status){
						vapp.setVappData(result.Data);
						vapp.setCrossFilterObj(result.Data);
					}else{
						Util.showMessage(result.Message);
					}
				})
		).then(function(){
			vAppController.createVapp(vapp);
		});
	};
	controller.assembleVapp=function(vapp){
		var appId=vapp.getVappId();
		Util.ajaxPost("vapp/assemble/"+appId,null,function(result){
			 if (result.Status) {
				 var wrkspaceId =result.Data;
				 if(wrkspaceId){
					 vapp.setWorkspaceId(wrkspaceId);
					 controller.getAssembledData(vapp);
					 controller.createVapp(vapp);
					 controller.submitApproval(vapp);
				 }
			 } else {
				 Util.showMessage(result.Message);
			 }
		 },false,true);
	};

	controller.approveVapp=function(vapp){
		var appId=vapp.getVappId();
		var wrkSpaceId=vapp.getWorkspaceId();
		Util.ajaxPost("vapp/approve/"+appId+"/"+wrkSpaceId,null,function(result){
			 if (result.Status === true) {
				 Util.showMessage("You have successfully approved the changes");

			 } else {
				 Util.showMessage(result.Message);
			 }
		},false,true);
	};
	controller.rejectVapp=function(vapp){
		var appId=vapp.getVappId();
		var wrkSpaceId=vapp.getWorkspaceId();
		Util.ajaxPost("vapp/reject/"+appId+"/"+wrkSpaceId,null,function(result){
			 if (result.Status === true) {
				 Util.showMessage("You have rejected the changes proposed by the Sales Leads. An email has been sent to the Analyst notifying the same");
			 } else {
				 Util.showMessage(result.Message);
			 }
		},false,true);
	};

	controller.closeVapp = function() {
		var c = this, vapp = c.vapp;
		if(vapp.isFromLocal){
			window.close();
		}else{
			var protocol=window.location.protocol;
			var host=window.location.host;
			var logout=protocol+"//" +host+"/logout.jsf";
			window.location.href=logout;
		}
	};

	controller.ExitVapp=function(){
		var c = this, vapp = c.vapp;
		if (vapp.isChanged) {
			Util.promptDialog("Do You want save the changes",function(){
				c.saveWorkspace();
				c.closeVapp();
				},function(){
					c.closeVapp();
				});
		} else {
			c.closeVapp();
		}



	};

	controller.previewChanges=function(vapp){
		var appId=vapp.getVappId();
		Util.ajaxGet("vapp/assemble/"+appId,function(result){
			if(result.Status){
				vapp.setVappData(result.Data);
				vapp.setCrossFilterObj(result.Data);
				$("#screens").empty();
				vAppController.createVapp(vapp);
			}else{
				Util.showMessage(result.Message);
			}
		},false,true);
	};

	controller.acceptChanges = function(vapp){
		var appId=vapp.getVappId();
		Util.ajaxPost("vapp/assemble/"+appId,null,function(result){
			 if (result.Status) {
				 var wrkspaceId =result.Data;
				 if(wrkspaceId){
					 vapp.setWorkspaceId(wrkspaceId);
					 controller.getAssembledData(vapp);
					 controller.createVapp(vapp);
				 }
			 } else {
				 Util.showMessage(result.Message);
			 }
		 },false,true);
	};

	controller.forwardChanges = function(vapp){
		 controller.submitApproval(vapp);
	};

	controller.showTags = function(btn){
		
		var bw = btn.outerWidth();
		var bh = btn.outerHeight();
		var pos = btn.position();
		var l = pos.left-350+bw;
		var h = $(window).innerHeight()-pos.top+bh-100;
		$(".tagList").css({"top":pos.top+bh+"px","left":l+"px","height":h+"px"});
		
		if (!$(".tagList").hasClass("active")) {
			$(".tagList").addClass("active");
			var tagManager = new vdvcTagManager();
			tagManager.el = $(".tagList");
			tagManager.render();
		}else {
			$(".tagList").removeClass("active");
		}
		
		$(".tagList").slideToggle("slow",function(){});
		
	};
	
	
	return controller;
})(vdvcAppController);

var item=0;
var vappId;
var modelId;
var workspaceId;
var ctrlId;

var isFromLocal=Util.getURLParameter("flag");
var paramKey = Util.getURLParameter("key");
if ( isFromLocal || paramKey == "" ) {
	vappId=Util.getURLParameter("vappId");
	modelId=Util.getURLParameter("modelId");
	workspaceId=Util.getURLParameter("scenarioId");
	ctrlId = Util.getURLParameter("ctrlId");
} else {
	Util.sync_ajaxGet("vapp/unobfuscate?key="+encodeURIComponent(paramKey),function(result){
		vappId=result.vappId;
		modelId=result.modelId;
		workspaceId=result.scenarioId;
	});
}

var url="workspace/"+modelId+"/"+vappId+"/"+workspaceId;
var vapp = new vAppModel(vappId,modelId,workspaceId,isFromLocal);
var websockUrl = window.location.host;
var index = websockUrl.indexOf(":");
if (index > 0) {
	websockUrl = websockUrl.substring(0, index);
}
var pathnaemArray=window.location.pathname.split( '/' );
//url = "ws://"+url+":8080/mb";
websockUrl = "ws://"+websockUrl+":"+window.location.port+"/" + pathnaemArray[1] + "/wschanges";
var ws = new WebSocket(websockUrl);
ws.onmessage = function (message) {
 alert(message.data);
};
ws.onopen = function() {
	// send workspace id here
};

vAppController.vapp = vapp;
var editedData={};



function addEditedData(cellId,data){
	if(editedData[cellId]){

		editedData[col+row]=rec;
	}else{
		changedInputs[col+row]=vdvcInputs.setFilteredInputs(inputs,measure,{"col":col,"row":row},newContent/100);
	}
}

function Calculate(){
	
	var postdata = [],
		vapp = vAppController.vapp,
		wrkSpcId = vapp.currentWorkspace || null ,
		vAppId = vapp.vappId || null,
		screen = vapp.getScreen();
	if (screen && screen.length > 0) {
		$.each(screen,function(i,scrn){
			var ctrls = scrn.controls;
			if (ctrls && ctrls.length > 0) {
				$.each(ctrls,function(j,ctrl){
					if (ctrl.controlType == "Layout") {
						if (!$.isEmptyObject(ctrl.editedCells)) {
							var o = ctrl.editedCells;
							postdata = postdata.concat(Object.keys(o).map(function(k) { return o[k]; }));
						}
					}
				});
			}
		});
	}
	
	//if (postdata.length > 0 && wrkSpcId &&  vAppId) {
	if (wrkSpcId &&  vAppId) {
		Util.ajaxPost("workspace/calculate/"+vAppId+"/"+wrkSpcId,postdata,function(result){
		    if(!result.Status){
				Util.showMessage(result.Message);
			}else{
				vapp.setVappData(result.Data);
				vapp.setCrossFilterObj(result.Data);
				//vAppController.createVapp(vapp);
				$.each(screen,function(i,scrn){
					scrn.setVappData(result.Data);
					scrn.resetControlCache();
					if (vAppController.cscrnIndex == scrn.index) {
						vAppController.mode = "run";
						scrn.render();
					}
				});
			}
		},false,true);
	} else {
		console.log("Either workspace id or vappId is null");
		//Util.showMessage("No edited cells to calculate");
	}
}


function executeAction(action){
	
	switch(action){
	case "calculate":
		Calculate();
		break;
	case "accept":
		vAppController.acceptChanges(vapp);
		break;
	case "reject":
		vAppController.rejectVapp(vapp);
		break;
	case "approve":
		vAppController.approveVapp(vapp);
		break;
	case "close":
		vAppController.ExitVapp();
		break;
	case "forward":
		vAppController.forwardChanges(vapp);
		break;
	case "inputcomplete":
		vAppController.submitVapp(vapp);
		break;
	case "preview":
		vAppController.previewChanges(vapp);
		break;
	case "accept_forward":
		vAppController.assembleVapp(vapp);
		break;
	case "prev":
		
		if (vAppController.cscrnIndex > 1) {
			vAppController.cscrnIndex = vAppController.cscrnIndex-1;
			vAppController.renderScreen();
		}else {
			Util.showMessage("No screens");
		}
		
		break;
	case "next":
		
		var screens = vAppController.vapp.getScreen();
		if (vAppController.cscrnIndex < screens.length) {
			vAppController.cscrnIndex = vAppController.cscrnIndex+1;
			vAppController.renderScreen();
		} else {
			Util.showMessage("No screens");
		}
		
		break;
	}
}

$(function(){
	
	$(document).click(function(e){
		var container = $(".tagList");
		if (!container.is(e.target) && container.has(e.target).length === 0) {
			if (container.hasClass("active")) {
				container.removeClass("active");
				container.slideToggle();
			} 	
		}
	});
	
	
	
	Util.showSpinner("manual");
	 $('[data-toggle="tooltip"]').tooltip();
	vAppController.getModelWorkSpaces();
	$(".vapp-menu span").on("click",function(event){
		var menuitems = $(this).siblings(".vapp-menu-items");
		if(menuitems.length > 0) {
			event.stopPropagation();
			var isActive = $(menuitems).hasClass("active");
			if (isActive) {
				$(menuitems).hide();
				$(menuitems).removeClass("active");
			}else{
				$(menuitems).show();
				$(menuitems).addClass("active");
			}
		}
	});

	$("body").on("click",function(event){
		$(this).find(".vapp-menu-items.active").hide();
		$(this).find(".vapp-menu-items.active").removeClass("active");
	});
	
	$.when(
			Util.diff_ajaxGet("vapp/"+vappId,function(result){
				if(result.Status){
					vapp.setVapp(result.Vapp);
				}else{
					vapp.setErrorMessage("vapp",result.Message);
					vapp.hasNoErrors = false;
				}
			}),
			Util.diff_ajaxGet(url,function(result){
				if(result.Status){
					vapp.setVappData(result.Data);
					vapp.setCrossFilterObj(result.Data);
				}else{
					vapp.setErrorMessage("workspace",result.Message);
					vapp.hasNoErrors = false;
				}
			}),
			Util.diff_ajaxGet("model/"+modelId,function(result){
				if(result.Status){
					vapp.setModel(result.Model);
				}else{
					Util.showMessage(result.Message);
				}
			}),
			Util.diff_ajaxGet("user/current",function(result){
				if(result.Status){
					vapp.setCurrentUser(result.UserName);
				}else{

				}
			}),
			Util.diff_ajaxGet("model/blockdimensions/"+modelId,function(result){
				
				if(result.Status){
					vapp.setBlockDef(result.Blocks);
				}else{
					vapp.setErrorMessage("blockdimensions",result.Message);
					vapp.hasNoErrors = false;
				}
			}),
			Util.diff_ajaxGet("vapp/permissions/"+vappId+"/"+workspaceId,function(result){
				if(result.Status){
					vapp.setDimPerms(result.Permissions);
				}else{
					vapp.setErrorMessage("permissions",result.Message);
					vapp.hasNoErrors = false;
				}
			}),
			/*Util.diff_ajaxGet ("vappgen/controls", function(result){
				if (result.Status) {
					vapp.setChartControls(result.Controls);
				} else {
					vapp.setErrorMessage("controls",result.Message);
					vapp.hasNoErrors = false;
				}
			}),*/
			Util.diff_ajaxGet ("vappgen/actions", function(result){
				if (!result.Status) {
					vapp.setErrorMessage("actions",result.Message);
					vapp.hasNoErrors = false;
				} else {
					vapp.btnActions = result.Data;
				}
			}),
			Util.diff_ajaxGet ("vappgen/controls", function(result){
				if (!result.Status) {
					vapp.setErrorMessage("controls",result.Message);
					vapp.hasNoErrors = false;
				} else {
					vapp.ctrlProps=result.Controls;
				}
			}),
			Util.diff_ajaxGet("vapp/gettext/"+modelId+"/"+vappId,function(result){
				
				if(result.Status){
					vapp.textCtrlData = result.WorkspaceText;
				}else{
					vapp.setErrorMessage("textCtrlData",result.Message);
					vapp.hasNoErrors = false;
				}
			}),
			Util.diff_ajaxGet("annotate/get/"+modelId+"/"+vappId+"/"+workspaceId,function(result){
				
				if(result.Status){
					vapp.annotations = result.Data;
				}else{
					vapp.setErrorMessage("annotation",result.Message);
					vapp.hasNoErrors = false;
				}
			}),
			Util.diff_ajaxGet("workspace/getscalars/"+workspaceId,function(scalardata){
				if(scalardata.Status){
					
					vapp.scalars = scalardata.WorkspaceText;
				}else{
					Util.showMessage(scalardata.Message);
				}
			})
	).then(function(){
		//Util.showSpinner()
		if(vapp.hasNoErrors) {
			
			vAppController.createVapp(vapp);
		}else {
			var pres = ["permissions", "blockdimensions", "vapp", "workspace","controls","userPrefs","actions","textCtrlData","annotation"];
			var message = "";
			$.each(pres, function(i, p) {
				var m = vapp.getErrorMessage(p);
				if (m) {
					message = m;
					return false;
				}
			});
			if (message.trim() != "") {
				Util.showMessage (message,function(){
					executeAction("close");
				});
			}
		}
		Util.hideSpinner("manual");
	});


	$(document).on("click","#inputComplete",function(e){
		 e.stopPropagation();
		 vAppController.submitVapp(vapp);
	 });

	$(document).on("click","#assemble",function(e){
		 e.stopPropagation();
		 vAppController.assembleVapp(vapp);
	 });

	$(document).on("click","#approve", function(e) {
		e.stopPropagation();
		controller.approveVapp(vapp);
	 });
	$(document).on("click","#reject", function(e) {
		e.stopPropagation();
		controller.rejectVapp(vapp);
	});

	$(document).on("click","#exitVapp", function(e) {
		e.stopPropagation();
		vAppController.ExitVapp();
	});

	$(document).on("click",".customButton", function(e) {

		e.stopPropagation();
		var action = $(this).attr("action");
		executeAction(action);

	});

	$(document).on("click","#preview", function(e) {
		e.stopPropagation();
		vAppController.previewChanges(vapp);
	});

	$(document).on("click","li[data-id='createWsps']", function(e) {
		e.stopPropagation();

		vAppController.handleWorkSpaceCreation("New Workspace");
	});

	$(document).on("click","li[data-id='cloneWsps']", function(e) {
		e.stopPropagation();
		vAppController.handleWorkSpaceCreation("Clone Workspace");
	});

	$(document).on("click","li[data-id='saveWsps']", function(e) {
		e.stopPropagation();
		vAppController.saveWorkspace();
	});

	$(document).on("click","li[data-id='compareWsps']", function(e) {
		e.stopPropagation();
		vAppController.compareWorkspace();
	});

	$(document).on("change","select[data-role='workspaceList']", function(e) {
		e.stopPropagation();
		var workspace = $(this).val();
		vAppController.handleWorkSpaceChange($(this),workspace);
	});

	$(document).on("click","#tag-items", function(e) {
		e.stopPropagation();
		vAppController.showTags($(this));
	});
	
	$(window).bind('beforeunload', function(event) {
		var c = vAppController;
		if(c.vapp.isChanged) {
			Util.promptDialog("Do You want save the changes",function(){
				c.saveWorkspace();
				},function(){

				},function(){

				});
			return "Do You want save the changes";
		}
	});

});


/*var layoutOnClick=function(element){

var input =$(element).find("input");
if(input && input.length > 0){
	return false;
}
var msr=$(element).data("msrObj");
 var dataFmtter = new VdVcDataFmtManager();
 var dataValidator = new VdVcDtaValidationMgr();
 var inpVal = $(element).text().trim();
 if (msr.dataType == "Percentage" && inpVal != "") {
	 inpVal += "%";
 }
 var dataObj = dataFmtter.handleDataFormat(inpVal, msr);
 var compound=$(element).data("root");
 var OriginalContent =  dataObj.unFmtData;
 $(element).html("<input type='text' style='width:100%;height:100%;' placeholder='"+msr.name+"'/>");
 if (dataObj.dataType == "Percentage" ) {
	 if ( !isNaN(parseFloat(dataObj.unFmtData))) {
		 dataObj.unFmtData = dataObj.unFmtData * 100;
		 OriginalContent = dataObj.unFmtData+"%";
	 }
 }
 $(element).children().first().focus();

 $(element).children().first().val(OriginalContent);
 $(element).children().first().setCursorPosition(1);

 $(element).children().first().keypress(function(e) {
	 e.stopPropagation();
 });
 $(element).children().first().keydown(function(e) {

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
			var parent = $(this).closest("td");
			$(this).val(parent.data("cellVal"));
			$(this).trigger("blur");
			parent.focus();

			break;
		case 8:
			e.stopPropagation();
			break;
		case 13:
		case 9:
			break;
		default:
			e.stopPropagation();
			break;
		}
 });
 $(element).children().first().blur(function() {
	 var isValid = dataValidator.validate($(this).val().trim(), msr);
	 if (!isValid) {
		Util.showMessage($(this).val().trim() +" is not Valid");
		$(this).val($(element).data("cellVal"));
	 }
	 dataObj = dataFmtter.handleDataFormat($(this).val().trim(), msr);
	 var newContent = dataObj.unFmtData;
	 compound[msr.name]=newContent;
	 var cell =  $(this).parent();
	 cell.removeClass("editing");
	 cell.data("measure", newContent);
	 if (dataObj.isNumber) {
		 cell.addClass("vdvc-number");
	 }else {
		 cell.removeClass("vdvc-text");
	 }
	 cell.text(dataObj.fmtData);
	 if( newContent !== null  && typeof newContent !== "undefined" ){
			$(element).addClass("edited");
			delete compound.children;
			Util.ajaxPost("workspace/change/"+vappId+"/"+workspaceId,[compound],function(result){
			    if(!result.Status){
				   Util.showMessage(result.Message);
				} else {
					cell.data("cellVal",newContent);
				}
			});
		}
});
};
*/

