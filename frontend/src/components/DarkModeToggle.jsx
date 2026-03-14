import Icon from "@mdi/react";
import { mdiWhiteBalanceSunny, mdiMoonWaningCrescent } from "@mdi/js";
import { useTheme } from "../ThemeContext";
import "../styles/DarkModeToggle.css";

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      className={`dark-mode-toggle${isDarkMode ? " dark" : ""}`}
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="dark-mode-toggle-thumb">
        <Icon
          path={isDarkMode ? mdiMoonWaningCrescent : mdiWhiteBalanceSunny}
          size={0.65}
          className="dark-mode-toggle-icon"
        />
      </span>
    </button>
  );
};

export default DarkModeToggle;
