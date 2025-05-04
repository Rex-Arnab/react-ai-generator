// app/api/generate/route.js
import { NextResponse } from 'next/server';

// Basic prompt engineering function
function createPrompt(userPrompt, libraries, existingCode = null) {
    let systemPrompt = `You are an expert React developer specializing in creating modern, reusable components.
Generate a single, self-contained React functional component based on the user's request.
- Use React hooks (useState, useEffect, etc.) when appropriate. Assume 'React' is available.
- Use TailwindCSS classes for all styling. Add comments for complex class combinations if necessary.
- If specific libraries are mentioned by the user, ensure the component utilizes them correctly (assume they will be imported/available). User specified libraries: ${libraries || 'None specified'}.
- Respond ONLY with the raw React component code.
- The main component function MUST be named 'Component'. For example: \`function Component() { /* ... */ }\` or \`const Component = () => { /* ... */ }\`.
- Do NOT include any \`import\` or \`export\` statements (like \`import React...\` or \`export default Component\`). 'React' will be available globally.
- Do NOT include any explanations, markdown formatting (like \`\`\`jsx), introductory, or concluding remarks outside the code itself.
- Ensure the component is fully functional and adheres to React best practices.
- The component should be ready to be directly rendered in a preview environment that includes React, ReactDOM, and TailwindCSS (via CDN).
`; // Added stricter rules about naming and no imports/exports

    let fullPrompt = "";

    if (existingCode) {
        // Iteration prompt
        fullPrompt = `${systemPrompt}

The user wants to modify the following existing component code (which should already follow the naming rule 'Component'):
\`\`\`jsx
${existingCode}
\`\`\`

Apply the following changes based on the user's request: "${userPrompt}"

Output the complete, modified, single React component code below, ensuring the main function is still named 'Component' and there are no imports/exports:
`;
    } else {
        // Initial generation prompt
        fullPrompt = `${systemPrompt}

User Request: "${userPrompt}"

Generate the React component code below, ensuring the main function is named 'Component' and there are no imports/exports:
`;
    }
    return fullPrompt;
}


export async function POST(request) {
    const { prompt, libraries, existingCode } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

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
    const model = "openai/gpt-4.1-nano";
    // const model = "openai/gpt-4o"; // Example alternative

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
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
        generatedCode = generatedCode.replace(/^```(?:jsx|javascript)?\s*([\s\S]*?)\s*```$/gm, '$1').trim();

        // Optional extra cleanup based on new prompt rules (might not be needed if AI behaves)
        generatedCode = generatedCode.replace(/export\s+default\s+\w+;?/g, '');
        generatedCode = generatedCode.replace(/export\s*{[^}]+};?/g, '');
        generatedCode = generatedCode.replace(/import\s+React[^;]+;/g, '');
        generatedCode = generatedCode.replace(/import\s*{\s*useState\s*,\s*useEffect\s*}\s*from\s*['"]react['"];?/g, ''); // Remove common hook imports too



        if (!generatedCode) {
            throw new Error("AI returned empty content.");
        }

        if (!generatedCode.includes("Component")) {
            console.warn("AI output might be missing the required 'Component' function name.");
            // Decide if you want to throw an error or try proceeding anyway
        }

        return NextResponse.json({ success: true, code: generatedCode });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred' }, { status: 500 });
    }
}