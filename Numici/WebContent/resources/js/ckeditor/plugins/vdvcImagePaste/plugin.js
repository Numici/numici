;(function() {
	'use strict';
	CKEDITOR.plugins.add( 'vdvcImagePaste',{
		init: init
	});
	
	function isUrl(value) {
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	    return regexp.test(value); 
	}
	
	function checkURL(url) {
	    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
	}
	
	function getImageAsHtml(data) {
		var html = data.html,
			value = data.dataValue,
			type = data.type;
		if( html || ( value  && type=='html' )) {
			return value;
		} else if(value && type=='text' && (value.indexOf("data:image") > -1 || checkURL(value))) {
			data.type = 'html';
			return converBase64ToImageTag(value);
		}
	}
	
	function converBase64ToImageTag(value) {
		return '<img src="'+value+'" />';
	}
	
	function init(editor) {
		
		if (editor.addFeature) {
			editor.addFeature( {
				allowedContent: 'img[!src,id];'
			} );
		}

		// Paste from clipboard:
		editor.on( 'paste', function(e) {
			
			var data = e.data,
				html = getImageAsHtml(data);
			if (!html){
				return;
			}

			// strip out webkit-fake-url as they are useless:
			if (CKEDITOR.env.webkit && (html.indexOf("webkit-fake-url")>0) ) {
				alert("Sorry, the images pasted with Safari aren't usable");
				window.open("https://bugs.webkit.org/show_bug.cgi?id=49141");
				html = html.replace( /<img src="webkit-fake-url:.*?">/g, "");
			}
			
			if (e.data.html){
				e.data.html = html;
			} else {
				e.data.dataValue = html;
			}
			
		});
	}
	
})();
