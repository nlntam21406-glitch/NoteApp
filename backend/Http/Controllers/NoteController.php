<?php
namespace App\Http\Controllers;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NoteController extends Controller {

    public function index(Request $request) {
        $query = Note::where('user_id', $request->user()->id)->with(['labels:id,name','sharedWith']);
        if ($search = trim($request->query('search','')))
            $query->where(fn($q) => $q->where('title','like',"%$search%")->orWhere('content','like',"%$search%"));
        if ($labelId = $request->query('label_id'))
            $query->whereHas('labels', fn($q) => $q->where('labels.id',$labelId));
        $notes = $query->orderByRaw('is_pinned DESC')->orderByRaw('CASE WHEN is_pinned=1 THEN pinned_at END DESC')->orderBy('updated_at','desc')->get();
        return response()->json(['notes'=>$notes->map(fn($n)=>$this->noteResource($n))]);
    }

    public function store(Request $request) {
        $data = $request->validate(['title'=>['nullable','string','max:500'],'content'=>['nullable','string']]);
        $note = Note::create(['user_id'=>$request->user()->id,'title'=>$data['title']??'','content'=>$data['content']??'']);
        return response()->json(['note'=>$this->noteResource($note->load('labels','sharedWith'))], 201);
    }

    public function update(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        $this->requireUnlocked($request, $note);
        $data = $request->validate(['title'=>['sometimes','nullable','string','max:500'],'content'=>['sometimes','nullable','string']]);
        $note->update($data);
        return response()->json(['note'=>$this->noteResource($note->fresh(['labels','sharedWith']))]);
    }

    public function destroy(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        $this->requireUnlocked($request, $note);
        foreach(($note->images??[]) as $p) Storage::disk('public')->delete($p);
        $note->delete();
        return response()->json(['message'=>'Note deleted.']);
    }

    public function togglePin(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        $note->update(['is_pinned'=>!$note->is_pinned,'pinned_at'=>!$note->is_pinned?now():null]);
        return response()->json(['note'=>$this->noteResource($note->fresh(['labels','sharedWith']))]);
    }

    public function uploadImages(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        $this->requireUnlocked($request, $note);
        $request->validate(['images'=>['required','array'],'images.*'=>['image','max:5120']]);
        $existing = $note->images??[];
        foreach($request->file('images') as $f) $existing[] = $f->store("notes/{$note->id}",'public');
        $note->update(['images'=>$existing]);
        return response()->json(['images'=>array_map(fn($p)=>$this->imgUrl($p),$existing)]);
    }

    public function removeImage(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        $this->requireUnlocked($request, $note);
        $data = $request->validate(['path'=>['required','string']]);
        Storage::disk('public')->delete($data['path']);
        $note->update(['images'=>array_values(array_filter($note->images??[],fn($p)=>$p!==$data['path']))]);
        return response()->json(['message'=>'Image removed.']);
    }

    private function requireUnlocked(Request $request, Note $note): void {
        if (!$note->is_locked) return;
        $token = $request->header('X-Note-Unlock-Token');
        $t     = $token ? \Laravel\Sanctum\PersonalAccessToken::findToken($token) : null;
        if (!$t || (int)$t->tokenable_id!==(int)$note->user_id || !$t->can("note:{$note->id}:read") || ($t->expires_at && $t->expires_at->isPast()))
            abort(response()->json(['message'=>'Note is password-protected.','locked'=>true,'note_id'=>$note->id], 403));
    }

    private function findOwned($id, $user): Note {
        return Note::where('id',$id)->where('user_id',$user->id)->firstOrFail();
    }

    private function imgUrl(string $p): string { return Storage::disk('public')->url($p); }

    public function noteResource(Note $note): array {
        return [
            'id'=>$note->id,'title'=>$note->title,'content'=>$note->content,
            'is_pinned'=>(bool)$note->is_pinned,'pinned_at'=>$note->pinned_at?->toISOString(),
            'is_locked'=>(bool)$note->is_locked,
            'images'=>array_map(fn($p)=>$this->imgUrl($p),$note->images??[]),
            'labels'=>$note->labels->map(fn($l)=>['id'=>$l->id,'name'=>$l->name])->toArray(),
            'is_shared'=>$note->relationLoaded('sharedWith')?$note->sharedWith->isNotEmpty():false,
            'updated_at'=>$note->updated_at->toISOString(),'created_at'=>$note->created_at->toISOString(),
        ];
    }
}
