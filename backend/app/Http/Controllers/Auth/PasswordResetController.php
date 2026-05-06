<?php
namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class PasswordResetController extends Controller {

    public function sendReset(Request $request) {
        $data = $request->validate(['email'=>['required','email','exists:users,email'],'method'=>['required','in:link,otp']]);
        $user = User::where('email', $data['email'])->first();
        return $data['method'] === 'link' ? $this->sendLink($user) : $this->sendOtp($user);
    }

    private function sendLink(User $user) {
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();
        $token = Str::random(64);
        DB::table('password_reset_tokens')->insert(['email'=>$user->email,'token'=>Hash::make($token),'created_at'=>now()]);
        $url = config('app.frontend_url').'/reset-password?token='.$token.'&email='.urlencode($user->email);
        Mail::send('emails.password_reset_link', ['url'=>$url,'user'=>$user], fn($m) => $m->to($user->email)->subject('Reset your password'));
        return response()->json(['message'=>'Password reset link sent.']);
    }

    private function sendOtp(User $user) {
        DB::table('password_reset_otps')->where('email', $user->email)->update(['used'=>true]);
        $otp = str_pad(random_int(0,999999), 6, '0', STR_PAD_LEFT);
        DB::table('password_reset_otps')->insert(['email'=>$user->email,'otp'=>$otp,'expires_at'=>now()->addMinutes(15),'used'=>false,'created_at'=>now(),'updated_at'=>now()]);
        Mail::send('emails.password_reset_otp', ['otp'=>$otp,'user'=>$user], fn($m) => $m->to($user->email)->subject('Your password reset OTP'));
        return response()->json(['message'=>'OTP sent. Valid for 15 minutes.']);
    }

    public function verifyOtp(Request $request) {
        $data   = $request->validate(['email'=>['required','email'],'otp'=>['required','digits:6']]);
        $record = DB::table('password_reset_otps')->where('email',$data['email'])->where('otp',$data['otp'])->where('used',false)->where('expires_at','>',now())->first();
        if (!$record) return response()->json(['message'=>'Invalid or expired OTP.'], 400);
        $resetToken = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(['email'=>$data['email']],['token'=>Hash::make($resetToken),'created_at'=>now()]);
        DB::table('password_reset_otps')->where('id',$record->id)->update(['used'=>true]);
        return response()->json(['message'=>'OTP verified.','token'=>$resetToken]);
    }

    public function resetPassword(Request $request) {
        $data   = $request->validate(['email'=>['required','email','exists:users,email'],'token'=>['required'],'password'=>['required','confirmed',Password::min(8)]]);
        $record = DB::table('password_reset_tokens')->where('email',$data['email'])->first();
        if (!$record || !Hash::check($data['token'], $record->token)) return response()->json(['message'=>'Invalid or expired reset token.'], 400);
        if (now()->diffInMinutes($record->created_at) > 60) return response()->json(['message'=>'Token expired.'], 400);
        $user = User::where('email',$data['email'])->first();
        $user->update(['password'=>$data['password']]);
        $user->tokens()->delete(); // Force manual re-login
        DB::table('password_reset_tokens')->where('email',$data['email'])->delete();
        return response()->json(['message'=>'Password reset. Please log in with your new password.']);
    }
}
