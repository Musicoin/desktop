//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical = root.elliptical || {};
        root.elliptical.extensions = root.elliptical.extensions || {};
        root.elliptical.extensions.utils = factory();
        root.returnExports = root.elliptical.extensions.utils;
    }
}(this, function () {

    return {

        _utils: $.utils,

        _DOMParser: function (htmlString) {
            return new DOMParser().parseFromString(htmlString, 'text/html');
        },

        _preloadImages: function (element, callback) {
            var imgArray = [];
            var err = {};
            var data = {};
            var images = element.find('img').not('[data-src]');
            var length = images.length;
            var counter = 0;
            if (length === 0) {
                if (callback) {
                    err.message = 'No images found in element';
                    callback(err, null);
                }
                return false;
            }
            $.each(images, function (i, img) {
                var image = new Image();
                $(image).bind('load', function (event) {
                    counter++;
                    imgArray.push(image);
                    if (counter === length) {
                        if (!callback) {
                        } else {
                            data.images = imgArray;
                            data.length = counter;
                            callback(null, data);
                        }
                    }
                });
                image.src = img.src;
            });
            return true;
        },

        _scrollTop: function (ypos, evt) {
            if (typeof ypos !== "number") {
                ypos = 0;
            } else if (typeof evt === 'undefined') {
                evt = 'scrollTop';
            }

            setTimeout(function () {
                window.scrollTo(0, ypos);
                $(document).trigger(evt, {x: 0, y: ypos});
            }, 20);
        },

        _setModal: function (element, opts, callback) {
            //support 0-3 params
            var length = arguments.length;
            if (length === 0) {
                element = $('body');
                opts = {};
                callback = null;
            } else if (length === 1) {
                if (typeof element === 'function') {
                    callback = element;
                    element = $('body');
                    opts = {};
                } else if (element.context) {
                    opts = {};
                    callback = null;
                } else {
                    opts = element;
                    element = $('body');
                }
            } else if (length === 2) {
                if (typeof opts === 'function') {
                    callback = opts;
                    if (element.context === undefined) {
                        opts = element;
                        element = $('body');
                    } else {
                        opts = {};
                    }
                } else {
                    callback = null;
                }
            }

            var div = $('<div class="ui-modal"></div>');
            if (opts.cssClass) {
                div.addClass(opts.cssClass);
            }

            if (opts.zIndex) {
                div.css({
                    'z-index': opts.zIndex
                });
            }else{
                div.css({
                    'z-index': 99999
                });
            }
            if(opts.background){
                div.css({
                    background: opts.background
                });
            }else{
                div.css({
                    background: '#000'
                });
            }
            div.css({
                top:0,
                bottom:0,
                right:0,
                position:'fixed',
                width:'100%'

            });
            if (this._data) {
                this._data.set('modal', div);
            } else {
                this._modal = div;
            }

            var opacity = (opts.opacity !==undefined) ? opts.opacity : .3;
            div.css({
                opacity: 0
            });
            element.append(div);

            this._transition(div, {
                opacity: opacity,
                duration: 250
            }, function () {
                if (callback) {
                    callback();
                }
            });
        },

        _removeModal: function (callback) {
            var self = this;
            var modal = null;
            if (this._data) {
                modal = this._data.get('modal');
            } else {
                modal = this._modal;
            }

            if (!modal || modal === undefined) {
                return;
            }
            this._transition(modal, {
                opacity: 0,
                duration: 250
            }, function () {
                modal.remove();
                (self._data) ? self._data.set('modal', null) : self._modal = null;
                if (callback) {
                    callback();
                }
            });
        },


        _resetSemanticState:function(){
            this.element.removeClass('error')
                .removeClass('warning')
                .removeClass('success')
                .removeClass('info')
        },

        _clearModals:function(){
            var modals=$('.ui-modal');
            if(modals[0]) modals.remove();
        },
        
        _setChildrenAttributes:function(){
            var element=this.element;
            if(element[0].hasAttribute && element[0].hasAttribute('disabled')){
                element.query('input,textarea,select',function(result){
                    if(result[0]){
                        result.attr('disabled',true);
                    }
                });
            }
            if(element[0].hasAttribute && element[0].hasAttribute('readonly')){
                element.query('input,textarea,select',function(result){
                    if(result[0]){
                        result.attr('readonly',true);
                    }
                });
            }
        },

        _enableChildrenAttributes:function(){
            var element=this.element;
            element.query('input,textarea,select',function(result){
                if(result[0]){
                    result.attr('disabled',false);
                }
            });
            element.query('input,textarea,select',function(result){
                if(result[0]){
                    result.attr('readonly',false);
                }
            });
        },

        _find:function(selector){
            return this.element.find(selector);
        },

        _jsonParseMessage: function (obj) {
            try {
                var msgObj = JSON.parse(obj);
                if (msgObj.message) {
                    return msgObj.message;
                } else {
                    return obj;
                }
            } catch (ex) {
                return obj;
            }
        }


    };
}));
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical = root.elliptical || {};
        root.elliptical.extensions = root.elliptical.extensions || {};
        root.elliptical.extensions.device = factory();
        root.returnExports = elliptical.extensions.device;
    }
}(this, function () {

    return {

        _device: $.device,
        _mq: $.device.mq,

        _press: function () {
            return ('ontouchend' in document) ? 'touchstart' : 'click';
        },

        _mode: function () {
            return (this._device.viewport.width > 768) ? "desktop" : "touch";
        }

    };
}));


//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.extensions=root.elliptical.extensions || {};
        root.elliptical.extensions.transition = factory();
        root.returnExports = root.elliptical.extensions.transition;
    }
}(this, function () {

    return {

        _transition: function (element, options, callback) {
            $.transition=$.transition || $.transit;
            if (!(element instanceof jQuery)) element=$(element);
            options = options || {};
            if (options === {}) {
                options.duration = 300;
                options.preset = 'fadeIn';
            }
            if(options.preset==='none'){
                element.hide();
                return;
            }
            element.transition(options, function () {
                if (callback) {
                    callback.call(element[ 0 ]);
                }
            });
        }
    };
}));
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.extensions=root.elliptical.extensions || {};
        root.elliptical.extensions.transform = factory();
        root.returnExports = root.elliptical.extensions.transform;
    }
}(this, function () {
    var provider = $.transforms;
    var HARDWARE_ACCELERATED_CLASS='ui-hardware-accelerated';
    var OVERFLOW_CONTAINER_CLASS='ui-overflow-container';
    var FIXED_TOGGLE_CONTAINER_CLASS='ui-fixed-toggle-container';
    var BOX_SHADOW_CLASS='ui-drawer-box-shadow';

    return {

        _setHardwareAcceleration: function (element) {
            this._data.set('toggleAcceleration', provider.setHardwareAcceleration(element, HARDWARE_ACCELERATED_CLASS));
        },

        _resetHardwareAcceleration: function (element) {
            provider.resetHardwareAcceleration(element, this._data.get('toggleAcceleration'), HARDWARE_ACCELERATED_CLASS);
        },

        _setContainerOverflow: function (element) {
            this._data.set('toggleOverflow', provider.setContainerOverflow(element, OVERFLOW_CONTAINER_CLASS));
        },

        _resetContainerOverflow: function (element) {
            provider.resetContainerOverflow(element, OVERFLOW_CONTAINER_CLASS);
        },

        _resetContainer: function (container) {
            provider.resetContainer(container, BOX_SHADOW_CLASS, FIXED_TOGGLE_CONTAINER_CLASS);
        },

        _resetTransition: function (element) {
            provider.resetTransition(element);
        },

        _resetTransform: function (element) {
            provider.resetTransform(element);
        },

        _transform: function (element, coordinates) {
            provider.transform(element, coordinates);
        },

        _3dTransition: function (element, opts, callback) {
            provider.transition3d(element, opts, callback);
        }

    };
}));
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical = root.elliptical || {};
        root.elliptical.extensions = root.elliptical.extensions || {};
        root.elliptical.extensions.event = factory();
        root.returnExports = root.elliptical.extensions.event;
    }
}(this, function () {

    return {

        _onEventTrigger: function (evt, data) {
            this._triggerEvent(evt, data);
        },

        _triggerEvent: function (evt, data) {
            var event = $.Event(evt);
            this._trigger(evt, event, data);
        },

        _trigger: function (type, event, data) {
            if(this.options){
                this._jqTrigger(type,event,data);
            }else{
                this.__triggerEvent(type,data);
            }
        },

        __triggerEvent:function(evt,data){
            var tagName=this.tagName.toLowerCase();
            var nameSpacedTagName = this._utils.string.tagNameToNamespace(tagName);
            evt=nameSpacedTagName + '.' + evt;
            this.element.trigger(evt,data);
        },

        _dispatchEvent:function(evt,data){
            var event=new CustomEvent(evt,{detail:data});
            document.dispatchEvent(event);
        },

        _jqTrigger:function(type,event,data){
            try {
                var prop, orig,
                    callback = this.options[type];

                data = data || {};
                var prefix = this.widgetEventPrefix;
                var tagName = this.bindings[0].tagName.toLowerCase();
                var tagArray = tagName.split('-');
                var tagLength = tagArray.length;
                var nameSpacedTagName = this._utils.string.tagNameToNamespace(tagName);
                var arr = prefix.toArrayFromCamelCase();
                var nameSpacedPrefix = this._utils.array.toNamespaceFromArray(arr);
                if (nameSpacedPrefix === nameSpacedTagName) {
                    prefix = nameSpacedPrefix;
                } else if (tagLength > 1) {
                    prefix = nameSpacedTagName + '.' + prefix;
                } else {
                    prefix = this.namespace + '.' + prefix;
                }

                event = $.Event(event);
                event.type = ( type === prefix ?
                    type :
                prefix + '.' + type ).toLowerCase();
                // the original event may come from any element
                // so we need to reset the target on the new event
                event.target = this.element[0];

                // copy original event properties over to the new event
                orig = event.originalEvent;
                if (orig) {
                    for (prop in orig) {
                        if (!( prop in event )) {
                            event[prop] = orig[prop];
                        }
                    }
                }

                this.element.trigger(event, data);
                return !( $.isFunction(callback) &&
                callback.apply(this.element[0], [event].concat(data)) === false ||
                event.isDefaultPrevented() );
            } catch (ex) {

            }
        }

    };
}));

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
        root.elliptical.extensions=root.elliptical.extensions || {};
        root.elliptical.extensions.options = factory(root.elliptical.utils);
        root.returnExports = root.elliptical.extensions.options;
    }
}(this, function (utils) {

    return {

        _setOptionsFromAttribute:function(){
            var options=(this.options) ? this.options.opts : this.opts;
            if(options===undefined) return;
            options=JSON.parse(options);
            (this.options) ? this.options.opts=options : this.opts=options;
        }

    };
}));

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'),require('jquery-extensions'),require('./prototype.device'),
            require('./prototype.transition'), require('./prototype.transform'),require('./prototype.utils'),
            require('./prototype.event'),require('./prototype.options'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils','jquery-extensions','./prototype.device',
            './prototype.transition','./prototype.transform','./prototype.utils','./prototype.event','./prototype.options'], factory);
    } else {
        // Browser globals (root is window)
        var e=root.elliptical.extensions;
        root.elliptical.extensions.base = factory(root.elliptical.utils,root,e.device,
            e.transition,e.transform,e.utils,e.event,e.options);
        root.returnExports = root.elliptical.extensions.base;
    }
}(this, function (utils,root,device,transition,transform,util,event,options) {

    var base={};
    Object.assign(base,util,device,transition,transform,event,options);
    return base;

}));