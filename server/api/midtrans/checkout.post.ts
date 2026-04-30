import midtransClient from "midtrans-client";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["monthly", "yearly", "lifetime"]),
});

export default defineEventHandler(async (event) => {
  const session = event.context.session;
  if (!session) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readValidatedBody(event, (b) => checkoutSchema.safeParse(b));
  if (!body.success) {
    throw createError({ statusCode: 400, message: "Invalid plan selected" });
  }

  const { plan } = body.data;
  const config = useRuntimeConfig(event);

  // Initialize Midtrans Snap
  const snap = new midtransClient.Snap({
    isProduction: config.midtrans.isProduction,
    serverKey: config.midtrans.serverKey,
    clientKey: config.public.midtrans.clientKey,
  });

  const orderId = `PREM-${session.user.id}-${Date.now()}`;
  let amount = 0;
  let name = "";

  if (plan === "monthly") {
    amount = 49000;
    name = "Premium 1 Month Pass";
  } else if (plan === "yearly") {
    amount = 399000;
    name = "Premium 1 Year Pass";
  } else if (plan === "lifetime") {
    amount = 799000;
    name = "Premium Lifetime Pass";
  }

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: session.user.name,
      email: session.user.email,
    },
    item_details: [
      {
        id: `plan_${plan}`,
        price: amount,
        quantity: 1,
        name: name,
      },
    ],
    // Embed the user ID and plan type in custom fields so the webhook can read them
    custom_field1: session.user.id,
    custom_field2: plan,
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error: any) {
    console.error("Midtrans Snap Error:", error);
    throw createError({ statusCode: 500, message: "Failed to create payment transaction" });
  }
});
