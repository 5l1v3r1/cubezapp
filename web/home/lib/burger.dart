part of home_page;

class Burger extends ScalableCanvas {
  CanvasRenderingContext2D context;
  
  final StreamController _controller;
  StreamSubscription _clickSub;
    
  double _start;
  double _end;
  Timer _timer = null;
  DateTime _animStart;
  
  double _progress;
  bool _closed;
  
  final int size;
  
  Stream<MouseEvent> get onChange => _controller.stream;
  
  Burger(CanvasElement canvas, int size, bool isClosed) :
      super(canvas, size, size), size = size,
      _controller = new StreamController.broadcast() {
    _closed = isClosed;
    _progress = isClosed ? 0.0 : 1.0;
    context = canvas.getContext('2d');
    draw();
    
    _clickSub = canvas.onClick.listen(_clickHandler);
  }
  
  void destroy() {
    _clickSub.cancel();
  }
  
  bool get closed => _closed;
  
  void set closed(bool flag) {
    _start = _progress;
    _end = flag ? 0.0 : 1.0;
    _closed = flag;
    
    _animStart = new DateTime.now();
    if (_timer == null) {
      _timer = new Timer.periodic(new Duration(milliseconds: 10), _timerTick);
    }
  }
  
  void draw() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    num inset = 7 * pixelRatio;
    
    context.lineWidth = 3 * pixelRatio;
    context.lineCap = 'round';
    context.strokeStyle = 'rgb(137, 137, 137)';
    
    context.beginPath();
    
    num xProg = pow(_progress.abs(), 1.5);
    
    // top burger line
    context.moveTo(inset + (canvasWidth - inset * 2) * _progress, inset);
    context.lineTo(canvasWidth - inset - (canvasWidth - inset * 2) * xProg,
        inset + (canvasHeight - inset * 2) * _progress);
    
    // bottom burger line
    context.moveTo(inset + (canvasWidth - inset * 2) * _progress, canvasHeight -
        inset);
    context.lineTo(canvasWidth - inset - (canvasWidth - inset * 2) * xProg,
    canvasHeight - inset - (canvasHeight - inset * 2) * _progress);
    
    context.stroke();
    
    if (_progress < 0.5) {
      context.strokeStyle = 'rgba(137, 137, 137, ${1.0 - _progress * 2})';
      context.beginPath();
      context.moveTo(inset, canvasHeight / 2);
      context.lineTo(canvasWidth - inset, canvasHeight / 2);
      context.stroke();
    }
  }
  
  _timerTick(_) {
    double secs = new DateTime.now().difference(_animStart).inMilliseconds /
        1000;
    double scalar = secs * 3;
    if (scalar >= 1.0) {
      scalar = 1.0;
      _timer.cancel();
      _timer = null;
    }
    
    _progress = _start + (_end - _start) * scalar;
    draw();
  }
  
  void _clickHandler(MouseEvent evt) {
    closed = !closed;
    _controller.add(evt);
  }
}