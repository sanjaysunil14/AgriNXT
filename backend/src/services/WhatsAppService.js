import twilio from 'twilio';

/**
 * WhatsApp Notification Service
 * Handles sending WhatsApp messages via Twilio with development mode interceptor
 * 
 * In DEV MODE: All messages are redirected to DEV_TEST_NUMBER with recipient details prepended
 */
class WhatsAppService {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    /**
     * Initialize the service (lazy initialization)
     */
    initialize() {
        if (this.initialized) return;

        // Initialize Twilio client
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        this.twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
        this.devTestNumber = process.env.DEV_TEST_NUMBER;
        this.isDevMode = process.env.NODE_ENV !== 'production';

        // Validate required environment variables
        this.validateConfig();

        this.initialized = true;
    }

    /**
     * Validate that all required environment variables are set
     */
    validateConfig() {
        const required = [
            'TWILIO_ACCOUNT_SID',
            'TWILIO_AUTH_TOKEN',
            'TWILIO_WHATSAPP_NUMBER'
        ];

        if (this.isDevMode && !this.devTestNumber) {
            required.push('DEV_TEST_NUMBER');
        }

        const missing = required.filter(key => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missing.join(', ')}`
            );
        }
    }

    /**
     * Format phone number for WhatsApp (must include country code)
     * @param {string} phone - Phone number
     * @returns {string} Formatted WhatsApp number
     */
    formatWhatsAppNumber(phone) {
        // Remove any spaces, dashes, or parentheses
        let cleaned = phone.replace(/[\s\-()]/g, '');

        // Add country code if not present (assuming India +91)
        if (!cleaned.startsWith('+')) {
            if (!cleaned.startsWith('91')) {
                cleaned = '91' + cleaned;
            }
            cleaned = '+' + cleaned;
        }

        return `whatsapp:${cleaned}`;
    }

    /**
     * Get the target phone number based on dev mode
     * @param {string} intendedRecipient - Original recipient phone
     * @returns {string} Actual recipient (dev test number in dev mode)
     */
    getTargetNumber(intendedRecipient) {
        if (this.isDevMode && this.devTestNumber) {
            return this.formatWhatsAppNumber(this.devTestNumber);
        }
        return this.formatWhatsAppNumber(intendedRecipient);
    }

    /**
     * Prepend dev mode header to message body
     * @param {string} recipientName - Name of intended recipient
     * @param {string} recipientPhone - Phone of intended recipient
     * @param {string} messageBody - Original message content
     * @returns {string} Message with dev mode header
     */
    addDevModeHeader(recipientName, recipientPhone, messageBody) {
        if (!this.isDevMode || !this.devTestNumber) {
            return messageBody;
        }

        const header = `Intended For: ${recipientName} (${recipientPhone})
---------------------------------------

`;

        return header + messageBody;
    }

    /**
     * Send Collection Chit to Farmer
     * @param {Object} farmerDetails - Farmer information
     * @param {string} farmerDetails.name - Farmer's name
     * @param {string} farmerDetails.phone - Farmer's phone number
     * @param {Object} chitData - Collection chit data
     * @param {string} chitData.chitId - Unique chit ID
     * @param {Array} chitData.vegetables - List of vegetables collected
     * @param {string} chitData.collectionDate - Date of collection
     * @param {string} chitData.buyerName - Name of buyer
     * @returns {Promise<Object>} Twilio message response
     */
    async sendCollectionChit(farmerDetails, chitData) {
        this.initialize();
        try {
            // Construct the message body
            let messageBody = `📄 Digital Collection Chit

Chit ID: ${chitData.chitId}
Date: ${chitData.collectionDate}
Collected By: ${chitData.buyerName}

🥬 Items Collected:
`;

            // Add vegetable list
            chitData.vegetables.forEach((veg, index) => {
                messageBody += `${index + 1}. ${veg.name}: ${veg.quantity} ${veg.unit}\n`;
            });

            messageBody += `\n✅ This is your official digital collection record.
💰 Payment will be processed after pricing is finalized.

Thank you for your produce! 🙏`;

            // Apply dev mode header if needed
            const finalMessage = this.addDevModeHeader(
                farmerDetails.name,
                farmerDetails.phone,
                messageBody
            );

            // Get target number (dev test number in dev mode)
            const targetNumber = this.getTargetNumber(farmerDetails.phone);

            // Send message via Twilio
            const message = await this.client.messages.create({
                from: this.formatWhatsAppNumber(this.twilioWhatsAppNumber),
                to: targetNumber,
                body: finalMessage
            });

            console.log(`✅ Collection chit sent successfully. SID: ${message.sid}`);
            console.log(`📱 Target: ${targetNumber} ${this.isDevMode ? '(DEV MODE)' : ''}`);

            return {
                success: true,
                messageSid: message.sid,
                targetNumber,
                isDevMode: this.isDevMode
            };

        } catch (error) {
            console.error('❌ Error sending collection chit:', error);
            throw new Error(`Failed to send collection chit: ${error.message}`);
        }
    }

    /**
     * Send Invoice PDF to Farmer
     * @param {Object} farmerDetails - Farmer information
     * @param {string} farmerDetails.name - Farmer's name
     * @param {string} farmerDetails.phone - Farmer's phone number
     * @param {string} pdfUrl - Public URL of the PDF invoice
     * @param {string} caption - Caption for the PDF
     * @returns {Promise<Object>} Twilio message response
     */
    async sendInvoicePdf(farmerDetails, pdfUrl, caption = 'Your Invoice') {
        this.initialize();
        try {
            const targetNumber = this.getTargetNumber(farmerDetails.phone);

            // In dev mode, send a text message first with the dev header
            if (this.isDevMode && this.devTestNumber) {
                const devHeaderMessage = `[🚧 DEV MODE - REDIRECTED]
Intended For: ${farmerDetails.name} (${farmerDetails.phone})
---------------------------------------

📄 PDF Invoice will be sent next...`;

                await this.client.messages.create({
                    from: this.formatWhatsAppNumber(this.twilioWhatsAppNumber),
                    to: targetNumber,
                    body: devHeaderMessage
                });

                console.log('📝 Dev mode header sent for PDF message');
            }

            // Send the actual PDF
            const message = await this.client.messages.create({
                from: this.formatWhatsAppNumber(this.twilioWhatsAppNumber),
                to: targetNumber,
                body: caption,
                mediaUrl: [pdfUrl]
            });

            console.log(`✅ Invoice PDF sent successfully. SID: ${message.sid}`);
            console.log(`📱 Target: ${targetNumber} ${this.isDevMode ? '(DEV MODE)' : ''}`);

            return {
                success: true,
                messageSid: message.sid,
                targetNumber,
                isDevMode: this.isDevMode
            };

        } catch (error) {
            console.error('❌ Error sending invoice PDF:', error);
            throw new Error(`Failed to send invoice PDF: ${error.message}`);
        }
    }

    /**
     * Send AI Summary to Buyer or Admin
     * @param {string} userRole - Role of the user (Buyer/Admin)
     * @param {Object} userDetails - User information
     * @param {string} userDetails.name - User's name
     * @param {string} userDetails.phone - User's phone number
     * @param {string} summaryText - AI-generated summary text
     * @returns {Promise<Object>} Twilio message response
     */
    async sendAiSummary(userRole, userDetails, summaryText) {
        this.initialize();
        try {
            // Construct the message body
            let messageBody = `🤖 AI-Generated Summary

Role: ${userRole}
Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

${summaryText}

---
📊 This summary was automatically generated by our AI system.`;

            // Apply dev mode header if needed
            const finalMessage = this.addDevModeHeader(
                userDetails.name,
                userDetails.phone,
                messageBody
            );

            // Get target number (dev test number in dev mode)
            const targetNumber = this.getTargetNumber(userDetails.phone);

            // Send message via Twilio
            const message = await this.client.messages.create({
                from: this.formatWhatsAppNumber(this.twilioWhatsAppNumber),
                to: targetNumber,
                body: finalMessage
            });

            console.log(`✅ AI summary sent successfully. SID: ${message.sid}`);
            console.log(`📱 Target: ${targetNumber} ${this.isDevMode ? '(DEV MODE)' : ''}`);

            return {
                success: true,
                messageSid: message.sid,
                targetNumber,
                isDevMode: this.isDevMode
            };

        } catch (error) {
            console.error('❌ Error sending AI summary:', error);
            throw new Error(`Failed to send AI summary: ${error.message}`);
        }
    }

    /**
     * Send a custom WhatsApp message
     * @param {Object} recipient - Recipient information
     * @param {string} recipient.name - Recipient's name
     * @param {string} recipient.phone - Recipient's phone number
     * @param {string} message - Message to send
     * @returns {Promise<Object>} Twilio message response
     */
    async sendCustomMessage(recipient, message) {
        this.initialize();
        try {
            const finalMessage = this.addDevModeHeader(
                recipient.name,
                recipient.phone,
                message
            );

            const targetNumber = this.getTargetNumber(recipient.phone);

            const twilioMessage = await this.client.messages.create({
                from: this.formatWhatsAppNumber(this.twilioWhatsAppNumber),
                to: targetNumber,
                body: finalMessage
            });

            console.log(`✅ Custom message sent successfully. SID: ${twilioMessage.sid}`);
            console.log(`📱 Target: ${targetNumber} ${this.isDevMode ? '(DEV MODE)' : ''}`);

            return {
                success: true,
                messageSid: twilioMessage.sid,
                targetNumber,
                isDevMode: this.isDevMode
            };

        } catch (error) {
            console.error('❌ Error sending custom message:', error);
            throw new Error(`Failed to send custom message: ${error.message}`);
        }
    }
}

// Export singleton instance
export default new WhatsAppService();
