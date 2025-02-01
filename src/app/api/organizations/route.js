import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Organization } from '@/lib/models/organization';

export async function GET() {
  try {
    await connectDB();
    const organizations = await Organization.find({}, 'name _id', {sort: {name: 1}});
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}