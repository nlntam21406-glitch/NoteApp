<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class UserProfileController extends Controller {

    public function update(Request $request) {
        $data = $request->validate([
            'display_name' => ['required','string','max:100'],
        ]);
        $request->user()->update($data);
        return response()->json(['message'=>'Profile updated.','user'=>$this->userResource($request->user())]);
    }

    public function uploadAvatar(Request $request) {
        $request->validate([
            'avatar' => ['required','image','max:2048'],
        ]);
        $user = $request->user();
        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);
        return response()->json(['message'=>'Avatar updated.','avatar_url'=>Storage::disk('public')->url($path)]);
    }

    public function removeAvatar(Request $request) {
        $user = $request->user();
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }
        $user->update(['avatar' => null]);
        return response()->json(['message'=>'Avatar removed.']);
    }

    public function changePassword(Request $request) {
        $data = $request->validate([
            'current_password' => ['required'],
            'password'         => ['required','confirmed', Password::min(8)],
        ]);
        $user = $request->user();
        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message'=>'Current password is incorrect.'], 422);
        }
        $user->update(['password' => $data['password']]);
        return response()->json(['message'=>'Password changed successfully.']);
    }

    private function userResource($user): array {
        return [
            'id'=>$user->id,
            'email'=>$user->email,
            'display_name'=>$user->display_name,
            'is_verified'=>$user->isVerified(),
            'preferences'=>$user->preferences,
            'avatar_url'=>$user->avatar ? Storage::disk('public')->url($user->avatar) : null,
        ];
    }
}
