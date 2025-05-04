// components/ComponentPreview.js
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react"; // Added useMemo
import { useTheme } from "next-themes";

// Base HTML structure for the iframe (keep this function the same)
const createIframeContent = (theme) => `
<!DOCTYPE html>
<html class="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
       darkMode: 'class',
      theme: { extend: {} }
    }
  </script>
  <style>
    body { margin: 0; padding: 1rem; background-color: transparent; font-family: sans-serif; }
    #error-overlay { position: absolute; inset: 1rem; background: rgba(255,0,0,0.1); color: red; border: 1px solid red; padding: 1rem; font-family: monospace; white-space: pre-wrap; overflow: auto; z-index: 9999; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error-overlay" style="display: none;"></div>
  <script type="module">
    const rootElement = document.getElementById('root');
    const errorOverlay = document.getElementById('error-overlay');
    const root = ReactDOM.createRoot(rootElement);
    let CurrentComponent = () => React.createElement('div', null, 'Waiting for component code...');

    const renderError = (error) => {
        console.error('Preview Error:', error);
        errorOverlay.textContent = 'Preview Error:\\n' + error.message + '\\n\\nStack: ' + (error.stack || 'N/A') + '\\n\\nCheck browser console (iframe) for details.';
        errorOverlay.style.display = 'block';
         try { root.render(null); } catch(e) {} // Attempt to clear previous render
    };

    window.addEventListener('message', (event) => {
      // Optional: More specific origin check for production
      // if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === 'renderComponent') {
        console.log("Iframe: Received renderComponent message.");
        const code = event.data.code;
        const theme = event.data.theme;
        errorOverlay.style.display = 'none';
        errorOverlay.textContent = '';
        // Ensure window.GeneratedComponent is cleared before trying to create new one
        window.GeneratedComponent = undefined;

        try {
            document.documentElement.className = theme;

            if (!window.Babel) {
                throw new Error("Babel Standalone not loaded!");
            }
            console.log("Iframe: Transforming code with Babel...");
            const transformedCode = window.Babel.transform(code, {
                 presets: ['react']
            }).code;
            console.log("Iframe: Transformation complete.");

            // --- New Script Execution Approach ---
            const existingScript = document.getElementById('component-script');
            if (existingScript) existingScript.remove();

            const script = document.createElement('script');
            script.id = 'component-script';
            // IMPORTANT: Wrap in try/catch *inside* the script text
            // to catch execution errors and assign the component.
            // Assumes the AI named the function 'Component'.
            script.textContent = \`
                try {
                    \${transformedCode}
                    // Assign the specifically named component to the window
                    if (typeof Component !== 'undefined') {
                       window.GeneratedComponent = Component;
                    } else {
                       throw new Error('The function "Component" was not defined in the generated code.');
                    }
                } catch (err) {
                   // Make the error available to the outer catch block
                   window.GeneratedComponentError = err;
                }
            \`;

            // Add script to body to execute it
            document.body.appendChild(script);

            // Check if an error occurred during script execution
            if (window.GeneratedComponentError) {
                const err = window.GeneratedComponentError;
                window.GeneratedComponentError = null; // Clear error
                throw err; // Rethrow to be caught by the main try/catch
            }

            // Check if the component was successfully attached
            if (!window.GeneratedComponent) {
                throw new Error('Component function "Component" was not found on window object after executing generated code. Check AI output/prompt/naming.');
            }
             console.log("Iframe: Component assigned to window.GeneratedComponent.");

            // Render the component from the window object
            console.log("Iframe: Rendering component...");
            root.render(React.createElement(window.GeneratedComponent));
            console.log("Iframe: Render complete.");
            // --- End New Script Execution Approach ---

        } catch (error) {
            renderError(error); // Display error in the iframe itself
        }
      }
    });

    // Initial render message
    root.render(React.createElement(CurrentComponent));
    console.log("Iframe: Initialized and waiting for code.");
  </script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</body>
</html>
`;

export default function ComponentPreview({ code }) {
  const iframeRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  // Memoize the iframe content string generation
  const iframeContent = useMemo(() => {
    console.log("Parent: Generating iframe content for theme:", resolvedTheme); // Debug
    return createIframeContent(resolvedTheme);
  }, [resolvedTheme]);

  // Effect to set the iframe's srcDoc and add load listener
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      console.log("Parent: Setting srcDoc and adding load listener."); // Debug
      setIsIframeLoaded(false); // Reset loaded state when content changes (theme change)
      iframe.srcdoc = iframeContent;

      const handleLoad = () => {
        console.log("Parent: iframe 'load' event fired."); // Debug
        setIsIframeLoaded(true);
        // We could post the message here too, but the separate effect below handles it
        // based on both load state AND code availability.
      };

      iframe.addEventListener("load", handleLoad);

      // Cleanup listener on unmount or before next run
      return () => {
        iframe.removeEventListener("load", handleLoad);
      };
    }
  }, [iframeContent]); // Re-run only when the theme/content string changes

  // Effect to post the message to the iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    // Send message only if iframe exists, has a contentWindow, is loaded, and we have code
    if (iframe && iframe.contentWindow && isIframeLoaded && code) {
      console.log("Parent: Conditions met, posting 'renderComponent' message."); // Debug
      iframe.contentWindow.postMessage(
        { type: "renderComponent", code, theme: resolvedTheme },
        "*"
      ); // Use specific origin in production!
    } else {
      console.log("Parent: Conditions NOT met for posting message.", {
        hasWindow: !!iframe?.contentWindow,
        isIframeLoaded,
        hasCode: !!code
      }); // Debug
    }
  }, [code, resolvedTheme, isIframeLoaded]); // Depend on code, theme, AND loaded state

  return (
    <iframe
      ref={iframeRef}
      title="Component Preview"
      sandbox="allow-scripts allow-same-origin" // allow-same-origin is needed for easy postMessage without origin config
      width="100%"
      height="100%"
      style={{ border: "none", backgroundColor: "transparent" }}
      // srcDoc is now set via useEffect
    />
  );
}
