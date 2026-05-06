<?php
use App\Http\Controllers\Auth\{AuthController, PasswordResetController};
use App\Http\Controllers\{LabelController, NoteController, NotePasswordController, ShareController, SharedNoteEditController, UserPreferencesController};
use Illuminate\Support\Facades\Route;

// ── PUBLIC ────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::get('/verify-email',     [AuthController::class, 'verifyEmail']);
    Route::post('/forgot-password', [PasswordResetController::class, 'sendReset']);
    Route::post('/verify-otp',      [PasswordResetController::class, 'verifyOtp']);
    Route::post('/reset-password',  [PasswordResetController::class, 'resetPassword']);
});

// ── PROTECTED ─────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout',              [AuthController::class, 'logout']);
        Route::get('/me',                   [AuthController::class, 'me']);
        Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
    });

    Route::get('user/preferences', [UserPreferencesController::class, 'show']);
    Route::put('user/preferences', [UserPreferencesController::class, 'update']);
    
    // User Profile
    Route::put('user/profile',     [\App\Http\Controllers\UserProfileController::class, 'update']);
    Route::post('user/avatar',     [\App\Http\Controllers\UserProfileController::class, 'uploadAvatar']);
    Route::delete('user/avatar',   [\App\Http\Controllers\UserProfileController::class, 'removeAvatar']);
    Route::put('user/password',    [\App\Http\Controllers\UserProfileController::class, 'changePassword']);

    // Notes (owner)
    Route::get('notes',                    [NoteController::class, 'index']);
    Route::post('notes',                   [NoteController::class, 'store']);
    Route::put('notes/{id}',               [NoteController::class, 'update']);
    Route::delete('notes/{id}',            [NoteController::class, 'destroy']);
    Route::post('notes/{id}/pin',          [NoteController::class, 'togglePin']);
    Route::post('notes/{id}/images',       [NoteController::class, 'uploadImages']);
    Route::delete('notes/{id}/images',     [NoteController::class, 'removeImage']);

    // Note lock
    Route::post('notes/{id}/lock/verify',    [NotePasswordController::class, 'verify']);
    Route::post('notes/{id}/lock/enable',    [NotePasswordController::class, 'enable']);
    Route::put('notes/{id}/lock/change',     [NotePasswordController::class, 'change']);
    Route::delete('notes/{id}/lock/disable', [NotePasswordController::class, 'disable']);

    // Labels
    Route::get('labels',                 [LabelController::class, 'index']);
    Route::post('labels',                [LabelController::class, 'store']);
    Route::put('labels/{id}',            [LabelController::class, 'update']);
    Route::delete('labels/{id}',         [LabelController::class, 'destroy']);
    Route::post('notes/{noteId}/labels', [LabelController::class, 'attachToNote']);

    // Sharing (owner manages)
    Route::get('notes/{id}/shares',              [ShareController::class, 'index']);
    Route::post('notes/{id}/shares',             [ShareController::class, 'store']);
    Route::put('notes/{id}/shares/{shareId}',    [ShareController::class, 'update']);
    Route::delete('notes/{id}/shares/{shareId}', [ShareController::class, 'destroy']);

    // Shared-with-me (recipient)
    Route::get('shared-with-me',    [ShareController::class, 'sharedWithMe']);
    Route::get('shared-notes/{id}', [SharedNoteEditController::class, 'show']);
    Route::put('shared-notes/{id}', [SharedNoteEditController::class, 'update']);
});
