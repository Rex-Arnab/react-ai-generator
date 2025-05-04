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