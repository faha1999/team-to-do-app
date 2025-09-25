// src/app/api/webpush/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

/**
 * Store (and remove) Web Push subscriptions
 * - POST to subscribe (body: { userId, subscription })
 * - DELETE to unsubscribe (body: { userId, endpoint })
 * - You can later use @web-push to send notifications from server/jobs
 */

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();

    if (!userId || !subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const endpointHash = hashEndpoint(subscription.endpoint);

    await prisma.webPushSubscription.upsert({
      where: { endpointHash_userId: { endpointHash, userId } },
      create: {
        userId,
        endpoint: subscription.endpoint,
        endpointHash,
        p256dh: subscription.keys?.p256dh ?? null,
        auth: subscription.keys?.auth ?? null,
        data: subscription as any,
      },
      update: {
        p256dh: subscription.keys?.p256dh ?? null,
        auth: subscription.keys?.auth ?? null,
        data: subscription as any,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to store subscription' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, endpoint } = await req.json();
    if (!userId || !endpoint) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const endpointHash = hashEndpoint(endpoint);

    await prisma.webPushSubscription.deleteMany({
      where: { userId, endpointHash },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 },
    );
  }
}

function hashEndpoint(endpoint: string) {
  return crypto.createHash('sha256').update(endpoint).digest('hex');
}
