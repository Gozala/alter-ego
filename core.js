/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         forin: true latedef: false supernew: true */
/*global define: true */

!function(factory) {
  if (typeof(define) === 'function') { // RequireJS
    define(factory);
  } else if (typeof(exports) === 'object') { // CommonJS
    factory(require, exports, module);
  } else if (~String(this).indexOf('BackstagePass')) { // JSM
    factory(undefined, this, { uri: __URI__ });
    this.EXPORTED_SYMBOLS = Object.keys(this);
  } else {  // window
    factory(undefined, (this.ego = {}), { uri: document.location.href });
  }
}.call(this, function(require, exports, module) {

'use strict';

var create = Object.create
var freeze = Object.freeze
var defineProperties = Object.defineProperties
var names = Object.getOwnPropertyNames
var property = Object.getOwnPropertyDescriptor

function descriptor(object) {
  var keys = names(object), value = {}
  var index = 0, count = keys.length
  while (index < count) value[keys[index]] = property(object, keys[index ++])
  return value
}

function Type() {
  function type() {
    this.initialize.apply(this, arguments)
  }
  type.prototype = create(Type.prototype)
  return type
}
Type.prototype = freeze(create(null, {
  constructor: { value: Object },
  initialize: { value: function initialize() {} },
  // Copy useful properties from `Object.prototype`.
  toString: { value: Object.prototype.toString },
  toLocaleString: { value: Object.prototype.toLocaleString },
  toSource: { value: Object.prototype.toSource },
  valueOf: { value: Object.prototype.valueOf },
  isPrototypeOf: { value: Object.prototype.isPrototypeOf }
}))

function define() {
  /**
  Function takes set of processor function and associated options and passed
  each function result returned by previous processor and options associated
  with a processor. First processor function is called with only options
  associated with it.
  **/
  var descriptor = arguments, index = 0, count = descriptor.length
  var type = Type()
  // Optimize case with `over` to avoid calling it.
  while (index < count) type = descriptor[index++](type, descriptor[index++])
  return type
}
exports.define = define

function over(_, type) {
  /**
  Takes two types and returns second one back. This is useful for refining
  existing types.
  **/
  return type
}
exports.over = over

function record(type, names) {
  /**
  Takes type and array of property names and creates constructor function
  that sets properties of instance to an argument having same index as
  name in names array. Returned constructor has same prototype as given
  type.
  **/
  var count = names.length
  function Record() {
    var value = this, index = 0
    while (index < count) value[names[index]] = arguments[index++]
  }
  Record.prototype = type.prototype
  return Record
}
exports.record = record

function construct(type, initialize) {
  /**
  Takes type and initializer function and creates constructor function
  that calls curried `initialize` with a given arguments. Returned constructor
  function will have same prototype as given type.
  **/
  function Construct() {
    var value = initialize.apply(this, arguments)
    return value === undefined ? this : value
  }
  Construct.prototype = type.prototype
  return Construct
}
exports.construct = construct

function extend(type, superType) {
  /**
  Takes `type` constructor function and sets it's `prototype`
  to `Object.create(prototype)`. This way instances of `type`
  will inherit from given `prototype`.
  **/
  type.prototype = create(superType.prototype)
  return type
}
exports.extend = extend

function implement(type, properties) {
  /**
  Takes `type` constructor function, set of `properties` and defines
  them on `type.prototype` overriding conflicting properties. If
  `properties` is a function, than `properties.prototype` is used
  instead.
  **/
  if (typeof(properties) === 'function') properties = properties.prototype
  defineProperties(type.prototype, descriptor(properties))
  return type
}
exports.implement = implement

});
