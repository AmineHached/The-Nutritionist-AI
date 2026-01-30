#!/usr/bin/env python
"""
Simple SPA server: serves files from the provided directory, but returns index.html
for any path that doesn't map to an existing file. Usage:

python serve_index.py [port] [directory]

Defaults: port=4200 directory=.
"""
import http.server
import socketserver
import os
import sys
from urllib.parse import unquote, urlparse

class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Keep default translation but relative to self.directory
        # http.server.SimpleHTTPRequestHandler in py3.11 uses self.directory
        path = unquote(urlparse(path).path)
        # remove query and fragment
        if path.startswith('/'):
            path = path[1:]
        full = os.path.join(os.getcwd(), path)
        return full

    def do_GET(self):
        parsed_path = unquote(urlparse(self.path).path)
        # map to filesystem
        fs_path = os.path.join(os.getcwd(), parsed_path.lstrip('/'))
        if os.path.isdir(fs_path):
            # if directory, try to serve index.html inside it
            if os.path.exists(os.path.join(fs_path, 'index.html')):
                self.path = os.path.join(parsed_path, 'index.html')
                return http.server.SimpleHTTPRequestHandler.do_GET(self)
        if os.path.exists(fs_path) and os.path.isfile(fs_path):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        # fallback to root index.html
        self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)


def run(port=4200, directory='.'):
    os.chdir(directory)
    handler = SPARequestHandler
    with socketserver.TCPServer(("0.0.0.0", port), handler) as httpd:
        print(f"Serving SPA on 0.0.0.0:{port} from {os.getcwd()}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nShutting down')
            httpd.server_close()

if __name__ == '__main__':
    port = 4200
    directory = '.'
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except:
            pass
    if len(sys.argv) > 2:
        directory = sys.argv[2]
    run(port, directory)
