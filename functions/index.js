const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const stripe = require('stripe')(functions.config().stripe?.secret_key || 'sk_test_placeholder');
const sgMail = require('@sendgrid/mail');
const hubspot = require('@hubspot/api-client');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize SendGrid
sgMail.setApiKey(functions.config().sendgrid?.api_key || 'SG.placeholder');

// Initialize HubSpot
const hubspotClient = new hubspot.Client({ 
    accessToken: functions.config().hubspot?.api_key || 'placeholder' 
});

// Gemini AI Processing Function
exports.processAssessment = functions.https.onCall(async (data, context) => {
    try {
        const { answers, timestamp } = data;
        
        // Generate assessment ID
        const assessmentId = db.collection('assessments').doc().id;
        
        // Calculate SPAR Score (placeholder logic - will integrate with Gemini)
        const sparScore = calculateSPARScore(answers);
        
        // Generate public token for sharing
        const publicToken = generatePublicToken();
        
        // Create assessment document
        const assessmentData = {
            id: assessmentId,
            answers,
            sparScore,
            publicToken,
            userId: context.auth?.uid || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'processing',
            tier: 'tier1'
        };
        
        await db.collection('assessments').doc(assessmentId).set(assessmentData);
        
        // Create public token document (90-day expiration)
        await db.collection('publicTokens').doc(publicToken).set({
            assessmentId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: admin.firestore.Timestamp.fromDate(
                new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            )
        });
        
        // Send to HubSpot CRM
        await createHubSpotContact(answers);
        
        // Process with AI (async - don't wait)
        processWithAI(assessmentId, answers);
        
        return {
            success: true,
            assessmentId,
            publicToken,
            sparScore
        };
        
    } catch (error) {
        console.error('Error processing assessment:', error);
        throw new functions.https.HttpsError('internal', 'Failed to process assessment');
    }
});

// Helper function to calculate SPAR score
function calculateSPARScore(answers) {
    // Placeholder scoring logic
    const scores = {
        S: 0, // Site
        P: 0, // Permitting
        A: 0, // Architecture
        R: 0  // Resources
    };
    
    // Site score based on lot size
    switch (answers.lot_size) {
        case 'xlarge': scores.S = 25; break;
        case 'large': scores.S = 20; break;
        case 'medium': scores.S = 15; break;
        case 'small': scores.S = 10; break;
        default: scores.S = 12;
    }
    
    // Permitting score (placeholder - would use real zoning data)
    scores.P = 18;
    
    // Architecture score based on use case
    switch (answers.primary_use) {
        case 'rental': scores.A = 22; break;
        case 'family': scores.A = 20; break;
        case 'office': scores.A = 18; break;
        default: scores.A = 19;
    }
    
    // Resources score based on budget and financing
    if (answers.budget_range === 'luxury' && answers.financing !== 'unsure') {
        scores.R = 23;
    } else if (answers.budget_range === 'premium') {
        scores.R = 20;
    } else if (answers.budget_range === 'standard') {
        scores.R = 17;
    } else {
        scores.R = 14;
    }
    
    const total = scores.S + scores.P + scores.A + scores.R;
    
    return {
        total,
        breakdown: scores,
        category: getScoreCategory(total)
    };
}

function getScoreCategory(score) {
    if (score >= 76) return 'Excellent Potential';
    if (score >= 51) return 'Good Potential';
    if (score >= 26) return 'Moderate Challenges';
    return 'Major Roadblocks';
}

function generatePublicToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

async function createHubSpotContact(answers) {
    try {
        // Extract email from property_address or use placeholder
        const email = `${generatePublicToken()}@assessment.adulab.ai`;
        
        const contactData = {
            properties: {
                email,
                firstname: 'ADU Lab',
                lastname: 'Assessment User',
                adu_property_address: answers.property_address || 'Not provided',
                adu_primary_use: answers.primary_use,
                adu_lot_size: answers.lot_size,
                adu_budget_range: answers.budget_range,
                adu_timeline: answers.timeline,
                adu_financing: answers.financing,
                lifecyclestage: 'lead',
                adu_assessment_date: new Date().toISOString()
            }
        };
        
        // Create contact in HubSpot
        // await hubspotClient.crm.contacts.basicApi.create(contactData);
        console.log('HubSpot contact creation placeholder:', contactData);
        
    } catch (error) {
        console.error('HubSpot error:', error);
        // Don't throw - this shouldn't break the assessment
    }
}

async function processWithAI(assessmentId, answers) {
    try {
        // This would integrate with Gemini API
        // For now, simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate detailed report content
        const reportContent = generateReportContent(answers);
        
        // Update assessment with AI results
        await db.collection('assessments').doc(assessmentId).update({
            status: 'completed',
            reportContent,
            processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Send email notification if user provided email
        // await sendAssessmentEmail(assessmentId);
        
    } catch (error) {
        console.error('AI processing error:', error);
        await db.collection('assessments').doc(assessmentId).update({
            status: 'error',
            error: error.message
        });
    }
}

function generateReportContent(answers) {
    // Placeholder report generation
    return {
        summary: {
            keyFindings: [
                'Your property shows strong potential for ADU development',
                'Zoning regulations in your area are ADU-friendly',
                'Your budget aligns well with typical construction costs'
            ],
            projectSnapshot: {
                estimatedCost: '$150,000 - $200,000',
                estimatedTimeline: '6-8 months',
                permitDifficulty: 'Moderate',
                returnOnInvestment: '7-10 years'
            }
        },
        // Additional report sections would be generated here
    };
}

// Stripe Payment Processing
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            const { priceId, assessmentId, successUrl, cancelUrl } = req.body;
            
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price: priceId,
                    quantity: 1
                }],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    assessmentId
                }
            });
            
            res.json({ sessionId: session.id });
            
        } catch (error) {
            console.error('Stripe error:', error);
            res.status(500).json({ error: error.message });
        }
    });
});

// Stripe Webhook Handler
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            functions.config().stripe?.webhook_secret || 'whsec_placeholder'
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleSuccessfulPayment(session);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
});

async function handleSuccessfulPayment(session) {
    const { assessmentId } = session.metadata;
    
    // Create payment record
    await db.collection('payments').add({
        assessmentId,
        stripeSessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update assessment to paid tier
    await db.collection('assessments').doc(assessmentId).update({
        tier: 'tier2', // Or tier3 based on product
        paidAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send confirmation email
    // await sendPaymentConfirmation(session);
}

// Email Functions
exports.sendAssessmentEmail = functions.firestore
    .document('assessments/{assessmentId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const previousData = change.before.data();
        
        // Only send email when status changes to completed
        if (newData.status === 'completed' && previousData.status !== 'completed') {
            // Send email logic here
            console.log('Would send assessment email for:', context.params.assessmentId);
        }
    });

// Scheduled function to clean up expired public tokens
exports.cleanupExpiredTokens = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        const now = admin.firestore.Timestamp.now();
        const expiredTokens = await db.collection('publicTokens')
            .where('expiresAt', '<', now)
            .get();
        
        const batch = db.batch();
        expiredTokens.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`Deleted ${expiredTokens.size} expired tokens`);
    });

// Export additional functions as needed...