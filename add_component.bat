@echo off
REM ===========================================================================
REM CADIT Omniverse Web Template - Add Reusable Component Shortcut CLI
REM Usage: add_component.bat <ComponentName>
REM Example: add_component.bat StatusBadge
REM ===========================================================================

if "%~1"=="" (
    echo [ERROR] Component name argument missing!
    echo Usage: add_component.bat ^<ComponentName^>
    echo Example: add_component.bat StatusBadge
    exit /b 1
)

node "%~dp0tools\scaffold_component.js" %*
