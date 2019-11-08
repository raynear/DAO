#!/bin/sh

PROJECT_DIR=$(cd "$(dirname "$0")" && pwd)
cd $PROJECT_DIR
python3 manage.py migrate
python3 manage.py runsslserver 0.0.0.0:8080 --certificate django.cert --key django.key

