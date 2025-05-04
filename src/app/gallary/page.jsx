"use client";

import ComponentGallery from "@/components/ComponentGallery";
import React, { useEffect, useState } from "react";

function Gallery() {
  const [savedComponents, setSavedComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedComponents = async () => {
    try {
      const response = await fetch("/api/components");
      if (!response.ok) {
        throw new Error("Failed to fetch components");
      }
      const data = await response.json();
      console.log(data);
      setSavedComponents(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedComponents();
  }, []);

  const loadComponent = async (componentId) => {
    try {
      const response = await fetch(`/api/components/${componentId}`);
      if (!response.ok) {
        throw new Error("Failed to load component");
      }
      const data = await response.json();
      // Handle the loaded component data as needed
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteComponent = async (componentId) => {
    try {
      const response = await fetch(`/api/components/${componentId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Failed to delete component");
      }
      setSavedComponents((prev) =>
        prev.filter((comp) => comp._id !== componentId)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col justify-center w-full min-h-screen">
      <ComponentGallery
        components={savedComponents}
        onLoad={loadComponent}
        onDelete={deleteComponent}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Gallery;
