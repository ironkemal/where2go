export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #0F172A 70%, #111827 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(15,23,42,0.9) 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
      <div className="relative z-10 w-full flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  )
}
