@echo off
setlocal enabledelayedexpansion

rem 指定要遍历的目录
set "rootDirectory=D:\Coding"

rem 切换到根目录
cd /d "%rootDirectory%"

rem 获取根目录下的所有子目录
for /d %%f in (*) do (
    pushd "%%f"
    echo ^>^>^>^> Current Directory: !cd!
    git status
    popd
)

endlocal