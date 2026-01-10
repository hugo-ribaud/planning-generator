/**
 * PlanoraiLogo - Brand logo with animated AI aura effect
 * Features calendar icon with coral/violet gradient and sparkle animations
 */

interface PlanoraiLogoProps {
  width?: number
  height?: number
  className?: string
  animated?: boolean
  showText?: boolean
}

export function PlanoraiLogo({
  width = 200,
  height = 60,
  className = '',
  animated = true,
  showText = true,
}: PlanoraiLogoProps): JSX.Element {
  // Adjust viewBox based on whether text is shown
  const viewBoxWidth = showText ? 200 : 60

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewBoxWidth} 60`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planorai"
    >
      <defs>
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B4A" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="auraGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#FF6B4A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* AI Aura Effect - Outer Glow */}
      {animated && (
        <>
          <circle cx="30" cy="30" r="22" fill="url(#auraGradient)">
            <animate
              attributeName="r"
              values="22;25;22"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.3;0.6"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="30" cy="30" r="18" fill="url(#auraGradient)">
            <animate
              attributeName="r"
              values="18;21;18"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0.2;0.4"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {/* Calendar Icon Background */}
      <rect
        x="14"
        y="16"
        width="32"
        height="28"
        rx="4"
        fill="url(#aiGradient)"
        filter="url(#glow)"
      />

      {/* Calendar Header */}
      <rect x="14" y="16" width="32" height="8" rx="4" fill="#FF6B4A" />

      {/* Calendar Binding Rings */}
      <circle cx="21" cy="18" r="1.5" fill="white" />
      <circle cx="30" cy="18" r="1.5" fill="white" />
      <circle cx="39" cy="18" r="1.5" fill="white" />

      {/* Calendar Grid */}
      <g fill="white" opacity="0.9">
        <rect x="18" y="28" width="3" height="3" rx="0.5" />
        <rect x="24" y="28" width="3" height="3" rx="0.5" />
        <rect x="30" y="28" width="3" height="3" rx="0.5" />
        <rect x="36" y="28" width="3" height="3" rx="0.5" />

        <rect x="18" y="34" width="3" height="3" rx="0.5" />
        <rect x="24" y="34" width="3" height="3" rx="0.5" />
        <rect x="30" y="34" width="3" height="3" rx="0.5" />
        <rect x="36" y="34" width="3" height="3" rx="0.5" />
      </g>

      {/* AI Sparkle Effects */}
      <g fill="#8B5CF6">
        <path d="M44 20 L45 22 L47 23 L45 24 L44 26 L43 24 L41 23 L43 22 Z">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path d="M12 36 L12.5 37 L13.5 37.5 L12.5 38 L12 39 L11.5 38 L10.5 37.5 L11.5 37 Z">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="1.8s"
              repeatCount="indefinite"
              begin="0.5s"
            />
          )}
        </path>
      </g>

      {/* Brand Text - Planorai */}
      {showText && (
        <>
          <text
            x="54"
            y="38"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="24"
            fontWeight="700"
            fill="url(#aiGradient)"
          >
            Planorai
          </text>

          {/* AI Accent Dot */}
          <circle cx="186" cy="26" r="2.5" fill="#8B5CF6">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="2.2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </>
      )}
    </svg>
  )
}

// Icon-only version for favicons and small spaces
export function PlanoraiIcon({
  size = 32,
  className = '',
}: {
  size?: number
  className?: string
}): JSX.Element {
  return <PlanoraiLogo width={size} height={size} showText={false} animated={false} className={className} />
}

export default PlanoraiLogo
