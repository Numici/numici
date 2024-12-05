(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";function settings(e,t){t||(t="js-hypothesis-settings");for(var n=e.querySelectorAll("script."+t),r={},o=0;o<n.length;o++)Object.assign(r,JSON.parse(n[o].textContent));return r}require("core-js/fn/object/assign"),module.exports=settings;

},{"core-js/fn/object/assign":3}],2:[function(require,module,exports){
"use strict";function sendAuthResponse(){if(!window.opener)return console.error("The client window was closed"),void 0;var t={type:"authorization_response",code:settings.code,state:settings.state},e="documentMode"in document;if(e)try{var n=window.opener,r=n.document.createEvent("HTMLEvents");r.initEvent("message",!0,!0),r.data=n.JSON.parse(JSON.stringify(t)),n.dispatchEvent(r),window.close()}catch(i){console.error('The "web_message" response mode is not supported in IE',i)}else window.opener.postMessage(t,settings.origin),window.close()}var settings=require("./base/settings")(document);sendAuthResponse();

},{"./base/settings":1}],3:[function(require,module,exports){
require("../../modules/es6.object.assign"),module.exports=require("../../modules/$.core").Object.assign;

},{"../../modules/$.core":6,"../../modules/es6.object.assign":21}],4:[function(require,module,exports){
module.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e};

},{}],5:[function(require,module,exports){
var toString={}.toString;module.exports=function(e){return toString.call(e).slice(8,-1)};

},{}],6:[function(require,module,exports){
var core=module.exports={version:"1.2.6"};"number"==typeof __e&&(__e=core);

},{}],7:[function(require,module,exports){
var aFunction=require("./$.a-function");module.exports=function(e,t,n){if(aFunction(e),void 0===t)return e;switch(n){case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,o){return e.call(t,n,r,o)}}return function(){return e.apply(t,arguments)}};

},{"./$.a-function":4}],8:[function(require,module,exports){
module.exports=function(e){if(void 0==e)throw TypeError("Can't call method on  "+e);return e};

},{}],9:[function(require,module,exports){
module.exports=!require("./$.fails")(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a});

},{"./$.fails":11}],10:[function(require,module,exports){
var global=require("./$.global"),core=require("./$.core"),hide=require("./$.hide"),redefine=require("./$.redefine"),ctx=require("./$.ctx"),PROTOTYPE="prototype",$export=function(e,t,n){var r,o,i,s,a=e&$export.F,u=e&$export.G,l=e&$export.S,c=e&$export.P,f=e&$export.B,p=u?global:l?global[t]||(global[t]={}):(global[t]||{})[PROTOTYPE],d=u?core:core[t]||(core[t]={}),h=d[PROTOTYPE]||(d[PROTOTYPE]={});u&&(n=t);for(r in n)o=!a&&p&&r in p,i=(o?p:n)[r],s=f&&o?ctx(i,global):c&&"function"==typeof i?ctx(Function.call,i):i,p&&!o&&redefine(p,r,i),d[r]!=i&&hide(d,r,s),c&&h[r]!=i&&(h[r]=i)};global.core=core,$export.F=1,$export.G=2,$export.S=4,$export.P=8,$export.B=16,$export.W=32,module.exports=$export;

},{"./$.core":6,"./$.ctx":7,"./$.global":12,"./$.hide":13,"./$.redefine":18}],11:[function(require,module,exports){
module.exports=function(e){try{return!!e()}catch(t){return!0}};

},{}],12:[function(require,module,exports){
var global=module.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=global);

},{}],13:[function(require,module,exports){
var $=require("./$"),createDesc=require("./$.property-desc");module.exports=require("./$.descriptors")?function(e,t,n){return $.setDesc(e,t,createDesc(1,n))}:function(e,t,n){return e[t]=n,e};

},{"./$":15,"./$.descriptors":9,"./$.property-desc":17}],14:[function(require,module,exports){
var cof=require("./$.cof");module.exports=Object("z").propertyIsEnumerable(0)?Object:function(e){return"String"==cof(e)?e.split(""):Object(e)};

},{"./$.cof":5}],15:[function(require,module,exports){
var $Object=Object;module.exports={create:$Object.create,getProto:$Object.getPrototypeOf,isEnum:{}.propertyIsEnumerable,getDesc:$Object.getOwnPropertyDescriptor,setDesc:$Object.defineProperty,setDescs:$Object.defineProperties,getKeys:$Object.keys,getNames:$Object.getOwnPropertyNames,getSymbols:$Object.getOwnPropertySymbols,each:[].forEach};

},{}],16:[function(require,module,exports){
var $=require("./$"),toObject=require("./$.to-object"),IObject=require("./$.iobject");module.exports=require("./$.fails")(function(){var e=Object.assign,t={},n={},r=Symbol(),o="abcdefghijklmnopqrst";return t[r]=7,o.split("").forEach(function(e){n[e]=e}),7!=e({},t)[r]||Object.keys(e({},n)).join("")!=o})?function(e){for(var t=toObject(e),n=arguments,r=n.length,o=1,i=$.getKeys,s=$.getSymbols,a=$.isEnum;r>o;)for(var u,l=IObject(n[o++]),c=s?i(l).concat(s(l)):i(l),f=c.length,p=0;f>p;)a.call(l,u=c[p++])&&(t[u]=l[u]);return t}:Object.assign;

},{"./$":15,"./$.fails":11,"./$.iobject":14,"./$.to-object":19}],17:[function(require,module,exports){
module.exports=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}};

},{}],18:[function(require,module,exports){
var global=require("./$.global"),hide=require("./$.hide"),SRC=require("./$.uid")("src"),TO_STRING="toString",$toString=Function[TO_STRING],TPL=(""+$toString).split(TO_STRING);require("./$.core").inspectSource=function(e){return $toString.call(e)},(module.exports=function(e,t,n,r){"function"==typeof n&&(n.hasOwnProperty(SRC)||hide(n,SRC,e[t]?""+e[t]:TPL.join(String(t))),n.hasOwnProperty("name")||hide(n,"name",t)),e===global?e[t]=n:(r||delete e[t],hide(e,t,n))})(Function.prototype,TO_STRING,function(){return"function"==typeof this&&this[SRC]||$toString.call(this)});

},{"./$.core":6,"./$.global":12,"./$.hide":13,"./$.uid":20}],19:[function(require,module,exports){
var defined=require("./$.defined");module.exports=function(e){return Object(defined(e))};

},{"./$.defined":8}],20:[function(require,module,exports){
var id=0,px=Math.random();module.exports=function(e){return"Symbol(".concat(void 0===e?"":e,")_",(++id+px).toString(36))};

},{}],21:[function(require,module,exports){
var $export=require("./$.export");$export($export.S+$export.F,"Object",{assign:require("./$.object-assign")});

},{"./$.export":10,"./$.object-assign":16}]},{},[2])
//# sourceMappingURL=post-auth.bundle.js.map
