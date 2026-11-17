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
  const platforms = socialOrder.filter((platform) => links[platform]);
  if (!platforms.length) return null;

  return (
    <nav aria-label={label} className="social-links">
      <ul>
        {platforms.map((platform) => {
          const Icon = socialIcons[platform];
          const url = links[platform]!;

          return (
            <li key={platform}>
              <a aria-label={labels[platform]} href={url} rel="noopener noreferrer" target="_blank">
                <Icon aria-hidden="true" strokeWidth={1.8} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
