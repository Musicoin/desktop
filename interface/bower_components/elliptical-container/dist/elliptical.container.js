
/*
 * =============================================================
 * An es6 Map dependency injection container
 * =============================================================
 *
 *  registerType<name,type>
 *  getType<name>,
 *  mapType<type,providerType>
 *
 */

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
        root.elliptical.container=factory(elliptical.utils);
        root.returnExports = root.elliptical.container;
    }
}(this, function (utils) {
    var GET_TYPE_MAX_COUNT=6;
    var GET_TYPE_INTERVAL=250;
    var native=utils.native;

    return {
        _registrations:{
            _container:null,
            get container() {
                if (this._container) return this._container;
                else {
                    this._container=new Map();
                    return this._container;
                }
            }
        },

        //configurable props for registered POJOs
        classNameProp:'@resource',
        providerProp:'$provider',
        defaultTypeName:'Service',

        //overwritable defaultType extend method, called on the defaultType before returning
        extend:function(type){
            return native.extends(type);
        },

        /**
         * registers a type
         * @param {string} name
         * @param {object} type
         */
        registerType:function(name,type){
            var container=this._registrations.container;
            try{
                if(type.constructor && type.constructor instanceof Function) type.constructor[this.classNameProp]=name;
                type[this.classNameProp]=name;
            }catch(ex){
                
            }

            container.set(name,type);
        },

        /**
         * returns the registered type associated with the name
         * @param {string} name
         * @param {boolean} useDefaultTypeIfNotFound
         * @returns {object}
         */
        getType:function(name,useDefaultTypeIfNotFound){
            if(useDefaultTypeIfNotFound===undefined) useDefaultTypeIfNotFound=true;
            var container=this._registrations.container;
            var type=container.get(name);
            if(type!==undefined) return type;
            if (!useDefaultTypeIfNotFound) return null;
            else {
                type = container.get(this.defaultTypeName);
                if (type !== undefined) {
                    try {
                        type =this.extend(type); //if defaultType, call extend to create a derived/sub-class of the type
                    } catch (ex) {

                    }
                    type[this.classNameProp] = name;
                    return type
                } else return null;
            }
        },

        /**
         * asynchronously returns the registered type associated with the name
         * @param {string} name - type name
         * @param {boolean} useDefaultTypeIfNotFound
         * @param {function} callback - callback
         */
        getTypeAsync:function(name,useDefaultTypeIfNotFound,callback){
            var length = arguments.length;
            ///support 2-3 params
            if(length < 2) throw 'getTypeAsync expects a minimum of two parameters';
            if(length===2){
                callback=useDefaultTypeIfNotFound;
                useDefaultTypeIfNotFound=true;
            }
            if(typeof callback !=='function')throw 'Error: getTypeAsync requires a callback function';
            var self=this;
            var count=0;
            var type=this.getType(name,false);
            if(type){
                callback(type);
            }else{
                var timeoutId=setInterval(function(){
                    //on the last attempt, we set useDefaultTypeIfNotFound to true, unless the parameter was originally passed in as false
                    var _useDefaultTypeIfNotFound=(count ===(GET_TYPE_MAX_COUNT-1));
                    if(!useDefaultTypeIfNotFound) _useDefaultTypeIfNotFound=false;
                    type=self.getType(name,_useDefaultTypeIfNotFound);
                    if(type){
                        clearInterval(timeoutId);
                        callback(type);
                    }else if(count < GET_TYPE_MAX_COUNT){
                        count++;
                    }else{
                        clearInterval(timeoutId);
                        callback(null);
                    }
                },GET_TYPE_INTERVAL);
            }
        },

        /**
         * mapType(<type>,<providerType>)
         *   performs a setter dependency injection on a type with a providerType
         *
         *  (i)   registers a type and maps an unregistered providerType to that type
         *
         *  (ii)  registers a type and maps an previously registered providerType to that type by
         *        name of the previously registered providerType
         *
         *  (iii) maps an unregistered providerType to a previously registered type by that type's name
         *
         *  mapType(typeName,Type,$Type)
         *  mapType(typeName,Type,$typeName)
         *  mapType(typeName,$Type)
         *
         * @param {string} name - string name of type
         * @param {object} type - the type
         * @param {*} $type - string name of a registered provider type, or a provider type
         */
        mapType:function(name,type,$type){
            var self=this;
            var container=this._registrations.container;
            var providerProp=this.providerProp;
            var length = arguments.length;
            ///support 2-3 params
            if(length < 2) throw 'mapType expects a minimum of two parameters';
            if(length===2){
                if(typeof name!=='string') throw "mapType with 2 params requires the first parameter to be the string name of a registered type";
                $type=type;
                type=this.getType(name,false);
                if(type){
                    type[providerProp]=$type;
                    this.registerType(name,type);
                }else{
                    this.getTypeAsync(name,false,function(dataType){
                        if(dataType){
                            dataType[providerProp]=$type;
                            self.registerType(name,dataType);
                        } else console.log('warning: container.mapType could not locate type: ' + name);
                    });
                }
            }
            if(length===3){
                if(typeof $type !=='string'){
                    type[providerProp]=$type;
                    this.registerType(name,type);
                }else{
                    $type=this.getType($type,false);
                    if($type){
                        type[providerProp]=$type;
                        this.registerType(name,type);
                    }else{
                        this.getTypeAsync($type,false,function(dataType){
                            if(dataType){
                                type[providerProp]=dataType;
                                self.registerType(name,type);
                            } else console.log('warning: container.mapType could not locate type: ' + $type);
                        });
                    }
                }
            }
        }

    }

}));
