/*
 * JS functions to manipulate the VAppgen Draw area to model a view for VApp process.
 */

var VAppgenState = {"ReadyToInit":0, "Initialized":1, "UnderProcess":2, "ReadyToSave":3, "Saved":4};

var VAppgenModel = function() {
	this.ScreenIndex = 0;
	this.ActiveScreen;
	this.Screens = [];
	this.State = VAppgenState.Initialized;
	closure = this; 
	
	var _update = function (activeAnchor) {
        var group = activeAnchor.getParent();
	
        var topLeft = group.get('.topLeft')[0];
        var topRight = group.get('.topRight')[0];
        var bottomRight = group.get('.bottomRight')[0];
        var bottomLeft = group.get('.bottomLeft')[0];
        var image = group.get('.image')[0];

        var anchorX = activeAnchor.getX();
        var anchorY = activeAnchor.getY();
		
        switch (activeAnchor.getName()) {
            case 'topLeft':
                topRight.setY(anchorY);
                bottomLeft.setX(anchorX);
                break;
            case 'topRight':
                topLeft.setY(anchorY);
                bottomRight.setX(anchorX);
                break;
            case 'bottomRight':
                bottomLeft.setY(anchorY);
                topRight.setX(anchorX);
                break;
            case 'bottomLeft':
                bottomRight.setY(anchorY);
                topLeft.setX(anchorX);
                break;
        }
        
        image.setPosition(topLeft.getPosition());
     
        var width = topRight.getX() - topLeft.getX();
        var height = bottomLeft.getY() - topLeft.getY();
        
        if (width && height) {
            image.setSize({width:width, height:height});
        }       
    };
		
    var _addAnchor = function (group, x, y, name) {
        var stage = group.getStage();
        var layer = group.getLayer();
	
        var anchor = new Kinetic.Circle({
            x: x,
            y: y,
            stroke: '#666',
            fill: '#ddd',
            strokeWidth: 2,
            radius: 4,
            name: name,
            draggable: true,
            dragOnTop: false,
            visible: false
        });
       
        anchor.on('dragmove', function () {
     	    console.log ("Anchor dragmove called");
            _update(this);
            layer.draw();
        });
        
        anchor.on('mousedown touchstart', function () {
            group.setDraggable(false);
            console.log ("Anchor mousedown called");
            this.moveToTop();
        });
        
        anchor.on('dragend', function () {
     	   console.log ("Anchor dragend called");
       	   group.setDraggable(true);
           layer.draw();
         //   Diagnostics(layer);
        });
        
        // add hover styling
        anchor.on('mouseover', function () {            	
            var layer = this.getLayer();
            document.body.style.cursor = 'pointer';
            this.setStrokeWidth(4);               
            layer.draw();
        });
        
        anchor.on('mouseout', function () {
            var layer = this.getLayer();
            document.body.style.cursor = 'default';
            this.setStrokeWidth(2);
            layer.draw();
        });

        group.add(anchor);
        
        return anchor;
    };
     
    var _disableAnchor = function (anchor) {
    	if (anchor.isVisible()) {
        	anchor.visible(false);
    	} 
    };
     
    var _enableAnchor = function (anchor) {
	   if (!anchor.isVisible()) {
        	anchor.visible(true);
       } 
    };
   
    var _flipAnchors = function (anchors) {
       	for (var i=0; i<anchors.length; i++) {
    		if (!anchors[i].isVisible()) {
    			anchors[i].visible(true);
    		} else
    			anchors[i].visible(false);
    		}
    };       
	
    var _isControlEnabled = function (anchors) {
    	for (var i=0; i<anchors.length; i++) {
    		if (!anchors[i].isVisible())
    			return false;
    	}
    	
    	return true;
    };
    
    var _diagnostics = function (obj) {
        var json = obj.toJSON();
        console.log(json);
    };    
    
	var _getFlexibleDimension = function (curVal, MaxVal) {
		var result = curVal/MaxVal*100;
		return (result.toFixed(2));		
	};
	
	var _updateControlAttributeValue = function (ctrl, name) {
		var attrs = ctrl.usr.attrs;
		var scrn = closure.Screens[closure.ActiveScreen];
  		var json = ctrl.json;
 	 
 		switch (name) {
			case 'width':
				if (!ctrl.sys.container && ctrl.usr.groupControl) {
					var index = scrn.UniqueIDMap[ctrl.usr.parentId];
					json.attributes[name] = _getFlexibleDimension(ctrl.usr.width, scrn.Controls[index].usr.width);
				} else {
					json.attributes[name] = _getFlexibleDimension(ctrl.usr.width, scrn.ScreenWidth);
				}				
				break;
			case 'height':
				if (!ctrl.sys.container && ctrl.usr.groupControl) {
					var index = scrn.UniqueIDMap[ctrl.usr.parentId];
					json.attributes[name] = _getFlexibleDimension(ctrl.usr.height, scrn.Controls[index].usr.height);
				} else {
					json.attributes[name] = _getFlexibleDimension(ctrl.usr.height, scrn.ScreenHeight);
				}
				break;
			case 'left':
				if (!ctrl.sys.container && ctrl.usr.groupControl) {
					var index = scrn.UniqueIDMap[ctrl.usr.parentId];
					var margin = ctrl.usr.topLeftX - scrn.Controls[index].usr.topLeftX;
						
					json.attributes[name] = _getFlexibleDimension(margin, scrn.Controls[index].usr.width);					
				} else {
					json.attributes[name] = _getFlexibleDimension(ctrl.usr.topLeftX, scrn.ScreenWidth);
				}
				break;
			case 'top':
				if (!ctrl.sys.container && ctrl.usr.groupControl) {
					var index = scrn.UniqueIDMap[ctrl.usr.parentId];
					var margin = ctrl.usr.topLeftY - scrn.Controls[index].usr.topLeftY;
					
					json.attributes[name] = _getFlexibleDimension(margin, scrn.Controls[index].usr.height);
				} else {
					json.attributes[name] = _getFlexibleDimension(ctrl.usr.topLeftY, scrn.ScreenHeight);
				}
				break;
			case 'Position':
			//	attrs[name]=_getControlPosition (scrn, ctrl);
				break;
		}
	};
	
	
	var _updateControlObject = function (ctrl) {
	 
		var attrs = ctrl.sys.attributes;
		 
		for (var i=0; attrs && i<attrs.length; i++){
			_updateControlAttributeValue (ctrl, attrs[i].name);
		}
	};
	
	var _getControlMap = function (id) {
		var scrn = closure.Screens[closure.ActiveScreen];
		
		return (scrn.UniqueIDMap[id]);
	};
	
	var _addToControlsList = function (ctrl, prop){
		var scrn = closure.Screens[closure.ActiveScreen];
	 
		var ctrlObj = {};
		var usr = {};
		var map = {};
 
		usr.topLeftX = prop.origin.x;
		usr.topLeftY = prop.origin.y;
		usr.width = prop.width;
		usr.height = prop.height;
		usr.uniqueID = prop.uniqueID;
		usr.groupControl = prop.isContainerGroup;
		usr.imageObj = prop.imageObject;
		usr.parentNode = prop.parentNode;
				
		/* Assign the sys and usr attributes to newly created object */
		ctrlObj.sys = ctrl.sys;
		ctrlObj.usr = usr;
		
		// Create Object JSON structure
		var jsonObj = {};
		jsonObj["attributes"] = {};
		
		if (typeof scrn.Controls === "undefined") {
			scrn.Controls = [];
		}
		
		// Set the possible values in JSON object
		jsonObj["position"] = scrn.Controls.length+1;
		jsonObj["controlType"] = ctrl.sys.name;
		ctrlObj.json = jsonObj;
	
		// Create hierarchy Map
		if (typeof scrn.HierarchyMap === "undefined"){
			scrn.HierarchyMap = {};			
		} 
		
	 	// Handle custom controls.
		if (ctrlObj.sys.customDesigner) {
			ctrlObj.usr.customDesigner = new window[ctrlObj.sys.customDesigner] ();
		}
		
		// Create Unique Map
		if (typeof scrn.UniqueIDMap === "undefined"){
			scrn.UniqueIDMap = {};			
		} 
						
		scrn.UniqueIDMap[prop.uniqueID]=scrn.Controls.length;
		
		scrn.Controls.push(ctrlObj);
		
	 	if (!ctrl.sys.container && usr.groupControl) {
			// get parent id 
	 		ctrlObj.usr.parentId = usr.parentNode.attrs.id;
			var childrens = scrn.HierarchyMap[ctrlObj.usr.parentId];
			
							
			if (!childrens) {
				childrens = [];		
				scrn.HierarchyMap[ctrlObj.usr.parentId]=childrens;
			}
			
			childrens.push(usr.uniqueID);
		} else {
			scrn.HierarchyMap[usr.uniqueID] = null;
		}
	 	
		_updateControlObject (ctrlObj);
		
		return ctrlObj;
	};	
    
    var _updateControlParams = function (ctrl, dim) {    	
    	ctrl.usr.topLeftX = dim.topLeftX;
    	ctrl.usr.topLeftY = dim.topLeftY;
    	ctrl.usr.width = dim.width;
    	ctrl.usr.height = dim.height;    	
    };
       
    var _getParentControlId = function (id){
    	var scrn = closure.Screens[closure.ActiveScreen];
    	var index = _getControlMap(id);
    	var ctrl = scrn.Controls[index];
    	
    	return ctrl.usr.parentId;    	
    };
    
    var _getDraggedControlCoordinates = function (node, pos, groupControl){
    	var scrn = closure.Screens[closure.ActiveScreen];
    	var img = {x:node.getPosition().x, y:node.getPosition().y};
    	var screenWidth = closure.Screens[closure.ActiveScreen].ScreenWidth;
    	var screenHeight = closure.Screens[closure.ActiveScreen].ScreenHeight;
    	var imgWidth = node.getWidth();
    	var imgHeight = node.getHeight();
    	var newX = pos.x;
    	var newY = pos.y;
    	var offset = 10;
        	
    	if (!groupControl) {
    		if ((img.x+pos.x) <= -1) {
    			newX = -img.x + offset;
    		}
    		if ((img.x+pos.x+imgWidth >= screenWidth)) {
    			newX = pos.x-offset;
    		}
    		if ((img.y+pos.y) <= -1){
       			newY = -img.y + offset;
    		}    	            	          
    		if ((img.y+pos.y+imgHeight) >= screenHeight){
    			newY = pos.y - offset;
    		}
    	} else {
    		var parentCtrlId = _getParentControlId (node.attrs.id);
    		var parentImg = scrn.KineticParams.stage.find("#"+parentCtrlId)[0];
    		var parentImgX = parentImg.getPosition().x;
    		var parentImgY = parentImg.getPosition().y;    		
    		var parentImgWidth = parentImg.getWidth();
    		var parentImgHeight = parentImg.getHeight();
    		
    		/*
    		console.log ("Inside Drag Bound Func Image X: "+img.x+ "Img Y:"+img.y);
        	console.log ("Inside Drag Bound Group Pos X:"+pos.x + " Pos Y: "+pos.y);
        	console.log ("Inside Drag Bound Group Parent Img X:"+parentImg.getPosition().x + " Pos Y: "+parentImg.getPosition().y);
        	console.log ("Inside Drag Bound Group Parent Img Width:"+parentImg.getWidth() + " Height: "+parentImg.getHeight());
        	*/
        	if ((img.x+pos.x) <= parentImgX){
        		console.log ("Child is crossed parges X Right Position ....!!");
        		newX = pos.x+offset;
        	}
        	if ((img.x+pos.x+imgWidth) >= (parentImgX+parentImgWidth)) {
        		console.log ("Child is crossed parges X Left Position ....!!");
    			newX = pos.x-offset;
    		}
        	if ((img.y+pos.y) <= parentImgY){
       			newY = pos.y + offset;
    		}    	            	          
    		if ((img.y+pos.y+imgHeight) >= (parentImgY+parentImgHeight)){
    			newY = pos.y - offset;
    		}
    		
    	}
    	
		return {
			x: newX,
			y: newY,
		};
		
    };
    
    var _updateControlDimensions = function (node) {
    	var mapIndex = _getControlMap (node.attrs.id);	
    	var dim = new Object();
    	var scrn = closure.Screens[closure.ActiveScreen];
     	 
    	dim.topLeftX = node.getPosition().x;
		dim.topLeftY = node.getPosition().y;
		dim.width = node.getWidth();
		dim.height = node.getHeight();
		
		var ctrl = scrn.Controls[mapIndex];
		 
	  	_updateControlParams (ctrl, dim);
    	_updateControlObject (ctrl);
    	
    	return;    	
    };
    
    var _removeControlFromHierarchyMap = function (control) {
    	var scrn = closure.Screens[closure.ActiveScreen];
    	
    	var map = scrn.HierarchyMap[control.usr.parentId];
    	var index = map.indexOf (control.usr.uniqueID, 0);
    	map.splice (index, 1);
    	if (map.length == 0)
    		scrn.HierarchyMap[control.usr.parentId] = null;
    };	
	
    var _recheckGroup = function (group, pos) {
    	var stage = closure.Screens[closure.ActiveScreen].KineticParams.stage;
    	var layer = closure.Screens[closure.ActiveScreen].KineticParams.layer;
    	var scrn = closure.Screens[closure.ActiveScreen];
    	
    	// Find out the current group position.
    	var image = group.find ('.image')[0];
    	var imgPos = image.getPosition();
    	var loc = {x:imgPos.x+pos.x, y: imgPos.y+pos.y};
    	
    	// Flags to move the container
      	var moveToNewContainer = false;
    	var moveToCanvasArea = false;
    
    	var grpCtrl = scrn.Controls[_getControlMap(image.attrs.id)];
      	var newContainer = null;
    	var newParentId = null;    
   
    	/*
    	 * Skip running this function for container group.
    	 */
    	if (grpCtrl.sys.container)
    		return;
     	   	 
    	var parentNode = _getParentContainerNode (loc);
    	if (!parentNode && !grpCtrl.usr.parentId) {
    		console.log ("Move the control around canvas area ...!!");
    		return;
    	}    	
    	
       	if (!parentNode && grpCtrl.usr.parentId && !grpCtrl.usr.container) {
       		console.log ("Move the control on to canvas area ...!!");
       		moveToCanvasArea = true;
       	} 
       	
       	if (parentNode) {
       		if (parentNode.attrs.id == grpCtrl.usr.parentId) {
           		console.log ("Move the control around current container ...!!");       		
           	} else {
           		moveToNewContainer = true;
           		newContainer = parentNode.getParent();
				newParentId = parentNode.attrs.id;
           		console.log ("Move the control on to a new container ...!!");
           	}
       	}
       	
       	if (moveToNewContainer) {
       		console.log ("Restructuring the control hierarchy (move to new container) ....!!");
    		group.remove();
    		    		
    		// Update hierarchy map
    		if (!grpCtrl.usr.partentId) {
    			delete scrn.HierarchyMap[grpCtrl.usr.uniqueID];    			
    		} else {
    			_removeControlFromHierarchyMap(grpCtrl);    			
    		}
    			
    		grpCtrl.usr.groupControl = true;			
			grpCtrl.usr.parentId = newParentId;
    		group.moveTo(newContainer);
    		
    		if (scrn.HierarchyMap[grpCtrl.usr.parentId] == null) {
    			scrn.HierarchyMap[grpCtrl.usr.parentId] = [];
    		}
    			
    		scrn.HierarchyMap[grpCtrl.usr.parentId].push(grpCtrl.usr.uniqueID); 
       	}
       	
       	if (moveToCanvasArea) {
       		console.log ("Restructuring the control hierarchy (move on canvas area) ....!!");
			
			// Update hierarchy map
			if (grpCtrl.usr.parentId) {
				_removeControlFromHierarchyMap(grpCtrl);
				scrn.HierarchyMap[grpCtrl.usr.uniqueID]=null;
			}
			
			group.remove();
			grpCtrl.usr.parentId=null;
			grpCtrl.usr.groupControl = false;
			layer.add(group);
       	}    	
    };
    
    var _resetGroup = function(group, offsetPos){
    	for (var i=0; i < group.children.length; i++) {
    		var shape = group.children[i];
    		if (shape.getClassName()=="Group") {
    			_resetGroup(shape, offsetPos); 
    		} else {    		
	    	//	console.log ("Group set position X : "+ offsetPos.x + " Y :"+ offsetPos.y); 
			//	console.log ("Children set position X: "+ shape.getPosition().x + " Y :"+ shape.getPosition().y);				
				
				var pos = new Object();
				pos.x = shape.getPosition().x + offsetPos.x;
				pos.y = shape.getPosition().y + offsetPos.y;
				   
				shape.setPosition (pos);	
				if (shape.getClassName() == "Image") {
					_updateControlDimensions (shape);
				}
    		}
		 }
		   
		 // Reset the group coordinates
		 var pos = {x:0, y:0};
		 group.setPosition(pos);
		 return;
    };
    
    var _getControlUniqueID = function() {    	
    	var scrn = closure.Screens[closure.ActiveScreen];
    	
    	// Create and Initialize global control sequence number 
    	if (typeof scrn.controlSeqNum === "undefined") {
    		scrn.controlSeqNum = 0;
    	}
    	
    	scrn.controlSeqNum++;
    	var id = "control_"+scrn.controlSeqNum;    	
    		
    	return id;    	
    };
    
    var _isContainerGroup = function (node) {
		var img = node.find('.image')[0];
		var scrn = closure.Screens[closure.ActiveScreen];
		var index = scrn.UniqueIDMap[img.attrs.id];
		
		return scrn.Controls[index].sys.container;
	};
    
    var _getParentContainerNode = function(pos) {
    	var stage = closure.Screens[closure.ActiveScreen].KineticParams.stage;
    	var obj=null;
    	
    	var intersectingNodes = stage.getAllIntersections(pos);
    	
    	for (var i=0; i<intersectingNodes.length; i++) {
    		var element = intersectingNodes[i];
    
    		if (element.getClassName() == "Image" && element.getParent().getClassName() == "Group" &&
    						VAppgenControls.isContainer(element.getParent().attrs.name))    		 
    		{
    			obj = element;
    		}    		
    	}
    	
    	return obj;
    };
    
    var _renderControl = function(ctrl){
    	var layer = closure.Screens[closure.ActiveScreen].KineticParams.layer;
    	var stage = closure.Screens[closure.ActiveScreen].KineticParams.stage;
    	
    	// Create a group Kinetic element.
    	var group = new Kinetic.Group({
    		x: 0,
            y: 0,
            name: ctrl.sys.name,
            draggable: true,
            dragBoundFunc: function(pos){
            	var img = this.find('.image');
            	var loc = null;
        		loc = _getDraggedControlCoordinates (img[0], pos, ctrl.usr.groupControl);        		
        		return {
        			x: loc.x,
        			y: loc.y,
        		};        		
            }
        });	   
			
    	// Add control to group or root canvas				
		if (!ctrl.sys.container && ctrl.usr.groupControl){	
			ctrl.usr.parentNode.getParent().add(group);
		} else {
			layer.add(group);
			stage.add(layer);
		}
			 			   	
	   var imgX = ctrl.usr.topLeftX;
	   var imgY = ctrl.usr.topLeftY;	   
	   
	   var image = new Kinetic.Image({
		   x: imgX,
		   y: imgY,
		   image: ctrl.usr.imageObj,
		   width: ctrl.usr.width,
		   height: ctrl.usr.height,
		   name: 'image',
		   id: ctrl.usr.uniqueID,
	   });
	 	   
	   group.add(image);
	   
	   var topLeftX = ctrl.usr.topLeftX;
  	   var topLeftY = ctrl.usr.topLeftY;
  	   var anchors = [];
  	 	   
  	   anchors[0] = _addAnchor(group, topLeftX, topLeftY, 'topLeft');
  	   anchors[1] = _addAnchor(group, topLeftX+image.getWidth(), topLeftY, 'topRight');
  	   anchors[2] = _addAnchor(group, topLeftX+image.getWidth(), topLeftY+image.getHeight(), 'bottomRight');
  	   anchors[3] = _addAnchor(group, topLeftX, topLeftY+image.getHeight(), 'bottomLeft');
  	   
  	   // Add event handlers on group  
  	   group.on('dragstart', function () {
  		   console.log ("group dragstart called");
  		   closure.State = VAppgenState.UnderProcess;
  		//   _diagnostics(group);
  		   this.moveToTop();
  	   });
  	
  	   
  	   group.on('dragend', function () {
  		   // Drag even is being called for every elemet in the group. TODO FIX
  		   console.log ("group dragend called");
  		
  		   _recheckGroup (group, group.getPosition());
  		 
  		
  		   // Reset the group children coordinates
  		   _resetGroup (group, group.getPosition());
  		   
  		   this.moveToTop();
  		 //  _diagnostics(group);  		  
  	   });          
  	          
  	   image.on('click', function () {
  		   console.log ("image click called");
  		
  		   var selImage = closure.Screens[closure.ActiveScreen].SelectedControl;
  		   if (selImage && selImage != this) {				  
  			   selImage.fire('deselect', null, false);			   
  		   }
  		   this.fire ('select', null, false);
  	   });
  	   
  	   image.on ('deselect', function (e) {
  		    console.log ("Image deselect called");
  		    _flipAnchors(anchors);
  			layer.draw();
  			closure.Screens[closure.ActiveScreen].SelectedControl=null;  		
  	   });
  	   
  	   image.on ('select', function (e) {
  	 	   console.log ("Image select called");
  		   _flipAnchors(anchors);
  		   layer.draw();
  		 	   
  		   if (_isControlEnabled (anchors)) {
  			   var msg = "Control with id : "+ this.attrs.id + " is clicked";
  			   console.log (msg);
  			  // alert(msg); 
  			   closure.Screens[closure.ActiveScreen].SelectedControl = this;
  		   } else
  			   closure.Screens[closure.ActiveScreen].SelectedControl = null;
  	   });
  	  
  	   // To enable the droppped contrl on canvas.
  	   image.fire('click', null, false);
  	   
  	   layer.draw();
  	   stage.draw();
    };
    
    /*
     * Function to drop the control on canvas.
     */
    this.dropControl = function (ctrl) {
       	var isContainerGroup = false;
      	var stage = this.Screens[this.ActiveScreen].KineticParams.stage;
    	var scrn = this.Screens[this.ActiveScreen];
    	var uniqueID = null;
    	var parentNode = null;
    	
    	this.State = scrn.State = VAppgenState.UnderProcess;    	
       	
    	//Check control is part of a container based on dropped location on canvas.
    	var loc = {x:ctrl.topLeftX, y:ctrl.topLeftY};
    	if (!ctrl.sys.container) {
    		parentNode = _getParentContainerNode (loc);
    		if (parentNode)
    			isContainerGroup = true;
    	}
    	
    	//Get the uniqueID for the control to be added on canvas.
    	uniqueID = _getControlUniqueID ();
    	if (!uniqueID) {
    		console.log ("Failed to create unique identifier ..!!");
    		return;
    	}
    	
    	if (!ctrl.sys.container && isContainerGroup){	
			ctrl.height = ctrl.height/2; // reduce the height and widht to fit in container
			ctrl.width = ctrl.width/2;				
		}
    	
    	if (ctrl.sys.name == "Button" || ctrl.sys.name == "Menubar") {
    		ctrl.height = 40;
    		ctrl.width = 100;
    	}
    	
	   // create an object with relevenat properties.
	   var prop = {"origin":loc, "width": ctrl.width, "height": ctrl.height, 
			       "uniqueID": uniqueID, "imageObject":ctrl.obj, 
			       "isContainerGroup": isContainerGroup};
	   if (isContainerGroup) {
		   prop.parentNode = parentNode;
	   }
	   
	   // Attach current control to global list
	   var controlObj = _addToControlsList (ctrl, prop);
	   
	   _renderControl (controlObj);
	   
	   return (controlObj);	  
	};
	
   
	/*
	 * Function to create the draw area
	 */
	this.createDrawArea = function(container, width, height) {
		if (container)
			this.container= container;
		
		var stage = new Kinetic.Stage({
	        container: this.container,
			width: width,
			height: height
		});
	    
	    var layer = new Kinetic.Layer();
	 
		var rect = new Kinetic.Rect({
	        width: canvasWidth,
	        height: canvasHeight,
	        stroke: 'black',
	        strokeWidth: 4
	     });
		
	     layer.add(rect); 
	      
	     stage.add (layer);	
	     stage.draw();
	    
	     this.Screens[this.ActiveScreen].ScreenWidth = width;
	     this.Screens[this.ActiveScreen].ScreenHeight = height;
	     this.Screens[this.ActiveScreen].KineticParams.stage = stage;
	     this.Screens[this.ActiveScreen].KineticParams.layer = layer;	     
	};	
	
	var _createCurrentScreen = function (vappScrn){
		var scrn = new Object;
				
		scrn.KineticParams = new Object ();	
		scrn.SelectedControl = null;
	
		scrn.Controls = [];
		scrn.Json = {};
		scrn.Json.controls = [];
		scrn.ScreenIndex = vappScrn.index;
		
		scrn.State = VAppgenState.Initialized;
		closure.Screens.push(scrn);		
	};
	
	this.createEditScreens = function(vapp) {
		this.User = {};
		this.ModelID = vapp["modelId"];
		this.State = VAppgenState.UnderProcess;
		
		this.User.organizationName = vapp["organizationName"];
		this.User.UserId = vapp["analystId"];
		this.User.UserName = vapp["analystName"];
		this.appName = vapp["appName"];
		this.vappID = vapp["id"];
 
		for (var i=0; i<vapp.screens.length; i++) {
			_createCurrentScreen (vapp.screens[i]);			
		}
				
	};
	
	this.createScreen = function(modelId, user, vappName) {
		var scrn = new Object;
		var index = this.ScreenIndex++;
		
		// Assign default parameters to screen definition
		this.AppName = vappName;
		this.ModelID = modelId;
		this.User = user;
		
		scrn.KineticParams = new Object ();	
		scrn.SelectedControl = null;
		scrn.ScreenIndex = index+1;
		scrn.Controls = [];
		scrn.State = VAppgenState.Initialized;
		this.State = VAppgenState.UnderProcess;
		this.Screens.push(scrn);		
		
		return index;
	};
	
	this.activateScreen = function(index){
		this.ActiveScreen = index;
	};	
	
	this.clearDrawArea = function (){
		var scrn = this.Screens[this.ActiveScreen];
	 
		scrn.KineticParams.stage.clear();
		scrn.KineticParams.stage.destroyChildren();
		scrn.SelectedControl = null;	
		scrn.controlSeqNum = 0;
		scrn.State = VAppgenState.ReadyToInit;
 		
		// Delete all elements in corresponding screen structure.
		for (var key in scrn){
			if (key == "UniqueIDMap" || key == "Controls" || key == "HierarchyMap")
				delete scrn[key];
			else
				continue;
		}
		
		this.createDrawArea (scrn.container, scrn.ScreenWidth, scrn.ScreenHeight);
	};
	
	this.getSelectedControl = function() {
		return (this.Screens[this.ActiveScreen].SelectedControl);
	};
	
	this.deleteControl = function (control) {
		var id = control.attrs.id;
		
		if (control.getClassName() == "Group") {
			console.log ("Deleting the group node");
			control.destroy();
		} else if (control.getClassName() == "Image") {
				console.log ("Deleting the parent of the node");
				control.getParent().destroy();
		} else {
			console.log ("Failed delete the node");
			return
		}
		
		this.Screens[this.ActiveScreen].KineticParams.layer.draw();
		this.Screens[this.ActiveScreen].SelectedControl = null;				
 
		// Remove the JSON element in the structre 
		var scrn = this.Screens[this.ActiveScreen];
	 	var mapIndex = _getControlMap (id);
		var control = scrn.Controls[mapIndex];
		
		if (control.sys.container) {
			// Remove the container and it's chidren
			var map = scrn.HierarchyMap[control.usr.uniqueID];
			if (map && map.length >0) {
				for (var i=0; i<map.length; i++){
					loc = _getControlMap(map[i]);
					scrn.Controls[loc] = null;										
				}
			}
			// Remove the parenet control
			delete scrn.HierarchyMap[control.usr.uniqueID];
			
			var loc = _getControlMap(control.usr.uniqueID);
			scrn.Controls[loc] = null;
			
			delete scrn.UniqueIDMap[control.usr.uniqueID];
		} else {
			if (control.usr.groupControl){
				_removeControlFromHierarchyMap(control);							
			} else {
				delete scrn.HierarchyMap[control.usr.uniqueID];
			}
						
			var index = _getControlMap (control.usr.uniqueID);
			scrn.Controls[index] = null;
			delete scrn.UniqueIDMap[control.usr.uniqueID];
		}
		
		// Update Controls and UniqueID Maps
		var tmpControls = [];
		for (var k=0; k<scrn.Controls.length; k++){
			if (scrn.Controls[k] != null) {
				var ctrl = scrn.Controls[k];
				tmpControls.push(ctrl);			
			}
		}
	 
		scrn.Controls = tmpControls;
		for (var m=0; m<scrn.Controls.length; m++){
			var ctrl = scrn.Controls[m];
			scrn.UniqueIDMap[ctrl.usr.uniqueID]=m;
		}
		
	};
	
	this.getControlAttributes = function (id) {		
		var scrn = this.Screens[this.ActiveScreen];
		var mapIndex = _getControlMap (id);
 
		return (scrn.Controls[mapIndex].sys);				
	};
	 
	this.getControlAttributeValue = function (ctrl_id, name) {		
		 var scrn = this.Screens[this.ActiveScreen];
		 var mapIndex = _getControlMap (ctrl_id);
		 var control = scrn.Controls[mapIndex];
		 var json = control.json;
 		 
	 	 switch (name) {
		 	case "name":
		 	case "position":
		  		return json[name];
		 	break;		 	
		 } 
		 
		 if (json.attributes[name] != undefined)
			 return json.attributes[name];
		 			
		 return null;
	};
	 
	this.updateControlAttributes = function (control_id, attrs){
		 var scrn = this.Screens[this.ActiveScreen];
		 var mapIndex = _getControlMap (control_id);
		 var control = scrn.Controls[mapIndex];
		 var json = control.json;
		 
		 $.each(attrs, function(key,val){
		 	 	if (key == "name" || key == "position") {
				 		json[key]=val;
				} else if (val != "NONE" && val.length != 0){
			 		json.attributes[key] = val;
			 	}	
			});
		 
	};
	var  _getControlSysAttrObject = function (control, key) {
		for (var i=0; i<control.sys.attributes.length; i++){
			if (control.sys.attributes[i].name == key)
				return control.sys.attributes[i];
		}
		return null;
	};
	
	this.validateControlAttributes = function (control_id, attrs){
		var scrn = this.Screens[this.ActiveScreen];
		var mapIndex = _getControlMap (control_id);
		var control = scrn.Controls[mapIndex];
		var err = {};		
		err.status = true;
		
		$.each(attrs, function(key,val){
		 	 	var prop = _getControlSysAttrObject (control, key);
		 	 	if (prop.mandatory && (val == "NONE" || !val.length)) {
		 	 		err.status = false;
		 	 		err.key = key;
		 	 		err.msg = "Please enter "+ key +" property";
		 	 		return false;
		 	 	}		 	 	
			});			
	
		control.usr.validProperties = err.status;
		return err;
	};
	
	var _getScreenJsonControls = function (scrn){
		var controls=[];
		var map = scrn.HierarchyMap;

		$.each (map, function (control, childrens){
			var ctrlIndex = _getControlMap(control);
			var json = scrn.Controls[ctrlIndex].json;
	 
			if (childrens) {
				var ctrls = [];
				for (var i=0; i<childrens.length; i++){
					var index = _getControlMap(childrens[i]);
					ctrls.push(scrn.Controls[index].json);
				}
				json["controls"]=ctrls;
			}
			controls.push(json);
		});
		
		return controls;
	};
	
	this.createJSONObject = function (vAppName) {		
		 var json = {};
	
		 json["organizationName"] = this.User.Organization;
		 json["analystId"] = this.User.UserId;
		 json["analystName"] = this.User.UserName;
		 json["appName"] = vAppName;
		 json["modelId"] = this.ModelID;
		 json["id"] = this.vappID;
		 
		 json.screens = [];
		 
		 for (var i=0; i<this.Screens.length; i++){
			 var scrnObject = {};
			 var curScrn = this.Screens[i];
		
			 scrnObject["index"] = curScrn.ScreenIndex;
			
			 var scrnJson = _getScreenJsonControls(curScrn);
			 scrnObject["controls"] = scrnJson;
						 
			 json.screens.push(scrnObject);
			 curScrn.State = VAppgenState.ReadyToSave;
		 }
		
		 this.State = VAppgenState.ReadyToSave; 
		 return json;		 
	 };
	 
	 this.validateJSONObject = function (json) {
		var scrn = this.Screens[this.ActiveScreen];
		var err = {};
		
		// set status to True
		err.status = true;
		
		/*
		 * TODO 
		 * update the more logic for validation 
		 * Currently validates single screen controls.
		 *	Need to add the multi screen control validations
		 * based on requirments.
		 */
		if (scrn.Controls.length == 0) {
			err.status = false;
			err.msg = "No Controls in Vapp";
			return err;
		} else {
			for (var i=0; i<scrn.Controls.length; i++){
				if (!(scrn.Controls[i].usr.validProperties == undefined) && 
						!scrn.Controls[i].usr.validProperties){
					err.status = false;
					err.msg = "Needs to provide more inputs for control properties";
					return err;
				}
			}
		}
		
		return err;
	 };
	 
	 this.updateVAppgenState = function (status){		 		 
		 for (var i=0; i<this.Screens.length; i++){
			 this.Screens[i].State = status;
		 }
		 
		 this.State = status;		 
	 };
	 
	 this.getVAppgenState = function (){	 
		 return this.State;
	 };
	 
	 var _mapJSONControlAttrs = function (vappScrnIndex, vappCtrl, ctrlObj) {
		 var scrn = closure.Screens[vappScrnIndex-1];
		 var mapIndex = _getControlMap (ctrlObj.usr.uniqueID);
		 var control = scrn.Controls[mapIndex];
		 var json = control.json;
		
		 $.each(vappCtrl, function(key,val){
			 if (key == "name" || key == "position") {
		 		json[key]=vappCtrl[key];
			 }
		 });
		 
		 $.each(vappCtrl.attributes, function(key,val){
		 	 	json.attributes[key] = vappCtrl.attributes[key];
			});	
		 
		 if (ctrlObj.sys.customDesigner){
			 json["designerData"] = vappCtrl.designerData; 
		 }
	 };
	 
	 var _mapJSONControl = function (scn, json, groupControl, parent){
		 var scrn = closure.Screens[scn.index-1];
		 var ctrlProps = VAppgenControls.getMatchingControlAttrs (json.controlType);
		
 		 var imageObj = new Image();
		 imageObj.src = ctrlProps.imageUrl;
		 
		 var image = {};
		 image.obj = imageObj;		 
		 
		 if (groupControl && parent) {
			 var pjsn = {};
			 pjsn.width = parseFloat(((parent.attributes.width*scrn.ScreenWidth)/100).toFixed(2));
			 pjsn.height = parseFloat(((parent.attributes.height*scrn.ScreenHeight)/100).toFixed(2));
			 pjsn.topLeftX = parseFloat(((parent.attributes["left"]*scrn.ScreenWidth)/100).toFixed(2));
			 pjsn.topLeftY = parseFloat(((parent.attributes["top"]*scrn.ScreenHeight)/100).toFixed(2));
			 
			 image.width = parseFloat(((json.attributes.width*pjsn.width)/100).toFixed(2));
			 image.height = parseFloat(((json.attributes.height*pjsn.height)/100).toFixed(2));
			 image.topLeftX = parseFloat(((json.attributes["left"]*pjsn.width)/100).toFixed(2));
			 image.topLeftY = parseFloat(((json.attributes["top"]*pjsn.height)/100).toFixed(2));
			 image.topLeftX = pjsn.topLeftX + image.topLeftX;
			 image.topLeftY = pjsn.topLeftY + image.topLeftY;
			 
			 image.width = image.width*2;
			 image.height = image.height*2;
		 } else {
			 image.width = parseFloat(((json.attributes.width*scrn.ScreenWidth)/100).toFixed(2));
			 image.height = parseFloat(((json.attributes.height*scrn.ScreenHeight)/100).toFixed(2));
			 image.topLeftX = parseFloat(((json.attributes["left"]*scrn.ScreenWidth)/100).toFixed(2));
			 image.topLeftY = parseFloat(((json.attributes["top"]*scrn.ScreenHeight)/100).toFixed(2));	 
			
		 }
		 image.src = imageObj.src;
		 image.sys = ctrlProps;
		 
		 imageObj.onload = function(){
			console.log ("Image object got loaded");
			
			var ctrlObj = closure.dropControl (image);	
		
			_mapJSONControlAttrs (scn.index, json, ctrlObj);
		 };			 
	 };
	 
	
	 this.renderVApp = function (vapp) {		 
		 for (var i=0; i<vapp.screens.length; i++){
			 var scrn = vapp.screens[i];
					 
			 for (var j=0; scrn.controls && j<scrn.controls.length; j++){
				 var ctrl = scrn.controls[j];
				 				 
				 _mapJSONControl (scrn, ctrl, false, null);
			
				 for (var k=0; ctrl.controls && k<ctrl.controls.length; k++) {
					 _mapJSONControl(scrn, ctrl.controls[k], true, ctrl);
				 }
			 }			 
		 }		
	 };
	 
	 this.setVAppID = function (vapp_id) {
		 this.vappID = vapp_id;
	 };
	 
	 this.getVAppID = function () {
		 return this.vappID;
	 };
	 
	 this.getCustomDesigner = function (ctrl){
		 var scrn = this.Screens[this.ActiveScreen];
		 var mapIndex = _getControlMap (ctrl.attrs.id);
		 var control = scrn.Controls[mapIndex];
		 
		 
		 return (control.usr.customDesigner);
	 };
	 
	 this.setCustomDesignerData = function (ctrl, designerData){
		 var scrn = this.Screens[this.ActiveScreen];
		 var mapIndex = _getControlMap (ctrl.attrs.id);
		 var control = scrn.Controls[mapIndex];
		 var json = control.json;
			
		 json["designerData"] = designerData;
		 
		 return true;
	 };
	 
	 this.getCustomDesignerData = function (ctrl){
		 var scrn = this.Screens[this.ActiveScreen];
		 var mapIndex = _getControlMap (ctrl.attrs.id);
		 var control = scrn.Controls[mapIndex];
		 var json = control.json;
			
		 return json["designerData"];
	 };
	return this;
};