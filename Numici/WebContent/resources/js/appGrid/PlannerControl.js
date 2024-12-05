
var PlannerControl = VidiViciControl.extend({
	constructor: function(){
		Control.apply(this,arguments);
		this.controlData = null;
		this.vappId = null;
		this.modelId = null;
		this.workspaceId = null;
		this.toggleWrkSpc = null;
		this.appName = null;
	},
	getControlData: function() {
		var current = this;
		var Status = false;
		var appId = current.vappId;
		if (appId) {
			var url = "vapp/status/"+appId;
			$.when(
					Util.diff_ajaxGet(url,function(result){
						Status =  result.Status;
						if ( result.Status ) {
							current.controlData = result.Data;
						} else {
							//Util.showMessage(result.Message);
						}
					})
			).then(function(){
				current.generateUI(Status);
			});
		} else {
			current.generateUI(Status);
		}
	},
	
	acceptCollaboratorInputs: function(e) {
		e.stopPropagation();
		var current = this;
		var el = current.renderContainer();
		var users = el.find("tr.collabSelected");
		var appId = current.vappId;
		if (users.length > 0) {
			var wids = [];
			$.each(users, function(i, v){
				wids.push($(v).attr("wid"));
			});
			
			Util.ajaxPost("vapp/accept/inputs/"+appId, wids, function(result) {
				if (result.Status) {
					current.getControlData();
					Util.showMessage("Temporary message: Inputs have been accepted!");
				} else {
					Util.showMesaage(result.Message);
				}
			});
		}
	},
	
	viewCollaboratorInput: function(e) {
		e.stopPropagation();
		var current = this;
		var screen = current.getScreen();
		var el = current.renderContainer();
		var mdlId = current.modelId;
		var appId = current.vappId;
		var wid = current.workspaceId;
		var collabSelected = el.find(".collabSelected");
		var userWid = collabSelected.attr("wid");
		
		if (mdlId && wid && userWid && vappId) {
			var url = "workspace/"+mdlId+"/"+appId+"/"+userWid+"/using/"+wid;
			Util.ajaxGet(url, function(result) {
				
				if (result.Status) {
					screen.setVappData(result.Data);
					screen.render();
					current.showSelectedCollab(result.CollaboratorId);
					current.toggleWrkSpc = function() {
						var el = current.renderContainer();
						el.find(".myWrkSps").show();
					};
				} else {
					Util.showMessage(result.Message);
				}
			},false,true);
		}
	},
	
	handleMouseDown: function(event){
		event.stopPropagation();
		var current = this;
		var el = current.renderContainer();
		var row = $(event.currentTarget).closest('tr');
		if (event.ctrlKey || event.metaKey) {
			event.preventDefault();			
			if ($(row).hasClass("collabSelected")) {
				$(row).removeClass("collabSelected");
			} else {
				$(row).addClass("collabSelected");
			}					
		} else {
			if ($(row).hasClass("collabSelected")) {
				$(row).removeClass("collabSelected");
			} else {
				el.find("tr.collabSelected").removeClass("collabSelected");
				$(row).addClass("collabSelected");
			}
		}	
		current.enableOrDisableBtns();
	},
	
	switch2MyWorkspace: function(event) {
		event.stopPropagation();	
		var current = this;
		var screen = current.getScreen();
		var mdlId = current.modelId;
		var appId = current.vappId;
		var wid = current.workspaceId;
		if (mdlId && wid && vappId) {
			var url = "workspace/"+mdlId+"/"+appId+"/"+wid;
			Util.ajaxGet(url, function(result) {
				if (result.Status) {
					$('div[data-holder="vApp_name"]').empty();
					$('div[data-holder="vApp_name"]').append(current.appName);
					screen.setVappData(result.Data);
					screen.render();
					current.toggleWrkSpc = null;
				} else {
					Util.showMessage(result.Message);
				}
			},false,true);
		}
	},
	
	bindEvents : function() {
		var current = this;
		//var appId = current.vappId;
		var el = current.renderContainer();
		var parent ="#"+el.attr("id");
		
		$(document).off("click", parent+" .accept").on("click", parent+" .accept", function(e) {
			current.acceptCollaboratorInputs(e);
		});
		
		$(document).off("click",parent+" .myWrkSps").on("click",parent+" .myWrkSps", function(event) {
			current.switch2MyWorkspace(event);
		});

		$(document).off("click", parent+" .view").on("click", parent+" .view", function(e) { 
			current.viewCollaboratorInput(e);
		});
		
		$(document).off("mousedown", parent+" tr").on("mousedown", parent+" tr", function(event) {
			current.handleMouseDown(event);
		});
		
	},
	
	showSelectedCollab: function(collabId) {
		var newName = this.appName+"("+collabId+")";
		$('div[data-holder="vApp_name"]').empty();
		$('div[data-holder="vApp_name"]').append(newName);
	},
	
	removeUI : function () {
		var current = this;
		var el = current.renderContainer();
		el.find(".menu").remove();
		el.find(".content").remove();
		el.find(".errorMsg").remove();
	},
	
	enableOrDisableBtns : function( ) {
		var current = this;
		var el = current.renderContainer();
		var users = el.find("tr.collabSelected");
		if (users.length == 0) {
			el.find(".accept").attr("disabled","disabled");
			el.find(".view").attr("disabled","disabled");
		} else if(users.length == 1) {
			el.find(".accept").removeAttr("disabled");
			el.find(".view").removeAttr("disabled");
		} else {
			el.find(".accept").removeAttr("disabled");
			el.find(".view").attr("disabled","disabled");
		}
	},
	
	generateUI : function(Status) {
		
		var current = this;
		var el = current.renderContainer();
		el.css("overflow","hidden");
		var markup = '<div class="ctrl-wrapper"><div class="menu">\
						<button class="accept btn btn-primary btn-xs" disabled> Accept </button>\
						<button class="view btn btn-primary btn-xs" disabled> View </button>\
						<button class="myWrkSps btn btn-primary btn-xs" style="display:none;"> My Workspace </button>\
					  </div>';
		if ( Status ) {
			if ( current.controlData ) {
				var collaborators = current.controlData.collaborators;
				var wids = current.controlData.collaboratorWorkspaceIds;
				var colbrtrSts = current.controlData.collaboratorsStatus;
				markup +='<div class="content" style="overflow:auto;">\
					<table class="table table-bordered table-condensed table-striped" style="width:100%;font-size:0.8em;"><tbody>';
				for (var i = 0 ; i < collaborators.length;i++ ) {
					markup += '<tr wid="'+wids[i]+'">\
								<td>'+collaborators[i]+'</td>\
								<td>'+colbrtrSts[i]+'</td>\
							   </tr>';
				}
				markup += '</tbody></table></div>';
			}
		} else {
			markup +='<div class="errorMsg" style="color:red;font-size:0.8em;">Vapp Not yet Published</div></div>';
		}
		el.find(".ctrl-wrapper").remove();
		el.append(markup);
		el.find("td").css({"white-space": "pre"});
		el.find("tr").css({"cursor": "pointer"});
		current.bindEvents();
		if (typeof current.toggleWrkSpc == "function") {
			current.toggleWrkSpc();
		}
	},
	
	render : function () {
		
		var current = this;
		var el = current.renderContainer();
		
		// Added fix to an issue(83982780). However, it should add in the constructor.
		this.attributes.background = "LightBlue";
		
		/*$.each(this.attributes, function(key, val) {
			switch(key) {
			case "background":
			case "float":
			case "position":
				el.css(key,val);
				break;
				
			default:
				el.css(key,val+"%");
				break;
			}
		});*/
		
		Control.prototype.renderLayout.call(this);
		
		current.removeUI();
		current.getControlData();
	}
});
