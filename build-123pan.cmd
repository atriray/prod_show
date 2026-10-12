@echo off
chcp 65001 >nul
rem 编译项目并把媒体链接替换为 123 云盘直链（映射表: scripts\123pan-mapping.json）
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

echo 正在替换 123 云盘直链...
call node scripts\link-123pan.mjs
if errorlevel 1 (
    echo.
    echo 替换直链失败，请检查上方错误信息。
    pause
    exit /b 1
)

echo.
echo 完成。静态页面位于 docs 目录：
echo   - 已映射的文件通过 123 云盘直链加载，本地副本已删除
echo   - 未映射的文件仍使用 docs 下的本地副本
echo 更新映射表 scripts\123pan-mapping.json 后重新运行本脚本即可。
pause
