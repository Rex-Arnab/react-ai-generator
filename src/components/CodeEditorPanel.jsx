import React from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false
});

export default function CodeEditorPanel({
  currentCode,
  isDarkMode,
  onEditorChange,
  className = ""
}) {
  return (
    <div className={`h-full w-full relative ${className}`}>
      <MonacoEditor
        height="100%"
        language="javascript"
        theme={isDarkMode ? "vs-dark" : "vs-light"}
        value={currentCode}
        onChange={onEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true
        }}
      />
    </div>
  );
}
