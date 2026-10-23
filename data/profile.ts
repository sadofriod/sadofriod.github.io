/**
 * Single source of truth for the identity layer.
 * Home hero, /about, article callouts and JSON-LD all read from here.
 * Posts are referenced by FILE NAME — slugs can be hashed for non-ASCII names.
 */

export type SocialIcon = 'github' | 'mail' | 'blog';

export type ProfileSocial = {
  label: string;
  href: string;
  icon: SocialIcon;
};

export type PostRef = {
  file: string;
  label?: string;
};

export type WritingGroup = {
  id: string;
  label: string;
  blurb: string;
  posts: PostRef[];
  moreHref?: string;
  accent: 'pink' | 'yellow' | 'blue' | 'mint';
};

export const profile = {
  name: 'Ashes Born',
  handle: 'sadofriod',
  avatar: '/avatar.jpg',
  role: 'Independent engineer · GraphRAG, TypeScript, retrieval infrastructure',
  tagline: 'Independent engineer building GraphRAG systems in TypeScript',
  status: {
    label: 'Building graphrag-ts',
    detail: 'open-source GraphRAG in TypeScript + Postgres/pgvector · MCP trial open',
    href: 'https://github.com/sadofriod/graphrag-ts',
  },
  socials: [
    { label: 'GitHub', href: 'https://github.com/sadofriod', icon: 'github' },
    { label: 'Email', href: 'mailto:justlikeashes@gmail.com', icon: 'mail' },
    { label: 'Blog', href: 'https://blog.ashesborn.cloud', icon: 'blog' },
    { label: 'MCP trial', href: 'https://blog.ashesborn.cloud/blog/graphrag-mcp-trial', icon: 'blog' },
  ] as ProfileSocial[],

  about: {
    start:
      'I spent six years building the invisible kind of software: a low-code platform and large-screen visualization systems at JD.com, then micro-frontends, a Salesforce rules engine and an AST-diff based E2E test selector at Compass. The pattern across all of it is the same — take a big opaque system and make it legible enough that other people can reason about it, and change it without fear.',
    turn:
      'In 2022 I went fully remote. Four years and two companies later I have a harder, less comfortable lesson: remote work replaces trust with process, and process starts measuring the wrong thing. I built a rules engine and a trading platform from zero, and twice lost merge rights — not over broken code, but because nobody in the room could see the work. I know now that I need a team in the same timezone and, honestly, in the same room.',
    now:
      'So now I work on the part of AI infrastructure I can verify line by line: graphrag-ts, an open-source GraphRAG implementation in TypeScript on Postgres/pgvector — incremental indexing, Leiden communities, hybrid retrieval with evidence grounding, MCP server included. I write the internals down as long posts because that layer is under-documented. I am open to agent-engineering and frontend roles, and to a small number of consulting engagements on retrieval and knowledge-graph systems.',
  },

  fullStory: {
    file: 'remote-work-after-four-years.md',
    label: 'The long version',
    note: 'Four years remote, two companies, two lost merge buttons — the annotated version of the three paragraphs above.',
  },

  now: [
    'Shipping graphrag-ts: incremental build, Leiden community detection, hybrid retrieval with evidence grounding, MCP server.',
    'Writing one long post per subsystem instead of tutorials.',
    'Open to agent-engineering / frontend roles and a small number of retrieval consulting engagements.',
  ],

  graphragSeries: {
    label: 'GraphRAG internals',
    blurb: 'How graphrag-ts is actually built — design, retrieval, global map-reduce, incremental updates.',
    accent: 'pink' as const,
    posts: [
      { file: 'GraphRAG PostgreSQL + TypeScript 实现设计.md' },
      { file: 'GraphRAG 检索实现说明.md' },
      { file: 'GraphRAG Global Map-Reduce 查询实现.md' },
      { file: 'GraphRAG 增量构建实现：差异检测、更新与清理.md' },
    ] as PostRef[],
    moreHref: '/category/AI',
  },

  writingGroups: [
    {
      id: 'graphrag',
      label: 'GraphRAG internals',
      blurb: 'Indexing pipeline, community detection, retrieval, global map-reduce, incremental builds.',
      accent: 'pink',
      posts: [
        { file: 'GraphRAG PostgreSQL + TypeScript 实现设计.md' },
        { file: 'GraphRAG 检索实现说明.md' },
        { file: 'GraphRAG Global Map-Reduce 查询实现.md' },
        { file: 'GraphRAG 增量构建实现：差异检测、更新与清理.md' },
      ],
      moreHref: '/category/AI',
    },
    {
      id: 'engineering',
      label: 'Engineering practice',
      blurb: 'The frontend infrastructure work underneath: micro-frontends, E2E selection, rendering engines, grouped lists.',
      accent: 'yellow',
      posts: [
        { file: '增量运行E2E测试.md' },
        { file: 'monorepo结构下启动react项目局部热更新.md' },
        { file: '动态表单设计.md' },
        { file: '高性能分组列表设计-1.md' },
      ],
      moreHref: '/category/project',
    },
    {
      id: 'notes',
      label: 'Career & notes',
      blurb: 'One long retrospective, one resume, and the occasional experiment that did not fit anywhere else.',
      accent: 'blue',
      posts: [
        { file: 'remote-work-after-four-years.md' },
        { file: 'frontend-agent-engineer-resume.md' },
      ],
    },
  ] as WritingGroup[],

  projects: [
    {
      name: 'graphrag-ts',
      role: 'Author & maintainer',
      meta: 'TypeScript · Bun · Postgres/pgvector · MCP',
      blurb:
        'GraphRAG from scratch: indexing pipeline, incremental builds, global map-reduce, hybrid retrieval with evidence grounding.',
      href: 'https://github.com/sadofriod/graphrag-ts',
    },
    {
      name: 'blog.ashesborn.cloud',
      role: 'Author',
      meta: 'Next.js · Cloudflare Workers',
      blurb: 'This site — long-form notes on retrieval, frontend infrastructure, and one career retrospective.',
      href: 'https://blog.ashesborn.cloud',
    },
  ],

  resumes: [
    { label: 'Resume (EN)', file: 'frontend-agent-engineer-resume.md' },
    { label: '简历（中文）', file: 'Chinese-anymouns.md' },
  ] as PostRef[],

  contact: {
    email: 'justlikeashes@gmail.com',
    emailHref: 'mailto:justlikeashes@gmail.com',
  },

  seo: {
    aboutTitle: 'About Ashes Born — Independent engineer building GraphRAG systems',
    aboutDescription:
      'Independent engineer building graphrag-ts, an open-source GraphRAG implementation in TypeScript on Postgres/pgvector. Previously low-code, visualization and micro-frontend infrastructure at JD.com and Compass.',
  },
};

export type Profile = typeof profile;
