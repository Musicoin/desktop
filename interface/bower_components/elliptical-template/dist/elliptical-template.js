/*
 * =============================================================
 * elliptical.$Template
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'),require('elliptical-class'),require('dustjs'),require('elliptical-dust-helpers'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils','elliptical-class','dustjs','elliptical-dust-helpers'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.$Template = factory(root.elliptical.utils,root.elliptical.Class, root.dust,root.dust.helpers);
        root.returnExports = root.elliptical.$Template;
    }
}(this, function (utils, Class,dust,helpers) {

    var LOADING_INTERVAL=250;
    var MAX_LOADING_ITERATIONS=5;

    var VIEWS_FOLDER='/app/views';

    var object=utils.object;
    var string=utils.string;
    var network=utils.network;
    dust.optimizers.format = function (ctx, node) {
        return node;
    };

    dust._root = VIEWS_FOLDER;

    /**
     * onLoad fired when template not found
     * if we have a "." in the template name, we look for the html file in the app views directory
     * dots compose the hierarchical location within the directory tree. E.g, "home.index" --> /view/home/index.html
     * @param {string} template -the template name
     * @param {function} callback
     */
    dust.onLoad = function (template, callback) {
        if (template.indexOf('.') > -1) loadTemplateFromFolder(dust, template, callback);
        else {
            var err = new Error('Partial Not Found: ' + template);
            callback(err, null);
        }
    };

    var $Template;
    $Template = Class.extend({
        _data: {},

        _$store:null,

        get $store(){
            return this._$store;
        },

        set $store(val){
            this._$store=val;
        },

        _base: {
            server: 'base',
            client: 'base-client'
        },

        get base(){
            return this._base;
        },

        set base(val){
            this._base=val;
        },

        _$provider: dust,

        get $provider(){
            return this._$provider;
        },

        set $provider(val){
            this._$provider=val;
            this._$provider._root=this._root;
        },

        compile: dust.compile,

        cache: dust.cache,

        _model: 'template',

        get model(){
            return this._model;
        },

        set model(val){
            this._model=val;
        },

        _api: '/api/template',

        get api(){
            return this._api;
        },

        set api(val){
            this._api=val;
        },

        _root:VIEWS_FOLDER,

        get root(){
            return this._root;
        },

        set root(val){
            this._root=val;
            this._$provider._root=val;
        },

        /**
         * returns the current environment base value
         * @returns {string}
         * @public
         */
        getBase: function () {
            return (network.isBrowser()) ? this.base.client : this.base.server;
        },

        setRoot:function(val){
            this.root=val;
            this._root=val;
            this._$provider._root=val;
        },


        /**
         * renders a template
         *  if template not already in the object cache, render will either:
         *  (i) check if template param is an object, if so, it will attempt to render html document located according to MVC Controller/View convention
         *  (ii) render html document using dot notation to infer folder location
         *  (iii) atempt to render by string name from an external store provider
         *
         * @param {string} template
         * @param {object} context
         * @param {function} callback
         * @public
         */
        render: function (template, context, callback) {
            if(!template) {
                console.warn('warning: cannot render null template');
                return;
            }
            var $provider = this.$provider;
            var cache = $provider.cache;
            var isEmpty=false;
            if(cache) isEmpty=object.isEmpty(cache);
            else isEmpty=true;
            if(!isEmpty && cache[template] !==undefined) $provider.render(template, context, callback);
            else if(typeof template==='object') this._renderTemplateObjectByControllerView(isEmpty,template,context,callback);
            else if(template.indexOf('.') > -1) this._renderTemplateByPathDotHierarchy(template,context,callback);
            else loadTemplateByStringValue(this, template, context, callback);
        },

        /**
         * set the provider as a global to the window object
         * in a non global context(e.g., browserify) on the browser side, if compiled templates are referenced in script tag, you'll need to set
         * a reference to dust on the window object
         * @public
         */
        setBrowserGlobal: function () {
            if (typeof window != 'undefined') window.dust = this.$provider;
        },

        _renderTemplateObjectByControllerView:function(isEmptyCache,template,context,callback){
            var $provider = this.$provider;
            var cache = $provider.cache;
            var ctrlName = template.name.toLowerCase();
            var ctrlView = template.view.toLowerCase();
            var ctrlTemplate = ctrlName + '.' + ctrlView;
            if (!isEmptyCache) {
                if (cache[ctrlTemplate]) $provider.render(ctrlTemplate, context, callback);
                else loadTemplateFromControllerView(this, ctrlName, ctrlView, context, callback);
            } else {
                loadTemplateFromControllerView(this, ctrlName, ctrlView, context, callback);
            }
        },

        _renderTemplateByPathDotHierarchy:function(template,context,callback){
            var self=this;
            var $provider = this.$provider;
            loadTemplateFromViewsFolder($provider, template, function (err,data) {
                if(!err) $provider.render(template, context, callback);
                else self._onRenderError(template,context,callback);
            });
        },


        _onRenderError:function(template,context,callback){
            var $provider = this.$provider;
            loadTemplateFromFolder($provider,template,function(err,data){
                if(!err) $provider.render(template, context, callback);
                else throw new Error(err);
            });
        }

    }, {
        /**
         * @constructs
         * @param {boolean} base
         */
        init: function (base) {
            if (base) this.constructor._data.base = true;
            this.root = this.constructor.root;
        },

        /**
         * renders with a context base
         * use render method on template provider's prototype to mixin a base context
         *
         * @param {string} template
         * @param {object} context
         * @param {function} callback
         * @public
         */
        render: function (template, context, callback) {
            if (this.constructor._data.base) {
                var baseRender = {
                    render: this.constructor.getBase()
                };
                var base = this.constructor.$provider.makeBase(baseRender);
                context = base.push(context);
            }
            this.constructor.render(template, context,callback);
        }
    });

    function getSanitizedUrlPath($provider,template){
        var url = sanitizeFolder($provider._root);
        return getUrlPath(url,template);
    }

    function getUrlPath(url, template) {
        var arr = template.split('.');
        for (var i = 0; i < arr.length; i++) {
            url += '/' + arr[i];
        }
        url += '.html';
        return url;
    }

    function getRequest(url,$provider,template,callback){
        $.get(url)
          .done(function(data){
              var compiled = $provider.compile(data, template);
              $provider.loadSource(compiled);
              callback(null, data);
          })
          .fail(function(){
              callback(new Error('Error: cannot find ' + template + ' in views folder'), null);
          })
    }

    function loadTemplateFromViewsFolder($provider, template, callback) {
        var url = getSanitizedUrlPath($provider, template);
        getRequest(url,$provider,template,callback);
    }

    function loadTemplateFromFolder($provider, template, callback) {
        var url = getUrlPath('', template);
        getRequest(url,$provider,template,callback);
    }

    function loadTemplateFromControllerView(thisRef, ctrl, view, context, callback) {
        var root = sanitizeFolder(thisRef.root);
        var url = root + '/' + ctrl + '/' + view + '.html';
        var ctrlTemplate = ctrl + '.' + view;
        var $provider = thisRef.$provider;
        $.get(url, function (data) {
            if (data) {
                var compiled = $provider.compile(data, ctrlTemplate);
                $provider.loadSource(compiled);
                $provider.render(ctrlTemplate, context, callback);
            } else {
                callback(new Error('Error: Controller View does not exist'), null);
            }
        });

    }

    function loadTemplateByStringValue(thisRef, template, context, callback) {
        var $provider = thisRef.$provider;
        var url=template + '.html';
        template=getTemplateNameFromPath(template);
        getRequest(url,$provider,template,function(err,data){
            $provider.render(template, context, callback);
        });
    }

    function getTemplateNameFromPath(path){
        var namespacePath=path;
        if(string.firstChar(path)==='/') namespacePath=string.trimFirstChar(namespacePath);
        namespacePath=namespacePath.replace(/\//g, '.');
        return namespacePath;
    }

    /**
     * if template cache is empty, load it from the store or client-side, load it from scripts
     * @param {string} model
     * @param {object} $store
     * @param {object} $provider
     * @param {string} api
     * @param {function} callback
     * @private
     */
    function loadTemplateCacheFromStore(model, $store, $provider, api, callback) {
        if ($store) {
            $store.getAll(model, function (err, data) {
                for (var i = 0, max = data.length; i < max; i++) {
                    var obj = JSON.parse(data[i]);
                    dust.loadSource(obj);
                }
                if(callback) callback();
            });

        } else {

            //continue to query at intervals for cache to load
            var iterations = MAX_LOADING_ITERATIONS;
            var count=0;
            var intervalId=setInterval(function(){
                var cache=$provider.cache;
                if(!object.isEmpty(cache)){
                    clearInterval(intervalId);
                    if(callback) callback();
                }else{
                    count++;
                    if(count>iterations) if(callback) callback();
                }
            },LOADING_INTERVAL);

        }
    }

    function sanitizeFolder(folder){
        if(string.lastChar(folder)==='/') return string.trimLastChar(folder);
        else return folder;

    }

    return $Template;

}));