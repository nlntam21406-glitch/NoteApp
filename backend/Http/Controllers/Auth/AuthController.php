<?php
namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller {

    public function register(Request $request) {
        $data = $request->validate([
            'email'        => ['required','email','unique:users,email'],
            'display_name' => ['required','string','max:100'],
            'password'     => ['required','confirmed', Password::min(8)],
        ]);
        $token = Str::random(64);
        $user  = User::create(['email'=>$data['email'],'display_name'=>$data['display_name'],'password'=>$data['password'],'email_verification_token'=>$token]);
        $this->sendVerificationEmail($user, $token);
        $authToken = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['message'=>'Registration successful.','token'=>$authToken,'user'=>$this->userResource($user)], 201);
    }

    public function login(Request $request) {
        $data = $request->validate(['email'=>['required','email'],'password'=>['required']]);
        if (!Auth::attempt(['email'=>$data['email'],'password'=>$data['password']]))
            return response()->json(['message'=>'Invalid credentials.'], 401);
        $user  = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['token'=>$token,'user'=>$this->userResource($user)]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'Logged out successfully.']);
    }

    public function me(Request $request) {
        return response()->json(['user'=>$this->userResource($request->user())]);
    }

    public function verifyEmail(Request $request) {
        $user = User::where('email_verification_token', $request->query('token'))->first();
        if (!$user) return response()->json(['message'=>'Invalid or expired link.'], 400);
        if ($user->isVerified()) return response()->json(['message'=>'Already verified.']);
        $user->update(['email_verified_at'=>now(),'email_verification_token'=>null]);
        return response()->json(['message'=>'Account activated successfully.']);
    }

    public function resendVerification(Request $request) {
        $user = $request->user();
        if ($user->isVerified()) return response()->json(['message'=>'Already verified.'], 400);
        $token = Str::random(64);
        $user->update(['email_verification_token'=>$token]);
        $this->sendVerificationEmail($user, $token);
        return response()->json(['message'=>'Verification email resent.']);
    }

    private function sendVerificationEmail(User $user, string $token): void {
        $url = config('app.frontend_url').'/verify-email?token='.$token;
        Mail::send('emails.verify', ['url'=>$url,'user'=>$user], fn($m) => $m->to($user->email)->subject('Activate your account'));
    }

    private function userResource(User $user): array {
        return ['id'=>$user->id,'email'=>$user->email,'display_name'=>$user->display_name,'is_verified'=>$user->isVerified(),'preferences'=>$user->preferences,'avatar_url'=>$user->avatar ? \Illuminate\Support\Facades\Storage::disk('public')->url($user->avatar) : null];
    }
}
