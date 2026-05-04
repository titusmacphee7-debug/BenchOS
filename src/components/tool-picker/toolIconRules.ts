import {
  Anvil,
  AirVent,
  Axe,
  Bandage,
  BatteryCharging,
  Blocks,
  Brush,
  BrushCleaning,
  Cable,
  Car,
  CarFront,
  CircleDot,
  CircleGauge,
  Construction,
  CornerDownRight,
  Crosshair,
  Disc,
  Disc3,
  DraftingCompass,
  Drill,
  Droplets,
  Eraser,
  Fan,
  Filter,
  FireExtinguisher,
  Flame,
  Forklift,
  Gauge,
  Gem,
  Glasses,
  Hammer,
  Hand,
  HardHat,
  Leaf,
  Lightbulb,
  Magnet,
  MoveHorizontal,
  NotebookPen,
  Nut,
  Package,
  PaintBucket,
  PaintRoller,
  Paintbrush,
  PaintbrushVertical,
  PencilRuler,
  Pickaxe,
  Pipette,
  PlugZap,
  Plug,
  PocketKnife,
  Ratio,
  RotateCw,
  Router,
  Ruler,
  RulerDimensionLine,
  Scaling,
  Scissors,
  ScissorsLineDashed,
  ScanEye,
  ScanLine,
  ScanSearch,
  ShieldCheck,
  Shovel,
  ShowerHead,
  SprayCan,
  Sprout,
  SquareDashed,
  Table2,
  Thermometer,
  Toilet,
  Trash2,
  TriangleRight,
  Truck,
  UtilityPole,
  Volume2,
  Waves,
  WavesLadder,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { StatusTone } from '../../data/mock/types'
import type { ToolCatalogLibraryItem } from '../../data/schema'

type ToolIconInput = Pick<ToolCatalogLibraryItem, 'internalToolTypeId' | 'displayName' | 'brand' | 'powerType' | 'searchTags' | 'toolType'>

const exactToolIcons: Record<string, LucideIcon> = {
  'adjustable-wrench': Wrench,
  'air-compressor': CircleGauge,
  'air-compressor-hose': Cable,
  'air-filtration-unit': AirVent,
  'appliance-dolly': Forklift,
  'assembly-table': Table2,
  'band-saw': CircleDot,
  'bar-clamp': Wrench,
  'basin-wrench': Wrench,
  'battery-charger': BatteryCharging,
  'bench-chisel-set': Anvil,
  'bench-dogs': Blocks,
  'bench-grinder': Disc3,
  'bench-plane': TriangleRight,
  'bench-sander': Disc,
  'bench-vise': Wrench,
  'biscuit-joiner': Blocks,
  'block-plane': TriangleRight,
  'brad-nailer': Hammer,
  'belt-sander': MoveHorizontal,
  'c-clamp': Wrench,
  'caulk-gun': Pipette,
  'card-scraper': Eraser,
  'chalk-line': MoveHorizontal,
  'circular-saw': CircleDot,
  'cold-chisel': Anvil,
  'combination-square': PencilRuler,
  'conduit-bender': UtilityPole,
  'corded-drill': Drill,
  'cordless-drill': Drill,
  'corner-clamp': CornerDownRight,
  'crimping-tool': ScissorsLineDashed,
  'dado-bit-set': Blocks,
  'dado-blade-set': Disc,
  'demolition-hammer': Pickaxe,
  'detail-sander': MoveHorizontal,
  'diamond-plate': Gem,
  'digital-caliper': Scaling,
  'domino-joiner': Blocks,
  'dovetail-jig': CornerDownRight,
  'doweling-jig': CircleDot,
  'drain-snake': Waves,
  'drill-bit-set': Drill,
  'drill-press': Drill,
  'drywall-sander': Fan,
  'drywall-saw': Scissors,
  'dust-collector': Fan,
  'dust-mask': ShieldCheck,
  'dust-separator': Filter,
  'extension-cord': Cable,
  'extension-ladder': WavesLadder,
  'face-shield': ShieldCheck,
  'file-set': NotebookPen,
  'fire-extinguisher': FireExtinguisher,
  'first-aid-kit': Bandage,
  'finish-applicator-pad': PaintbrushVertical,
  'finish-nailer': Hammer,
  'fish-tape': Cable,
  'flaring-tool': Ratio,
  'floor-jack': CarFront,
  'floor-scraper': Eraser,
  'flush-trim-bit': Blocks,
  'foam-roller': PaintRoller,
  'framing-square': RulerDimensionLine,
  'f-style-clamp': Wrench,
  'garden-rake': Leaf,
  'gear-puller': RotateCw,
  'grout-saw': ScissorsLineDashed,
  'hammer-drill': Drill,
  'hand-truck': Truck,
  'handheld-power-planer': TriangleRight,
  'hearing-protection': Volume2,
  'heat-gun': Flame,
  'hedge-trimmer': Scissors,
  'honing-guide': Crosshair,
  'holdfast': Hand,
  'hole-saw-kit': CircleDot,
  'hvlp-sprayer': SprayCan,
  'impact-driver': Hammer,
  'impact-wrench': Hammer,
  'inspection-camera': ScanEye,
  'jack-stands': Construction,
  jigsaw: SquareDashed,
  jointer: TriangleRight,
  'laser-level': Crosshair,
  'laser-measure': ScanLine,
  'lawn-aerator': Sprout,
  'leaf-blower': Wind,
  level: Ruler,
  mallet: Hammer,
  'marking-gauge': Ruler,
  'masonry-bit-set': Drill,
  'masonry-trowel': HardHat,
  'metal-detector': Magnet,
  'miter-saw': CircleDot,
  'moisture-meter': Droplets,
  'mortise-chisel': Anvil,
  multimeter: Gauge,
  'obd-ii-scanner': ScanSearch,
  'oil-filter-wrench': Wrench,
  'oscillating-multi-tool': Zap,
  'outlet-tester': PlugZap,
  'paint-brush-set': Paintbrush,
  'paint-bucket': PaintBucket,
  'paint-roller-frame': PaintRoller,
  'paint-scraper': Eraser,
  'paint-sprayer': SprayCan,
  'parallel-clamp': MoveHorizontal,
  'paring-chisel': Anvil,
  'pex-crimp-tool': ScissorsLineDashed,
  'pin-nailer': Hammer,
  'pipe-clamp': Cable,
  'pipe-wrench': Wrench,
  'plunger': Toilet,
  'pocket-hole-jig': Blocks,
  'post-hole-digger': Shovel,
  'pressure-washer': ShowerHead,
  'pruning-saw': Axe,
  'putty-knife': PocketKnife,
  'quick-clamp': Hand,
  'random-orbital-sander': RotateCw,
  'reciprocating-saw': Scissors,
  respirator: ShieldCheck,
  'right-angle-drill': Drill,
  'rotary-hammer': Pickaxe,
  'rotary-tool': Zap,
  router: Router,
  'router-bit-set': Blocks,
  'router-table': Table2,
  'roundover-bit': CircleDot,
  'sanding-block': Eraser,
  'saw-blade-set': Disc,
  'sawhorse-pair': Construction,
  'safety-glasses': Glasses,
  'screwdriver-set': Wrench,
  'sharpening-stones': Gem,
  'sheet-sander': MoveHorizontal,
  shovel: Shovel,
  'shop-vac': Trash2,
  'socket-set': Nut,
  'soldering-iron': Thermometer,
  'speed-square': DraftingCompass,
  spokeshave: TriangleRight,
  'spindle-sander': Disc,
  'spring-clamp': Hand,
  'staple-gun': Hammer,
  'step-ladder': WavesLadder,
  strop: BrushCleaning,
  'string-trimmer': Scissors,
  'stud-finder': ScanSearch,
  'table-saw': Table2,
  'tack-cloth': BrushCleaning,
  tamper: Hammer,
  'tape-measure': Ruler,
  'taping-knife': PocketKnife,
  'tenoning-jig': Blocks,
  'thickness-planer': TriangleRight,
  'tile-cutter': ScissorsLineDashed,
  'tire-inflator': CircleGauge,
  'toggle-clamp': Hand,
  'track-saw': RulerDimensionLine,
  'trim-router': Blocks,
  'tubing-cutter': CircleDot,
  'utility-knife': PocketKnife,
  'vacuum-hose-kit': Cable,
  'voltage-tester': PlugZap,
  wheelbarrow: Truck,
  'wire-stripper': ScissorsLineDashed,
  'work-gloves': Hand,
  workbench: Table2,
  'work-light': Lightbulb,
}

export function toolCategoryTone(category: string): StatusTone {
  if (['Clamping', 'Safety', 'Outdoor / Yard'].includes(category)) return 'green'
  if (['Drilling', 'Measuring', 'Layout', 'Dust Collection', 'Electrical', 'Plumbing'].includes(category)) return 'blue'
  if (['Sanding', 'Routing', 'Joinery', 'Specialty'].includes(category)) return 'purple'
  if (['Fastening', 'Workbench / Holding', 'Ladders / Handling'].includes(category)) return 'yellow'
  if (['Automotive', 'Chiseling', 'Sharpening', 'Masonry / Tile / Drywall', 'Masonry'].includes(category)) return 'red'
  if (['Cutting', 'Finishing', 'Shop Equipment'].includes(category)) return 'orange'
  return 'muted'
}

export function resolveToolIcon(tool: ToolIconInput): LucideIcon {
  const exactIcon = exactToolIcons[tool.internalToolTypeId]
  if (exactIcon) return exactIcon

  const text = normalize(`${tool.displayName} ${tool.brand} ${tool.powerType} ${tool.searchTags.join(' ')} ${tool.toolType.name} ${tool.toolType.category}`)

  if (hasAny(text, ['saw blade', 'blade set', 'circular saw', 'miter saw', 'table saw', 'track saw', 'jigsaw', 'reciprocating saw', 'tile saw', 'hand saw', 'saw'])) return CircleDot
  if (hasAny(text, ['drill', 'driver bit', 'drill bit', 'boring bit', 'auger', 'hole saw'])) return Drill
  if (hasAny(text, ['impact driver', 'impact wrench', 'nailer', 'stapler', 'staple gun', 'socket', 'ratchet', 'torque', 'fasten'])) return Hammer
  if (hasAny(text, ['sander', 'sanding', 'sandpaper', 'drywall sander', 'sanding block'])) return Fan
  if (hasAny(text, ['clamp', 'vise', 'workholding'])) return Wrench
  if (hasAny(text, ['tape measure', 'level', 'square', 'caliper', 'angle finder', 'laser', 'stud finder', 'layout', 'marking'])) return Ruler
  if (hasAny(text, ['router', 'pocket hole', 'dowel', 'joiner', 'jig', 'bit set'])) return Blocks
  if (hasAny(text, ['plane', 'planer', 'spokeshave', 'scraper'])) return TriangleRight
  if (hasAny(text, ['chisel', 'knife', 'mallet'])) return Anvil
  if (hasAny(text, ['paint', 'brush', 'roller', 'sprayer', 'caulk', 'finish'])) return text.includes('roller') ? PaintRoller : Paintbrush
  if (hasAny(text, ['respirator', 'mask', 'glasses', 'hearing', 'helmet', 'first aid', 'safety'])) return ShieldCheck
  if (hasAny(text, ['shop vac', 'vacuum', 'dust', 'filter', 'hose', 'cleaning'])) return Trash2
  if (hasAny(text, ['ladder', 'dolly', 'hand truck', 'cart', 'material handling'])) return Construction
  if (hasAny(text, ['pipe', 'plumb', 'sink', 'faucet', 'drain', 'toilet', 'pex', 'hvac'])) return Droplets
  if (hasAny(text, ['electrical', 'wire', 'multimeter', 'outlet', 'voltage', 'fish tape', 'light'])) return text.includes('light') ? Lightbulb : Plug
  if (hasAny(text, ['battery charger', 'auto', 'automotive', 'oil', 'brake', 'jack', 'vehicle'])) return Car
  if (hasAny(text, ['shovel', 'rake', 'garden', 'yard', 'trimmer', 'pruner', 'hedge', 'lawn'])) return text.includes('shovel') ? Shovel : Leaf
  if (hasAny(text, ['masonry', 'concrete', 'tile', 'drywall', 'flooring', 'trowel'])) return HardHat
  if (hasAny(text, ['rotary tool', 'soldering', 'inspection camera', 'metal detector'])) return Zap
  if (hasAny(text, ['air compressor', 'pneumatic'])) return Gauge
  if (hasAny(text, ['cable', 'cord', 'extension'])) return Cable
  if (hasAny(text, ['scissors', 'snip', 'shear'])) return Scissors
  if (hasAny(text, ['glue', 'adhesive', 'applicator'])) return Pipette
  if (hasAny(text, ['axe', 'hatchet'])) return Axe
  if (hasAny(text, ['box', 'storage', 'organizer'])) return Package
  if (hasAny(text, ['brush'])) return Brush
  return Wrench
}

function hasAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle))
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
}
