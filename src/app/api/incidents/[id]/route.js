import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Incident } from '@/lib/models/incident';
import { authOptions } from '../../auth/[...nextauth]/route';

// Handle PATCH request to update an incident
export async function PATCH(request, { params }) {
    try {
        // Establish a connection to the database
        await connectDB();
        // Get the current user session
        const session = await getServerSession(authOptions);
        
        // Check if the user is authenticated
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params; // Extract incident ID from request parameters
        const body = await request.json(); // Parse the request body

        // Update the incident with new data
        await Incident.findByIdAndUpdate(id, {
            ...body,
            updatedAt: new Date() // Update the timestamp
        });

        // Fetch the updated incident and populate related services
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

        // Check if the incident was found and updated
        if (!updatedIncident) {
            return NextResponse.json(
                { error: 'Incident not found' },
                { status: 404 }
            );
        }

        // Return the updated incident
        return NextResponse.json(updatedIncident);
    } catch (error) {
        console.error('Error updating incident:', error);
        return NextResponse.json(
            { error: 'Failed to update incident' },
            { status: 500 }
        );
    }
}

// Handle DELETE request to remove an incident
export async function DELETE(request, { params }) {
    try {
        // Establish a connection to the database
        await connectDB();
        // Get the current user session
        const session = await getServerSession(authOptions);
        
        // Check if the user is authenticated
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params; // Extract incident ID from request parameters
        // Delete the incident from the database
        const deletedIncident = await Incident.findByIdAndDelete(id);

        // Check if the incident was found and deleted
        if (!deletedIncident) {
            return NextResponse.json(
                { error: 'Incident not found' },
                { status: 404 }
            );
        }

        // Return a success message
        return NextResponse.json({ message: 'Incident deleted successfully' });
    } catch (error) {
        console.error('Error deleting incident:', error);
        return NextResponse.json(
            { error: 'Failed to delete incident' },
            { status: 500 }
        );
    }
}