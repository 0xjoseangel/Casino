
from pathlib import Path
import os
from dotenv import load_dotenv
import oracledb

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- CORRECCIÓN AQUÍ ---
# Le decimos explícitamente dónde está el .env (en la carpeta raíz del backend)
env_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=env_path)

# --- DEBUG TEMPORAL (Para ver si carga) ---
print(f"--> Buscando archivo .env en: {env_path}")
print(f"--> Usuario Oracle detectado: {os.getenv('ORACLE_USER')}")
# ------------------------------------------

# Inicializar cliente Oracle (modo Thin)
try:
    oracledb.init_oracle_client()
except Exception:
    pass

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-p4v2q8v)-8sj+x=19$77z+!%*a8w97l10out4x6fd3aeg7^n&+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    # --- Nuestras APPS ---
    'usuarios',
    'juegos',
    'transacciones',
    'eventos',
    'sesiones',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'casino_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'casino_project.wsgi.application'


dsn_string = f"{os.getenv('ORACLE_HOST')}:{os.getenv('ORACLE_PORT')}/{os.getenv('ORACLE_SERVICE_NAME')}"
db_user = os.getenv('ORACLE_USER')
db_pass = os.getenv('ORACLE_PASSWORD')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': dsn_string,  
        'USER': db_user,
        'PASSWORD': db_pass,
        'HOST': '',          
        'PORT': '',          
    }
}
# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Permitir que React (puerto 5173 o 3000) hable con Django
CORS_ALLOW_ALL_ORIGINS = True  # Para desarrollo es lo más rápido
