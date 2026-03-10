import { NextResponse } from 'next/server';
import { getPrisma } from '../../../server/prisma';

export async function POST(req: Request) {
    const { query, response } = await req.json();
    try {
        const prisma = getPrisma();
        await prisma.userQuery.create({
            data: {
                query,
                response
            }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Database not configured' });
    }
}
