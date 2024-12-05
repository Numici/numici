/*
 * angular-pdf-viewer v1.2.1
 * https://github.com/jdryg/angular-pdf-viewer
 */
(function (angular, PDFJS, document) {
	"use strict";
	
	let DEFAULT_SCALE_DELTA = 1.1;
	let MAX_SCALE = 10.0;
	let MIN_SCALE = 0.10;
	
	function PDFViewerApplication(options) {
		
		var self = this;
		
		this.CMAP_URL = './angular-libs/libs/pdfjs-dist/cmaps/';
		this.IMG_URL = './angular-libs/libs/pdfjs-dist/web/images/';
		this.CMAP_PACKED = true;
		
		this.scale = 1.0;
		this.pdfUrl = null;
		this.PDFViewer = null;
		this.pdfDocument = null;
		this.pdfLinkService = null;
		this.pdfFindController = null;
		this.hasTextLayer = false;
		this.searchResults = [];
		this.searchTerm = "";
		this.searchHighlightResultID = -1;
		this.element = options.container;
		this.pageMargin = 0;
		this.currentPage = 0;
		this.env = options.env;
		
		this.api = null;
		
		this.annotations = null;
		this.snippets = null;
		this.deepLinks = null;
		

		// Hooks for the client...
		this.onSearch = null;
		this.onPageRendered = null;
		this.onDataDownloaded = null;
		this.onCurrentPageChanged = null;
		this.passwordCallback = null;
		this.annotType = null;
		this.getCommentToolBarToolTip = null;
		
		this.addAnnotation = null;
		
		this.isPublicView = false;
	
		
	}

	PDFViewerApplication.prototype = {
		init: function() {
			var self = this;
			
			this.element.empty();
			this.element.css('width','100%');
			this.element.append('<div class="pdfViewer"></div>');
			const eventBus = new pdfjsViewer.EventBus();
			self.pdfLinkService = new pdfjsViewer.PDFLinkService();

			self.pdfFindController = new pdfjsViewer.PDFFindController({
			  linkService: self.pdfLinkService,
			  eventBus : eventBus
			});

			self.PDFViewer  = new pdfjsViewer.PDFViewer({
			  container: self.element[0],
			  linkService: self.pdfLinkService,
			  findController: self.pdfFindController,
			  imageResourcesPath : self.IMG_URL,
			  eventBus : eventBus
			});
			
			self.pdfLinkService.setViewer(self.PDFViewer);
			self.api = new PDFViewerAPI(self.PDFViewer);
			
			self.bindEvents();
			
		},
		fireDeepLinkClickEvent: function(linkId,originalEvent) {
			var self = this;
			var event = document.createEvent('CustomEvent');
		    event.initCustomEvent("deeplinkonclick", true, true, {
		    	"linkId": linkId,
		    	"url": self.pdfUrl,
		    	"originalEvent": originalEvent
		    });
		    
		    self.element[0].dispatchEvent(event);
		},
		fireAnnotationClickEvent: function(annot,originalEvent) {
			var self = this;
			var event = document.createEvent('CustomEvent');
		    event.initCustomEvent("annotationonclick", true, true, {
		    	"annotation": annot,
		    	"url": self.pdfUrl,
		    	"originalEvent": originalEvent
		    });
		    
		    self.element[0].dispatchEvent(event);
		},
		getRenderedPages: function() {
			var self = this;
			return _.where(self.PDFViewer._pages,{renderingState: 3});
		},
		renderAnnotaions : function(pdfPage) {
			var self = this;
			if(self.annotations) {
				var annotations = _.where(self.annotations, {"pageNum": pdfPage.id});
				if(annotations) {
					for(var i = 0;i < annotations.length;i++) {
						var annot = annotations[i];
						if(annot.type == "Highlight" || annot.type == "Screenshot") {
							self.renderTextHighlight(annot,pdfPage);
						}
						if(annot.type == "Link") {
							self.renderLink(annot,pdfPage);
						}
					}
				}
			}
		},
		checkAndUpdateAnnotVQ: function(anotObj) {
			var hasValidConversation = false;
			var annotEl = $('div[annot-id="'+anotObj.id+'"]');
			
			if(anotObj) {
				if(!_.isEmpty(anotObj.comment)) {
					hasValidConversation = true;
				} else if( anotObj.conversations && anotObj.conversations.length > 0) {
					var nonEmptyConv = _.find(anotObj.conversations, function(conv) {
						return !_.isEmpty(conv.comment);
					});
					
					if(nonEmptyConv)  {
						hasValidConversation = true;
					}
				}
			}
			
			if(hasValidConversation) {
				annotEl.first().addClass("cmt");
			} else {
				annotEl.first().removeClass("cmt");
			}
		
		},
		bindEventToCommentElement: function(elements,annot) {
			var self = this;
			for(var i = 0;elements.length > i;i++) {
				var el = elements[i];
				if(annot.type == "Highlight") {
					$(el).addClass("pdfHighlight");
				} else if(annot.type == "Screenshot") {
					$(el).addClass("pdfScreenshot");
				}
				$(el).attr("annot-id",annot.id);
				
				$(el).off("click").on("click",function(event){
					event.stopPropagation();
					self.fireAnnotationClickEvent(annot,event);
				});
			}
		},
		
		renderTextHighlight: function(annot,pdfPage) {
			var self = this;
			var annotEl = $('div[annot-id="'+annot.id+'"]');
			var isHighlightExists = annotEl.length > 0 ? true : false;
			if(!isHighlightExists) {
				var elements = self.showHighlight({"coords":annot.coordinates,"type" : annot.type},pdfPage);
				self.bindEventToCommentElement(elements,annot);
			}
			
			self.checkAndUpdateAnnotVQ(annot);
		},
		bindClickEventToDeepLinkElement: function(elements,link) {
			var self = this;
			for(var i = 0;elements.length > i;i++) {
				var el = elements[i];
				$(el).addClass("pdf-vdvc-link");
				$(el).attr("link-sourceId",link.uid);
		 		$(el).attr("link-id",link.id);
				$(el).off("click").on("click",function(event){
					self.fireDeepLinkClickEvent(link.id,event);
				});
			}
		},
		
		renderDeepLinks: function(pdfPage) {
			
			var self = this;
			if(self.deepLinks) {
				var links = _.filter(self.deepLinks, function(obj) {
					return obj.info.pageNumber === pdfPage.id;
				});
				for(var i = 0;i < links.length;i++) {
					var link = links[i];
					var linkInfo = link.info;
					var isHighlightExists = $('div[link-sourceId="'+linkInfo.linkUniqueId+'"]').length > 0 ? true : false;
					if(!isHighlightExists) {
						var elements = self.showHighlight({"coords":linkInfo.coordinates},pdfPage);
						self.bindClickEventToDeepLinkElement(elements,{"uid":linkInfo.linkUniqueId,"id":linkInfo.id});
					}
				}
			}
		},
		renderSnippets: function(pdfPage) {
			var self = this;
			if(self.snippets) {
				for(var i=0; i<self.snippets.length;i++) {
					if(self.snippets[i]) {
						var snip = self.snippets[i];
						if(snip.page == pdfPage.id) {
							var isExists = $(".pdfHighlight .snippet_"+i).length > 0 ? true : false;
							if(!isExists) {
								var elements = self.showHighlight(snip,pdfPage);
								if(elements) {
									for(var k = 0;elements.length > k;k++) {
										$(elements[k]).addClass("snippet_"+i);
									}
								}
							}
						}
					}
				}
			}
		},
		dispatchEventToContainer: function(eventName,eventData) {
			var self = this;
			var event = document.createEvent('CustomEvent');
		    event.initCustomEvent(eventName, true, true, eventData);
		    self.element[0].dispatchEvent(event);
		},
		
		bindEvents: function() {
			
			var self = this;
			
			if(self.PDFViewer && self.PDFViewer.eventBus) {
				
				self.PDFViewer.eventBus.on('scalechange', function(evt) {
					if(self.element[0] === evt.source.container) {
						self.scale = evt.scale;
					}
			    });
				
				
				self.PDFViewer.eventBus.on('pagesinit', function (evt) {
					if(self.element[0] === evt.source.container) {
						self.PDFViewer.currentScaleValue = 'page-width';
					}
				});
				
				self.PDFViewer.eventBus.on('pagechanging', function(evt) {
					if(self.element[0] === evt.source.container) {
						self.onCurrentPageChanged(evt.pageNumber);
					}
				});
				
				self.PDFViewer.eventBus.on('textlayerrendered', function (evt) {
					if(self.element[0].contains(evt.source.textLayerDiv)) {
						self.bindSelectionEvent(evt);
						var pageNumber = evt.pageNumber;
						var pageIndex = pageNumber - 1;
						var pageView = self.PDFViewer.getPageView(pageIndex);
						
						if (!pageView) {
						   return;
						}
						if (pageView.error) {
							self.onPageRendered("failed", pageNumber, self.PDFViewer.pdfDocument.numPages, "Failed to render page.");
						} else {
							self.renderAnnotaions(pageView);
							self.renderDeepLinks(pageView);
							self.renderSnippets(pageView);
							self.onPageRendered("success", pageNumber, self.PDFViewer.pdfDocument.numPages, "");
						}
					}
				});
				
			    self.PDFViewer.eventBus.on('resize', function (evt) {
			    	self.updateView();
			    });
				  
				self.PDFViewer.eventBus.on('pagerendered', function (evt) {

				});
			}
		},
		updateView: function() {
			
			 var self = this;
			 let pdfViewer = self.PDFViewer;
			   let pdfDocument = self.pdfDocument;
		   	 
			   if (!pdfDocument) {
				   return;
			   }
			   let currentScaleValue = pdfViewer.currentScaleValue;
			   if (currentScaleValue === 'auto' ||
				   currentScaleValue === 'page-fit' ||
				   currentScaleValue === 'page-width') {
				   
				   // Note: the scale is constant for 'page-actual'.
				   pdfViewer.currentScaleValue = currentScaleValue;
			   }
			   
			   pdfViewer.update();
		},
		setUrl: function (src,initialScale, renderTextLayer) {
			var self = this;
			
			
			self.hasTextLayer = renderTextLayer;
			self.scale = initialScale;
			
			self.pdfUrl = src;
			// Loading document.
			var loadingTask = pdfjsLib.getDocument({
			  url: src,
			  cMapUrl: self.CMAP_URL,
			  cMapPacked: self.CMAP_PACKED,
			});
			
			loadingTask.onProgress = angular.bind(this, this.downloadProgress);
			loadingTask.onPassword = angular.bind(this, this.passwordCallback);
			
			loadingTask.promise.then(function(pdfDocument) {
			  // Document loaded, specifying document for the viewer and
			  // the (optional) linkService.
			  self.PDFViewer.setDocument(pdfDocument);
			  self.pdfLinkService.setDocument(pdfDocument, null);
			  self.pdfDocument = pdfDocument;
			  
			}, function (message) {
				self.onDataDownloaded("failed", 0, 0, "PDF.js: " + message);
			});
		},
		getAPI: function () {
			return this.api;
		},
		downloadProgress: function (progressData) {
			// JD: HACK: Sometimes (depending on the server serving the PDFs) PDF.js doesn't
			// give us the total size of the document (total == undefined). In this case,
			// we guess the total size in order to correctly show a progress bar if needed (even
			// if the actual progress indicator will be incorrect).
			var total = 0;
			if (typeof progressData.total === "undefined") {
				while (total < progressData.loaded) {
					total += 1024 * 1024;
				}
			} else {
				total = progressData.total;
			}

			this.onDataDownloaded("loading", progressData.loaded, total, "");
		},
		bindSelectionEvent: function(evt) {
			var self = this;
			if(self.isPublicView) {
				return;
			}
			evt.source.textLayerDiv.addEventListener('mouseup', function (event) {
				event.stopPropagation();
				self.coordiNates = null;
				$('.comment-tool').css({"display":"none"});
	    		var x = event.clientX; 
				var y = event.clientY;
				var pos = {
						top : y,
						left: x
				};
				if(!self.perms.readonly) {
					if (window.getSelection) {
						  if (!_.isEmpty(window.getSelection().toString())) {
							  self.addTextToolBar(evt,pos);
						  } 
					} else if (document.selection) {  // IE?
						 var textRange = document.selection.createRange();
						 if (!_.isEmpty(textRange.text)) {
							 self.addTextToolBar(evt,pos);
						 } 
					}
				}
			});
		},
		getMinMaxCoordinates: function(crds,ref) {
			var n = [];
			var l = [];
			var r = [];
			var min,max;
			$.each(crds,function(i,v){
				l.push(v[0]);
				r.push(v[2]);
			});
			
			if(l.length > 0) {
				min = _.min(l);
			} else {
				min = ref[0];
			}
			
			if(r.length > 0) {
				max = _.max(r);
			} else {
				max = ref[2];
			}
			
			
			//min = _.min(l);
			//max = _.max(r);
			
			n[0] = min;
			n[1] = ref[1];
			n[2] = max;
			n[3] = ref[1];
			n[4] = min;
			n[5] = ref[3];
			n[6] = max;
			n[7] = ref[3];
			
			return n;
		},
		
	getSelectionCords : function(evt) {
		var self = this;
		
		
		var pageIndex = evt.pageNumber - 1; 
		var page = self.PDFViewer.getPageView(pageIndex);
		var pageRect = page.canvas.getClientRects()[0];
		var range = window.getSelection().getRangeAt(0);
		var selectionRects = range.getClientRects();
		var selectionBoundBox = range.getBoundingClientRect();
		var viewport = page.viewport;
		selectionRects =  _.filter(selectionRects, function (r) {
		    return r.width != 0;
		});
		var selected = _.map(selectionRects, function (r) {
		    return viewport.convertToPdfPoint(r.left - pageRect.left, r.top - pageRect.top)
		    .concat(viewport.convertToPdfPoint(r.right - pageRect.left, r.bottom - pageRect.top));
		});
		
		var text = $(div).text() || range.toString();
		if(text) {
			text = text.replace(/\n\s*\n/g, '\n');
		}
		
		self.coordiNates =  {
			'selectionRects': selected,
			'boundBox' : selectionBoundBox,
			'pageRect' : pageRect,
			"viewportWidth": viewport.width,
			"viewportHeight": viewport.height,
			"pageIndex" : evt.pageNumber,
			"selectedText" : text
		};
		
		return self.coordiNates;
	},
	
	getHightlightCoords: function(evt,type) {
		
		var self = this;
		var pageIndex = evt.pageNumber - 1; 
		var page = self.PDFViewer.getPageView(pageIndex);
		var selected;
		var fa = [];
		if(self.coordiNates) {
			selected = self.coordiNates;//.selectionRects;
		} else {
			selected = self.getSelectionCords(evt);//.selectionRects;
		}
		
		if (selected.selectionRects.length > 0) {
			var ref = selected.selectionRects[0];
			
			var inter = [];
			$.each(selected.selectionRects,function(i,v){
				if(self.env && self.env.isIE) {						
					var temp = self.getMinMaxCoordinates(inter,v);
					fa.push(temp);
				} else {
					//if((v[1] == ref[1] && v[3] == ref[3]) || (Math.abs(v[1] - ref[1]) < 3 && Math.abs(v[3] - ref[3]) < 3 ) ) {
					if(Math.abs(v[1] - ref[1]) < 3 && Math.abs(v[3] - ref[3]) < 3) {
						inter.push(v);
					} else {
						var temp = self.getMinMaxCoordinates(inter,ref);
						inter = [];
						fa.push(temp);
						ref = v;
					}
					if (i == selected.selectionRects.length-1) {
						if(inter.length == 0 ) {
							inter = [ref];
						}
						var temp = self.getMinMaxCoordinates(inter,ref);
						inter = [];
						fa.push(temp);
					}
				}
			});
			
		}
		
		var data = {pageNum: evt.pageNumber, coordinates: _.flatten(fa)};
		if(!_.isEmpty(selected.selectedText)){
			data["text"] = selected.selectedText;
		}
		
		
		var savePromise = self.addAnnotation(data,type);
		
		savePromise.then(function(annot) {
			
			var pdfPage = self.PDFViewer.getPageView(annot.pageNum-1);
			var elements = self.showHighlight({"coords":annot.coordinates},pdfPage);
			if(annot.contextType == "DeepLink") {
				self.bindClickEventToDeepLinkElement(elements,annot);
			} else {
				self.bindEventToCommentElement(elements,annot);
			}
			
		},function(error) {
			
		});
		
		self.coordiNates = null;
	},
	renderLink: function(annot,pdfPage) {
		var self = this;
		var pageElement = pdfPage.div;
		var viewport = pdfPage.viewport;
		 
		 var rect = [];
		 rect[0] = annot.lowerLeftX;
		 rect[1] = annot.lowerLeftY;
		 rect[2] = annot.upperRightX;
		 rect[3] = annot.upperRightY;
		  
		 var bounds = viewport.convertToViewportRectangle(rect);
		 var el = angular.element('<section></section>');
		 var $a = $('<a></a>');
		 $a.css({
			 'position': 'absolute',
			 'top': 0,
			 'left': 0,
			 'width': '100%',
			 'height':'100%'
		 });
		 if(annot.linkType == 'uri') {
			 $a.attr('target','_blank');
			 $a.attr('title',annot.uri);
			 $a.attr('href',annot.uri);
		 }
		 
		 if(annot.linkType == 'name') {
			 $a.css('cursor','pointer');
			 $a.off('click').on('click',function(event) {
				 event.stopPropagation();
				 event.preventDefault();
				 self.pdfLinkService.navigateTo(annot.destinationName);
			 });
		 }
		 
		 if(annot.linkType == 'page') {
			 $a.css('cursor','pointer');
			 $a.off('click').on('click',function(event) {
				 event.stopPropagation();
				 event.preventDefault();
				 self.scope.pdfViewerAPI.goToPage(annot.destinationPageNumber);
			 });
		 }
		 
		 var top = Math.min(bounds[1], bounds[3]);
		 var left = Math.min(bounds[0], bounds[2]);
		 var w = Math.abs(bounds[0] - bounds[2]);
		 var h = Math.abs(bounds[1] - bounds[3])+2;
		 el.attr('style', 'position: absolute;' +
		      'left:' + left + 'px; top:' +top + 'px;'+'width:' + w + 'px; height:' + h + 'px;z-index:20;');
		 el.append($a);
		 $(pageElement).append(el);

	},
	showHighlight: function(selected,pdfPage) {
		var self = this;
		var elements = [];
		var pageElement = pdfPage.div;
		var viewport = pdfPage.viewport;
		if (selected.coords && selected.coords.length > 0) {
			var lines = selected.coords.length/8;
			for (var j=0; j<lines; j++) {
				  var rect = [];
				  rect[0] = selected.coords[j*8+0];
				  rect[1] = selected.coords[j*8+1];
				  rect[2] = selected.coords[j*8+2];
				  if(selected.coords.length > 5) {
					  rect[3] = selected.coords[j*8+5];
				  } else {
					  rect[3] = selected.coords[j*8+3];
				  }
				  var bounds = viewport.convertToViewportRectangle(rect);
				  if(selected.type == "Screenshot") {
					  for (var k=0; k<rect.length; k++) {
						  rect[k] = rect[k]*pdfPage.scale;
					  }
					  bounds = rect;
				  }
				  var top = Math.min(bounds[1], bounds[3]);
				  var left = Math.min(bounds[0], bounds[2]);
				  var w = Math.abs(bounds[0] - bounds[2]);
				  var h = Math.abs(bounds[1] - bounds[3])+2;
				 
				  
				  /*var ctx = pdfPage.canvas.getContext("2d");
				  ctx.globalCompositeOperation='destination-over';
				  ctx.lineWidth = "1";
				  ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
				  ctx.strokeStyle = "red";
				  ctx.rect(left, top, w,h);
				  ctx.stroke();
				  ctx.fill();*/
				  
				  
				  var el = angular.element('<div></div>');
				  el.attr('style', 'position: absolute;' +
				      'left:' + left + 'px; top:' +top + 'px;'+'width:' + w + 'px; height:' + h + 'px;z-index:20;');
				  $(pageElement).append(el);
				  elements.push(el);
			}
			
			//this.scope.annotType = null;
			//this.scope.pdfMenuItems.state = null;
			
			if (window.getSelection) {
				  if (window.getSelection().empty) {  // Chrome
				    window.getSelection().empty();
				  } else if (window.getSelection().removeAllRanges) {  // Firefox
				    window.getSelection().removeAllRanges();
				  }
			} else if (document.selection) {  // IE?
				  document.selection.empty();
			}
		  } 
		
		return elements;
	},
	addTextToolBar : function(evt,evtCords) {
		
		var self = this;
		var txtLayer = evt.source;
		var txtLayerDiv = $(txtLayer.textLayerDiv);
		var highlightToolTip ="" ;
		var commentToolTip = "";
		var deepLinkToolTip ="" ;
		
		var $page = txtLayerDiv.closest('.page');
		var $pageWrap = $page.closest('.vdvc-pdf-viewer');
		var $toolbar = $page.find('.comment-tool');
		
		Promise.all([self.getCommentToolBarToolTip('TxtHilt'), 
		     self.getCommentToolBarToolTip('TxtCmt'), 
	         self.getCommentToolBarToolTip('DpLnkTo')
	    ]).then(function(values) {
	        	highlightToolTip = values[0] ||  "";
	        	commentToolTip = values[1]  ||  "";
	        	deepLinkToolTip = values[2]  ||  "";
	        	var disableDeepLink = "disabled";
	        	if(self.perms.edit && self.perms.share) {
	        		disableDeepLink = "";
	        	}
	        	var mrkUp = '<div class="comment-tool btn-group pdf">\
	    			<button type="button" class="btn txtHilt">\
	    		<div class="fa fa-paint-brush"></div>\
	        	<div style="font-size: 12px;">'+highlightToolTip+'</div>\
	    	</button> \
	    	<button type="button" class="btn addcmt">\
	    			<div class="fa fa-comment-o"></div>\
	        		<div style="font-size: 12px;">'+commentToolTip+'</div>\
	    	</button>\
	    </div>';
	    		
	        	/*\
		    	<button type="button" class="btn crt-link '+disableDeepLink+'">\
		    		<div class="fa fa-bookmark-o"></div>\
		    		<div style="font-size: 12px;">'+deepLinkToolTip+'</div>\
		    	</button>*/
	    		if($toolbar.length == 0) {
	    			$page.append(mrkUp);
	    			$toolbar = $page.find('.comment-tool');
	    			$toolbar.find('span').tooltip();
	    		}
	    		
	    		var selectionBoundaries = self.getSelectionCords(evt);
	    		var coords = selectionBoundaries.selectionRects;
	    		var bondBox = selectionBoundaries.boundBox;
	    		var pageRects = selectionBoundaries.pageRect;
	    		
	    		var H = $toolbar.outerHeight();
	    	    var W = $toolbar.outerWidth();
	    	    var pH = $pageWrap.innerHeight();
	    	    var pW = $pageWrap.innerWidth();
	    	    var pageWrapOffset = $pageWrap.offset();
	    		var vW = selectionBoundaries.viewportWidth;  
	    		var x = evtCords.left; 
	    		var y = evtCords.top-H;
	    		
	    		
	    		var top = bondBox.bottom;
	    		//var left = bondBox.left;
	    		var left = bondBox.left+((bondBox.width/2)-(W/2));
	    		if(!isNaN(left)) {
	    			if((left+W) > (pageWrapOffset.left+pW)) {
	    				left = left - W;
	    			}
	    			if(left < pageWrapOffset.left) {
	    				left = pageWrapOffset.left;
	    			}
	    		}
	    		if(!isNaN(top)) {
	    			if((top+H) > (pageWrapOffset.top+pH)) {
	    				top = top - (bondBox.height+H);
	    			}
	    			if(top < pageWrapOffset.top) {
	    				top = pageWrapOffset.top;
	    			}
	    		}
	    		
	    		$toolbar.css({"display":"block","top":top+'px',"left": left+'px','z-index':100});
	    		
	    		$toolbar.find('.btn').off('mouseup ').on('mouseup ',function(event) {
	    			event.stopPropagation();
	    		});
	    		
	    		$toolbar.find('.btn').off('click').on('click',function(event) {
	    			event.stopPropagation();
	    			if($(this).hasClass('txtHilt')) {
	    				self.getHightlightCoords(evt,'highlight');
	    			}
	    			if($(this).hasClass('addcmt')) {
	    				self.getHightlightCoords(evt,'comment');
	    			}
	    			if($(this).hasClass('crt-link') && !$(this).hasClass('disabled')) {
	    				self.getHightlightCoords(evt,'deepLink');
	    			}
	    			if(!$(this).hasClass('disabled')) {
	    				$toolbar.hide();
	    			}
	    		});
	        	
	    });
	}
 };
	
	
	
	function PDFViewerAPI(viewer) {
		this.viewer = viewer;
	}
	
	PDFViewerAPI.prototype = {
		OnScaleChanged : function(scale) {
			if (!this.viewer) {
				return;
			}
			
			this.viewer.currentScaleValue = scale;
		},
		zoomIn: function (ticks) {
			if (!this.viewer) {
				return;
			}
			var newScale = this.viewer.currentScale;
		    do {
		      newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
		      newScale = Math.ceil(newScale * 10) / 10;
		      newScale = Math.min(MAX_SCALE, newScale);
		    } while (--ticks > 0 && newScale < MAX_SCALE);
		    this.viewer.currentScaleValue = newScale;
		},
		zoomOut: function (ticks) {
			if (!this.viewer) {
				return;
			}
			var newScale = this.viewer.currentScale;
		    do {
		      newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
		      newScale = Math.floor(newScale * 10) / 10;
		      newScale = Math.max(MIN_SCALE, newScale);
		    } while (--ticks > 0 && newScale > MIN_SCALE);
		    this.viewer.currentScaleValue = newScale;
		},
		rotatePages: function rotatePages(delta) {
			if (!this.viewer) {
				return;
			}
		    var newRotation = (this.viewer.pagesRotation + 360 + delta) % 360;
		    this.viewer.pagesRotation = newRotation;
		  },
		getZoomLevel: function () {
			return this.viewer.currentScaleValue;
		},
		goToPage: function (pageIndex) {
			if(this.viewer.pdfDocument === null || pageIndex < 1 || pageIndex > this.viewer.pdfDocument.numPages) {
				return;
			}

			this.viewer._pages[pageIndex - 1].div.scrollIntoView();
		},
		getNumPages: function () {
			if(this.viewer.pdfDocument === null) {
				return 0;
			}

			return this.viewer.pdfDocument.numPages;
		},
		findNext: function () {
			if(this.viewer.searchHighlightResultID === -1) {
				return;
			}

			var nextHighlightID = this.viewer.searchHighlightResultID + 1;
			if(nextHighlightID >= this.viewer.searchResults.length) {
				nextHighlightID = 0;
			}

			this.viewer.highlightSearchResult(nextHighlightID);
		},
		findPrev: function () {
			if(this.viewer.searchHighlightResultID === -1) {
				return;
			}

			var prevHighlightID = this.viewer.searchHighlightResultID - 1;
			if(prevHighlightID < 0) {
				prevHighlightID = this.viewer.searchResults.length - 1;
			}

			this.viewer.highlightSearchResult(prevHighlightID);
		}	
	};

	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	angular.module("angular-pdf-viewer", []).
	directive("pdfViewer", ['$deviceInfo',function ($deviceInfo) {
		var pageMargin = 10;

		return {
			restrict: "EA",
			scope: {
				src: "@",
				file: "=",
				api: "=",
				pdfApp:"=",
				initialScale: "@",
				renderTextLayer: "@",
				progressCallback: "&",
				passwordCallback: "&",
				saveAnnotation:"&",
				toolBarTooltip:"&",
				searchTerm: "@",
				searchResultId: "=",
				searchNumOccurences: "=",
				currentPage: "=",
				annotType: "=",
				
				annotations: "=",
				snippets: "=",
				deepLinks: "=",
				
				publicView: "@",
				perms: "="
			},
			
			controller: ['$scope', '$element','$q','uuidService','$timeout',
				function ($scope, $element,$q,uuidService,$timeout) {
				
				$element.attr("id",uuidService.newUuid());
				
				$element[0].addEventListener("deeplinkonclick",function(evt) {
					$scope.$emit("deeplinkonclick",evt.detail);
				});
				
				$element[0].addEventListener("annotationonclick",function(evt) {
					$scope.$emit("annotationonclick",evt.detail);
				});

				$scope.onPageRendered = function (status, pageID, numPages, message) {
					this.onProgress("render", status, pageID, numPages, message);
				};

				$scope.onCreateAnnotation = function(data,type) {
					
					let defer = $q.defer();
					if(this.saveAnnotation) {
						var self = this;
						$timeout(function() {
							self.saveAnnotation({ 
								data: data,
								type: type, 
								saveResolve: defer
							});
						}, 0);
					} 
					
					return defer.promise;
				};
				
				$scope.onDataDownloaded = function (status, loaded, total, message) {
					this.onProgress("download", status, loaded, total, message);
				};

				$scope.onCurrentPageChanged = function (pageID) {
					var self = this;
					$timeout(function() {
						self.currentPage = pageID;
					}, 0);
				};

				$scope.getCommentToolBarToolTip = function(key) {
					if(this.toolBarTooltip) {
						var self = this;
						return $timeout(function() {
							return self.toolBarTooltip({ 
								key: key
							});
						}, 0).then(function(resp) {
							return resp;
						});
					} 
					//return ToolTipService.showToolTip(key);
				};
				
				$scope.onSearch = function (status, curResultID, totalResults, message) {
					if(status === "searching") {
					} else if(status === "failed") {
						console.log("Search failed: " + message);
					} else if(status === "done") {
						this.searchResultId = curResultID + 1;
						this.searchNumOccurences = totalResults;
					} else if(status === "reset") {
						this.searchResultId = 0;
						this.searchNumOccurences = 0;
					}
				};

				$scope.getPDFPassword = function (passwordFunc, reason) {
					if(this.passwordCallback) {
						var self = this;
						$timeout(function() {
							var password = self.passwordCallback({reason: reason});

							if(password !== "" && password !== undefined && password !== null) {
								passwordFunc(password);
							} else {
								this.onPageRendered("failed", 1, 0, "A password is required to read this document.");
							}
						}, 0);
					} else {
						this.onPageRendered("failed", 1, 0, "A password is required to read this document.");
					}
				};

				$scope.onProgress = function (operation, state, value, total, message) {
					if (this.progressCallback) {
						var self = this;
						
						$timeout(function() {
							self.progressCallback({ 
								operation: operation,
								state: state, 
								value: value, 
								total: total,
								message: message
							});
						}, 0);
					}
				};

				
				
				$scope.pdfApp = new PDFViewerApplication({env: $deviceInfo,container: $element});
				$scope.pdfApp.onSearch = angular.bind($scope, $scope.onSearch);
				$scope.pdfApp.onPageRendered = angular.bind($scope, $scope.onPageRendered);
				$scope.pdfApp.onDataDownloaded = angular.bind($scope, $scope.onDataDownloaded);
				$scope.pdfApp.onCurrentPageChanged = angular.bind($scope, $scope.onCurrentPageChanged);
				$scope.pdfApp.passwordCallback = angular.bind($scope, $scope.getPDFPassword);
				$scope.pdfApp.getCommentToolBarToolTip = angular.bind($scope, $scope.getCommentToolBarToolTip);
				$scope.pdfApp.isPublicView =  $scope.publicView === "true" ? true : false;
				$scope.pdfApp.addAnnotation = angular.bind($scope, $scope.onCreateAnnotation);
				
				
				$scope.pdfApp.init();
				
				$scope.api = $scope.pdfApp.getAPI();
				$scope.pdfApp.annotations = $scope.annotations;
				$scope.pdfApp.perms = $scope.perms;
				

				$scope.shouldRenderTextLayer = function () {
					if(this.renderTextLayer === "" || this.renderTextLayer === undefined || this.renderTextLayer === null || this.renderTextLayer.toLowerCase() === "false") {
						return false;
					}

					return true;
				};
				
				$scope.onPDFSrcChanged = function () {
					this.pdfApp.setUrl(this.src, this.initialScale, this.shouldRenderTextLayer())
				};

				
				$element.bind("scroll", function (event) {
					$scope.$apply(function () {
						var scrollTop = $element[0].scrollTop;
						var h = $element.outerHeight(true);
						var scrollDir = scrollTop - $scope.lastScrollY;
						$scope.lastScrollY = scrollTop;

						var normalizedScrollDir = scrollDir > 0 ? 1 : (scrollDir < 0 ? -1 : 0);
						
						var scrollInfo = {
								"scrollTop" : scrollTop,
								'scrlRatio':(scrollTop/h),
								'element':$element
								};
						$scope.$emit("pdfOnScroll",scrollInfo);
					});
				});
				
				
				/*$scope.onPDFFileChanged = function () {
					$element.empty();
					this.lastScrollY = 0;
					this.viewer.setFile(this.file, $element, this.initialScale, this.shouldRenderTextLayer(), pageMargin);
				};

				$element.bind("scroll", function (event) {
					$scope.$apply(function () {
						var scrollTop = $element[0].scrollTop;
						var h = $element.outerHeight(true);
						var scrollDir = scrollTop - $scope.lastScrollY;
						$scope.lastScrollY = scrollTop;

						var normalizedScrollDir = scrollDir > 0 ? 1 : (scrollDir < 0 ? -1 : 0);
						$scope.pdfApp.renderAllVisiblePages(normalizedScrollDir);
						
						var scrollInfo = {
								"scrollTop" : scrollTop,
								'scrlRatio':(scrollTop/h),
								'element':$element
								};
						$scope.$emit("pdfOnScroll",scrollInfo);
					});
				});*/
			}],
			
			link: function (scope, element, attrs) {
				attrs.$observe('src', function (src) {
					if (src !== undefined && src !== null && src !== '') {
						scope.onPDFSrcChanged();
					}
				});

				scope.$watch("annotations", function (annotations) {
					try {
						scope.pdfApp.annotations = annotations;
						var pages = scope.pdfApp.getRenderedPages();
						if(pages) {
							_.each(pages,function(page,index) {
								scope.pdfApp.renderAnnotaions(page);
							});
						}
					} catch (e) {
						
					}
					
				});
				
				scope.$watch("snippets", function (snippets) {
					scope.pdfApp.snippets = snippets;
				});
				
				scope.$watch("deepLinks", function (deepLinks) {
					scope.pdfApp.deepLinks = deepLinks;
				});
				
				scope.$watch("perms", function (perms) {
					scope.pdfApp.perms = perms;
				});
				
				/*scope.$watch("file", function (file) {
					if(scope.file !== undefined && scope.file !== null) {
						scope.onPDFFileChanged();
					}
				});

				scope.$watch("annotType", function (annotType) {
					if(scope.annotType !== undefined && scope.annotType !== null) {
						AnnotOptions.type = scope.annotType;
						
						if (scope.annotType == "drawing") {
							AnnotOptions.setFreeDrawingMode(true);
						}
						if (scope.annotType == "highlight" || scope.annotType == "deepLink") {
							$('.canvas-container canvas').css("z-index",0);
						}
						scope.annotType = undefined;
					}
				});
				
				attrs.$observe("searchTerm", function (searchTerm) {
					if (searchTerm !== undefined && searchTerm !== null && searchTerm !== '') {
						scope.viewer.search(searchTerm);
					} else {
						scope.viewer.resetSearch();
					}
				});*/
			}
		};
	}]);
})(angular, pdfjsLib, document);
