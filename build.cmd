@echo off
chcp 65001 >nul
rem 把项目编译为静态页面，输出到 dist 目录
cd /d "%~dp0"

echo 正在编译项目...
call npm run build
if errorlevel 1 (
    echo.
    echo 编译失败，请检查上方错误信息。
    pause
    exit /b 1
)

echo 正在生成作品集清单...
call node scripts\scan-prod.mjs
if errorlevel 1 (
    echo.
    echo 生成作品集清单失败，请检查上方错误信息。
    pause
    exit /b 1
)

echo.
echo 编译完成，静态页面位于 dist 目录，可直接部署到任意静态托管。
echo 部署后站点会加载 dist 下的 prod 目录作为作品集；更新作品后重新运行本脚本即可。
pause
