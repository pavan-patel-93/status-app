import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Team } from '@/lib/models/team';
import { User } from '@/lib/models/user';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = params;
    const body = await request.json();
    const { name, members } = body;

    // Verify user has permission to create team
    const user = await User.findById(session.user.id);
    const orgMembership = user.organizations.find(
      org => org.organizationId.toString() === orgId
    );

    if (!orgMembership || !['owner', 'admin'].includes(orgMembership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const team = await Team.create({
      name,
      organizationId: orgId,
      members: [{ userId: session.user.id, role: 'admin' }]
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Error creating team' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = params;
    const teams = await Team.find({ organizationId: orgId })
      .populate('members.userId', 'name email');

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Error fetching teams' },
      { status: 500 }
    );
  }
} 