

'use strict';

CKEDITOR.dialog.add( 'vdvcdatalink', function( editor ) {
	var lang = editor.lang.vdvcdatalink,
		generalLabel = editor.lang.common.generalTab,
		validNameRegex = /^[^\[\]<>]+$/;

	return {
		title: lang.title,
		minWidth: 300,
		minHeight: 80,
		onShow : function() {
			$(".cke_dialog_background_cover").width(0);
		},
		contents: [
			{
				id: 'info',
				label: generalLabel,
				title: generalLabel,
				elements: [
					// Dialog window UI elements.
					{
						id: 'drop',
						type: 'html',
						style: 'width: 100%;height:100%;',
						html:'<div style="height:300px;background:rgba(125, 148, 7, 0.2);" class="vdvc_drop"></div>',
						onLoad : function(widget) {
							
					    	var id = this.domId;
					    	$("#"+id).droppable({
					    	      activeClass: "ui-state-hover",
					    	      hoverClass: "ui-state-active",
					    	      drop: function( event, ui ) {
					    	    	  var obj = ui.draggable.data();
					    	    	  if (!$.isEmptyObject(obj)){
					    	    		var cell = {};
					    	    		  if (typeof obj.cellVal != "undefined") {
					    	    			  $( this ).html(obj.cellVal);
					    	    		  } else {
					    	    			  $(this).html(ui.draggable.text());
					    	    		  }
					    	    		  
					    	    		  if(!$.isEmptyObject(obj.root)) {
					    	    			  $.each(obj.root,function(key,val){
					    	    				  if (key == "children") {
					    	    					 if($.isArray(val)) {
					    	    						 $.each(val,function(i,v){
					    	    							 if(!$.isEmptyObject(v)) {
					    	    								 $.each(v,function(k,value){
					    	    									 $("#"+id).attr(k,value);
									    	    					  cell[k] = value;
					    	    								 });
					    	    							 }
					    	    						 });
					    	    					 }
					    	    				  } else {
					    	    					  $("#"+id).attr(key,val);
					    	    					  cell[key] = val;
					    	    				  }
					    	    			  });
					    	    		  }
					    	    		  
					    	    		  if(!$.isEmptyObject(obj.msrObj)) {
					    	    			  $.each(obj.msrObj,function(key,val){
					    	    				  if (key == "name") {
					    	    					  $("#"+id).attr("msr",val);
					    	    					  cell["msr"] = val;
					    	    				  } else if (key == "dataType" || key == "format") {
					    	    					  cell[key] = val;
					    	    					  cell[key] = val;
					    	    				  }
					    	    				  
					    	    			  });
					    	    		  }
					    	    		  
					    	    		  $("#"+id).data("cell",cell);
					    	    	  }
					    	      }
					       });
						},
					    setup : function(widget) {
					    	var id = this.domId;
					    	if (widget.data.cell) {
					    		delete widget.data.cell["class"];
					    	}
					    	$("#"+id).data("cell",widget.data.cell)
					    	$("#"+id).text(widget.data.value);
					    	
					    },
						commit: function( widget ) {
							 
							var id = this.domId;
					    	var cell = $("#"+id).data("cell");
					    	if (cell) {
					    		delete cell["class"];
					    	}
							widget.setData( 'cell', cell );
							widget.setData( 'value', $("#"+id).text());
							
						}
					}
				]
			}
		]
	};
} );
