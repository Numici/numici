/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

'use strict';
( function() {
	CKEDITOR.plugins.add( 'vdvcAutoClean', {
		init: function( editor ) {
			
			var walk_the_DOM = function walk(node, func) {
			    func(node);
			    node = node.firstChild;
			    while (node) {
			        walk(node, func);
			        node = node.nextSibling;
			    }
			};
			
			editor.on( 'paste', function( evt ) {
				var data = evt.data;
				if(data && data.type=="html") {
					var wrapper= document.createElement('div');
					wrapper.innerHTML= data.dataValue;
					walk_the_DOM(wrapper, function(element) {
					    if(element.removeAttribute) {
					    	if(element.hasAttribute('comment-id') || element.hasAttribute('user-id')) {
					    		element.removeAttribute('comment-id');
						        element.removeAttribute('user-id');
						        element.removeAttribute('class');
					    	}
					    	
					    	if(element.hasAttribute('link-sourceid')) {
					    		element.removeAttribute('link-sourceid');
						        element.removeAttribute('class');
					    	}
 					        
					    }
					});
					data.dataValue = wrapper.innerHTML;
				}
			} );
		}
	} );
} )();
