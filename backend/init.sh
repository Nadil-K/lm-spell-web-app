#!/bin/bash
set -e

echo "Installing Ngrok..."

curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null

echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
  | tee /etc/apt/sources.list.d/ngrok.list

apt update
apt install -y ngrok

ngrok config add-authtoken 2xgyrelwpdqqVEGyommGielHNjb_5YyW2xL9weDaMufVemh7R

echo "Ngrok has been installed and configured successfully."