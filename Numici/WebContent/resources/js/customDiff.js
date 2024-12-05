/*var originalLeave = $.fn.popover.Constructor.prototype.leave;
$.fn.popover.Constructor.prototype.leave = function(obj){
  var self = obj instanceof this.constructor ?
    obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
  var container, timeout;

  originalLeave.call(this, obj);

  if(obj.currentTarget) {
    container = $(obj.currentTarget).siblings('.popover')
    timeout = self.timeout;
    container.one('mouseenter', function(){
      //We entered the actual popover – call off the dogs
      clearTimeout(timeout);
      //Let's monitor popover content instead
      container.one('mouseleave', function(){
        $.fn.popover.Constructor.prototype.leave.call(self, self);
      });
    })
  }
};*/


function updateOverlays() {
	$(this).parent().addClass('diff-removed-image');
	var img = $(event.target);
	if (img.length > 0 && img.attr('changeType') == "diff-removed-image" || img.attr('changeType') == "diff-added-image") {
		var classToadd = img.attr('changeType');
    	var overlay = $('<div class="'+classToadd+'">');
    	overlay.width(img.outerWidth());
    	overlay.height(img.outerHeight());
    	overlay.css("left", img.position().left + "px");
    	img.parent().prepend(overlay);
	}
}

function ignoreThis() {
	if (currentElement && currentElement.length > 0) {
		currentElement.addClass('ignore-removed');
		var addedElementId = currentElement.attr('next');
		if (addedElementId) {
			$("#"+addedElementId).addClass('ignore-added');
		}
	}
}

function ignoreAll() {
	alert('needs to Implement');
}

function firstDiff() {
	var first = $("#removed-vdvc-0");// 
	if (!first.is(':visible')) {
		first = getNextElement(first);
	}
	if (first.length > 0) {
		$('html, body').animate({
	        scrollTop: first.offset().top-30
	    }, 2000).promise().done(function () {
	    	first.click();
	    });
	}
}

function prevDiff() {
	var el = getPrevElement(currentElement);
	if (el && el.length > 0) {
		$('html, body').animate({
	        scrollTop: el.offset().top
	    }, 500).promise().done(function () {
	    	el.click();
	    });
	}
}

function nextDiff() {
	var el = getNextElement(currentElement);
	if (el && el.length > 0) {
		$('html, body').animate({
	        scrollTop: el.offset().top
	    }, 500).promise().done(function () {
	    	el.click();
	    });
	}
}

function getPrevElement(element) {
	var el;
	
	if (element && element.length > 0) {
		var currentId = element.attr('id');
		var a = currentId ? currentId.split("-") : null;
		if ($.isArray(a)) {
			var id = a.pop();
			if (!isNaN(id) && id != 0) {
				a.push(parseInt(id)-1);
				var prevId = a.join("-");
				var prev = $("#"+prevId);
				if(prev.length > 0 && prev.is(':visible')) {
					el = prev;
				} else {
					el = getPrevElement(prev);
				}
			}
		}
	}
	
	
	return el;
}

function getNextElement(element) {
	var el;
	
	if (element && element.length > 0) {
		var currentId = element.attr('id');
		var a = currentId ? currentId.split("-") : null;
		if ($.isArray(a)) {
			var id = a.pop();
			if (!isNaN(id)) {
				a.push(parseInt(id)+1);
				var nextId = a.join("-");
				var next = $("#"+nextId);
				if(next.length > 0 && next.is(':visible')) {
					el = next;
				} else {
					el = getNextElement(next);
				}
			}
		}
	}
	return el;
}

function LastDiff() {
	var last = $(".diff-html-removed:last");
	if (!last.is(':visible')) {
		last = getPrevElement(last);
	}
	if (last.length > 0) {
		$('html, body').animate({
	        scrollTop: last.offset().top
	    }, 2000).promise().done(function () {
	    	last.click();
	    });
	}
}



var currentElement;

$(function(){
	
		var markup2 = '<div class="vdvc-annotator-editor">\
				<div class="annotation-content"><div>\
					<ul class="annotations"></ul>\
				</div>\
				<div style="border-bottom:solid 1px #999999;">\
					<textarea id="annotator-field" placeholder="add comments" style="width:100%;border:none;"></textarea>\
				</div></div>\
			<div class="footer"><span class="btn btn-primary save-comment">Save</span>\
			<span class="btn btn-primary cancel-comment">Cancel</span></div></div>';
		
		var markup3 = '<div class="vdvc-annotator-view">\
							<div class="annotation-content"><div>\
								<ul class="annotations"></ul>\
							</div>\
						</div>';
	
	var markup1 = '<div class="text-menu"><div class="btn-group" role="group" >\
		<span class="fa fa-paint-brush text-danger btn btn-default" onclick="highlightSelectedText();"></span>\
		<span class="fa fa-comment-o btn btn-default" onclick="noteSelectedText();"></span>\
		</div></div>';
	
	$('body').append(markup1);
	$('body').append(markup2);
	$('body').append(markup3);
	
	$('body').off('mouseup').on('mouseup', function(event){
		event.stopPropagation();
        var selection;
        if ($('.selection').length > 0) {
        	$('.selection').remove();
        }
        if (window.getSelection) {
          selection = window.getSelection();
        } else if (document.selection) {
          selection = document.selection.createRange();
        }
        
        if (selection && selection.toString() !== '') {
        	var lftpos = event.pageX-($('.text-menu').width());
        	if (lftpos < 0) {
        		lftpos = lftpos+$('.text-menu').width();
        	}
        	$('.text-menu').css('left', lftpos+'px');
            $('.text-menu').css('top', event.pageY-(40)+'px');
        	$('.text-menu').show();
        }
    });
	
	
	$('body').addClass('container-fluid').on("click",function(event){
		$(".diff-html-removed").popover("hide");
		 var selection;
	        if ($('.selection').length > 0) {
	        	$('.selection').remove();
	        }
	        if (window.getSelection) {
	          selection = window.getSelection();
	        } else if (document.selection) {
	          selection = document.selection.createRange();
	        }
	        
	        if (selection && selection.toString() == '' || !selection) {	
	        	$('.text-menu').hide();
	        }
	});
	var markup = '<div class="btn-group" role="group" >\
		<span class="fa fa-ban text-danger btn" onclick="ignoreThis();"></span>\
		<span class="fa-stack btn" onclick="ignoreAll();">\
			<i class="fa fa-list-alt fa-stack-1x" style="top:-1;"></i>\
		  	<i class="fa fa-ban fa-stack-2x text-danger" style="top:-1;"></i>\
		</span>\
		<span class="fa fa-backward btn" onclick="firstDiff();"></span>\
		<span class="fa fa-arrow-left btn" onclick="prevDiff();"></span>\
		<span class="fa fa-arrow-right btn" onclick="nextDiff();"></span>\
		<span class="fa fa-forward btn" onclick="LastDiff();"></span>\
		</div>';
	
	$(".diff-html-removed").popover({
        title : '',
        animation: true,
        html : true,
        placement : 'auto top',
        viewport : 'body',
        trigger : 'manual',
        content : markup,
        container : $(this).attr('id'),
        delay: { "show": 100, "hide": 500 }
    }).on("click", function (event) {
    	event.stopPropagation();
        var _this = this;
        if ($('body').find('.popover').length > 0) {
        	$(".diff-html-removed").popover("hide");
        }
        $(this).popover("show");
    });
    
	$(".diff-html-removed").on('show.bs.popover', function(){
		currentElement = $(this);
    });
	
	$(document).on('click','.save-comment', function(){
		var comment = $('#annotator-field').val();
		if (nodeId && comment && comment !="") {
			if ($.isArray(Comments[nodeId])) {
				Comments[nodeId].push(comment);
			} else {
				Comments[nodeId] = [];
				Comments[nodeId].push(comment);
			}
		}
		$('.vdvc-annotator-editor').hide();
		$('#annotator-field').val('');
    });
	
	$(document).on('click','.cancel-comment', function(){
		$('#annotator-field').empty();
		$('.vdvc-annotator-editor').hide();
    });
	
	$(document).on('mouseenter','span[data-id]', function(event){
		if (!$('.vdvc-annotator-editor').is(':visible') ) {
			var id = $(this).attr('data-id');
			var lftpos = event.pageX-($('.vdvc-annotator-view').width());
			if (lftpos < 0) {
				lftpos = lftpos+400;
			}
			$('.vdvc-annotator-view').css('left', lftpos+'px');
			$('.vdvc-annotator-view').css('top', event.pageY-($('.vdvc-annotator-view').height()+50)+'px');
			$('.vdvc-annotator-view').show();
			if ($.isArray(Comments[id])) {
				$('.vdvc-annotator-view').find('ul').empty();
				$.each(Comments[id],function(i,v){
					var li = $("<li>");
					li.append(v);
					$('.vdvc-annotator-view').find('ul').append(li);
				});
			}
		}
    });
	
	
	$(document).on('mouseleave','span[data-id]', function(event){
		if ($('.vdvc-annotator-view').is(':visible')) {
			$('.vdvc-annotator-view').hide();
		}
    });
});


