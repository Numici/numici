/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

'use strict';

( function() {
	CKEDITOR.plugins.add( 'customcss', {
		init: function(editor) {
			var pluginDirectory = this.path;
        	editor.addContentsCss( pluginDirectory + 'styles/content.css' );
		},
	} );

} )();
