const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require('../models/users');
const { requireAuth } = require('./auth_router');

const PRICE_IDS = {
  basic: process.env.STRIPE_PRICE_BASIC,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

// requireAuth = your existing middleware that sets req.user
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  const { plan } = req.body; // "basic" or "premium" — sent from frontend button click

  if (!PRICE_IDS[plan]) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const user = req.user; // { id, email, stripeCustomerId }

  try {
    // Reuse existing Stripe customer if we already made one, else let Checkout create it
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: user.stripeCustomerId || undefined,
      customer_email: user.stripeCustomerId ? undefined : user.email,
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      // Pass your internal user id so the webhook can match it back later
      client_reference_id: user.id,
      subscription_data: {
        metadata: { userId: user.id, plan },
      },
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: 'Could not create checkout session' });
  }
});

module.exports = router;