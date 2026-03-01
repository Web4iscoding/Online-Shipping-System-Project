import { useState, useEffect } from "react";
import LiquidGlass from "liquid-glass-react";
import "../styles/HomePage.css";
import { LeftArrowIcon, RightArrowIcon } from "../assets/icons";
import gucci4 from "../assets/gucci4.png";
import vivi from "../assets/vivi.png";
import vivienneWestooodLogo from "../assets/vivienne_westwood_logo.jpg";
import gucciLogo from "../assets/gucci_logo.png";
import chromeHeartsLogo from "../assets/chrome_hearts_logo.png";
import balenciagaLogo from "../assets/balenciaga_logo.png";
import chromeHeartsCap from "../assets/chrome_hearts_cap.png";
import balenciagaHoodie from "../assets/balenciaga_hoodie.png";
import homepageMain from "../assets/homepage_main.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { products as productsApi, API_BASE } from "../api";
import noImage from "../assets/no_image_available.jpg";

const ProductCard = ({ productID, thumbnailURL, productName }) => {
  const navigate = useNavigate();
  return (
    <div className="product-card">
      <button
        className="product-card-image-container"
        onClick={() => navigate(`/product/${productID}`)}
      >
        <img className="product-card-image" src={thumbnailURL} alt={productName}></img>
      </button>
      <p className="product-card-title">{productName}</p>
    </div>
  );
};

const VISIBLE_COUNT = 8;

const HomePage = () => {
  const navigate = useNavigate();
  const [newestProducts, setNewestProducts] = useState([]);
  const [trackOffset, setTrackOffset] = useState(0);
  const [brandSlideIndex, setBrandSlideIndex] = useState(0);
  const [brandResetKey, setBrandResetKey] = useState(0);

  const brandSlides = [
    { src: homepageMain, link: "/product-list/all-items" },
    { src: vivienneWestooodLogo, link: "/product-list/brand/Vivienne%20Westwood" },
    { src: gucciLogo, link: "/product-list/brand/Gucci" },
    { src: chromeHeartsLogo, link: "/product-list/brand/Chrome%20Hearts" },
    { src: balenciagaLogo, link: "/product-list/brand/Balenciaga" },
  ];

  // Auto-scroll brand carousel every 5 seconds
  useEffect(() => {
    const total = brandSlides.length;
    if (total <= 1) return;
    const interval = setInterval(() => {
      setBrandSlideIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [brandResetKey]);

  useEffect(() => {
    productsApi.newest().then((data) => {
      setNewestProducts(data);
    }).catch(() => {
      setNewestProducts([]);
    });
  }, []);

  const maxOffset = Math.max(newestProducts.length - VISIBLE_COUNT, 0);
  const canGoPrev = trackOffset > 0;
  const canGoNext = trackOffset < maxOffset;

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
      {/* Mobile brand carousel */}
      <section className="brand-carousel-mobile">
        <div className="brand-carousel-viewport">
          <div
            className="brand-carousel-track"
            style={{
              transform: `translateX(-${brandSlideIndex * 100}%)`,
            }}
          >
            {brandSlides.map((slide, index) => (
              <div
                key={index}
                className="brand-carousel-slide"
                onClick={() => navigate(slide.link)}
              >
                <img src={slide.src} alt={`Brand ${index + 1}`} />
              </div>
            ))}
          </div>
          {brandSlideIndex === 0 && (
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
                top: "88%",
                left: "50%",
                transform: "translateX(-50%)",
                cursor: "pointer",
                
              }}
              onClick={() => navigate("/product-list/all-items")}
            >
              <div className="liquid-glass-button-text">All Items</div>
            </LiquidGlass>
          )}
        </div>
        <div className="brand-carousel-dots">
          {brandSlides.map((_, index) => (
            <button
              key={index}
              className={`image-select-button ${index === brandSlideIndex ? "selected" : ""}`}
              onClick={() => {
                setBrandSlideIndex(index);
                setBrandResetKey((k) => k + 1);
              }}
            />
          ))}
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
      {newestProducts.length > 0 && (
        <section className="newest-items-container">
          <div className="newest-items-left">
            <p>Newest Addition</p>
            <h2>{newestProducts.length}</h2>
            <p>Items Waiting To Be Discovered</p>
            <button onClick={() => navigate("/product-list/all-items")}>SHOP NOW</button>
          </div>
          <div className="newest-items-list">
            {canGoPrev && (
              <button
                className="newest-prev-button"
                onClick={() => setTrackOffset((prev) => Math.max(prev - 1, 0))}
              >
                <LeftArrowIcon />
              </button>
            )}
            {canGoNext && (
              <button
                className="newest-next-button"
                onClick={() => setTrackOffset((prev) => Math.min(prev + 1, maxOffset))}
              >
                <RightArrowIcon />
              </button>
            )}
            <div
              className="newest-items-track"
              style={{
                transform: `translateX(calc(-${trackOffset} * var(--card-slide-width)))`,
              }}
            >
              {newestProducts.map((product) => (
                <ProductCard
                  key={product.productID}
                  productID={product.productID}
                  thumbnailURL={
                    product.primary_image
                      ? `${API_BASE}/${product.primary_image}`
                      : noImage
                  }
                  productName={product.productName}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
