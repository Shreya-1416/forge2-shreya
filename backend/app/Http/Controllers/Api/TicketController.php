<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index()
    {
        return Ticket::with(['customer','agent'])->latest()->get();
    }

    public function store(Request $request)
{
    $data = $request->validate([
        'subject' => 'required|string|max:255',
        'description' => 'required|string',
        'priority' => 'required|in:low,medium,high',
    ]);

    $user = \App\Models\User::where('email', 'admin@acme.test')->first();

$data['organization_id'] = $user->organization_id;
$data['customer_id'] = $user->id;
    $data['status'] = 'open';

    $ticket = Ticket::create($data);

    return response()->json($ticket, 201);
}

    public function show(Ticket $ticket)
    {
        return $ticket->load(['customer','agent','messages']);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $ticket->update($request->all());

        return $ticket;
    }

    public function destroy(Ticket $ticket)
    {
        $ticket->delete();

        return response()->json([
            'message'=>'Deleted'
        ]);
    }
}