<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketMessageController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('tickets', TicketController::class);

    Route::post('/tickets/{ticket}/reply', [TicketMessageController::class, 'store']);

    Route::get('/tickets/stats', [TicketController::class, 'stats']);

});