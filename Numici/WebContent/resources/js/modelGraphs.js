var NodeTreeView =(function(){

	
	this.getNodeTree=function(data,id,model){
		var obj=JSON.stringify(data);
		var t= JSON.parse(obj);
		console.log(t);
		$(id).empty();
		var root = {};
		root.label = model;
		root.children = t;
		console.log(root);
		var margin = {
			top : 20,
			right : 120,
			bottom : 20,
			left : 120
		}, width = 960 - margin.right - margin.left, height = 800 - margin.top
				- margin.bottom;
		var i = 0, duration = 750, rectW = 100, rectH = 30;

		var tree = d3.layout.tree().nodeSize([ 110, 40 ]);

		$("#treeToolTip").empty();
		var toolTip = d3.select("#treeToolTip").append("div").attr("class", "tooltip").style(
				"opacity", 0);
		var svg = d3.select(id).append("svg").attr("width", 10000).attr("height",
				10000).style("background-color","white").call(
				zm = d3.behavior.zoom().scaleExtent([ 0.3, 1.5 ]).on("zoom", redraw))
				.append("g").attr("transform", "translate(" + (width/2) + "," + 20 + ")");

		zm.translate([ 350, 20 ]);

		root.x0 = 0;
		root.y0 = height / 2;

		function collapse(d) {
			if (d.children) {
				d._children = d.children;
				d._children.forEach(collapse);
				d.children = null;
			}
		}

		root.children.forEach(collapse);
		update(root);

		d3.select(id).style("height", "800px");

		function update(source) {

			// Compute the new tree layout.
			var nodes = tree.nodes(root).reverse(), links = tree.links(nodes);

			// Normalize for fixed-depth.
			nodes.forEach(function(d) {
				d.y = d.depth * 100;
			});

			// Update the nodes…
			var node = svg.selectAll("g.node").data(nodes, function(d) {
				return d.id || (d.id = ++i);
			});

			// Enter any new nodes at the parent's previous position.
			var nodeEnter = node.enter().append("g").attr("class", "node").attr(
					"transform", function(d) {
						return "translate(" + source.x0 + "," + source.y0 + ")rotate(45)";
					}).on("click", click)
					.on("mouseover",function(d){

						toolTip.transition().duration(200).style("opacity", .9);
						toolTip.html(d.label).style("left", event.pageX+"px").style("top",
								event.pageY+ "px");
					}).on("mouseout",function(d){
						toolTip.transition().duration(200).style("opacity", 0);

					});

			nodeEnter.append("rect").attr("width", rectW).attr("height", rectH)
					.attr("stroke", "black").attr("stroke-width", 1).style("fill",
							function(d) {
								return d._children ? "lightsteelblue" : "#fff";
							});

			/*nodeEnter.append("text").attr("x", rectW / 2).attr("y", rectH / 2)
					.attr("dy", ".1em").attr("text-anchor", "middle").text(
							function(d) {
								return d.label;
							}).style("font-size","10px");*/
			nodeEnter.append("foreignObject")
		    .attr("width", 100)
		    .attr("height", 30)
		  .append("xhtml:div")
		    .style("font", "1em 'Helvetica Neue'")
		    .attr("class","nodetable")
		    .html(function(d){
		    	return '<p>'+d.label+'</p>';
		    });

			// Transition nodes to their new position.
			var nodeUpdate = node.transition().duration(duration).attr("transform",
					function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					});

			nodeUpdate.select("rect").attr("width", rectW).attr("height", rectH)
					.attr("stroke", "black").attr("stroke-width", 1).style("fill",
							function(d) {
								return d._children ? "lightsteelblue" : "#fff";
							});

			nodeUpdate.select("text").style("fill-opacity", 1);

			// Transition exiting nodes to the parent's new position.
			var nodeExit = node.exit().transition().duration(duration).attr(
					"transform", function(d) {
						return "translate(" + source.x + "," + source.y + ")";
					}).remove();

			nodeExit.select("rect").attr("width", rectW).attr("height", rectH)
					.attr("stroke", "black").attr("stroke-width", 1);

			nodeExit.select("text");

			var link = svg.selectAll("path.link").data(links, function(d) {
				return d.target.id;
			});

			// Enter any new links at the parent's previous position.
			link.enter().insert("path", "g").attr("class", "link").attr("x",
					rectW).attr("y", rectH).attr("d", function(d) {
				var o = {
					x : source.x0,
					y : source.y0
				};
				return elbow({
					source : o,
					target : o
				});
			}).on("click", function(d) {
				////console.log(d.source);
			});

			// Transition links to their new position.
			link.transition().duration(duration).attr("d", elbow);

			// Transition exiting nodes to the parent's new position.
			link.exit().transition().duration(duration).attr("d", function(d) {
				var o = {
					x : source.x,
					y : source.y
				};
				return elbow({
					source : o,
					target : o
				});
			}).remove();

			// Stash the old positions for transition.
			nodes.forEach(function(d) {
				d.x0 = d.x;
				d.y0 = d.y;
			});
		}
		function elbow(d, i) {
			return "M" + (d.source.x + rectW / 2) + "," + (d.source.y + rectH)
					+ "V" + (d.target.y-rectH) + "H"
					+ (d.target.x + rectW / 2) + "v" + rectH;

		}
		// Toggle children on click.
		function click(d) {
			//$.each(d,function(i,v){////console.log(i+":"+v);});
			//console.log(d.object);
			if(d.object){
				mrgdNodeOnGrid(d.object);
			}

			if (d.children) {
				d._children = d.children;
				d.children = null;
			} else {

				d.children = d._children;
				d._children = null;

			}
			update(d);
		}

		// Redraw for zoom
		function redraw() {

			svg.attr("transform", "translate(" + d3.event.translate + ")"
					+ " scale(" + d3.event.scale + ")");
		}


	};

	function mrgdNodeOnGrid(data){
		var node=data;

		//console.log(node);
		var sheetId= node.sheetId || node.id;
		var index = $('#excellviewtabs a[data-sheet="'+sheetId+'"]').parent().index();
		var sheetwrapper= $( '#excellviewtabs div[data-sheet="'+sheetId+'"]' );
		$('#excellviewtabs').tabs("option","active",index);

		$('#excellviewtabs td').removeClass("mergednode");

		if(node.columnNameFrom && node.rowIndex && node.columnNameTo){
			var columnNameFrom = node.columnNameFrom;
			var rowIndex=node.rowIndex;
			var columnNameTo=node.columnNameTo;
			var cellid=columnNameTo+rowIndex;
			var position = $(sheetwrapper).find('.gridBody tr[row-no='+rowIndex+']').position();
			var hrz_position=$(sheetwrapper).find('.gridBody td[cell-id='+columnNameFrom+rowIndex+']').position();
			var $row =$('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+columnNameFrom+rowIndex+']');

			//alert( hrz_position.left);
			$(".gridBody").scrollTop( position.top);
			$(".gridBody").scrollLeft( hrz_position.left );
			//$(".gridBody").animate({scrollTop: position.top}, '500', 'swing');
			//$(".gridBody").animate({scrollLeft: hrz_position.left-100}, '500', 'swing');

			$row.nextUntil('td[cell-id='+cellid+']')
			.addBack().add('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+cellid+']').addClass("mergednode").data();

		}else if(node.columnName && node.rowIndexFrom && node.rowIndexTo){
			var columnName = node.columnName;
			var rowIndexFrom= node.rowIndexFrom;
			var rowIndexTo = node.rowIndexTo;
			var position = $(sheetwrapper).find('tr[row-no='+rowIndexFrom+']').position();
			var hrz_position=$(sheetwrapper).find('td[cell-id='+columnName+rowIndexFrom+']').position();

			$(".gridBody").scrollTop( position.top);
			$(".gridBody").scrollLeft( hrz_position.left );
			//$(".gridBody").animate({scrollTop: position.top}, '500', 'swing');
			//$(".gridBody").animate({scrollLeft: hrz_position.left-100}, '500', 'swing');
			while(rowIndexFrom <= rowIndexTo ){
				var $cell = $('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+columnName+rowIndexFrom+']');
				$cell.addClass("mergednode");
				rowIndexFrom++;
			}

		}else if(node.columnNameFrom && node.columnNameTo && node.rowIndexFrom && node.rowIndexTo){
			var columnNameFrom = node.columnNameFrom;
			var columnNameTo= node.columnNameTo;
			var rowIndexFrom = node.rowIndexFrom;
			var rowIndexTo = node.rowIndexTo;
			var position = $(sheetwrapper).find('tr[row-no='+rowIndexFrom+']').position();
			var hrz_position=$(sheetwrapper).find('td[cell-id='+columnNameFrom+rowIndexFrom+']').position();
			$(sheetwrapper).scrollTop( position.top);
			$(sheetwrapper).scrollLeft( hrz_position.left );
			//$(".gridBody").animate({scrollTop: position.top}, '500', 'swing');
			//$(".gridBody").animate({scrollLeft: hrz_position.left-100}, '500', 'swing');
			while(rowIndexFrom <= rowIndexTo ){
				var $cell= $('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+columnNameFrom+rowIndexFrom+']');
				$cell.nextUntil(' td[cell-id='+columnNameTo+rowIndexFrom+']')
				.addBack().add('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+columnNameTo+rowIndexFrom+']').addClass("mergednode");
				rowIndexFrom++;
			}

		}
	};
	return this;
})();

var DataTreeView = (function(){
	this.getTreeGraph = function(data,id,model){
		var obj=JSON.stringify(data);
		var t= JSON.parse(obj);
		$(id).empty();
		var root1 = {};
		root1.label = model;
		root1.children =t;
		console.log(root1);
		var margin = {
			top : 20,
			right : 120,
			bottom : 20,
			left : 120
		}, width = window.innerWidth, height =window.innerHeight;
		var i = 0, duration = 750, rectW = 200, rectH = 100;

		var tree = d3.layout.tree().nodeSize([ 220, 100 ]);

		$("#treeToolTip").empty();
		var toolTip = d3.select("#treeToolTip").append("div").attr("class", "tooltip").style(
				"opacity", 0);
		var svg = d3.select(id).append("svg").attr("width", width).attr("height",
				height).style("background-color","white").call(
				zm = d3.behavior.zoom().scaleExtent([ 0.3, 1.5 ]).on("zoom", redraw))
				.append("g").attr("transform", "translate(" + 350 + "," + 20 + ")");

		zm.translate([ 350, 20 ]);

		root1.x0 = 0;
		root1.y0 = height / 2;

		function collapse(d) {
			if (d.children) {
				d._children = d.children;
				d._children.forEach(collapse);
				d.children = null;
			}
		}

		root1.children.forEach(collapse);
		update(root1);

		d3.select(id).style("height", "800px");

		function update(source) {

			// Compute the new tree layout.
			var nodes = tree.nodes(root1).reverse(), links = tree.links(nodes);

			// Normalize for fixed-depth.
			nodes.forEach(function(d) {
				d.y = d.depth * 200;
			});

			// Update the nodes…
			var node = svg.selectAll("g.node").data(nodes, function(d) {
				return d.id || (d.id = ++i);
			});

			// Enter any new nodes at the parent's previous position.
			var nodeEnter = node.enter().append("g").attr("class", "node").attr(
					"transform", function(d) {
						return "translate(" + source.x0 + "," + source.y0 + ")rotate(45)";
					}).on("click", click)
					.on("mouseover",function(d){

						toolTip.transition().duration(200).style("opacity", .9);
						toolTip.html(d.label).style("left", event.pageX+"px").style("top",
								event.pageY+ "px");
					}).on("mouseout",function(d){
						toolTip.transition().duration(200).style("opacity", 0);

					});

			nodeEnter.append("rect").attr("width", rectW).attr("height", rectH)
					.attr("stroke", "black").attr("stroke-width", 1).style("fill",
							function(d) {
								return d._children ? "lightsteelblue" : "#fff";
							});
			nodeEnter.append("foreignObject")
		    .attr("width", 200)
		    .attr("height", 100)
		  .append("xhtml:div")
		    .style("font", "1em 'Helvetica Neue'")
		    .attr("class","nodetable")
		    .html(function(d){
		    	
		    	if(d.object ){
		    		var node=d.object;
		    		var data=getMrgdNode(d);
		    		
		    		if(data.length>0){
		    			var markup='<table><thead><tr><th></th>';
		    			for(var a=0;a<data.length;a++){
		    				if(node.columnNameFrom && node.rowIndex && node.columnNameTo){
		    					markup +='<th>'+data[a].columnName+'</th>';
		    				}else if(node.columnName && node.rowIndexFrom && node.rowIndexTo){
		    					if(a==0){
		    						markup +='<th>'+data[a].columnName+'</th>';
		    					}

		    				}else if(node.columnNameFrom && node.columnNameTo && node.rowIndexFrom && node.rowIndexTo){
		    					var n=data.length/(node.rowIndexTo-node.rowIndexFrom+1);
		    					if(a<n){
		    						markup +='<th>'+data[a].columnName+'</th>';
		    					}
		    				}
		    			}
		    			markup +='</tr></thead><tbody>';
		    			for(var a=0;a<data.length;a++){

		    				if(node.columnNameFrom && node.rowIndex && node.columnNameTo){
		    					if(a==0){
		    						markup +='<tr><th>'+data[a].rowIndex+'</th><td>'+data[a].displayXlValue+'</td>';
		    					}else if(a ===data.length-1){
		    						markup +='<td>'+data[a].displayXlValue+'</td></tr>';
		    					}else{
		    						markup +='<td>'+data[a].displayXlValue+'</td>';
		    					}

		    				}else if(node.columnName && node.rowIndexFrom && node.rowIndexTo){

		    						markup +='<tr><th>'+data[a].rowIndex+'</th><td>'+data[a].displayXlValue+'</td></tr>';


		    				}else if(node.columnNameFrom && node.columnNameTo && node.rowIndexFrom && node.rowIndexTo){
		    					var n=data.length/(node.rowIndexTo-node.rowIndexFrom+1);
		    					if(a%n==0){
		    						markup +='<tr><th>'+data[a].rowIndex+'</th><td>'+data[a].displayXlValue+'</td>';
		    					}else{
		    						markup +='<td>'+data[a].displayXlValue+'</td>';
		    					}

		    				}
		    			}


		    			markup +='</table></tbody>';
		    			return markup;
		    		}else{
		    			return '<p>'+d.label+'</p>';
			    	}
		    	}else{
		    		return '<p>'+d.label+'</p>';
		    	}


		    });

			// Transition nodes to their new position.
			var nodeUpdate = node.transition().duration(duration).attr("transform",
					function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					});

			nodeUpdate.select("rect").attr("width", rectW).attr("height", rectH)
					.attr("stroke", "black").attr("stroke-width", 1).style("fill",
							function(d) {
								return d._children ? "lightsteelblue" : "#fff";
							});

			nodeUpdate.select("text").style("fill-opacity", 1);

			// Transition exiting nodes to the parent's new position.
			var nodeExit = node.exit().transition().duration(duration).attr(
					"transform", function(d) {
						return "translate(" + source.x + "," + source.y + ")";
					}).remove();

			nodeExit.select("rect").attr("width", rectW).attr("height", rectH)
					.attr("stroke", "black").attr("stroke-width", 1);

			nodeExit.select("text");

			var link = svg.selectAll("path.link").data(links, function(d) {
				return d.target.id;
			});

			// Enter any new links at the parent's previous position.
			link.enter().insert("path", "g").attr("class", "link").attr("x",
					rectW).attr("y", rectH).attr("d", function(d) {
				var o = {
					x : source.x0,
					y : source.y0
				};
				return elbow({
					source : o,
					target : o
				});
			}).on("click", function(d) {
				////console.log(d.source);
			});

			// Transition links to their new position.
			link.transition().duration(duration).attr("d", elbow);

			// Transition exiting nodes to the parent's new position.
			link.exit().transition().duration(duration).attr("d", function(d) {
				var o = {
					x : source.x,
					y : source.y
				};
				return elbow({
					source : o,
					target : o
				});
			}).remove();

			// Stash the old positions for transition.
			nodes.forEach(function(d) {
				d.x0 = d.x;
				d.y0 = d.y;
			});
		}
		function elbow(d, i) {
			return "M" + (d.source.x + rectW / 2) + "," + (d.source.y + rectH)
					+ "V" + (d.target.y-50) + "H"
					+ (d.target.x + rectW / 2) + "v" + 50;

		}
		// Toggle children on click.
		function click(d) {
			//$.each(d,function(i,v){////console.log(i+":"+v);});

			if(d.object){
				mrgdNodeOnGrid(d.object);
			}

			if (d.children) {
				d._children = d.children;
				d.children = null;
			} else {

				d.children = d._children;
				d._children = null;

			}
			update(d);
		}

		// Redraw for zoom
		function redraw() {

			svg.attr("transform", "translate(" + d3.event.translate + ")"
					+ " scale(" + d3.event.scale + ")");
		}

		function getMrgdNode(d){

			var node=d.object;
			var mergedcells=[];
			var sheetid = node.sheetId || node.id;

			if(node.columnNameFrom && node.rowIndex && node.columnNameTo){

				var columnNameFrom = node.columnNameFrom;
				var rowIndex=node.rowIndex;
				var columnNameTo=node.columnNameTo;
				var cellid=columnNameTo+rowIndex;
				var $row =$('#excellviewtabs div[data-sheet="'+sheetid+'"] .gridBody td[cell-id='+columnNameFrom+rowIndex+']').nextUntil('td[cell-id='+cellid+']')
				.addBack().add('#excellviewtabs div[data-sheet="'+sheetid+'"] .gridBody td[cell-id='+cellid+']');


				console.log($row);
				$.each($row,function(i,v){
					console.log($(v).data());
					if(!$.isEmptyObject( $(v).data())){
						mergedcells.push($(v).data());
					}

				});

			}else if(node.columnName && node.rowIndexFrom && node.rowIndexTo){
				var columnName = node.columnName;
				var rowIndexFrom= node.rowIndexFrom;
				var rowIndexTo = node.rowIndexTo;

				while(rowIndexFrom <= rowIndexTo ){
					var $cell = $('#excellviewtabs div[data-sheet="'+sheetid+'"] td[cell-id='+columnName+rowIndexFrom+']');
					//console.log($cell.data());
					mergedcells.push($cell.data());
					rowIndexFrom++;
				}

			}else if(node.columnNameFrom && node.columnNameTo && node.rowIndexFrom && node.rowIndexTo){

				var columnNameFrom = node.columnNameFrom;
				var columnNameTo= node.columnNameTo;
				var rowIndexFrom = node.rowIndexFrom;
				var rowIndexTo = node.rowIndexTo;
				while(rowIndexFrom <= rowIndexTo ){
					var $cell= $('#excellviewtabs div[data-sheet="'+sheetid+'"] td[cell-id='+columnNameFrom+rowIndexFrom+']');
					var mrgcell=$cell.nextUntil(' td[cell-id='+columnNameTo+rowIndexFrom+']')
					.addBack().add('#excellviewtabs div[data-sheet="'+sheetid+'"] td[cell-id='+columnNameTo+rowIndexFrom+']');
					//console.log($cell.data());
					$.each(mrgcell,function(i,v){
						mergedcells.push($(v).data());
					});

					rowIndexFrom++;
				}

			}
			return mergedcells;
		}
	};

	function mrgdNodeOnGrid(data){
		var node=data;

		//console.log(node);
		var sheetId= node.sheetId || node.id;
		var index = $('#excellviewtabs a[data-sheet="'+sheetId+'"]').parent().index();
		var sheetwrapper= $( '#excellviewtabs div[data-sheet="'+sheetId+'"]' );
		$('#excellviewtabs').tabs("option","active",index);

		$('#excellviewtabs td').removeClass("mergednode");

		if(node.columnNameFrom && node.rowIndex && node.columnNameTo){
			var columnNameFrom = node.columnNameFrom;
			var rowIndex=node.rowIndex;
			var columnNameTo=node.columnNameTo;
			var cellid=columnNameTo+rowIndex;
			var position = $(sheetwrapper).find('.gridBody tr[row-no='+rowIndex+']').position();
			var hrz_position=$(sheetwrapper).find('.gridBody td[cell-id='+columnNameFrom+rowIndex+']').position();
			var $row =$('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+columnNameFrom+rowIndex+']');

			//alert( hrz_position.left);
			$(".gridBody").scrollTop( position.top);
			$(".gridBody").scrollLeft( hrz_position.left );
			//$(".gridBody").animate({scrollTop: position.top}, '500', 'swing');
			//$(".gridBody").animate({scrollLeft: hrz_position.left-100}, '500', 'swing');

			$row.nextUntil('td[cell-id='+cellid+']')
			.addBack().add('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+cellid+']').addClass("mergednode").data();

		}else if(node.columnName && node.rowIndexFrom && node.rowIndexTo){
			var columnName = node.columnName;
			var rowIndexFrom= node.rowIndexFrom;
			var rowIndexTo = node.rowIndexTo;
			var position = $(sheetwrapper).find('tr[row-no='+rowIndexFrom+']').position();
			var hrz_position=$(sheetwrapper).find('td[cell-id='+columnName+rowIndexFrom+']').position();

			$(".gridBody").scrollTop( position.top);
			$(".gridBody").scrollLeft( hrz_position.left );
			//$(".gridBody").animate({scrollTop: position.top}, '500', 'swing');
			//$(".gridBody").animate({scrollLeft: hrz_position.left-100}, '500', 'swing');
			while(rowIndexFrom <= rowIndexTo ){
				var $cell = $('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+columnName+rowIndexFrom+']');
				$cell.addClass("mergednode");
				rowIndexFrom++;
			}

		}else if(node.columnNameFrom && node.columnNameTo && node.rowIndexFrom && node.rowIndexTo){
			var columnNameFrom = node.columnNameFrom;
			var columnNameTo= node.columnNameTo;
			var rowIndexFrom = node.rowIndexFrom;
			var rowIndexTo = node.rowIndexTo;
			var position = $(sheetwrapper).find('tr[row-no='+rowIndexFrom+']').position();
			var hrz_position=$(sheetwrapper).find('td[cell-id='+columnNameFrom+rowIndexFrom+']').position();
			$(sheetwrapper).scrollTop( position.top);
			$(sheetwrapper).scrollLeft( hrz_position.left );
			//$(".gridBody").animate({scrollTop: position.top}, '500', 'swing');
			//$(".gridBody").animate({scrollLeft: hrz_position.left-100}, '500', 'swing');
			while(rowIndexFrom <= rowIndexTo ){
				var $cell= $('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+columnNameFrom+rowIndexFrom+']');
				$cell.nextUntil(' td[cell-id='+columnNameTo+rowIndexFrom+']')
				.addBack().add('#excellviewtabs div[data-sheet="'+sheetId+'"] td[cell-id='+columnNameTo+rowIndexFrom+']').addClass("mergednode");
				rowIndexFrom++;
			}

		}
	};

	return this;
})();