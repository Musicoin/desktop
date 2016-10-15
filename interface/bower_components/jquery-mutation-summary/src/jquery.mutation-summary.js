/*!
 * @license jquery-mutation-summary
 * Copyright © 2012, 2013, 2014, Joel Purra <http://joelpurra.com/>
 * Released under MIT, BSD and GPL license. Comply with at least one.
 *
 * A jQuery wrapper/plugin for mutation-summary, the DOM mutation-observers wrapper.
 * http://joelpurra.github.com/jquery-mutation-summary
 * 
 * "Mutation Summary is a JavaScript library that makes observing changes to the DOM fast, easy and safe."
 * http://code.google.com/p/mutation-summary/
 */

/*jslint white: true, browser: true*/
/*global jQuery, MutationSummary*/

(function($, global) {
    "use strict"; // jshint ;_;
    var tag = "JqueryMutationSummary",
        eventNamespace = "." + tag,
        JqueryMutationSummary = function(element, options) {
            this.$element = $(element);
            this.options = $.extend(true, {}, this.internalDefaults, $.fn.mutationSummary.defaults, options);
        },
        JqueryMutationSummaryInner = function($element, configuration) {
            this.$element = $element;
            this.configuration = configuration;
        },
        privateFunctions = {};

    $.extend(true, privateFunctions, {
        getConfiguration: function(callback, observeOwnChanges, queries) {
            var configuration;

            if ($.isFunction(callback)) {
                if ($.isArray(observeOwnChanges)) {
                    queries = observeOwnChanges;
                    observeOwnChanges = false;
                }

                configuration = {
                    callback: callback,
                    observeOwnChanges: observeOwnChanges === true,
                    queries: queries || []
                };
            } else {
                configuration = callback;
            }

            return configuration;
        }
    });

    JqueryMutationSummary.prototype = {

        constructor: JqueryMutationSummary

        ,
        internalDefaults: {
            mutationSummaries: []
        }

        ,
        connect: function(callback, observeOwnChanges, queries) {
            var configuration = privateFunctions.getConfiguration(callback, observeOwnChanges, queries);

            var inner = new JqueryMutationSummaryInner(this.$element, configuration);

            this.options.mutationSummaries.push(inner);

            inner.start();
        }

        ,
        disconnect: function(callback, observeOwnChanges, queries) {
            // Pass as reference to inner function
            var summaries = this.options.mutationSummaries;

            // If any parameters were passed, only disconnect any matching summaries
            $.each(summaries, function(index) {
                // Take care of deleted summaries
                if (this === undefined) {
                    return;
                }

                if (this.configurationMatches(callback, observeOwnChanges, queries)) {
                    this.stop();

                    delete summaries[index];
                }
            });
        }
    };

    JqueryMutationSummaryInner.prototype = {
        constructor: JqueryMutationSummaryInner

        ,
        getCallbackWrapper: function() {
            function callbackWrapper(summaries) {
                // Pass extra info in the callback, since it's so wrapped
                summaries.observer = this.observer;
                summaries.configuration = $.extend(true, {}, this.configuration);

                this.originalCallback(summaries);
            };

            return $.proxy(callbackWrapper, this);
        }

        ,
        configurationMatches: function(callback, observeOwnChanges, queries) {
            var matchWith = privateFunctions.getConfiguration(callback, observeOwnChanges, queries),
                isMatch = true;

            isMatch = isMatch && (callback === undefined || this.configuration.callback === matchWith.callback);
            isMatch = isMatch && (observeOwnChanges === undefined || this.configuration.observeOwnChanges === matchWith.observeOwnChanges);
            isMatch = isMatch && (queries === undefined || this.configuration.queries === matchWith.queries);

            return isMatch;
        }

        ,
        start: function() {
            var rawElement = this.$element.get(0);

            this.originalCallback = this.configuration.callback;
            this.wrappedCallback = this.getCallbackWrapper();
            this.wrappedConfiguration = $.extend(true, {}, this.configuration);

            if (this.$element.length === 1) {
                // mutation-summary fails if passing global
                if (rawElement !== global) {
                    this.wrappedConfiguration.rootNode = rawElement;
                }
            }

            this.wrappedConfiguration.callback = this.wrappedCallback;

            this.observer = new MutationSummary(this.wrappedConfiguration);
        }

        ,
        stop: function() {
            // Any changes from the last callback will be passed here
            // http://code.google.com/p/mutation-summary/wiki/APIReference#Methods
            var finalSummary = this.observer.disconnect();

            if (finalSummary !== undefined) {
                this.wrappedCallback(finalSummary);
            }

            delete this.observer;
        }
    };

    // Add jQuery method
    // $("#element").mutationSummary();
    // $("#element").mutationSummary("method", arguments);
    $.fn.extend({
        mutationSummary: function(option) {
            var callArguments = arguments;

            return this.each(function() {
                var $this = $(this),
                    data = $this.data(tag),
                    options = typeof option === "object" && option;

                // Store javascript object as element data
                if (!data) {
                    $this.data(tag, (data = new JqueryMutationSummary(this, options)));
                }

                // Pass arguments to methods
                if (typeof option === "string") {
                    data[option].apply(data, Array.prototype.slice.call(callArguments, 1));
                }
            });
        }
    });

    $.fn.mutationSummary.defaults = {};

    $.fn.mutationSummary.Constructor = JqueryMutationSummary;
}(jQuery, this));