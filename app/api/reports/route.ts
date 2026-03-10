import { NextResponse } from 'next/server';
import { getPrisma } from '../../../server/prisma';

let REPORTS_DB = [
    {
        id: 'rpt-102',
        locationName: 'City Center Ghat',
        coordinates: { lat: 25.9450, lng: 83.5500 },
        algaeLevel: 'High',
        foamDetected: true,
        turbidity: 'Opaque',
        overallScore: 35,
        recommendation: 'Immediate halt of discharge required.',
        details: 'Visual analysis confirms heavy algal bloom and industrial foaming.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'In Review'
    },
    {
        id: 'rpt-101',
        locationName: 'Tamsa Headwaters',
        coordinates: { lat: 25.9427, lng: 83.5539 },
        algaeLevel: 'None',
        foamDetected: false,
        turbidity: 'Clear',
        overallScore: 92,
        recommendation: 'Maintain current protection protocols.',
        details: 'Water appears clear with healthy ecosystem indicators.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: 'Resolved'
    },
    {
        id: 'rpt-100',
        locationName: 'Industrial Zone A',
        coordinates: { lat: 25.9500, lng: 83.5600 },
        algaeLevel: 'Moderate',
        foamDetected: true,
        turbidity: 'Cloudy',
        overallScore: 58,
        recommendation: 'Increase sampling frequency.',
        details: 'Minor foaming observed near outlet.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        status: 'Action Taken'
    }
];

export async function GET() {
    try {
        const prisma = getPrisma();
        const reports = await prisma.waterReport.findMany({
            orderBy: { timestamp: 'desc' }
        });
        if (reports.length > 0) {
            return NextResponse.json(reports);
        }
    } catch (e) {
        // Fallback to mock data if DB not configured
    }
    const sortedReports = [...REPORTS_DB].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return NextResponse.json(sortedReports);
}

export async function POST(req: Request) {
    const report = await req.json();
    try {
        const prisma = getPrisma();
        const newReport = await prisma.waterReport.create({
            data: {
                locationName: report.locationName,
                lat: report.coordinates?.lat || 0,
                lng: report.coordinates?.lng || 0,
                algaeLevel: report.algaeLevel,
                foamDetected: report.foamDetected,
                turbidity: report.turbidity,
                overallScore: report.overallScore,
                recommendation: report.recommendation,
                details: report.details,
                status: 'Pending',
                ph: report.ph,
                dissolvedOxygen: report.dissolvedOxygen,
                chlorophyll: report.chlorophyll,
                nitrogen: report.nitrogen,
                phosphorus: report.phosphorus,
            }
        });
        return NextResponse.json(newReport);
    } catch (e) {
        // Fallback to mock data if DB not configured
    }

    const newReport = {
        ...report,
        id: `rpt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'Pending'
    };
    REPORTS_DB.unshift(newReport);

    return NextResponse.json(newReport);
}
