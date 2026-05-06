<?php
namespace App\Http\Controllers;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class NotePasswordController extends Controller {

    public function verify(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        if (!$note->is_locked) return response()->json(['message'=>'Note is not locked.'], 400);
        $data = $request->validate(['password'=>['required','string']]);
        if (!Hash::check($data['password'], $note->lock_password))
            return response()->json(['message'=>'Incorrect password.'], 403);
        $unlockToken = $request->user()->createToken("note-unlock-{$note->id}",["note:{$note->id}:read"],now()->addHours(2))->plainTextToken;
        return response()->json(['unlock_token'=>$unlockToken,'note'=>['id'=>$note->id,'is_locked'=>true]]);
    }

    public function enable(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        $data = $request->validate(['password'=>['required','string','min:4','confirmed']]);
        $note->update(['is_locked'=>true,'lock_password'=>Hash::make($data['password'])]);
        return response()->json(['message'=>'Note is now password-protected.','note'=>['id'=>$note->id,'is_locked'=>true]]);
    }

    public function change(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        if (!$note->is_locked) return response()->json(['message'=>'Note is not locked.'], 400);
        $data = $request->validate(['current_password'=>['required','string'],'password'=>['required','string','min:4','confirmed']]);
        if (!Hash::check($data['current_password'], $note->lock_password))
            return response()->json(['message'=>'Current password is incorrect.','errors'=>['current_password'=>['Current password is incorrect.']]], 422);
        $note->update(['lock_password'=>Hash::make($data['password'])]);
        $request->user()->tokens()->where('name',"note-unlock-{$note->id}")->delete();
        return response()->json(['message'=>'Password updated.']);
    }

    public function disable(Request $request, $id) {
        $note = $this->findOwned($id, $request->user());
        if (!$note->is_locked) return response()->json(['message'=>'Note is not locked.'], 400);
        $data = $request->validate(['current_password'=>['required','string']]);
        if (!Hash::check($data['current_password'], $note->lock_password))
            return response()->json(['message'=>'Incorrect password.','errors'=>['current_password'=>['Incorrect password.']]], 422);
        $note->update(['is_locked'=>false,'lock_password'=>null]);
        $request->user()->tokens()->where('name',"note-unlock-{$note->id}")->delete();
        return response()->json(['message'=>'Password protection removed.','note'=>['id'=>$note->id,'is_locked'=>false]]);
    }

    private function findOwned($id, $user): Note {
        return Note::where('id',$id)->where('user_id',$user->id)->firstOrFail();
    }
}
