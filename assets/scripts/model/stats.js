// NOTE TO READER:
// According to the cubing community, the "average" and the "mean" are different
// things. The "mean" is the arithmetic mean, while the average removes the best
// and worst times before computing the mean.
(function() {

  // FILTER_DNF_CUTOFF is the first average size for which DNFs should be
  // completely ignored.
  var FILTER_DNF_CUTOFF = 50;

  var NUM_REMOVE = [0, 1, 1, 3, 5, 50];
  var SIZES = [3, 5, 12, 50, 100, 1000];
  var NAMES = ['mo3', '5', '12', '50', '100', '1000'];

  function OfflineAverages() {
    this._computers = [];
    this._best = [];
    this._lastWasPB = [];

    this._count = 0;
    this._nonDNF = 0;
    this._timeSum = 0;
    this._bestSolve = null;
    this._bestTime = NaN;

    for (var i = 0, len = SIZES.length; i < len; ++i) {
      var size = SIZES[i];
      this._computers[i] = new AverageComputer(size, NUM_REMOVE[i],
        size >= FILTER_DNF_CUTOFF);
      this._best[i] = null;
      this._lastWasPB[i] = false;
    }
  }

  OfflineAverages.prototype.pushSolve = function(solve) {
    ++this._count;
    if (!solve.dnf) {
      ++this._nonDNF;
      var time = window.app.solveTime(solve);
      this._timeSum += time;
      if (this._bestSolve === null || this._bestTime > time) {
        this._bestSolve = solve;
        this._bestTime = time;
      }
    }
    for (var i = 0, len = this._computers.length; i < len; ++i) {
      this._computers[i].pushSolve(solve);
      this._checkBest(i);
    }
  };

  OfflineAverages.prototype.stats = function() {
    var averages = [];
    for (var i = 0, len = this._computers.length; i < len; ++i) {
      var computer = this._computers[i];
      var best = this._best[i];
      averages.push({
        name: NAMES[i],
        last: computer.averageInfo(),
        best: (best === null ? null : best.averageInfo()),
        lastWasPB: this._lastWasPB[i]
      });
    }
    return {
      count: this._count,
      nonDNF: this._nonDNF,
      mean: this._timeSum / this._nonDNF,
      best: this._bestSolve,
      averages: averages
    };
  };

  OfflineAverages.prototype._checkBest = function(computerIdx) {
    var computer = this._computers[computerIdx];
    var average = computer.average();
    if (isNaN(average)) {
      return;
    }
    var best = this._best[computerIdx];
    if (best === null || averageBeatsAverage(average, best.average())) {
      this._best[computerIdx] = computer.copy();
      this._lastWasPB[computerIdx] = true;
    } else {
      this._lastWasPB[computerIdx] = false;
    }
  };

  function AverageComputer(size, numRemove, filter) {
    this._size = size;
    this._numRemove = numRemove;
    this._filter = filter;
    this._center = new window.averagejs.CenterAverage(size, numRemove);
    this._solves = new LinkedList();
  }

  AverageComputer.prototype.average = function() {
    return this._center.average();
  };

  AverageComputer.prototype.averageInfo = function() {
    var average = this.average();
    if (isNaN(average)) {
      return null;
    }
    return {
      beat: this.timeToBeat(),
      solves: this.solveExcludeValues(),
      stdDev: this.standardDeviation(),
      time: average
    };
  };

  AverageComputer.prototype.copy = function() {
    var res = Object.create(AverageComputer.prototype);
    res._size = this._size;
    res._numRemove = this._numRemove;
    res._filter = this._filter;
    res._center = this._center.copy();
    res._solves = this._solves.copy();
    return res;
  };

  AverageComputer.prototype.pushSolve = function(solve) {
    if (this._filter && solve.dnf) {
      return;
    }
    var time = solve.dnf ? Infinity : window.app.solveTime(solve);
    this._center.pushValue(time);
    this._solves.push(solve);
    if (this._solves.count() > this._size) {
      this._solves.shift();
    }
  };

  AverageComputer.prototype.solveExcludeValues = function() {
    if (this._solves.count() < this._size) {
      return null;
    }

    var list = [];
    this._solves.forEach(function(i, solve) {
      list[i] = {exclude: false, solve: solve};
    });

    list.sort(function(a, b) {
      if (a.solve.dnf) {
        return 1;
      } else if (b.solve.dnf) {
        return -1;
      }
      return window.app.solveTime(a.solve) - window.app.solveTime(b.solve);
    });

    for (var i = 0; i < this._numRemove; ++i) {
      list[i].exclude = true;
      list[list.length - (i + 1)].exclude = true;
    }
    return list;
  };

  AverageComputer.prototype.standardDeviation = function() {
    return this._center.standardDeviation();
  };

  AverageComputer.prototype.timeToBeat = function() {
    var beat = this.average() - 1;
    var time = this._center.valueNeededForAverage(beat);
    if (isNaN(time) || time < 0) {
      return NaN;
    } else {
      return Math.floor(time);
    }
  };

  function LinkedList() {
    this._count = 0;
    this._first = null;
    this._last = null;
  }

  LinkedList.prototype.copy = function() {
    var res = new LinkedList();
    var node = this._first;
    while (node !== null) {
      res.push(node.object);
      node = node.next;
    }
    return res;
  };

  LinkedList.prototype.count = function() {
    return this._count;
  };

  LinkedList.prototype.forEach = function(f) {
    var node = this._first;
    var i = 0;
    while (node !== null) {
      f(i++, node.object);
      node = node.next;
    }
  };

  LinkedList.prototype.push = function(x) {
    ++this._count;
    var node = {object: x, next: null, last: this._last};
    if (this._last === null) {
      this._first = node;
      this._last = node;
    } else {
      this._last.next = node;
      this._last = node;
    }
  };

  LinkedList.prototype.shift = function() {
    if (this._last === null) {
      return null;
    }
    --this._count;
    var res = this._last.object;
    this._last = this._last.last;
    if (this._last === null) {
      this._first = null;
    } else {
      this._last.next = null;
    }
    return res;
  };

  function averageBeatsAverage(newAverage, oldAverage) {
    return Math.floor(newAverage / 10) < Math.floor(oldAverage / 10);
  }

  window.app.OfflineAverages = OfflineAverages;

})();
