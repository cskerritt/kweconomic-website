interface Stat { label: string; value: string; }
interface StatBarProps { stats: Stat[]; }

export default function StatBar({ stats }: StatBarProps) {
  return (
    <div className="bg-navy-dark py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-2xl md:text-3xl font-bold text-amber">{stat.value}</div>
              <div className="text-xs md:text-sm text-neutral-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
