import { CloseIcon, AlertCircleFilledIcon } from "../../assets/icons";
import "../../styles/OrderGeneralActionModal.css";
import { API_BASE } from "../../api";
import blank_pfp from "../../assets/blank_pfp.png";

const OrderGeneralActionModal = ({
  type,
  onClose,
  onConfirm,
  onReject,
  orderData,
}) => {
  return (
    <div className="order-general-action-container">
      <div className="order-general-action-header">
        <AlertCircleFilledIcon size={2} />
        <h2>
          {type === "Holding" &&
            "Do you want to put the current order on hold?"}
          {type === "Shipped" &&
            "Do you want to confirm the shipment of the current order?"}
          {type === "Cancelled" &&
            "Do you want to approve the incoming refund request?"}
        </h2>
        <button className="order-general-action-close-button" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      {type === "Cancelled" && (
        <div className="order-general-action-refund">
          <img
            src={orderData?.customer_profileImage ? `${API_BASE}/media/${orderData?.customer_profileImage}` : blank_pfp}
            className="refund-modal-customer-avatar"
          ></img>
          <div className="refund-modal-reason">{orderData?.refundReason}</div>
        </div>
      )}
      <div id="order-general-action-button-group">
        <button id="order-general-action-confirm-button" onClick={onConfirm}>
          {type === "Holding" && "Yes, Put on Hold"}
          {type === "Shipped" && "Yes, Confirm Shipment"}
          {type === "Cancelled" && "Yes, Approve Refund"}
        </button>
        {type === "Cancelled" && (
          <button id="order-general-action-reject-button" onClick={onReject}>
            No, Reject Refund
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderGeneralActionModal;
