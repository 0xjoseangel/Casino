#!/bin/bash

conda create -n casino_django python=3.11 -y

conda activate casino_django

pip install django oracledb djangorestframework python-dotenv django-cors-headers

read -p "Introduce tu DNI de forma que la primera letra de este sea una x: " DNI



cat > ./backend/.env << EOF

DB_USER=$DNI
DB_PASSWORD=$DNI
DB_HOST=oracle0.ugr.es
DB_PORT=1521
ORACLE_SERVICE_NAME=practbd

DEBUG=True
SECRET_KEY=cambiame_por_algo_seguro_en_produccion
EOF

echo "Carpeta .env creada y archivo configurado correctamente."
echo "Ubicación: $(pwd)/backend/.env"
ls -la ./backend/.env
