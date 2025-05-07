import { NextResponse } from 'next/server'

async function encodeFileToBase64(file) {
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return base64
}

// Basic prompt engineering function
function createPrompt(userPrompt, libraries, existingCode = null) {
    // Rewritten system prompt focusing on amazing design, aesthetics, and color sense
    let systemPrompt = `You are an expert React developer and a highly skilled UI/UX designer. Your primary goal is to create modern, visually stunning, and highly aesthetic React components with impeccable design and excellent color harmony.
Generate a single, self-contained React functional component based on the user's request.
- Prioritize creating a beautiful, intuitive, and responsive user interface. Aim for "amazing design" and "excellent color sense" in every component.
- Use React hooks (useState, useEffect, etc.) when appropriate. Assume 'React' is available.
- **Use TailwindCSS extensively and skillfully for all styling.** Pay close attention to creating harmonious color palettes, using effective typography, implementing thoughtful spacing, designing clean layouts (flexbox/grid), and adding subtle visual details like shadows, borders, and smooth transitions/hover states. Choose color combinations that are visually appealing and consider accessibility. Add comments for complex design choices or class combinations if necessary.
- If specific libraries are mentioned by the user, ensure the component utilizes them correctly (assume they will be imported/available). User specified libraries: ${libraries || 'None specified'}.
- Respond ONLY with the raw React component code.
- The main component function MUST be named 'Component'. For example: \`function Component() { /* ... */ }\` or \`const Component = () => { /* ... */ }\`.
- Do NOT include any \`import\` or \`export\` statements (like \`import React...\` or \`export default Component\`). 'React' will be available globally.
- Do NOT include any explanations, markdown formatting (like \`\`\`jsx), introductory, or concluding remarks outside the code itself.
- Ensure the component is fully functional, adheres to React best practices, *and* is visually outstanding.
- The component should be ready to be directly rendered in a preview environment that includes React, ReactDOM, and TailwindCSS (via CDN).
`;

    let fullPrompt = "";

    if (existingCode) {
        // Iteration prompt
        fullPrompt = `${systemPrompt}

The user wants to modify the following existing component code (which should already follow the naming rule 'Component' and ideally already have good styling):
\`\`\`jsx
${existingCode}
\`\`\`

Apply the following changes based on the user's request, ensuring the modifications enhance or maintain the component's amazing design and color sense: "${userPrompt}"

Output the complete, modified, single React component code below, ensuring the main function is still named 'Component' and there are no imports/exports:
`;
    } else {
        // Initial generation prompt
        fullPrompt = `${systemPrompt}

User Request: "${userPrompt}"

Generate the React component code below, ensuring the main function is named 'Component', there are no imports/exports, and the component demonstrates amazing design and excellent color sense:
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
                messages
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
