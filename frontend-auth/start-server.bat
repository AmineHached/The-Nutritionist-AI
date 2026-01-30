@echo off
cd /d "%~dp0"
echo Starting auth server on http://127.0.0.1:4200...
echo Press Ctrl+C to stop
python -m http.server 4200
pause
