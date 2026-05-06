<?php
namespace Database\Seeders;
use App\Models\{User,Note,Label};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        $admin = User::firstOrCreate(['email'=>'admin@noteapp.com'],['display_name'=>'Admin User','password'=>Hash::make('Password123!'),'email_verified_at'=>now(),'preferences'=>['fontSize'=>'medium','noteColor'=>'#ffffff','theme'=>'light']]);
        $user2 = User::firstOrCreate(['email'=>'user2@noteapp.com'],['display_name'=>'Second User','password'=>Hash::make('Password123!'),'email_verified_at'=>now(),'preferences'=>['fontSize'=>'medium','noteColor'=>'#dbeafe','theme'=>'light']]);

        $work=Label::firstOrCreate(['user_id'=>$admin->id,'name'=>'Work']);
        $personal=Label::firstOrCreate(['user_id'=>$admin->id,'name'=>'Personal']);
        $ideas=Label::firstOrCreate(['user_id'=>$admin->id,'name'=>'Ideas']);

        $n1=Note::create(['user_id'=>$admin->id,'title'=>'Welcome to NoteApp 🎉','content'=>"Your note-taking app is ready!\n\n✅ Auto-save (no save button)\n✅ Pin notes to top\n✅ Lock notes with password\n✅ Share with other users\n✅ Works offline (PWA)\n\nClick '+ New note' to start!",'is_pinned'=>true,'pinned_at'=>now()]);
        $n1->labels()->attach([$personal->id]);

        $n2=Note::create(['user_id'=>$admin->id,'title'=>'Project Meeting Notes','content'=>"Action items:\n- Update documentation\n- Fix bug #123\n- Deploy to staging"]);
        $n2->labels()->attach([$work->id]);

        $n3=Note::create(['user_id'=>$admin->id,'title'=>'App Ideas 💡','content'=>"• Real-time collaboration\n• Dark mode support\n• Offline PWA sync\n• Label organization"]);
        $n3->labels()->attach([$ideas->id]);

        Note::create(['user_id'=>$admin->id,'title'=>'Shopping List','content'=>"☐ Milk\n☐ Eggs\n☐ Bread\n☐ Coffee"]);
        Note::create(['user_id'=>$user2->id,'title'=>'My Notes','content'=>'Hello! I am the second demo user.']);

        $this->command->info("✅ Demo data seeded! Login: admin@noteapp.com / Password123!");
    }
}
