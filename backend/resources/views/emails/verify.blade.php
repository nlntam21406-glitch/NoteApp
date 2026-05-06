<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2>Activate your account</h2>
<p>Hi {{ $user->display_name }},</p>
<p>Click the button below to activate your account:</p>
<a href="{{ $url }}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Activate Account</a>
<p style="color:#888;font-size:12px;margin-top:24px">If you did not create an account, ignore this email.</p>
</body></html>
