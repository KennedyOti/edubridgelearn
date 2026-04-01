<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationOtp extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $otp
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify your EduBridge Learn account - OTP: ' . $this->otp,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verify-otp',
            with: [
                'user' => $this->user,
                'otp' => $this->otp,
                'expiresInMinutes' => 15,
            ],
        );
    }
}
