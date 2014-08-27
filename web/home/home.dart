library home_page;

import 'dart:html';
import 'dart:math';
import 'dart:async';
import '../pentagons/pentagons.dart';
import 'package:crystal/crystal.dart';

part 'lib/animations/animator.dart';
part 'lib/animations/view.dart';
part 'lib/animations/footer_slideup.dart';
part 'lib/animations/fade_animation.dart';
part 'lib/animations/inward_animation.dart';

part 'lib/theme.dart';
part 'lib/header.dart';
part 'lib/footer.dart';
part 'lib/burger.dart';
part 'lib/volume_button.dart';
part 'lib/application.dart';
part 'lib/lsdialog.dart';

Application app;

void main() {
  Theme th = new Theme([0x34, 0x98, 0xd8]);
  th.activate();
  
  app = new Application();
}
