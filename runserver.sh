#!/bin/sh

PROJECT_DIR=$(cd "$(dirname "$0")" && pwd)
cd $PROJECT_DIR
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8080

