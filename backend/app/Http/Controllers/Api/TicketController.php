<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        return Ticket::where('organization_id', $request->user()->organization_id)
            ->with(['customer', 'agent'])
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high',
        ]);

        $ticket = Ticket::create([
            'organization_id' => $user->organization_id,
            'customer_id' => $user->id,
            'subject' => $data['subject'],
            'description' => $data['description'],
            'priority' => $data['priority'],
            'status' => 'open',
        ]);

        return response()->json($ticket, 201);
    }

    public function show(Ticket $ticket)
{
    return $ticket->load([
        'customer',
        'agent',
        'messages.user',
    ]);
}

    public function update(Request $request, Ticket $ticket)
    {
        $ticket->update($request->only([
            'subject',
            'description',
            'priority',
            'status',
            'agent_id',
        ]));

        return response()->json($ticket);
    }

    public function destroy(Ticket $ticket)
    {
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket deleted successfully'
        ]);
    }
}