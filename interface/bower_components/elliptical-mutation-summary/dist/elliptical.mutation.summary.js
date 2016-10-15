
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('jquery-mutation-summary'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery-mutation-summary'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.mutation=root.elliptical.mutation || {};
        root.elliptical.mutation.summary=factory(root);
        root.returnExports = root.elliptical.mutation.summary;
    }
}(this, function (g) {

    var ON_DOCUMENT_MUTATION='OnDocumentMutation';
    var ON_DOCUMENT_ADDED_MUTATION='OnDocumentAddedMutation';
    var ON_DOCUMENT_REMOVED_MUTATION='OnDocumentRemovedMutation';

    var $document=$(document);

    function documentMutation(summary){
        $document.trigger(ON_DOCUMENT_MUTATION,summary);
    }

    function documentAddedMutation(added){
        $document.trigger(ON_DOCUMENT_ADDED_MUTATION,{summary:added});
    }

    function documentRemovedMutation(removed){
        $document.trigger(ON_DOCUMENT_REMOVED_MUTATION,{summary:removed});
    }

    function onMutation(mutationSummary){
        documentMutation(mutationSummary);
        var summary=mutationSummary[0];
        if(summary.added)documentAddedMutation(summary.added);
        if(summary.removed)documentRemovedMutation(summary.removed);
    }

    return {
        _running:false,

        connect:function(){
            if(this._running) return;
            this._running=true;
            $(document).mutationSummary("connect", onMutation, [{ all: true }]);
        },

        disconnect:function(){
            this._running=false;
            $(document).mutationSummary('disconnect');
        }
    };


}));