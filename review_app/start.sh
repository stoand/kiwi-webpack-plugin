#!/bin/bash
cd "$(dirname "$0")"
bash -e ./setup.sh
export FLASK_APP=src/app.py
flask run --port 8096
