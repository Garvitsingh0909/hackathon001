import React from 'react';

export const DisclaimerBanner = () => {
  return (
    <div style={{
      background: "rgba(245,158,11,0.08)",
      border: "1px solid rgba(245,158,11,0.25)",
      borderRadius: 10,
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
      fontSize: 13,
      color: "rgba(255,255,255,0.6)",
    }}>
      <span style={{ fontSize: 16 }}>⚠️</span>
      <span>
        <strong style={{ color: "rgba(245,158,11,0.9)" }}>Demo Mode:</strong>
        {" "}All citizen reports, sensor readings, and water quality data shown 
        here are mock data for demonstration purposes only. 
        Real data will appear after pilot launch.
      </span>
    </div>
  );
};
