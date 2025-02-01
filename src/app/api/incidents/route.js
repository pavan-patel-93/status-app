import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Incident } from '@/lib/models/incident';
import { authOptions } from '../auth/[...nextauth]/route';
import { organizationCheck } from '@/middleware/organizationCheck';

// Handle GET request to fetch all incidents
export async function GET(req) {
  try {
    await connectDB();
    const orgCheck = await organizationCheck(req);
    
    if (orgCheck.error) {
      return NextResponse.json(
        { error: orgCheck.error },
        { status: orgCheck.status }
      );
    }

    const incidents = await Incident.aggregate([
      {
        $match: { 
          organizationId: orgCheck.organizationId 
        }
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
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Incidents API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Handle POST request to create a new incident
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const orgCheck = await organizationCheck(req);
    console.log(orgCheck);
    if (orgCheck.error) {
      return NextResponse.json(
        { error: orgCheck.error },
        { status: orgCheck.status }
      );
    }

    const body = await req.json();
    console.log(body);
    const incident = await Incident.create({
      ...body,
      organizationId: orgCheck.organizationId,
      createdBy: session.user.id
    });

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
    console.error('Incident creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}