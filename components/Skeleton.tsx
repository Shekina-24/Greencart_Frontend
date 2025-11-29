export default function Skeleton({ height = 80, width = '100%' }: { height?: number; width?: number | string }) {
  return (
    <div
      aria-hidden
      style={{
        height,
        width,
        borderRadius: 8,
        background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.09) 37%, rgba(0,0,0,0.06) 63%)',
        backgroundSize: '400% 100%',
        animation: 'gc-skeleton 1.4s ease infinite'
      }}
    />
  );
}

