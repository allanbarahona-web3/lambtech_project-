import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Attachment } from "resend";

const LOGO_CONTENT_ID = "barmentech-logo";
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export type LeadEmailAssetFailureCategory =
  | "EMAIL_ASSET_NOT_FOUND"
  | "EMAIL_ASSET_INVALID";

export class LeadEmailAssetError extends Error {
  constructor(readonly category: LeadEmailAssetFailureCategory) {
    super(category);
    this.name = "LeadEmailAssetError";
  }
}

type AssetReader = (assetPath: string) => Buffer;

function logoAssetPath(): string {
  return join(__dirname, "assets", "barmentech-logo.png");
}

function isPng(content: Buffer): boolean {
  return (
    content.length >= PNG_SIGNATURE.length &&
    content.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
  );
}

export function loadLeadEmailLogo(
  readAsset: AssetReader = readFileSync,
): Buffer {
  let content: Buffer;
  try {
    content = readAsset(logoAssetPath());
  } catch {
    throw new LeadEmailAssetError("EMAIL_ASSET_NOT_FOUND");
  }

  if (!content.length || !isPng(content)) {
    throw new LeadEmailAssetError("EMAIL_ASSET_INVALID");
  }

  return content;
}

export function createLeadEmailLogoAttachment(): Attachment {
  return {
    filename: "barmentech-logo.png",
    content: loadLeadEmailLogo(),
    contentType: "image/png",
    contentId: LOGO_CONTENT_ID,
  };
}
