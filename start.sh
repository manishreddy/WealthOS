#!/bin/bash
# WealthOS - Start Server
cd "$(dirname "$0")/server"
echo ""
echo "  WealthOS Starting..."
echo "  Open: http://localhost:3000"
echo ""
node server.js
