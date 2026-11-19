import type {
  ArchitectureWorkflow,
  PortfolioPayload,
  SkillCategory,
  SkillItem,
} from '../types/portfolio';

export interface CommandResolution {
  handled: boolean;
  outputLines: string[];
  matchedWorkflowId?: ArchitectureWorkflow['id'];
  clearTerminal?: boolean;
}

const SKILL_CATEGORY_ORDER: string[] = [
  'Architecture & System Design',
  'Backend Engineering',
  'Backend Development',
  'Databases & Modeling',
  'Databases',
  'Software Quality & Testing',
  'DevOps & Infrastructure',
  'Observability & Security',
  'Frontend Development',
  'Development Tools',
];

export function groupSkillsByCategory(
  skills: SkillItem[],
): Array<{ category: SkillCategory; items: SkillItem[] }> {
  const grouped = new Map<string, SkillItem[]>();

  for (const skill of skills) {
    const existing = grouped.get(skill.category) ?? [];
    existing.push(skill);
    grouped.set(skill.category, existing);
  }

  const result: Array<{ category: SkillCategory; items: SkillItem[] }> = [];
  const processed = new Set<string>();

  for (const category of SKILL_CATEGORY_ORDER) {
    const items = grouped.get(category);
    if (items && items.length > 0) {
      result.push({
        category: category as SkillCategory,
        items: items.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)),
      });
      processed.add(category);
    }
  }

  for (const [category, items] of grouped.entries()) {
    if (!processed.has(category) && items.length > 0) {
      result.push({
        category: category as SkillCategory,
        items: items.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)),
      });
    }
  }

  return result;
}

export function formatInlineMetadata(parts: Array<string | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' · ');
}

export function resolveTerminalCommand(
  rawInput: string,
  workflows: ArchitectureWorkflow[],
): CommandResolution {
  const normalized = rawInput.trim().toLowerCase();

  if (!normalized) {
    return {
      handled: false,
      outputLines: [],
    };
  }

  if (normalized === 'clear' || normalized === 'cls') {
    return {
      handled: true,
      outputLines: [],
      clearTerminal: true,
    };
  }

  if (normalized === 'help' || normalized === '?') {
    return {
      handled: true,
      outputLines: [
        'Available inspection commands:',
        '  artisan route:list       Inspect REST API endpoints & middleware',
        '  artisan migrate:status   Inspect MySQL schema & migration health',
        '  artisan queue:monitor    Inspect Sanctum auth & Redis queue workers',
        '  whoami                   Display engineering profile summary',
        '  clear                    Reset console output',
      ],
    };
  }

  if (normalized === 'whoami') {
    return {
      handled: true,
      outputLines: [
        'Ashish Makwana — Laravel Developer | Backend Engineer | Full-Stack Developer',
        'Core focus: Scalable PHP/Laravel APIs, MySQL architecture, and production web systems.',
      ],
    };
  }

  const matchedWorkflow = workflows.find((workflow) => {
    const cmd = workflow.command.toLowerCase();
    return (
      normalized === cmd ||
      (normalized.includes('route') && workflow.id === 'rest-api') ||
      (normalized.includes('migrate') && workflow.id === 'database') ||
      (normalized.includes('mysql') && workflow.id === 'database') ||
      (normalized.includes('queue') && workflow.id === 'auth-queue') ||
      (normalized.includes('auth') && workflow.id === 'auth-queue') ||
      (normalized.includes('redis') && workflow.id === 'auth-queue') ||
      (normalized.includes('curl') && workflow.id === 'rest-api')
    );
  });

  if (matchedWorkflow) {
    return {
      handled: true,
      matchedWorkflowId: matchedWorkflow.id,
      outputLines: matchedWorkflow.terminalLines,
    };
  }

  return {
    handled: true,
    outputLines: [
      `Command not recognized: "${rawInput.trim()}"`,
      'Type "help" to list supported inspection commands.',
    ],
  };
}

export function formatResumePlainText(portfolio: PortfolioPayload): string {
  const { profile, skills, experiences, projects, education, certifications } = portfolio;
  const skillGroups = groupSkillsByCategory(skills);

  const lines: string[] = [
    profile.name.toUpperCase(),
    profile.designation,
    `${profile.email} | ${profile.location}`,
    ...profile.socialLinks.map((link) => `${link.label}: ${link.url}`),
    '',
    'SUMMARY',
    '-------',
    profile.shortIntro,
    '',
    'TECHNICAL SKILLS',
    '----------------',
    ...skillGroups.map(
      (group) =>
        `${group.category}: ${group.items.map((item) => item.name).join(', ')}`,
    ),
    '',
    'EXPERIENCE',
    '----------',
    ...experiences.flatMap((exp) => [
      `${exp.role} — ${exp.company} (${exp.period} · ${exp.location})`,
      ...exp.responsibilities.map((item) => `  - ${item}`),
      `  Stack: ${exp.technologies.join(', ')}`,
      '',
    ]),
    'SELECTED PROJECTS',
    '-----------------',
    ...projects.flatMap((project) => [
      `${project.title} [${project.category} · ${project.status}]`,
      `  ${project.shortDescription}`,
      ...(project.technicalHighlights.length
        ? [`  Highlights: ${project.technicalHighlights.slice(0, 2).join('; ')}`]
        : []),
      `  Technologies: ${project.technologies.join(', ')}`,
      '',
    ]),
    'EDUCATION',
    '---------',
    ...education.flatMap((item) => [
      `${item.degree} — ${item.institution} (${item.period} · ${item.location})`,
      ...(item.description ? [`  ${item.description}`] : []),
      '',
    ]),
    'COURSES & INDEPENDENT LEARNING',
    '------------------------------',
    ...certifications.map(
      (item) => `${item.title} — ${item.issuer} (${item.date})`,
    ),
  ];

  return lines.join('\n');
}
