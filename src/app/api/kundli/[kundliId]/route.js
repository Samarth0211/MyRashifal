import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteKundliFromDB, updateKundliLabel } from '@/lib/db';

// DELETE /api/kundli/[kundliId] — delete a kundli and its reports
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { kundliId } = await params;
    if (!kundliId) {
      return NextResponse.json({ error: 'Missing kundliId' }, { status: 400 });
    }

    await deleteKundliFromDB(session.user.id, kundliId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete kundli error:', error);
    return NextResponse.json({ error: 'Failed to delete kundli' }, { status: 500 });
  }
}

// PATCH /api/kundli/[kundliId] — update label
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { kundliId } = await params;
    const { label } = await request.json();

    if (!kundliId || !label) {
      return NextResponse.json({ error: 'Missing kundliId or label' }, { status: 400 });
    }

    await updateKundliLabel(session.user.id, kundliId, label);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update kundli label error:', error);
    return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
  }
}
