;(function(){
	
	angular.module("vdvcApp").factory("AnnotationService",AnnotationService);
	AnnotationService.$inject = ['httpService','markdown','turndown'];
	function AnnotationService(httpService,markdown,turndown) {
		var AnnotationService = {};
		
		AnnotationService.save = function(postdata) {
			 return httpService.httpPost("annotate/resource/save",postdata);
		};
		
		AnnotationService.replyToComment = function(postdata,id) {
			return httpService.httpPost("annotate/reply/"+id,postdata);
		};
		
		AnnotationService.getUID = function() {
			 return httpService.httpGet("uniqueid/get");
		};
		
		AnnotationService.getAnnotationsById = function(postdata) {
			return httpService.httpPost("annotate/resource/get",postdata,{ ignoreLoadingBar: true});
		};
		
		AnnotationService.getAllDocAnnotations = function(id,clientId,postdata,options) {
			 return httpService.httpPost("annotate/get/"+id+"/"+clientId,postdata,options);
		};
		
		AnnotationService.getAllPdfAnnotations = function(id,postdata,options) {
			 options = angular.merge({}, options, { ignoreLoadingBar: true})
			 return httpService.httpPost("annotate/pdf/document/get/"+id,postdata,options);
		};
		
		AnnotationService.addPdfComment = function(docId,postdata) {
			 return httpService.httpPost("annotate/pdf/document/set/"+docId,postdata);
		};
		
		AnnotationService.getUidforPdfAnnotation = function(postdata) {
			 return httpService.httpPost("annotate/pdf/document/get/uuid",postdata);
		};
		
		AnnotationService.deleteAnnotation = function(data ) {
		    return httpService.httpDelete("annotate/resource/annotation",data);
		};
		
		AnnotationService.deletePdfAnnotation = function(data ) {
		    return httpService.httpDelete("annotate/pdf/annotation",data);
		};
		
		AnnotationService.deleteComment = function(data ) {
		    return httpService.httpDelete("annotate/resource/comment",data);
		};
		
		AnnotationService.deletePdfComment = function(data ) {
		    return httpService.httpDelete("annotate/pdf/comment",data);
		};
		
		AnnotationService.editComment = function(postdata) {
			 return httpService.httpPost("annotate/resource/edit/comment",postdata);
		};
		
		AnnotationService.editPdfComment = function(postdata) {
			 return httpService.httpPost("annotate/pdf/edit/comment",postdata);
		};
		
		AnnotationService.getAnnotationByConvId = function(clientId,convId) {
			 return httpService.httpGet("annotate/getAnnotationByConvId/"+clientId+"/"+convId);
		};
		
		AnnotationService.htmlToMarkdown = function(htmldata) {
			return markdown.makeMarkdown(htmldata);
		};
		
		AnnotationService.turndownHtml = function(htmldata) {
			return turndown.turndown(htmldata);
		};
		
		AnnotationService.isRoot = function(annot) {
			return annot.rootComment;
		};
		
		return AnnotationService;
		
	}
	
})();

