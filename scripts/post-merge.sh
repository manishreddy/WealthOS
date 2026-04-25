#!/bin/bash
set -e

cd server && npm install --prefer-offline

echo "Running security audit..."
npm audit --audit-level=high
echo "Security audit passed."
