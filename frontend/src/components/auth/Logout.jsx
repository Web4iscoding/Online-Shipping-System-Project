import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    async function performLogout() {
      await logout();
      navigate("/login", { replace: true });
    }
    performLogout();
  }, [navigate]);

  return null;
}
export default Logout;
