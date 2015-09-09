(function() {

  var requestAnimationFrame = window.requestAnimationFrame || function(cb) {
    return setTimeout(function() {
      cb(new Date().getTime());
    }, 1000/60);
  };

  var cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;

  function TimesListLoader() {
    this._$element = $('<div class="times-list-loader"></div>').css({
      display: 'none'
    });
    this._$reloadButton = $(RELOAD_BUTTON_SVG).addClass('times-list-reload');
    this._$spinner = $(SPINNER_SVG).addClass('times-list-spinner')
    this._$element.append(this._$reloadButton, this._$spinner);

    this._startTime = null;
    this._state = TimesListLoader.STATE_HIDDEN;
    this._frameRequest = null;
  }

  TimesListLoader.STATE_HIDDEN = 0;
  TimesListLoader.STATE_LOADING = 1;
  TimesListLoader.STATE_FAILED = 2;

  TimesListLoader.prototype.element = function() {
    return this._$element;
  };

  TimesListLoader.prototype.switchState = function(newState) {
    if (newState === this._state) {
      return;
    }

    if (this._frameRequest !== null) {
      cancelAnimationFrame(this._frameRequest);
      this._frameRequest = null;
    }

    switch (newState) {
    case TimesListLoader.STATE_HIDDEN:
      this._$element.css({display: 'none'});
      break;
    case TimesListLoader.STATE_LOADING:
      this._$element.css({display: 'block'});
      this._$reloadButton.css({display: 'none'});
      this._$spinner.css({display: 'block'});
      this._startSpinning();
      break;
    case TimesListLoader.STATE_FAILED:
      this._$element.css({display: 'block'});
      this._$reloadButton.css({display: 'block'});
      this._$spinner.css({display: 'none'});
      break;
    }
  };

  TimesListLoader.prototype._animationFrame = function(time) {
    if (this._startTime === null) {
      this._startTime = time;
      return;
    }
    var angle = (time - this._startTime) / 3;
    this._setSpinnerAngle(angle % 360);
    this._frameRequest = requestAnimationFrame(this._animateFrame.bind(this));
  };

  TimesListLoader.prototype._setSpinnerAngle = function(angle) {
    var transform = 'rotate(' + angle.toFixed(2) + 'deg)';
    this._$spinner.css({
      transform: transform,
      webkitTransform: transform,
      MozTransform: transform,
      msTransform: transform
    });
  };

  TimesListLoader.prototype._startSpinning = function() {
    this._setSpinnerAngle(0);
    this._frameRequest = requestAnimationFrame(this._animationFrame.bind(this));
  };

  var RELOAD_BUTTON_SVG = '<svg viewBox="12 12 26 26" version="1.1" ' +
    'class="flavor-text">' +
    '<path d="M33.660254038,30 a10,10 0 1 1 0,-10'
    'm-7.372666366,0 l7.372666366,0 l0,-7.372666366" ' +
    'stroke="currentColor" fill="none" stroke-width="2" />' +
    '</svg>';

  var SPINNER_SVG = '<svg viewBox="0 0 1 1" class="flavor-text">' +
    '<g fill="currentColor"><rect fill="inherit" x="0.000000" y="0.000000" ' +
    'width="0.306931" height="0.306931" /><rect fill="inherit" x="0.000000" ' +
    'y="0.346535" width="0.306931" height="0.306931" /><rect fill="inherit" ' +
    'x="0.000000" y="0.693069" width="0.306931" height="0.306931" />' +
    '<rect fill="inherit" x="0.346535" y="0.000000" width="0.306931" ' +
    'height="0.306931" /><rect fill="inherit" x="0.346535" y="0.346535" ' +
    'width="0.306931" height="0.306931" /><rect fill="inherit" x="0.346535" ' +
    'y="0.693069" width="0.306931" height="0.306931" /><rect fill="inherit" ' +
    'x="0.693069" y="0.000000" width="0.306931" height="0.306931" />' +
    '<rect fill="inherit" x="0.693069" y="0.346535" width="0.306931" ' +
    'height="0.306931" /><rect fill="inherit" x="0.693069" y="0.693069" ' +
    'width="0.306931" height="0.306931" /></g></svg>';

  window.TimesListLoader = TimesListLoader;

})();
