import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Incident } from '@/lib/models/incident';
import { authOptions } from '../../auth/[...nextauth]/route';
import { organizationCheck } from '@/middleware/organizationCheck';

// Handle GET request to fetch an incident
export async function GET(req, { params }) {
    try {
        await connectDB();
        const orgCheck = await organizationCheck(req);
        
        if (orgCheck.error) {
            return NextResponse.json(
                { error: orgCheck.error },
                { status: orgCheck.status }
            );
        }

        const incident = await Incident.findOne({
            _id: params.id,
            organizationId: orgCheck.organizationId
        }).populate('services', 'name status');

        if (!incident) {
            return NextResponse.json(
                { error: 'Incident not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(incident);
    } catch (error) {
        console.error('Incident fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch incident' },
            { status: 500 }
        );
    }
}

// Handle PUT request to update an incident
export async function PUT(req, { params }) {
    try {
        await connectDB();
        const orgCheck = await organizationCheck(req);
        
        if (orgCheck.error) {
            return NextResponse.json(
                { error: orgCheck.error },
                { status: orgCheck.status }
            );
        }

        const body = await req.json();
        const incident = await Incident.findOneAndUpdate(
            {
                _id: params.id,
                organizationId: orgCheck.organizationId
            },
            body,
            { new: true }
        ).populate('services', 'name status');

        if (!incident) {
            return NextResponse.json(
                { error: 'Incident not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(incident);
    } catch (error) {
        console.error('Incident update error:', error);
        return NextResponse.json(
            { error: 'Failed to update incident' },
            { status: 500 }
        );
    }
}

// Handle DELETE request to remove an incident
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const orgCheck = await organizationCheck(req);
        
        if (orgCheck.error) {
            return NextResponse.json(
                { error: orgCheck.error },
                { status: orgCheck.status }
            );
        }

        const incident = await Incident.findOneAndDelete({
            _id: params.id,
            organizationId: orgCheck.organizationId
        });

        if (!incident) {
            return NextResponse.json(
                { error: 'Incident not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Incident deleted successfully' });
    } catch (error) {
        console.error('Incident deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete incident' },
            { status: 500 }
        );
    }
}