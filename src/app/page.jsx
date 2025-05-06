"use client";

import React, { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import SavedComponentsList from "@/components/SavedComponentsList";
import ComponentPreview from "@/components/ComponentPreview";
import useComponentAPI from "@/hooks/useComponentAPI";
import PromptForm from "@/components/PromptForm";
import SaveComponentForm from "@/components/SaveComponentForm";
import CodeEditorPanel from "@/components/CodeEditorPanel";
import MobileControls from "@/components/MobileControls";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

let InitalCode = `
// Your component code will appear here
function Component(){
  return "Let's Start Building"
}`;
export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [libraries, setLibraries] = useState("");
  const [currentCode, setCurrentCode] = useState(InitalCode);
  const [savedComponents, setSavedComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [componentName, setComponentName] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aiModel, setAiModel] = useState("deepseek/deepseek-chat-v3-0324:free");
  const [apiKey, setApiKey] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [viewMode, setViewMode] = useState("both"); // 'code', 'preview', or 'both'

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const {
    isLoading,
    error,
    fetchSavedComponents,
    generateComponent,
    saveComponent,
    deleteComponent
  } = useComponentAPI();

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

  // Load saved components
  useEffect(() => {
    const loadComponents = async () => {
      const components = await fetchSavedComponents();
      setSavedComponents(components);
    };
    loadComponents();
  }, []);

  const handleGenerate = async (iteration = false) => {
    if ((!prompt && !iteration) || (iteration && !currentCode)) {
      return;
    }

    const code = await generateComponent({
      prompt,
      libraries,
      existingCode: iteration ? currentCode : null,
      model: aiModel,
      apiKey,
      file: uploadedFile
    });

    // Clear file after generation
    setUploadedFile(null);
    setFilePreview(null);

    if (code) {
      setPreviewKey((prev) => prev + 1);
      setCurrentCode(code);
    }
  };

  const handleSave = async () => {
    const saved = await saveComponent({
      id: selectedComponentId,
      name: componentName,
      code: currentCode,
      prompt,
      libraries
    });

    if (saved) {
      setComponentName("");
      setSelectedComponentId(saved._id);
      const components = await fetchSavedComponents();
      setSavedComponents(components);
    }
  };

  const loadComponent = (component) => {
    if (!component?.code) return;

    setPrompt(component.prompt || "");
    setLibraries(component.libraries || "");
    setComponentName(component.name);
    setSelectedComponentId(component._id);
    setCurrentCode(component.code);
    setPreviewKey((prev) => prev + 1);
  };

  const handleDelete = async (id) => {
    if (!id || !confirm("Are you sure you want to delete this component?")) {
      return;
    }

    const success = await deleteComponent(id);
    if (success) {
      const components = await fetchSavedComponents();
      setSavedComponents(components);

      if (selectedComponentId === id) {
        setPrompt("");
        setLibraries("");
        setCurrentCode(" // Select or generate a component");
        setComponentName("");
        setSelectedComponentId(null);
        setPreviewKey((prev) => prev + 1);
      }
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
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {/* Header - Stack on small screens */}
      <header className="flex flex-col sm:flex-row items-center justify-between p-4 border-b gap-2 sm:gap-4">
        <h1 className="text-xl font-semibold">Ideator</h1>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-normal">
          <SavedComponentsList
            components={savedComponents}
            onLoad={loadComponent}
            onDelete={handleDelete}
          />
          <SettingsDialog
            model={aiModel}
            onModelChange={setAiModel}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
          />
          {/* Mobile toggle for left panel */}
          <div className="md:hidden p-2 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                document
                  .querySelector(".mobile-left-panel")
                  .classList.toggle("hidden")
              }>
              Toggle Settings
            </Button>
          </div>

          <div className="flex gap-1">
            <Toggle
              pressed={viewMode === "code" || viewMode === "both"}
              onPressedChange={(pressed) =>
                setViewMode(
                  pressed
                    ? viewMode === "preview"
                      ? "both"
                      : "code"
                    : "preview"
                )
              }
              size="sm">
              Code
            </Toggle>
            <Toggle
              pressed={viewMode === "preview" || viewMode === "both"}
              onPressedChange={(pressed) =>
                setViewMode(
                  pressed ? (viewMode === "code" ? "both" : "preview") : "code"
                )
              }
              size="sm">
              Preview
            </Toggle>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-grow border-b">
        {/* Left Panel: Input & Settings - Stack vertically on mobile */}
        <ResizablePanel
          defaultSize={25}
          minSize={20}
          className="hidden md:block">
          <div className="flex flex-col h-full p-4 space-y-4 overflow-auto">
            <PromptForm
              prompt={prompt}
              onPromptChange={setPrompt}
              libraries={libraries}
              onLibrariesChange={setLibraries}
              isLoading={isLoading}
              currentCode={currentCode}
              onGenerate={() => handleGenerate(false)}
              onIterate={() => handleGenerate(true)}
              onFileUpload={handleFileUpload}
              filePreview={filePreview}
            />
            <SaveComponentForm
              componentName={componentName}
              onNameChange={setComponentName}
              isLoading={isLoading}
              currentCode={currentCode}
              selectedComponentId={selectedComponentId}
              onSave={handleSave}
            />
          </div>
        </ResizablePanel>

        {/* Mobile left panel - scrollable with max height */}
        <MobileControls
          prompt={prompt}
          onPromptChange={setPrompt}
          libraries={libraries}
          onLibrariesChange={setLibraries}
          componentName={componentName}
          onNameChange={setComponentName}
          isLoading={isLoading}
          currentCode={currentCode}
          selectedComponentId={selectedComponentId}
          onGenerate={() => handleGenerate(false)}
          onIterate={() => handleGenerate(true)}
          onSave={handleSave}
          onFileUpload={handleFileUpload}
          filePreview={filePreview}
        />

        <ResizableHandle withHandle className="hidden md:block" />

        {/* Right Panel: Editor & Preview - Full width on mobile */}
        <ResizablePanel defaultSize={75} minSize={30} className="w-full">
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Code Editor - Smaller on mobile */}
            {(viewMode === "code" || viewMode === "both") && (
              <ResizablePanel
                defaultSize={viewMode === "both" ? 50 : 100}
                minSize={20}
                className="min-h-[200px]">
                <CodeEditorPanel
                  currentCode={currentCode}
                  isDarkMode={isDarkMode}
                  onEditorChange={handleEditorChange}
                />
              </ResizablePanel>
            )}

            {viewMode === "both" && (
              <ResizableHandle withHandle className="hidden sm:block" />
            )}

            {/* Component Preview - Larger on mobile */}
            {(viewMode === "preview" || viewMode === "both") && (
              <ResizablePanel
                defaultSize={viewMode === "both" ? 50 : 100}
                minSize={20}
                className="min-h-[300px] sm:min-h-0">
                <div className="flex flex-col h-full">
                  <div className="p-2 border-b">
                    <span className="font-medium text-sm">Preview</span>
                  </div>
                  <div className="flex-grow p-4 bg-slate-200 relative overflow-auto">
                    <ComponentPreview
                      key={previewKey}
                      code={currentCode}
                      showDeviceControls={false}
                    />
                  </div>
                </div>
              </ResizablePanel>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Optional: Display Error Messages */}
      {/* {error && <div className="p-4 bg-destructive text-destructive-foreground">{error}</div>} */}
    </div>
  );
}
