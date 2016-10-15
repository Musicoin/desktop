(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-class'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-class'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.$ViewData = factory(root.elliptical.Class,root);
        root.returnExports = root.elliptical.$ViewData;
    }
}(this, function (Class,root) {
    var $ViewData;

    var getViewData=function(){
        if(!root.__viewData) root.__viewData={};
        return root.__viewData;
    };


    $ViewData = Class.extend({

        /**
         *
         * @param {string} [prop]
         * @return {*}
         */
        get:function(prop){
            var viewData=getViewData();
            if(prop===undefined) return viewData;
            else return viewData[prop];
        },

        /**
         *
         * @param {*} value
         * @param {string} [prop]
         */
        set:function(value,prop){
            var viewData=getViewData();
            var isArray=Array.isArray(value);
            if(prop===undefined && !isArray) viewData=value;
            else if(prop !==undefined) viewData[prop]=value;
        }
    },{
        get:function(prop){
            return this.constructor.get(prop);
        },

        set:function(value,prop){
            return this.constructor.put(value,prop);
        }

    });

    return $ViewData;
}));

