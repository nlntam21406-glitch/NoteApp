<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, Notifiable;
    protected $fillable = ['email','display_name','password','email_verification_token','email_verified_at','preferences','avatar'];
    protected $hidden   = ['password','remember_token','email_verification_token'];
    protected $casts    = ['email_verified_at'=>'datetime','password'=>'hashed','preferences'=>'array'];

    public function isVerified(): bool { return !is_null($this->email_verified_at); }

    public function getPreferencesAttribute($value): array {
        $defaults = ['fontSize'=>'medium','noteColor'=>'#ffffff','theme'=>'light'];
        return array_merge($defaults, $value ? (json_decode($value, true) ?? []) : []);
    }

    public function notes()       { return $this->hasMany(Note::class); }
    public function labels()      { return $this->hasMany(Label::class); }
    public function sharedWithMe(){ return $this->hasMany(SharedNote::class, 'recipient_id'); }
}
