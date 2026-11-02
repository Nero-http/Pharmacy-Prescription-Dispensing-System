
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\DispenseRecordController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Inertia\Inertia;

// Redirect visitors to login and authenticated users to PPDS.
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

// Protect all PPDS pages.
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('settings', fn () => redirect()->route('profile.edit'))->name('settings');
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');
    Route::get('settings/appearance', fn () => Inertia::render('settings/appearance'))
        ->name('appearance.edit');

    Route::resource('medicines', MedicineController::class)
        ->only(['index', 'create', 'store', 'edit', 'update']);

    Route::resource('dispense-records', DispenseRecordController::class)
        ->only(['index', 'create', 'store', 'edit', 'update']);

});

// Load Laravel authentication routes.
require __DIR__.'/auth.php';
