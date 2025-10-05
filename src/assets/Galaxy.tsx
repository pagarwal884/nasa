// Galaxy.tsx
import React from "react";
import galaxyImg from "./space-background.jpg";
import "./Galaxy.css";

const Galaxy: React.FC = () => {
  return (
    <div className="galaxy-container">
      <img src={galaxyImg} alt="Galaxy" className="galaxy" />
    </div>
  );
};

export default Galaxy;
