const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { requireAuth } = require("./auth_router");

const router = express.Router();

const PRICE_IDS = {
  basic: process.env.STRIPE_PRICE_BASIC,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

router.post("/create-checkout-session", requireAuth, async (req, res) => {
  const { plan } = req.body;

  if (!PRICE_IDS[plan]) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const user = req.user;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: user.stripeCustomerId || undefined,
      customer_email: user.stripeCustomerId ? undefined : user.email,
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      subscription_data: {
        metadata: { userId: user.id, plan },
      },
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    res.status(500).json({ error: "Could not create checkout session" });
  }
});

module.exports = router;
