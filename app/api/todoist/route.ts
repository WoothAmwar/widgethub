import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Allow credentials from query params (user-supplied), fallback to env vars
    const token = searchParams.get('token') || process.env.TODOIST_TOKEN;
    const projectId = searchParams.get('projectId') || process.env.TODOIST_PROJECT_ID;

    if (!token || !projectId) {
      return NextResponse.json(
        { error: 'Todoist credentials missing. Please provide API token and project ID in widget settings.' },
        { status: 500 }
      );
    }

    const fetchJSON = async (url: string) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Todoist API error: ${res.status}`);
      return res.json();
    };

    const [tasksRes, sectionsRes] = await Promise.all([
      fetchJSON(`https://api.todoist.com/api/v1/tasks?project_id=${projectId}`),
      fetchJSON(`https://api.todoist.com/api/v1/sections?project_id=${projectId}`),
    ]);

    const sectionMap: Record<string, string> = {};
    for (const s of sectionsRes.results) {
      sectionMap[s.id] = s.name;
    }

    const simplified = tasksRes.results.map((t: any) => ({
      id: t.id,
      content: t.content,
      section_id: t.section_id,
      section_name: sectionMap[t.section_id] || 'No Section',
    }));

    return NextResponse.json(simplified);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
