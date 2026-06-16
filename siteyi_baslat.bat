@echo off
echo Siteniz yerel sunucuda baslatiliyor, lutfen bekleyin...
start http://localhost:8000
python -m http.server 8000
