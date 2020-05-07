#!/bin/bash
cd "$(dirname "$0")"
virtualenv venv --python=python3
source venv/bin/activate
pip install -r requirements.txt || echo 'Please ensure you have Python >=3.7, <4.0 Installed'
export FLASK_APP=src/app.py
flask run --port 8096
