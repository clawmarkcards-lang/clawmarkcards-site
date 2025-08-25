const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const Stripe = require('stripe');
admin.initializeApp();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    try {
      const { items, customer_email } = req.body;
      const line_items = (items||[]).map(it => ({
        price_data: {
          currency: 'usd',
          product_data: { name: it.name || 'Item', metadata: { sku: it.sku || '' } },
          unit_amount: Math.round(Number(it.price || 0) * 100),
        },
        quantity: Number(it.quantity || 1),
      }));

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items,
        customer_email,
        success_url: `${req.headers.origin}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cart.html`,
        shipping_address_collection: { allowed_countries: ['US','CA'] },
        automatic_tax: { enabled: true },
      });

      res.json({ id: session.id, url: session.url });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.sendStatus(400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const firestore = admin.firestore();
    const orderRef = firestore.collection('orders').doc(session.id);
    await orderRef.set({
      status: 'paid',
      customer_email: session.customer_details?.email || session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      created: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  res.sendStatus(200);
});