import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import { Check, Crown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Payment() {
  const RAZORPAY_KEY_ID = "rzp_test_RTJBBXdu6qLigb";

  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handlePayment = async (amount) => {
    if (isLoading || amount <= 0 || !scriptLoaded) return;

    setIsLoading(true);
    setStatus("Initiating payment... Please wait.");

    try {
      const response = await axios.post(
        "https://recipetracker-fg4e.onrender.com/api/payment/createOrders",
        { amount: amount * 100, currency: "USD" }
      );

      const { order_id, currency } = response.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency,
        name: "Recipe Tracker",
        description: "Premium Subscription",
        order_id,

        handler: async function (response) {
          setStatus("Payment successful. Verifying...");

          try {
            const verifyResponse = await axios.get(
              `https://recipetracker-fg4e.onrender.com/api/payment/${response.razorpay_payment_id}`,
              { withCredentials: true }
            );

            if (verifyResponse.data.status === "captured") {
              setStatus("Payment successful! Redirecting...");
              setTimeout(() => navigate("/"), 3000);
            } else {
              setStatus("Payment verification failed.");
            }
          } catch {
            setStatus("Verification error occurred.");
          }

          setIsLoading(false);
        },

        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9012345678",
        },

        theme: { color: "#3B82F6" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (res) {
        setStatus(`Payment Failed: ${res.error.description}`);
        setIsLoading(false);
      });

      rzp.open();
    } catch (error) {
      setStatus("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const plans = [
    {
      title: "Monthly Plan",
      price: 9.99,
      period: "month",
      features: [
        "Ad-free browsing",
        "Exclusive recipes",
        "Advanced filters",
      ],
      btn: "Subscribe Monthly",
    },
    {
      title: "Annual Plan",
      price: 99.99,
      period: "year",
      features: [
        "Unlimited saved recipes",
        "Exclusive collections",
        "Advanced filters",
      ],
      btn: "Subscribe Annually",
    },
    {
      title: "Lifetime Plan",
      price: 249.99,
      period: "lifetime",
      features: [
        "All annual benefits",
        "Future updates",
        "Priority support",
      ],
      btn: "Buy Lifetime",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Unlock Premium Flavors
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Elevate your culinary journey with exclusive benefits.
            </p>
          </div>

          <button
            onClick={() => setModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition active:scale-95"
            style={{ backgroundColor: "#bfdbfe" }}
          >
            Show Info
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 pb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md p-6 text-center transition hover:shadow-xl hover:scale-105"
          >
            <div className="flex justify-center mb-4">
              <Crown size={32} color="gold" />
            </div>

            <h2 className="text-lg font-bold">{plan.title}</h2>
            <p className="text-2xl font-extrabold my-2">
              ${plan.price}/{plan.period}
            </p>  

            <ul className="text-left mt-5 space-y-2 px-4">
              {plan.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check size={18} color="green" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={isLoading}
              onClick={() => handlePayment(plan.price)}
              style={{ backgroundColor: "#bfdbfe" }}
              className="mt-6 w-full bg-blue-200 hover:bg-blue-600 text-white py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? "Processing..." : plan.btn}
            </button>
          </div>
        ))}
      </div>

      {status && (
        <p className="text-center pb-10 font-mono text-green-600">
          {status}
        </p>
      )}

      <div
        className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center transition duration-300 ${
          modal ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white w-[90%] max-w-md rounded-xl p-6 transform transition-all duration-300 ${
            modal ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Test Mode Instructions
            </h3>
            <X
              className="cursor-pointer"
              onClick={() => setModal(false)}
            />
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Payment is in test mode. Use these credentials:
          </p>

          <div className="text-sm space-y-2">
            <p><strong>Card:</strong> 4718 6091 0820 4366</p>
            <p><strong>CVV:</strong> 111</p>
            <p><strong>OTP:</strong> 123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
