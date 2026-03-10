"use client";

interface AnalysisScoreRingProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number) {
  if (score >= 75) return { stroke: "#2E8B57", bg: "#F0FFF4", text: "#1A5C38" };
  if (score >= 50) return { stroke: "#B8960C", bg: "#FFFBF0", text: "#8A7209" };
  return { stroke: "#C05746", bg: "#FFF4F1", text: "#9E3B2D" };
}

export function AnalysisScoreRing({ score, size = 120 }: AnalysisScoreRingProps) {
  const colors = getScoreColor(score);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E7DAC5"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-bold"
            style={{ color: colors.text }}
          >
            {score}
          </span>
          <span className="text-xs text-stone">/100</span>
        </div>
      </div>
      <span
        className="text-sm font-medium"
        style={{ color: colors.text }}
      >
        {score >= 75 ? "Looking great" : score >= 50 ? "Room to improve" : "Needs attention"}
      </span>
    </div>
  );
}
