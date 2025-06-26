import { create } from "zustand";
import { PaymentSettings, defaultPaymentSettings } from "@/config/payment-config";

export interface IPaymentSettingsStore {
  paymentSettings: PaymentSettings;
  setPaymentSettings: (settings: PaymentSettings) => void;
  toggleGateway: (gatewayId: 'stripe' | 'razorpay') => void;
  setDefaultGateway: (gatewayId: 'stripe' | 'razorpay') => void;
  getEnabledGateways: () => PaymentSettings['gateways'];
  getDefaultGateway: () => PaymentSettings['gateways'][0] | null;
}

const paymentSettingsStore = create<IPaymentSettingsStore>((set, get) => ({
  paymentSettings: defaultPaymentSettings,
  
  setPaymentSettings: (settings) => set({ paymentSettings: settings }),
  
  toggleGateway: (gatewayId) => set((state) => ({
    paymentSettings: {
      ...state.paymentSettings,
      gateways: state.paymentSettings.gateways.map(gateway =>
        gateway.id === gatewayId
          ? { ...gateway, enabled: !gateway.enabled }
          : gateway
      ),
    },
  })),
  
  setDefaultGateway: (gatewayId) => set((state) => ({
    paymentSettings: {
      ...state.paymentSettings,
      gateways: state.paymentSettings.gateways.map(gateway => ({
        ...gateway,
        isDefault: gateway.id === gatewayId,
      })),
    },
  })),
  
  getEnabledGateways: () => {
    const { paymentSettings } = get();
    return paymentSettings.gateways.filter(gateway => gateway.enabled);
  },
  
  getDefaultGateway: () => {
    const { paymentSettings } = get();
    return paymentSettings.gateways.find(gateway => gateway.isDefault) || null;
  },
}));

export default paymentSettingsStore;
