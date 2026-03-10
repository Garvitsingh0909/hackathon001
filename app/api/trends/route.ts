import { NextResponse } from 'next/server';

export async function GET() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => ({
        name: day,
        value: Math.floor(Math.random() * (75 - 45 + 1) + 45)
    }));
    return NextResponse.json(data);
}
