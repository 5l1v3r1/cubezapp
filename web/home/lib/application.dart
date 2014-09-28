part of home_page;

class Application {
  PentagonsView pentagons;
  Header header;
  final Footer footer;
  final LSDialog dialog;
  final VolumeButton addButton;
  final VolumeButton minusButton;
  final PuzzlesView puzzles;
  Theme theme;
  
  bool switchedPage = false;
  bool get isLoginPage => window.location.hash == '#login';
  Future switchFuture = new Future(() => null);
  
  Application()
      : footer = new Footer(querySelector('.page-footer')),
        dialog = new LSDialog(querySelector('.login-signup')),
        addButton = new VolumeButton(querySelector('.plus-button'), 26, true),
        minusButton = new VolumeButton(querySelector('.minus-button'), 26,
            false),
        puzzles = new PuzzlesView(querySelector('.puzzles-dropdown')) {
    header = new Header(this, querySelector('.page-header'));
    Animatable pentFade = new Animatable(querySelector('#pentagons'),
        pentagonsPresentation);
    
    new Future.delayed(new Duration(milliseconds: 150)).then((_) {
      pentFade.run(true, duration: 0.7);
    });
    
    _setupPentagons();
    _setupAddDelButtons();
    
    header.rightDropdown.onClick.listen((_) {
      switchedPage = true;
      window.history.pushState('login', 'Cubezapp - Login', '#login');
      switchPage();
    });
    window.onPopState.listen((_) {
      switchPage();
    });
    
    window.onResize.listen((_) {
      puzzles.handleResize();
    });
    
    if (!isLoginPage) {
      header.run(true, duration: 0.7);
      footer.run(true, duration: 0.7);
      dialog.run(false);
    } else {
      dialog.reset();
      dialog.run(true, duration: 0.7);
      header.run(false);
      footer.run(false);
    }
  }
  
  void _setupPentagons() {
    DpiMonitor monitor = new DpiMonitor();
    CanvasElement canvas = querySelector('#pentagons');
    pentagons = new PentagonsView(canvas, 18);
    
    void resizePentagons(_) {
      canvas.width = (window.innerWidth * monitor.pixelRatio).round();
      canvas.height = (window.innerHeight * monitor.pixelRatio).round();
      pentagons.updateContext();
      pentagons.draw();
    };
    
    window.onResize.listen(resizePentagons);
    monitor.onChange.listen(resizePentagons);
    resizePentagons(null);
    new Timer.periodic(new Duration(milliseconds: 35), (_) {
      pentagons.draw();
    });
  }
  
  void _setupAddDelButtons() {
    addButton.canvas..onMouseEnter.listen((_) {
      addButton.focused = true;
    })..onMouseLeave.listen((_) {
      addButton.focused = false;
    });
    minusButton.canvas..onMouseEnter.listen((_) {
      minusButton.focused = true;
    })..onMouseLeave.listen((_) {
      minusButton.focused = false;
    });
  }
  
  void switchPage() {
    if (!switchedPage) return; // deal with Safari
    bool showLogin = isLoginPage;
    switchFuture = switchFuture.then((_) {
      String easing = 'ease-out';
      if (showLogin) {
        dialog.reset();
        return Future.wait([
            dialog.run(true, duration: 0.7, delay: 0.45,
                       timingFunction: easing),
            header.run(false, duration: 0.7, timingFunction: easing),
            footer.run(false, duration: 0.7, timingFunction: easing)
        ]);
      } else {
        return Future.wait([
            dialog.run(false, duration: 0.7, timingFunction: easing),
            header.run(true, duration: 0.7, delay: 0.45,
                       timingFunction: easing),
            footer.run(true, duration: 0.7, delay: 0.45,
                       timingFunction: easing)
        ]);
      }
    });
  }
}
