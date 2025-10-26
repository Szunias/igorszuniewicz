import http.server
import socketserver
import os
import sys
from functools import partial

PORT = 8000

class RootFallbackHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Map clean routes to actual files
        path = self.path.split('?', 1)[0]
        if path in ('/', '/index', '/index/'):
            self.path = '/index.html'
        elif path in ('/about', '/about/'):
            self.path = '/about.html'
        return super().do_GET()

if __name__ == '__main__':
    web_root = os.getcwd()
    if sys.version_info >= (3, 7):
        handler_factory = partial(RootFallbackHandler, directory=web_root)
    else:
        os.chdir(web_root)
        handler_factory = RootFallbackHandler
    with socketserver.TCPServer(("", PORT), handler_factory) as httpd:
        print(f"Serving {web_root} at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            httpd.server_close()
