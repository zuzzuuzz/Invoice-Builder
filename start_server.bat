@echo off
title Velourcare Ortho - Invoice Builder
cd /d "%~dp0"

echo ========================================================
echo   Launching Velourcare Ortho Invoice Builder...
echo ========================================================

where python >nul 2>nul
if %errorlevel% equ 0 (
    python server.py
    goto end
)

where py >nul 2>nul
if %errorlevel% equ 0 (
    py server.py
    goto end
)

echo Python was not found in PATH. Opening index.html directly...
start "" "%~dp0index.html"

:end
pause
