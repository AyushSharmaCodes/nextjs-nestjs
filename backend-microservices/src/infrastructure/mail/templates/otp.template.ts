export interface OtpTemplateData {
  otp: string;
  expiryMinutes: number;
  type: string;
}

export function getOtpTemplate(data: OtpTemplateData) {
  const typeLabel = data.type === 'LOGIN' ? 'Login' : 'Verification';
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 40px auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #b45309; /* amber-700 branding */
      text-align: center;
      margin-bottom: 24px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 12px;
      text-align: center;
    }
    .desc {
      font-size: 14px;
      color: #4b5563;
      line-height: 1.5;
      margin-bottom: 32px;
      text-align: center;
    }
    .code-box {
      background-color: #f3f4f6;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 4px;
      color: #1f2937;
      margin-bottom: 32px;
    }
    .footer {
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
      border-top: 1px solid #f3f4f6;
      padding-top: 24px;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Meri Gau Mata</div>
    <div class="title">${typeLabel} OTP Code</div>
    <p class="desc">Please use the verification code below to complete your authentication. This code is valid for <strong>${data.expiryMinutes} minutes</strong>.</p>
    <div class="code-box">${data.otp}</div>
    <div class="footer">
      If you did not request this email, you can safely ignore it.
    </div>
  </div>
</body>
</html>`;

  const text = `Your ${typeLabel} OTP code is: ${data.otp}\n\nIt is valid for ${data.expiryMinutes} minutes.`;

  return { html, text, subject: `Your ${typeLabel} OTP Code` };
}
