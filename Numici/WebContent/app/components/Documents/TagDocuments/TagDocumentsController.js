;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('TagDocumentsController',TagDocumentsController);
	
	TagDocumentsController.$inject = ['$scope','_', '$uibModalInstance','item','userinfo','TagService','$confirm','orderByFilter'];
	
	function TagDocumentsController($scope,_, $uibModalInstance,item,userinfo,TagService,$confirm,orderByFilter) {
		
		  var vm = this;
		
		  // Variables
		  vm.items = item;
		  vm.Alltags = [];
		  vm.tag = '';
		  vm.selectedTags ={
				  tags : []
	      };
		  
		  //Methods
		  vm.showTagName = showTagName;
		  vm.refreshTagInfo = refreshTagInfo;
		  vm.onRemoveTag = onRemoveTag;
		  vm.onSelectTag = onSelectTag;
		  vm.onSelectDocumentTag = onSelectDocumentTag;
		  vm.tagFilterSelected = tagFilterSelected;
		  vm.tagTransform = tagTransform;
		  vm.setTags = setTags;
		  vm.unTag = unTag;
		  vm.ok = ok;
		  vm.cancel = cancel;
		  
		  function showTagName(tag) {
			  var tagName = angular.copy(tag.TagName);
			  if(!_.isEmpty(tag.Value)) {
				  tagName = tagName +" : "+ tag.Value;
			  }
			  return tagName;
		  }
		  
		  function refreshTagInfo(searchkey) {
			  if(!_.isEmpty(searchkey)) {
				  TagService.getAllTags(searchkey).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							vm.Alltags = resp.data.Tag; 
						}
					});
			  }
		  }
			
			
		 function onRemoveTag(tag) {
			  	if(tag.TagId) {
			  		 vm.unTag(tag);
			  	}
		 }
		 
		 function onSelectTag(tag) {
			 tag.isNew = true;
			 var tagArray = tag.TagName.split(":");
			 tag.TagName = tagArray[0].trim();
			 if(!_.isEmpty(tagArray[1])) {
				 tag.Value = tagArray[1].trim();
			 }
			 return tag;
		 }
		 
		 $scope.tagFilterSelected = function(tag,selected) {
			 if(_.isEmpty(tag.TagName)){
				 return true;
			 }
			 
			 if( _.isArray(selected)) {
				 var found = _.find(selected, function(term) {
					 var val = term.TagName.trim();
					 var tagText = tag.TagName.trim();
					 return val.toLowerCase() == tagText.toLowerCase(); 
				 });
				 
				 if(found) {
					 return true;
				 }
			 }
			 return false;
		 };
		 
		 
		 function onSelectDocumentTag(tag) {
			 var tag = vm.onSelectTag(tag);
			 var selectedTags = vm.selectedTags.tags;
			 if(_.isEmpty(tag.TagName)) {
				 vm.selectedTags.tags = _.without(selectedTags, _.findWhere(selectedTags, {"TagName" : ""}));
			 } else {
				 if(_.isArray(selectedTags) && !_.isEmpty(tag.TagName)) {
					 var lowerQuery =  tag.TagName.toLowerCase();
					 var matched = _.filter(selectedTags, function(term) {
					    return term.TagName.toLowerCase() == lowerQuery;
					 });
					 if(matched && matched.length > 0) {
						 selectedTags = _.reject(selectedTags, function(term){ 
							 var val = term.TagName.trim();
							 var tagText = tag.TagName.trim();
							 return val.toLowerCase() == tagText.toLowerCase(); 
						 });
						 selectedTags.push(tag);
						 vm.selectedTags.tags = selectedTags;
					 }
				 }
			 }
			
		 }
		 
		 
		 function tagFilterSelected(tag,selected) {
			 if(_.isEmpty(tag.TagName)){
				 return true;
			 }
			 
			 if( _.isArray(selected)) {
				 var found = _.find(selected, function(term) {
					 var val = term.TagName.trim();
					 var tagText = tag.TagName.trim();
					 return val.toLowerCase() == tagText.toLowerCase(); 
				 });
				 
				 if(found) {
					 return true;
				 }
			 }
			 return false;
		 }
		 
		 function tagTransform(tagname) {
			 if(!_.isEmpty(tagname)) {
				 tagname = tagname.trim()
			 }
		  	 return {
		  		"TagId":null,
		  		"TagName" : tagname,
		  		"isNew" : true
		  	};
		 }
		
		 function setTags() {
			 if(angular.isArray(vm.items) && vm.items.length > 0) {
				 if(vm.items.length == 1) {
					 vm.items[0].tags =  orderByFilter(vm.items[0].tags, "TagName");
					 vm.selectedTags.tags = angular.copy(vm.items[0].tags);
				 } else {
					 
				 }
			 }
		 }
		 
		 function unTag(tag,$event) {
			 vm.selectedTags.tags = angular.copy(vm.items[0].tags);
			 if($event) {
				 $event.preventDefault();
		 		 $event.stopPropagation();
	  		 }
		 	 if(angular.isArray(vm.items) && vm.items.length > 0) {
		 		 _.each(vm.items,function(item,index) {
					  if(hasTag(item.tags,tag.TagId)) {
						  removeTag(tag,item);
					  }
				 });
			 }
			 	
		 }
		  
		 function hasTag(tags,tagid) {
			 var status = false;
			 var match = _.find(tags, function(tag){ return tag.TagId  == tagid; });
			 if(match) {
				 status = true;
			 }
			 
			 return status;
		 }
		 
		 function removeTag(tag,item) {
			 if(tag) {
				var text = "Are you sure you want to delete Tag "+tag.TagName+" ?";
	  			$confirm({text: text})
		        .then(function() {
		        	TagService.unTag(tag,item).then(function(response){
						if (response.status == 200) {
							vm.selectedTags.tags = _.reject(vm.selectedTags.tags, function(rTag){ 
								return rTag.TagId == tag.TagId; 
							});
							TagService.getItemTagsById(item);
							
						}
					});
			    }, function() {
			    	
			    });
			 }
			 
		 }
		 
		 function processTags() {
			 var tagsToSave = [];
			 _.each(vm.selectedTags.tags,function(selectedTag){
				 if(selectedTag.isNew) {
					 tagsToSave.push({"TagName" : selectedTag.TagName,"Value" : selectedTag.Value});
				 }
			 });
			 return tagsToSave;
		 }
		 
		 function ok() {
			 var tags = processTags();
			 if(vm.items.length > 0 && tags && tags.length > 0) {
				 $uibModalInstance.close({"items":vm.items,"tags" : tags});
			 } else {
				vm.cancel();
			 }
			
		 }

		 function cancel() {
			 $uibModalInstance.dismiss('cancel');
		 }
		 
		 vm.setTags();
	}
})();