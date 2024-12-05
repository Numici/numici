;(function(){
	'use strict';
	angular.module("vdvcApp").factory("TagService",TagService );
	
	TagService.$inject = ['httpService'];
	
	function TagService(httpService) {
		var TagService = {
				save : save,
				tag : tag,
				tagItems : tagItems,
				getItemTags : getItemTags,
				getAllTags : getAllTags,
				getAllTagValues : getAllTagValues,
				unTag : unTag,
				getItemTagsById : getItemTagsById
		};
		
		return TagService;
		
		function save(postdata) {
			 return httpService.httpPost("tags/save/",postdata);
		}
		
		function tag(postdata) {
			 return httpService.httpPost("tags/save/multiple",postdata);
		}
		
		function tagItems(postdata) {
			 return httpService.httpPost("tags/tagObjectList",postdata);
		}
		
		
		function getItemTags(type,obj) {
			 return httpService.httpGet("tags/gettags/"+type+"/"+obj.id+"/"+obj.clientId);
		}
		
		function getAllTags(searchKey) {
			var url = "tags/"+encodeURIComponent(searchKey);
			return httpService.httpGet(url);
		}
		
		function getAllTagValues(TagName,searchKey) {
			var url = "tags/getTagValues/"+encodeURIComponent(TagName)+"/"+encodeURIComponent(searchKey);
			return httpService.httpGet(url);
		}
		
		function unTag(tag,item) {
			return httpService.httpDelete("tags/item/"+tag.TagId+"/"+item.id+"/"+item.clientId,{});
		}
		
		function getItemTagsById(item) {
			TagService.getItemTags('high',item).then(function(response){
				if (response.status == 200) {
					item.tags = response.data.Tag;
				} else {
					item.tags = [];
				}
			});
		}
		
	}
	
})();

