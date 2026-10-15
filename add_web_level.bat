@echo off
REM ===========================================================================
REM CADIT Omniverse Web Template - Add Level Shortcut CLI
REM Usage: add_web_level.bat <level_id>
REM Example: add_web_level.bat level_02_room
REM ===========================================================================

if "%~1"=="" (
    echo [ERROR] Level ID argument missing!
    echo Usage: add_web_level.bat ^<level_id^>
    echo Example: add_web_level.bat level_02_room
    exit /b 1
)

node "%~dp0tools\scaffold_level.js" %*
