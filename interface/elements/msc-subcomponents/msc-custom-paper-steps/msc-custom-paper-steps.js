'use strict';
Polymer({
  is: 'msc-custom-paper-steps',
  properties: {
    animationConfig: {
      value: function() {
        return {
          'entry': {
            name: 'height-increase-animation',
            timing: {duration: 350},
          },
          'exit': {
            name: 'height-decrease-animation',
            timing: {duration: 350},
          },
        };
      }
    },
    /**
     * If true, the `paper-steps` element is animating, please wait until done.
     */
    _animating: {
      type: Boolean,
      value: false
    },
    /**
     * Computed css class based on `_vertical` property.
     */
    _cssClass: {
      type: String,
      computed: '__cssClass(_vertical)'
    },
    /**
     * Computed boolean property based on `_vertical`, used for convenience.
     */
    _horizontal: {
      type: Boolean,
      computed: '__horizontal(_vertical)'
    },
    /**
     * If true, the `paper-steps` element is doing a little setup , please
     * wait until done.
     */
    _initializing: {
      type: Boolean,
      value: true
    },
    /**
     * Used by `paper-toast` #messages to override the `background-color`.
     */
    _messageClass: String,
    /**
     * Index of the currently selected `paper-step` element.
     */
    _selected: {
      type: Number,
      notify: true,
      value: 0
    },
    /**
     * Reference to the array of `paper-step` elements.
     */
    _steps: {
      type: Array
    },
    /**
     * Computed property with the total number of items in `_steps`.
     */
    _total: {
      type: Number,
      computed: '__total(_steps)'
    },
    /**
     * Determines if the `paper-steps` element is displayed vertically or
     * horizontally.
     */
    _vertical: {
      type: Boolean,
      value: false,
    },
    /**
     * If true, all of the submit buttons which are automatically
     * added for each `paper-step` element will be hidden.
     */
    actionsDisabled: {
      type: Boolean,
      value: false
    },
    /**
     * If set, and is within the valid range of selectable `paper-step`
     * elements, `paper-steps` will use this value as the beginning step.
     * `paper-steps` will also setp all previous steps to `complete` if
     * the form inputs are valid.
     *
     * Useful for saving progress and returning to it later, then jumping
     * immediately to this initial step value (Note: Zero based index of
     * step).
     */
    initialStep: {
      type: Number
    },
    /**
     * If true, requires the steps to be completed in ascending numerical order.
     * If false, the steps may be completed out of order.
     */
    linear: {
      type: Boolean,
      value: false
    },
    /**
     * Determines how the `paper-steps` element is displayed.
     * true: always display in vertical mode
     * false: display in horizontal mode if the screen is wide enough,
     *        otherwise display in vertical mode
     */
    vertical: {
      type: Boolean,
      value: false
    }
  },
  listeners: {
    'iron-activate': '_onActivate',
    'iron-deselect': '_onDeselect',
    'iron-select': '_onSelect',
    'iron-resize': '_onIronResize',
    'neon-animation-finish': '_onNeonAnimationFinish',
    'paper-step-already-complete': '_onAlreadyComplete',
    'paper-step-next': '_onNext',
    'paper-step-complete': '_onComplete'
  },
  behaviors: [
    Polymer.IronResizableBehavior,
    Polymer.NeonAnimationRunnerBehavior,
  ],

  // Element Lifecycle
  ready: function() {},

  attached: function() {
    var
      el, ruler,
      that = this
    ;

    this.async(function() {
      ruler = that.create('iron-selector', {id: 'ruler'});
      that.$.selector.getEffectiveChildren().forEach(
        function(s, index) {
          if (s.nodeName.toLowerCase() == 'paper-step') {
            //exclude any template or other elements.
            el = ruler.create('paper-step', {
              label: s.label,
              optional: s.optional,
              step: s.step,
              steps: s.steps,
              completed: s.completed,
              editable: s.editable,
              duplicate: true
            });
            Polymer.dom(ruler).appendChild(el);
          }
        }, this
      );

      Polymer.dom(that.root).appendChild(ruler);
      ruler.setAttribute('class', 'horizontal ' + ruler.getAttribute('class'));
      that.notifyResize, 1
      //trigger an initial update
      that._updateVertical();
    }, 250);

    this.$.messages.fitInto = this;
    this.listen(this.$.closeMessage, 'tap', '_closeMessage');
  },

  detached: function() {},

  // Element Behavior
  /**
   *
   */
  __cssClass: function(_vertical) {
    return (_vertical) ? 'vertical' : 'horizontal';
  },
  /**
   *
   */
  __horizontal: function(_vertical) {
    return !_vertical;
  },
  /**
   *
   */
  __total: function(steps) {
    var
      i, items, steps = steps && steps.length || 1,
      that = this
    ;
    items = this.$.steps_content.items;
    if (steps && items.length === steps && this.actionsDisabled) {
      for (i=0; i < steps; i++) {
        items[i].actionsDisabled = true;
      }
    }

    // Set initial step if assigned and value < total
    // Set any previous valid steps as completed.
    this.debounce('paper-steps-initialize', function() {
      var
        item, form,
        initial = parseInt(that.initialStep)
      ;

      if (initial !== NaN && initial < that._total) {
        initial = Math.max(initial, 0);

        for (i=0; i<initial; i++) {
          item = items[i];
          try {
            form = item._getForm();
            if (form && form.validate()) {
              item.completed = true;
            }
          } catch (e) {
            console.log('paper-steps-initialize error', e, typeof(form));
          }
        }
        that.$.steps_content.selected = initial;
      }
      that._initializing = false;
      that.fire('paper-steps-ready', that);
    }, 250);

    return steps;
  },
  _closeMessage: function(e) {
    this.$.messages.hide();
  },
  /**
   *
   */
  _onActivate: function(e) {
    var
      item = e.detail && e.detail.item,
      selectable = item && item.selectable,
      selector = this.$.selector,
      items = selector && selector.items,
      previous = selector && item.step > 1 && items[item.step-2],
      stop = function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        return false;
      }
    ;

    //if item is not selectable or the step changing animation is currently
    //happening, disable click / touch event.
    if (selectable !== true || this._animating) {
      return stop(e);

    } else if (this.linear) {
      //if linear, not first and previous item must be completed before advancing
      if (previous && previous.completed !== true) {
        return stop(e);
      }
    }
  },
  _onAlreadyComplete: function(e) {
    this.showMessage('Please enter some changes before re-submitting this step.', 'info');
  },
  /**
   *
   */
  _onComplete: function(e) {
    try {
      this.$.selector.items[parseInt(e.detail) - 1].completed = true;
    } catch (e) {
      if (e instanceof TypeError) {
        console.log('TypeError on paper-step-completed', e);
      }
    }
  },
  /**
   *
   */
  _onDeselect: function(e) {
    e.detail.item._selected = false;

    if (!this._initializing && !e.detail.item.duplicate) {
      var step_content = e.detail.item.$.step_content;
      step_content.classList.add('animating');
      this.animationConfig.exit.node = step_content;
      this._animating = true;
      this.playAnimation('exit');
    }
  },
  /**
   *
   */
  _onNeonAnimationFinish: function(e) {
    if (this.animationConfig.exit.node.classList.contains('animating')) {
      this.animationConfig.exit.node.classList.remove('animating');
      this.animationConfig.entry.node.style.height = null;
      this.animationConfig.entry.node.classList.remove('animating-soon');
      this.animationConfig.entry.node.classList.add('animating');
      this.playAnimation('entry');
    }
    else {
      this.animationConfig.entry.node.classList.remove('animating');
      this._animating = false;
    }
  },
  /**
   *
   */
  _onNext: function(e) {
    if (this._initializing != true) {
      this.$.steps_content.selectNext();
    }
  },
  /**
   *
   */
  _onSelect: function(e) {
    e.detail.item._selected = true;

    if (!this._initializing && !e.detail.item.duplicate) {
      var step_content = e.detail.item.$.step_content;
      step_content.classList.add('animating-soon');
      step_content.style.height = '0px';
      this.animationConfig.entry.node = step_content;
    }
  },
  /**
   *
   */
  _onIronResize: function() {
    this._updateVertical();
  },
  /**
   *
   */
  _updateVertical: function() {
    if (this.vertical) {
      this._vertical = true;
    }
    else {
      //catch first few calls, iron-resize gets called initially
      //before ruler is ready.
      var ruler = this.querySelector('#ruler');
      if (ruler) {
        this._vertical = ruler.scrollWidth > ruler.offsetWidth;
      }
    }
  },
  /**
   * Display a message using `paper-toast`.
   *
   * - `message` (String): The message you want to display to user.
   * - `type` (String): Changes css class on `paper-toast` element. Accepted values: `error`, `success`, `warning`. Default: `error`.
   * - `ms` (Number): Is passed as `duration` to `paper-toast`.
   */
  showMessage: function(message, type, ms) {
    var
      ms = typeof ms == 'number' && ms || 3000,
      message = message && String(message) || '',
      $messages = this.$.messages
    ;

    if (!Boolean(message)) {
      return; //do nothing if message is blank
    }

    this._messageClass = (
      typeof type == 'string'
      && ['error', 'info', 'success', 'warning'].indexOf(type) >= 0
      && type || 'error'
    );

    //toast backwards compatibility for method `show()` without optional arguments
    $messages.text = message;
    $messages.duration = ms;
    $messages.show({text: message, duration: ms});
  },
});
