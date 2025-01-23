import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Service } from '@/lib/models/service';
import { authOptions } from '../auth/[...nextauth]/route';

// Handle GET request to fetch all services
export async function GET(req) {
  try {
    // Establish a connection to the database
    await connectDB();

    // Retrieve all services from the database
    const services = await Service.find();
    // Return the list of services
    return NextResponse.json(services);
  } catch (error) {
    console.error('Services API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Handle POST request to create a new service
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

    // Parse the request body to get service details
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Log the service details for debugging
    console.log({
      ...body,
      createdBy: session.user.id,
      status: body.status || 'operational'
    });

    // Create a new service in the database
    const service = await Service.create({
      ...body,
      createdBy: session.user.id,
      status: body.status || 'operational'
    });

    // Return the newly created service
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// Handle PATCH request to update an existing service
export async function PATCH(req) {
  try {
    // Establish a connection to the database
    await connectDB();
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body to get updated service details
    const body = await req.json();
    
    // Validate that the service ID is provided
    if (!body._id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Update the service in the database
    const service = await Service.findByIdAndUpdate(
      body._id,
      { 
        ...body,
        updatedAt: new Date() // Update the timestamp
      },
      { new: true } // Return the updated document
    );

    // Check if the service was found and updated
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Return the updated service
    return NextResponse.json(service);
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}