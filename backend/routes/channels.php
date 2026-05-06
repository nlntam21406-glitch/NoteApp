<?php
use App\Models\{Note, SharedNote};
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('note.{noteId}', function ($user, $noteId) {
    $isOwner     = Note::where('id',$noteId)->where('user_id',$user->id)->exists();
    $isRecipient = SharedNote::where('note_id',$noteId)->where('recipient_id',$user->id)->where('permission','edit')->exists();
    if (!$isOwner && !$isRecipient) return false;
    return ['id'=>$user->id,'display_name'=>$user->display_name];
});
