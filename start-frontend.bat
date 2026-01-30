@echo off
cd /d "c:\Users\adraouil\The-Nutritionist-AI\frontend-angular\dashboard\static-4200"
echo ===================================
echo Lancement du Frontend Angular
echo Port: 4200
echo ===================================
python -m http.server 4200
pause
