import { NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://cric-plus-iota.vercel.app';

// POST /api/settings/keys/reset - Reset exhausted keys back to active status
export async function POST() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/settings/keys/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to reset exhausted RapidAPI keys:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to reset RapidAPI keys on backend',
        },
      },
      { status: 500 }
    );
  }
}
