/**
 * New node file
 */

var VdVcUndoRedoLog = function () {
	var log = [],
		curIndex = -1,
		cb = false;
	
	return {
		setLogCallBack: function(cb1) {
			cb = cb1;
		},
		add: function(entry) {
			log.push(entry);
			++curIndex;
			if ("function" == typeof cb) {
				cb();
			}
		},
		clear: function() {
			log = [];
			curIndex = -1;
			if ("function" == typeof cb) {
				cb();
			}
		},
		undo: function() {
			if (curIndex > -1) {
				// Retrieve the lastest command and execute the undo command on it
				var cmd = log[curIndex];
				if ("function" == typeof cmd["undo"]) {
					cmd["undo"](cmd);
					curIndex--;
					if ("function" == typeof cb) {
						cb();
					}
				}
			}
		},
		redo: function() {
			if (curIndex < log.length - 1) {
				// Retrieve the next command and apply the redo command
				var cmd = log[curIndex+1];
				if ("function" == typeof cmd["undo"]) {
					cmd["redo"](cmd);
					curIndex++;
					if ("function" == typeof cb) {
						cb();
					}
				}
			}
		},
		hasUndoLog: function() {
			if (curIndex > -1) {
				return true;
			}else{
				return false;
			}
		},
		hasRedoLog: function() {
			if (curIndex < log.length - 1) {
				return true;
			}else{
				return false;
			}
		}
	};
};


var UndoManager = function () {
    "use strict";

    var undoCommands = [],
        index = -1,
        isExecuting = false,
        callback;

    function execute(command, action) {
        if (!command || typeof command[action] !== "function") {
            return this;
        }
        isExecuting = true;

        command[action]();

        isExecuting = false;
        return this;
    }

    return {

        // legacy support

        register: function (undoObj, undoFunc, undoParamsList, undoMsg, redoObj, redoFunc, redoParamsList, redoMsg) {
            this.add({
                undo: function () {
                    undoFunc.apply(undoObj, undoParamsList);
                },
                redo: function () {
                    redoFunc.apply(redoObj, redoParamsList);
                }
            });
        },

        add: function (command) {
            if (isExecuting) {
                return this;
            }
            // if we are here after having called undo,
            // invalidate items higher on the stack
            undoCommands.splice(index + 1, undoCommands.length - index);

            undoCommands.push(command);

            // set the current index to the end
            index = undoCommands.length - 1;
            if (callback) {
                callback();
            }
            return this;
        },

        /*
        Pass a function to be called on undo and redo actions.
        */
        setCallback: function (callbackFunc) {
            callback = callbackFunc;
        },

        undo: function () {
            var command = undoCommands[index];
            if (!command) {
                return this;
            }
            execute(command, "undo");
            index -= 1;
            if (callback) {
                callback();
            }
            return this;
        },

        redo: function () {
            var command = undoCommands[index + 1];
            if (!command) {
                return this;
            }
            execute(command, "redo");
            index += 1;
            if (callback) {
                callback();
            }
            return this;
        },

        /*
        Clears the memory, losing all stored states.
        */
        clear: function () {
            var prev_size = undoCommands.length;

            undoCommands = [];
            index = -1;

            if (callback && (prev_size > 0)) {
                callback();
            }
        },

        hasUndo: function () {
            return index !== -1;
        },

        hasRedo: function () {
            return index < (undoCommands.length - 1);
        },

        getCommands: function () {
            return undoCommands;
        }
    };
};
