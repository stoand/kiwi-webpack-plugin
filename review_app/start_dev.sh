#!/bin/bash
cd "$(dirname "$0")"

# Flask will auto-restart on changes and show debug messages
export FLASK_ENV=development

bash -e ./start.sh
