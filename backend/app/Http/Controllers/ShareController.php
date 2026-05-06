<?php
namespace App\Http\Controllers;
use App\Models\{Note, SharedNote, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Mail, Storage};

class ShareController extends Controller {

    public function index(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        return response()->json(['shares'=>SharedNote::where('note_id',$note->id)->with('recipient:id,email,display_name')->get()->map(fn($s)=>$this->shareRes($s))]);
    }

    public function store(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        $data = $request->validate(['email'=>['required','email'],'permission'=>['required','in:read,edit']]);
        $recipient = User::where('email',$data['email'])->first();
        if (!$recipient) return response()->json(['message'=>'No account found with this email.','errors'=>['email'=>['No account found with this email.']]], 422);
        if ($recipient->id===$request->user()->id) return response()->json(['message'=>'Cannot share with yourself.'], 422);
        $share = SharedNote::updateOrCreate(['note_id'=>$note->id,'recipient_id'=>$recipient->id],['owner_id'=>$request->user()->id,'permission'=>$data['permission'],'shared_at'=>now()]);
        $this->notifyRecipient($request->user(), $recipient, $note, $data['permission']);
        return response()->json(['message'=>"Note shared with {$recipient->display_name}.",'share'=>$this->shareRes($share->load('recipient'))], 201);
    }

    public function update(Request $request, $id, $shareId) {
        $note  = $this->findOwned($id, $request->user());
        $share = SharedNote::where('id',$shareId)->where('note_id',$note->id)->firstOrFail();
        $data  = $request->validate(['permission'=>['required','in:read,edit']]);
        $share->update(['permission'=>$data['permission']]);
        return response()->json(['message'=>'Permission updated.','share'=>$this->shareRes($share->fresh('recipient'))]);
    }

    public function destroy(Request $request, $id, $shareId) {
        $note = $this->findOwned($id, $request->user());
        SharedNote::where('id',$shareId)->where('note_id',$note->id)->firstOrFail()->delete();
        return response()->json(['message'=>'Access revoked.']);
    }

    public function sharedWithMe(Request $request) {
        $shares = SharedNote::where('recipient_id',$request->user()->id)->with(['note.labels','owner:id,email,display_name'])->orderBy('shared_at','desc')->get()->map(function($share) {
            return ['share_id'=>$share->id,'permission'=>$share->permission,'shared_at'=>$share->shared_at->toISOString(),
                'shared_by'=>['id'=>$share->owner->id,'email'=>$share->owner->email,'display_name'=>$share->owner->display_name],
                'note'=>['id'=>$share->note->id,'title'=>$share->note->title,'content'=>$share->note->content,
                    'images'=>array_map(fn($p)=>Storage::disk('public')->url($p),$share->note->images??[]),
                    'labels'=>$share->note->labels->map(fn($l)=>['id'=>$l->id,'name'=>$l->name])->toArray(),
                    'updated_at'=>$share->note->updated_at->toISOString(),'is_pinned'=>false,'is_locked'=>false,'is_shared'=>true]];
        });
        return response()->json(['shares'=>$shares]);
    }

    private function findOwned($id, $user): Note { return Note::where('id',$id)->where('user_id',$user->id)->firstOrFail(); }

    private function shareRes(SharedNote $s): array {
        return ['id'=>$s->id,'permission'=>$s->permission,'shared_at'=>$s->shared_at?->toISOString()??now()->toISOString(),
            'recipient'=>$s->recipient?['id'=>$s->recipient->id,'email'=>$s->recipient->email,'display_name'=>$s->recipient->display_name]:null];
    }

    private function notifyRecipient(User $owner, User $recipient, Note $note, string $perm): void {
        $url = config('app.frontend_url').'/shared-with-me';
        try { Mail::send('emails.note_shared',compact('owner','recipient','note','perm','url'),fn($m)=>$m->to($recipient->email)->subject("{$owner->display_name} shared a note with you")); }
        catch(\Exception $e) {}
    }
}
