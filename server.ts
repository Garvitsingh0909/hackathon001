import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock Data (Moved from frontend to backend)
const MOCK_SEGMENTS = [
    { id: 'seg-1', name: 'Tamsa Headwaters (Mau)', status: 'Safe', lastUpdate: '10 mins ago', coordinates: { lat: 25.9427, lng: 83.5539 }, paramDo: 6.8, paramPh: 7.2 },
    { id: 'seg-2', name: 'Industrial Zone A', status: 'Critical', lastUpdate: '2 mins ago', coordinates: { lat: 25.9500, lng: 83.5600 }, paramDo: 3.2, paramPh: 8.4 },
    { id: 'seg-3', name: 'Agricultural Runoff Point', status: 'Warning', lastUpdate: '1 hour ago', coordinates: { lat: 25.9300, lng: 83.5400 }, paramDo: 5.1, paramPh: 7.8 },
    { id: 'seg-4', name: 'City Center Ghat', status: 'Critical', lastUpdate: 'Just now', coordinates: { lat: 25.9450, lng: 83.5500 }, paramDo: 2.9, paramPh: 8.1 },
];

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

async function startServer() {
  const app = express();
  const PORT = 5000;

  app.use(express.json());

  // Secure endpoint to provide API key to frontend (never expose in bundle)
  app.get('/api/config', (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }
    res.json({ apiKey });
  });

  // API Routes
  app.get('/api/segments', (req, res) => {
    res.json(MOCK_SEGMENTS);
  });

  app.get('/api/reports', (req, res) => {
    const sortedReports = [...REPORTS_DB].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(sortedReports);
  });

  app.get('/api/trends', (req, res) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => ({
        name: day,
        value: Math.floor(Math.random() * (75 - 45 + 1) + 45)
    }));
    res.json(data);
  });

  app.post('/api/reports', (req, res) => {
    const report = req.body;
    const newReport = {
        ...report,
        id: `rpt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'Pending'
    };
    REPORTS_DB.unshift(newReport);

    // Update segment status logic
    const segmentIndex = MOCK_SEGMENTS.findIndex(s => s.name === report.locationName);
    if (segmentIndex >= 0) {
        if (report.overallScore < 50) MOCK_SEGMENTS[segmentIndex].status = 'Critical';
        else if (report.overallScore < 75) MOCK_SEGMENTS[segmentIndex].status = 'Warning';
        else MOCK_SEGMENTS[segmentIndex].status = 'Safe';
    }

    res.json(newReport);
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
