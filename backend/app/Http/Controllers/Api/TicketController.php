<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
{
    $user = $request->user();

    if ($user->role === 'admin') {
        return Ticket::with(['customer','agent'])->latest()->get();
    }

    if ($user->role === 'agent') {
        return Ticket::where('agent_id', $user->id)
            ->with(['customer','agent'])
            ->latest()
            ->get();
    }

    return Ticket::where('customer_id', $user->id)
        ->with(['customer','agent'])
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

    public function stats(Request $request)
{
    $user = $request->user();

    $query = Ticket::query();

    if ($user->role === 'agent') {
        $query->where('agent_id', $user->id);
    }

    if ($user->role === 'customer') {
        $query->where('customer_id', $user->id);
    }

    return response()->json([
        'total' => (clone $query)->count(),
        'open' => (clone $query)->where('status', 'open')->count(),
        'pending' => (clone $query)->where('status', 'pending')->count(),
        'resolved' => (clone $query)->where('status', 'resolved')->count(),
        'closed' => (clone $query)->where('status', 'closed')->count(),
    ]);
}
}