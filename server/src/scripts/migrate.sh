#!/bin/bash

# Create a directory for the compiled files
mkdir -p dist

# Compile the TypeScript files and output them to the dist directory
npx tsc --outDir dist src/db/migrate-to-latest.ts

# Compile the Migration TypeScript files and output them to the dist directory
npx tsc --outDir ./dist/src/db/migrations ./src/db/migrations/*.ts

# Run the migrate-to-latest.js script from the dist directory
node dist/db/migrate-to-latest.js

# Delete the dist directory and all of its contents
rm -rf dist