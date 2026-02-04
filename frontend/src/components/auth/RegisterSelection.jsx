import { useNavigate } from "react-router-dom";
import { CartAltIcon } from "../../assets/icons";
import { CashMultipleIcon } from "../../assets/icons";
import "../../styles/RegisterSelection.css";
import { useAuth } from "../../AuthContext";
import { useEffect } from "react";

const RegisterSelection = ({}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = (type) => {
    navigate(`/register/${type}`);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="register-selection-container">
      <h2>I am a...</h2>
      <div className="register-selection-button-group">
        <button onClick={() => handleClick("customer")}>
          <div>
            <CartAltIcon size={2} />
            <h2>Customer</h2>
          </div>
          <p className="register-selection-description">I want to buy</p>
        </button>
        <button onClick={() => handleClick("vendor")}>
          <div>
            <CashMultipleIcon size={2} />
            <h2>Vendor</h2>
          </div>
          <p className="register-selection-description">I want to sell</p>
        </button>
      </div>
    </div>
  );
};

export default RegisterSelection;
