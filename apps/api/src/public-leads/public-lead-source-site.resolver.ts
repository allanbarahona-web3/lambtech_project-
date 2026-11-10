import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { LeadSourceSite } from "@prisma/client";

import { parseExactPublicOrigin } from "../config/api-configuration";

export const PUBLIC_LEAD_SOURCE_SITE_ORIGINS = Symbol("PUBLIC_LEAD_SOURCE_SITE_ORIGINS");

@Injectable()
export class PublicLeadSourceSiteResolver {
  constructor(
    @Inject(PUBLIC_LEAD_SOURCE_SITE_ORIGINS)
    private readonly sourceSiteOrigins: ReadonlyMap<string, LeadSourceSite>,
  ) {}

  resolve(originHeader: string | undefined, claimedSourceSite: LeadSourceSite): LeadSourceSite {
    if (!originHeader) {
      throw new BadRequestException("A recognized Origin header is required.");
    }

    let origin: string;
    try {
      origin = parseExactPublicOrigin(originHeader);
    } catch {
      throw new BadRequestException("A recognized Origin header is required.");
    }

    const resolvedSourceSite = this.sourceSiteOrigins.get(origin);
    if (!resolvedSourceSite || resolvedSourceSite !== claimedSourceSite) {
      throw new BadRequestException("Origin and source site do not match.");
    }

    return resolvedSourceSite;
  }
}
