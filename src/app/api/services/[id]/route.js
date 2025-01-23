import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectDB from '@/lib/db';
import { Service } from '@/lib/models/service';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getIo } from '@/lib/socket-config';
import { sendStatusChangeEmail } from '@/lib/email';
import { UptimeHistory } from '@/lib/models/uptimeHistory';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Get the current service to compare status
    const currentService = await Service.findById(id);
    const oldStatus = currentService.status;

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Send email notification if status has changed
    if (oldStatus !== updatedService.status) {
      await sendStatusChangeEmail(updatedService, oldStatus, updatedService.status);
    }

    // Socket.IO update
    const io = getIo();
    if (io) {
      io.to("serviceUpdates").emit("serviceUpdated", {
        type: "serviceUpdated",
        service: updatedService
      });
    }

    // Record uptime history
    await UptimeHistory.create({
      serviceId: id,
      status: body.status,
      isUp: body.status === 'operational'
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Error updating service' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Error deleting service' },
      { status: 500 }
    );
  }
} 