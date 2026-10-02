@echo off
chcp 65001 >nul
title Despliegue KyrnForge (Cloudflare + GitHub)
cd /d "%~dp0"

echo ============================================================
echo   KYRNFORGE WEB - DESPLIEGUE AUTOMATICO
echo   Compilacion + Cloudflare Pages + Git Push
echo ============================================================
echo.

:: 1. Compilacion de Vite
echo [1/3] Compilando portal web con Vite (npm run build)...
call npm run build
if %errorlevel% neq 0 goto ERROR_BUILD
echo [OK] Compilacion completada con exito.
echo.

:: 2. Despliegue en Cloudflare Pages
echo [2/3] Subiendo distribucion a Cloudflare Pages (kyrnforge)...
call npx wrangler pages deploy dist --project-name=kyrnforge --branch=main --commit-dirty=true
if %errorlevel% neq 0 goto ERROR_CLOUDFLARE
echo [OK] Despliegue en Cloudflare Pages completado.
echo.

:: 3. Sincronizacion con GitHub
echo [3/3] Sincronizando repositorio Git con GitHub...
git add -A
git diff-index --quiet HEAD --
if %errorlevel% equ 0 (
    echo [INFO] Git ya esta al dia. No hay archivos modificados pendientes de commit.
    goto FINISH
)

echo Se detectaron cambios pendientes en el repositorio local.
git commit -m "feat: actualizar portal KyrnForge con API y panel de moderacion"
git push origin master
if %errorlevel% neq 0 goto ERROR_GIT
echo [OK] Cambios sincronizados con GitHub (devlwte/kyrnforge-web).
goto FINISH

:ERROR_BUILD
echo.
echo [ERROR] La compilacion fallo. Revisa los errores anteriores.
echo.
pause
exit /b 1

:ERROR_CLOUDFLARE
echo.
echo [ERROR] Fallo el despliegue en Cloudflare Pages.
echo.
pause
exit /b 1

:ERROR_GIT
echo.
echo [ADVERTENCIA] No se pudo hacer push a GitHub. Verifica tu conexion o credenciales.
goto FINISH

:FINISH
echo.
echo ============================================================
echo   [EXITO] TODOS LOS CAMBIOS FUERON PUBLICADOS
echo.
echo   Sitio web en vivo : https://kyrnforge.dev
echo   Repositorio GitHub: https://github.com/devlwte/kyrnforge-web
echo ============================================================
echo.
pause
