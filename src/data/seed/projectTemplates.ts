import type { ProjectTemplate, ProjectTemplateRequirement, RequirementKind, SkillLevel } from '../schema'
import { slugify } from './starterToolLibrary'

const today = '2026-05-03T00:00:00.000Z'

type RequirementSeed = {
  kind: RequirementKind
  group: ProjectTemplateRequirement['group']
  name: string
  required?: boolean
  toolTypeId?: string
  capabilityId?: string
  category?: string
  quantity?: number
  unit?: string
  notes?: string
}

type TemplateSeed = {
  name: string
  description: string
  category: string
  difficulty: ProjectTemplate['difficulty']
  estimatedTime: string
  suggestedSkillLevel: SkillLevel
  tags: string[]
  requirements: RequirementSeed[]
  steps: string[]
  notes?: string
}

const templateSeeds: TemplateSeed[] = [
  project('Simple Wall Shelf', 'A clean beginner shelf for a garage, office, or utility room.', 'Storage', 'Easy', '2-4 hours', 'Beginner', ['shelf', 'storage', 'home repair'], [
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Tape Measure', 'tape-measure'),
    toolReq('Level', 'level'),
    materialReq('Shelf board', 1, 'board'),
    materialReq('Wall anchors or screws', 1, 'set'),
    safetyReq('Safety Glasses'),
  ], ['Measure the wall and mark stud or anchor locations.', 'Cut or inspect the shelf board.', 'Pre-drill mounting holes.', 'Install brackets or cleats level.', 'Set the shelf and tighten hardware.']),
  project('Floating Shelves', 'Wall-mounted shelves with hidden or low-profile support.', 'Storage', 'Moderate', '4-7 hours', 'Beginner', ['floating shelves', 'wall', 'plywood'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Level', 'level'),
    toolReq('Stud Finder', 'stud-finder', false, 'Measuring'),
    materialReq('Plywood or shelf boards', 1, 'sheet'),
    materialReq('Wood screws', 1, 'box'),
    accessoryReq('Fine-tooth plywood blade', 'Cleaner visible cuts.'),
    safetyReq('Safety Glasses'),
  ], ['Locate studs and shelf height.', 'Cut shelf skins and cleat pieces.', 'Assemble the shelf box.', 'Anchor the cleat to studs.', 'Slide on the shelf and secure it.']),
  project('Raised Garden Bed', 'A sturdy outdoor bed sized for common dimensional lumber.', 'Outdoor', 'Easy', '3-5 hours', 'Beginner', ['garden', 'outdoor', 'lumber'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Speed Square', 'speed-square'),
    materialReq('Cedar or treated lumber', 4, 'boards'),
    materialReq('Exterior screws', 1, 'box'),
    safetyReq('Work Gloves'),
  ], ['Cut boards to length.', 'Pre-drill corner fastener holes.', 'Assemble the rectangular frame.', 'Square the bed and tighten fasteners.', 'Place and fill with soil.']),
  project('Garage Storage Shelves', 'Utility shelves for bins, paint, and workshop overflow.', 'Storage', 'Moderate', '1 day', 'Beginner', ['garage', 'shelves', '2x4'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Impact Driver', 'impact-driver'),
    toolReq('Tape Measure', 'tape-measure'),
    toolReq('Level', 'level'),
    materialReq('2x4 lumber', 8, 'boards'),
    materialReq('Plywood', 2, 'sheets'),
    materialReq('Construction screws', 1, 'box'),
    safetyReq('Hearing Protection'),
  ], ['Measure the wall and storage bins.', 'Cut legs, rails, and shelf panels.', 'Build side frames.', 'Join frames with shelf rails.', 'Install shelf panels and anchor as needed.']),
  project('Tool Wall', 'A flexible wall system for hand tools and everyday workshop gear.', 'Shop Organization', 'Easy', '3-6 hours', 'Beginner', ['tool wall', 'pegboard', 'organization'], [
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Level', 'level'),
    toolReq('Stud Finder', 'stud-finder', false, 'Measuring'),
    materialReq('Pegboard or plywood backer', 1, 'panel'),
    materialReq('Wall screws', 1, 'box'),
    accessoryReq('Peg hooks or tool holders'),
  ], ['Find and mark stud lines.', 'Cut backer or pegboard if needed.', 'Attach spacers or cleats.', 'Mount the panel level.', 'Place holders by workflow frequency.']),
  project('Sawhorse Pair', 'Two portable supports for cutting and assembly.', 'Shop Fixtures', 'Easy', '2-4 hours', 'Beginner', ['sawhorse', 'shop fixture', 'cutting support'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Speed Square', 'speed-square'),
    materialReq('2x4 lumber', 5, 'boards'),
    materialReq('Wood screws', 1, 'box'),
  ], ['Cut legs and top rails.', 'Mark matching leg angles.', 'Assemble each sawhorse frame.', 'Add stretchers.', 'Check for wobble and trim if needed.']),
  project('Workbench Cart', 'A mobile bench for compact spaces and flexible assembly.', 'Shop Fixtures', 'Hard', '1-2 days', 'Intermediate', ['workbench', 'cart', 'mobile'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Bar Clamp', 'bar-clamp'),
    toolReq('Random Orbital Sander', 'random-orbital-sander'),
    materialReq('Plywood', 2, 'sheets'),
    materialReq('Casters', 4, 'each'),
    materialReq('Wood screws', 1, 'box'),
    accessoryReq('Countersink bit'),
  ], ['Cut panels and rails.', 'Assemble the base box.', 'Install shelves or drawers.', 'Attach casters.', 'Sand edges and add a durable top.']),
  project('Basic Desk', 'A simple desk with a plywood or panel top and sturdy legs.', 'Furniture', 'Moderate', '1 day', 'Beginner', ['desk', 'furniture', 'home office'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Random Orbital Sander', 'random-orbital-sander'),
    toolReq('Bar Clamp', 'bar-clamp'),
    materialReq('Desk top panel', 1, 'panel'),
    materialReq('Legs or 2x lumber', 4, 'pieces'),
    materialReq('Wood screws', 1, 'box'),
  ], ['Size the top and leg layout.', 'Cut parts.', 'Sand visible faces and edges.', 'Attach legs or frame.', 'Level and finish the desk.']),
  project('Closet Organizer', 'Shelves and dividers for a small closet refresh.', 'Storage', 'Moderate', '1 day', 'Beginner', ['closet', 'shelves', 'organizer'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Level', 'level'),
    toolReq('Tape Measure', 'tape-measure'),
    materialReq('Melamine or plywood panels', 2, 'panels'),
    materialReq('Shelf pins or screws', 1, 'set'),
  ], ['Measure closet openings.', 'Cut shelves and dividers.', 'Mark level shelf locations.', 'Install cleats or pins.', 'Set shelves and check fit.']),
  project('Miter Saw Station', 'A compact station with wings for repeat cuts.', 'Shop Fixtures', 'Hard', '2 days', 'Intermediate', ['miter saw', 'station', 'shop'], [
    toolReq('Miter Saw', 'miter-saw'),
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Tape Measure', 'tape-measure'),
    materialReq('Plywood', 3, 'sheets'),
    materialReq('2x4 lumber', 6, 'boards'),
    accessoryReq('Dust hose adapter'),
  ], ['Measure saw deck height.', 'Build base cabinets or frames.', 'Cut and attach wings.', 'Mount the saw flush to the deck.', 'Add stop block track or measuring tape.']),
  project('Simple Cabinet', 'A basic utility cabinet with a face frame or simple front.', 'Cabinetry', 'Hard', '2-3 days', 'Intermediate', ['cabinet', 'casework', 'storage'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Router', 'router', false),
    toolReq('Bar Clamp', 'bar-clamp'),
    toolReq('Cordless Drill', 'cordless-drill'),
    materialReq('Cabinet plywood', 2, 'sheets'),
    materialReq('Wood glue', 1, 'bottle'),
    materialReq('Cabinet screws', 1, 'box'),
    accessoryReq('Straight edge guide'),
  ], ['Break down cabinet panels.', 'Cut joinery or butt joints.', 'Assemble the box square.', 'Add shelves and back panel.', 'Fit door or face frame.']),
  project('Planter Box', 'An outdoor planter with drainage and simple joinery.', 'Outdoor', 'Easy', '3-5 hours', 'Beginner', ['planter', 'garden', 'outdoor'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Sanding Block', 'sanding-block', false),
    materialReq('Cedar boards', 6, 'boards'),
    materialReq('Exterior screws', 1, 'box'),
    materialReq('Landscape fabric', 1, 'roll'),
  ], ['Cut side and end boards.', 'Assemble box sides.', 'Add bottom slats with gaps.', 'Sand sharp edges.', 'Line and fill the planter.']),
  project('Picture Frame', 'A small frame for prints or shop practice.', 'Decor', 'Moderate', '3-5 hours', 'Beginner', ['frame', 'miter', 'decor'], [
    toolReq('Miter Saw', 'miter-saw'),
    toolReq('Corner Clamp', 'corner-clamp'),
    toolReq('Tape Measure', 'tape-measure'),
    materialReq('Frame molding', 4, 'pieces'),
    materialReq('Wood glue', 1, 'bottle'),
    accessoryReq('Brad nails or pin nails', 'Optional reinforcement.'),
  ], ['Measure artwork and rabbet allowance.', 'Cut matching miters.', 'Dry-fit the frame.', 'Glue and clamp corners.', 'Add backing and hanger.']),
  project('Trim Repair', 'Replace or patch a small section of interior trim.', 'Home Repair', 'Easy', '1-3 hours', 'Beginner', ['trim', 'repair', 'molding'], [
    toolReq('Miter Saw', 'miter-saw', false),
    toolReq('Utility Knife', 'utility-knife'),
    toolReq('Brad Nailer', 'brad-nailer', false),
    materialReq('Trim molding', 1, 'piece'),
    materialReq('Caulk', 1, 'tube'),
    materialReq('Finish nails', 1, 'pack'),
  ], ['Score paint lines.', 'Remove damaged trim.', 'Cut replacement to fit.', 'Fasten and fill nail holes.', 'Caulk and touch up paint.']),
  project('Drywall Patch', 'Patch a small wall hole and prep for paint.', 'Home Repair', 'Easy', '1 day with drying', 'Beginner', ['drywall', 'patch', 'wall'], [
    toolReq('Utility Knife', 'utility-knife'),
    toolReq('Sanding Block', 'sanding-block'),
    materialReq('Drywall patch', 1, 'each'),
    materialReq('Joint compound', 1, 'tub'),
    materialReq('Sandpaper', 2, 'sheets'),
    materialReq('Primer', 1, 'quart', false),
  ], ['Square or clean the hole.', 'Apply patch or backing.', 'Spread joint compound.', 'Sand after dry.', 'Prime and paint.']),
  project('Faucet Replacement', 'Swap a bathroom or kitchen faucet with safer prep.', 'Plumbing', 'Moderate', '2-4 hours', 'Beginner', ['sink repair', 'faucet', 'plumbing'], [
    toolReq('Basin Wrench', 'basin-wrench'),
    toolReq('Adjustable Wrench', 'adjustable-wrench'),
    toolReq('Bucket', 'bucket', false, 'Plumbing'),
    materialReq('Supply lines', 2, 'each'),
    materialReq('Plumber tape', 1, 'roll'),
    safetyReq('Work Gloves', false),
  ], ['Shut off water and drain lines.', 'Disconnect old supply lines.', 'Remove old faucet hardware.', 'Set new faucet and gasket.', 'Reconnect, test, and check for leaks.']),
  project('Drain Trap Repair', 'Clear or replace a sink P-trap.', 'Plumbing', 'Easy', '1-2 hours', 'Beginner', ['sink repair', 'drain', 'plumbing'], [
    toolReq('Adjustable Wrench', 'adjustable-wrench'),
    toolReq('Bucket', 'bucket', false, 'Plumbing'),
    materialReq('Replacement P-trap kit', 1, 'kit', false),
    materialReq('Plumber tape', 1, 'roll', false),
  ], ['Place bucket under trap.', 'Loosen slip nuts.', 'Clean or replace trap parts.', 'Reassemble hand tight.', 'Run water and inspect leaks.']),
  project('Outlet Replacement', 'Replace a standard outlet with proper testing.', 'Electrical', 'Moderate', '1-2 hours', 'Beginner', ['outlet', 'electrical', 'home repair'], [
    toolReq('Voltage Tester', 'voltage-tester'),
    toolReq('Screwdriver Set', 'screwdriver-set'),
    toolReq('Wire Stripper', 'wire-stripper', false),
    materialReq('Replacement outlet', 1, 'each'),
    materialReq('Wire nuts', 1, 'pack', false),
    safetyReq('Safety Glasses'),
  ], ['Turn off breaker.', 'Confirm outlet is not live.', 'Remove old outlet and note wiring.', 'Connect new outlet.', 'Restore power and test.'], 'Electrical work can be dangerous; stop and hire a licensed electrician when wiring is unclear.'),
  project('Light Fixture Swap', 'Replace a simple ceiling or wall fixture.', 'Electrical', 'Moderate', '1-3 hours', 'Beginner', ['lighting', 'fixture', 'electrical'], [
    toolReq('Voltage Tester', 'voltage-tester'),
    toolReq('Screwdriver Set', 'screwdriver-set'),
    toolReq('Step Ladder', 'step-ladder'),
    materialReq('Wire nuts', 1, 'pack'),
    materialReq('Light fixture', 1, 'each'),
  ], ['Turn off power and verify.', 'Remove old fixture.', 'Support fixture while wiring.', 'Attach mounting hardware.', 'Install bulbs and test.']),
  project('Tile Backsplash Repair', 'Replace a few loose or damaged backsplash tiles.', 'Tile', 'Moderate', '1 day with curing', 'Intermediate', ['tile', 'backsplash', 'repair'], [
    toolReq('Utility Knife', 'utility-knife'),
    toolReq('Tile Saw', 'tile-saw', false, 'Cutting'),
    materialReq('Replacement tile', 4, 'tiles'),
    materialReq('Thinset or adhesive', 1, 'tub'),
    materialReq('Grout', 1, 'tub'),
  ], ['Remove damaged grout and tile.', 'Clean the wall surface.', 'Cut replacement tile if needed.', 'Set tile with adhesive.', 'Grout and clean haze.']),
  project('Laminate Flooring Repair', 'Replace a damaged plank or small flooring section.', 'Flooring', 'Moderate', '3-6 hours', 'Intermediate', ['flooring', 'laminate', 'repair'], [
    toolReq('Oscillating Multi-Tool', 'oscillating-multi-tool'),
    toolReq('Tape Measure', 'tape-measure'),
    toolReq('Pull Bar', 'pull-bar', false, 'Flooring'),
    materialReq('Replacement plank', 1, 'piece'),
    accessoryReq('Spacers and tapping block'),
  ], ['Remove trim near the repair.', 'Unlock planks back to damage.', 'Replace the damaged plank.', 'Reassemble rows.', 'Reinstall trim.']),
  project('Concrete Anchor Install', 'Mount a shelf, rack, or bracket into masonry.', 'Masonry', 'Moderate', '1-3 hours', 'Beginner', ['concrete', 'anchor', 'garage'], [
    toolReq('Rotary Hammer', 'rotary-hammer'),
    toolReq('Level', 'level'),
    materialReq('Concrete anchors', 1, 'pack'),
    accessoryReq('Masonry drill bit'),
    safetyReq('Hearing Protection'),
    safetyReq('Safety Glasses'),
  ], ['Mark bracket holes.', 'Drill to anchor depth.', 'Clean dust from holes.', 'Set anchors.', 'Tighten bracket and load test lightly.']),
  project('Bike Tune-Up', 'Basic bicycle maintenance and adjustment.', 'Mechanical', 'Easy', '1-3 hours', 'Beginner', ['bike', 'tune up', 'mechanical'], [
    toolReq('Hex Key Set', 'hex-key-set', true, 'Automotive'),
    toolReq('Adjustable Wrench', 'adjustable-wrench', false),
    materialReq('Chain lube', 1, 'bottle'),
    materialReq('Shop rags', 3, 'rags'),
  ], ['Clean drivetrain.', 'Check tire pressure.', 'Tighten loose fasteners.', 'Adjust brakes lightly.', 'Lubricate chain.']),
  project('Oil Change', 'A basic vehicle oil and filter service.', 'Automotive', 'Moderate', '1-2 hours', 'Beginner', ['oil change', 'car', 'automotive'], [
    toolReq('Floor Jack', 'floor-jack'),
    toolReq('Jack Stands', 'jack-stands'),
    toolReq('Oil Filter Wrench', 'oil-filter-wrench'),
    toolReq('Socket Set', 'socket-set'),
    materialReq('Motor oil', 5, 'quarts'),
    materialReq('Oil filter', 1, 'each'),
    materialReq('Drain pan', 1, 'each'),
    safetyReq('Work Gloves'),
  ], ['Warm engine briefly and park level.', 'Lift and support vehicle safely.', 'Drain old oil.', 'Replace filter and plug gasket.', 'Refill and check for leaks.']),
  project('Brake Pad Replacement Prep', 'Inspection and setup for brake pad replacement.', 'Automotive', 'Hard', '2-4 hours', 'Intermediate', ['brakes', 'automotive', 'repair'], [
    toolReq('Floor Jack', 'floor-jack'),
    toolReq('Jack Stands', 'jack-stands'),
    toolReq('Socket Set', 'socket-set'),
    toolReq('Torque Wrench', 'torque-wrench'),
    materialReq('Brake pads', 1, 'set'),
    materialReq('Brake cleaner', 1, 'can'),
  ], ['Loosen lug nuts on ground.', 'Lift and support vehicle.', 'Remove wheel and inspect caliper.', 'Replace pads as appropriate.', 'Torque wheels to spec.']),
  project('Outdoor Bench', 'A simple bench for a porch, patio, or garden.', 'Outdoor Furniture', 'Moderate', '1 day', 'Beginner', ['bench', 'outdoor', 'furniture'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Random Orbital Sander', 'random-orbital-sander'),
    materialReq('Outdoor lumber', 8, 'boards'),
    materialReq('Exterior screws', 1, 'box'),
    materialReq('Exterior finish', 1, 'quart', false),
  ], ['Cut seat, legs, and stretchers.', 'Assemble leg frames.', 'Attach seat boards.', 'Sand edges.', 'Apply outdoor finish.']),
  project('Media Console', 'A low cabinet-style console for media equipment.', 'Furniture', 'Hard', '2-3 days', 'Intermediate', ['media console', 'cabinet', 'furniture'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Router', 'router', false),
    toolReq('Bar Clamp', 'bar-clamp'),
    toolReq('Random Orbital Sander', 'random-orbital-sander'),
    materialReq('Plywood', 3, 'sheets'),
    materialReq('Edge banding', 1, 'roll'),
    materialReq('Wood glue', 1, 'bottle'),
  ], ['Break down panels.', 'Assemble case.', 'Add shelves and cable openings.', 'Band visible edges.', 'Sand and finish.']),
  project('Coffee Table', 'A straightforward coffee table with a simple base.', 'Furniture', 'Moderate', '1-2 days', 'Beginner', ['coffee table', 'furniture', 'living room'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Bar Clamp', 'bar-clamp'),
    toolReq('Random Orbital Sander', 'random-orbital-sander'),
    materialReq('Hardwood or plywood top', 1, 'panel'),
    materialReq('Leg material', 4, 'pieces'),
    materialReq('Wood glue', 1, 'bottle'),
  ], ['Cut top and base parts.', 'Dry-fit joinery or fasteners.', 'Assemble base.', 'Attach top.', 'Sand and finish.']),
  project('Shop Vac Dust Cart', 'A compact cart for a shop vacuum and dust separator.', 'Shop Fixtures', 'Moderate', '1 day', 'Beginner', ['dust collection', 'shop vac', 'cart'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Shop Vac', 'shop-vac'),
    materialReq('Plywood', 1, 'sheet'),
    materialReq('Casters', 4, 'each'),
    accessoryReq('Vacuum Hose Kit'),
    accessoryReq('Dust Separator'),
  ], ['Measure vacuum and separator footprint.', 'Cut cart panels.', 'Assemble base and supports.', 'Attach casters.', 'Mount hose storage.']),
  project('Clamp Rack', 'A wall rack for F-style, bar, and spring clamps.', 'Shop Organization', 'Easy', '2-4 hours', 'Beginner', ['clamps', 'rack', 'organization'], [
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Level', 'level'),
    materialReq('Plywood scraps', 1, 'panel'),
    materialReq('Wall screws', 1, 'box'),
  ], ['Sort clamps by size.', 'Cut rack cleats and slots.', 'Pre-drill mounting holes.', 'Mount to studs.', 'Load clamps and check sag.']),
  project('Router Edge Practice Board', 'A safe practice task for roundovers and chamfers.', 'Skill Practice', 'Easy', '1-2 hours', 'Beginner', ['router', 'practice', 'edge profile'], [
    toolReq('Router', 'router'),
    toolReq('Bar Clamp', 'bar-clamp'),
    materialReq('Scrap board', 1, 'piece'),
    accessoryReq('Roundover Bit'),
    safetyReq('Hearing Protection'),
    safetyReq('Safety Glasses'),
  ], ['Clamp scrap securely.', 'Install bit and set shallow depth.', 'Route with the correct feed direction.', 'Inspect profile.', 'Repeat with small depth changes.']),
  project('Painted Accent Wall', 'Prep and paint a single wall cleanly.', 'Painting', 'Easy', '1 day', 'Beginner', ['paint', 'wall', 'home repair'], [
    toolReq('Foam Roller', 'foam-roller'),
    toolReq('Paint Brush Set', 'paint-brush-set'),
    materialReq('Painter tape', 1, 'roll'),
    materialReq('Drop cloth', 1, 'each'),
    materialReq('Paint', 1, 'gallon'),
  ], ['Clear and cover the area.', 'Tape trim and edges.', 'Cut in corners.', 'Roll the wall evenly.', 'Remove tape before full cure.']),
  project('Weatherstrip Door', 'Improve drafts around an exterior door.', 'Home Repair', 'Easy', '1-2 hours', 'Beginner', ['door', 'weatherstrip', 'energy'], [
    toolReq('Utility Knife', 'utility-knife'),
    toolReq('Tape Measure', 'tape-measure'),
    materialReq('Weatherstripping', 1, 'kit'),
    materialReq('Door sweep', 1, 'each', false),
  ], ['Inspect gaps around the door.', 'Measure jamb lengths.', 'Cut weatherstrip to fit.', 'Install adhesive or nailed strips.', 'Test door close and seal.']),
  project('Hose Reel Mount', 'Mount a hose reel or bracket outside.', 'Outdoor', 'Easy', '1-2 hours', 'Beginner', ['hose reel', 'outdoor', 'masonry'], [
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Rotary Hammer', 'rotary-hammer', false),
    toolReq('Level', 'level'),
    materialReq('Exterior screws or anchors', 1, 'pack'),
    safetyReq('Safety Glasses'),
  ], ['Choose mounting height.', 'Mark holes level.', 'Drill pilot or masonry holes.', 'Set anchors if needed.', 'Fasten reel and test hose pull.']),
  project('Simple Birdhouse', 'A small beginner woodworking project with useful layout practice.', 'Woodworking', 'Easy', '2-4 hours', 'Beginner', ['birdhouse', 'woodworking', 'beginner'], [
    toolReq('Circular Saw', 'circular-saw'),
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Bar Clamp', 'bar-clamp', false),
    materialReq('Cedar board', 1, 'board'),
    materialReq('Exterior screws', 1, 'pack'),
  ], ['Mark and cut panels.', 'Drill entry and drainage holes.', 'Dry-fit walls and roof.', 'Fasten parts.', 'Sand edges and mount safely.']),
  project('Cabinet Hardware Install', 'Install knobs or pulls consistently on cabinet doors.', 'Home Improvement', 'Easy', '1-3 hours', 'Beginner', ['cabinet', 'hardware', 'drilling'], [
    toolReq('Cordless Drill', 'cordless-drill'),
    toolReq('Tape Measure', 'tape-measure'),
    toolReq('Combination Square', 'combination-square', false),
    accessoryReq('Cabinet hardware jig', 'Keeps hole spacing repeatable.'),
    materialReq('Cabinet knobs or pulls', 1, 'set'),
  ], ['Choose hardware placement.', 'Make or set a drilling jig.', 'Mark each door.', 'Drill clean holes.', 'Attach and align hardware.']),
]

export const starterProjectTemplates: ProjectTemplate[] = templateSeeds.map((seed) => ({
  id: slugify(seed.name),
  name: seed.name,
  description: seed.description,
  category: seed.category,
  difficulty: seed.difficulty,
  estimatedTime: seed.estimatedTime,
  suggestedSkillLevel: seed.suggestedSkillLevel,
  tags: seed.tags,
  steps: seed.steps,
  notes: seed.notes,
  createdAt: today,
  updatedAt: today,
}))

export const starterProjectTemplateRequirements: ProjectTemplateRequirement[] = templateSeeds.flatMap((seed) => {
  const templateId = slugify(seed.name)
  return seed.requirements.map((requirement, index) => ({
    id: `${templateId}-req-${index + 1}`,
    templateId,
    requirementKind: requirement.kind,
    group: requirement.group,
    displayName: requirement.name,
    required: requirement.required ?? true,
    toolTypeId: requirement.toolTypeId,
    capabilityId: requirement.capabilityId,
    category: requirement.category,
    quantity: requirement.quantity,
    unit: requirement.unit,
    notes: requirement.notes,
    sortOrder: index,
    createdAt: today,
    updatedAt: today,
  }))
})

function project(
  name: string,
  description: string,
  category: string,
  difficulty: ProjectTemplate['difficulty'],
  estimatedTime: string,
  suggestedSkillLevel: SkillLevel,
  tags: string[],
  requirements: RequirementSeed[],
  steps: string[],
  notes?: string,
): TemplateSeed {
  return { name, description, category, difficulty, estimatedTime, suggestedSkillLevel, tags, requirements, steps, notes }
}

function toolReq(name: string, toolTypeId: string, required = true, category?: string): RequirementSeed {
  return { kind: category ? 'ToolCategory' : 'ToolType', group: 'Tool', name, required, toolTypeId: category ? undefined : toolTypeId, category }
}

function materialReq(name: string, quantity: number, unit: string, required = true): RequirementSeed {
  return { kind: 'Material', group: 'Material', name, quantity, unit, required }
}

function accessoryReq(name: string, notes?: string): RequirementSeed {
  return { kind: 'ToolCategory', group: 'Accessory', name, category: 'Shop Equipment', required: false, notes }
}

function safetyReq(name: string, required = true): RequirementSeed {
  return { kind: 'ToolCategory', group: 'Safety', name, category: 'Safety', required }
}
