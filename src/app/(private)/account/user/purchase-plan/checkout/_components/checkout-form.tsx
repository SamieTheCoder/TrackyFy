import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressElement, PaymentElement } from "@stripe/react-stripe-js";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ICheckoutFormProps {
  showCheckoutForm: boolean;
  setShowCheckoutForm: (value: boolean) => void;
  onPaymentSuccess: (paymentId: string) => void;
}

function CheckoutForm({
  showCheckoutForm,
  setShowCheckoutForm,
  onPaymentSuccess,
}: ICheckoutFormProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (event: React.FormEvent) => {
    try {
      // We don't want to let default form submission happen here,
      // which would refresh the page.
      event.preventDefault();
      setIsProcessing(true);
      
      console.log("Starting payment confirmation...");

      if (!stripe || !elements) {
        // Stripe.js hasn't yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        console.log("Stripe or elements not loaded yet");
        return;
      }

      const result = await stripe.confirmPayment({
        //`Elements` instance that was used to create the Payment Element
        elements,
        confirmParams: {
          return_url: window.location.origin + "/account/user/subscriptions",
        },
        redirect: "if_required",
      });

      console.log("Payment result:", result);

      if (result.error) {
        console.error("Payment error details:", result.error);
        let errorMessage = "An error occurred while processing the payment.";
        
        if (result.error.type === "card_error") {
          errorMessage = result.error.message || "Your card was declined.";
        } else if (result.error.type === "validation_error") {
          errorMessage = "The payment information is invalid.";
        }
        
        toast.error(errorMessage);
      } else {
        // Your customer will be redirected to your `return_url`. For some payment
        // methods like iDEAL, your customer will be redirected to an intermediate
        // site first to authorize the payment, then redirected to the `return_url`.
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
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <DialogTitle className="text-2xl font-bold">
            Complete Payment
          </DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            Secure payment to activate your subscription
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

            {/* for address details in stripe payment gateway */}
            {/* for address details in stripe payment gateway */}
            {/* for address details in stripe payment gateway */}
            {/* for address details in stripe payment gateway */}
            {/* <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Billing Address
              </h3>
              <AddressElement
                options={{
                  allowedCountries: ["US", "IN"],
                  mode: "billing",
                }}
              />
            </div> */}

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
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5"
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

export default CheckoutForm;
