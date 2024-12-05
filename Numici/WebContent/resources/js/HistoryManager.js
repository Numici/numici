

var HistoryManager = function(){
	var cell=null;
	var cellHistory=[];
	var c = this;
	
	var getCellHistory=function(cell,workspaceId){
		var url="workspace/history/element/"+cell+"/"+workspaceId;
		Util.ajaxGet(url, function(result){
			if (result.Status) {
				cellHistory = result.Data;
				$(dlg).dialog("open");
			}else {
				Util.showMessage(result.Message);
			}
		},false,true);
	};
	
	var dlg=$('<div class="vdvcCellHistoryUi"></div>').dialog({
		autoOpen : false,
		resizable: false,
		title: "Cell History",
		width : 600,
		height : 400,
		modal:true,
		open : function(event, ui) {
			var markup='<table style="width:100%;" class="table">';
			if(cellHistory.length > 0){
				$.each(cellHistory,function(i,v){
					markup +='<tr>\
						<td style="width: 25%;vertical-align:top;"><span>'+v.eventUserId+'</span><br>\
						<span style="font-size: 0.75em;color: #9933FF;">'+new Date(v.eventDateTime).toLocaleString()+'</span></td>\
						<td style="width: 75%;">'+v.message+'</td>\
						</tr>';
				});
			}
		
			markup +='</table>';
			$(this).append(markup);
		},
		close:function(){
			$( this ).dialog( "destroy" );
		},
		buttons : {
			"Cancel" : function() {
				$(this).dialog("close");
			}
		}
	});
	
	this.show=function(node,workspaceId){
		cell=node;
		getCellHistory(cell,workspaceId);	
	};
	
	return this;
	
};