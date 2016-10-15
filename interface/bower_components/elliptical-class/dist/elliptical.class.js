
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils'], factory);
    } else {
        // Browser globals (root is window)
        root.__tmp9z=root.__tmp9z || {};
        root.__tmp9z.extend=factory(root.elliptical.utils);
        root.returnExports = root.__tmp9z.extend;
    }
}(this, function (utils) {

    var isPlainObject = utils.object.isPlainObject;
    var isArray = Array.isArray;

    var extend= function(){
        // copy reference to target object
        var target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false,
            options,
            name,
            src,
            copy;

        // Handle a deep copy situation
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== 'object' && ! typeof target === 'function') {
            target = {};
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) !== null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging object literal values or arrays
                    if (deep && copy && (isPlainObject(copy) || isArray(copy))) {
                        var clone = src && (isPlainObject(src) || isArray(src)) ? src : isArray(copy) ? [] : {};

                        // Never move original objects, clone them
                        target[name] = extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (typeof copy !== 'undefined') {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    return extend;
}));

/*
 * =============================================================
 * elliptical.Class
 * =============================================================
 *
 * Classical inheritance pattern adopted from JavascriptMVC(which is an implementation of the Resig pattern), sans the jQuery dependency.
 * https://github.com/jupiterjs/jquerymx/blob/master/class/class.js
 *
 * var MyClass=Class.extend({},{});
 *
 * examples.:
 *
 * var MyClass=Class.extend({
 *
 * //@static
 *    method1:function(){
 *       return 'method1';
 *    }
 * },{
 *
 * //@prototype
 *    init:function(arg){
 *      this.name=arg;
 *    },
 *
 *    method1: function(){
 *       return this.name;
 *    }
 *
 * });
 *
 * MyClass.method1() //  'method1'
 * var myClassInstance=new MyClass('Bob');
 *
 * myClassInstance instanceof MyClass // true
 * myClassInstance.method1()  // 'Bob'
 *
 * var AnotherClass=Class.extend({  //define only instance props and methods
 *    init:function(arg){
 *        this.name=arg;
 *    },
 *    method1: function(){
 *       return this.name;
 *    }
 * });
 *
 * var anotherClassInstance=new AnotherClass('Fred');
 * anotherClassInstance instanceof AnotherClass // true
 * anotherClassInstance.method1()  // 'Fred'
 *
 * var Class2=Class.extend({
 *      prop1:true
 *      method1:function(){
 *        return 'method1';
 *      }
 * },
 * {
 *    init:function(arg){
 *      this.name=arg;
 *    },
 *
 *    method1: function(){
 *       return this.name;
 *    }
 * });
 *
 * var Class3=Class2.extend({
 *      prop1:false,
 *      prop2:true,
 *      method2:function(){
 *         return 'method2';
 *      }
 *
 * },{
 *     method2: function(){
 *       return this.name + ' from method 2';
 *     }
 * });
 *
 * var myClass3=new Class3('Jane');
 * Class2.prop1 //true
 * Class3.prop1 //false
 * myClass3 instanceof Class2  //true
 * myClass3 instanceof Class3  //true
 *
 * myClass3.method2() // 'Jane from method 2'
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'),require('./extend'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils','./extend'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.Class=factory(root.elliptical.utils,root.__tmp9z.extend);
        root.returnExports = root.elliptical.Class;
    }
}(this, function (utils,extend) {
    var makeArray = utils.array.makeArray;
    var isFunction = utils.object.isFunction;
    var isArray = Array.isArray;
    var concatArgs = utils.array.concatArgs;


    var initializing = false,

    /* tests if we can get super in .toString() */
        fnTest = /xyz/.test(function()
        {
            xyz;
        }) ? /\b_super\b/ : /.*/,


        /**
         * overwrites an object with methods, sets up _super
         * @param newProps {Object}
         * @param oldProps {Object}
         * @param addTo {Object}
         */
        inheritProps = function(newProps, oldProps, addTo)
        {

            addTo = addTo || newProps;
            for ( var name in newProps)
            {
                /* Check if we're overwriting an existing function */
                addTo[name] = isFunction(newProps[name]) && isFunction(oldProps[name])
                && fnTest.test(newProps[name]) ? (function(name, fn)
                {
                    return function()
                    {
                        var tmp = this._super, ret;

                        /* Add a new ._super() method that is the same method, but on the super-class */
                        this._super = oldProps[name];

                        /* The method only need to be bound temporarily, so we remove it when we're done executing */
                        ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, newProps[name]) : newProps[name];
            }
        };

    var clss =function()
    {
        if (arguments.length)
        {
            clss.extend.apply(clss, arguments);
        }
    };

    /* @Static */
    extend(
        clss,
        {
            /**
             * Returns a callback function for a function on this Class.
             * Proxy ensures that 'this' is set appropriately.
             * @param funcs {Array}
             * @returns {Function} the callback function
             */
            proxy : function(funcs)
            {
                /* args that should be curried */
                var args = makeArray(arguments), self;

                funcs = args.shift();

                if (!isArray(funcs))
                {
                    funcs = [ funcs ];
                }

                self = this;
                for ( var i = 0; i < funcs.length; i++)
                {
                    if (typeof funcs[i] == "string"
                        && !isFunction(this[funcs[i]]))
                    {
                        throw ("class.js "
                        + (this.fullName || this.Class.fullName)
                        + " does not have a " + funcs[i] + "method!");
                    }
                }
                return function class_cb()
                {
                    var cur = concatArgs(args, arguments), isString, length = funcs.length, f = 0, func;
                    for (; f < length; f++)
                    {
                        func = funcs[f];
                        if (!func)
                        {
                            continue;
                        }

                        isString = typeof func == "string";
                        if (isString && self._set_called)
                        {
                            self.called = func;
                        }

                        cur = (isString ? self[func] : func).apply(self, cur
                            || []);
                        if (f < length - 1)
                        {
                            cur = !isArray(cur) || cur._use_call ? [ cur ]
                                : cur;
                        }
                    }
                    return cur;
                };
            },

            /**
             * Creates a new instance of the class.
             * @returns {Class} instance of the class
             */
            newInstance: function() {
                var inst = this.rawInstance(),
                    args;
                /* call setup if there is a setup */
                if ( inst.setup ) {
                    args = inst.setup.apply(inst, arguments);
                }
                /* call init if there is an init, if setup returned args, use those as the arguments */
                if ( inst.init ) {
                    inst.init.apply(inst, isArray(args) ? args : arguments);
                }
                return inst;
            },

            /**
             * Setup gets called on the inherting class with the base class followed by the inheriting class's raw properties.
             * Setup will deeply extend a static defaults property on the base class with properties on the base class.
             * @param baseClass {Object}
             * @param fullName {String}
             * @returns {Arguments}
             */
            setup: function( baseClass, fullName ) {
                this.defaults = extend(true, {}, baseClass.defaults, this.defaults);
                return arguments;
            },

            /**
             * returns the raw instance before application of setup and init
             * @returns {Class}
             */
            rawInstance: function() {
                initializing = true;
                var inst = new this();
                initializing = false;
                return inst;
            },

            /**
             * NOTE: support for namespacing fullName dropped because of its reliance on globals (S.Francis)
             * @param klass {Object}
             * @param proto {Object}
             * @returns {Class}
             */
            extend: function(klass, proto) {
                if(!proto) {
                    proto = klass;
                    klass = null;
                }
                proto = proto || {};
                var _super_class = this,
                    _super = this.prototype, prototype;

                /* Instantiate a base class (but only create the instance, don't run the init constructor */
                initializing = true;
                prototype = new this();
                initializing = false;
                /* Copy the properties over onto the new prototype */
                inheritProps(proto, _super, prototype);

                /* The dummy class constructor */

                function Class() {
                    /* All construction is actually done in the init method */
                    if ( initializing ) return;

                    /* extending */
                    if ( this.constructor !== Class && arguments.length ) {
                        return arguments.callee.extend.apply(arguments.callee, arguments);
                    } else { /* we are being called with new */
                        return this.Class.newInstance.apply(this.Class, arguments);
                    }
                }
                /* copy old stuff onto class */
                for ( name in this ) {
                    if ( this.hasOwnProperty(name) && ['prototype', 'defaults'].indexOf(name) == -1 ) {
                        Class[name] = this[name];
                    }
                }

                /* static inheritance */
                inheritProps(klass, this, Class);

                /* set things that can't be overwritten */
                extend(Class, {
                    prototype: prototype,
                    constructor: Class
                });

                //make sure our prototype looks nice
                Class.prototype.Class = Class.prototype.constructor = Class;

                var args = Class.setup.apply(Class, concatArgs([_super_class],arguments));

                if ( Class.init ) {
                    Class.init.apply(Class, args || []);
                }

                /* @Prototype*/
                return Class;
            }
        });


    clss.callback=clss.prototype.callback=clss.prototype.proxy=clss.proxy;

    return clss;


}));

