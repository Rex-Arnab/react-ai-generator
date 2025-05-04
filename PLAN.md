Okay, let's build this V0 clone step-by-step.

**Project Goal:** A Next.js web app where users can:
1.  Enter a prompt describing a React component.
2.  Specify optional npm libraries or CDNs.
3.  Generate the component using OpenRouter AI.
4.  View the generated code in a Monaco editor.
5.  See a live preview of the component.
6.  Edit the code directly.
7.  Iterate by providing further prompts to modify the existing code.
8.  Save generated/edited components to a MongoDB database.
9.  Load saved components.
10. Toggle between dark and light mode.
11. No authentication required.

**Technologies:**
*   Next.js (App Router, JavaScript)
*   TailwindCSS
*   Shadcn/ui
*   React Monaco Editor (`@monaco-editor/react`)
*   OpenRouter AI API
*   Mongoose (MongoDB)
*   `next-themes`
*   Font Awesome (`@fortawesome/react-fontawesome`)
*   Google Fonts (`next/font`)

---

**Phase 1: Project Setup & Basic Layout**

1.  **Create Next.js App:**
    ```bash
    npx create-next-app@latest v0-clone --javascript --tailwind --eslint --app --src-dir NO --import-alias "@/*"
    cd v0-clone
    ```

2.  **Install Dependencies:**
    ```bash
    npm install mongoose next-themes @monaco-editor/react @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-resizable @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-toast @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
    ```
    *(Note: `lucide-react` is installed by Shadcn, but we'll primarily use FontAwesome as requested)*

3.  **Initialize Shadcn/ui:**
    ```bash
    npx shadcn-ui@latest init
    ```
    *   Choose `Default` style.
    *   Choose `Slate` or your preferred base color.
    *   Use CSS variables: `Yes`.
    *   Follow the prompts (accept defaults for `tailwind.config.js`, `globals.css`, etc.).

4.  **Add Shadcn Components:**
    ```bash
    npx shadcn-ui@latest add button textarea card input label dropdown-menu resizable toast toaster select
    ```

5.  **Setup Environment Variables:**
    Create a `.env.local` file in the project root:
    ```.env.local
    MONGODB_URI=your_mongodb_connection_string # Replace with your actual MongoDB connection string
    OPENROUTER_API_KEY=your_openrouter_api_key   # Replace with your OpenRouter API Key (get from openrouter.ai)

    # Optional: Identify your app to OpenRouter (recommended)
    NEXT_PUBLIC_APP_URL=http://localhost:3000 # Or your deployed URL
    NEXT_PUBLIC_APP_TITLE=V0_Clone # Or your app's name
    ```
    *   **Important:** Add `.env.local` to your `.gitignore` file if it's not already there.

6.  **Configure Tailwind for Dark Mode:**
    Open `tailwind.config.js` and ensure `darkMode` is set to `class`:
    ```javascript
    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      darkMode: ["class"], // Make sure this is present
      content: [
        './pages/**/*.{js,jsx}',
        './components/**/*.{js,jsx}',
        './app/**/*.{js,jsx}',
        './src/**/*.{js,jsx}',
      ],
      // ... rest of the config
    }
    ```

7.  **Setup Google Fonts & Font Awesome:**
    Edit `app/layout.js`:
    ```javascript
    // app/layout.js
    import { Inter } from 'next/font/google'
    import { ThemeProvider } from "@/components/theme-provider"
    import { Toaster } from "@/components/ui/toaster" // Import Toaster
    import "./globals.css";

    // Font Awesome configuration
    import { config } from '@fortawesome/fontawesome-svg-core'
    import '@fortawesome/fontawesome-svg-core/styles.css'
    config.autoAddCss = false // Prevent Font Awesome from adding its own CSS

    const inter = Inter({ subsets: ['latin'] })

    export const metadata = {
      title: 'V0 Clone',
      description: 'Generate React Components with AI',
    }

    export default function RootLayout({ children }) {
      return (
        <html lang="en" suppressHydrationWarning>
          <body className={inter.className}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster /> {/* Add Toaster component */}
            </ThemeProvider>
          </body>
        </html>
      )
    }
    ```

8.  **Create Theme Provider & Toggle:**
    Create `components/theme-provider.js`:
    ```javascript
    // components/theme-provider.js
    "use client"

    import * as React from "react"
    import { ThemeProvider as NextThemesProvider } from "next-themes"

    export function ThemeProvider({ children, ...props }) {
      return <NextThemesProvider {...props}>{children}</NextThemesProvider>
    }
    ```

    Create `components/ThemeToggle.js`:
    ```javascript
    // components/ThemeToggle.js
    "use client"

    import * as React from "react"
    import { useTheme } from "next-themes"
    import { Button } from "@/components/ui/button"
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
    import { faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons'

    export function ThemeToggle() {
      const { setTheme } = useTheme()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
               <FontAwesomeIcon icon={faSun} className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
               <FontAwesomeIcon icon={faMoon} className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <FontAwesomeIcon icon={faSun} className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <FontAwesomeIcon icon={faMoon} className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <FontAwesomeIcon icon={faDesktop} className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
    ```

9.  **Setup MongoDB Connection:**
    Create `lib/db.js`:
    ```javascript
    // lib/db.js
    import mongoose from 'mongoose';

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }

    let cached = global.mongoose;

    if (!cached) {
      cached = global.mongoose = { conn: null, promise: null };
    }

    async function dbConnect() {
      if (cached.conn) {
        // console.log('Using cached database connection');
        return cached.conn;
      }

      if (!cached.promise) {
        const opts = {
          bufferCommands: false,
        };

        // console.log('Creating new database connection');
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
          console.log('Database connected successfully!');
          return mongoose;
        }).catch(err => {
            console.error("Database connection error:", err);
            cached.promise = null; // Reset promise on error
            throw err; // Rethrow error
        });
      }
      try {
        cached.conn = await cached.promise;
      } catch (e) {
         cached.promise = null; // Ensure promise is cleared on error during await
         throw e;
      }
      return cached.conn;
    }

    export default dbConnect;
    ```

10. **Create Mongoose Model:**
    Create `models/Component.js`:
    ```javascript
    // models/Component.js
    import mongoose from 'mongoose';

    const ComponentSchema = new mongoose.Schema({
      name: {
        type: String,
        required: [true, 'Please provide a name for this component.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
        // Simple slugification for uniqueness, consider a library for complex cases
        set: (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      },
      prompt: {
        type: String,
        required: false, // Original prompt might be useful
      },
      code: {
        type: String,
        required: [true, 'Please provide the component code.'],
      },
      libraries: { // Store specified libraries/CDNs
        type: String,
        required: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }, {
      timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } // Automatically manage timestamps
    });

    // Ensure unique names if needed, but careful with updates
    // ComponentSchema.index({ name: 1 }, { unique: true });

    // Prevent model recompilation in Next.js dev environment
    export default mongoose.models.Component || mongoose.model('Component', ComponentSchema);
    ```

---

**Phase 2: Core UI and State Management**

1.  **Modify Main Page (`app/page.js`):**
    This will be the main hub. We'll use `useState` for managing the application's state.
    ```javascript
    // app/page.js
    "use client"; // This page needs client-side interactivity

    import React, { useState, useEffect, useCallback } from 'react';
    import dynamic from 'next/dynamic'; // For loading Monaco Editor dynamically
    import { Button } from "@/components/ui/button";
    import { Textarea } from "@/components/ui/textarea";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
    import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
    import { ThemeToggle } from "@/components/ThemeToggle";
    import { useToast } from "@/components/ui/use-toast";
    import SavedComponentsList from '@/components/SavedComponentsList'; // We'll create this
    import ComponentPreview from '@/components/ComponentPreview'; // We'll create this

    // Dynamically import Monaco Editor to avoid SSR issues
    const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

    export default function Home() {
      const [prompt, setPrompt] = useState("");
      const [libraries, setLibraries] = useState(""); // For npm/cdn input
      const [generatedCode, setGeneratedCode] = useState(" // Your component code will appear here");
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);
      const [currentCode, setCurrentCode] = useState(generatedCode); // Code currently in the editor
      const [savedComponents, setSavedComponents] = useState([]);
      const [selectedComponentId, setSelectedComponentId] = useState(null); // Track loaded component
      const [componentName, setComponentName] = useState(""); // For saving
      const [previewKey, setPreviewKey] = useState(0); // To force preview refresh

      const { toast } = useToast();

      // --- Fetch Saved Components ---
      const fetchSavedComponents = useCallback(async () => {
        try {
          const response = await fetch('/api/components');
          if (!response.ok) throw new Error('Failed to fetch components');
          const data = await response.json();
          if (data.success) {
            setSavedComponents(data.data);
          } else {
            throw new Error(data.error || 'Failed to fetch components');
          }
        } catch (err) {
          console.error("Fetch components error:", err);
          toast({
            variant: "destructive",
            title: "Error fetching components",
            description: err.message,
          });
        }
      }, [toast]);

      useEffect(() => {
        fetchSavedComponents();
      }, [fetchSavedComponents]);

      // --- Code Generation ---
      const handleGenerate = async (iteration = false) => {
        if (!prompt && !iteration) {
          toast({ title: "Prompt is empty", description: "Please enter a description for the component." });
          return;
        }
        if (iteration && !currentCode) {
           toast({ title: "No code to iterate on", description: "Generate a component first or load one." });
           return;
        }


        setIsLoading(true);
        setError(null);

        const requestBody = {
            prompt: prompt,
            libraries: libraries,
            // Send current editor code ONLY if iterating
            existingCode: iteration ? currentCode : null,
        };

        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
          }

          if (data.success) {
            const formattedCode = data.code; // Assume API returns formatted code
            setGeneratedCode(formattedCode);
            setCurrentCode(formattedCode); // Update editor as well
            setPreviewKey(prev => prev + 1); // Refresh preview
             toast({ title: "Component Generated", description: iteration ? "Component updated based on your prompt." : "New component generated successfully." });
          } else {
            throw new Error(data.error || 'Failed to generate component');
          }
        } catch (err) {
          console.error("Generation error:", err);
          setError(err.message);
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: err.message,
          });
        } finally {
          setIsLoading(false);
        }
      };

      // --- Saving Components ---
       const handleSave = async () => {
            if (!currentCode || currentCode.trim() === "" || currentCode.startsWith(" //")) {
                toast({ variant:"destructive", title: "Cannot Save", description: "No code to save." });
                return;
            }
            if (!componentName.trim()) {
                toast({ variant:"destructive", title: "Cannot Save", description: "Please provide a name for the component." });
                return;
            }

            setIsLoading(true);
            const payload = {
                name: componentName,
                code: currentCode,
                prompt: prompt, // Save the last prompt used
                libraries: libraries,
            };

            try {
                let response;
                let method = 'POST';
                let url = '/api/components';

                // If a component was loaded, update it (PUT) instead of creating (POST)
                if (selectedComponentId) {
                     method = 'PUT';
                     url = `/api/components/${selectedComponentId}`;
                }

                response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Failed to ${method === 'PUT' ? 'update' : 'save'} component`);
                }

                if (data.success) {
                    toast({ title: "Component Saved", description: `Component "${data.data.name}" ${method === 'PUT' ? 'updated' : 'saved'} successfully.` });
                    setComponentName(""); // Clear name input
                    setSelectedComponentId(data.data._id); // Update ID in case it was a new save
                    fetchSavedComponents(); // Refresh the list
                } else {
                    throw new Error(data.error || 'Failed to save component');
                }

            } catch (err) {
                console.error("Save error:", err);
                toast({
                    variant: "destructive",
                    title: "Save Failed",
                    description: err.message,
                });
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
        setPreviewKey(prev => prev + 1); // Refresh preview
        toast({ title: "Component Loaded", description: `Loaded component: ${component.name}` });
      };

      // --- Deleting Components ---
       const deleteComponent = async (id) => {
            if (!id) return;
             if (!confirm("Are you sure you want to delete this component?")) return; // Simple confirmation

            setIsLoading(true);
            try {
                const response = await fetch(`/api/components/${id}`, { method: 'DELETE' });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to delete component');
                }

                if (data.success) {
                    toast({ title: "Component Deleted" });
                    fetchSavedComponents(); // Refresh list
                    // If the deleted component was the currently loaded one, clear the editor
                    if (selectedComponentId === id) {
                        setPrompt("");
                        setLibraries("");
                        setCurrentCode(" // Select or generate a component");
                        setGeneratedCode(" // Select or generate a component");
                        setComponentName("");
                        setSelectedComponentId(null);
                        setPreviewKey(prev => prev + 1);
                    }
                } else {
                     throw new Error(data.error || 'Failed to delete component');
                }
            } catch (err) {
                console.error("Delete error:", err);
                toast({
                    variant: "destructive",
                    title: "Delete Failed",
                    description: err.message,
                });
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
          <ResizablePanelGroup direction="horizontal" className="flex-grow border-b">

            {/* Left Panel: Input & Settings */}
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="flex flex-col h-full p-4 space-y-4">
                <Card className="flex-grow flex flex-col">
                  <CardHeader>
                    <CardTitle>Prompt</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col space-y-4">
                     <div className='flex-grow'>
                        <Label htmlFor="prompt-input">Describe the component you want:</Label>
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
                        <Label htmlFor="libs-input">NPM Libraries / CDNs (optional):</Label>
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
                        <Button onClick={() => handleGenerate(true)} disabled={isLoading || !currentCode || currentCode.startsWith(" //")} variant="outline">
                            {isLoading ? "Iterating..." : "Iterate"}
                         </Button>
                         <Button onClick={() => handleGenerate(false)} disabled={isLoading}>
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
                         <Button onClick={handleSave} disabled={isLoading || !currentCode || currentCode.startsWith(" //") || !componentName.trim()} className="w-full">
                            {isLoading ? "Saving..." : (selectedComponentId ? "Update Saved Component" : "Save New Component")}
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
                        theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs-light'} // Sync with theme
                        value={currentCode}
                        onChange={handleEditorChange}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true, // Important for resizable panels
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
    ```

2.  **Create Saved Components List Component (`components/SavedComponentsList.js`):**
    ```javascript
    // components/SavedComponentsList.js
    "use client";

    import React from 'react';
    import { Button } from "@/components/ui/button";
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faFolderOpen, faTrash } from '@fortawesome/free-solid-svg-icons';

    export default function SavedComponentsList({ components = [], onLoad, onDelete }) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FontAwesomeIcon icon={faFolderOpen} className="mr-2 h-4 w-4" /> Load Saved
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Saved Components</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {components.length === 0 && (
              <DropdownMenuItem disabled>No saved components found.</DropdownMenuItem>
            )}
            {components.map((comp) => (
              <DropdownMenuItem key={comp._id} className="flex justify-between items-center group">
                <span onClick={() => onLoad(comp)} className="cursor-pointer flex-grow mr-2">{comp.name}</span>
                 <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    onClick={(e) => {
                       e.stopPropagation(); // Prevent menu item click
                       onDelete(comp._id);
                     }}
                 >
                     <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                 </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    ```

3.  **Create Component Preview Component (`components/ComponentPreview.js`):**
    This is the trickiest part due to security and rendering arbitrary code. We'll use the `iframe` sandbox approach.

    ```javascript
    // components/ComponentPreview.js
    "use client";

    import React, { useEffect, useRef, useState } from 'react';
    import { useTheme } from 'next-themes'; // To pass theme to iframe

    // Base HTML structure for the iframe
    const createIframeContent = (theme) => `
    <!DOCTYPE html>
    <html class="${theme}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Component Preview</title>
      <!-- Include React and ReactDOM from CDN -->
      <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
      <!-- Include TailwindCSS via Play CDN (simplest for preview) -->
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
           darkMode: 'class', // Important! Match parent theme setting
          theme: {
            extend: {
               // You might want to pass specific theme vars/colors here if needed
               // but basic dark mode should work with just the class
            }
          }
        }
      </script>
      <style>
        body { margin: 0; padding: 1rem; background-color: transparent; }
        /* Add any base styles needed for the preview */
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script type="module">
        const rootElement = document.getElementById('root');
        const root = ReactDOM.createRoot(rootElement);
        let CurrentComponent = () => React.createElement('div', null, 'Waiting for component code...');

        window.addEventListener('message', (event) => {
          // Basic security check: ensure the message is from the parent window
          // For production, use a more specific origin check:
           // if (event.origin !== "${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}") return;

          if (event.data && event.data.type === 'renderComponent') {
            const code = event.data.code;
             const theme = event.data.theme; // Get theme

            // Apply theme class to HTML element in iframe
            document.documentElement.className = theme;

            try {
              // Use a Function constructor for safer evaluation than eval
              // Transpile JSX - This is the hard part without a build step!
              // We NEED a way to convert JSX to JS. Babel standalone is an option.

              // *** Option 1: Assume code is ALREADY valid JS (requires AI to output transpiled code) ***
              // This is less flexible but avoids adding Babel to the preview.
              // const componentFunction = new Function('React', 'return ' + code)(React);

              // *** Option 2: Use Babel Standalone CDN (more robust) ***
               if (!window.Babel) {
                    console.error("Babel Standalone not loaded!");
                    CurrentComponent = () => React.createElement('div', { style: { color: 'red' } }, 'Error: Babel Standalone is required for preview.');
               } else {
                   const transformedCode = window.Babel.transform(code, {
                        presets: ['react'] // Basic React preset
                   }).code;

                   // Wrap in a function scope, pass React
                   const componentFunction = new Function('React', 'return ' + transformedCode)(React);
                   CurrentComponent = componentFunction;
               }


              root.render(React.createElement(CurrentComponent));
            } catch (error) {
              console.error('Preview Error:', error);
              // Display error within the preview iframe
              root.render(React.createElement('pre', { style: { color: 'red', whiteSpace: 'pre-wrap' } }, 'Preview Error:\\n' + error.message + '\\n\\nCheck browser console for details.'));
            }
          }
        });

         // Initial render message
         root.render(React.createElement(CurrentComponent));
      </script>
      <!-- Add Babel Standalone CDN (needed for Option 2) -->
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    </body>
    </html>
    `;

    export default function ComponentPreview({ code }) {
      const iframeRef = useRef(null);
      const { resolvedTheme } = useTheme(); // Get the currently resolved theme (light or dark)
      const [iframeContent, setIframeContent] = useState("");

      // Update iframe content only when theme changes
      useEffect(() => {
         setIframeContent(createIframeContent(resolvedTheme));
      }, [resolvedTheme]);


       // Send code to iframe when code or iframe content (theme) changes
      useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow && code && iframeContent) {
          // Ensure iframe is loaded before sending message
          const postCode = () => {
             iframe.contentWindow.postMessage({ type: 'renderComponent', code, theme: resolvedTheme }, '*'); // Use specific origin in production
          };

          // Check if iframe is already loaded
          if (iframe.contentDocument.readyState === 'complete') {
             postCode();
          } else {
             iframe.onload = postCode; // Wait for iframe to load
          }

        }
      }, [code, resolvedTheme, iframeContent]); // Depend on code, theme, and the iframe content itself

      return (
        <iframe
          ref={iframeRef}
          title="Component Preview"
          sandbox="allow-scripts allow-same-origin" // Sandbox for security, allow-same-origin needed for postMessage easily
          width="100%"
          height="100%"
          style={{ border: 'none', backgroundColor: 'transparent' }}
          srcDoc={iframeContent} // Set initial content including theme class
        />
      );
    }
    ```
    *   **Note on Preview:** This preview uses the Tailwind Play CDN and Babel Standalone CDN within the iframe. This is the simplest way to get Tailwind styling and JSX transpilation working in isolation without a complex build step for the preview content itself. The AI *must* generate code that uses standard React and Tailwind classes.

---

**Phase 3: API Routes**

1.  **Generation API (`app/api/generate/route.js`):**
    ```javascript
    // app/api/generate/route.js
    import { NextResponse } from 'next/server';

    // Basic prompt engineering function
    function createPrompt(userPrompt, libraries, existingCode = null) {
        let systemPrompt = `You are an expert React developer specializing in creating modern, reusable components.
Generate a single, self-contained React functional component based on the user's request.
- Use React hooks (useState, useEffect, etc.) when appropriate.
- Use TailwindCSS classes for all styling. Add comments for complex class combinations if necessary.
- If specific libraries are mentioned by the user, ensure the component utilizes them correctly (assume they will be imported/available). User specified libraries: ${libraries || 'None specified'}.
- Respond ONLY with the raw React component code (including imports like React, useState, etc. if needed).
- Do NOT include any explanations, markdown formatting (like \`\`\`jsx), introductory, or concluding remarks outside the code itself.
- Ensure the component is fully functional and adheres to React best practices.
- The component should be ready to be directly rendered in a preview environment that includes React, ReactDOM, and TailwindCSS (via CDN).
`;

        let fullPrompt = "";

        if (existingCode) {
             // Iteration prompt
            fullPrompt = `${systemPrompt}

The user wants to modify the following existing component code:
\`\`\`jsx
${existingCode}
\`\`\`

Apply the following changes based on the user's request: "${userPrompt}"

Output the complete, modified, single React component code below:
`;
        } else {
            // Initial generation prompt
            fullPrompt = `${systemPrompt}

User Request: "${userPrompt}"

Generate the React component code below:
`;
        }
        return fullPrompt;
    }


    export async function POST(request) {
      const { prompt, libraries, existingCode } = await request.json();
      const apiKey = process.env.OPENROUTER_API_KEY;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      const appTitle = process.env.NEXT_PUBLIC_APP_TITLE;

      if (!apiKey) {
        return NextResponse.json({ success: false, error: 'OpenRouter API key not configured' }, { status: 500 });
      }
      if (!prompt && !existingCode) {
         return NextResponse.json({ success: false, error: 'Prompt is required for generation' }, { status: 400 });
      }
       if (existingCode && !prompt) {
         return NextResponse.json({ success: false, error: 'Prompt is required for iteration' }, { status: 400 });
       }


      const fullPrompt = createPrompt(prompt, libraries, existingCode);

      // --- Choose an OpenRouter Model ---
      // List: https://openrouter.ai/docs#models
      // Consider models good at code generation, e.g.,
      // - claude-3-opus, claude-3-sonnet, claude-3-haiku (Anthropic)
      // - gpt-4-turbo, gpt-4o (OpenAI)
      // - codellama/codellama-70b-instruct (Meta)
      // Start with a faster/cheaper one for testing, like Haiku or Sonnet.
      const model = "anthropic/claude-3-haiku-20240307";
      // const model = "openai/gpt-4o"; // Example alternative

      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            // Recommended headers for OpenRouter analytics/moderation
            "HTTP-Referer": appUrl || "",
            "X-Title": appTitle || "",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              // Optional System Message (redundant if included in user prompt carefully)
              // { "role": "system", "content": "You are a React component generator." },
              { "role": "user", "content": fullPrompt }
            ],
             // Adjust parameters as needed
             // max_tokens: 1500,
             // temperature: 0.7,
          })
        });

        if (!response.ok) {
           const errorBody = await response.text();
          console.error("OpenRouter Error Response:", errorBody);
          throw new Error(`OpenRouter API request failed with status ${response.status}: ${response.statusText}. Body: ${errorBody}`);
        }

        const data = await response.json();

        if (data.error) {
             console.error("OpenRouter API Error:", data.error);
             throw new Error(`OpenRouter API Error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        // Extract the code, potentially cleaning it up
        let generatedCode = data.choices?.[0]?.message?.content || "";

        // --- Basic Code Cleanup ---
        // Remove potential markdown fences (```jsx ... ``` or ``` ... ```)
        generatedCode = generatedCode.replace(/^```(?:jsx|javascript)?\s*([\s\S]*?)\s*```$/gm, '$1').trim();
        // Remove potential leading/trailing explanations if the AI didn't follow instructions
        // (More robust cleanup might be needed depending on the model's consistency)


        if (!generatedCode) {
             throw new Error("AI returned empty content.");
        }

        return NextResponse.json({ success: true, code: generatedCode });

      } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred' }, { status: 500 });
      }
    }
    ```

2.  **Components CRUD API (`app/api/components/route.js`):**
    ```javascript
    // app/api/components/route.js
    import { NextResponse } from 'next/server';
    import dbConnect from '@/lib/db';
    import Component from '@/models/Component';

    // GET all components
    export async function GET(request) {
      await dbConnect();
      try {
        const components = await Component.find({})
                                         .sort({ updatedAt: -1 }) // Sort by most recently updated
                                         .select('name _id prompt libraries updatedAt createdAt'); // Select only needed fields for list view
        return NextResponse.json({ success: true, data: components });
      } catch (error) {
        console.error("API GET Error:", error);
        return NextResponse.json({ success: false, error: 'Server Error fetching components' }, { status: 500 });
      }
    }

    // POST a new component
    export async function POST(request) {
      await dbConnect();
      try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.code) {
             return NextResponse.json({ success: false, error: 'Name and code are required.' }, { status: 400 });
        }

         // Check if name already exists (optional, consider implications on updates)
         // const existing = await Component.findOne({ name: body.name.toLowerCase().replace(/\s+/g, '-') });
         // if (existing) {
         //     return NextResponse.json({ success: false, error: `Component name "${body.name}" already exists.` }, { status: 409 }); // Conflict
         // }


        const component = await Component.create(body); // Mongoose handles setting the name via the setter in the schema
        return NextResponse.json({ success: true, data: component }, { status: 201 }); // Return created component
      } catch (error) {
        console.error("API POST Error:", error);
         if (error.code === 11000) { // Handle duplicate key error if unique index is used
             return NextResponse.json({ success: false, error: 'Component name might already exist.' }, { status: 409 });
         }
        if (error.name === 'ValidationError') {
             return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Server Error saving component' }, { status: 500 });
      }
    }
    ```

3.  **Specific Component CRUD API (`app/api/components/[id]/route.js`):**
    ```javascript
    // app/api/components/[id]/route.js
    import { NextResponse } from 'next/server';
    import dbConnect from '@/lib/db';
    import Component from '@/models/Component';
    import mongoose from 'mongoose';


    // Helper to validate ObjectId
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

    // GET a single component by ID
    export async function GET(request, { params }) {
      await dbConnect();
      const { id } = params;

       if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, error: 'Invalid component ID format' }, { status: 400 });
       }

      try {
        const component = await Component.findById(id);
        if (!component) {
          return NextResponse.json({ success: false, error: 'Component not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: component });
      } catch (error) {
        console.error("API GET/[id] Error:", error);
        return NextResponse.json({ success: false, error: 'Server Error fetching component' }, { status: 500 });
      }
    }

    // PUT (update) a component by ID
    export async function PUT(request, { params }) {
      await dbConnect();
      const { id } = params;

      if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, error: 'Invalid component ID format' }, { status: 400 });
       }

      try {
        const body = await request.json();

         // Basic validation
        if (!body.name || !body.code) {
             return NextResponse.json({ success: false, error: 'Name and code are required for update.' }, { status: 400 });
        }

        // Find and update, return the new document
        const component = await Component.findByIdAndUpdate(
            id,
            { ...body, updatedAt: Date.now() }, // Mongoose schema handles name formatting, explicitly update timestamp
            { new: true, runValidators: true }
        );

        if (!component) {
          return NextResponse.json({ success: false, error: 'Component not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: component });
      } catch (error) {
        console.error("API PUT/[id] Error:", error);
         if (error.code === 11000) { // Handle duplicate key error if unique index is used
             return NextResponse.json({ success: false, error: 'Component name might already exist.' }, { status: 409 });
         }
         if (error.name === 'ValidationError') {
             return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Server Error updating component' }, { status: 500 });
      }
    }

    // DELETE a component by ID
    export async function DELETE(request, { params }) {
      await dbConnect();
      const { id } = params;

       if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, error: 'Invalid component ID format' }, { status: 400 });
       }

      try {
        const deletedComponent = await Component.findByIdAndDelete(id);

        if (!deletedComponent) {
          return NextResponse.json({ success: false, error: 'Component not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: { message: 'Component deleted successfully' } }); // Just confirm deletion
      } catch (error) {
        console.error("API DELETE/[id] Error:", error);
        return NextResponse.json({ success: false, error: 'Server Error deleting component' }, { status: 500 });
      }
    }
    ```

---

**Phase 4: Final Touches & Running**

1.  **Environment Variables:** Double-check your `.env.local` file has the correct `MONGODB_URI` and `OPENROUTER_API_KEY`.
2.  **Run the App:**
    ```bash
    npm run dev
    ```
3.  **Open:** Navigate to `http://localhost:3000` in your browser.

4.  **Testing:**
    *   Enter a simple prompt (e.g., "A simple div with the text 'Hello World' and a blue background"). Click Generate.
    *   Check if code appears in the editor and a preview renders below.
    *   Edit the code (e.g., change 'Hello World' to 'Hello V0 Clone', change background color class). See if the preview updates dynamically (after the iframe receives the message).
    *   Enter a follow-up prompt (e.g., "Add a button below the text"). Click Iterate. Check if the code and preview update correctly.
    *   Enter a name and click Save. Check the console/network tab for success/errors.
    *   Click "Load Saved", select the saved component. See if it loads into the editor/preview.
    *   Try deleting the saved component.
    *   Test the Dark/Light mode toggle. Ensure the Monaco Editor theme changes too.
    *   Test generation with specified libraries (e.g., Prompt: "A button showing a coffee cup icon using fontawesome", Libraries: "@fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons"). Note: The preview iframe doesn't automatically include arbitrary npm packages, only React/ReactDOM/Tailwind/Babel. Generation will work, but the *preview* might fail unless the AI generates code using CDNs for those libs or avoids them entirely. This is a limitation of the simple iframe preview.

---

**Potential Improvements & Considerations:**

*   **Preview Limitations:** The iframe preview is safer but has limitations. It relies on CDNs (React, ReactDOM, Tailwind, Babel). It cannot easily handle arbitrary `npm` imports unless the AI includes CDN links for those libraries in its output or generates code without them. A more complex preview might involve server-side rendering or a dedicated sandboxed execution environment.
*   **AI Prompt Engineering:** The quality of generated components heavily depends on the prompt structure and the chosen AI model. Experiment with different models on OpenRouter and refine the `createPrompt` function.
*   **Error Handling:** Improve user feedback for errors (e.g., more specific messages, UI indicators).
*   **Loading States:** Add more granular loading indicators (e.g., spinners on buttons, skeleton loaders for preview/editor).
*   **Code Selection for Iteration:** Implement selecting specific code parts to refine (more complex UI involving Monaco's API).
*   **State Management:** For larger applications, consider Zustand or Jotai instead of just `useState`.
*   **Security:** The iframe `sandbox` attribute is crucial. Always validate and sanitize user input and AI output, especially if rendering or executing it. Be cautious about the `allow-same-origin` sandbox flag if embedding sensitive content. Review OpenRouter's security and rate-limiting recommendations.
*   **Monaco Editor Features:** Explore more Monaco features like Intellisense (requires more setup), code formatting, etc.
*   **Deployment:** Configure environment variables on your hosting platform (Vercel, Netlify, etc.).

This comprehensive setup provides a functional V0 clone based on your requirements. Remember to replace placeholder API keys and connection strings. Good luck!