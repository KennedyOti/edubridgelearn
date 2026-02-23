<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailCustom extends VerifyEmail
{
     /**
     * Generate the frontend verification URL.
     *
     * @param  mixed  $notifiable
     * @return string
     */
    protected function verificationUrl($notifiable)
    {
        // Generate a temporary signed URL to the backend route
        $signedUrl = URL::temporarySignedRoute(
            'verification.verify', // backend route name
            now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // Only keep the query string
        $queryString = parse_url($signedUrl, PHP_URL_QUERY);

        // Return the frontend-friendly URL
        return config('app.frontend_url') . "/verify-email?" . $queryString;
    }

    /**
     * Build the email message.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $verifyUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Your Email Address')
            ->greeting('Hello ' . $notifiable->name . ' 👋')
            ->line('Welcome aboard! Please verify your email address to activate your account.')
            ->action('Verify Email', $verifyUrl)
            ->line('If you did not create an account, no action is required.')
            ->salutation('— The ' . config('app.name') . ' Team');
    }
}
