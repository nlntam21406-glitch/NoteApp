<?php
namespace App\Http\Controllers;
use App\Events\NoteUpdated;
use App\Models\{Note, SharedNote};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SharedNoteEditController extends Controller {

    public function show(Request $request, $id) {
        $share = SharedNote::where('note_id',$id)->where('recipient_id',$request->user()->id)->firstOrFail();
        $note  = Note::with('labels')->findOrFail($id);
        return response()->json(['note'=>['id'=>$note->id,'title'=>$note->title,'content'=>$note->content,
            'images'=>array_map(fn($p)=>Storage::disk('public')->url($p),$note->images??[]),
            'labels'=>$note->labels->map(fn($l)=>['id'=>$l->id,'name'=>$l->name])->toArray(),
            'updated_at'=>$note->updated_at->toISOString(),'is_shared'=>true,'is_pinned'=>false,'is_locked'=>false],
            'permission'=>$share->permission]);
    }

    public function update(Request $request, $id) {
        SharedNote::where('note_id',$id)->where('recipient_id',$request->user()->id)->where('permission','edit')->firstOrFail();
        $note = Note::findOrFail($id);
        $data = $request->validate(['title'=>['sometimes','nullable','string','max:500'],'content'=>['sometimes','nullable','string']]);
        $note->update($data);
        broadcast(new NoteUpdated($note->id,$note->title,$note->content,$request->user()->id,$note->updated_at->toISOString()))->toOthers();
        return response()->json(['note'=>['id'=>$note->id,'title'=>$note->title,'content'=>$note->content,'updated_at'=>$note->updated_at->toISOString()]]);
    }

    public function uploadImages(Request $request, $id) {
        SharedNote::where('note_id',$id)->where('recipient_id',$request->user()->id)->where('permission','edit')->firstOrFail();
        $note = Note::findOrFail($id);
        $request->validate(['images'=>['required','array'],'images.*'=>['image','max:5120']]);
        $existing = $note->images ?? [];
        foreach ($request->file('images') as $f) {
            $existing[] = $f->store("notes/{$note->id}", 'public');
        }
        $note->update(['images'=>$existing]);
        return response()->json(['images'=>array_map(fn($p)=>Storage::disk('public')->url($p), $existing)]);
    }

    public function removeImage(Request $request, $id) {
        SharedNote::where('note_id',$id)->where('recipient_id',$request->user()->id)->where('permission','edit')->firstOrFail();
        $note = Note::findOrFail($id);
        $data = $request->validate(['path'=>['required','string']]);
        Storage::disk('public')->delete($data['path']);
        $note->update(['images'=>array_values(array_filter($note->images ?? [], fn($p) => $p !== $data['path']))]);
        return response()->json(['message'=>'Image removed.']);
    }
}
