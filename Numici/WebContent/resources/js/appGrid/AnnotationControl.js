

var AnnotationControl = VidiViciControl.extend({
	constructor : function(options){
		VidiViciControl.apply(this,arguments);
		this.controlType = "AnnotationControl";
	},
	
	
	renderLayout : function() {
		var c = this;
		var el = c.renderContainer();
		el.addClass("vapp-control");
		
		el = Control.prototype.renderLayout.call(this);
		
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
		
		return el;
	},
	
	
	getLayout : function(markup){

		var c = this;
		var el = c.el;
		
		var id = el.attr("id");
		var parent = "#"+id;
		
		var attributes = c.attributes;
		$(el).find(".ctrl-wrapper").remove();

		var ctrlMarkup = '<div class="ctrl-wrapper grid-stack-item-content">\
							<div class="ctrl-toolbar">\
								 <div class="ctrl-titlebar"  style="width:50%;float:left;">\
								  <span class="ctrl-name"></span>\
								 </div>\
								<div class="ctrl-tools"  style="width:40%;float:right;">\
								  <span class="fa fa-tag" style="margin:2px;float:right;" title="Tag"></span>\
								</div>\
							</div>\
							<div class="ctrl-content" style="overflow:auto;">'+markup+'</div>\
					  </div>';
		$(el).append(ctrlMarkup);
		$(el).find(".ctrl-name").append(c.name);
		var controlHeight = $(el).height();
		var contentHeight = controlHeight-($(el).find(".ctrl-title").height()+$(el).find(".ctrl-toolbar").height());
		$(el).find(".ctrl-content").height(contentHeight);
		$(el).find("div[data-id='accordion']").accordion({
			  collapsible: true,
			  active: false
		});
		c.addEvents(parent);
	},

	renderUi : function() {
		var c = this,
			el = c.el;
		var markup = "";
		if(window.vAppController) {
			var annts=null;
			if(vAppController.vapp) {
				annts = vAppController.vapp.annotations;
			}
			markup = '<div data-id="accordion">';
			
			
			for (var i=0; annts && i < annts.length; i++) {
				var a = annts[i];
				for (var l=0; a.List && l<a.List.length; l++) {
					var node = a.List[l];
				//	markup += '<h3> Node Id: '+node.NodeId+'</h3>';
				//	markup += '<h3>'+ node.Annotations[0].conversations[0].note +'</h3>';
					markup += '<h3>\
						<span>'+node.Annotations[0].conversations[0].userName + ': </span>\
						 <span style="font-size: .65em;color: #9933FF;">'
						 +new Date(node.Annotations[0].conversations[0].annotatedOn).toLocaleString()+'</span>'+ 
						 '<span style="  text-overflow: ellipsis;width: 100%;overflow: hidden;display: inline-block;">'+
						node.Annotations[0].conversations[0].note+'</span></h3>';
					markup += '<div style="padding: 0px !important;">';
					markup += '<table border="1" style="width:100%">';					
					
					for (var j=0; node.Annotations && j < node.Annotations.length; j++) {
						var conversations = node.Annotations[j].conversations;
						for (var k=0; conversations && k<conversations.length; k++) {
							var c = conversations[k];
							
							markup += '<tr>';							 
							markup += '<td style="width:100%;padding: 0.5em;">\
								<div style="font-size: .65em;color: #9933FF;">'+new Date(c.annotatedOn).toLocaleString()+'</div>';
							markup += '<div >'+c.userName + ': </div>';
							markup += '<div>'+ c.note +'</div></td>'
							markup += '</tr>';
						}
					}
					markup += '</table>';	
					markup += '</div>';
				}
				
			}
			
			 
			markup += '</div>';
			
		//	$(el).find(".ctrl-content").html(markup);
		}
		
		return markup;
	},
	
	render : function () {
		var c = this;
		c.renderLayout();		
		var markup = c.renderUi();
		c.getLayout(markup);
	}
});