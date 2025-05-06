import { useState, useCallback } from "react";
import { toast } from "sonner";

export default function useComponentAPI() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSavedComponents = useCallback(async () => {
        try {
            const response = await fetch("/api/components");
            if (!response.ok) throw new Error("Failed to fetch components");
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || "Failed to fetch components");
        } catch (err) {
            toast.error("Error fetching components");
            return [];
        }
    }, []);

    const generateComponent = async ({ prompt, libraries, existingCode, model, apiKey, file }) => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("prompt", prompt);
            formData.append("libraries", libraries);
            if (existingCode) formData.append("existingCode", existingCode);
            formData.append("model", model);
            formData.append("apiKey", apiKey);
            if (file) formData.append("file", file);

            const response = await fetch("/api/generate", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
            if (!data.success) throw new Error(data.error || "Failed to generate component");

            return data.code;
        } catch (err) {
            console.error("Generation error:", err);
            setError(err.message);
            toast.error("Generation Failed: " + err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const saveComponent = async ({ id, name, code, prompt, libraries }) => {
        if (!code || code.trim() === "" || code.startsWith(" //")) {
            toast.error("Cannot Save: No code to save.");
            return null;
        }
        if (!name.trim()) {
            toast.error("Cannot Save: Please provide a name for the component.");
            return null;
        }

        setIsLoading(true);
        try {
            const method = id ? "PUT" : "POST";
            const url = id ? `/api/components/${id}` : "/api/components";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, code, prompt, libraries })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Failed to ${method === "PUT" ? "update" : "save"} component`);
            if (!data.success) throw new Error(data.error || "Failed to save component");

            return data.data;
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Save Failed: " + err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteComponent = async (id) => {
        if (!id) return false;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/components/${id}`, { method: "DELETE" });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to delete component");
            if (!data.success) throw new Error(data.error || "Failed to delete component");

            return true;
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Delete Failed: " + err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        fetchSavedComponents,
        generateComponent,
        saveComponent,
        deleteComponent
    };
}
