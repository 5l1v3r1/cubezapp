(function() {

  function GraphSlider() {
    this._$element = $('<div class="graph-settings-slider">' +
      '<div class="graph-settings-slider-background"></div>' +
      '<div class="graph-settings-slider-container">' +
      '<div class="graph-settings-slider-highlight flavor-background">' +
      '</div><div class="graph-settings-slider-knob"></div></div>');
    this._$highlight = this._$element.find('.graph-settings-slider-highlight');
    this._$knob = this._$element.find('.graph-settings-slider-knob');

    // This element is put in front of the entire page while the user drags the
    // slider so that no hover events can be triggered on the rest of the page.
    this._$shielding = $('<div></div>').css({
      position: 'fixed',
      width: '100%',
      height: '100%'
    });

    this._min = 0;
    this._max = 1;
    this._value = 0.5;

    this._registerMouseEvents();
    this._updateUI();
  }

  GraphSlider.prototype.getMax = function() {
    return this._max;
  };

  GraphSlider.prototype.getMin = function() {
    return this._min;
  };

  GraphSlider.prototype.getValue = function() {
    return this._value;
  };

  GraphSlider.prototype.setMax = function(max) {
    this._max = max;
    this.setValue(this._value);
  };

  GraphSlider.prototype.setMin = function(min) {
    this._min = min;
    this.setValue(this._value);
  };

  GraphSlider.prototype.setValue = function(val) {
    this._value = Math.max(Math.min(val, this._max), this._min);
    this._updateUI();
  };

  GraphSlider.prototype._registerMouseEvents = function() {
    var clicked = false;
    var update = this._updateForMouseEvent.bind(this);
    this._$element.mousedown(function(e) {
      $(document.body).append(this._$shielding);

      clicked = true;
      update(e);

      // NOTE: this line of code prevents the cursor from changing on drag in
      // Safari on OS X. It may have the same effect on other platforms as well.
      e.preventDefault();
    }.bind(this));
    $(document.body).mouseup(function() {
      clicked = false;
      this._$shielding.detach();
      this.emit('release');
    }.bind(this));
    $(document.body).mousemove(function(e) {
      if (clicked) {
        update(e);
      }
    });
  };

  GraphSlider.prototype._updateForMouseEvent = function(e) {
    var x = e.pageX - this._$element.offset().left;
    var startX = this._$knob.width() / 2;
    var endX = this._$element.width() - startX;

    var fraction = (x - startX) / (endX - startX);
    fraction = Math.max(Math.min(fraction, 1), 0);

    var oldValue = this.getValue();
    this.setValue(fraction*(this._max-this._min) + this._min);

    // NOTE: the user may not have actually changed the value if the mouse moved
    // along the y-axis but not the x-axis. This if-statement prevents
    // extraneous events.
    if (oldValue !== this.getValue()) {
      this.emit('change');
    }
  };

  GraphSlider.prototype._updateUI = function() {
    if (this._min >= this._max) {
      return;
    }
    var fraction = (this._value - this._min) / (this._max - this._min);
    var percent = (fraction * 100).toFixed(1) + '%';
    this._$knob.css({left: percent});
    this._$highlight.css({width: percent});
  };

  function DiscreteGraphSlider() {
    GraphSlider.call(this);
    this._allowedValues = [0, 0.5, 1];
  }

  DiscreteGraphSlider.prototype = Object.create(GraphSlider.prototype);

  DiscreteGraphSlider.prototype.getAllowedValues = function() {
    return this._allowedValues;
  };

  DiscreteGraphSlider.prototype.setAllowedValues = function(v) {
    this._allowedValues = v;
    this.setValue(this.getValue());
  };

  DiscreteGraphSlider.prototype.setValue = function(v) {
    var closestAllowed = this._allowedValues[0];
    var distance = Math.abs(closestAllowed - v);
    for (var i = 1, len = this._allowedValues.length; i < len; ++i) {
      var val = this._allowedValues[i];
      var dist = Math.abs(val - v);
      if (dist < distance) {
        distance = dist;
        closestAllowed = val;
      }
    }
    GraphSlider.prototype.setValue.call(this, closestAllowed);
  };

  function TranslatedGraphSlider(slider) {
    window.app.EventEmitter.call(this);
    this._slider = slider;
    this._sliderToExternal = function(x) {
      return x;
    }
    this._externalToSlider = function(x) {
      return x;
    };
    this.slider.on('change', this.emit.bind(this, 'change'));
    this.slider.on('release', this.emit.bind(this, 'release'));
  }

  TranslatedGraphSlider.prototype =
    Object.create(window.app.EventEmitter.prototype);

  TranslatedGraphSlider.prototype.getMax = function() {
    return this._sliderToExternal(this._slider.getMax());
  };

  TranslatedGraphSlider.prototype.getMin = function() {
    return this._sliderToExternal(this._slider.getMin());
  };

  TranslatedGraphSlider.prototype.getValue = function() {
    return this._sliderToExternal(this._slider.getValue());
  };

  TranslatedGraphSlider.prototype.setExternalToSlider = function(f) {
    this._externalToSlider = f;
  };

  TranslatedGraphSlider.prototype.setMax = function(max) {
    this._slider.setMax(this._externalToSlider(max));
  };

  TranslatedGraphSlider.prototype.setMin = function(min) {
    this._slider.setMin(this._externalToSlider(min));
  };

  TranslatedGraphSlider.prototype.setSliderToExternal = function(f) {
    this._sliderToExternal = f;
  };

  TranslatedGraphSlider.prototype.setValue = function(v) {
    this._slider.setValue(this._externalToSlider(v));
  };

  window.app.GraphSlider = GraphSlider;
  window.app.DiscreteGraphSlider = DiscreteGraphSlider;
  window.app.TranslatedGraphSlider = TranslatedGraphSlider;

})();
