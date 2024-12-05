

var vdvcInputs = (function() {

	 this.getDimensionInputs = function(model,dimension) {
		var set = [];
		$.each(model, function(index, value) {
			
			if (typeof value[dimension] !== "undefined" &&  value[dimension] !=="*" && $.inArray(value[dimension], set) == -1 ) {
				set.push(value[dimension]);
			}
		});
		//return set.sort();
		return set;
	};
	
	this.getFilteredInputs=function(model,criteria){
		var data=model;
		
		for(var i=0;i<criteria.length;i++){
			var group=[];
			var key=criteria[i].dimension;
			var val=criteria[i].value;
			
			$.each(data, function(index, value) {
				if(value[key] == val){
				group.push(value);
			}
			});
			data=group;
		}
		
		console.log(data);
		return data;
	};
	this.setFilteredInputs=function(inputs,measure,criteria,val){
		var rec=null;
		
		$.each(inputs,function(index,value){
			if(value.grColumnName === criteria.col && value.grRowIndex === criteria.row){
				rec=JSON.parse(JSON.stringify(value));
				value["changed"]=val;
				rec[measure]=val;
				return false;
			}
		});
		return rec;
	};
	var getComboBox=function(selector,options,Model){
		
		var label = options.label;
		var dim=options.dimension;
		//var inputs=options.inputdata;
		var inputs=getDimensionInputs(Model,options.dimension);
		var markup ='<div class="form-group">\
			<label class="col-xs-4" for="'+dim+'">'+label+'</label>\
			<div class="controls col-xs-8">\
			<select id="'+dim+'" class="form-control input-sm inputevents" data-dim="'+dim+'">';
		for(var k=0;k<inputs.length;k++){
			markup +='<option value="'+inputs[k]+'">'+inputs[k]+'</options>';
		}
		markup +='</select></div></div>'; 
		$(selector).append(markup);
		
	};
	 this.getSlider= function(selector,options,Model){
		
		var label = options.label;
		var dim=options.dimension;
		var markup= '<div class="form-group">\
			<label class="col-xs-4" for="'+dim+'">'+label+'</label>\
			<div class="controls col-xs-8 col-sm-8 col-md-8 col-lg-8">\
			<input type="text"style="width:45%; border:0; color:black; font-weight:bold;text-align:center;float:left;" id="receivedValue"  class="form-control input-sm" disabled>\
			<input type="text"style="width:45%; border:0; color:red; font-weight:bold;text-align:center;float:left;" id="'+dim+'" class="form-control input-sm" disabled>\
			<div  style="width:9%;display:inline-block" class="input-sm icon"></div>\
			<div id="'+dim+'-slider" class="inputevents" data-dim="'+dim+'"></div>\
			</div></div>';
			$(selector).append(markup);
			 $( "#receivedValue").val( options.value+"%");
			$("#"+dim+"-slider").slider({
			      value: options.value,
			      disabled: true,
			      min: options.low,
			      max: options.high,
			      step:options.step,
			      slide: function( event, ui ) {
			        $( "#"+dim ).val( "Revised : "+ui.value+"%");
			        
			      },
			      change: function( event, ui ) {
			    	 $( "#"+dim ).val("Revised : "+ui.value+"%");
			      }
			    });
	};
	
	var generateGrid = function(parant, options) {

		if (options) {
			minColumns = options.minColumns;
			minRows = options.minRows;
			readOnly = options.readOnly || false;
		}

		var div= document.createElement("DIV");
		div.setAttribute("class", "inputGrid");
		var table = document.createElement("TABLE");
		table.setAttribute("class", "table-bordered");
		var thead = document.createElement("THEAD");
		var tbody = document.createElement("TBODY");
		var Row, Cell;

		table.appendChild(thead);
		table.appendChild(tbody);

		Row = document.createElement("TR");
		thead.appendChild(Row);

		/*for ( var columnIndex = -1; columnIndex < minColumns; columnIndex++) {
			Cell = document.createElement("TH");

			if (columnIndex == -1) {
				Row.appendChild(Cell);
			} else {
				var colname = colName(columnIndex);
				Cell.innerHTML = colname;
				Cell.setAttribute("column-name", colname);
				Row.appendChild(Cell);
			}

		}
*/
		for ( var rowIndex = 0; rowIndex < minRows; rowIndex++) {
			Row = document.createElement("TR");
			Row.setAttribute("row", rowIndex + 1);
			
			for ( var columnIndex = 0; columnIndex < minColumns; columnIndex++) {
				Cell = document.createElement("TD");
				Cell.setAttribute("row", rowIndex + 1);
				Cell.setAttribute("col", columnIndex + 1);
				Row.appendChild(Cell);
			}
			tbody.appendChild(Row);
		}
		$(div).append(table);
		$(parant).append(div);
	};
	
	var getInputGrid=function(selector,options,Model){
		
		
		var table=null;
		var item = {"screenArea":"InputArea", "position":4, "inputType":"grid", "label":"Growth Rate", "colHeaders":["fiscalYear"],"rowHeaders":["product","type"], "tableData":"growthRate"};
		//var colHeaders=["product","Type","2011","2012","2013","2014","2015","2016"];
		var type=["Original","Revised"];
		var rowHeaderDepth=item.rowHeaders.length;
		var colHeadersDepth=item.colHeaders.length;
		generateGrid(selector,{"minColumns":8,"minRows":11});
		var gridData=[];
		for(var x=0;x< item.colHeaders.length;x++){
			var data=[];
			table = $(".inputGrid table");
			var dimValues=getDimensionInputs(Model,item.colHeaders[x]);
			$.each(dimValues,function(i,v){
				var tr= $(table).find('tbody tr:eq('+x+')');
				$(tr).nextAll().find('td:nth-child(' + (rowHeaderDepth + i+1) + ')').data(item.colHeaders[x],v).attr("class","editable");
				$(tr).find('td:nth-child(' + (rowHeaderDepth + i+1) + ')').attr("class","ColHeader").text(v);
			});
		}
		
		for(var x=0;x< item.rowHeaders.length;x++){
			
			table = $(".inputGrid table");
			
				var dimValues=getDimensionInputs(Model,item.rowHeaders[x]);
				var a=1;var b=1;
				
				if(item.rowHeaders[x] !== "type"){
					$.each(dimValues,function(i,v){
						var tr=$(table).find('tbody tr:nth-child(' + (colHeadersDepth + a) + ')');
						$(tr).data(item.rowHeaders[x],v);
						$(tr).find('td:nth-child(1)').attr({"rowspan":2,"class":"RowHeader"}).text(v);
						$.each(type,function(k,val){
							var tr=$(table).find('tbody tr:nth-child(' + (colHeadersDepth +b) + ')');
							$(tr).data("type",val);
							$(tr).find('td:eq(1)').attr("class","RowHeader").text(val);
							b++;
						});
						$(table).find('tbody tr:nth-child(' + (colHeadersDepth + a+1) + ')').data(item.rowHeaders[x],v);
						$(table).find('tbody tr:nth-child(' + (colHeadersDepth + a+1) + ') td:nth-child(1)').remove();
						a +=2;
					});
				}
					
			}
		};
	
	this.getInputElement=function(selector,obj,Model){

		var inputType = obj.inputType;
		var options={};
		switch(inputType){
		case "combobox":
			options.label= obj.label;
			options.dimension=obj.dimensionName;
			getComboBox(selector,options,Model);
			break;
		case "slider":
			options.label= obj.label;
			options.dimension=obj.dimensionName;
			options.value=obj.value || 0;
			options.low= obj.low;
			options.high= obj.high;
			options.step=obj.step;
			getSlider(selector,options,Model);
			break;
		case "grid":
			getInputGrid(selector,obj,Model);
			break;
		}
	};
	return this;
})();