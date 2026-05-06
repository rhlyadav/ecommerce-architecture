import React, { Suspense } from "react";
import { useSelector } from "react-redux";

// Demo component showing state sharing
function StateSharingDemo() {
  const auth = useSelector((state) => state.auth);
  const ui = useSelector((state) => state.ui);

  return (
    <div style={{
      border: "2px solid #0f766e",
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      background: "rgba(15, 118, 110, 0.05)"
    }}>
      <h3 style={{ marginTop: 0, color: "#0f766e" }}>🔗 State Sharing Demo</h3>
      <p style={{ marginBottom: 8, fontSize: 14 }}>
        <strong>Auth Status:</strong> {auth.status}
      </p>
      {auth.user && (
        <p style={{ marginBottom: 8, fontSize: 14 }}>
          <strong>User:</strong> {auth.user.name} ({auth.user.email})
        </p>
      )}
      {ui.notice && (
        <p style={{ marginBottom: 0, fontSize: 14, color: "#b91c1c" }}>
          <strong>Notice:</strong> {ui.notice}
        </p>
      )}
    </div>
  );
}

export default StateSharingDemo;