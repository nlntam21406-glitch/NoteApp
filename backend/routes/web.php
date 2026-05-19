<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    try {
        // Run a lightweight query to keep the database active
        DB::connection()->getPdo();
        return [
            'status' => 'NoteApp API running',
            'database' => 'connected'
        ];
    } catch (\Exception $e) {
        return [
            'status' => 'NoteApp API running',
            'database' => 'error',
            'message' => $e->getMessage()
        ];
    }
});
