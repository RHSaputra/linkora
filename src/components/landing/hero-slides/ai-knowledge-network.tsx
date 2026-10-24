"use client"

import React, { useEffect, useRef } from "react"

interface AiKnowledgeNetworkProps {
  isActive?: boolean
}

/**
 * Closed-form Cubic Bezier point calculation (Zero DOM queries, 0ms lag)
 */
function getCubicBezierPoint(
  t: number,
  sx: number,
  sy: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  ex: number,
  ey: number
) {
  const mt = 1 - t
  const mt2 = mt * mt
  const mt3 = mt2 * mt
  const t2 = t * t
  const t3 = t2 * t

  const x = mt3 * sx + 3 * mt2 * t * c1x + 3 * mt * t2 * c2x + t3 * ex
  const y = mt3 * sy + 3 * mt2 * t * c1y + 3 * mt * t2 * c2y + t3 * ey
  return { x, y }
}

/**
 * 7 Unique Supporting Cards Configuration
 */
const CARDS_CONFIG = [
  {
    id: "dokumen",
    title: "Dokumen",
    tint: "blue" as const,
    staggerIndex: 0,
    desktopOffset: { dx: -0.70, dy: -0.76 },
    mobileOffset:  { dx: -0.66, dy: -0.88 },
    hubPort:       { side: "top-left", rx: -0.68, ry: -0.98 },
    cardPort:      { side: "right",    rx:  1.0,  ry: -0.18 },
    waypointRatio: 0.56,
    lineWidths:    ["84%", "62%"],
    hasBullets:    true,
    hasThumbnail:  false,
    iconSvg: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    id: "artikel",
    title: "Artikel",
    tint: "violet" as const,
    staggerIndex: 1,
    desktopOffset: { dx:  0.84, dy: -0.82 },
    mobileOffset:  { dx:  0.66, dy: -0.88 },
    hubPort:       { side: "top-right", rx:  0.72, ry: -0.98 },
    cardPort:      { side: "left",      rx: -1.0,  ry:  0.12 },
    waypointRatio: 0.52,
    lineWidths:    ["92%", "74%"],
    hasBullets:    false,
    hasThumbnail:  true,
    iconSvg: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="14" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    ),
  },
  {
    id: "catatan",
    title: "Catatan",
    tint: "blue" as const,
    staggerIndex: 2,
    desktopOffset: { dx: -1.04, dy: -0.12 },
    mobileOffset:  { dx: -0.74, dy: -0.26 },
    hubPort:       { side: "left",  rx: -1.0, ry: -0.12 },
    cardPort:      { side: "right", rx:  1.0, ry: -0.05 },
    waypointRatio: 0.62,
    lineWidths:    ["86%", "65%"],
    hasBullets:    true,
    hasThumbnail:  false,
    iconSvg: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    id: "ringkasan",
    title: "Ringkasan",
    tint: "violet" as const,
    staggerIndex: 3,
    desktopOffset: { dx:  1.12, dy: -0.06 },
    mobileOffset:  { dx:  0.74, dy: -0.26 },
    hubPort:       { side: "right", rx:  1.0, ry: -0.10 },
    cardPort:      { side: "left",  rx: -1.0, ry:  0.05 },
    waypointRatio: 0.45,
    lineWidths:    ["88%", "68%"],
    hasBullets:    true,
    hasThumbnail:  false,
    iconSvg: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="4.5" cy="6" r="1.2" fill="currentColor" />
        <circle cx="4.5" cy="12" r="1.2" fill="currentColor" />
        <circle cx="4.5" cy="18" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "tautan",
    title: "Tautan",
    tint: "blue" as const,
    staggerIndex: 4,
    desktopOffset: { dx: -0.88, dy:  0.52 },
    mobileOffset:  { dx: -0.70, dy:  0.38 },
    hubPort:       { side: "bottom-left", rx: -0.92, ry:  0.65 },
    cardPort:      { side: "right",       rx:  1.0,  ry:  0.15 },
    waypointRatio: 0.42,
    lineWidths:    ["82%", "60%"],
    hasBullets:    true,
    hasThumbnail:  false,
    iconSvg: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    id: "roadmap",
    title: "Roadmap",
    tint: "blue" as const,
    staggerIndex: 5,
    desktopOffset: { dx: -0.02, dy:  0.86 },
    mobileOffset:  { dx: -0.36, dy:  0.96 },
    hubPort:       { side: "bottom", rx: -0.08, ry:  1.0 },
    cardPort:      { side: "top",    rx: -0.10, ry: -1.0 },
    waypointRatio: 0.50,
    lineWidths:    ["86%", "64%"],
    hasBullets:    true,
    hasThumbnail:  false,
    iconSvg: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="3" width="6" height="5" rx="1" />
        <rect x="3" y="16" width="5" height="5" rx="1" />
        <rect x="9.5" y="16" width="5" height="5" rx="1" />
        <rect x="16" y="16" width="5" height="5" rx="1" />
        <path d="M12 8v4m0 0H5.5v4M12 12v4m0-4h6.5v4" />
      </svg>
    ),
  },
  {
    id: "ringkasan-ai",
    title: "Ringkasan AI",
    tint: "violet" as const,
    staggerIndex: 6,
    desktopOffset: { dx:  0.96, dy:  0.66 },
    mobileOffset:  { dx:  0.54, dy:  0.92 },
    hubPort:       { side: "bottom-right", rx:  0.76, ry:  0.92 },
    cardPort:      { side: "left",         rx: -1.0,  ry:  0.08 },
    waypointRatio: 0.55,
    lineWidths:    ["88%", "70%"],
    hasBullets:    true,
    hasThumbnail:  false,
    iconSvg: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3z" />
        <path d="M19 3v3m-1.5-1.5h3" />
        <path d="M5 17v2m-1-1h2" />
      </svg>
    ),
  },
]

/**
 * Secondary neural tendrils
 */
const TENDRILS_CONFIG = [
  { id: "t1", startRx: -0.30, startRy: -1.0,  endDx: -0.32, endDy: -0.62, ctrlDx: -0.10, ctrlDy: -0.45 },
  { id: "t2", startRx:  0.36, startRy: -1.0,  endDx:  0.44, endDy: -0.66, ctrlDx:  0.18, ctrlDy: -0.48 },
  { id: "t3", startRx:  1.0,  startRy: -0.52, endDx:  0.62, endDy: -0.38, ctrlDx:  0.38, ctrlDy: -0.35 },
  { id: "t4", startRx: -1.0,  startRy:  0.28, endDx: -0.58, endDy:  0.22, ctrlDx: -0.36, ctrlDy:  0.18 },
  { id: "t5", startRx:  1.0,  startRy:  0.36, endDx:  0.64, endDy:  0.26, ctrlDx:  0.38, ctrlDy:  0.22 },
  { id: "t6", startRx: -0.45, startRy:  1.0,  endDx: -0.42, endDy:  0.60, ctrlDx: -0.26, ctrlDy:  0.42 },
]

/**
 * Ambient background depth particles
 */
const AMBIENT_ITEMS = [
  { left: "38%", top: "34%", w: 64, h: 36, rot: -4, opacity: 0.42 },
  { left: "72%", top: "16%", w: 54, h: 32, rot:  6, opacity: 0.35 },
  { left: "84%", top: "76%", w: 68, h: 42, rot:  8, opacity: 0.38 },
  { left: "54%", top: "78%", w: 46, h: 28, rot: -6, opacity: 0.32 },
  { left: "32%", top: "62%", w: 44, h: 26, rot:  3, opacity: 0.25 },
  { left: "88%", top: "32%", w: 48, h: 30, rot: -5, opacity: 0.28 },
]

interface CardGeometry {
  hubCx: number
  hubCy: number
  halfHub: number
  cardCx: number
  cardCy: number
  halfW: number
  halfH: number
  sx: number
  sy: number
  c1x: number
  c1y: number
  c2x: number
  c2y: number
  ex: number
  ey: number
}

export function AiKnowledgeNetwork({ isActive = true }: AiKnowledgeNetworkProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const networkPlaneRef = useRef<HTMLDivElement>(null)
  const hubCoreGlowRef = useRef<HTMLDivElement>(null)
  const centralHubRef = useRef<HTMLDivElement>(null)

  // Card element refs
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map())
  // SVG path element refs
  const glowPathRefs = useRef<Map<string, SVGPathElement>>(new Map())
  const mainPathRefs = useRef<Map<string, SVGPathElement>>(new Map())
  const waypointDotRefs = useRef<Map<string, SVGCircleElement>>(new Map())
  const pulseDotRefs = useRef<Map<string, SVGCircleElement>>(new Map())

  // Tendril element refs
  const tendrilPathRefs = useRef<Map<string, SVGPathElement>>(new Map())
  const tendrilDotRefs = useRef<Map<string, SVGCircleElement>>(new Map())

  // Animation & Selection State
  const stateRef = useRef({
    phase: "IDLE",
    selectedCardId: null as string | null,
    hoveredCardId: null as string | null,
    flowStartTime: 0,
    timers: [] as NodeJS.Timeout[],
    rafId: null as number | null,
    steadyStartTime: 0,
    pathLengths: new Map<string, number>(),
    tendrilLengths: new Map<string, number>(),
    geometry: new Map<string, CardGeometry>(),
  })

  // Helper to schedule and track timers
  const scheduleTimer = (fn: () => void, delayMs: number) => {
    const id = setTimeout(fn, delayMs)
    stateRef.current.timers.push(id)
    return id
  }

  const clearAllTimersAndRaf = () => {
    while (stateRef.current.timers.length > 0) {
      const t = stateRef.current.timers.pop()
      if (t) clearTimeout(t)
    }
    if (stateRef.current.rafId !== null) {
      cancelAnimationFrame(stateRef.current.rafId)
      stateRef.current.rafId = null
    }
  }

  /**
   * Builds Bezier control points and path data string
   */
  const computeBezierPoints = (
    cfg: (typeof CARDS_CONFIG)[0],
    hubCx: number,
    hubCy: number,
    halfHub: number,
    cardCx: number,
    cardCy: number,
    halfW: number,
    halfH: number,
    floatDx: number = 0,
    floatDy: number = 0
  ) => {
    const sx = hubCx + cfg.hubPort.rx * halfHub
    const sy = hubCy + cfg.hubPort.ry * halfHub
    const ex = cardCx + floatDx + cfg.cardPort.rx * halfW
    const ey = cardCy + floatDy + cfg.cardPort.ry * halfH

    const dx = ex - sx
    const dy = ey - sy

    let c1x: number, c1y: number, c2x: number, c2y: number
    if (cfg.hubPort.side === "bottom") {
      c1x = sx + dx * 0.15
      c1y = sy + dy * 0.45
      c2x = ex - dx * 0.15
      c2y = ey - dy * 0.45
    } else if (cfg.hubPort.side === "top-left" || cfg.hubPort.side === "top-right") {
      c1x = sx + dx * 0.18
      c1y = sy + dy * 0.72
      c2x = ex - dx * 0.48
      c2y = ey - dy * 0.08
    } else if (cfg.hubPort.side === "bottom-left" || cfg.hubPort.side === "bottom-right") {
      c1x = sx + dx * 0.25
      c1y = sy + dy * 0.68
      c2x = ex - dx * 0.46
      c2y = ey - dy * 0.10
    } else {
      // Horizontal S-curves for left & right cards
      c1x = sx + dx * 0.45
      c1y = sy - dy * 0.15
      c2x = sx + dx * 0.58
      c2y = ey + dy * 0.12
    }

    const pathData = `M ${sx.toFixed(2)} ${sy.toFixed(2)} C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${ex.toFixed(2)} ${ey.toFixed(2)}`
    return { sx, sy, c1x, c1y, c2x, c2y, ex, ey, pathData }
  }

  /**
   * Recalculates responsive coordinates, positions cards, and updates SVG geometry ONCE (or on resize)
   */
  const computeLayoutAndGeometry = () => {
    const rootEl = rootRef.current
    if (!rootEl) return

    const vw = rootEl.clientWidth || window.innerWidth
    const vh = rootEl.clientHeight || window.innerHeight
    const isMobile = vw < 768
    const isSmallMobile = vw < 420
    const isDesktop = vw >= 1024

    // On wide desktop (>= 1024px), place hub at 64% so left side is spacious for hero text.
    // On mobile & tablet, center the hub horizontally.
    const hubCx = isDesktop ? (vw >= 1280 ? vw * 0.65 : vw * 0.62) : vw * 0.50
    // On mobile, position hub slightly lower to leave ample room for top text.
    const hubCy = isMobile ? Math.min(vh * 0.60, vh - 180) : vh * 0.48

    // Proportional hub and card dimensions
    const hubSize = isSmallMobile ? 74 : (isMobile ? 86 : Math.min(118, Math.max(96, vw * 0.082)))
    const cardWidth  = isSmallMobile ? 132 : (isMobile ? 148 : Math.min(186, Math.max(156, vw * 0.125)))
    const cardHeight = isSmallMobile ? 54  : (isMobile ? 60  : 66)

    // Radial reach calculations
    const maxHorizontalReach = Math.min(
      hubCx - cardWidth * 0.58 - 14,
      vw - hubCx - cardWidth * 0.58 - 14
    )
    const maxVerticalReach = Math.min(
      hubCy - cardHeight * 0.65 - 32,
      vh - hubCy - cardHeight * 0.65 - 40
    )

    const spreadX = isMobile
      ? Math.max(115, Math.min(maxHorizontalReach / 0.75, 230))
      : Math.max(180, Math.min(maxHorizontalReach / 1.16, 270))

    const spreadY = isMobile
      ? Math.max(145, Math.min(maxVerticalReach / 0.96, 260))
      : Math.max(175, Math.min(maxVerticalReach / 0.86, 265))

    // Position central hub & radial glow
    const centralHubEl = centralHubRef.current
    const hubCoreGlowEl = hubCoreGlowRef.current

    if (centralHubEl) {
      centralHubEl.style.left   = `${hubCx}px`
      centralHubEl.style.top    = `${hubCy}px`
      centralHubEl.style.width  = `${hubSize}px`
      centralHubEl.style.height = `${hubSize}px`
    }

    if (hubCoreGlowEl) {
      const glowDiameter = hubSize * 3.4
      hubCoreGlowEl.style.left   = `${hubCx}px`
      hubCoreGlowEl.style.top    = `${hubCy}px`
      hubCoreGlowEl.style.width  = `${glowDiameter}px`
      hubCoreGlowEl.style.height = `${glowDiameter}px`
    }

    // Secondary Neural Tendrils
    const halfHub = hubSize / 2
    TENDRILS_CONFIG.forEach((tCfg) => {
      const pathEl = tendrilPathRefs.current.get(tCfg.id)
      const dotEl = tendrilDotRefs.current.get(tCfg.id)
      if (!pathEl || !dotEl) return

      const sx = hubCx + tCfg.startRx * halfHub
      const sy = hubCy + tCfg.startRy * halfHub
      const ex = hubCx + tCfg.endDx * spreadX
      const ey = hubCy + tCfg.endDy * spreadY
      const cx1 = hubCx + tCfg.ctrlDx * spreadX
      const cy1 = hubCy + tCfg.ctrlDy * spreadY

      const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx1.toFixed(1)} ${cy1.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
      pathEl.setAttribute("d", d)
      dotEl.setAttribute("cx", ex.toFixed(1))
      dotEl.setAttribute("cy", ey.toFixed(1))

      const len = pathEl.getTotalLength()
      stateRef.current.tendrilLengths.set(tCfg.id, len)
      pathEl.style.strokeDasharray = `${len}`
      if (
        stateRef.current.phase === "IDLE" ||
        stateRef.current.phase === "STAGE_1_HUB"
      ) {
        pathEl.style.strokeDashoffset = `${len}`
      } else {
        pathEl.style.strokeDashoffset = "0"
      }
    })

    // Compute Card positions & initial Bezier paths
    CARDS_CONFIG.forEach((cfg) => {
      const cardEl = cardRefs.current.get(cfg.id)
      const glowPath = glowPathRefs.current.get(cfg.id)
      const mainPath = mainPathRefs.current.get(cfg.id)
      const waypointDot = waypointDotRefs.current.get(cfg.id)

      if (!cardEl || !glowPath || !mainPath || !waypointDot) return

      const offset = isMobile ? cfg.mobileOffset : cfg.desktopOffset
      const cardCx = hubCx + offset.dx * spreadX
      const cardCy = hubCy + offset.dy * spreadY

      cardEl.style.width  = `${cardWidth}px`
      cardEl.style.height = `${cardHeight}px`
      cardEl.style.left   = `${cardCx}px`
      cardEl.style.top    = `${cardCy}px`

      const pts = computeBezierPoints(
        cfg,
        hubCx,
        hubCy,
        halfHub,
        cardCx,
        cardCy,
        cardWidth / 2,
        cardHeight / 2,
        0,
        0
      )

      glowPath.setAttribute("d", pts.pathData)
      mainPath.setAttribute("d", pts.pathData)

      // Query length strictly ONCE on resize and cache it
      const totalLen = mainPath.getTotalLength()
      stateRef.current.pathLengths.set(cfg.id, totalLen)

      mainPath.style.strokeDasharray = `${totalLen}`
      glowPath.style.strokeDasharray = `${totalLen}`

      // Position waypoint dot along the curve
      const wp = getCubicBezierPoint(
        cfg.waypointRatio,
        pts.sx,
        pts.sy,
        pts.c1x,
        pts.c1y,
        pts.c2x,
        pts.c2y,
        pts.ex,
        pts.ey
      )
      waypointDot.setAttribute("cx", wp.x.toFixed(2))
      waypointDot.setAttribute("cy", wp.y.toFixed(2))

      stateRef.current.geometry.set(cfg.id, {
        hubCx,
        hubCy,
        halfHub,
        cardCx,
        cardCy,
        halfW: cardWidth / 2,
        halfH: cardHeight / 2,
        sx: pts.sx,
        sy: pts.sy,
        c1x: pts.c1x,
        c1y: pts.c1y,
        c2x: pts.c2x,
        c2y: pts.c2y,
        ex: pts.ex,
        ey: pts.ey,
      })
    })
  }

  /**
   * Reset all elements to initial visual state before replaying sequence
   */
  const resetToInitialVisualState = () => {
    stateRef.current.phase = "IDLE"
    stateRef.current.selectedCardId = null
    stateRef.current.hoveredCardId = null

    const hubCoreGlowEl = hubCoreGlowRef.current
    const centralHubEl = centralHubRef.current

    if (hubCoreGlowEl) {
      hubCoreGlowEl.style.transition = "none"
      hubCoreGlowEl.classList.remove("is-visible")
    }
    if (centralHubEl) {
      centralHubEl.style.transition = "none"
      centralHubEl.classList.remove("is-visible")
    }

    // Reset tendrils
    TENDRILS_CONFIG.forEach((tCfg) => {
      const path = tendrilPathRefs.current.get(tCfg.id)
      const dot = tendrilDotRefs.current.get(tCfg.id)
      const len = stateRef.current.tendrilLengths.get(tCfg.id) || 100
      if (path) {
        path.style.transition = "none"
        path.style.opacity = "0"
        path.style.strokeDasharray = `${len}`
        path.style.strokeDashoffset = `${len}`
      }
      if (dot) {
        dot.style.transition = "none"
        dot.style.opacity = "0"
      }
    })

    // Reset cards and curves
    CARDS_CONFIG.forEach((cfg) => {
      const cardEl = cardRefs.current.get(cfg.id)
      const glowPath = glowPathRefs.current.get(cfg.id)
      const mainPath = mainPathRefs.current.get(cfg.id)
      const waypointDot = waypointDotRefs.current.get(cfg.id)
      const pulseDot = pulseDotRefs.current.get(cfg.id)
      const totalLen = stateRef.current.pathLengths.get(cfg.id) || 200

      if (cardEl) {
        cardEl.style.transition = "none"
        cardEl.classList.remove("is-visible", "is-selected", "is-highlighted", "is-dimmed")
        cardEl.style.transform = "translate(-50%, calc(-50% + 12px)) translateZ(25px) scale(0.94)"
      }

      if (glowPath) {
        glowPath.style.transition = "none"
        glowPath.style.opacity = "0"
        glowPath.style.strokeDashoffset = `${totalLen}`
      }
      if (mainPath) {
        mainPath.style.transition = "none"
        mainPath.style.opacity = "0"
        mainPath.style.strokeDashoffset = `${totalLen}`
      }
      if (waypointDot) {
        waypointDot.style.transition = "none"
        waypointDot.style.opacity = "0"
        waypointDot.style.transform = "scale(0.3)"
      }
      if (pulseDot) {
        pulseDot.style.opacity = "0"
      }
    })

    // Force reflow
    if (networkPlaneRef.current) {
      void networkPlaneRef.current.offsetWidth
    }

    // Restore smooth CSS transitions
    if (hubCoreGlowEl) hubCoreGlowEl.style.transition = ""
    if (centralHubEl) centralHubEl.style.transition = ""
    CARDS_CONFIG.forEach((cfg) => {
      const cardEl = cardRefs.current.get(cfg.id)
      if (cardEl) cardEl.style.transition = ""
    })
  }

  /**
   * Coordinated 3-Stage Animation Sequence
   */
  const playCoordinatedSequence = () => {
    clearAllTimersAndRaf()
    resetToInitialVisualState()

    // STAGE 1: Central Hub & Core Glow (0ms - 650ms)
    scheduleTimer(() => {
      stateRef.current.phase = "STAGE_1_HUB"
      hubCoreGlowRef.current?.classList.add("is-visible")
      centralHubRef.current?.classList.add("is-visible")
    }, 40)

    // STAGE 2: Connection Lines Outward (450ms - 1250ms)
    scheduleTimer(() => {
      stateRef.current.phase = "STAGE_2_LINES"

      // Secondary tendrils
      TENDRILS_CONFIG.forEach((tCfg, idx) => {
        const path = tendrilPathRefs.current.get(tCfg.id)
        const dot = tendrilDotRefs.current.get(tCfg.id)
        const delay = idx * 35
        if (path) {
          path.style.transition = `stroke-dashoffset 0.72s var(--ease-out-expo) ${delay}ms, opacity 0.35s var(--ease-out-expo) ${delay}ms`
          path.style.opacity = "1"
          path.style.strokeDashoffset = "0"
        }
        if (dot) {
          dot.style.transition = `opacity 0.4s var(--ease-out-expo) ${delay + 420}ms`
          dot.style.opacity = "0.85"
        }
      })

      // Primary connection paths
      CARDS_CONFIG.forEach((cfg) => {
        const glowPath = glowPathRefs.current.get(cfg.id)
        const mainPath = mainPathRefs.current.get(cfg.id)
        const waypointDot = waypointDotRefs.current.get(cfg.id)

        const staggerMs = cfg.staggerIndex * 45
        const drawDurationMs = 680

        if (glowPath) {
          glowPath.style.transition = `stroke-dashoffset ${drawDurationMs}ms var(--ease-out-expo) ${staggerMs}ms, opacity 0.35s var(--ease-out-expo) ${staggerMs}ms`
          glowPath.style.opacity = "0.85"
          glowPath.style.strokeDashoffset = "0"
        }
        if (mainPath) {
          mainPath.style.transition = `stroke-dashoffset ${drawDurationMs}ms var(--ease-out-expo) ${staggerMs}ms, opacity 0.35s var(--ease-out-expo) ${staggerMs}ms`
          mainPath.style.opacity = "1"
          mainPath.style.strokeDashoffset = "0"
        }
        if (waypointDot) {
          const dotDelayMs = staggerMs + Math.round(drawDurationMs * cfg.waypointRatio)
          waypointDot.style.transition = `opacity 0.38s var(--ease-out-expo) ${dotDelayMs}ms, transform 0.38s var(--ease-out-expo) ${dotDelayMs}ms`
          waypointDot.style.opacity = "1"
          waypointDot.style.transform = "scale(1)"
        }
      })
    }, 450)

    // STAGE 3: Supporting Cards Stagger In (950ms - 1750ms)
    scheduleTimer(() => {
      stateRef.current.phase = "STAGE_3_CARDS"

      CARDS_CONFIG.forEach((cfg) => {
        const cardEl = cardRefs.current.get(cfg.id)
        const staggerMs = cfg.staggerIndex * 55
        scheduleTimer(() => {
          if (cardEl) {
            cardEl.classList.add("is-visible")
            cardEl.style.transform = "translate(-50%, -50%) translateZ(25px) scale(1)"
          }
        }, staggerMs)
      })
    }, 950)

    // STAGE 4: Steady State (Continuous 60FPS Micro-Float + Data Pulses)
    scheduleTimer(() => {
      stateRef.current.phase = "STEADY"
      stateRef.current.steadyStartTime = performance.now()

      CARDS_CONFIG.forEach((cfg) => {
        const cardEl = cardRefs.current.get(cfg.id)
        if (cardEl) {
          cardEl.style.transition =
            "opacity 0.25s var(--ease-out-expo), border-color 0.25s var(--ease-out-expo), box-shadow 0.25s var(--ease-out-expo)"
        }
      })

      startSteadyStateLoop()
    }, 1800)
  }

  /**
   * Ultra-smooth 60FPS loop with pure closed-form arithmetic (Zero Layout Thrashing)
   */
  const startSteadyStateLoop = () => {
    if (stateRef.current.rafId !== null) {
      cancelAnimationFrame(stateRef.current.rafId)
    }

    const tick = (now: number) => {
      if (stateRef.current.phase !== "STEADY") return

      const elapsedSec = (now - stateRef.current.steadyStartTime) / 1000
      const activeCardId =
        stateRef.current.selectedCardId || stateRef.current.hoveredCardId

      CARDS_CONFIG.forEach((cfg) => {
        const cardEl = cardRefs.current.get(cfg.id)
        const glowPath = glowPathRefs.current.get(cfg.id)
        const mainPath = mainPathRefs.current.get(cfg.id)
        const pulseDot = pulseDotRefs.current.get(cfg.id)
        const geom = stateRef.current.geometry.get(cfg.id)

        if (!geom || !cardEl) return

        const isSelected = stateRef.current.selectedCardId === cfg.id
        const isActive = activeCardId === cfg.id
        const phaseOffset = cfg.staggerIndex * 0.95
        const ramp = Math.min(1, elapsedSec / 0.6)

        // Float micro-offsets
        const floatDx = Math.cos(elapsedSec * 1.15 + phaseOffset) * 1.4 * ramp
        const floatDy = Math.sin(elapsedSec * 1.45 + phaseOffset) * 3.0 * ramp

        // Elevated Z depth so right-side cards never sink behind 3D planes
        const zElevation = isSelected ? 50 : isActive ? 35 : 25
        const scaleVal = isSelected ? 1.07 : isActive ? 1.04 : 1.0

        cardEl.style.transform = `translate(calc(-50% + ${floatDx.toFixed(1)}px), calc(-50% + ${floatDy.toFixed(1)}px)) translateZ(${zElevation}px) scale(${scaleVal})`

        // Fast closed-form path update with floating card endpoint
        const curEx = geom.ex + floatDx
        const curEy = geom.ey + floatDy
        const pathData = `M ${geom.sx.toFixed(1)} ${geom.sy.toFixed(1)} C ${geom.c1x.toFixed(1)} ${geom.c1y.toFixed(1)}, ${geom.c2x.toFixed(1)} ${geom.c2y.toFixed(1)}, ${curEx.toFixed(1)} ${curEy.toFixed(1)}`

        if (glowPath) glowPath.setAttribute("d", pathData)
        if (mainPath) mainPath.setAttribute("d", pathData)

        // Data pulse particles
        if (pulseDot) {
          // If selected, pulse speed is 2.5x faster with full brightness
          const cycleDuration = isSelected ? 1.3 : 3.2
          const rawProgress =
            ((elapsedSec + cfg.staggerIndex * 0.42) % cycleDuration) / cycleDuration

          if (rawProgress <= 0.82) {
            const normT = rawProgress / 0.82
            const easedT =
              normT < 0.5
                ? 2 * normT * normT
                : 1 - Math.pow(-2 * normT + 2, 2) / 2

            // Instant closed-form point without calling SVG engine
            const pt = getCubicBezierPoint(
              easedT,
              geom.sx,
              geom.sy,
              geom.c1x,
              geom.c1y,
              geom.c2x,
              geom.c2y,
              curEx,
              curEy
            )

            pulseDot.setAttribute("cx", pt.x.toFixed(1))
            pulseDot.setAttribute("cy", pt.y.toFixed(1))

            const edgeFade = Math.sin(normT * Math.PI)
            const highlightBoost = isSelected
              ? 1.0
              : isActive
              ? 0.95
              : activeCardId
              ? 0.15
              : 0.85
            pulseDot.style.opacity = (edgeFade * highlightBoost).toFixed(2)
          } else {
            pulseDot.style.opacity = "0"
          }
        }
      })

      stateRef.current.rafId = requestAnimationFrame(tick)
    }

    stateRef.current.rafId = requestAnimationFrame(tick)
  }

  /**
   * Visual state styling for selected/hovered card
   */
  const applyCardHighlight = (activeId: string | null) => {
    CARDS_CONFIG.forEach((cfg) => {
      const cardEl = cardRefs.current.get(cfg.id)
      const glowPath = glowPathRefs.current.get(cfg.id)
      const mainPath = mainPathRefs.current.get(cfg.id)
      const waypointDot = waypointDotRefs.current.get(cfg.id)

      if (!cardEl || !glowPath || !mainPath || !waypointDot) return

      if (!activeId) {
        // Normal resting state
        cardEl.classList.remove("is-selected", "is-highlighted", "is-dimmed")
        glowPath.style.opacity = "0.85"
        glowPath.setAttribute("stroke-width", "5")
        mainPath.style.opacity = "1"
        mainPath.setAttribute("stroke-width", "2")
        waypointDot.style.opacity = "1"
        waypointDot.style.transform = "scale(1)"
      } else if (cfg.id === activeId) {
        // Active / Selected card
        const isSelected = stateRef.current.selectedCardId === cfg.id
        if (isSelected) {
          cardEl.classList.add("is-selected")
          cardEl.classList.remove("is-highlighted", "is-dimmed")
        } else {
          cardEl.classList.add("is-highlighted")
          cardEl.classList.remove("is-selected", "is-dimmed")
        }
        glowPath.style.opacity = "1"
        glowPath.setAttribute("stroke-width", isSelected ? "9.5" : "7.5")
        mainPath.style.opacity = "1"
        mainPath.setAttribute("stroke-width", isSelected ? "3.2" : "2.6")
        waypointDot.style.opacity = "1"
        waypointDot.style.transform = isSelected ? "scale(1.5)" : "scale(1.2)"
      } else {
        // Inactive cards dimmed
        cardEl.classList.remove("is-selected", "is-highlighted")
        cardEl.classList.add("is-dimmed")
        glowPath.style.opacity = "0.15"
        glowPath.setAttribute("stroke-width", "3.5")
        mainPath.style.opacity = "0.2"
        mainPath.setAttribute("stroke-width", "1.2")
        waypointDot.style.opacity = "0.2"
        waypointDot.style.transform = "scale(0.8)"
      }
    })
  }

  /**
   * Card Click Handler: Instant flow activation, toggles selection
   */
  const handleCardClick = (cardId: string) => {
    // If currently selected card is clicked, deselect and return to resting state
    if (stateRef.current.selectedCardId === cardId) {
      stateRef.current.selectedCardId = null
      stateRef.current.hoveredCardId = null
      applyCardHighlight(null)
      return
    }

    // Lock selection on clicked card
    stateRef.current.selectedCardId = cardId
    stateRef.current.hoveredCardId = null
    stateRef.current.flowStartTime = performance.now()
    applyCardHighlight(cardId)
  }

  const handleCardHover = (cardId: string) => {
    // If a card is already locked via click, hover preview is disabled
    if (stateRef.current.selectedCardId !== null) return
    stateRef.current.hoveredCardId = cardId
    applyCardHighlight(cardId)
  }

  const handleCardLeave = (cardId: string) => {
    // Never dismiss an active click selection on mouseleave
    if (stateRef.current.selectedCardId !== null) return
    if (stateRef.current.hoveredCardId === cardId) {
      stateRef.current.hoveredCardId = null
      applyCardHighlight(null)
    }
  }

  // Handle Mount, Resize, and Activation
  useEffect(() => {
    computeLayoutAndGeometry()

    let resizeRaf: number | null = null
    const handleResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        computeLayoutAndGeometry()
      })
    }

    window.addEventListener("resize", handleResize)

    const observer = new ResizeObserver(() => {
      handleResize()
    })
    if (rootRef.current) {
      observer.observe(rootRef.current)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      clearAllTimersAndRaf()
    }
  }, [])

  // Replay sequence whenever slide becomes active
  useEffect(() => {
    if (isActive) {
      computeLayoutAndGeometry()
      playCoordinatedSequence()
    } else {
      clearAllTimersAndRaf()
    }
    return () => {
      clearAllTimersAndRaf()
    }
  }, [isActive])

  return (
    <div
      ref={rootRef}
      className="ai-knowledge-network-root"
      onClick={() => {
        stateRef.current.selectedCardId = null
        stateRef.current.hoveredCardId = null
        applyCardHighlight(null)
      }}
    >
      {/* Scoped CSS Styles */}
      <style jsx>{`
        .ai-knowledge-network-root {
          --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
          --bg-deep: #020617;
          --bg-sapphire: #051136;
          --glow-primary: #2563eb;
          --glow-cyan: #38bdf8;
          --glow-indigo: #6366f1;
          --glow-violet: #8b5cf6;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background:
            radial-gradient(circle at 65% 50%, rgba(29, 78, 216, 0.36) 0%, rgba(15, 23, 42, 0) 58%),
            radial-gradient(circle at 67% 50%, rgba(56, 189, 248, 0.18) 0%, rgba(2, 6, 23, 0) 38%),
            linear-gradient(125deg, #010411 0%, #030b24 45%, #06143d 78%, #020718 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .ai-knowledge-network-root {
            background:
              radial-gradient(circle at 50% 50%, rgba(29, 78, 216, 0.36) 0%, rgba(15, 23, 42, 0) 65%),
              linear-gradient(145deg, #010411 0%, #040e2d 55%, #020718 100%);
          }
        }

        /* Ambient Background Depth Layer */
        .ambient-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .bg-blur-card {
          position: absolute;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(30, 64, 175, 0.04));
          border: 1px solid rgba(96, 165, 250, 0.12);
          filter: blur(3.5px);
          transform-origin: center;
          will-change: transform, opacity;
        }

        /* Perspective Stage */
        .network-perspective-host {
          position: relative;
          width: 100%;
          height: 100%;
          perspective: 1400px;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .network-plane {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.7s var(--ease-out-expo);
          will-change: transform;
          transform: rotateY(-7deg) rotateX(2.5deg);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .network-plane {
            transform: rotateY(-3deg) rotateX(1.5deg);
          }
        }

        /* Central Radial Backlight */
        .hub-core-glow {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0.75);
          opacity: 0;
          background: radial-gradient(
            circle,
            rgba(96, 165, 250, 0.52) 0%,
            rgba(59, 130, 246, 0.32) 28%,
            rgba(79, 70, 229, 0.14) 55%,
            rgba(2, 6, 23, 0) 75%
          );
          filter: blur(18px);
          transition:
            opacity 0.65s var(--ease-out-expo),
            transform 0.65s var(--ease-out-expo);
          z-index: 2;
          will-change: transform, opacity;
        }

        .hub-core-glow.is-visible {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        /* SVG Connection Layer */
        .connections-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
          z-index: 4;
        }

        /* Central Hub Element */
        .central-hub {
          position: absolute;
          z-index: 30;
          transform: translate(-50%, -50%) translateZ(35px) scale(0.82);
          opacity: 0;
          border-radius: 22px;
          background: linear-gradient(145deg, rgba(37, 99, 235, 0.45) 0%, rgba(30, 58, 138, 0.70) 55%, rgba(49, 46, 129, 0.75) 100%);
          border: 1.5px solid rgba(147, 197, 253, 0.85);
          box-shadow:
            0 0 28px rgba(59, 130, 246, 0.75),
            0 0 64px rgba(37, 99, 235, 0.45),
            inset 0 0 22px rgba(147, 197, 253, 0.45);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto !important;
          transition:
            opacity 0.65s var(--ease-out-expo),
            transform 0.3s var(--ease-out-expo),
            box-shadow 0.3s var(--ease-out-expo),
            border-color 0.3s var(--ease-out-expo);
          will-change: transform, opacity;
        }

        .central-hub::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 25px;
          background: linear-gradient(135deg, rgba(125, 211, 252, 0.55), rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.5));
          z-index: -1;
          filter: blur(8px);
          opacity: 0.75;
        }

        .central-hub.is-visible {
          opacity: 1;
          transform: translate(-50%, -50%) translateZ(35px) scale(1);
        }

        .central-hub:hover {
          border-color: #ffffff;
          box-shadow:
            0 0 38px rgba(96, 165, 250, 0.95),
            0 0 80px rgba(59, 130, 246, 0.65),
            inset 0 0 28px rgba(186, 230, 253, 0.65);
        }

        /* Cards Layer */
        #cardsLayer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 20;
        }

        /* Knowledge Card */
        .knowledge-card {
          position: absolute;
          z-index: 25;
          transform: translate(-50%, -50%) translateZ(25px) scale(0.94);
          opacity: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(15, 34, 84, 0.75) 0%, rgba(10, 22, 58, 0.85) 100%);
          border: 1.2px solid rgba(96, 165, 250, 0.58);
          box-shadow:
            0 8px 28px -6px rgba(2, 6, 23, 0.75),
            0 0 18px rgba(37, 99, 235, 0.34),
            inset 0 1px 12px rgba(96, 165, 250, 0.22);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 11px;
          cursor: pointer;
          pointer-events: auto !important;
          transition:
            opacity 0.45s var(--ease-out-expo),
            border-color 0.22s var(--ease-out-expo),
            box-shadow 0.22s var(--ease-out-expo),
            background 0.22s var(--ease-out-expo);
          will-change: transform, opacity;
        }

        .knowledge-card[data-tint="violet"] {
          background: linear-gradient(135deg, rgba(30, 27, 94, 0.75) 0%, rgba(19, 18, 64, 0.85) 100%);
          border-color: rgba(139, 92, 246, 0.68);
          box-shadow:
            0 8px 28px -6px rgba(2, 6, 23, 0.78),
            0 0 20px rgba(124, 58, 237, 0.36),
            inset 0 1px 12px rgba(167, 139, 250, 0.24);
        }

        .knowledge-card.is-visible {
          opacity: 1;
        }

        /* Hover Preview State */
        .knowledge-card.is-highlighted {
          border-color: rgba(186, 230, 253, 0.98);
          box-shadow:
            0 12px 34px -6px rgba(2, 6, 23, 0.85),
            0 0 28px rgba(56, 189, 248, 0.65),
            inset 0 0 18px rgba(125, 211, 252, 0.38);
          z-index: 35 !important;
        }

        .knowledge-card[data-tint="violet"].is-highlighted {
          border-color: rgba(221, 214, 254, 0.98);
          box-shadow:
            0 12px 34px -6px rgba(2, 6, 23, 0.85),
            0 0 28px rgba(167, 139, 250, 0.7),
            inset 0 0 18px rgba(196, 181, 253, 0.42);
        }

        /* Locked Selected State (Triggered on Click) */
        .knowledge-card.is-selected {
          z-index: 50 !important;
          border-color: #ffffff !important;
          background: linear-gradient(135deg, rgba(29, 78, 216, 0.85) 0%, rgba(30, 58, 138, 0.92) 100%) !important;
          box-shadow:
            0 16px 42px -4px rgba(2, 6, 23, 0.92),
            0 0 35px rgba(56, 189, 248, 0.95),
            0 0 70px rgba(37, 99, 235, 0.65),
            inset 0 0 22px rgba(186, 230, 253, 0.6) !important;
        }

        .knowledge-card[data-tint="violet"].is-selected {
          border-color: #ffffff !important;
          background: linear-gradient(135deg, rgba(88, 28, 135, 0.85) 0%, rgba(46, 16, 101, 0.92) 100%) !important;
          box-shadow:
            0 16px 42px -4px rgba(2, 6, 23, 0.92),
            0 0 35px rgba(167, 139, 250, 0.95),
            0 0 70px rgba(124, 58, 237, 0.65),
            inset 0 0 22px rgba(221, 214, 254, 0.6) !important;
        }

        .knowledge-card.is-dimmed {
          opacity: 0.32 !important;
        }

        .card-icon-box {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.14);
          border: 1px solid rgba(147, 197, 253, 0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #bae6fd;
          box-shadow: inset 0 0 8px rgba(56, 189, 248, 0.18);
        }

        .knowledge-card[data-tint="violet"] .card-icon-box {
          background: rgba(139, 92, 246, 0.16);
          border-color: rgba(196, 181, 253, 0.32);
          color: #ddd6fe;
        }

        .card-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .card-title {
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: #f0f9ff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 0 10px rgba(147, 197, 253, 0.45);
          line-height: 1.2;
        }

        .skeleton-rows {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .skeleton-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .skeleton-dot {
          width: 4.5px;
          height: 4.5px;
          border-radius: 50%;
          background: #93c5fd;
          box-shadow: 0 0 6px rgba(147, 197, 253, 0.8);
          flex-shrink: 0;
        }

        .skeleton-bar {
          height: 5px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(147, 197, 253, 0.58) 0%, rgba(96, 165, 250, 0.25) 100%);
        }

        .article-thumb {
          flex-shrink: 0;
          width: 30px;
          height: 36px;
          border-radius: 6px;
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.26) 0%, rgba(99, 102, 241, 0.42) 100%);
          border: 1px solid rgba(147, 197, 253, 0.35);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4px;
          overflow: hidden;
        }

        /* SVG Paths */
        .conn-glow-path {
          fill: none;
          stroke-linecap: round;
          filter: blur(4px);
          transition: opacity 0.25s var(--ease-out-expo), stroke-width 0.25s var(--ease-out-expo);
        }

        .conn-main-path {
          fill: none;
          stroke-linecap: round;
          transition: opacity 0.25s var(--ease-out-expo), stroke-width 0.25s var(--ease-out-expo);
        }

        .conn-tendril-path {
          fill: none;
          stroke-linecap: round;
        }

        .conn-node-dot {
          transition: opacity 0.25s var(--ease-out-expo), transform 0.25s var(--ease-out-expo);
          transform-box: fill-box;
          transform-origin: center;
        }
      `}</style>

      {/* Decorative Ambient Depth Layer */}
      <div className="ambient-layer" aria-hidden="true">
        {AMBIENT_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="bg-blur-card"
            style={{
              left: item.left,
              top: item.top,
              width: `${item.w}px`,
              height: `${item.h}px`,
              opacity: item.opacity,
              transform: `translate(-50%, -50%) rotate(${item.rot}deg)`,
            }}
          />
        ))}
      </div>

      {/* 3D Perspective Stage Host */}
      <div className="network-perspective-host">
        <div ref={networkPlaneRef} className="network-plane">
          {/* Central Core Radial Backlight */}
          <div ref={hubCoreGlowRef} className="hub-core-glow" />

          {/* SVG Connections & Tendrils Layer */}
          <svg className="connections-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad-left" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#3b82f6" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="grad-right" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#6366f1" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.92" />
              </linearGradient>
              <linearGradient id="grad-bottom" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
              </linearGradient>
              <radialGradient id="pulse-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="45%" stopColor="#7dd3fc" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Group 1: Tendrils */}
            <g id="tendrilsGroup">
              {TENDRILS_CONFIG.map((t) => (
                <path
                  key={t.id}
                  ref={(el) => {
                    if (el) tendrilPathRefs.current.set(t.id, el)
                    else tendrilPathRefs.current.delete(t.id)
                  }}
                  className="conn-tendril-path"
                  stroke="rgba(96, 165, 250, 0.38)"
                  strokeWidth="1.25"
                  style={{ opacity: 0 }}
                />
              ))}
            </g>

            {/* Group 2: Glow Paths */}
            <g id="glowPathsGroup">
              {CARDS_CONFIG.map((c) => (
                <path
                  key={`glow-${c.id}`}
                  ref={(el) => {
                    if (el) glowPathRefs.current.set(c.id, el)
                    else glowPathRefs.current.delete(c.id)
                  }}
                  className="conn-glow-path"
                  stroke={c.tint === "violet" ? "rgba(139, 92, 246, 0.55)" : "rgba(59, 130, 246, 0.55)"}
                  strokeWidth="5"
                  style={{ opacity: 0 }}
                />
              ))}
            </g>

            {/* Group 3: Main Crisp Paths */}
            <g id="mainPathsGroup">
              {CARDS_CONFIG.map((c) => {
                const gradId =
                  c.hubPort.rx < -0.25
                    ? "url(#grad-left)"
                    : c.hubPort.rx > 0.25
                    ? "url(#grad-right)"
                    : "url(#grad-bottom)"
                return (
                  <path
                    key={`main-${c.id}`}
                    ref={(el) => {
                      if (el) mainPathRefs.current.set(c.id, el)
                      else mainPathRefs.current.delete(c.id)
                    }}
                    className="conn-main-path"
                    stroke={gradId}
                    strokeWidth="2"
                    style={{ opacity: 0 }}
                  />
                )
              })}
            </g>

            {/* Group 4: Waypoint Dots & Traveling Pulses */}
            <g id="nodesAndPulsesGroup">
              {/* Tendril End Dots */}
              {TENDRILS_CONFIG.map((t) => (
                <circle
                  key={`tdot-${t.id}`}
                  ref={(el) => {
                    if (el) tendrilDotRefs.current.set(t.id, el)
                    else tendrilDotRefs.current.delete(t.id)
                  }}
                  r="2.6"
                  fill="#93c5fd"
                  style={{ filter: "drop-shadow(0 0 6px #60a5fa)", opacity: 0 }}
                />
              ))}
              {/* Card Waypoint Dots */}
              {CARDS_CONFIG.map((c) => (
                <circle
                  key={`dot-${c.id}`}
                  ref={(el) => {
                    if (el) waypointDotRefs.current.set(c.id, el)
                    else waypointDotRefs.current.delete(c.id)
                  }}
                  className="conn-node-dot"
                  r="3.3"
                  fill="#e0f2fe"
                  style={{ filter: "drop-shadow(0 0 8px #38bdf8)", opacity: 0 }}
                />
              ))}
              {/* Traveling Pulse Dots */}
              {CARDS_CONFIG.map((c) => (
                <circle
                  key={`pulse-${c.id}`}
                  ref={(el) => {
                    if (el) pulseDotRefs.current.set(c.id, el)
                    else pulseDotRefs.current.delete(c.id)
                  }}
                  r="4.5"
                  fill="url(#pulse-glow)"
                  style={{ opacity: 0 }}
                />
              ))}
            </g>
          </svg>

          {/* Central Hub Element (Elemen Utama) */}
          <div
            ref={centralHubRef}
            className="central-hub"
            role="button"
            tabIndex={0}
            aria-label="Pusat Jaringan Dokumen AI"
            onClick={(e) => {
              e.stopPropagation()
              stateRef.current.selectedCardId = null
              stateRef.current.hoveredCardId = null
              applyCardHighlight(null)
            }}
          >
            <svg
              viewBox="0 0 64 64"
              className="w-3/5 h-3/5 text-sky-100 drop-shadow-[0_0_12px_rgba(186,230,253,0.85)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Document Outline with Folded Corner */}
              <path
                d="M26 48H16C13.7909 48 12 46.2091 12 44V14C12 11.7909 13.7909 10 16 10H33.1716C34.2324 10 35.2499 10.4214 36 11.1716L42.8284 18C43.5786 18.7501 44 19.7676 44 20.8284V27"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M33 10V18C33 19.6569 34.3431 21 36 21H44"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Document Content Lines */}
              <line x1="19" y1="22" x2="27" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="19" y1="29" x2="31" y2="29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="19" y1="36" x2="25" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              {/* Magnifying Glass */}
              <circle cx="40" cy="40" r="9.5" fill="rgba(30, 58, 138, 0.7)" stroke="#e0f2fe" strokeWidth="2.75" />
              <line x1="47" y1="47" x2="54" y2="54" stroke="#e0f2fe" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* 7 Unique Supporting Cards */}
          <div id="cardsLayer">
            {CARDS_CONFIG.map((cfg) => (
              <article
                key={cfg.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(cfg.id, el)
                  else cardRefs.current.delete(cfg.id)
                }}
                className="knowledge-card"
                id={`card-${cfg.id}`}
                data-card-id={cfg.id}
                data-tint={cfg.tint}
                role="button"
                tabIndex={0}
                aria-label={`Kartu ${cfg.title}`}
                onMouseEnter={() => handleCardHover(cfg.id)}
                onMouseLeave={() => handleCardLeave(cfg.id)}
                onClick={(e) => {
                  e.stopPropagation()
                  handleCardClick(cfg.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCardClick(cfg.id)
                  }
                }}
              >
                <div className="card-icon-box">{cfg.iconSvg}</div>
                <div className="card-body">
                  <h3 className="card-title">{cfg.title}</h3>
                  <div className="skeleton-rows">
                    {cfg.lineWidths.map((width, wIdx) => (
                      <div key={wIdx} className="skeleton-row">
                        {cfg.hasBullets && <span className="skeleton-dot" />}
                        <span className="skeleton-bar" style={{ width }} />
                      </div>
                    ))}
                  </div>
                </div>
                {cfg.hasThumbnail && (
                  <div className="article-thumb" aria-hidden="true">
                    <div className="w-2 h-2 rounded-full bg-sky-300/70 self-end" />
                    <svg viewBox="0 0 24 14" className="w-full h-3 text-sky-200/75" fill="currentColor">
                      <polygon points="0,14 7,5 13,11 18,7 24,14" />
                    </svg>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
