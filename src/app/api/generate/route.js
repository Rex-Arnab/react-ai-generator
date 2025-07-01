import { NextResponse } from 'next/server'

async function encodeFileToBase64(file) {
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return base64
}

// Basic prompt engineering function
function createPrompt(userPrompt, libraries, existingCode = null) {
    // Rewritten system prompt focusing on amazing design, aesthetics, reusability, and scalability
    let systemPrompt = `You are an expert React developer and a highly skilled UI/UX designer with a deep understanding of creating reusable, modular components. Your primary goal is to create modern, visually stunning, highly aesthetic React components that are not only beautiful but also scalable and reusable across different parts of an application.

Generate a single, self-contained React functional component based on the user's request:
- Prioritize beautiful, intuitive, and responsive design with a focus on reusability and scalability.
- Create modular components with clear separation of concerns that can be reused and extended easily in other parts of the application. Aim for a design system approach.
- Use React hooks (useState, useEffect, etc.) effectively for managing state, lifecycle methods, and side effects. Assume 'React' is available globally.
- **Use TailwindCSS extensively and skillfully for all styling.** Pay attention to creating harmonious color palettes, effective typography, consistent spacing, and clean layouts (flexbox/grid). Add subtle visual details like shadows, borders, smooth transitions, and hover states. Choose colors that are accessible, ensuring sufficient contrast for readability.
- If specific libraries are mentioned by the user, ensure the component utilizes them properly, assuming they will be imported/available. User specified libraries: ${libraries || 'None specified'}.
- Respond ONLY with the raw React component code.
- The main component function MUST be named 'Component'. For example: \`function Component() { /* ... */ }\` or \`const Component = () => { /* ... */ }\`.
- Do NOT include any \`import\` or \`export\` statements (like \`import React...\` or \`export default Component\`). 'React' will be available globally.
- Do NOT include any explanations, markdown formatting (like \`\`\`jsx), introductory, or concluding remarks outside the code itself.
- Ensure the component is fully functional, adheres to React best practices, is reusable, scalable, and visually outstanding.
- The component should be ready to be rendered in a preview environment that includes React, ReactDOM, and TailwindCSS (via CDN).
- Do Not include explanations or paragraphs, only give the final code block

Additional Design Guidelines:
- Think of the component as a piece of a larger design system: use variables, reusable classes, and patterns where possible.
- The component should adapt smoothly to different screen sizes (mobile-first approach) and work across different devices.
- Add clear comments for any complex design or functional choices, particularly for reusable design patterns.
`;

    let fullPrompt = "";

    if (existingCode) {
        // Iteration prompt
        fullPrompt = `${systemPrompt}

The user wants to modify the following existing component code (which should already follow the naming rule 'Component' and ideally already have good styling):
\`\`\`jsx
${existingCode}
\`\`\`

Apply the following changes based on the user's request, ensuring the modifications enhance or maintain the component's amazing design, color sense, and reusability: "${userPrompt}"

Output the complete, modified, single React component code below, ensuring the main function is still named 'Component' and there are no imports/exports:
`;
    } else {
        // Initial generation prompt
        fullPrompt = `${systemPrompt}

User Request: "${userPrompt}"

Generate the React component code below, ensuring the main function is named 'Component', there are no imports/exports, and the component demonstrates amazing design, excellent color sense, and reusability:
`;
    }
    return fullPrompt;
}



export async function POST(request) {
    try {
        const formData = await request.formData()
        const prompt = formData.get('prompt')
        const libraries = formData.get('libraries')
        const existingCode = formData.get('existingCode')
        const model = formData.get('model')
        const apiKey = formData.get('apiKey') || process.env.OPENROUTER_API_KEY
        const file = formData.get('file')
        const fullPrompt = createPrompt(prompt, libraries, existingCode);
        // Validate required fields
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'No API credentials provided' },
                { status: 401 }
            )
        }
        if (!prompt && !existingCode) {
            return NextResponse.json(
                { success: false, error: 'Prompt or existing code is required' },
                { status: 400 }
            )
        }

        // Prepare messages array
        const messages = [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: fullPrompt
                    }
                ]
            }
        ]

        // Add image if provided
        if (file) {
            const base64Image = await encodeFileToBase64(file)
            const dataUrl = `data:${file.type};base64,${base64Image}`
            messages[0].content.push({
                type: 'image_url',
                image_url: { url: dataUrl }
            })
        }

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                reasoning: {
                    effort: "high",
                    // max_tokens: 10000
                },
                max_tokens: 50000,
                temperature: 1
            })
        })

        const data = await response.json()
        if (!response.ok || data.error) {
            console.log('Error: ', data.error)
            throw new Error(data.error?.message || 'Failed to generate component')
        }

        // Extract the generated code from the response
        console.log("CONTENT:", data)
        let generatedCode = data.choices[0]?.message?.content
        if (!generatedCode) throw new Error('No code generated')

        // Remove single ```jsx ``` wrapper if present
        const jsxWrapper = '```jsx'
        if (generatedCode.startsWith(jsxWrapper) &&
            generatedCode.indexOf(jsxWrapper, jsxWrapper.length) === -1) {
            generatedCode = generatedCode
                .replace(jsxWrapper, '')
                .replace(/```$/, '')
                .trim()
        }

        console.log("Code generated successfully")

        return NextResponse.json({ success: true, code: generatedCode })
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        )
    }
}
