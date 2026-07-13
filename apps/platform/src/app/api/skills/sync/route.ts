/**
 * /api/skills/sync
 *
 * Triggers the `sync-designmd.yml` GitHub Action via `workflow_dispatch`.
 * The Action runs `pnpm designmd:export:all` against production Convex and
 * commits any changed `docs/exports/*.DESIGN.md` to main. Designers click
 * "Sync to repository" on the DCA config page; the route POSTs here.
 *
 * Auth: server reads `GITHUB_PAT` from env. The PAT is never echoed back to
 * the client, never stored in Convex, never logged.
 *
 * Phase F — Skill Writer (sync trigger).
 */

import { NextResponse } from 'next/server';
import { api } from '@oneui/convex';
import { createRequiredAuthedConvexClient } from '@/lib/convexServer';

const GITHUB_OWNER = process.env.GITHUB_REPO_OWNER ?? 'oneui-studio';
const GITHUB_REPO = process.env.GITHUB_REPO_NAME ?? 'oneui-studio';
const WORKFLOW_FILENAME = 'sync-designmd.yml';
const DEFAULT_REF = process.env.GITHUB_SYNC_REF ?? 'main';

export async function POST(_request: Request) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_CONVEX_URL is not configured.' },
      { status: 500 },
    );
  }

  const convex = await createRequiredAuthedConvexClient(convexUrl);
  if (!convex) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const currentUser = await convex.query(api.users.getCurrentUserRecord, {});
  if (currentUser?.platformRole !== 'owner') {
    return NextResponse.json(
      { error: 'Only platform owners can sync design docs to the repository.' },
      { status: 403 },
    );
  }

  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    return NextResponse.json(
      {
        error:
          'GITHUB_PAT is not configured. Set a personal access token with the `actions:write` scope on the platform deployment to enable on-demand sync.',
      },
      { status: 500 },
    );
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILENAME}/dispatches`;

  const ghResponse = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${pat}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: DEFAULT_REF }),
  });

  if (ghResponse.status === 204) {
    return NextResponse.json({
      queued: true,
      workflow: WORKFLOW_FILENAME,
      ref: DEFAULT_REF,
    });
  }

  // GitHub returns the failure body on non-204 responses. Surface a sanitised
  // message to the client so the failure is debuggable without revealing the PAT.
  let detail = '';
  try {
    const errBody = (await ghResponse.json()) as { message?: string };
    detail = errBody.message ?? '';
  } catch {
    detail = await ghResponse.text();
  }

  return NextResponse.json(
    {
      error: `GitHub workflow_dispatch failed (${ghResponse.status}): ${detail || 'no detail'}`,
      queued: false,
    },
    { status: ghResponse.status >= 500 ? 502 : 400 },
  );
}
