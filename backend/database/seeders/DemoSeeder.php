<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        User::truncate();
        Organization::truncate();

        $acme = Organization::create([
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
        ]);

        $beta = Organization::create([
            'name' => 'Beta Ltd',
            'slug' => 'beta-ltd',
        ]);

        User::create([
            'organization_id' => $acme->id,
            'name' => 'Admin',
            'email' => 'admin@acme.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'organization_id' => $acme->id,
            'name' => 'Agent',
            'email' => 'agent@acme.test',
            'password' => Hash::make('password'),
            'role' => 'agent',
        ]);

        User::create([
            'organization_id' => $acme->id,
            'name' => 'Customer',
            'email' => 'customer@acme.test',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        User::create([
            'organization_id' => $beta->id,
            'name' => 'Customer',
            'email' => 'customer@beta.test',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);
    }
}