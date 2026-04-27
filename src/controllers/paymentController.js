import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * POST /api/payments/create-order
 * Initializes a Razorpay order.
 */
const createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise (100 paise = 1 INR)
            currency,
            receipt: `receipt_order_${Date.now()}`,
            payment_capture: 1
        };

        const response = await razorpay.orders.create(options);
        
        
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        });
    } catch (error) {
        console.error("Razorpay createOrder error:", error);
        res.status(500).json({ message: "Error creating Razorpay order", error: error.message });
    }
};

/**
 * GET /api/payments/fetch-payment/:paymentId
 * Fetches details of a specific payment.
 */
const fetchPayment = async (req, res) => {
    const { paymentId } = req.params;

    try {
        const payment = await razorpay.payments.fetch(paymentId);
        
        if (!payment) {
            return res.status(404).json({ message: "Razorpay Payment not found" });
        }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency,
            email: payment.email,
            contact: payment.contact
        });
    } catch (error) {
        console.error("Razorpay fetchPayment error:", error);
        res.status(500).json({ message: "Error fetching Razorpay payment", error: error.message });
    }
};

export default {
    createOrder,
    fetchPayment
};
