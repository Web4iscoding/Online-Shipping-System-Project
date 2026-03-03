import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { categories as categoriesAPI } from "../../api";
import "../../styles/AllListPage.css";

const AllCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await categoriesAPI.list();
        const items = res.results || res;
        const sorted = [...items].sort((a, b) => {
          if (a.categoryName?.toLowerCase() === "others") return 1;
          if (b.categoryName?.toLowerCase() === "others") return -1;
          return a.categoryName.localeCompare(b.categoryName);
        });
        setCategories(sorted);
      } catch {
        // silent
      }
    };
    fetch();
  }, []);

  return (
    <div className="all-list-page-container">
      <h2>All Categories</h2>
      <div className="all-list-page-grid">
        {categories.map((cat) => (
          <Link
            key={cat.categoryID}
            to={`/product-list/category/${encodeURIComponent(cat.categoryName)}`}
            className="all-list-page-item"
          >
            {cat.categoryName}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllCategories;
