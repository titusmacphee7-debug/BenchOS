import type { ToolGuideSection } from '../../data/schema'

export type GuideDepthMode = 'quick' | 'full' | 'shop-card'

export type SkillDimension = 'Safety' | 'Setup' | 'Control' | 'Accuracy' | 'Maintenance' | 'Project Use'

export type ToolRiskClass = 'Low' | 'Moderate' | 'High'

export type PracticeTask = {
  title: string
  goal: string
  material: string
  expectedResult: string
  dimensions: SkillDimension[]
  xp: number
}

export type ToolMasteryGuideContent = {
  toolTypeId: string
  title: string
  category: string
  summary: string
  riskClass: ToolRiskClass
  contentVersion: string
  overview: string[]
  bestUses: string[]
  avoidWhen: string[]
  ppe: string[]
  setup: string[]
  basicUse: string[]
  commonMistakes: string[]
  accessories: string[]
  consumables: string[]
  maintenance: string[]
  comparisons: string[]
  substitutions: string[]
  projectExamples: string[]
  practiceTasks: PracticeTask[]
  buyingNotes: string[]
  troubleshooting: string[]
  storageCare: string[]
  readinessWarnings: string[]
  shopCardChecklist: string[]
}

const version = 'v0.02-static-guide-foundation'

export const skillDimensions: SkillDimension[] = ['Safety', 'Setup', 'Control', 'Accuracy', 'Maintenance', 'Project Use']

export const toolMasteryGuideContents: ToolMasteryGuideContent[] = [
  {
    toolTypeId: 'cordless-drill',
    title: 'Cordless Drill',
    category: 'Drilling',
    summary: 'Drill clean holes, drive light fasteners, set clutch/speed deliberately, and care for batteries.',
    riskClass: 'Moderate',
    contentVersion: version,
    overview: [
      'A cordless drill is the first reach tool for holes, pilot holes, countersinks, and controlled light fastening.',
      'The clutch, speed range, bit choice, and steady body position matter more than raw torque for beginner results.',
    ],
    bestUses: ['pilot holes', 'clearance holes', 'countersinking', 'light screw driving', 'hardware installs'],
    avoidWhen: ['the fastener needs impact force', 'the bit is dull or wrong size', 'the workpiece cannot be clamped or held safely'],
    ppe: ['eye protection', 'hearing protection for long sessions', 'dust mask when drilling dusty material'],
    setup: ['Match the bit to the material and hole size.', 'Seat the bit fully in the chuck and tighten it evenly.', 'Use low speed/high torque for larger bits and high speed for small clean holes.', 'Set clutch low for small screws and increase only as needed.'],
    basicUse: ['Mark the hole clearly.', 'Support the workpiece so the bit exits safely.', 'Start slowly until the bit tracks.', 'Keep the drill square unless an angled hole is intentional.', 'Back the bit out to clear chips on deeper holes.'],
    commonMistakes: ['Using a driver bit as a drill bit.', 'Skipping pilot holes and splitting wood.', 'Driving screws with the clutch set too high.', 'Letting the bit wander before it starts cutting.', 'Leaving batteries stored hot or fully drained.'],
    accessories: ['drill bit set', 'driver bit set', 'countersink bit', 'bit holder', 'right-angle adapter'],
    consumables: ['twist bits', 'brad point bits', 'driver bits', 'replacement batteries'],
    maintenance: ['Brush dust away from the chuck.', 'Inspect bit wobble before accuracy work.', 'Charge batteries before deep discharge.', 'Store batteries away from heat.'],
    comparisons: ['An impact driver is better for long or stubborn fasteners.', 'A hammer drill is better for masonry.', 'A drill press is better for repeatable square holes.'],
    substitutions: ['hand drill for quiet light work', 'impact driver for heavy fastening', 'drill press for repeatability'],
    projectExamples: ['install cabinet pulls', 'build garage shelves', 'assemble a workbench', 'hang wall brackets'],
    practiceTasks: [
      {
        title: 'Pilot hole and countersink board',
        goal: 'Drill three pilot holes and countersinks in scrap without splitting or tearout.',
        material: 'scrap softwood, three screws, matching bit, countersink bit',
        expectedResult: 'Screws sit flush and the board is not split.',
        dimensions: ['Setup', 'Control', 'Accuracy'],
        xp: 40,
      },
    ],
    buyingNotes: ['Pick a platform you can grow with.', 'A compact drill is easier to control than an oversized high-torque model.', 'Brushless matters more for repeated work than for occasional light tasks.'],
    troubleshooting: ['If holes burn, reduce speed or use a sharper bit.', 'If screws strip, lower clutch, improve bit fit, or drill a pilot hole.', 'If the bit wanders, start with a punch or smaller pilot.'],
    storageCare: ['Store bits in labeled cases.', 'Remove dusty bits from the chuck.', 'Keep batteries indoors when possible.'],
    readinessWarnings: ['Safety review recommended before drilling overhead or into walls.', 'Weakest link is often bit selection, not drill ownership.'],
    shopCardChecklist: ['Right bit selected', 'Workpiece supported', 'Clutch/speed set', 'Eye protection on', 'Battery charged'],
  },
  {
    toolTypeId: 'impact-driver',
    title: 'Impact Driver',
    category: 'Fastening',
    summary: 'Drive fasteners with impact-rated bits, controlled trigger pressure, and awareness of overdriving risk.',
    riskClass: 'Moderate',
    contentVersion: version,
    overview: [
      'An impact driver turns pulsing impact force into strong fastening control for screws, lags, and bolts.',
      'It is not a precision drill. It shines when fasteners are long, repetitive, or hard to drive by drill alone.',
    ],
    bestUses: ['deck screws', 'lag screws', 'structural screws', 'nut drivers', 'repeated assembly'],
    avoidWhen: ['the fastener head is delicate', 'the material is easy to split', 'a precise torque value is required'],
    ppe: ['eye protection', 'hearing protection', 'gloves when handling rough lumber or hardware'],
    setup: ['Use impact-rated bits only.', 'Match bit tip exactly to the fastener.', 'Start with a lower speed mode if available.', 'Clamp or brace small parts before driving.'],
    basicUse: ['Seat the bit fully.', 'Apply firm inline pressure.', 'Start slowly and let impacts build.', 'Stop before the head buries too deep.', 'Switch to hand tools near delicate hardware.'],
    commonMistakes: ['Using standard brittle bits.', 'Overdriving screws below the surface.', 'Rounding fastener heads with poor bit fit.', 'Using it where a torque wrench is required.'],
    accessories: ['impact-rated bit set', 'nut drivers', 'socket adapter', 'magnetic bit holder'],
    consumables: ['driver bits', 'hex bits', 'socket adapters'],
    maintenance: ['Wipe dust from the collet.', 'Replace rounded bits early.', 'Inspect battery contacts and case cracks.'],
    comparisons: ['A cordless drill is gentler for pilot holes and small screws.', 'An impact wrench is better for automotive lugs and larger sockets.', 'A torque wrench is required when exact torque matters.'],
    substitutions: ['cordless drill for light fastening', 'ratchet/socket for controlled hand tightening', 'impact wrench for heavy automotive work'],
    projectExamples: ['deck repairs', 'workbench framing', 'garage shelf assembly', 'lag bolt installs'],
    practiceTasks: [
      {
        title: 'Controlled screw depth strip',
        goal: 'Drive five screws into scrap with consistent head depth.',
        material: 'scrap 2x lumber, five screws, matching impact-rated bit',
        expectedResult: 'Fastener heads are seated evenly without stripping.',
        dimensions: ['Control', 'Accuracy', 'Setup'],
        xp: 35,
      },
    ],
    buyingNotes: ['Variable speed and multiple drive modes are useful for control.', 'Compact models are easier around cabinets and framing pockets.', 'Confirm the battery platform matches tools you already own.'],
    troubleshooting: ['If screws cam out, improve bit fit and inline pressure.', 'If heads bury too deep, lower mode or finish by hand.', 'If bits break, verify they are impact-rated.'],
    storageCare: ['Keep impact bits separate from standard drill bits.', 'Store socket adapters where they will not be confused with hand-tool sockets.'],
    readinessWarnings: ['You own the driver, but impact-rated bits may still be required.', 'Safety familiarity matters for loud repeated fastening.'],
    shopCardChecklist: ['Impact-rated bit', 'Pilot hole if needed', 'Inline pressure', 'Speed mode selected', 'Hearing protection nearby'],
  },
  {
    toolTypeId: 'circular-saw',
    title: 'Circular Saw',
    category: 'Cutting',
    summary: 'Make supported straight cuts with correct blade depth, clear layout, and kickback awareness.',
    riskClass: 'High',
    contentVersion: version,
    overview: [
      'A circular saw is a portable straight-cut saw for lumber and sheet goods.',
      'The biggest quality leap comes from stable support, correct blade depth, and using a guide when accuracy matters.',
    ],
    bestUses: ['rough lumber cuts', 'sheet goods breakdown', 'straight crosscuts', 'framing cuts'],
    avoidWhen: ['the workpiece is loose', 'the offcut can pinch the blade', 'the blade guard does not move freely', 'you need small-part precision'],
    ppe: ['eye protection', 'hearing protection', 'dust mask or respirator for dusty cuts'],
    setup: ['Choose a blade for the material and cut quality.', 'Set blade depth slightly below the workpiece.', 'Support both sides so the kerf will not pinch.', 'Confirm the guard returns freely.', 'Plan where the cord or battery will be during the cut.'],
    basicUse: ['Stand balanced and out of the cut path.', 'Let the blade reach speed before entering.', 'Follow the marked line or guide without twisting.', 'Keep hands away from both sides of the blade path.', 'Wait for the blade to stop before setting the saw down.'],
    commonMistakes: ['Cutting unsupported sheet goods.', 'Setting the blade much too deep.', 'Twisting the saw to correct a wandering line.', 'Letting the offcut trap the blade.', 'Ignoring a dull or wrong-tooth blade.'],
    accessories: ['speed square', 'straight edge guide', 'sawhorses', 'track guide', 'dust port adapter'],
    consumables: ['framing blade', 'fine-tooth blade', 'plywood blade'],
    maintenance: ['Clean pitch from blades.', 'Check the base plate for square.', 'Inspect guard movement before use.', 'Replace damaged blades.'],
    comparisons: ['A miter saw is better for repeatable crosscuts.', 'A table saw is better for repeatable rips.', 'A jigsaw is better for curves and notches.'],
    substitutions: ['handsaw for quiet small cuts', 'miter saw for short repeat cuts', 'track saw for cleaner sheet goods'],
    projectExamples: ['break down plywood', 'cut framing lumber', 'build garage shelves', 'trim panels to rough size'],
    practiceTasks: [
      {
        title: 'Guided crosscut practice',
        goal: 'Make three square crosscuts using a speed square as a guide.',
        material: 'scrap 2x board, circular saw, speed square, clamps if needed',
        expectedResult: 'Cuts are square, supported, and free of major tearout.',
        dimensions: ['Safety', 'Setup', 'Control', 'Accuracy'],
        xp: 50,
      },
    ],
    buyingNotes: ['Blade quality affects results as much as saw price.', 'A brake, dust port, and clear depth scale are useful safety/ergonomic features.', 'Battery saws are convenient, corded saws are still strong value.'],
    troubleshooting: ['If the saw binds, stop and check support/pinching.', 'If the cut wanders, use a guide and avoid twisting.', 'If tearout is high, use a finer blade or cut good-face down depending on setup.'],
    storageCare: ['Store with blade guarded.', 'Remove batteries before transport.', 'Keep spare blades flat and protected.'],
    readinessWarnings: ['Safety review recommended before first project cut.', 'Weakest link is often support and layout confidence, not saw ownership.'],
    shopCardChecklist: ['Blade depth set', 'Work supported', 'Guard moves freely', 'Cut path clear', 'Eye/hearing protection on'],
  },
  {
    toolTypeId: 'miter-saw',
    title: 'Miter Saw',
    category: 'Cutting',
    summary: 'Set up repeatable crosscuts, miters, and trim cuts with workholding and stop-block discipline.',
    riskClass: 'High',
    contentVersion: version,
    overview: [
      'A miter saw is a stationary crosscut saw for boards, trim, framing parts, and repeat lengths.',
      'It rewards setup: support long stock, clamp small parts, and let the blade stop before lifting.',
    ],
    bestUses: ['repeat crosscuts', 'trim miters', 'framing parts', 'stop-block batches'],
    avoidWhen: ['the board is too short to hold safely', 'round/irregular material can roll', 'sheet goods need ripping', 'the work is not against the fence'],
    ppe: ['eye protection', 'hearing protection', 'dust mask or respirator for long cutting sessions'],
    setup: ['Confirm the saw is stable.', 'Support long stock level with the table.', 'Set miter/bevel deliberately and lock it.', 'Use a stop block for repeat cuts.', 'Keep hands outside the danger zone.'],
    basicUse: ['Let the blade reach full speed.', 'Lower smoothly through the material.', 'Hold the work against the fence.', 'Release trigger and let the blade stop before lifting.', 'Check the first cut before batching.'],
    commonMistakes: ['Cutting tiny pieces without clamps.', 'Lifting the blade while it is still spinning.', 'Trusting angle markings without test cuts.', 'Using a framing blade for fine trim.', 'Letting long boards lever up.'],
    accessories: ['saw stand', 'stop block', 'hold-down clamp', 'finish blade', 'dust collection adapter'],
    consumables: ['crosscut blade', 'finish blade', 'replacement zero-clearance insert'],
    maintenance: ['Vacuum dust around the fence and slides.', 'Check fence alignment.', 'Clean blade pitch.', 'Inspect power cord and guard action.'],
    comparisons: ['A circular saw is more portable for rough long stock.', 'A table saw is better for rips.', 'A hand miter box can work for quiet tiny trim jobs.'],
    substitutions: ['circular saw plus speed square', 'hand saw and miter box', 'table saw crosscut sled for controlled shop cuts'],
    projectExamples: ['trim a room', 'cut shelf parts', 'build a workbench frame', 'batch planter slats'],
    practiceTasks: [
      {
        title: 'Stop-block repeatability',
        goal: 'Cut four matching scrap pieces using a stop block and verify length consistency.',
        material: 'scrap boards, stop block, measuring tool',
        expectedResult: 'All pieces match within a small visual tolerance and ends are square.',
        dimensions: ['Setup', 'Accuracy', 'Project Use'],
        xp: 45,
      },
    ],
    buyingNotes: ['A smaller saw can be safer and easier to store if it matches your material sizes.', 'Dust collection and a stable stand matter for repeated use.', 'Sliding capacity helps wide boards but adds setup size.'],
    troubleshooting: ['If angles are off, test cut and calibrate before project stock.', 'If pieces vary, improve stop-block setup.', 'If tearout is high, use a sharper/finer blade.'],
    storageCare: ['Lock the head for transport.', 'Keep the fence/table clean.', 'Store blades protected.'],
    readinessWarnings: ['Safety review recommended before using a miter saw.', 'Repeatability depends on support and stop-block setup.'],
    shopCardChecklist: ['Fence clear', 'Stock supported', 'Angle locked', 'Hands outside danger zone', 'Blade stopped before lifting'],
  },
  {
    toolTypeId: 'random-orbital-sander',
    title: 'Random Orbital Sander',
    category: 'Sanding',
    summary: 'Use grit progression, dust control, and light pressure to smooth surfaces without swirl marks.',
    riskClass: 'Moderate',
    contentVersion: version,
    overview: [
      'A random orbital sander smooths flat or gently curved surfaces with a spinning/orbiting pad.',
      'Good sanding is planned in grit stages. Rushing grits or pressing hard usually creates worse results.',
    ],
    bestUses: ['surface prep', 'finish sanding', 'paint removal', 'flattening small glue marks'],
    avoidWhen: ['corners require detail sanding', 'the surface is very uneven', 'dust cannot be controlled', 'the finish may contain hazardous material'],
    ppe: ['eye protection', 'respirator or dust mask', 'hearing protection for long sessions'],
    setup: ['Choose the starting grit based on surface condition.', 'Attach the disc flat and aligned with dust holes.', 'Connect dust bag or vacuum when possible.', 'Test on scrap or hidden area.'],
    basicUse: ['Place the pad flat before starting.', 'Use light pressure.', 'Move slowly in overlapping passes.', 'Progress through grits without skipping too far.', 'Clean dust between grits.'],
    commonMistakes: ['Pressing hard and slowing the pad.', 'Skipping from coarse to fine too quickly.', 'Tilting the sander on edges.', 'Using worn discs.', 'Not removing dust before finishing.'],
    accessories: ['vacuum hose adapter', 'interface pad', 'detail sanding block', 'pad saver'],
    consumables: ['hook-and-loop sanding discs', 'dust bags', 'replacement pad'],
    maintenance: ['Clean dust from vents.', 'Replace worn pad hooks.', 'Empty dust bag often.', 'Inspect cord or battery pack.'],
    comparisons: ['A belt sander removes material faster but is easier to damage work with.', 'A detail sander reaches corners.', 'Hand sanding gives more control for edges.'],
    substitutions: ['sanding block for small parts', 'detail sander for corners', 'belt sander for heavy removal'],
    projectExamples: ['prepare shelves for finish', 'smooth cabinet doors', 'remove paint from small panels', 'finish a tabletop'],
    practiceTasks: [
      {
        title: 'Three-grit finish strip',
        goal: 'Sand scrap through three grits and inspect scratch pattern after each grit.',
        material: 'scrap board, 80/120/180 grit discs, dust control',
        expectedResult: 'Scratches become progressively finer without visible swirls.',
        dimensions: ['Control', 'Accuracy', 'Maintenance'],
        xp: 35,
      },
    ],
    buyingNotes: ['Dust collection is a major buying factor.', 'Variable speed helps with finish work.', 'Disc availability matters more than rare features.'],
    troubleshooting: ['If swirls appear, reduce pressure, clean dust, and repeat the last grit.', 'If discs fly off, inspect pad hooks.', 'If finish looks blotchy, sand consistently and remove dust.'],
    storageCare: ['Store discs flat by grit.', 'Empty dust collection before storing.', 'Do not leave the sander resting on grit against a finished surface.'],
    readinessWarnings: ['Dust control may be a readiness warning even when the sander is owned.', 'Skill confidence depends on grit progression practice.'],
    shopCardChecklist: ['Correct grit', 'Disc seated flat', 'Dust control connected', 'Light pressure', 'Dust cleaned between grits'],
  },
  {
    toolTypeId: 'tape-measure',
    title: 'Tape Measure',
    category: 'Measuring',
    summary: 'Measure, mark, and repeat dimensions with reliable hook control and layout habits.',
    riskClass: 'Low',
    contentVersion: version,
    overview: [
      'A tape measure is a precision habit tool, not just a ruler.',
      'Hook movement, viewing angle, mark width, and repeatability shape how accurate every project becomes.',
    ],
    bestUses: ['layout', 'cut lists', 'room measurement', 'repeat checks'],
    avoidWhen: ['a rigid rule or caliper is better for small precision parts', 'the hook is loose beyond normal travel', 'the tape cannot be held straight'],
    ppe: ['eye protection when the tape is near cutting or snapping metal edges'],
    setup: ['Check that the hook moves only as intended.', 'Use the same tape for related parts when possible.', 'Decide whether you are measuring to a mark, edge, or actual fit.'],
    basicUse: ['Pull straight and avoid sag.', 'Read from directly above.', 'Mark a clear V or knife line.', 'Repeat critical measurements.', 'Use story sticks for repeated parts.'],
    commonMistakes: ['Measuring once and cutting immediately.', 'Hooking on damaged edges.', 'Reading from an angle.', 'Mixing tapes on the same project.', 'Forgetting blade width/mark thickness.'],
    accessories: ['pencil', 'marking knife', 'notebook', 'story stick material'],
    consumables: ['pencils', 'layout tape', 'replacement tape when damaged'],
    maintenance: ['Wipe debris from blade.', 'Retract under control.', 'Replace if kinked or hard to read.', 'Keep hook screws tight.'],
    comparisons: ['A combination square is better for short square marks.', 'A laser measure is faster for rooms.', 'Calipers are better for small hardware.'],
    substitutions: ['folding rule', 'story stick', 'laser measure for room scale'],
    projectExamples: ['create a cut list', 'measure shelving openings', 'layout wall storage', 'check diagonal square'],
    practiceTasks: [
      {
        title: 'Repeat-measure check',
        goal: 'Measure and mark five matching lengths, then compare them together.',
        material: 'scrap strip, pencil, tape measure',
        expectedResult: 'Marks align consistently and differences are visible before cutting.',
        dimensions: ['Accuracy', 'Project Use'],
        xp: 25,
      },
    ],
    buyingNotes: ['Readable markings and standout matter more than gimmicks.', 'A 16 ft or 25 ft tape covers most shop/home work.', 'Wide blades are easier to control over distance.'],
    troubleshooting: ['If parts keep coming out short, check hook use and mark side.', 'If long measurements vary, reduce tape sag.', 'If marks are hard to cut to, use a sharper pencil or knife line.'],
    storageCare: ['Retract slowly.', 'Keep dry.', 'Do not use the blade as a scraper.'],
    readinessWarnings: ['Measuring/layout confidence can be the weakest link even with all required tools owned.'],
    shopCardChecklist: ['Same tape used', 'Hook seated', 'Mark side chosen', 'Measurement repeated', 'Cut line clear'],
  },
  {
    toolTypeId: 'speed-square',
    title: 'Speed Square',
    category: 'Layout',
    summary: 'Mark square lines, quick angles, and circular-saw guide cuts with a simple, durable layout tool.',
    riskClass: 'Low',
    contentVersion: version,
    overview: [
      'A speed square is a fast layout reference for square cuts, angles, and saw guide work on boards.',
      'Its value comes from seating the lip cleanly and marking consistently.',
    ],
    bestUses: ['square lines', 'rafter angles', 'circular saw guide cuts', 'quick layout checks'],
    avoidWhen: ['the edge is not straight enough to register', 'fine furniture layout needs a more precise square', 'the square is damaged'],
    ppe: ['eye protection when used as a saw guide'],
    setup: ['Seat the lipped edge tightly against the board.', 'Keep the square flat.', 'Use a sharp pencil or marking knife.', 'Confirm the board edge is a reliable reference.'],
    basicUse: ['Mark square lines by holding the lip firm.', 'Use the pivot and degree scale for rough angles.', 'Use it as a saw guide only when the saw base has enough support.', 'Clamp when the cut feels unstable.'],
    commonMistakes: ['Referencing from a crooked edge.', 'Letting the square lift during marking.', 'Using it as a guide on material too narrow for saw support.', 'Marking with a dull pencil.'],
    accessories: ['sharp pencil', 'circular saw', 'clamp', 'straight board edge'],
    consumables: ['pencils', 'marking leads'],
    maintenance: ['Keep the lip free of dents.', 'Wipe adhesive or pitch from edges.', 'Replace if bent or nicked badly.'],
    comparisons: ['A combination square is better for depth and transfer measurements.', 'A framing square is better for large layout.', 'A track/straightedge is better for long cuts.'],
    substitutions: ['combination square', 'framing square', 'straightedge plus measured offsets'],
    projectExamples: ['mark shelf crosscuts', 'guide circular saw cuts', 'layout framing parts', 'check small assemblies'],
    practiceTasks: [
      {
        title: 'Square-line and saw-guide drill',
        goal: 'Mark and cut three square ends using the square as the guide.',
        material: 'scrap board, pencil, circular saw if ready',
        expectedResult: 'Lines are square and cut ends match the mark.',
        dimensions: ['Setup', 'Accuracy', 'Project Use'],
        xp: 30,
      },
    ],
    buyingNotes: ['High-contrast markings matter.', 'Metal squares last longer in rough work.', 'A 7 in. square is a handy first size.'],
    troubleshooting: ['If cuts are out of square, inspect the reference edge and saw base contact.', 'If marks drift, hold the lip tighter.', 'If pencil lines are wide, mark a V or knife line.'],
    storageCare: ['Hang flat or store where it will not bend.', 'Keep markings clean.'],
    readinessWarnings: ['Layout confidence often drives circular-saw accuracy warnings.'],
    shopCardChecklist: ['Reference edge checked', 'Square seated', 'Line marked clearly', 'Saw guide support checked', 'Result verified'],
  },
  {
    toolTypeId: 'bar-clamp',
    title: 'Clamps',
    category: 'Clamping',
    summary: 'Hold work safely, support assemblies, and apply even pressure without crushing or shifting parts.',
    riskClass: 'Low',
    contentVersion: version,
    overview: [
      'Clamps are workholding tools that improve safety, accuracy, glue-ups, and repeatability.',
      'The right pressure is enough to hold, not so much that it bows, dents, or slides the work.',
    ],
    bestUses: ['workholding', 'glue-ups', 'assembly support', 'saw guide support', 'dry fitting'],
    avoidWhen: ['clamp pressure would crush delicate parts', 'the clamp cannot sit flat', 'the work would become unstable if clamped there'],
    ppe: ['eye protection when clamping near cutting/drilling operations'],
    setup: ['Choose clamp length and type for the job.', 'Use pads on delicate surfaces.', 'Dry fit before glue.', 'Place clamps so they pull parts square instead of out of square.'],
    basicUse: ['Seat clamp faces flat.', 'Tighten gradually.', 'Alternate sides in glue-ups.', 'Check square after pressure is applied.', 'Keep clamp bars clear of tool paths.'],
    commonMistakes: ['Overtightening glue-ups.', 'Using too few clamps.', 'Clamping over a cut path.', 'Skipping cauls on wide panels.', 'Letting parts slide under pressure.'],
    accessories: ['clamp pads', 'cauls', 'corner blocks', 'glue rags', 'bench dogs'],
    consumables: ['glue', 'wax paper', 'protective tape'],
    maintenance: ['Clean glue from bars quickly.', 'Lubricate screw threads lightly when needed.', 'Replace damaged pads.', 'Store clamps where bars stay straight.'],
    comparisons: ['Spring clamps are quick for light pressure.', 'Parallel clamps help panel glue-ups.', 'Pipe clamps are economical for long spans.', 'Corner clamps help square frames.'],
    substitutions: ['weights for light holding', 'tape for tiny glue-ups', 'vise for small bench work'],
    projectExamples: ['glue a tabletop', 'hold a straightedge guide', 'assemble a cabinet box', 'repair a loose joint'],
    practiceTasks: [
      {
        title: 'Square dry-fit clamp-up',
        goal: 'Clamp four scrap pieces into a simple square frame and check diagonals.',
        material: 'four scrap strips, two to four clamps, tape measure',
        expectedResult: 'Frame stays square after clamp pressure is applied.',
        dimensions: ['Setup', 'Accuracy', 'Project Use'],
        xp: 30,
      },
    ],
    buyingNotes: ['A few medium clamps beat many weak tiny clamps.', 'Parallel clamps are useful later, not mandatory first.', 'Quick clamps trade speed for less pressure.'],
    troubleshooting: ['If parts slide, reduce pressure and add anti-slip support.', 'If glue-up bows, alternate clamps above/below.', 'If dents appear, use pads.'],
    storageCare: ['Hang vertically or rack horizontally.', 'Keep glue off threads and bars.', 'Do not store under heavy bending load.'],
    readinessWarnings: ['Project readiness should warn when cutting/drilling tasks lack safe workholding.'],
    shopCardChecklist: ['Clamp length fits', 'Pads if needed', 'Tool path clear', 'Pressure even', 'Square checked'],
  },
  {
    toolTypeId: 'shop-vac',
    title: 'Shop Vac / Dust Collection',
    category: 'Dust Collection',
    summary: 'Control chips, dust, and cleanup with the right filter, bag, hose, and wet/dry safety choices.',
    riskClass: 'Moderate',
    contentVersion: version,
    overview: [
      'A shop vac supports cleanup and point-of-use dust capture, but it is only as good as its filter, hose, and bag setup.',
      'Fine dust and wet pickup need different setup choices. Treat dust control as safety, not just neatness.',
    ],
    bestUses: ['workspace cleanup', 'tool dust capture', 'wet pickup when rated/setup correctly', 'chip cleanup'],
    avoidWhen: ['the filter/bag is wrong for the material', 'hot ash or flammable dust is present', 'wet pickup is attempted with dry-only setup'],
    ppe: ['dust mask or respirator for fine dust', 'eye protection when clearing hoses'],
    setup: ['Install the right filter for dry or wet work.', 'Use bags for fine dust when practical.', 'Match hose adapters to the tool.', 'Check that the tank is empty enough for the job.', 'Keep cords/hoses out of walking paths.'],
    basicUse: ['Start dust capture before the dust-heavy operation.', 'Move hose supports so the tool can move freely.', 'Empty or replace bags before suction collapses.', 'Switch filters/setup before wet pickup.'],
    commonMistakes: ['Using no bag for fine sanding dust.', 'Vacuuming wet messes with dry filter setup.', 'Letting clogged filters overheat the motor.', 'Using adapters that constantly fall off.'],
    accessories: ['hose adapter set', 'dust separator', 'HEPA cartridge filter', 'floor nozzle', 'tool-trigger outlet'],
    consumables: ['filter bags', 'cartridge filters', 'foam wet filter'],
    maintenance: ['Empty tank regularly.', 'Clean or replace filters.', 'Inspect hose clogs.', 'Let wet components dry before storage.'],
    comparisons: ['A dust collector moves more air for stationary woodworking machines.', 'An air filtration unit helps airborne dust but does not replace capture at the source.', 'A household vacuum is not a shop vac.'],
    substitutions: ['broom and dustpan for large chips', 'dust collector for stationary tools', 'portable extractor for finish-grade sanding'],
    projectExamples: ['sanding shelves', 'cleaning after cuts', 'routing dust capture', 'garage cleanup'],
    practiceTasks: [
      {
        title: 'Dust path setup check',
        goal: 'Connect a tool or nozzle setup, run it briefly, and inspect where dust escapes.',
        material: 'shop vac, hose adapter, small dust-producing task or safe dry debris',
        expectedResult: 'Most debris is captured and hose movement does not fight the tool.',
        dimensions: ['Setup', 'Safety', 'Maintenance'],
        xp: 35,
      },
    ],
    buyingNotes: ['Filter and hose ecosystem matter as much as tank size.', 'A dust separator saves filters if you make lots of chips.', 'HEPA filtration is valuable for fine dust control.'],
    troubleshooting: ['If suction drops, check bag, filter, hose, and tank seal.', 'If fine dust leaks, upgrade filter/bag setup.', 'If adapters slip, use a better adapter or clamp.'],
    storageCare: ['Store hoses without kinks.', 'Dry wet filters/tank.', 'Keep replacement bags/filters nearby.'],
    readinessWarnings: ['Dust-control warnings should appear for sanding, cutting, and routing projects even when the primary tool is owned.'],
    shopCardChecklist: ['Correct filter/bag', 'Hose adapter secure', 'Tank has capacity', 'Cord/hose path clear', 'Filter checked after use'],
  },
  {
    toolTypeId: 'socket-set',
    title: 'Socket Set',
    category: 'Automotive',
    summary: 'Choose the right socket size/drive, avoid rounding fasteners, and understand when torque specs matter.',
    riskClass: 'Moderate',
    contentVersion: version,
    overview: [
      'A socket set combines sockets, ratchets, extensions, and drive sizes for nuts, bolts, and many mechanical repairs.',
      'Correct fit and controlled force prevent rounded fasteners and unsafe assemblies.',
    ],
    bestUses: ['furniture assembly', 'automotive service', 'machine bolts', 'bench hardware'],
    avoidWhen: ['the fastener is damaged beyond grip', 'a torque specification must be met but no torque wrench is available', 'the vehicle/workpiece is not safely supported'],
    ppe: ['eye protection', 'gloves where knuckles or sharp metal are a risk'],
    setup: ['Choose metric or SAE by exact fit.', 'Use the correct drive size for the force needed.', 'Seat the socket fully.', 'Use extensions only when alignment stays controlled.', 'Use jack stands and wheel chocks for vehicle work when lifting is involved.'],
    basicUse: ['Pull with steady force.', 'Keep the ratchet square to the fastener.', 'Use penetrating oil and patience on stuck fasteners.', 'Switch to a breaker bar for high force instead of abusing a small ratchet.', 'Use a torque wrench where specifications matter.'],
    commonMistakes: ['Using a slightly wrong socket size.', 'Rounding fasteners by pulling at an angle.', 'Using chrome sockets on impact tools.', 'Skipping torque specs on critical bolts.', 'Working under unsupported vehicles.'],
    accessories: ['extensions', 'universal joint', 'breaker bar', 'torque wrench', 'impact sockets'],
    consumables: ['penetrating oil', 'thread locker when specified', 'replacement fasteners'],
    maintenance: ['Wipe grease and grit from sockets.', 'Keep ratchet mechanism clean.', 'Return sockets to labeled storage.', 'Replace cracked sockets.'],
    comparisons: ['Wrenches fit where sockets cannot.', 'Impact wrenches need impact-rated sockets.', 'Torque wrenches are measurement tools, not breaker bars.'],
    substitutions: ['combination wrench', 'adjustable wrench for low-risk temporary work', 'nut driver for light small fasteners'],
    projectExamples: ['assemble a bench', 'change brake pads with proper support/tools', 'tighten rack hardware', 'repair outdoor equipment'],
    practiceTasks: [
      {
        title: 'Socket fit and control check',
        goal: 'Match several nuts/bolts to exact sockets and loosen/tighten without slipping.',
        material: 'scrap hardware or non-critical bench bolts, socket set, ratchet',
        expectedResult: 'Sockets seat fully and fasteners are not rounded.',
        dimensions: ['Setup', 'Control', 'Safety'],
        xp: 35,
      },
    ],
    buyingNotes: ['A balanced starter set should include common metric and SAE sizes.', 'Deep sockets and extensions add usefulness.', 'Impact-rated sockets are separate from chrome hand sockets.'],
    troubleshooting: ['If a fastener rounds, stop and improve fit/approach before more damage.', 'If force feels excessive, reassess support, direction, and tool choice.', 'If a socket cracks, discard it.'],
    storageCare: ['Keep sockets organized by size.', 'Dry after wet/dirty work.', 'Store torque tools separately and unload them per manual.'],
    readinessWarnings: ['Automotive readiness should warn about support equipment, torque specs, and safety familiarity.'],
    shopCardChecklist: ['Exact socket fit', 'Ratchet square', 'Work safely supported', 'Torque spec checked', 'Impact sockets only with impact tools'],
  },
]

const sectionOrder: ToolGuideSection['sectionType'][] = [
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

export function getToolMasteryGuideContent(toolTypeId: string) {
  return toolMasteryGuideContents.find((guide) => guide.toolTypeId === toolTypeId)
}

export function getFamiliarityLabel(score: number) {
  if (score <= 10) return 'Unfamiliar'
  if (score <= 25) return 'Beginner'
  if (score <= 45) return 'Learning'
  if (score <= 65) return 'Comfortable'
  if (score <= 85) return 'Skilled'
  return 'Highly Familiar'
}

export function toolMasteryGuideToSections(guide: ToolMasteryGuideContent, now = '2026-05-05T00:00:00.000Z'): ToolGuideSection[] {
  return sectionOrder.map((sectionType, index) => ({
    id: `${guide.toolTypeId}-guide-${index + 1}`,
    toolTypeId: guide.toolTypeId,
    title: sectionType,
    sectionType,
    sortOrder: index,
    body: sectionBody(guide, sectionType),
    createdAt: now,
    updatedAt: now,
  }))
}

export function guideSectionsForMode(guide: ToolMasteryGuideContent, mode: GuideDepthMode) {
  if (mode === 'shop-card') {
    return [
      { title: 'Shop Card Checklist', items: guide.shopCardChecklist },
      { title: 'Readiness Warnings', items: guide.readinessWarnings },
      { title: 'Practice Task', items: guide.practiceTasks.map((task) => `${task.title}: ${task.expectedResult}`) },
    ]
  }
  if (mode === 'quick') {
    return [
      { title: 'Safety First', items: [...guide.ppe, ...guide.readinessWarnings] },
      { title: 'Setup', items: guide.setup },
      { title: 'Basic Use', items: guide.basicUse },
      { title: 'Common Mistakes', items: guide.commonMistakes },
    ]
  }
  return [
    { title: 'Overview', items: guide.overview },
    { title: 'Best Uses', items: guide.bestUses },
    { title: 'When Not To Use It', items: guide.avoidWhen },
    { title: 'PPE', items: guide.ppe },
    { title: 'Setup', items: guide.setup },
    { title: 'Basic Use', items: guide.basicUse },
    { title: 'Common Mistakes', items: guide.commonMistakes },
    { title: 'Accessories', items: guide.accessories },
    { title: 'Consumables', items: guide.consumables },
    { title: 'Maintenance', items: guide.maintenance },
    { title: 'Comparisons', items: guide.comparisons },
    { title: 'Substitutions', items: guide.substitutions },
    { title: 'Project Examples', items: guide.projectExamples },
    { title: 'Buying Notes', items: guide.buyingNotes },
    { title: 'Troubleshooting', items: guide.troubleshooting },
    { title: 'Storage + Care', items: guide.storageCare },
  ]
}

function sectionBody(guide: ToolMasteryGuideContent, sectionType: ToolGuideSection['sectionType']) {
  const body: Record<ToolGuideSection['sectionType'], string> = {
    Overview: guide.overview.join(' '),
    'Best Uses': sentenceList('Best for', guide.bestUses),
    'Safety First': [
      sentenceList('Use PPE', guide.ppe),
      sentenceList('Readiness warnings', guide.readinessWarnings),
      'Follow the tool manual and stop when setup feels unstable.',
    ].join(' '),
    Setup: guide.setup.join(' '),
    'How to Use': guide.basicUse.join(' '),
    'Common Mistakes': sentenceList('Watch for', guide.commonMistakes),
    'Compare Similar Tools': [...guide.comparisons, sentenceList('Substitutions', guide.substitutions)].join(' '),
    'Accessories + Consumables': [sentenceList('Accessories', guide.accessories), sentenceList('Consumables', guide.consumables)].join(' '),
    Maintenance: guide.maintenance.join(' '),
    'Practice Task': guide.practiceTasks.map((task) => `${task.title}: ${task.goal} Expected result: ${task.expectedResult}`).join(' '),
    Projects: sentenceList('Common project uses', guide.projectExamples),
    'Buy Notes': guide.buyingNotes.join(' '),
  }
  return body[sectionType]
}

function sentenceList(prefix: string, items: string[]) {
  return `${prefix}: ${items.join(', ')}.`
}
