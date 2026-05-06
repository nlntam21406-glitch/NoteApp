<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Note extends Model {
    protected $fillable = ['user_id','title','content','is_pinned','pinned_at','is_locked','lock_password','images'];
    protected $hidden   = ['lock_password'];
    protected $casts    = ['is_pinned'=>'boolean','is_locked'=>'boolean','pinned_at'=>'datetime','images'=>'array'];

    public function user()       { return $this->belongsTo(User::class); }
    public function labels()     { return $this->belongsToMany(Label::class, 'note_label'); }
    public function sharedWith() { return $this->hasMany(SharedNote::class); }
}
