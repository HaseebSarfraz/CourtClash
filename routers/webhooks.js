const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { User } = require("../models/users");

const router = express.Router();

router.post("/", async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const plan = subscription.metadata.plan;

        await User.update(
          {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: subscription.status,
            subscriptionPlan: plan,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          { where: { id: userId } },
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await User.update(
          {
            subscriptionStatus: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          { where: { stripeSubscriptionId: subscription.id } },
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await User.update(
          {
            subscriptionStatus: "canceled",
            subscriptionPlan: null,
          },
          { where: { stripeSubscriptionId: subscription.id } },
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await User.update(
          { subscriptionStatus: "past_due" },
          { where: { stripeSubscriptionId: invoice.subscription } },
        );
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).send("Webhook handler failed");
  }
});

module.exports = router;
