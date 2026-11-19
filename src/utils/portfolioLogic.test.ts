import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatInlineMetadata,
  formatResumePlainText,
  groupSkillsByCategory,
  resolveTerminalCommand,
} from './portfolioLogic';
import type { ArchitectureWorkflow, PortfolioPayload, SkillItem } from '../types/portfolio';

const sampleWorkflows: ArchitectureWorkflow[] = [
  {
    id: 'rest-api',
    tabLabel: 'REST API',
    command: 'php artisan route:list --path=api/v1',
    endpointLabel: 'GET /api/v1/orders',
    latencyLabel: '18ms',
    statusLabel: '200 OK',
    terminalLines: ['GET api/v1/orders -> OrderController@index'],
    activeNodeIds: ['client', 'gateway', 'laravel', 'database'],
  },
  {
    id: 'database',
    tabLabel: 'Database',
    command: 'php artisan migrate:status',
    endpointLabel: 'MySQL 8.0 InnoDB',
    latencyLabel: '4ms',
    statusLabel: 'Synced',
    terminalLines: ['[Ran] 2025_01_14_create_orders_table'],
    activeNodeIds: ['laravel', 'database'],
  },
];

test('groupSkillsByCategory orders categories consistently and places primary skills first', () => {
  const skills: SkillItem[] = [
    {
      id: 's1',
      name: 'Redis',
      category: 'Databases',
      isPrimary: false,
      focusNote: 'Caching',
    },
    {
      id: 's2',
      name: 'MySQL',
      category: 'Databases',
      isPrimary: true,
      focusNote: 'Relational indexing',
    },
    {
      id: 's3',
      name: 'Laravel',
      category: 'Backend Development',
      isPrimary: true,
      focusNote: 'API architecture',
    },
  ];

  const grouped = groupSkillsByCategory(skills);
  assert.equal(grouped.length, 2);
  assert.equal(grouped[0].category, 'Backend Development');
  assert.equal(grouped[1].category, 'Databases');
  assert.equal(grouped[1].items[0].name, 'MySQL');
  assert.equal(grouped[1].items[1].name, 'Redis');
});

test('formatInlineMetadata joins clean unboxed metadata without trailing separators', () => {
  assert.equal(
    formatInlineMetadata(['Backend API', undefined, 'Completed', '']),
    'Backend API · Completed',
  );
});

test('resolveTerminalCommand maps workflow commands, help, and clear deterministically', () => {
  const routeRes = resolveTerminalCommand('artisan route:list', sampleWorkflows);
  assert.equal(routeRes.handled, true);
  assert.equal(routeRes.matchedWorkflowId, 'rest-api');
  assert.deepEqual(routeRes.outputLines, ['GET api/v1/orders -> OrderController@index']);

  const clearRes = resolveTerminalCommand('clear', sampleWorkflows);
  assert.equal(clearRes.clearTerminal, true);

  const helpRes = resolveTerminalCommand('help', sampleWorkflows);
  assert.equal(helpRes.handled, true);
  assert.ok(helpRes.outputLines.some((line) => line.includes('artisan route:list')));

  const unknownRes = resolveTerminalCommand('rm -rf /', sampleWorkflows);
  assert.equal(unknownRes.handled, true);
  assert.ok(unknownRes.outputLines[0].includes('Command not recognized'));
});

test('formatResumePlainText includes profile identity and dynamic sections', () => {
  const payload: PortfolioPayload = {
    profile: {
      name: 'Ashish Makwana',
      greeting: "Hello, I'm Ashish Makwana",
      headline: 'Building Digital Products Through Code & Engineering.',
      headlineHighlight: 'Digital Products',
      designation: 'Laravel Developer | Backend Engineer | Full-Stack Developer',
      availabilityText: 'Open to Backend & Full-Stack Roles',
      shortIntro: 'Building scalable backend systems.',
      aboutHeading: 'A Developer Focused on Building Real Solutions.',
      aboutParagraphs: ['Paragraph 1'],
      aboutHighlights: ['Laravel'],
      email: 'ashishmakwana435@gmail.com',
      location: 'India',
      resumeFilename: 'Ashish-Makwana-Resume.txt',
      socialLinks: [
        { id: 'gh', label: 'GitHub', url: 'https://github.com/ashishmakwana', platform: 'github' },
      ],
    },
    skills: [
      {
        id: '1',
        name: 'Laravel',
        category: 'Backend Development',
        isPrimary: true,
        focusNote: 'REST APIs',
      },
    ],
    experiences: [
      {
        id: 'e1',
        company: 'Tech Systems',
        role: 'Laravel Developer',
        period: 'Present',
        location: 'Remote',
        responsibilities: ['Built REST APIs'],
        technologies: ['Laravel', 'MySQL'],
      },
    ],
    projects: [
      {
        id: 'p1',
        slug: 'order-api',
        title: 'Order Engine',
        category: 'Backend Systems',
        status: 'Completed',
        featured: true,
        shortDescription: 'Order management API.',
        problemStatement: 'Slow queries.',
        solutionSummary: 'Indexed schemas.',
        technicalHighlights: ['Queue workers'],
        technologies: ['Laravel', 'MySQL'],
      },
    ],
    education: [],
    certifications: [],
    architectureNodes: [],
    architectureWorkflows: sampleWorkflows,
    settings: {
      siteTitle: 'Ashish Makwana',
      metaDescription: 'Portfolio',
      copyrightYear: 2026,
      footerTagline: 'Backend Engineer',
    },
  };

  const text = formatResumePlainText(payload);
  assert.ok(text.includes('ASHISH MAKWANA'));
  assert.ok(text.includes('ashishmakwana435@gmail.com'));
  assert.ok(text.includes('Order Engine'));
});
