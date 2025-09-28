# 📧 Email Notifications Setup Guide

## Quick Setup for Gmail

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- Go to Google Account → Security → App passwords
- Generate a new app password for "Mail"
- Copy the 16-character password

### 3. Set Environment Variables
Create a `.env` file in your project root:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
APP_URL=http://localhost:3001
```

### 4. Install Dependencies
```bash
npm install nodemailer
```

### 5. Test Email Notifications
- Start your server: `npm start`
- Take the quiz with a test email
- Check if emails are being sent

## Production Setup Options

### Option 1: SendGrid (Recommended)
```javascript
const EMAIL_CONFIG = {
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
};
```

### Option 2: Mailgun
```javascript
const EMAIL_CONFIG = {
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_SMTP_USER,
    pass: process.env.MAILGUN_SMTP_PASS
  }
};
```

### Option 3: AWS SES
```javascript
const EMAIL_CONFIG = {
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASS
  }
};
```

## Email Template Features

The notification emails include:
- ✅ Beautiful HTML design matching your app
- ✅ Match details with compatibility scores
- ✅ Shared interests and thoughts preview
- ✅ Direct link back to your app
- ✅ Professional branding

## Troubleshooting

### Common Issues:
1. **"Authentication failed"** - Check your app password
2. **"Connection timeout"** - Check your internet connection
3. **"Invalid credentials"** - Verify email and password

### Testing:
- Use a test email address first
- Check server logs for email sending status
- Verify emails aren't going to spam folder

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Consider using a dedicated email service for production
- Implement rate limiting for email sending

---

**Note:** Email notifications will only work when properly configured. If not configured, the app will continue to work normally without sending emails.
