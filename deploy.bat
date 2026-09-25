@echo off
chcp 65001 > nul

set "PORT=2022"

echo.
echo 💾 [1/6] Создание резервной копии базы данных PostgreSQL на сервере...
echo --------------------------------------------------
C:\Windows\System32\OpenSSH\ssh.exe -p %PORT% root@91.200.150.9 "mkdir -p /root/ulitkroshi/backups && docker exec -t postgres-db pg_dump -U postgres_user -d ulitkroshi_db > /root/ulitkroshi/backups/backup_%%date:~0,2%%_%%date:~3,2%%_%%date:~6,4%%_%%time:~0,2%%_%%time:~3,2%%.sql"

echo.
echo 📦 [2/6] Запуск локальной сборки фронтенда...
echo --------------------------------------------------
call npm run build

echo.
echo 🚀 [3/6] Отправка обновленной папки dist на server...
echo --------------------------------------------------
C:\Windows\System32\OpenSSH\scp.exe -P %PORT% -r ./dist/* root@91.200.150.9:/root/ulitkroshi/dist/

echo.
echo 🧠 [4/6] Отправка бэкенда (если были изменения)...
echo --------------------------------------------------
C:\Windows\System32\OpenSSH\scp.exe -P %PORT% -r ./backend/* root@91.200.150.9:/root/ulitkroshi/backend/

echo.
echo 🔄 [5/6] Перезапуск процессов на сервере...
echo --------------------------------------------------
C:\Windows\System32\OpenSSH\ssh.exe -p %PORT% root@91.200.150.9 "cd /root/ulitkroshi/dist/assets && sudo rm -f fonts && sudo ln -s ../fonts fonts && pm2 reload all"

echo.
echo 🐙 [6/6] Синхронизация исходного кода с репозиторием Git...
echo --------------------------------------------------
git add .
git commit -m "feat: auto-deploy update %date% %time%"
git push

echo.
echo 🎉 ==================================================
echo 🔥 ВСЁ ГОТОВО! Бэкап сделан, сервер обновлен, код в Git!
echo ==================================================
echo.
pause
