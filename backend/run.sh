#!/bin/bash
set -e

python3 app.py

ngrok http --url=cleanly-subtle-rabbit.ngrok-free.app 8000