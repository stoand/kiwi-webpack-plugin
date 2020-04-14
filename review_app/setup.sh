#!/bin/bash
cd "$(dirname "$0")"
virtualenv venv --python=python3
source venv/bin/activate
pip install -r requirements.txt 
