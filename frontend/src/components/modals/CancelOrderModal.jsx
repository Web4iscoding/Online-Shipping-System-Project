import { CloseIcon, AlertCircleFilledIcon } from "../../assets/icons";
import "../../styles/CancelOrderModal.css";
import { useState } from "react";

const CancelOrderModal = ({
  onClose,
  onConfirm,
  title = "Do you want to cancel the current order?",
  subtitle = "This action is irreversible and cannot be undone.",
  reasonPrompt = "Please submit reason for cancellation.",
  confirmLabel = "Yes, Cancel Order",
  submitLabel = "Submit and cancel order",
}) => {
  const [isNextStep, setIsNextStep] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div className="cancel-order-container">
      <button className="cancel-order-close-button" onClick={onClose}>
        <CloseIcon />
      </button>
      {!isNextStep && (
        <div>
          <AlertCircleFilledIcon size={2} />
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
      )}
      {isNextStep && (
        <form
          className="cancel-order-reason-field"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm(reason);
          }}
        >
          <h2>{reasonPrompt}</h2>
          <textarea
            className="cancel-order-reason-textarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          ></textarea>
          {isNextStep && (
            <button type="submit" id="cancel-order-confirm-button">
              {submitLabel}
            </button>
          )}
        </form>
      )}
      {!isNextStep && (
        <button
          id="cancel-order-confirm-button"
          onClick={() => setIsNextStep(true)}
        >
          {confirmLabel}
        </button>
      )}
    </div>
  );
};

export default CancelOrderModal;
