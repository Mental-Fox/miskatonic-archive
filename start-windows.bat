@echo off
setlocal
cd /d "%~dp0"
title Miskatonic Archive - local server

python -c "import http.server" >nul 2>&1
if not errorlevel 1 goto run_python

py -3 -c "import http.server" >nul 2>&1
if not errorlevel 1 goto run_py

echo Python 3 was not found. Install Python 3 and try again.
pause
exit /b 1

:run_python
python "%~dp0start-server.py"
goto finished

:run_py
py -3 "%~dp0start-server.py"

:finished
set "server_exit=%errorlevel%"
pause
exit /b %server_exit%