
var WorkFlowDashBoardControl = VidiViciControl.extend({
	constructor: function(){
		Control.apply(this,arguments);
		this.controlData = null;
		this.vappId = null;
		this.modelId = null;
		this.workspaceId = null;
		this.toggleWrkSpc = null;
		this.appName = null;
		this.controlType = "WorkFlowDashBoardControl";
		this.config = {};
		this.workSpaceGrps = {};
		this.checkBoxValues = {};
		this.role = null;
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
				current.setRole();
				current.generateUI(Status);
				//current.listCheckBoxes();
			});
		} else {
			current.generateUI(Status);
			//current.listCheckBoxes();
		}
	},

	setRole : function() {

		var current = this;
		var data = current.controlData;
		var loginUserInfo = Util.getUserInfo();
		if (data && loginUserInfo) {
			var loginUserId = loginUserInfo["UserId"].toLowerCase();
			var approverId =  data["approverId"].toLowerCase();
			var plannerId =  data["plannerId"].toLowerCase();
			if (loginUserId == approverId) {
				current.role = "Approver";
			} else if (loginUserId == plannerId) {
				current.role = "Planner";
			} else if (data["collaborators"] && data["collaborators"].length > 0) {
				$.each(data["collaborators"],function(i,collab){
					if (collab.toLowerCase() == loginUserId) {
						current.role = "Collaborator";
						current.index = i;
						return false;
					}
				});
			}
		}
	},

	compareWorkSpaces: function(event) {

		event.stopPropagation();
		var current = this;
		var el = current.renderContainer();
		var screen = current.getScreen();
		var appId = current.vappId;
		current.getGroupsFromConfig();
		var workspaceGroups = current.workSpaceGrps;
		if (!$.isEmptyObject(workspaceGroups)) {
			el.find(".errors").empty();
			Util.ajaxPost("workspace/compare/"+appId+"/"+current.workspaceId, workspaceGroups, function(result) {
				if (result.Status) {
					screen.setVappData(result.Data);
					screen.compare();
				} else {
					Util.showMessage(result.Message);
				}
			},false,true);
		} else {
			el.find(".errors").empty();
			el.find(".errors").append("Select Group");
		}
	},

	acceptCollaboratorInputs: function(e) {

		e.stopPropagation();

		var current = this;
		var el = current.renderContainer();
		var users = el.find("input[role='collab']:checked");
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
					if (result.Data && result.Data.length > 0) {
						var message = "Unable to accept inputs from ";
						$.each(result.Data, function(i, d) {
							message += d + ", ";
						});
						Util.showMessage(message.substr(0, message.length-2));
					} else {
						Util.showMessage(result.Message);
					}
				}
			},false,true);
		}
	},

	viewWorkspace : function(url,wids,action) {
		var current = this;
		var screen = current.getScreen();
		if (action == "get") {
			Util.ajaxGet(url,function(result) {
				if (result.Status) {
					screen.setVappData(result.Data);
					screen.render();
				} else {
					Util.showMessage(result.Message);
				}
			},false,true);
		}
		if (action == "post") {
			Util.ajaxPost(url, wids, function(result) {
				if (result.Status) {
					screen.setVappData(result.Data);
					screen.render();
				} else {
					Util.showMessage(result.Message);
				}
			},false,true);
		}
	},

	submitInputs : function(event) {
		event.stopPropagation();
		var current = this;
		var appId=current.vappId;
		var wrkSpaceId=current.workspaceId;
		Util.ajaxPost("vapp/submit/input/"+appId+"/"+wrkSpaceId,null,function(result){
			 if (result.Status === true) {
				 Util.showMessage("Message has been sent to the Analyst");
			 }else {
				 Util.showMessage(result.Message);
			 }
		 },false,true);
	},

	approveWorkSpace : function(event) {
		var current = this;
		var appId = current.vappId;
		var wrkSpaceId = current.workspaceId;
		Util.ajaxPost("vapp/approve/"+appId+"/"+wrkSpaceId,null,function(result){
			 if (result.Status === true) {
				 Util.showMessage("You have successfully approved the changes");

			 } else {
				 Util.showMessage(result.Message);
			 }
		},false,true);
	},

	rejectWorkSpace : function(event) {
		var current = this;
		var appId = current.vappId;
		var wrkSpaceId = current.workspaceId;
		Util.ajaxPost("vapp/reject/"+appId+"/"+wrkSpaceId,null,function(result){
			 if (result.Status === true) {
				 Util.showMessage("You have rejected the changes proposed by the Sales Leads. An email has been sent to the Analyst notifying the same");
			 } else {
				 Util.showMessage(result.Message);
			 }
		},false,true);
	},

	viewCollabAssembledInputs: function(event) {
		event.stopPropagation();
		var current = this;
		var el = current.renderContainer();
		var appId = current.vappId;
		var modelId = current.modelId;
		var myWorkspace = current.workspaceId;
		var wids = [];
		var users = el.find("input[role='collab']:checked");
		var planner = el.find("input[role='planner']:checked");
		var approver = el.find("input[role='approver']:checked");

		if (approver.length > 0) {
			if (current.role == "Approver") {
				var url = "workspace/"+modelId+"/"+appId+"/"+myWorkspace;
				current.viewWorkspace(url,wids,"get");
			}
		}

		if (planner.length > 0) {
			var baseWrkSpaceId = planner.attr("wid");
			if (current.role == "Collaborator" || current.role == "Approver") {
				var url = "workspace/"+modelId+"/"+appId+"/"+baseWrkSpaceId+"/using/"+myWorkspace;
				current.viewWorkspace(url,wids,"get");
			}
			if (current.role == "Planner" ) {
				var url = "vapp/preview/"+appId;
				current.viewWorkspace(url,[],"post");
			}
		} else if (users.length > 0) {
			$.each(users, function(i, v){
				wids.push($(v).attr("wid"));
			});

			if (current.role == "Planner") {
				var url = "vapp/preview/"+appId;
				current.viewWorkspace(url,wids,"post");
			}

			if ( current.role == "Approver" ) {
				var url = "workspace/"+modelId+"/"+appId+"/"+wids[0]+"/using/"+myWorkspace;
				current.viewWorkspace(url,[],"get");
			}

			if (current.role == "Collaborator") {
				var url = "workspace/"+modelId+"/"+appId+"/"+myWorkspace;
				current.viewWorkspace(url,wids,"get");
			}
		}
	},

	viewCollaboratorInput: function(event) {
		event.stopPropagation();


		var current = this;
		var screen = current.getScreen();
		var el = current.renderContainer();
		var mdlId = current.modelId;
		var appId = current.vappId;
		var wid = current.workspaceId;
		var collabSelected = el.find("input[role='collab']:checked");
		var userWid = collabSelected.attr("wid");

		if (collabSelected.length == 1 ) {
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
		} else {
			Util.showMessage("Please select the Collabrators");
		}
	},

	getGroupsFromConfig: function() {
		var current = this;
		var workSpaceGrps = current.workSpaceGrps={};
		var config = current.config;
		if (!$.isEmptyObject(config)) {
			$.each(config, function (wrkspaceId,group) {
				if ( workSpaceGrps[group] ) {
					 workSpaceGrps[group].push(wrkspaceId);
				} else {
					 workSpaceGrps[group] = [];
					 workSpaceGrps[group].push(wrkspaceId);
				}
			});
		}
	},



	addToConfig: function (checkbox) {
		var current = this;
		var el = current.renderContainer();
		var config = current.config;
		var wid = checkbox.attr("wid");
		var role = checkbox.attr("role");
		var group = el.find('select[wid="'+wid+'"]');
		if (group.val() !== "0") {
			if (role == "planner" ){
				if (current.role == "Collaborator"){
					config[wid]= "Published";
				} else {
					config[wid]= "Grp0";
				}
			} else  {
				config[wid]= group.val();
			}
		}
	},

	removeFromConfig: function (checkbox) {
		var current = this;
		var el = current.renderContainer();
		var config = current.config;
		var wid = checkbox.attr("wid");
		delete config[wid];
		el.find('select[wid="'+wid+'"]').val("0");

	},

	handelGroupChange : function (event,group) {
		event.stopPropagation();
		var current = this;
		var el = current.renderContainer();
		var wid = group.attr("wid");
		var chkbox = el.find('input[wid="'+wid+'"]');
		var isChecked = chkbox.is(":checked");
		if ( isChecked ) {
			current.addToConfig(chkbox);
		}
	},

	handleChange: function(event,checkbox){

		event.stopPropagation();
		var current = this;
		var el = current.renderContainer();
		var isChecked = checkbox.is( ":checked" );
		var role = checkbox.attr("role");

		switch(role) {
		case "all":
			if (isChecked) {
				el.find('input[role="collab"]').prop("checked",true);
				el.find('input[role="collab"]').trigger("change");
			} else {
				el.find('input[role="collab"]').prop("checked",false);
				el.find('input[role="collab"]').trigger("change");
			}
			break;
		case "collab":
			if(isChecked){
				current.addToConfig(checkbox);
			} else {
				current.removeFromConfig(checkbox);
			}
			var collabChkBoxes = el.find('input[role="collab"]');
			$.each(collabChkBoxes,function (i,v) {
				if( !$(v).is( ":checked" ) ) {
					el.find('input[role="all"]').prop("checked",false);
					return false;
				} else if (i == collabChkBoxes.length-1) {
					el.find('input[role="all"]').prop("checked",true);
				}
			});
			break;
		case "planner":
			if(isChecked){
				current.addToConfig(checkbox);
			} else {
				current.removeFromConfig(checkbox);
			}
			break;
		}
		current.enableOrDisableBtns();
	},



	bindEvents : function() {
		var current = this;
		//var appId = current.vappId;
		var el = current.renderContainer();
		var parent ="#"+el.attr("id");

		$(document).off("click", parent+" .accept").on("click", parent+" .accept", function(event) {
			current.acceptCollaboratorInputs(event);
		});

		$(document).off("click",parent+" .Compare").on("click",parent+" .Compare", function(event) {
			current.compareWorkSpaces(event);
		});

		$(document).off("click", parent+" .view").on("click", parent+" .view", function(event) {
			//current.viewCollaboratorInput(e);
			current.viewCollabAssembledInputs(event);
		});

		$(document).off("click", parent+" .submitInputs").on("click", parent+" .submitInputs", function(event) {
			current.submitInputs(event);
		});

		$(document).off("click", parent+" .approveInputs").on("click", parent+" .approveInputs", function(event) {
			current.approveWorkSpace(event);
		});

		$(document).off("click", parent+" .rejectInputs").on("click", parent+" .rejectInputs", function(event) {
			current.rejectWorkSpace(event);
		});

		$(document).off("change", parent+" input").on("change", parent+" input", function(event) {
			current.handleChange(event,$(this));
		});

		$(document).off("change", parent+" select").on("change", parent+" select", function(event) {
			current.handelGroupChange(event,$(this));
		});

	},

	listCheckBoxes: function() {
		var current = this;
		var el = current.renderContainer();
		var chkboxes = el.find("input[role]");

		if (chkboxes.length > 0 ) {
			$.each(chkboxes,function(i,chkbox) {
				var role = $(chkbox).attr("role");
				var wid = $(chkbox).attr("wid");
				var isChecked = false;

				if (current.checkBoxValues[role]){
					if (role == 'all'){
						isChecked = current.checkBoxValues[role].isChecked;
					} else {
						var t = current.checkBoxValues[role];
						isChecked = t[wid];
					}
				}

				$(chkbox).prop('checked', isChecked);
				if (isChecked){
					var row = $(chkbox).closest("td").closest("tr");
					if (row.length)
						$(row).attr("bgcolor", "Pink");
				}
			});
		}

		el.find(".accept").prop('disabled', false);
		el.find(".view").prop('disabled', false);
		el.find(".Compare").prop('disabled', false);
		//el.find(".submitInputs").prop('disabled', false);
		//el.find(".rejectInputs").prop('disabled', false);
		//el.find(".approveInputs").prop('disabled', false);
	},

	enableOrDisableBtns : function() {
		var current = this;
		var el = current.renderContainer();
		var isPlanner = false;
		var isCollab = false;
		var isApprover = false;
		var enableView = false;
		var WrkSpacesSelected = 0;
		var chkboxes = el.find("input[role]");
		el.find(".accept").attr("disabled","disabled");
		el.find(".view").attr("disabled","disabled");
		el.find(".Compare").attr("disabled","disabled");
		//el.find(".submitInputs").attr('disabled', "disabled");
		//el.find(".rejectInputs").attr('disabled', "disabled");
		//el.find(".approveInputs").attr('disabled', "disabled");
		if (chkboxes.length > 0 ) {
			$.each(chkboxes,function(i,chkbox) {
				var role = $(chkbox).attr("role");
				var wid = $(chkbox).attr("wid");
				var isChecked = $(chkbox).is(":checked");

				var obj = {};
				obj.isChecked = isChecked;

				if (role != 'all'){
					if (!current.checkBoxValues[role])
						current.checkBoxValues[role]={};

					var t = current.checkBoxValues[role];
					t[wid] = isChecked;
				}else {
					current.checkBoxValues[role]=obj;
				}

				var row = $(chkbox).closest("td").closest("tr");
				if ( isChecked ) {
					if (row.length)
						$(row).attr("bgcolor", "Pink");
					if (role == "planner") {
						isPlanner = true;
						WrkSpacesSelected++;
					}
					if (role == "collab" ) {
						isCollab = true;
						WrkSpacesSelected++;
					}
					if (role == "approver" ) {
						isApprover = true;
						WrkSpacesSelected++;
					}
				} else {
					if (row.length)
						$(row).attr("bgcolor", "LightBlue");
				}
			});

		}

		if (current.role == "Approver"){
			if ( WrkSpacesSelected == 1) {
				el.find(".view").removeAttr("disabled");
			}
		} else if ((isPlanner || isCollab) && (!(isPlanner && isCollab))) {
			el.find(".view").removeAttr("disabled");
		}
		if (isPlanner && isCollab) {
			el.find(".Compare").removeAttr("disabled");
		}
		if (isCollab && !isPlanner) {
			el.find(".accept").removeAttr("disabled");
			//el.find(".submitInputs").removeAttr('disabled');
			//el.find(".rejectInputs").removeAttr('disabled');
			//el.find(".approveInputs").removeAttr('disabled');
		}
	},

	getDashboardActions : function() {
		var markup = "";
		var current = this;
		if ( current.role ) {
			markup += '<button class="view btn btn-primary btn-xs" disabled> View </button>\
				<button class="Compare btn btn-primary btn-xs" disabled>Compare</button>';
			 switch( current.role ){
			 	case "Planner":
					markup += '<button class="accept btn btn-primary btn-xs" style="margin-left: 2px;" disabled> Accept </button>';
					break;
				case "Collaborator":
					markup += '<button class="submitInputs btn btn-primary btn-xs" style="margin-left: 2px;"> Submit </button>';
					break;
				case "Approver":
					markup += '<button class="approveInputs btn btn-primary btn-xs" style="margin-left: 2px;" > Approve </button>\
						<button class="rejectInputs btn btn-primary btn-xs" style="margin-left: 2px;" >Reject</button>';
					break;
			 }
			 markup += '<span class="errors" style="color:red;"></span>';
		}
		return markup;
	},

	getDashboardInfo : function() {
		var current = this;
		var markup = "";
		if ( current.role ) {
			markup += '<table class="table table-condensed"><tbody>';
			 switch( current.role ){
			 	case "Planner":
					markup += '<tr>\
								<td>Approver</td>\
								<td>'+current.controlData.approverId+'</td>\
							   </tr>\
							   <tr>\
								<td>Status</td>\
								<td>'+current.controlData.status+'</td>\
							   </tr>';
					break;
				case "Collaborator":
					markup += '<tr>\
								<td>Approver</td>\
								<td>'+current.controlData.approverId+'</td>\
							   </tr>\
							   <tr>\
								<td>Planner</td>\
								<td>'+current.controlData.plannerId+'</td>\
							   </tr>';
					break;
				case "Approver":
					markup += '<tr>\
							     <td>Planner</td>\
								 <td>'+current.controlData.plannerId+'</td>\
							   </tr>\
							   <tr>\
								<td>Status</td>\
								<td>'+current.controlData.status+'</td>\
							   </tr>';
					break;
			 }
			 markup += '</tbody></table>';
		}
		return markup;
	},

	createCtrlLayout : function () {
		var current = this;
		var el = current.renderContainer();
		el.css("overflow","hidden");
		var markup = '<div class="ctrl-wrapper grid-stack-item-content">\
						<div class="ctrl-toolbar">\
							<div class="ctrl-titlebar" >\
								<span class="ctrl-name">Dashboard</span>\
							</div>\
							<div class="ctrl-tools"></div>\
						</div>\
						<div class="ctrl-content" style="overflow: scroll;">\
							<div ui-role="info" ></div>\
							<div class="dashboard-actions" style="margin:3px;"></div>\
							<div class="collab-workspaces" style="overflow:auto;"></div>\
						</div>\
					</div>';

		el.find(".ctrl-wrapper").remove();
		el.append(markup);
		var info = current.getDashboardInfo();
		var actions = current.getDashboardActions();
		el.find(".dashboard-actions").append(actions);
		el.find("div[ui-role='info']").append(info);
		var height = el.outerHeight();
		el.find(".ctrl-content").height(height);
		current.bindEvents();
	},

	setSelections : function() {

		var current = this;
		var el = current.renderContainer();
		var config = current.config;
		if (!$.isEmptyObject(config)) {
			$.each(config,function(key,val){
				el.find('input[wid="'+key+'"]').prop("checked",true).trigger("change");
				el.find('select[wid="'+key+'"]').val(val).trigger("change");
			});
		}
	},


	plannerDashboard : function() {
		var current = this;
		var baseWrkspaceId = current.workspaceId;
		var collaborators = current.controlData.collaborators;
		var wids = current.controlData.collaboratorWorkspaceIds;
		var colbrtrSts = current.controlData.collaboratorsStatus;
		var markup = '';
		markup +='<div class="content">\
			<table class="table table-condensed" border="0" style="width:100%;font-size:0.8em;margin-bottom:5px;">\
				<tbody>\
					<tr>\
						<td style="width: 30px;"><input type="checkbox" wid="'+baseWrkspaceId+'" role="planner"></td>\
						<td colspan="2">My Workspace('+baseWrkspaceId+')</td>\
						<td >Group-0</td>\
					</tr>\
				</tbody>\
			</table>\
			<table class="table table-condensed" border="0" style="width:100%;font-size:0.8em;">\
				<thead>\
					<tr>\
						<th><input type="checkbox" role="all"></th>\
						<th>Collabrator</th>\
						<th>Status</th>\
						<th>Group</th>\
					</tr>\
				</thead>\
				<tbody>';
		for (var i = 0 ; i < collaborators.length;i++ ) {
			markup += '<tr>\
						<td style="width: 30px;"><input type="checkbox" role="collab" wid="'+wids[i]+'"></td>\
						<td>'+collaborators[i]+' ('+wids[i]+')</td>\
						<td>'+colbrtrSts[i]+'</td>\
						<td>\
							<select wid="'+wids[i]+'">\
								<option value="Grp1">Group-1</option>\
								<option value="Grp2">Group-2</option>\
							</select>\
						</td>\
					   </tr>';
		}
		markup += '</tbody></table></div>';
		return markup;
	},

	collaboratorDashboard : function() {
		var current = this;
		var myWorkspaceid = current.workspaceId;
		var publishedWsId = current.controlData.plannerWorkspaceId;
		var colbrtrSts = current.controlData.collaboratorsStatus;
		var index = current.index;
		var markup = '';
		markup +='<div class="content">\
			<table class="table table-condensed" border="0" style="width:100%;font-size:0.8em;margin-bottom:5px;">\
				<thead>\
					<tr>\
						<th>&nbsp;</th>\
						<th>&nbsp;</th>\
						<th>Status</th>\
						<th>&nbsp;</th>\
					</tr>\
				</thead>\
				<tbody>\
					<tr>\
						<td style="width: 30px;"><input type="checkbox" wid="'+publishedWsId+'" role="planner"></td>\
						<td>Published ('+publishedWsId+')</td>\
						<td >&nbsp;</td>\
						<td >&nbsp;</td>\
					</tr>\
					<tr>\
					<td style="width: 30px;"><input type="checkbox" role="collab" wid="'+myWorkspaceid+'"></td>\
					<td>My WorkSpace ('+myWorkspaceid+')</td>\
					<td>'+colbrtrSts[index]+'</td>\
					<td>\
						<select wid="'+myWorkspaceid+'" style="display:none;">\
							<option value="MyWorkspace">MyWorkspace</option>\
						</select>\
					</td>\
			   </tr>\
				</tbody>\
			</table></div>';

		return markup;
	},

	approverDashboard : function() {
		var current = this;
		var myWorkSpace = current.workspaceId;
		var baseWrkspaceId = current.controlData.plannerWorkspaceId;
		var collaborators = current.controlData.collaborators;
		var wids = current.controlData.collaboratorWorkspaceIds;
		var colbrtrSts = current.controlData.collaboratorsStatus;
		var markup = '';
		markup +='<div class="content">\
			<table class="table table-condensed" border="0" style="width:100%;font-size:0.8em;margin-bottom:5px;">\
				<tbody>\
					<tr>\
						<td style="width: 30px;"><input type="checkbox" wid="'+myWorkSpace+'" role="approver"></td>\
						<td colspan="2">My Workspace('+myWorkSpace+')</td>\
						<td ></td>\
					</tr>\
					<tr>\
						<td style="width: 30px;"><input type="checkbox" wid="'+baseWrkspaceId+'" role="planner"></td>\
						<td colspan="2">Published('+baseWrkspaceId+')</td>\
						<td >Group-0</td>\
				</tr>\
				</tbody>\
			</table>\
			<table class="table table-condensed" border="0" style="width:100%;font-size:0.8em;">\
				<thead>\
					<tr>\
						<th><input type="checkbox" role="all"></th>\
						<th>Collabrator</th>\
						<th>Status</th>\
						<th>Group</th>\
					</tr>\
				</thead>\
				<tbody>';
		for (var i = 0 ; i < collaborators.length;i++ ) {
			markup += '<tr>\
						<td style="width: 30px;"><input type="checkbox" role="collab" wid="'+wids[i]+'"></td>\
						<td>'+collaborators[i]+' ('+wids[i]+')</td>\
						<td>'+colbrtrSts[i]+'</td>\
						<td>\
							<select wid="'+wids[i]+'">\
								<option value="Grp1">Group-1</option>\
								<option value="Grp2">Group-2</option>\
							</select>\
						</td>\
					   </tr>';
		}
		markup += '</tbody></table></div>';
		return markup;
	},

	generateUI : function(Status) {

		var current = this;
		current.createCtrlLayout();
		var el = current.renderContainer();
		var markup = '';
		if ( Status && current.role) {
			switch(current.role){
			case "Planner":
				markup += current.plannerDashboard();
				break;
			case "Collaborator":
				markup += current.collaboratorDashboard();
				break;
			case "Approver":
				markup += current.approverDashboard();
				break;
			}
		} else {
			markup +='<div class="errorMsg" style="color:red;font-size:0.8em;">Vapp Not yet Published</div></div>';
		}

		el.find(".collab-workspaces").append(markup);
		current.setSelections();
	},

	render : function () {

		var current = this;
		var el = current.renderContainer();
		el.addClass("vapp-control");

		// Added fix to an issue(83982780). However, it should add in the constructor.
	//	this.attributes.background = "LightBlue";

		/*$.each(this.attributes, function(key, val) {
			switch(key) {
			case "float":
			case "position":
		//	case "background":
				el.css(key,val);
				break;

			default:
				el.css(key,val+"%");
				break;
			}
		});*/

		Control.prototype.renderLayout.call(this);
		
		current.getControlData();
	}
});
