'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';

type Node = { i: string; t: string; y: number | null; k: 's' | 'c'; n?: number };
type Payload = {
  snapshot: string;
  nodes: Node[];
  edges: [number, number][];
  seeds: { id: string; doi: string | null; title: string | null; year: number | null; retraction_date: string | null; citers: number }[];
  stats: { seed_count: number; citer_count: number; edge_count: number; multi_citers: number; dist: Record<string, number> };
};

const SEED_COLORS = [
  '#e04b8a', '#d4632a', '#9b5de5', '#1f7a8c', '#b5179e', '#43766c',
  '#c1121f', '#3a5a40', '#7f5539', '#264653', '#d00000', '#5f0f40',
];

/** Stable pseudo-random for layout jitter so the picture does not change between renders. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Placed = { x: number; y: number; kind: 'seed' | 'citer' | 'multi'; seedIdx: number[]; node: Node };

export function layout(payload: Payload, width: number, height: number) {
  const rand = mulberry32(1337);
  const cx = width / 2;
  const cy = height / 2;
  const inner = Math.min(width, height) * 0.26;
  const ringMin = inner + Math.min(width, height) * 0.10;
  const ringMax = Math.min(width, height) * 0.40;
  const multiRing = Math.min(width, height) * 0.455;

  const seedIndex = new Map<string, number>();
  payload.seeds.forEach((seed, index) => seedIndex.set(seed.id, index));

  // Sector width proportional to how many citers a seed has, so a 122-citer seed
  // is visibly bigger than a 60-citer one instead of every seed owning 1/12.
  const total = payload.seeds.reduce((sum, seed) => sum + seed.citers, 0) || 1;
  const sectors: { start: number; end: number }[] = [];
  let cursor = -Math.PI / 2;
  for (const seed of payload.seeds) {
    const span = (seed.citers / total) * Math.PI * 2;
    sectors.push({ start: cursor, end: cursor + span });
    cursor += span;
  }

  const seedPos = payload.seeds.map((_, index) => {
    const mid = (sectors[index].start + sectors[index].end) / 2;
    return { x: cx + Math.cos(mid) * inner, y: cy + Math.sin(mid) * inner, mid };
  });

  const placed: Placed[] = [];
  const bySeed = new Map<number, number[]>();

  payload.nodes.forEach((node, index) => {
    if (node.k !== 'c') return;
    // A citer may point at several seeds; the layout keeps the first as its home.
    const homes: number[] = [];
    payload.edges.forEach(([from, to]) => {
      if (from === index) {
        const seed = seedIndex.get(payload.nodes[to].i);
        if (seed !== undefined) homes.push(seed);
      }
    });
    if (homes.length === 0) return;
    if (homes.length === 1) {
      const list = bySeed.get(homes[0]) ?? [];
      list.push(index);
      bySeed.set(homes[0], list);
    } else {
      const midX = homes.reduce((sum, h) => sum + Math.cos(seedPos[h].mid), 0) / homes.length;
      const midY = homes.reduce((sum, h) => sum + Math.sin(seedPos[h].mid), 0) / homes.length;
      const angle = Math.atan2(midY, midX);
      placed.push({ x: cx + Math.cos(angle) * multiRing, y: cy + Math.sin(angle) * multiRing, kind: 'multi', seedIdx: homes, node });
    }
  });

  bySeed.forEach((members, seed) => {
    const { start, end } = sectors[seed];
    const pad = (end - start) * 0.06;
    members.forEach((nodeIndex, position) => {
      const frac = members.length === 1 ? 0.5 : position / (members.length - 1);
      const angle = start + pad + frac * (end - start - pad * 2);
      const radius = ringMin + rand() * (ringMax - ringMin);
      placed.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, kind: 'citer', seedIdx: [seed], node: payload.nodes[nodeIndex] });
    });
  });

  payload.seeds.forEach((seed, index) => {
    const node = payload.nodes.find((candidate) => candidate.i === seed.id);
    placed.push({
      x: seedPos[index].x,
      y: seedPos[index].y,
      kind: 'seed',
      seedIdx: [index],
      node: node ?? { i: seed.id, t: seed.title ?? seed.id, y: seed.year, k: 's' },
    });
  });

  return { placed, seedPos };
}

export default function RetractionGraph() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; node: Node; seeds: number[] } | null>(null);
  const [activeSeed, setActiveSeed] = useState<number | null>(null);
  const [size, setSize] = useState({ width: 900, height: 560 });

  useEffect(() => {
    let cancelled = false;
    fetch('/data/retraction-graph.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Payload) => {
        if (!cancelled) setPayload(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const width = Math.max(320, Math.floor(entries[0].contentRect.width));
      setSize({ width, height: Math.min(620, Math.max(420, Math.round(width * 0.62))) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const computed = useMemo(() => (payload ? layout(payload, size.width, size.height) : null), [payload, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !computed || !payload) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, size.width, size.height);

    const citerIndex = new Map<string, Placed>();
    computed.placed.forEach((item) => {
      if (item.kind !== 'seed') citerIndex.set(item.node.i, item);
    });

    const seedPositions: { x: number; y: number }[] = [];
    computed.placed.forEach((item) => {
      if (item.kind === 'seed') {
        const index = payload.seeds.findIndex((seed) => seed.id === item.node.i);
        if (index >= 0) seedPositions[index] = { x: item.x, y: item.y };
      }
    });

    // Edges first, so nodes sit on top of the web.
    payload.edges.forEach(([from, to]) => {
      const citer = citerIndex.get(payload.nodes[from].i);
      const seedId = payload.nodes[to].i;
      const seedIdx = payload.seeds.findIndex((seed) => seed.id === seedId);
      const seed = seedPositions[seedIdx];
      if (!citer || !seed) return;
      const dim = activeSeed !== null && activeSeed !== seedIdx;
      ctx.beginPath();
      ctx.moveTo(citer.x, citer.y);
      ctx.lineTo(seed.x, seed.y);
      ctx.strokeStyle = dim ? 'rgba(17,17,17,0.04)' : `rgba(17,17,17,0.13)`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    });

    computed.placed.forEach((item) => {
      if (item.kind === 'seed') return;
      const home = item.seedIdx[0];
      const dim = activeSeed !== null && !item.seedIdx.includes(activeSeed);
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.kind === 'multi' ? 4 : item.node.n && item.node.n > 1 ? 3.4 : 2.2, 0, Math.PI * 2);
      ctx.fillStyle =
        item.kind === 'multi'
          ? '#ffc700'
          : dim
            ? 'rgba(17,17,17,0.15)'
            : SEED_COLORS[home % SEED_COLORS.length];
      ctx.fill();
      if (item.kind === 'multi' || (item.node.n ?? 1) > 1) {
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    });

    payload.seeds.forEach((seed, index) => {
      const position = seedPositions[index];
      if (!position) return;
      const dim = activeSeed !== null && activeSeed !== index;
      ctx.beginPath();
      ctx.arc(position.x, position.y, 8.5, 0, Math.PI * 2);
      ctx.fillStyle = dim ? 'rgba(17,17,17,0.25)' : SEED_COLORS[index % SEED_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = dim ? 'rgba(17,17,17,0.35)' : '#111';
      ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      // Just the marker: the citer count lives in the hover tooltip and is already
      // encoded by the sector width, and a 6-character label cannot collide with
      // its 11 neighbours at any canvas width (the old ~110px label could).
      const label = `DOI ${index + 1}`;
      ctx.fillText(label, position.x - ctx.measureText(label).width / 2, position.y - 14);
    });
  }, [computed, payload, size, activeSeed]);

  const onMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!computed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let best: { distance: number; item: Placed } | null = null;
    computed.placed.forEach((item) => {
      const distance = (item.x - x) ** 2 + (item.y - y) ** 2;
      if (!best || distance < best.distance) best = { distance, item };
    });
    if (best && (best as { distance: number }).distance < 121) {
      const item = (best as { distance: number; item: Placed }).item;
      setHover({ x: item.x, y: item.y, node: item.node, seeds: item.seedIdx });
    } else {
      setHover(null);
    }
  };

  if (error) {
    return (
      <div className="brutal-card" style={{ padding: 16 }}>
        <strong>The graph could not load ({error}).</strong>
        <p style={{ margin: '6px 0 0' }}>
          The payload lives at <code>/data/retraction-graph.json</code>; the raw rows are on Hugging Face.
        </p>
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: size.height, border: 'var(--brutal-border)', borderRadius: 4, background: '#fffdf7', cursor: hover ? 'pointer' : 'default', display: 'block' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        onClick={() => {
          if (hover && hover.seeds.length === 1 && payload) {
            const index = hover.seeds[0];
            setActiveSeed(activeSeed === index ? null : index);
          }
        }}
      />
      {hover && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(hover.x + 12, size.width - 300),
            top: Math.max(8, hover.y - 8),
            maxWidth: 300,
            background: '#111',
            color: '#f7f3e8',
            padding: '8px 10px',
            borderRadius: 4,
            fontSize: 12,
            lineHeight: 1.4,
            pointerEvents: 'none',
          }}
        >
          <div>{hover.node.t || hover.node.i}</div>
          <div style={{ opacity: 0.7 }}>
            {hover.node.y ? `${hover.node.y} · ` : ''}
            {hover.node.k === 's'
              ? `retracted seed · ${payload?.seeds[hover.seeds[0]]?.citers ?? '?'} citers`
              : `citer of ${hover.seeds.map((s) => `DOI ${s + 1}`).join(', ')}`}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10, fontSize: 12, fontFamily: 'var(--brutal-mono)' }}>
        <span>● big ring = retracted paper (seed)</span>
        <span>● small dot = paper that cites a seed</span>
        <span>● yellow = cites more than one seed</span>
        <span>click a seed to isolate its citers</span>
      </div>
    </div>
  );
}
