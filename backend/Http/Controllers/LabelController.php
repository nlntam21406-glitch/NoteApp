<?php
namespace App\Http\Controllers;
use App\Models\Label;
use Illuminate\Http\Request;

class LabelController extends Controller {
    public function index(Request $request) {
        return response()->json(['labels'=>Label::where('user_id',$request->user()->id)->withCount('notes')->orderBy('name')->get()]);
    }
    public function store(Request $request) {
        $data  = $request->validate(['name'=>['required','string','max:100']]);
        $label = Label::firstOrCreate(['user_id'=>$request->user()->id,'name'=>$data['name']]);
        return response()->json(['label'=>$label], 201);
    }
    public function update(Request $request, $id) {
        $label = Label::where('id',$id)->where('user_id',$request->user()->id)->firstOrFail();
        $data  = $request->validate(['name'=>['required','string','max:100']]);
        $label->update(['name'=>$data['name']]);
        return response()->json(['label'=>$label]);
    }
    public function destroy(Request $request, $id) {
        Label::where('id',$id)->where('user_id',$request->user()->id)->firstOrFail()->delete();
        return response()->json(['message'=>'Label deleted.']);
    }
    public function attachToNote(Request $request, $noteId) {
        $note    = $request->user()->notes()->findOrFail($noteId);
        $data    = $request->validate(['label_ids'=>['required','array'],'label_ids.*'=>['integer','exists:labels,id']]);
        $validIds = Label::where('user_id',$request->user()->id)->whereIn('id',$data['label_ids'])->pluck('id');
        $note->labels()->sync($validIds);
        return response()->json(['labels'=>$note->fresh('labels')->labels->map(fn($l)=>['id'=>$l->id,'name'=>$l->name])]);
    }
}
