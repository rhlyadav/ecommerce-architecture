import React from "react";
import { useSelector } from "react-redux";
import { Alert, Card, CardContent, Typography } from "@mui/material";

// Demo component showing state sharing
function StateSharingDemo() {
  const auth = useSelector((state) => state.auth);
  const ui = useSelector((state) => state.ui);

  return (
    <Card
      sx={{
        border: "2px solid #0f766e",
        borderRadius: "12px",
        p: 0.5,
        mt: 2,
        background: "rgba(15, 118, 110, 0.05)"
      }}
    >
      <CardContent>
        <Typography sx={{ mt: 0, color: "#0f766e" }} variant="h6">
          State Sharing Demo
        </Typography>
        <Typography sx={{ mb: 1, fontSize: 14 }}>
          <strong>Auth Status:</strong> {auth.status}
        </Typography>
      {auth.user && (
        <Typography sx={{ mb: 1, fontSize: 14 }}>
          <strong>User:</strong> {auth.user.name} ({auth.user.email})
        </Typography>
      )}
      {ui.notice && (
        <Alert severity="warning" sx={{ fontSize: 14 }}>
          <strong>Notice:</strong> {ui.notice}
        </Alert>
      )}
      </CardContent>
    </Card>
  );
}

export default StateSharingDemo;