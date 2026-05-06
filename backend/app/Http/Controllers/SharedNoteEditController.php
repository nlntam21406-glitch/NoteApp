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
}
