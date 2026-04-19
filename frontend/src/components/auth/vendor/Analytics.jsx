import { useState, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { useNavigate } from "react-router-dom";
import { vendor as vendorAPI, API_BASE } from "../../../api";
import { LeftArrowIcon, ChartBarIcon } from "../../../assets/icons";
import noImage from "../../../assets/no_image_available.jpg";
import "../../../styles/Analytics.css";
import LoadingIndicator from "../../common/LoadingIndicator";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

const Analytics = () => {
  const { isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!isAuthenticated || !isVendor) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isVendor, navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const result = await vendorAPI.analytics(days);
        setData(result);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="analytics-container">
        <button
          className="analytics-back-button"
          onClick={() => navigate("/profile")}
        >
          <LeftArrowIcon size={1} />
          Back to Profile
        </button>
        <LoadingIndicator />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-container">
        <button
          className="analytics-back-button"
          onClick={() => navigate("/profile")}
        >
          <LeftArrowIcon size={1} />
          Back to Profile
        </button>
        <p>Failed to load analytics data.</p>
      </div>
    );
  }

  const { summary, topSearchQueries, topWishlisted, productViewTrends, topProducts, revenueByDay, categoryBreakdown, conversionFunnel, recommendedDiscounts } = data;

  const chartColors = [
    "hsl(232, 50%, 50%)",
    "hsl(232, 50%, 65%)",
    "hsl(200, 50%, 50%)",
    "hsl(170, 50%, 45%)",
    "hsl(131, 50%, 50%)",
    "hsl(57, 50%, 50%)",
    "hsl(30, 60%, 50%)",
    "hsl(360, 50%, 50%)",
    "hsl(280, 45%, 55%)",
    "hsl(0, 0%, 50%)",
  ];

  return (
    <div className="analytics-container">
      <button
        className="analytics-back-button"
        onClick={() => navigate("/profile")}
      >
        <LeftArrowIcon size={1} />
        Back to Profile
      </button>

      <div className="analytics-header">
        <div className="analytics-header-title">
          <h2>Store Analytics</h2>
        </div>
        <select
          className="analytics-period-select"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary-row">
        <div className="analytics-summary-card">
          <p className="analytics-summary-label">Total Views</p>
          <h3 className="analytics-summary-value">{summary.totalViews.toLocaleString()}</h3>
        </div>
        <div className="analytics-summary-card">
          <p className="analytics-summary-label">Total Orders</p>
          <h3 className="analytics-summary-value">{summary.totalOrders.toLocaleString()}</h3>
        </div>
        <div className="analytics-summary-card">
          <p className="analytics-summary-label">Revenue</p>
          <h3 className="analytics-summary-value">${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="analytics-summary-card">
          <p className="analytics-summary-label">Products</p>
          <h3 className="analytics-summary-value">{summary.totalProducts}</h3>
        </div>
      </div>

      {/* Product View Trends */}
      <div className="analytics-chart-card">
        <h3 className="analytics-chart-title">Product Views Over Time</h3>
        {productViewTrends.length > 0 ? (
          <div className="analytics-chart-wrapper">
            <LineChart
              xAxis={[{
                data: productViewTrends.map((d) => new Date(d.date)),
                scaleType: "time",
                valueFormatter: (v) => v.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              }]}
              series={[{
                data: productViewTrends.map((d) => d.views),
                label: "Views",
                color: chartColors[0],
                area: true,
              }]}
              height={300}
              margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
              slotProps={{ legend: { hidden: true } }}
            />
          </div>
        ) : (
          <p className="analytics-empty">No view data for this period.</p>
        )}
      </div>

      {/* Revenue Over Time */}
      <div className="analytics-chart-card">
        <h3 className="analytics-chart-title">Revenue Over Time</h3>
        {revenueByDay.length > 0 ? (
          <div className="analytics-chart-wrapper">
            <LineChart
              xAxis={[{
                data: revenueByDay.map((d) => new Date(d.date)),
                scaleType: "time",
                valueFormatter: (v) => v.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              }]}
              series={[
                {
                  data: revenueByDay.map((d) => d.revenue),
                  label: "Revenue ($)",
                  color: chartColors[4],
                  area: true,
                },
              ]}
              height={300}
              margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
              slotProps={{ legend: { hidden: true } }}
            />
          </div>
        ) : (
          <p className="analytics-empty">No revenue data for this period.</p>
        )}
      </div>

      {/* Two-column row: Search Queries + Top Products */}
      <div className="analytics-row">
        <div className="analytics-chart-card analytics-half">
          <h3 className="analytics-chart-title">Top Search Queries (from views)</h3>
          {topSearchQueries.length > 0 ? (
            <div className="analytics-chart-wrapper">
              <BarChart
                yAxis={[{
                  data: topSearchQueries.map((d) => d.query),
                  scaleType: "band",
                }]}
                series={[{
                  data: topSearchQueries.map((d) => d.count),
                  label: "Views from Search",
                  color: chartColors[2],
                }]}
                layout="horizontal"
                height={Math.max(250, topSearchQueries.length * 40)}
                margin={{ left: 120, right: 20, top: 20, bottom: 30 }}
                slotProps={{ legend: { hidden: true } }}
              />
            </div>
          ) : (
            <p className="analytics-empty">No search-driven views yet.</p>
          )}
        </div>

        <div className="analytics-chart-card analytics-half">
          <h3 className="analytics-chart-title">Top Viewed Products</h3>
          {topProducts.length > 0 ? (
            <div className="analytics-chart-wrapper">
              <BarChart
                yAxis={[{
                  data: topProducts.map((d) => d.name.length > 20 ? d.name.slice(0, 20) + "…" : d.name),
                  scaleType: "band",
                }]}
                series={[{
                  data: topProducts.map((d) => d.views),
                  label: "Views",
                  color: chartColors[0],
                }]}
                layout="horizontal"
                height={Math.max(250, topProducts.length * 40)}
                margin={{ left: 160, right: 20, top: 20, bottom: 30 }}
                slotProps={{ legend: { hidden: true } }}
              />
            </div>
          ) : (
            <p className="analytics-empty">No product views yet.</p>
          )}
        </div>
      </div>

      {/* Two-column row: Global Search Trends + Category Breakdown */}
      <div className="analytics-row">
        <div className="analytics-chart-card analytics-half">
          <h3 className="analytics-chart-title">Top Wishlisted Products</h3>
          {topWishlisted.length > 0 ? (
            <div className="analytics-chart-wrapper">
              <BarChart
                yAxis={[{
                  data: topWishlisted.map((d) => d.name.length > 20 ? d.name.slice(0, 20) + "…" : d.name),
                  scaleType: "band",
                }]}
                series={[{
                  data: topWishlisted.map((d) => d.count),
                  label: "Wishlisted",
                  color: chartColors[7],
                }]}
                layout="horizontal"
                height={Math.max(250, topWishlisted.length * 40)}
                margin={{ left: 160, right: 20, top: 20, bottom: 30 }}
                slotProps={{ legend: { hidden: true } }}
              />
            </div>
          ) : (
            <p className="analytics-empty">No wishlisted products yet.</p>
          )}
        </div>

        <div className="analytics-chart-card analytics-half">
          <h3 className="analytics-chart-title">Views by Category</h3>
          {categoryBreakdown.length > 0 ? (
            <div className="analytics-chart-wrapper analytics-pie-wrapper">
              <PieChart
                series={[{
                  data: categoryBreakdown.map((d, i) => ({
                    id: i,
                    value: d.views,
                    label: d.category,
                    color: chartColors[i % chartColors.length],
                  })),
                  arcLabel: (item) => `${item.value}`,
                  innerRadius: 30,
                  paddingAngle: 2,
                  cornerRadius: 4,
                }]}
                height={280}
                margin={{ left: 0, right: 140, top: 10, bottom: 10 }}
              />
            </div>
          ) : (
            <p className="analytics-empty">No category data yet.</p>
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="analytics-chart-card">
        <h3 className="analytics-chart-title">Conversion Funnel</h3>
        {conversionFunnel.views > 0 || conversionFunnel.cartAdds > 0 || conversionFunnel.orders > 0 ? (
          <div className="analytics-chart-wrapper">
            <BarChart
              xAxis={[{
                data: ["Product Views", "Added to Cart", "Ordered"],
                scaleType: "band",
              }]}
              series={[{
                data: [conversionFunnel.views, conversionFunnel.cartAdds, conversionFunnel.orders],
                label: "Count",
                color: chartColors[0],
              }]}
              height={300}
              margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
              slotProps={{ legend: { hidden: true } }}
              colors={[chartColors[0], chartColors[4], chartColors[6]]}
            />
          </div>
        ) : (
          <p className="analytics-empty">No conversion data yet.</p>
        )}
      </div>

      {/* Recommended Discounts */}
      <div className="analytics-section">
        <h3 className="analytics-section-title">Recommended Discounts</h3>
        <p className="analytics-section-subtitle">Products with high interest but low conversions — setting a discount may help boost sales.</p>
        {recommendedDiscounts && recommendedDiscounts.length > 0 ? (
          <div className="analytics-rec-list">
            {recommendedDiscounts.map((p) => (
              <button
                key={p.productID}
                className="analytics-rec-card"
                onClick={() => navigate(`/create-discount/${p.productID}`)}
              >
                <img
                  className="analytics-rec-image"
                  src={p.image ? `${API_BASE}${p.image}` : noImage}
                  alt={p.name}
                />
                <div className="analytics-rec-info">
                  <p className="analytics-rec-name">{p.name}</p>
                  <p className="analytics-rec-price">${p.price.toFixed(2)}</p>
                </div>
                <div className="analytics-rec-stats">
                  <span>{p.views} views</span>
                  <span>{p.wishlists} wishlisted</span>
                  <span>{p.cartAdds} carted</span>
                  <span>{p.orders} ordered</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="analytics-empty">No discount recommendations at this time.</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
