import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import User from '@/lib/models/user';
import connectDB from '@/lib/db';

export async function organizationCheck(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return { error: 'Unauthorized', status: 401 };
    }
    const user = await User.findOne({email: session.user.email});
    if (!user.organizationId) {
      return { error: 'No organization selected', status: 403 };
    }

    return { organizationId: user.organizationId };
  } catch (error) {
    console.error('Organization check error:', error);
    return { error: 'Internal server error', status: 500 };
  }
}