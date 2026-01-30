@echo off
cd /d "c:\Users\adraouil\The-Nutritionist-AI\springboot-auth"
echo ===================================
echo Lancement du Backend Spring Boot
echo Port: 8080
echo ===================================
echo.
echo Ne fermez PAS cette fenetre!
echo.
call mvnw.cmd spring-boot:run
pause
