const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require('../models/users');

router.post('/', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  // Step A: verify the event actually came from Stripe
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw buffer, thanks to express.raw() in server.js
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Step B: handle the event types you care about
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        // Fetch full subscription to get plan + period end + status
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const plan = subscription.metadata.plan; // "basic" or "premium", set in Step 5

        await User.update(
          {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: subscription.status, // "active"
            subscriptionPlan: plan,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          { where: { id: userId } }
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await User.update(
          {
            subscriptionStatus: subscription.status, // e.g. "active", "past_due"
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          { where: { stripeSubscriptionId: subscription.id } }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await User.update(
          {
            subscriptionStatus: 'canceled',
            subscriptionPlan: null,
          },
          { where: { stripeSubscriptionId: subscription.id } }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await User.update(
          { subscriptionStatus: 'past_due' },
          { where: { stripeSubscriptionId: invoice.subscription } }
        );
        break;
      }

      default:
        // Unhandled event type — fine to ignore, just don't error
        break;
    }

    // Step C: always acknowledge receipt, or Stripe will retry (and keep retrying)
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    // Return 500 so Stripe retries this event later — don't swallow real DB failures
    res.status(500).send('Webhook handler failed');
  }
});

module.exports = router;