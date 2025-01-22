import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Organization } from '@/lib/models/organization';
import { User } from '@/lib/models/user';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // Create organization
    const organization = await Organization.create({
      name,
      slug,
      ownerId: session.user.id
    });

    // Update user's organizations
    await User.findByIdAndUpdate(session.user.id, {
      $push: {
        organizations: {
          organizationId: organization._id,
          role: 'owner'
        }
      },
      currentOrganizationId: organization._id
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Error creating organization' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id)
      .populate('organizations.organizationId');

    const organizations = user.organizations.map(org => ({
      ...org.organizationId.toObject(),
      role: org.role
    }));

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Error fetching organizations' },
      { status: 500 }
    );
  }
} 