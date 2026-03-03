import "../../../styles/Orders.css";
import { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { useNavigate } from "react-router-dom";
import { vendor as vendorAPI, API_BASE } from "../../../api";
import { LeftArrowIcon, MenuDownIcon } from "../../../assets/icons";
import Order from "../customer/Order";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import noImage from "../../../assets/no_image_available.jpg";
import { formatDate } from "../../../utils/formatDate";

const OrderItem = ({ orderItem }) => {
  return (
    <div className="order-item">
      <div className="order-item-info">
        <img
          className="order-item-thumbnail"
          src={
            `${API_BASE}/${orderItem.product_details?.primary_image}` || noImage
          }
        ></img>
        <div className="order-item-details">
          <h3 className="order-item-name">{orderItem.productName}</h3>
          <p className="order-item-quantity">Quantity: {orderItem.quantity}</p>
        </div>
      </div>
      <p className="order-item-price">${orderItem.paidPrice}</p>
    </div>
  );
};

const OrderCard = ({ order, panelId, expanded, onChange }) => {
  const navigate = useNavigate();

  return (
    <Accordion
      className="order-card"
      expanded={expanded}
      onChange={onChange}
      style={{
        borderRadius: "0px",
        boxShadow: "none",
      }}
    >
      <AccordionSummary
        aria-controls={`${panelId}-content`}
        id={`${panelId}-header`}
        expandIcon={<MenuDownIcon />}
      >
        <div className="order-card-summary">
          <div className="order-card-info">
            <h2 className="order-card-header">
              Order{" "}
              <span className="order-card-order-id">#{order?.orderID}</span>
            </h2>
            <p className="order-card-date">{formatDate(order?.orderDate)}</p>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          padding: "32px 16px",
        }}
      >
        <div className="order-item-container">
          {order?.items.map((item, idx) => (
            <OrderItem orderItem={item} key={idx} />
          ))}
        </div>
        <button
          className="order-card-view-details-button"
          onClick={() =>
            navigate(`/vendor/order-details/${order?.orderID}`, {
              state: { from: "/shipped-orders" },
            })
          }
        >
          View Details
        </button>
      </AccordionDetails>
    </Accordion>
  );
};

const ShippedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const performFetch = async () => {
      const ordersData = await vendorAPI.customerOrders("Shipped");
      setOrders(ordersData);
      console.log(ordersData);
    };
    performFetch();
  }, []);

  return (
    <div className="orders-container">
      <button id="orders-revert-button" onClick={() => navigate("/profile")}>
        <LeftArrowIcon />
        <p>Your Account</p>
      </button>
      <div className="order-card-container">
        {orders.map((order, idx) => {
          const panelId = `panel${idx}`;
          return (
            <OrderCard
              order={order}
              key={order.orderID || idx}
              panelId={panelId}
              expanded={expanded === panelId}
              onChange={handleChange(panelId)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ShippedOrders;
