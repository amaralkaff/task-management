#!/bin/bash

# Mencari semua file TypeScript di direktori src
find src -type f -name "*.ts" | while read -r file; do
  # Mengganti semua import dengan ekstensi .js menjadi tanpa ekstensi
  sed -i '' "s/from '\([^']*\)\.js'/from '\1'/g" "$file"
  sed -i '' 's/from "\([^"]*\)\.js"/from "\1"/g' "$file"
done

echo "Import statements telah diperbaiki" 