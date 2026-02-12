<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailCustom extends VerifyEmail
{
    /*  protected function verificationUrl($notifiable)
     {
         $signedUrl = URL::temporarySignedRoute(
             'verification.verify',
             now()->addMinutes(
                 config('auth.verification.expire', 60)
             ),
             [
                 'id' => $notifiable->getKey(),
                 'hash' => sha1($notifiable->getEmailForVerification()),
             ]
         );

         $query = parse_url($signedUrl, PHP_URL_QUERY);

         return config('app.frontend_url') . '/verify-email?' . $query;
     }
  */
    protected function verificationUrl($notifiable)
    {
        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(
                config('auth.verification.expire', 60)
            ),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        $parsed = parse_url($signedUrl);

        $pathSegments = explode('/', trim($parsed['path'], '/'));
        $id = $pathSegments[count($pathSegments) - 2];
        $hash = $pathSegments[count($pathSegments) - 1];

        return config('app.frontend_url')
            . "/verify-email?id={$id}&hash={$hash}&{$parsed['query']}";
    }


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
