const Stripe = require('stripe');
require('dotenv').config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

/**
 * Creates a Stripe Checkout Session for VIP Subscription
 */
async function createCheckoutSession(userEmail, domainUrl = 'https://berlinanmeldung.com') {
    if (!stripe) {
        console.warn('[Stripe Warning] STRIPE_SECRET_KEY not set. Operating in simulation mode.');
        return {
            success: true,
            simulated: true,
            url: `${domainUrl}/?payment=success&simulated=true`
        };
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'sepa_debit'],
            customer_email: userEmail || undefined,
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Berlin Termine VIP Fast-Pass Alerts',
                            description: 'Instant 1-Second Priority Email & Telegram Bürgeramt Appointment Notifications',
                            images: ['https://berlinanmeldung.com/logo.png'],
                        },
                        unit_amount: 499, // €4.99 EUR
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${domainUrl}/?payment=success`,
            cancel_url: `${domainUrl}/?payment=cancel`,
        });

        return {
            success: true,
            url: session.url
        };
    } catch (error) {
        console.error('[Stripe Error] Failed to create checkout session:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = { createCheckoutSession };
