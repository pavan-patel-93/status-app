import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Incident } from '@/lib/models/incident';
import { authOptions } from '../auth/[...nextauth]/route';

// Handle GET request to fetch all incidents
export async function GET() {
  try {
    // Establish a connection to the database
    await connectDB();

    // Fetch incidents and populate related services
    const incidents = await Incident.aggregate([
      {
        $lookup: {
          from: 'services', // Join with the 'services' collection
          localField: 'services',
          foreignField: '_id',
          as: 'services'
        }
      },
      {
        $project: { // Select specific fields to return
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
      },
      {
        $sort: { createdAt: -1 } // Sort incidents by creation date in descending order
      }
    ]);

    // Return the list of incidents
    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Handle POST request to create a new incident
export async function POST(req) {
  try {
    // Establish a connection to the database
    await connectDB();
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body to get incident details
    const body = await req.json();
    // Create a new incident in the database
    const incident = await Incident.create({
      ...body,
      createdBy: session.user.id // Associate the incident with the current user
    });

    // Populate the services data for the newly created incident
    const populatedIncident = await Incident.aggregate([
      {
        $match: { _id: incident._id } // Match the newly created incident
      },
      {
        $lookup: {
          from: 'services', // Join with the 'services' collection
          localField: 'services',
          foreignField: '_id',
          as: 'services'
        }
      },
      {
        $project: { // Select specific fields to return
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

    // Return the newly created and populated incident
    return NextResponse.json(populatedIncident);
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}