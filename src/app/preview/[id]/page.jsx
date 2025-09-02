"use client";

import React, { useEffect, useState, use } from "react";
import ComponentPreview from "@/components/ComponentPreview";

function ComponentPreviewPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const response = await fetch(`/api/components/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch component");
        }
        const data = await response.json();
        setComponent(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchComponent();
    }
  }, [params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!component) {
    return <div>Component not found</div>;
  }

  return (
    <div className="w-full h-screen">
      <ComponentPreview code={component.code} showDeviceControls={false} />
    </div>
  );
}

export default ComponentPreviewPage;
