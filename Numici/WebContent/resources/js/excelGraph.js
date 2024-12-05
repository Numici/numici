


	

function init(json) {
	var data= json;
	console.log(json);
	var width = $("#rightcontainer").width() - 10;
	height = $("#rightcontainer").height() - 100;
	//data.fixed=true;
	data.x=width/2;
	data.y= height/2;
	
	var div = d3.select("#visuals").append("div").attr("class", "tooltip").style(
			"opacity", 0);

	var force = d3.layout.force().size([ width, height ]).charge(-800)
			.linkDistance(100).linkStrength([ 1 ]).gravity(.5).on("tick", tick).start();

	var drag = force.drag().on("dragstart", dragstart);

	var svg = d3.select("#visuals").append("svg").attr("width", width).attr(
			"height", height);

	svg.append("svg:defs").selectAll("marker").data([ "end" ]).enter().append(
			"svg:marker").attr("id", String).attr("viewBox", "0 -5 10 10")
			.attr("refX", 26).attr("refY", 0).attr("markerWidth", 5).attr(
					"markerHeight", 5).attr("orient", "auto").append(
					"svg:path").attr("d", "M0,-5L10,0L0,5").attr("fill", "red");
	
	
	var orange = svg.append("svg:defs").append("svg:linearGradient").attr(
			"id", "orange").attr("x1", "0%").attr("y1", "0%").attr("x2",
			"100%").attr("y2", "100%").attr("spreadMethod", "pad");

	orange.append("svg:stop").attr("offset", "0%").attr("stop-color",
			"#FCF803").attr("stop-opacity", 1);

	orange.append("svg:stop").attr("offset", "100%").attr("stop-color",
			"#FC0303").attr("stop-opacity", 1);
	var bluegrad = svg.append("svg:defs").append("svg:linearGradient").attr(
			"id", "bluegrad").attr("x1", "0%").attr("y1", "0%").attr("x2",
			"100%").attr("y2", "100%").attr("spreadMethod", "pad");

	bluegrad.append("svg:stop").attr("offset", "0%")
			.attr("stop-color", "blue").attr("stop-opacity", 1);

	bluegrad.append("svg:stop").attr("offset", "100%").attr("stop-color",
			"black").attr("stop-opacity", 1);
	
	var WRgradient = svg.append("svg:defs").append("svg:linearGradient").attr(
			"id", "WRgradient").attr("x1", "0%").attr("y1", "0%").attr("x2",
			"100%").attr("y2", "100%").attr("spreadMethod", "pad");

	WRgradient.append("svg:stop").attr("offset", "0%").attr("stop-color",
			"black").attr("stop-opacity", 1);

	WRgradient.append("svg:stop").attr("offset", "100%").attr("stop-color",
			"white").attr("stop-opacity", 1);
	var defs = svg.append('svg:defs');
	defs.append('svg:linearGradient')
			.attr('x1', "0%").attr('y1', "0%").attr('x2', "100%").attr('y2', "0%")
			.attr('id', 'blue').call(
				function (blue) {
	      		blue.append('svg:stop').attr('offset', '0%').attr('style', 'stop-color:rgb(0,0,250);stop-opacity:1');
	      		blue.append('svg:stop').attr('offset', '100%').attr('style', 'stop-color:rgb(250,250,250);stop-opacity:1');
				});
	defs.append('svg:linearGradient')
	.attr('x1', "0%").attr('y1', "0%").attr('x2', "100%").attr('y2', "0%")
	.attr('id', 'pink').call(
		function (blue) {
  		blue.append('svg:stop').attr('offset', '0%').attr('style', 'stop-color:rgb(250,0,250);stop-opacity:1');
  		blue.append('svg:stop').attr('offset', '100%').attr('style', 'stop-color:rgb(250,250,250);stop-opacity:1');
		});

	var link = svg.selectAll(".link"), node = svg.selectAll(".node");
	
	
	

    update();
	function update(){
		var nodes = flatten(data);
		var links = d3.layout.tree().links(nodes);
		 
		 force
	      .nodes(nodes)
	      .links(links)
	      .start();

		link = link.data(links,function(d) { return d.target.id; });
		link.exit().remove();
		link.enter().insert("line", ".node")
	      .attr("class", "link").attr("marker-end", "url(#end)");


		node = node.data(nodes, function(d) { return d.id; });
		node.exit().remove();
		 
		 
		var nodegroup= node.enter().append("g")
	      .attr("class", "node")
	      .on("click", click)
	      .call(force.drag);
		nodegroup.append("svg:circle").attr("class", "node").attr("r", function(d) {
			return 8;
		});
		
		nodegroup.append('text').attr('class', 'text')
	      .text(function(d) {
	    	  if(d.columnName){
	  			return d.columnName+d.rowIndexFrom+" to "+d.columnName+d.rowIndexTo;
	  		}else if(d.rowIndex){
	  			return d.columnNameFrom+d.rowIndex+" to "+d.columnNameTo+d.rowIndex;
	  		}else if(d.components){
	  			return d.columnNameFrom+"["+d.rowIndexFrom+":"+d.rowIndexTo+"] to "+d.columnNameTo+"["+d.rowIndexFrom+":"+d.rowIndexTo+"]";
	  		}else return d.name;
			});
	     
		node.attr("fill", color)
		.on(
				"mouseover",
				function(d, i) {
					//alert(d);
					
					var markup = '<table border="1" cellpadding="5">';
					if(d.name !=="Models" ){
						$.each(d,function(key,value){
							if( value !== null ){
								if(key==="updatedOn" || key==="fileCreatedDate" || key==="fileUpdatedDate" || key==="createdOn"  ){
									
									markup += '<tr><td>' +key+ '</td><td>'
									+convertDate(value) + '</td></tr>';
								}else if(key==="mergedCell" || key==="rowIndexFrom" || key==="rowIndexTo" || key==="columnName" 
									|| key==="rowIndex" || key==="columnNameFrom" || key==="columnNameTo" || key==="rformula" ||
									key==="formula" || key==="sheetname" || key==="name" || value==="Model"){
									markup += '<tr><td>' +key+ '</td><td>'
									+value + '</td></tr>';
								}
								
							}
							
						});
					}
					
		
					markup += '</table>';
					div.transition().duration(200).style("opacity", .9);
					div.html(markup).style("left", 0 + "px").style("top",
							60 + "px");
				}).on("mouseout", function(d) {
			div.transition().duration(500).style("opacity", 0);
		});
		
		
	     
		
	}
	
	function color(d) {
		if(d.columnName){
			return "url(#bluegrad)";
		}else if(d.rowIndex){
			return "url(#pink)";
		}else if(d.components){
			return "url(#orange)";
		}else return "url(#WRgradient)";
		  
		}
	function tick() {
		
		link.attr("x1", function(d) { return d.source.x; })
	      .attr("y1", function(d) { return d.source.y; })
	      .attr("x2", function(d) { return d.target.x; })
	      .attr("y2", function(d) { return d.target.y; });
	 
	  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		

	}
	
	function click(d) {
		if (d3.event.defaultPrevented) return;
		  if (d.children) {
		    d._children = d.children;
		    d.children = null;
		  } else if(d._children){
		    d.children = d._children;
		    d._children = null;
		  }else {
			
			 loadChildren(d);
		  }
		  update();
		}

	function flatten(data) {
		  var nodes = [], i = 0;

		  function recurse(node) {
			if (node.children) node.children.forEach(recurse);
		    if (!node.id) node.id = ++i;
		    nodes.push(node);
		   
		  }

		  recurse(data);
		  return nodes;
		}
	function dragstart(d) {
		
		//d.fixed = true;
		//d3.select(this).classed("fixed", true);
	}
	
	function loadChildren(d){
		
		$.ajax({
			type : 'GET',
			contentType : 'application/json',
			url : mergedNodeUrl+"?modelId="+d.id,
			dataType : "json",
			success : function(mergedNodes, textStatus, jqXHR) {
				if(mergedNodes.length>0){
					console.log(mergedNodes);
					d.children=mergedNodes;
					 update();
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				alert('error: ' + textStatus);
			}
		});
		
	}
}
function convertDate(inputFormat) {
	  var d = new Date(inputFormat);
	  return [d.getDate(), d.getMonth()+1, d.getFullYear()].join('-');
	}