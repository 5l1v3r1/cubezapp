import 'dart:io';
import 'dart:async';

import 'package:static/static.dart';
import 'netstack/netstack.dart';

void main() {
  // create static file server
  PathAliasTable aliases = new PathAliasTable();
  aliases.add('/login', '/login.html');
  aliases.add('/', '/login.html');
  aliases.add('', '/login.html');
  aliases.add('/home/', '/home/home.html');
  ProjectStatic fileServer = new ProjectStatic('../', '../web',
      aliases: aliases);
  
  // create request handler stack
  NetStack stack = new NetStack();
  stack.post('', handleLogin);
  stack.post('/', handleLogin);
  stack.post('/login', handleLogin);
  stack.post('/login.html', handleLogin);
  stack.redirect('/home', Uri.parse('/home/'));
  
  // add raw file server
  stack.next((_, HttpRequest req) {
    if (req.method != 'GET') {
      return new Future<bool>(() => true);
    }
    return fileServer.serveFile(req).then((_) => false);
  });
  
  // create HTTP server
  HttpServer.bind('127.0.0.1', 1337).then((HttpServer server) {
    server.listen((HttpRequest req) {
      stack.handleRequest(req).catchError((e) {
        writeError(req.response, 500, e.toString());
      });
    });
  });
}

Future handleLogin(_, HttpRequest req) {
  return req.response.redirect(Uri.parse('/home/'));
}

void writeError(HttpResponse response, int code, String err) {
  response.statusCode = 500;
  response.headers.contentType = new ContentType('text', 'plain',
      charset: 'utf-8');
  response.writeln(err);
  response.close();
}