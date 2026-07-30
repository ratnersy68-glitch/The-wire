import type { Location } from '../../types'
import { DISTRICTS } from '../../data/locations'

const TYPE_COLOR: Record<Location['type'], string> = {
  corner: '#a13d3d',
  apartment: '#9c7248',
  restaurant: '#c9b98f',
  convenience_store: '#c9b98f',
  vacant_house: '#6e5138',
  police_hq: '#4ade80',
  courthouse: '#4ade80',
  school: '#7aa2c9',
  warehouse: '#9c7248',
  nightclub: '#a13d3d',
  auto_shop: '#c9b98f',
  church: '#ddd0ae',
  waterfront: '#7aa2c9',
}

export function CityMapSVG({
  locations,
  selectedId,
  onSelect,
}: {
  locations: Location[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full bg-navy-900 rounded border border-charcoal-600">
      <rect x={0} y={0} width={100} height={100} fill="#0f1620" />
      {DISTRICTS.map((d) => (
        <g key={d.name}>
          <rect
            x={d.x}
            y={d.y}
            width={d.w}
            height={d.h}
            rx={2}
            fill="#151d2b"
            stroke="#2e2e2e"
            strokeWidth={0.3}
          />
          <text x={d.x + 1.5} y={d.y + 3.5} fontSize={2.4} fill="#7a7160" fontFamily="monospace">
            {d.name.toUpperCase()}
          </text>
        </g>
      ))}

      {locations.map((loc) => {
        const discovered = loc.discovered
        const color = discovered ? TYPE_COLOR[loc.type] : '#3a3a3a'
        return (
          <g
            key={loc.id}
            transform={`translate(${loc.x}, ${loc.y})`}
            className="cursor-pointer"
            onClick={() => discovered && onSelect(loc.id)}
          >
            {selectedId === loc.id && (
              <circle r={2.6} fill="none" stroke="#4ade80" strokeWidth={0.4} className="animate-pulse" />
            )}
            <circle r={1.6} fill={color} stroke="#0a0e14" strokeWidth={0.3} opacity={discovered ? 1 : 0.5} />
            {loc.heatLevel > 7 && discovered && <circle r={2.2} fill="none" stroke="#a13d3d" strokeWidth={0.25} />}
            {discovered && (
              <text x={2.2} y={0.8} fontSize={1.8} fill="#e8dfc8" fontFamily="Georgia, serif">
                {loc.name}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
