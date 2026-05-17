<?php
namespace Database\Seeders;
use App\Models\{User, Note, Label};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        // Clear existing notes and labels
        Note::query()->delete();
        Label::query()->delete();

        $admin = User::firstOrCreate(
            ['email' => 'admin@noteapp.com'],
            [
                'display_name'      => 'Admin User',
                'password'          => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'preferences'       => ['fontSize' => 'medium', 'noteColor' => '#ffffff', 'theme' => 'light'],
            ]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'user2@noteapp.com'],
            [
                'display_name'      => 'Second User',
                'password'          => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'preferences'       => ['fontSize' => 'medium', 'noteColor' => '#dbeafe', 'theme' => 'light'],
            ]
        );

        // Create labels for admin
        $animal  = Label::create(['user_id' => $admin->id, 'name' => 'Animal']);
        $foods   = Label::create(['user_id' => $admin->id, 'name' => 'Foods']);
        $drinks  = Label::create(['user_id' => $admin->id, 'name' => 'Drinks']);
        $subject = Label::create(['user_id' => $admin->id, 'name' => 'Subject']);

        // Note 1: Tiger - Animal
        $n1 = Note::create([
            'user_id' => $admin->id,
            'title'   => 'Tiger',
            'content' => "The tiger is the largest living cat species and a member of the genus Panthera. It is most recognizable for its dark vertical stripes on orange fur with a white underside. Tigers are apex predators, primarily hunting ungulates such as deer and wild boar. They are territorial and generally solitary but social animals. Tigers once ranged from eastern Turkey through South and Southeast Asia to the Russian Far East.",
        ]);
        $n1->labels()->attach([$animal->id]);

        // Note 2: Butterfly - Animal
        $n2 = Note::create([
            'user_id' => $admin->id,
            'title'   => 'Butterfly',
            'content' => "Butterflies are insects in the order Lepidoptera, known for their large, often brightly colored wings and conspicuous fluttering flight. They undergo a four-stage life cycle: egg, larva (caterpillar), pupa (chrysalis), and adult. Butterflies play an important role in pollinating flowering plants. There are approximately 17,500 species of butterflies worldwide, found on every continent except Antarctica.",
        ]);
        $n2->labels()->attach([$animal->id]);

        // Note 3: Cocacola - Drinks
        $n3 = Note::create([
            'user_id' => $admin->id,
            'title'   => 'Cocacola',
            'content' => "Coca-Cola is a carbonated soft drink manufactured by The Coca-Cola Company, headquartered in Atlanta, Georgia. It was invented in 1886 by pharmacist John Stith Pemberton and originally marketed as a temperance drink. Coca-Cola is one of the most recognized brands in the world, sold in over 200 countries with nearly two billion servings consumed daily.",
        ]);
        $n3->labels()->attach([$drinks->id]);

        // Note 4: Math - Subject
        $n4 = Note::create([
            'user_id' => $admin->id,
            'title'   => 'Math',
            'content' => "Mathematics is the study of numbers, quantities, shapes, and patterns. It is a fundamental discipline that underpins science, engineering, technology, and finance. Key branches include algebra, geometry, calculus, statistics, and number theory. Mathematics develops logical reasoning and problem-solving skills essential for understanding the world around us.",
        ]);
        $n4->labels()->attach([$subject->id]);

        // Note 5: Noodle - Foods
        $n5 = Note::create([
            'user_id' => $admin->id,
            'title'   => 'Noodle',
            'content' => "Noodles are a staple food in many cultures, made from unleavened dough that is rolled flat and cut into various shapes. They are commonly made from wheat, rice, buckwheat, or mung bean starch. Noodles can be served hot in soup, stir-fried, or cold with dipping sauce. Popular varieties include ramen from Japan, pho from Vietnam, and pasta from Italy.",
        ]);
        $n5->labels()->attach([$foods->id]);

        // Note 6: Fish - Foods and Animal
        $n6 = Note::create([
            'user_id' => $admin->id,
            'title'   => 'Fish',
            'content' => "Fish are aquatic vertebrates that breathe through gills and have fins for swimming. There are over 34,000 known species of fish, making them the most diverse group of vertebrates. Fish are an important food source worldwide, rich in protein and omega-3 fatty acids. Common edible fish include salmon, tuna, cod, and tilapia. They are prepared by grilling, frying, steaming, or eating raw as sashimi.",
        ]);
        $n6->labels()->attach([$foods->id, $animal->id]);

        // Note 7: Pepsi - Drinks
        $n7 = Note::create([
            'user_id' => $admin->id,
            'title'   => 'Pepsi',
            'content' => "Pepsi is a carbonated soft drink produced and manufactured by PepsiCo. It was originally created in 1893 by Caleb Bradham, a pharmacist from North Carolina, and was first known as Brad's Drink. Pepsi is one of the most popular soft drinks in the world and the main competitor to Coca-Cola. The brand is known for its blue, red, and white logo and its long history of celebrity endorsements in advertising campaigns.",
        ]);
        $n7->labels()->attach([$drinks->id]);

        $this->command->info("Demo data seeded! Login: admin@noteapp.com / Password123!");
    }
}
