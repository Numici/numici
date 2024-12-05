/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview The "placeholder" plugin.
 *
 */

'use strict';

( function() {
	CKEDITOR.plugins.add( 'vdvcdatalink', {
		requires: 'widget,dialog',
		lang: 'af,ar,bg,ca,cs,cy,da,de,el,en,en-gb,eo,es,et,eu,fa,fi,fr,fr-ca,gl,he,hr,hu,id,it,ja,km,ko,ku,lv,nb,nl,no,pl,pt,pt-br,ru,si,sk,sl,sq,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		icons: 'vdvcdatalink', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		onLoad: function() {
			// Register styles for placeholder widget frame.
			CKEDITOR.addCss( '.cke_placeholder{background-color:#ff0}' );
		},

		init: function( editor ) {

			var lang = editor.lang.vdvcdatalink;

			// Register dialog.
			CKEDITOR.dialog.add( 'vdvcdatalink', this.path + 'dialogs/vdvcdatalink.js' );
			
			
			// Put ur init code here.
			editor.widgets.add( 'vdvcdatalink', {
				// Widget code.
				dialog: 'vdvcdatalink',
				allowedContent: "vcell[*]",
				pathName: lang.pathName,
				// We need to have wrapping element, otherwise there are issues in
				// add dialog.
				template: '<span class="cke_placeholder">[[]]</span>',

				downcast: function() {
					
					var vcell = new CKEDITOR.htmlParser.element( "vcell",this.data.cell );
					//vcell.addClass("vdvc_cell");
					vcell.setHtml('[[' + this.data.value + ']]');
					return vcell
				},
				
				init: function() {
					// Note that placeholder markup characters are stripped for the name.
					
					var c = this,cell = {};
					var attr = c.element.$.attributes;
					if (attr) {
						$.each(attr,function(i,val){
							if (val.nodeName != "data-widget" && val.nodeName != "data-cke-widget-keep-attr" && val.nodeName != "class") {
								cell[val.nodeName] = val.nodeValue;
							}
						});
					}
					
					//c.setData( 'value', c.element.getText().slice( 2, -2 ) );
					c.setData( 'value', c.element.getText() );
					c.setData('cell',cell);
					
					/*$(".cke_placeholder").droppable({
			    	      activeClass: "ui-state-hover",
			    	      hoverClass: "ui-state-active",
			    	      drop: function( event, ui ) {
			    	    	  var obj = ui.draggable.data();
			    	    	  if (!$.isEmptyObject(obj)){
			    	    		  if (typeof obj.cellVal != "undefined") {
			    	    			  $( this ).html(obj.cellVal);
			    	    		  }
			    	    	  }
			    	      }
			    	 });*/
				},

				data: function() {
					
					var c = this;
					c.element.setText( '[[' + c.data.value + ']]' );
				}
			} );

			editor.ui.addButton && editor.ui.addButton( 'CreatePlaceholder', {
				label: lang.toolbar,
				command: 'vdvcdatalink',
				toolbar: 'insert,5',
				icon: 'vdvcdatalink'
			} );
		},

		
		
	
		afterInit: function( editor ) {
			/*var placeholderReplaceRegex = /\[\[([^\[\]])+\]\]/g;
			
			editor.dataProcessor.dataFilter.addRules( {
				text: function( text, node ) {
					var dtd = node.parent && CKEDITOR.dtd[ node.parent.name ];

					// Skip the case when placeholder is in elements like <title> or <textarea>
					// but upcast placeholder in custom elements (no DTD).
					if ( dtd && !dtd.span )
						return;

					return text.replace( placeholderReplaceRegex, function( match ) {
						// Creating widget code.
						var widgetWrapper = null,
							innerElement = new CKEDITOR.htmlParser.element( 'span', {
								'class': 'cke_placeholder'
							} );

						// Adds placeholder identifier as innertext.
						innerElement.add( new CKEDITOR.htmlParser.text( match ) );
						widgetWrapper = editor.widgets.wrapElement( innerElement, 'placeholder' );

						// Return outerhtml of widget wrapper so it will be placed
						// as replacement.
						return widgetWrapper.getOuterHtml();
					} );
				}
			} );*/
			
			editor.dataProcessor.dataFilter.addRules( {
				elements: {
					'vcell' : function(element) {
						
						var widgetWrapper = null,
						attr = element.attributes,
						innerElement = new CKEDITOR.htmlParser.element( 'span', attr);
						
						innerElement.addClass("cke_placeholder");
						
						// Adds placeholder identifier as innertext.
						element.wrapWith(innerElement);
						widgetWrapper = editor.widgets.wrapElement( innerElement, 'vdvcdatalink' );
	
						// Return outerhtml of widget wrapper so it will be placed
						// as replacement.
						widgetWrapper.getOuterHtml();
					}
				}
			} );
		}
	} );

} )();
