# WhatsApp Notification Service - Setup Guide

## Overview
The WhatsApp Notification Service integrates Twilio's WhatsApp API to send automated notifications to farmers and buyers. It includes a **Development Mode Interceptor** to safely test message logic without sending to actual recipients.

---

## 🔧 Environment Variables Required

Add the following variables to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_WHATSAPP_NUMBER="+14155238886"

# Development Mode - Redirect all messages to this number
# Format: +919876543210 (include country code)
DEV_TEST_NUMBER="+919876543210"

# Environment (set to 'production' to disable dev mode)
NODE_ENV="development"
```

### Getting Twilio Credentials

1. **Sign up for Twilio**: [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. **Get your Account SID and Auth Token** from the Twilio Console Dashboard
3. **Enable WhatsApp Sandbox**:
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to join your sandbox
   - Get your sandbox WhatsApp number (e.g., `+14155238886`)

---

## 🚧 Development Mode (Safe Testing)

### How It Works

When `NODE_ENV` is set to `development` (or anything other than `production`), **ALL messages are redirected** to the number specified in `DEV_TEST_NUMBER`.

### Message Format in Dev Mode

```
[🚧 DEV MODE - REDIRECTED]
Intended For: Farmer Ram (919876543210)
---------------------------------------
📄 Digital Collection Chit
Chit ID: CH-2025-01234
... (rest of the actual message)
```

This allows you to:
- ✅ Verify message content and formatting
- ✅ Test all notification logic safely
- ✅ See which user would have received the message
- ✅ Avoid accidentally spamming real farmers/buyers

### For PDF Messages

Since we cannot prepend text to a PDF file, the service sends **two messages**:
1. A text message with the dev mode header and recipient details
2. The actual PDF message

---

## 📚 Service Methods

### 1. `sendCollectionChit(farmerDetails, chitData)`

Sends a digital collection chit to a farmer after produce collection.

**Parameters:**
```javascript
farmerDetails = {
  name: "Ram Kumar",
  phone: "9876543210"  // Can be with or without country code
}

chitData = {
  chitId: "CH-2025-01234",
  collectionDate: "2025-12-31",
  buyerName: "Sharma Traders",
  vegetables: [
    { name: "Tomatoes", quantity: 50, unit: "kg" },
    { name: "Potatoes", quantity: 100, unit: "kg" }
  ]
}
```

**Usage Example:**
```javascript
import whatsAppService from './services/WhatsAppService.js';

const result = await whatsAppService.sendCollectionChit(
  { name: "Ram Kumar", phone: "9876543210" },
  {
    chitId: "CH-2025-01234",
    collectionDate: "2025-12-31",
    buyerName: "Sharma Traders",
    vegetables: [
      { name: "Tomatoes", quantity: 50, unit: "kg" },
      { name: "Potatoes", quantity: 100, unit: "kg" }
    ]
  }
);

console.log(result);
// {
//   success: true,
//   messageSid: "SM...",
//   targetNumber: "whatsapp:+919876543210",
//   isDevMode: true
// }
```

---

### 2. `sendInvoicePdf(farmerDetails, pdfUrl, caption)`

Sends an invoice PDF to a farmer.

**Parameters:**
```javascript
farmerDetails = {
  name: "Ram Kumar",
  phone: "9876543210"
}

pdfUrl = "https://your-domain.com/invoices/INV-2025-001.pdf"
caption = "Your Invoice - INV-2025-001"  // Optional
```

**Usage Example:**
```javascript
const result = await whatsAppService.sendInvoicePdf(
  { name: "Ram Kumar", phone: "9876543210" },
  "https://your-domain.com/invoices/INV-2025-001.pdf",
  "Your Invoice - INV-2025-001"
);
```

> **Note:** In dev mode, this sends TWO messages:
> 1. Text message with dev header
> 2. PDF message

---

### 3. `sendAiSummary(userRole, userDetails, summaryText)`

Sends AI-generated summaries to buyers or admins.

**Parameters:**
```javascript
userRole = "Buyer"  // or "Admin"

userDetails = {
  name: "Sharma Traders",
  phone: "9123456789"
}

summaryText = "Today's collection summary: 500kg tomatoes, 300kg potatoes..."
```

**Usage Example:**
```javascript
const result = await whatsAppService.sendAiSummary(
  "Buyer",
  { name: "Sharma Traders", phone: "9123456789" },
  "Today's collection summary: 500kg tomatoes, 300kg potatoes from 5 farmers."
);
```

---

### 4. `sendCustomMessage(recipient, message)`

Send any custom WhatsApp message.

**Usage Example:**
```javascript
const result = await whatsAppService.sendCustomMessage(
  { name: "Ram Kumar", phone: "9876543210" },
  "Your payment of ₹5000 has been processed successfully!"
);
```

---

## 🔄 Switching to Production Mode

When you're ready to send messages to actual users:

1. Update your `.env` file:
   ```env
   NODE_ENV="production"
   ```

2. The service will automatically:
   - ✅ Send messages to the actual recipient numbers
   - ✅ Remove dev mode headers
   - ✅ Disable message redirection

---

## 🧪 Testing Checklist

Before going to production, test the following in dev mode:

- [ ] Collection chit with single vegetable
- [ ] Collection chit with multiple vegetables
- [ ] Invoice PDF sending
- [ ] AI summary to buyer
- [ ] AI summary to admin
- [ ] Phone numbers with country code (+919876543210)
- [ ] Phone numbers without country code (9876543210)
- [ ] Verify all messages arrive at DEV_TEST_NUMBER
- [ ] Verify dev mode headers are present
- [ ] Verify intended recipient details are correct

---

## 📱 Phone Number Format

The service automatically handles various phone number formats:

```javascript
// All these formats work:
"9876543210"        // → +919876543210
"919876543210"      // → +919876543210
"+919876543210"     // → +919876543210
"91 98765 43210"    // → +919876543210
```

Default country code is **+91 (India)**. Modify the `formatWhatsAppNumber()` method if you need a different default.

---

## ⚠️ Important Notes

1. **Twilio Sandbox Limitations**:
   - Free tier has message limits
   - Recipients must join your sandbox first (send a specific message to your Twilio number)
   - For production, you need to apply for WhatsApp Business API approval

2. **PDF URLs**:
   - Must be publicly accessible (no authentication required)
   - Twilio needs to download the PDF to send it
   - Consider using cloud storage (AWS S3, Cloudinary, etc.)

3. **Message Costs**:
   - WhatsApp messages have per-message costs in production
   - Check Twilio pricing: [https://www.twilio.com/whatsapp/pricing](https://www.twilio.com/whatsapp/pricing)

4. **Rate Limits**:
   - Twilio has rate limits on message sending
   - Implement queuing for bulk messages if needed

---

## 🐛 Troubleshooting

### Error: "Missing required environment variables"
- Check that all Twilio variables are set in `.env`
- Ensure `DEV_TEST_NUMBER` is set when `NODE_ENV` is not `production`

### Error: "Authentication failed"
- Verify your `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- Check for extra spaces in your `.env` file

### Messages not arriving
- Ensure recipient has joined your Twilio WhatsApp sandbox
- Check Twilio console logs for delivery status
- Verify phone number format includes country code

### PDF not sending
- Ensure PDF URL is publicly accessible
- Test the URL in a browser (should download directly)
- Check file size (Twilio has limits, typically 5MB)

---

## 📞 Support

For Twilio-specific issues, check:
- [Twilio WhatsApp Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio Console Logs](https://console.twilio.com/)
- [Twilio Support](https://support.twilio.com/)
