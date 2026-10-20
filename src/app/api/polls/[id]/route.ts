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
 * GET /api/polls/{id}
 * Get poll details by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Poll ID is required.' },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_API_URL}/api/polls/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { success: false, message: `Poll not found or backend error: ${res.statusText}`, details: errText },
        { status: res.status }
      );
    }

    const json = await res.json();
    const pollData = json.data || json;

    return NextResponse.json({
      success: true,
      data: normalizePoll(pollData),
    });
  } catch (error) {
    console.error('Error fetching poll by ID:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch poll details from backend service',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/polls/{id}
 * Update or deactivate poll
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Poll ID is required.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Prepare payload for backend PATCH
    const patchPayload: Record<string, unknown> = {};

    if (typeof body.isManuallyDeactivated === 'boolean') {
      patchPayload.isManuallyDeactivated = body.isManuallyDeactivated;
    }

    // Support toggle by status: if status is 'deactivated' or 'ended'
    if (body.status === 'deactivated' || body.status === 'ended') {
      patchPayload.isManuallyDeactivated = true;
    } else if (body.status === 'active') {
      patchPayload.isManuallyDeactivated = false;
    }

    if (body.question && typeof body.question === 'string') {
      patchPayload.question = body.question.trim();
    }

    if (body.category && typeof body.category === 'string') {
      patchPayload.category = body.category.trim();
    }

    if (body.expirationDate || body.endDate) {
      patchPayload.expirationDate = body.expirationDate || body.endDate;
    }

    if (body.startDate) {
      patchPayload.startDate = body.startDate;
    }

    if (typeof body.highlightInMatchFeeds === 'boolean') {
      patchPayload.highlightInMatchFeeds = body.highlightInMatchFeeds;
    } else if (typeof body.featured === 'boolean') {
      patchPayload.highlightInMatchFeeds = body.featured;
    }

    const res = await fetch(`${BACKEND_API_URL}/api/polls/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(patchPayload),
    });

    const resJson = await res.json();

    if (!res.ok || resJson.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: resJson.error?.message || resJson.message || 'Failed to update poll',
          details: resJson,
        },
        { status: res.status >= 400 ? res.status : 400 }
      );
    }

    const updatedPoll = normalizePoll(resJson.data || resJson);

    return NextResponse.json({
      success: true,
      message: resJson.message || 'Poll updated successfully',
      data: updatedPoll,
    });
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while updating poll',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/polls/{id}
 * Delete poll from backend
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Poll ID is required.' },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_API_URL}/api/polls/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const resJson = await res.json();
    return NextResponse.json(resJson, { status: res.status });
  } catch (error) {
    console.error('Error deleting poll:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while deleting poll',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

