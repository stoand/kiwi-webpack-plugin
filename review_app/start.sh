#!/bin/bash
cd "$(dirname "$0")"
virtualenv venv --python=python3
source venv/bin/activate
pip install -r requirements.txt 
export FLASK_APP=src/app.py
flask run --port 8096
