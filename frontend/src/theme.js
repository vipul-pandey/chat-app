import { extendTheme } from "@chakra-ui/react";

// Global style for all react-icons
const globalStyles = {
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },
  '[class^="react-icons"], [class*=" react-icons"]': {
    cursor: 'pointer',
  },
};

const theme = extendTheme({
  styles: {
    global: globalStyles,
  },
  components: {
    Button: {
      // Default button styles
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "md",
      },
      // Default props for all buttons
      defaultProps: {
        colorScheme: "real", // All buttons use teal color scheme by default
      },
      // Custom variants
      variants: {
        solid: {
          bg: "teal.500",
          color: "white",
          _hover: {
            bg: "teal.600",
          },
        },
        outline: {
          borderColor: "teal.500",
          color: "teal.500",
          _hover: {
            bg: "teal.50",
          },
        },
      },
    },
    dialog: {
      borderRadius: 'md',
      bg: `purple.100`,

      // provide dark mode alternatives
      _dark: {
        bg: `purple.600`,
        color: 'white',
      },
    },
  },
  mainBgColor: "#f8f8f8",
  secondaryBgColor: "#f8f8f8c8",
  singleChatBgColor: "#e8e8e8",
  whiteColor: "#ffffff",
  lightGreyColor: "#4b4949ff",
});

export default theme;