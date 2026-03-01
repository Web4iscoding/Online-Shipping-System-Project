import "../../../styles/Orders.css";
import { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { useNavigate } from "react-router-dom";
import { orders as ordersAPI, API_BASE } from "../../../api";
import { LeftArrowIcon, MenuDownIcon } from "../../../assets/icons";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import noImage from "../../../assets/no_image_available.jpg";

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
            <p className="order-card-date">{order?.orderDate}</p>
          </div>
          <div className={`order-card-status ${order?.status?.toLowerCase()}`}>
            {order?.status}
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
          onClick={() => navigate(`/customer/order-details/${order?.orderID}`)}
        >
          View Details
        </button>
      </AccordionDetails>
    </Accordion>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const performFetch = async () => {
      const ordersData = await ordersAPI.list();
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
      <select
        className="orders-filter"
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setExpanded(false);
        }}
      >
        <option value="all">All Orders</option>
        <option value="pending">Pending Orders</option>
        <option value="shipped">Shipped Orders</option>
        <option value="holding">Held Orders</option>
        <option value="cancelled">Cancelled Orders</option>
      </select>
      <div className="order-card-container">
        {orders
          .filter(
            (order) =>
              filter === "all" || order.status?.toLowerCase() === filter,
          )
          .map((order, idx) => {
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

export default MyOrders;
