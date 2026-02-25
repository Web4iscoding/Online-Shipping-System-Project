import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { orders as OrdersAPI } from "../../../api";
import "../../../styles/Order.css";

const Order = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const performFetch = async () => {
      const orderData = await OrdersAPI.detail(id);
      setOrder(orderData);
      console.log(orderData);
    };
    performFetch();
  }, []);

  return <div className="order-container"></div>;
};

export default Order;
