import LiquidGlass from "liquid-glass-react";
import "../styles/HomePage.css";
import { RightArrowIcon } from "../assets/icons";
import gucci from "../assets/gucci.png";
import gucci2 from "../assets/gucci2.png";
import gucci3 from "../assets/gucci3.png";
import gucci4 from "../assets/gucci4.png";
import vivi from "../assets/vivi.png";
import vivienneWestooodLogo from "../assets/vivienne_westwood_logo.jpg";
import gucciLogo from "../assets/gucci_logo.png";
import chromeHeartsLogo from "../assets/chrome_hearts_logo.png";
import balenciagaLogo from "../assets/balenciaga_logo.png";
import chromeHeartsCap from "../assets/chrome_hearts_cap.png";
import balenciagaHoodie from "../assets/balenciaga_hoodie.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const ProductCard = () => {
  return (
    <div className="product-card">
      <button className="product-card-image-container">
        <img className="product-card-image" src={gucci}></img>
      </button>
      <p className="product-card-title">Lorem Ipsum Dolor Sit Amet</p>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <section className="brand-cards-container">
        <div className="big-brand-card">
          {/* <h1></h1> */}
          <LiquidGlass
            displacementScale={64}
            blurAmount={0.1}
            saturation={130}
            aberrationIntensity={2}
            elasticity={0.35}
            cornerRadius={100}
            padding="8px 32px"
            className="liquid-glass-button"
            style={{
              position: "absolute",
              top: "90%",
              left: "50%",
              cursor: "pointer",
            }}
            onClick={() => navigate("/product-list/all-items")}
          >
            <div className="liquid-glass-button-text">All Items</div>
          </LiquidGlass>
        </div>
        <div className="small-brand-cards-container">
          <div>
            <Link
              id="small-brand-card-1"
              to="/product-list/brand/Vivienne%20Westwood"
            >
              <img src={vivienneWestooodLogo}></img>
            </Link>
            <Link id="small-brand-card-2" to="/product-list/brand/Gucci">
              <img src={gucciLogo}></img>
            </Link>
          </div>
          <div>
            <Link
              id="small-brand-card-3"
              to="/product-list/brand/Chrome%20Hearts"
            >
              <img src={chromeHeartsLogo}></img>
            </Link>
            <Link id="small-brand-card-4" to="/product-list/brand/Balenciaga">
              <img src={balenciagaLogo}></img>
            </Link>
          </div>
        </div>
      </section>
      <section className="marquee">
        <div className="track">
          <div className="item">
            <img src={balenciagaHoodie}></img>
          </div>
          <div className="item">
            <img src={chromeHeartsCap}></img>
          </div>
          <div className="item">
            <img src={gucci4}></img>
          </div>
          <div className="item">
            <img src={vivi}></img>
          </div>

          <div className="item">
            <img src={balenciagaHoodie}></img>
          </div>
          <div className="item">
            <img src={chromeHeartsCap}></img>
          </div>
          <div className="item">
            <img src={gucci4}></img>
          </div>
          <div className="item">
            <img src={vivi}></img>
          </div>
        </div>
      </section>
      <section className="newest-items-container">
        <div className="newest-items-left">
          <p>Newest Addition</p>
          <h2>16</h2>
          <p>Items Waiting To Be Discovered</p>
          <button>SHOP NOW</button>
        </div>
        <div className="newest-items-list">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>
        <button className="next-button">
          <RightArrowIcon />
        </button>
      </section>
    </div>
  );
};

export default HomePage;
