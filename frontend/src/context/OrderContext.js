import { createContext, useState } from "react";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orderData, setOrderData] = useState({
    shopName: "",
    garment: "",
    fabric: "",
    color: "",
    quantity: 0,
    amount: 0,
    paymentMethod: "",
    deliveryDate: "",
address: "",
deliveryMethod: "",
specialInstructions: "",
paymentStatus: "",
status: "",
  });

  return (
    <OrderContext.Provider value={{ orderData, setOrderData }}>
      {children}
    </OrderContext.Provider>
  );
};