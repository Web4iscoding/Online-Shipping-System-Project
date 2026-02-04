import "../../styles/WarningWindow.css";
import { WindowCloseIcon, AlertCircleIcon } from "../../assets/icons";
import { useState } from "react";

const WarningWindow = ({ message = "Error", onClose }) => {
  return (
    <div className="warning-window-container">
      <div>
        <AlertCircleIcon />
        <p>{message}</p>
      </div>
      <button id="warning-window-close" onClick={onClose}>
        <WindowCloseIcon />
      </button>
    </div>
  );
};

export default WarningWindow;
