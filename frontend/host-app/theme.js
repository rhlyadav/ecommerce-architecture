import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0f766e"
    },
    secondary: {
      main: "#1d4ed8"
    },
    background: {
      default: "#f8fafc"
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: "'Segoe UI', sans-serif"
  }
});

export default theme;
