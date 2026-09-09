import { NextRequest, NextResponse } from 'next/server';

import { getCorporateInfosWithLogos } from '@/app/actions';
import { getLogoById } from '@/api/logo-service';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const DATA_URL_PATTERN = /^data:(.+);base64,(.*)$/;

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ tenant: string }> },
): Promise<NextResponse> {
  const { tenant } = await props.params;
  const corporateInfo = await getCorporateInfosWithLogos(tenant);

  if (corporateInfo.faviconLogoId) {
    const faviconLogo = await getLogoById(corporateInfo.faviconLogoId);
    const match = faviconLogo?.logo?.match(DATA_URL_PATTERN);
    if (match) {
      const [, mimeType, base64Data] = match;
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new NextResponse(bytes, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }

  return NextResponse.redirect(new URL('/favicon.png', request.url));
}
