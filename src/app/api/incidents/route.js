import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Incident } from '@/lib/models/incident';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    await connectDB();

    const incidents = await Incident.aggregate([
      {
        $lookup: {
          from: 'services',  // The collection name in MongoDB
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
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const incident = await Incident.create({
      ...body,
      createdBy: session.user.id
    });

    // Populate the services data for the newly created incident
    const populatedIncident = await Incident.aggregate([
      {
        $match: { _id: incident._id }
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

    return NextResponse.json(populatedIncident);
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
