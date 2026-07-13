/**
 * Voice SDK REST endpoint
 *
 * GET /api/voice/sdk/{brandSlug}
 * GET /api/voice/sdk/{brandSlug}?version=1.0.0
 *
 * Returns the published voice configuration for a brand as JSON.
 * Product teams consume this to inject brand-specific system prompts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandSlug: string }> }
) {
  const { brandSlug } = await params;
  const version = request.nextUrl.searchParams.get('version');
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  try {
    // Look up brand by slug
    const brand = await convex.query(api.brands.getBySlug, { slug: brandSlug });
    if (!brand) {
      return NextResponse.json(
        { error: `Brand not found: ${brandSlug}` },
        { status: 404 }
      );
    }

    // Get publication
    let publication;
    if (version) {
      publication = await convex.query(api.voicePublish.getByVersion, {
        brandId: brand._id,
        version,
      });
    } else {
      publication = await convex.query(api.voicePublish.getLatest, {
        brandId: brand._id,
      });
    }

    if (!publication) {
      return NextResponse.json(
        { error: `No published voice config for brand: ${brandSlug}${version ? ` version ${version}` : ''}` },
        { status: 404 }
      );
    }

    // Format the SDK response
    const sdkResponse = {
      brand: brandSlug,
      brandName: brand.name,
      version: publication.version,
      publishedAt: new Date(publication.publishedAt).toISOString(),
      prompts: publication.compiledPrompts,
      skills: publication.skills,
      toneProfile: publication.voiceConfigSnapshot?.toneProfile,
      toneGuardRules: publication.toneGuardRules,
      config: {
        language: publication.voiceConfigSnapshot?.language,
        communicationStyle: publication.voiceConfigSnapshot?.communicationStyle,
        emotionalIntelligence: publication.voiceConfigSnapshot?.emotionalIntelligence,
      },
    };

    return NextResponse.json(sdkResponse, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
