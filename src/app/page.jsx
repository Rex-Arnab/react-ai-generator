// app/page.js
"use client"; // This page needs client-side interactivity

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic"; // For loading Monaco Editor dynamically
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import { ThemeToggle } from "@/components/ThemeToggle";
import SavedComponentsList from "@/components/SavedComponentsList"; // We'll create this
import ComponentPreview from "@/components/ComponentPreview"; // We'll create this
import { toast } from "sonner";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false
});

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [libraries, setLibraries] = useState(""); // For npm/cdn input
  const [generatedCode, setGeneratedCode] = useState(
    " // Your component code will appear here"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCode, setCurrentCode] = useState(generatedCode); // Code currently in the editor
  const [savedComponents, setSavedComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null); // Track loaded component
  const [componentName, setComponentName] = useState(""); // For saving
  const [previewKey, setPreviewKey] = useState(0); // To force preview refresh
  const [isDarkMode, setIsDarkMode] = useState(false); // Track theme

  // --- Theme Detection ---
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    // Check initial theme
    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  // --- Fetch Saved Components ---
  const fetchSavedComponents = useCallback(async () => {
    try {
      const response = await fetch("/api/components");
      if (!response.ok) throw new Error("Failed to fetch components");
      const data = await response.json();
      if (data.success) {
        setSavedComponents(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch components");
      }
    } catch (err) {
      toast.error("Error fetching components");
    }
  }, []);

  useEffect(() => {
    fetchSavedComponents();
  }, [fetchSavedComponents]);

  // --- Code Generation ---
  const handleGenerate = async (iteration = false) => {
    if (!prompt && !iteration) {
      toast.info("Prompt is empty");
      return;
    }
    if (iteration && !currentCode) {
      toast.info("No code to iterate on");
      return;
    }

    setIsLoading(true);
    setError(null);

    const requestBody = {
      prompt: prompt,
      libraries: libraries,
      // Send current editor code ONLY if iterating
      existingCode: iteration ? currentCode : null
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed with status ${response.status}`
        );
      }

      if (data.success) {
        const formattedCode = data.code; // Assume API returns formatted code
        setGeneratedCode(formattedCode);
        setCurrentCode(formattedCode); // Update editor as well
        setPreviewKey((prev) => prev + 1); // Refresh preview
        toast.success(
          iteration
            ? "Component updated based on your prompt."
            : "New component generated successfully."
        );
      } else {
        throw new Error(data.error || "Failed to generate component");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message);
      toast.error("Generation Failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Saving Components ---
  const handleSave = async () => {
    if (
      !currentCode ||
      currentCode.trim() === "" ||
      currentCode.startsWith(" //")
    ) {
      toast.error("Cannot Save: No code to save.");
      return;
    }
    if (!componentName.trim()) {
      toast.error("Cannot Save: Please provide a name for the component.");
      return;
    }

    setIsLoading(true);
    const payload = {
      name: componentName,
      code: currentCode,
      prompt: prompt, // Save the last prompt used
      libraries: libraries
    };

    try {
      let response;
      let method = "POST";
      let url = "/api/components";

      // If a component was loaded, update it (PUT) instead of creating (POST)
      if (selectedComponentId) {
        method = "PUT";
        url = `/api/components/${selectedComponentId}`;
      }

      response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${method === "PUT" ? "update" : "save"} component`
        );
      }

      if (data.success) {
        toast.info(
          `Component "${data.data.name}" ${
            method === "PUT" ? "updated" : "saved"
          } successfully.`
        );
        setComponentName(""); // Clear name input
        setSelectedComponentId(data.data._id); // Update ID in case it was a new save
        fetchSavedComponents(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to save component");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Save Failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Loading Components ---
  const loadComponent = (component) => {
    setPrompt(component.prompt || ""); // Load original prompt if available
    setLibraries(component.libraries || "");
    setCurrentCode(component.code);
    setGeneratedCode(component.code); // Set generated code as well for consistency
    setComponentName(component.name); // Set name for potential re-save/update
    setSelectedComponentId(component._id);
    setPreviewKey((prev) => prev + 1); // Refresh preview
    toast.info(`Loaded component: ${component.name}`);
  };

  // --- Deleting Components ---
  const deleteComponent = async (id) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this component?")) return; // Simple confirmation

    setIsLoading(true);
    try {
      const response = await fetch(`/api/components/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete component");
      }

      if (data.success) {
        toast.success("Component deleted successfully");
        fetchSavedComponents(); // Refresh list
        // If the deleted component was the currently loaded one, clear the editor
        if (selectedComponentId === id) {
          setPrompt("");
          setLibraries("");
          setCurrentCode(" // Select or generate a component");
          setGeneratedCode(" // Select or generate a component");
          setComponentName("");
          setSelectedComponentId(null);
          setPreviewKey((prev) => prev + 1);
        }
      } else {
        throw new Error(data.error || "Failed to delete component");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete Failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Monaco Editor Handler ---
  const handleEditorChange = (value) => {
    setCurrentCode(value || "");
  };

  // Debounce preview refresh? Maybe not necessary with explicit button/generation trigger.
  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setPreviewKey(prev => prev + 1);
  //   }, 500); // Refresh preview 500ms after code stops changing
  //   return () => clearTimeout(handler);
  // }, [currentCode]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">V0 Clone</h1>
        <div className="flex items-center gap-4">
          <SavedComponentsList
            components={savedComponents}
            onLoad={loadComponent}
            onDelete={deleteComponent}
          />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-grow border-b">
        {/* Left Panel: Input & Settings */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="flex flex-col h-full p-4 space-y-4">
            <Card className="flex-grow flex flex-col">
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col space-y-4">
                <div className="flex-grow">
                  <Label htmlFor="prompt-input">
                    Describe the component you want:
                  </Label>
                  <Textarea
                    id="prompt-input"
                    placeholder="e.g., A button that increments a counter on click, styled with primary colors."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-48 resize-none mt-1" // Increased initial height
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="libs-input">
                    NPM Libraries / CDNs (optional):
                  </Label>
                  <Input
                    id="libs-input"
                    placeholder="e.g., react-icons, https://cdn.skypack.dev/canvas-confetti"
                    value={libraries}
                    onChange={(e) => setLibraries(e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  onClick={() => handleGenerate(true)}
                  disabled={
                    isLoading || !currentCode || currentCode.startsWith(" //")
                  }
                  variant="outline">
                  {isLoading ? "Iterating..." : "Iterate"}
                </Button>
                <Button
                  onClick={() => handleGenerate(false)}
                  disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Save Component</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="component-name">Component Name:</Label>
                <Input
                  id="component-name"
                  placeholder="e.g., counter-button"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  disabled={isLoading}
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSave}
                  disabled={
                    isLoading ||
                    !currentCode ||
                    currentCode.startsWith(" //") ||
                    !componentName.trim()
                  }
                  className="w-full">
                  {isLoading
                    ? "Saving..."
                    : selectedComponentId
                    ? "Update Saved Component"
                    : "Save New Component"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Editor & Preview */}
        <ResizablePanel defaultSize={75} minSize={30}>
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Code Editor */}
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-full w-full relative">
                <MonacoEditor
                  height="100%" // Use 100% of the panel height
                  language="javascript" // Use javascript, JSX is supported
                  theme={isDarkMode ? "vs-dark" : "vs-light"} // Sync with theme
                  value={currentCode}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true // Important for resizable panels
                  }}
                  // Consider adding loading state for editor itself
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Component Preview */}
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex flex-col h-full">
                <div className="p-2 border-b font-medium text-sm">Preview</div>
                <div className="flex-grow p-4 bg-muted/40 relative overflow-auto">
                  <ComponentPreview key={previewKey} code={currentCode} />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Optional: Display Error Messages */}
      {/* {error && <div className="p-4 bg-destructive text-destructive-foreground">{error}</div>} */}
    </div>
  );
}
