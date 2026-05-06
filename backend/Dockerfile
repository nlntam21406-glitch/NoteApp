FROM php:8.3-cli-alpine

RUN apk add --no-cache git curl zip unzip bash libpng-dev oniguruma-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring gd bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Create fresh Laravel project
RUN rm -rf /var/www/html \
    && composer create-project laravel/laravel:^11.0 . --prefer-dist --no-interaction --quiet

# Install packages
RUN composer require laravel/sanctum:^4.0 laravel/reverb:^1.0 --no-interaction --quiet

# Copy our custom files over Laravel scaffold
RUN rm -rf database/migrations/*
COPY app/           app/
COPY database/      database/
COPY resources/     resources/
COPY routes/        routes/
COPY bootstrap_app.php bootstrap/app.php
COPY .env.docker    .env

RUN chown -R www-data:www-data storage bootstrap/cache \
    && composer dump-autoload --optimize --quiet

EXPOSE 8000 8080

CMD ["/bin/bash","-c","\
    php artisan key:generate --force --quiet; \
    php artisan storage:link --force --quiet; \
    php artisan migrate --force --seed --quiet; \
    php artisan reverb:start --host=0.0.0.0 --port=8080 --no-interaction & \
    php artisan serve --host=0.0.0.0 --port=8000"]
