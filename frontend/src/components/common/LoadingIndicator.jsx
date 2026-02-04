import { LoadingIcon } from "../../assets/icons";
import "../../styles/LoadingIndicator.css";

const LoadingIndicator = ({ size = 4, className = "" }) => (
  <div
    className={`loading-indicator ${className}`}
    role="status"
    aria-live="polite"
  >
    <LoadingIcon size={size} />
  </div>
);

export default LoadingIndicator;
