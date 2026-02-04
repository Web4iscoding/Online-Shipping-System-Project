import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <h4>Help and Information</h4>
      <div className="footer-info-parent">
        <div className="footer-first">
          <p>About Us</p>
          <p>Careers</p>
          <p>Contact Us</p>
          <p>Help</p>
          <p>Privacy Policy</p>
          <p>Terms and Conditions</p>
        </div>
        <div className="footer-second">
          <p>Payment</p>
          <p>Delivery</p>
          <p>Refunds</p>
          <p>Track your Order</p>
          <p>Cookie Policy</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
