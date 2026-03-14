import { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { vendor as vendorAPI, API_BASE } from "../../../api";
import noImage from "../../../assets/no_image_available.jpg";
import "../../../styles/VendorOrderDetails.css";
import { LeftArrowIcon, AlertTriangleIcon } from "../../../assets/icons";
import { formatDate } from "../../../utils/formatDate";
import Order from "../customer/Order";
import ModalBackdrop from "../../common/ModalBackdrop";
import CancelOrderModal from "../../modals/CancelOrderModal";
import OrderGeneralActionModal from "../../modals/OrderGeneralActionModal";
import blank_pfp from "../../../assets/blank_pfp.png";

const OrderItem = ({ orderItem }) => {
  return (
    <div className="order-item">
      <div className="order-item-info">
        <img
          className="order-item-thumbnail"
          src={
            orderItem.product_details?.primary_image ? `${API_BASE}/${orderItem.product_details?.primary_image}` : noImage
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

const VendorOrderDetails = () => {
  const [orderData, setOrderData] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.state?.from || "/orders";
  const showButton =
    orderData?.status === "Pending" || orderData?.status === "Holding";
  const pendingRefund = orderData?.refundRequest;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showOrderGeneralActionModal, setShowOrderGeneralActionModal] =
    useState(false);
  const [orderGeneralActionType, setOrderGeneralActionType] = useState("");

  useEffect(() => {
    async function performFetch() {
      const orderData = await vendorAPI.customerOrderDetail(id);
      setOrderData(orderData);
      console.log(orderData);
    }
    performFetch();
  }, []);

  const handleUpdateStatus = async (newStatus, reason = "") => {
    await vendorAPI.updateOrderStatus(id, newStatus, reason);
    setOrderData((prevData) => ({
      ...prevData,
      status: newStatus,
    }));
  };

  const handleDismissRefund = async (action = "approve") => {
    await vendorAPI.dismissRefundRequest(id, action);
    setOrderData((prevData) => ({
      ...prevData,
      refundRequest: false,
      refundReason: null,
    }));
  };

  return (
    <div className="vendor-order-details-container">
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
              await handleUpdateStatus(
                "Cancelled",
                orderData?.refundReason || "Refund approved by vendor",
              );
              await handleDismissRefund();
            } else {
              await handleUpdateStatus(orderGeneralActionType);
            }
            setShowOrderGeneralActionModal(false);
          }}
          onReject={async () => {
            await handleDismissRefund("reject");
            setShowOrderGeneralActionModal(false);
          }}
          orderData={orderData}
        />
      )}
      <button
        id="vendor-order-revert-button"
        onClick={() => navigate(backPath)}
      >
        <LeftArrowIcon />
        <p>Your Orders</p>
      </button>
      <div className="vendor-order-container">
        <div className="vendor-order-header">
          <div className="vendor-order-button-field">
            {showButton && !pendingRefund && (
              <button
                id="vendor-order-hold-order-button"
                onClick={() => {
                  setOrderGeneralActionType("Holding");
                  setShowOrderGeneralActionModal(true);
                }}
              >
                Hold Order
              </button>
            )}
            {showButton && !pendingRefund && (
              <button
                id="vendor-order-cancel-order-button"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Order
              </button>
            )}
            {pendingRefund && (
              <button
                id="vendor-order-cancel-order-button"
                onClick={() => {
                  setOrderGeneralActionType("Cancelled");
                  setShowOrderGeneralActionModal(true);
                }}
              >
                Manage Refund
              </button>
            )}
          </div>
          <h2 className="vendor-order-status">
            {pendingRefund && <AlertTriangleIcon />}
            {!pendingRefund && "Order " + orderData?.status}{" "}
            {pendingRefund && "Refund Requested From Customer"}{" "}
          </h2>
          <p className="vendor-order-date">
            Order Date: {formatDate(orderData?.orderDate)}
          </p>
          {orderData?.status !== "Pending" && (
            <p className="vendor-order-date">
              Last Updated: {formatDate(orderData?.statusUpdatedDate)}
            </p>
          )}
          <p className="vendor-order-id">Order ID: #{orderData?.orderID}</p>
        </div>
        <div className="vendor-order-details">
          {orderData?.items?.map((item, index) => (
            <OrderItem key={index} orderItem={item} />
          ))}
          <div className="vendor-order-total-price">
            <p className="vendor-order-total-word">Paid Total</p>
            <p>${orderData?.totalAmount}</p>
          </div>
        </div>
        <div className="vendor-order-footer">
          <div className="vendor-order-footer-left">
            <h3>Customer Details</h3>
            <div className="vendor-order-customer-profile">
              <img
                className="vendor-order-customer-avatar"
                src={
                  orderData?.customer_profileImage
                    ? `${API_BASE}/media/${orderData?.customer_profileImage}`
                    : blank_pfp
                }
                alt="Customer Avatar"
              />
              <p className="vendor-order-customer-username">
                {orderData?.customer_username}
              </p>
            </div>
            <div className="vendor-order-customer-details-group">
              <p>Name</p>
              <p>{orderData?.customer_name}</p>
            </div>
            <div className="vendor-order-customer-details-group">
              <p className="email">Email</p>
              <p>{orderData?.customer_email}</p>
            </div>
            <div className="vendor-order-customer-details-group">
              <p>Phone</p>
              <p>{orderData?.phoneNo}</p>
            </div>
          </div>
          <div className="vendor-order-footer-right">
            <h3>Shipping Address</h3>
            <div className="vendor-order-customer-details-group">
              <p>Street</p>
              <p>{orderData?.shippingAddress1}</p>
            </div>
            <div className="vendor-order-customer-details-group">
              <p>City</p>
              <p>{orderData?.shippingAddress2}</p>
            </div>
            <div className="vendor-order-customer-details-group">
              <p>Postal</p>
              <p>{orderData?.shippingAddress3}</p>
            </div>
            <div className="vendor-order-customer-details-group">
              <p>Recipient name</p>
              <p>
                {orderData?.firstName} {orderData?.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>
      {showButton && !pendingRefund && (
        <button
          id="vendor-order-confirm-shipment-button"
          onClick={() => {
            setOrderGeneralActionType("Shipped");
            setShowOrderGeneralActionModal(true);
          }}
        >
          Confirm Shipment
        </button>
      )}
    </div>
  );
};

export default VendorOrderDetails;
