---
title: 'Four years of remote work after leaving big tech: I think I am not built for remote'
date: '2026-10-19'
excerpt: 'Four years of remote work, two layoffs, and a personal retrospective on career choices, remote collaboration and how I want to work.'
description: 'After leaving big tech I worked remotely for four years across a US-listed company and a Web3 team. Between unemployment and re-employment, this is a re-examination of what kind of work and professional contact I actually need.'
tags: ['remote work', 'career retrospective', 'layoffs', 'digital nomad']
categories: 个人复盘
keywords: 'remote work engineer,remote work isolation,career retrospective,software engineer layoffs,digital nomad,leaving big tech,frontend engineer career'
lang: en
translationKey: remote-work-after-four-years
---

# Four years of remote work after leaving big tech: I think I am not built for remote

Resume first: [中文](https://blog.ashesborn.cloud/blog/Chinese-anymouns) | [English](https://blog.ashesborn.cloud/blog/frontend-agent-engineer-resume) here.

## Background

At the start of 2022 the work was stable, the team was friendly, and the only problem was that the project had stalled. Tempted by work-life balance and no commute, I quit without a plan to look for remote work.

After three tense months of job hunting and a detour through Upwork, I found my first genuinely foreign, genuinely remote job: migrating Salesforce processes into a self-built rules engine. Coming from low-code engine work, the fit was almost perfect.

And so, full of enthusiasm for a new life and with relatively free time, I started a pseudo-digital-nomad existence.

## The beginning

Why "pseudo"? Because the strongest piece of evidence is that I never actually travelled. In four years I took three holidays and never once worked from another city. I kept telling myself, "aren't three monitors at home better than hunching over a laptop?"

Looking back, I am someone who genuinely needs social contact and professional exchange. So I threw myself into offline social events, picked up tennis and music that I never had time for, spent long evenings in bars and coffee shops, and built a new circle of friends quickly. During the day (9–17) I did work I enjoyed; in the evening I talked with new friends about past jobs, people I had met, and important systems I had supported. Everything looked like it was heading where I wanted. It did not last.

## The turn

In the second year the Fed kept raising rates, and the new company was a US-listed real estate brokerage, so the US property market contracted. Colleagues worried about being laid off and reorgs came one after another. My manager at that point was an EM with 10+ years in Texas.

Watching him, I recognised the same pattern I had seen in the group next door at my first company: report upward, relay messages, no code for years, fluent in internet buzzwords. He came from frontend but seemed never to have done backend work, yet regularly raised architecture and code-design questions with backend engineers. At some point my permission to review and approve PRs was taken away, and my code started going through him and one other person.

Combined with new HR policies at a US company, merged PRs became the metric for how much remote work we were doing. My time at the company started counting down.

## The breaking point

My PRs kept getting stuck. I was the person who built the rules engine from zero, yet every change — code quality, blast radius, PR description conventions, coding habits — was questioned. Even using `useMemo` frequently was somehow wrong. Functional programming ideas were broken one by one by other people's quickly merged `let` and `useRef`. Some weeks I could not get a single PR merged, and could not move a Jira ticket to ready for QA.

I tried discussing it in "flat" management meetings and argued about it, to no effect. Then I saw someone else merge code like this and let it go:

```typescript
const ComponentA = () => {
  const ComponentB = () => <div></div>
  return <ComponentB />
}
```

At that point I basically assumed I was the person who was going to be removed.

## Attempts

I could not understand why I was being targeted, but out of a sense of professional responsibility I still tried to fit into code that disgusted me. I could no longer throw myself into the work the way I used to, so I started developing side projects.

I started dragging work outside my job into social situations, looking for teammates and product needs at every gathering.

In hindsight that was naive. I was in a fourth-tier city hoping to find people who wanted to build internet-style software seriously, in a market where procurement runs on bid rigging.

## Unemployment, re-employment, and unemployment again

In September 2025 I was let go, as expected. I did lose some composure in the final meeting with my +2 and HR — the EM claimed my technical skills were insufficient and my output too low. I did not blow up badly; I got my emotions under control within ten minutes. What had happened had happened and I had expected it, so there was no point arguing. In my last second on the job I was still on call solving someone's problem, until I noticed my permissions had silently disappeared. That was almost funny.

This time I did not look for a job. I wanted to consolidate and work seriously on a few directions I had found. Then a Web3 opportunity found me: building a trading platform from zero. I joined on the logic of "work on it for now — simple business, but at least it pays, and I get to feel out a new industry".

The first three months were as smooth as the last job, and with how fast AI was improving I felt my productivity take a qualitative leap. It did not last. The EU team took away my PR merge rights, the same script as before. The funnier part: they claimed their coding standards had to be followed, while their own PRs often violated them. They said the UI needed pixel-perfect fidelity, yet even with Figma MCP they did not achieve it. In mid-July, policy changes in the EU shrank demand and that team did not last either.

## Retrospective

I do not really know how to summarise this. My choices all seem right, and they all seem wrong too. Technically I can build these businesses — my own https://github.com/sadofriod/graphrag-ts is proof that I am not bad at it. On the human side I can find friends and maintain good relationships with colleagues. And yet I was unemployed. It looks like I cannot fully fit into remote work: I still want to talk about technology and business face to face, and I enjoy the process of a group of people using their expertise to hit a shared goal. Remote seems to cut that off. Even after hours, I used to be willing to dig into micro-frontends, metaprogramming or React internals, but once I was remote — always at home — the feedback from that digging was no longer as strong, even though I never stopped.

## Looking ahead

I have been unemployed for three months. I have bad moods, and although I only started applying last Thursday, the swings and the anxiety are already very obvious. Over these three months I kept consolidating my projects, products and technical work and looking for ways to monetise, but positive feedback at this stage is genuinely scarce. Combined with my state of mind and four years without face-to-face technical conversation, I have been close to depressed lately (yesterday I was chatting with the coffee shop owner and suddenly wanted to cry for no reason).

I know all of this is normal and that I just need to steady myself and keep going — job hunting or anything else.

## Summary

Two years ago I saw "people always romanticise the road not taken" and agreed. I would only add: "but you still have to go and walk it." It may be inarticulate, but that is roughly one of my non-technical conclusions from these four years.
