#!/bin/bash

if [ "$RENDER" = "true" ]; then
    # Generate a fresh .env from docker template
    cp .env.docker .env

    # Inject Render environment variables explicitly into the .env file
    sed -i "s/^DB_CONNECTION=.*/DB_CONNECTION=${DB_CONNECTION:-mysql}/" .env
    sed -i "s/^DB_HOST=.*/DB_HOST=${DB_HOST}/" .env
    sed -i "s/^DB_PORT=.*/DB_PORT=${DB_PORT}/" .env
    sed -i "s/^DB_DATABASE=.*/DB_DATABASE=${DB_DATABASE}/" .env
    sed -i "s/^DB_USERNAME=.*/DB_USERNAME=${DB_USERNAME}/" .env
    sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env

    # Fix frontend URL for email verification links
    sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=https://note-app-blond-psi.vercel.app|" .env
    
    # Optional: ensure sessions use database since we created the migration
    sed -i "s/^SESSION_DRIVER=.*/SESSION_DRIVER=database/" .env
fi

# Run Laravel setup commands
php artisan key:generate --force --quiet
php artisan storage:link --force --quiet
php artisan migrate --force --seed --quiet

# Start the built-in server
php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
