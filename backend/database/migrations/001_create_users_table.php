<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('display_name');
            $table->string('password');
            $table->string('email_verification_token')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->json('preferences')->nullable(); // { fontSize, noteColor, theme }
            $table->rememberToken();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};
