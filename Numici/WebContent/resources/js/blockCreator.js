var blockCreator =(function(){
	
	// Retrieving Data types from MongoDb
	function GetBlockDtDf() {
		Util.ajaxGet("home/blockDataTypes", function(dataTypes) {
			if (dataTypes.length > 0) {
				//console.log(JSON.stringify(dataTypes));
				DataTypes = dataTypes;
				var markup = '';
				for ( var k = 0; k < dataTypes.length; k++) {
					markup += '<option value="' + dataTypes[k].dataType
							+ '">' + dataTypes[k].dataType
							+ '</option>';
				}

				$("#data_types").empty();
				$("#data_types").append(markup);
			}

		});
	}
	
	
	this.ReadModelGrid=function() {

		var blockObject = {};
		blockObject.dimensions = [];
		blockObject.categories = [];
		var coreBlock = $("#new_model_core table tr");
		var dimBlock = $("#new_model_Dim table");
		for ( var l = 0; l < coreBlock.length; l++) {

			if (l == 0) {
				blockObject.modelName = $("#modelname").val();
				blockObject.blockName = $(coreBlock[l]).find(
						"td:nth-child(2) input").val();
				blockObject.dataType = $(coreBlock[l]).find(
						"td:nth-child(3) select").val();
				blockObject.dataTypeFormat = $(coreBlock[l]).find(
						"td:nth-child(4) select").val();
			} else {
				var indentInput = $(coreBlock[l]).find("td:nth-child(2) input");
				var category = $(indentInput).val();
				var indent = $(indentInput).data("indentCounter");
				if (category && indent) {
					blockObject.categories.push({
						name : category,
						indent : indent
					});
				}
			}

		}
		var dimInfo = $(dimBlock).find('tr:nth-child(1) td');

		for ( var k = 0; k < dimInfo.length - 1; k++) {

			if ($(dimInfo[k]).data()) {
				blockObject.dimensions.push($(dimInfo[k]).data());
			}
		}

		return JSON.stringify({
			"modelName" : blockObject.modelName,
			"userBlocks" : [ {
				"blockName" : blockObject.blockName,
				"blockDataType" : blockObject.dataType,
				"blockDTFormat" : blockObject.dataTypeFormat,
				"role" : "model",
				"dimensions" : blockObject.dimensions,
				"categories" : blockObject.categories,
				"ranges":[]
			} ]

		});
	};
	// To save user define blocks to MongoDB
	this.saveModelBlocks=function() {
		var data = ReadModelGrid();
		Util.ajaxPost("home/savemodel",data,function(result){
			if (result.result) {
				$("#model_block").dialog('close');
				alert(result.message);
				GetModelBlocks();
			} else {
				alert(result.message);
			}
		});
	};
	this.ModelGrid=function(options) {
		var table = document.createElement("TABLE");
		var Row, Cell;
		for ( var k = 0; k < options.rows; k++) {
			Row = document.createElement("TR");
			for ( var l = 0; l < options.columns; l++) {
				Cell = document.createElement("TD");

				if (k == 0) {
					switch (options.type) {
					case "Core":
						switch (l) {
						case 0:
							Cell.innerHTML = '';
							break;
						case 1:
							Cell.innerHTML = '<input type="text"  id="model_name" placeholder="Enter Name" data-type="block">';
							break;
						case 2:

							Cell.innerHTML = '<select id="data_types"></select>';
							break;
						case 3:
							Cell.innerHTML = '<select id="data_type_format"></select>';
							break;
						default:
							Cell.innerHTML = '';
							break;
						}
						break;
					case "Dim":
						Cell.innerHTML = 'Dimension';
						Cell.className = "jstree-drop";
						break;
					}
				}
				if (options.type !== "Dim") {
					if (k !== 0 && l == 0) {
						Cell.innerHTML = '<button id="removeIndent" disabled=true><span class="ui-icon  ui-icon-triangle-1-w" style="float:left;"></span></button>\
							<button id="addIndent" disabled=true><span class="ui-icon ui-icon-triangle-1-e"></span></button>';
					} else if (k !== 0 && l == 1) {
						Cell.innerHTML = '<input type="text" placeholder="Category" data-type="category">';
						if (k == (options.rows - 1))
							Cell.className = "lastRow";

					} else if (k !== 0 && l !== 1) {
						Cell.innerHTML = '';
					}
				}

				Row.appendChild(Cell);
			}
			table.appendChild(Row);
		}
		var cont = document.getElementById(options.id);
		$(cont).empty();
		cont.appendChild(table);
		GetBlockDtDf();
	};
	
	return this;
})();