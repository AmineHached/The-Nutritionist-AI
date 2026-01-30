#!/usr/bin/env python3
import http.server
import socketserver
import sys
import os
import signal

PORT = 3001
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class QuietHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), format%args))

signal.signal(signal.SIGINT, lambda sig, frame: (print('\nServer stopped'), sys.exit(0)))

try:
    with socketserver.TCPServer(("", PORT), QuietHTTPRequestHandler) as httpd:
        print(f"Server running on http://localhost:{PORT}")
        httpd.serve_forever()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
