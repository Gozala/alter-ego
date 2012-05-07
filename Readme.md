# alter-ego

[![Build Status](https://secure.travis-ci.org/Gozala/alter-ego.png)](http://travis-ci.org/Gozala/alter-ego)

This library provides simple but very extensible way to define types / classes /
constructors in JS. It comes a very small set of functions to do that, but any
function can be incorporated to allow more complex definitions.

## Usage

It's quite common to have constructors that just set given arguments as
properties of the instance, providing rest of the API through prototype
methods. This library makes this task simple by reducing all the machinery
code:

### define record

```js
var Point = define(record, [ 'x', 'y' ])
```

Code above will produce constructor which is equivalent of:

```js
var Point = function Point(x, y) {
  this.x = x
  ths.y = y
}
```

### define prototype

Commonly you will want to define some methods for the `Point` type, that
can be done as follows:

```js
var Point = define(
  record, [ 'x', 'y' ],
  implement, {
    clear: function() {
      this.x = 0
      this.y = 0
    }
  })
```

### extend type

You could also extend existing types in similar way:


```js
var Pixel = define(
  record, [ 'x', 'y', 'color' ],
  extend, Point,
  implement, {
    draw: function() {
      // ...
    }
  })
```

### custom constructor

Now `record` is limited to a very specific scenarios, but more generic use
cases are also covered:


```js
var Dog = define(
  construct, function(options) {
    this.name = options.name
    // ...
  },
  extend, Animal,
  implement, {
    bark: function() {
      // ....
    }
  })
```

### refine existing types

You could also refine existing types in a same way:

```js
define(
  over, EventEmitter,
  implement, {
    twice: function(type, listener) {
      var times = 0
      this.on(type, listener)
      this.on(type, function limiter() {
        if (++ times === 2) {
          this.removeListener(type, listener)
          this.removeListener(type, limiter)
        }
      })
    }
  })
```

## Extension

While this tiny library provides some core functionailty for building and
extending types / constructors / classes, there is no way it could cover all
use cases. That's not an issues since all the functionality is defined in
via simple functions like `extend`, `implement`, `record`... You could
incorporate your own functions to do more sophisticated things. For example
adding [aspect oriented programming](http://en.wikipedia.org/wiki/Aspect-oriented_programming)
concepts is very easy:

```js
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

var Point3D = define(
  record, [ 'x', 'y', 'z' ],
  extend, Point,
  after, {
    clear: function() {
      this.z = 0
    }
  })

// EventEmitter2
define(
  over, EventEmitter,
  after, {
    emit: function(type) {
      if (type !== '*')
        this.emit.apply(this, ['*'].concat(Array.prototype.slice.call(arguments))
    }
  })
```

You could in fact do so much more! Enforce API contracts using
[guards](https://github.com/Gozala/guards), define extensions on built-ins
types without changing their prototypes via [type based dispatch]
(https://github.com/Gozala/protocol) or do a [pattern based dispatch]
(https://github.com/Gozala/dispatcher/) or maybe something entirely new!

## Install

    npm install alter-ego
