import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifications as notificationsAPI } from "../../api";
import {
  TruckCheckIcon,
  HeartCircleOutlineIcon,
  ClipboardAlertOutlineIcon,
  ClipboardArrowDownOutlineIcon,
  ClipboardRemoveOutlineIcon,
  CashRefundIcon,
} from "../../assets/icons";
import "../../styles/Notifications.css";

const ICON_MAP = {
  wishlist_sale: HeartCircleOutlineIcon,
  order_shipped: TruckCheckIcon,
  order_holding: ClipboardAlertOutlineIcon,
  refund_approved: CashRefundIcon,
  refund_rejected: CashRefundIcon,
  order_cancelled: ClipboardRemoveOutlineIcon,
  new_order: ClipboardArrowDownOutlineIcon,
  refund_request: CashRefundIcon,
};

const COLOR_MAP = {
  wishlist_sale: "var(--warning-color)",
  order_shipped: "var(--success-color)",
  order_holding: "var(--caution-color-dark)",
  refund_approved: "var(--success-color)",
  refund_rejected: "var(--warning-color)",
  order_cancelled: "var(--warning-color)",
  new_order: "var(--secondary-color)",
  refund_request: "var(--caution-color-dark)",
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "a few seconds ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 24) return `${months} month${months > 1 ? "s" : ""} ago`;
  return "a long time ago";
}

const Notifications = ({ onClose, onUnreadChange }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsAPI.list();
      setItems(data);
      const unread = data.filter((n) => !n.isRead).length;
      onUnreadChange?.(unread);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationsAPI.markRead(notification.notificationID);
        setItems((prev) =>
          prev.map((n) =>
            n.notificationID === notification.notificationID
              ? { ...n, isRead: true }
              : n,
          ),
        );
        onUnreadChange?.((prev) => (typeof prev === "number" ? prev - 1 : 0));
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onUnreadChange?.(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h3>Notifications</h3>
        {items.some((n) => !n.isRead) && (
          <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {loading ? (
          <p className="notifications-empty">Loading...</p>
        ) : items.length === 0 ? (
          <p className="notifications-empty">No notifications yet</p>
        ) : (
          items.map((notification) => {
            const IconComponent = ICON_MAP[notification.notificationType];
            const iconColor = COLOR_MAP[notification.notificationType];
            return (
              <button
                key={notification.notificationID}
                className={`notification-item${notification.isRead ? "" : " notification-unread"}`}
                onClick={() => handleClick(notification)}
              >
                <div
                  className="notification-icon"
                  style={{ color: iconColor }}
                >
                  {IconComponent && <IconComponent size={0.9} />}
                </div>
                <div className="notification-content">
                  <p className="notification-title">{notification.title}</p>
                  <p className="notification-message">
                    {notification.message}
                  </p>
                  <span className="notification-time">
                    {timeAgo(notification.createdTime)}
                  </span>
                </div>
                {!notification.isRead && (
                  <span className="notification-dot" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;