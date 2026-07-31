import { useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.5

export function ZoomableMap({ children, onZoomChange }: { children: ReactNode; onZoomChange?: () => void }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  function clampPan(next: { x: number; y: number }, z: number) {
    const bound = (z - 1) * 220
    return {
      x: Math.min(bound, Math.max(-bound, next.x)),
      y: Math.min(bound, Math.max(-bound, next.y)),
    }
  }

  function zoomIn() {
    onZoomChange?.()
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
  }
  function zoomOut() {
    onZoomChange?.()
    setZoom((z) => {
      const nz = Math.max(MIN_ZOOM, z - ZOOM_STEP)
      if (nz === MIN_ZOOM) setPan({ x: 0, y: 0 })
      return nz
    })
  }
  function zoomReset() {
    onZoomChange?.()
    setZoom(MIN_ZOOM)
    setPan({ x: 0, y: 0 })
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (zoom <= MIN_ZOOM) return
    setDragging(true)
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setPan(clampPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy }, zoom))
  }
  function onPointerUp() {
    dragRef.current = null
    setDragging(false)
  }

  return (
    <div className="relative aspect-[4/3] rounded border border-charcoal-600 overflow-hidden bg-navy-900">
      <div
        className={zoom > MIN_ZOOM ? (dragging ? 'w-full h-full cursor-grabbing' : 'w-full h-full cursor-grab') : 'w-full h-full'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="w-full h-full touch-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 200ms ease-out',
          }}
        >
          {children}
        </div>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} className="btn-secondary p-1.5 disabled:opacity-30" title="Zoom in">
          <ZoomIn size={14} />
        </button>
        <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} className="btn-secondary p-1.5 disabled:opacity-30" title="Zoom out">
          <ZoomOut size={14} />
        </button>
        <button onClick={zoomReset} disabled={zoom === MIN_ZOOM && pan.x === 0 && pan.y === 0} className="btn-secondary p-1.5 disabled:opacity-30" title="Reset view">
          <Maximize size={14} />
        </button>
      </div>
      <div className="absolute bottom-2 left-2 chip text-beige-300 pointer-events-none">{Math.round(zoom * 100)}%</div>
    </div>
  )
}
