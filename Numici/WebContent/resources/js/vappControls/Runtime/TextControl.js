
var TextControl = VidiViciControl.extend({
	
	constructor : function(options){
		VidiViciControl.apply(this,arguments);
		var self = this;
		this.controlType = "TextControl";
		this.text = null;
		this.instance;
		this.isChanged = false;
		this.h = 0;
		this.editorId = _.uniqueId("vdvc-Txt-ctrl-");
		this.dataFmtter = new VdVcDataFmtManager();
		setInterval(function(){
			if(self.isChanged) {
	    		self.saveText();
	    	}
		}, 30000);
	},
	
	renderLayout : function() {
		var c = this;
		var el = c.renderContainer();
		el.addClass("vapp-control");
		el = Control.prototype.renderLayout.call(this);
		return el;
	},
	
	saveText : function() {
		var c = this,mdlId,vappId;
		
		if (c.mode == "design" && window.vappgenEngine) {
			
			mdlId = window.vappgenEngine.modelId;
			vappId = window.vappgenEngine.vappID;
			
		} else if(window.vAppController) {
			if(vAppController.vapp) {
				mdlId = vAppController.vapp.modelId;
				vappId = vAppController.vapp.vappId;
			}
		}
		
		if(c.text && typeof mdlId != "undefined" && vappId != "undefined") {
			var url = "vapp/savetext/"+mdlId+"/"+vappId+"/"+c.objectId ;
			var postdta = {};
			postdta["textValue"] = c.text;
			Util.ajaxPost(url,postdta,function(result){
				if(!result.Status) {
					Util.showMessage(result.Message);
				} else {
					c.isChanged = false;
					c.setText();
				}
			});
		}
	},
	
	
	
	updateControlPositions : function() {
		var c = this;
		
		var scrn = c.screen;
		if (typeof scrn != "undefined" && $.isArray(scrn.controls) ) {
			var eh = c.el.find(".vdvc-txt-editor").height();
			if (c.h < eh+20) {
				var hh = c.el.position().top +eh+20 ; 
				$.each(scrn.controls,function(i,ctrl){
					var top = ctrl.el.position().top;
					if(top >= hh) {
						var m = eh - c.h;
						var ctrlTop = ctrl.el.position().top;
						ctrl.el.css("top",(ctrlTop+m)+"px");
					}
				});
				
				c.h = c.el.height();
			}
		}
	},
	
	onDeleteControl : function(e) {
		var c = this,mdlId,vappId;
		
		/*if (c.mode == "design" && window.vappgenEngine) {
			
			mdlId = window.vappgenEngine.modelId;
			vappId = window.vappgenEngine.vappID;
			
		} else if(window.vAppController) {
			if(vAppController.vapp) {
				mdlId = vAppController.vapp.modelId;
				vappId = vAppController.vapp.vappId;
			}
		}
		
		if(c.text && typeof mdlId != "undefined" && vappId != "undefined") {
			var url = "vapp/savetext/"+mdlId+"/"+vappId+"/"+c.objectId ;
			var postdta = {};
			postdta["textValue"] = c.text;
			Util.ajaxPost(url,postdta,function(result){
				if(!result.Status) {
					Util.showMessage(result.Message);
				} else {
					c.isChanged = false;
					c.setText();
				}
			});
		}*/
	},
	
	addEvents : function() {
		var c = this,
			el = c.el;
		var id=el.attr("id");
		var parent="#"+id;
		Control.prototype.addEvents.call(this ,parent);
		
		$(el).off("remove").on("remove",function(e){
			e.stopPropagation();
			//c.onDeleteControl(e);
		});
		
		$(el).find(".ctrl-tools .fa-floppy-o").off("click").on("click",function(e){
			e.stopPropagation();
			if (c.isChanged) {
				c.saveText();
			}
			c.destroyEditor();
			$(el).find(".vdvc-txt-editor").attr("contenteditable",false);
		});
		
		
		$(el).find(".ctrl-tools .fa-pencil-square-o").off("click").on("click",function(e){
			e.stopPropagation();
			$(el).find(".vdvc-txt-editor").attr("contenteditable",true);
			c.initEditor();
			$(el).find(".vdvc-txt-editor").focus();
		});
		
		$(el).off("mouseover").on("mouseover",function(e){
			e.stopPropagation();
			var controlHeight = $(el).height();
			var contentHeight = controlHeight-$(el).find(".ctrl-toolbar").height();
			$(el).find(".ctrl-content").height(contentHeight);
			$(this).find(".ctrl-toolbar").show();
		});
		
		$(el).off("mouseleave").on("mouseleave",function(e){
			e.stopPropagation();
			var controlHeight = $(el).height();
			$(el).find(".ctrl-content").height(controlHeight);
			$(this).find(".ctrl-toolbar").hide();
		});
		
		$(el).find(".vdvc-txt-editor").off("blur").on("blur",function(e){
			e.stopPropagation();
			if (c.isChanged) {
				c.saveText();
			}
		});
		
		$(el).find(".vdvc-txt-editor").off("scroll").on("scroll",function(e){
			e.stopPropagation();
			c.scrlPos = $(this).position();
		});
		
		$(el).find(".vdvc-txt-editor").off("mousedown").on("mousedown",function(e){
			e.stopPropagation();
		});
	},
	
	getLayout : function(){
		var c = this;
		var el = c.el;
		var attributes = c.attributes;
		var editor = c.editorId;
		$(el).find(".ctrl-wrapper").remove();

		var ctrlMarkup = '<div class="ctrl-wrapper grid-stack-item-content">\
							<div style="height:20px;background:white;">\
								<div class="ctrl-toolbar" style="display:none;">\
									 <div class="ctrl-titlebar"  style="width:50%;float:left;">\
									  <span class="ctrl-name"></span>\
									 </div>\
									<div class="ctrl-tools"  style="width:40%;float:right;">\
									  <span class="fa fa-floppy-o" style="margin:2px;float:right;" ></span>\
									  <span class="fa fa-pencil-square-o" style="margin:2px;float:right;" ></span>\
			 						  <span class="fa fa-tag" style="margin:2px;float:right;" title="Tag"></span>\
									  <span class="fa fa-comments" style="margin:2px;float:right;" title="Comment"></span>\
									 </div>\
								</div>\
							</div>\
							<div class="ctrl-content" style="background:white;">\
								<div class="vdvc-txt-editor" id="'+editor+'" style="height:100%; overflow:auto;"></div>\
							</div>\
					  </div>';
		$(el).append(ctrlMarkup);
		$(el).find(".ctrl-name").append(c.name);
		var controlHeight = $(el).height();
		var contentHeight = controlHeight-$(el).find(".ctrl-toolbar").height();
		$(el).find(".ctrl-content").height(contentHeight);
		
		if (c.text) {
			$(el).find(".vdvc-txt-editor").append(c.text);
		}
	},
	
	getText : function() {
		var c = this;
		var textDta = null;
		if (c.mode == "design" && window["vdvcTextCtrlData"]) {
			textDta = window["vdvcTextCtrlData"];
		} else if(window.vAppController && vAppController.vapp) {
			var textDta = vAppController.vapp.textCtrlData;
		}
		
		if(textDta && $.isArray(textDta)) {
			$.each(textDta,function(i,v){
				
				// c.name needs to be removed
				
				if(c.objectId == v.controlId || c.name == v.controlId) {
					c.text = v.textValue;
				}
			});
		}
	},
	
	setText : function() {
		var c = this;
		var textDta = null;
		if (c.mode == "design" && window["vdvcTextCtrlData"]) {
			textDta = window["vdvcTextCtrlData"];
		} else if(window.vAppController && vAppController.vapp) {
			var textDta = vAppController.vapp.textCtrlData;
		}
		
		if(textDta && $.isArray(textDta)) {
			$.each(textDta,function(i,v){
				if(c.objectId == v.controlId) {
					v.textValue = c.text;
				}
			});
		}
	},
	
	destroyEditor : function() {
		var c = this;
		var editor = c.editorId;
		if(CKEDITOR.instances[editor]) {
			CKEDITOR.instances[editor].destroy();
		}
	},
	
	initEditor : function() {
		var c = this;
		var editor = c.editorId;
		var ImageUploadUrl = Util.contextUrl+"ImageUpload";
		
		
		CKEDITOR.plugins.addExternal( 'fakeobjects', '/resources/js/ckeditor/plugins/fakeobjects/', 'plugin.js' );
		CKEDITOR.plugins.addExternal( 'pagebreak', '/resources/js/ckeditor/plugins/pagebreak/', 'plugin.js' );
		CKEDITOR.plugins.addExternal( 'bootstrapVisibility', '/resources/js/ckeditor/plugins/bootstrapVisibility/', 'plugin.js' );
		CKEDITOR.plugins.addExternal( 'dialog', '/resources/js/ckeditor/plugins/dialog/', 'plugin.js' );
		CKEDITOR.plugins.addExternal( 'clipboard', '/resources/js/ckeditor/plugins/clipboard/', 'plugin.js' );
		CKEDITOR.plugins.addExternal( 'lineutils', '/resources/js/ckeditor/plugins/lineutils/', 'plugin.js' );
		CKEDITOR.plugins.addExternal( 'widget', '/resources/js/ckeditor/plugins/widget/', 'plugin.js' );
		CKEDITOR.plugins.addExternal( 'image2', '/resources/js/ckeditor/plugins/image2/', 'plugin.js' );
		CKEDITOR.plugins.addExternal( 'vdvcdatalink', '/resources/js/ckeditor/plugins/vdvcdatalink/', 'plugin.js' );
		
		CKEDITOR.disableAutoInline = true;
		c.instance = CKEDITOR.inline( editor,{
			//forcePasteAsPlainText : true,
			extraAllowedContent:"vcell[*]",
			skin : 'office2013,/resources/js/ckeditor/skins/office2013/' ,
			baseHref : Util.contextUrl,
			filebrowserImageUploadUrl:  "ImageUpload",
			extraPlugins : "dialog,clipboard,widget,lineutils,image2,bootstrapVisibility,fakeobjects,pagebreak,vdvcdatalink",
		});
		//c.instance = CKEDITOR.replace( editor);
		if (c.instance) {
			c.instance.on( 'change', function( evt ) {
			   c.text = evt.editor.getData();
			   c.isChanged = true;
			});
			
			c.instance.on( 'destroy', function( evt ) {
				 c.getWorkspaceCells();
			});
		}
	},
	
	render : function () {
		var c = this;
		c.getText();
		c.getLayout();
		c.addEvents();
		c.getWorkspaceCells();
		//c.initEditor();
		c.h = c.el.height();
	},
	
	
	
	
	
	getCellType : function(attr) {
		var type = "normal";
		$.each(attr,function(key,val){
			if(val == "*") {
				type = "aggregate";
			}
		});
		
		return type;
	},
	
	createCriteria : function(attr,cellType) {
		var c = this,criteria = null;
		criteria = {};
		if (cellType == "normal") {
			$.each(attr,function(key,val){
				
				if (key  == "blockname" || key == "msr") {
					criteria[key] = val;
				}else if (key !== "children") {
					criteria[attr.blockname+"."+key] = val;
				}
			});
		}
		if (cellType == "aggregate") {
			$.each(attr,function(key,val){
				
				if(key !== "blockname" && key != "msr" ){
					if(key === "children" && val && val.length > 0){
						$.each(val,function(ind,vals){
							$.each(vals,function(t,s){
								criteria[attr.blockname+"."+t]=s;
							});
						});
					}else{
						criteria[attr.blockname+"."+key]=val;
					}
				}else{
					criteria[key]=val;
				}
			});
		}
		return criteria;
	},
	
	
	getWorkspaceCells : function() {
		var c = this,el = c.el;
		var screen = c.getScreen();
		if(screen) {
			if($.isEmptyObject(c.dataSets)){
				c.dataSets = screen.getDataSet();
			}
			if($.isEmptyObject(c.aggDataSets)){
				c.aggDataSets = screen.getAggDataSet();
			}
		}
		var vcells = $(el).find("vcell , span.cke_placeholder");
		
		if (vcells) {
			$.each(vcells,function(i,cell){
				var attributes = {};
				var fmtInfo = {};
				$.each(cell.attributes, function(i, attrib){
				    if (attrib.name == "datatype") {
				    	fmtInfo["dataType"] = attrib.value;
				    } else if( attrib.name == "format"){
				    	fmtInfo["format"] = attrib.value;
				    }else{
				    	 attributes[attrib.name] = attrib.value;
				    }
				});
				
				if (!$.isEmptyObject(attributes)) { 
					var type = c.getCellType(attributes);
					var crit = c.createCriteria(attributes,type);
					var result = c.getCellVal(crit,type);
					if ($.isArray(result) && result.length > 0) {
						var val = result[0][crit["blockname"]+"."+crit["msr"]] || "";
						//$(cell).html('[[' + val + ']]');
						var dataObj = c.dataFmtter.handleDataFormat(val.trim(), fmtInfo);
						$(cell).html(dataObj.fmtData);
					}
				}
				
			});
		}
		
	},
	
	getCellVal : function(criteria,cellType) {

		var c = this, blockData = [];
		if (cellType == "normal" && !$.isEmptyObject(c.dataSets)) {
			blockData = c.dataSets[criteria.blockname];
		}
		
		if (cellType == "aggregate" && !$.isEmptyObject(c.aggDataSets)) {
			blockData = c.aggDataSets[criteria.blockname];
		}
		
		if ( blockData.length > 0) {
			$.each(criteria,function(key,val){
				var group=[];
				if (key !== "blockname" && key != "msr") {
					$.each(blockData, function(index, value) {
						
						$.each(value,function(k,v){
							if (key.toUpperCase() == k.toUpperCase()){
								if(value[k] == val){
									group.push(value);
								}
								return false;
							}
						});
						
					});
					blockData=group;
				}
			});
			return blockData;
		}else{
			return [];
		}
	}

	
});