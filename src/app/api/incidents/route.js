import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Incident } from '@/lib/models/incident';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incidents = await Incident.find()
      .populate('services')
      .sort({ createdAt: -1 });
    return NextResponse.json(incidents);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

    return NextResponse.json(incident);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
