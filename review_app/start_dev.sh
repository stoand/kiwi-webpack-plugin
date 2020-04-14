#!/bin/bash
cd "$(dirname "$0")"
bash -e ./setup.sh

# Flask will auto-restart on changes and show debug messages
export FLASK_ENV=development

export FLASK_APP=src/app.py
flask run --port 8096
