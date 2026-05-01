import { extendTheme } from "@chakra-ui/react";

// Modern color palette
const colors = {
  primary: {
    50: "#f0f4ff",
    100: "#e0e9ff",
    200: "#c1d3ff",
    300: "#a2bdff",
    400: "#8ba7ff",
    500: "#6b91ff",
    600: "#5570d6",
    700: "#3f4fad",
    800: "#2a2e84",
    900: "#15105b",
  },
  gradient: {
    primary: "linear-gradient(135deg, #6b91ff 0%, #4f63d6 100%)",
    secondary: "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)",
    accent: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
};

// Global style for all react-icons
const globalStyles = {
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },
  '[class^="react-icons"], [class*=" react-icons"]': {
    cursor: 'pointer',
  },
  'html, body': {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
};

const theme = extendTheme({
  colors,
  breakpoints: {
    base: "0px",
    sm: "480px",
    md: "768px",
    lg: "992px",
    xl: "1280px",
    "2xl": "1536px",
  },
  styles: {
    global: globalStyles,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "10px",
        transition: "all 0.3s ease",
        _hover: {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 16px rgba(107, 145, 255, 0.3)",
        },
        _active: {
          transform: "translateY(0)",
        },
      },
      variants: {
        solid: {
          bg: "linear-gradient(135deg, #6b91ff 0%, #4f63d6 100%)",
          color: "white",
          _hover: {
            bg: "linear-gradient(135deg, #5570d6 0%, #3f4fad 100%)",
          },
        },
        outline: {
          borderColor: "#6b91ff",
          color: "#6b91ff",
          _hover: {
            bg: "rgba(107, 145, 255, 0.1)",
          },
        },
        ghost: {
          _hover: {
            bg: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "12px",
          transition: "all 0.3s ease",
          border: "1.5px solid",
          borderColor: "#e5e7eb",
          _focus: {
            borderColor: "#6b91ff",
            boxShadow: "0 0 0 3px rgba(107, 145, 255, 0.1)",
          },
        },
      },
    },
  },
  mainBgColor: "#ffffff",
  secondaryBgColor: "#f8fafc",
  singleChatBgColor: "#f1f5f9",
  whiteColor: "#ffffff",
  lightGreyColor: "#64748b",
  accentColor: "#6b91ff",
  mobile: {
    padding: "12px",
    fontSize: "14px",
    minTouchTarget: "44px",
  },
  desktop: {
    padding: "16px",
    fontSize: "16px",
  },
});

export default theme;