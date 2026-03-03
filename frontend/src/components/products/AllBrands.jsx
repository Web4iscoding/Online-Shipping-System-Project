import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { brands as brandsAPI } from "../../api";
import "../../styles/AllListPage.css";

const AllBrands = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await brandsAPI.list();
        const items = res.results || res;
        const sorted = [...items].sort((a, b) => {
          if (a.brandName?.toLowerCase() === "others") return 1;
          if (b.brandName?.toLowerCase() === "others") return -1;
          return a.brandName.localeCompare(b.brandName);
        });
        setBrands(sorted);
      } catch {
        // silent
      }
    };
    fetch();
  }, []);

  return (
    <div className="all-list-page-container">
      <h2>All Brands</h2>
      <div className="all-list-page-grid">
        {brands.map((brand) => (
          <Link
            key={brand.brandID}
            to={`/product-list/brand/${encodeURIComponent(brand.brandName)}`}
            className="all-list-page-item"
          >
            {brand.brandName}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllBrands;
