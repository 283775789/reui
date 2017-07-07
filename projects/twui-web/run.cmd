@echo off
rd /s/q dist
cmd /k gulp -"%~dp0"