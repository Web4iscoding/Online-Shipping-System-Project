import "../../../styles/Orders.css";
import { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { useNavigate } from "react-router-dom";
import { vendor as vendorAPI, API_BASE } from "../../../api";
import {
  LeftArrowIcon,
  MenuDownIcon,
  AlertTriangleIcon,
} from "../../../assets/icons";
import Order from "../customer/Order";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import noImage from "../../../assets/no_image_available.jpg";
import ModalBackdrop from "../../common/ModalBackdrop";
import CancelOrderModal from "../../modals/CancelOrderModal";
import OrderGeneralActionModal from "../../modals/OrderGeneralActionModal";

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

const OrderCard = ({
  order,
  panelId,
  expanded,
  onChange,
  startCancelOrder,
  startGeneralAction,
}) => {
  const navigate = useNavigate();
  const showButton =
    (order?.status === "Pending" || order?.status === "Holding") &&
    !order?.refundRequest;

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
          {order?.refundRequest && <AlertTriangleIcon />}
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
              state: { from: "/orders" },
            })
          }
        >
          View Details
        </button>
        <div className="order-card-button-group">
          {showButton && (
            <button
              className="order-card-action-button"
              onClick={() => startGeneralAction(order?.orderID, "Shipped")}
            >
              Confirm Shipment
            </button>
          )}
          {showButton && (
            <button
              className="order-card-action-button"
              onClick={() => startGeneralAction(order?.orderID, "Holding")}
            >
              Hold Order
            </button>
          )}
          {showButton && (
            <button
              className="order-card-action-button"
              onClick={startCancelOrder}
            >
              Cancel Order
            </button>
          )}
          {order?.refundRequest && (
            <button
              className="order-card-action-button"
              onClick={() => startGeneralAction(order?.orderID, "Cancelled")}
            >
              Manage Refund
            </button>
          )}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showOrderGeneralActionModal, setShowOrderGeneralActionModal] =
    useState(false);
  const [orderGeneralActionType, setOrderGeneralActionType] = useState("");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const startCancelOrder = (orderId) => {
    setCurrentOrderId(orderId);
    setShowCancelModal(true);
  };

  const startGeneralAction = (orderId, type) => {
    setCurrentOrderId(orderId);
    setOrderGeneralActionType(type);
    setShowOrderGeneralActionModal(true);
  };

  const handleUpdateStatus = async (newStatus, reason = "") => {
    await vendorAPI.updateOrderStatus(currentOrderId, newStatus, reason);
    setOrders((prevData) =>
      prevData.map((order) =>
        order.orderID === currentOrderId
          ? { ...order, status: newStatus }
          : order,
      ),
    );
  };

  const handleDismissRefund = async () => {
    await vendorAPI.dismissRefundRequest(currentOrderId);
    setOrders((prevData) =>
      prevData.map((order) =>
        order.orderID === currentOrderId
          ? { ...order, refundRequest: false, refundReason: null }
          : order,
      ),
    );
  };

  useEffect(() => {
    const performFetch = async () => {
      const ordersData = await vendorAPI.customerOrders();
      setOrders(ordersData);
      console.log(ordersData);
    };
    performFetch();
  }, []);

  return (
    <div className="orders-container">
      {showCancelModal && (
        <ModalBackdrop onClose={() => setShowCancelModal(false)} />
      )}
      {showCancelModal && (
        <CancelOrderModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={(reason) => {
            handleUpdateStatus("Cancelled", reason);
            setShowCancelModal(false);
          }}
        />
      )}
      {showOrderGeneralActionModal && (
        <ModalBackdrop onClose={() => setShowOrderGeneralActionModal(false)} />
      )}
      {showOrderGeneralActionModal && (
        <OrderGeneralActionModal
          type={orderGeneralActionType}
          onClose={() => setShowOrderGeneralActionModal(false)}
          onConfirm={async () => {
            if (orderGeneralActionType === "Cancelled") {
              const currentOrder = orders.find((o) => o.orderID === currentOrderId);
              await handleUpdateStatus("Cancelled", currentOrder?.refundReason || "Refund approved by vendor");
              await handleDismissRefund();
            } else {
              await handleUpdateStatus(orderGeneralActionType);
            }
            setShowOrderGeneralActionModal(false);
          }}
          onReject={async () => {
            await handleDismissRefund();
            setShowOrderGeneralActionModal(false);
          }}
          orderData={orders.find((o) => o.orderID === currentOrderId)}
        />
      )}

      <button id="orders-revert-button" onClick={() => navigate("/profile")}>
        <LeftArrowIcon />
        <p>Your Account</p>
      </button>
      <div className="order-card-container">
        {orders.map((order, idx) => {
          const panelId = `panel${idx}`;
          if (order?.status !== "Shipped")
            return (
              <OrderCard
                order={order}
                key={order.orderID || idx}
                panelId={panelId}
                expanded={expanded === panelId}
                onChange={handleChange(panelId)}
                startCancelOrder={() => startCancelOrder(order?.orderID)}
                startGeneralAction={startGeneralAction}
              />
            );
          else return null;
        })}
      </div>
    </div>
  );
};

export default Orders;
