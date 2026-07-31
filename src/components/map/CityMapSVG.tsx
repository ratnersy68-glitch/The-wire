import type { Location } from '../../types'
import { DISTRICTS } from '../../data/locations'

// Grayscale reads: brighter = more consequential/active, mid-gray = routine
// commerce/civic stops, white = department-controlled (HQ/courthouse).
const TYPE_COLOR: Record<Location['type'], string> = {
  corner: '#e5e5e0',
  apartment: '#b8b8b3',
  restaurant: '#b8b8b3',
  convenience_store: '#b8b8b3',
  vacant_house: '#8a8a85',
  police_hq: '#ffffff',
  courthouse: '#ffffff',
  school: '#b8b8b3',
  warehouse: '#8a8a85',
  nightclub: '#e5e5e0',
  auto_shop: '#b8b8b3',
  church: '#b8b8b3',
  waterfront: '#8a8a85',
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
      <rect x={0} y={0} width={100} height={100} fill="#0e0e0e" />
      {DISTRICTS.map((d) => (
        <g key={d.name}>
          <rect
            x={d.x}
            y={d.y}
            width={d.w}
            height={d.h}
            rx={2}
            fill="#151515"
            stroke="#2e2e2e"
            strokeWidth={0.3}
          />
          <text x={d.x + 1.5} y={d.y + 3.5} fontSize={2.4} fill="#7a7a75" fontFamily="monospace">
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
              <circle r={2.6} fill="none" stroke="#f0f0ec" strokeWidth={0.4} className="animate-pulse" />
            )}
            <circle r={1.6} fill={color} stroke="#0a0a0a" strokeWidth={0.3} opacity={discovered ? 1 : 0.5} />
            {loc.heatLevel > 7 && discovered && <circle r={2.2} fill="none" stroke="#a13d3d" strokeWidth={0.25} />}
            {discovered && (
              <text x={2.2} y={0.8} fontSize={1.8} fill="#e8e8e4" fontFamily="Georgia, serif">
                {loc.name}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
