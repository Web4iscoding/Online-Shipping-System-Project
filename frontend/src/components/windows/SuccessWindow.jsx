import "../../styles/SuccessWindow.css";
import { WindowCloseIcon, SuccessTickIcon } from "../../assets/icons";
import { useState } from "react";

const SuccessWindow = ({ message = "Success", onClose, actionLabel, onAction, style }) => {
  return (
    <div className="success-window-container" style={style}>
      <div>
        <SuccessTickIcon />
        <p>{message}</p>
        {actionLabel && (
          <button className="success-window-action" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      <button id="success-window-close" onClick={onClose}>
        <WindowCloseIcon />
      </button>
    </div>
  );
};

export default SuccessWindow;
