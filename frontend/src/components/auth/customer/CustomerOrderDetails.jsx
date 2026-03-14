import { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { orders as ordersAPI, API_BASE } from "../../../api";
import noImage from "../../../assets/no_image_available.jpg";
import "../../../styles/CustomerOrderDetails.css";
import { LeftArrowIcon } from "../../../assets/icons";
import { formatDate } from "../../../utils/formatDate";
import Order from "../customer/Order";
import ModalBackdrop from "../../common/ModalBackdrop";
import CancelOrderModal from "../../modals/CancelOrderModal";
import SuccessWindow from "../../windows/SuccessWindow";
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

const CustomerOrderDetails = () => {
  const [orderData, setOrderData] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const showRefundButton =
    orderData?.status === "Holding" || orderData?.status === "Pending";
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRefundSuccess, setShowRefundSuccess] = useState(false);

  useEffect(() => {
    async function performFetch() {
      const orderData = await ordersAPI.detail(id);
      setOrderData(orderData);
      console.log(orderData);
    }
    performFetch();
  }, []);

  return (
    <div className="customer-order-details-container">
      {showRefundModal && (
        <ModalBackdrop onClose={() => setShowRefundModal(false)} />
      )}
      {showRefundModal && (
        <CancelOrderModal
          onClose={() => setShowRefundModal(false)}
          onConfirm={async (reason) => {
            await ordersAPI.requestRefund(id, reason);
            setOrderData((prev) => ({
              ...prev,
              refundRequest: true,
              refundReason: reason,
            }));
            setShowRefundModal(false);
            setShowRefundSuccess(true);
          }}
          title="Do you want to request a refund for this order?"
          subtitle="The vendor will review your request and process the refund."
          reasonPrompt="Please provide your reason for requesting a refund."
          confirmLabel="Yes, Request Refund"
          submitLabel="Submit refund request"
        />
      )}
      <button
        id="customer-order-revert-button"
        onClick={() => navigate("/my-orders")}
      >
        <LeftArrowIcon />
        <p>Your Orders</p>
      </button>
      {showRefundSuccess && (
        <SuccessWindow
          message="Refund request submitted successfully."
          onClose={() => setShowRefundSuccess(false)}
        />
      )}
      <div className="customer-order-container">
        <div className="customer-order-header">
          {showRefundButton && !orderData?.refundRequest && (
            <button
              id="customer-order-cancel-order-button"
              onClick={() => setShowRefundModal(true)}
            >
              Request a refund
            </button>
          )}
          <h2 className="customer-order-status">
            Order {orderData?.status}{" "}
            {orderData?.refundRequest && "(Refund Requested)"}
          </h2>
          <p className="customer-order-date">
            Order Date: {formatDate(orderData?.orderDate)}
          </p>
          {orderData?.status !== "Pending" && (
            <p className="customer-order-date">
              Last Updated: {formatDate(orderData?.statusUpdatedDate)}
            </p>
          )}
          <p className="customer-order-id">Order ID: #{orderData?.orderID}</p>
        </div>
        <div className="customer-order-details">
          {orderData?.items?.map((item, index) => (
            <OrderItem key={index} orderItem={item} />
          ))}
          <div className="customer-order-total-price">
            <p className="customer-order-total-word">Paid Total</p>
            <p>${orderData?.totalAmount}</p>
          </div>
        </div>
        <div className="customer-order-footer">
          <div className="customer-order-footer-left">
            <h3>Vendor Details</h3>
            <div className="customer-order-vendor-profile">
              <img
                className="customer-order-vendor-avatar"
                src={orderData?.vendor_profileImage ? `${API_BASE}/${orderData?.vendor_profileImage}` : blank_pfp}
                alt="Vendor Avatar"
              />
              <p className="customer-order-vendor-store-name">
                {orderData?.storeName}
              </p>
            </div>
          </div>
          <div className="customer-order-footer-right">
            <h3>Shipping Address</h3>
            <div className="customer-order-customer-details-group">
              <p>Street</p>
              <p>{orderData?.shippingAddress1}</p>
            </div>
            <div className="customer-order-customer-details-group">
              <p>City</p>
              <p>{orderData?.shippingAddress2}</p>
            </div>
            <div className="customer-order-customer-details-group">
              <p>Postal</p>
              <p>{orderData?.shippingAddress3}</p>
            </div>
            <div className="customer-order-customer-details-group">
              <p>Recipient name</p>
              <p>
                {orderData?.firstName} {orderData?.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetails;
