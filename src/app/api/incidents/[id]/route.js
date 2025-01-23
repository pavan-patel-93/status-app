import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Incident } from '@/lib/models/incident';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PATCH(request, { params }) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();

        // Update the incident
        await Incident.findByIdAndUpdate(id, {
            ...body,
            updatedAt: new Date()
        });

        // Fetch the updated incident with populated services
        const updatedIncident = await Incident.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'services',
                    foreignField: '_id',
                    as: 'services'
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    status: 1,
                    impact: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    createdBy: 1,
                    updates: 1,
                    'services._id': 1,
                    'services.name': 1,
                    'services.status': 1
                }
            }
        ]).then(results => results[0]);

        if (!updatedIncident) {
            return NextResponse.json(
                { error: 'Incident not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedIncident);
    } catch (error) {
        console.error('Error updating incident:', error);
        return NextResponse.json(
            { error: 'Failed to update incident' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const deletedIncident = await Incident.findByIdAndDelete(id);

        if (!deletedIncident) {
            return NextResponse.json(
                { error: 'Incident not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Incident deleted successfully' });
    } catch (error) {
        console.error('Error deleting incident:', error);
        return NextResponse.json(
            { error: 'Failed to delete incident' },
            { status: 500 }
        );
    }
} 