@echo off
setlocal
cd /d "%~dp0"
title Miskatonic Archive - localhost:9000

python -c "import http.server" >nul 2>&1
if not errorlevel 1 goto run_python

py -3 -c "import http.server" >nul 2>&1
if not errorlevel 1 goto run_py

echo Python 3 was not found. Install Python 3 and try again.
pause
exit /b 1

:run_python
echo Site: http://localhost:9000/
echo Keep this window open. Press Ctrl+C to stop the server.
start "" "http://localhost:9000/"
python -m http.server 9000 --bind 127.0.0.1
goto finished

:run_py
echo Site: http://localhost:9000/
echo Keep this window open. Press Ctrl+C to stop the server.
start "" "http://localhost:9000/"
py -3 -m http.server 9000 --bind 127.0.0.1

:finished
pause
