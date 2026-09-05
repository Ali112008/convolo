import { MessageCircleMore } from "lucide-react";
import Link from "next/link";

interface BrandProps {
  href?: string;
  compact?: boolean;
  className?: string;
}

export function Brand({ href = "/", compact = false, className = "" }: BrandProps) {
  return (
    <Link className={`brand ${className}`.trim()} href={href} aria-label="Convolo home">
      <span className="brand-mark" aria-hidden="true">
        <MessageCircleMore size={compact ? 18 : 21} strokeWidth={2.3} />
      </span>
      <span className="brand-name">Convolo</span>
    </Link>
  );
}
