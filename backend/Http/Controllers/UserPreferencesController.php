<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class UserPreferencesController extends Controller {
    public function show(Request $request) {
        return response()->json(['preferences'=>$request->user()->preferences]);
    }
    public function update(Request $request) {
        $data = $request->validate([
            'fontSize'  => ['sometimes','in:small,medium,large'],
            'noteColor' => ['sometimes','string','regex:/^#[0-9A-Fa-f]{6}$/'],
            'theme'     => ['sometimes','in:light,dark'],
        ]);
        $current = $request->user()->preferences ?? [];
        $updated = array_merge($current, $data);
        $request->user()->update(['preferences'=>$updated]);
        return response()->json(['message'=>'Preferences updated.','preferences'=>$updated]);
    }
}
