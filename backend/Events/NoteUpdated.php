<?php
namespace App\Events;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NoteUpdated implements ShouldBroadcastNow {
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int    $noteId,
        public readonly string $title,
        public readonly string $content,
        public readonly int    $updatedBy,
        public readonly string $updatedAt,
    ) {}

    public function broadcastOn(): array { return [new PresenceChannel("note.{$this->noteId}")]; }
    public function broadcastAs(): string { return 'note.updated'; }
    public function broadcastWith(): array {
        return ['note_id'=>$this->noteId,'title'=>$this->title,'content'=>$this->content,'updated_by'=>$this->updatedBy,'updated_at'=>$this->updatedAt];
    }
}
