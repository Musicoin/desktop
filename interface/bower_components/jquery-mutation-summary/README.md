# [jquery-mutation-summary](http://joelpurra.github.com/jquery-mutation-summary) javascript library
A jQuery wrapper/plugin for mutation-summary, the DOM mutation-observers wrapper. It adds easy, chainable `.mutationSummary()` calls to your jQuery objects.

> [Mutation Summary](http://code.google.com/p/mutation-summary/) is a JavaScript library that makes observing changes to the DOM fast, easy and safe.

The Mutation Summary library aggregates multiple DOM mutations to a neat changeset, optionally [filtered by CSS-style selectors](http://code.google.com/p/mutation-summary/wiki/APIReference#The_element_Query). Have a look at [this fun and informative 8 minute screen cast](http://code.google.com/p/mutation-summary/) by [Rafael Z Weinstein](http://code.google.com/u/rafaelw@chromium.org/), the creator of mutation-summary.


## Forked Version

This forked version adds a package.json file, index.js file, the google mutation-summary.js dependency and gulp build tasks for distribution via the node package manager(npm).

## Get it

To include dependencies, make sure to get the submodules too.

```
git clone --recursive git://github.com/joelpurra/jquery-mutation-summary.git
```

## Demos
* [`example/shuffle.html`](http://joelpurra.github.com/jquery-mutation-summary/example/shuffle.html): A copy of the original [shuffle.html example](http://mutation-summary.googlecode.com/git/examples/shuffle_compare/shuffle.html), but with this library as the default option. Shuffle.html is explained in [the mutation-summary screen cast](http://code.google.com/p/mutation-summary/).
* [`example/demo.html`](http://joelpurra.github.com/jquery-mutation-summary/example/demo.html): Listening to simple mutations in a list.

## Usage

See [mutation-summary API reference](http://code.google.com/p/mutation-summary/wiki/APIReference) for details on [`callback(summary[])`](http://code.google.com/p/mutation-summary/wiki/APIReference#Callback_parameters), [`queries`](http://code.google.com/p/mutation-summary/wiki/APIReference#Query_Types) and other options.

### Public methods

```javascript
// Connect mutation observation
$(selector).mutationSummary("connect", options);
$(selector).mutationSummary("connect", callback(summary[]) [, observeOwnChanges], queries);

// Diconnect all mutation observation
$(selector).mutationSummary("disconnect");

// To disconnect a previous "connect" call only, pass the same parameters
$(selector).mutationSummary("disconnect", options);
$(selector).mutationSummary("disconnect", callback(summary[]) [, observeOwnChanges], queries);
```

### Example

```javascript
// Use document to listen to all events on the page (you might want to be more specific)
var $observerSummaryRoot = $(document);

// Simplest callback, just logging to the console
function callback(summaries){
	console.log(summaries);
}

// Connect mutation-summary
$observerSummaryRoot.mutationSummary("connect", callback, [{ all: true }]);

// Do something to trigger mutationSummary
$("<a />", { href: "http://joelpurra.github.com/jquery-mutation-summary"}).text("Go to the jquery-mutation-summary website").appendTo("body");

// Disconnect when done listening
$observerSummaryRoot.mutationSummary("disconnect");
```

## Original purpose
Developed to get a jQuery chainable version of the mutation-summary library.

[DOM Mutation Observers](http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#mutation-observers) are useful for watching changes made to the DOM elements (including their attributes and contents) that are out of your control. These external changes may come from other jQuery plugins, non-jQuery scripts, legacy code or even flash objects that modifies the page around it. 
If you have previously used [DOM Mutation Events](http://code.google.com/p/mutation-summary/wiki/DOMMutationObservers), please note that they have been deprecated.

## Dependencies
jquery-mutation-summary's runtime dependencies are

* [mutation-summary](https://code.google.com/p/mutation-summary/)
* [jQuery](http://jquery.com/)

## Browser compatibility
Should be as compatible as mutation-summary is - see the wiki page on [browser support for Mutation Observers](http://code.google.com/p/mutation-summary/wiki/DOMMutationObservers#Browser_Availability). jQuery is assumed to be available in these environments.

## TODO
*Patches/pull requests welcome!*

* Write tests.
* Write example callback filters that act only on, for example, removed attributes or added elements.
* Add support for [namespaced/filtered events](http://docs.jquery.com/Namespaced_Events), for example `mutationSummary.element.added` or `mutationSummary.attribute.valueChanged`.

## License
Copyright (c) 2012, 2013, 2014, 2015, Joel Purra <http://joelpurra.com/>
All rights reserved.

When using jquery-mutation-summary, comply to at least one of the three available licenses: BSD, MIT, GPL.
Please see the LICENSE file for details.
