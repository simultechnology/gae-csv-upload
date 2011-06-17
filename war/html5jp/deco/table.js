// Copyright 2008 futomi  http://www.html5.jp/
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// DecorationTable.js v1.0.1

/* -------------------------------------------------------------------
* define objects ( name space) for this library.
* ----------------------------------------------------------------- */

if( typeof html5jp == 'undefined' ) {
	html5jp = new Object();
}
if( typeof html5jp.deco == 'undefined' ) {
	html5jp.deco = new Object();
}
if( typeof html5jp.deco.table == 'undefined' ) {
	html5jp.deco.table = new Object();
}

/* -------------------------------------------------------------------
* main
* ----------------------------------------------------------------- */

(function () {

/* definition of global variables. */

var globals = {
	classNameOfTargetTable: "html5jp-tbldeco",
	classNameOfCheckbox: "html5jp-tbldeco-checkbox",
	propertyNameOfSelectedRow: "x-html5jp-selected",
	propertyNameOfDefaultRgb: "x-html5jp-defaultColor",
	targetTables: []
};

/* initialize the document. */

addEventListener(window, "load", init);

function init() {
	/* get a array including target table elemens. */
	var alltbls = getElementsByClassName(document, globals.classNameOfTargetTable);
	for( var i=0; i<alltbls.length; i++ ) {
		var elm = alltbls.item(i);
		if( elm.nodeName != "TABLE" ) { continue; }
		globals.targetTables.push(elm);
	}
	if(globals.targetTables.length == 0) { return false; }
	/* set event listeners on target tables. */
	for( var i=0; i<globals.targetTables.length; i++ ) {
		/* table */
		var tbl = globals.targetTables[i];
		/* tbody */
		for( var b=0; b<tbl.tBodies.length; b++ ) {
			var tbdy = tbl.tBodies.item(b);
			for( var r=0; r<tbdy.rows.length; r++ ) {
				var row = tbdy.rows.item(r);
				addEventListener(row, "mouseover", tblrow_hightlight);
				addEventListener(row, "mouseout", tblrow_lowlight);
				addEventListener(row, "click", tblrow_click);
				row.style.cursor = "pointer";
				for( var c=0; c<row.cells.length; c++ ) {
					var cell = row.cells.item(c);
					cell[globals.propertyNameOfDefaultRgb] = get_rgb_of_current_bgcolor(cell);
				}
				/* checkbox */
				var chk = getFirstCheckbox(row);
				if(chk != null) {
					if(chk.checked == true) {
						row[globals.propertyNameOfSelectedRow] = true;
					} else {
						row[globals.propertyNameOfSelectedRow] = false;
					}
				}
				/* color the row */
				stripe_row(row);
			}
		}
	}
}

function getFirstCheckbox(row) {
	var inputs = row.getElementsByTagName("INPUT");
	for( var i=0; i<inputs.length; i++ ) {
		if(inputs.item(i).type != "checkbox") { continue; }
		return inputs.item(i);
	}
	return null;
}

function stripe_row(row) {
	if( ! row || row.nodeName != "TR" ) { return false; }
	if(row[globals.propertyNameOfSelectedRow] == true) {
		for( var i=0; i<row.cells.length; i++ ) {
			var cell = row.cells.item(i);
			var luma = get_luma_for_highlight(cell);
			lighten_cell_bgcolor(cell, luma);
		}
	} else {
		for( var c=0; c<row.cells.length; c++ ) {
			var cell = row.cells.item(c);
			if(row.rowIndex % 2 == 0) {
				var rgb = cell[globals.propertyNameOfDefaultRgb];
				/* set the color to the cell */
				set_bgcolor_by_rgb(cell, rgb);
			} else {
				var luma = get_luma_for_stripe(cell);
				lighten_cell_bgcolor(cell, luma);
			}
		}
	}
}

/* table behavior manupulations. */

function tblrow_click(evt) {
	var row = eventTarget(evt);
	if(row.nodeName != "TR") {
		row = getAncestorNodeByTagName(row, "TR");
	}
	if(row == null) { return false; }
	if(row[globals.propertyNameOfSelectedRow] == true) {
		row[globals.propertyNameOfSelectedRow] = false;
		stripe_row(row);
	} else {
		row[globals.propertyNameOfSelectedRow] = true;
		for( var i=0; i<row.cells.length; i++ ) {
			var cell = row.cells.item(i);
			var luma = get_luma_for_highlight(cell);
			lighten_cell_bgcolor(cell, luma);
		}
	}
	/* if a checkbox is found in the row, change the status of the one. */
	var chk = getFirstCheckbox(row);
	if(chk != null) {
		chk.checked = row[globals.propertyNameOfSelectedRow];
	}
}

function tblrow_hightlight(evt) {
	var row = eventTarget(evt);
	if(row.nodeName != "TR") {
		row = getAncestorNodeByTagName(row, "TR");
	}
	if(row == null) { return false; }
	for( var i=0; i<row.cells.length; i++ ) {
		var cell = row.cells.item(i);
		var luma = get_luma_for_highlight(cell);
		lighten_cell_bgcolor(cell, luma);
	}
}

function tblrow_lowlight(evt) {
	var row = eventTarget(evt);
	if(row.nodeName != "TR") {
		row = getAncestorNodeByTagName(row, "TR");
	}
	if(row == null) { return false; }
	if( row[globals.propertyNameOfSelectedRow] == true ) { return false; }
	stripe_row(row);
}

function get_luma_for_highlight(cell) {
	/* get current (original) style of background-color. */
	var rgb = cell[globals.propertyNameOfDefaultRgb];
	if( rgb == null ) { return false; }
	/* convert rgb to yuv */
	var yuv = rgb_to_yuv(rgb);
	/* compute the luma (Y') information */
	var invert_limit = 220; /* 0 - 255 */
	var gain_rate = 0.24;
	var luma;
	if(yuv.y < invert_limit) {
		luma = yuv.y + gain_rate * 256;
	} else {
		luma = yuv.y - gain_rate * 256;
	}
	return luma;
}

function get_luma_for_stripe(cell) {
	/* get current (original) style of background-color. */
	var rgb = cell[globals.propertyNameOfDefaultRgb];
	if( rgb == null ) { return false; }
	/* convert rgb to yuv */
	var yuv = rgb_to_yuv(rgb);
	/* compute the luma (Y') information */
	var invert_limit = 220; /* 0 - 255 */
	var gain_rate = 0.09;
	var luma;
	if(yuv.y < invert_limit) {
		luma = yuv.y + gain_rate * 256;
	} else {
		luma = yuv.y - gain_rate * 256;
	}
	return luma;
}

function lighten_cell_bgcolor(cell, luma) {
	/* get current (original) style of background-color. */
	var rgb = cell[globals.propertyNameOfDefaultRgb];
	if( rgb == null ) { return false; }
	/* convert rgb to yuv */
	var yuv = rgb_to_yuv(rgb);
	yuv.y = luma;
	rgb = yuv_to_rgb(yuv);
	/* set the color to the element */
	set_bgcolor_by_rgb(cell, rgb);
}

function set_bgcolor_by_rgb(elm, rgb) {
	var new_color;
	if(rgb.a < 1) {
		new_color = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + rgb.a + ")";
	} else {
		new_color = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
	}
	elm.style.backgroundColor = new_color;
}

function get_rgb_of_current_bgcolor(elm) {
	var color;
	if( document.defaultView ) {
		color = document.defaultView.getComputedStyle(elm, null).getPropertyValue('background-color')
	} else if( elm.currentStyle ) {
		color = elm.currentStyle.getAttribute('backgroundColor');
	}
	var rgb = conv_color_to_rgb(color);
	return rgb;
}

function conv_color_to_rgb(color) {
	if( /^[a-zA-Z]+$/.test(color) && color_name_map[color] ) {
		color = color_name_map[color];
	}
	var rgb = {};
	var m;
	if( m = color.match( /rgb\(\s*(\d+)\,\s*(\d+)\,\s*(\d+)\s*\)/ ) ) {
		rgb.r = parseInt(m[1], 10);
		rgb.g = parseInt(m[2], 10);
		rgb.b = parseInt(m[3], 10);
		rgb.a = 1;
	} else if( m = color.match( /rgba\(\s*(\d+)\,\s*(\d+)\,\s*(\d+),\s*(\d+)\s*\)/ ) ) {
		rgb.r = parseInt(m[1], 10);
		rgb.g = parseInt(m[2], 10);
		rgb.b = parseInt(m[3], 10);
		rgb.a = parseInt(m[4], 10);
	} else if( m = color.match( /\#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/ ) ) {
		rgb.r = parseInt(m[1], 16);
		rgb.g = parseInt(m[2], 16);
		rgb.b = parseInt(m[3], 16);
		rgb.a = 1;
	} else if( m = color.match( /\#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/ ) ) {
		rgb.r = parseInt(m[1]+m[1], 16);
		rgb.g = parseInt(m[2]+m[2], 16);
		rgb.b = parseInt(m[3]+m[3], 16);
		rgb.a = 1;
	} else if( color == "transparent" ) {
		rgb.r = 255;
		rgb.g = 255;
		rgb.b = 255;
		rgb.a = 1;
	} else {
		return null;
	}
	/* for Safari */
	if( rgb.r == 0 && rgb.g == 0 && rgb.b == 0 && rgb.a == 0 ) {
		rgb.r = 255;
		rgb.g = 255;
		rgb.b = 255;
		rgb.a = 1;
	}
	/* */
	return rgb;
}

function rgb_to_yuv(rgb) {
	var yuv = {
		y: parseInt( 0.299 * rgb.r + 0.587  * rgb.g + 0.114 * rgb.b ),
		u: parseInt( -0.169 * rgb.r - 0.3316 * rgb.g + 0.500 * rgb.b ),
		v: parseInt( 0.500 * rgb.r - 0.4186 * rgb.g - 0.0813 * rgb.b )
	};
	return yuv;
}
function yuv_to_rgb(yuv) {
	var rgb = {
		r: parseInt( yuv.y + 1.402 * yuv.v ),
		g: parseInt( yuv.y - 0.714 * yuv.v - 0.344 * yuv.u ),
		b: parseInt( yuv.y + 1.772 * yuv.u )
	};
	for( var k in rgb ) {
		if(rgb[k] > 255) {
			rgb[k] = 255;
		}
	}
	return rgb;
}


/* DOM methods */

function getAncestorNodeByTagName(elm, tagName) {
	if( elm === document ) { return null; }
	var target = elm;
	while( target = target.parentNode ) {
		if(target == null) { return null; }
		if(target === document) { return null; }
		if(target.nodeName == tagName) {
			return target;
		}
	}
	return null;
}

function addEventListener(elm, type, func, useCapture) {
	if(! elm) { return false; }
	if(! useCapture) {
		useCapture = false;
	}
	if(elm.addEventListener) {
		elm.addEventListener(type, func, false);
	} else if(elm.attachEvent) {
		elm.attachEvent('on'+type, func);
	} else {
		return false;
	}
	return true;
}

function eventTarget(evt) {
	if(evt && evt.target) {
		if(evt.target.nodeType == 3) {
			return evt.target.parentNode;
		} else {
			return evt.target;
		}
	} else if(window.event && window.event.srcElement) {
		return window.event.srcElement;
	} else {
		return null;
	}
}

function getElementsByClassName(element, classNames) {
	if(element.getElementsByClassName) {
		return element.getElementsByClassName(classNames);
	}
	var tokens = split_a_string_on_spaces(classNames);
	var tn = tokens.length;
	var nodes = element.all ? element.all : element.getElementsByTagName("*");
	var n = nodes.length;
	var array = new Array();
	if( tn > 0 ) {
		if( document.evaluate ) {
			var contains = new Array();
			for(var i=0; i<tn; i++) {
				contains.push('contains(concat(" ",@class," "), " '+ tokens[i] + '")');
			}
			var xpathExpression = "/descendant::*[" + contains.join(" and ") + "]";
			var iterator = document.evaluate(xpathExpression, element, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			var inum = iterator.snapshotLength;
			for( var i=0; i<inum; i++ ) {
				var elm = iterator.snapshotItem(i);
				if( elm != element ) {
					array.push(iterator.snapshotItem(i));
				}
			}
		} else {
			for(var i=0; i<n; i++) {
				var elm = nodes.item(i);
				if( elm.className == "" ) { continue; }
				var class_list = split_a_string_on_spaces(elm.className);
				var class_name = class_list.join(" ");
				var f = true;
				for(var j=0; j<tokens.length; j++) {
					var re = new RegExp('(^|\\s)' + tokens[j] + '(\\s|$)')
					if( ! re.test(class_name) ) {
						f = false;
						break;
					}
				}
				if(f == true) {
					array.push(elm);
				}
			}
		}
	}
	/* add item(index) method to the array as if it behaves such as a NodeList interface. */
	array.item = function(index) {
		if(array[index]) {
			return array[index];
		} else {
			return null;
		}
	};
	//
	return array;
};

/* split a string on spaces */
split_a_string_on_spaces = function(string) {
	string = string.replace(/^[\t\s]+/, "");
	string = string.replace(/[\t\s]+$/, "");
	var tokens = string.split(/[\t\s]+/);
	return tokens;
};

/* color name mapping */
var color_name_map = {
	aliceblue : "#F0F8FF",
	antiquewhite : "#FAEBD7",
	aqua : "#00FFFF",
	aquamarine : "#7FFFD4",
	azure : "#F0FFFF",
	beige : "#F5F5DC",
	bisque : "#FFE4C4",
	black : "#000000",
	blanchedalmond : "#FFEBCD",
	blue : "#0000FF",
	blueviolet : "#8A2BE2",
	brass : "#B5A642",
	brown : "#A52A2A",
	burlywood : "#DEB887",
	cadetblue : "#5F9EA0",
	chartreuse : "#7FFF00",
	chocolate : "#D2691E",
	coolcopper : "#D98719",
	copper : "#BF00DF",
	coral : "#FF7F50",
	cornflower : "#BFEFDF",
	cornflowerblue : "#6495ED",
	cornsilk : "#FFF8DC",
	crimson : "#DC143C",
	cyan : "#00FFFF",
	darkblue : "#00008B",
	darkbrown : "#DA0B00",
	darkcyan : "#008B8B",
	darkgoldenrod : "#B8860B",
	darkgray : "#A9A9A9",
	darkgreen : "#006400",
	darkkhaki : "#BDB76B",
	darkmagenta : "#8B008B",
	darkolivegreen : "#556B2F",
	darkorange : "#FF8C00",
	darkorchid : "#9932CC",
	darkred : "#8B0000",
	darksalmon : "#E9967A",
	darkseagreen : "#8FBC8F",
	darkslateblue : "#483D8B",
	darkslategray : "#2F4F4F",
	darkturquoise : "#00CED1",
	darkviolet : "#9400D3",
	deeppink : "#FF1493",
	deepskyblue : "#00BFFF",
	dimgray : "#696969",
	dodgerblue : "#1E90FF",
	feldsper : "#FED0E0",
	firebrick : "#B22222",
	floralwhite : "#FFFAF0",
	forestgreen : "#228B22",
	fuchsia : "#FF00FF",
	gainsboro : "#DCDCDC",
	ghostwhite : "#F8F8FF",
	gold : "#FFD700",
	goldenrod : "#DAA520",
	gray : "#808080",
	green : "#008000",
	greenyellow : "#ADFF2F",
	honeydew : "#F0FFF0",
	hotpink : "#FF69B4",
	indianred : "#CD5C5C",
	indigo : "#4B0082",
	ivory : "#FFFFF0",
	khaki : "#F0E68C",
	lavender : "#E6E6FA",
	lavenderblush : "#FFF0F5",
	lawngreen : "#7CFC00",
	lemonchiffon : "#FFFACD",
	lightblue : "#ADD8E6",
	lightcoral : "#F08080",
	lightcyan : "#E0FFFF",
	lightgoldenrodyellow : "#FAFAD2",
	lightgreen : "#90EE90",
	lightgrey : "#D3D3D3",
	lightpink : "#FFB6C1",
	lightsalmon : "#FFA07A",
	lightseagreen : "#20B2AA",
	lightskyblue : "#87CEFA",
	lightslategray : "#778899",
	lightsteelblue : "#B0C4DE",
	lightyellow : "#FFFFE0",
	lime : "#00FF00",
	limegreen : "#32CD32",
	linen : "#FAF0E6",
	magenta : "#FF00FF",
	maroon : "#800000",
	mediumaquamarine : "#66CDAA",
	mediumblue : "#0000CD",
	mediumorchid : "#BA55D3",
	mediumpurple : "#9370DB",
	mediumseagreen : "#3CB371",
	mediumslateblue : "#7B68EE",
	mediumspringgreen : "#00FA9A",
	mediumturquoise : "#48D1CC",
	mediumvioletred : "#C71585",
	midnightblue : "#191970",
	mintcream : "#F5FFFA",
	mistyrose : "#FFE4E1",
	moccasin : "#FFE4B5",
	navajowhite : "#FFDEAD",
	navy : "#000080",
	oldlace : "#FDF5E6",
	olive : "#808000",
	olivedrab : "#6B8E23",
	orange : "#FFA500",
	orangered : "#FF4500",
	orchid : "#DA70D6",
	palegoldenrod : "#EEE8AA",
	palegreen : "#98FB98",
	paleturquoise : "#AFEEEE",
	palevioletred : "#DB7093",
	papayawhip : "#FFEFD5",
	peachpuff : "#FFDAB9",
	peru : "#CD853F",
	pink : "#FFC0CB",
	plum : "#DDA0DD",
	powderblue : "#B0E0E6",
	purple : "#800080",
	red : "#FF0000",
	richblue : "#0CB0E0",
	rosybrown : "#BC8F8F",
	royalblue : "#4169E1",
	saddlebrown : "#8B4513",
	salmon : "#FA8072",
	sandybrown : "#F4A460",
	seagreen : "#2E8B57",
	seashell : "#FFF5EE",
	sienna : "#A0522D",
	silver : "#C0C0C0",
	skyblue : "#87CEEB",
	slateblue : "#6A5ACD",
	slategray : "#708090",
	snow : "#FFFAFA",
	springgreen : "#00FF7F",
	steelblue : "#4682B4",
	tan : "#D2B48C",
	teal : "#008080",
	thistle : "#D8BFD8",
	tomato : "#FF6347",
	turquoise : "#40E0D0",
	violet : "#EE82EE",
	wheat : "#F5DEB3",
	white : "#FFFFFF",
	whitesmoke : "#F5F5F5",
	yellow : "#FFFF00",
	yellowgreen : "#9ACD32"
}

/* define methods of this library. */

html5jp.deco.table.getSelectedRows = function(tbl) {
	var target_tables = [];
	if( tbl && tbl.nodeName == "TABLE") {
		target_tables.push(tbl);
	} else {
		for( var i=0; i<globals.targetTables.length; i++ ) {
			target_tables.push(globals.targetTables[i]);
		}
	}
	var selected_rows = [];
	for( var i=0; i<target_tables.length; i++ ) {
		var target_tbl = target_tables[i];
		for( var b=0; b<target_tbl.tBodies.length; b++ ) {
			var tbdy = target_tbl.tBodies.item(b);
			for( var r=0; r<tbdy.rows.length; r++ ) {
				var row = tbdy.rows[r];
				if( row[globals.propertyNameOfSelectedRow] == true ) {
					selected_rows.push(row);
				}
			}
		}
	}
	/* add item(index) method to the array as if it behaves such as a NodeList interface. */
	selected_rows.item = function(index) {
		if(selected_rows[index]) {
			return selected_rows[index];
		} else {
			return null;
		}
	};
	return selected_rows;
}

})();



