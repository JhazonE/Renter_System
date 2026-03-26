@echo off

setup.exe /s /v"/qn /l*v %temp%\ururte_install.log"

REM Pass /norestart to the msiexec command to disable reboot after 
REM installation.

@pause

REM this batch file will perform a silent install