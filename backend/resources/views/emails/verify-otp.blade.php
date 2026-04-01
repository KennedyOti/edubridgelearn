<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email - EduBridge Learn</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 32px; font-size: 24px; font-weight: bold; color: #3B82F6; }
        h1 { font-size: 22px; color: #1e293b; margin-bottom: 8px; }
        p { color: #64748b; line-height: 1.6; }
        .otp-box { background: #EFF6FF; border: 2px dashed #3B82F6; border-radius: 8px; text-align: center; padding: 24px; margin: 28px 0; }
        .otp { font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #3B82F6; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">EduBridge Learn</div>
        <h1>Verify your email address</h1>
        <p>Hi {{ $user->name }},</p>
        <p>Welcome to EduBridge Learn! Use the OTP below to verify your email address. This code expires in {{ $expiresInMinutes }} minutes.</p>
        <div class="otp-box">
            <div class="otp">{{ $otp }}</div>
        </div>
        <p>Enter this code in the app to complete your account verification. Do not share this code with anyone.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <div class="footer">
            <p>&copy; {{ date('Y') }} EduBridge Learn. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
