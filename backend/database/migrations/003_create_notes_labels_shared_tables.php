<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->default('');
            $table->longText('content')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('pinned_at')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->string('lock_password')->nullable();
            $table->json('images')->nullable();
            $table->timestamps();
        });

        Schema::create('labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
            $table->unique(['user_id', 'name']);
        });

        Schema::create('note_label', function (Blueprint $table) {
            $table->foreignId('note_id')->constrained()->cascadeOnDelete();
            $table->foreignId('label_id')->constrained()->cascadeOnDelete();
            $table->primary(['note_id', 'label_id']);
        });

        Schema::create('shared_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->enum('permission', ['read', 'edit'])->default('read');
            $table->timestamp('shared_at')->useCurrent();
            $table->timestamps();
            $table->unique(['note_id', 'recipient_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('shared_notes');
        Schema::dropIfExists('note_label');
        Schema::dropIfExists('labels');
        Schema::dropIfExists('notes');
    }
};
