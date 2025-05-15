import React from 'react';

const EnvDisplay: React.FC = () => {
  return (
    <div className="p-4 bg-gray-100 rounded-md text-xs">
      <h3 className="font-bold mb-2">Environment Variables:</h3>
      <div className="grid gap-1">
        <div>VITE_MAPBOX_API_KEY: {import.meta.env.VITE_MAPBOX_API_KEY ? "Available" : "Not Available"}</div>
        <div>MAPBOX_API_KEY: {import.meta.env.MAPBOX_API_KEY ? "Available" : "Not Available"}</div>
        <div>MODE: {import.meta.env.MODE}</div>
        <div>DEV: {import.meta.env.DEV ? "Yes" : "No"}</div>
        <div>PROD: {import.meta.env.PROD ? "Yes" : "No"}</div>
      </div>
    </div>
  );
};

export default EnvDisplay;