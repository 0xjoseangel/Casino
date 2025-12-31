#!/bin/bash

# 1. Cargar las funciones de Conda para este script
# Esto busca dónde está instalado conda y lo activa para este proceso
CONDA_PATH=$(conda info --base)
source "$CONDA_PATH/etc/profile.d/conda.sh"

conda create -n casino_django python=3.11 -y

conda activate casino_django

echo "--- Instalando dependencias ---"
pip install django oracledb djangorestframework python-dotenv django-cors-headers

echo "\nIntroduce tu DNI (ej: x1234567): "
read DNI

cat > ./backend/.env << EOF
ORACLE_USER=$DNI
ORACLE_PASSWORD=$DNI
ORACLE_HOST=oracle0.ugr.es
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=practbd

DEBUG=True
SECRET_KEY=cambiame_por_algo_seguro_en_produccion
EOF

echo "-----------------------------------------------"
echo "Entorno 'casino_django' listo y activo."
ls -la ./backend/.env
