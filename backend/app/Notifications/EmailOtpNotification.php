<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class EmailOtpNotification extends Notification
{
    protected $otp;

    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your Email Verification OTP')
            ->greeting('Hello ' . $notifiable->name . ' 👋')
            ->line('Use the OTP below to verify your email:')
            ->line('🔢 **' . $this->otp . '**')
            ->line('This OTP expires in 10 minutes.')
            ->salutation('— ' . config('app.name'));
    }
}
