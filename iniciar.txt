@echo off
setlocal

:: ─── Auto-elevacion a Administrador ────────────────────────────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs -WorkingDirectory '%~dp0'"
    exit /b
)

:: ─── Variables de rutas ─────────────────────────────────────────────────────
set ROOT=%~dp0
set MONGOD="C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
set MONGOCFG="C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg"

color 0A
cls
echo.
echo  =========================================================
echo    PC Parts eCommerce ^| Sistema de inicio
echo  =========================================================
echo.

:: ─── 1. MongoDB ─────────────────────────────────────────────────────────────
echo  [1/3] Verificando MongoDB...

sc query MongoDB | findstr "RUNNING" >nul 2>&1
if %errorlevel% == 0 (
    echo        MongoDB ya estaba corriendo.
    goto :start_backend
)

:: El servicio existe pero esta DISABLED — habilitarlo primero
sc config MongoDB start= demand >nul 2>&1
if %errorlevel% neq 0 (
    echo   [!] No se pudo configurar el servicio. Iniciando mongod directamente...
    goto :mongod_direct
)

net start MongoDB >nul 2>&1
if %errorlevel% == 0 (
    echo        MongoDB iniciado como servicio Windows.
    goto :start_backend
)

:mongod_direct
:: Fallback: iniciar mongod.exe directamente con su config
echo        Iniciando mongod directamente...
start "MongoDB" /MIN cmd /c "%MONGOD% --config %MONGOCFG%"
timeout /t 3 /nobreak >nul

:: Verificar que levanto
%MONGOD% --version >nul 2>&1
echo        mongod arrancado en localhost:27017

goto :start_backend

:: ─── 2. Backend ─────────────────────────────────────────────────────────────
:start_backend
timeout /t 1 /nobreak >nul
echo.

:: Liberar puertos si ya estan ocupados
echo  [2/3] Verificando puertos...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4200 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo  [2/3] Iniciando Backend  (http://localhost:5000)...
start "PCParts Backend" cmd /k "title PCParts - Backend && color 0B && cd /d "%ROOT%backend" && echo. && echo  Backend: http://localhost:5000 && echo  Presiona Ctrl+C para detener && echo. && npm run dev"

timeout /t 4 /nobreak >nul

:: ─── 3. Frontend ────────────────────────────────────────────────────────────
echo  [3/3] Iniciando Frontend (http://localhost:4200)...
start "PCParts Frontend" cmd /k "title PCParts - Frontend && color 0E && cd /d "%ROOT%frontend" && echo. && echo  Frontend: http://localhost:4200 && echo  Presiona Ctrl+C para detener && echo. && npx ng serve --open"

:: ─── Resumen ────────────────────────────────────────────────────────────────
echo.
echo  =========================================================
echo    Todo iniciado correctamente
echo.
echo    Backend  → http://localhost:5000/api/health
echo    Frontend → http://localhost:4200
echo  =========================================================
echo.
echo  Esta ventana puede cerrarse. El backend y frontend
echo  seguiran corriendo en sus propias ventanas.
echo.
pause >nul
endlocal
