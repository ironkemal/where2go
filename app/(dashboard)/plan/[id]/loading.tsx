export default function PlanLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <SkeletonBlock width={60} height={26} radius={8} style={{ marginBottom: 10 }} />
          <SkeletonBlock width={220} height={26} radius={8} style={{ marginBottom: 8 }} />
          <SkeletonBlock width={140} height={16} radius={6} />
        </div>
        <SkeletonBlock width={120} height={36} radius={10} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 20,
        }}
        className="loading-layout"
      >
        <SkeletonBlock
          width="100%"
          height={260}
          radius={16}
          className="map-skeleton"
          style={{ minHeight: 260 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonBlock width={80} height={14} radius={4} style={{ marginBottom: 4 }} />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                background: 'rgba(30,41,59,0.5)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                opacity: 1 - i * 0.2,
              }}
            >
              <SkeletonBlock width={36} height={36} radius={18} />
              <div style={{ flex: 1 }}>
                <SkeletonBlock width="70%" height={16} radius={6} style={{ marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <SkeletonBlock width={60} height={12} radius={5} />
                  <SkeletonBlock width={44} height={12} radius={5} />
                  <SkeletonBlock width={36} height={12} radius={5} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(10,16,30,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 20 }}>
          <SkeletonBlock width={80} height={32} radius={8} />
          <SkeletonBlock width={80} height={32} radius={8} />
          <SkeletonBlock width={80} height={32} radius={8} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SkeletonBlock width={90} height={38} radius={10} />
          <SkeletonBlock width={120} height={38} radius={10} />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @media (min-width: 768px) {
          .loading-layout {
            grid-template-columns: 2fr 3fr !important;
          }
          .map-skeleton {
            min-height: 500px !important;
            height: 100% !important;
            position: sticky !important;
            top: 0 !important;
            align-self: start !important;
          }
        }
      `}</style>
    </div>
  )
}

function SkeletonBlock({
  width,
  height,
  radius = 8,
  style,
  className,
}: {
  width: number | string
  height: number | string
  radius?: number
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, rgba(30,41,59,0.6) 25%, rgba(51,65,85,0.4) 50%, rgba(30,41,59,0.6) 75%)',
        backgroundSize: '800px 100%',
        animation: 'shimmer 1.6s infinite linear',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
