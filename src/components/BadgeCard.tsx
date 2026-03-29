import { Lock } from "lucide-react";
import type { BadgeDefinition } from "../data/badges";

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: string | null;
}

export default function BadgeCard({ badge, earned, earnedAt }: BadgeCardProps) {
  return (
    <div
      className={`relative bg-surface rounded-2xl border border-border p-5 text-center hover-lift transition-all duration-300 ${
        earned ? "" : "grayscale opacity-60"
      }`}
    >
      {/* Lock overlay for unearned */}
      {!earned && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-surface-alt rounded-full flex items-center justify-center border border-border">
            <Lock className="w-3 h-3 text-text-muted" />
          </div>
        </div>
      )}

      {/* Emoji icon */}
      <div className="text-4xl mb-3">{badge.icon}</div>

      {/* Badge name */}
      <h3 className="font-serif font-bold text-secondary text-sm mb-1">
        {badge.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-text-muted leading-relaxed mb-2">
        {badge.description}
      </p>

      {/* Earned date or condition hint */}
      {earned && earnedAt ? (
        <span className="inline-block text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          Obtenu le{" "}
          {new Date(earnedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ) : (
        <span className="inline-block text-xs text-text-muted italic">
          {badge.condition}
        </span>
      )}
    </div>
  );
}
