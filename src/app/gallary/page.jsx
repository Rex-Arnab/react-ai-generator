"use client";

import ComponentGallery from "@/components/ComponentGallery";
import CodeEditorPanel from "@/components/CodeEditorPanel";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ComponentPreview from "@/components/ComponentPreview";

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

  const [currentComponent, setCurrentComponent] = useState(null);

  const loadComponent = async (component) => {
    try {
      const response = await fetch(`/api/components/${component._id}`);
      if (!response.ok) {
        throw new Error("Failed to load component");
      }
      const data = await response.json();
      setCurrentComponent({
        ...data.data,
        code: data.data.code || ""
      });
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

  const [activeTab, setActiveTab] = useState("preview");
  const [isUpdating, setIsUpdating] = useState(false);

  const updateComponent = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/components/${currentComponent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: currentComponent.name,
          code: currentComponent.code
        })
      });
      if (!response.ok) {
        throw new Error("Failed to update component");
      }
      fetchSavedComponents(); // Refresh the gallery
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full min-h-screen p-4">
      <div className="w-full md:w-1/3">
        <ComponentGallery
          components={savedComponents}
          onLoad={(comp) => {
            setCurrentComponent(comp);
            setActiveTab("preview");
          }}
          onDelete={deleteComponent}
          isLoading={isLoading}
        />
      </div>
      {currentComponent && (
        <div className="w-full md:w-2/3 flex flex-col gap-2">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "preview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("preview")}>
              Preview
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "code"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("code")}>
              Code
            </button>
            <div className="flex-grow"></div>
            <Button
              onClick={updateComponent}
              disabled={isUpdating}
              className="m-2">
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
          <div className="flex-grow">
            {activeTab === "preview" ? (
              <div className="h-full">
                <ComponentPreview code={currentComponent.code} />
              </div>
            ) : (
              <CodeEditorPanel
                currentCode={currentComponent.code}
                isDarkMode={false}
                onEditorChange={(value) =>
                  setCurrentComponent((prev) => ({
                    ...prev,
                    code: value
                  }))
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
