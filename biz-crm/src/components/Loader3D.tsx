export function Loader3D({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`loader3d-scene ${sizeClasses[size]}`}>
        <div className="loader3d-glow" />
        <div className="loader3d-orbit loader3d-orbit-a">
          <div className="loader3d-ring loader3d-ring-a" />
        </div>
        <div className="loader3d-orbit loader3d-orbit-b">
          <div className="loader3d-ring loader3d-ring-b" />
        </div>
        <div className="loader3d-core" />
      </div>
    </div>
  );
}

export function FullPageLoader3D() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm px-4">
      <Loader3D size="lg" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse text-center">
        Yuklanmoqda...
      </p>
    </div>
  );
}
