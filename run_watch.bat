@echo off
cd DGSV_BE
echo Starting Backend with Hot Reload (dotnet watch)...
dotnet watch run --launch-profile http
pause
