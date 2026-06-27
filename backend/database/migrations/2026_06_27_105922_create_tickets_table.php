<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('tickets', function (Blueprint $table) {
        $table->id();

        $table->foreignId('organization_id')->constrained()->cascadeOnDelete();

        $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();

        $table->foreignId('agent_id')
              ->nullable()
              ->constrained('users')
              ->nullOnDelete();

        $table->string('subject');

        $table->text('description');

        $table->enum('status', [
            'open',
            'pending',
            'resolved',
            'closed'
        ])->default('open');

        $table->enum('priority', [
            'low',
            'medium',
            'high'
        ])->default('medium');

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
