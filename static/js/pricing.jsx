import { useState } from 'react';
import { createCheckoutSession } from './api-service.js';

export default function PricingCards() {
  const [loadingPlan, setLoadingPlan] = useState(null); // "basic" | "premium" | null

  async function handleGetStarted(plan) {
    setLoadingPlan(plan);
    try {
      const url = await createCheckoutSession(plan);
      window.location.href = url; // redirect to Stripe-hosted checkout page
    } catch (err) {
      alert('Something went wrong starting checkout. Please try again.');
      setLoadingPlan(null);
    }
  }

  return (
    <div className="pricing-cards">
      <div className="pricing-card">
        {/* ...Basic plan details... */}
        <button onClick={() => handleGetStarted('basic')} disabled={loadingPlan === 'basic'}>
          {loadingPlan === 'basic' ? 'Loading...' : 'Get Started'}
        </button>
      </div>

      <div className="pricing-card">
        {/* ...Premium plan details... */}
        <button onClick={() => handleGetStarted('premium')} disabled={loadingPlan === 'premium'}>
          {loadingPlan === 'premium' ? 'Loading...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}