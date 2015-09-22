(function() {

  var CONNECTED_CELL_CLASS = 'puzzle-matcher-connected-cell';

  function PuzzleMatcher() {
    this._importingNames = [];
    this._existingNames = [];
    this._connections = [];

    window.addEventListener('load', function() {
      this._element = document.getElementById('puzzle-matcher');
      this._importingPuzzles = document.getElementById('importing-puzzles');
      this._existingPuzzles = document.getElementById('existing-puzzles');
    }.bind(this));
  }

  PuzzleMatcher.prototype.showMatcher = function(importingNames, existingNames) {
    this._importingNames = importingNames;
    this._existingNames = existingNames;

    this._element.className = 'showing';

    this._connections = [];
    this._importingPuzzles.innerHTML = '';
    this._existingPuzzles.innerHTML = '';

    for (var i = 0, len = importingNames.length; i < len; ++i) {
      var name = importingNames[i];
      this._importingPuzzles.appendChild(this._generateCell(name, true));
    }
    for (var i = 0, len = existingNames.length; i < len; ++i) {
      var name = existingNames[i];
      this._existingPuzzles.appendChild(this._generateCell(name, false));
    }

    this._makeDefaultConnections();
  }

  PuzzleMatcher.prototype._generateCell = function(name, importing) {
    var kindLabel = (importing ? 'importing' : 'existing');

    var element = document.createElement('div');
    element.className = 'puzzle-matcher-cell';

    var linker = document.createElement('div');
    linker.className = 'puzzle-matcher-cell-linker puzzle-matcher-' + kindLabel + '-cell-linker';
    element.appendChild(linker);

    var index;
    if (importing) {
      index = this._importingNames.indexOf(name);
    } else {
      index = this._existingNames.indexOf(name);
    }
    linker.addEventListener('click', this._linkClicked.bind(this, index, importing));

    var label = document.createElement('label');
    label.className = 'puzzle-matcher-cell-label puzzle-matcher-' + kindLabel + '-cell-label';
    label.innerText = name;
    element.appendChild(label);

    return element;
  };

  PuzzleMatcher.prototype._linkClicked = function(index, importing) {
    var container = (importing ? this._importingPuzzles : this._existingPuzzles);
    var cell = container.childNodes[index];
    
    if (hasClass(cell, CONNECTED_CELL_CLASS)) {
      this._removeConnectionForIndex(index, importing);
      return;
    }
  };

  PuzzleMatcher.prototype._makeConnection = function(startIndex, endIndex) {
    var puzzle1 = this._importingPuzzles.childNodes[startIndex];
    var puzzle2 = this._existingPuzzles.childNodes[endIndex];

    var linker1 = puzzle1.getElementsByClassName('puzzle-matcher-cell-linker')[0];
    var linker2 = puzzle2.getElementsByClassName('puzzle-matcher-cell-linker')[0];

    var line = window.lineDrawer.createLine(linker1, linker2);
    this._connections.push(new Connection(startIndex, endIndex, line));

    addClass(puzzle1, CONNECTED_CELL_CLASS);
    addClass(puzzle2, CONNECTED_CELL_CLASS);
  };

  PuzzleMatcher.prototype._makeDefaultConnections = function() {
    for (var i = 0, len = this._importingNames.length; i < len; ++i) {
      var name = this._importingNames[i];
      var index = this._existingNames.indexOf(name);
      if (index >= 0) {
        this._makeConnection(i, index);
      }
    }
  };

  PuzzleMatcher.prototype._removeConnection = function(connection) {
    var index = this._connections.indexOf(connection);
    if (index < 0) {
      throw new Error('no such connection');
    }
    this._connections.splice(index, 1);
    window.lineDrawer.deleteLine(connection.line);
    removeClass(this._importingPuzzles.childNodes[connection.startIndex],
      CONNECTED_CELL_CLASS);
    removeClass(this._existingPuzzles.childNodes[connection.endIndex],
      CONNECTED_CELL_CLASS);
  };
  
  PuzzleMatcher.prototype._removeConnectionForIndex = function(index, importing) {
    for (var i = 0, len = this._connections.length; i < len; ++i) {
      var connection = this._connections[i];
      if ((importing && connection.startIndex === index) ||
          (!importing && connection.endIndex === index)) {
        this._removeConnection(connection);
        break;
      }
    }
  };

  function Connection(startIndex, endIndex, line) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.line = line;
  }

  function addClass(element, className) {
    if (!hasClass(element, className)) {
      element.className += ' ' + className;
    }
  }

  function removeClass(element, className) {
    var names = element.className.split(' ');
    var index = names.indexOf(className);
    if (index >= 0) {
      names.splice(index, 1);
      element.className = names.join(' ');
    }
  }

  function hasClass(element, name) {
    return element.className.split(' ').indexOf(name) >= 0;
  }

  window.puzzleMatcher = new PuzzleMatcher();

})();
