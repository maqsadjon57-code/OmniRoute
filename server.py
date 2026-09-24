import http.server
import socketserver
import os
import sys

PORT = 5173
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'site')

class CS2RequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            index_path = os.path.join(DIRECTORY, 'index.html')
            if os.path.exists(index_path) and not os.path.exists(path):
                self.path = '/index.html'
        return super().do_GET()

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    print(f"CS2 Server listening on 0.0.0.0:{PORT}", flush=True)
    with ThreadingHTTPServer(('0.0.0.0', PORT), CS2RequestHandler) as httpd:
        httpd.serve_forever()
