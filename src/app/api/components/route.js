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
            .select('name _id prompt code libraries updatedAt createdAt'); // Select only needed fields for list view
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