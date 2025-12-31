/**
 * WhatsApp Service Usage Examples
 * 
 * This file demonstrates how to use the WhatsAppService in your controllers
 */

import whatsAppService from './WhatsAppService.js';

// ============================================
// Example 1: Send Collection Chit to Farmer
// ============================================
async function exampleSendCollectionChit() {
    try {
        const farmerDetails = {
            name: "Ram Kumar",
            phone: "9876543210"  // Can be with or without country code
        };

        const chitData = {
            chitId: "CH-2025-01234",
            collectionDate: "31-Dec-2025",
            buyerName: "Sharma Traders",
            vegetables: [
                { name: "Tomatoes", quantity: 50, unit: "kg" },
                { name: "Potatoes", quantity: 100, unit: "kg" },
                { name: "Onions", quantity: 75, unit: "kg" }
            ]
        };

        const result = await whatsAppService.sendCollectionChit(farmerDetails, chitData);

        console.log('Collection chit sent:', result);
        // {
        //   success: true,
        //   messageSid: "SM...",
        //   targetNumber: "whatsapp:+919876543210",
        //   isDevMode: true
        // }

        return result;
    } catch (error) {
        console.error('Failed to send collection chit:', error.message);
        throw error;
    }
}

// ============================================
// Example 2: Send Invoice PDF to Farmer
// ============================================
async function exampleSendInvoicePdf() {
    try {
        const farmerDetails = {
            name: "Sita Devi",
            phone: "+919123456789"
        };

        // PDF must be publicly accessible
        const pdfUrl = "https://your-domain.com/invoices/INV-2025-001.pdf";
        const caption = "📄 Your Invoice - INV-2025-001\n\nTotal Amount: ₹12,500\nPayment Due: 5-Jan-2025";

        const result = await whatsAppService.sendInvoicePdf(
            farmerDetails,
            pdfUrl,
            caption
        );

        console.log('Invoice PDF sent:', result);
        return result;
    } catch (error) {
        console.error('Failed to send invoice PDF:', error.message);
        throw error;
    }
}

// ============================================
// Example 3: Send AI Summary to Buyer
// ============================================
async function exampleSendAiSummaryToBuyer() {
    try {
        const buyerDetails = {
            name: "Sharma Traders",
            phone: "9988776655"
        };

        const summaryText = `📊 Daily Collection Summary

Total Farmers: 12
Total Quantity: 850 kg

Top Items:
• Tomatoes: 350 kg (41%)
• Potatoes: 300 kg (35%)
• Onions: 200 kg (24%)

Estimated Value: ₹42,500

🔔 5 farmers have pending dues totaling ₹18,000`;

        const result = await whatsAppService.sendAiSummary(
            "Buyer",
            buyerDetails,
            summaryText
        );

        console.log('AI summary sent to buyer:', result);
        return result;
    } catch (error) {
        console.error('Failed to send AI summary:', error.message);
        throw error;
    }
}

// ============================================
// Example 4: Send AI Summary to Admin
// ============================================
async function exampleSendAiSummaryToAdmin() {
    try {
        const adminDetails = {
            name: "Admin Dashboard",
            phone: "+919876543210"
        };

        const summaryText = `🎯 Weekly Performance Report

Week: 25-31 Dec 2025

📈 Key Metrics:
• Total Collections: 156
• Active Farmers: 45
• Active Buyers: 8
• Total Volume: 12,500 kg
• Total Revenue: ₹6,25,000

🏆 Top Performing Buyer:
Sharma Traders - 3,200 kg collected

⚠️ Alerts:
• 3 farmers have overdue payments
• 2 buyers haven't collected in 7 days`;

        const result = await whatsAppService.sendAiSummary(
            "Admin",
            adminDetails,
            summaryText
        );

        console.log('AI summary sent to admin:', result);
        return result;
    } catch (error) {
        console.error('Failed to send AI summary:', error.message);
        throw error;
    }
}

// ============================================
// Example 5: Send Custom Message
// ============================================
async function exampleSendCustomMessage() {
    try {
        const recipient = {
            name: "Ram Kumar",
            phone: "9876543210"
        };

        const message = `💰 Payment Confirmation

Dear Ram Kumar,

Your payment has been processed successfully!

Amount: ₹5,000
Transaction ID: TXN-2025-12345
Date: 31-Dec-2025

Your current balance: ₹0 (Fully Paid)

Thank you for your business! 🙏`;

        const result = await whatsAppService.sendCustomMessage(recipient, message);

        console.log('Custom message sent:', result);
        return result;
    } catch (error) {
        console.error('Failed to send custom message:', error.message);
        throw error;
    }
}

// ============================================
// Example 6: Integration in Controller
// ============================================
export async function createCollectionChitController(req, res) {
    try {
        const { farmerId, vegetables, buyerId } = req.body;

        // 1. Create collection chit in database
        const chit = await prisma.collectionChit.create({
            data: {
                farmerId,
                buyerId,
                vegetables: JSON.stringify(vegetables),
                status: 'COLLECTED'
            },
            include: {
                farmer: true,
                buyer: true
            }
        });

        // 2. Send WhatsApp notification to farmer
        const farmerDetails = {
            name: chit.farmer.name,
            phone: chit.farmer.phone
        };

        const chitData = {
            chitId: chit.id,
            collectionDate: new Date(chit.createdAt).toLocaleDateString('en-IN'),
            buyerName: chit.buyer.name,
            vegetables: JSON.parse(chit.vegetables)
        };

        // Send WhatsApp message (non-blocking)
        whatsAppService.sendCollectionChit(farmerDetails, chitData)
            .then(result => {
                console.log('WhatsApp notification sent:', result.messageSid);
            })
            .catch(error => {
                console.error('WhatsApp notification failed:', error.message);
                // Don't fail the request if WhatsApp fails
            });

        // 3. Return success response
        res.status(201).json({
            success: true,
            message: 'Collection chit created successfully',
            data: chit
        });

    } catch (error) {
        console.error('Error creating collection chit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create collection chit',
            error: error.message
        });
    }
}

// ============================================
// Example 7: Batch Notifications
// ============================================
async function exampleBatchNotifications() {
    const farmers = [
        { name: "Ram Kumar", phone: "9876543210" },
        { name: "Sita Devi", phone: "9123456789" },
        { name: "Mohan Lal", phone: "9988776655" }
    ];

    const message = `🎉 New Year Offer!

Get 5% bonus on all collections in January 2026!

Terms & Conditions Apply.
Contact your buyer for details.`;

    const results = [];

    for (const farmer of farmers) {
        try {
            const result = await whatsAppService.sendCustomMessage(farmer, message);
            results.push({ farmer: farmer.name, success: true, sid: result.messageSid });

            // Add delay to avoid rate limiting (optional)
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            results.push({ farmer: farmer.name, success: false, error: error.message });
        }
    }

    console.log('Batch notification results:', results);
    return results;
}

// ============================================
// Export examples for testing
// ============================================
export {
    exampleSendCollectionChit,
    exampleSendInvoicePdf,
    exampleSendAiSummaryToBuyer,
    exampleSendAiSummaryToAdmin,
    exampleSendCustomMessage,
    exampleBatchNotifications
};
