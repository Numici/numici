(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof __require__ == "function" && __require__;
				if (!u && a)
					return a(o, !0);
				if (i)
					return i(o, !0);
				throw new Error("Cannot find module '" + o + "'")
			}
			var f = n[o] = {
				exports : {}
			};
			t[o][0].call(f.exports, function(e) {
				var n = t[o][1][e];
				return s(n ? n : e)
			}, f, f.exports, e, t, n, r)
		}
		return n[o].exports
	}
	var i = typeof __require__ == "function" && __require__;
	for (var o = 0; o < r.length; o++)
		s(r[o]);
	return s
})({1:[function(_dereq_,module,exports){
module.exports = parents

function parents(node, filter) {
  var out = []

  filter = filter || noop

  do {
    out.push(node)
    node = node.parentNode
  } while(node && node.tagName && filter(node))

  return out.slice(1)
}

function noop(n) {
  return true
}

},{}],2:[function(_dereq_,module,exports){
/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],3:[function(_dereq_,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'undefined' !== typeof document && 'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,window)

},{}],4:[function(_dereq_,module,exports){
'use strict'

/**
 * Diff Match and Patch
 *
 * Copyright 2006 Google Inc.
 * http://code.google.com/p/google-diff-match-patch/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Computes the difference between two texts to create a patch.
 * Applies the patch onto another text, allowing for errors.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class containing the diff, match and patch methods.
 * @constructor
 */
function diff_match_patch() {

  // Defaults.
  // Redefine these in your program to override the defaults.

  // Number of seconds to map a diff before giving up (0 for infinity).
  this.Diff_Timeout = 1.0;
  // Cost of an empty edit operation in terms of edit characters.
  this.Diff_EditCost = 4;
  // At what point is no match declared (0.0 = perfection, 1.0 = very loose).
  this.Match_Threshold = 0.5;
  // How far to search for a match (0 = exact location, 1000+ = broad match).
  // A match this many characters away from the expected location will add
  // 1.0 to the score (0.0 is a perfect match).
  this.Match_Distance = 1000;
  // When deleting a large block of text (over ~64 characters), how close do
  // the contents have to be to match the expected contents. (0.0 = perfection,
  // 1.0 = very loose).  Note that Match_Threshold controls how closely the
  // end points of a delete need to match.
  this.Patch_DeleteThreshold = 0.5;
  // Chunk size for context length.
  this.Patch_Margin = 4;

  // The number of bits in an int.
  this.Match_MaxBits = 32;
}


//  DIFF FUNCTIONS


/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */
var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;

/** @typedef {{0: number, 1: string}} */
diff_match_patch.Diff;


/**
 * Find the differences between two texts.  Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean=} opt_checklines Optional speedup flag. If present and false,
 *     then don't run a line-level diff first to identify the changed areas.
 *     Defaults to true, which does a faster, slightly less optimal diff.
 * @param {number} opt_deadline Optional time when the diff should be complete
 *     by.  Used internally for recursive calls.  Users should set DiffTimeout
 *     instead.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 */
diff_match_patch.prototype.diff_main = function(text1, text2, opt_checklines,
    opt_deadline) {
  // Set a deadline by which time the diff must be complete.
  if (typeof opt_deadline == 'undefined') {
    if (this.Diff_Timeout <= 0) {
      opt_deadline = Number.MAX_VALUE;
    } else {
      opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
    }
  }
  var deadline = opt_deadline;

  // Check for null inputs.
  if (text1 == null || text2 == null) {
    throw new Error('Null input. (diff_main)');
  }

  // Check for equality (speedup).
  if (text1 == text2) {
    if (text1) {
      return [[DIFF_EQUAL, text1]];
    }
    return [];
  }

  if (typeof opt_checklines == 'undefined') {
    opt_checklines = true;
  }
  var checklines = opt_checklines;

  // Trim off common prefix (speedup).
  var commonlength = this.diff_commonPrefix(text1, text2);
  var commonprefix = text1.substring(0, commonlength);
  text1 = text1.substring(commonlength);
  text2 = text2.substring(commonlength);

  // Trim off common suffix (speedup).
  commonlength = this.diff_commonSuffix(text1, text2);
  var commonsuffix = text1.substring(text1.length - commonlength);
  text1 = text1.substring(0, text1.length - commonlength);
  text2 = text2.substring(0, text2.length - commonlength);

  // Compute the diff on the middle block.
  var diffs = this.diff_compute_(text1, text2, checklines, deadline);

  // Restore the prefix and suffix.
  if (commonprefix) {
    diffs.unshift([DIFF_EQUAL, commonprefix]);
  }
  if (commonsuffix) {
    diffs.push([DIFF_EQUAL, commonsuffix]);
  }
  this.diff_cleanupMerge(diffs);
  return diffs;
};


/**
 * Find the differences between two texts.  Assumes that the texts do not
 * have any common prefix or suffix.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean} checklines Speedup flag.  If false, then don't run a
 *     line-level diff first to identify the changed areas.
 *     If true, then run a faster, slightly less optimal diff.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_compute_ = function(text1, text2, checklines,
    deadline) {
  var diffs;

  if (!text1) {
    // Just add some text (speedup).
    return [[DIFF_INSERT, text2]];
  }

  if (!text2) {
    // Just delete some text (speedup).
    return [[DIFF_DELETE, text1]];
  }

  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  var i = longtext.indexOf(shorttext);
  if (i != -1) {
    // Shorter text is inside the longer text (speedup).
    diffs = [[DIFF_INSERT, longtext.substring(0, i)],
             [DIFF_EQUAL, shorttext],
             [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
    // Swap insertions for deletions if diff is reversed.
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }

  if (shorttext.length == 1) {
    // Single character string.
    // After the previous speedup, the character can't be an equality.
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }

  // Check to see if the problem can be split in two.
  var hm = this.diff_halfMatch_(text1, text2);
  if (hm) {
    // A half-match was found, sort out the return data.
    var text1_a = hm[0];
    var text1_b = hm[1];
    var text2_a = hm[2];
    var text2_b = hm[3];
    var mid_common = hm[4];
    // Send both pairs off for separate processing.
    var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
    var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
    // Merge the results.
    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
  }

  if (checklines && text1.length > 100 && text2.length > 100) {
    return this.diff_lineMode_(text1, text2, deadline);
  }

  return this.diff_bisect_(text1, text2, deadline);
};


/**
 * Do a quick line-level diff on both strings, then rediff the parts for
 * greater accuracy.
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_lineMode_ = function(text1, text2, deadline) {
  // Scan the text on a line-by-line basis first.
  var a = this.diff_linesToChars_(text1, text2);
  text1 = a.chars1;
  text2 = a.chars2;
  var linearray = a.lineArray;

  var diffs = this.diff_main(text1, text2, false, deadline);

  // Convert the diff back to original text.
  this.diff_charsToLines_(diffs, linearray);
  // Eliminate freak matches (e.g. blank lines)
  this.diff_cleanupSemantic(diffs);

  // Rediff any replacement blocks, this time character-by-character.
  // Add a dummy entry at the end.
  diffs.push([DIFF_EQUAL, '']);
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = '';
  var text_insert = '';
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        break;
      case DIFF_EQUAL:
        // Upon reaching an equality, check for prior redundancies.
        if (count_delete >= 1 && count_insert >= 1) {
          // Delete the offending records and add the merged ones.
          diffs.splice(pointer - count_delete - count_insert,
                       count_delete + count_insert);
          pointer = pointer - count_delete - count_insert;
          var a = this.diff_main(text_delete, text_insert, false, deadline);
          for (var j = a.length - 1; j >= 0; j--) {
            diffs.splice(pointer, 0, a[j]);
          }
          pointer = pointer + a.length;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
    }
    pointer++;
  }
  diffs.pop();  // Remove the dummy entry at the end.

  return diffs;
};


/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisect_ = function(text1, text2, deadline) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  var max_d = Math.ceil((text1_length + text2_length) / 2);
  var v_offset = max_d;
  var v_length = 2 * max_d;
  var v1 = new Array(v_length);
  var v2 = new Array(v_length);
  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
  // integers and undefined.
  for (var x = 0; x < v_length; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  var delta = text1_length - text2_length;
  // If the total number of characters is odd, then the front path will collide
  // with the reverse path.
  var front = (delta % 2 != 0);
  // Offsets for start and end of k loop.
  // Prevents mapping of space beyond the grid.
  var k1start = 0;
  var k1end = 0;
  var k2start = 0;
  var k2end = 0;
  for (var d = 0; d < max_d; d++) {
    // Bail out if deadline is reached.
    if ((new Date()).getTime() > deadline) {
      break;
    }

    // Walk the front path one step.
    for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      var k1_offset = v_offset + k1;
      var x1;
      if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }
      var y1 = x1 - k1;
      while (x1 < text1_length && y1 < text2_length &&
             text1.charAt(x1) == text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) {
        // Ran off the right of the graph.
        k1end += 2;
      } else if (y1 > text2_length) {
        // Ran off the bottom of the graph.
        k1start += 2;
      } else if (front) {
        var k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
          // Mirror x2 onto top-left coordinate system.
          var x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) {
            // Overlap detected.
            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
          }
        }
      }
    }

    // Walk the reverse path one step.
    for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2;
      if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }
      var y2 = x2 - k2;
      while (x2 < text1_length && y2 < text2_length &&
             text1.charAt(text1_length - x2 - 1) ==
             text2.charAt(text2_length - y2 - 1)) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) {
        // Ran off the left of the graph.
        k2end += 2;
      } else if (y2 > text2_length) {
        // Ran off the top of the graph.
        k2start += 2;
      } else if (!front) {
        var k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
          var x1 = v1[k1_offset];
          var y1 = v_offset + x1 - k1_offset;
          // Mirror x2 onto top-left coordinate system.
          x2 = text1_length - x2;
          if (x1 >= x2) {
            // Overlap detected.
            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
          }
        }
      }
    }
  }
  // Diff took too long and hit the deadline or
  // number of diffs equals number of characters, no commonality at all.
  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
};


/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} x Index of split point in text1.
 * @param {number} y Index of split point in text2.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisectSplit_ = function(text1, text2, x, y,
    deadline) {
  var text1a = text1.substring(0, x);
  var text2a = text2.substring(0, y);
  var text1b = text1.substring(x);
  var text2b = text2.substring(y);

  // Compute both diffs serially.
  var diffs = this.diff_main(text1a, text2a, false, deadline);
  var diffsb = this.diff_main(text1b, text2b, false, deadline);

  return diffs.concat(diffsb);
};


/**
 * Split two texts into an array of strings.  Reduce the texts to a string of
 * hashes where each Unicode character represents one line.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}
 *     An object containing the encoded text1, the encoded text2 and
 *     the array of unique strings.
 *     The zeroth element of the array of unique strings is intentionally blank.
 * @private
 */
diff_match_patch.prototype.diff_linesToChars_ = function(text1, text2) {
  var lineArray = [];  // e.g. lineArray[4] == 'Hello\n'
  var lineHash = {};   // e.g. lineHash['Hello\n'] == 4

  // '\x00' is a valid character, but various debuggers don't like it.
  // So we'll insert a junk entry to avoid generating a null character.
  lineArray[0] = '';

  /**
   * Split a text into an array of strings.  Reduce the texts to a string of
   * hashes where each Unicode character represents one line.
   * Modifies linearray and linehash through being a closure.
   * @param {string} text String to encode.
   * @return {string} Encoded string.
   * @private
   */
  function diff_linesToCharsMunge_(text) {
    var chars = '';
    // Walk the text, pulling out a substring for each line.
    // text.split('\n') would would temporarily double our memory footprint.
    // Modifying text would create many large strings to garbage collect.
    var lineStart = 0;
    var lineEnd = -1;
    // Keeping our own length variable is faster than looking it up.
    var lineArrayLength = lineArray.length;
    while (lineEnd < text.length - 1) {
      lineEnd = text.indexOf('\n', lineStart);
      if (lineEnd == -1) {
        lineEnd = text.length - 1;
      }
      var line = text.substring(lineStart, lineEnd + 1);
      lineStart = lineEnd + 1;

      if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
          (lineHash[line] !== undefined)) {
        chars += String.fromCharCode(lineHash[line]);
      } else {
        chars += String.fromCharCode(lineArrayLength);
        lineHash[line] = lineArrayLength;
        lineArray[lineArrayLength++] = line;
      }
    }
    return chars;
  }

  var chars1 = diff_linesToCharsMunge_(text1);
  var chars2 = diff_linesToCharsMunge_(text2);
  return {chars1: chars1, chars2: chars2, lineArray: lineArray};
};


/**
 * Rehydrate the text in a diff from a string of line hashes to real lines of
 * text.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {!Array.<string>} lineArray Array of unique strings.
 * @private
 */
diff_match_patch.prototype.diff_charsToLines_ = function(diffs, lineArray) {
  for (var x = 0; x < diffs.length; x++) {
    var chars = diffs[x][1];
    var text = [];
    for (var y = 0; y < chars.length; y++) {
      text[y] = lineArray[chars.charCodeAt(y)];
    }
    diffs[x][1] = text.join('');
  }
};


/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */
diff_match_patch.prototype.diff_commonPrefix = function(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) ==
        text2.substring(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Determine the common suffix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 */
diff_match_patch.prototype.diff_commonSuffix = function(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 ||
      text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
        text2.substring(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Determine if the suffix of one string is the prefix of another.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of the first
 *     string and the start of the second string.
 * @private
 */
diff_match_patch.prototype.diff_commonOverlap_ = function(text1, text2) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  // Eliminate the null case.
  if (text1_length == 0 || text2_length == 0) {
    return 0;
  }
  // Truncate the longer string.
  if (text1_length > text2_length) {
    text1 = text1.substring(text1_length - text2_length);
  } else if (text1_length < text2_length) {
    text2 = text2.substring(0, text1_length);
  }
  var text_length = Math.min(text1_length, text2_length);
  // Quick check for the worst case.
  if (text1 == text2) {
    return text_length;
  }

  // Start by looking for a single character match
  // and increase length until no match is found.
  // Performance analysis: http://neil.fraser.name/news/2010/11/04/
  var best = 0;
  var length = 1;
  while (true) {
    var pattern = text1.substring(text_length - length);
    var found = text2.indexOf(pattern);
    if (found == -1) {
      return best;
    }
    length += found;
    if (found == 0 || text1.substring(text_length - length) ==
        text2.substring(0, length)) {
      best = length;
      length++;
    }
  }
};


/**
 * Do the two texts share a substring which is at least half the length of the
 * longer text?
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {Array.<string>} Five element Array, containing the prefix of
 *     text1, the suffix of text1, the prefix of text2, the suffix of
 *     text2 and the common middle.  Or null if there was no match.
 * @private
 */
diff_match_patch.prototype.diff_halfMatch_ = function(text1, text2) {
  if (this.Diff_Timeout <= 0) {
    // Don't risk returning a non-optimal diff if we have unlimited time.
    return null;
  }
  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    return null;  // Pointless.
  }
  var dmp = this;  // 'this' becomes 'window' in a closure.

  /**
   * Does a substring of shorttext exist within longtext such that the substring
   * is at least half the length of longtext?
   * Closure, but does not reference any external variables.
   * @param {string} longtext Longer string.
   * @param {string} shorttext Shorter string.
   * @param {number} i Start index of quarter length substring within longtext.
   * @return {Array.<string>} Five element Array, containing the prefix of
   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
   *     of shorttext and the common middle.  Or null if there was no match.
   * @private
   */
  function diff_halfMatchI_(longtext, shorttext, i) {
    // Start with a 1/4 length substring at position i as a seed.
    var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    var j = -1;
    var best_common = '';
    var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
      var prefixLength = dmp.diff_commonPrefix(longtext.substring(i),
                                               shorttext.substring(j));
      var suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i),
                                               shorttext.substring(0, j));
      if (best_common.length < suffixLength + prefixLength) {
        best_common = shorttext.substring(j - suffixLength, j) +
            shorttext.substring(j, j + prefixLength);
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }
    if (best_common.length * 2 >= longtext.length) {
      return [best_longtext_a, best_longtext_b,
              best_shorttext_a, best_shorttext_b, best_common];
    } else {
      return null;
    }
  }

  // First check if the second quarter is the seed for a half-match.
  var hm1 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 4));
  // Check again based on the third quarter.
  var hm2 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 2));
  var hm;
  if (!hm1 && !hm2) {
    return null;
  } else if (!hm2) {
    hm = hm1;
  } else if (!hm1) {
    hm = hm2;
  } else {
    // Both matched.  Select the longest.
    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
  }

  // A half-match was found, sort out the return data.
  var text1_a, text1_b, text2_a, text2_b;
  if (text1.length > text2.length) {
    text1_a = hm[0];
    text1_b = hm[1];
    text2_a = hm[2];
    text2_b = hm[3];
  } else {
    text2_a = hm[0];
    text2_b = hm[1];
    text1_a = hm[2];
    text1_b = hm[3];
  }
  var mid_common = hm[4];
  return [text1_a, text1_b, text2_a, text2_b, mid_common];
};


/**
 * Reduce the number of edits by eliminating semantically trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupSemantic = function(diffs) {
  var changes = false;
  var equalities = [];  // Stack of indices where equalities are found.
  var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
  /** @type {?string} */
  var lastequality = null;
  // Always equal to diffs[equalities[equalitiesLength - 1]][1]
  var pointer = 0;  // Index of current position.
  // Number of characters that changed prior to the equality.
  var length_insertions1 = 0;
  var length_deletions1 = 0;
  // Number of characters that changed after the equality.
  var length_insertions2 = 0;
  var length_deletions2 = 0;
  while (pointer < diffs.length) {
    if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
      equalities[equalitiesLength++] = pointer;
      length_insertions1 = length_insertions2;
      length_deletions1 = length_deletions2;
      length_insertions2 = 0;
      length_deletions2 = 0;
      lastequality = diffs[pointer][1];
    } else {  // An insertion or deletion.
      if (diffs[pointer][0] == DIFF_INSERT) {
        length_insertions2 += diffs[pointer][1].length;
      } else {
        length_deletions2 += diffs[pointer][1].length;
      }
      // Eliminate an equality that is smaller or equal to the edits on both
      // sides of it.
      if (lastequality && (lastequality.length <=
          Math.max(length_insertions1, length_deletions1)) &&
          (lastequality.length <= Math.max(length_insertions2,
                                           length_deletions2))) {
        // Duplicate record.
        diffs.splice(equalities[equalitiesLength - 1], 0,
                     [DIFF_DELETE, lastequality]);
        // Change second copy to insert.
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        // Throw away the equality we just deleted.
        equalitiesLength--;
        // Throw away the previous equality (it needs to be reevaluated).
        equalitiesLength--;
        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
        length_insertions1 = 0;  // Reset the counters.
        length_deletions1 = 0;
        length_insertions2 = 0;
        length_deletions2 = 0;
        lastequality = null;
        changes = true;
      }
    }
    pointer++;
  }

  // Normalize the diff.
  if (changes) {
    this.diff_cleanupMerge(diffs);
  }
  this.diff_cleanupSemanticLossless(diffs);

  // Find any overlaps between deletions and insertions.
  // e.g: <del>abcxxx</del><ins>xxxdef</ins>
  //   -> <del>abc</del>xxx<ins>def</ins>
  // e.g: <del>xxxabc</del><ins>defxxx</ins>
  //   -> <ins>def</ins>xxx<del>abc</del>
  // Only extract an overlap if it is as big as the edit ahead or behind it.
  pointer = 1;
  while (pointer < diffs.length) {
    if (diffs[pointer - 1][0] == DIFF_DELETE &&
        diffs[pointer][0] == DIFF_INSERT) {
      var deletion = diffs[pointer - 1][1];
      var insertion = diffs[pointer][1];
      var overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
      var overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
      if (overlap_length1 >= overlap_length2) {
        if (overlap_length1 >= deletion.length / 2 ||
            overlap_length1 >= insertion.length / 2) {
          // Overlap found.  Insert an equality and trim the surrounding edits.
          diffs.splice(pointer, 0,
              [DIFF_EQUAL, insertion.substring(0, overlap_length1)]);
          diffs[pointer - 1][1] =
              deletion.substring(0, deletion.length - overlap_length1);
          diffs[pointer + 1][1] = insertion.substring(overlap_length1);
          pointer++;
        }
      } else {
        if (overlap_length2 >= deletion.length / 2 ||
            overlap_length2 >= insertion.length / 2) {
          // Reverse overlap found.
          // Insert an equality and swap and trim the surrounding edits.
          diffs.splice(pointer, 0,
              [DIFF_EQUAL, deletion.substring(0, overlap_length2)]);
          diffs[pointer - 1][0] = DIFF_INSERT;
          diffs[pointer - 1][1] =
              insertion.substring(0, insertion.length - overlap_length2);
          diffs[pointer + 1][0] = DIFF_DELETE;
          diffs[pointer + 1][1] =
              deletion.substring(overlap_length2);
          pointer++;
        }
      }
      pointer++;
    }
    pointer++;
  }
};


/**
 * Look for single edits surrounded on both sides by equalities
 * which can be shifted sideways to align the edit to a word boundary.
 * e.g: The c<ins>at c</ins>ame. -> The <ins>cat </ins>came.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupSemanticLossless = function(diffs) {
  /**
   * Given two strings, compute a score representing whether the internal
   * boundary falls on logical boundaries.
   * Scores range from 6 (best) to 0 (worst).
   * Closure, but does not reference any external variables.
   * @param {string} one First string.
   * @param {string} two Second string.
   * @return {number} The score.
   * @private
   */
  function diff_cleanupSemanticScore_(one, two) {
    if (!one || !two) {
      // Edges are the best.
      return 6;
    }

    // Each port of this function behaves slightly differently due to
    // subtle differences in each language's definition of things like
    // 'whitespace'.  Since this function's purpose is largely cosmetic,
    // the choice has been made to use each language's native features
    // rather than force total conformity.
    var char1 = one.charAt(one.length - 1);
    var char2 = two.charAt(0);
    var nonAlphaNumeric1 = char1.match(diff_match_patch.nonAlphaNumericRegex_);
    var nonAlphaNumeric2 = char2.match(diff_match_patch.nonAlphaNumericRegex_);
    var whitespace1 = nonAlphaNumeric1 &&
        char1.match(diff_match_patch.whitespaceRegex_);
    var whitespace2 = nonAlphaNumeric2 &&
        char2.match(diff_match_patch.whitespaceRegex_);
    var lineBreak1 = whitespace1 &&
        char1.match(diff_match_patch.linebreakRegex_);
    var lineBreak2 = whitespace2 &&
        char2.match(diff_match_patch.linebreakRegex_);
    var blankLine1 = lineBreak1 &&
        one.match(diff_match_patch.blanklineEndRegex_);
    var blankLine2 = lineBreak2 &&
        two.match(diff_match_patch.blanklineStartRegex_);

    if (blankLine1 || blankLine2) {
      // Five points for blank lines.
      return 5;
    } else if (lineBreak1 || lineBreak2) {
      // Four points for line breaks.
      return 4;
    } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
      // Three points for end of sentences.
      return 3;
    } else if (whitespace1 || whitespace2) {
      // Two points for whitespace.
      return 2;
    } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
      // One point for non-alphanumeric.
      return 1;
    }
    return 0;
  }

  var pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
        diffs[pointer + 1][0] == DIFF_EQUAL) {
      // This is a single edit surrounded by equalities.
      var equality1 = diffs[pointer - 1][1];
      var edit = diffs[pointer][1];
      var equality2 = diffs[pointer + 1][1];

      // First, shift the edit as far left as possible.
      var commonOffset = this.diff_commonSuffix(equality1, edit);
      if (commonOffset) {
        var commonString = edit.substring(edit.length - commonOffset);
        equality1 = equality1.substring(0, equality1.length - commonOffset);
        edit = commonString + edit.substring(0, edit.length - commonOffset);
        equality2 = commonString + equality2;
      }

      // Second, step character by character right, looking for the best fit.
      var bestEquality1 = equality1;
      var bestEdit = edit;
      var bestEquality2 = equality2;
      var bestScore = diff_cleanupSemanticScore_(equality1, edit) +
          diff_cleanupSemanticScore_(edit, equality2);
      while (edit.charAt(0) === equality2.charAt(0)) {
        equality1 += edit.charAt(0);
        edit = edit.substring(1) + equality2.charAt(0);
        equality2 = equality2.substring(1);
        var score = diff_cleanupSemanticScore_(equality1, edit) +
            diff_cleanupSemanticScore_(edit, equality2);
        // The >= encourages trailing rather than leading whitespace on edits.
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }

      if (diffs[pointer - 1][1] != bestEquality1) {
        // We have an improvement, save it back to the diff.
        if (bestEquality1) {
          diffs[pointer - 1][1] = bestEquality1;
        } else {
          diffs.splice(pointer - 1, 1);
          pointer--;
        }
        diffs[pointer][1] = bestEdit;
        if (bestEquality2) {
          diffs[pointer + 1][1] = bestEquality2;
        } else {
          diffs.splice(pointer + 1, 1);
          pointer--;
        }
      }
    }
    pointer++;
  }
};

// Define some regex patterns for matching boundaries.
diff_match_patch.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
diff_match_patch.whitespaceRegex_ = /\s/;
diff_match_patch.linebreakRegex_ = /[\r\n]/;
diff_match_patch.blanklineEndRegex_ = /\n\r?\n$/;
diff_match_patch.blanklineStartRegex_ = /^\r?\n\r?\n/;

/**
 * Reduce the number of edits by eliminating operationally trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupEfficiency = function(diffs) {
  var changes = false;
  var equalities = [];  // Stack of indices where equalities are found.
  var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
  /** @type {?string} */
  var lastequality = null;
  // Always equal to diffs[equalities[equalitiesLength - 1]][1]
  var pointer = 0;  // Index of current position.
  // Is there an insertion operation before the last equality.
  var pre_ins = false;
  // Is there a deletion operation before the last equality.
  var pre_del = false;
  // Is there an insertion operation after the last equality.
  var post_ins = false;
  // Is there a deletion operation after the last equality.
  var post_del = false;
  while (pointer < diffs.length) {
    if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
      if (diffs[pointer][1].length < this.Diff_EditCost &&
          (post_ins || post_del)) {
        // Candidate found.
        equalities[equalitiesLength++] = pointer;
        pre_ins = post_ins;
        pre_del = post_del;
        lastequality = diffs[pointer][1];
      } else {
        // Not a candidate, and can never become one.
        equalitiesLength = 0;
        lastequality = null;
      }
      post_ins = post_del = false;
    } else {  // An insertion or deletion.
      if (diffs[pointer][0] == DIFF_DELETE) {
        post_del = true;
      } else {
        post_ins = true;
      }
      /*
       * Five types to be split:
       * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
       * <ins>A</ins>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<ins>C</ins>
       * <ins>A</del>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<del>C</del>
       */
      if (lastequality && ((pre_ins && pre_del && post_ins && post_del) ||
                           ((lastequality.length < this.Diff_EditCost / 2) &&
                            (pre_ins + pre_del + post_ins + post_del) == 3))) {
        // Duplicate record.
        diffs.splice(equalities[equalitiesLength - 1], 0,
                     [DIFF_DELETE, lastequality]);
        // Change second copy to insert.
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        equalitiesLength--;  // Throw away the equality we just deleted;
        lastequality = null;
        if (pre_ins && pre_del) {
          // No changes made which could affect previous entry, keep going.
          post_ins = post_del = true;
          equalitiesLength = 0;
        } else {
          equalitiesLength--;  // Throw away the previous equality.
          pointer = equalitiesLength > 0 ?
              equalities[equalitiesLength - 1] : -1;
          post_ins = post_del = false;
        }
        changes = true;
      }
    }
    pointer++;
  }

  if (changes) {
    this.diff_cleanupMerge(diffs);
  }
};


/**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupMerge = function(diffs) {
  diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = '';
  var text_insert = '';
  var commonlength;
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        // Upon reaching an equality, check for prior redundancies.
        if (count_delete + count_insert > 1) {
          if (count_delete !== 0 && count_insert !== 0) {
            // Factor out any common prefixies.
            commonlength = this.diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if ((pointer - count_delete - count_insert) > 0 &&
                  diffs[pointer - count_delete - count_insert - 1][0] ==
                  DIFF_EQUAL) {
                diffs[pointer - count_delete - count_insert - 1][1] +=
                    text_insert.substring(0, commonlength);
              } else {
                diffs.splice(0, 0, [DIFF_EQUAL,
                                    text_insert.substring(0, commonlength)]);
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            // Factor out any common suffixies.
            commonlength = this.diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length -
                  commonlength) + diffs[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length -
                  commonlength);
              text_delete = text_delete.substring(0, text_delete.length -
                  commonlength);
            }
          }
          // Delete the offending records and add the merged ones.
          if (count_delete === 0) {
            diffs.splice(pointer - count_insert,
                count_delete + count_insert, [DIFF_INSERT, text_insert]);
          } else if (count_insert === 0) {
            diffs.splice(pointer - count_delete,
                count_delete + count_insert, [DIFF_DELETE, text_delete]);
          } else {
            diffs.splice(pointer - count_delete - count_insert,
                count_delete + count_insert, [DIFF_DELETE, text_delete],
                [DIFF_INSERT, text_insert]);
          }
          pointer = pointer - count_delete - count_insert +
                    (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
        } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
          // Merge this equality with the previous one.
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === '') {
    diffs.pop();  // Remove the dummy entry at the end.
  }

  // Second pass: look for single edits surrounded on both sides by equalities
  // which can be shifted sideways to eliminate an equality.
  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  var changes = false;
  pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
        diffs[pointer + 1][0] == DIFF_EQUAL) {
      // This is a single edit surrounded by equalities.
      if (diffs[pointer][1].substring(diffs[pointer][1].length -
          diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
        // Shift the edit over the previous equality.
        diffs[pointer][1] = diffs[pointer - 1][1] +
            diffs[pointer][1].substring(0, diffs[pointer][1].length -
                                        diffs[pointer - 1][1].length);
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
          diffs[pointer + 1][1]) {
        // Shift the edit over the next equality.
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] =
            diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
            diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  // If shifts were made, the diff needs reordering and another shift sweep.
  if (changes) {
    this.diff_cleanupMerge(diffs);
  }
};


/**
 * loc is a location in text1, compute and return the equivalent location in
 * text2.
 * e.g. 'The cat' vs 'The big cat', 1->1, 5->8
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {number} loc Location within text1.
 * @return {number} Location within text2.
 */
diff_match_patch.prototype.diff_xIndex = function(diffs, loc) {
  var chars1 = 0;
  var chars2 = 0;
  var last_chars1 = 0;
  var last_chars2 = 0;
  var x;
  for (x = 0; x < diffs.length; x++) {
    if (diffs[x][0] !== DIFF_INSERT) {  // Equality or deletion.
      chars1 += diffs[x][1].length;
    }
    if (diffs[x][0] !== DIFF_DELETE) {  // Equality or insertion.
      chars2 += diffs[x][1].length;
    }
    if (chars1 > loc) {  // Overshot the location.
      break;
    }
    last_chars1 = chars1;
    last_chars2 = chars2;
  }
  // Was the location was deleted?
  if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
    return last_chars2;
  }
  // Add the remaining character length.
  return last_chars2 + (loc - last_chars1);
};


/**
 * Convert a diff array into a pretty HTML report.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} HTML representation.
 */
diff_match_patch.prototype.diff_prettyHtml = function(diffs) {
  var html = [];
  var pattern_amp = /&/g;
  var pattern_lt = /</g;
  var pattern_gt = />/g;
  var pattern_para = /\n/g;
  for (var x = 0; x < diffs.length; x++) {
    var op = diffs[x][0];    // Operation (insert, delete, equal)
    var data = diffs[x][1];  // Text of change.
    var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;')
        .replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
    switch (op) {
      case DIFF_INSERT:
        html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
        break;
      case DIFF_DELETE:
        html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
        break;
      case DIFF_EQUAL:
        html[x] = '<span>' + text + '</span>';
        break;
    }
  }
  return html.join('');
};


/**
 * Compute and return the source text (all equalities and deletions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Source text.
 */
diff_match_patch.prototype.diff_text1 = function(diffs) {
  var text = [];
  for (var x = 0; x < diffs.length; x++) {
    if (diffs[x][0] !== DIFF_INSERT) {
      text[x] = diffs[x][1];
    }
  }
  return text.join('');
};


/**
 * Compute and return the destination text (all equalities and insertions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Destination text.
 */
diff_match_patch.prototype.diff_text2 = function(diffs) {
  var text = [];
  for (var x = 0; x < diffs.length; x++) {
    if (diffs[x][0] !== DIFF_DELETE) {
      text[x] = diffs[x][1];
    }
  }
  return text.join('');
};


/**
 * Compute the Levenshtein distance; the number of inserted, deleted or
 * substituted characters.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {number} Number of changes.
 */
diff_match_patch.prototype.diff_levenshtein = function(diffs) {
  var levenshtein = 0;
  var insertions = 0;
  var deletions = 0;
  for (var x = 0; x < diffs.length; x++) {
    var op = diffs[x][0];
    var data = diffs[x][1];
    switch (op) {
      case DIFF_INSERT:
        insertions += data.length;
        break;
      case DIFF_DELETE:
        deletions += data.length;
        break;
      case DIFF_EQUAL:
        // A deletion and an insertion is one substitution.
        levenshtein += Math.max(insertions, deletions);
        insertions = 0;
        deletions = 0;
        break;
    }
  }
  levenshtein += Math.max(insertions, deletions);
  return levenshtein;
};


/**
 * Crush the diff into an encoded string which describes the operations
 * required to transform text1 into text2.
 * E.g. =3\t-2\t+ing  -> Keep 3 chars, delete 2 chars, insert 'ing'.
 * Operations are tab-separated.  Inserted text is escaped using %xx notation.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Delta text.
 */
diff_match_patch.prototype.diff_toDelta = function(diffs) {
  var text = [];
  for (var x = 0; x < diffs.length; x++) {
    switch (diffs[x][0]) {
      case DIFF_INSERT:
        text[x] = '+' + encodeURI(diffs[x][1]);
        break;
      case DIFF_DELETE:
        text[x] = '-' + diffs[x][1].length;
        break;
      case DIFF_EQUAL:
        text[x] = '=' + diffs[x][1].length;
        break;
    }
  }
  return text.join('\t').replace(/%20/g, ' ');
};


/**
 * Given the original text1, and an encoded string which describes the
 * operations required to transform text1 into text2, compute the full diff.
 * @param {string} text1 Source string for the diff.
 * @param {string} delta Delta text.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @throws {!Error} If invalid input.
 */
diff_match_patch.prototype.diff_fromDelta = function(text1, delta) {
  var diffs = [];
  var diffsLength = 0;  // Keeping our own length var is faster in JS.
  var pointer = 0;  // Cursor in text1
  var tokens = delta.split(/\t/g);
  for (var x = 0; x < tokens.length; x++) {
    // Each token begins with a one character parameter which specifies the
    // operation of this token (delete, insert, equality).
    var param = tokens[x].substring(1);
    switch (tokens[x].charAt(0)) {
      case '+':
        try {
          diffs[diffsLength++] = [DIFF_INSERT, decodeURI(param)];
        } catch (ex) {
          // Malformed URI sequence.
          throw new Error('Illegal escape in diff_fromDelta: ' + param);
        }
        break;
      case '-':
        // Fall through.
      case '=':
        var n = parseInt(param, 10);
        if (isNaN(n) || n < 0) {
          throw new Error('Invalid number in diff_fromDelta: ' + param);
        }
        var text = text1.substring(pointer, pointer += n);
        if (tokens[x].charAt(0) == '=') {
          diffs[diffsLength++] = [DIFF_EQUAL, text];
        } else {
          diffs[diffsLength++] = [DIFF_DELETE, text];
        }
        break;
      default:
        // Blank tokens are ok (from a trailing \t).
        // Anything else is an error.
        if (tokens[x]) {
          throw new Error('Invalid diff operation in diff_fromDelta: ' +
                          tokens[x]);
        }
    }
  }
  if (pointer != text1.length) {
    throw new Error('Delta length (' + pointer +
        ') does not equal source text length (' + text1.length + ').');
  }
  return diffs;
};


//  MATCH FUNCTIONS


/**
 * Locate the best instance of 'pattern' in 'text' near 'loc'.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 */
diff_match_patch.prototype.match_main = function(text, pattern, loc) {
  // Check for null inputs.
  if (text == null || pattern == null || loc == null) {
    throw new Error('Null input. (match_main)');
  }

  loc = Math.max(0, Math.min(loc, text.length));
  if (text == pattern) {
    // Shortcut (potentially not guaranteed by the algorithm)
    return 0;
  } else if (!text.length) {
    // Nothing to match.
    return -1;
  } else if (text.substring(loc, loc + pattern.length) == pattern) {
    // Perfect match at the perfect spot!  (Includes case of null pattern)
    return loc;
  } else {
    // Do a fuzzy compare.
    return this.match_bitap_(text, pattern, loc);
  }
};


/**
 * Locate the best instance of 'pattern' in 'text' near 'loc' using the
 * Bitap algorithm.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 * @private
 */
diff_match_patch.prototype.match_bitap_ = function(text, pattern, loc) {
  if (pattern.length > this.Match_MaxBits) {
    throw new Error('Pattern too long for this browser.');
  }

  // Initialise the alphabet.
  var s = this.match_alphabet_(pattern);

  var dmp = this;  // 'this' becomes 'window' in a closure.

  /**
   * Compute and return the score for a match with e errors and x location.
   * Accesses loc and pattern through being a closure.
   * @param {number} e Number of errors in match.
   * @param {number} x Location of match.
   * @return {number} Overall score for match (0.0 = good, 1.0 = bad).
   * @private
   */
  function match_bitapScore_(e, x) {
    var accuracy = e / pattern.length;
    var proximity = Math.abs(loc - x);
    if (!dmp.Match_Distance) {
      // Dodge divide by zero error.
      return proximity ? 1.0 : accuracy;
    }
    return accuracy + (proximity / dmp.Match_Distance);
  }

  // Highest score beyond which we give up.
  var score_threshold = this.Match_Threshold;
  // Is there a nearby exact match? (speedup)
  var best_loc = text.indexOf(pattern, loc);
  if (best_loc != -1) {
    score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
    // What about in the other direction? (speedup)
    best_loc = text.lastIndexOf(pattern, loc + pattern.length);
    if (best_loc != -1) {
      score_threshold =
          Math.min(match_bitapScore_(0, best_loc), score_threshold);
    }
  }

  // Initialise the bit arrays.
  var matchmask = 1 << (pattern.length - 1);
  best_loc = -1;

  var bin_min, bin_mid;
  var bin_max = pattern.length + text.length;
  var last_rd;
  for (var d = 0; d < pattern.length; d++) {
    // Scan for the best match; each iteration allows for one more error.
    // Run a binary search to determine how far from 'loc' we can stray at this
    // error level.
    bin_min = 0;
    bin_mid = bin_max;
    while (bin_min < bin_mid) {
      if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
        bin_min = bin_mid;
      } else {
        bin_max = bin_mid;
      }
      bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
    }
    // Use the result from this iteration as the maximum for the next.
    bin_max = bin_mid;
    var start = Math.max(1, loc - bin_mid + 1);
    var finish = Math.min(loc + bin_mid, text.length) + pattern.length;

    var rd = Array(finish + 2);
    rd[finish + 1] = (1 << d) - 1;
    for (var j = finish; j >= start; j--) {
      // The alphabet (s) is a sparse hash, so the following line generates
      // warnings.
      var charMatch = s[text.charAt(j - 1)];
      if (d === 0) {  // First pass: exact match.
        rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
      } else {  // Subsequent passes: fuzzy match.
        rd[j] = (((rd[j + 1] << 1) | 1) & charMatch) |
                (((last_rd[j + 1] | last_rd[j]) << 1) | 1) |
                last_rd[j + 1];
      }
      if (rd[j] & matchmask) {
        var score = match_bitapScore_(d, j - 1);
        // This match will almost certainly be better than any existing match.
        // But check anyway.
        if (score <= score_threshold) {
          // Told you so.
          score_threshold = score;
          best_loc = j - 1;
          if (best_loc > loc) {
            // When passing loc, don't exceed our current distance from loc.
            start = Math.max(1, 2 * loc - best_loc);
          } else {
            // Already passed loc, downhill from here on in.
            break;
          }
        }
      }
    }
    // No hope for a (better) match at greater error levels.
    if (match_bitapScore_(d + 1, loc) > score_threshold) {
      break;
    }
    last_rd = rd;
  }
  return best_loc;
};


/**
 * Initialise the alphabet for the Bitap algorithm.
 * @param {string} pattern The text to encode.
 * @return {!Object} Hash of character locations.
 * @private
 */
diff_match_patch.prototype.match_alphabet_ = function(pattern) {
  var s = {};
  for (var i = 0; i < pattern.length; i++) {
    s[pattern.charAt(i)] = 0;
  }
  for (var i = 0; i < pattern.length; i++) {
    s[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
  }
  return s;
};


//  PATCH FUNCTIONS


/**
 * Increase the context until it is unique,
 * but don't let the pattern expand beyond Match_MaxBits.
 * @param {!diff_match_patch.patch_obj} patch The patch to grow.
 * @param {string} text Source text.
 * @private
 */
diff_match_patch.prototype.patch_addContext_ = function(patch, text) {
  if (text.length == 0) {
    return;
  }
  var pattern = text.substring(patch.start2, patch.start2 + patch.length1);
  var padding = 0;

  // Look for the first and last matches of pattern in text.  If two different
  // matches are found, increase the pattern length.
  while (text.indexOf(pattern) != text.lastIndexOf(pattern) &&
         pattern.length < this.Match_MaxBits - this.Patch_Margin -
         this.Patch_Margin) {
    padding += this.Patch_Margin;
    pattern = text.substring(patch.start2 - padding,
                             patch.start2 + patch.length1 + padding);
  }
  // Add one chunk for good luck.
  padding += this.Patch_Margin;

  // Add the prefix.
  var prefix = text.substring(patch.start2 - padding, patch.start2);
  if (prefix) {
    patch.diffs.unshift([DIFF_EQUAL, prefix]);
  }
  // Add the suffix.
  var suffix = text.substring(patch.start2 + patch.length1,
                              patch.start2 + patch.length1 + padding);
  if (suffix) {
    patch.diffs.push([DIFF_EQUAL, suffix]);
  }

  // Roll back the start points.
  patch.start1 -= prefix.length;
  patch.start2 -= prefix.length;
  // Extend the lengths.
  patch.length1 += prefix.length + suffix.length;
  patch.length2 += prefix.length + suffix.length;
};


/**
 * Compute a list of patches to turn text1 into text2.
 * Use diffs if provided, otherwise compute it ourselves.
 * There are four ways to call this function, depending on what data is
 * available to the caller:
 * Method 1:
 * a = text1, b = text2
 * Method 2:
 * a = diffs
 * Method 3 (optimal):
 * a = text1, b = diffs
 * Method 4 (deprecated, use method 3):
 * a = text1, b = text2, c = diffs
 *
 * @param {string|!Array.<!diff_match_patch.Diff>} a text1 (methods 1,3,4) or
 * Array of diff tuples for text1 to text2 (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_b text2 (methods 1,4) or
 * Array of diff tuples for text1 to text2 (method 3) or undefined (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_c Array of diff tuples
 * for text1 to text2 (method 4) or undefined (methods 1,2,3).
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */
diff_match_patch.prototype.patch_make = function(a, opt_b, opt_c) {
  var text1, diffs;
  if (typeof a == 'string' && typeof opt_b == 'string' &&
      typeof opt_c == 'undefined') {
    // Method 1: text1, text2
    // Compute diffs from text1 and text2.
    text1 = /** @type {string} */(a);
    diffs = this.diff_main(text1, /** @type {string} */(opt_b), true);
    if (diffs.length > 2) {
      this.diff_cleanupSemantic(diffs);
      this.diff_cleanupEfficiency(diffs);
    }
  } else if (a && typeof a == 'object' && typeof opt_b == 'undefined' &&
      typeof opt_c == 'undefined') {
    // Method 2: diffs
    // Compute text1 from diffs.
    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(a);
    text1 = this.diff_text1(diffs);
  } else if (typeof a == 'string' && opt_b && typeof opt_b == 'object' &&
      typeof opt_c == 'undefined') {
    // Method 3: text1, diffs
    text1 = /** @type {string} */(a);
    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_b);
  } else if (typeof a == 'string' && typeof opt_b == 'string' &&
      opt_c && typeof opt_c == 'object') {
    // Method 4: text1, text2, diffs
    // text2 is not used.
    text1 = /** @type {string} */(a);
    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_c);
  } else {
    throw new Error('Unknown call format to patch_make.');
  }

  if (diffs.length === 0) {
    return [];  // Get rid of the null case.
  }
  var patches = [];
  var patch = new diff_match_patch.patch_obj();
  var patchDiffLength = 0;  // Keeping our own length var is faster in JS.
  var char_count1 = 0;  // Number of characters into the text1 string.
  var char_count2 = 0;  // Number of characters into the text2 string.
  // Start with text1 (prepatch_text) and apply the diffs until we arrive at
  // text2 (postpatch_text).  We recreate the patches one by one to determine
  // context info.
  var prepatch_text = text1;
  var postpatch_text = text1;
  for (var x = 0; x < diffs.length; x++) {
    var diff_type = diffs[x][0];
    var diff_text = diffs[x][1];

    if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
      // A new patch starts here.
      patch.start1 = char_count1;
      patch.start2 = char_count2;
    }

    switch (diff_type) {
      case DIFF_INSERT:
        patch.diffs[patchDiffLength++] = diffs[x];
        patch.length2 += diff_text.length;
        postpatch_text = postpatch_text.substring(0, char_count2) + diff_text +
                         postpatch_text.substring(char_count2);
        break;
      case DIFF_DELETE:
        patch.length1 += diff_text.length;
        patch.diffs[patchDiffLength++] = diffs[x];
        postpatch_text = postpatch_text.substring(0, char_count2) +
                         postpatch_text.substring(char_count2 +
                             diff_text.length);
        break;
      case DIFF_EQUAL:
        if (diff_text.length <= 2 * this.Patch_Margin &&
            patchDiffLength && diffs.length != x + 1) {
          // Small equality inside a patch.
          patch.diffs[patchDiffLength++] = diffs[x];
          patch.length1 += diff_text.length;
          patch.length2 += diff_text.length;
        } else if (diff_text.length >= 2 * this.Patch_Margin) {
          // Time for a new patch.
          if (patchDiffLength) {
            this.patch_addContext_(patch, prepatch_text);
            patches.push(patch);
            patch = new diff_match_patch.patch_obj();
            patchDiffLength = 0;
            // Unlike Unidiff, our patch lists have a rolling context.
            // http://code.google.com/p/google-diff-match-patch/wiki/Unidiff
            // Update prepatch text & pos to reflect the application of the
            // just completed patch.
            prepatch_text = postpatch_text;
            char_count1 = char_count2;
          }
        }
        break;
    }

    // Update the current character count.
    if (diff_type !== DIFF_INSERT) {
      char_count1 += diff_text.length;
    }
    if (diff_type !== DIFF_DELETE) {
      char_count2 += diff_text.length;
    }
  }
  // Pick up the leftover patch if not empty.
  if (patchDiffLength) {
    this.patch_addContext_(patch, prepatch_text);
    patches.push(patch);
  }

  return patches;
};


/**
 * Given an array of patches, return another array that is identical.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */
diff_match_patch.prototype.patch_deepCopy = function(patches) {
  // Making deep copies is hard in JavaScript.
  var patchesCopy = [];
  for (var x = 0; x < patches.length; x++) {
    var patch = patches[x];
    var patchCopy = new diff_match_patch.patch_obj();
    patchCopy.diffs = [];
    for (var y = 0; y < patch.diffs.length; y++) {
      patchCopy.diffs[y] = patch.diffs[y].slice();
    }
    patchCopy.start1 = patch.start1;
    patchCopy.start2 = patch.start2;
    patchCopy.length1 = patch.length1;
    patchCopy.length2 = patch.length2;
    patchesCopy[x] = patchCopy;
  }
  return patchesCopy;
};


/**
 * Merge a set of patches onto the text.  Return a patched text, as well
 * as a list of true/false values indicating which patches were applied.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @param {string} text Old text.
 * @return {!Array.<string|!Array.<boolean>>} Two element Array, containing the
 *      new text and an array of boolean values.
 */
diff_match_patch.prototype.patch_apply = function(patches, text) {
  if (patches.length == 0) {
    return [text, []];
  }

  // Deep copy the patches so that no changes are made to originals.
  patches = this.patch_deepCopy(patches);

  var nullPadding = this.patch_addPadding(patches);
  text = nullPadding + text + nullPadding;

  this.patch_splitMax(patches);
  // delta keeps track of the offset between the expected and actual location
  // of the previous patch.  If there are patches expected at positions 10 and
  // 20, but the first patch was found at 12, delta is 2 and the second patch
  // has an effective expected position of 22.
  var delta = 0;
  var results = [];
  for (var x = 0; x < patches.length; x++) {
    var expected_loc = patches[x].start2 + delta;
    var text1 = this.diff_text1(patches[x].diffs);
    var start_loc;
    var end_loc = -1;
    if (text1.length > this.Match_MaxBits) {
      // patch_splitMax will only provide an oversized pattern in the case of
      // a monster delete.
      start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits),
                                  expected_loc);
      if (start_loc != -1) {
        end_loc = this.match_main(text,
            text1.substring(text1.length - this.Match_MaxBits),
            expected_loc + text1.length - this.Match_MaxBits);
        if (end_loc == -1 || start_loc >= end_loc) {
          // Can't find valid trailing context.  Drop this patch.
          start_loc = -1;
        }
      }
    } else {
      start_loc = this.match_main(text, text1, expected_loc);
    }
    if (start_loc == -1) {
      // No match found.  :(
      results[x] = false;
      // Subtract the delta for this failed patch from subsequent patches.
      delta -= patches[x].length2 - patches[x].length1;
    } else {
      // Found a match.  :)
      results[x] = true;
      delta = start_loc - expected_loc;
      var text2;
      if (end_loc == -1) {
        text2 = text.substring(start_loc, start_loc + text1.length);
      } else {
        text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
      }
      if (text1 == text2) {
        // Perfect match, just shove the replacement text in.
        text = text.substring(0, start_loc) +
               this.diff_text2(patches[x].diffs) +
               text.substring(start_loc + text1.length);
      } else {
        // Imperfect match.  Run a diff to get a framework of equivalent
        // indices.
        var diffs = this.diff_main(text1, text2, false);
        if (text1.length > this.Match_MaxBits &&
            this.diff_levenshtein(diffs) / text1.length >
            this.Patch_DeleteThreshold) {
          // The end points match, but the content is unacceptably bad.
          results[x] = false;
        } else {
          this.diff_cleanupSemanticLossless(diffs);
          var index1 = 0;
          var index2;
          for (var y = 0; y < patches[x].diffs.length; y++) {
            var mod = patches[x].diffs[y];
            if (mod[0] !== DIFF_EQUAL) {
              index2 = this.diff_xIndex(diffs, index1);
            }
            if (mod[0] === DIFF_INSERT) {  // Insertion
              text = text.substring(0, start_loc + index2) + mod[1] +
                     text.substring(start_loc + index2);
            } else if (mod[0] === DIFF_DELETE) {  // Deletion
              text = text.substring(0, start_loc + index2) +
                     text.substring(start_loc + this.diff_xIndex(diffs,
                         index1 + mod[1].length));
            }
            if (mod[0] !== DIFF_DELETE) {
              index1 += mod[1].length;
            }
          }
        }
      }
    }
  }
  // Strip the padding off.
  text = text.substring(nullPadding.length, text.length - nullPadding.length);
  return [text, results];
};


/**
 * Add some padding on text start and end so that edges can match something.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} The padding string added to each side.
 */
diff_match_patch.prototype.patch_addPadding = function(patches) {
  var paddingLength = this.Patch_Margin;
  var nullPadding = '';
  for (var x = 1; x <= paddingLength; x++) {
    nullPadding += String.fromCharCode(x);
  }

  // Bump all the patches forward.
  for (var x = 0; x < patches.length; x++) {
    patches[x].start1 += paddingLength;
    patches[x].start2 += paddingLength;
  }

  // Add some padding on start of first diff.
  var patch = patches[0];
  var diffs = patch.diffs;
  if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
    // Add nullPadding equality.
    diffs.unshift([DIFF_EQUAL, nullPadding]);
    patch.start1 -= paddingLength;  // Should be 0.
    patch.start2 -= paddingLength;  // Should be 0.
    patch.length1 += paddingLength;
    patch.length2 += paddingLength;
  } else if (paddingLength > diffs[0][1].length) {
    // Grow first equality.
    var extraLength = paddingLength - diffs[0][1].length;
    diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
    patch.start1 -= extraLength;
    patch.start2 -= extraLength;
    patch.length1 += extraLength;
    patch.length2 += extraLength;
  }

  // Add some padding on end of last diff.
  patch = patches[patches.length - 1];
  diffs = patch.diffs;
  if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
    // Add nullPadding equality.
    diffs.push([DIFF_EQUAL, nullPadding]);
    patch.length1 += paddingLength;
    patch.length2 += paddingLength;
  } else if (paddingLength > diffs[diffs.length - 1][1].length) {
    // Grow last equality.
    var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
    diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
    patch.length1 += extraLength;
    patch.length2 += extraLength;
  }

  return nullPadding;
};


/**
 * Look through the patches and break up any which are longer than the maximum
 * limit of the match algorithm.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 */
diff_match_patch.prototype.patch_splitMax = function(patches) {
  var patch_size = this.Match_MaxBits;
  for (var x = 0; x < patches.length; x++) {
    if (patches[x].length1 <= patch_size) {
      continue;
    }
    var bigpatch = patches[x];
    // Remove the big old patch.
    patches.splice(x--, 1);
    var start1 = bigpatch.start1;
    var start2 = bigpatch.start2;
    var precontext = '';
    while (bigpatch.diffs.length !== 0) {
      // Create one of several smaller patches.
      var patch = new diff_match_patch.patch_obj();
      var empty = true;
      patch.start1 = start1 - precontext.length;
      patch.start2 = start2 - precontext.length;
      if (precontext !== '') {
        patch.length1 = patch.length2 = precontext.length;
        patch.diffs.push([DIFF_EQUAL, precontext]);
      }
      while (bigpatch.diffs.length !== 0 &&
             patch.length1 < patch_size - this.Patch_Margin) {
        var diff_type = bigpatch.diffs[0][0];
        var diff_text = bigpatch.diffs[0][1];
        if (diff_type === DIFF_INSERT) {
          // Insertions are harmless.
          patch.length2 += diff_text.length;
          start2 += diff_text.length;
          patch.diffs.push(bigpatch.diffs.shift());
          empty = false;
        } else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 &&
                   patch.diffs[0][0] == DIFF_EQUAL &&
                   diff_text.length > 2 * patch_size) {
          // This is a large deletion.  Let it pass in one chunk.
          patch.length1 += diff_text.length;
          start1 += diff_text.length;
          empty = false;
          patch.diffs.push([diff_type, diff_text]);
          bigpatch.diffs.shift();
        } else {
          // Deletion or equality.  Only take as much as we can stomach.
          diff_text = diff_text.substring(0,
              patch_size - patch.length1 - this.Patch_Margin);
          patch.length1 += diff_text.length;
          start1 += diff_text.length;
          if (diff_type === DIFF_EQUAL) {
            patch.length2 += diff_text.length;
            start2 += diff_text.length;
          } else {
            empty = false;
          }
          patch.diffs.push([diff_type, diff_text]);
          if (diff_text == bigpatch.diffs[0][1]) {
            bigpatch.diffs.shift();
          } else {
            bigpatch.diffs[0][1] =
                bigpatch.diffs[0][1].substring(diff_text.length);
          }
        }
      }
      // Compute the head context for the next patch.
      precontext = this.diff_text2(patch.diffs);
      precontext =
          precontext.substring(precontext.length - this.Patch_Margin);
      // Append the end context for this patch.
      var postcontext = this.diff_text1(bigpatch.diffs)
                            .substring(0, this.Patch_Margin);
      if (postcontext !== '') {
        patch.length1 += postcontext.length;
        patch.length2 += postcontext.length;
        if (patch.diffs.length !== 0 &&
            patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
          patch.diffs[patch.diffs.length - 1][1] += postcontext;
        } else {
          patch.diffs.push([DIFF_EQUAL, postcontext]);
        }
      }
      if (!empty) {
        patches.splice(++x, 0, patch);
      }
    }
  }
};


/**
 * Take a list of patches and return a textual representation.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} Text representation of patches.
 */
diff_match_patch.prototype.patch_toText = function(patches) {
  var text = [];
  for (var x = 0; x < patches.length; x++) {
    text[x] = patches[x];
  }
  return text.join('');
};


/**
 * Parse a textual representation of patches and return a list of Patch objects.
 * @param {string} textline Text representation of patches.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 * @throws {!Error} If invalid input.
 */
diff_match_patch.prototype.patch_fromText = function(textline) {
  var patches = [];
  if (!textline) {
    return patches;
  }
  var text = textline.split('\n');
  var textPointer = 0;
  var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
  while (textPointer < text.length) {
    var m = text[textPointer].match(patchHeader);
    if (!m) {
      throw new Error('Invalid patch string: ' + text[textPointer]);
    }
    var patch = new diff_match_patch.patch_obj();
    patches.push(patch);
    patch.start1 = parseInt(m[1], 10);
    if (m[2] === '') {
      patch.start1--;
      patch.length1 = 1;
    } else if (m[2] == '0') {
      patch.length1 = 0;
    } else {
      patch.start1--;
      patch.length1 = parseInt(m[2], 10);
    }

    patch.start2 = parseInt(m[3], 10);
    if (m[4] === '') {
      patch.start2--;
      patch.length2 = 1;
    } else if (m[4] == '0') {
      patch.length2 = 0;
    } else {
      patch.start2--;
      patch.length2 = parseInt(m[4], 10);
    }
    textPointer++;

    while (textPointer < text.length) {
      var sign = text[textPointer].charAt(0);
      try {
        var line = decodeURI(text[textPointer].substring(1));
      } catch (ex) {
        // Malformed URI sequence.
        throw new Error('Illegal escape in patch_fromText: ' + line);
      }
      if (sign == '-') {
        // Deletion.
        patch.diffs.push([DIFF_DELETE, line]);
      } else if (sign == '+') {
        // Insertion.
        patch.diffs.push([DIFF_INSERT, line]);
      } else if (sign == ' ') {
        // Minor equality.
        patch.diffs.push([DIFF_EQUAL, line]);
      } else if (sign == '@') {
        // Start of next patch.
        break;
      } else if (sign === '') {
        // Blank line?  Whatever.
      } else {
        // WTF?
        throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
      }
      textPointer++;
    }
  }
  return patches;
};


/**
 * Class representing one patch operation.
 * @constructor
 */
diff_match_patch.patch_obj = function() {
  /** @type {!Array.<!diff_match_patch.Diff>} */
  this.diffs = [];
  /** @type {?number} */
  this.start1 = null;
  /** @type {?number} */
  this.start2 = null;
  /** @type {number} */
  this.length1 = 0;
  /** @type {number} */
  this.length2 = 0;
};


/**
 * Emmulate GNU diff's format.
 * Header: @@ -382,8 +481,9 @@
 * Indicies are printed as 1-based, not 0-based.
 * @return {string} The GNU diff string.
 */
diff_match_patch.patch_obj.prototype.toString = function() {
  var coords1, coords2;
  if (this.length1 === 0) {
    coords1 = this.start1 + ',0';
  } else if (this.length1 == 1) {
    coords1 = this.start1 + 1;
  } else {
    coords1 = (this.start1 + 1) + ',' + this.length1;
  }
  if (this.length2 === 0) {
    coords2 = this.start2 + ',0';
  } else if (this.length2 == 1) {
    coords2 = this.start2 + 1;
  } else {
    coords2 = (this.start2 + 1) + ',' + this.length2;
  }
  var text = ['@@ -' + coords1 + ' +' + coords2 + ' @@\n'];
  var op;
  // Escape the body of the patch with %xx notation.
  for (var x = 0; x < this.diffs.length; x++) {
    switch (this.diffs[x][0]) {
      case DIFF_INSERT:
        op = '+';
        break;
      case DIFF_DELETE:
        op = '-';
        break;
      case DIFF_EQUAL:
        op = ' ';
        break;
    }
    text[x + 1] = op + encodeURI(this.diffs[x][1]) + '\n';
  }
  return text.join('').replace(/%20/g, ' ');
};


// The following export code was added by @ForbesLindesay
module.exports = diff_match_patch;
module.exports['diff_match_patch'] = diff_match_patch;
module.exports['DIFF_DELETE'] = DIFF_DELETE;
module.exports['DIFF_INSERT'] = DIFF_INSERT;
module.exports['DIFF_EQUAL'] = DIFF_EQUAL;

},{}],5:[function(_dereq_,module,exports){
// https://html.spec.whatwg.org/multipage/infrastructure.html#document-base-url
module.exports = (function () {
  var baseURI = document.baseURI;

  if (!baseURI) {
    var baseEls = document.getElementsByTagName('base');
    for (var i = 0 ; i < baseEls.length ; i++) {
      if (!!baseEls[i].href) {
        baseURI = baseEls[i].href;
        break;
      }
    }
  }

  return (baseURI || document.documentURI);
})();

},{}],6:[function(_dereq_,module,exports){
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.FragmentAnchor = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var FragmentAnchor = (function () {
    function FragmentAnchor(root, id) {
      _classCallCheck(this, FragmentAnchor);

      if (root === undefined) {
        throw new Error('missing required parameter "root"');
      }
      if (id === undefined) {
        throw new Error('missing required parameter "id"');
      }

      this.root = root;
      this.id = id;
    }

    _createClass(FragmentAnchor, [{
      key: 'toRange',
      value: function toRange() {
        var el = this.root.querySelector('#' + this.id);
        if (el == null) {
          throw new Error('no element found with id "' + this.id + '"');
        }

        var range = this.root.ownerDocument.createRange();
        range.selectNodeContents(el);

        return range;
      }
    }, {
      key: 'toSelector',
      value: function toSelector() {
        var el = this.root.querySelector('#' + this.id);
        if (el == null) {
          throw new Error('no element found with id "' + this.id + '"');
        }

        var conformsTo = 'https://tools.ietf.org/html/rfc3236';
        if (el instanceof SVGElement) {
          conformsTo = 'http://www.w3.org/TR/SVG/';
        }

        return {
          type: 'FragmentSelector',
          value: this.id,
          conformsTo: conformsTo
        };
      }
    }], [{
      key: 'fromRange',
      value: function fromRange(root, range) {
        if (root === undefined) {
          throw new Error('missing required parameter "root"');
        }
        if (range === undefined) {
          throw new Error('missing required parameter "range"');
        }

        var el = range.commonAncestorContainer;
        while (el != null && !el.id) {
          if (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
            el = el.parentElement;
          } else {
            throw new Error('no fragment identifier found');
          }
        }

        return new FragmentAnchor(root, el.id);
      }
    }, {
      key: 'fromSelector',
      value: function fromSelector(root) {
        var selector = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return new FragmentAnchor(root, selector.value);
      }
    }]);

    return FragmentAnchor;
  })();

  module.exports = FragmentAnchor;
});

},{}],7:[function(_dereq_,module,exports){
module.exports = _dereq_('./lib')

},{"./lib":8}],8:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromRange = fromRange;
exports.toRange = toRange;

var _domNodeIterator = _dereq_('dom-node-iterator');

var _domNodeIterator2 = _interopRequireDefault(_domNodeIterator);

var _domSeek = _dereq_('dom-seek');

var _domSeek2 = _interopRequireDefault(_domSeek);

var _rangeToString = _dereq_('./range-to-string');

var _rangeToString2 = _interopRequireDefault(_rangeToString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SHOW_TEXT = 4;

function fromRange(root, range) {
  if (root === undefined) {
    throw new Error('missing required parameter "root"');
  }
  if (range === undefined) {
    throw new Error('missing required parameter "range"');
  }

  var document = root.ownerDocument;
  var prefix = document.createRange();

  var startNode = range.startContainer;
  var startOffset = range.startOffset;

  prefix.setStart(root, 0);
  prefix.setEnd(startNode, startOffset);

  var start = (0, _rangeToString2.default)(prefix).length;
  var end = start + (0, _rangeToString2.default)(range).length;

  return {
    start: start,
    end: end
  };
}

function toRange(root) {
  var selector = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  if (root === undefined) {
    throw new Error('missing required parameter "root"');
  }

  var document = root.ownerDocument;
  var range = document.createRange();
  var iter = (0, _domNodeIterator2.default)(root, SHOW_TEXT);

  var start = selector.start || 0;
  var end = selector.end || start;
  var count = (0, _domSeek2.default)(iter, start);
  var remainder = start - count;

  if (iter.pointerBeforeReferenceNode) {
    range.setStart(iter.referenceNode, remainder);
  } else {
    range.setStart(iter.nextNode(), remainder);
    iter.previousNode();
  }

  var length = end - start + remainder;
  count = (0, _domSeek2.default)(iter, length);
  remainder = length - count;

  if (iter.pointerBeforeReferenceNode) {
    range.setEnd(iter.referenceNode, remainder);
  } else {
    range.setEnd(iter.nextNode(), remainder);
  }

  return range;
}

},{"./range-to-string":9,"dom-node-iterator":13,"dom-seek":22}],9:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rangeToString;
/* global Node */

/**
 * Return the next node after `node` in a tree order traversal of the document.
 */
function nextNode(node, skipChildren) {
  if (!skipChildren && node.firstChild) {
    return node.firstChild;
  }

  do {
    if (node.nextSibling) {
      return node.nextSibling;
    }
    node = node.parentNode;
  } while (node);

  /* istanbul ignore next */
  return node;
}

function firstNode(range) {
  if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
    var node = range.startContainer.childNodes[range.startOffset];
    return node || nextNode(range.startContainer, true /* skip children */);
  }
  return range.startContainer;
}

function firstNodeAfter(range) {
  if (range.endContainer.nodeType === Node.ELEMENT_NODE) {
    var node = range.endContainer.childNodes[range.endOffset];
    return node || nextNode(range.endContainer, true /* skip children */);
  }
  return nextNode(range.endContainer);
}

function forEachNodeInRange(range, cb) {
  var node = firstNode(range);
  var pastEnd = firstNodeAfter(range);
  while (node !== pastEnd) {
    cb(node);
    node = nextNode(node);
  }
}

/**
 * A ponyfill for Range.toString().
 * Spec: https://dom.spec.whatwg.org/#dom-range-stringifier
 *
 * Works around the buggy Range.toString() implementation in IE and Edge.
 * See https://github.com/tilgovi/dom-anchor-text-position/issues/4
 */
function rangeToString(range) {
  // This is a fairly direct translation of the Range.toString() implementation
  // in Blink.
  var text = '';
  forEachNodeInRange(range, function (node) {
    if (node.nodeType !== Node.TEXT_NODE) {
      return;
    }
    var start = node === range.startContainer ? range.startOffset : 0;
    var end = node === range.endContainer ? range.endOffset : node.textContent.length;
    text += node.textContent.slice(start, end);
  });
  return text;
}

},{}],10:[function(_dereq_,module,exports){
module.exports = _dereq_('./lib');

},{"./lib":11}],11:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromRange = fromRange;
exports.fromTextPosition = fromTextPosition;
exports.toRange = toRange;
exports.toTextPosition = toTextPosition;

var _diffMatchPatch = _dereq_('diff-match-patch');

var _diffMatchPatch2 = _interopRequireDefault(_diffMatchPatch);

var _domAnchorTextPosition = _dereq_('dom-anchor-text-position');

var textPosition = _interopRequireWildcard(_domAnchorTextPosition);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The DiffMatchPatch bitap has a hard 32-character pattern length limit.
var SLICE_LENGTH = 32;
var SLICE_RE = new RegExp('(.|[\r\n]){1,' + String(SLICE_LENGTH) + '}', 'g');
var CONTEXT_LENGTH = SLICE_LENGTH;

function fromRange(root, range) {
  if (root === undefined) {
    throw new Error('missing required parameter "root"');
  }
  if (range === undefined) {
    throw new Error('missing required parameter "range"');
  }

  var position = textPosition.fromRange(root, range);
  return fromTextPosition(root, position);
}

function fromTextPosition(root, selector) {
  if (root === undefined) {
    throw new Error('missing required parameter "root"');
  }
  if (selector === undefined) {
    throw new Error('missing required parameter "selector"');
  }

  var start = selector.start;

  if (start === undefined) {
    throw new Error('selector missing required property "start"');
  }
  if (start < 0) {
    throw new Error('property "start" must be a non-negative integer');
  }

  var end = selector.end;

  if (end === undefined) {
    throw new Error('selector missing required property "end"');
  }
  if (end < 0) {
    throw new Error('property "end" must be a non-negative integer');
  }

  var exact = root.textContent.substr(start, end - start);

  var prefixStart = Math.max(0, start - CONTEXT_LENGTH);
  var prefix = root.textContent.substr(prefixStart, start - prefixStart);

  var suffixEnd = Math.min(root.textContent.length, end + CONTEXT_LENGTH);
  var suffix = root.textContent.substr(end, suffixEnd - end);

  return { exact: exact, prefix: prefix, suffix: suffix };
}

function toRange(root, selector) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var position = toTextPosition(root, selector, options);
  if (position === null) {
    return null;
  } else {
    return textPosition.toRange(root, position);
  }
}

function toTextPosition(root, selector) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (root === undefined) {
    throw new Error('missing required parameter "root"');
  }
  if (selector === undefined) {
    throw new Error('missing required parameter "selector"');
  }

  var exact = selector.exact;

  if (exact === undefined) {
    throw new Error('selector missing required property "exact"');
  }

  var prefix = selector.prefix,
      suffix = selector.suffix;
  var hint = options.hint;

  var dmp = new _diffMatchPatch2.default();

  dmp.Match_Distance = root.textContent.length * 2;

  // Work around a hard limit of the DiffMatchPatch bitap implementation.
  // The search pattern must be no more than SLICE_LENGTH characters.
  var slices = exact.match(SLICE_RE);
  var loc = hint === undefined ? root.textContent.length / 2 | 0 : hint;
  var start = Number.POSITIVE_INFINITY;
  var end = Number.NEGATIVE_INFINITY;
  var result = -1;
  var havePrefix = prefix !== undefined;
  var haveSuffix = suffix !== undefined;
  var foundPrefix = false;

  // If the prefix is known then search for that first.
  if (havePrefix) {
    result = dmp.match_main(root.textContent, prefix, loc);
    if (result > -1) {
      loc = result + prefix.length;
      foundPrefix = true;
    }
  }

  // If we have a suffix, and the prefix wasn't found, then search for it.
  if (haveSuffix && !foundPrefix) {
    result = dmp.match_main(root.textContent, suffix, loc + exact.length);
    if (result > -1) {
      loc = result - exact.length;
    }
  }

  // Search for the first slice.
  var firstSlice = slices.shift();
  result = dmp.match_main(root.textContent, firstSlice, loc);
  if (result > -1) {
    start = result;
    loc = end = start + firstSlice.length;
  } else {
    return null;
  }

  // Create a fold function that will reduce slices to positional extents.
  var foldSlices = function foldSlices(acc, slice) {
    if (!acc) {
      // A search for an earlier slice of the pattern failed to match.
      return null;
    }

    var result = dmp.match_main(root.textContent, slice, acc.loc);
    if (result === -1) {
      return null;
    }

    // The next slice should follow this one closely.
    acc.loc = result + slice.length;

    // Expand the start and end to a quote that includes all the slices.
    acc.start = Math.min(acc.start, result);
    acc.end = Math.max(acc.end, result + slice.length);

    return acc;
  };

  // Use the fold function to establish the full quote extents.
  // Expect the slices to be close to one another.
  // This distance is deliberately generous for now.
  dmp.Match_Distance = 64;
  var acc = slices.reduce(foldSlices, { start: start, end: end, loc: loc });
  if (!acc) {
    return null;
  }

  return { start: acc.start, end: acc.end };
}

},{"diff-match-patch":4,"dom-anchor-text-position":7}],12:[function(_dereq_,module,exports){
module.exports = _dereq_('./lib/implementation')['default'];

},{"./lib/implementation":16}],13:[function(_dereq_,module,exports){
module.exports = _dereq_('./lib')['default'];
module.exports.getPolyfill = _dereq_('./polyfill');
module.exports.implementation = _dereq_('./implementation');
module.exports.shim = _dereq_('./shim');

},{"./implementation":12,"./lib":17,"./polyfill":20,"./shim":21}],14:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports['default'] = createNodeIterator;


function createNodeIterator(root) {
  var whatToShow = arguments.length <= 1 || arguments[1] === undefined ? 0xFFFFFFFF : arguments[1];
  var filter = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var doc = root.nodeType == 9 || root.ownerDocument;
  var iter = doc.createNodeIterator(root, whatToShow, filter, false);
  return new NodeIterator(iter, root, whatToShow, filter);
}

var NodeIterator = function () {
  function NodeIterator(iter, root, whatToShow, filter) {
    _classCallCheck(this, NodeIterator);

    this.root = root;
    this.whatToShow = whatToShow;
    this.filter = filter;
    this.referenceNode = root;
    this.pointerBeforeReferenceNode = true;
    this._iter = iter;
  }

  NodeIterator.prototype.nextNode = function nextNode() {
    var result = this._iter.nextNode();
    this.pointerBeforeReferenceNode = false;
    if (result === null) return null;
    this.referenceNode = result;
    return this.referenceNode;
  };

  NodeIterator.prototype.previousNode = function previousNode() {
    var result = this._iter.previousNode();
    this.pointerBeforeReferenceNode = true;
    if (result === null) return null;
    this.referenceNode = result;
    return this.referenceNode;
  };

  NodeIterator.prototype.toString = function toString() {
    return '[object NodeIterator]';
  };

  return NodeIterator;
}();

},{}],15:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = createNodeIterator;


function createNodeIterator(root) {
  var whatToShow = arguments.length <= 1 || arguments[1] === undefined ? 0xFFFFFFFF : arguments[1];
  var filter = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var doc = root.ownerDocument;
  return doc.createNodeIterator.call(doc, root, whatToShow, filter);
}

},{}],16:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports['default'] = createNodeIterator;


function createNodeIterator(root) {
  var whatToShow = arguments.length <= 1 || arguments[1] === undefined ? 0xFFFFFFFF : arguments[1];
  var filter = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  return new NodeIterator(root, whatToShow, filter);
}

var NodeIterator = function () {
  function NodeIterator(root, whatToShow, filter) {
    _classCallCheck(this, NodeIterator);

    this.root = root;
    this.whatToShow = whatToShow;
    this.filter = filter;
    this.referenceNode = root;
    this.pointerBeforeReferenceNode = true;
    this._filter = function (node) {
      return filter ? filter(node) === 1 : true;
    };
    this._show = function (node) {
      return whatToShow >> node.nodeType - 1 & 1 === 1;
    };
  }

  NodeIterator.prototype.nextNode = function nextNode() {
    var before = this.pointerBeforeReferenceNode;
    this.pointerBeforeReferenceNode = false;

    var node = this.referenceNode;
    if (before && this._show(node) && this._filter(node)) return node;

    do {
      if (node.firstChild) {
        node = node.firstChild;
        continue;
      }

      do {
        if (node === this.root) return null;
        if (node.nextSibling) break;
        node = node.parentNode;
      } while (node);

      node = node.nextSibling;
    } while (!this._show(node) || !this._filter(node));

    this.referenceNode = node;
    this.pointerBeforeReferenceNode = false;
    return node;
  };

  NodeIterator.prototype.previousNode = function previousNode() {
    var before = this.pointerBeforeReferenceNode;
    this.pointerBeforeReferenceNode = true;

    var node = this.referenceNode;
    if (!before && this._show(node) && this._filter(node)) return node;

    do {
      if (node === this.root) return null;

      if (node.previousSibling) {
        node = node.previousSibling;
        while (node.lastChild) {
          node = node.lastChild;
        }continue;
      }

      node = node.parentNode;
    } while (!this._show(node) || !this._filter(node));

    this.referenceNode = node;
    this.pointerBeforeReferenceNode = true;
    return node;
  };

  NodeIterator.prototype.toString = function toString() {
    return '[object NodeIterator]';
  };

  return NodeIterator;
}();

},{}],17:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;

var _polyfill = _dereq_('./polyfill');

var _polyfill2 = _interopRequireDefault(_polyfill);

var _implementation = _dereq_('./implementation');

var _implementation2 = _interopRequireDefault(_implementation);

var _shim = _dereq_('./shim');

var _shim2 = _interopRequireDefault(_shim);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var polyfill = (0, _polyfill2['default'])();
polyfill.implementation = _implementation2['default'];
polyfill.shim = _shim2['default'];

exports['default'] = polyfill;

},{"./implementation":16,"./polyfill":18,"./shim":19}],18:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = getPolyfill;

var _adapter = _dereq_('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

var _builtin = _dereq_('./builtin');

var _builtin2 = _interopRequireDefault(_builtin);

var _implementation = _dereq_('./implementation');

var _implementation2 = _interopRequireDefault(_implementation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function getPolyfill() {
  try {
    var doc = typeof document === 'undefined' ? {} : document;
    var iter = (0, _builtin2['default'])(doc, 0xFFFFFFFF, null, false);
    if (iter.referenceNode === doc) return _builtin2['default'];
    return _adapter2['default'];
  } catch (_) {
    return _implementation2['default'];
  }
} /*global document*/

},{"./adapter":14,"./builtin":15,"./implementation":16}],19:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = shim;

var _builtin = _dereq_('./builtin');

var _builtin2 = _interopRequireDefault(_builtin);

var _polyfill = _dereq_('./polyfill');

var _polyfill2 = _interopRequireDefault(_polyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*global document*/
function shim() {
  var doc = typeof document === 'undefined' ? {} : document;
  var polyfill = (0, _polyfill2['default'])();
  if (polyfill !== _builtin2['default']) doc.createNodeIterator = polyfill;
  return polyfill;
}

},{"./builtin":15,"./polyfill":18}],20:[function(_dereq_,module,exports){
module.exports = _dereq_('./lib/polyfill')['default'];

},{"./lib/polyfill":18}],21:[function(_dereq_,module,exports){
module.exports = _dereq_('./lib/shim')['default'];

},{"./lib/shim":19}],22:[function(_dereq_,module,exports){
module.exports = _dereq_('./lib')['default'];

},{"./lib":23}],23:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = seek;

var _ancestors = _dereq_('ancestors');

var _ancestors2 = _interopRequireDefault(_ancestors);

var _indexOf = _dereq_('index-of');

var _indexOf2 = _interopRequireDefault(_indexOf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var E_SHOW = 'Argument 1 of seek must use filter NodeFilter.SHOW_TEXT.';
var E_WHERE = 'Argument 2 of seek must be a number or a Text Node.';

var SHOW_TEXT = 4;
var TEXT_NODE = 3;

function seek(iter, where) {
  if (iter.whatToShow !== SHOW_TEXT) {
    throw new Error(E_SHOW);
  }

  var count = 0;
  var node = iter.referenceNode;
  var predicates = null;

  if (isNumber(where)) {
    predicates = {
      forward: function forward() {
        return count < where;
      },
      backward: function backward() {
        return count > where;
      }
    };
  } else if (isText(where)) {
    var forward = before(node, where) ? function () {
      return false;
    } : function () {
      return node !== where;
    };
    var backward = function backward() {
      return node != where || !iter.pointerBeforeReferenceNode;
    };
    predicates = { forward: forward, backward: backward };
  } else {
    throw new Error(E_WHERE);
  }

  while (predicates.forward() && (node = iter.nextNode()) !== null) {
    count += node.nodeValue.length;
  }

  while (predicates.backward() && (node = iter.previousNode()) !== null) {
    count -= node.nodeValue.length;
  }

  return count;
}

function isNumber(n) {
  return !isNaN(parseInt(n)) && isFinite(n);
}

function isText(node) {
  return node.nodeType === TEXT_NODE;
}

function before(ref, node) {
  if (ref === node) return false;

  var common = null;
  var left = [ref].concat((0, _ancestors2['default'])(ref)).reverse();
  var right = [node].concat((0, _ancestors2['default'])(node)).reverse();

  while (left[0] === right[0]) {
    common = left.shift();
    right.shift();
  }

  left = left[0];
  right = right[0];

  var l = (0, _indexOf2['default'])(common.childNodes, left);
  var r = (0, _indexOf2['default'])(common.childNodes, right);

  return l > r;
}

},{"ancestors":1,"index-of":26}],24:[function(_dereq_,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var undefined;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],25:[function(_dereq_,module,exports){
(function (global){
; var __browserify_shim_require__=_dereq_;(function browserifyShim(module, exports, _dereq_, define, browserify_shim__define__module__export__) {
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

; browserify_shim__define__module__export__(typeof Hammer != "undefined" ? Hammer : window.Hammer);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,window)

},{}],26:[function(_dereq_,module,exports){
/*!
 * index-of <https://github.com/jonschlinkert/index-of>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function indexOf(arr, ele, start) {
  start = start || 0;
  var idx = -1;

  if (arr == null) return idx;
  var len = arr.length;
  var i = start < 0
    ? (len + start)
    : start;

  if (i >= arr.length) {
    return -1;
  }

  while (i < len) {
    if (arr[i] === ele) {
      return i;
    }
    i++;
  }

  return -1;
};

},{}],27:[function(_dereq_,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

}).call(this,window)

},{}],28:[function(_dereq_,module,exports){
(function (process){
// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);



}).call(this,_dereq_('_process'))

},{"_process":29}],29:[function(_dereq_,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],30:[function(_dereq_,module,exports){
(function (global){
var now = _dereq_('performance-now')
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf
  object.cancelAnimationFrame = caf
}

}).call(this,window)

},{"performance-now":28}],31:[function(_dereq_,module,exports){
var COMPLETE = 'complete',
    CANCELED = 'canceled';

function raf(task){
    if('requestAnimationFrame' in window){
        return window.requestAnimationFrame(task);
    }

    setTimeout(task, 16);
}

function setElementScroll(element, x, y){
    if(element.self === element){
        element.scrollTo(x, y);
    }else{
        element.scrollLeft = x;
        element.scrollTop = y;
    }
}

function getTargetScrollLocation(target, parent, align){
    var targetPosition = target.getBoundingClientRect(),
        parentPosition,
        x,
        y,
        differenceX,
        differenceY,
        targetWidth,
        targetHeight,
        leftAlign = align && align.left != null ? align.left : 0.5,
        topAlign = align && align.top != null ? align.top : 0.5,
        leftOffset = align && align.leftOffset != null ? align.leftOffset : 0,
        topOffset = align && align.topOffset != null ? align.topOffset : 0,
        leftScalar = leftAlign,
        topScalar = topAlign;

    if(parent.self === parent){
        targetWidth = Math.min(targetPosition.width, parent.innerWidth);
        targetHeight = Math.min(targetPosition.height, parent.innerHeight);
        x = targetPosition.left + parent.pageXOffset - parent.innerWidth * leftScalar + targetWidth * leftScalar;
        y = targetPosition.top + parent.pageYOffset - parent.innerHeight * topScalar + targetHeight * topScalar;
        x -= leftOffset;
        y -= topOffset;
        differenceX = x - parent.pageXOffset;
        differenceY = y - parent.pageYOffset;
    }else{
        targetWidth = targetPosition.width;
        targetHeight = targetPosition.height;
        parentPosition = parent.getBoundingClientRect();
        var offsetLeft = targetPosition.left - (parentPosition.left - parent.scrollLeft);
        var offsetTop = targetPosition.top - (parentPosition.top - parent.scrollTop);
        x = offsetLeft + (targetWidth * leftScalar) - parent.clientWidth * leftScalar;
        y = offsetTop + (targetHeight * topScalar) - parent.clientHeight * topScalar;
        x = Math.max(Math.min(x, parent.scrollWidth - parent.clientWidth), 0);
        y = Math.max(Math.min(y, parent.scrollHeight - parent.clientHeight), 0);
        x -= leftOffset;
        y -= topOffset;
        differenceX = x - parent.scrollLeft;
        differenceY = y - parent.scrollTop;
    }

    return {
        x: x,
        y: y,
        differenceX: differenceX,
        differenceY: differenceY
    };
}

function animate(parent){
    var scrollSettings = parent._scrollSettings;
    if(!scrollSettings){
        return;
    }

    var location = getTargetScrollLocation(scrollSettings.target, parent, scrollSettings.align),
        time = Date.now() - scrollSettings.startTime,
        timeValue = Math.min(1 / scrollSettings.time * time, 1);

    if(
        time > scrollSettings.time &&
        scrollSettings.endIterations > 3
    ){
        setElementScroll(parent, location.x, location.y);
        parent._scrollSettings = null;
        return scrollSettings.end(COMPLETE);
    }

    scrollSettings.endIterations++;

    var easeValue = 1 - scrollSettings.ease(timeValue);

    setElementScroll(parent,
        location.x - location.differenceX * easeValue,
        location.y - location.differenceY * easeValue
    );

    // At the end of animation, loop synchronously
    // to try and hit the taget location.
    if(time >= scrollSettings.time){
        return animate(parent);
    }

    raf(animate.bind(null, parent));
}
function transitionScrollTo(target, parent, settings, callback){
    var idle = !parent._scrollSettings,
        lastSettings = parent._scrollSettings,
        now = Date.now(),
        endHandler;

    if(lastSettings){
        lastSettings.end(CANCELED);
    }

    function end(endType){
        parent._scrollSettings = null;
        if(parent.parentElement && parent.parentElement._scrollSettings){
            parent.parentElement._scrollSettings.end(endType);
        }
        callback(endType);
        parent.removeEventListener('touchstart', endHandler, { passive: true });
    }

    parent._scrollSettings = {
        startTime: lastSettings ? lastSettings.startTime : Date.now(),
        endIterations: 0,
        target: target,
        time: settings.time + (lastSettings ? now - lastSettings.startTime : 0),
        ease: settings.ease,
        align: settings.align,
        end: end
    };

    endHandler = end.bind(null, CANCELED);
    parent.addEventListener('touchstart', endHandler, { passive: true });

    if(idle){
        animate(parent);
    }
}

function defaultIsScrollable(element){
    return (
        'pageXOffset' in element ||
        (
            element.scrollHeight !== element.clientHeight ||
            element.scrollWidth !== element.clientWidth
        ) &&
        getComputedStyle(element).overflow !== 'hidden'
    );
}

function defaultValidTarget(){
    return true;
}

module.exports = function(target, settings, callback){
    if(!target){
        return;
    }

    if(typeof settings === 'function'){
        callback = settings;
        settings = null;
    }

    if(!settings){
        settings = {};
    }

    settings.time = isNaN(settings.time) ? 1000 : settings.time;
    settings.ease = settings.ease || function(v){return 1 - Math.pow(1 - v, v / 2);};

    var parent = target.parentElement,
        parents = 0;

    function done(endType){
        parents--;
        if(!parents){
            callback && callback(endType);
        }
    }

    var validTarget = settings.validTarget || defaultValidTarget;
    var isScrollable = settings.isScrollable;

    while(parent){
        if(validTarget(parent, parents) && (isScrollable ? isScrollable(parent, defaultIsScrollable) : defaultIsScrollable(parent))){
            parents++;
            transitionScrollTo(target, parent, settings, done);
        }

        parent = parent.parentElement;

        if(!parent){
            return;
        }

        if(parent.tagName === 'BODY'){
            parent = parent.ownerDocument;
            parent = parent.defaultView || parent.ownerWindow;
        }
    }
};

},{}],32:[function(_dereq_,module,exports){
module.exports = _dereq_("./zen-observable.js").Observable;

},{"./zen-observable.js":33}],33:[function(_dereq_,module,exports){
'use strict'; (function(fn, name) { if (typeof exports !== 'undefined') fn(exports, module); else if (typeof self !== 'undefined') fn(name === '*' ? self : (name ? self[name] = {} : {})); })(function(exports, module) { // === Symbol Support ===

function hasSymbol(name) {

    return typeof Symbol === "function" && Boolean(Symbol[name]);
}

function getSymbol(name) {

    return hasSymbol(name) ? Symbol[name] : "@@" + name;
}

// === Abstract Operations ===

function getMethod(obj, key) {

    var value = obj[key];

    if (value == null)
        return undefined;

    if (typeof value !== "function")
        throw new TypeError(value + " is not a function");

    return value;
}

function getSpecies(ctor) {

    var symbol = getSymbol("species");
    return symbol ? ctor[symbol] : ctor;
}

function addMethods(target, methods) {

    Object.keys(methods).forEach(function(k) {

        var desc = Object.getOwnPropertyDescriptor(methods, k);
        desc.enumerable = false;
        Object.defineProperty(target, k, desc);
    });
}

function cleanupSubscription(subscription) {

    // Assert:  observer._observer is undefined

    var cleanup = subscription._cleanup;

    if (!cleanup)
        return;

    // Drop the reference to the cleanup function so that we won't call it
    // more than once
    subscription._cleanup = undefined;

    // Call the cleanup function
    cleanup();
}

function subscriptionClosed(subscription) {

    return subscription._observer === undefined;
}

function closeSubscription(subscription) {

    if (subscriptionClosed(subscription))
        return;

    subscription._observer = undefined;
    cleanupSubscription(subscription);
}

function cleanupFromSubscription(subscription) {
    return function(_) { subscription.unsubscribe() };
}

function Subscription(observer, subscriber) {

    // Assert: subscriber is callable

    // The observer must be an object
    if (Object(observer) !== observer)
        throw new TypeError("Observer must be an object");

    this._cleanup = undefined;
    this._observer = observer;

    var start = getMethod(observer, "start");

    if (start)
        start.call(observer, this);

    if (subscriptionClosed(this))
        return;

    observer = new SubscriptionObserver(this);

    try {

        // Call the subscriber function
        var cleanup$0 = subscriber.call(undefined, observer);

        // The return value must be undefined, null, a subscription object, or a function
        if (cleanup$0 != null) {

            if (typeof cleanup$0.unsubscribe === "function")
                cleanup$0 = cleanupFromSubscription(cleanup$0);
            else if (typeof cleanup$0 !== "function")
                throw new TypeError(cleanup$0 + " is not a function");

            this._cleanup = cleanup$0;
        }

    } catch (e) {

        // If an error occurs during startup, then attempt to send the error
        // to the observer
        observer.error(e);
        return;
    }

    // If the stream is already finished, then perform cleanup
    if (subscriptionClosed(this))
        cleanupSubscription(this);
}

addMethods(Subscription.prototype = {}, {
    get closed() { return subscriptionClosed(this) },
    unsubscribe: function() { closeSubscription(this) },
});

function SubscriptionObserver(subscription) {
    this._subscription = subscription;
}

addMethods(SubscriptionObserver.prototype = {}, {

    get closed() { return subscriptionClosed(this._subscription) },

    next: function(value) {

        var subscription = this._subscription;

        // If the stream if closed, then return undefined
        if (subscriptionClosed(subscription))
            return undefined;

        var observer = subscription._observer;

        try {

            var m$0 = getMethod(observer, "next");

            // If the observer doesn't support "next", then return undefined
            if (!m$0)
                return undefined;

            // Send the next value to the sink
            return m$0.call(observer, value);

        } catch (e) {

            // If the observer throws, then close the stream and rethrow the error
            try { closeSubscription(subscription) }
            finally { throw e }
        }
    },

    error: function(value) {

        var subscription = this._subscription;

        // If the stream is closed, throw the error to the caller
        if (subscriptionClosed(subscription))
            throw value;

        var observer = subscription._observer;
        subscription._observer = undefined;

        try {

            var m$1 = getMethod(observer, "error");

            // If the sink does not support "error", then throw the error to the caller
            if (!m$1)
                throw value;

            value = m$1.call(observer, value);

        } catch (e) {

            try { cleanupSubscription(subscription) }
            finally { throw e }
        }

        cleanupSubscription(subscription);
        return value;
    },

    complete: function(value) {

        var subscription = this._subscription;

        // If the stream is closed, then return undefined
        if (subscriptionClosed(subscription))
            return undefined;

        var observer = subscription._observer;
        subscription._observer = undefined;

        try {

            var m$2 = getMethod(observer, "complete");

            // If the sink does not support "complete", then return undefined
            value = m$2 ? m$2.call(observer, value) : undefined;

        } catch (e) {

            try { cleanupSubscription(subscription) }
            finally { throw e }
        }

        cleanupSubscription(subscription);
        return value;
    },

});

function Observable(subscriber) {

    // The stream subscriber must be a function
    if (typeof subscriber !== "function")
        throw new TypeError("Observable initializer must be a function");

    this._subscriber = subscriber;
}

addMethods(Observable.prototype, {

    subscribe: function(observer) { for (var args = [], __$0 = 1; __$0 < arguments.length; ++__$0) args.push(arguments[__$0]); 

        if (typeof observer === 'function') {

            observer = {
                next: observer,
                error: args[0],
                complete: args[1],
            };
        }

        return new Subscription(observer, this._subscriber);
    },

    forEach: function(fn) { var __this = this; 

        return new Promise(function(resolve, reject) {

            if (typeof fn !== "function")
                return Promise.reject(new TypeError(fn + " is not a function"));

            __this.subscribe({

                _subscription: null,

                start: function(subscription) {

                    if (Object(subscription) !== subscription)
                        throw new TypeError(subscription + " is not an object");

                    this._subscription = subscription;
                },

                next: function(value) {

                    var subscription = this._subscription;

                    if (subscription.closed)
                        return;

                    try {

                        return fn(value);

                    } catch (err) {

                        reject(err);
                        subscription.unsubscribe();
                    }
                },

                error: reject,
                complete: resolve,
            });

        });
    },

    map: function(fn) { var __this = this; 

        if (typeof fn !== "function")
            throw new TypeError(fn + " is not a function");

        var C = getSpecies(this.constructor);

        return new C(function(observer) { return __this.subscribe({

            next: function(value) {

                if (observer.closed)
                    return;

                try { value = fn(value) }
                catch (e) { return observer.error(e) }

                return observer.next(value);
            },

            error: function(e) { return observer.error(e) },
            complete: function(x) { return observer.complete(x) },
        }); });
    },

    filter: function(fn) { var __this = this; 

        if (typeof fn !== "function")
            throw new TypeError(fn + " is not a function");

        var C = getSpecies(this.constructor);

        return new C(function(observer) { return __this.subscribe({

            next: function(value) {

                if (observer.closed)
                    return;

                try { if (!fn(value)) return undefined }
                catch (e) { return observer.error(e) }

                return observer.next(value);
            },

            error: function(e) { return observer.error(e) },
            complete: function() { return observer.complete() },
        }); });
    },

    reduce: function(fn) { var __this = this; 

        if (typeof fn !== "function")
            throw new TypeError(fn + " is not a function");

        var C = getSpecies(this.constructor),
            hasSeed = arguments.length > 1,
            hasValue = false,
            seed = arguments[1],
            acc = seed;

        return new C(function(observer) { return __this.subscribe({

            next: function(value) {

                if (observer.closed)
                    return;

                var first = !hasValue;
                hasValue = true;

                if (!first || hasSeed) {

                    try { acc = fn(acc, value) }
                    catch (e) { return observer.error(e) }

                } else {

                    acc = value;
                }
            },

            error: function(e) { return observer.error(e) },

            complete: function() {

                if (!hasValue && !hasSeed) {
                    observer.error(new TypeError("Cannot reduce an empty sequence"));
                    return;
                }

                observer.next(acc);
                observer.complete();
            },

        }); });
    },

    flatMap: function(fn) { var __this = this; 

        if (typeof fn !== "function")
            throw new TypeError(fn + " is not a function");

        var C = getSpecies(this.constructor);

        return new C(function(observer) {

            var completed = false,
                subscriptions = [];

            // Subscribe to the outer Observable
            var outer = __this.subscribe({

                next: function(value) {

                    if (fn) {

                        try {

                            value = fn(value);

                        } catch (x) {

                            observer.error(x);
                            return;
                        }
                    }

                    // Subscribe to the inner Observable
                    Observable.from(value).subscribe({

                        _subscription: null,

                        start: function(s) { subscriptions.push(this._subscription = s) },
                        next: function(value) { observer.next(value) },
                        error: function(e) { observer.error(e) },

                        complete: function() {

                            var i = subscriptions.indexOf(this._subscription);

                            if (i >= 0)
                                subscriptions.splice(i, 1);

                            closeIfDone();
                        }
                    });
                },

                error: function(e) {

                    return observer.error(e);
                },

                complete: function() {

                    completed = true;
                    closeIfDone();
                }
            });

            function closeIfDone() {

                if (completed && subscriptions.length === 0)
                    observer.complete();
            }

            return function(_) {

                subscriptions.forEach(function(s) { return s.unsubscribe(); });
                outer.unsubscribe();
            };
        });
    }

});

Object.defineProperty(Observable.prototype, getSymbol("observable"), {
    value: function() { return this },
    writable: true,
    configurable: true,
});

addMethods(Observable, {

    from: function(x) {

        var C = typeof this === "function" ? this : Observable;

        if (x == null)
            throw new TypeError(x + " is not an object");

        var method = getMethod(x, getSymbol("observable"));

        if (method) {

            var observable$0 = method.call(x);

            if (Object(observable$0) !== observable$0)
                throw new TypeError(observable$0 + " is not an object");

            if (observable$0.constructor === C)
                return observable$0;

            return new C(function(observer) { return observable$0.subscribe(observer); });
        }

        if (hasSymbol("iterator") && (method = getMethod(x, getSymbol("iterator")))) {

            return new C(function(observer) {

                for (var __$0 = (method.call(x))[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;) { var item$0 = __$1.value; 

                    observer.next(item$0);

                    if (observer.closed)
                        return;
                }

                observer.complete();
            });
        }

        if (Array.isArray(x)) {

            return new C(function(observer) {

                for (var i$0 = 0; i$0 < x.length; ++i$0) {

                    observer.next(x[i$0]);

                    if (observer.closed)
                        return;
                }

                observer.complete();
            });
        }

        throw new TypeError(x + " is not observable");
    },

    of: function() { for (var items = [], __$0 = 0; __$0 < arguments.length; ++__$0) items.push(arguments[__$0]); 

        var C = typeof this === "function" ? this : Observable;

        return new C(function(observer) {

            for (var i$1 = 0; i$1 < items.length; ++i$1) {

                observer.next(items[i$1]);

                if (observer.closed)
                    return;
            }

            observer.complete();
        });
    },

});

Object.defineProperty(Observable, getSymbol("species"), {
    get: function() { return this },
    configurable: true,
});

exports.Observable = Observable;


}, "*");
},{}],34:[function(_dereq_,module,exports){
module.exports = "<hypothesis-adder-toolbar class=\"annotator-adder js-adder\">\n  <div  class=\"js-group-txt\"></div>\n  <hypothesis-adder-actions class=\"annotator-adder-actions\">\n    <button class=\"annotator-adder-actions__button h-icon-highlight js-highlight-btn\">\n      <span class=\"annotator-adder-actions__label\" data-action=\"highlight\">Highlight</span>\n    </button>\n     <button class=\"annotator-adder-actions__button h-icon-annotate js-annotate-btn\">\n      <span class=\"annotator-adder-actions__label\" data-action=\"comment\">Annotate</span>\n    </button>\n     <button class=\"annotator-adder-actions__button h-icon-download js-include-btn\">\n      <span class=\"annotator-adder-actions__label\" data-action=\"include\">Include</span>\n    </button>\n     <button class=\"annotator-adder-actions__button h-icon-upload js-exclude-btn\">\n      <span class=\"annotator-adder-actions__label\" data-action=\"exclude\">Exclude</span>\n    </button>\n    <button class=\"annotator-adder-actions__button h-icon-group js-group-btn\">\n      <span class=\"annotator-adder-actions__label\" data-action=\"group\">Change Taskspace</span>\n    </button>\n    <button class=\"annotator-adder-actions__button h-icon-account js-login-btn\">\n      <span class=\"annotator-adder-actions__label\" data-action=\"login\">Login</span>\n    </button>\n  </hypothesis-adder-actions>\n</hypothesis-adder-toolbar>\n";

},{}],35:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var classnames = _dereq_('classnames');

var template = _dereq_('./adder.html');

var ANNOTATE_BTN_CLASS = 'js-annotate-btn';
var ANNOTATE_BTN_SELECTOR = '.js-annotate-btn';

var HIGHLIGHT_BTN_CLASS = 'js-highlight-btn';
var HIGHLIGHT_BTN_SELECTOR = '.js-highlight-btn';

var INCLUDE_BTN_CLASS = 'js-include-btn';
var INCLUDE_BTN_SELECTOR = '.js-include-btn';

var EXCLUDE_BTN_CLASS = 'js-exclude-btn';
var EXCLUDE_BTN_SELECTOR = '.js-exclude-btn';

var GROUP_BTN_CLASS = 'js-group-btn';
var GROUP_BTN_SELECTOR = '.js-group-btn';

var GROUP_TXT = 'Select Taskspace';
var GROUP_TXT_SELECTOR = '.js-group-txt';

var LOGIN_BTN_CLASS = 'js-login-btn';
var LOGIN_BTN_SELECTOR = '.js-login-btn';

var BTN_LABEL_SELECTOR = '.annotator-adder-actions__label';

/**
 * @typedef Target
 * @prop {number} left - Offset from left edge of viewport.
 * @prop {number} top - Offset from top edge of viewport.
 * @prop {number} arrowDirection - Direction of the adder's arrow.
 */

/**
 * Show the adder above the selection with an arrow pointing down at the
 * selected text.
 */
var ARROW_POINTING_DOWN = 1;

/**
 * Show the adder above the selection with an arrow pointing up at the
 * selected text.
 */
var ARROW_POINTING_UP = 2;

function toPx(pixels) {
  return pixels.toString() + 'px';
}

var ARROW_HEIGHT = 10;

// The preferred gap between the end of the text selection and the adder's
// arrow position.
var ARROW_H_MARGIN = 20;

function attachShadow(element) {
  if (element.attachShadow) {
    // Shadow DOM v1 (Chrome v53, Safari 10)
    return element.attachShadow({ mode: 'open' });
  } else if (element.createShadowRoot) {
    // Shadow DOM v0 (Chrome ~35-52)
    return element.createShadowRoot();
  } else {
    return null;
  }
}

/**
 * Return the closest ancestor of `el` which has been positioned.
 *
 * If no ancestor has been positioned, returns the root element.
 *
 * @param {Element} el
 * @return {Element}
 */
function nearestPositionedAncestor(el) {
  var parentEl = el.parentElement;
  while (parentEl.parentElement) {
    if (getComputedStyle(parentEl).position !== 'static') {
      break;
    }
    parentEl = parentEl.parentElement;
  }
  return parentEl;
}

/**
 * Create the DOM structure for the Adder.
 *
 * Returns the root DOM node for the adder, which may be in a shadow tree.
 */
function createAdderDOM(container) {
  var element;

  // If the browser supports Shadow DOM, use it to isolate the adder
  // from the page's CSS
  //
  // See https://developers.google.com/web/fundamentals/primers/shadowdom/
  var shadowRoot = attachShadow(container);
  if (shadowRoot) {
    shadowRoot.innerHTML = template;
    element = shadowRoot.querySelector('.js-adder');

    // Load stylesheets required by adder into shadow DOM element
    var adderStyles = Array.from(document.styleSheets).map(function (sheet) {
      return sheet.href;
    }).filter(function (url) {
      return (url || '').match(/(icomoon|annotator|select|bootstrap)\.css/);
    });

    // Stylesheet <link> elements are inert inside shadow roots [1]. Until
    // Shadow DOM implementations support external stylesheets [2], grab the
    // relevant CSS files from the current page and `@import` them.
    //
    // [1] http://stackoverflow.com/questions/27746590
    // [2] https://github.com/w3c/webcomponents/issues/530
    //
    // This will unfortunately break if the page blocks inline stylesheets via
    // CSP, but that appears to be rare and if this happens, the user will still
    // get a usable adder, albeit one that uses browser default styles for the
    // toolbar.
    var styleEl = document.createElement('style');
    styleEl.textContent = adderStyles.map(function (url) {
      return '@import "' + url + '";';
    }).join('\n');
    shadowRoot.appendChild(styleEl);
  } else {
    container.innerHTML = template;
    element = container.querySelector('.js-adder');
  }
  return element;
}

/**
 * Annotation 'adder' toolbar which appears next to the selection
 * and provides controls for the user to create new annotations.
 */

var Adder = function () {
  /**
   * Construct the toolbar and populate the UI.
   *
   * The adder is initially hidden.
   *
   * @param {Element} container - The DOM element into which the adder will be created
   * @param {Object} options - Options object specifying `onAnnotate` and `onHighlight`
   *        event handlers.
   */
  function Adder(container, options) {
    var _this = this;

    _classCallCheck(this, Adder);

    this.session = null;
    this.group = null;
    this.element = createAdderDOM(container);
    this._container = container;
    this.clipperMode = false;

    // Set initial style
    Object.assign(container.style, {
      display: 'block',

      // take position out of layout flow initially
      position: 'absolute',
      top: 0,

      // Assign a high Z-index so that the adder shows above any content on the
      // page
      zIndex: 100000
    });

    // The adder is hidden using the `visibility` property rather than `display`
    // so that we can compute its size in order to position it before display.
    this.element.style.visibility = 'hidden';

    this._view = this.element.ownerDocument.defaultView;
    this._enterTimeout = null;

    var handleCommand = function handleCommand(event) {
      event.preventDefault();
      event.stopPropagation();

      var action = event.target.getAttribute("data-action");

      var isAnnotateCommand = event.target.classList.contains(ANNOTATE_BTN_CLASS) || action === "comment";
      var isHighlightCommand = event.target.classList.contains(HIGHLIGHT_BTN_CLASS) || action === "highlight";
      var isIncludeCommand = event.target.classList.contains(INCLUDE_BTN_CLASS) || action === "include";
      var isExlcudeCommand = event.target.classList.contains(EXCLUDE_BTN_CLASS) || action === "exclude";
      var isGroupCommand = event.target.classList.contains(GROUP_BTN_CLASS) || action === "group";
      var isLoginCommand = event.target.classList.contains(LOGIN_BTN_CLASS) || action === "login";

      if (isAnnotateCommand) {
        options.onAnnotate();
        _this.hide();
      } else if (isHighlightCommand) {
        options.onHighlight();
        _this.hide();
      } else if (isIncludeCommand) {
        options.onInclude();
        _this.hide();
      } else if (isExlcudeCommand) {
        options.onExclude();
        _this.hide();
      } else if (isGroupCommand) {
        options.onGroupChange();
      } else if (isLoginCommand) {
        options.onLogin();
      }
    };

    this.element.querySelector(ANNOTATE_BTN_SELECTOR).addEventListener('click', handleCommand);
    this.element.querySelector(HIGHLIGHT_BTN_SELECTOR).addEventListener('click', handleCommand);
    this.element.querySelector(INCLUDE_BTN_SELECTOR).addEventListener('click', handleCommand);
    this.element.querySelector(EXCLUDE_BTN_SELECTOR).addEventListener('click', handleCommand);
    this.element.querySelector(GROUP_BTN_SELECTOR).addEventListener('click', handleCommand);
    this.element.querySelector(LOGIN_BTN_SELECTOR).addEventListener('click', handleCommand);
    this.element.querySelector(BTN_LABEL_SELECTOR).addEventListener('click', handleCommand);

    this._width = function () {
      return _this.element.getBoundingClientRect().width;
    };
    this._height = function () {
      return _this.element.getBoundingClientRect().height;
    };
  }

  _createClass(Adder, [{
    key: 'enableClipperCommands',
    value: function enableClipperCommands() {
      this.clipperMode = true;
      var session = this.getSession();
      var group = this.getGroup();
      if (session && session.userid) {
        this.element.querySelector(INCLUDE_BTN_SELECTOR).style.display = '';
        this.element.querySelector(EXCLUDE_BTN_SELECTOR).style.display = '';
        this.showButtons();
      }
    }
  }, {
    key: 'disableClipperCommands',
    value: function disableClipperCommands() {
      this.element.querySelector(INCLUDE_BTN_SELECTOR).style.display = 'none';
      this.element.querySelector(EXCLUDE_BTN_SELECTOR).style.display = 'none';
      this.clipperMode = false;
      this.showButtons();
    }

    /** Hide the adder */

  }, {
    key: 'hide',
    value: function hide() {
      clearTimeout(this._enterTimeout);
      this.element.className = classnames({ 'annotator-adder': true });
      this.element.style.visibility = 'hidden';
    }

    /**
     * Return the best position to show the adder in order to target the
     * selected text in `targetRect`.
     *
     * @param {Rect} targetRect - The rect of text to target, in viewport
     *        coordinates.
     * @param {boolean} isSelectionBackwards - True if the selection was made
     *        backwards, such that the focus point is mosty likely at the top-left
     *        edge of `targetRect`.
     * @return {Target}
     */

  }, {
    key: 'target',
    value: function target(targetRect, isSelectionBackwards) {
      // Set the initial arrow direction based on whether the selection was made
      // forwards/upwards or downwards/backwards.
      var arrowDirection;
      if (isSelectionBackwards) {
        arrowDirection = ARROW_POINTING_DOWN;
      } else {
        arrowDirection = ARROW_POINTING_UP;
      }
      var top;
      var left;

      // Position the adder such that the arrow it is above or below the selection
      // and close to the end.
      var hMargin = Math.min(ARROW_H_MARGIN, targetRect.width);
      if (isSelectionBackwards) {
        left = targetRect.left - this._width() / 2 + hMargin;
      } else {
        left = targetRect.left + targetRect.width - this._width() / 2 - hMargin;
      }

      // Flip arrow direction if adder would appear above the top or below the
      // bottom of the viewport.
      if (targetRect.top - this._height() < 0 && arrowDirection === ARROW_POINTING_DOWN) {
        arrowDirection = ARROW_POINTING_UP;
      } else if (targetRect.top + this._height() > this._view.innerHeight) {
        arrowDirection = ARROW_POINTING_DOWN;
      }

      if (arrowDirection === ARROW_POINTING_UP) {
        top = targetRect.top + targetRect.height + ARROW_HEIGHT;
      } else {
        top = targetRect.top - this._height() - ARROW_HEIGHT;
      }

      // Constrain the adder to the viewport.
      left = Math.max(left, 0);
      left = Math.min(left, this._view.innerWidth - this._width());

      top = Math.max(top, 0);
      top = Math.min(top, this._view.innerHeight - this._height());

      return { top: top, left: left, arrowDirection: arrowDirection };
    }

    /**
     * Show the adder at the given position and with the arrow pointing in
     * `arrowDirection`.
     *
     * @param {number} left - Horizontal offset from left edge of viewport.
     * @param {number} top - Vertical offset from top edge of viewport.
     */

  }, {
    key: 'showAt',
    value: function showAt(left, top, arrowDirection) {
      var _this2 = this;

      var group = this.getGroup();

      var isActive = this.element.classList.contains("is-active");
      this.element.className = classnames({
        'annotator-adder': true,
        'is-active': isActive,
        'annotator-adder--arrow-down': arrowDirection === ARROW_POINTING_DOWN,
        'annotator-adder--arrow-up': arrowDirection === ARROW_POINTING_UP
      });

      this.showButtons();

      // Translate the (left, top) viewport coordinates into positions relative to
      // the adder's nearest positioned ancestor (NPA).
      //
      // Typically the adder is a child of the `<body>` and the NPA is the root
      // `<html>` element. However page styling may make the `<body>` positioned.
      // See https://github.com/hypothesis/client/issues/487.
      var positionedAncestor = nearestPositionedAncestor(this._container);
      var parentRect = positionedAncestor.getBoundingClientRect();

      if (arrowDirection === ARROW_POINTING_UP) {
        top -= ARROW_HEIGHT;
      } else if (arrowDirection === ARROW_POINTING_DOWN) {
        top += ARROW_HEIGHT;
      }

      Object.assign(this._container.style, {
        top: toPx(top - parentRect.top),
        left: toPx(left - parentRect.left)
      });
      this.element.style.visibility = 'visible';
      if (!isActive) {
        clearTimeout(this._enterTimeout);
        this._enterTimeout = setTimeout(function () {
          _this2.element.className += ' is-active';
        }, 1);
      }
    }
  }, {
    key: 'showButtons',
    value: function showButtons() {
      // Some sites make big assumptions about interactive
      // elements on the page. Some want to hide interactive elements
      // after use. So we need to make sure the button stays displayed
      // the way it was originally displayed - without the inline styles
      // See: https://github.com/hypothesis/client/issues/137
      var session = this.getSession();
      var group = this.getGroup();

      if (session && session.userid) {
        if (!this.clipperMode) {
          this.element.querySelector(ANNOTATE_BTN_SELECTOR).style.display = '';
          this.element.querySelector(HIGHLIGHT_BTN_SELECTOR).style.display = '';
        } else {
          this.element.querySelector(ANNOTATE_BTN_SELECTOR).style.display = 'none';
          this.element.querySelector(HIGHLIGHT_BTN_SELECTOR).style.display = 'none';
        }
        this.element.querySelector(GROUP_BTN_SELECTOR).style.display = '';
        this.element.querySelector(GROUP_TXT_SELECTOR).style.display = '';
        this.element.querySelector(LOGIN_BTN_SELECTOR).style.display = 'none';
      } else {
        this.element.querySelector(ANNOTATE_BTN_SELECTOR).style.display = 'none';
        this.element.querySelector(HIGHLIGHT_BTN_SELECTOR).style.display = 'none';
        this.element.querySelector(GROUP_BTN_SELECTOR).style.display = 'none';
        this.element.querySelector(GROUP_TXT_SELECTOR).style.display = 'none';
        this.element.querySelector(LOGIN_BTN_SELECTOR).style.display = '';
      }

      if (group && group.permissions && group.permissions.readOnly) {
        this.element.querySelector(ANNOTATE_BTN_SELECTOR).style.display = 'none';
        this.element.querySelector(HIGHLIGHT_BTN_SELECTOR).style.display = 'none';
      }

      if (group) {
        this.element.querySelector(GROUP_TXT_SELECTOR).innerHTML = group.name;
        this.element.querySelector(GROUP_TXT_SELECTOR).style.color = '#000';
        this.element.querySelector(GROUP_TXT_SELECTOR).style['border-color'] = '#aaa';
      } else {
        this.element.querySelector(GROUP_TXT_SELECTOR).innerHTML = GROUP_TXT;
        this.element.querySelector(GROUP_TXT_SELECTOR).style.color = '#a94442';
        this.element.querySelector(GROUP_TXT_SELECTOR).style['border-color'] = '#a94442';
      }
    }
  }, {
    key: 'setSession',
    value: function setSession(session) {
      this.session = session;
      this.showButtons();
    }
  }, {
    key: 'getSession',
    value: function getSession() {
      return this.session;
    }
  }, {
    key: 'setGroup',
    value: function setGroup(group) {
      this.group = group;
      this.showButtons();
    }
  }, {
    key: 'getGroup',
    value: function getGroup() {
      return this.group;
    }
  }, {
    key: 'getTextNodes',
    value: function getTextNodes(elem) {
      var textNodes = [];
      if (elem) {
        for (var nodes = elem.childNodes, i = nodes.length; i--;) {
          var node = nodes[i],
              nodeType = node.nodeType;
          if (nodeType == 3) {
            textNodes.push(node);
          } else if (nodeType == 1 || nodeType == 9 || nodeType == 11) {
            textNodes = textNodes.concat(this.getTextNodes(node));
          }
        }
      }
      return textNodes;
    }
  }, {
    key: 'anchor',
    value: function anchor(textContent) {
      return {
        "target": [{
          "selector": [{
            "type": "TextQuoteSelector",
            "exact": textContent,
            "prefix": "",
            "suffix": ""
          }]
        }]
      };
    }
  }, {
    key: 'getWebClipperAnchors',
    value: function getWebClipperAnchors(elem, title) {
      var anchors = [];
      var nodes = this.getTextNodes(elem);
      if (title && title.trim() !== "") {
        var anchor = this.anchor(title);
        anchors.push(anchor);
      }
      for (var i = 0; nodes.length > i; i++) {
        var textContent = nodes[i].textContent.trim();
        if (textContent !== "") {
          var anchor = this.anchor(textContent);
          anchors.push(anchor);
        }
      }
      return anchors;
    }
  }]);

  return Adder;
}();

module.exports = {
  ARROW_POINTING_DOWN: ARROW_POINTING_DOWN,
  ARROW_POINTING_UP: ARROW_POINTING_UP,

  Adder: Adder
};

},{"./adder.html":34,"classnames":2}],36:[function(_dereq_,module,exports){
var FragmentAnchor, ImageAnchor, RangeAnchor, TextPositionAnchor, TextQuoteAnchor, querySelector, ref;

ref = _dereq_('./types'), FragmentAnchor = ref.FragmentAnchor, RangeAnchor = ref.RangeAnchor, TextPositionAnchor = ref.TextPositionAnchor, TextQuoteAnchor = ref.TextQuoteAnchor, ImageAnchor = ref.ImageAnchor;

querySelector = function(type, root, selector, options) {
  var doQuery;
  doQuery = function(resolve, reject) {
    var anchor, error, range;
    try {
      anchor = type.fromSelector(root, selector, options);
      range = anchor.toRange(options);
      range.type = type.name;
      return resolve(range);
    } catch (error1) {
      error = error1;
      return reject(error);
    }
  };
  return new Promise(doQuery);
};


/**
 * Anchor a set of selectors.
 *
 * This function converts a set of selectors into a document range.
 * It encapsulates the core anchoring algorithm, using the selectors alone or
 * in combination to establish the best anchor within the document.
 *
 * :param Element root: The root element of the anchoring context.
 * :param Array selectors: The selectors to try.
 * :param Object options: Options to pass to the anchor implementations.
 * :return: A Promise that resolves to a Range on success.
 * :rtype: Promise
 */

exports.anchor = function(root, selectors, options) {
  var fragment, i, image, len, maybeAssertQuote, position, promise, quote, range, ref1, selector;
  if (options == null) {
    options = {};
  }
  fragment = null;
  position = null;
  quote = null;
  range = null;
  image = null;
  ref1 = selectors != null ? selectors : [];
  for (i = 0, len = ref1.length; i < len; i++) {
    selector = ref1[i];
    switch (selector.type) {
      case 'FragmentSelector':
        fragment = selector;
        break;
      case 'TextPositionSelector':
        position = selector;
        options.hint = position.start;
        break;
      case 'TextQuoteSelector':
        quote = selector;
        break;
      case 'RangeSelector':
        range = selector;
        break;
      case 'ImageSelector':
        image = selector;
    }
  }
  maybeAssertQuote = function(range) {
    if (((quote != null ? quote.exact : void 0) != null) && range.toString() !== quote.exact) {
      throw new Error('quote mismatch');
    } else {
      return range;
    }
  };
  promise = Promise.reject('unable to anchor');
  if (fragment != null) {
    promise = promise["catch"](function() {
      return querySelector(FragmentAnchor, root, fragment, options).then(maybeAssertQuote);
    });
  }
  if (image != null) {
    promise = promise["catch"](function() {
      return querySelector(ImageAnchor, root, image, options);
    });
  }
  if (range != null) {
    promise = promise["catch"](function() {
      return querySelector(RangeAnchor, root, range, options).then(maybeAssertQuote);
    });
  }
  if (position != null) {
    promise = promise["catch"](function() {
      return querySelector(TextPositionAnchor, root, position, options).then(maybeAssertQuote);
    });
  }
  if (quote != null) {
    promise = promise["catch"](function() {
      return querySelector(TextQuoteAnchor, root, quote, options);
    });
  }
  return promise;
};

exports.describe = function(root, range, options) {
  var anchor, selector, selectors, type, types;
  if (options == null) {
    options = {};
  }
  types = [FragmentAnchor, RangeAnchor, TextPositionAnchor, TextQuoteAnchor];
  selectors = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = types.length; i < len; i++) {
      type = types[i];
      try {
        anchor = type.fromRange(root, range, options);
        results.push(selector = anchor.toSelector(options));
      } catch (error1) {
        continue;
      }
    }
    return results;
  })();
  try {
    anchor = ImageAnchor.fromRange(root, range, options);
    selector = anchor.toSelector(options);
    if (selector.imgSrc || selector.isCanvas) {
      selectors = [selector];
    }
  } catch (error1) {

  }
  return selectors;
};


},{"./types":39}],37:[function(_dereq_,module,exports){
var RenderingStates, TextPositionAnchor, TextQuoteAnchor, anchorByPosition, findInPages, findPage, getNodeTextLayer, getPage, getPageOffset, getPageTextContent, getSiblingIndex, html, pageTextCache, prioritizePages, quotePositionCache, ref, seek, xpathRange,
  slice = [].slice;

seek = _dereq_('dom-seek');

xpathRange = _dereq_('./range');

html = _dereq_('./html');

RenderingStates = _dereq_('../pdfjs-rendering-states');

ref = _dereq_('./types'), TextPositionAnchor = ref.TextPositionAnchor, TextQuoteAnchor = ref.TextQuoteAnchor;

pageTextCache = {};

quotePositionCache = {};

getSiblingIndex = function(node) {
  var siblings;
  siblings = Array.prototype.slice.call(node.parentNode.childNodes);
  return siblings.indexOf(node);
};

getNodeTextLayer = function(node) {
  var ref1;
  while (!((ref1 = node.classList) != null ? ref1.contains('page') : void 0)) {
    node = node.parentNode;
  }
  return node.getElementsByClassName('textLayer')[0];
};

getPage = function(pageIndex) {
  return PDFViewerApplication.pdfViewer.getPageView(pageIndex);
};

getPageTextContent = function(pageIndex) {
  var joinItems;
  if (pageTextCache[pageIndex] != null) {
    return pageTextCache[pageIndex];
  } else {
    joinItems = function(arg) {
      var item, items, nonEmpty, textContent;
      items = arg.items;
      nonEmpty = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          if (/\S/.test(item.str)) {
            results.push(item.str);
          }
        }
        return results;
      })();
      textContent = nonEmpty.join('');
      return textContent;
    };
    pageTextCache[pageIndex] = PDFViewerApplication.pdfViewer.getPageTextContent(pageIndex).then(joinItems);
    return pageTextCache[pageIndex];
  }
};

getPageOffset = function(pageIndex) {
  var index, next;
  index = -1;
  next = function(offset) {
    if (++index === pageIndex) {
      return Promise.resolve(offset);
    }
    return getPageTextContent(index).then(function(textContent) {
      return next(offset + textContent.length);
    });
  };
  return next(0);
};

findPage = function(offset) {
  var count, index, total;
  index = 0;
  total = 0;
  count = function(textContent) {
    var lastPageIndex;
    lastPageIndex = PDFViewerApplication.pdfViewer.pagesCount - 1;
    if (total + textContent.length > offset || index === lastPageIndex) {
      offset = total;
      return Promise.resolve({
        index: index,
        offset: offset,
        textContent: textContent
      });
    } else {
      index++;
      total += textContent.length;
      return getPageTextContent(index).then(count);
    }
  };
  return getPageTextContent(0).then(count);
};

anchorByPosition = function(page, anchor, options) {
  var div, placeholder, range, ref1, ref2, renderingDone, renderingState, root, selector;
  renderingState = page.renderingState;
  renderingDone = (ref1 = page.textLayer) != null ? ref1.renderingDone : void 0;
  if (renderingState === RenderingStates.FINISHED && renderingDone) {
    root = page.textLayer.textLayerDiv;
    selector = anchor.toSelector(options);
    return html.anchor(root, [selector]);
  } else {
    div = (ref2 = page.div) != null ? ref2 : page.el;
    placeholder = div.getElementsByClassName('annotator-placeholder')[0];
    if (placeholder == null) {
      placeholder = document.createElement('span');
      placeholder.classList.add('annotator-placeholder');
      placeholder.textContent = 'Loading annotations…';
      div.appendChild(placeholder);
    }
    range = document.createRange();
    range.setStartBefore(placeholder);
    range.setEndAfter(placeholder);
    return range;
  }
};

findInPages = function(arg, quote, position) {
  var attempt, cacheAndFinish, content, next, offset, page, pageIndex, rest;
  pageIndex = arg[0], rest = 2 <= arg.length ? slice.call(arg, 1) : [];
  if (pageIndex == null) {
    return Promise.reject(new Error('Quote not found'));
  }
  attempt = function(info) {
    var anchor, content, hint, offset, page, root;
    page = info[0], content = info[1], offset = info[2];
    root = {
      textContent: content
    };
    anchor = new TextQuoteAnchor.fromSelector(root, quote);
    if (position != null) {
      hint = position.start - offset;
      hint = Math.max(0, hint);
      hint = Math.min(hint, content.length);
      return anchor.toPositionAnchor({
        hint: hint
      });
    } else {
      return anchor.toPositionAnchor();
    }
  };
  next = function() {
    return findInPages(rest, quote, position);
  };
  cacheAndFinish = function(anchor) {
    var name;
    if (position) {
      if (quotePositionCache[name = quote.exact] == null) {
        quotePositionCache[name] = {};
      }
      quotePositionCache[quote.exact][position.start] = {
        page: page,
        anchor: anchor
      };
    }
    return anchorByPosition(page, anchor);
  };
  page = getPage(pageIndex);
  content = getPageTextContent(pageIndex);
  offset = getPageOffset(pageIndex);
  return Promise.all([page, content, offset]).then(attempt).then(cacheAndFinish)["catch"](next);
};

prioritizePages = function(position) {
  var i, pageIndices, pagesCount, results, sort;
  pagesCount = PDFViewerApplication.pdfViewer.pagesCount;
  pageIndices = (function() {
    results = [];
    for (var i = 0; 0 <= pagesCount ? i < pagesCount : i > pagesCount; 0 <= pagesCount ? i++ : i--){ results.push(i); }
    return results;
  }).apply(this);
  sort = function(pageIndex) {
    var left, result, right;
    left = pageIndices.slice(0, pageIndex);
    right = pageIndices.slice(pageIndex);
    result = [];
    while (left.length || right.length) {
      if (right.length) {
        result.push(right.shift());
      }
      if (left.length) {
        result.push(left.pop());
      }
    }
    return result;
  };
  if (position != null) {
    return findPage(position.start).then(function(arg) {
      var index;
      index = arg.index;
      return sort(index);
    });
  } else {
    return Promise.resolve(pageIndices);
  }
};


/**
 * Anchor a set of selectors.
 *
 * This function converts a set of selectors into a document range.
 * It encapsulates the core anchoring algorithm, using the selectors alone or
 * in combination to establish the best anchor within the document.
 *
 * :param Element root: The root element of the anchoring context.
 * :param Array selectors: The selectors to try.
 * :param Object options: Options to pass to the anchor implementations.
 * :return: A Promise that resolves to a Range on success.
 * :rtype: Promise
 */

exports.anchor = function(root, selectors, options) {
  var assertQuote, i, len, position, promise, quote, ref1, selector;
  if (options == null) {
    options = {};
  }
  position = null;
  quote = null;
  ref1 = selectors != null ? selectors : [];
  for (i = 0, len = ref1.length; i < len; i++) {
    selector = ref1[i];
    switch (selector.type) {
      case 'TextPositionSelector':
        position = selector;
        break;
      case 'TextQuoteSelector':
        quote = selector;
    }
  }
  promise = Promise.reject('unable to anchor');
  assertQuote = function(range) {
    if (((quote != null ? quote.exact : void 0) != null) && range.toString() !== quote.exact) {
      throw new Error('quote mismatch');
    } else {
      return range;
    }
  };
  if (position != null) {
    promise = promise["catch"](function() {
      return findPage(position.start).then(function(arg) {
        var anchor, end, index, length, offset, page, start, textContent;
        index = arg.index, offset = arg.offset, textContent = arg.textContent;
        page = getPage(index);
        start = position.start - offset;
        end = position.end - offset;
        length = end - start;
        assertQuote(textContent.substr(start, length));
        anchor = new TextPositionAnchor(root, start, end);
        return anchorByPosition(page, anchor, options);
      });
    });
  }
  if (quote != null) {
    promise = promise["catch"](function() {
      var anchor, page, ref2, ref3;
      if ((position != null) && (((ref2 = quotePositionCache[quote.exact]) != null ? ref2[position.start] : void 0) != null)) {
        ref3 = quotePositionCache[quote.exact][position.start], page = ref3.page, anchor = ref3.anchor;
        return anchorByPosition(page, anchor, options);
      }
      return prioritizePages(position).then(function(pageIndices) {
        return findInPages(pageIndices, quote, position);
      });
    });
  }
  return promise;
};


/**
 * Convert a DOM Range object into a set of selectors.
 *
 * Converts a DOM `Range` object describing a start and end point within a
 * `root` `Element` and converts it to a `[position, quote]` tuple of selectors
 * which can be saved into an annotation and later passed to `anchor` to map
 * the selectors back to a `Range`.
 *
 * :param Element root: The root Element
 * :param Range range: DOM Range object
 * :param Object options: Options passed to `TextQuoteAnchor` and
 *                        `TextPositionAnchor`'s `toSelector` methods.
 */

exports.describe = function(root, range, options) {
  var end, endPageIndex, endRange, endTextLayer, iter, start, startPageIndex, startRange, startTextLayer;
  if (options == null) {
    options = {};
  }
  range = new xpathRange.BrowserRange(range).normalize();
  startTextLayer = getNodeTextLayer(range.start);
  endTextLayer = getNodeTextLayer(range.end);
  if (startTextLayer !== endTextLayer) {
    throw new Error('selecting across page breaks is not supported');
  }
  startRange = range.limit(startTextLayer);
  endRange = range.limit(endTextLayer);
  startPageIndex = getSiblingIndex(startTextLayer.parentNode);
  endPageIndex = getSiblingIndex(endTextLayer.parentNode);
  iter = document.createNodeIterator(startTextLayer, NodeFilter.SHOW_TEXT);
  start = seek(iter, range.start);
  end = seek(iter, range.end) + start + range.end.textContent.length;
  return getPageOffset(startPageIndex).then(function(pageOffset) {
    var position, quote, r;
    start += pageOffset;
    end += pageOffset;
    position = new TextPositionAnchor(root, start, end).toSelector(options);
    r = document.createRange();
    r.setStartBefore(startRange.start);
    r.setEndAfter(endRange.end);
    quote = TextQuoteAnchor.fromRange(root, r, options).toSelector(options);
    return Promise.all([position, quote]);
  });
};


/**
 * Clear the internal caches of page text contents and quote locations.
 *
 * This exists mainly as a helper for use in tests.
 */

exports.purgeCache = function() {
  pageTextCache = {};
  return quotePositionCache = {};
};


},{"../pdfjs-rendering-states":61,"./html":36,"./range":38,"./types":39,"dom-seek":22}],38:[function(_dereq_,module,exports){
var $, Range, Util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = _dereq_('jquery');

Util = _dereq_('./util');

Range = {};

Range.sniff = function(r) {
  if (r.commonAncestorContainer != null) {
    return new Range.BrowserRange(r);
  } else if (typeof r.start === "string") {
    return new Range.SerializedRange(r);
  } else if (r.start && typeof r.start === "object") {
    return new Range.NormalizedRange(r);
  } else {
    console.error("Could not sniff range type");
    return false;
  }
};

Range.nodeFromXPath = function(xpath, root) {
  var customResolver, evaluateXPath, namespace, node, segment;
  if (root == null) {
    root = document;
  }
  evaluateXPath = function(xp, nsResolver) {
    var exception;
    if (nsResolver == null) {
      nsResolver = null;
    }
    try {
      return document.evaluate('.' + xp, root, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } catch (error) {
      exception = error;
      console.log("XPath evaluation failed.");
      console.log("Trying fallback...");
      return Util.nodeFromXPath(xp, root);
    }
  };
  if (!$.isXMLDoc(document.documentElement)) {
    return evaluateXPath(xpath);
  } else {
    customResolver = document.createNSResolver(document.ownerDocument === null ? document.documentElement : document.ownerDocument.documentElement);
    node = evaluateXPath(xpath, customResolver);
    if (!node) {
      xpath = ((function() {
        var i, len, ref, results;
        ref = xpath.split('/');
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          segment = ref[i];
          if (segment && segment.indexOf(':') === -1) {
            results.push(segment.replace(/^([a-z]+)/, 'xhtml:$1'));
          } else {
            results.push(segment);
          }
        }
        return results;
      })()).join('/');
      namespace = document.lookupNamespaceURI(null);
      customResolver = function(ns) {
        if (ns === 'xhtml') {
          return namespace;
        } else {
          return document.documentElement.getAttribute('xmlns:' + ns);
        }
      };
      node = evaluateXPath(xpath, customResolver);
    }
    return node;
  }
};

Range.RangeError = (function(superClass) {
  extend(RangeError, superClass);

  function RangeError(type, message, parent1) {
    this.type = type;
    this.message = message;
    this.parent = parent1 != null ? parent1 : null;
    RangeError.__super__.constructor.call(this, this.message);
  }

  return RangeError;

})(Error);

Range.BrowserRange = (function() {
  function BrowserRange(obj) {
    this.commonAncestorContainer = obj.commonAncestorContainer;
    this.startContainer = obj.startContainer;
    this.startOffset = obj.startOffset;
    this.endContainer = obj.endContainer;
    this.endOffset = obj.endOffset;
  }

  BrowserRange.prototype.normalize = function(root) {
    var n, node, nr, r;
    if (this.tainted) {
      console.error("You may only call normalize() once on a BrowserRange!");
      return false;
    } else {
      this.tainted = true;
    }
    r = {};
    if (this.startContainer.nodeType === Node.ELEMENT_NODE) {
      if (this.startOffset < this.startContainer.childNodes.length) {
        r.start = Util.getFirstTextNodeNotBefore(this.startContainer.childNodes[this.startOffset]);
      } else {
        r.start = Util.getFirstTextNodeNotBefore(this.startContainer);
      }
      r.startOffset = 0;
    } else {
      r.start = this.startContainer;
      r.startOffset = this.startOffset;
    }
    if (this.endContainer.nodeType === Node.ELEMENT_NODE) {
      node = this.endContainer.childNodes[this.endOffset];
      if (node != null) {
        n = node;
        while ((n != null) && (n.nodeType !== Node.TEXT_NODE)) {
          n = n.firstChild;
        }
        if (n != null) {
          r.end = n;
          r.endOffset = 0;
        }
      }
      if (r.end == null) {
        if (this.endOffset) {
          node = this.endContainer.childNodes[this.endOffset - 1];
        } else {
          node = this.endContainer.previousSibling;
        }
        r.end = Util.getLastTextNodeUpTo(node);
        r.endOffset = r.end.nodeValue.length;
      }
    } else {
      r.end = this.endContainer;
      r.endOffset = this.endOffset;
    }
    nr = {};
    if (r.startOffset > 0) {
      if (!r.start.nextSibling || r.start.nodeValue.length > r.startOffset) {
        nr.start = r.start.splitText(r.startOffset);
      } else {
        nr.start = r.start.nextSibling;
      }
    } else {
      nr.start = r.start;
    }
    if (r.start === r.end) {
      if (nr.start.nodeValue.length > (r.endOffset - r.startOffset)) {
        nr.start.splitText(r.endOffset - r.startOffset);
      }
      nr.end = nr.start;
    } else {
      if (r.end.nodeValue.length > r.endOffset) {
        r.end.splitText(r.endOffset);
      }
      nr.end = r.end;
    }
    nr.commonAncestor = this.commonAncestorContainer;
    while (nr.commonAncestor.nodeType !== Node.ELEMENT_NODE) {
      nr.commonAncestor = nr.commonAncestor.parentNode;
    }
    return new Range.NormalizedRange(nr);
  };

  BrowserRange.prototype.serialize = function(root, ignoreSelector) {
    return this.normalize(root).serialize(root, ignoreSelector);
  };

  return BrowserRange;

})();

Range.NormalizedRange = (function() {
  function NormalizedRange(obj) {
    this.commonAncestor = obj.commonAncestor;
    this.start = obj.start;
    this.end = obj.end;
  }

  NormalizedRange.prototype.normalize = function(root) {
    return this;
  };

  NormalizedRange.prototype.limit = function(bounds) {
    var i, len, nodes, parent, ref, startParents;
    nodes = $.grep(this.textNodes(), function(node) {
      return node.parentNode === bounds || $.contains(bounds, node.parentNode);
    });
    if (!nodes.length) {
      return null;
    }
    this.start = nodes[0];
    this.end = nodes[nodes.length - 1];
    startParents = $(this.start).parents();
    ref = $(this.end).parents();
    for (i = 0, len = ref.length; i < len; i++) {
      parent = ref[i];
      if (startParents.index(parent) !== -1) {
        this.commonAncestor = parent;
        break;
      }
    }
    return this;
  };

  NormalizedRange.prototype.serialize = function(root, ignoreSelector) {
    var end, serialization, start;
    serialization = function(node, isEnd) {
      var i, len, n, nodes, offset, origParent, textNodes, xpath;
      if (ignoreSelector) {
        origParent = $(node).parents(":not(" + ignoreSelector + ")").eq(0);
      } else {
        origParent = $(node).parent();
      }
      xpath = Util.xpathFromNode(origParent, root)[0];
      textNodes = Util.getTextNodes(origParent);
      nodes = textNodes.slice(0, textNodes.index(node));
      offset = 0;
      for (i = 0, len = nodes.length; i < len; i++) {
        n = nodes[i];
        offset += n.nodeValue.length;
      }
      if (isEnd) {
        return [xpath, offset + node.nodeValue.length];
      } else {
        return [xpath, offset];
      }
    };
    start = serialization(this.start);
    end = serialization(this.end, true);
    return new Range.SerializedRange({
      start: start[0],
      end: end[0],
      startOffset: start[1],
      endOffset: end[1]
    });
  };

  NormalizedRange.prototype.text = function() {
    var node;
    return ((function() {
      var i, len, ref, results;
      ref = this.textNodes();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        results.push(node.nodeValue);
      }
      return results;
    }).call(this)).join('');
  };

  NormalizedRange.prototype.textNodes = function() {
    var end, ref, start, textNodes;
    textNodes = Util.getTextNodes($(this.commonAncestor));
    ref = [textNodes.index(this.start), textNodes.index(this.end)], start = ref[0], end = ref[1];
    return $.makeArray(textNodes.slice(start, +end + 1 || 9e9));
  };

  NormalizedRange.prototype.toRange = function() {
    var range;
    range = document.createRange();
    range.setStartBefore(this.start);
    range.setEndAfter(this.end);
    return range;
  };

  return NormalizedRange;

})();

Range.SerializedRange = (function() {
  function SerializedRange(obj) {
    this.start = obj.start;
    this.startOffset = obj.startOffset;
    this.end = obj.end;
    this.endOffset = obj.endOffset;
  }

  SerializedRange.prototype.normalize = function(root) {
    var contains, e, i, j, len, len1, length, node, p, range, ref, ref1, targetOffset, tn;
    range = {};
    ref = ['start', 'end'];
    for (i = 0, len = ref.length; i < len; i++) {
      p = ref[i];
      try {
        node = Range.nodeFromXPath(this[p], root);
      } catch (error) {
        e = error;
        throw new Range.RangeError(p, ("Error while finding " + p + " node: " + this[p] + ": ") + e, e);
      }
      if (!node) {
        throw new Range.RangeError(p, "Couldn't find " + p + " node: " + this[p]);
      }
      length = 0;
      targetOffset = this[p + 'Offset'];
      if (p === 'end') {
        targetOffset--;
      }
      ref1 = Util.getTextNodes($(node));
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        tn = ref1[j];
        if (length + tn.nodeValue.length > targetOffset) {
          range[p + 'Container'] = tn;
          range[p + 'Offset'] = this[p + 'Offset'] - length;
          break;
        } else {
          length += tn.nodeValue.length;
        }
      }
      if (range[p + 'Offset'] == null) {
        throw new Range.RangeError(p + "offset", "Couldn't find offset " + this[p + 'Offset'] + " in element " + this[p]);
      }
    }
    contains = document.compareDocumentPosition == null ? function(a, b) {
      return a.contains(b);
    } : function(a, b) {
      return a.compareDocumentPosition(b) & 16;
    };
    $(range.startContainer).parents().each(function() {
      if (contains(this, range.endContainer)) {
        range.commonAncestorContainer = this;
        return false;
      }
    });
    return new Range.BrowserRange(range).normalize(root);
  };

  SerializedRange.prototype.serialize = function(root, ignoreSelector) {
    return this.normalize(root).serialize(root, ignoreSelector);
  };

  SerializedRange.prototype.toObject = function() {
    return {
      start: this.start,
      startOffset: this.startOffset,
      end: this.end,
      endOffset: this.endOffset
    };
  };

  return SerializedRange;

})();

module.exports = Range;


},{"./util":40,"jquery":"jquery"}],39:[function(_dereq_,module,exports){
var $, ImageAnchor, RangeAnchor, TextPositionAnchor, TextQuoteAnchor, Util, domAnchorTextPosition, domAnchorTextQuote, missingParameter, xpathRange;

domAnchorTextPosition = _dereq_('dom-anchor-text-position');

domAnchorTextQuote = _dereq_('dom-anchor-text-quote');

xpathRange = _dereq_('./range');

$ = _dereq_('jquery');

Util = _dereq_('./util');

missingParameter = function(name) {
  throw new Error('missing required parameter "' + name + '"');
};


/**
 * class:: RangeAnchor(range)
 *
 * This anchor type represents a DOM Range.
 *
 * :param Range range: A range describing the anchor.
 */

RangeAnchor = (function() {
  function RangeAnchor(root, range) {
    if (root == null) {
      missingParameter('root');
    }
    if (range == null) {
      missingParameter('range');
    }
    this.root = root;
    this.range = xpathRange.sniff(range).normalize(this.root);
    this.orgRange = range;
  }

  RangeAnchor.fromRange = function(root, range) {
    return new RangeAnchor(root, range);
  };

  RangeAnchor.fromSelector = function(root, selector) {
    var data, range;
    data = {
      start: selector.startContainer,
      startOffset: selector.startOffset,
      end: selector.endContainer,
      endOffset: selector.endOffset
    };
    range = new xpathRange.SerializedRange(data);
    return new RangeAnchor(root, range);
  };

  RangeAnchor.prototype.toRange = function() {
    return this.range.toRange();
  };

  RangeAnchor.prototype.toSelector = function(options) {
    var range;
    if (options == null) {
      options = {};
    }
    range = this.range.serialize(this.root, options.ignoreSelector);
    return {
      type: 'RangeSelector',
      startContainer: range.start,
      startOffset: range.startOffset,
      endContainer: range.end,
      endOffset: range.endOffset
    };
  };

  return RangeAnchor;

})();


/**
 * class:: RangeAnchor(range)
 *
 * This anchor type represents a DOM Range.
 *
 * :param Range range: A range describing the anchor.
 */

ImageAnchor = (function() {
  function ImageAnchor(root, range) {
    if (root == null) {
      missingParameter('root');
    }
    if (range == null) {
      missingParameter('range');
    }
    this.root = root;
    this.range = range;
  }

  ImageAnchor.fromRange = function(root, range) {
    return new ImageAnchor(root, range);
  };

  ImageAnchor.fromSelector = function(root, selector) {
    var $imgFromSrc, end, imgRange, range, start;
    range = document.createRange();
    imgRange = null;
    if (selector.endOffset - selector.startOffset !== 1) {
      throw new Error('Can not create ImageAnchor');
    }
    start = xpathRange.nodeFromXPath(selector.startContainer, root);
    end = xpathRange.nodeFromXPath(selector.endContainer, root);
    range.setStart(start, selector.startOffset);
    range.setEnd(end, selector.endOffset);
    if (selector.imgSrc) {
      $imgFromSrc = $('img[src="' + selector.imgSrc + '"]');
      if ($imgFromSrc.length > 0) {
        $imgFromSrc.each((function(_this) {
          return function(index, element) {
            imgRange = document.createRange();
            imgRange.selectNode(element);
            if ($(imgRange.commonAncestorContainer).is($(range.commonAncestorContainer))) {
              return false;
            } else {
              imgRange = null;
              return true;
            }
          };
        })(this));
      }
    }
    if (imgRange || selector.isCanvas) {
      return new ImageAnchor(root, range);
    } else {
      throw new Error('Image Not found');
    }
  };

  ImageAnchor.prototype.toRange = function() {
    return this.range;
  };

  ImageAnchor.prototype.toSelector = function(options) {
    var canvasEls, commonAncestorContainer, div, endContainer, fragment, imgs, src, startContainer;
    if (options == null) {
      options = {};
    }
    src = null;
    commonAncestorContainer = Util.xpathFromNode($(this.range.commonAncestorContainer), this.root)[0];
    startContainer = Util.xpathFromNode($(this.range.startContainer), this.root)[0];
    endContainer = Util.xpathFromNode($(this.range.endContainer), this.root)[0];
    fragment = this.range.cloneContents();
    div = document.createElement('div');
    div.appendChild(fragment.cloneNode(true));
    imgs = $(div).find("img");
    canvasEls = $(div).find("canvas");
    if (imgs.length > 0) {
      imgs.each((function(_this) {
        return function(index, element) {
          src = $(element).attr('src');
        };
      })(this));
    }
    return {
      type: 'ImageSelector',
      commonAncestorContainer: commonAncestorContainer,
      startContainer: startContainer,
      startOffset: this.range.startOffset,
      endContainer: endContainer,
      endOffset: this.range.endOffset,
      imgSrc: src,
      isCanvas: canvasEls.length > 0
    };
  };

  return ImageAnchor;

})();


/**
 * Converts between TextPositionSelector selectors and Range objects.
 */

TextPositionAnchor = (function() {
  function TextPositionAnchor(root, start, end) {
    this.root = root;
    this.start = start;
    this.end = end;
  }

  TextPositionAnchor.fromRange = function(root, range) {
    var selector;
    selector = domAnchorTextPosition.fromRange(root, range);
    return TextPositionAnchor.fromSelector(root, selector);
  };

  TextPositionAnchor.fromSelector = function(root, selector) {
    return new TextPositionAnchor(root, selector.start, selector.end);
  };

  TextPositionAnchor.prototype.toSelector = function() {
    return {
      type: 'TextPositionSelector',
      start: this.start,
      end: this.end
    };
  };

  TextPositionAnchor.prototype.toRange = function() {
    return domAnchorTextPosition.toRange(this.root, {
      start: this.start,
      end: this.end
    });
  };

  return TextPositionAnchor;

})();


/**
 * Converts between TextQuoteSelector selectors and Range objects.
 */

TextQuoteAnchor = (function() {
  function TextQuoteAnchor(root, exact, context) {
    if (context == null) {
      context = {};
    }
    this.root = root;
    this.exact = exact;
    this.context = context;
  }

  TextQuoteAnchor.fromRange = function(root, range, options) {
    var selector;
    selector = domAnchorTextQuote.fromRange(root, range, options);
    return TextQuoteAnchor.fromSelector(root, selector);
  };

  TextQuoteAnchor.fromSelector = function(root, selector) {
    var prefix, suffix;
    prefix = selector.prefix, suffix = selector.suffix;
    return new TextQuoteAnchor(root, selector.exact, {
      prefix: prefix,
      suffix: suffix
    });
  };

  TextQuoteAnchor.prototype.toSelector = function() {
    return {
      type: 'TextQuoteSelector',
      exact: this.exact,
      prefix: this.context.prefix,
      suffix: this.context.suffix
    };
  };

  TextQuoteAnchor.prototype.toRange = function(options) {
    var range;
    if (options == null) {
      options = {};
    }
    range = domAnchorTextQuote.toRange(this.root, this.toSelector(), options);
    if (range === null) {
      throw new Error('Quote not found');
    }
    return range;
  };

  TextQuoteAnchor.prototype.toPositionAnchor = function(options) {
    var anchor;
    if (options == null) {
      options = {};
    }
    anchor = domAnchorTextQuote.toTextPosition(this.root, this.toSelector(), options);
    if (anchor === null) {
      throw new Error('Quote not found');
    }
    return new TextPositionAnchor(this.root, anchor.start, anchor.end);
  };

  return TextQuoteAnchor;

})();

exports.RangeAnchor = RangeAnchor;

exports.ImageAnchor = ImageAnchor;

exports.FragmentAnchor = _dereq_('dom-anchor-fragment');

exports.TextPositionAnchor = TextPositionAnchor;

exports.TextQuoteAnchor = TextQuoteAnchor;


},{"./range":38,"./util":40,"dom-anchor-fragment":6,"dom-anchor-text-position":7,"dom-anchor-text-quote":10,"jquery":"jquery"}],40:[function(_dereq_,module,exports){
var $, Util, ref, simpleXPathJQuery, simpleXPathPure;

$ = _dereq_('jquery');

ref = _dereq_('./xpath'), simpleXPathJQuery = ref.simpleXPathJQuery, simpleXPathPure = ref.simpleXPathPure;

Util = {};

Util.flatten = function(array) {
  var flatten;
  flatten = function(ary) {
    var el, flat, i, len;
    flat = [];
    for (i = 0, len = ary.length; i < len; i++) {
      el = ary[i];
      flat = flat.concat(el && $.isArray(el) ? flatten(el) : el);
    }
    return flat;
  };
  return flatten(array);
};

Util.getTextNodes = function(jq) {
  var getTextNodes;
  getTextNodes = function(node) {
    var nodes;
    if (node && node.nodeType !== Node.TEXT_NODE) {
      nodes = [];
      if (node.nodeType !== Node.COMMENT_NODE) {
        node = node.lastChild;
        while (node) {
          nodes.push(getTextNodes(node));
          node = node.previousSibling;
        }
      }
      return nodes.reverse();
    } else {
      return node;
    }
  };
  return jq.map(function() {
    return Util.flatten(getTextNodes(this));
  });
};

Util.getLastTextNodeUpTo = function(n) {
  var result;
  switch (n.nodeType) {
    case Node.TEXT_NODE:
      return n;
    case Node.ELEMENT_NODE:
      if (n.lastChild != null) {
        result = Util.getLastTextNodeUpTo(n.lastChild);
        if (result != null) {
          return result;
        }
      }
      break;
  }
  n = n.previousSibling;
  if (n != null) {
    return Util.getLastTextNodeUpTo(n);
  } else {
    return null;
  }
};

Util.getFirstTextNodeNotBefore = function(n) {
  var result;
  switch (n.nodeType) {
    case Node.TEXT_NODE:
      return n;
    case Node.ELEMENT_NODE:
      if (n.firstChild != null) {
        result = Util.getFirstTextNodeNotBefore(n.firstChild);
        if (result != null) {
          return result;
        }
      }
      break;
  }
  n = n.nextSibling;
  if (n != null) {
    return Util.getFirstTextNodeNotBefore(n);
  } else {
    return null;
  }
};

Util.xpathFromNode = function(el, relativeRoot) {
  var exception, result;
  try {
    result = simpleXPathJQuery.call(el, relativeRoot);
  } catch (error) {
    exception = error;
    console.log("jQuery-based XPath construction failed! Falling back to manual.");
    result = simpleXPathPure.call(el, relativeRoot);
  }
  return result;
};

Util.nodeFromXPath = function(xp, root) {
  var i, idx, len, name, node, ref1, step, steps;
  steps = xp.substring(1).split("/");
  node = root;
  for (i = 0, len = steps.length; i < len; i++) {
    step = steps[i];
    ref1 = step.split("["), name = ref1[0], idx = ref1[1];
    idx = idx != null ? parseInt((idx != null ? idx.split("]") : void 0)[0]) : 1;
    node = findChild(node, name.toLowerCase(), idx);
  }
  return node;
};

module.exports = {
  nodeFromXPath: Util.nodeFromXPath,
  xpathFromNode: Util.xpathFromNode,
  getTextNodes: Util.getTextNodes,
  getFirstTextNodeNotBefore: Util.getFirstTextNodeNotBefore,
  getLastTextNodeUpTo: Util.getLastTextNodeUpTo
};


},{"./xpath":41,"jquery":"jquery"}],41:[function(_dereq_,module,exports){
var $, findChild, getNodeName, getNodePosition, simpleXPathJQuery, simpleXPathPure;

$ = _dereq_('jquery');

simpleXPathJQuery = function(relativeRoot) {
  var jq;
  jq = this.map(function() {
    var elem, idx, path, tagName;
    path = '';
    elem = this;
    while ((elem != null ? elem.nodeType : void 0) === Node.ELEMENT_NODE && elem !== relativeRoot) {
      tagName = elem.tagName.replace(":", "\\:");
      idx = $(elem.parentNode).children(tagName).index(elem) + 1;
      idx = "[" + idx + "]";
      path = "/" + elem.tagName.toLowerCase() + idx + path;
      elem = elem.parentNode;
    }
    return path;
  });
  return jq.get();
};

simpleXPathPure = function(relativeRoot) {
  var getPathSegment, getPathTo, jq, rootNode;
  getPathSegment = function(node) {
    var name, pos;
    name = getNodeName(node);
    pos = getNodePosition(node);
    return name + "[" + pos + "]";
  };
  rootNode = relativeRoot;
  getPathTo = function(node) {
    var xpath;
    xpath = '';
    while (node !== rootNode) {
      if (node == null) {
        throw new Error("Called getPathTo on a node which was not a descendant of @rootNode. " + rootNode);
      }
      xpath = (getPathSegment(node)) + '/' + xpath;
      node = node.parentNode;
    }
    xpath = '/' + xpath;
    xpath = xpath.replace(/\/$/, '');
    return xpath;
  };
  jq = this.map(function() {
    var path;
    path = getPathTo(this);
    return path;
  });
  return jq.get();
};

findChild = function(node, type, index) {
  var child, children, found, i, len, name;
  if (!node.hasChildNodes()) {
    throw new Error("XPath error: node has no children!");
  }
  children = node.childNodes;
  found = 0;
  for (i = 0, len = children.length; i < len; i++) {
    child = children[i];
    name = getNodeName(child);
    if (name === type) {
      found += 1;
      if (found === index) {
        return child;
      }
    }
  }
  throw new Error("XPath error: wanted child not found.");
};

getNodeName = function(node) {
  var nodeName;
  nodeName = node.nodeName.toLowerCase();
  switch (nodeName) {
    case "#text":
      return "text()";
    case "#comment":
      return "comment()";
    case "#cdata-section":
      return "cdata-section()";
    default:
      return nodeName;
  }
};

getNodePosition = function(node) {
  var pos, tmp;
  pos = 0;
  tmp = node;
  while (tmp) {
    if (tmp.nodeName === node.nodeName) {
      pos++;
    }
    tmp = tmp.previousSibling;
  }
  return pos;
};

module.exports = {
  simpleXPathJQuery: simpleXPathJQuery,
  simpleXPathPure: simpleXPathPure
};


},{"jquery":"jquery"}],42:[function(_dereq_,module,exports){
'use strict';

var events = _dereq_('../shared/bridge-events');

var ANNOTATION_COUNT_ATTR = 'data-hypothesis-annotation-count';

/**
 * Update the elements in the container element with the count data attribute
 * with the new annotation count.
 *
 * @param {Element} rootEl - The DOM element which contains the elements that
 * display annotation count.
 */

function annotationCounts(rootEl, crossframe) {
  crossframe.on(events.PUBLIC_ANNOTATION_COUNT_CHANGED, updateAnnotationCountElems);

  function updateAnnotationCountElems(newCount) {
    var elems = rootEl.querySelectorAll('[' + ANNOTATION_COUNT_ATTR + ']');
    Array.from(elems).forEach(function (elem) {
      elem.textContent = newCount;
    });
  }
}

module.exports = annotationCounts;

},{"../shared/bridge-events":80}],43:[function(_dereq_,module,exports){
'use strict';

// AnnotationSync listens for messages from the sidebar app indicating that
// annotations have been added or removed and relays them to Guest.
//
// It also listens for events from Guest when new annotations are created or
// annotations successfully anchor and relays these to the sidebar app.

function AnnotationSync(bridge, options) {
  var self = this;

  this.bridge = bridge;

  if (!options.on) {
    throw new Error('options.on unspecified for AnnotationSync.');
  }

  if (!options.emit) {
    throw new Error('options.emit unspecified for AnnotationSync.');
  }

  this.cache = {};

  this._on = options.on;
  this._emit = options.emit;

  // Listen locally for interesting events
  Object.keys(this._eventListeners).forEach(function (eventName) {
    var listener = self._eventListeners[eventName];
    self._on(eventName, function (annotation) {
      listener.apply(self, [annotation]);
    });
  });

  // Register remotely invokable methods
  Object.keys(this._channelListeners).forEach(function (eventName) {
    self.bridge.on(eventName, function (data, callbackFunction) {
      var listener = self._channelListeners[eventName];
      listener.apply(self, [data, callbackFunction]);
    });
  });
}

// Cache of annotations which have crossed the bridge for fast, encapsulated
// association of annotations received in arguments to window-local copies.
AnnotationSync.prototype.cache = null;

AnnotationSync.prototype.sync = function (annotations) {
  annotations = function () {
    var i;
    var formattedAnnotations = [];

    for (i = 0; i < annotations.length; i++) {
      formattedAnnotations.push(this._format(annotations[i]));
    }
    return formattedAnnotations;
  }.call(this);
  this.bridge.call('sync', annotations, function (_this) {
    return function (err, annotations) {
      var i;
      var parsedAnnotations = [];
      annotations = annotations || [];

      for (i = 0; i < annotations.length; i++) {
        parsedAnnotations.push(_this._parse(annotations[i]));
      }
      return parsedAnnotations;
    };
  }(this));
  return this;
};

// Handlers for messages arriving through a channel
AnnotationSync.prototype._channelListeners = {
  'deleteAnnotation': function deleteAnnotation(body, cb) {
    var annotation = this._parse(body);
    delete this.cache[annotation.$tag];
    this._emit('annotationDeleted', annotation);
    cb(null, this._format(annotation));
  },
  'loadAnnotations': function loadAnnotations(bodies, cb) {
    var annotations = function () {
      var i;
      var parsedAnnotations = [];

      for (i = 0; i < bodies.length; i++) {
        parsedAnnotations.push(this._parse(bodies[i]));
      }
      return parsedAnnotations;
    }.call(this);
    this._emit('annotationsLoaded', annotations);
    return cb(null, annotations);
  }
};

// Handlers for events coming from this frame, to send them across the channel
AnnotationSync.prototype._eventListeners = {
  'beforeAnnotationCreated': function beforeAnnotationCreated(annotation) {
    if (annotation.$tag) {
      return undefined;
    }
    return this._mkCallRemotelyAndParseResults('beforeCreateAnnotation')(annotation);
  },
  'addToTaskSpace': function addToTaskSpace(doc) {
    return this._mkCallRemotelyAndParseResults('addToTaskSpace')(doc);
  }
};

AnnotationSync.prototype._mkCallRemotelyAndParseResults = function (method, callBack) {
  return function (_this) {
    return function (annotation) {
      // Wrap the callback function to first parse returned items
      var wrappedCallback = function wrappedCallback(failure, results) {
        if (failure === null) {
          _this._parseResults(results);
        }
        if (typeof callBack === 'function') {
          callBack(failure, results);
        }
      };
      // Call the remote method
      _this.bridge.call(method, _this._format(annotation), wrappedCallback);
    };
  }(this);
};

// Parse returned message bodies to update cache with any changes made remotely
AnnotationSync.prototype._parseResults = function (results) {
  var bodies;
  var body;
  var i;
  var j;

  for (i = 0; i < results.length; i++) {
    bodies = results[i];
    bodies = [].concat(bodies);
    for (j = 0; j < bodies.length; j++) {
      body = bodies[j];
      if (body !== null) {
        this._parse(body);
      }
    }
  }
};

// Assign a non-enumerable tag to objects which cross the bridge.
// This tag is used to identify the objects between message.
AnnotationSync.prototype._tag = function (ann, tag) {
  if (ann.$tag) {
    return ann;
  }
  tag = tag || window.btoa(Math.random());
  Object.defineProperty(ann, '$tag', {
    value: tag
  });
  this.cache[tag] = ann;
  return ann;
};

// Parse a message body from a RPC call with the provided parser.
AnnotationSync.prototype._parse = function (body) {
  var merged = Object.assign(this.cache[body.tag] || {}, body.msg);
  return this._tag(merged, body.tag);
};

// Format an annotation into an RPC message body with the provided formatter.
AnnotationSync.prototype._format = function (ann) {
  this._tag(ann);
  return {
    tag: ann.$tag,
    msg: ann
  };
};

module.exports = AnnotationSync;

},{}],44:[function(_dereq_,module,exports){
var $, Clipper, Readability, Sidebar, debounce, extend,
  extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

extend = _dereq_('extend');

debounce = _dereq_('lodash.debounce');

$ = _dereq_('jquery');

Sidebar = _dereq_('./sidebar');

Readability = _dereq_('../readability/Readability');

debounce = _dereq_('lodash.debounce');

module.exports = Clipper = (function(superClass) {
  var SHOW_CLIP_HIGHLIGHTS_CLASS;

  extend1(Clipper, superClass);

  SHOW_CLIP_HIGHLIGHTS_CLASS = 'clip-highlights-always-on';

  Clipper.prototype.options = {
    Document: {},
    TextSelection: {},
    BucketBar: {
      container: '.annotator-frame'
    },
    Toolbar: {
      container: '.annotator-frame'
    }
  };

  Clipper.prototype.documentClone = null;

  Clipper.prototype.article = null;

  Clipper.prototype.textNodes = [];

  function Clipper(element, config) {
    var clipper, clipperAppSrc, debouncedFunction, delay, handleMouseOver, mytimeOut, self, timeout;
    self = this;
    clipperAppSrc = config.clipperAppUrl;
    timeout = 300;
    mytimeOut = null;
    delay = function() {
      var args, fn, time;
      time = arguments[0], fn = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      return mytimeOut = setTimeout.apply(null, [fn, time].concat(slice.call(args)));
    };
    handleMouseOver = function(ev) {
      var range, sel;
      if (element.hasAttribute(SHOW_CLIP_HIGHLIGHTS_CLASS)) {
        ev.stopPropagation();
        ev.preventDefault();
        range = document.createRange();
        range.selectNodeContents(ev.target);
        sel = window.getSelection();
        sel.removeAllRanges();
        return sel.addRange(range);
      }
    };
    debouncedFunction = debounce(((function(_this) {
      return function(ev) {
        return handleMouseOver(ev);
      };
    })(this)), timeout);
    $(element).find('section,h2,h3,h4,h5,h6,p,td,pre,img').not('.annotator-adder-actions__button').hover(function(ev) {
      return debouncedFunction(ev);
    }, function(ev) {
      ev.stopPropagation();
      return ev.preventDefault();
    });
    clipper = $('<iframe></iframe>').attr('name', 'clipper_frame').attr('allowfullscreen', '').attr('seamless', '').attr('src', clipperAppSrc).addClass('clipper-iframe');
    this.clipperframe = $('<div></div>').addClass('clipper-frame clipper-collapsed');
    if (config.theme === 'clean') {
      this.clipperframe.addClass('annotator-frame--drop-shadow-enabled');
    }
    this.clipperframe.appendTo(element);
    this.documentClone = document.cloneNode(true);
    Clipper.__super__.constructor.apply(this, arguments);
    clipper.appendTo(this.clipperframe);
    this.hide();
    this._setupClipprEvents();
    this.getSimplifiedArticle();
  }

  Clipper.prototype._setupClipprEvents = function() {
    this.crossframe.on('showClipper', (function(_this) {
      return function() {
        return _this.showClipper();
      };
    })(this));
    this.crossframe.on('hideClipper', (function(_this) {
      return function() {
        return _this.hideClipper();
      };
    })(this));
    this.crossframe.on('getClip', (function(_this) {
      return function(options) {
        return _this.getClip(options);
      };
    })(this));
    return this;
  };

  Clipper.prototype.processArticle = function() {
    var h1, lengthSimilarRate, titlesMatch;
    h1 = $(this.article.content).find("h1");
    titlesMatch = false;
    if (h1.length === 1) {
      if (h1[0].textContent.toUpperCase() === this.article.title.toUpperCase()) {
        titlesMatch = true;
      } else {
        lengthSimilarRate = (this.article.title.length - h1[0].textContent.length) / h1[0].textContent.length;
        if (Math.abs(lengthSimilarRate) < 0.8) {
          if (lengthSimilarRate > 0) {
            titlesMatch = this.article.title.includes(h1[0].textContent);
          } else {
            titlesMatch = h1[0].textContent.includes(this.article.title);
          }
        }
      }
      if (titlesMatch) {
        return this.article.isTitleRequired = "false";
      }
    }
  };

  Clipper.prototype.getSimplifiedArticle = function(options) {
    var $content, article, docClone, e, i, len, ref, text;
    try {
      docClone = document.cloneNode(true);
      article = new Readability(docClone, options).parse();
      if (article) {
        this.article = article;
        this.article.url = document.URL;
        this.article.origin = window.location.origin;
        this.article.host = this._getHostName(document.URL);
        $content = $(this.article.content);
        $content.find("a").attr("target", "_blank");
        this.article.content = $content.html();
        this.article.isTitleRequired = "true";
        this.processArticle();
        $(document).find("[data-clipped='true']").removeAttr("data-clipped");
        this.textNodes = this.adderCtrl.getWebClipperAnchors($(this.article.content)[0], this.article.title);
        ref = this.textNodes;
        for (i = 0, len = ref.length; i < len; i++) {
          text = ref[i];
          this.anchorWebclip(text, "webclip-hl", {
            'data-clipped': 'true'
          });
        }
      }
    } catch (error) {
      e = error;
    }
    return this.article;
  };

  Clipper.prototype._getHostName = function(url) {
    var a;
    a = document.createElement('a');
    a.href = url;
    return a.hostname;
  };

  Clipper.prototype.showClipper = function() {
    var ref, ref1, session, shouldShowWebClipHighlights;
    session = this.adderCtrl.getSession();
    shouldShowWebClipHighlights = (ref = session && session.userid) != null ? ref : {
      "true": false
    };
    this.setClipVisibleHighlights(shouldShowWebClipHighlights);
    return (ref1 = this.crossframe) != null ? ref1.call('SimplifiedArticle', this.article) : void 0;
  };

  Clipper.prototype.hideClipper = function() {
    return this.setClipVisibleHighlights(false);
  };

  Clipper.prototype.isClipperOpen = function() {
    return !this.clipperframe.hasClass('clipper-collapsed');
  };

  Clipper.prototype.getClip = function(options) {
    var ref;
    this.getSimplifiedArticle(options);
    if ((ref = this.crossframe) != null) {
      ref.call('SimplifiedArticle', this.article);
    }
    return this.article;
  };

  Clipper.prototype.setClipVisibleHighlights = function(shouldShowWebClipHighlights) {
    if (shouldShowWebClipHighlights) {
      this.element.attr(SHOW_CLIP_HIGHLIGHTS_CLASS, "");
      return this.adderCtrl.enableClipperCommands();
    } else {
      this.element.removeAttr(SHOW_CLIP_HIGHLIGHTS_CLASS);
      return this.adderCtrl.disableClipperCommands();
    }
  };

  Clipper.prototype.destroy = function() {
    this.element.find('.webclip-hl').each(function() {
      $(this).contents().insertBefore(this);
      return $(this).remove();
    });
    this.clipperframe.remove();
    return Clipper.__super__.destroy.apply(this, arguments);
  };

  return Clipper;

})(Sidebar);


},{"../readability/Readability":79,"./sidebar":73,"extend":24,"jquery":"jquery","lodash.debounce":27}],45:[function(_dereq_,module,exports){
'use strict';

/**
 * Return an object containing config settings from window.hypothesisConfig().
 *
 * Return an object containing config settings returned by the
 * window.hypothesisConfig() function provided by the host page:
 *
 *   {
 *     fooSetting: 'fooValue',
 *     barSetting: 'barValue',
 *     ...
 *   }
 *
 * If there's no window.hypothesisConfig() function then return {}.
 *
 * @param {Window} window_ - The window to search for a hypothesisConfig() function
 * @return {Object} - Any config settings returned by hypothesisConfig()
 *
 */

function configFuncSettingsFrom(window_) {
  if (!window_.hasOwnProperty('hypothesisConfig')) {
    return {};
  }

  if (typeof window_.hypothesisConfig !== 'function') {
    var docs = 'https://h.readthedocs.io/projects/client/en/latest/publishers/config/#window.hypothesisConfig';
    console.warn('hypothesisConfig must be a function, see: ' + docs);
    return {};
  }

  return window_.hypothesisConfig();
}

module.exports = configFuncSettingsFrom;

},{}],46:[function(_dereq_,module,exports){
'use strict';

var settingsFrom = _dereq_('./settings');

/**
 * Reads the Hypothesis configuration from the environment.
 *
 * @param {Window} window_ - The Window object to read config from.
 */
function configFrom(window_) {
  var settings = settingsFrom(window_);
  return {
    annotations: settings.annotations,
    group: settings.group,
    client: settings.client,
    // URL where client assets are served from. Used when injecting the client
    // into child iframes.
    assetRoot: settings.hostPageSetting('assetRoot', { allowInBrowserExt: true }),
    branding: settings.hostPageSetting('branding'),
    // URL of the client's boot script. Used when injecting the client into
    // child iframes.
    clientUrl: settings.clientUrl,
    enableExperimentalNewNoteButton: settings.hostPageSetting('enableExperimentalNewNoteButton'),
    theme: settings.hostPageSetting('theme'),
    usernameUrl: settings.hostPageSetting('usernameUrl'),
    onLayoutChange: settings.hostPageSetting('onLayoutChange'),
    openSidebar: settings.hostPageSetting('openSidebar', { allowInBrowserExt: true }),
    query: settings.query,
    services: settings.hostPageSetting('services'),
    showHighlights: settings.showHighlights,
    sidebarAppUrl: settings.sidebarAppUrl,
    clipperAppUrl: settings.clipperAppUrl,
    // Subframe identifier given when a frame is being embedded into
    // by a top level client
    subFrameIdentifier: settings.hostPageSetting('subFrameIdentifier', { allowInBrowserExt: true })
  };
}

module.exports = configFrom;

},{"./settings":48}],47:[function(_dereq_,module,exports){
'use strict';

/**
 * Return true if the client is from a browser extension.
 *
 * @returns {boolean} true if this instance of the Hypothesis client is one
 *   distributed in a browser extension, false if it's one embedded in a
 *   website.
 *
 */

function isBrowserExtension(app) {
  return !(app.startsWith('http://') || app.startsWith('https://'));
}

module.exports = isBrowserExtension;

},{}],48:[function(_dereq_,module,exports){
'use strict';

var configFuncSettingsFrom = _dereq_('./config-func-settings-from');
var isBrowserExtension = _dereq_('./is-browser-extension');
var sharedSettings = _dereq_('../../shared/settings');

function settingsFrom(window_) {

  var jsonConfigs = sharedSettings.jsonConfigsFrom(window_.document);
  var configFuncSettings = configFuncSettingsFrom(window_);

  /**
   * Return the href URL of the first annotator sidebar link in the given document.
   *
   * Return the value of the href attribute of the first
   * `<link type="application/annotator+html" rel="sidebar">` element in the given document.
   *
   * This URL is used as the src of the sidebar's iframe.
   *
   * @return {string} - The URL to use for the sidebar's iframe.
   *
   * @throws {Error} - If there's no annotator link or the first annotator has
   *   no href.
   *
   */
  function sidebarAppUrl() {
    var link = window_.document.querySelector('link[type="application/annotator+html"][rel="sidebar"]');

    if (!link) {
      throw new Error('No application/annotator+html (rel="sidebar") link in the document');
    }

    if (!link.href) {
      throw new Error('application/annotator+html (rel="sidebar") link has no href');
    }

    return link.href;
  }

  /**
   * Return the href URL of the first annotator sidebar link in the given document.
   *
   * Return the value of the href attribute of the first
   * `<link type="application/annotator+html" rel="sidebar">` element in the given document.
   *
   * This URL is used as the src of the sidebar's iframe.
   *
   * @return {string} - The URL to use for the sidebar's iframe.
   *
   * @throws {Error} - If there's no annotator link or the first annotator has
   *   no href.
   *
   */
  function clipperAppUrl() {
    var link = window_.document.querySelector('link[type="application/annotator+html"][rel="clipper"]');

    if (!link) {
      //throw new Error('No application/annotator+html (rel="clipper") link in the document');
      return null;
    }

    if (!link.href) {
      //throw new Error('application/annotator+html (rel="clipper") link has no href');
      return null;
    }

    return link.href;
  }

  /**
   * Return the href URL of the first annotator client link in the given document.
   *
   * Return the value of the href attribute of the first
   * `<link type="application/annotator+html" rel="hypothesis-client">` element in the given document.
   *
   * This URL is used to identify where the client is from and what url should be
   *    used inside of subframes
   *
   * @return {string} - The URL that the client is hosted from
   *
   * @throws {Error} - If there's no annotator link or the first annotator has
   *   no href.
   *
   */
  function clientUrl() {
    var link = window_.document.querySelector('link[type="application/annotator+javascript"][rel="hypothesis-client"]');

    if (!link) {
      throw new Error('No application/annotator+javascript (rel="hypothesis-client") link in the document');
    }

    if (!link.href) {
      throw new Error('application/annotator+javascript (rel="hypothesis-client") link has no href');
    }

    return link.href;
  }

  /**
   * Return the `#annotations:*` ID from the given URL's fragment.
   *
   * If the URL contains a `#annotations:<ANNOTATION_ID>` fragment then return
   * the annotation ID extracted from the fragment. Otherwise return `null`.
   *
   * @return {string|null} - The extracted ID, or null.
   */
  function annotations() {

    /** Return the annotations from the URL, or null. */
    function annotationsFromURL() {
      // Annotation IDs are url-safe-base64 identifiers
      // See https://tools.ietf.org/html/rfc4648#page-7
      var annotFragmentMatch = window_.location.href.match(/#webannotations:([A-Za-z0-9_-]+)/);
      if (annotFragmentMatch) {
        return annotFragmentMatch[1];
      }
      return null;
    }

    return jsonConfigs.annotations || annotationsFromURL();
  }

  function group() {

    /** Return the annotations from the URL, or null. */
    function groupFromURL() {
      // Annotation IDs are url-safe-base64 identifiers
      // See https://tools.ietf.org/html/rfc4648#page-7
      var annotFragmentMatch = window_.location.href.match(/#group:([A-Za-z0-9_-]+)/);
      if (annotFragmentMatch) {
        return annotFragmentMatch[1];
      }
      return null;
    }

    return jsonConfigs.group || groupFromURL();
  }

  function client() {

    /** Return the annotations from the URL, or null. */
    function clientFromURL() {
      // Annotation IDs are url-safe-base64 identifiers
      // See https://tools.ietf.org/html/rfc4648#page-7
      var annotFragmentMatch = window_.location.href.match(/#client:([A-Za-z0-9_-]+)/);
      if (annotFragmentMatch) {
        return annotFragmentMatch[1];
      }
      return null;
    }

    return jsonConfigs.client || clientFromURL();
  }

  function showHighlights() {
    var showHighlights_ = hostPageSetting('showHighlights');

    if (showHighlights_ === null) {
      showHighlights_ = 'always'; // The default value is 'always'.
    }

    // Convert legacy keys/values to corresponding current configuration.
    if (typeof showHighlights_ === 'boolean') {
      return showHighlights_ ? 'always' : 'never';
    }

    return showHighlights_;
  }

  /**
   * Return the config.query setting from the host page or from the URL.
   *
   * If the host page contains a js-hypothesis-config script containing a
   * query setting then return that.
   *
   * Otherwise if the host page's URL has a `#annotations:query:*` (or
   * `#annotations:q:*`) fragment then return the query value from that.
   *
   * Otherwise return null.
   *
   * @return {string|null} - The config.query setting, or null.
   */
  function query() {

    /** Return the query from the URL, or null. */
    function queryFromURL() {
      var queryFragmentMatch = window_.location.href.match(/#webannotations:(query|q):(.+)$/i);
      if (queryFragmentMatch) {
        try {
          return decodeURIComponent(queryFragmentMatch[2]);
        } catch (err) {
          // URI Error should return the page unfiltered.
        }
      }
      return null;
    }

    return jsonConfigs.query || queryFromURL();
  }

  function hostPageSetting(name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var allowInBrowserExt = options.allowInBrowserExt || false;
    var hasDefaultValue = typeof options.defaultValue !== 'undefined';

    if (!allowInBrowserExt && isBrowserExtension(sidebarAppUrl())) {
      return hasDefaultValue ? options.defaultValue : null;
    }

    if (configFuncSettings.hasOwnProperty(name)) {
      return configFuncSettings[name];
    }

    if (jsonConfigs.hasOwnProperty(name)) {
      return jsonConfigs[name];
    }

    if (hasDefaultValue) {
      return options.defaultValue;
    }

    return null;
  }

  return {
    get annotations() {
      return annotations();
    },
    get clientUrl() {
      return clientUrl();
    },
    get showHighlights() {
      return showHighlights();
    },
    get sidebarAppUrl() {
      return sidebarAppUrl();
    },
    get clipperAppUrl() {
      return clipperAppUrl();
    },
    get query() {
      return query();
    },
    get group() {
      return group();
    },
    get client() {
      return client();
    },
    hostPageSetting: hostPageSetting
  };
}

module.exports = settingsFrom;

},{"../../shared/settings":84,"./config-func-settings-from":45,"./is-browser-extension":47}],49:[function(_dereq_,module,exports){
var $, Delegator,
  slice = [].slice,
  hasProp = {}.hasOwnProperty;

$ = _dereq_('jquery');


/*
** Adapted from:
** https://github.com/openannotation/annotator/blob/v1.2.x/src/class.coffee
**
** Annotator v1.2.10
** https://github.com/openannotation/annotator
**
** Copyright 2015, the Annotator project contributors.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/openannotation/annotator/blob/master/LICENSE
 */

module.exports = Delegator = (function() {
  Delegator.prototype.events = {};

  Delegator.prototype.options = {};

  Delegator.prototype.element = null;

  function Delegator(element, config) {
    this.options = $.extend(true, {}, this.options, config);
    this.element = $(element);
    this._closures = {};
    this.on = this.subscribe;
    this.addEvents();
  }

  Delegator.prototype.destroy = function() {
    return this.removeEvents();
  };

  Delegator.prototype.addEvents = function() {
    var event, i, len, ref, results;
    ref = Delegator._parseEvents(this.events);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      results.push(this._addEvent(event.selector, event.event, event.functionName));
    }
    return results;
  };

  Delegator.prototype.removeEvents = function() {
    var event, i, len, ref, results;
    ref = Delegator._parseEvents(this.events);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      results.push(this._removeEvent(event.selector, event.event, event.functionName));
    }
    return results;
  };

  Delegator.prototype._addEvent = function(selector, event, functionName) {
    var closure;
    closure = (function(_this) {
      return function() {
        return _this[functionName].apply(_this, arguments);
      };
    })(this);
    if (selector === '' && Delegator._isCustomEvent(event)) {
      this.subscribe(event, closure);
    } else {
      this.element.delegate(selector, event, closure);
    }
    this._closures[selector + "/" + event + "/" + functionName] = closure;
    return this;
  };

  Delegator.prototype._removeEvent = function(selector, event, functionName) {
    var closure;
    closure = this._closures[selector + "/" + event + "/" + functionName];
    if (selector === '' && Delegator._isCustomEvent(event)) {
      this.unsubscribe(event, closure);
    } else {
      this.element.undelegate(selector, event, closure);
    }
    delete this._closures[selector + "/" + event + "/" + functionName];
    return this;
  };

  Delegator.prototype.publish = function() {
    this.element.triggerHandler.apply(this.element, arguments);
    return this;
  };

  Delegator.prototype.subscribe = function(event, callback) {
    var closure;
    closure = function() {
      return callback.apply(this, [].slice.call(arguments, 1));
    };
    closure.guid = callback.guid = ($.guid += 1);
    this.element.bind(event, closure);
    return this;
  };

  Delegator.prototype.unsubscribe = function() {
    this.element.unbind.apply(this.element, arguments);
    return this;
  };

  return Delegator;

})();

Delegator._parseEvents = function(eventsObj) {
  var event, events, functionName, i, ref, sel, selector;
  events = [];
  for (sel in eventsObj) {
    functionName = eventsObj[sel];
    ref = sel.split(' '), selector = 2 <= ref.length ? slice.call(ref, 0, i = ref.length - 1) : (i = 0, []), event = ref[i++];
    events.push({
      selector: selector.join(' '),
      event: event,
      functionName: functionName
    });
  }
  return events;
};

Delegator.natives = (function() {
  var key, specials, val;
  specials = (function() {
    var ref, results;
    ref = $.event.special;
    results = [];
    for (key in ref) {
      if (!hasProp.call(ref, key)) continue;
      val = ref[key];
      results.push(key);
    }
    return results;
  })();
  return "blur focus focusin focusout load resize scroll unload click dblclick\nmousedown mouseup mousemove mouseover mouseout mouseenter mouseleave\nchange select submit keydown keypress keyup error".split(/[^a-z]+/).concat(specials);
})();

Delegator._isCustomEvent = function(event) {
  event = event.split('.')[0];
  return $.inArray(event, Delegator.natives) === -1;
};


},{"jquery":"jquery"}],50:[function(_dereq_,module,exports){
'use strict';

function isAllowedElement(node) {
		if (allowedElements().indexOf(node.tagName) == -1) {
				return false;
		}
		return true;
}

function allowedElements() {
		return ["IMG", "CANVAS", "TABLE"];
}

module.exports = {
		isAllowedElement: isAllowedElement,
		allowedElements: allowedElements
};

},{}],51:[function(_dereq_,module,exports){
'use strict';

var events = _dereq_('../shared/bridge-events');

var _features = {};

var _set = function _set(features) {
  _features = features || {};
};

module.exports = {

  init: function init(crossframe) {
    crossframe.on(events.FEATURE_FLAGS_UPDATED, _set);
  },

  reset: function reset() {
    _set({});
  },

  flagEnabled: function flagEnabled(flag) {
    if (!(flag in _features)) {
      console.warn('looked up unknown feature', flag);
      return false;
    }
    return _features[flag];
  }

};

},{"../shared/bridge-events":80}],52:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FrameUtil = _dereq_('./util/frame-util');
var debounce = _dereq_('lodash.debounce');

// Find difference of two arrays
var difference = function difference(arrayA, arrayB) {
  return arrayA.filter(function (x) {
    return !arrayB.includes(x);
  });
};

var DEBOUNCE_WAIT = 40;

var FrameObserver = function () {
  function FrameObserver(target) {
    var _this = this;

    _classCallCheck(this, FrameObserver);

    this._target = target;
    this._handledFrames = [];

    this._mutationObserver = new MutationObserver(debounce(function () {
      _this._discoverFrames();
    }, DEBOUNCE_WAIT));
  }

  _createClass(FrameObserver, [{
    key: 'observe',
    value: function observe(onFrameAddedCallback, onFrameRemovedCallback) {
      this._onFrameAdded = onFrameAddedCallback;
      this._onFrameRemoved = onFrameRemovedCallback;

      this._discoverFrames();
      this._mutationObserver.observe(this._target, {
        childList: true,
        subtree: true
      });
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._mutationObserver.disconnect();
    }
  }, {
    key: '_addFrame',
    value: function _addFrame(frame) {
      var _this2 = this;

      if (FrameUtil.isAccessible(frame)) {
        FrameUtil.isDocumentReady(frame, function () {
          frame.contentWindow.addEventListener('unload', function () {
            _this2._removeFrame(frame);
          });
          _this2._handledFrames.push(frame);
          _this2._onFrameAdded(frame);
        });
      } else {
        // Could warn here that frame was not cross origin accessible
      }
    }
  }, {
    key: '_removeFrame',
    value: function _removeFrame(frame) {
      this._onFrameRemoved(frame);

      // Remove the frame from our list
      this._handledFrames = this._handledFrames.filter(function (x) {
        return x !== frame;
      });
    }
  }, {
    key: '_discoverFrames',
    value: function _discoverFrames() {
      var frames = FrameUtil.findFrames(this._target);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = frames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var frame = _step.value;

          if (!this._handledFrames.includes(frame)) {
            this._addFrame(frame);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = difference(this._handledFrames, frames)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _frame = _step2.value;

          this._removeFrame(_frame);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }]);

  return FrameObserver;
}();

FrameObserver.DEBOUNCE_WAIT = DEBOUNCE_WAIT;

module.exports = FrameObserver;

},{"./util/frame-util":75,"lodash.debounce":27}],53:[function(_dereq_,module,exports){
'use strict';

var $ = _dereq_('jquery');

module.exports = function () {
	var GS_SOURCE_URL = '.gs_or_ggsm a';
	var GS_ROOT = '.gs_ri';
	var GS_HEADER = '.gs_rt a';
	var GS_APYW = '.gs_a'; // AUTHOR, PUBLICATION, YEAR OF PUBLICATION, WEBSITE OF PUBLICATION
	var GS_DESCRIPTION = '.gs_rs'; // 
	var GS_FOOTER = '.gs_fl a'; // Cited by URL,Related Articles , All versions 

	var GS_CITE_TABLE = '#gs_citt'; // Cite table
	var GS_CITE_TH = '.gs_cith'; // Cite key 
	var GS_CITE_TR = '.gs_citr'; // Cite value
	var GS_CITE_LINKS = 'a.gs_citi'; // Cite links 

	var metaKeyPrefix = "GS_";

	function getSourceUrlInfo(gs) {
		var obj = {};
		var sourceAnchor = gs.find(GS_SOURCE_URL);
		if (sourceAnchor.length == 1) {
			var sourceText = sourceAnchor.text();
			if (sourceText && sourceText.includes('[PDF]')) {
				obj[metaKeyPrefix + "sourceUrl"] = sourceAnchor[0].href;
				obj[metaKeyPrefix + "sourceUrlText"] = sourceText;
			}
		}

		return obj;
	}

	function getUrlInfo(gs) {
		var obj = {};
		var titleAnchor = gs.find(GS_HEADER);
		if (titleAnchor.length == 1) {
			obj[metaKeyPrefix + "title"] = titleAnchor.text();
			obj[metaKeyPrefix + "url"] = titleAnchor[0].href;
			obj[metaKeyPrefix + "publicationWebsite"] = titleAnchor[0].hostname;
		}

		return obj;
	}

	function getDescription(gs) {
		var obj = {};
		var desEl = gs.find(GS_DESCRIPTION);
		if (desEl.length == 1) {
			obj[metaKeyPrefix + "description"] = desEl.text();
		}

		return obj;
	}

	function getCitationInfo(gs) {
		var obj = {};
		var gs_aEl = gs.find(GS_APYW);
		if (gs_aEl.length == 1) {
			var gsAText = gs_aEl.text();
			if (gsAText) {
				if (gsAText.includes('-')) {
					var apyw = gsAText.split('-');
					if (apyw.length > 0) {
						for (var i = 0; i < apyw.length; i++) {
							if (i == 0) {
								obj[metaKeyPrefix + "Authors"] = apyw[i];
							}

							if (i == 1) {
								var yearOfPublication = apyw[i].match(/\d{4}/);
								if (yearOfPublication) {
									obj[metaKeyPrefix + "YearOfPublication"] = yearOfPublication[0];
								}
							}

							if (i == 2) {
								obj[metaKeyPrefix + "Publication"] = apyw[i];
							}
						}
					}
				}
			}
		}

		return obj;
	}

	function getRelatedCitationInfo(gs) {
		var footerAnchors = gs.find(GS_FOOTER);
		var obj = {};
		if (footerAnchors.length > 0) {
			footerAnchors.each(function (index, element) {
				var href = $(element).attr('href');
				if (href && href.includes('cites=')) {
					var citedByText = $(element).text();
					obj[metaKeyPrefix + "CitedByUrl"] = element.href;
					if (citedByText) {
						var citations = citedByText.match(/\d+/);
						if (citations) {
							obj[metaKeyPrefix + "Citations"] = citations[0];
						}
					}
				}

				if (href && href.includes('related:')) {
					obj[metaKeyPrefix + "RelatedArticles"] = element.href;
				}

				if (href && href.includes('cluster=')) {
					var versionsText = $(element).text();
					obj[metaKeyPrefix + "AllVersionsUrl"] = element.href;
					if (versionsText) {
						var noOfVersions = versionsText.match(/\d+/);
						if (noOfVersions) {
							obj[metaKeyPrefix + "NoOfVersions"] = noOfVersions[0];
						}
					}
				}
			});
		}

		return obj;
	}

	function getCiteUrl(gs) {
		var protocol = window.location.protocol + "//";
		var host = window.location.hostname + "/scholar?";
		var params = {
			"q": "info:" + gs.attr('data-cid') + ":scholar.google.com/",
			"output": "cite"
		};

		return protocol + host + $.param(params);
	}

	function getCite(gs) {
		var url = getCiteUrl(gs);
		return fetch(url).then(function (res) {
			return res.text();
		}).then(function (data) {
			if (data && data.length > 0) {
				var $citeTable, $citeRow, $citeLinks;
				var citationMetaData = {};
				var citationLinks = {};

				var $citD = $('<div></div>');
				$citD.append(data);

				$citeTable = $citD.find(GS_CITE_TABLE);
				$citeLinks = $citD.find(GS_CITE_LINKS);

				if ($citeTable.length > 0) {
					$citeRow = $citeTable.find('tbody tr');
					$citeRow.each(function (index, tr) {
						var key = $(tr).find(GS_CITE_TH).text();
						var val = $(tr).find(GS_CITE_TR).text();
						if (key && val) {
							citationMetaData[key.trim()] = val.trim();
						}
					});
				}

				if ($citeLinks.length > 0) {
					$citeLinks.each(function (index, a) {
						var href = $(a).attr('href');
						if (href) {
							var key = $(a).text();
							var val = a.href;
							if (key && val) {
								citationLinks[key.trim()] = val;
							}
						}
					});
				}

				$citD.find("#gs_citi").css("height", "40px");
				$citD.find("#gs_citi").css("lineHeight", "40px");
				$citD.find("#gs_citi").css("borderTop", "1px solid #ccc");
				$citD.find("#gs_citi").css("textAlign", "center");

				$citD.find('a').each(function (index, element) {
					$(element).attr("target", "_blank");
					$(element).css("display", "block");
					$(element).css("textDecoration", "none");
					$(element).css("color", "#069");
					$(element).css("padding", "0px 10px");
					$(element).css("whiteSpace", "nowrap");
					$(element).css("overflow", "hidden");
					$(element).css("textOverflow", "ellipsis");
					$(element).css("paddingLeft", "0px");
					$(element).wrap('<div style="width: 25%;float: left;height: 40px;line-height: 40px;text-align: center;"></div>');
				});
				return {
					"citationMetaData": citationMetaData,
					"citationLinks": citationLinks,
					"citationHtml": $citD.html()
				};
			} else {
				return null;
			}
		}).catch(function (error) {
			return null;
		});
	}

	function getMetaInfoFromScholar(gs) {
		var info = {};
		var urlInfo = getUrlInfo(gs);
		var description = getDescription(gs);
		var citationInfo = getCitationInfo(gs);
		var relatedCitationInfo = getRelatedCitationInfo(gs);
		var sourceUrlInfo = getSourceUrlInfo(gs);

		return $.extend(info, urlInfo, description, citationInfo, relatedCitationInfo, sourceUrlInfo);
	}

	return {
		getMetaInfoFromScholar: getMetaInfoFromScholar,
		prefix: metaKeyPrefix,
		getCite: getCite
	};
}();

},{"jquery":"jquery"}],54:[function(_dereq_,module,exports){
var $, CustomEvent, Delegator, Guest, adder, animationPromise, debounce, elementFilter, extend, gsmetaInfo, highlighter, normalizeURI, raf, rangeUtil, scrollIntoView, selections, urlChanges, xpathRange,
  extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

extend = _dereq_('extend');

raf = _dereq_('raf');

scrollIntoView = _dereq_('scroll-into-view');

CustomEvent = _dereq_('custom-event');

Delegator = _dereq_('./delegator');

$ = _dereq_('jquery');

adder = _dereq_('./adder');

highlighter = _dereq_('./highlighter');

rangeUtil = _dereq_('./range-util');

selections = _dereq_('./selections');

xpathRange = _dereq_('./anchoring/range');

normalizeURI = _dereq_('./util/url').normalizeURI;

urlChanges = _dereq_('./url-changes');

debounce = _dereq_('lodash.debounce');

elementFilter = _dereq_('./element-filters');

gsmetaInfo = _dereq_('./gs-extractor');

animationPromise = function(fn) {
  return new Promise(function(resolve, reject) {
    return raf(function() {
      var error;
      try {
        return resolve(fn());
      } catch (error1) {
        error = error1;
        return reject(error);
      }
    });
  });
};

module.exports = Guest = (function(superClass) {
  var GS_OR_SAVE, HTML_OBJECTS, SHOW_HIGHLIGHTS_CLASS;

  extend1(Guest, superClass);

  SHOW_HIGHLIGHTS_CLASS = 'annotator-highlights-always-on';

  HTML_OBJECTS = elementFilter.allowedElements().join(",");

  GS_OR_SAVE = "a.gs_or_sav[title='Save'][role='button']";

  Guest.prototype.events = {
    ".annotator-hl click": "onHighlightClick",
    ".annotator-hl mouseover": "onHighlightMouseover",
    ".annotator-hl mouseout": "onHighlightMouseout",
    "click": "onElementClick",
    "touchstart": "onElementTouchStart"
  };

  Guest.prototype.options = {
    Document: {},
    TextSelection: {}
  };

  Guest.prototype.anchoring = _dereq_('./anchoring/html');

  Guest.prototype.plugins = null;

  Guest.prototype.anchors = null;

  Guest.prototype.visibleHighlights = false;

  Guest.prototype.frameIdentifier = null;

  Guest.prototype.documentObserver = null;

  Guest.prototype.htmlObjectAnntoations = false;

  Guest.prototype.htmlObjectAnntoationsKey = "htmlObjectAnntoationsKey";

  Guest.prototype.html = {
    adder: '<hypothesis-adder></hypothesis-adder>'
  };

  function Guest(element, config) {
    var cfOptions, debouncedFunction, name, opts, ref, self;
    Guest.__super__.constructor.apply(this, arguments);
    self = this;
    this.adder = $(this.html.adder).appendTo(this.element).hide();
    self.addIdToCanvasElements();
    this.adderCtrl = new adder.Adder(this.adder[0], {
      onAnnotate: function() {
        self.createAnnotation(null, document.getSelection());
        return document.getSelection().removeAllRanges();
      },
      onHighlight: function() {
        self.setVisibleHighlights(true);
        self.createHighlight(document.getSelection());
        return document.getSelection().removeAllRanges();
      },
      onInclude: function() {
        self.includeSelection();
        return document.getSelection().removeAllRanges();
      },
      onExclude: function() {
        self.excludeSelection();
        return document.getSelection().removeAllRanges();
      },
      onLogin: function() {
        return self.requestLogin();
      },
      onGroupChange: function() {
        return self.requestGroupChange();
      }
    });
    this.adderCtrl.disableClipperCommands();
    this.selections = selections(document).subscribe({
      next: function(range) {
        if (range) {
          return self._onSelection(range);
        } else {
          return self._onClearSelection();
        }
      }
    });
    this.plugins = {};
    this.anchors = [];
    this.frameIdentifier = config.subFrameIdentifier || null;
    cfOptions = {
      config: config,
      on: (function(_this) {
        return function(event, handler) {
          return _this.subscribe(event, handler);
        };
      })(this),
      emit: (function(_this) {
        return function() {
          var args, event;
          event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          return _this.publish(event, args);
        };
      })(this)
    };
    this.addPlugin('CrossFrame', cfOptions);
    this.crossframe = this.plugins.CrossFrame;
    this.crossframe.onConnect((function(_this) {
      return function() {
        return _this._setupInitialState(config);
      };
    })(this));
    this._connectAnnotationSync(this.crossframe);
    this._connectAnnotationUISync(this.crossframe);
    ref = this.options;
    for (name in ref) {
      if (!hasProp.call(ref, name)) continue;
      opts = ref[name];
      if (!this.plugins[name] && this.options.pluginClasses[name]) {
        this.addPlugin(name, opts);
      }
    }
    this.urlChanges = urlChanges(this.plugins.Document).subscribe({
      next: (function(_this) {
        return function(url) {
          return _this.crossframe.call('urlChanged', url);
        };
      })(this)
    });
    debouncedFunction = debounce(((function(_this) {
      return function(mutations) {
        var anchor, i, len, ref1;
        self.enableOrDisableHtmlObjectAnnotaion(self.htmlObjectAnntoations, false);
        self.addIdToCanvasElements();
        self.attachEventToGoogleScholarSave();
        try {
          ref1 = self.anchors;
          for (i = 0, len = ref1.length; i < len; i++) {
            anchor = ref1[i];
            if (anchor.annotation.$orphan) {
              self.anchor(anchor.annotation);
            }
          }
        } catch (error1) {

        }
      };
    })(this)), 1000);
    this.documentObserver = new MutationObserver((function(_this) {
      return function(mutations) {
        return debouncedFunction(mutations);
      };
    })(this));
    this.documentObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    this.crossframe.on('HTML_OBJ_ANNOTATIONS', (function(_this) {
      return function(enable) {
        if (enable === 'true') {
          return self.enableOrDisableHtmlObjectAnnotaion(true, false);
        } else {
          return self.enableOrDisableHtmlObjectAnnotaion(false, false);
        }
      };
    })(this));
  }

  Guest.prototype.handleMouseOver = function(ev) {
    var range, sel;
    sel = document.getSelection();
    sel.removeAllRanges();
    ev.stopPropagation();
    ev.preventDefault();
    range = document.createRange();
    if (ev.currentTarget.nodeName === "CANVAS" && $(ev.currentTarget).siblings("canvas").length > 0) {
      range.selectNode(ev.target.parentElement);
    } else {
      range.selectNode(ev.currentTarget);
    }
    self.selectedRanges = [range];
    return sel.addRange(range);
  };

  Guest.prototype.saveGSWebResource = function(ev) {
    var addToTaskSpace, doc, gsInfo, gsInfoEl, prefix, self;
    self = this;
    prefix = gsmetaInfo.prefix;
    doc = {};
    addToTaskSpace = function(cite) {
      var ref;
      if (cite) {
        doc["citations"] = cite;
      }
      console.log(doc);
      self.publish('addToTaskSpace', [doc]);
      return (ref = self.crossframe) != null ? ref.call('showSidebar') : void 0;
    };
    gsInfoEl = $(ev.currentTarget).closest('[data-rp]');
    if (gsInfoEl.length > 0) {
      gsInfo = gsmetaInfo.getMetaInfoFromScholar(gsInfoEl);
      doc.isGoogleScholarResource = true;
      doc.document = {
        title: gsInfo[prefix + "title"],
        uri: gsInfo[prefix + "url"]
      };
      doc.uri = gsInfo[prefix + "url"];
      doc.googleScholarMetaInfo = gsInfo;
      gsmetaInfo.getCite(gsInfoEl).then(addToTaskSpace);
    }
  };

  Guest.prototype.addIdToCanvasElements = function() {
    var canvasEls;
    canvasEls = $(document).find("canvas");
    if (canvasEls.length > 0) {
      return canvasEls.each((function(_this) {
        return function(index, element) {
          $(element).attr("data-hid", index);
        };
      })(this));
    }
  };

  Guest.prototype.attachEventToGoogleScholarSave = function() {
    var debouncedFunction, self, timeout;
    self = this;
    timeout = 2000;
    debouncedFunction = debounce(((function(_this) {
      return function(ev) {
        return self.saveGSWebResource(ev);
      };
    })(this)), timeout);
    if (document.URL.indexOf('https://scholar.google') > -1) {
      $(GS_OR_SAVE).off("click");
      return $(GS_OR_SAVE).on("click", function(ev) {
        return debouncedFunction(ev);
      });
    }
  };

  Guest.prototype.attachEventToHtmlObjects = function() {
    var debouncedFunction, self, timeout;
    self = this;
    timeout = 1000;
    debouncedFunction = debounce(((function(_this) {
      return function(ev) {
        return self.handleMouseOver(ev);
      };
    })(this)), timeout);
    return $(HTML_OBJECTS).on("mouseover", function(ev) {
      return debouncedFunction(ev);
    });
  };

  Guest.prototype.removeEventToHtmlObjects = function() {
    return $(HTML_OBJECTS).off("mouseover");
  };

  Guest.prototype.enableOrDisableHtmlObjectAnnotaion = function(enable, removeRanges) {
    var sel;
    this.htmlObjectAnntoations = enable;
    this.removeEventToHtmlObjects();
    sel = document.getSelection();
    if (removeRanges) {
      sel.removeAllRanges();
      this.crossframe.call('HTML_OBJ_ANNOTATIONS', enable);
    }
    if (enable) {
      this.attachEventToHtmlObjects();
      if (this.plugins.Toolbar != null) {
        return this.plugins.Toolbar.enableObjectAnnotations();
      }
    } else if (this.plugins.Toolbar != null) {
      return this.plugins.Toolbar.disableObjectAnnotations();
    }
  };

  Guest.prototype.addPlugin = function(name, options) {
    var base, klass;
    if (this.plugins[name]) {
      console.error("You cannot have more than one instance of any plugin.");
    } else {
      klass = this.options.pluginClasses[name];
      if (typeof klass === 'function') {
        this.plugins[name] = new klass(this.element[0], options);
        this.plugins[name].annotator = this;
        this.plugins[name].clipper = this;
        if (typeof (base = this.plugins[name]).pluginInit === "function") {
          base.pluginInit();
        }
      } else {
        console.error("Could not load " + name + " plugin. Have you included the appropriate <script> tag?");
      }
    }
    return this;
  };

  Guest.prototype.getDocumentInfo = function() {
    var metadataPromise, uriPromise;
    if (this.plugins.PDF != null) {
      metadataPromise = Promise.resolve(this.plugins.PDF.getMetadata());
      uriPromise = Promise.resolve(this.plugins.PDF.uri());
    } else if (this.plugins.Document != null) {
      uriPromise = Promise.resolve(this.plugins.Document.uri());
      metadataPromise = Promise.resolve(this.plugins.Document.metadata);
    } else {
      uriPromise = Promise.reject();
      metadataPromise = Promise.reject();
    }
    uriPromise = uriPromise["catch"](function() {
      return decodeURIComponent(window.location.href);
    });
    metadataPromise = metadataPromise["catch"](function() {
      return {
        title: document.title,
        link: [
          {
            href: decodeURIComponent(window.location.href)
          }
        ]
      };
    });
    return Promise.all([metadataPromise, uriPromise]).then((function(_this) {
      return function(arg) {
        var href, metadata;
        metadata = arg[0], href = arg[1];
        return {
          uri: normalizeURI(href),
          metadata: metadata,
          frameIdentifier: _this.frameIdentifier
        };
      };
    })(this));
  };

  Guest.prototype._setupInitialState = function(config) {
    this.publish('panelReady');
    return this.setVisibleHighlights(config.showHighlights === 'always');
  };

  Guest.prototype._connectAnnotationSync = function(crossframe) {
    this.subscribe('annotationDeleted', (function(_this) {
      return function(annotation) {
        return _this.detach(annotation);
      };
    })(this));
    return this.subscribe('annotationsLoaded', (function(_this) {
      return function(annotations) {
        var annotation, i, len, results;
        results = [];
        for (i = 0, len = annotations.length; i < len; i++) {
          annotation = annotations[i];
          results.push(_this.anchor(annotation));
        }
        return results;
      };
    })(this));
  };

  Guest.prototype._connectAnnotationUISync = function(crossframe) {
    crossframe.on('focusAnnotations', (function(_this) {
      return function(tags) {
        var anchor, i, len, ref, ref1, results, toggle;
        if (tags == null) {
          tags = [];
        }
        ref = _this.anchors;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          anchor = ref[i];
          if (!(anchor.highlights != null)) {
            continue;
          }
          toggle = (ref1 = anchor.annotation.$tag, indexOf.call(tags, ref1) >= 0);
          results.push($(anchor.highlights).toggleClass('annotator-hl-focused', toggle));
        }
        return results;
      };
    })(this));
    crossframe.on('setSession', (function(_this) {
      return function(session) {
        return _this.adderCtrl.setSession(session);
      };
    })(this));
    crossframe.on('setGroup', (function(_this) {
      return function(group) {
        return _this.adderCtrl.setGroup(group);
      };
    })(this));
    crossframe.on('scrollToAnnotation', (function(_this) {
      return function(tag) {
        var anchor, defaultNotPrevented, event, i, len, ref, results;
        ref = _this.anchors;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          anchor = ref[i];
          if (anchor.highlights != null) {
            if (anchor.annotation.$tag === tag) {
              event = new CustomEvent('scrolltorange', {
                bubbles: true,
                cancelable: true,
                detail: anchor.range
              });
              defaultNotPrevented = _this.element[0].dispatchEvent(event);
              if (defaultNotPrevented) {
                results.push(scrollIntoView(anchor.highlights[0]));
              } else {
                results.push(void 0);
              }
            } else {
              results.push(void 0);
            }
          }
        }
        return results;
      };
    })(this));
    crossframe.on('getDocumentInfo', (function(_this) {
      return function(cb) {
        return _this.getDocumentInfo().then(function(info) {
          return cb(null, info);
        })["catch"](function(reason) {
          return cb(reason);
        });
      };
    })(this));
    return crossframe.on('setVisibleHighlights', (function(_this) {
      return function(state) {
        return _this.setVisibleHighlights(state);
      };
    })(this));
  };

  Guest.prototype.destroy = function() {
    var name, plugin, ref;
    $('#annotator-dynamic-style').remove();
    $(GS_OR_SAVE).off("click");
    this.removeEventToHtmlObjects();
    this.selections.unsubscribe();
    this.urlChanges.unsubscribe();
    this.adder.remove();
    this.documentObserver.disconnect();
    this.element.find('.annotator-hl').each(function() {
      $(this).contents().insertBefore(this);
      return $(this).remove();
    });
    this.element.data('annotator', null);
    ref = this.plugins;
    for (name in ref) {
      plugin = ref[name];
      this.plugins[name].destroy();
    }
    return Guest.__super__.destroy.apply(this, arguments);
  };

  Guest.prototype.anchor = function(annotation, type, include) {
    var anchor, anchoredTargets, anchors, deadHighlights, highlight, i, j, len, len1, locate, ref, ref1, ref2, root, self, sync, target;
    self = this;
    root = this.element[0];
    anchors = [];
    anchoredTargets = [];
    deadHighlights = [];
    if (annotation.target == null) {
      annotation.target = [];
    }
    locate = function(target) {
      var options, ref;
      if (!((ref = target.selector) != null ? ref : []).some((function(_this) {
        return function(s) {
          return s.type === 'TextQuoteSelector' || s.type === 'ImageSelector';
        };
      })(this))) {
        return Promise.resolve({
          annotation: annotation,
          target: target
        });
      }
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="annotator-"]'
      };
      return self.anchoring.anchor(root, target.selector, options).then(function(range) {
        return {
          annotation: annotation,
          target: target,
          range: range
        };
      })["catch"](function() {
        return {
          annotation: annotation,
          target: target
        };
      });
    };
    highlight = function(anchor) {
      if (anchor.range == null) {
        return anchor;
      }
      return animationPromise(function() {
        var highlights, normedRange, range;
        if (anchor.range.type === "ImageAnchor") {
          highlights = highlighter.highlightRange(anchor.range, type, include);
        } else {
          range = xpathRange.sniff(anchor.range);
          normedRange = range.normalize(root);
          highlights = highlighter.highlightRange(normedRange, type, include);
        }
        $(highlights).data('annotation', anchor.annotation);
        anchor.highlights = highlights;
        return anchor;
      });
    };
    sync = function(anchors) {
      var anchor, hasAnchorableTargets, hasAnchoredTargets, i, len, ref, ref1;
      hasAnchorableTargets = false;
      hasAnchoredTargets = false;
      for (i = 0, len = anchors.length; i < len; i++) {
        anchor = anchors[i];
        if (anchor.target.selector != null) {
          hasAnchorableTargets = true;
          if (anchor.range != null) {
            hasAnchoredTargets = true;
            break;
          }
        }
      }
      annotation.$orphan = hasAnchorableTargets && !hasAnchoredTargets;
      self.anchors = self.anchors.concat(anchors);
      if ((ref = self.plugins.BucketBar) != null) {
        ref.update();
      }
      if ((ref1 = self.plugins.CrossFrame) != null) {
        ref1.sync([annotation]);
      }
      return anchors;
    };
    ref = self.anchors.splice(0, self.anchors.length);
    for (i = 0, len = ref.length; i < len; i++) {
      anchor = ref[i];
      if (anchor.annotation === annotation) {
        if ((anchor.range != null) && (ref1 = anchor.target, indexOf.call(annotation.target, ref1) >= 0)) {
          anchors.push(anchor);
          anchoredTargets.push(anchor.target);
        } else if (anchor.highlights != null) {
          deadHighlights = deadHighlights.concat(anchor.highlights);
          delete anchor.highlights;
          delete anchor.range;
        }
      } else {
        self.anchors.push(anchor);
      }
    }
    raf(function() {
      return highlighter.removeHighlights(deadHighlights);
    });
    ref2 = annotation.target;
    for (j = 0, len1 = ref2.length; j < len1; j++) {
      target = ref2[j];
      if (!(indexOf.call(anchoredTargets, target) < 0)) {
        continue;
      }
      anchor = locate(target).then(highlight);
      anchors.push(anchor);
    }
    return Promise.all(anchors).then(sync);
  };

  Guest.prototype.anchorWebclip = function(annotation, type, include) {
    var anchor, anchoredTargets, anchors, deadHighlights, highlight, i, len, locate, ref, root, scripts, self, sync, target;
    self = this;
    root = this.element[0];
    anchors = [];
    anchoredTargets = [];
    deadHighlights = [];
    if (annotation.target == null) {
      annotation.target = [];
    }
    scripts = this.element.find('script').clone(true);
    this.element.find('script').remove();
    sync = function(anchors) {
      self.element.append(scripts);
      return anchors;
    };
    locate = function(target) {
      var options, ref;
      if (!((ref = target.selector) != null ? ref : []).some((function(_this) {
        return function(s) {
          return s.type === 'TextQuoteSelector' || s.type === 'ImageSelector';
        };
      })(this))) {
        return Promise.resolve({
          annotation: annotation,
          target: target
        });
      }
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="webclip-"]'
      };
      return self.anchoring.anchor(root, target.selector, options).then(function(range) {
        return {
          annotation: annotation,
          target: target,
          range: range
        };
      })["catch"](function() {
        return {
          annotation: annotation,
          target: target
        };
      });
    };
    highlight = function(anchor) {
      if (anchor.range == null) {
        return anchor;
      }
      return animationPromise(function() {
        var highlights, normedRange, range;
        range = xpathRange.sniff(anchor.range);
        normedRange = range.normalize(root);
        highlights = highlighter.highlightClipRange(normedRange, type, include);
        $(highlights).data('annotation', anchor.annotation);
        anchor.highlights = highlights;
        return anchor;
      });
    };
    ref = annotation.target;
    for (i = 0, len = ref.length; i < len; i++) {
      target = ref[i];
      if (!(indexOf.call(anchoredTargets, target) < 0)) {
        continue;
      }
      anchor = locate(target).then(highlight);
      anchors.push(anchor);
    }
    return Promise.all(anchors).then(sync);
  };

  Guest.prototype.detach = function(annotation) {
    var anchor, anchors, i, len, ref, ref1, ref2, targets, unhighlight;
    anchors = [];
    targets = [];
    unhighlight = [];
    ref = this.anchors;
    for (i = 0, len = ref.length; i < len; i++) {
      anchor = ref[i];
      if (anchor.annotation === annotation) {
        unhighlight.push((ref1 = anchor.highlights) != null ? ref1 : []);
      } else {
        anchors.push(anchor);
      }
    }
    this.anchors = anchors;
    unhighlight = (ref2 = Array.prototype).concat.apply(ref2, unhighlight);
    return raf((function(_this) {
      return function() {
        var ref3;
        highlighter.removeHighlights(unhighlight);
        return (ref3 = _this.plugins.BucketBar) != null ? ref3.update() : void 0;
      };
    })(this));
  };

  Guest.prototype.createAnnotation = function(annotation, selection) {
    var canvasEl, div, fragment, getSelectors, imgs, info, links, metadata, range, ranges, ref, ref1, root, selectors, self, setDocumentInfo, setTargets, tableEl, targets, text;
    if (annotation == null) {
      annotation = {};
    }
    self = this;
    root = this.element[0];
    ranges = (ref = this.selectedRanges) != null ? ref : [];
    this.selectedRanges = null;
    if (selection) {
      if (selection.rangeCount === 0) {
        ranges.forEach(function(range, index, ranges) {
          return selection.addRange(range);
        });
      }
      text = selection.toString();
      text = text.replace(/(\r\n|\n|\r)/gm, " ");
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        fragment = range.cloneContents();
        div = document.createElement('div');
        div.appendChild(fragment.cloneNode(true));
        $(div).find('[class]').removeClass();
        $(div).find('hypothesis-highlight').unwrap();
        imgs = $(div).find("img");
        links = $(div).find("a");
        canvasEl = $(div).find("canvas");
        tableEl = $(div).find("table");
        if (imgs.length > 0) {
          imgs.each((function(_this) {
            return function(index, element) {
              $(element).attr("src", element.src);
              $(element).removeAttr("style");
              $(element).removeAttr("height");
              $(element).removeAttr("width");
              $(element).css('maxWidth', '100%');
              $(element).css('height', 'auto');
            };
          })(this));
        }
        if (links.length > 0) {
          links.each((function(_this) {
            return function(index, element) {
              return $(element).attr("target", "_blank");
            };
          })(this));
        }
        if (tableEl.length > 0) {
          tableEl.each((function(_this) {
            return function(index, element) {
              $(element).removeAttr("width");
              $(element).attr("border", 1);
              $(element).css('width', '100%');
              $(element).css('maxWidth', '100%');
              $(element).css('height', 'auto');
            };
          })(this));
        }
        if (canvasEl.length > 0) {
          canvasEl.each((function(_this) {
            return function(index, element) {
              var canvasId, el, img, imgSrc;
              canvasId = $(element).attr("data-hid");
              if (canvasId && $('canvas[data-hid="' + canvasId + '"]').length > 0) {
                el = $('canvas[data-hid="' + canvasId + '"]')[0];
                imgSrc = el.toDataURL("image/png");
                img = $('<img/>');
                img.attr("src", imgSrc);
                img.width = $(el).width();
                img.height = $(el).height();
                img.css({
                  "backgroundColor": "transparent"
                });
                if ($(el).css('position') === 'absolute') {
                  img.css({
                    "position": "absolute",
                    "left": $(el).css('left'),
                    "top": $(el).css('top'),
                    "zIndex": $(el).css('z-index')
                  });
                }
                $(element).replaceWith(img);
              }
            };
          })(this));
        }
        text = div.innerHTML;
        annotation.annotatedText = text;
      }
    }
    getSelectors = function(range) {
      var options;
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="annotator-"]'
      };
      return self.anchoring.describe(root, range, options);
    };
    setDocumentInfo = function(info) {
      annotation.document = info.metadata;
      return annotation.uri = info.uri;
    };
    setTargets = function(arg) {
      var info, selector, selectors, source;
      info = arg[0], selectors = arg[1];
      source = info.uri;
      return annotation.target = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = selectors.length; i < len; i++) {
          selector = selectors[i];
          results.push({
            source: source,
            selector: selector
          });
        }
        return results;
      })();
    };
    info = this.getDocumentInfo();
    selectors = Promise.all(ranges.map(getSelectors));
    metadata = info.then(setDocumentInfo);
    targets = Promise.all([info, selectors]).then(setTargets);
    targets.then(function() {
      return self.publish('beforeAnnotationCreated', [annotation]);
    });
    targets.then(function() {
      return self.anchor(annotation);
    });
    if (!annotation.$highlight) {
      if ((ref1 = this.crossframe) != null) {
        ref1.call('showSidebar');
      }
    }
    return annotation;
  };

  Guest.prototype.addToTaskSpace = function(doc) {
    var info, ref, root, self, setDocumentInfo;
    if (doc == null) {
      doc = {};
    }
    self = this;
    root = this.element[0];
    setDocumentInfo = function(info) {
      if (self.constructor.name === "PdfSidebar") {
        doc.isPdf = true;
      }
      doc.document = info.metadata;
      return doc.uri = info.uri;
    };
    info = this.getDocumentInfo();
    info.then(setDocumentInfo);
    info.then(function() {
      return self.publish('addToTaskSpace', [doc]);
    });
    if ((ref = this.crossframe) != null) {
      ref.call('showSidebar');
    }
    return doc;
  };

  Guest.prototype.includeSelection = function(annotation) {
    var getSelectors, info, metadata, ranges, ref, ref1, root, selectors, self, setDocumentInfo, setTargets, targets;
    if (annotation == null) {
      annotation = {};
    }
    self = this;
    root = this.element[0];
    ranges = (ref = this.selectedRanges) != null ? ref : [];
    this.selectedRanges = null;
    getSelectors = function(range) {
      var options;
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="webclip-"]'
      };
      return self.anchoring.describe(root, range, options);
    };
    setDocumentInfo = function(info) {
      annotation.document = info.metadata;
      return annotation.uri = info.uri;
    };
    setTargets = function(arg) {
      var info, selector, selectors, source;
      info = arg[0], selectors = arg[1];
      source = info.uri;
      return annotation.target = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = selectors.length; i < len; i++) {
          selector = selectors[i];
          results.push({
            source: source,
            selector: selector
          });
        }
        return results;
      })();
    };
    info = this.getDocumentInfo();
    selectors = Promise.all(ranges.map(getSelectors));
    metadata = info.then(setDocumentInfo);
    targets = Promise.all([info, selectors]).then(setTargets);
    targets.then(function() {
      return self.anchorWebclip(annotation, "webclip-h1", {
        '_numici': 'include',
        'data-clipped': 'true'
      });
    });
    if ((ref1 = this.crossframe) != null) {
      ref1.call('webClipChanged');
    }
    return annotation;
  };

  Guest.prototype.excludeSelection = function(annotation) {
    var getSelectors, info, metadata, ranges, ref, ref1, root, selectors, self, setDocumentInfo, setTargets, targets;
    if (annotation == null) {
      annotation = {};
    }
    self = this;
    root = this.element[0];
    ranges = (ref = this.selectedRanges) != null ? ref : [];
    this.selectedRanges = null;
    getSelectors = function(range) {
      var options;
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="webclip-"]'
      };
      return self.anchoring.describe(root, range, options);
    };
    setDocumentInfo = function(info) {
      annotation.document = info.metadata;
      return annotation.uri = info.uri;
    };
    setTargets = function(arg) {
      var info, selector, selectors, source;
      info = arg[0], selectors = arg[1];
      source = info.uri;
      return annotation.target = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = selectors.length; i < len; i++) {
          selector = selectors[i];
          results.push({
            source: source,
            selector: selector
          });
        }
        return results;
      })();
    };
    info = this.getDocumentInfo();
    selectors = Promise.all(ranges.map(getSelectors));
    metadata = info.then(setDocumentInfo);
    targets = Promise.all([info, selectors]).then(setTargets);
    targets.then(function() {
      return self.anchorWebclip(annotation, "webclip-exclude", {
        '_numici': 'exclude',
        'data-clipped': 'false'
      });
    });
    if ((ref1 = this.crossframe) != null) {
      ref1.call('webClipChanged');
    }
    return annotation;
  };

  Guest.prototype.createHighlight = function(selection) {
    return this.createAnnotation({
      $highlight: true
    }, selection);
  };

  Guest.prototype.createComment = function() {
    var annotation, prepare, self;
    annotation = {};
    self = this;
    prepare = function(info) {
      annotation.document = info.metadata;
      annotation.uri = info.uri;
      return annotation.target = [
        {
          source: info.uri
        }
      ];
    };
    this.getDocumentInfo().then(prepare).then(function() {
      return self.publish('beforeAnnotationCreated', [annotation]);
    });
    return annotation;
  };

  Guest.prototype.deleteAnnotation = function(annotation) {
    var h, i, len, ref;
    if (annotation.highlights != null) {
      ref = annotation.highlights;
      for (i = 0, len = ref.length; i < len; i++) {
        h = ref[i];
        if (h.parentNode != null) {
          $(h).replaceWith(h.childNodes);
        }
      }
    }
    this.publish('annotationDeleted', [annotation]);
    return annotation;
  };

  Guest.prototype.requestLogin = function() {
    var ref;
    return (ref = this.crossframe) != null ? ref.call('requestLogin') : void 0;
  };

  Guest.prototype.requestGroupChange = function() {
    var ref, ref1;
    if ((ref = this.crossframe) != null) {
      ref.call('requestGroupChange');
    }
    return (ref1 = this.crossframe) != null ? ref1.call('showSidebar') : void 0;
  };

  Guest.prototype.showAnnotations = function(annotations) {
    var a, ref, ref1, tags;
    tags = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = annotations.length; i < len; i++) {
        a = annotations[i];
        results.push(a.$tag);
      }
      return results;
    })();
    if ((ref = this.crossframe) != null) {
      ref.call('showAnnotations', tags);
    }
    return (ref1 = this.crossframe) != null ? ref1.call('showSidebar') : void 0;
  };

  Guest.prototype.toggleAnnotationSelection = function(annotations) {
    var a, ref, tags;
    tags = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = annotations.length; i < len; i++) {
        a = annotations[i];
        results.push(a.$tag);
      }
      return results;
    })();
    return (ref = this.crossframe) != null ? ref.call('toggleAnnotationSelection', tags) : void 0;
  };

  Guest.prototype.updateAnnotations = function(annotations) {
    var a, ref, tags;
    tags = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = annotations.length; i < len; i++) {
        a = annotations[i];
        results.push(a.$tag);
      }
      return results;
    })();
    return (ref = this.crossframe) != null ? ref.call('updateAnnotations', tags) : void 0;
  };

  Guest.prototype.focusAnnotations = function(annotations) {
    var a, ref, tags;
    tags = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = annotations.length; i < len; i++) {
        a = annotations[i];
        results.push(a.$tag);
      }
      return results;
    })();
    return (ref = this.crossframe) != null ? ref.call('focusAnnotations', tags) : void 0;
  };

  Guest.prototype._onSelection = function(range) {
    var arrowDirection, focusRect, isBackwards, left, ref, selection, top;
    selection = document.getSelection();
    isBackwards = rangeUtil.isSelectionBackwards(selection);
    focusRect = rangeUtil.selectionFocusRect(selection);
    if (!focusRect) {
      this._onClearSelection();
      return;
    }
    this.selectedRanges = [range];
    $('.annotator-toolbar .h-icon-note').attr('title', 'New Annotation').removeClass('h-icon-note').addClass('h-icon-annotate');
    ref = this.adderCtrl.target(focusRect, isBackwards), left = ref.left, top = ref.top, arrowDirection = ref.arrowDirection;
    return this.adderCtrl.showAt(left, top, arrowDirection);
  };

  Guest.prototype._onClearSelection = function() {
    this.adderCtrl.hide();
    this.selectedRanges = [];
    return $('.annotator-toolbar .h-icon-annotate').attr('title', 'New Page Note').removeClass('h-icon-annotate').addClass('h-icon-note');
  };

  Guest.prototype.selectAnnotations = function(annotations, toggle) {
    if (toggle) {
      return this.toggleAnnotationSelection(annotations);
    } else {
      return this.showAnnotations(annotations);
    }
  };

  Guest.prototype.onElementClick = function(event) {
    var ref, ref1;
    if (!((ref = this.selectedTargets) != null ? ref.length : void 0)) {
      return (ref1 = this.crossframe) != null ? ref1.call('hideSidebar') : void 0;
    }
  };

  Guest.prototype.onElementTouchStart = function(event) {
    var ref, ref1;
    if (!((ref = this.selectedTargets) != null ? ref.length : void 0)) {
      return (ref1 = this.crossframe) != null ? ref1.call('hideSidebar') : void 0;
    }
  };

  Guest.prototype.onHighlightMouseover = function(event) {
    var annotation, annotations;
    if (!this.visibleHighlights) {
      return;
    }
    annotation = $(event.currentTarget).data('annotation');
    annotations = event.annotations != null ? event.annotations : event.annotations = [];
    annotations.push(annotation);
    if (event.target === event.currentTarget) {
      return setTimeout((function(_this) {
        return function() {
          return _this.focusAnnotations(annotations);
        };
      })(this));
    }
  };

  Guest.prototype.onHighlightMouseout = function(event) {
    if (!this.visibleHighlights) {
      return;
    }
    return this.focusAnnotations([]);
  };

  Guest.prototype.onHighlightClick = function(event) {
    var annotation, annotations, xor;
    if (!this.visibleHighlights) {
      return;
    }
    annotation = $(event.currentTarget).data('annotation');
    annotations = event.annotations != null ? event.annotations : event.annotations = [];
    annotations.push(annotation);
    if (event.target === event.currentTarget) {
      xor = event.metaKey || event.ctrlKey;
      return setTimeout((function(_this) {
        return function() {
          return _this.selectAnnotations(annotations, xor);
        };
      })(this));
    }
  };

  Guest.prototype.setVisibleHighlights = function(shouldShowHighlights) {
    return this.toggleHighlightClass(shouldShowHighlights);
  };

  Guest.prototype.toggleHighlightClass = function(shouldShowHighlights) {
    if (shouldShowHighlights) {
      this.element.attr(SHOW_HIGHLIGHTS_CLASS, "");
    } else {
      this.element.removeAttr(SHOW_HIGHLIGHTS_CLASS);
    }
    return this.visibleHighlights = shouldShowHighlights;
  };

  return Guest;

})(Delegator);


},{"./adder":35,"./anchoring/html":36,"./anchoring/range":38,"./delegator":49,"./element-filters":50,"./gs-extractor":53,"./highlighter":56,"./range-util":70,"./selections":71,"./url-changes":74,"./util/url":77,"custom-event":3,"extend":24,"jquery":"jquery","lodash.debounce":27,"raf":30,"scroll-into-view":31}],55:[function(_dereq_,module,exports){
var $, elementFilter, rangeUtil;

$ = _dereq_('jquery');

rangeUtil = _dereq_('../../range-util');

elementFilter = _dereq_('../../element-filters');

exports.highlightRange = function(normedRange, cssClass) {
  var hl, nodes, white;
  if (cssClass == null) {
    cssClass = 'annotator-hl';
  }
  white = /^\s*$/;
  hl = $("<hypothesis-highlight class='" + cssClass + "'></hypothesis-highlight>");
  nodes;
  if (normedRange.textNodes) {
    nodes = $(normedRange.textNodes()).filter(function(i) {
      return !white.test(this.nodeValue);
    });
  } else {
    rangeUtil.forEachNodeInRange(normedRange, function(node) {
      if (elementFilter.isAllowedElement(node)) {
        if (nodes) {
          nodes.add($(node));
        } else {
          nodes = $(node);
          hl.addClass("image-h1");
        }
      }
    });
  }
  return nodes.wrap(hl).parent().toArray();
};

exports.highlightClipRange = function(normedRange, cssClass, include) {
  var key, nodes, value;
  if (cssClass == null) {
    cssClass = 'webclip-hl';
  }
  if (include == null) {
    include = {};
  }
  nodes = $(normedRange.textNodes()).closest('section,h2,h3,h4,h5,h6,p,td,pre');
  if (nodes.length === 0) {
    nodes = $(normedRange.textNodes()).closest('div');
  }
  if (Object.keys(include).length === 0) {
    nodes.removeClass(cssClass);
    nodes.addClass(cssClass);
  }
  for (key in include) {
    value = include[key];
    nodes.attr(key, value);
    nodes.removeClass(cssClass);
    if (value === 'include') {
      nodes.addClass(cssClass);
    }
  }
  return nodes;
};

exports.removeHighlights = function(highlights) {
  var h, j, len, results;
  results = [];
  for (j = 0, len = highlights.length; j < len; j++) {
    h = highlights[j];
    if (h.parentNode != null) {
      results.push($(h).replaceWith(h.childNodes));
    }
  }
  return results;
};

exports.getBoundingClientRect = function(collection) {
  var rects;
  rects = collection.map(function(n) {
    return n.getBoundingClientRect();
  });
  return rects.reduce(function(acc, r) {
    return {
      top: Math.min(acc.top, r.top),
      left: Math.min(acc.left, r.left),
      bottom: Math.max(acc.bottom, r.bottom),
      right: Math.max(acc.right, r.right)
    };
  });
};


},{"../../element-filters":50,"../../range-util":70,"jquery":"jquery"}],56:[function(_dereq_,module,exports){
'use strict';

var domWrapHighlighter = _dereq_('./dom-wrap-highlighter');
var overlayHighlighter = _dereq_('./overlay-highlighter');
var features = _dereq_('../features');

// we need a facade for the highlighter interface
// that will let us lazy check the overlay_highlighter feature
// flag and later determine which interface should be used.
var highlighterFacade = {};
var overlayFlagEnabled = void 0;

Object.keys(domWrapHighlighter).forEach(function (methodName) {
  highlighterFacade[methodName] = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    // lazy check the value but we will
    // use that first value as the rule throughout
    // the in memory session
    if (overlayFlagEnabled === undefined) {
      overlayFlagEnabled = features.flagEnabled('overlay_highlighter');
    }

    var method = overlayFlagEnabled ? overlayHighlighter[methodName] : domWrapHighlighter[methodName];
    return method.apply(null, args);
  };
});

module.exports = highlighterFacade;

},{"../features":51,"./dom-wrap-highlighter":55,"./overlay-highlighter":57}],57:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  highlightRange: function highlightRange() {
    // eslint-disable-next-line no-console
    console.log('highlightRange not implemented');
  },

  removeHighlights: function removeHighlights() {
    // eslint-disable-next-line no-console
    console.log('removeHighlights not implemented');
  },

  getBoundingClientRect: function getBoundingClientRect() {
    // eslint-disable-next-line no-console
    console.log('getBoundingClientRect not implemented');
  }
};

},{}],58:[function(_dereq_,module,exports){
var $, Guest, Host,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$ = _dereq_('jquery');

Guest = _dereq_('./guest');

module.exports = Host = (function(superClass) {
  extend(Host, superClass);

  function Host(element, config) {
    var app, configParam, ref, service, sidebarAppSrc;
    if ((ref = config.services) != null ? ref[0] : void 0) {
      service = config.services[0];
      if (service.onLoginRequest) {
        service.onLoginRequestProvided = true;
      }
      if (service.onLogoutRequest) {
        service.onLogoutRequestProvided = true;
      }
      if (service.onSignupRequest) {
        service.onSignupRequestProvided = true;
      }
      if (service.onProfileRequest) {
        service.onProfileRequestProvided = true;
      }
      if (service.onAboutRequest) {
        service.onAboutRequestProvided = true;
      }
      if (service.onHelpRequest) {
        service.onHelpRequestProvided = true;
      }
    }
    configParam = 'config=' + encodeURIComponent(JSON.stringify(Object.assign({}, config, {
      sidebarAppUrl: void 0,
      pluginClasses: void 0
    })));
    if (config.sidebarAppUrl && indexOf.call(config.sidebarAppUrl, '?') >= 0) {
      sidebarAppSrc = config.sidebarAppUrl + '&' + configParam;
    } else {
      sidebarAppSrc = config.sidebarAppUrl + '?' + configParam;
    }
    app = $('<iframe></iframe>');
    app.attr('name', 'hyp_sidebar_frame').attr('allowfullscreen', '').attr('seamless', '').attr('src', sidebarAppSrc).addClass('h-sidebar-iframe');
    this.frame = $('<div></div>').css('display', 'none').addClass('annotator-frame annotator-outer');
    if (config.theme === 'clean') {
      this.frame.addClass('annotator-frame--drop-shadow-enabled');
    }
    this.frame.appendTo(element);
    Host.__super__.constructor.apply(this, arguments);
    app.ready(function() {
      if (app.length > 0 && app.attr("src").indexOf("app.html") === -1) {
        app[0].src = sidebarAppSrc;
      }
      return true;
    });
    app.appendTo(this.frame);
    this.on('panelReady', (function(_this) {
      return function() {
        return _this.frame.css('display', '');
      };
    })(this));
    this.on('beforeAnnotationCreated', function(annotation) {
      if (!annotation.$highlight) {
        return app[0].contentWindow.focus();
      }
    });
  }

  Host.prototype.destroy = function() {
    this.frame.remove();
    return Host.__super__.destroy.apply(this, arguments);
  };

  return Host;

})(Guest);


},{"./guest":54,"jquery":"jquery"}],59:[function(_dereq_,module,exports){
'use strict';

var configFrom = _dereq_('./config/index');
_dereq_('../shared/polyfills');

// Polyfills

// document.evaluate() implementation,
// required by IE 10, 11
//
// This sets `window.wgxpath`
if (!window.document.evaluate) {
  _dereq_('./vendor/wgxpath.install');
}
if (window.wgxpath) {
  window.wgxpath.install();
}

var $ = _dereq_('jquery');

// Applications
var Guest = _dereq_('./guest');
var Sidebar = _dereq_('./sidebar');
var PdfSidebar = _dereq_('./pdf-sidebar');

var Clipper = _dereq_('./clipper');

var pluginClasses = {
  // UI plugins
  BucketBar: _dereq_('./plugin/bucket-bar'),
  Toolbar: _dereq_('./plugin/toolbar'),
  ClipperToolbar: _dereq_('./plugin/clipper-toolbar'),

  // Document type plugins
  PDF: _dereq_('./plugin/pdf'),
  Document: _dereq_('./plugin/document'),

  // Cross-frame communication
  CrossFrame: _dereq_('./plugin/cross-frame')
};

var appLinkEl = document.querySelector('link[type="application/annotator+html"][rel="sidebar"]');
var clipperLinkEl = document.querySelector('link[type="application/annotator+html"][rel="clipper"]');
var config = configFrom(window);

$.noConflict(true)(function () {
  var Klass = window.PDFViewerApplication ? PdfSidebar : config.clipperAppUrl ? Clipper : Sidebar;

  if (config.hasOwnProperty('constructor')) {
    Klass = config.constructor;
    delete config.constructor;
  }

  if (config.subFrameIdentifier) {
    // Make sure the PDF plugin is loaded if the subframe contains the PDF.js viewer.
    if (typeof window.PDFViewerApplication !== 'undefined') {
      config.PDF = {};
    }
    Klass = Guest;

    // Other modules use this to detect if this
    // frame context belongs to hypothesis.
    // Needs to be a global property that's set.
    window.__hypothesis_frame = true;
  }

  if (config.theme === 'clean') {
    delete pluginClasses.BucketBar;
  }

  config.pluginClasses = pluginClasses;
  var annotator = new Klass(document.body, config);
  appLinkEl.addEventListener('destroy', function () {
    appLinkEl.parentElement.removeChild(appLinkEl);
    clipperLinkEl.parentElement.removeChild(clipperLinkEl);
    annotator.destroy();
  });
});

},{"../shared/polyfills":"/src/shared/polyfills.js","./clipper":44,"./config/index":46,"./guest":54,"./pdf-sidebar":60,"./plugin/bucket-bar":63,"./plugin/clipper-toolbar":64,"./plugin/cross-frame":65,"./plugin/document":66,"./plugin/pdf":68,"./plugin/toolbar":69,"./sidebar":73,"./vendor/wgxpath.install":78,"jquery":"jquery"}],60:[function(_dereq_,module,exports){
var PdfSidebar, Sidebar,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Sidebar = _dereq_('./sidebar');

module.exports = PdfSidebar = (function(superClass) {
  extend(PdfSidebar, superClass);

  function PdfSidebar() {
    return PdfSidebar.__super__.constructor.apply(this, arguments);
  }

  PdfSidebar.prototype.options = {
    TextSelection: {},
    PDF: {},
    BucketBar: {
      container: '.annotator-frame',
      scrollables: ['#viewerContainer']
    },
    Toolbar: {
      container: '.annotator-frame'
    }
  };

  return PdfSidebar;

})(Sidebar);


},{"./sidebar":73}],61:[function(_dereq_,module,exports){
'use strict';

/**
 * Enum values for page rendering states (IRenderableView#renderingState)
 * in PDF.js. Taken from web/pdf_rendering_queue.js in the PDF.js library.
 *
 * Reproduced here because this enum is not exported consistently across
 * different versions of PDF.js
 */

var RenderingStates = {
  INITIAL: 0,
  RUNNING: 1,
  PAUSED: 2,
  FINISHED: 3
};

module.exports = RenderingStates;

},{}],62:[function(_dereq_,module,exports){
var Delegator, Plugin,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Delegator = _dereq_('./delegator');

module.exports = Plugin = (function(superClass) {
  extend(Plugin, superClass);

  function Plugin(element, options) {
    Plugin.__super__.constructor.apply(this, arguments);
  }

  Plugin.prototype.pluginInit = function() {};

  return Plugin;

})(Delegator);


},{"./delegator":49}],63:[function(_dereq_,module,exports){
var $, BUCKET_NAV_SIZE, BUCKET_SIZE, BUCKET_TOP_THRESHOLD, BucketBar, Plugin, highlighter, raf, scrollIntoView, scrollToClosest,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

raf = _dereq_('raf');

$ = _dereq_('jquery');

Plugin = _dereq_('../plugin');

scrollIntoView = _dereq_('scroll-into-view');

highlighter = _dereq_('../highlighter');

BUCKET_SIZE = 16;

BUCKET_NAV_SIZE = BUCKET_SIZE + 6;

BUCKET_TOP_THRESHOLD = 115 + BUCKET_NAV_SIZE;

scrollToClosest = function(anchors, direction) {
  var dir, next;
  dir = direction === "up" ? +1 : -1;
  next = anchors.reduce(function(acc, anchor) {
    var rect, ref, start;
    if (!((ref = anchor.highlights) != null ? ref.length : void 0)) {
      return acc;
    }
    start = acc.start, next = acc.next;
    rect = highlighter.getBoundingClientRect(anchor.highlights);
    if (dir === 1 && rect.top >= BUCKET_TOP_THRESHOLD) {
      return acc;
    } else if (dir === -1 && rect.top <= window.innerHeight - BUCKET_NAV_SIZE) {
      return acc;
    }
    if (next == null) {
      return {
        start: rect.top,
        next: anchor
      };
    } else if (start * dir < rect.top * dir) {
      return {
        start: rect.top,
        next: anchor
      };
    } else {
      return acc;
    }
  }, {}).next;
  return scrollIntoView(next.highlights[0]);
};

module.exports = BucketBar = (function(superClass) {
  extend(BucketBar, superClass);

  BucketBar.prototype.html = "<div class=\"annotator-bucket-bar\">\n</div>";

  BucketBar.prototype.options = {
    gapSize: 60,
    scrollables: ['body']
  };

  BucketBar.prototype.buckets = [];

  BucketBar.prototype.index = [];

  BucketBar.prototype.tabs = null;

  function BucketBar(element, options) {
    this.update = bind(this.update, this);
    BucketBar.__super__.constructor.call(this, $(this.html), options);
    if (this.options.container != null) {
      $(this.options.container).append(this.element);
    } else {
      $(element).append(this.element);
    }
  }

  BucketBar.prototype.pluginInit = function() {
    var k, len, ref, ref1, results, scrollable;
    $(window).on('resize scroll', this.update);
    ref1 = (ref = this.options.scrollables) != null ? ref : [];
    results = [];
    for (k = 0, len = ref1.length; k < len; k++) {
      scrollable = ref1[k];
      results.push($(scrollable).on('resize scroll', this.update));
    }
    return results;
  };

  BucketBar.prototype.destroy = function() {
    var k, len, ref, ref1, results, scrollable;
    $(window).off('resize scroll', this.update);
    ref1 = (ref = this.options.scrollables) != null ? ref : [];
    results = [];
    for (k = 0, len = ref1.length; k < len; k++) {
      scrollable = ref1[k];
      results.push($(scrollable).off('resize scroll', this.update));
    }
    return results;
  };

  BucketBar.prototype._collate = function(a, b) {
    var i, k, ref;
    for (i = k = 0, ref = a.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      if (a[i] < b[i]) {
        return -1;
      }
      if (a[i] > b[i]) {
        return 1;
      }
    }
    return 0;
  };

  BucketBar.prototype.update = function() {
    if (this._updatePending != null) {
      return;
    }
    return this._updatePending = raf((function(_this) {
      return function() {
        delete _this._updatePending;
        return _this._update();
      };
    })(this));
  };

  BucketBar.prototype._update = function() {
    var above, b, below, element, k, len, max, points, ref, ref1;
    above = [];
    below = [];
    points = this.annotator.anchors.reduce((function(_this) {
      return function(points, anchor, i) {
        var h, rect, ref, x;
        if (!((ref = anchor.highlights) != null ? ref.length : void 0)) {
          return points;
        }
        rect = highlighter.getBoundingClientRect(anchor.highlights);
        x = rect.top;
        h = rect.bottom - rect.top;
        if (x < BUCKET_TOP_THRESHOLD) {
          if (indexOf.call(above, anchor) < 0) {
            above.push(anchor);
          }
        } else if (x > window.innerHeight - BUCKET_NAV_SIZE) {
          if (indexOf.call(below, anchor) < 0) {
            below.push(anchor);
          }
        } else {
          points.push([x, 1, anchor]);
          points.push([x + h, -1, anchor]);
        }
        return points;
      };
    })(this), []);
    ref = points.sort(this._collate).reduce((function(_this) {
      return function(arg, arg1, i, points) {
        var a, a0, buckets, carry, d, index, j, k, l, last, len, len1, ref, ref1, toMerge, x;
        buckets = arg.buckets, index = arg.index, carry = arg.carry;
        x = arg1[0], d = arg1[1], a = arg1[2];
        if (d > 0) {
          if ((j = carry.anchors.indexOf(a)) < 0) {
            carry.anchors.unshift(a);
            carry.counts.unshift(1);
          } else {
            carry.counts[j]++;
          }
        } else {
          j = carry.anchors.indexOf(a);
          if (--carry.counts[j] === 0) {
            carry.anchors.splice(j, 1);
            carry.counts.splice(j, 1);
          }
        }
        if ((index.length === 0 || i === points.length - 1) || carry.anchors.length === 0 || x - index[index.length - 1] > _this.options.gapSize) {
          buckets.push(carry.anchors.slice());
          index.push(x);
        } else {
          if ((ref = buckets[buckets.length - 2]) != null ? ref.length : void 0) {
            last = buckets[buckets.length - 2];
            toMerge = buckets.pop();
            index.pop();
          } else {
            last = buckets[buckets.length - 1];
            toMerge = [];
          }
          ref1 = carry.anchors;
          for (k = 0, len = ref1.length; k < len; k++) {
            a0 = ref1[k];
            if (indexOf.call(last, a0) < 0) {
              last.push(a0);
            }
          }
          for (l = 0, len1 = toMerge.length; l < len1; l++) {
            a0 = toMerge[l];
            if (indexOf.call(last, a0) < 0) {
              last.push(a0);
            }
          }
        }
        return {
          buckets: buckets,
          index: index,
          carry: carry
        };
      };
    })(this), {
      buckets: [],
      index: [],
      carry: {
        anchors: [],
        counts: [],
        latest: 0
      }
    }), this.buckets = ref.buckets, this.index = ref.index;
    this.buckets.unshift([], above, []);
    this.index.unshift(0, BUCKET_TOP_THRESHOLD - 1, BUCKET_TOP_THRESHOLD);
    this.buckets.push([], below, []);
    this.index.push(window.innerHeight - BUCKET_NAV_SIZE, window.innerHeight - BUCKET_NAV_SIZE + 1, window.innerHeight);
    max = 0;
    ref1 = this.buckets;
    for (k = 0, len = ref1.length; k < len; k++) {
      b = ref1[k];
      max = Math.max(max, b.length);
    }
    element = this.element;
    this.tabs || (this.tabs = $([]));
    this.tabs.slice(this.buckets.length).remove();
    this.tabs = this.tabs.slice(0, this.buckets.length);
    $.each(this.buckets.slice(this.tabs.length), (function(_this) {
      return function() {
        var div;
        div = $('<div/>').appendTo(element);
        _this.tabs.push(div[0]);
        return div.addClass('annotator-bucket-indicator').on('mousemove', function(event) {
          var anchor, bucket, l, len1, ref2, results, toggle;
          bucket = _this.tabs.index(event.currentTarget);
          ref2 = _this.annotator.anchors;
          results = [];
          for (l = 0, len1 = ref2.length; l < len1; l++) {
            anchor = ref2[l];
            toggle = indexOf.call(_this.buckets[bucket], anchor) >= 0;
            results.push($(anchor.highlights).toggleClass('annotator-hl-focused', toggle));
          }
          return results;
        }).on('mouseout', function(event) {
          var anchor, bucket, l, len1, ref2, results;
          bucket = _this.tabs.index(event.currentTarget);
          ref2 = _this.buckets[bucket];
          results = [];
          for (l = 0, len1 = ref2.length; l < len1; l++) {
            anchor = ref2[l];
            results.push($(anchor.highlights).removeClass('annotator-hl-focused'));
          }
          return results;
        }).on('click', function(event) {
          var anchor, annotations, bucket;
          bucket = _this.tabs.index(event.currentTarget);
          event.stopPropagation();
          if (_this.isUpper(bucket)) {
            return scrollToClosest(_this.buckets[bucket], 'up');
          } else if (_this.isLower(bucket)) {
            return scrollToClosest(_this.buckets[bucket], 'down');
          } else {
            annotations = (function() {
              var l, len1, ref2, results;
              ref2 = this.buckets[bucket];
              results = [];
              for (l = 0, len1 = ref2.length; l < len1; l++) {
                anchor = ref2[l];
                results.push(anchor.annotation);
              }
              return results;
            }).call(_this);
            return annotator.selectAnnotations(annotations, event.ctrlKey || event.metaKey);
          }
        });
      };
    })(this));
    return this._buildTabs(this.tabs, this.buckets);
  };

  BucketBar.prototype._buildTabs = function() {
    return this.tabs.each((function(_this) {
      return function(d, el) {
        var bucket, bucketLength, bucketSize, title;
        el = $(el);
        bucket = _this.buckets[d];
        bucketLength = bucket != null ? bucket.length : void 0;
        title = bucketLength !== 1 ? "Show " + bucketLength + " annotations" : bucketLength > 0 ? 'Show one annotation' : void 0;
        el.attr('title', title);
        el.toggleClass('upper', _this.isUpper(d));
        el.toggleClass('lower', _this.isLower(d));
        if (_this.isUpper(d) || _this.isLower(d)) {
          bucketSize = BUCKET_NAV_SIZE;
        } else {
          bucketSize = BUCKET_SIZE;
        }
        el.css({
          top: (_this.index[d] + _this.index[d + 1]) / 2,
          marginTop: -bucketSize / 2,
          display: !bucketLength ? 'none' : ''
        });
        if (bucket) {
          return el.html("<div class='label'>" + bucketLength + "</div>");
        }
      };
    })(this));
  };

  BucketBar.prototype.isUpper = function(i) {
    return i === 1;
  };

  BucketBar.prototype.isLower = function(i) {
    return i === this.index.length - 2;
  };

  return BucketBar;

})(Plugin);

BucketBar.BUCKET_SIZE = BUCKET_SIZE;

BucketBar.BUCKET_NAV_SIZE = BUCKET_NAV_SIZE;

BucketBar.BUCKET_TOP_THRESHOLD = BUCKET_TOP_THRESHOLD;


},{"../highlighter":56,"../plugin":62,"jquery":"jquery","raf":30,"scroll-into-view":31}],64:[function(_dereq_,module,exports){
var $, ClipperToolbar, Plugin, makeButton,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Plugin = _dereq_('../plugin');

$ = _dereq_('jquery');

makeButton = function(item) {
  var anchor;
  anchor = $('<button></button>').attr('href', '').attr('title', item.title).attr('name', item.name).on(item.on).addClass('annotator-frame-button').addClass(item["class"]);
  return anchor[0];
};

module.exports = ClipperToolbar = (function(superClass) {
  extend(ClipperToolbar, superClass);

  function ClipperToolbar() {
    return ClipperToolbar.__super__.constructor.apply(this, arguments);
  }

  ClipperToolbar.prototype.html = '<span class="clipper-toolbar"></span>';

  ClipperToolbar.prototype.pluginInit = function() {
    var item, items;
    this.clipper.toolbar = this.toolbar = $(this.html);
    if (this.options.container != null) {
      $(this.options.container).append(this.toolbar);
    } else {
      $(this.element).append(this.toolbar);
    }
    items = [
      {
        "title": "Close Clipper",
        "class": "annotator-frame-button--sidebar_close h-icon-close",
        "name": "clipper-close",
        "on": {
          "click": (function(_this) {
            return function(event) {
              event.preventDefault();
              event.stopPropagation();
              return _this.clipper.hideClipper();
            };
          })(this)
        }
      }
    ];
    this.buttons = $((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        results.push(makeButton(item));
      }
      return results;
    })());
    return this.toolbar.append(this.buttons);
  };

  return ClipperToolbar;

})(Plugin);


},{"../plugin":62,"jquery":"jquery"}],65:[function(_dereq_,module,exports){
var AnnotationSync, Bridge, CrossFrame, Discovery, FrameObserver, FrameUtil, Plugin, extract,
  slice = [].slice,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Plugin = _dereq_('../plugin');

AnnotationSync = _dereq_('../annotation-sync');

Bridge = _dereq_('../../shared/bridge');

Discovery = _dereq_('../../shared/discovery');

FrameUtil = _dereq_('../util/frame-util');

FrameObserver = _dereq_('../frame-observer');

extract = extract = function() {
  var i, key, keys, len, obj, ret;
  obj = arguments[0], keys = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  ret = {};
  for (i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    if (obj.hasOwnProperty(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
};

module.exports = CrossFrame = (function(superClass) {
  extend(CrossFrame, superClass);

  function CrossFrame(elem, options) {
    var _iframeUnloaded, _injectToFrame, annotationSync, bridge, config, discovery, frameIdentifiers, frameObserver, opts;
    CrossFrame.__super__.constructor.apply(this, arguments);
    config = options.config;
    opts = extract(options, 'server');
    discovery = new Discovery(window, opts);
    bridge = new Bridge();
    opts = extract(options, 'on', 'emit');
    annotationSync = new AnnotationSync(bridge, opts);
    frameObserver = new FrameObserver(elem);
    frameIdentifiers = new Map();
    this.pluginInit = function() {
      var onDiscoveryCallback;
      onDiscoveryCallback = function(source, origin, token) {
        return bridge.createChannel(source, origin, token);
      };
      discovery.startDiscovery(onDiscoveryCallback);
      return frameObserver.observe(_injectToFrame, _iframeUnloaded);
    };
    this.destroy = function() {
      Plugin.prototype.destroy.apply(this, arguments);
      bridge.destroy();
      discovery.stopDiscovery();
      return frameObserver.disconnect();
    };
    this.sync = function(annotations, cb) {
      return annotationSync.sync(annotations, cb);
    };
    this.on = function(event, fn) {
      return bridge.on(event, fn);
    };
    this.call = function() {
      var args, message;
      message = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return bridge.call.apply(bridge, [message].concat(slice.call(args)));
    };
    this.onConnect = function(fn) {
      return bridge.onConnect(fn);
    };
    _injectToFrame = function(frame) {
      var clientUrl;
      if (!FrameUtil.hasHypothesis(frame)) {
        clientUrl = config.clientUrl;
        return FrameUtil.isLoaded(frame, function() {
          var injectedConfig, subFrameIdentifier;
          subFrameIdentifier = discovery._generateToken();
          frameIdentifiers.set(frame, subFrameIdentifier);
          injectedConfig = Object.assign({}, config, {
            subFrameIdentifier: subFrameIdentifier
          });
          return FrameUtil.injectHypothesis(frame, clientUrl, injectedConfig);
        });
      }
    };
    _iframeUnloaded = function(frame) {
      bridge.call('destroyFrame', frameIdentifiers.get(frame));
      return frameIdentifiers["delete"](frame);
    };
  }

  return CrossFrame;

})(Plugin);


},{"../../shared/bridge":81,"../../shared/discovery":82,"../annotation-sync":43,"../frame-observer":52,"../plugin":62,"../util/frame-util":75}],66:[function(_dereq_,module,exports){
var $, Document, Plugin, baseURI, normalizeURI,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$ = _dereq_('jquery');

baseURI = _dereq_('document-base-uri');

Plugin = _dereq_('../plugin');

normalizeURI = _dereq_('../util/url').normalizeURI;


/*
** Adapted from:
** https://github.com/openannotation/annotator/blob/v1.2.x/src/plugin/document.coffee
**
** Annotator v1.2.10
** https://github.com/openannotation/annotator
**
** Copyright 2015, the Annotator project contributors.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/openannotation/annotator/blob/master/LICENSE
 */

module.exports = Document = (function(superClass) {
  extend(Document, superClass);

  function Document() {
    this._getFavicon = bind(this._getFavicon, this);
    this._getLinks = bind(this._getLinks, this);
    this._getTitle = bind(this._getTitle, this);
    this._getMetaTags = bind(this._getMetaTags, this);
    this._getEprints = bind(this._getEprints, this);
    this._getPrism = bind(this._getPrism, this);
    this._getDublinCore = bind(this._getDublinCore, this);
    this._getTwitter = bind(this._getTwitter, this);
    this._getFacebook = bind(this._getFacebook, this);
    this._getHighwire = bind(this._getHighwire, this);
    this.getDocumentMetadata = bind(this.getDocumentMetadata, this);
    this.beforeAnnotationCreated = bind(this.beforeAnnotationCreated, this);
    this.uris = bind(this.uris, this);
    this.uri = bind(this.uri, this);
    return Document.__super__.constructor.apply(this, arguments);
  }

  Document.prototype.events = {
    'beforeAnnotationCreated': 'beforeAnnotationCreated'
  };

  Document.prototype.pluginInit = function() {
    this.baseURI = this.options.baseURI || baseURI;
    this.document = this.options.document || document;
    return this.getDocumentMetadata();
  };

  Document.prototype.uri = function() {
    var uri;
    uri = decodeURIComponent(this._getDocumentHref());
    this.locationurl = uri;

    /*
    for link in @metadata.link
      if link.rel == "canonical"
        uri = link.href
     */
    return uri;
  };

  Document.prototype.uris = function() {
    var href, i, len, link, ref, uniqueUrls;
    uniqueUrls = {};
    ref = this.metadata.link;
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      if (link.href) {
        uniqueUrls[link.href] = true;
      }
    }
    return (function() {
      var results;
      results = [];
      for (href in uniqueUrls) {
        results.push(href);
      }
      return results;
    })();
  };

  Document.prototype.beforeAnnotationCreated = function(annotation) {
    return annotation.document = this.metadata;
  };

  Document.prototype.getDocumentMetadata = function() {
    this.metadata = {};
    this._getHighwire();
    this._getDublinCore();
    this._getFacebook();
    this._getEprints();
    this._getPrism();
    this._getTwitter();
    this._getFavicon();
    this._getTitle();
    this._getLinks();
    return this.metadata;
  };

  Document.prototype._getHighwire = function() {
    return this.metadata.highwire = this._getMetaTags("citation", "name", "_");
  };

  Document.prototype._getFacebook = function() {
    return this.metadata.facebook = this._getMetaTags("og", "property", ":");
  };

  Document.prototype._getTwitter = function() {
    return this.metadata.twitter = this._getMetaTags("twitter", "name", ":");
  };

  Document.prototype._getDublinCore = function() {
    return this.metadata.dc = this._getMetaTags("dc", "name", ".");
  };

  Document.prototype._getPrism = function() {
    return this.metadata.prism = this._getMetaTags("prism", "name", ".");
  };

  Document.prototype._getEprints = function() {
    return this.metadata.eprints = this._getMetaTags("eprints", "name", ".");
  };

  Document.prototype._getMetaTags = function(prefix, attribute, delimiter) {
    var content, i, len, match, meta, n, name, ref, tags;
    tags = {};
    ref = $("meta");
    for (i = 0, len = ref.length; i < len; i++) {
      meta = ref[i];
      name = $(meta).attr(attribute);
      content = $(meta).prop("content");
      if (name) {
        match = name.match(RegExp("^" + prefix + delimiter + "(.+)$", "i"));
        if (match) {
          n = match[1];
          if (tags[n]) {
            tags[n].push(content);
          } else {
            tags[n] = [content];
          }
        }
      }
    }
    return tags;
  };

  Document.prototype._getTitle = function() {
    if (this.metadata.highwire.title) {
      return this.metadata.title = this.metadata.highwire.title[0];
    } else if (this.metadata.eprints.title) {
      return this.metadata.title = this.metadata.eprints.title[0];
    } else if (this.metadata.prism.title) {
      return this.metadata.title = this.metadata.prism.title[0];
    } else if (this.metadata.facebook.title) {
      return this.metadata.title = this.metadata.facebook.title[0];
    } else if (this.metadata.twitter.title) {
      return this.metadata.title = this.metadata.twitter.title[0];
    } else if (this.metadata.dc.title) {
      return this.metadata.title = this.metadata.dc.title[0];
    } else {
      return this.metadata.title = $("head title").text();
    }
  };

  Document.prototype._getLinks = function() {
    var dcIdentifierValues, dcRelationValues, dcUrn, dcUrnIdentifierComponent, dcUrnRelationComponent, doi, href, i, id, j, k, l, lang, len, len1, len2, len3, link, m, name, ref, ref1, ref2, rel, type, url, values;
    this.metadata.link = [
      {
        href: this._getDocumentHref()
      }
    ];
    ref = $("link");
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      l = $(link);
      href = this._absoluteUrl(l.prop('href'));
      rel = l.prop('rel');
      type = l.prop('type');
      lang = l.prop('hreflang');
      if (rel !== "alternate" && rel !== "canonical" && rel !== "bookmark" && rel !== "shortlink") {
        continue;
      }
      if (rel === 'alternate') {
        if (type && type.match(/^application\/(rss|atom)\+xml/)) {
          continue;
        }
        if (lang) {
          continue;
        }
      }
      this.metadata.link.push({
        href: href,
        rel: rel,
        type: type
      });
    }
    ref1 = this.metadata.highwire;
    for (name in ref1) {
      values = ref1[name];
      if (name === "pdf_url") {
        for (j = 0, len1 = values.length; j < len1; j++) {
          url = values[j];
          this.metadata.link.push({
            href: this._absoluteUrl(url),
            type: "application/pdf"
          });
        }
      }
      if (name === "doi") {
        for (k = 0, len2 = values.length; k < len2; k++) {
          doi = values[k];
          if (doi.slice(0, 4) !== "doi:") {
            doi = "doi:" + doi;
          }
          this.metadata.link.push({
            href: doi
          });
        }
      }
    }
    ref2 = this.metadata.dc;
    for (name in ref2) {
      values = ref2[name];
      if (name === "identifier") {
        for (m = 0, len3 = values.length; m < len3; m++) {
          id = values[m];
          if (id.slice(0, 4) === "doi:") {
            this.metadata.link.push({
              href: id
            });
          }
        }
      }
    }
    dcRelationValues = this.metadata.dc['relation.ispartof'];
    dcIdentifierValues = this.metadata.dc['identifier'];
    if (dcRelationValues && dcIdentifierValues) {
      dcUrnRelationComponent = dcRelationValues[dcRelationValues.length - 1];
      dcUrnIdentifierComponent = dcIdentifierValues[dcIdentifierValues.length - 1];
      dcUrn = 'urn:x-dc:' + encodeURIComponent(dcUrnRelationComponent) + '/' + encodeURIComponent(dcUrnIdentifierComponent);
      this.metadata.link.push({
        href: dcUrn
      });
      return this.metadata.documentFingerprint = dcUrn;
    }
  };

  Document.prototype._getFavicon = function() {
    var i, len, link, ref, ref1, results;
    ref = $("link");
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      if ((ref1 = $(link).prop("rel")) === "shortcut icon" || ref1 === "icon") {
        results.push(this.metadata["favicon"] = this._absoluteUrl(link.href));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Document.prototype._absoluteUrl = function(url) {
    return normalizeURI(url, this.baseURI);
  };

  Document.prototype._getDocumentHref = function() {
    var allowedSchemes, href, ref, ref1;
    href = this.document.location.href;
    allowedSchemes = ['http:', 'https:', 'file:'];
    if (ref = new URL(href).protocol, indexOf.call(allowedSchemes, ref) >= 0) {
      return href;
    }
    if (this.baseURI && (ref1 = new URL(this.baseURI).protocol, indexOf.call(allowedSchemes, ref1) >= 0)) {
      return this.baseURI;
    }
    return href;
  };

  Document.prototype._ListenUrlChange = function() {
    var self;
    self = this;
    return setInterval(function() {
      var i, len, link, locUri, ref, uri;
      if (self.locationurl) {
        self.getDocumentMetadata();
        locUri = self._getDocumentHref();
        uri = decodeURIComponent(locUri);
        ref = self.metadata.link;
        for (i = 0, len = ref.length; i < len; i++) {
          link = ref[i];
          if (link.rel === "canonical") {
            uri = link.href;
          }
        }
        if (self.locationurl !== locUri) {
          return window.location.reload();
        }
      }
    }, 1000);
  };

  return Document;

})(Plugin);


},{"../plugin":62,"../util/url":77,"document-base-uri":5,"jquery":"jquery"}],67:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = _dereq_('../util/url'),
    normalizeURI = _require.normalizeURI;

/**
 * @typedef Link
 * @prop {string} href
 */

/**
 * @typedef Metadata
 * @prop {string} title - The document title
 * @prop {Link[]} link - Array of URIs associated with this document
 * @prop {string} documentFingerprint - The fingerprint of this PDF. This is
 *   referred to as the "File Identifier" in the PDF spec. It may be a hash of
 *   part of the content if the PDF file does not have a File Identifier.
 */

/**
 * PDFMetadata extracts metadata about a loading/loaded PDF document from a
 * PDF.js PDFViewerApplication object.
 *
 * @example
 * // Invoke in a PDF.js viewer, before or after the PDF has finished loading.
 * const meta = new PDFMetadata(window.PDFViewerApplication)
 * meta.getUri().then(uri => {
 *    // Do something with the URL of the PDF.
 * })
 */


var PDFMetadata = function () {
  /**
   * Construct a `PDFMetadata` that returns URIs/metadata associated with a
   * given PDF viewer.
   *
   * @param {PDFViewerApplication} app
   */
  function PDFMetadata(app) {
    _classCallCheck(this, PDFMetadata);

    this._loaded = new Promise(function (resolve) {
      var finish = function finish() {
        window.removeEventListener('documentload', finish);
        resolve(app);
      };

      if (app.documentFingerprint) {
        resolve(app);
      } else {
        window.addEventListener('documentload', finish);
      }
    });
  }

  /**
   * Return the URI of the PDF.
   *
   * If the PDF is currently loading, the returned promise resolves once loading
   * is complete.
   *
   * @return {Promise<string>}
   */


  _createClass(PDFMetadata, [{
    key: 'getUri',
    value: function getUri() {
      return this._loaded.then(function (app) {
        var uri = getPDFURL(app);
        if (!uri) {
          uri = fingerprintToURN(app.documentFingerprint);
        }
        return uri;
      });
    }

    /**
     * Returns metadata about the document.
     *
     * If the PDF is currently loading, the returned promise resolves once loading
     * is complete.
     *
     * @return {Promise<Metadata>}
     */

  }, {
    key: 'getMetadata',
    value: function getMetadata() {
      return this._loaded.then(function (app) {
        var title = document.title;
        var filename = null;
        if (app.metadata && app.metadata.has('dc:title') && app.metadata.get('dc:title') !== 'Untitled') {
          title = app.metadata.get('dc:title');
        } else if (app.documentInfo && app.documentInfo.Title) {
          title = app.documentInfo.Title;
        }

        var link = [{ href: fingerprintToURN(app.documentFingerprint) }];

        var url = getPDFURL(app);
        if (url) {
          link.push({ href: url });
        }

        if (getPDFFileNameFromURL) {
          filename = getPDFFileNameFromURL(url);
        }

        function bufferToBase64(buf) {
          var binstr = Array.prototype.map.call(buf, function (ch) {
            return String.fromCharCode(ch);
          }).join('');
          return btoa(binstr);
        }

        if (app.pdfDocument) {
          return app.pdfDocument.getData().then(function (pdfData) {
            var base64Data = bufferToBase64(pdfData);
            return {
              title: title,
              link: link,
              documentFingerprint: app.documentFingerprint,
              pdfData: base64Data,
              pdfInfo: app.documentInfo,
              filename: filename
            };
          });
        } else {
          return {
            title: title,
            link: link,
            documentFingerprint: app.documentFingerprint
          };
        }
      });
    }
  }]);

  return PDFMetadata;
}();

function fingerprintToURN(fingerprint) {
  return 'urn:x-pdf:' + String(fingerprint);
}

function getPDFURL(app) {
  var url = normalizeURI(app.url);

  // Local file:// URLs should not be saved in document metadata.
  // Entries in document.link should be URIs. In the case of
  // local files, omit the URL.
  if (url.indexOf('file://') !== 0) {
    return url;
  }

  return null;
}

module.exports = PDFMetadata;

},{"../util/url":77}],68:[function(_dereq_,module,exports){
var PDF, Plugin, RenderingStates,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Plugin = _dereq_('../plugin');

RenderingStates = _dereq_('../pdfjs-rendering-states');

module.exports = PDF = (function(superClass) {
  extend(PDF, superClass);

  function PDF() {
    return PDF.__super__.constructor.apply(this, arguments);
  }

  PDF.prototype.documentLoaded = null;

  PDF.prototype.observer = null;

  PDF.prototype.pdfViewer = null;

  PDF.prototype.pluginInit = function() {
    var PDFMetadata;
    this.annotator.anchoring = _dereq_('../anchoring/pdf');
    PDFMetadata = _dereq_('./pdf-metadata');
    this.pdfViewer = PDFViewerApplication.pdfViewer;
    this.pdfViewer.viewer.classList.add('has-transparent-text-layer');
    this.pdfMetadata = new PDFMetadata(PDFViewerApplication);
    this.observer = new MutationObserver((function(_this) {
      return function(mutations) {
        return _this._update();
      };
    })(this));
    return this.observer.observe(this.pdfViewer.viewer, {
      attributes: true,
      attributeFilter: ['data-loaded'],
      childList: true,
      subtree: true
    });
  };

  PDF.prototype.destroy = function() {
    this.pdfViewer.viewer.classList.remove('has-transparent-text-layer');
    return this.observer.disconnect();
  };

  PDF.prototype.uri = function() {
    return this.pdfMetadata.getUri();
  };

  PDF.prototype.getMetadata = function() {
    return this.pdfMetadata.getMetadata();
  };

  PDF.prototype._update = function() {
    var anchor, annotation, annotator, div, hl, i, j, k, l, len, len1, len2, page, pageIndex, pdfViewer, placeholder, ref, ref1, ref2, ref3, ref4, ref5, ref6, refreshAnnotations, results;
    ref = this, annotator = ref.annotator, pdfViewer = ref.pdfViewer;
    refreshAnnotations = [];
    for (pageIndex = i = 0, ref1 = pdfViewer.pagesCount; 0 <= ref1 ? i < ref1 : i > ref1; pageIndex = 0 <= ref1 ? ++i : --i) {
      page = pdfViewer.getPageView(pageIndex);
      if (!((ref2 = page.textLayer) != null ? ref2.renderingDone : void 0)) {
        continue;
      }
      div = (ref3 = page.div) != null ? ref3 : page.el;
      placeholder = div.getElementsByClassName('annotator-placeholder')[0];
      switch (page.renderingState) {
        case RenderingStates.INITIAL:
          page.textLayer = null;
          break;
        case RenderingStates.FINISHED:
          if (placeholder != null) {
            placeholder.parentNode.removeChild(placeholder);
          }
      }
    }
    ref4 = annotator.anchors;
    for (j = 0, len = ref4.length; j < len; j++) {
      anchor = ref4[j];
      if (!(anchor.highlights != null)) {
        continue;
      }
      if (ref5 = anchor.annotation, indexOf.call(refreshAnnotations, ref5) >= 0) {
        continue;
      }
      ref6 = anchor.highlights;
      for (k = 0, len1 = ref6.length; k < len1; k++) {
        hl = ref6[k];
        if (!document.body.contains(hl)) {
          delete anchor.highlights;
          delete anchor.range;
          refreshAnnotations.push(anchor.annotation);
          break;
        }
      }
    }
    results = [];
    for (l = 0, len2 = refreshAnnotations.length; l < len2; l++) {
      annotation = refreshAnnotations[l];
      results.push(annotator.anchor(annotation));
    }
    return results;
  };

  return PDF;

})(Plugin);


},{"../anchoring/pdf":37,"../pdfjs-rendering-states":61,"../plugin":62,"./pdf-metadata":67}],69:[function(_dereq_,module,exports){
var $, Plugin, Toolbar, makeButton,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Plugin = _dereq_('../plugin');

$ = _dereq_('jquery');

makeButton = function(item) {
  var anchor, button;
  anchor = $('<button></button>').attr('href', '').attr('title', item.title).attr('name', item.name).on(item.on).addClass('annotator-frame-button').addClass(item["class"]);
  button = $('<li></li>').append(anchor);
  return button[0];
};

module.exports = Toolbar = (function(superClass) {
  var HIDE_CLASS;

  extend(Toolbar, superClass);

  function Toolbar() {
    return Toolbar.__super__.constructor.apply(this, arguments);
  }

  HIDE_CLASS = 'annotator-hide';

  Toolbar.prototype.events = {
    'setVisibleHighlights': 'onSetVisibleHighlights'
  };

  Toolbar.prototype.html = '<div class="annotator-toolbar"></div>';

  Toolbar.prototype.pluginInit = function() {
    var item, items, list;
    this.annotator.toolbar = this.toolbar = $(this.html);
    if (this.options.container != null) {
      $(this.options.container).append(this.toolbar);
    } else {
      $(this.element).append(this.toolbar);
    }
    items = [
      {
        "title": "Close Sidebar",
        "class": "annotator-frame-button--sidebar_close h-icon-close",
        "name": "sidebar-close",
        "on": {
          "click": (function(_this) {
            return function(event) {
              event.preventDefault();
              event.stopPropagation();
              _this.annotator.hide();
              return _this.toolbar.find('[name=sidebar-close]').hide();
            };
          })(this)
        }
      }, {
        "title": "Toggle or Resize Sidebar",
        "class": "annotator-frame-button--sidebar_toggle h-icon-chevron-left",
        "name": "sidebar-toggle",
        "on": {
          "click": (function(_this) {
            return function(event) {
              var collapsed;
              event.preventDefault();
              event.stopPropagation();
              collapsed = _this.annotator.frame.hasClass('annotator-collapsed');
              if (collapsed) {
                return _this.annotator.show();
              } else {
                return _this.annotator.hide();
              }
            };
          })(this)
        }
      }, {
        "title": "Hide Highlights",
        "class": "h-icon-visibility",
        "name": "highlight-visibility",
        "on": {
          "click": (function(_this) {
            return function(event) {
              var state;
              event.preventDefault();
              event.stopPropagation();
              state = !_this.annotator.visibleHighlights;
              return _this.annotator.setAllVisibleHighlights(state);
            };
          })(this)
        }
      }, {
        "title": "New Page Note",
        "class": "h-icon-note",
        "name": "insert-comment",
        "on": {
          "click": (function(_this) {
            return function(event) {
              event.preventDefault();
              event.stopPropagation();
              _this.annotator.createAnnotation();
              return _this.annotator.show();
            };
          })(this)
        }
      }, {
        "title": "Add to TaskSpace",
        "class": "h-icon-add",
        "name": "add-to-ts",
        "on": {
          "click": (function(_this) {
            return function(event) {
              event.preventDefault();
              event.stopPropagation();
              return _this.annotator.addToTaskSpace();
            };
          })(this)
        }
      }, {
        "title": "Web Clip",
        "class": "h-icon-paragraph-justify",
        "name": "web-clip",
        "on": {
          "click": (function(_this) {
            return function(event) {
              event.preventDefault();
              event.stopPropagation();
              _this.annotator.showClipper();
              return _this.annotator.show();
            };
          })(this)
        }
      }, {
        "title": "Enable Or Disable Image,Table Annotations",
        "class": "h-icon-toggle-off",
        "name": "Enable-html-annotations",
        "on": {
          "click": (function(_this) {
            return function(event) {
              event.preventDefault();
              event.stopPropagation();
              if ($(event.currentTarget).hasClass("h-icon-toggle-off")) {
                _this.annotator.enableOrDisableHtmlObjectAnnotaion(true, true);
                $(event.currentTarget).removeClass("h-icon-toggle-off");
                return $(event.currentTarget).addClass("h-icon-toggle-on");
              } else {
                _this.annotator.enableOrDisableHtmlObjectAnnotaion(false, true);
                $(event.currentTarget).removeClass("h-icon-toggle-on");
                return $(event.currentTarget).addClass("h-icon-toggle-off");
              }
            };
          })(this)
        }
      }
    ];
    this.buttons = $((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        results.push(makeButton(item));
      }
      return results;
    })());
    list = $('<ul></ul>');
    this.buttons.appendTo(list);
    this.toolbar.append(list);
    return this.toolbar.on('mouseup', 'a', function(event) {
      return $(event.target).blur();
    });
  };

  Toolbar.prototype.onSetVisibleHighlights = function(state) {
    if (state) {
      return $('[name=highlight-visibility]').removeClass('h-icon-visibility-off').addClass('h-icon-visibility').prop('title', 'Hide Highlights');
    } else {
      return $('[name=highlight-visibility]').removeClass('h-icon-visibility').addClass('h-icon-visibility-off').prop('title', 'Show Highlights');
    }
  };

  Toolbar.prototype.disableMinimizeBtn = function() {
    return $('[name=sidebar-toggle]').remove();
  };

  Toolbar.prototype.disableHighlightsBtn = function() {
    return $('[name=highlight-visibility]').remove();
  };

  Toolbar.prototype.disableNewNoteBtn = function() {
    return $('[name=insert-comment]').remove();
  };

  Toolbar.prototype.disableCloseBtn = function() {
    return $('[name=sidebar-close]').remove();
  };

  Toolbar.prototype.disableWebClipperBtn = function() {
    return $('[name=web-clip]').remove();
  };

  Toolbar.prototype.getWidth = function() {
    return parseInt(window.getComputedStyle(this.toolbar[0]).width);
  };

  Toolbar.prototype.hideCloseBtn = function() {
    return $('[name=sidebar-close]').hide();
  };

  Toolbar.prototype.showCloseBtn = function() {
    return $('[name=sidebar-close]').show();
  };

  Toolbar.prototype.hideAddToTSBtn = function() {
    return $('[name=add-to-ts]').hide();
  };

  Toolbar.prototype.showAddToTSBtn = function() {
    return $('[name=add-to-ts]').show();
  };

  Toolbar.prototype.showCollapseSidebarBtn = function() {
    return $('[name=sidebar-toggle]').removeClass('h-icon-chevron-left').addClass('h-icon-chevron-right');
  };

  Toolbar.prototype.showExpandSidebarBtn = function() {
    return $('[name=sidebar-toggle]').removeClass('h-icon-chevron-right').addClass('h-icon-chevron-left');
  };

  Toolbar.prototype.enableObjectAnnotations = function() {
    return $('[name=Enable-html-annotations]').removeClass('h-icon-toggle-off').addClass('h-icon-toggle-on');
  };

  Toolbar.prototype.disableObjectAnnotations = function() {
    return $('[name=Enable-html-annotations]').removeClass('h-icon-toggle-on').addClass('h-icon-toggle-off');
  };

  return Toolbar;

})(Plugin);


},{"../plugin":62,"jquery":"jquery"}],70:[function(_dereq_,module,exports){
'use strict';

var elementFilter = _dereq_('./element-filters');

/**
 * Returns true if the start point of a selection occurs after the end point,
 * in document order.
 */
function isSelectionBackwards(selection) {
  if (selection.focusNode === selection.anchorNode) {
    return selection.focusOffset < selection.anchorOffset;
  }

  var range = selection.getRangeAt(0);
  return range.startContainer === selection.focusNode;
}

/**
 * Returns true if `node` lies within a range.
 *
 * This is a simplified version of `Range.isPointInRange()` for compatibility
 * with IE.
 *
 * @param {Range} range
 * @param {Node} node
 */
function isNodeInRange(range, node) {
  if (node === range.startContainer || node === range.endContainer) {
    return true;
  }

  var nodeRange = node.ownerDocument.createRange();
  nodeRange.selectNode(node);
  var isAtOrBeforeStart = range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0;
  var isAtOrAfterEnd = range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0;
  nodeRange.detach();
  return isAtOrBeforeStart && isAtOrAfterEnd;
}

/**
 * Iterate over all Node(s) in `range` in document order and invoke `callback`
 * for each of them.
 *
 * @param {Range} range
 * @param {Function} callback
 */
function forEachNodeInRange(range, callback) {
  var root = range.commonAncestorContainer;

  // The `whatToShow`, `filter` and `expandEntityReferences` arguments are
  // mandatory in IE although optional according to the spec.
  var nodeIter = root.ownerDocument.createNodeIterator(root, NodeFilter.SHOW_ALL, null /* filter */, false /* expandEntityReferences */);

  var currentNode;
  while (currentNode = nodeIter.nextNode()) {
    // eslint-disable-line no-cond-assign
    if (isNodeInRange(range, currentNode)) {
      callback(currentNode);
    }
  }
}

/**
 * Returns the bounding rectangles of non-whitespace text nodes in `range`.
 *
 * @param {Range} range
 * @return {Array<Rect>} Array of bounding rects in viewport coordinates.
 */
function getTextBoundingBoxes(range) {
  var whitespaceOnly = /^\s*$/;
  var textNodes = [];
  forEachNodeInRange(range, function (node) {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.match(whitespaceOnly)) {
      textNodes.push(node);
    } else if (elementFilter.isAllowedElement(node)) {
      textNodes.push(node);
    }
  });

  var rects = [];
  textNodes.forEach(function (node) {
    var nodeRange = node.ownerDocument.createRange();
    nodeRange.selectNodeContents(node);
    if (node === range.startContainer) {
      nodeRange.setStart(node, range.startOffset);
    }
    if (node === range.endContainer) {
      nodeRange.setEnd(node, range.endOffset);
    }

    var viewportRects = [];
    if (elementFilter.isAllowedElement(node)) {
      // translate from viewport to document coordinates
      viewportRects = Array.from(node.getClientRects());
    } else if (nodeRange.collapsed) {
      // If the range ends at the start of this text node or starts at the end
      // of this node then do not include it.
      return;
    } else {
      // Measure the range and translate from viewport to document coordinates
      viewportRects = Array.from(nodeRange.getClientRects());
    }

    nodeRange.detach();
    rects = rects.concat(viewportRects);
  });
  return rects;
}

/**
 * Returns the rectangle, in viewport coordinates, for the line of text
 * containing the focus point of a Selection.
 *
 * Returns null if the selection is empty.
 *
 * @param {Selection} selection
 * @return {Rect|null}
 */
function selectionFocusRect(selection) {
  if (selection.isCollapsed) {
    return null;
  }
  var textBoxes = getTextBoundingBoxes(selection.getRangeAt(0));
  if (textBoxes.length === 0) {
    return null;
  }

  if (isSelectionBackwards(selection)) {
    return textBoxes[0];
  } else {
    return textBoxes[textBoxes.length - 1];
  }
}

module.exports = {
  getTextBoundingBoxes: getTextBoundingBoxes,
  isNodeInRange: isNodeInRange,
  isSelectionBackwards: isSelectionBackwards,
  selectionFocusRect: selectionFocusRect,
  forEachNodeInRange: forEachNodeInRange
};

},{"./element-filters":50}],71:[function(_dereq_,module,exports){
'use strict';

var observable = _dereq_('./util/observable');

/** Returns the selected `DOMRange` in `document`. */
function selectedRange(document) {
  var selection = document.getSelection();
  if (!selection.rangeCount || selection.getRangeAt(0).collapsed) {
    return null;
  } else {
    return selection.getRangeAt(0);
  }
}

/**
 * Returns an Observable stream of text selections in the current document.
 *
 * New values are emitted when the user finishes making a selection
 * (represented by a `DOMRange`) or clears a selection (represented by `null`).
 *
 * A value will be emitted with the selected range at the time of subscription
 * on the next tick.
 *
 * @return Observable<DOMRange|null>
 */
function selections(document) {

  // Get a stream of selection changes that occur whilst the user is not
  // making a selection with the mouse.
  var isMouseDown;
  var selectionEvents = observable.listen(document, ['mousedown', 'mouseup', 'selectionchange']).filter(function (event) {
    if (event.type === 'mousedown' || event.type === 'mouseup') {
      isMouseDown = event.type === 'mousedown';
      return false;
    } else {
      return !isMouseDown;
    }
  });

  var events = observable.merge([
  // Add a delay before checking the state of the selection because
  // the selection is not updated immediately after a 'mouseup' event
  // but only on the next tick of the event loop.
  observable.buffer(10, observable.listen(document, ['mouseup'])),

  // Buffer selection changes to avoid continually emitting events whilst the
  // user drags the selection handles on mobile devices
  observable.buffer(100, selectionEvents),

  // Emit an initial event on the next tick
  observable.delay(0, observable.Observable.of({}))]);

  return events.map(function () {
    return selectedRange(document);
  });
}

module.exports = selections;

},{"./util/observable":76}],72:[function(_dereq_,module,exports){
'use strict';

var SIDEBAR_TRIGGER_BTN_ATTR = 'data-hypothesis-trigger';

/**
 * Show the sidebar when user clicks on an element with the
 * trigger data attribute.
 *
 * @param {Element} rootEl - The DOM element which contains the trigger elements.
 * @param {Object} showFn - Function which shows the sidebar.
 */

function trigger(rootEl, showFn) {

  var triggerElems = rootEl.querySelectorAll('[' + SIDEBAR_TRIGGER_BTN_ATTR + ']');

  Array.from(triggerElems).forEach(function (triggerElem) {
    triggerElem.addEventListener('click', handleCommand);
  });

  function handleCommand(event) {
    showFn();
    event.stopPropagation();
  }
}

module.exports = trigger;

},{}],73:[function(_dereq_,module,exports){
var Hammer, Host, MIN_RESIZE, Sidebar, annotationCounts, events, extend, features, raf, sidebarTrigger,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

extend = _dereq_('extend');

raf = _dereq_('raf');

Hammer = _dereq_('hammerjs');

Host = _dereq_('./host');

annotationCounts = _dereq_('./annotation-counts');

sidebarTrigger = _dereq_('./sidebar-trigger');

events = _dereq_('../shared/bridge-events');

features = _dereq_('./features');

MIN_RESIZE = 280;

module.exports = Sidebar = (function(superClass) {
  extend1(Sidebar, superClass);

  Sidebar.prototype.options = {
    Document: {},
    TextSelection: {},
    BucketBar: {
      container: '.annotator-frame'
    },
    Toolbar: {
      container: '.annotator-frame'
    }
  };

  Sidebar.prototype.renderFrame = null;

  Sidebar.prototype.gestureState = null;

  function Sidebar(element, config) {
    this.onSwipe = bind(this.onSwipe, this);
    this.onPan = bind(this.onPan, this);
    this._notifyOfLayoutChange = bind(this._notifyOfLayoutChange, this);
    var ref, serviceConfig;
    Sidebar.__super__.constructor.apply(this, arguments);
    this.hide();
    if (config.openSidebar || config.annotations || config.query || config.group) {
      this.on('panelReady', (function(_this) {
        return function() {
          return _this.show();
        };
      })(this));
    }
    if (this.plugins.BucketBar != null) {
      this.plugins.BucketBar.element.on('click', (function(_this) {
        return function(event) {
          return _this.show();
        };
      })(this));
    }
    if (this.plugins.Toolbar != null) {
      this.toolbarWidth = this.plugins.Toolbar.getWidth();
      if (config.theme === 'clean') {
        this.plugins.Toolbar.disableMinimizeBtn();
        this.plugins.Toolbar.disableHighlightsBtn();
        this.plugins.Toolbar.disableNewNoteBtn();
      } else {
        this.plugins.Toolbar.disableCloseBtn();
      }
      if ((this.plugins.PDF != null) || !config.clipperAppUrl) {
        this.plugins.Toolbar.disableWebClipperBtn();
      }
      this._setupGestures();
    }
    serviceConfig = (ref = config.services) != null ? ref[0] : void 0;
    if (serviceConfig) {
      this.onLoginRequest = serviceConfig.onLoginRequest;
      this.onLogoutRequest = serviceConfig.onLogoutRequest;
      this.onSignupRequest = serviceConfig.onSignupRequest;
      this.onProfileRequest = serviceConfig.onProfileRequest;
      this.onAboutRequest = serviceConfig.onAboutRequest;
      this.onHelpRequest = serviceConfig.onHelpRequest;
    }
    this.onLayoutChange = config.onLayoutChange;
    this._notifyOfLayoutChange(false);
    this._setupSidebarEvents();
  }

  Sidebar.prototype._setupSidebarEvents = function() {
    annotationCounts(document.body, this.crossframe);
    sidebarTrigger(document.body, (function(_this) {
      return function() {
        return _this.show();
      };
    })(this));
    features.init(this.crossframe);
    this.crossframe.on('showSidebar', (function(_this) {
      return function() {
        return _this.show();
      };
    })(this));
    this.crossframe.on('hideSidebar', (function(_this) {
      return function() {
        return _this.hide();
      };
    })(this));
    this.crossframe.on(events.LOGIN_REQUESTED, (function(_this) {
      return function() {
        if (_this.onLoginRequest) {
          return _this.onLoginRequest();
        }
      };
    })(this));
    this.crossframe.on(events.LOGOUT_REQUESTED, (function(_this) {
      return function() {
        if (_this.onLogoutRequest) {
          return _this.onLogoutRequest();
        }
      };
    })(this));
    this.crossframe.on(events.SIGNUP_REQUESTED, (function(_this) {
      return function() {
        if (_this.onSignupRequest) {
          return _this.onSignupRequest();
        }
      };
    })(this));
    this.crossframe.on(events.PROFILE_REQUESTED, (function(_this) {
      return function() {
        if (_this.onProfileRequest) {
          return _this.onProfileRequest();
        }
      };
    })(this));
    this.crossframe.on(events.ABOUT_REQUESTED, (function(_this) {
      return function() {
        if (_this.onAboutRequest) {
          return _this.onAboutRequest();
        }
      };
    })(this));
    this.crossframe.on(events.HELP_REQUESTED, (function(_this) {
      return function() {
        if (_this.onHelpRequest) {
          return _this.onHelpRequest();
        }
      };
    })(this));
    return this;
  };

  Sidebar.prototype._setupGestures = function() {
    var $toggle, mgr, pan, swipe;
    $toggle = this.toolbar.find('[name=sidebar-toggle]');
    if ($toggle[0]) {
      $toggle.on('touchmove', function(event) {
        return event.preventDefault();
      });
      mgr = new Hammer.Manager($toggle[0]).on('panstart panend panleft panright', this.onPan).on('swipeleft swiperight', this.onSwipe);
      pan = mgr.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_HORIZONTAL
      }));
      swipe = mgr.add(new Hammer.Swipe({
        direction: Hammer.DIRECTION_HORIZONTAL
      }));
      swipe.recognizeWith(pan);
      this._initializeGestureState();
      return this;
    }
  };

  Sidebar.prototype._initializeGestureState = function() {
    return this.gestureState = {
      initial: null,
      final: null
    };
  };

  Sidebar.prototype._updateLayout = function() {
    if (this.renderFrame) {
      return;
    }
    return this.renderFrame = raf((function(_this) {
      return function() {
        var m, w;
        _this.renderFrame = null;
        if (_this.gestureState.final !== _this.gestureState.initial) {
          m = _this.gestureState.final;
          w = -m;
          _this.frame.css('margin-left', m + "px");
          if (w >= MIN_RESIZE) {
            _this.frame.css('width', w + "px");
          }
          return _this._notifyOfLayoutChange();
        }
      };
    })(this));
  };


  /**
   * Notify integrator when sidebar layout changes via `onLayoutChange` callback.
   *
   * @param [boolean] explicitExpandedState - `true` or `false` if the sidebar
   *   is being directly opened or closed, as opposed to being resized via
   *   the sidebar's drag handles.
   */

  Sidebar.prototype._notifyOfLayoutChange = function(explicitExpandedState) {
    var computedStyle, expanded, frameVisibleWidth, leftMargin, rect, toolbarWidth, width;
    toolbarWidth = this.toolbarWidth || 0;
    if (this.onLayoutChange) {
      rect = this.frame[0].getBoundingClientRect();
      computedStyle = window.getComputedStyle(this.frame[0]);
      width = parseInt(computedStyle.width);
      leftMargin = parseInt(computedStyle.marginLeft);
      frameVisibleWidth = toolbarWidth;
      if (explicitExpandedState != null) {
        if (explicitExpandedState) {
          frameVisibleWidth += width;
        }
      } else {
        if (leftMargin < MIN_RESIZE) {
          frameVisibleWidth += -leftMargin;
        } else {
          frameVisibleWidth += width;
        }
      }
      expanded = frameVisibleWidth > toolbarWidth;
      return this.onLayoutChange({
        expanded: expanded,
        width: expanded ? frameVisibleWidth : toolbarWidth,
        height: rect.height
      });
    }
  };

  Sidebar.prototype.onPan = function(event) {
    var d, m;
    switch (event.type) {
      case 'panstart':
        this._initializeGestureState();
        this.frame.addClass('annotator-no-transition');
        this.frame.css('pointer-events', 'none');
        return this.gestureState.initial = parseInt(getComputedStyle(this.frame[0]).marginLeft);
      case 'panend':
        this.frame.removeClass('annotator-no-transition');
        this.frame.css('pointer-events', '');
        if (this.gestureState.final <= -MIN_RESIZE) {
          this.show();
        } else {
          this.hide();
        }
        return this._initializeGestureState();
      case 'panleft':
      case 'panright':
        if (this.gestureState.initial == null) {
          return;
        }
        m = this.gestureState.initial;
        d = event.deltaX;
        this.gestureState.final = Math.min(Math.round(m + d), 0);
        return this._updateLayout();
    }
  };

  Sidebar.prototype.onSwipe = function(event) {
    switch (event.type) {
      case 'swipeleft':
        return this.show();
      case 'swiperight':
        return this.hide();
    }
  };

  Sidebar.prototype.show = function() {
    this.crossframe.call('sidebarOpened');
    this.frame.css({
      'margin-left': (-1 * this.frame.width()) + "px"
    });
    this.frame.removeClass('annotator-collapsed');
    if (this.plugins.Toolbar != null) {
      this.plugins.Toolbar.showCollapseSidebarBtn();
      this.plugins.Toolbar.showCloseBtn();
    }
    if (this.options.showHighlights === 'whenSidebarOpen') {
      this.setVisibleHighlights(true);
    }
    return this._notifyOfLayoutChange(true);
  };

  Sidebar.prototype.hide = function() {
    this.frame.css({
      'margin-left': ''
    });
    this.frame.addClass('annotator-collapsed');
    this.plugins.Toolbar.hideCloseBtn();
    if (this.plugins.Toolbar != null) {
      this.plugins.Toolbar.showExpandSidebarBtn();
    }
    if (this.options.showHighlights === 'whenSidebarOpen') {
      this.setVisibleHighlights(false);
    }
    return this._notifyOfLayoutChange(false);
  };

  Sidebar.prototype.isOpen = function() {
    return !this.frame.hasClass('annotator-collapsed');
  };

  Sidebar.prototype.setAllVisibleHighlights = function(shouldShowHighlights) {
    this.crossframe.call('setVisibleHighlights', shouldShowHighlights);
    return this.publish('setVisibleHighlights', shouldShowHighlights);
  };

  return Sidebar;

})(Host);


},{"../shared/bridge-events":80,"./annotation-counts":42,"./features":51,"./host":58,"./sidebar-trigger":72,"extend":24,"hammerjs":25,"raf":30}],74:[function(_dereq_,module,exports){
/*'use strict';

var url = document.location.href;
function urlChanges() {
	return setInterval(function(){ 
		if(url != document.location.href) {
			
			window.location.reload();
		}
	}, 1000);
}

module.exports = urlChanges; */

'use strict';

var observable = _dereq_('./util/observable');

var patched = false;
var url = document.location.href;

function setupPushStateEvent(Document) {
  if (patched) {
    return;
  }

  setInterval(function () {
    if (url != document.location.href) {
      window.dispatchEvent(new Event('urlchanged'));
      //window.location.reload();
    }
  }, 1000);

  patched = true;
}

function urlChanges(Document) {
  setupPushStateEvent(Document);
  return observable.listen(window, ['urlchanged']).map(function () {
    Document.getDocumentMetadata();
    url = document.location.href;
    return url;
  });
}

module.exports = urlChanges;

/*'use strict';

var observable = require('./util/observable');

var patched = false;


function setupPushStateEvent() {
  if (patched) {
    return;
  }

  var origReplaceState = History.prototype.replaceState;
  History.prototype.replaceState = function () {
    origReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
  };

  var origPushState = History.prototype.pushState;
  History.prototype.pushState = function () {
    origPushState.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
  };

  patched = true;
}


function urlChanges() {
  setupPushStateEvent();
  return observable.listen(window, ['pushstate', 'popstate']).map(function () {
     
    return document.location.href;
  });
}

module.exports = urlChanges;*/

},{"./util/observable":76}],75:[function(_dereq_,module,exports){
'use strict';

/**
 * Return all `<iframe>` elements under `container` which are annotate-able.
 *
 * @param {Element} container
 * @return {HTMLIFrameElement[]}
 */

function findFrames(container) {
  var frames = Array.from(container.getElementsByTagName('iframe'));
  return frames.filter(shouldEnableAnnotation);
}

// Check if the iframe has already been injected
function hasHypothesis(iframe) {
  return iframe.contentWindow.__hypothesis_frame === true;
}

// Inject embed.js into the iframe
function injectHypothesis(iframe, scriptUrl, config) {
  var configElement = document.createElement('script');
  configElement.className = 'js-hypothesis-config';
  configElement.type = 'application/json';
  configElement.innerText = JSON.stringify(config);

  var src = scriptUrl;
  var embedElement = document.createElement('script');
  embedElement.className = 'js-hypothesis-embed';
  embedElement.async = true;
  embedElement.src = src;

  iframe.contentDocument.body.appendChild(configElement);
  iframe.contentDocument.body.appendChild(embedElement);
}

// Check if we can access this iframe's document
function isAccessible(iframe) {
  try {
    return !!iframe.contentDocument;
  } catch (e) {
    return false;
  }
}

/**
 * Return `true` if an iframe should be made annotate-able.
 *
 * To enable annotation, an iframe must be opted-in by adding the
 * "enable-annotation" attribute and must be visible.
 *
 * @param  {HTMLIFrameElement} iframe the frame being checked
 * @returns {boolean}   result of our validity checks
 */
function shouldEnableAnnotation(iframe) {
  // Ignore the Hypothesis sidebar.
  var isNotClientFrame = !iframe.classList.contains('h-sidebar-iframe');

  // Require iframes to opt into annotation support.
  //
  // Eventually we may want annotation to be enabled by default for iframes that
  // pass certain tests. However we need to resolve a number of issues before we
  // can do that. See https://github.com/hypothesis/client/issues/530
  var enabled = iframe.hasAttribute('enable-annotation');

  return isNotClientFrame && enabled;
}

function isDocumentReady(iframe, callback) {
  if (iframe.contentDocument.readyState === 'loading') {
    iframe.contentDocument.addEventListener('DOMContentLoaded', function () {
      callback();
    });
  } else {
    callback();
  }
}

function isLoaded(iframe, callback) {
  if (iframe.contentDocument.readyState !== 'complete') {
    iframe.addEventListener('load', function () {
      callback();
    });
  } else {
    callback();
  }
}

module.exports = {
  findFrames: findFrames,
  hasHypothesis: hasHypothesis,
  injectHypothesis: injectHypothesis,
  isAccessible: isAccessible,
  isLoaded: isLoaded,
  isDocumentReady: isDocumentReady
};

},{}],76:[function(_dereq_,module,exports){
'use strict';

/**
 * Functions (aka. 'operators') for generating and manipulating streams of
 * values using the Observable API.
 */

var Observable = _dereq_('zen-observable');

/**
 * Returns an observable of events emitted by a DOM event source
 * (eg. an Element, Document or Window).
 *
 * @param {EventTarget} src - The event source.
 * @param {Array<string>} eventNames - List of events to subscribe to
 */
function listen(src, eventNames) {
  return new Observable(function (observer) {
    var onNext = function onNext(event) {
      observer.next(event);
    };

    eventNames.forEach(function (event) {
      src.addEventListener(event, onNext);
    });

    return function () {
      eventNames.forEach(function (event) {
        src.removeEventListener(event, onNext);
      });
    };
  });
}

/**
 * Delay events from a source Observable by `delay` ms.
 */
function delay(delay, src) {
  return new Observable(function (obs) {
    var timeouts = [];
    var sub = src.subscribe({
      next: function next(value) {
        var t = setTimeout(function () {
          timeouts = timeouts.filter(function (other) {
            return other !== t;
          });
          obs.next(value);
        }, delay);
        timeouts.push(t);
      }
    });
    return function () {
      timeouts.forEach(clearTimeout);
      sub.unsubscribe();
    };
  });
}

/**
 * Buffers events from a source Observable, waiting for a pause of `delay`
 * ms with no events before emitting the last value from `src`.
 *
 * @param {number} delay
 * @param {Observable<T>} src
 * @return {Observable<T>}
 */
function buffer(delay, src) {
  return new Observable(function (obs) {
    var lastValue;
    var timeout;

    function onNext() {
      obs.next(lastValue);
    }

    var sub = src.subscribe({
      next: function next(value) {
        lastValue = value;
        clearTimeout(timeout);
        timeout = setTimeout(onNext, delay);
      }
    });

    return function () {
      sub.unsubscribe();
      clearTimeout(timeout);
    };
  });
}

/**
 * Merges multiple streams of values into a single stream.
 *
 * @param {Array<Observable>} sources
 * @return Observable
 */
function merge(sources) {
  return new Observable(function (obs) {
    var subs = sources.map(function (src) {
      return src.subscribe({
        next: function next(value) {
          obs.next(value);
        }
      });
    });

    return function () {
      subs.forEach(function (sub) {
        sub.unsubscribe();
      });
    };
  });
}

/** Drop the first `n` events from the `src` Observable. */
function drop(src, n) {
  var count = 0;
  return src.filter(function () {
    ++count;
    return count > n;
  });
}

module.exports = {
  buffer: buffer,
  delay: delay,
  drop: drop,
  listen: listen,
  merge: merge,
  Observable: Observable
};

},{"zen-observable":32}],77:[function(_dereq_,module,exports){
'use strict';

var baseURI = _dereq_('document-base-uri');

/**
 * Return a normalized version of a URI.
 *
 * This makes it absolute and strips the fragment identifier.
 *
 * @param {string} uri - Relative or absolute URL
 * @param {string} [base] - Base URL to resolve relative to. Defaults to
 *   the document's base URL.
 */
function normalizeURI(uri) {
  var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : baseURI;

  var absUrl = new URL(uri, base).href;

  // Remove the fragment identifier.
  // This is done on the serialized URL rather than modifying `url.hash` due to
  // a bug in Safari.
  // See https://github.com/hypothesis/h/issues/3471#issuecomment-226713750
  return absUrl.toString().replace(/#.*/, '');
}

module.exports = {
  normalizeURI: normalizeURI
};

},{"document-base-uri":5}],78:[function(_dereq_,module,exports){
(function(){function h(a){return function(){return this[a]}}function l(a){return function(){return a}}var m=this;
function aa(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function n(a){return"string"==typeof a}function ba(a,b,c){return a.call.apply(a.bind,arguments)}function da(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}
function q(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ba:da;return q.apply(null,arguments)}function ea(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}}
function r(a){var b=t;function c(){}c.prototype=b.prototype;a.u=b.prototype;a.prototype=new c;a.t=function(a,c,f){for(var g=Array(arguments.length-2),k=2;k<arguments.length;k++)g[k-2]=arguments[k];return b.prototype[c].apply(a,g)}}Function.prototype.bind=Function.prototype.bind||function(a,b){if(1<arguments.length){var c=Array.prototype.slice.call(arguments,1);c.unshift(this,a);return q.apply(null,c)}return q(this,a)};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function u(a,b,c){this.a=a;this.b=b||1;this.d=c||1};var fa=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function v(a,b){return-1!=a.indexOf(b)}function ga(a,b){return a<b?-1:a>b?1:0};var w=Array.prototype,ha=w.indexOf?function(a,b,c){return w.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(n(a))return n(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},x=w.forEach?function(a,b,c){w.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},ia=w.filter?function(a,b,c){return w.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,g=n(a)?
a.split(""):a,k=0;k<d;k++)if(k in g){var p=g[k];b.call(c,p,k,a)&&(e[f++]=p)}return e},z=w.reduce?function(a,b,c,d){d&&(b=q(b,d));return w.reduce.call(a,b,c)}:function(a,b,c,d){var e=c;x(a,function(c,g){e=b.call(d,e,c,g,a)});return e},ja=w.some?function(a,b,c){return w.some.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return!0;return!1};
function ka(a,b){var c;a:{c=a.length;for(var d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){c=e;break a}c=-1}return 0>c?null:n(a)?a.charAt(c):a[c]}function la(a){return w.concat.apply(w,arguments)}function ma(a,b,c){return 2>=arguments.length?w.slice.call(a,b):w.slice.call(a,b,c)};function na(a){var b=arguments.length;if(1==b&&"array"==aa(arguments[0]))return na.apply(null,arguments[0]);for(var c={},d=0;d<b;d++)c[arguments[d]]=!0;return c};var A;a:{var oa=m.navigator;if(oa){var pa=oa.userAgent;if(pa){A=pa;break a}}A=""};function B(){return v(A,"Edge")};var qa=v(A,"Opera")||v(A,"OPR"),C=v(A,"Edge")||v(A,"Trident")||v(A,"MSIE"),ra=v(A,"Gecko")&&!(v(A.toLowerCase(),"webkit")&&!B())&&!(v(A,"Trident")||v(A,"MSIE"))&&!B(),sa=v(A.toLowerCase(),"webkit")&&!B();function ta(){var a=A;if(ra)return/rv\:([^\);]+)(\)|;)/.exec(a);if(C&&B())return/Edge\/([\d\.]+)/.exec(a);if(C)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(sa)return/WebKit\/(\S+)/.exec(a)}function ua(){var a=m.document;return a?a.documentMode:void 0}
var va=function(){if(qa&&m.opera){var a=m.opera.version;return"function"==aa(a)?a():a}var a="",b=ta();b&&(a=b?b[1]:"");return C&&!B()&&(b=ua(),b>parseFloat(a))?String(b):a}(),wa={};
function xa(a){if(!wa[a]){for(var b=0,c=fa(String(va)).split("."),d=fa(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",k=d[f]||"",p=RegExp("(\\d*)(\\D*)","g"),y=RegExp("(\\d*)(\\D*)","g");do{var F=p.exec(g)||["","",""],ca=y.exec(k)||["","",""];if(0==F[0].length&&0==ca[0].length)break;b=ga(0==F[1].length?0:parseInt(F[1],10),0==ca[1].length?0:parseInt(ca[1],10))||ga(0==F[2].length,0==ca[2].length)||ga(F[2],ca[2])}while(0==b)}wa[a]=0<=b}}
function ya(a){return C&&(B()||za>=a)}var Aa=m.document,Ba=ua(),za=!Aa||!C||!Ba&&B()?void 0:Ba||("CSS1Compat"==Aa.compatMode?parseInt(va,10):5);/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
var D=C&&!ya(9),Ca=C&&!ya(8);/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function E(a,b,c,d){this.a=a;this.nodeName=c;this.nodeValue=d;this.nodeType=2;this.parentNode=this.ownerElement=b}function Da(a,b){var c=Ca&&"href"==b.nodeName?a.getAttribute(b.nodeName,2):b.nodeValue;return new E(b,a,b.nodeName,c)};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function Ea(a){this.b=a;this.a=0}function Fa(a){a=a.match(Ga);for(var b=0;b<a.length;b++)Ha.test(a[b])&&a.splice(b,1);return new Ea(a)}var Ga=RegExp("\\$?(?:(?![0-9-])[\\w-]+:)?(?![0-9-])[\\w-]+|\\/\\/|\\.\\.|::|\\d+(?:\\.\\d*)?|\\.\\d+|\"[^\"]*\"|'[^']*'|[!<>]=|\\s+|.","g"),Ha=/^\s/;function G(a,b){return a.b[a.a+(b||0)]}function H(a){return a.b[a.a++]}function Ia(a){return a.b.length<=a.a};na("area base br col command embed hr img input keygen link meta param source track wbr".split(" "));!ra&&!C||C&&ya(9)||ra&&xa("1.9.1");C&&xa("9");function Ja(a,b){if(a.contains&&1==b.nodeType)return a==b||a.contains(b);if("undefined"!=typeof a.compareDocumentPosition)return a==b||Boolean(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b.parentNode;return b==a}
function Ka(a,b){if(a==b)return 0;if(a.compareDocumentPosition)return a.compareDocumentPosition(b)&2?1:-1;if(C&&!ya(9)){if(9==a.nodeType)return-1;if(9==b.nodeType)return 1}if("sourceIndex"in a||a.parentNode&&"sourceIndex"in a.parentNode){var c=1==a.nodeType,d=1==b.nodeType;if(c&&d)return a.sourceIndex-b.sourceIndex;var e=a.parentNode,f=b.parentNode;return e==f?La(a,b):!c&&Ja(e,b)?-1*Ma(a,b):!d&&Ja(f,a)?Ma(b,a):(c?a.sourceIndex:e.sourceIndex)-(d?b.sourceIndex:f.sourceIndex)}d=9==a.nodeType?a:a.ownerDocument||
a.document;c=d.createRange();c.selectNode(a);c.collapse(!0);d=d.createRange();d.selectNode(b);d.collapse(!0);return c.compareBoundaryPoints(m.Range.START_TO_END,d)}function Ma(a,b){var c=a.parentNode;if(c==b)return-1;for(var d=b;d.parentNode!=c;)d=d.parentNode;return La(d,a)}function La(a,b){for(var c=b;c=c.previousSibling;)if(c==a)return-1;return 1};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function I(a){var b=null,c=a.nodeType;1==c&&(b=a.textContent,b=void 0==b||null==b?a.innerText:b,b=void 0==b||null==b?"":b);if("string"!=typeof b)if(D&&"title"==a.nodeName.toLowerCase()&&1==c)b=a.text;else if(9==c||1==c){a=9==c?a.documentElement:a.firstChild;for(var c=0,d=[],b="";a;){do 1!=a.nodeType&&(b+=a.nodeValue),D&&"title"==a.nodeName.toLowerCase()&&(b+=a.text),d[c++]=a;while(a=a.firstChild);for(;c&&!(a=d[--c].nextSibling););}}else b=a.nodeValue;return""+b}
function J(a,b,c){if(null===b)return!0;try{if(!a.getAttribute)return!1}catch(d){return!1}Ca&&"class"==b&&(b="className");return null==c?!!a.getAttribute(b):a.getAttribute(b,2)==c}function Na(a,b,c,d,e){return(D?Oa:Pa).call(null,a,b,n(c)?c:null,n(d)?d:null,e||new K)}
function Oa(a,b,c,d,e){if(a instanceof L||8==a.b||c&&null===a.b){var f=b.all;if(!f)return e;a=Qa(a);if("*"!=a&&(f=b.getElementsByTagName(a),!f))return e;if(c){for(var g=[],k=0;b=f[k++];)J(b,c,d)&&g.push(b);f=g}for(k=0;b=f[k++];)"*"==a&&"!"==b.tagName||M(e,b);return e}Ra(a,b,c,d,e);return e}
function Pa(a,b,c,d,e){b.getElementsByName&&d&&"name"==c&&!C?(b=b.getElementsByName(d),x(b,function(b){a.a(b)&&M(e,b)})):b.getElementsByClassName&&d&&"class"==c?(b=b.getElementsByClassName(d),x(b,function(b){b.className==d&&a.a(b)&&M(e,b)})):a instanceof N?Ra(a,b,c,d,e):b.getElementsByTagName&&(b=b.getElementsByTagName(a.d()),x(b,function(a){J(a,c,d)&&M(e,a)}));return e}
function Sa(a,b,c,d,e){var f;if((a instanceof L||8==a.b||c&&null===a.b)&&(f=b.childNodes)){var g=Qa(a);if("*"!=g&&(f=ia(f,function(a){return a.tagName&&a.tagName.toLowerCase()==g}),!f))return e;c&&(f=ia(f,function(a){return J(a,c,d)}));x(f,function(a){"*"==g&&("!"==a.tagName||"*"==g&&1!=a.nodeType)||M(e,a)});return e}return Ta(a,b,c,d,e)}function Ta(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)J(b,c,d)&&a.a(b)&&M(e,b);return e}
function Ra(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)J(b,c,d)&&a.a(b)&&M(e,b),Ra(a,b,c,d,e)}function Qa(a){if(a instanceof N){if(8==a.b)return"!";if(null===a.b)return"*"}return a.d()};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function K(){this.b=this.a=null;this.i=0}function Ua(a){this.d=a;this.a=this.b=null}function Va(a,b){if(!a.a)return b;if(!b.a)return a;for(var c=a.a,d=b.a,e=null,f=null,g=0;c&&d;){var f=c.d,k=d.d;f==k||f instanceof E&&k instanceof E&&f.a==k.a?(f=c,c=c.a,d=d.a):0<Ka(c.d,d.d)?(f=d,d=d.a):(f=c,c=c.a);(f.b=e)?e.a=f:a.a=f;e=f;g++}for(f=c||d;f;)f.b=e,e=e.a=f,g++,f=f.a;a.b=e;a.i=g;return a}function Wa(a,b){var c=new Ua(b);c.a=a.a;a.b?a.a.b=c:a.a=a.b=c;a.a=c;a.i++}
function M(a,b){var c=new Ua(b);c.b=a.b;a.a?a.b.a=c:a.a=a.b=c;a.b=c;a.i++}function Xa(a){return(a=a.a)?a.d:null}function Ya(a){return(a=Xa(a))?I(a):""}function O(a,b){return new Za(a,!!b)}function Za(a,b){this.d=a;this.b=(this.c=b)?a.b:a.a;this.a=null}function P(a){var b=a.b;if(null==b)return null;var c=a.a=b;a.b=a.c?b.b:b.a;return c.d};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function $a(a){switch(a.nodeType){case 1:return ea(ab,a);case 9:return $a(a.documentElement);case 11:case 10:case 6:case 12:return bb;default:return a.parentNode?$a(a.parentNode):bb}}function bb(){return null}function ab(a,b){if(a.prefix==b)return a.namespaceURI||"http://www.w3.org/1999/xhtml";var c=a.getAttributeNode("xmlns:"+b);return c&&c.specified?c.value||null:a.parentNode&&9!=a.parentNode.nodeType?ab(a.parentNode,b):null};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function t(a){this.g=a;this.b=this.e=!1;this.d=null}function Q(a){return"\n  "+a.toString().split("\n").join("\n  ")}function cb(a,b){a.e=b}function db(a,b){a.b=b}function R(a,b){var c=a.a(b);return c instanceof K?+Ya(c):+c}function S(a,b){var c=a.a(b);return c instanceof K?Ya(c):""+c}function eb(a,b){var c=a.a(b);return c instanceof K?!!c.i:!!c};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function fb(a,b,c){t.call(this,a.g);this.c=a;this.f=b;this.k=c;this.e=b.e||c.e;this.b=b.b||c.b;this.c==gb&&(c.b||c.e||4==c.g||0==c.g||!b.d?b.b||b.e||4==b.g||0==b.g||!c.d||(this.d={name:c.d.name,l:b}):this.d={name:b.d.name,l:c})}r(fb);
function hb(a,b,c,d,e){b=b.a(d);c=c.a(d);var f;if(b instanceof K&&c instanceof K){e=O(b);for(d=P(e);d;d=P(e))for(b=O(c),f=P(b);f;f=P(b))if(a(I(d),I(f)))return!0;return!1}if(b instanceof K||c instanceof K){b instanceof K?e=b:(e=c,c=b);e=O(e);b=typeof c;for(d=P(e);d;d=P(e)){switch(b){case "number":d=+I(d);break;case "boolean":d=!!I(d);break;case "string":d=I(d);break;default:throw Error("Illegal primitive type for comparison.");}if(a(d,c))return!0}return!1}return e?"boolean"==typeof b||"boolean"==typeof c?
a(!!b,!!c):"number"==typeof b||"number"==typeof c?a(+b,+c):a(b,c):a(+b,+c)}fb.prototype.a=function(a){return this.c.j(this.f,this.k,a)};fb.prototype.toString=function(){var a="Binary Expression: "+this.c,a=a+Q(this.f);return a+=Q(this.k)};function ib(a,b,c,d){this.a=a;this.p=b;this.g=c;this.j=d}ib.prototype.toString=h("a");var jb={};function T(a,b,c,d){if(jb.hasOwnProperty(a))throw Error("Binary operator already created: "+a);a=new ib(a,b,c,d);return jb[a.toString()]=a}
T("div",6,1,function(a,b,c){return R(a,c)/R(b,c)});T("mod",6,1,function(a,b,c){return R(a,c)%R(b,c)});T("*",6,1,function(a,b,c){return R(a,c)*R(b,c)});T("+",5,1,function(a,b,c){return R(a,c)+R(b,c)});T("-",5,1,function(a,b,c){return R(a,c)-R(b,c)});T("<",4,2,function(a,b,c){return hb(function(a,b){return a<b},a,b,c)});T(">",4,2,function(a,b,c){return hb(function(a,b){return a>b},a,b,c)});T("<=",4,2,function(a,b,c){return hb(function(a,b){return a<=b},a,b,c)});
T(">=",4,2,function(a,b,c){return hb(function(a,b){return a>=b},a,b,c)});var gb=T("=",3,2,function(a,b,c){return hb(function(a,b){return a==b},a,b,c,!0)});T("!=",3,2,function(a,b,c){return hb(function(a,b){return a!=b},a,b,c,!0)});T("and",2,2,function(a,b,c){return eb(a,c)&&eb(b,c)});T("or",1,2,function(a,b,c){return eb(a,c)||eb(b,c)});/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function kb(a,b){if(b.a.length&&4!=a.g)throw Error("Primary expression must evaluate to nodeset if filter has predicate(s).");t.call(this,a.g);this.c=a;this.f=b;this.e=a.e;this.b=a.b}r(kb);kb.prototype.a=function(a){a=this.c.a(a);return lb(this.f,a)};kb.prototype.toString=function(){var a;a="Filter:"+Q(this.c);return a+=Q(this.f)};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function mb(a,b){if(b.length<a.o)throw Error("Function "+a.h+" expects at least"+a.o+" arguments, "+b.length+" given");if(null!==a.n&&b.length>a.n)throw Error("Function "+a.h+" expects at most "+a.n+" arguments, "+b.length+" given");a.s&&x(b,function(b,d){if(4!=b.g)throw Error("Argument "+d+" to function "+a.h+" is not of type Nodeset: "+b);});t.call(this,a.g);this.f=a;this.c=b;cb(this,a.e||ja(b,function(a){return a.e}));db(this,a.r&&!b.length||a.q&&!!b.length||ja(b,function(a){return a.b}))}r(mb);
mb.prototype.a=function(a){return this.f.j.apply(null,la(a,this.c))};mb.prototype.toString=function(){var a="Function: "+this.f;if(this.c.length)var b=z(this.c,function(a,b){return a+Q(b)},"Arguments:"),a=a+Q(b);return a};function nb(a,b,c,d,e,f,g,k,p){this.h=a;this.g=b;this.e=c;this.r=d;this.q=e;this.j=f;this.o=g;this.n=void 0!==k?k:g;this.s=!!p}nb.prototype.toString=h("h");var ob={};
function U(a,b,c,d,e,f,g,k){if(ob.hasOwnProperty(a))throw Error("Function already created: "+a+".");ob[a]=new nb(a,b,c,d,!1,e,f,g,k)}U("boolean",2,!1,!1,function(a,b){return eb(b,a)},1);U("ceiling",1,!1,!1,function(a,b){return Math.ceil(R(b,a))},1);U("concat",3,!1,!1,function(a,b){var c=ma(arguments,1);return z(c,function(b,c){return b+S(c,a)},"")},2,null);U("contains",2,!1,!1,function(a,b,c){return v(S(b,a),S(c,a))},2);U("count",1,!1,!1,function(a,b){return b.a(a).i},1,1,!0);
U("false",2,!1,!1,l(!1),0);U("floor",1,!1,!1,function(a,b){return Math.floor(R(b,a))},1);U("id",4,!1,!1,function(a,b){function c(a){if(D){var b=e.all[a];if(b){if(b.nodeType&&a==b.id)return b;if(b.length)return ka(b,function(b){return a==b.id})}return null}return e.getElementById(a)}var d=a.a,e=9==d.nodeType?d:d.ownerDocument,d=S(b,a).split(/\s+/),f=[];x(d,function(a){a=c(a);!a||0<=ha(f,a)||f.push(a)});f.sort(Ka);var g=new K;x(f,function(a){M(g,a)});return g},1);U("lang",2,!1,!1,l(!1),1);
U("last",1,!0,!1,function(a){if(1!=arguments.length)throw Error("Function last expects ()");return a.d},0);U("local-name",3,!1,!0,function(a,b){var c=b?Xa(b.a(a)):a.a;return c?c.localName||c.nodeName.toLowerCase():""},0,1,!0);U("name",3,!1,!0,function(a,b){var c=b?Xa(b.a(a)):a.a;return c?c.nodeName.toLowerCase():""},0,1,!0);U("namespace-uri",3,!0,!1,l(""),0,1,!0);U("normalize-space",3,!1,!0,function(a,b){return(b?S(b,a):I(a.a)).replace(/[\s\xa0]+/g," ").replace(/^\s+|\s+$/g,"")},0,1);
U("not",2,!1,!1,function(a,b){return!eb(b,a)},1);U("number",1,!1,!0,function(a,b){return b?R(b,a):+I(a.a)},0,1);U("position",1,!0,!1,function(a){return a.b},0);U("round",1,!1,!1,function(a,b){return Math.round(R(b,a))},1);U("starts-with",2,!1,!1,function(a,b,c){b=S(b,a);a=S(c,a);return 0==b.lastIndexOf(a,0)},2);U("string",3,!1,!0,function(a,b){return b?S(b,a):I(a.a)},0,1);U("string-length",1,!1,!0,function(a,b){return(b?S(b,a):I(a.a)).length},0,1);
U("substring",3,!1,!1,function(a,b,c,d){c=R(c,a);if(isNaN(c)||Infinity==c||-Infinity==c)return"";d=d?R(d,a):Infinity;if(isNaN(d)||-Infinity===d)return"";c=Math.round(c)-1;var e=Math.max(c,0);a=S(b,a);if(Infinity==d)return a.substring(e);b=Math.round(d);return a.substring(e,c+b)},2,3);U("substring-after",3,!1,!1,function(a,b,c){b=S(b,a);a=S(c,a);c=b.indexOf(a);return-1==c?"":b.substring(c+a.length)},2);
U("substring-before",3,!1,!1,function(a,b,c){b=S(b,a);a=S(c,a);a=b.indexOf(a);return-1==a?"":b.substring(0,a)},2);U("sum",1,!1,!1,function(a,b){for(var c=O(b.a(a)),d=0,e=P(c);e;e=P(c))d+=+I(e);return d},1,1,!0);U("translate",3,!1,!1,function(a,b,c,d){b=S(b,a);c=S(c,a);var e=S(d,a);a=[];for(d=0;d<c.length;d++){var f=c.charAt(d);f in a||(a[f]=e.charAt(d))}c="";for(d=0;d<b.length;d++)f=b.charAt(d),c+=f in a?a[f]:f;return c},3);U("true",2,!1,!1,l(!0),0);/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function N(a,b){this.f=a;this.c=void 0!==b?b:null;this.b=null;switch(a){case "comment":this.b=8;break;case "text":this.b=3;break;case "processing-instruction":this.b=7;break;case "node":break;default:throw Error("Unexpected argument");}}function pb(a){return"comment"==a||"text"==a||"processing-instruction"==a||"node"==a}N.prototype.a=function(a){return null===this.b||this.b==a.nodeType};N.prototype.d=h("f");N.prototype.toString=function(){var a="Kind Test: "+this.f;null===this.c||(a+=Q(this.c));return a};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function qb(a){t.call(this,3);this.c=a.substring(1,a.length-1)}r(qb);qb.prototype.a=h("c");qb.prototype.toString=function(){return"Literal: "+this.c};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function L(a,b){this.h=a.toLowerCase();this.c=b?b.toLowerCase():"http://www.w3.org/1999/xhtml"}L.prototype.a=function(a){var b=a.nodeType;return 1!=b&&2!=b?!1:"*"!=this.h&&this.h!=a.nodeName.toLowerCase()?!1:this.c==(a.namespaceURI?a.namespaceURI.toLowerCase():"http://www.w3.org/1999/xhtml")};L.prototype.d=h("h");L.prototype.toString=function(){return"Name Test: "+("http://www.w3.org/1999/xhtml"==this.c?"":this.c+":")+this.h};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function rb(a){t.call(this,1);this.c=a}r(rb);rb.prototype.a=h("c");rb.prototype.toString=function(){return"Number: "+this.c};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function sb(a,b){t.call(this,a.g);this.f=a;this.c=b;this.e=a.e;this.b=a.b;if(1==this.c.length){var c=this.c[0];c.m||c.c!=tb||(c=c.k,"*"!=c.d()&&(this.d={name:c.d(),l:null}))}}r(sb);function ub(){t.call(this,4)}r(ub);ub.prototype.a=function(a){var b=new K;a=a.a;9==a.nodeType?M(b,a):M(b,a.ownerDocument);return b};ub.prototype.toString=l("Root Helper Expression");function vb(){t.call(this,4)}r(vb);vb.prototype.a=function(a){var b=new K;M(b,a.a);return b};vb.prototype.toString=l("Context Helper Expression");
function wb(a){return"/"==a||"//"==a}sb.prototype.a=function(a){var b=this.f.a(a);if(!(b instanceof K))throw Error("Filter expression must evaluate to nodeset.");a=this.c;for(var c=0,d=a.length;c<d&&b.i;c++){var e=a[c],f=O(b,e.c.a),g;if(e.e||e.c!=xb)if(e.e||e.c!=yb)for(g=P(f),b=e.a(new u(g));null!=(g=P(f));)g=e.a(new u(g)),b=Va(b,g);else g=P(f),b=e.a(new u(g));else{for(g=P(f);(b=P(f))&&(!g.contains||g.contains(b))&&b.compareDocumentPosition(g)&8;g=b);b=e.a(new u(g))}}return b};
sb.prototype.toString=function(){var a;a="Path Expression:"+Q(this.f);if(this.c.length){var b=z(this.c,function(a,b){return a+Q(b)},"Steps:");a+=Q(b)}return a};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function zb(a,b){this.a=a;this.b=!!b}
function lb(a,b,c){for(c=c||0;c<a.a.length;c++)for(var d=a.a[c],e=O(b),f=b.i,g,k=0;g=P(e);k++){var p=a.b?f-k:k+1;g=d.a(new u(g,p,f));if("number"==typeof g)p=p==g;else if("string"==typeof g||"boolean"==typeof g)p=!!g;else if(g instanceof K)p=0<g.i;else throw Error("Predicate.evaluate returned an unexpected type.");if(!p){p=e;g=p.d;var y=p.a;if(!y)throw Error("Next must be called at least once before remove.");var F=y.b,y=y.a;F?F.a=y:g.a=y;y?y.b=F:g.b=F;g.i--;p.a=null}}return b}
zb.prototype.toString=function(){return z(this.a,function(a,b){return a+Q(b)},"Predicates:")};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function V(a,b,c,d){t.call(this,4);this.c=a;this.k=b;this.f=c||new zb([]);this.m=!!d;b=this.f;b=0<b.a.length?b.a[0].d:null;a.b&&b&&(a=b.name,a=D?a.toLowerCase():a,this.d={name:a,l:b.l});a:{a=this.f;for(b=0;b<a.a.length;b++)if(c=a.a[b],c.e||1==c.g||0==c.g){a=!0;break a}a=!1}this.e=a}r(V);
V.prototype.a=function(a){var b=a.a,c=null,c=this.d,d=null,e=null,f=0;c&&(d=c.name,e=c.l?S(c.l,a):null,f=1);if(this.m)if(this.e||this.c!=Ab)if(a=O((new V(Bb,new N("node"))).a(a)),b=P(a))for(c=this.j(b,d,e,f);null!=(b=P(a));)c=Va(c,this.j(b,d,e,f));else c=new K;else c=Na(this.k,b,d,e),c=lb(this.f,c,f);else c=this.j(a.a,d,e,f);return c};V.prototype.j=function(a,b,c,d){a=this.c.d(this.k,a,b,c);return a=lb(this.f,a,d)};
V.prototype.toString=function(){var a;a="Step:"+Q("Operator: "+(this.m?"//":"/"));this.c.h&&(a+=Q("Axis: "+this.c));a+=Q(this.k);if(this.f.a.length){var b=z(this.f.a,function(a,b){return a+Q(b)},"Predicates:");a+=Q(b)}return a};function Cb(a,b,c,d){this.h=a;this.d=b;this.a=c;this.b=d}Cb.prototype.toString=h("h");var Db={};function W(a,b,c,d){if(Db.hasOwnProperty(a))throw Error("Axis already created: "+a);b=new Cb(a,b,c,!!d);return Db[a]=b}
W("ancestor",function(a,b){for(var c=new K,d=b;d=d.parentNode;)a.a(d)&&Wa(c,d);return c},!0);W("ancestor-or-self",function(a,b){var c=new K,d=b;do a.a(d)&&Wa(c,d);while(d=d.parentNode);return c},!0);
var tb=W("attribute",function(a,b){var c=new K,d=a.d();if("style"==d&&b.style&&D)return M(c,new E(b.style,b,"style",b.style.cssText)),c;var e=b.attributes;if(e)if(a instanceof N&&null===a.b||"*"==d)for(var d=0,f;f=e[d];d++)D?f.nodeValue&&M(c,Da(b,f)):M(c,f);else(f=e.getNamedItem(d))&&(D?f.nodeValue&&M(c,Da(b,f)):M(c,f));return c},!1),Ab=W("child",function(a,b,c,d,e){return(D?Sa:Ta).call(null,a,b,n(c)?c:null,n(d)?d:null,e||new K)},!1,!0);W("descendant",Na,!1,!0);
var Bb=W("descendant-or-self",function(a,b,c,d){var e=new K;J(b,c,d)&&a.a(b)&&M(e,b);return Na(a,b,c,d,e)},!1,!0),xb=W("following",function(a,b,c,d){var e=new K;do for(var f=b;f=f.nextSibling;)J(f,c,d)&&a.a(f)&&M(e,f),e=Na(a,f,c,d,e);while(b=b.parentNode);return e},!1,!0);W("following-sibling",function(a,b){for(var c=new K,d=b;d=d.nextSibling;)a.a(d)&&M(c,d);return c},!1);W("namespace",function(){return new K},!1);
var Eb=W("parent",function(a,b){var c=new K;if(9==b.nodeType)return c;if(2==b.nodeType)return M(c,b.ownerElement),c;var d=b.parentNode;a.a(d)&&M(c,d);return c},!1),yb=W("preceding",function(a,b,c,d){var e=new K,f=[];do f.unshift(b);while(b=b.parentNode);for(var g=1,k=f.length;g<k;g++){var p=[];for(b=f[g];b=b.previousSibling;)p.unshift(b);for(var y=0,F=p.length;y<F;y++)b=p[y],J(b,c,d)&&a.a(b)&&M(e,b),e=Na(a,b,c,d,e)}return e},!0,!0);
W("preceding-sibling",function(a,b){for(var c=new K,d=b;d=d.previousSibling;)a.a(d)&&Wa(c,d);return c},!0);var Fb=W("self",function(a,b){var c=new K;a.a(b)&&M(c,b);return c},!1);/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function Gb(a){t.call(this,1);this.c=a;this.e=a.e;this.b=a.b}r(Gb);Gb.prototype.a=function(a){return-R(this.c,a)};Gb.prototype.toString=function(){return"Unary Expression: -"+Q(this.c)};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function Hb(a){t.call(this,4);this.c=a;cb(this,ja(this.c,function(a){return a.e}));db(this,ja(this.c,function(a){return a.b}))}r(Hb);Hb.prototype.a=function(a){var b=new K;x(this.c,function(c){c=c.a(a);if(!(c instanceof K))throw Error("Path expression must evaluate to NodeSet.");b=Va(b,c)});return b};Hb.prototype.toString=function(){return z(this.c,function(a,b){return a+Q(b)},"Union Expression:")};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function Ib(a,b){this.a=a;this.b=b}function Jb(a){for(var b,c=[];;){X(a,"Missing right hand side of binary expression.");b=Kb(a);var d=H(a.a);if(!d)break;var e=(d=jb[d]||null)&&d.p;if(!e){a.a.a--;break}for(;c.length&&e<=c[c.length-1].p;)b=new fb(c.pop(),c.pop(),b);c.push(b,d)}for(;c.length;)b=new fb(c.pop(),c.pop(),b);return b}function X(a,b){if(Ia(a.a))throw Error(b);}function Lb(a,b){var c=H(a.a);if(c!=b)throw Error("Bad token, expected: "+b+" got: "+c);}
function Mb(a){a=H(a.a);if(")"!=a)throw Error("Bad token: "+a);}function Nb(a){a=H(a.a);if(2>a.length)throw Error("Unclosed literal string");return new qb(a)}function Ob(a){var b=H(a.a),c=b.indexOf(":");if(-1==c)return new L(b);var d=b.substring(0,c);a=a.b(d);if(!a)throw Error("Namespace prefix not declared: "+d);b=b.substr(c+1);return new L(b,a)}
function Pb(a){var b,c=[],d;if(wb(G(a.a))){b=H(a.a);d=G(a.a);if("/"==b&&(Ia(a.a)||"."!=d&&".."!=d&&"@"!=d&&"*"!=d&&!/(?![0-9])[\w]/.test(d)))return new ub;d=new ub;X(a,"Missing next location step.");b=Qb(a,b);c.push(b)}else{a:{b=G(a.a);d=b.charAt(0);switch(d){case "$":throw Error("Variable reference not allowed in HTML XPath");case "(":H(a.a);b=Jb(a);X(a,'unclosed "("');Lb(a,")");break;case '"':case "'":b=Nb(a);break;default:if(isNaN(+b))if(!pb(b)&&/(?![0-9])[\w]/.test(d)&&"("==G(a.a,1)){b=H(a.a);
b=ob[b]||null;H(a.a);for(d=[];")"!=G(a.a);){X(a,"Missing function argument list.");d.push(Jb(a));if(","!=G(a.a))break;H(a.a)}X(a,"Unclosed function argument list.");Mb(a);b=new mb(b,d)}else{b=null;break a}else b=new rb(+H(a.a))}"["==G(a.a)&&(d=new zb(Rb(a)),b=new kb(b,d))}if(b)if(wb(G(a.a)))d=b;else return b;else b=Qb(a,"/"),d=new vb,c.push(b)}for(;wb(G(a.a));)b=H(a.a),X(a,"Missing next location step."),b=Qb(a,b),c.push(b);return new sb(d,c)}
function Qb(a,b){var c,d,e;if("/"!=b&&"//"!=b)throw Error('Step op should be "/" or "//"');if("."==G(a.a))return d=new V(Fb,new N("node")),H(a.a),d;if(".."==G(a.a))return d=new V(Eb,new N("node")),H(a.a),d;var f;if("@"==G(a.a))f=tb,H(a.a),X(a,"Missing attribute name");else if("::"==G(a.a,1)){if(!/(?![0-9])[\w]/.test(G(a.a).charAt(0)))throw Error("Bad token: "+H(a.a));c=H(a.a);f=Db[c]||null;if(!f)throw Error("No axis with name: "+c);H(a.a);X(a,"Missing node name")}else f=Ab;c=G(a.a);if(/(?![0-9])[\w]/.test(c.charAt(0)))if("("==
G(a.a,1)){if(!pb(c))throw Error("Invalid node type: "+c);c=H(a.a);if(!pb(c))throw Error("Invalid type name: "+c);Lb(a,"(");X(a,"Bad nodetype");e=G(a.a).charAt(0);var g=null;if('"'==e||"'"==e)g=Nb(a);X(a,"Bad nodetype");Mb(a);c=new N(c,g)}else c=Ob(a);else if("*"==c)c=Ob(a);else throw Error("Bad token: "+H(a.a));e=new zb(Rb(a),f.a);return d||new V(f,c,e,"//"==b)}
function Rb(a){for(var b=[];"["==G(a.a);){H(a.a);X(a,"Missing predicate expression.");var c=Jb(a);b.push(c);X(a,"Unclosed predicate expression.");Lb(a,"]")}return b}function Kb(a){if("-"==G(a.a))return H(a.a),new Gb(Kb(a));var b=Pb(a);if("|"!=G(a.a))a=b;else{for(b=[b];"|"==H(a.a);)X(a,"Missing next union location path."),b.push(Pb(a));a.a.a--;a=new Hb(b)}return a};/*

 Copyright 2014 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function Sb(a,b){if(!a.length)throw Error("Empty XPath expression.");var c=Fa(a);if(Ia(c))throw Error("Invalid XPath expression.");b?"function"==aa(b)||(b=q(b.lookupNamespaceURI,b)):b=l(null);var d=Jb(new Ib(c,b));if(!Ia(c))throw Error("Bad token: "+H(c));this.evaluate=function(a,b){var c=d.a(new u(a));return new Y(c,b)}}
function Y(a,b){if(0==b)if(a instanceof K)b=4;else if("string"==typeof a)b=2;else if("number"==typeof a)b=1;else if("boolean"==typeof a)b=3;else throw Error("Unexpected evaluation result.");if(2!=b&&1!=b&&3!=b&&!(a instanceof K))throw Error("value could not be converted to the specified type");this.resultType=b;var c;switch(b){case 2:this.stringValue=a instanceof K?Ya(a):""+a;break;case 1:this.numberValue=a instanceof K?+Ya(a):+a;break;case 3:this.booleanValue=a instanceof K?0<a.i:!!a;break;case 4:case 5:case 6:case 7:var d=
O(a);c=[];for(var e=P(d);e;e=P(d))c.push(e instanceof E?e.a:e);this.snapshotLength=a.i;this.invalidIteratorState=!1;break;case 8:case 9:d=Xa(a);this.singleNodeValue=d instanceof E?d.a:d;break;default:throw Error("Unknown XPathResult type.");}var f=0;this.iterateNext=function(){if(4!=b&&5!=b)throw Error("iterateNext called with wrong result type");return f>=c.length?null:c[f++]};this.snapshotItem=function(a){if(6!=b&&7!=b)throw Error("snapshotItem called with wrong result type");return a>=c.length||
0>a?null:c[a]}}Y.ANY_TYPE=0;Y.NUMBER_TYPE=1;Y.STRING_TYPE=2;Y.BOOLEAN_TYPE=3;Y.UNORDERED_NODE_ITERATOR_TYPE=4;Y.ORDERED_NODE_ITERATOR_TYPE=5;Y.UNORDERED_NODE_SNAPSHOT_TYPE=6;Y.ORDERED_NODE_SNAPSHOT_TYPE=7;Y.ANY_UNORDERED_NODE_TYPE=8;Y.FIRST_ORDERED_NODE_TYPE=9;function Tb(a){this.lookupNamespaceURI=$a(a)}
function Ub(a){a=a||m;var b=a.document;b.evaluate||(a.XPathResult=Y,b.evaluate=function(a,b,e,f){return(new Sb(a,e)).evaluate(b,f)},b.createExpression=function(a,b){return new Sb(a,b)},b.createNSResolver=function(a){return new Tb(a)})}var Vb=["wgxpath","install"],Z=m;Vb[0]in Z||!Z.execScript||Z.execScript("var "+Vb[0]);for(var Wb;Vb.length&&(Wb=Vb.shift());)Vb.length||void 0===Ub?Z[Wb]?Z=Z[Wb]:Z=Z[Wb]={}:Z[Wb]=Ub;})()

},{}],79:[function(_dereq_,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*eslint-env es6:false*/
/*
 * Copyright (c) 2010 Arc90 Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * This code is heavily based on Arc90's readability.js (1.7.1) script
 * available at: http://code.google.com/p/arc90labs-readability
 */

/**
 * Public constructor.
 * @param {HTMLDocument} doc     The document to parse.
 * @param {Object}       options The options object.
 */
function Readability(doc, options) {
  // In some older versions, people passed a URI as the first argument. Cope:
  if (options && options.documentElement) {
    doc = options;
    options = arguments[2];
  } else if (!doc || !doc.documentElement) {
    throw new Error("First argument to Readability constructor should be a document object.");
  }
  options = options || {};

  this._doc = doc;
  this._articleTitle = null;
  this._articleImage = null;
  this._articleByline = null;
  this._articleDir = null;
  this._docSrc = null;
  this._nodeMap = new Map();
  this._attempts = [];
  this._metatags = [];

  // Configurable options
  this._debug = !!options.debug;
  this._maxElemsToParse = options.maxElemsToParse || this.DEFAULT_MAX_ELEMS_TO_PARSE;
  this._nbTopCandidates = options.nbTopCandidates || this.DEFAULT_N_TOP_CANDIDATES;
  this._charThreshold = options.charThreshold || this.DEFAULT_CHAR_THRESHOLD;
  this._classesToPreserve = this.CLASSES_TO_PRESERVE.concat(options.classesToPreserve || []);
  this._closeScore = options.closeScore || this.DEFAULT_CLOSE_SCORE;
  this._inclExclAttr = options.inclExclAttr || this.DEFAULT_INCL_EXCL_ATTR;
  this._keepByline = options.keepByline || true;
  this._keepHeaders = options.keepHeaders || true;
  this._keepStyles = options.keepStyles || false;

  // Start with all flags set
  this._flags = this.FLAG_STRIP_UNLIKELYS | this.FLAG_WEIGHT_CLASSES | this.FLAG_CLEAN_CONDITIONALLY;

  var logEl;

  this.mydebug = function () {
    if (typeof console !== "undefined") {
      var args = ["Mydebug "].concat(arguments);
      console.log.apply(console, args);
    }
  };
  this.dumperr = function () {
    if (typeof console !== "undefined") {
      var args = ["Error "].concat(arguments);
      console.log.apply(console, args);
    }
  };
  // Control whether log messages are sent to the console
  if (this._debug) {
    logEl = function logEl(e) {
      var rv = e.nodeName + " ";
      if (e.nodeType == e.TEXT_NODE) {
        return rv + '("' + e.textContent + '")';
      }
      var classDesc = e.className && "." + e.className.replace(/ /g, ".");
      var elDesc = "";
      if (e.id) elDesc = "(#" + e.id + classDesc + ")";else if (classDesc) elDesc = "(" + classDesc + ")";
      return rv + elDesc;
    };
    this.log = function () {
      if (typeof dump !== "undefined") {
        var msg = Array.prototype.map.call(arguments, function (x) {
          return x && x.nodeName ? logEl(x) : x;
        }).join(" ");
        dump("Reader: (Readability) " + msg + "\n");
      } else if (typeof console !== "undefined") {
        var args = ["Reader: (Readability) "].concat(arguments);
        console.log.apply(console, args);
      }
    };
  } else {
    this.log = function () {};
  }
}

Readability.prototype = {
  FLAG_STRIP_UNLIKELYS: 0x1,
  FLAG_WEIGHT_CLASSES: 0x2,
  FLAG_CLEAN_CONDITIONALLY: 0x4,

  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,

  // Max number of nodes supported by this parser. Default: 0 (no limit)
  DEFAULT_MAX_ELEMS_TO_PARSE: 0,

  // The number of top candidates to consider when analysing how
  // tight the competition is among candidates.
  DEFAULT_N_TOP_CANDIDATES: 100,

  // Element tags to score by default.
  DEFAULT_TAGS_TO_SCORE: "section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),

  // The default number of chars an article must have in order to return a result
  DEFAULT_CHAR_THRESHOLD: 500,

  DEFAULT_CLOSE_SCORE: 0.75,

  DEFAULT_INCL_EXCL_ATTR: "_numici",

  // All of the regular expressions in use within readability.
  // Defined up here so we don't instantiate them repeatedly in loops.
  REGEXPS: {
    unlikelyCandidates: /-ad-|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|foot|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
    unlikelyCandidates_nohdr: /-ad-|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|foot|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
    okMaybeItsACandidate: /and|article|body|column|main|shadow/i,
    positive: /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,
    negative: /hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,
    extraneous: /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,
    byline: /byline|author|dateline|writtenby|p-author/i,
    replaceFonts: /<(\/?)font[^>]*>/gi,
    normalize: /\s{2,}/g,
    videos: /\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,
    nextLink: /(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,
    prevLink: /(prev|earl|old|new|<|«)/i,
    whitespace: /^\s*$/,
    hasContent: /\S$/
  },

  DIV_TO_P_ELEMS: ["A", "BLOCKQUOTE", "DL", "DIV", "IMG", "OL", "P", "PRE", "TABLE", "UL", "SELECT"],

  ALTER_TO_DIV_EXCEPTIONS: ["DIV", "ARTICLE", "SECTION", "P"],

  PRESENTATIONAL_ATTRIBUTES: ["align", "background", "bgcolor", "border", "cellpadding", "cellspacing", "frame", "hspace", "rules", "style", "valign", "vspace"],

  DEPRECATED_SIZE_ATTRIBUTE_ELEMS: ["TABLE", "TH", "TD", "HR", "PRE"],

  // The commented out elements qualify as phrasing content but tend to be
  // removed by readability when put into paragraphs, so we ignore them here.
  PHRASING_ELEMS: [
  // "CANVAS", "IFRAME", "SVG", "VIDEO",
  "ABBR", "AUDIO", "B", "BDO", "BR", "BUTTON", "CITE", "CODE", "DATA", "DATALIST", "DFN", "EM", "EMBED", "I", "IMG", "INPUT", "KBD", "LABEL", "MARK", "MATH", "METER", "NOSCRIPT", "OBJECT", "OUTPUT", "PROGRESS", "Q", "RUBY", "SAMP", "SCRIPT", "SELECT", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TEXTAREA", "TIME", "VAR", "WBR"],

  // These are the classes that readability sets itself.
  CLASSES_TO_PRESERVE: ["page"],

  /**
   * Run any post-process modifications to article content as necessary.
   *
   * @param Element
   * @return void
  **/
  _postProcessContent: function _postProcessContent(articleContent) {
    // Readability cannot open relative uris so we convert them to absolute uris.
    this._fixRelativeUris(articleContent);

    // Remove classes.
    this._cleanClasses(articleContent);
  },

  /**
   * Iterates over a NodeList, calls `filterFn` for each node and removes node
   * if function returned `true`.
   *
   * If function is not passed, removes all the nodes in node list.
   *
   * @param NodeList nodeList The nodes to operate on
   * @param Function filterFn the function to use as a filter
   * @return void
   */
  _removeNodes: function _removeNodes(nodeList, filterFn) {
    for (var i = nodeList.length - 1; i >= 0; i--) {
      var node = nodeList[i];
      var parentNode = node.parentNode;
      if (parentNode) {
        if (!filterFn || filterFn.call(this, node, i, nodeList)) {
          parentNode.removeChild(node);
        }
      }
    }
  },

  /**
   * Iterates over a NodeList, and calls _setNodeTag for each node.
   *
   * @param NodeList nodeList The nodes to operate on
   * @param String newTagName the new tag name to use
   * @return void
   */
  _replaceNodeTags: function _replaceNodeTags(nodeList, newTagName) {
    for (var i = nodeList.length - 1; i >= 0; i--) {
      var node = nodeList[i];
      this._setNodeTag(node, newTagName);
    }
  },

  /**
   * Iterate over a NodeList, which doesn't natively fully implement the Array
   * interface.
   *
   * For convenience, the current object context is applied to the provided
   * iterate function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The iterate function.
   * @return void
   */
  _forEachNode: function _forEachNode(nodeList, fn) {
    Array.prototype.forEach.call(nodeList, fn, this);
  },

  /**
   * Iterate over a NodeList, return true if any of the provided iterate
   * function calls returns true, false otherwise.
   *
   * For convenience, the current object context is applied to the
   * provided iterate function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The iterate function.
   * @return Boolean
   */
  _someNode: function _someNode(nodeList, fn) {
    return Array.prototype.some.call(nodeList, fn, this);
  },

  /**
   * Iterate over a NodeList, return true if all of the provided iterate
   * function calls return true, false otherwise.
   *
   * For convenience, the current object context is applied to the
   * provided iterate function.
   *
   * @param  NodeList nodeList The NodeList.
   * @param  Function fn       The iterate function.
   * @return Boolean
   */
  _everyNode: function _everyNode(nodeList, fn) {
    return Array.prototype.every.call(nodeList, fn, this);
  },

  /**
   * Concat all nodelists passed as arguments.
   *
   * @return ...NodeList
   * @return Array
   */
  _concatNodeLists: function _concatNodeLists() {
    var slice = Array.prototype.slice;
    var args = slice.call(arguments);
    var nodeLists = args.map(function (list) {
      return slice.call(list);
    });
    return Array.prototype.concat.apply([], nodeLists);
  },

  _getAllNodesWithTag: function _getAllNodesWithTag(node, tagNames) {
    if (node.querySelectorAll) {
      return node.querySelectorAll(tagNames.join(","));
    }
    return [].concat.apply([], tagNames.map(function (tag) {
      var collection = node.getElementsByTagName(tag);
      return Array.isArray(collection) ? collection : Array.from(collection);
    }));
  },

  /**
   * Removes the class="" attribute from every element in the given
   * subtree, except those that match CLASSES_TO_PRESERVE and
   * the classesToPreserve array from the options object.
   *
   * @param Element
   * @return void
   */
  _cleanClasses: function _cleanClasses(node) {
    var classesToPreserve = this._classesToPreserve;
    var className = (node.getAttribute("class") || "").split(/\s+/).filter(function (cls) {
      return classesToPreserve.indexOf(cls) != -1;
    }).join(" ");

    if (className) {
      node.setAttribute("class", className);
    } else {
      node.removeAttribute("class");
    }

    for (node = node.firstElementChild; node; node = node.nextElementSibling) {
      this._cleanClasses(node);
    }
  },

  /**
   * Converts each <a> and <img> uri in the given element to an absolute URI,
   * ignoring #ref URIs.
   *
   * @param Element
   * @return void
   */
  _fixRelativeUris: function _fixRelativeUris(articleContent) {
    var baseURI = this._doc.baseURI;
    var documentURI = this._doc.documentURI;
    function toAbsoluteURI(uri) {
      // Leave hash links alone if the base URI matches the document URI:
      if (baseURI == documentURI && uri.charAt(0) == "#") {
        return uri;
      }
      // Otherwise, resolve against base URI:
      try {
        return new URL(uri, baseURI).href;
      } catch (ex) {
        // Something went wrong, just return the original:
      }
      return uri;
    }

    var links = articleContent.getElementsByTagName("a");
    this._forEachNode(links, function (link) {
      var href = link.getAttribute("href");
      if (href) {
        // Replace links with javascript: URIs with text content, since
        // they won't work after scripts have been removed from the page.
        if (href.indexOf("javascript:") === 0) {
          var text = this._doc.createTextNode(link.textContent);
          link.parentNode.replaceChild(text, link);
        } else {
          link.setAttribute("href", toAbsoluteURI(href));
        }
      }
    });

    var imgs = articleContent.getElementsByTagName("img");
    this._forEachNode(imgs, function (img) {
      var src = img.getAttribute("src");
      if (src) {
        img.setAttribute("src", toAbsoluteURI(src));
      }
    });
  },

  /**
   * Get the article title as an H1.
   *
   * @return void
   **/
  _getArticleTitle: function _getArticleTitle() {
    var doc = this._doc;
    var curTitle = "";
    var origTitle = "";

    try {
      curTitle = origTitle = doc.title.trim();

      // If they had an element with id "title" in their HTML
      if (typeof curTitle !== "string") curTitle = origTitle = this._getInnerText(doc.getElementsByTagName("title")[0]);
    } catch (e) {/* ignore exceptions setting the title. */}

    var titleHadHierarchicalSeparators = false;
    function wordCount(str) {
      return str.split(/\s+/).length;
    }

    // If there's a separator in the title, first remove the final part
    if (/ [\|\-\\\/>»] /.test(curTitle)) {
      titleHadHierarchicalSeparators = / [\\\/>»] /.test(curTitle);
      curTitle = origTitle.replace(/(.*)[\|\-\\\/>»] .*/gi, "$1");

      // If the resulting title is too short (3 words or fewer), remove
      // the first part instead:
      if (wordCount(curTitle) < 3) curTitle = origTitle.replace(/[^\|\-\\\/>»]*[\|\-\\\/>»](.*)/gi, "$1");
    } else if (curTitle.indexOf(": ") !== -1) {
      // Check if we have an heading containing this exact string, so we
      // could assume it's the full title.
      var headings = this._concatNodeLists(doc.getElementsByTagName("h1"), doc.getElementsByTagName("h2"));
      var trimmedTitle = curTitle.trim();
      var match = this._someNode(headings, function (heading) {
        return heading.textContent.trim() === trimmedTitle;
      });

      // If we don't, let's extract the title out of the original title string.
      if (!match) {
        curTitle = origTitle.substring(origTitle.lastIndexOf(":") + 1);

        // If the title is now too short, try the first colon instead:
        if (wordCount(curTitle) < 3) {
          curTitle = origTitle.substring(origTitle.indexOf(":") + 1);
          // But if we have too many words before the colon there's something weird
          // with the titles and the H tags so let's just use the original title instead
        } else if (wordCount(origTitle.substr(0, origTitle.indexOf(":"))) > 5) {
          curTitle = origTitle;
        }
      }
    } else if (curTitle.length > 150 || curTitle.length < 15) {
      var hOnes = doc.getElementsByTagName("h1");

      if (hOnes.length === 1) curTitle = this._getInnerText(hOnes[0]);
    }

    curTitle = curTitle.trim();
    // If we now have 4 words or fewer as our title, and either no
    // 'hierarchical' separators (\, /, > or ») were found in the original
    // title or we decreased the number of words by more than 1 word, use
    // the original title.
    var curTitleWordCount = wordCount(curTitle);
    if (curTitleWordCount <= 4 && (!titleHadHierarchicalSeparators || curTitleWordCount != wordCount(origTitle.replace(/[\|\-\\\/>»]+/g, "")) - 1)) {
      curTitle = origTitle;
    }

    return curTitle;
  },

  _numberNodes: function _numberNodes(node, num) {
    num++;
    node._num = num;
    node.setAttribute("_num", num);
    var length = node.children.length;
    for (var i = 1; i <= length; i++) {
      var child = node.children[i - 1];
      num = this._numberNodes(child, num);
    }
    return num;
  },
  _buildNodeMap: function _buildNodeMap(node, nodeMap) {
    var inclExcl = node.getAttribute(this._inclExclAttr) || "";
    if (inclExcl === "include") {
      node.setAttribute("_userincluded", "true");
    } else if (inclExcl === "exclude") {
      node.setAttribute("_userexcluded", "true");
    }
    if (node.getAttribute("_num")) {
      nodeMap.set(node.getAttribute("_num"), node);
    }
    var length = node.children ? node.children.length : 0;
    for (var i = 0; i < length; i++) {
      this._buildNodeMap(node.children[i], nodeMap);
    }
  },
  /**
   * Prepare the HTML document for readability to scrape it.
   * This includes things like stripping javascript, CSS, and handling terrible markup.
   *
   * @return void
   **/
  _prepDocument: function _prepDocument() {
    var doc = this._doc;
    // Remove all style tags in head
    this._removeNodes(doc.getElementsByTagName("style"));

    if (doc.body) {
      this._replaceBrs(doc.body);
    }

    this._replaceNodeTags(doc.getElementsByTagName("font"), "SPAN");
  },

  /**
   * Finds the next element, starting from the given node, and ignoring
   * whitespace in between. If the given node is an element, the same node is
   * returned.
   */
  _nextElement: function _nextElement(node) {
    var next = node;
    while (next && next.nodeType != this.ELEMENT_NODE && this.REGEXPS.whitespace.test(next.textContent)) {
      next = next.nextSibling;
    }
    return next;
  },

  /**
   * Replaces 2 or more successive <br> elements with a single <p>.
   * Whitespace between <br> elements are ignored. For example:
   *   <div>foo<br>bar<br> <br><br>abc</div>
   * will become:
   *   <div>foo<br>bar<p>abc</p></div>
   */
  _replaceBrs: function _replaceBrs(elem) {
    this._forEachNode(this._getAllNodesWithTag(elem, ["br"]), function (br) {
      var next = br.nextSibling;

      // Whether 2 or more <br> elements have been found and replaced with a
      // <p> block.
      var replaced = false;

      // If we find a <br> chain, remove the <br>s until we hit another element
      // or non-whitespace. This leaves behind the first <br> in the chain
      // (which will be replaced with a <p> later).
      while ((next = this._nextElement(next)) && next.tagName == "BR") {
        replaced = true;
        var brSibling = next.nextSibling;
        next.parentNode.removeChild(next);
        next = brSibling;
      }

      // If we removed a <br> chain, replace the remaining <br> with a <p>. Add
      // all sibling nodes as children of the <p> until we hit another <br>
      // chain.
      if (replaced) {
        var p = this._doc.createElement("p");
        br.parentNode.replaceChild(p, br);

        next = p.nextSibling;
        while (next) {
          // If we've hit another <br><br>, we're done adding children to this <p>.
          if (next.tagName == "BR") {
            var nextElem = this._nextElement(next.nextSibling);
            if (nextElem && nextElem.tagName == "BR") break;
          }

          if (!this._isPhrasingContent(next)) break;

          // Otherwise, make this node a child of the new <p>.
          var sibling = next.nextSibling;
          p.appendChild(next);
          next = sibling;
        }

        while (p.lastChild && this._isWhitespace(p.lastChild)) {
          p.removeChild(p.lastChild);
        }

        if (p.parentNode.tagName === "P") this._setNodeTag(p.parentNode, "DIV");
      }
    });
  },

  _setNodeTag: function _setNodeTag(node, tag) {
    this.log("_setNodeTag", node, tag);
    if (node.__JSDOMParser__) {
      node.localName = tag.toLowerCase();
      node.tagName = tag.toUpperCase();
      return node;
    }

    var replacement = node.ownerDocument.createElement(tag);
    while (node.firstChild) {
      replacement.appendChild(node.firstChild);
    }
    node.parentNode.replaceChild(replacement, node);
    if (node.readability) replacement.readability = node.readability;

    for (var i = 0; i < node.attributes.length; i++) {
      replacement.setAttribute(node.attributes[i].name, node.attributes[i].value);
    }
    return replacement;
  },

  /**
   * Prepare the article node for display. Clean out any inline styles,
   * iframes, forms, strip extraneous <p> tags, etc.
   *
   * @param Element
   * @return void
   **/
  _prepArticle: function _prepArticle(articleContent) {
    this._cleanStyles(articleContent);

    // Check for data tables before we continue, to avoid removing items in
    // those tables, which will often be isolated even though they're
    // visually linked to other content-ful elements (text, images, etc.).
    this._markDataTables(articleContent);

    // Clean out junk from the article content
    this._cleanConditionally(articleContent, "form");
    this._cleanConditionally(articleContent, "fieldset");
    this._clean(articleContent, "object");
    this._clean(articleContent, "embed");
    if (!this._keepHeaders) this._clean(articleContent, "h1");
    this._clean(articleContent, "footer");
    this._clean(articleContent, "link");
    this._clean(articleContent, "aside");

    // Clean out elements have "share" in their id/class combinations from final top candidates,
    // which means we don't remove the top candidates even they have "share".
    this._forEachNode(articleContent.children, function (topCandidate) {
      this._cleanMatchedNodes(topCandidate, /share/);
    });

    // If there is only one h2 and its text content substantially equals article title,
    // they are probably using it as a header and not a subheader,
    // so remove it since we already extract the title separately.
    var h2 = articleContent.getElementsByTagName("h2");
    if (!this._keepHeaders && h2.length === 1) {
      var lengthSimilarRate = (h2[0].textContent.length - this._articleTitle.length) / this._articleTitle.length;
      if (Math.abs(lengthSimilarRate) < 0.5) {
        var titlesMatch = false;
        if (lengthSimilarRate > 0) {
          titlesMatch = h2[0].textContent.includes(this._articleTitle);
        } else {
          titlesMatch = this._articleTitle.includes(h2[0].textContent);
        }
        if (titlesMatch) {
          this._clean(articleContent, "h2");
        }
      }
    }

    this._removeNodes(articleContent.getElementsByTagName("h1"), function (h1, index) {
      return index > 0;
    });
    this._clean(articleContent, "iframe");
    this._clean(articleContent, "input");
    this._clean(articleContent, "textarea");
    this._clean(articleContent, "select");
    this._clean(articleContent, "button");
    if (!this._keepHeaders) this._cleanHeaders(articleContent);

    // Do these last as the previous stuff may have removed junk
    // that will affect these
    this._cleanConditionally(articleContent, "table");
    this._cleanConditionally(articleContent, "ul");
    this._cleanConditionally(articleContent, "div");

    // Remove extra paragraphs
    this._removeNodes(articleContent.getElementsByTagName("p"), function (paragraph) {
      var imgCount = paragraph.getElementsByTagName("img").length;
      var embedCount = paragraph.getElementsByTagName("embed").length;
      var objectCount = paragraph.getElementsByTagName("object").length;
      // At this point, nasty iframes have been removed, only remain embedded video ones.
      var iframeCount = paragraph.getElementsByTagName("iframe").length;
      var totalCount = imgCount + embedCount + objectCount + iframeCount;

      return totalCount === 0 && !this._getInnerText(paragraph, false);
    });

    this._forEachNode(this._getAllNodesWithTag(articleContent, ["br"]), function (br) {
      var next = this._nextElement(br.nextSibling);
      if (next && next.tagName == "P") br.parentNode.removeChild(br);
    });

    // Remove single-cell tables
    this._forEachNode(this._getAllNodesWithTag(articleContent, ["table"]), function (table) {
      var tbody = this._hasSingleTagInsideElement(table, "TBODY") ? table.firstElementChild : table;
      if (this._hasSingleTagInsideElement(tbody, "TR")) {
        var row = tbody.firstElementChild;
        if (this._hasSingleTagInsideElement(row, "TD")) {
          var cell = row.firstElementChild;
          cell = this._setNodeTag(cell, this._everyNode(cell.childNodes, this._isPhrasingContent) ? "P" : "DIV");
          table.parentNode.replaceChild(cell, table);
        }
      }
    });
  },

  /**
   * Initialize a node with the readability object. Also checks the
   * className/id for special names to add to its score.
   *
   * @param Element
   * @return void
  **/
  _initializeNode: function _initializeNode(node) {
    node.readability = { "contentScore": 0 };

    switch (node.tagName) {
      case "DIV":
        node.readability.contentScore += 5;
        break;

      case "PRE":
      case "TD":
      case "BLOCKQUOTE":
        node.readability.contentScore += 3;
        break;

      case "ADDRESS":
      case "OL":
      case "UL":
      case "DL":
      case "DD":
      case "DT":
      case "LI":
      case "FORM":
        node.readability.contentScore -= 3;
        break;

      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        if (!this._keepHeaders) node.readability.contentScore -= 5;
        break;

      case "TH":
        node.readability.contentScore -= 5;
        break;
    }

    node.readability.contentScore += this._getClassWeight(node);
  },

  _removeAndGetNext: function _removeAndGetNext(node) {
    var nextNode = this._getNextNode(node, true);
    node.parentNode.removeChild(node);
    return nextNode;
  },

  /**
   * Traverse the DOM from node to node, starting at the node passed in.
   * Pass true for the second parameter to indicate this node itself
   * (and its kids) are going away, and we want the next node over.
   *
   * Calling this in a loop will traverse the DOM depth-first.
   */
  _getNextNode: function _getNextNode(node, ignoreSelfAndKids) {
    // First check for kids if those aren't being ignored
    if (!ignoreSelfAndKids && node.firstElementChild) {
      return node.firstElementChild;
    }
    // Then for siblings...
    if (node.nextElementSibling) {
      return node.nextElementSibling;
    }
    // And finally, move up the parent chain *and* find a sibling
    // (because this is depth-first traversal, we will have already
    // seen the parent nodes themselves).
    do {
      node = node.parentNode;
    } while (node && !node.nextElementSibling);
    return node && node.nextElementSibling;
  },

  _checkByline: function _checkByline(node, matchString) {
    if (this._articleByline) {
      return false;
    }

    if (node.getAttribute !== undefined) {
      var rel = node.getAttribute("rel");
    }

    if ((rel === "author" || this.REGEXPS.byline.test(matchString)) && this._isValidByline(node.textContent)) {
      this._articleByline = node.textContent.trim();
      return true;
    }

    return false;
  },

  _hasByline: function _hasByline(node) {
    if (node.getAttribute !== undefined) {
      var rel = node.getAttribute("rel");
    }
    var matchString = node.className + " " + node.id;
    if ((rel === "author" || this.REGEXPS.byline.test(matchString)) && this._isValidByline(node.textContent)) {
      return true;
    }
    if (!node.children) {
      return false;
    }
    for (var i = 0; i < node.children.length; i++) {
      if (this._hasByline(node.children[i])) {
        return true;
      }
    }
    return false;
  },

  _getNodeAncestors: function _getNodeAncestors(node, maxDepth) {
    maxDepth = maxDepth || 0;
    var i = 0,
        ancestors = [];
    while (node.parentNode) {
      ancestors.push(node.parentNode);
      if (maxDepth && ++i === maxDepth) break;
      node = node.parentNode;
    }
    return ancestors;
  },
  _hasMustInclude: function _hasMustInclude(node) {
    var inclExcl = node.getAttribute(this._inclExclAttr) || "";
    if (inclExcl === "include") {
      return true;
    }
    if (!node.children) {
      return false;
    }
    for (var i = 0; i < node.children.length; i++) {
      if (this._hasMustInclude(node.children[i])) {
        return true;
      }
    }
    return false;
  },
  _removeMustExcludes: function _removeMustExcludes(node) {
    if (!node.children) {
      return;
    }
    for (var i = node.children.length - 1; i >= 0; --i) {
      var child = node.children[i];
      var inclExcl = child.getAttribute(this._inclExclAttr) || "";
      if (inclExcl === "exclude") {
        node.removeChild(child);
      } else {
        this._removeMustExcludes(child);
      }
    }
  },
  _dumpParents: function _dumpParents(node) {
    var xx = "";
    while (node && node.tagName !== 'BODY') {
      xx += node.tagName + "(" + node._num + "), ";
      node = node.parentNode;
    }
    this.mydebug(xx);
  },
  _setLoggingAttribute: function _setLoggingAttribute(node, attr, value) {
    var srcNode = this._nodeMap.get(node.getAttribute("_num"));
    if (srcNode) {
      srcNode.setAttribute(attr, value);
    }
  },
  _logNodeRemoved: function _logNodeRemoved(node, reason) {
    this._setLoggingAttribute(node, "_removed", reason);
  },
  _logContentScore: function _logContentScore(node, contentScore) {
    this._setLoggingAttribute(node, "_score", contentScore);
  },

  /***
   * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
   *         most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
   *
   * @param page a document to run upon. Needs to be a full document, complete with body.
   * @return Element
  **/
  _grabArticle: function _grabArticle(page) {
    this.log("**** grabArticle ****");
    var doc = this._doc;
    var isPaging = page !== null ? true : false;
    page = page ? page : this._doc.body;

    // We can't grab an article if we don't have a page!
    if (!page) {
      this.log("No body found in document. Abort.");
      return null;
    }

    var pageCacheHtml = page.innerHTML;

    while (true) {
      var stripUnlikelyCandidates = this._flagIsActive(this.FLAG_STRIP_UNLIKELYS);

      // First, node prepping. Trash nodes that look cruddy (like ones with the
      // class name "comment", etc), and turn divs into P tags where they have been
      // used inappropriately (as in, where they contain no other block level elements.)
      var elementsToScore = [];
      var node = this._doc.documentElement;

      while (node) {
        var mustInclude = this._hasMustInclude(node);
        var matchString = node.className + " " + node.id;
        if (!mustInclude && !this._isProbablyVisible(node)) {
          this.log("Removing hidden node - " + matchString);
          this._logNodeRemoved(node, "Hidden node - " + matchString);
          node = this._removeAndGetNext(node);
          continue;
        }

        // Check to see if this node is a byline, and remove it if it is.
        if (this._checkByline(node, matchString)) {
          if (!this._keepByline) {
            this._logNodeRemoved(node, "byline - " + matchString);
            node = this._removeAndGetNext(node);
            continue;
          }
        }

        // Remove unlikely candidates
        if (!mustInclude && stripUnlikelyCandidates) {
          var unlikely = this._keepHeaders ? this.REGEXPS.unlikelyCandidates_nohdr.test(matchString) : this.REGEXPS.unlikelyCandidates.test(matchString);
          if (unlikely && !this.REGEXPS.okMaybeItsACandidate.test(matchString) && node.tagName !== "BODY" && node.tagName !== "A") {
            this.log("Removing unlikely candidate - " + matchString);
            this._logNodeRemoved(node, "Unlikely candidate - " + matchString);
            node = this._removeAndGetNext(node);
            continue;
          }
        }

        // Remove DIV, SECTION, and HEADER nodes without any content(e.g. text, image, video, or iframe).
        if (!mustInclude && (node.tagName === "DIV" || node.tagName === "SECTION" || node.tagName === "HEADER" || node.tagName === "H1" || node.tagName === "H2" || node.tagName === "H3" || node.tagName === "H4" || node.tagName === "H5" || node.tagName === "H6") && this._isElementWithoutContent(node)) {
          this._logNodeRemoved(node, "Element without content");
          node = this._removeAndGetNext(node);
          continue;
        }

        if (this.DEFAULT_TAGS_TO_SCORE.indexOf(node.tagName) !== -1) {
          elementsToScore.push(node);
        }

        // Turn all divs that don't have children block level elements into p's
        // NOTE: removed altering <div> nodes
        node = this._getNextNode(node);
      }
      /**
       * Loop through all paragraphs, and assign a score to them based on how content-y they look.
       * Then add their score to their parent node.
       *
       * A score is determined by things like number of commas, class names, etc. Maybe eventually link density.
      **/
      var candidates = [];
      this._forEachNode(elementsToScore, function (elementToScore) {
        if (!elementToScore.parentNode || typeof elementToScore.parentNode.tagName === "undefined") return;

        // If this paragraph is less than 25 characters, don't even count it.
        var innerText = this._getInnerText(elementToScore);
        if (innerText.length < 25) {
          this._setLoggingAttribute(elementToScore, "_innerTextSmall", "yes");
          return;
        }

        // Exclude nodes with no ancestor.
        var ancestors = this._getNodeAncestors(elementToScore, 3);
        if (ancestors.length === 0) return;

        var contentScore = 0;

        // Add a point for the paragraph itself as a base.
        contentScore += 1;

        // Add points for any commas within this paragraph.
        contentScore += innerText.split(",").length;

        // For every 100 characters in this paragraph, add another point. Up to 3 points.
        contentScore += Math.min(Math.floor(innerText.length / 100), 3);

        this._logContentScore(elementToScore, contentScore);
        // Initialize and score ancestors.
        this._forEachNode(ancestors, function (ancestor, level) {
          if (!ancestor.tagName || !ancestor.parentNode || typeof ancestor.parentNode.tagName === "undefined") return;
          if (typeof ancestor.readability === "undefined") {
            this._initializeNode(ancestor);
            candidates.push(ancestor);
            this._setLoggingAttribute(ancestor, "_candidate", "true");
          }

          // Node score divider:
          // - parent:             1 (no division)
          // - grandparent:        2
          // - great grandparent+: ancestor level * 3
          if (level === 0) var scoreDivider = 1;else if (level === 1) scoreDivider = 2;else scoreDivider = level * 3;
          ancestor.readability.contentScore += contentScore / scoreDivider;
          this._logContentScore(ancestor, ancestor.readability.contentScore);
        });
      });

      // After we've calculated scores, loop through all of the possible
      // candidate nodes we found and find the one with the highest score.
      var topCandidates = [];
      for (var c = 0, cl = candidates.length; c < cl; c += 1) {
        var candidate = candidates[c];

        // Scale the final candidates score based on link density. Good content
        // should have a relatively small link density (5% or less) and be mostly
        // unaffected by this operation.
        var linkdensity = this._getLinkDensity(candidate);
        this._setLoggingAttribute(candidate, "_linkdensity", linkdensity);
        var candidateScore = candidate.readability.contentScore * (1 - this._getLinkDensity(candidate));
        candidate.readability.contentScore = candidateScore;
        this._logContentScore(candidate, candidate.readability.contentScore);

        this.log("Candidate:", candidate, "with score " + candidateScore);
        for (var t = 0; t < this._nbTopCandidates; t++) {
          var aTopCandidate = topCandidates[t];

          if (!aTopCandidate || candidateScore > aTopCandidate.readability.contentScore) {
            topCandidates.splice(t, 0, candidate);
            if (topCandidates.length > this._nbTopCandidates) {
              dropped = topCandidates.pop();
              this._setLoggingAttribute(dropped, "_lowscore", "true");
            }
            break;
          }
        }
      }

      var topCandidate = topCandidates[0] || null;
      var neededToCreateTopCandidate = false;
      var parentOfTopCandidate;
      if (topCandidate) {
        var mustIncludes = [];
        while (topCandidates.length > 0) {
          var cand = topCandidates[topCandidates.length - 1];
          if (cand.readability.contentScore / topCandidate.readability.contentScore < this._closeScore) {
            var dropped = topCandidates.pop();
            this._setLoggingAttribute(dropped, "_lowscore", "true");
            var includeBack = false;
            if (this._hasMustInclude(dropped)) {
              includeBack = true;
            }
            if (!includeBack && this._keepHeaders) {
              var h1 = dropped.getElementsByTagName("h1");
              if (h1 && h1.length >= 1) {
                includeBack = true;
              }
            }
            if (!includeBack && this._keepByline && this._hasByline(dropped)) {
              includeBack = true;
            }
            if (includeBack) mustIncludes.push(dropped);
          } else {
            break;
          }
        }
        if (mustIncludes.length > 0) {
          topCandidates = topCandidates.concat(mustIncludes);
        }
      }
      for (var t = 0; t < topCandidates.length; t++) {
        if (topCandidates[t].tagName === "BODY") {
          topCandidate = topCandidates[t];
          break;
        }
      }
      var allSections = [];
      // If we still have no top candidate, just use the body as a last resort.
      // We also have to copy the body node so it is something we can modify.
      if (topCandidate === null || topCandidate.tagName === "BODY") {
        // Move all of the page's children into topCandidate
        topCandidate = doc.createElement("DIV");
        neededToCreateTopCandidate = true;
        // Move everything (not just elements, also text nodes etc.) into the container
        // so we even include text directly in the body:
        var kids = page.childNodes;
        while (kids.length) {
          this.log("Moving child out:", kids[0]);
          topCandidate.appendChild(kids[0]);
        }

        page.appendChild(topCandidate);

        this._initializeNode(topCandidate);
        allSections.push(topCandidate);
      } else {
        var orgTopCandidate = topCandidate;
        for (var t = 0; t < topCandidates.length; t++) {
          // Because of our bonus system, parents of candidates might have scores
          // themselves. They get half of the node. There won't be nodes with higher
          // scores than our topCandidate, but if we see the score going *up* in the first
          // few steps up the tree, that's a decent sign that there might be more content
          // lurking in other places that we want to unify in. The sibling stuff
          // below does some of that - but only if we've looked high enough up the DOM
          // tree.
          topCandidate = topCandidates[t];
          parentOfTopCandidate = topCandidate.parentNode;
          var lastScore = topCandidate.readability.contentScore;
          // The scores shouldn't get too low.
          var scoreThreshold = lastScore / 3;
          while (parentOfTopCandidate.tagName !== "BODY") {
            if (!parentOfTopCandidate.readability) {
              parentOfTopCandidate = parentOfTopCandidate.parentNode;
              continue;
            }
            var parentScore = parentOfTopCandidate.readability.contentScore;
            if (parentScore < scoreThreshold) break;
            if (parentScore > lastScore) {
              // Alright! We found a better parent to use.
              topCandidate = parentOfTopCandidate;
              break;
            }
            lastScore = parentOfTopCandidate.readability.contentScore;
            parentOfTopCandidate = parentOfTopCandidate.parentNode;
          }

          // If the top candidate is the only child, use parent instead. This will help sibling
          // joining logic when adjacent content is actually located in parent's sibling node.
          parentOfTopCandidate = topCandidate.parentNode;
          while (parentOfTopCandidate.tagName != "BODY" && parentOfTopCandidate.children.length == 1) {
            topCandidate = parentOfTopCandidate;
            parentOfTopCandidate = topCandidate.parentNode;
          }
          if (!topCandidate.readability) {
            this._initializeNode(topCandidate);
          }
          if (!allSections.includes(topCandidate)) {
            allSections.push(topCandidate);
          }
        }
      }

      // Now that we have the top candidate, look through its siblings for content
      // that might also be related. Things like preambles, content split by ads
      // that we removed, etc.
      var articleContent = doc.createElement("DIV");
      if (isPaging) articleContent.id = "readability-content";
      var hasMainImage = 0;
      if (!this._articleImage) {
        hasMainImage = -1;
      }
      for (var si = 0; hasMainImage == 0 && si < allSections.length; si++) {
        topCandidate = allSections[si];
        var imgs = articleContent.getElementsByTagName("img");
        this._forEachNode(imgs, function (img) {
          var src = img.getAttribute("src");
          if (src === this._articleImage) {
            hasMainImage = 1;
          }
        });
      }
      if (hasMainImage == 0) {
        var imgElement;
        var imgs = this._doc.body.getElementsByTagName("img");
        this._forEachNode(imgs, function (img) {
          var src = img.getAttribute("src");
          if (src === this._articleImage) {
            imgElement = img;
          }
        });
        if (imgElement) {
          if (imgElement.parentNode && imgElement.parentNode !== "BODY") {
            this._initializeNode(imgElement.parentNode);
            allSections.push(imgElement.parentNode);
          }
        }
      }
      allSections.sort(function (a, b) {
        return a._num - b._num;
      });
      for (var si = allSections.length - 1; si > 0; --si) {
        for (var sj = si - 1; sj >= 0; --sj) {
          if (this._isAncestor(allSections[sj], allSections[si])) {
            allSections.splice(si, 1);
            break;
          }
        }
      }
      for (var si = 0; si < allSections.length; si++) {
        topCandidate = allSections[si];
        var siblingScoreThreshold = Math.max(10, topCandidate.readability.contentScore * 0.2);
        // Keep potential top candidate's parent node to try to get text direction of it later.
        parentOfTopCandidate = topCandidate.parentNode;
        var siblings = parentOfTopCandidate.children;
        for (var s = 0, sl = siblings.length; s < sl; s++) {
          var sibling = siblings[s];
          var append = false;

          this.log("Looking at sibling node:", sibling, sibling.readability ? "with score " + sibling.readability.contentScore : "");
          this.log("Sibling has score", sibling.readability ? sibling.readability.contentScore : "Unknown");
          var required = this._hasMustInclude(sibling);
          if (!required && this._keepHeaders) {
            var h1 = sibling.getElementsByTagName("h1");
            if (h1 && h1.length >= 1) {
              required = true;
            }
          }
          if (!required && this._keepByline && this._hasByline(sibling)) {
            required = true;
          }

          if (required || sibling === topCandidate) {
            append = true;
          } else {
            var contentBonus = 0;

            // Give a bonus if sibling nodes and top candidates have the example same classname
            if (sibling.className === topCandidate.className && topCandidate.className !== "") contentBonus += topCandidate.readability.contentScore * 0.2;

            if (sibling.readability && sibling.readability.contentScore + contentBonus >= siblingScoreThreshold) {
              append = true;
            } else if (sibling.nodeName === "P") {
              var linkDensity = this._getLinkDensity(sibling);
              var nodeContent = this._getInnerText(sibling);
              var nodeLength = nodeContent.length;

              if (nodeLength > 80 && linkDensity < 0.25) {
                append = true;
              } else if (nodeLength < 80 && nodeLength > 0 && linkDensity === 0 && nodeContent.search(/\.( |$)/) !== -1) {
                append = true;
              }
            }
          }

          if (append) {
            this.log("Appending node:", sibling);

            if (this.ALTER_TO_DIV_EXCEPTIONS.indexOf(sibling.nodeName) === -1) {
              // We have a node that isn't a common block level element, like a form or td tag.
              // Turn it into a div so it doesn't get filtered out later by accident.
              this.log("Altering sibling:", sibling, "to div.");

              sibling = this._setNodeTag(sibling, "DIV");
            }
            articleContent.appendChild(sibling);
            // siblings is a reference to the children array, and
            // sibling is removed from the array when we call appendChild().
            // As a result, we must revisit this index since the nodes
            // have been shifted.
            s -= 1;
            sl -= 1;
          }
        }
      }
      if (this._debug) this.log("Article content pre-prep: " + articleContent.innerHTML);
      // So we have all of the content that we need. Now we clean it up for presentation.
      this._prepArticle(articleContent);
      if (this._debug) this.log("Article content post-prep: " + articleContent.innerHTML);

      if (neededToCreateTopCandidate) {
        // We already created a fake div thing, and there wouldn't have been any siblings left
        // for the previous loop, so there's no point trying to create a new div, and then
        // move all the children over. Just assign IDs and class names here. No need to append
        // because that already happened anyway.
        topCandidate.id = "readability-page-1";
        topCandidate.className = "page";
      } else {
        var div = doc.createElement("DIV");
        div.id = "readability-page-1";
        div.className = "page";
        var children = articleContent.childNodes;
        while (children.length) {
          div.appendChild(children[0]);
        }
        articleContent.appendChild(div);
      }

      if (this._debug) this.log("Article content after paging: " + articleContent.innerHTML);

      var parseSuccessful = true;

      // Now that we've gone through the full algorithm, check to see if
      // we got any meaningful content. If we didn't, we may need to re-run
      // grabArticle with different flags set. This gives us a higher likelihood of
      // finding the content, and the sieve approach gives us a higher likelihood of
      // finding the -right- content.
      var textLength = this._getInnerText(articleContent, true).length;
      if (textLength < this._charThreshold) {
        parseSuccessful = false;
        page.innerHTML = pageCacheHtml;

        if (this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)) {
          this._removeFlag(this.FLAG_STRIP_UNLIKELYS);
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
        } else if (this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) {
          this._removeFlag(this.FLAG_WEIGHT_CLASSES);
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
        } else if (this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) {
          this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY);
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
        } else {
          this._attempts.push({ articleContent: articleContent, textLength: textLength });
          // No luck after removing flags, just return the longest text we found during the different loops
          this._attempts.sort(function (a, b) {
            return a.textLength < b.textLength;
          });

          // But first check if we actually have something
          if (!this._attempts[0].textLength) {
            return null;
          }

          articleContent = this._attempts[0].articleContent;
          parseSuccessful = true;
        }
      }
      if (parseSuccessful) {
        // Find out text direction from ancestors of final top candidate.
        var ancestors = [parentOfTopCandidate, topCandidate].concat(this._getNodeAncestors(parentOfTopCandidate));
        this._someNode(ancestors, function (ancestor) {
          if (!ancestor.tagName) return false;
          var articleDir = ancestor.getAttribute("dir");
          if (articleDir) {
            this._articleDir = articleDir;
            return true;
          }
          return false;
        });
        this._removeMustExcludes(articleContent);
        return articleContent;
      }
    }
  },

  /**
   * Check whether the input string could be a byline.
   * This verifies that the input is a string, and that the length
   * is less than 100 chars.
   *
   * @param possibleByline {string} - a string to check whether its a byline.
   * @return Boolean - whether the input string is a byline.
   */
  _isValidByline: function _isValidByline(byline) {
    if (typeof byline == "string" || byline instanceof String) {
      byline = byline.trim();
      return byline.length > 0 && byline.length < 100;
    }
    return false;
  },

  /**
   * Attempts to get excerpt and byline metadata for the article.
   *
   * @return Object with optional "excerpt" and "byline" properties
   */
  _getArticleMetadata: function _getArticleMetadata() {
    var metadata = {};
    var values = {};
    var metaElements = this._doc.getElementsByTagName("meta");

    // property is a space-separated list of values
    var propertyPattern = /\s*(dc|dcterm|og|twitter)\s*:\s*(author|creator|description|title)\s*/gi;

    // name is a single value
    var namePattern = /^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[\.:]\s*)?(author|creator|description|title)\s*$/i;

    // Find description tags.
    this._forEachNode(metaElements, function (element) {
      this._metatags.push(element.outerHTML);
      var elementName = element.getAttribute("name");
      var elementProperty = element.getAttribute("property");
      var content = element.getAttribute("content");
      var matches = null;
      var name = null;
      var imageNames = ["dc:image", "dcterm:image", "og:image", "image", "twitter:image"];
      if (elementProperty) {
        if (imageNames.includes(elementProperty)) {
          metadata.image = content.trim();;
        }
        matches = elementProperty.match(propertyPattern);
        if (matches) {
          for (var i = matches.length - 1; i >= 0; i--) {
            // Convert to lowercase, and remove any whitespace
            // so we can match below.
            name = matches[i].toLowerCase().replace(/\s/g, "");
            // multiple authors
            values[name] = content.trim();
          }
        }
      }
      if (elementName && imageNames.includes(elementProperty)) {
        metadata.image = content.trim();;
      }
      if (!matches && elementName && namePattern.test(elementName)) {
        name = elementName;
        if (content) {
          // Convert to lowercase, remove any whitespace, and convert dots
          // to colons so we can match below.
          name = name.toLowerCase().replace(/\s/g, "").replace(/\./g, ":");
          values[name] = content.trim();
        }
      }
    });

    // get title
    metadata.title = values["dc:title"] || values["dcterm:title"] || values["og:title"] || values["weibo:article:title"] || values["weibo:webpage:title"] || values["title"] || values["twitter:title"];

    if (!metadata.title) {
      metadata.title = this._getArticleTitle();
    }

    // get author
    metadata.byline = values["dc:creator"] || values["dcterm:creator"] || values["author"];

    // get description
    metadata.excerpt = values["dc:description"] || values["dcterm:description"] || values["og:description"] || values["weibo:article:description"] || values["weibo:webpage:description"] || values["description"] || values["twitter:description"];

    return metadata;
  },

  /**
   * Removes script tags from the document.
   *
   * @param Element
  **/
  _removeScripts: function _removeScripts(doc) {
    this._removeNodes(doc.getElementsByTagName("script"), function (scriptNode) {
      scriptNode.nodeValue = "";
      scriptNode.removeAttribute("src");
      return true;
    });
    this._removeNodes(doc.getElementsByTagName("noscript"));
  },

  /**
   * Check if this node has only whitespace and a single element with given tag
   * Returns false if the DIV node contains non-empty text nodes
   * or if it contains no element with given tag or more than 1 element.
   *
   * @param Element
   * @param string tag of child element
  **/
  _hasSingleTagInsideElement: function _hasSingleTagInsideElement(element, tag) {
    // There should be exactly 1 element child with given tag
    if (element.children.length != 1 || element.children[0].tagName !== tag) {
      return false;
    }

    // And there should be no text nodes with real content
    return !this._someNode(element.childNodes, function (node) {
      return node.nodeType === this.TEXT_NODE && this.REGEXPS.hasContent.test(node.textContent);
    });
  },

  _isElementWithoutContent: function _isElementWithoutContent(node) {
    return node.nodeType === this.ELEMENT_NODE && node.textContent.trim().length == 0 && (node.children.length == 0 || node.children.length == node.getElementsByTagName("br").length + node.getElementsByTagName("hr").length);
  },

  /**
   * Determine whether element has any children block level elements.
   *
   * @param Element
   */
  _hasChildBlockElement: function _hasChildBlockElement(element) {
    return this._someNode(element.childNodes, function (node) {
      return this.DIV_TO_P_ELEMS.indexOf(node.tagName) !== -1 || this._hasChildBlockElement(node);
    });
  },

  /***
   * Determine if a node qualifies as phrasing content.
   * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
  **/
  _isPhrasingContent: function _isPhrasingContent(node) {
    return node.nodeType === this.TEXT_NODE || this.PHRASING_ELEMS.indexOf(node.tagName) !== -1 || (node.tagName === "A" || node.tagName === "DEL" || node.tagName === "INS") && this._everyNode(node.childNodes, this._isPhrasingContent);
  },

  _isWhitespace: function _isWhitespace(node) {
    return node.nodeType === this.TEXT_NODE && node.textContent.trim().length === 0 || node.nodeType === this.ELEMENT_NODE && node.tagName === "BR";
  },

  /**
   * Get the inner text of a node - cross browser compatibly.
   * This also strips out any excess whitespace to be found.
   *
   * @param Element
   * @param Boolean normalizeSpaces (default: true)
   * @return string
  **/
  _getInnerText: function _getInnerText(e, normalizeSpaces) {
    normalizeSpaces = typeof normalizeSpaces === "undefined" ? true : normalizeSpaces;
    var textContent = e.textContent.trim();

    if (normalizeSpaces) {
      return textContent.replace(this.REGEXPS.normalize, " ");
    }
    return textContent;
  },

  /**
   * Get the number of times a string s appears in the node e.
   *
   * @param Element
   * @param string - what to split on. Default is ","
   * @return number (integer)
  **/
  _getCharCount: function _getCharCount(e, s) {
    s = s || ",";
    return this._getInnerText(e).split(s).length - 1;
  },

  /**
   * Remove the style attribute on every e and under.
   * TODO: Test if getElementsByTagName(*) is faster.
   *
   * @param Element
   * @return void
  **/
  _cleanStyles: function _cleanStyles(e) {
    if (!e || e.tagName.toLowerCase() === "svg") return;

    // Remove `style` and deprecated presentational attributes
    for (var i = 0; i < this.PRESENTATIONAL_ATTRIBUTES.length; i++) {
      if (!this._keepStyles || this.PRESENTATIONAL_ATTRIBUTES !== "style") e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[i]);
    }

    if (this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName) !== -1) {
      e.removeAttribute("width");
      e.removeAttribute("height");
    }

    var cur = e.firstElementChild;
    while (cur !== null) {
      this._cleanStyles(cur);
      cur = cur.nextElementSibling;
    }
  },

  /**
   * Get the density of links as a percentage of the content
   * This is the amount of text that is inside a link divided by the total text in the node.
   *
   * @param Element
   * @return number (float)
  **/
  _getLinkDensity: function _getLinkDensity(element) {
    var textLength = this._getInnerText(element).length;
    if (textLength === 0) return 0;

    var linkLength = 0;

    // XXX implement _reduceNodeList?
    this._forEachNode(element.getElementsByTagName("a"), function (linkNode) {
      linkLength += this._getInnerText(linkNode).length;
    });

    return linkLength / textLength;
  },

  /**
   * Get an elements class/id weight. Uses regular expressions to tell if this
   * element looks good or bad.
   *
   * @param Element
   * @return number (Integer)
  **/
  _getClassWeight: function _getClassWeight(e) {
    if (!this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) return 0;

    var weight = 0;

    // Look for a special classname
    if (typeof e.className === "string" && e.className !== "") {
      if (this.REGEXPS.negative.test(e.className)) weight -= 25;

      if (this.REGEXPS.positive.test(e.className)) weight += 25;
    }

    // Look for a special ID
    if (typeof e.id === "string" && e.id !== "") {
      if (this.REGEXPS.negative.test(e.id)) weight -= 25;

      if (this.REGEXPS.positive.test(e.id)) weight += 25;
    }

    return weight;
  },

  /**
   * Clean a node of all elements of type "tag".
   * (Unless it's a youtube/vimeo video. People love movies.)
   *
   * @param Element
   * @param string tag to clean
   * @return void
   **/
  _clean: function _clean(e, tag) {
    var isEmbed = ["object", "embed", "iframe"].indexOf(tag) !== -1;

    this._removeNodes(e.getElementsByTagName(tag), function (element) {
      // Allow youtube and vimeo videos through as people usually want to see those.
      if (isEmbed) {
        var attributeValues = [].map.call(element.attributes, function (attr) {
          return attr.value;
        }).join("|");

        // First, check the elements attributes to see if any of them contain youtube or vimeo
        if (this.REGEXPS.videos.test(attributeValues)) return false;

        // Then check the elements inside this element for the same.
        if (this.REGEXPS.videos.test(element.innerHTML)) return false;
      }

      return true;
    });
  },

  /**
   * Check if a given node has one of its ancestor tag name matching the
   * provided one.
   * @param  HTMLElement node
   * @param  String      tagName
   * @param  Number      maxDepth
   * @param  Function    filterFn a filter to invoke to determine whether this node 'counts'
   * @return Boolean
   */
  _hasAncestorTag: function _hasAncestorTag(node, tagName, maxDepth, filterFn) {
    maxDepth = maxDepth || 3;
    tagName = tagName.toUpperCase();
    var depth = 0;
    while (node.parentNode) {
      if (maxDepth > 0 && depth > maxDepth) return false;
      if (node.parentNode.tagName === tagName && (!filterFn || filterFn(node.parentNode))) return true;
      node = node.parentNode;
      depth++;
    }
    return false;
  },

  _isAncestor: function _isAncestor(node, childnode) {
    while (childnode) {
      if (node === childnode) return true;
      childnode = childnode.parentNode;
    }
    return false;
  },
  /**
   * Return an object indicating how many rows and columns this table has.
   */
  _getRowAndColumnCount: function _getRowAndColumnCount(table) {
    var rows = 0;
    var columns = 0;
    var trs = table.getElementsByTagName("tr");
    for (var i = 0; i < trs.length; i++) {
      var rowspan = trs[i].getAttribute("rowspan") || 0;
      if (rowspan) {
        rowspan = parseInt(rowspan, 10);
      }
      rows += rowspan || 1;

      // Now look for column-related info
      var columnsInThisRow = 0;
      var cells = trs[i].getElementsByTagName("td");
      for (var j = 0; j < cells.length; j++) {
        var colspan = cells[j].getAttribute("colspan") || 0;
        if (colspan) {
          colspan = parseInt(colspan, 10);
        }
        columnsInThisRow += colspan || 1;
      }
      columns = Math.max(columns, columnsInThisRow);
    }
    return { rows: rows, columns: columns };
  },

  /**
   * Look for 'data' (as opposed to 'layout') tables, for which we use
   * similar checks as
   * https://dxr.mozilla.org/mozilla-central/rev/71224049c0b52ab190564d3ea0eab089a159a4cf/accessible/html/HTMLTableAccessible.cpp#920
   */
  _markDataTables: function _markDataTables(root) {
    var tables = root.getElementsByTagName("table");
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      var role = table.getAttribute("role");
      if (role == "presentation") {
        table._readabilityDataTable = false;
        continue;
      }
      var datatable = table.getAttribute("datatable");
      if (datatable == "0") {
        table._readabilityDataTable = false;
        continue;
      }
      var summary = table.getAttribute("summary");
      if (summary) {
        table._readabilityDataTable = true;
        continue;
      }

      var caption = table.getElementsByTagName("caption")[0];
      if (caption && caption.childNodes.length > 0) {
        table._readabilityDataTable = true;
        continue;
      }

      // If the table has a descendant with any of these tags, consider a data table:
      var dataTableDescendants = ["col", "colgroup", "tfoot", "thead", "th"];
      var descendantExists = function descendantExists(tag) {
        return !!table.getElementsByTagName(tag)[0];
      };
      if (dataTableDescendants.some(descendantExists)) {
        this.log("Data table because found data-y descendant");
        table._readabilityDataTable = true;
        continue;
      }

      // Nested tables indicate a layout table:
      if (table.getElementsByTagName("table")[0]) {
        table._readabilityDataTable = false;
        continue;
      }

      var sizeInfo = this._getRowAndColumnCount(table);
      if (sizeInfo.rows >= 10 || sizeInfo.columns > 4) {
        table._readabilityDataTable = true;
        continue;
      }
      // Now just go by size entirely:
      table._readabilityDataTable = sizeInfo.rows * sizeInfo.columns > 10;
    }
  },

  /**
   * Clean an element of all tags of type "tag" if they look fishy.
   * "Fishy" is an algorithm based on content length, classnames, link density, number of images & embeds, etc.
   *
   * @return void
   **/
  _cleanConditionally: function _cleanConditionally(e, tag) {
    if (!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) return;

    var isList = tag === "ul" || tag === "ol";

    // Gather counts for other typical elements embedded within.
    // Traverse backwards so we can remove nodes at the same time
    // without effecting the traversal.
    //
    // TODO: Consider taking into account original contentScore here.
    this._removeNodes(e.getElementsByTagName(tag), function (node) {
      // First check if we're in a data table, in which case don't remove us.
      var isDataTable = function isDataTable(t) {
        return t._readabilityDataTable;
      };

      if (this._hasAncestorTag(node, "table", -1, isDataTable)) {
        return false;
      }

      var weight = this._getClassWeight(node);
      var contentScore = 0;

      this.log("Cleaning Conditionally", node);

      if (weight + contentScore < 0) {
        return true;
      }

      if (this._getCharCount(node, ",") < 10) {
        // If there are not very many commas, and the number of
        // non-paragraph elements is more than paragraphs or other
        // ominous signs, remove the element.
        var p = node.getElementsByTagName("p").length;
        var img = node.getElementsByTagName("img").length;
        var li = node.getElementsByTagName("li").length - 100;
        var input = node.getElementsByTagName("input").length;

        var embedCount = 0;
        var embeds = node.getElementsByTagName("embed");
        for (var ei = 0, il = embeds.length; ei < il; ei += 1) {
          if (!this.REGEXPS.videos.test(embeds[ei].src)) embedCount += 1;
        }

        var linkDensity = this._getLinkDensity(node);
        var contentLength = this._getInnerText(node).length;

        var haveToRemove = img > 1 && p / img < 0.5 && !this._hasAncestorTag(node, "figure") || !isList && li > p || input > Math.floor(p / 3) || !isList && contentLength < 25 && (img === 0 || img > 2) && !this._hasAncestorTag(node, "figure") || !isList && weight < 25 && linkDensity > 0.2 || weight >= 25 && linkDensity > 0.5 || embedCount === 1 && contentLength < 75 || embedCount > 1;
        return haveToRemove;
      }
      return false;
    });
  },

  /**
   * Clean out elements whose id/class combinations match specific string.
   *
   * @param Element
   * @param RegExp match id/class combination.
   * @return void
   **/
  _cleanMatchedNodes: function _cleanMatchedNodes(e, regex) {
    var endOfSearchMarkerNode = this._getNextNode(e, true);
    var next = this._getNextNode(e);
    while (next && next != endOfSearchMarkerNode) {
      if (regex.test(next.className + " " + next.id)) {
        next = this._removeAndGetNext(next);
      } else {
        next = this._getNextNode(next);
      }
    }
  },

  /**
   * Clean out spurious headers from an Element. Checks things like classnames and link density.
   *
   * @param Element
   * @return void
  **/
  _cleanHeaders: function _cleanHeaders(e) {
    for (var headerIndex = 1; headerIndex < 3; headerIndex += 1) {
      this._removeNodes(e.getElementsByTagName("h" + headerIndex), function (header) {
        return this._getClassWeight(header) < 0;
      });
    }
  },

  _flagIsActive: function _flagIsActive(flag) {
    return (this._flags & flag) > 0;
  },

  _removeFlag: function _removeFlag(flag) {
    this._flags = this._flags & ~flag;
  },

  _isProbablyVisible: function _isProbablyVisible(node) {
    return node.style.display != "none" && !node.hasAttribute("hidden");
  },

  /**
   * Decides whether or not the document is reader-able without parsing the whole thing.
   *
   * @return boolean Whether or not we suspect parse() will suceeed at returning an article object.
   */
  isProbablyReaderable: function isProbablyReaderable(helperIsVisible) {
    var nodes = this._getAllNodesWithTag(this._doc, ["p", "pre"]);

    // Get <div> nodes which have <br> node(s) and append them into the `nodes` variable.
    // Some articles' DOM structures might look like
    // <div>
    //   Sentences<br>
    //   <br>
    //   Sentences<br>
    // </div>
    var brNodes = this._getAllNodesWithTag(this._doc, ["div > br"]);
    if (brNodes.length) {
      var set = new Set();
      [].forEach.call(brNodes, function (node) {
        set.add(node.parentNode);
      });
      nodes = [].concat.apply(Array.from(set), nodes);
    }

    if (!helperIsVisible) {
      helperIsVisible = this._isProbablyVisible;
    }

    var score = 0;
    // This is a little cheeky, we use the accumulator 'score' to decide what to return from
    // this callback:
    return this._someNode(nodes, function (node) {
      if (helperIsVisible && !helperIsVisible(node)) return false;
      var matchString = node.className + " " + node.id;

      if (this.REGEXPS.unlikelyCandidates.test(matchString) && !this.REGEXPS.okMaybeItsACandidate.test(matchString)) {
        return false;
      }

      if (node.matches && node.matches("li p")) {
        return false;
      }

      var textContentLength = node.textContent.trim().length;
      if (textContentLength < 140) {
        return false;
      }

      score += Math.sqrt(textContentLength - 140);

      if (score > 20) {
        return true;
      }
      return false;
    });
  },

  _setScores: function _setScores(node) {
    if (!(typeof node.readability === "undefined")) {
      try {
        node.setAttribute("score", node.readability.contentScore);
      } catch (err) {
        this.dumperr(err);
      }
    }
    if (!node.children) {
      return;
    }
    try {
      var length = node.children.length;
      for (var i = 0; i < length; i++) {
        var child = node.children[i];
        this._setScores(child);
      }
    } catch (err) {
      this.dumperr(err);
    }
  },
  _inclExclTest1: function _inclExclTest1(node) {
    var txt = node.textContent || "";
    if (node.tagName === "P" && txt.includes("Today, Elon Musk announced via Twitter that the first Boring Company")) {
      node.setAttribute(this._inclExclAttr, "exclude");
    }
    if (!node.children) {
      return;
    }
    try {
      var length = node.children.length;
      for (var i = 0; i < length; i++) {
        var child = node.children[i];
        this._inclExclTest1(child);
      }
    } catch (err) {
      this.dumperr(err);
    }
  },
  _inclExclTest2: function _inclExclTest2(node) {
    if (node.tagName === "H2") {
      var txt = node.textContent || "";
      if (txt.includes("Impeach Trump for lying about sex")) {
        node.setAttribute(this._inclExclAttr, "include");
      }
    }
    for (var i = 0; i < node.children.length; i++) {
      if (this._inclExclTest2(node.children[i])) {
        return true;
      }
    }
    return false;
  },
  _inclExclTest3: function _inclExclTest3(node) {
    var txt = node.textContent || "";
    if (node.tagName === "P" && txt.includes("quick attempt by Sony to cash in on the micro-console trend")) {
      node.setAttribute(this._inclExclAttr, "include");
    }
    if (node.tagName === "P" && txt.includes("Younger gamers who didn't grow up with the PlayStation might find something to enjoy")) {
      node.setAttribute(this._inclExclAttr, "include");
    }
    if (!node.children) {
      return;
    }
    try {
      var length = node.children.length;
      for (var i = 0; i < length; i++) {
        var child = node.children[i];
        this._inclExclTest3(child);
      }
    } catch (err) {
      this.dumperr(err);
    }
  },
  /**
   * Runs readability.
   *
   * Workflow:
   *  1. Prep the document by removing script tags, css, etc.
   *  2. Build readability's DOM tree.
   *  3. Grab the article content from the current dom tree.
   *  4. Replace the current DOM tree with the new one.
   *  5. Read peacefully.
   *
   * @return void
   **/
  parse: function parse() {
    // Avoid parsing too large documents, as per configuration option
    if (this._maxElemsToParse > 0) {
      var numTags = this._doc.getElementsByTagName("*").length;
      if (numTags > this._maxElemsToParse) {
        throw new Error("Aborting parsing document; " + numTags + " elements found");
      }
    }

    // Remove script tags from the document.
    this._removeScripts(this._doc);
    this._prepDocument();
    this._numberNodes(this._doc.documentElement, 0);
    try {
      this._docSrc = this._doc.documentElement.cloneNode(true);
      this._buildNodeMap(this._docSrc, this._nodeMap);
    } catch (err) {
      this.dumperr(err);
    }
    var metadata = this._getArticleMetadata();
    this._articleTitle = metadata.title;
    this._articleImage = metadata.image;
    var articleContent;
    try {
      articleContent = this._grabArticle();
    } catch (err) {
      this.dumperr(err);
    }
    if (!articleContent) return null;

    this.log("Grabbed: " + articleContent.innerHTML);

    this._postProcessContent(articleContent);
    this._setScores(articleContent);

    // If we haven't found an excerpt in the article's metadata, use the article's
    // first paragraph as the excerpt. This is used for displaying a preview of
    // the article's content.
    if (!metadata.excerpt) {
      var paragraphs = articleContent.getElementsByTagName("p");
      if (paragraphs.length > 0) {
        metadata.excerpt = paragraphs[0].textContent.trim();
      }
    }

    var textContent = articleContent.textContent;

    return {
      title: this._articleTitle,
      byline: metadata.byline || this._articleByline,
      dir: this._articleDir,
      content: articleContent.innerHTML,
      textContent: textContent,
      length: textContent.length,
      excerpt: metadata.excerpt,
      metatags: this._metatags,
      log: this._docSrc ? this._docSrc.innerHTML : ""
    };
  }
};

if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object") {
  module.exports = Readability;
}

},{}],80:[function(_dereq_,module,exports){
'use strict';

/**
 * This module defines the set of global events that are dispatched
 * across the bridge between the sidebar and annotator
 */

module.exports = {
  // Events that the sidebar sends to the annotator
  // ----------------------------------------------

  /**
   * The updated feature flags for the user
   */
  FEATURE_FLAGS_UPDATED: 'featureFlagsUpdated',

  /**
   * The sidebar is asking the annotator to open the partner site about page.
   */
  ABOUT_REQUESTED: 'aboutRequested',

  /**
   * The sidebar is asking the annotator to open the partner site help page.
   */
  HELP_REQUESTED: 'helpRequested',

  /** The sidebar is asking the annotator to do a partner site log in
   *  (for example, pop up a log in window). This is used when the client is
   *  embedded in a partner site and a log in button in the client is clicked.
   */
  LOGIN_REQUESTED: 'loginRequested',

  /** The sidebar is asking the annotator to do a partner site log out.
   *  This is used when the client is embedded in a partner site and a log out
   *  button in the client is clicked.
   */
  LOGOUT_REQUESTED: 'logoutRequested',

  /**
   * The sidebar is asking the annotator to open the partner site profile page.
   */
  PROFILE_REQUESTED: 'profileRequested',

  /**
   * The set of annotations was updated.
   */
  PUBLIC_ANNOTATION_COUNT_CHANGED: 'publicAnnotationCountChanged',

  /**
   * The sidebar is asking the annotator to do a partner site sign-up.
   */
  SIGNUP_REQUESTED: 'signupRequested'

  // Events that the annotator sends to the sidebar
  // ----------------------------------------------
};

},{}],81:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var extend = _dereq_('extend');

var RPC = _dereq_('./frame-rpc');

/**
 * The Bridge service sets up a channel between frames and provides an events
 * API on top of it.
 */

var Bridge = function () {
  function Bridge() {
    _classCallCheck(this, Bridge);

    this.links = [];
    this.channelListeners = {};
    this.onConnectListeners = [];
  }

  /**
   * Destroy all channels created with `createChannel`.
   *
   * This removes the event listeners for messages arriving from other windows.
   */


  _createClass(Bridge, [{
    key: 'destroy',
    value: function destroy() {
      Array.from(this.links).map(function (link) {
        return link.channel.destroy();
      });
    }

    /**
     * Create a communication channel between this window and `source`.
     *
     * The created channel is added to the list of channels which `call`
     * and `on` send and receive messages over.
     *
     * @param {Window} source - The source window.
     * @param {string} origin - The origin of the document in `source`.
     * @param {string} token
     * @return {RPC} - Channel for communicating with the window.
     */

  }, {
    key: 'createChannel',
    value: function createChannel(source, origin, token) {
      var _this = this;

      var channel = null;
      var connected = false;

      var ready = function ready() {
        if (connected) {
          return;
        }
        connected = true;
        Array.from(_this.onConnectListeners).forEach(function (cb) {
          return cb.call(null, channel, source);
        });
      };

      var connect = function connect(_token, cb) {
        if (_token === token) {
          cb();
          ready();
        }
      };

      var listeners = extend({ connect: connect }, this.channelListeners);

      // Set up a channel
      channel = new RPC(window, source, origin, listeners);

      // Fire off a connection attempt
      channel.call('connect', token, ready);

      // Store the newly created channel in our collection
      this.links.push({
        channel: channel,
        window: source
      });

      return channel;
    }

    /**
     * Make a method call on all channels, collect the results and pass them to a
     * callback when all results are collected.
     *
     * @param {string} method - Name of remote method to call.
     * @param {any[]} args - Arguments to method.
     * @param [Function] callback - Called with an array of results.
     */

  }, {
    key: 'call',
    value: function call(method) {
      var _this2 = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var cb;
      if (typeof args[args.length - 1] === 'function') {
        cb = args[args.length - 1];
        args = args.slice(0, -1);
      }

      var _makeDestroyFn = function _makeDestroyFn(c) {
        return function (error) {
          c.destroy();
          _this2.links = Array.from(_this2.links).filter(function (l) {
            return l.channel !== c;
          }).map(function (l) {
            return l;
          });
          throw error;
        };
      };

      var promises = this.links.map(function (l) {
        var p = new Promise(function (resolve, reject) {
          var timeout = setTimeout(function () {
            return resolve(null);
          }, 1000);
          try {
            var _l$channel;

            return (_l$channel = l.channel).call.apply(_l$channel, [method].concat(_toConsumableArray(Array.from(args)), [function (err, result) {
              clearTimeout(timeout);
              if (err) {
                return reject(err);
              } else {
                return resolve(result);
              }
            }]));
          } catch (error) {
            var err = error;
            return reject(err);
          }
        });

        // Don't assign here. The disconnect is handled asynchronously.
        return p.catch(_makeDestroyFn(l.channel));
      });

      var resultPromise = Promise.all(promises);

      if (cb) {
        resultPromise = resultPromise.then(function (results) {
          return cb(null, results);
        }).catch(function (error) {
          return cb(error);
        });
      }

      return resultPromise;
    }

    /**
     * Register a callback to be invoked when any connected channel sends a
     * message to this `Bridge`.
     *
     * @param {string} method
     * @param {Function} callback
     */

  }, {
    key: 'on',
    value: function on(method, callback) {
      if (this.channelListeners[method]) {
        throw new Error('Listener \'' + method + '\' already bound in Bridge');
      }
      this.channelListeners[method] = callback;
      return this;
    }

    /**
     * Unregister any callbacks registered with `on`.
     *
     * @param {string} method
     */

  }, {
    key: 'off',
    value: function off(method) {
      delete this.channelListeners[method];
      return this;
    }

    /**
     * Add a function to be called upon a new connection.
     *
     * @param {Function} callback
     */

  }, {
    key: 'onConnect',
    value: function onConnect(callback) {
      this.onConnectListeners.push(callback);
      return this;
    }
  }]);

  return Bridge;
}();

module.exports = Bridge;

},{"./frame-rpc":83,"extend":24}],82:[function(_dereq_,module,exports){
var Discovery,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Discovery = (function() {
  Discovery.prototype.server = false;

  Discovery.prototype.origin = '*';

  Discovery.prototype.onDiscovery = null;

  Discovery.prototype.requestInProgress = false;

  function Discovery(target, options) {
    this.target = target;
    if (options == null) {
      options = {};
    }
    this._onMessage = bind(this._onMessage, this);
    this.stopDiscovery = bind(this.stopDiscovery, this);
    if (options.server) {
      this.server = options.server;
    }
    if (options.origin) {
      this.origin = options.origin;
    }
  }

  Discovery.prototype.startDiscovery = function(onDiscovery) {
    if (this.onDiscovery) {
      throw new Error('Discovery is already in progress, call .stopDiscovery() first');
    }
    this.onDiscovery = onDiscovery;
    this.target.addEventListener('message', this._onMessage, false);
    this._beacon();
  };

  Discovery.prototype.stopDiscovery = function() {
    this.onDiscovery = null;
    this.target.removeEventListener('message', this._onMessage);
  };

  Discovery.prototype._beacon = function() {
    var beaconMessage, child, i, len, parent, queue, ref;
    beaconMessage = this.server ? '__cross_frame_dhcp_offer' : '__cross_frame_dhcp_discovery';
    queue = [this.target.top];
    while (queue.length) {
      parent = queue.shift();
      if (parent !== this.target) {
        parent.postMessage(beaconMessage, this.origin);
      }
      ref = parent.frames;
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        queue.push(child);
      }
    }
  };

  Discovery.prototype._onMessage = function(event) {
    var data, discovered, match, messageType, origin, ref, reply, source, token;
    source = event.source, origin = event.origin, data = event.data;
    if (origin === 'null' || origin.match('moz-extension:') || window.location.protocol === 'moz-extension:') {
      origin = '*';
    }
    match = typeof data.match === "function" ? data.match(/^__cross_frame_dhcp_(discovery|offer|request|ack)(?::(\d+))?$/) : void 0;
    if (!match) {
      return;
    }
    messageType = match[1];
    token = match[2];
    ref = this._processMessage(messageType, token, origin), reply = ref.reply, discovered = ref.discovered, token = ref.token;
    if (reply) {
      source.postMessage('__cross_frame_dhcp_' + reply, origin);
    }
    if (discovered) {
      this.onDiscovery.call(null, source, origin, token);
    }
  };

  Discovery.prototype._processMessage = function(messageType, token, origin) {
    var discovered, reply;
    reply = null;
    discovered = false;
    if (this.server) {
      if (messageType === 'discovery') {
        reply = 'offer';
      } else if (messageType === 'request') {
        token = this._generateToken();
        reply = 'ack' + ':' + token;
        discovered = true;
      } else if (messageType === 'offer' || messageType === 'ack') {
        throw new Error("A second Discovery server has been detected at " + origin + ".\nThis is unsupported and will cause unexpected behaviour.");
      }
    } else {
      if (messageType === 'offer') {
        if (!this.requestInProgress) {
          this.requestInProgress = true;
          reply = 'request';
        }
      } else if (messageType === 'ack') {
        this.requestInProgress = false;
        discovered = true;
      }
    }
    return {
      reply: reply,
      discovered: discovered,
      token: token
    };
  };

  Discovery.prototype._generateToken = function() {
    return ('' + Math.random()).replace(/\D/g, '');
  };

  return Discovery;

})();


},{}],83:[function(_dereq_,module,exports){
'use strict';

/* eslint-disable */

/** This software is released under the MIT license:

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */

/**
 * This is a modified copy of index.js from
 * https://github.com/substack/frame-rpc (see git log for the modifications),
 * upstream license above.
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var VERSION = '1.0.0';

module.exports = RPC;

function RPC(src, dst, origin, methods) {
    if (!(this instanceof RPC)) return new RPC(src, dst, origin, methods);
    var self = this;
    this.src = src;
    this.dst = dst;

    if (origin === '*') {
        this.origin = '*';
    } else {
        var uorigin = new URL(origin);
        this.origin = uorigin.protocol + '//' + uorigin.host;
    }

    this._sequence = 0;
    this._callbacks = {};

    this._onmessage = function (ev) {
        if (self._destroyed) return;
        if (self.dst !== ev.source) return;
        if (self.origin !== '*' && ev.origin !== self.origin) return;
        if (!ev.data || _typeof(ev.data) !== 'object') return;
        if (ev.data.protocol !== 'frame-rpc') return;
        if (!Array.isArray(ev.data.arguments)) return;
        self._handle(ev.data);
    };
    this.src.addEventListener('message', this._onmessage);
    this._methods = (typeof methods === 'function' ? methods(this) : methods) || {};
}

RPC.prototype.destroy = function () {
    this._destroyed = true;
    this.src.removeEventListener('message', this._onmessage);
};

RPC.prototype.call = function (method) {
    var args = [].slice.call(arguments, 1);
    return this.apply(method, args);
};

RPC.prototype.apply = function (method, args) {
    if (this._destroyed) return;
    var seq = this._sequence++;
    if (typeof args[args.length - 1] === 'function') {
        this._callbacks[seq] = args[args.length - 1];
        args = args.slice(0, -1);
    }
    this.dst.postMessage({
        protocol: 'frame-rpc',
        version: VERSION,
        sequence: seq,
        method: method,
        arguments: args
    }, this.origin);
};

RPC.prototype._handle = function (msg) {
    var self = this;
    if (self._destroyed) return;
    if (msg.hasOwnProperty('method')) {
        if (!this._methods.hasOwnProperty(msg.method)) return;
        var args = msg.arguments.concat(function () {
            self.dst.postMessage({
                protocol: 'frame-rpc',
                version: VERSION,
                response: msg.sequence,
                arguments: [].slice.call(arguments)
            }, self.origin);
        });
        this._methods[msg.method].apply(this._methods, args);
    } else if (msg.hasOwnProperty('response')) {
        var cb = this._callbacks[msg.response];
        delete this._callbacks[msg.response];
        if (cb) cb.apply(null, msg.arguments);
    }
};

},{}],84:[function(_dereq_,module,exports){
'use strict';

// `Object.assign()`-like helper. Used because this script needs to work
// in IE 10/11 without polyfills.

function assign(dest, src) {
  for (var k in src) {
    if (src.hasOwnProperty(k)) {
      dest[k] = src[k];
    }
  }
  return dest;
}

/**
 * Return a parsed `js-hypothesis-config` object from the document, or `{}`.
 *
 * Find all `<script class="js-hypothesis-config">` tags in the given document,
 * parse them as JSON, and return the parsed object.
 *
 * If there are no `js-hypothesis-config` tags in the document then return
 * `{}`.
 *
 * If there are multiple `js-hypothesis-config` tags in the document then merge
 * them into a single returned object (when multiple scripts contain the same
 * setting names, scripts further down in the document override those further
 * up).
 *
 * @param {Document|Element} document - The root element to search.
 */
function jsonConfigsFrom(document) {
  var config = {};
  var settingsElements = document.querySelectorAll('script.js-hypothesis-config');

  for (var i = 0; i < settingsElements.length; i++) {
    var settings;
    try {
      settings = JSON.parse(settingsElements[i].textContent);
    } catch (err) {
      console.warn('Could not parse settings from js-hypothesis-config tags', err);
      settings = {};
    }
    assign(config, settings);
  }

  return config;
}

module.exports = {
  jsonConfigsFrom: jsonConfigsFrom
};

},{}]},{},[59])
//# sourceMappingURL=annotator.bundle.js.map
