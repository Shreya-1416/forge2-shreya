<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;

class TicketMessageController extends Controller
{
    public function store(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'message' => 'required|string',
        ]);

        $data['ticket_id'] = $ticket->id;
        $data['user_id'] = $request->user()->id;
        $data['is_internal_note'] = false;

        $message = TicketMessage::create($data);

        return response()->json($message, 201);
    }
}