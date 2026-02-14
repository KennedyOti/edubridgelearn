<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Config;

class ResetPasswordCustom extends ResetPassword
{
    public function toMail($notifiable)
    {
        // Link to your frontend reset page
        $url = config('app.frontend_url')
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Reset Your Password')
            ->greeting('Hello ' . $notifiable->name . ' 👋')
            ->line('You requested a password reset. Click below to reset your password.')
            ->action('Reset Password', $url)
            ->line('If you did not request this, no action is needed.');
    }
}
