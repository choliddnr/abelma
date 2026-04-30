import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../../utils/db";
import { user } from "../../utils/db/schema";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  if (!body) {
    return { status: "ignored", message: "Empty body" };
  }

  // Verify Midtrans Signature Key
  // SHA512(order_id + status_code + gross_amount + server_key)
  const orderId = body.order_id;
  const statusCode = body.status_code;
  const grossAmount = body.gross_amount;
  const serverKey = config.midtrans.serverKey;
  const signatureKey = body.signature_key;

  const rawString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const hash = crypto.createHash("sha512").update(rawString).digest("hex");

  if (hash !== signatureKey) {
    throw createError({ statusCode: 403, message: "Invalid Signature" });
  }

  const transactionStatus = body.transaction_status;
  const fraudStatus = body.fraud_status;
  const userId = body.custom_field1;
  const plan = body.custom_field2;

  if (!userId) {
    return { status: "ignored", message: "Missing userId in custom_field1" };
  }

  let isSuccess = false;

  if (transactionStatus == "capture") {
    if (fraudStatus == "accept") {
      isSuccess = true;
    }
  } else if (transactionStatus == "settlement") {
    isSuccess = true;
  }

  if (isSuccess) {
    // Determine the new premium expiration date
    let durationMonths = 0;
    if (plan === "monthly") durationMonths = 1;
    else if (plan === "yearly") durationMonths = 12;
    else if (plan === "lifetime") durationMonths = 1200; // 100 years

    if (durationMonths > 0) {
      const dbInstance = db(event);
      // Fetch current user to extend premium time if they already have it
      const currentUser = await dbInstance.select().from(user).where(eq(user.id, userId)).get();

      if (currentUser) {
        let newExpiration = new Date();
        if (currentUser.premiumUntil && currentUser.premiumUntil > new Date()) {
          newExpiration = new Date(currentUser.premiumUntil);
        }
        newExpiration.setMonth(newExpiration.getMonth() + durationMonths);

        await dbInstance
          .update(user)
          .set({
            tier: "premium",
            premiumUntil: newExpiration,
          })
          .where(eq(user.id, userId));
      }
    }
    return { status: "ok", message: "Payment successful, premium applied." };
  }

  return { status: "ok", message: "Notification handled (not a success state)." };
});
