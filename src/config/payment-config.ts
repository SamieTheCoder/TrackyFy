export interface PaymentGateway {
  id: 'stripe' | 'razorpay';
  name: string;
  enabled: boolean;
  isDefault: boolean;
}

export interface PaymentSettings {
  gateways: PaymentGateway[];
  allowMultiple: boolean;
}

export const defaultPaymentSettings: PaymentSettings = {
  gateways: [
    {
      id: 'razorpay',
      name: 'Razorpay',
      enabled: true,
      isDefault: true,
    },
    {
      id: 'stripe',
      name: 'Stripe',
      enabled: true,
      isDefault: false,
    },
  ],
  allowMultiple: true,
};
