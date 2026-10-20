import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://cric-plus-iota.vercel.app';

// GET /api/settings/keys - Get RapidAPI keys status and quota usage
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/settings/keys`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to fetch RapidAPI keys status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to connect to RapidAPI key management backend',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/settings/keys - Add or update RapidAPI keys
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND_API_URL}/api/settings/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to update RapidAPI keys:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update RapidAPI keys on backend',
        },
      },
      { status: 500 }
    );
  }
}
