import { NextResponse } from 'next/server'

async function encodeFileToBase64(file) {
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return base64
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
                        text: `Generate React component code based on this description: ${prompt}. ${libraries ? `Use these libraries: ${libraries}` : ''
                            } ${existingCode ? `Here's the existing code to modify: ${existingCode}` : ''
                            }`
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
        if (!response.ok) throw new Error(data.error?.message || 'Failed to generate component')

        // Extract the generated code from the response
        const generatedCode = data.choices[0]?.message?.content
        if (!generatedCode) throw new Error('No code generated')

        return NextResponse.json({ success: true, code: generatedCode })
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        )
    }
}
