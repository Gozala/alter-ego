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

var core = require('../core'),
    define = core.define,
    record = core.record,
    over = core.over,
    construct = core.construct,
    implement = core.implement,
    extend = core.extend

exports['test record'] = function(assert) {
  var Point = define(record, [ 'x', 'y' ])
  var point = new Point(1, 2)

  assert.deepEqual(point, { x: 1, y: 2 },
                   'point initialized with record properties')
  assert.ok(point instanceof Point, 'point is instance of Point')
}

exports['test extend'] = function(assert) {
  var Point = define(record, [ 'x', 'y' ])
  var Pixel = define(extend, Point, record, [ 'x', 'y', 'color' ])

  var pixel = new Pixel(1, 2, 'red')

  assert.deepEqual(pixel, { x: 1, y: 2, color: 'red' },
                   'pixel initialized with record properties')
  assert.ok(pixel instanceof Pixel, 'pixel is instance of Pixel')
  assert.ok(pixel instanceof Point, 'pixel is instance of Point')
}

exports['test construct'] = function(assert) {
  function genID() {
    return 0 // In real code this will be generated
  }

  var Type = define(
    construct, function(options) {
      this.name = options.name
      this.id = genID()
    })

  var value = new Type({ name: 'a' })

  assert.ok(value instanceof Type, 'value is instance of Type')
  assert.deepEqual(value, { name: 'a', id: 0 }, 'value has desired shape')
}

exports['test implement'] = function(assert) {
  var Type = define(
    implement, {
      initialize: function(options) {
        this.name = options.name
      },
      toString: function() {
        return '<' + this.name + '>'
      }
    })

  var value = new Type({ name: 'jack' })
  assert.ok(value instanceof Type, 'value is instance of Type')
  assert.deepEqual(value, { name: 'jack' }, 'initializer was called')
  assert.equal(String(value), '<jack>', 'toString was implemented')
}

exports['test smoke'] = function(assert) {
  var Point = define(
    record, [ 'x', 'y' ],
    implement, {
      clear: function() {
        this.x = 0
        this.y = 0
      }
    })

  var Pixel = define(
    record, [ 'x', 'y', 'color' ],
    extend, Point,
    implement, {
      toString: function() {
        return '<' + this.color + '@' + this.x + ':' + this.y + '>'
      }
    })

  var pixel = new Pixel(1, 2, 'red')

  assert.ok(pixel instanceof Point, 'pixel is instance of Point')
  assert.ok(pixel instanceof Pixel, 'pixel is instance of Pixel')
  assert.deepEqual(pixel, { x: 1, y: 2, color: 'red' },
                   'pixel has desired shape')
  assert.equal(String(pixel), '<red@1:2>', 'method is defined')
  pixel.clear()
  assert.equal(String(pixel), '<red@0:0>', 'method is inherited')

  define(
    over, Pixel,
    implement, {
      clear: function() {
        Point.prototype.clear.call(this)
        this.color = ''
      }
    })

  pixel.clear()

  assert.equal(String(pixel), '<@0:0>', 'method was refined')
}

exports['test custom functions'] = function(assert) {
  function after(type, methods) {
    var prototype = type.prototype
    Object.keys(methods).forEach(function(name) {
      var before = prototype[name]
      var after = methods[name]
      prototype[name] = function() {
        before.apply(this, arguments)
        return after.call(this)
      }
    })

    return type
  }

  var Point = define(
    record, [ 'x', 'y' ],
    implement, {
      clear: function() {
        this.x = 0
        this.y = 0
      }
    })

  var Point3D = define(
    record, [ 'x', 'y', 'z' ],
    extend, Point,
    after, {
      clear: function() {
        this.z = 0
      }
    })

  var point = new Point3D(1, 2, 3)

  assert.deepEqual(point, { x: 1, y: 2, z: 3 }, 'has correct shape')
  point.clear()
  assert.deepEqual(point, { x: 0, y: 0, z: 0 }, 'after extension was defined')

}

if (module == require.main)
  require("test").run(exports);

});
