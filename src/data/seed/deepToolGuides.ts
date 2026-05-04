import type { ToolGuideSection } from '../schema'

const today = '2026-05-03T00:00:00.000Z'

const coreGuides = [
  ['cordless-drill', 'Cordless Drill', 'Drilling', ['pilot holes', 'driving screws', 'countersinking'], ['drill bits', 'driver bits', 'countersink bit']],
  ['impact-driver', 'Impact Driver', 'Fastening', ['long screws', 'lag bolts', 'deck fasteners'], ['impact-rated bits', 'nut drivers', 'socket adapters']],
  ['circular-saw', 'Circular Saw', 'Cutting', ['straight lumber cuts', 'sheet goods', 'rough sizing'], ['fine-tooth blade', 'speed square', 'straight edge guide']],
  ['miter-saw', 'Miter Saw', 'Cutting', ['repeat crosscuts', 'trim miters', 'framing parts'], ['stop block', 'finish blade', 'dust collection adapter']],
  ['jigsaw', 'Jigsaw', 'Cutting', ['curves', 'notches', 'sink cutouts'], ['wood blades', 'metal blades', 'splinter guard']],
  ['random-orbital-sander', 'Random Orbital Sander', 'Sanding', ['surface prep', 'finish sanding', 'paint removal'], ['sanding discs', 'vacuum hose', 'interface pad']],
  ['router', 'Router', 'Routing', ['edge profiles', 'dados', 'rabbets'], ['roundover bit', 'straight bit', 'hearing protection']],
  ['shop-vac', 'Shop Vac', 'Dust Collection', ['cleanup', 'tool dust capture', 'wet pickup'], ['filter bags', 'HEPA filter', 'hose adapters']],
  ['bar-clamp', 'Bar Clamp', 'Clamping', ['glue-ups', 'holding assemblies', 'work support'], ['clamp pads', 'cauls', 'glue rags']],
  ['level', 'Level', 'Measuring', ['shelf installs', 'cabinets', 'layout'], ['pencil', 'stud finder', 'mounting hardware']],
  ['tape-measure', 'Tape Measure', 'Measuring', ['layout', 'cut lists', 'room measurement'], ['pencil', 'notebook', 'marking knife']],
  ['speed-square', 'Speed Square', 'Layout', ['square cuts', 'rafter angles', 'saw guide cuts'], ['pencil', 'circular saw', 'clamps']],
  ['multimeter', 'Multimeter', 'Electrical', ['voltage checks', 'continuity tests', 'battery checks'], ['test leads', 'alligator clips', 'fresh battery']],
  ['voltage-tester', 'Voltage Tester', 'Electrical', ['live-wire checks', 'outlet safety', 'fixture prep'], ['known-live outlet', 'flashlight', 'labels']],
  ['basin-wrench', 'Basin Wrench', 'Plumbing', ['faucet nuts', 'tight sink spaces', 'supply hardware'], ['bucket', 'work light', 'supply lines']],
  ['pipe-wrench', 'Pipe Wrench', 'Plumbing', ['threaded pipe', 'stubborn fittings', 'plumbing demo'], ['backup wrench', 'rag', 'plumber tape']],
  ['rotary-hammer', 'Rotary Hammer', 'Drilling', ['concrete anchors', 'masonry holes', 'light chipping'], ['SDS bits', 'dust control', 'hearing protection']],
  ['floor-jack', 'Floor Jack', 'Automotive', ['lifting vehicles', 'wheel service', 'inspection setup'], ['jack stands', 'wheel chocks', 'gloves']],
  ['torque-wrench', 'Torque Wrench', 'Fastening', ['lug nuts', 'critical bolts', 'repeatable tightening'], ['socket set', 'torque specs', 'storage case']],
  ['utility-knife', 'Utility Knife', 'Chiseling', ['scoring drywall', 'cutting packaging', 'trim cleanup'], ['sharp blades', 'cut-resistant surface', 'blade disposal']],
] as const

const sectionTypes: ToolGuideSection['sectionType'][] = [
  'Overview',
  'Best Uses',
  'Safety First',
  'Setup',
  'How to Use',
  'Common Mistakes',
  'Compare Similar Tools',
  'Accessories + Consumables',
  'Maintenance',
  'Practice Task',
  'Projects',
  'Buy Notes',
]

export const starterToolGuideSections: ToolGuideSection[] = coreGuides.flatMap(([toolTypeId, toolName, category, uses, accessories]) =>
  sectionTypes.map((sectionType, index) => ({
    id: `${toolTypeId}-guide-${index + 1}`,
    toolTypeId,
    title: sectionType,
    sectionType,
    sortOrder: index,
    body: guideBody(toolName, category, uses, accessories, sectionType),
    createdAt: today,
    updatedAt: today,
  })),
)

function guideBody(
  toolName: string,
  category: string,
  uses: readonly string[],
  accessories: readonly string[],
  sectionType: ToolGuideSection['sectionType'],
) {
  const joinedUses = uses.join(', ')
  const joinedAccessories = accessories.join(', ')
  const copy: Record<ToolGuideSection['sectionType'], string> = {
    Overview: `${toolName} is a core ${category.toLowerCase()} tool. Use it when the project needs ${joinedUses}. Start with controlled setup, stable work support, and a clear stop point before cutting, drilling, or fastening.`,
    'Best Uses': `Best for ${joinedUses}. It earns its keep when it saves repeated hand work, improves accuracy, or makes a common project step safer and more predictable.`,
    'Safety First': `Wear the safety gear the job calls for, keep loose material controlled, and confirm the accessory is locked in before powering up. Stop if the tool sounds strained, vibrates unusually, or the workpiece shifts.`,
    Setup: `Inspect the tool, choose the correct accessory, and test on scrap when possible. Confirm power or battery state, set depth or speed deliberately, and keep the cord, hose, or battery clear of the work path.`,
    'How to Use': `Mark the work clearly, brace the material, start gently, and let the tool do the work. Pause between passes to check accuracy instead of trying to correct everything at the end.`,
    'Common Mistakes': `Common misses include using dull accessories, skipping layout marks, forcing the tool, and ignoring dust or chip buildup. Most bad results come from setup, not from the final pass.`,
    'Compare Similar Tools': `${toolName} overlaps with nearby tools in the same family, but it is usually chosen for ${uses[0]}. A slower manual substitute can work for one-off jobs; powered or specialty options pay off when the cut, hole, or fastening pattern repeats.`,
    'Accessories + Consumables': `Keep these nearby: ${joinedAccessories}. BenchOS should treat these as blockers when the tool is owned but the project still needs a specific bit, blade, abrasive, adapter, or safety item.`,
    Maintenance: `Clean dust and residue after use, check moving parts, inspect cords or batteries, and replace worn consumables early. Store the tool with accessories removed or guarded when that is safer.`,
    'Practice Task': `Practice on scrap: make a layout mark, set the tool up, complete one controlled operation, and inspect the result. Repeat once with a deliberate improvement in support, speed, or accuracy.`,
    Projects: `${toolName} commonly appears in project templates for ${joinedUses}. It should improve project readiness when paired with the right materials, safety gear, and consumables.`,
    'Buy Notes': `Buy for the capability first, then match platform, dust collection, storage size, and accessory availability. Budget tools are fine for occasional work; balanced tiers usually make sense for repeated workshop use.`,
  }
  return copy[sectionType]
}
