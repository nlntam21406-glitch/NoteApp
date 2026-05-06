<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2>Your password reset OTP</h2>
<p>Hi {{ $user->display_name }},</p>
<p>Use this code to reset your password. It expires in <strong>15 minutes</strong>.</p>
<div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#4f46e5;padding:16px 0">{{ $otp }}</div>
</body></html>
