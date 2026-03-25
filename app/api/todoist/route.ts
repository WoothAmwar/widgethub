import { NextRequest, NextResponse } from 'next/server';

interface TodoistConfig {
  token: string;
  projectId: string;
  sections: {
    inProgress: string;
    waiting: string;
    done: string;
    openclaw: string;
  };
}

function parseConfig(): TodoistConfig | null {
  const configPath = '/home/woothamwar/.openclaw/workspace/todoist-integration/scripts/config.sh';
  const fs = require('fs');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  const content = fs.readFileSync(configPath, 'utf8');
  const getExport = (key: string) => {
    const match = content.match(new RegExp(`^export ${key}="([^"]+)"`, 'm'));
    return match ? match[1] : null;
  };
  const token = getExport('TODOIST_TOKEN');
  const projectId = getExport('TODOIST_PROJECT_ID');
  const inProgress = getExport('TODOIST_SECTION_IN_PROGRESS');
  const waiting = getExport('TODOIST_SECTION_WAITING');
  const done = getExport('TODOIST_SECTION_DONE');
  const openclaw = getExport('TODOIST_SECTION_OPENCLAW_TODO');
  if (!token || !projectId || !inProgress || !waiting || !done || !openclaw) {
    return null;
  }
  return {
    token,
    projectId,
    sections: { inProgress, waiting, done, openclaw }
  };
}

function getSectionName(id: string, sectionsMap: Record<string, string>): string {
  return sectionsMap[id] || 'Unknown';
}

export async function GET(request: NextRequest) {
  const config = parseConfig();
  if (!config) {
    return NextResponse.json({ error: 'Todoist config not found' }, { status: 500 });
  }

  try {
    // Fetch tasks from Todoist API
    const taskResp = await fetch(`https://api.todoist.com/api/v1/tasks?project_id=${config.projectId}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
      },
    });

    if (!taskResp.ok) {
      const text = await taskResp.text();
      console.error('Todoist API error:', taskResp.status, text);
      return NextResponse.json({ error: 'Failed to fetch tasks', details: text }, { status: taskResp.status });
    }

    const tasksData = await taskResp.json();

    // Fetch sections to map IDs to names
    const secResp = await fetch(`https://api.todoist.com/api/v1/sections?project_id=${config.projectId}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
      },
    });
    let sectionsMap: Record<string, string> = {};
    if (secResp.ok) {
      const secData = await secResp.json();
      (secData.results || []).forEach((sec: any) => {
        sectionsMap[sec.id] = sec.name;
      });
    }

    // Categorize tasks
    const categories = [
      { id: config.sections.inProgress, label: 'In-Progress', tasks: [] as any[] },
      { id: config.sections.waiting, label: 'Waiting', tasks: [] as any[] },
      { id: config.sections.done, label: 'Done', tasks: [] as any[] },
      { id: config.sections.openclaw, label: 'Agent Queue', tasks: [] as any[] },
    ];

    const tasksArray = tasksData.results || [];
    for (const task of tasksArray) {
      const cat = categories.find(c => c.id === task.section_id);
      if (cat) {
        cat.tasks.push({
          id: task.id,
          content: task.content,
          description: task.description || '',
          due: task.due?.date || null,
          priority: task.priority,
          order: task.order,
        });
      }
    }

    // Sort tasks by order within each category
    categories.forEach(cat => {
      cat.tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    return NextResponse.json({
      categories: categories.map(c => ({
        label: c.label,
        sectionId: c.id,
        taskCount: c.tasks.length,
        tasks: c.tasks,
      })),
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Todoist fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
