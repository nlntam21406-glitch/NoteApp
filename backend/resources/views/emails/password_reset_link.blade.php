<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2>Reset your password</h2>
<p>Hi {{ $user->display_name }},</p>
<p>Click below to reset your password. This link expires in 60 minutes.</p>
<a href="{{ $url }}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Reset Password</a>
</body></html>
