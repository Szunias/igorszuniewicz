# EmailJS Setup Instructions

To enable the contact form to send emails directly to your inbox, follow these steps:

## 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email

## 2. Create Email Service
1. Go to "Email Services" in your EmailJS dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note down your **Service ID**

## 3. Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template:

```
Subject: {{subject}} - Portfolio Contact

From: {{from_name}} ({{from_email}})

Message:
{{message}}

---
Sent via Igor Szuniewicz Portfolio
```

4. Note down your **Template ID**

## 4. Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key**

## 5. Update Configuration
Edit `assets/js/contact-form.js` and replace:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',     // From step 2
  templateId: 'YOUR_TEMPLATE_ID',   // From step 3
  publicKey: 'YOUR_PUBLIC_KEY'      // From step 4
};
```

## 6. Test the Form
1. Open `contact.html`
2. Fill out the form
3. Submit - you should receive an email!

## Fallback Options
If EmailJS is not configured, the form will:
1. Save messages to localStorage (backup)
2. Open user's email client with pre-filled message
3. Show appropriate status messages

## Free Tier Limits
- EmailJS free tier: 200 emails/month
- Perfect for portfolio contact forms
- No server required!
