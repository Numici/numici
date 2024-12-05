/**
 * New node file
 */
var MenubarControl =function(options){

	if("undefined" != typeof options){
		if("undefined" != typeof options.model) {
			this.Model= options.model;
		} else {
			this.Model=null;
		}
		if ("undefined" != typeof options.selector) { 
			this.selector = options.selector; 
		} else { 
			this.selector=null; 
		}
		if ("undefined" != typeof options.actions) { 
			this.actions = options.actions; 
		} else { 
			this.actions=null; 
		}
		
	}else{
		this.Model=null;	
		this.selector=null;
		this.actions = null;
	}
	 
	this.CustomAttributes={
			"label": null,
			"action": null,					
		};
	mbClosure = this;
};
 
MenubarControl.prototype= new VidiViciControl();

MenubarControl.prototype.setSelector=function(selector){
	this.selector = selector;
};

MenubarControl.prototype.getSelector=function(){
	return this.selector;
};

MenubarControl.prototype.setModel=function(model){
	this.Model = model;
};

MenubarControl.prototype.getModel=function(){
	return this.Model;
};

var addMenuAction=function (item) {

	var jstree = $(".tree").jstree(true);
	var selectedNode = jstree.get_selected('full');
	
	selectedNode[0].data.action = item.value;
	
	return;
};

var addMenuLabel=function (item) {
 
	var jstree = $(".tree").jstree(true);
	var selectedNode = jstree.get_selected('full');
	
	jstree.rename_node (selectedNode[0], item.value);
	return;
};

MenubarControl.prototype.displayMenuItemProperties=function(element, propsDiv) { 
	var node = element.node;
	var label = node.text;
	var markup = '<table border="1" style="width:100%"> <tr>\
		  			<th>Property Name</th>\
		  			<th> Value </th>\
		  			</tr>';
	
	propsDiv.empty();
	 
	if (label == "Menu Bar") {
		mbClosure.disable_irrelevant_action_buttons ();
		return;
	} else {
		mbClosure.enable_all_action_buttons ();
	}
	
	$.each(this.CustomAttributes, function(key,val){
		markup += '<tr> <td>';
		markup += key;				
		markup += '</td>'; 
		markup += '<td>';
		
 	 	switch (key) {
 	 		case "label":
 	 			val = label;
 	 			markup += '<input type="text" onchange="addMenuLabel(this)" class="properties" dataAttr="'+key+'" style="width:100%" name="inp_value"   value="'+(val == undefined?"":val)+'">';
 	 			break;
 	 		case "action":
 	 			var txt;
 	 		
 	 			if (node.li_attr.menutype == "menu")
 	 				txt = '<select disabled onchange="addMenuAction(this)" class="properties" dataAttr="'+key+'">';
 	 			else
 	 				txt = '<select onchange="addMenuAction(this)" class="properties" dataAttr="'+key+'">';
				
				for (var m=0; m<mbClosure.actions.length; m++){
					var opt = mbClosure.actions[m];
					var caption = opt.caption;
					var code = opt.code;
					
					if (code == val)
						txt += '<option selected="selected" value='+code+'>'+caption+'</option>';
					else
						txt += '<option value='+code+'>'+caption+'</option>';						
				}	
				
				txt += '</select>';
				markup += txt;
				break; 	 		
 	 	}	
 	 	
 	 	markup += '</td> </tr>';
	});
	
	markup += '</table>';
	
	propsDiv.append(markup);
	
};

MenubarControl.prototype.contextMenu=function(node) {
    // The default set of all items
    var items = {
        createItem: { // The "create" menu item
            label: "Create",
            action: function (data) {
            	var inst = $.jstree.reference(data.reference),
            			obj = inst.get_node(data.reference);
                mbClosure.jstree_create_node (obj);                                          
            }
        },
        renameItem: { // The "rename" menu item
            label: "Rename",
            action: function (data) {
            	var inst = $.jstree.reference(data.reference),
    					obj = inst.get_node(data.reference);
                mbClosure.jstree_rename_node (obj);  
            }
        },
        deleteItem: { // The "delete" menu item
            label: "Delete",
            action: function (data) {
            	var inst = $.jstree.reference(data.reference),
						obj = inst.get_node(data.reference);
                mbClosure.jstree_delete_node (obj);               
            }
        }
    };
    
    // Remove the rename and delete items for root node
    if (node.parent === "#") {
    	delete(items.renameItem);
    	delete(items.deleteItem);
    }
    
    return items;
};

MenubarControl.prototype.jstree_create_node=function(node) {
	var jstree = $(".tree").jstree(true);
	
	jstree.create_node(node, {}, "last", function (new_node) {
	    new_node.data = {file: true};
	    new_node.li_attr.menutype = "menu-item";
	    setTimeout(function () { jstree.edit(new_node); },0);
	});
	
	// Add menu type on creating the node.
	if (node.li_attr.menutype && node.li_attr.menutype == "menu-item") {
		node.li_attr.menutype = "menu";
		if (node.data.action)
			delete (node.data.action);
	}   
	
};

MenubarControl.prototype.jstree_rename_node=function(node) {
	var jstree = $(".tree").jstree(true);
	  
	jstree.edit(node);
};

MenubarControl.prototype.jstree_delete_node=function(node) {
	var jstree = $(".tree").jstree(true);
	 
	if(jstree.is_selected(node)) {
	    jstree.delete_node(jstree.get_selected());
	}
	else {
	    jstree.delete_node(node);
	}
	
};

MenubarControl.prototype.disable_irrelevant_action_buttons=function() {
	var buttons = $(".custom-btn-group .btn");
	 
	if (buttons.length > 0) {
	 	$.each(buttons, function(i,v){
	 		label = $(v).attr("name");
	 	 	if (label == "Rename" || label == "Delete") {
	 	 		$(this).prop( "disabled", true);
	 				 			
	 		}
		});
	}
};

MenubarControl.prototype.enable_all_action_buttons=function() {
	var buttons = $(".custom-btn-group .btn");
 
	if (buttons.length > 0) {
	 	$.each(buttons, function(i,v){
	 	 	 $(this).prop( "disabled", false);	 		 
		});
	}
};

MenubarControl.prototype.initialize=function(){
	if(mbClosure.selector){
		var parent = mbClosure.selector;
		var buttonBar = '<div class="custom-btn-group">\
							<button type="button" name="Create" class="btn btn-primary">Create</button>\
		  					<button type="button" name="Rename" class="btn btn-primary">Rename</button>\
		  					<button type="button" name="Delete" class="btn btn-primary">Delete</button>\
						</div>';
	 
		$(parent).append(buttonBar);
		
	 	$(parent).append('<br><br>');
	 	
		var container='<div class="container">\
						<div class="row">\
				  			<div class="col-md-8" style="background:#E6E6FA; height:400px;">\
								<div class="row tree"></div>\
							</div> \
							<div class="col-md-4" style="background: #C0C0C0; height:400px;">\
								<div class="row props"></div>\
							</div>\
						</div>\
					</div>';
				
		$(parent).append(container);
		
	}
	
	$(".custom-btn-group .btn").click(function(){
		var jstree = $(".tree").jstree(true);
		var selectedNode = jstree.get_selected('full');
		var name = $(this).attr("name");
    	$(this).prop( "disabled", true );
         	
    	switch (name){
    	case 'Create':
    		console.log("Custom dialog create button invoked");
    			mbClosure.jstree_create_node (selectedNode[0]);    			
    		break;
    	case 'Rename':
    		console.log("Custom dialog delete button invoked");
    		mbClosure.jstree_rename_node (selectedNode[0]);
    		break;
    	case 'Delete':
    		console.log("Custom dialog delete button invoked");
    		mbClosure.jstree_delete_node (selectedNode[0]);
    		break;
    	}
    	$(this).prop( "disabled", false);
	});
};

MenubarControl.prototype.getMenuItem = function(node) {
	var item = {};
	
	item.data = {};
	item.li_attr = {};
	
	item.text = node.label;
	item.data.action = node.action;
	item.li_attr.menutype = node.menutype;
	
	item.state = {};
	item.state.opened = true;
	
	if (node.children && node.children.length > 0) {
		item.children = [];
		var element=null;
		for (var i=0; i<node.children.length; i++){
			element = this.getMenuItem(node.children[i]);
		}		
		item.children.push(element);
	}
		
	return item;
};

MenubarControl.prototype.getMenubarItems=function(root){
	var parent = {};
	
	parent.text = root.label;
	parent.li_attr = {};
	parent.li_attr.menutype = root.menutype;
	
	parent.state = {};
	parent.state.opened = true;
 	
	var nodes = root.children;
	
	if (nodes && nodes.length > 0)
		parent.children = [];
	
	for (var i=0; nodes && nodes.length > 0 && i < nodes.length; i++){
		var item = this.getMenuItem(nodes[i]);
		parent.children.push(item);
	}
	
	return parent;	
};

MenubarControl.prototype.renderControl=function(){
	var parent = this.getSelector();
	var jsTree = $(parent).find(".tree");
	var data = {};

	if (this.designerData) {
		data = this.getMenubarItems (this.designerData);			
	} else {
		data.text = "Menu Bar";
		data.li_attr = {};
		data.li_attr.menutype = "root-node";
	}
	
	jsTree.jstree({
					'core' : {
								'data': data,
							    'check_callback': true,
							     "multiple": false,
							     "themes" : {
							         "icons" : false
							       }						 
							},
					"plugins": [ "contextmenu", "unique", "dnd" ],
					"contextmenu": {items: mbClosure.contextMenu}
				});
	
	$(".tree").on("select_node.jstree", function (e, data) {
		console.log ("Node selected ............!!");
		console.log(data.selected);
		mbClosure.displayMenuItemProperties(data, $(".props"));
	});		
};

MenubarControl.prototype.LaunchControl= function(){
	this.initialize();
	this.renderControl();
};

MenubarControl.prototype.setDesignerData= function(data){
	this.designerData= data;
};

MenubarControl.prototype.getDesignerData= function(){
	return this.designerData;
};

MenubarControl.prototype.getJsonObject = function (element) {
	var json={};
			
	json.label = element.text;
	if (element.data)
		json.action = element.data.action;
	json.menutype = element.li_attr.menutype;
	
	if (element.children && element.children.length > 0) {
		json.children = [];
		for (var i = 0; i < element.children.length; i++){
			var child = mbClosure.getJsonObject(element.children[i]);
			json.children.push(child);
		}
	}
	
	return json;
	
};

MenubarControl.prototype.saveControl= function(){
	var parent = this.getSelector();
	var json=null;
	var jsTree = $(parent).find(".tree").jstree(true);
	var parent = jsTree.get_json('#');
	
	if (parent && parent.length > 0) {
		json = this.getJsonObject (parent[0]);
	}
	
	return json;
};

MenubarControl.prototype.render= function(){
	var markup='<nav class="navbar navbar-default" role="navigation">\
  <div class="container-fluid">\
    <!-- Brand and toggle get grouped for better mobile display -->\
    <div class="navbar-header">\
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">\
        <span class="sr-only">Toggle navigation</span>\
        <span class="icon-bar"></span>\
        <span class="icon-bar"></span>\
        <span class="icon-bar"></span>\
      </button>\
      <a class="navbar-brand" href="#"></a>\
    </div>\
    <!-- Collect the nav links, forms, and other content for toggling -->\
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">\
      <ul class="nav navbar-nav">\
        <li class="dropdown">\
          <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown <span class="caret"></span></a>\
          <ul class="dropdown-menu" role="menu">\
            <li><a href="#">Action</a></li>\
            <li><a href="#">Another action</a></li>\
            <li><a href="#">Something else here</a></li>\
            <li class="divider"></li>\
            <li><a href="#">Separated link</a></li>\
            <li class="divider"></li>\
            <li><a href="#">One more separated link</a></li>\
          </ul>\
        </li>\
      </ul>\
    </div><!-- /.navbar-collapse -->\
  </div><!-- /.container-fluid -->\
</nav>';
	
	var el = this.renderContainer();
	$.each(this.attributes,function(key,val){
		
		switch(key){
		case "editable":
			break;
		case "float":
		case "position":
			el.css(key,val);
			break;
		default:
			el.css(key,val+"%");
		}
	});
	el.append(markup);
	
};

