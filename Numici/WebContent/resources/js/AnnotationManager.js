

var AnnotationManager=function(){
	var cell = null;
	var cellAnnotations=[];
	var c = this;
	this.cell = null;
	this.resourceId = null;
	this.type = "element";
	this.saveCallBack = false;
	this.comment = null;
	
	this.saveComment=function(){
		if(c.cell){
			var postdata = {};
			postdata["resourceType"] = c.type;
			postdata["resourceId"] = c.resourceId;
			postdata["cellKey"] = c.cell;
			postdata["note"] =c.comment;
			
			Util.ajaxPost("annotate/resource/save", postdata, function(result){
				$(dlg).dialog("close");
				if(result.Status){
					//Util.showMessage("Annotation saved successfully");
					if (typeof c.saveCallBack == "function") {
						c.saveCallBack();
					}
				}else{
					Util.showMessage("Saving Annotation failed");
				}
			});
		}		
	};
	
	this.getCellAnnotations=function(cb){
		if(c.cell) {
			var postdata = {};
			postdata["resourceType"] = c.type;
			postdata["resourceId"] = c.resourceId;
			postdata["cellKey"] = c.cell;
		
			var url="annotate/resource/get";
			Util.ajaxPost(url,postdata, function(result){
				if(result){
					cellAnnotations = result.Annotations;
					if (typeof cb == "function") {
						cb(cellAnnotations);
					}
				}
			});
		}
	};
	
	var dlg=$('<div class="annotateUi"></div>').dialog({
		autoOpen : false,
		resizable: false,
		width : 600,
		height : 400,
		modal:true,
		open : function(event, ui) {
			var cuser = Util.userinfo;
			var markup='<table style="width:100%;" class="table">';
			if(cellAnnotations.length > 0){
				$.each(cellAnnotations,function(i,v){
					markup +='<tr>\
						<td style="width: 25%;vertical-align:top;"><span>'+v.conversations[0].userName+'</span><br>\
						<span style="font-size: .65em;color: #9933FF;">'+new Date(v.conversations[0].annotatedOn).toLocaleString()+'</span><br>';
				/*	
					if (!$.isEmptyObject(cuser) && v.conversations[0].userId == cuser["UserId"]){
						
						markup +='<button class="btnn "  data-action="delete" title="Delete">\
							<span class="ui-icon ui-icon-trash"></span>\
							</button>\
							<button class="btnn"  data-action="edit" title="Edit">\
								<span class="ui-icon ui-icon-pencil"></span>\
							</button>';
					}*/
					
						
					markup +='</td>\
						<td style="width: 75%;"><div class="vdvc-note" >'+v.conversations[0].note+'</div></td>\
						</tr>';
				});
			}
			markup +='<tr>\
				<td style="width: 25%;vertical-align:top;">Comment :</td>\
				<td style="width: 75%;"><textarea name="comment" style="width:100%;" rows="3"></textarea></td>\
				</tr>\
				</table>';
			$(this).append(markup);
			
			c.addEvents($(this));
		},
		close:function(){
			$( this ).dialog( "destroy" );
		},
		buttons : {
			"Cancel" : function() {
				$(this).dialog("close");
			},
			"Save" : function() {
				
				var comment=$("textarea[name='comment']").val();
				if (comment.length == 0) {
					Util.showMessage("Please enter your comments");
					return;
				} else {
					c.comment = comment;
					c.saveComment();
				}
				
			}
		}
	});
	
	
	this.addEvents = function(dlg) {
		dlg.find("button[data-action]").off("click").on("click",function() {
			var action = $(this).attr("data-action");
			switch(action) {
			case "edit":
				dlg.find(".vdvc-note").prop("contenteditable",true);
				break;
			}
			//alert($(this).attr("data-action"));
		});
	};
	
	this.show = function(node){
		c.cell=node;
	 	c.getCellAnnotations(function(){
	 		$('.inputevents').trigger('change');
			$(dlg).dialog("open");
	 	});	
	};
	
	return this;
	
};