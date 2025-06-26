"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentElement } from "@stripe/react-stripe-js";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface IStripeCheckoutFormProps {
  showCheckoutForm: boolean;
  setShowCheckoutForm: (value: boolean) => void;
  onPaymentSuccess: (paymentId: string) => void;
}

function StripeCheckoutForm({
  showCheckoutForm,
  setShowCheckoutForm,
  onPaymentSuccess,
}: IStripeCheckoutFormProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      setIsProcessing(true);

      if (!stripe || !elements) {
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/account/user/subscriptions",
        },
        redirect: "if_required",
      });

      if (result.error) {
        let errorMessage = "An error occurred while processing the payment.";

        if (result.error.type === "card_error") {
          errorMessage = result.error.message || "Your card was declined.";
        } else if (result.error.type === "validation_error") {
          errorMessage = "The payment information is invalid.";
        }

        toast.error(errorMessage);
      } else {
        toast.success("Payment successful!");
        onPaymentSuccess(result.paymentIntent.id);
        setShowCheckoutForm(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An error occurred while processing the payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={showCheckoutForm} onOpenChange={setShowCheckoutForm}>
      <DialogContent className="max-h-[85vh] p-0 overflow-hidden rounded-xl">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
          <DialogTitle className="text-2xl font-bold">
            Complete Payment with Stripe
          </DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            Secure payment processing with Stripe
          </DialogDescription>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Payment Details
              </h3>
              <PaymentElement className="mb-4" />
            </div>

            <div className="sticky bottom-0 pt-4 flex justify-end gap-3 mt-8">
              <Button
                variant="outline"
                type="button"
                className="px-5"
                disabled={isProcessing}
                onClick={() => setShowCheckoutForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-5"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>Complete Payment</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StripeCheckoutForm;
