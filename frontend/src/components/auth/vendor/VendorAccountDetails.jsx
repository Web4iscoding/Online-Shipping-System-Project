import "../../../styles/VendorAccountDetails.css";
import { LeftArrowIcon, EyeIcon, EyeOffIcon } from "../../../assets/icons/";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../AuthContext";
import { API_BASE } from "../../../api";
import blank_pfp from "../../../assets/blank_pfp.png";
import { auth as authAPI } from "../../../api";
import { PhoneInput } from "react-international-phone";
import SuccessWindow from "../../windows/SuccessWindow";
import ImageCropModal from "../../modals/ImageCropModal";

const VendorAccountDetails = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState(user);
  const [showEdit, setShowEdit] = useState([false, false, false, false, false]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [passwordData, setPasswordData] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [emailData, setEmailData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState(null);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const showSuccess = (msg = "Changes saved successfully.") => {
    setSuccessMessage(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const onUpdate = async (e) => {
    e.preventDefault();

    const { firstName, lastName, phoneNo } = formData;
    const payload = {
      firstName,
      lastName,
      phoneNo,
    };

    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k],
    );
    const updatedUser = await authAPI.updateProfile(payload);
    // API returns { ..., user: { id, username, email } } — normalise to account
    const normalized = { ...updatedUser, account: updatedUser.user };
    delete normalized.user;
    setFormData((prev) => ({ ...prev, ...normalized }));
    setShowEdit([false, false, false, false, false]);
    showSuccess();
  };

  const onUpdateAccount = async (e) => {
    e.preventDefault();
    setAccountError(null);
    const { username } = formData?.account || {};
    const payload = { username };
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k],
    );
    try {
      const updatedUser = await authAPI.updateProfile(payload);
      const normalized = { ...updatedUser, account: updatedUser.user };
      delete normalized.user;
      setFormData((prev) => ({ ...prev, ...normalized }));
      updateUser(normalized);
      setShowEdit([false, false, false, false, false]);
      showSuccess();
    } catch (err) {
      let msg = err.message || "Failed to update account.";
      try {
        const parsed = JSON.parse(msg);
        const first = Object.values(parsed).flat()[0];
        if (first) msg = first;
      } catch {}
      setAccountError(msg);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "username" || id === "email") {
      setFormData((prev) => ({
        ...prev,
        account: { ...prev?.account, [id]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      ["phoneNo"]: value,
    }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError(null);
    try {
      const updatedUser = await authAPI.updateProfile({
        email: emailData.email,
        current_password: emailData.password,
      });
      const normalized = { ...updatedUser, account: updatedUser.user };
      delete normalized.user;
      setFormData((prev) => ({ ...prev, ...normalized }));
      updateUser(normalized);
      setEmailData({ email: "", password: "" });
      setShowEdit([false, false, false, false, false]);
      showSuccess("Email address updated successfully.");
    } catch (err) {
      let msg = err.message || "Failed to update email.";
      try {
        const parsed = JSON.parse(msg);
        const first = Object.values(parsed).flat()[0];
        if (first) msg = first;
      } catch {}
      setEmailError(msg);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    if (passwordData.next !== passwordData.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordData.next === passwordData.current) {
      setPasswordError("New password must be different from current password.");
      return;
    }
    try {
      const response = await authAPI.changePassword(
        passwordData.current,
        passwordData.next,
        passwordData.confirm,
      );
      localStorage.setItem("token", response.token);
      setPasswordData({ current: "", next: "", confirm: "" });
      setShowEdit([false, false, false, false, false]);
      showSuccess("Password changed successfully.");
    } catch (err) {
      let msg = err.message || "Failed to change password.";
      try {
        const parsed = JSON.parse(msg);
        const first = Object.values(parsed).flat()[0];
        if (first) msg = first;
      } catch {}
      setPasswordError(msg);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCropImageSrc(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
  };

  const handleCropSave = async (blob) => {
    setCropImageSrc(null);
    setPhotoPreview(URL.createObjectURL(blob));

    const fd = new FormData();
    fd.append("profileImage", blob, "profile.jpg");

    setPhotoUploading(true);
    try {
      const updatedUser = await authAPI.updateProfile(fd);
      const normalized = { ...updatedUser, account: updatedUser.user };
      delete normalized.user;
      setFormData((prev) => ({ ...prev, ...normalized }));
      updateUser(normalized);
      setPhotoPreview(null);
      showSuccess("Profile photo updated.");
    } catch (err) {
      console.error("Photo upload failed:", err);
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div className="vendor-account-details-container">
      <button id="orders-revert-button" onClick={() => navigate("/profile")}>
        <LeftArrowIcon />
        <p>Your Account</p>
      </button>
      {successMessage && (
        <SuccessWindow
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      <div className="vendor-account-details-content">
        <div className="vendor-account-details-header">
          <h2>Account Details</h2>
          <p>Manage your account details and preferences.</p>
        </div>

        <div>
          <h3>Profile Image</h3>
          <img
            className="vendor-account-details-avatar"
            src={
              photoPreview
                ? photoPreview
                : formData?.profileImage
                  ? `${API_BASE}${formData?.profileImage}`
                  : blank_pfp
            }
            alt="Profile"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <button
            id="vendor-account-details-edit"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoUploading}
          >
            {photoUploading ? "Uploading..." : "Change Photo"}
          </button>
        </div>

        {!showEdit[0] && (
          <div>
            <h3>Personal Information</h3>
            <p>
              {formData?.firstName} {formData?.lastName}
            </p>
            <button
              id="vendor-account-details-edit"
              onClick={() => setShowEdit([true, false, false, false, false])}
            >
              Edit
            </button>
          </div>
        )}

        {showEdit[0] && (
          <div>
            <h3>Personal Information</h3>
            <form onSubmit={onUpdate}>
              <div className="input-field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  onChange={handleChange}
                  required
                  value={formData?.firstName}
                />
              </div>
              <div className="input-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  onChange={handleChange}
                  required
                  value={formData?.lastName}
                />
              </div>
              <div className="input-field">
                <label htmlFor="phoneNo">Phone Number</label>
                <PhoneInput
                  defaultCountry="mo"
                  onChange={handlePhoneChange}
                  id="phoneNo"
                  inputStyle={{ width: "100%" }}
                  required
                  value={formData?.phoneNo}
                />
              </div>

              <button type="submit" id="vendor-account-details-save">
                Save
              </button>
              <button
                type="button"
                id="vendor-account-details-edit"
                onClick={() => {
                  setFormData(user);
                  setShowEdit([false, false, false, false, false]);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {!showEdit[1] && (
          <div>
            <h3>Account Information</h3>
            <p>{formData?.account?.username}</p>
            <button
              id="vendor-account-details-edit"
              onClick={() => setShowEdit([false, true, false, false, false])}
            >
              Edit
            </button>
          </div>
        )}

        {showEdit[1] && (
          <div>
            <h3>Account Information</h3>
            <form action="" onSubmit={onUpdateAccount}>
              {accountError && (
                <p
                  style={{ color: "red", fontSize: "13px", margin: "0 0 8px" }}
                >
                  {accountError}
                </p>
              )}
              <div className="input-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  onChange={handleChange}
                  required
                  value={formData?.account?.username ?? ""}
                />
              </div>
              <button type="submit" id="vendor-account-details-save">
                Save
              </button>
              <button
                id="vendor-account-details-edit"
                onClick={() => {
                  setFormData(user);
                  setAccountError(null);
                  setShowEdit([false, false, false, false, false]);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {!showEdit[2] && (
          <div>
            <h3>Email Address</h3>
            <p>{formData?.account?.email}</p>
            <button
              id="vendor-account-details-edit"
              onClick={() => setShowEdit([false, false, true, false, false])}
            >
              Edit
            </button>
          </div>
        )}
        {showEdit[2] && (
          <div>
            <h3>Email Address</h3>
            <form onSubmit={handleEmailSubmit}>
              {emailError && (
                <p
                  style={{ color: "red", fontSize: "13px", margin: "0 0 8px" }}
                >
                  {emailError}
                </p>
              )}
              <div className="input-field">
                <label htmlFor="email">New Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={emailData.email}
                  onChange={(e) =>
                    setEmailData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="input-field">
                <label htmlFor="email-password">Current Password</label>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    id="email-password"
                    type={showEmailPassword ? "text" : "password"}
                    value={emailData.password}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    style={{ width: "100%", paddingRight: "36px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "8px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      color: "var(--primary-color-light)",
                    }}
                  >
                    {showEmailPassword ? (
                      <EyeOffIcon size={0.8} />
                    ) : (
                      <EyeIcon size={0.8} />
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" id="vendor-account-details-save">
                Save
              </button>
              <button
                type="button"
                id="vendor-account-details-edit"
                onClick={() => {
                  setEmailData({ email: "", password: "" });
                  setEmailError(null);
                  setShowEdit([false, false, false, false, false]);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
        {!showEdit[3] && (
          <div>
            <h3>Password</h3>
            <p>********</p>
            <button
              id="vendor-account-details-edit"
              onClick={() => {
                setPasswordError(null);
                setShowEdit([false, false, false, true, false]);
              }}
            >
              Edit
            </button>
          </div>
        )}

        {showEdit[3] && (
          <div>
            <h3>Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              {passwordError && (
                <p
                  style={{ color: "red", fontSize: "13px", margin: "0 0 8px" }}
                >
                  {passwordError}
                </p>
              )}
              {["current", "next", "confirm"].map((field) => (
                <div className="input-field" key={field}>
                  <label htmlFor={`pwd-${field}`}>
                    {field === "current"
                      ? "Current Password"
                      : field === "next"
                        ? "New Password"
                        : "Confirm New Password"}
                  </label>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      id={`pwd-${field}`}
                      type={showPasswords[field] ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordData[field]}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      style={{ width: "100%", paddingRight: "36px" }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          [field]: !prev[field],
                        }))
                      }
                      style={{
                        position: "absolute",
                        right: "8px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        color: "var(--primary-color-light)",
                      }}
                    >
                      {showPasswords[field] ? (
                        <EyeOffIcon size={0.8} />
                      ) : (
                        <EyeIcon size={0.8} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" id="vendor-account-details-save">
                Save
              </button>
              <button
                type="button"
                id="vendor-account-details-edit"
                onClick={() => {
                  setPasswordData({ current: "", next: "", confirm: "" });
                  setPasswordError(null);
                  setShowEdit([false, false, false, false, false]);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>

      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCancel={handleCropCancel}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
};

export default VendorAccountDetails;
