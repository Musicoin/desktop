/*! dustjs-helpers - v1.7.3
* http://dustjs.com/
* Copyright (c) 2015 Aleksander Williams; Released under the MIT License */
(function(root, factory) {
  if (typeof define === 'function' && define.amd && define.amd.dust === true) {
    define(['dust.core'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('dustjs-linkedin'));
  } else {
    factory(root.dust);
  }
}(this, function(dust) {

function log(helper, msg, level) {
  level = level || "INFO";
  helper = helper ? '{@' + helper + '}: ' : '';
  dust.log(helper + msg, level);
}

var _deprecatedCache = {};
function _deprecated(target) {
  if(_deprecatedCache[target]) { return; }
  log(target, "Deprecation warning: " + target + " is deprecated and will be removed in a future version of dustjs-helpers", "WARN");
  log(null, "For help and a deprecation timeline, see https://github.com/linkedin/dustjs-helpers/wiki/Deprecated-Features#" + target.replace(/\W+/g, ""), "WARN");
  _deprecatedCache[target] = true;
}

function isSelect(context) {
  return context.stack.tail &&
         context.stack.tail.head &&
         typeof context.stack.tail.head.__select__ !== "undefined";
}

function getSelectState(context) {
  return isSelect(context) && context.get('__select__');
}

/**
 * Adds a special __select__ key behind the head of the context stack. Used to maintain the state
 * of {@select} blocks
 * @param context {Context} add state to this Context
 * @param opts {Object} add these properties to the state (`key` and `type`)
 */
function addSelectState(context, opts) {
  var head = context.stack.head,
      newContext = context.rebase(),
      key;

  if(context.stack && context.stack.tail) {
    newContext.stack = context.stack.tail;
  }

  var state = {
    isPending: false,
    isResolved: false,
    isDeferredComplete: false,
    deferreds: []
  };

  for(key in opts) {
    state[key] = opts[key];
  }

  return newContext
  .push({ "__select__": state })
  .push(head, context.stack.index, context.stack.of);
}

/**
 * After a {@select} or {@math} block is complete, they invoke this function
 */
function resolveSelectDeferreds(state) {
  var x, len;
  state.isDeferredPending = true;
  if(state.deferreds.length) {
    state.isDeferredComplete = true;
    for(x=0, len=state.deferreds.length; x<len; x++) {
      state.deferreds[x]();
    }
  }
  state.isDeferredPending = false;
}

/**
 * Used by {@contextDump}
 */
function jsonFilter(key, value) {
  if (typeof value === "function") {
    return value.toString()
      .replace(/(^\s+|\s+$)/mg, '')
      .replace(/\n/mg, '')
      .replace(/,\s*/mg, ', ')
      .replace(/\)\{/mg, ') {');
  }
  return value;
}

/**
 * Generate a truth test helper
 */
function truthTest(name, test) {
  return function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, name, test);
  };
}

/**
 * This function is invoked by truth test helpers
 */
function filter(chunk, context, bodies, params, helperName, test) {
  var body = bodies.block,
      skip = bodies['else'],
      selectState = getSelectState(context) || {},
      willResolve, key, value, type;

  // Once one truth test in a select passes, short-circuit the rest of the tests
  if (selectState.isResolved && !selectState.isDeferredPending) {
    return chunk;
  }

  // First check for a key on the helper itself, then look for a key on the {@select}
  if (params.hasOwnProperty('key')) {
    key = params.key;
  } else if (selectState.hasOwnProperty('key')) {
    key = selectState.key;
  } else {
    log(helperName, "No key specified", "WARN");
    return chunk;
  }

  type = params.type || selectState.type;

  key = coerce(context.resolve(key), type);
  value = coerce(context.resolve(params.value), type);

  if (test(key, value)) {
    // Once a truth test passes, put the select into "pending" state. Now we can render the body of
    // the truth test (which may contain truth tests) without altering the state of the select.
    if (!selectState.isPending) {
      willResolve = true;
      selectState.isPending = true;
    }
    if (body) {
      chunk = chunk.render(body, context);
    }
    if (willResolve) {
      selectState.isResolved = true;
    }
  } else if (skip) {
    chunk = chunk.render(skip, context);
  }
  return chunk;
}

function coerce(value, type) {
  if (type) {
    type = type.toLowerCase();
  }
  switch (type) {
    case 'number': return +value;
    case 'string': return String(value);
    case 'boolean':
      value = (value === 'false' ? false : value);
      return Boolean(value);
    case 'date': return new Date(value);
  }

  return value;
}

var helpers = {

  // Utility helping to resolve dust references in the given chunk
  // uses native Dust Context#resolve (available since Dust 2.6.2)
  "tap": function(input, chunk, context) {
    // deprecated for removal in 1.8
    _deprecated("tap");
    return context.resolve(input);
  },

  "sep": function(chunk, context, bodies) {
    var body = bodies.block;
    if (context.stack.index === context.stack.of - 1) {
      return chunk;
    }
    if (body) {
      return body(chunk, context);
    } else {
      return chunk;
    }
  },

  "first": function(chunk, context, bodies) {
    if (context.stack.index === 0) {
      return bodies.block(chunk, context);
    }
    return chunk;
  },

  "last": function(chunk, context, bodies) {
    if (context.stack.index === context.stack.of - 1) {
      return bodies.block(chunk, context);
    }
    return chunk;
  },

  /**
   * {@contextDump}
   * @param key {String} set to "full" to the full context stack, otherwise the current context is dumped
   * @param to {String} set to "console" to log to console, otherwise outputs to the chunk
   */
  "contextDump": function(chunk, context, bodies, params) {
    var to = context.resolve(params.to),
        key = context.resolve(params.key),
        target, output;
    switch(key) {
      case 'full':
        target = context.stack;
        break;
      default:
        target = context.stack.head;
    }
    output = JSON.stringify(target, jsonFilter, 2);
    switch(to) {
      case 'console':
        log('contextDump', output);
        break;
      default:
        output = output.replace(/</g, '\\u003c');
        chunk = chunk.write(output);
    }
    return chunk;
  },

  /**
   * {@math}
   * @param key first value
   * @param method {String} operation to perform
   * @param operand second value (not required for operations like `abs`)
   * @param round if truthy, round() the result
   */
  "math": function (chunk, context, bodies, params) {
    var key = params.key,
        method = params.method,
        operand = params.operand,
        round = params.round,
        output, state, x, len;

    if(!params.hasOwnProperty('key') || !params.method) {
      log("math", "`key` or `method` was not provided", "ERROR");
      return chunk;
    }

    key = parseFloat(context.resolve(key));
    operand = parseFloat(context.resolve(operand));

    switch(method) {
      case "mod":
        if(operand === 0) {
          log("math", "Division by 0", "ERROR");
        }
        output = key % operand;
        break;
      case "add":
        output = key + operand;
        break;
      case "subtract":
        output = key - operand;
        break;
      case "multiply":
        output = key * operand;
        break;
      case "divide":
        if(operand === 0) {
          log("math", "Division by 0", "ERROR");
        }
        output = key / operand;
        break;
      case "ceil":
      case "floor":
      case "round":
      case "abs":
        output = Math[method](key);
        break;
      case "toint":
        output = parseInt(key, 10);
        break;
      default:
        log("math", "Method `" + method + "` is not supported", "ERROR");
    }

    if (typeof output !== 'undefined') {
      if (round) {
        output = Math.round(output);
      }
      if (bodies && bodies.block) {
        context = addSelectState(context, { key: output });
        chunk = chunk.render(bodies.block, context);
        resolveSelectDeferreds(getSelectState(context));
      } else {
        chunk = chunk.write(output);
      }
    }

    return chunk;
  },

  /**
   * {@select}
   * Groups a set of truth tests and outputs the first one that passes.
   * Also contains {@any} and {@none} blocks.
   * @param key a value or reference to use as the left-hand side of comparisons
   * @param type coerce all truth test keys without an explicit type to this type
   */
  "select": function(chunk, context, bodies, params) {
    var body = bodies.block,
        state = {};

    if (params.hasOwnProperty('key')) {
      state.key = context.resolve(params.key);
    }
    if (params.hasOwnProperty('type')) {
      state.type = params.type;
    }

    if (body) {
      context = addSelectState(context, state);
      chunk = chunk.render(body, context);
      resolveSelectDeferreds(getSelectState(context));
    } else {
      log("select", "Missing body block", "WARN");
    }
    return chunk;
  },

  /**
   * Truth test helpers
   * @param key a value or reference to use as the left-hand side of comparisons
   * @param value a value or reference to use as the right-hand side of comparisons
   * @param type if specified, `key` and `value` will be forcibly cast to this type
   */
  "eq": truthTest('eq', function(left, right) {
    return left === right;
  }),
  "ne": truthTest('ne', function(left, right) {
    return left !== right;
  }),
  "lt": truthTest('lt', function(left, right) {
    return left < right;
  }),
  "lte": truthTest('lte', function(left, right) {
    return left <= right;
  }),
  "gt": truthTest('gt', function(left, right) {
    return left > right;
  }),
  "gte": truthTest('gte', function(left, right) {
    return left >= right;
  }),

  /**
   * {@any}
   * Outputs as long as at least one truth test inside a {@select} has passed.
   * Must be contained inside a {@select} block.
   * The passing truth test can be before or after the {@any} block.
   */
  "any": function(chunk, context, bodies, params) {
    var selectState = getSelectState(context);

    if(!selectState) {
      log("any", "Must be used inside a {@select} block", "ERROR");
    } else {
      if(selectState.isDeferredComplete) {
        log("any", "Must not be nested inside {@any} or {@none} block", "ERROR");
      } else {
        chunk = chunk.map(function(chunk) {
          selectState.deferreds.push(function() {
            if(selectState.isResolved) {
              chunk = chunk.render(bodies.block, context);
            }
            chunk.end();
          });
        });
      }
    }
    return chunk;
  },

  /**
   * {@none}
   * Outputs if no truth tests inside a {@select} pass.
   * Must be contained inside a {@select} block.
   * The position of the helper does not matter.
   */
  "none": function(chunk, context, bodies, params) {
    var selectState = getSelectState(context);

    if(!selectState) {
      log("none", "Must be used inside a {@select} block", "ERROR");
    } else {
      if(selectState.isDeferredComplete) {
        log("none", "Must not be nested inside {@any} or {@none} block", "ERROR");
      } else {
        chunk = chunk.map(function(chunk) {
          selectState.deferreds.push(function() {
            if(!selectState.isResolved) {
              chunk = chunk.render(bodies.block, context);
            }
            chunk.end();
          });
        });
      }
    }
    return chunk;
  },

  /**
  * {@size}
  * Write the size of the target to the chunk
  * Falsy values and true have size 0
  * Numbers are returned as-is
  * Arrays and Strings have size equal to their length
  * Objects have size equal to the number of keys they contain
  * Dust bodies are evaluated and the length of the string is returned
  * Functions are evaluated and the length of their return value is evaluated
  * @param key find the size of this value or reference
  */
  "size": function(chunk, context, bodies, params) {
    var key = params.key,
        value, k;

    key = context.resolve(params.key);
    if (!key || key === true) {
      value = 0;
    } else if(dust.isArray(key)) {
      value = key.length;
    } else if (!isNaN(parseFloat(key)) && isFinite(key)) {
      value = key;
    } else if (typeof key === "object") {
      value = 0;
      for(k in key){
        if(key.hasOwnProperty(k)){
          value++;
        }
      }
    } else {
      value = (key + '').length;
    }
    return chunk.write(value);
  }

};

for(var key in helpers) {
  dust.helpers[key] = helpers[key];
}

return dust;

}));

/*
 * =============================================================
 * dust helpers
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('dustjs'), require('dustjs-helpers'),require('elliptical-utils'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['dustjs','dustjs-helpers','elliptical-utils'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.dust,root.dust.helpers,root.elliptical.utils);
    }
}(this, function (dust,helpers,utils) {

    var string=utils.string;
    var random=utils.random;

    dust.helpers.formatCurrency=function(chunk, context, bodies, params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var money;
        try{
            if(utils.isNumeric(value)){
                value=parseFloat(value);
                money =value.toFixed(2);
            }else{
                money='';
            }
        }catch(ex){
            money='';
        }
        return chunk.write(money);
    };

    dust.helpers.extFormatCurrency=function(chunk, context, bodies, params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var money;
        try{
            if(utils.isNumeric(value)){
                value=parseFloat(value);
                money =value.toFixed(2);
                money = '$' + money.toString();
            }else{
                money='';
            }
        }catch(ex){
            money='';
        }
        return chunk.write(money);
    };


    dust.helpers.placeholder=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var defaultValue=dust.helpers.tap(params.defaultValue, chunk, context);
        return (value) ? chunk.write(value) : chunk.write(defaultValue);
    };


    dust.helpers.phraseCase = function (chunk, context, bodies, params) {
        var value = dust.helpers.tap(params.value, chunk, context);
        value = string.camelCaseToSpace(value);
        return chunk.write(value);
    };

    dust.helpers.checked=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var checked='';
        if(value){
            checked='checked';
        }
        return chunk.write(checked);
    };

    dust.helpers.radio=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var key= dust.helpers.tap(params.key, chunk, context);
        var checked='';
        try{
            if(value && value.toLowerCase()===key.toLowerCase()){
                checked='checked';
            }
        }catch(ex){

        }
        return chunk.write(checked);
    };

    dust.helpers.radioChecked=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var key= dust.helpers.tap(params.key, chunk, context);
        var checked='';
        try{
            if(value && value.toLowerCase()===key.toLowerCase()){
                checked='data-checked="true"';
            }
        }catch(ex){

        }
        return chunk.write(checked);
    };


    dust.helpers.selected=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var key= dust.helpers.tap(params.key, chunk, context);
        var selected='';
        try{
            if(value && value.toLowerCase()===key.toLowerCase()){
                selected='selected';
            }
        }catch(ex){

        }
        return chunk.write(selected);
    };

    dust.helpers.selectedPage=function(chunk,context,bodies,params){
        var index=context.stack.index + 1;
        var page=dust.helpers.tap(params.page, chunk, context);
        page=parseInt(page);
        if(page===index) return chunk.write('selected');
        else return chunk.write('');
    };

    dust.helpers.truthy=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var true_= dust.helpers.tap(params.true, chunk, context);
        var false_= dust.helpers.tap(params.false, chunk, context);

        var out=(value) ? true_ : false_;

        return chunk.write(out);
    };

    dust.helpers.falsy=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var altValue=dust.helpers.tap(params.altValue, chunk, context);
        var out=value;
        if(!value) out=altValue;
        else if(value==="0" || value==="false") out=altValue;
        return chunk.write(out)
    };

    dust.helpers.hide=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var hide='';
        if(value){
            hide='hide';
        }
        return chunk.write(hide);
    };

    dust.helpers.disable=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var disable='';
        if(value){
            disable='disabled';
        }
        return chunk.write(disable);
    };

    dust.helpers.toLower=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        return chunk.write(value.toLowerCase());
    };

    dust.helpers.toUpper=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        return chunk.write(value.toUpperCase());
    };

    dust.helpers.readonly=function(chunk,context,bodies,params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var readOnly='';
        if(value){
            readOnly='readonly';
        }
        return chunk.write(readOnly);
    };

    dust.helpers.position=function(chunk,context,bodies){
        var value=context.stack.index + 1;
        return chunk.write(value);
    };

    dust.helpers.index=function(chunk,context,bodies){
        var value=context.stack.index;
        return chunk.write(value);
    };

    dust.helpers.urlEncode=function(chunk, context, bodies, params){
        var value = dust.helpers.tap(params.value, chunk, context);
        if (value) {
            value=encodeURIComponent(value);
        }else{
            value='';
        }
        return chunk.write(value);
    };

    dust.helpers.toggle=function(chunk, context, bodies, params){
        var value = dust.helpers.tap(params.value, chunk, context);
        var on=dust.helpers.tap(params.on, chunk, context);
        var onCss=dust.helpers.tap(params.onCss, chunk, context);
        var offCss=dust.helpers.tap(params.offCss, chunk, context);
        css=(value===on) ? onCss : offCss;

        return chunk.write(css);
    };

    dust.helpers.compare=function(chunk, context, bodies, params){
        var output='';
        var value = dust.helpers.tap(params.value, chunk, context);
        var test=dust.helpers.tap(params.test, chunk, context);
        var echo=dust.helpers.tap(params.echo, chunk, context);

        if(value===test){
            output=echo;
        }

        return chunk.write(output);
    };


    dust.helpers.pluralize=function(chunk,context,bodies,params){
        var count = dust.helpers.tap(params.count, chunk, context);
        var singular = dust.helpers.tap(params.singular, chunk, context);
        var plural = dust.helpers.tap(params.plural, chunk, context);

        var text=(count===1) ? singular : plural;
        return chunk.write(text);
    };

    dust.helpers.id=function(chunk, context, bodies, params){
        var id = dust.helpers.tap(params.value, chunk, context);
        if(id===undefined){
            id=random.id();
        }

        return chunk.write(id);
    };

    dust.helpers.guid=function(chunk, context, bodies, params){
        var id = dust.helpers.tap(params.value, chunk, context);
        if(id===undefined || id===''){
            id=random.guid();
        }

        return chunk.write(id);
    };

    dust.helpers.properCaseToSentence=function(chunk, context, bodies, params){
        var value = dust.helpers.tap(params.value, chunk, context);
        value=string.camelCaseToSpace(value);
        value=value.charAt(0).toUpperCase() + value.slice(1);
        return chunk.write(value);
    };

    dust.helpers.camelCaseToSentence=function(chunk, context, bodies, params){
        var value = dust.helpers.tap(params.value, chunk, context);
        value=string.camelCaseToSpace(value);
        value=value.charAt(0).toUpperCase() + value.slice(1);
        return chunk.write(value);
    };

    dust.helpers.count=function(chunk,context,bodies,params){
        var count = dust.helpers.tap(params.value, chunk, context);
        var minLength=dust.helpers.tap(params.minLength, chunk, context);
        var content= dust.helpers.tap(params.content, chunk, context);
        var out='';
        if(!count || parseInt(count) < parseInt(minLength)){
            out=content;
        }
        return chunk.write(out);
    };

    dust.helpers.href=function(chunk, context, bodies, params){
        var attr='';
        var href = dust.helpers.tap(params.value, chunk, context);
        if(href!==undefined && href!==''){
            attr='href="' + href + '"';
        }

        return chunk.write(attr);
    };

    return dust;
}));
