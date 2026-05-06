<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2>A note has been shared with you</h2>
<p>Hi {{ $recipient->display_name }},</p>
<p><strong>{{ $owner->display_name }}</strong> shared a note with you with <strong>{{ $perm }}</strong> access.</p>
@if($note->title)<p>Note: <em>"{{ $note->title }}"</em></p>@endif
<a href="{{ $url }}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">View Shared Notes</a>
</body></html>
