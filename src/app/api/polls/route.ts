import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://cric-plus-iota.vercel.app';

interface BackendChoice {
  id: string;
  text: string;
  votes?: number;
  percentage?: number;
}

interface RawPollData {
  id: string;
  question: string;
  category?: string;
  choices?: (BackendChoice | string)[];
  options?: (BackendChoice | string)[];
  startDate?: string;
  expirationDate?: string;
  endDate?: string;
  isManuallyDeactivated?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  totalVotes?: number;
  highlightInMatchFeeds?: boolean;
}

function normalizePoll(raw: RawPollData) {
  const rawChoices = raw.choices || raw.options || [];
  const totalVotes = raw.totalVotes ?? rawChoices.reduce((acc: number, c: BackendChoice | string) => {
    return acc + (typeof c === 'object' && c.votes ? c.votes : 0);
  }, 0);

  const normalizedOptions = rawChoices.map((c, idx) => {
    if (typeof c === 'string') {
      return { id: String(idx + 1), text: c, votes: 0, percentage: 0 };
    }
    const votes = c.votes || 0;
    const percentage =
      c.percentage !== undefined
        ? c.percentage
        : totalVotes > 0
        ? Math.round((votes / totalVotes) * 100)
        : 0;
    return {
      id: c.id || String(idx + 1),
      text: c.text || '',
      votes,
      percentage,
    };
  });

  const endDate = raw.expirationDate || raw.endDate || new Date(Date.now() + 7 * 86400000).toISOString();
  const startDate = raw.startDate || raw.createdAt || new Date().toISOString();

  let status = raw.status || 'active';
  if (raw.isManuallyDeactivated) {
    status = 'deactivated';
  } else if (new Date(endDate) < new Date()) {
    status = 'ended';
  } else if (new Date(startDate) > new Date()) {
    status = 'scheduled';
  }

  return {
    ...raw,
    options: normalizedOptions,
    choices: normalizedOptions,
    totalVotes,
    startDate,
    endDate,
    expirationDate: endDate,
    status,
    isActive: !raw.isManuallyDeactivated && status === 'active',
  };
}

/**
 * GET /api/polls
 * List fan engagement polls
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const targetUrl = `${BACKEND_API_URL}/api/polls${query ? `?${query}` : ''}`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { success: false, message: `Backend error: ${res.statusText}`, details: errText },
        { status: res.status }
      );
    }

    const json = await res.json();
    const dataList = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
    const normalizedData = dataList.map(normalizePoll);

    return NextResponse.json({
      success: true,
      count: normalizedData.length,
      data: normalizedData,
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch polls from backend service',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/polls
 * Create fan engagement poll (Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate question
    if (!body.question || typeof body.question !== 'string' || !body.question.trim()) {
      return NextResponse.json(
        { success: false, message: 'Poll question is required.' },
        { status: 400 }
      );
    }

    // Normalize choices for the backend: string[] of text choices
    const rawOptions = body.choices || body.options || [];
    const choiceStrings: string[] = rawOptions
      .map((opt: unknown) => {
        if (typeof opt === 'string') return opt.trim();
        if (opt && typeof opt === 'object' && 'text' in opt) return String((opt as { text: string }).text).trim();
        return '';
      })
      .filter(Boolean);

    if (choiceStrings.length < 2) {
      return NextResponse.json(
        { success: false, message: 'At least two poll choices are required.' },
        { status: 400 }
      );
    }

    // Expiration date required by backend
    const expirationDate =
      body.expirationDate ||
      body.endDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const startDate = body.startDate || new Date().toISOString();

    // Payload to send to backend
    const payload: Record<string, unknown> = {
      question: body.question.trim(),
      choices: choiceStrings,
      expirationDate,
      startDate,
    };

    if (body.category) {
      payload.category = String(body.category).trim();
    }
    if (typeof body.highlightInMatchFeeds === 'boolean') {
      payload.highlightInMatchFeeds = body.highlightInMatchFeeds;
    } else if (typeof body.featured === 'boolean') {
      payload.highlightInMatchFeeds = body.featured;
    }

    const backendRes = await fetch(`${BACKEND_API_URL}/api/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resJson = await backendRes.json();

    if (!backendRes.ok || resJson.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: resJson.error?.message || resJson.message || 'Failed to create poll on backend',
          details: resJson,
        },
        { status: backendRes.status >= 400 ? backendRes.status : 400 }
      );
    }

    const createdPoll = normalizePoll(resJson.data || resJson);

    return NextResponse.json(
      {
        success: true,
        message: resJson.message || 'Poll created successfully',
        data: createdPoll,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while creating poll',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
