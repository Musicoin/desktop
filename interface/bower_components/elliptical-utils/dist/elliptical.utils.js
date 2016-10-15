/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
      typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
        ? ctor === GeneratorFunction ||
    // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value instanceof AwaitArgument) {
          return Promise.resolve(value.arg).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
              callInvokeWithMethodAndArg,
              // Avoid propagating failures to Promises returned by later
              // invocations of the iterator.
              callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
              delegate.iterator[method],
              delegate.iterator,
              arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            context.sent = undefined;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
          type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
    // Among the various tricks for obtaining a reference to the global
    // object, this seems to be the most reliable technique that does not
    // use indirect eval (which violates Content Security Policy).
    typeof global === "object" ? global :
        typeof window === "object" ? window :
            typeof self === "object" ? self : this
);


if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(nextSource);
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}
/*
 * $Id: object-clone.js,v 0.41 2013/03/27 18:29:04 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 */

(function(global) {
  'use strict';
  if (!Object.freeze || typeof Object.freeze !== 'function') {
    throw Error('ES5 support required');
  }
  // from ES5
  var O = Object, OP = O.prototype,
      create = O.create,
      defineProperty = O.defineProperty,
      defineProperties = O.defineProperties,
      getOwnPropertyNames = O.getOwnPropertyNames,
      getOwnPropertyDescriptor = O.getOwnPropertyDescriptor,
      getPrototypeOf = O.getPrototypeOf,
      freeze = O.freeze,
      isFrozen = O.isFrozen,
      isSealed = O.isSealed,
      seal = O.seal,
      isExtensible = O.isExtensible,
      preventExtensions = O.preventExtensions,
      hasOwnProperty = OP.hasOwnProperty,
      toString = OP.toString,
      isArray = Array.isArray,
      slice = Array.prototype.slice;
  // Utility functions; some exported
  function defaults(dst, src) {
    getOwnPropertyNames(src).forEach(function(k) {
      if (!hasOwnProperty.call(dst, k)) defineProperty(
          dst, k, getOwnPropertyDescriptor(src, k)
      );
    });
    return dst;
  };
  var isObject = function(o) { return o === Object(o) };
  var isPrimitive = function(o) { return o !== Object(o) };
  var isFunction = function(f) { return typeof(f) === 'function' };
  var signatureOf = function(o) { return toString.call(o) };
  var HASWEAKMAP = (function() { // paranoia check
    try {
      var wm = new WeakMap();
      wm.set(wm, wm);
      return wm.get(wm) === wm;
    } catch(e) {
      return false;
    }
  })();
  // exported
  function is (x, y) {
    return x === y
        ? x !== 0 ? true
        : (1 / x === 1 / y) // +-0
        : (x !== x && y !== y); // NaN
  };
  function isnt (x, y) { return !is(x, y) };
  var defaultCK = {
    descriptors:true,
    extensibility:true,
    enumerator:getOwnPropertyNames
  };
  function equals (x, y, ck) {
    var vx, vy;
    if (HASWEAKMAP) {
      vx = new WeakMap();
      vy = new WeakMap();
    }
    ck = defaults(ck || {}, defaultCK);
    return (function _equals(x, y) {
      if (isPrimitive(x)) return is(x, y);
      if (isFunction(x))  return is(x, y);
      // check deeply
      var sx = signatureOf(x), sy = signatureOf(y);
      var i, l, px, py, sx, sy, kx, ky, dx, dy, dk, flt;
      if (sx !== sy) return false;
      switch (sx) {
        case '[object Array]':
        case '[object Object]':
          if (ck.extensibility) {
            if (isExtensible(x) !== isExtensible(y)) return false;
            if (isSealed(x) !== isSealed(y)) return false;
            if (isFrozen(x) !== isFrozen(y)) return false;
          }
          if (vx) {
            if (vx.has(x)) {
              // console.log('circular ref found');
              return vy.has(y);
            }
            vx.set(x, true);
            vy.set(y, true);
          }
          px = ck.enumerator(x);
          py = ck.enumerator(y);
          if (ck.filter) {
            flt = function(k) {
              var d = getOwnPropertyDescriptor(this, k);
              return ck.filter(d, k, this);
            };
            px = px.filter(flt, x);
            py = py.filter(flt, y);
          }
          if (px.length != py.length) return false;
          px.sort(); py.sort();
          for (i = 0, l = px.length; i < l; ++i) {
            kx = px[i];
            ky = py[i];
            if (kx !== ky) return false;
            dx = getOwnPropertyDescriptor(x, ky);
            dy = getOwnPropertyDescriptor(y, ky);
            if ('value' in dx) {
              if (!_equals(dx.value, dy.value)) return false;
            } else {
              if (dx.get && dx.get !== dy.get) return false;
              if (dx.set && dx.set !== dy.set) return false;
            }
            if (ck.descriptors) {
              if (dx.enumerable !== dy.enumerable) return false;
              if (ck.extensibility) {
                if (dx.writable !== dy.writable)
                  return false;
                if (dx.configurable !== dy.configurable)
                  return false;
              }
            }
          }
          return true;
        case '[object RegExp]':
        case '[object Date]':
        case '[object String]':
        case '[object Number]':
        case '[object Boolean]':
          return ''+x === ''+y;
        default:
          throw TypeError(sx + ' not supported');
      }
    })(x, y);
  }
  function clone(src, deep, ck) {
    var wm;
    if (deep && HASWEAKMAP) {
      wm = new WeakMap();
    }
    ck = defaults(ck || {}, defaultCK);
    return (function _clone(src) {
      // primitives and functions
      if (isPrimitive(src)) return src;
      if (isFunction(src)) return src;
      var sig = signatureOf(src);
      switch (sig) {
        case '[object Array]':
        case '[object Object]':
          if (wm) {
            if (wm.has(src)) {
              // console.log('circular ref found');
              return src;
            }
            wm.set(src, true);
          }
          var isarray = isArray(src);
          var dst = isarray ? [] : create(getPrototypeOf(src));
          ck.enumerator(src).forEach(function(k) {
            // Firefox forbids defineProperty(obj, 'length' desc)
            if (isarray && k === 'length') {
              dst.length = src.length;
            } else {
              if (ck.descriptors) {
                var desc = getOwnPropertyDescriptor(src, k);
                if (ck.filter && !ck.filter(desc, k, src)) return;
                if (deep && 'value' in desc)
                  desc.value = _clone(src[k]);
                defineProperty(dst, k, desc);
              } else {
                dst[k] = _clone(src[k]);
              }
            }
          });
          if (ck.extensibility) {
            if (!isExtensible(src)) preventExtensions(dst);
            if (isSealed(src)) seal(dst);
            if (isFrozen(src)) freeze(dst);
          }
          return dst;
        case '[object RegExp]':
        case '[object Date]':
        case '[object String]':
        case '[object Number]':
        case '[object Boolean]':
          return deep ? new src.constructor(src.valueOf()) : src;
        default:
          throw TypeError(sig + ' is not supported');
      }
    })(src);
  };
  //  Install
  var obj2specs = function(src) {
    var specs = create(null);
    getOwnPropertyNames(src).forEach(function(k) {
      specs[k] = {
        value: src[k],
        configurable: true,
        writable: true,
        enumerable: false
      };
    });
    return specs;
  };
  var defaultProperties = function(dst, descs) {
    getOwnPropertyNames(descs).forEach(function(k) {
      if (!hasOwnProperty.call(dst, k)) defineProperty(
          dst, k, descs[k]
      );
    });
    return dst;
  };
  (Object.installProperties || defaultProperties)(Object, obj2specs({
    clone: clone,
    is: is,
    isnt: isnt,
    equals: equals
  }));
})(this);

/*! WTFPL Style License */
/*jslint browser: true, forin: true, plusplus: true, indent: 4 */(function(e,t){"use strict";var n=e.prototype,r=n.__lookupGetter__,i=n.__lookupSetter__,s=n.__defineGetter__,o=n.__defineSetter__,u=n.hasOwnProperty,a=[],f=!0,l=function(e){try{return e&&e({},"_",{value:1})._&&e}catch(t){f=!1}}(e.defineProperty)||function(e,t,n){var r=n.get,i=n.set;r&&s&&s.call(e,t,r),i&&o&&o.call(e,t,i),!r&&!i&&(e[t]=n.value)},c=f&&e.getOwnPropertyNames||function(){var e=function(e){return e},t=[],n,r,i;for(n in{valueOf:n})t.push(n);return t.length||(i=t.push("constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf")-1,e=function(e,s){for(r=0;r<i;r++)n=t[r],u.call(s,n)&&e.push(n);return e}),function(t){var n=[],r;for(r in t)u.call(t,r)&&n.push(r);return e(n,t)}}(),h=f&&e.getOwnPropertyDescriptor||function(e,t){var n={enumerable:!0,configurable:!0},s=r&&r.call(e,t),o=i&&i.call(e,t);return s&&(n.get=s),o&&(n.set=o),!s&&!o&&(n.writable=!0,n.value=e[t]),n};if(e[t])return;l(e,t,{enumerable:!1,writable:!0,configurable:!0,value:function(e,t,n){var r,i,s,o;if(typeof t=="function")t.apply(e,n||a);else{s=c(t),i=s.length,r=0;while(r<i)o=s[r++],l(e,o,h(t,o))}return e}})})(Object,"mixin");
(function (exports) {'use strict';
  //shared pointer
  var i;
  //shortcuts
  var defineProperty = Object.defineProperty, is = function(a,b) { return isNaN(a)? isNaN(b): a === b; };


  //Polyfill global objects
  if (typeof WeakMap == 'undefined') {
    exports.WeakMap = createCollection({
      // WeakMap#delete(key:void*):boolean
      'delete': sharedDelete,
      // WeakMap#clear():
      clear: sharedClear,
      // WeakMap#get(key:void*):void*
      get: sharedGet,
      // WeakMap#has(key:void*):boolean
      has: mapHas,
      // WeakMap#set(key:void*, value:void*):void
      set: sharedSet
    }, true);
  }

  if (typeof Map == 'undefined' || typeof ((new Map).values) !== 'function' || !(new Map).values().next) {
    exports.Map = createCollection({
      // WeakMap#delete(key:void*):boolean
      'delete': sharedDelete,
      //:was Map#get(key:void*[, d3fault:void*]):void*
      // Map#has(key:void*):boolean
      has: mapHas,
      // Map#get(key:void*):boolean
      get: sharedGet,
      // Map#set(key:void*, value:void*):void
      set: sharedSet,
      // Map#keys(void):Iterator
      keys: sharedKeys,
      // Map#values(void):Iterator
      values: sharedValues,
      // Map#entries(void):Iterator
      entries: mapEntries,
      // Map#forEach(callback:Function, context:void*):void ==> callback.call(context, key, value, mapObject) === not in specs`
      forEach: sharedForEach,
      // Map#clear():
      clear: sharedClear
    });
  }

  if (typeof Set == 'undefined' || typeof ((new Set).values) !== 'function' || !(new Set).values().next) {
    exports.Set = createCollection({
      // Set#has(value:void*):boolean
      has: setHas,
      // Set#add(value:void*):boolean
      add: sharedAdd,
      // Set#delete(key:void*):boolean
      'delete': sharedDelete,
      // Set#clear():
      clear: sharedClear,
      // Set#keys(void):Iterator
      keys: sharedValues, // specs actually say "the same function object as the initial value of the values property"
      // Set#values(void):Iterator
      values: sharedValues,
      // Set#entries(void):Iterator
      entries: setEntries,
      // Set#forEach(callback:Function, context:void*):void ==> callback.call(context, value, index) === not in specs
      forEach: sharedForEach
    });
  }

  if (typeof WeakSet == 'undefined') {
    exports.WeakSet = createCollection({
      // WeakSet#delete(key:void*):boolean
      'delete': sharedDelete,
      // WeakSet#add(value:void*):boolean
      add: sharedAdd,
      // WeakSet#clear():
      clear: sharedClear,
      // WeakSet#has(value:void*):boolean
      has: setHas
    }, true);
  }


  /**
   * ES6 collection constructor
   * @return {Function} a collection class
   */
  function createCollection(proto, objectOnly){
    function Collection(a){
      if (!this || this.constructor !== Collection) return new Collection(a);
      this._keys = [];
      this._values = [];
      this._itp = []; // iteration pointers
      this.objectOnly = objectOnly;

      //parse initial iterable argument passed
      if (a) init.call(this, a);
    }

    //define size for non object-only collections
    if (!objectOnly) {
      defineProperty(proto, 'size', {
        get: sharedSize
      });
    }

    //set prototype
    proto.constructor = Collection;
    Collection.prototype = proto;

    return Collection;
  }


  /** parse initial iterable argument passed */
  function init(a){
    var i;
    //init Set argument, like `[1,2,3,{}]`
    if (this.add)
      a.forEach(this.add, this);
    //init Map argument like `[[1,2], [{}, 4]]`
    else
      a.forEach(function(a){this.set(a[0],a[1])}, this);
  }


  /** delete */
  function sharedDelete(key) {
    if (this.has(key)) {
      this._keys.splice(i, 1);
      this._values.splice(i, 1);
      // update iteration pointers
      this._itp.forEach(function(p) { if (i < p[0]) p[0]--; });
    }
    // Aurora here does it while Canary doesn't
    return -1 < i;
  };

  function sharedGet(key) {
    return this.has(key) ? this._values[i] : undefined;
  }

  function has(list, key) {
    if (this.objectOnly && key !== Object(key))
      throw new TypeError("Invalid value used as weak collection key");
    //NaN or 0 passed
    if (key != key || key === 0) for (i = list.length; i-- && !is(list[i], key);){}
    else i = list.indexOf(key);
    return -1 < i;
  }

  function setHas(value) {
    return has.call(this, this._values, value);
  }

  function mapHas(value) {
    return has.call(this, this._keys, value);
  }

  /** @chainable */
  function sharedSet(key, value) {
    this.has(key) ?
        this._values[i] = value
        :
        this._values[this._keys.push(key) - 1] = value
    ;
    return this;
  }

  /** @chainable */
  function sharedAdd(value) {
    if (!this.has(value)) this._values.push(value);
    return this;
  }

  function sharedClear() {
    (this._keys || 0).length =
        this._values.length = 0;
  }

  /** keys, values, and iterate related methods */
  function sharedKeys() {
    return sharedIterator(this._itp, this._keys);
  }

  function sharedValues() {
    return sharedIterator(this._itp, this._values);
  }

  function mapEntries() {
    return sharedIterator(this._itp, this._keys, this._values);
  }

  function setEntries() {
    return sharedIterator(this._itp, this._values, this._values);
  }

  function sharedIterator(itp, array, array2) {
    var p = [0], done = false;
    itp.push(p);
    return {
      next: function() {
        var v, k = p[0];
        if (!done && k < array.length) {
          v = array2 ? [array[k], array2[k]]: array[k];
          p[0]++;
        } else {
          done = true;
          itp.splice(itp.indexOf(p), 1);
        }
        return { done: done, value: v };
      }
    };
  }

  function sharedSize() {
    return this._values.length;
  }

  function sharedForEach(callback, context) {
    var it = this.entries();
    for (;;) {
      var r = it.next();
      if (r.done) break;
      callback.call(context, r.value[1], r.value[0], this);
    }
  }

})(typeof exports != 'undefined' && typeof global != 'undefined' ? global : window );

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.generator = mod.exports;
  }
})(this, function (exports, module) {
  "use strict";

  var generator = {};

  /**
   * lazy find from an iterable collection using es6 generators
   * @param iterable {collection}
   * @param predicate {function}
   * @yields {object}
   */
  generator.find = regeneratorRuntime.mark(function callee$0$0(iterable, predicate) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item;

    return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          context$1$0.prev = 3;
          _iterator = iterable[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            context$1$0.next = 13;
            break;
          }

          item = _step.value;

          if (!predicate(item)) {
            context$1$0.next = 10;
            break;
          }

          context$1$0.next = 10;
          return item;

        case 10:
          _iteratorNormalCompletion = true;
          context$1$0.next = 5;
          break;

        case 13:
          context$1$0.next = 19;
          break;

        case 15:
          context$1$0.prev = 15;
          context$1$0.t0 = context$1$0["catch"](3);
          _didIteratorError = true;
          _iteratorError = context$1$0.t0;

        case 19:
          context$1$0.prev = 19;
          context$1$0.prev = 20;

          if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
          }

        case 22:
          context$1$0.prev = 22;

          if (!_didIteratorError) {
            context$1$0.next = 25;
            break;
          }

          throw _iteratorError;

        case 25:
          return context$1$0.finish(22);

        case 26:
          return context$1$0.finish(19);

        case 27:
        case "end":
          return context$1$0.stop();
      }
    }, callee$0$0, this, [[3, 15, 19, 27], [20,, 22, 26]]);
  });

  /**
   * lazy select the first <number> of items to return from an iterable collection
   * @param iterable {collection}
   * @param number {int}
   * @yields {object}
   */
  generator.top = regeneratorRuntime.mark(function callee$0$0(iterable, number) {
    var count, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, item;

    return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          count = 0;

          if (!(number < 1)) {
            context$1$0.next = 3;
            break;
          }

          return context$1$0.abrupt("return");

        case 3:
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          context$1$0.prev = 6;
          _iterator2 = iterable[Symbol.iterator]();

        case 8:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            context$1$0.next = 18;
            break;
          }

          item = _step2.value;
          context$1$0.next = 12;
          return item;

        case 12:
          count += 1;

          if (!(count >= number)) {
            context$1$0.next = 15;
            break;
          }

          return context$1$0.abrupt("return");

        case 15:
          _iteratorNormalCompletion2 = true;
          context$1$0.next = 8;
          break;

        case 18:
          context$1$0.next = 24;
          break;

        case 20:
          context$1$0.prev = 20;
          context$1$0.t0 = context$1$0["catch"](6);
          _didIteratorError2 = true;
          _iteratorError2 = context$1$0.t0;

        case 24:
          context$1$0.prev = 24;
          context$1$0.prev = 25;

          if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
            _iterator2["return"]();
          }

        case 27:
          context$1$0.prev = 27;

          if (!_didIteratorError2) {
            context$1$0.next = 30;
            break;
          }

          throw _iteratorError2;

        case 30:
          return context$1$0.finish(27);

        case 31:
          return context$1$0.finish(24);

        case 32:
        case "end":
          return context$1$0.stop();
      }
    }, callee$0$0, this, [[6, 20, 24, 32], [25,, 27, 31]]);
  });

  module.exports = generator;
});

//exits generator, sets done flag==true
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.extensions = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  (function (global) {
    String.prototype.toCamelCase = function () {
      return this.replace(/[-_]([a-z])/g, function (g) {
        return g[1].toUpperCase();
      });
    };
    String.prototype.toTitleCase = function () {
      return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };
    String.prototype.toPixel = function () {
      var val = parseInt(this, 10);
      val = val.toString() + 'px';
      return val;
    };
    Number.prototype.toPixel = function () {
      var val = parseInt(this, 10);
      val = val.toString() + 'px';
      return val;
    };
    String.prototype.toFloatPixel = function () {
      return this.toString() + 'px';
    };
    Number.prototype.toFloatPixel = function () {
      return this.toString() + 'px';
    };
    String.prototype.toInteger = function () {
      return parseInt(this.replace('px', ''), 10);
    };
    String.prototype.toMillisecond = function () {
      var val = parseInt(this, 10);
      val = val.toString() + 'ms';
      return val;
    };
    Number.prototype.toMillisecond = function () {
      var val = parseInt(this, 10);
      val = val.toString() + 'ms';
      return val;
    };
  })(undefined);
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.random = mod.exports;
  }
})(this, function (exports, module) {
  "use strict";

  var random = {};
  random.guid = function () {
    var S4 = function S4() {
      return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
    };
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
  };

  random.str = function () {
    var length = arguments[0] === undefined ? 16 : arguments[0];

    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  };

  random.id = function () {
    var length = arguments[0] === undefined ? 16 : arguments[0];

    var chars = "0123456789";
    var result = "";
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  };

  random.emptyGuid = function () {
    return "00000000-0000-0000-0000-000000000000";
  };

  random.isEmptyGuid = function (val) {
    return Object.is(val, random.emptyGuid());
  };

  module.exports = random;
});
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
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.string = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var string = {};

  /**
   * get first char of string
   * @param s {string}
   * @returns {string}
   */
  string.firstChar = function (s) {
    return s.charAt(0);
  };

  /**
   * get last char of string
   * @param s {string}
   * @returns {string}
   */
  string.lastChar = function (s) {
    return s.slice(-1);
  };

  /**
   * returns first n chars of string
   * @param s {string}
   * @param n {number}
   * @returns {string}
   */
  string.firstNChars = function (s, n) {
    return s.substr(0, n);
  };

  /**
   * returns last n chars of string
   * @param s {string}
   * @param n {number}
   * @returns {string}
   */
  string.lastNChars = function (s, n) {
    return s.substr(s.length - n);
  };

  /**
   * trim first chr from string
   * @param s {String}
   * @returns {String}
   */
  string.trimFirstChar = function (s) {
    return s.substring(1);
  };

  /**
   * trim last chr from string
   * @param s {String}
   * @returns {String}
   */
  string.trimLastChar = function (s) {
    return s.substring(0, s.length - 1);
  };

  /**
   * trim first n chars from string
   * @param s {String}
   * @param n {number}
   * @returns {String}
   */
  string.trimFirstNChars = function (s, n) {
    return s.substring(n);
  };

  /**
   * trim last n chars from string
   * @param s {string}
   * @param n {number}
   * @returns {string}
   */
  string.trimLastNChars = function (s, n) {
    return s.substring(0, s.length - n);
  };

  /**
   * trims a string into ellipsis format
   * @param s {string}
   * @param maxLength {number}
   * @returns {string}
   */
  string.ellipsisTrim = function (s, maxLength) {
    var ret = s;
    if (ret.length > maxLength) {
      ret = ret.substr(0, maxLength - 4) + ' ...';
    }
    return ret;
  };

  /**
   * replaces a string with another string at index
   * @param s {string}
   * @param index {number}
   * @param replaceStr {string}
   * @returns {string}
   */
  string.replaceAt = function (s, index, replaceStr) {
    return s.substr(0, index) + replaceStr + s.substr(index + replaceStr.length);
  };

  /**
   * inserts a string value at specified index in a string
   * @param s {String}
   * @param index {Number}
   * @param insertStr {String}
   * @returns {string}
   */
  string.insertAt = function (s, index, insertStr) {
    return s.substr(0, index) + insertStr + s.substr(index);
  };

  /**
   * converts a dash delimited string to a camelCase string
   *
   * @param s {String}
   * @returns {String}
   */
  string.dashToCamelCase = function (s) {
    return s.replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
  };

  /**
   * camel case to space separated
   * @param s {String}
   * @returns {String}
   */
  string.camelCaseToSpace = function (s) {
    var rex = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g;
    return s.replace(rex, '$1$4 $2$3$5');
  };

  /**
   * camel case input string
   * @param s
   * @returns {String}
   */
  string.toCamelCase = function (s) {
    return s.replace(/\s(.)/g, function ($1) {
      return $1.toUpperCase();
    }).replace(/\s/g, '').replace(/^(.)/, function ($1) {
      return $1.toLowerCase();
    });
  };

  string.toTitleCase = function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  /**
   * converts a space delimited string to a dash delimited string
   *
   * @param s {String}
   * @returns {String}
   */
  string.spaceToDash = function (s) {
    return s.replace(/\s+/g, '-').toLowerCase();
  };

  string.camelCaseToSpacedTitleCase = function (s) {
    var rex = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g;
    var ret = s.replace(rex, '$1$4 $2$3$5');
    return undefined.toTitleCase(ret);
  };

  module.exports = string;
});

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
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.date = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var date = {};

  /**
   * return an object representing current date
   * @returns {{day: number, month: number, year: number}}
   */
  date.currentDateObj = function () {
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    return {
      day: day,
      month: month,
      year: year
    };
  };

  /**
   * returns a current date string
   * @returns {string}
   */
  date.current = function () {
    var obj = this.currentDateObj();
    return obj.month.toString() + '/' + obj.day.toString() + '/' + obj.year.toString();
  };

  /**
   * tests if valid date
   * @param obj {object}
   * @returns {boolean}
   */
  date.isDate = function (obj) {
    return /Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
  };

  /**
   * tests if year is leap year
   * @param year {number}
   * @returns {boolean}
   */
  date.isLeapYear = function (year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  };

  /**
   * returns days in month for given year
   * @param year {number}
   * @param month {number}
   * @returns {number}
   */
  date.getDaysInMonth = function (year, month) {
    return [31, date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  };

  /**
   * sets a date to start of day
   * @param d {date}
   * @returns {void}
   */
  date.setToStartOfDay = function (d) {
    if (date.isDate(d)) d.setHours(0, 0, 0, 0);
  };

  /**
   * compares equality of two dates
   * @param a {date}
   * @param b {date}
   * @returns {boolean}
   */
  date.compareDates = function (a, b) {
    return a.getTime() === b.getTime();
  };

  module.exports = date;
});
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
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.network = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  function isLocalBlock(ip) {
    var x = ip.split('.'),
        x1,
        x2,
        x3,
        x4;
    if (x.length == 4) {
      x1 = parseInt(x[0], 10);
      x2 = parseInt(x[1], 10);
      x3 = parseInt(x[2], 10);
      x4 = parseInt(x[3], 10);

      return x1 === 10 || x1 === 172 && x2 === 16 || x1 === 192 && x2 === 168;
    }
    return false;
  }

  var network = {};

  /**
   * tests for window to determine if browser environment
   * @returns {boolean}
   */
  network.isBrowser = function () {
    return typeof window != 'undefined';
  };

  /**
   * tests if string is a valid ipv4 address
   * @param ip {string}
   * @returns {boolean}
   */
  network.isIPAddress = function (ip) {
    return /^(\d\d?)|(1\d\d)|(0\d\d)|(2[0-4]\d)|(2[0-5])\.(\d\d?)|(1\d\d)|(0\d\d)|(2[0-4]\d)|(2[0-5])\.(\d\d?)|(1\d\d)|(0\d\d)|(2[0-4]\d)|(2[0-5])$/.test(ip);
  };

  /**
   * tests if a host is a valid localhost
   * @param host
   * @returns {boolean}
   */
  network.isLocalHost = function (host) {
    host = host.toLowerCase();
    if (host === 'localhost') {
      return true;
    } else if (host.indexOf('127.0.0.1') > -1) {
      return true;
    } else {
      if (network.isIPAddress(host)) {
        return isLocalBlock(host);
      } else {
        return false;
      }
    }
  };

  module.exports = network;
});
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
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.color = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var color = {};

  color.rgb2hex = function (rgb) {
    if (rgb.search('rgb') == -1) {
      return rgb;
    } else if (rgb == 'rgba(0, 0, 0, 0)') {
      return 'transparent';
    } else {
      var hex = function (x) {
        return ('0' + parseInt(x).toString(16)).slice(-2);
      };

      rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);

      return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
  };

  module.exports = color;
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "./string"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("./string"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.__tmp9z.string);
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.url = mod.exports;
  }
})(this, function (exports, module, _string) {
  "use strict";

  function _interopRequire(obj) { return obj && obj.__esModule ? obj["default"] : obj; }

  var _string2 = _interopRequire(_string);

  var url = {};

  /**
   * returns a querystring value for query param in the window.location url
   * @param query {string}
   * @returns {string}
   */
  url.queryString = function (query) {
    var hu = window.location.search.substring(1);
    var gy = hu.split("&");
    for (var i = 0; i < gy.length; i++) {
      var ft = gy[i].split("=");
      if (ft[0] == query) {
        return ft[1];
      }
    }
    return null;
  };

  /**
   * returns a querystring object array for the window.location url
   * @returns {Array}
   */
  url.queryStringArray = function () {
    var arr = [];
    var hu = window.location.search.substring(1);
    var gy = hu.split("&");
    for (var i = 0; i < gy.length; i++) {
      var ft = gy[i].split("=");
      if (ft[0] == ji) {
        return ft[1];
      }
      var obj = {};
      obj.prop = ft[0];
      obj.val = ft[1];
      arr.push(obj);
    }

    return arr;
  };

  /**
   * @param url {string}
   * @param index {number}
   * @returns {string}
   */
  url.encodeURISection = function (url, index) {
    if (_string2.firstChar(url) === "/") {
      url = _string2.trimFirstChar(url);
    }
    var arr = url.split("/");
    var section = arr[index];
    section = encodeURIComponent(section);
    var length = arr.length;
    var url_ = "";
    for (var i = 0; i < length; i++) {
      url_ += i === index ? "/" + section : "/" + arr[i];
    }

    return url_;
  };

  module.exports = url;
});
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
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.currency = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var currency = {};

  /**
   *
   * @param v {string}
   * @returns {float}
   */
  currency.parse = function (v) {
    if (typeof v === 'string') {
      v = v.replace('$', '');
      v = v.replace(/,/g, '');
      v = parseFloat(v);
    }
    return v;
  };

  /**
   *
   * @param val {float}
   * @returns {float}
   */
  currency.format = function (val) {
    val = parseFloat(val);
    return val.toFixed(2);
  };

  /**
   *
   * @param v {float}
   * @param q {number}
   * @returns {float}
   */
  currency.extendedAmount = function (v, q) {
    if (typeof v === 'string') {
      v = v.replace('$', '');
      v = parseFloat(v);
    }
    return currency.format(v * q);
  };

  module.exports = currency;
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "./generator"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("./generator"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.__tmp9z.generator);
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.array = mod.exports;
  }
})(this, function (exports, module, _generator) {
  "use strict";

  function _interopRequire(obj) { return obj && obj.__esModule ? obj["default"] : obj; }

  var _generator2 = _interopRequire(_generator);

  var array = {};

  /**
   * tests if array
   * @param obj {*}
   * @retuns {boolean}
   */
  array.isArray = function (obj) {
    return /Array/.test(Object.prototype.toString.call(obj));
  };

  /**
   * is object/value in array
   * @param arr {Array}
   * @param obj {Object}
   * @returns {Boolean}
   */
  array.inArray = function (arr, obj) {
    return _generator2.find(arr, function (o) {
      return Object.is(o, obj);
    });
  };

  /**
   * remove of an array of items from an array
   * @param arr1 {Array}
   * @param arr2 {Array}
   * @returns {Array}
   */
  array.remove = function (arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
      if (array.inArray(arr2, arr1[i])) {
        arr1.splice(i, 1);
      }
    }
    return arr1;
  };

  /**
   * merge two arrays
   * @param a {Array}
   * @param b {Array}
   * @returns {Array}
   */
  array.merge = function (a, b) {
    var i = a.length,
        j = 0;

    if (typeof b.length === "number") {
      for (var l = b.length; j < l; j++) {
        a[i++] = b[j];
      }
    } else {
      while (b[j] !== undefined) {
        a[i++] = b[j++];
      }
    }

    a.length = i;

    return a;
  };

  /**
   *
   * @returns {Array}
   */
  array.makeArray = function (arr, results) {
    var ret = results || [];

    if (arr != null) {
      var type = typeof arr;
      if (arr.length == null || type === "string" || type === "function" || type === "regexp") {
        ret.push(arr);
      } else {
        array.merge(ret, arr);
      }
    }

    return ret;
  };

  /**
   * concatenate two arguments
   * @param arr {Array}
   * @param args {Array}
   * @returns {Array}
   */
  array.concatArgs = function (arr, args) {
    return array.makeArray(arr).concat(array.makeArray(args));
  };

  /**
   * empty an array
   * @param arr {Array}
   */
  array.empty = function (arr) {
    return arr.splice(0, arr.length);
  };

  array.clone = function (arr) {
    return arr.slice(0);
  };

  /**
   * tests if valid val for an array index
   * @param val {number}
   */
  array.isValidIndex = function (val) {
    return /^[0-9]+$/.test(String(val));
  };

  /**
   * validates if the value of an object prop is an array
   * @param obj {Object}
   * @param prop {String}
   * @returns {boolean}
   */
  array.isObjectProperty = function (obj, prop) {
    return !!Array.isArray(obj[prop]);
  };

  /**
   * validates if the value of an object prop by index is an array
   * @param obj {Object}
   * @param index {Number}
   * @returns {boolean}
   */
  array.isObjectPropertyByIndex = function (obj, index) {
    try {
      var o = obj[Object.keys(obj)[index]];
      return !!Array.isArray(o);
    } catch (ex) {
      return false;
    }
  };

  array.indexById = function (arr, id) {
    var idProp = arguments[2] === undefined ? "id" : arguments[2];

    if (arr.length && arr.length > 0) {
      var len = arr.length;
      var index = undefined;
      for (var i = 0; i < len; i++) {
        if (arr[i][idProp] === id) {
          index = i;
          break;
        }
      }
      return index;
    } else {
      return null;
    }
  };

  /**
   * finds an object in an array by id
   * @param arr {Array}
   * @param id {String}|{Number}
   * @param propId {String}
   * @returns {Object}
   */
  array.findById = function (arr, id) {
    var propId = arguments[2] === undefined ? "id" : arguments[2];
    var length=arr.length;
    var result=null;
    for(var i=0;i<length;i++){
      if(arr[i].id===id){
        result=arr[i];
        break;
      }
    }
    
    return result;
  };

  /**
   *  sort array compareFunction
   * @param field {String}
   * @param reverse {Boolean}
   * @param primer {Function}
   * @returns {Array}
   */
  array.sort=function(field,reverse,primer){
    var key = primer ?
      function(x) {return primer(x[field])} :
      function(x) {return x[field]};

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
      return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
  };
  
  

  module.exports = array;
});

(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', './array'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('./array'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.__tmp9z.array);
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.path = mod.exports;
  }
})(this, function (exports, module, _array) {
  'use strict';

  function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

  var _array2 = _interopRequire(_array);

  var isNumeric = function isNumeric(val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
  };

  var path_ = {};

  /**
   * converts a delimited path into an array of props
   * 'items.0.FirstName' --> [items,0,FirstName]
   *
   * @param path {string}
   * @param separator {string}
   * @returns {array}
   */
  path_.split = function (path) {
    var separator = arguments[1] === undefined ? '.' : arguments[1];

    if (typeof path === 'undefined' || path === '') {
      return [];
    } else {
      if (_array2.isArray(path)) {
        return path.slice(0);
      } else {
        return path.toString().split(separator);
      }
    }
  };

  /**
   * resolves the value of an object path
   * obj, 'items.0.FirstName'  --> 'John','FirstName'
   * returns an array of value,prop
   *
   * @param a {object}
   * @param path {string}
   * @param options {object}
   * @returns {array}
   */
  path_.resolve = function (a, path, options) {
    var e, k, last, stack;
    if (options == null) {
      options = {};
    }
    stack = path_.split(path);
    last = [stack.pop()];
    e = a;
    while ((k = stack.shift()) !== void 0) {
      if (e[k] !== void 0) {
        e = e[k];
      } else {
        stack.unshift(k);
        break;
      }
    }
    if (options.force) {
      while ((k = stack.shift()) !== void 0) {
        if (typeof stack[0] === 'number' || stack.length === 0 && typeof last[0] === 'number') {
          e[k] = [];
        } else {
          e[k] = {};
        }
        e = e[k];
      }
    } else {
      while ((k = stack.pop()) !== void 0) {
        last.unshift(k);
      }
    }
    return [e, last];
  };

  /**
   * resolves the value of an object path
   * obj, 'items.0.FirstName'  --> 'John'
   *
   * @param obj {object}
   * @param path {string}
   * @returns value
   */
  path_.objectProperty = function (obj, path) {
    try {
      var _ret = (function () {
        var pathArray = path.split('.');
        var a = obj;
        pathArray.forEach(function (p) {
          var b = a[p];
          a = b;
        });
        return {
          v: a
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    } catch (ex) {
      return undefined;
    }
  };

  /**
   *
   * @param obj {object}
   * @param path {string}
   * @param value {object}
   * @returns void
   */
  path_.assignValueTo = function (obj, path, value) {
    try {
      var pathArray = path_.split(path);
      var a = obj;
      var len = pathArray.length;
      var max = len - 1;
      for (var i = 0; i < len; i++) {
        if (i === max) {
          a[pathArray[i]] = value;
        } else {
          var b = a[pathArray[i]];
          a = b;
        }
      }
    } catch (ex) {}
  };

  /**
   * return the length of an array property of an object by path
   * @param obj {object}
   * @param path {string}
   * @returns {number}
   */
  path_.arrayPropertyLength = function (obj, path) {
    var prop = path_.objectProperty(obj, path);
    return prop && _array2.isArray(prop) ? prop.length : null;
  };

  /**
   * tests if a value of an object path is an array
   * @param obj
   * @param path
   * @returns {boolean}
   */
  path_.isPropertyArray = function (obj, path) {
    var prop = path_.objectProperty(obj, path);
    return _array2.isArray(prop);
  };

  /**
   * returns the index of the path
   * @param path {string}
   * @returns {object}
   */
  path_.getIndexOf = function (path) {
    if (path !== undefined) {
      var parts = path.split('.');
      var _length = undefined;
      if (parts.length) {
        _length = parts.length;
        _length--;
        return parts[_length];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  };

  /**
   * is path part of an array
   * @param path {string}
   * @returns {boolean}
   */
  path_.isInArray = function (path) {
    var index = undefined.getIndexOf(path);
    return index !== undefined ? isNumeric(index) : undefined;
  };

  /**
   * converts an array(of contexts and indices) and a property into a path string
   * [{index:5,context:User},{index:0,context:Address}],City ---> User.5.Address.0.City
   * @param arr {array}
   * @param prop {string}
   * @returns {string}
   */
  path_.create = function (arr, prop) {
    var path = '';
    if (arr && arr.length) {
      arr.forEach(function (obj) {
        path += obj.context + '.' + obj.index + '.';
      });

      typeof prop !== 'undefined' ? path += prop : path = path.substring(0, path.length - 1);
      return path;
    }
  };

  /**
   * converts an array of object properties into a path
   * @param arr {array}
   * @returns {string} path
   */
  path_.createFromArray = function (arr) {
    var path = '';
    if (arr && arr.length) {
      var index = 0;
      arr.forEach(function (obj) {
        path += index < arr.length - 1 ? obj + '.' : obj;
        index++;
      });
      return path;
    }
  };

  /**
   * deletes an obj prop by path
   * @param obj {object}
   * @param path {string}
   */
  path_.deleteObjectProperty = function (obj, path) {
    var pathArray = path_.split(path);
    var a = obj;
    var len = pathArray.length;
    var max = len - 1;
    for (var i = 0; i < len; i++) {
      if (i === max) {
        delete a[pathArray[i]];
      } else {
        var b = a[pathArray[i]];
        a = b;
      }
    }
  };

  /**
   * tests if a prop is the last node in a path
   * @param path {string}
   * @param prop {string}
   * @returns {boolean}
   */
  path_.isProperty = function (path, prop) {
    var splitPath = path_.split(path);
    var prop_ = splitPath.pop();
    return prop_ === prop;
  };

  /**
   * deletes an object from an array by id value
   * @param obj {object}
   * @param idProp {string}
   * @param id {string}
   * @returns {number} the index of the deleted object
   */
  path_.deleteObjectByIdFromArrayProp = function (obj, idProp, id) {
    var index = null;
    if (!_array2.isObjectPropertyByIndex(obj, 0)) {
      return index;
    }
    var arr = obj[Object.keys(obj)[0]];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][idProp].toString() === id.toString()) {
        arr.splice(i, 1);
        index = i;
        break;
      }
    }

    return index;
  };

  /**
   * finds an object in a $scope model list by id
   * @param obj {object}
   * @param idProp {string}
   * @param id {string}
   * @returns {object}
   */
  path_.selectObjectByIdFromArrayProp = function (obj, idProp, id) {
    var obj_ = undefined;
    var index = null;
    if (!_array2.isObjectPropertyByIndex(obj, 0)) {
      return index;
    }
    var arr = obj[Object.keys(obj)[0]];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][idProp].toString() === id.toString()) {
        obj_ = arr[i];
        break;
      }
    }
    return obj_;
  };

  /**
   * inserts an index into a model list path(at path index=1)
   * @param path {String}
   * @param index {Number}
   * @returns {String}
   */
  path_.replaceIndex = function (path, index) {
    var arr = path_.split(path);
    arr[1] = index;
    return arr.join('.');
  };

  /**
   * returns a normalized path format for Object.observe change record reporting
   * @param path {string}
   * @returns {string}
   */
  path_.map = function (path) {
    var arr = path_.split(path);
    var num = isNumeric;
    if (arr && arr.length) {
      var mapped = arr.map(function (v) {
        return num(v) ? '[' + v.toString() + ']' : v;
      });
      return mapped.join('.').replace(/.\[/, '[');
    } else {
      return path;
    }
  };

  module.exports = path_;
});
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports,mod);
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.object = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var _arguments = arguments;

  var object = {};

  var spec = {
    descriptors: false,
    extensibility: false,
    enumerator: Object.keys
  };

  /**
   * is object
   * @param obj {*}
   * @returns {boolean}
   */
  object.isObject = function (obj) {
    return typeof obj === 'object' && obj !== null;
  };

  /**
   * is function
   * @param fn {*}
   * @returns {boolean}
   */
  object.isFunction = function (fn) {
    return typeof fn === 'function';
  };

  /**
   * returns the value of an object prop by index
   * @param obj {object}
   * @param index {number}
   * @returns {object}
   */
  object.propertyByIndex = function (obj, index) {
    return obj[Object.keys(obj)[index]];
  };

  /**
   * returns the index of an element with idProp==id in an array
   * @param obj {Object}
   * @param id {String}
   * @param idProp {String}
   * @returns {Number}
   */
  object.indexById = function (obj, id) {
    var idProp = arguments[2] === undefined ? 'id' : arguments[2];

    var arr = object.propertyByIndex(obj, 0);
    if (arr.length && arr.length > 0) {
      var len = arr.length;
      var index = undefined;
      for (var i = 0; i < len; i++) {
        if (arr[i][idProp] === id) {
          index = i;
          break;
        }
      }
      return index;
    } else {
      return null;
    }
  };

  /**
   * tests if object is empty
   * @param obj
   * @returns {boolean}
   */
  object.isEmpty = function (obj) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    if (obj == null) return true;

    if (obj.length > 0) return false;
    if (obj.length === 0) return true;

    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
  };

  /**
   * tests if object is a POJO
   * @param obj {object}
   * @returns {*}
   */
  object.isPlainObject = function (obj) {
    var _isObject = function _isObject(o) {
      return object.isObject(o) && Object.prototype.toString.call(o) === '[object Object]';
    };

    var ctor, prot;

    if (_isObject(obj) === false) return false;

    // if has modified constructor
    ctor = obj.constructor;
    if (typeof ctor !== 'function') return false;

    // if has modified prototype
    prot = ctor.prototype;
    if (_isObject(prot) === false) return false;

    // if constructor does not have an Object-specific method
    return prot.hasOwnProperty('isPrototypeOf') !== false;
  };

  /**
   *  equality test
   * @param x {object}
   * @param y {object}
   * @returns {*}
   */
  object.isEqual = function (x, y) {
    return Object.equals(x, y, spec);
  };

  /**
   * clone object
   * @param src
   * @returns {*}
   */
  object.clone = function (src) {
    return Object.clone(src, false, spec);
  };

  /**
   * deep clone
   * @param src
   * @returns {*}
   */
  object.deepClone = function (src) {
    return Object.clone(src, true, spec);
  };

  /**
   * returns modified target
   * @param target {object}
   * @param source {object}
   * @returns {*}
   */
  object.mixin = function (target, source) {
    return Object.mixin(target, source);
  };

  /**
   * returns modified target
   * @param target {object}
   * @param sources {object}
   * @returns {*}
   */
  object.assign = function (target) {
    for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      sources[_key - 1] = arguments[_key];
    }

    return Object.assign.apply(Object, [target].concat(sources));
  };


  module.exports = object;
});


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
    global.__tmp9z=global.__tmp9z || {};
    global.__tmp9z.native = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var native = {};

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  native.extends=function(superClass){

    var SubClass = function (_superClass) {
      _inherits(SubClass, _superClass);

      function SubClass() {
        _classCallCheck(this, SubClass);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SubClass).apply(this, arguments));
      }

      return SubClass;
    };

    return SubClass(superClass);
  };

  module.exports = native;
});




(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', './assign', './extensions', 'js-object-clone', 'object-mixin', './generator', './random', './string', './date', './network', './color', './url', './currency', './array', './path', './object'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('./assign'), require('./extensions'), require('js-object-clone'), require('object-mixin'), require('./generator'), require('./random'), require('./string'), require('./date'), require('./network'), require('./color'), require('./url'), require('./currency'), require('./array'), require('./path'), require('./object'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod,global.assign, global.__tmp9z.extensions, global.objectClone, global.objectMixin, global.__tmp9z.generator, global.__tmp9z.random,
        global.__tmp9z.string, global.__tmp9z.date, global.__tmp9z.network, global.__tmp9z.color, global.__tmp9z.url,
        global.__tmp9z.currency, global.__tmp9z.array, global.__tmp9z.path, global.__tmp9z.object, global.__tmp9z.native);

    global.elliptical=global.elliptical || {};
    global.elliptical.utils = mod.exports;
  }
})(this, function (exports, module, _assign, _extensions, _jsObjectClone, _objectMixin, _generator, _random, _string, _date, _network, _color, _url, _currency, _array, _path, _object, _native) {
  'use strict';

  function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

  var _generator2 = _interopRequire(_generator);

  var _random2 = _interopRequire(_random);

  var _string2 = _interopRequire(_string);

  var _date2 = _interopRequire(_date);

  var _network2 = _interopRequire(_network);

  var _color2 = _interopRequire(_color);

  var _url2 = _interopRequire(_url);

  var _currency2 = _interopRequire(_currency);

  var _array2 = _interopRequire(_array);

  var _path2 = _interopRequire(_path);

  var _object2 = _interopRequire(_object);

  var _native2 = _interopRequire(_native);

  var utils = {};

  var spec = {
    descriptors: false,
    extensibility: false,
    enumerator: Object.keys
  };

  /**
   * deep clones an object
   * @param src {object}
   * @param deep {boolean}
   * @returns {object}
   */
  utils.clone = function (src) {
    var deep = arguments[1] === undefined ? true : arguments[1];
    return Object.clone(src, deep, spec);
  };

  /**
   * object 'is' comparison
   * @param x {object}
   * @param y {object}
   * @returns {boolean}
   */
  utils.is = function (x, y) {
    return Object.is(x, y);
  };

  /** compares equality of two objects
   * @param x {object}
   * @param y {object}
   * @returns {boolean}
   */
  utils.isEqual = function (x, y) {
    return Object.equals(x, y, spec);
  };

  /**
   * shallow extend of src onto target
   * @param target {Object}
   * @param src {Object}
   * @returns {Object}
   */
  utils.assign = function (target, src) {
    return Object.assign(target, src);
  };

  /**
   * deep extend of src onto target
   * @param target {object}
   * @param src {object}
   * @returns {object}
   */
  utils.mixin = function (target, src) {
    return Object.mixin(target, src);
  };

  /**
   * lazy find from an iterable collection using es6 generators
   * @param iterable {collection}
   * @param predicate {function}
   * @yields {object}
   */
  utils.find = _generator2.find;

  /**
   * lazy select the first <number> of items to return from an iterable collection
   * @param iterable {collection}
   * @param number {int}
   * @yields {object}
   */
  utils.top = _generator2.top;

  /**
   * tests if value is a number
   * @param val {object}
   * @returns {boolean}
   */
  utils.isNumeric = function (val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
  };

  //random functions namespace
  utils.random = _random2;

  //string functions namespace
  utils.string = _string2;

  //date functions namespace
  utils.date = _date2;

  //network functions namespace
  utils.network = _network2;

  //color function namespace
  utils.color = _color2;

  //currency function namespace
  utils.currency = _currency2;

  //url functions namespace
  utils.url = _url2;

  //array functions namespace
  utils.array = _array2;

  //path functions namespace
  utils.path = _path2;

  //object functions namespace
  utils.object = _object2;

  utils.native=_native2;

  module.exports = utils;
});
