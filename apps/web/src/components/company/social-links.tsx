import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon } from "@/components/company/brand-icons";
import type { SocialPlatform } from "@/config/public-company";

type SocialLinksProps = {
  label: string;
  labels: Record<SocialPlatform, string>;
  links: Record<SocialPlatform, string | undefined>;
};

const socialOrder: SocialPlatform[] = ["linkedin", "facebook", "instagram", "tiktok"];

const socialIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  tiktok: TikTokIcon,
};

export function SocialLinks({ label, labels, links }: SocialLinksProps) {
  const isDevelopmentPreview = process.env.NODE_ENV === "development";
  const platforms = isDevelopmentPreview ? socialOrder : socialOrder.filter((platform) => links[platform]);
  if (!platforms.length) return null;

  return (
    <nav aria-label={label} className="social-links">
      <ul>
        {platforms.map((platform) => {
          const Icon = socialIcons[platform];
          const url = links[platform];

          return (
            <li key={platform}>
              {url ? (
                <a aria-label={labels[platform]} href={url} rel="noopener noreferrer" target="_blank">
                  <Icon aria-hidden="true" strokeWidth={1.8} />
                </a>
              ) : (
                <span aria-disabled="true" aria-label={labels[platform]} className="social-links__item social-links__item--disabled">
                  <Icon aria-hidden="true" strokeWidth={1.8} />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
