import type {
  BatteryPlatform,
  Brand,
  Capability,
  PowerType,
  SkillLevel,
  ToolAccessory,
  ToolAlias,
  ToolCatalogItem,
  ToolCatalogSourceNote,
  ToolCatalogSpec,
  ToolCompatibilityRule,
  ToolConsumable,
  ToolCostTier,
  ToolFamily,
  ToolPriorityLabel,
  ToolType,
  ToolTypeCapability,
} from '../schema'

const today = '2026-05-03T00:00:00.000Z'

export const PUBLIC_INVENTORY_SOURCES = [
  {
    id: 'green-lents',
    name: 'Green Lents Tool Library public inventory',
    url: 'https://www.gltl.toollibrarian.net/TL/ourtools.php',
  },
  {
    id: 'sw-portland',
    name: 'SW Portland Tool Library public inventory',
    url: 'https://www.swptl.toollibrarian.net/TL/ourtools.php',
  },
  {
    id: 'ne-portland',
    name: 'NE Portland Tool Library public inventory',
    url: 'https://www.neptl.toollibrarian.net/TL/ourtools.php',
  },
  {
    id: 'santa-rosa-sonoma',
    name: 'Santa Rosa / Sonoma Tool Library public inventory',
    url: 'https://www.srtl.toollibrarian.net/TL/ourtools.php',
  },
] as const

type PublicInventorySource = typeof PUBLIC_INVENTORY_SOURCES[number]

type ExpansionTemplate = {
  name: string
  category: string
  aliases: string[]
  capabilities: string[]
  materials: string[]
  commonProjects: string[]
  powerType: PowerType
  skillLevel: SkillLevel
  genericSpecs: string[]
  brands?: string[]
  tags: string[]
  priorityLabels?: ToolPriorityLabel[]
}

type ExpansionCategory = {
  category: string
  target: number
  templates: ExpansionTemplate[]
}

type Candidate = {
  template: ExpansionTemplate
  brand: string
  model?: string
  displayName: string
  specLabel?: string
  tags: string[]
}

export type PublicInventoryExpansionSeed = {
  toolFamilies: ToolFamily[]
  toolTypes: ToolType[]
  toolAliases: ToolAlias[]
  brands: Brand[]
  batteryPlatforms: BatteryPlatform[]
  toolCatalogItems: ToolCatalogItem[]
  toolCatalogSpecs: ToolCatalogSpec[]
  toolCatalogSourceNotes: ToolCatalogSourceNote[]
  capabilities: Capability[]
  toolTypeCapabilities: ToolTypeCapability[]
  toolAccessories: ToolAccessory[]
  toolConsumables: ToolConsumable[]
  toolCompatibilityRules: ToolCompatibilityRule[]
  publicCatalogItemIds: string[]
}

const powerBrands = ['DeWalt', 'Milwaukee', 'Makita', 'Bosch', 'RIDGID', 'Ryobi', 'Craftsman', 'Metabo HPT', 'Skil', 'Porter-Cable']
const sawAccessoryBrands = ['Diablo', 'Freud', 'Bosch', 'DeWalt', 'Milwaukee', 'Makita', 'Irwin', 'Lenox', 'Generic', 'Oshlun']
const handBrands = ['Stanley', 'Irwin', 'Klein', 'Crescent', 'Channellock', 'Tekton', 'Husky', 'Craftsman', 'Kobalt', 'Generic']
const clampBrands = ['Bessey', 'Irwin', 'Jorgensen', 'Pony', 'Milescraft', 'POWERTEC', 'Rockler', 'Kreg', 'Generic', 'WoodRiver']
const measuringBrands = ['Stanley', 'Milwaukee', 'Empire', 'Stabila', 'Bosch', 'Klein', 'Johnson', 'Starrett', 'General Tools', 'Generic']
const plumbingBrands = ['RIDGID', 'Milwaukee', 'Klein', 'Husky', 'Crescent', 'Superior Tool', 'General Pipe Cleaners', 'SharkBite', 'Generic', 'Lenox']
const electricalBrands = ['Klein', 'Fluke', 'Southwire', 'Ideal', 'Greenlee', 'Milwaukee', 'Gardner Bender', 'Commercial Electric', 'Generic', 'Knipex']
const outdoorBrands = ['Fiskars', 'Ames', 'Corona', 'EGO', 'Greenworks', 'Ryobi', 'DeWalt', 'True Temper', 'Radius Garden', 'Generic']
const automotiveBrands = ['Pittsburgh', 'Torin', 'Tekton', 'Lisle', 'NOCO', 'BlueDriver', 'Craftsman', 'DeWalt', 'OEMTOOLS', 'Generic']
const safetyBrands = ['3M', 'Uvex', 'Milwaukee', 'DeWalt', 'Klein', 'Honeywell', 'RIDGID', 'WEN', 'Generic', 'Cen-Tec']
const handlingBrands = ['Werner', 'Little Giant', 'Gorilla Ladders', 'Cosco', 'Milwaukee', 'Harper', 'Magliner', 'Bora', 'Generic', 'Vestil']
const masonryBrands = ['Marshalltown', 'Bon Tool', 'QEP', 'Ridgid', 'DeWalt', 'Bosch', 'Milwaukee', 'Roberts', 'Goldblatt', 'Generic']
const specialtyBrands = ['Dremel', 'Weller', 'Milwaukee', 'Klein', 'DeWalt', 'Bosch', 'WEN', 'Forney', 'Generic', 'Ryobi']

const expansionCategories: ExpansionCategory[] = [
  category('Cutting', 122, [
    template('Circular Saw', ['skill saw', 'skilsaw', 'circ saw'], ['cut plywood', 'crosscut lumber', 'rip boards'], ['lumber', 'plywood', 'MDF'], ['deck', 'shelves', 'workbench'], 'Battery or Corded', 'Beginner', ['6-1/2 in.', '7-1/4 in.', 'compact', 'corded 13 amp', 'worm drive', 'left blade', 'right blade', 'framing'], powerBrands, ['sheet goods', 'straight cut', 'framing saw']),
    template('Track Saw', ['plunge saw', 'guide rail saw'], ['cut sheet goods', 'make straight cuts', 'clean plywood cuts'], ['plywood', 'MDF', 'hardwood'], ['built-ins', 'cabinets', 'floating shelves'], 'Battery or Corded', 'Intermediate', ['48 in. rail', '55 in. rail', '75 in. rail', 'plunge', 'fine finish', 'anti-chip', 'sheet goods', 'cabinet grade'], ['Makita', 'Festool', 'DeWalt', 'Milwaukee', 'Kreg', 'Bosch', 'WEN', 'Generic'], ['cut plywood', 'break down sheets', 'cabinet cuts']),
    template('Reciprocating Saw', ['sawzall', 'recip saw'], ['demolish lumber', 'cut pipe', 'cut nails'], ['wood', 'metal', 'PVC'], ['demolition', 'remodel', 'plumbing repair'], 'Battery or Corded', 'Beginner', ['compact', 'orbital action', 'one-handed', 'heavy duty', 'corded 12 amp', 'pruning blade kit', 'metal blade kit', 'demolition blade kit'], powerBrands, ['demo saw', 'cut metal', 'cut PVC']),
    template('Jigsaw', ['saber saw', 'scroll cut saw'], ['cut curves', 'cut notches', 'rough cut shapes'], ['plywood', 'lumber', 'plastic'], ['templates', 'decor', 'shelves'], 'Battery or Corded', 'Beginner', ['barrel grip', 'top handle', 'orbital', 'fine tooth blade', 'flush cut', 'scroll blade', 'compact', 'corded'], powerBrands, ['curves', 'notches', 'scroll cuts']),
    template('Miter Saw', ['chop saw', 'compound saw'], ['crosscut boards', 'miter trim', 'cut repeatable lengths'], ['lumber', 'trim', 'PVC'], ['trim', 'sawhorse', 'workbench'], 'Stationary', 'Intermediate', ['7-1/4 in.', '10 in.', '12 in.', 'sliding compound', 'dual bevel', 'stand included', 'finish blade', 'framing blade'], ['DeWalt', 'Makita', 'Milwaukee', 'Bosch', 'Ryobi', 'Metabo HPT', 'Craftsman', 'Generic'], ['trim cuts', 'repeat cuts', 'miter trim']),
    template('Table Saw', ['jobsite saw', 'bench saw'], ['rip boards', 'cut sheet goods', 'make dados'], ['lumber', 'plywood', 'hardwood'], ['cabinets', 'furniture', 'workbench'], 'Stationary', 'Advanced', ['8-1/4 in.', '10 in.', 'jobsite', 'folding stand', 'compact table', 'dado capable', 'rip fence', 'outfeed support'], ['DeWalt', 'Bosch', 'Skil', 'SawStop', 'RIDGID', 'Ryobi', 'Craftsman', 'Generic'], ['rip cut', 'sheet goods', 'cabinet cuts']),
    template('Saw Blade Set', ['circular saw blade', 'replacement blade'], ['cut plywood', 'crosscut lumber', 'rip boards'], ['plywood', 'lumber', 'hardwood'], ['shelves', 'cabinets', 'deck'], 'Manual', 'Beginner', ['6-1/2 in. 24T', '7-1/4 in. 24T', '7-1/4 in. 40T', '7-1/4 in. plywood blade', '10 in. 60T', '12 in. 80T', 'metal cutting', 'fiber cement'], sawAccessoryBrands, ['blade', 'fine tooth', 'replacement blade']),
    template('Hole Saw Kit', ['hole cutter', 'hole saw set'], ['cut round holes', 'drill pipe openings', 'install fixtures'], ['wood', 'drywall', 'metal', 'plastic'], ['door hardware', 'plumbing access', 'electrical boxes'], 'Manual', 'Beginner', ['3/4-2-1/2 in.', '1-1/4 in.', '2-1/8 in.', 'bi-metal', 'carbide', 'door lock', 'deep cut', 'mandrel kit'], sawAccessoryBrands, ['round hole', 'door lock', 'pipe opening']),
    template('Tile Saw', ['wet saw', 'tile cutter saw'], ['cut tile', 'make wet cuts', 'trim porcelain'], ['ceramic tile', 'porcelain tile', 'stone'], ['tile backsplash', 'floor tile', 'bathroom repair'], 'Stationary', 'Intermediate', ['7 in.', '10 in.', 'sliding tray', 'wet table', 'porcelain blade', 'mosaic blade', 'compact', 'stand included'], ['QEP', 'RIDGID', 'DeWalt', 'Skil', 'MK Diamond', 'Generic'], ['tile cutting', 'wet cut', 'backsplash']),
  ]),
  category('Drilling', 113, [
    template('Cordless Drill', ['drill driver', 'battery drill'], ['drill pilot holes', 'drive screws', 'countersink holes'], ['wood', 'drywall', 'plastic'], ['floating shelves', 'deck', 'workbench'], 'Battery', 'Beginner', ['12V compact', '18V', '20V MAX', 'brushless', 'hammer mode', '1/2 in. chuck', 'kit with charger', 'subcompact'], powerBrands, ['drill holes', 'pilot holes', 'dewalt drill']),
    template('Corded Drill', ['electric drill', 'corded drill driver'], ['drill pilot holes', 'drill large holes', 'mix light materials'], ['wood', 'metal', 'plastic'], ['home repair', 'shop fixtures', 'shelves'], 'Corded', 'Beginner', ['3/8 in.', '1/2 in.', '6 amp', '8 amp', 'variable speed', 'keyed chuck', 'keyless chuck', 'heavy duty'], powerBrands, ['electric drill', 'corded power', 'half inch drill']),
    template('Hammer Drill', ['masonry drill', 'percussion drill'], ['drill masonry', 'set anchors', 'drill concrete'], ['brick', 'concrete', 'block'], ['garage storage', 'outdoor fixtures', 'masonry repair'], 'Battery or Corded', 'Intermediate', ['SDS adapter', '1/2 in.', 'corded 7 amp', '20V MAX', 'M18', '18V', 'masonry bit kit', 'depth stop'], powerBrands, ['masonry drilling', 'concrete anchors', 'brick']),
    template('Rotary Hammer', ['SDS drill', 'chipper drill'], ['drill concrete', 'chip masonry', 'set anchors'], ['concrete', 'brick', 'stone'], ['concrete repair', 'demo', 'garage storage'], 'Corded', 'Advanced', ['SDS Plus', 'SDS Max', '1 in.', '1-1/8 in.', 'chisel mode', 'demo mode', 'corded', 'dust shroud'], ['Bosch', 'DeWalt', 'Milwaukee', 'Makita', 'Hilti', 'Generic'], ['drill concrete', 'sds plus', 'chipping']),
    template('Drill Bit Set', ['twist bit set', 'drill bits'], ['drill pilot holes', 'drill clean holes', 'drill metal'], ['wood', 'metal', 'plastic'], ['shelves', 'fixtures', 'jigs'], 'Manual', 'Beginner', ['1/16-1/4 in.', '1/16-3/8 in.', '1/16-1/2 in.', 'brad point', 'black oxide', 'cobalt', 'titanium', 'quick change'], ['DeWalt', 'Milwaukee', 'Bosch', 'Makita', 'Irwin', 'Ryobi', 'Generic'], ['bits', 'pilot holes', 'wood drilling']),
    template('Driver Bit Set', ['screwdriver bit set', 'impact bit set'], ['drive screws', 'install hardware', 'assemble fixtures'], ['wood', 'metal fasteners', 'drywall'], ['deck', 'cabinet hardware', 'repairs'], 'Manual', 'Beginner', ['Phillips', 'Torx', 'square drive', 'impact rated', 'magnetic holder', 'long reach', 'hex shank', 'security bit'], ['DeWalt', 'Milwaukee', 'Makita', 'Bosch', 'Irwin', 'Wiha', 'Generic'], ['driver bits', 'screw bits', 'impact bits']),
    template('Masonry Bit Set', ['concrete bit set', 'masonry drill bits'], ['drill concrete', 'drill brick', 'install anchors'], ['concrete', 'brick', 'block'], ['garage storage', 'shelving', 'outdoor fixtures'], 'Manual', 'Intermediate', ['SDS Plus', 'SDS Max', 'carbide', '1/4-1/2 in.', '3/16 in.', '5/8 in.', 'anchor kit', 'hammer drill'], ['Bosch', 'DeWalt', 'Milwaukee', 'Makita', 'Irwin', 'Generic'], ['concrete bits', 'anchors', 'drill brick']),
    template('Right Angle Drill', ['angle drill', 'close quarter drill'], ['drill tight spaces', 'drive screws in corners', 'bore between studs'], ['wood', 'drywall', 'plastic'], ['cabinets', 'plumbing access', 'electrical rough-in'], 'Battery or Corded', 'Intermediate', ['3/8 in.', '1/2 in.', 'compact head', 'M18', '20V MAX', 'corded', 'low profile', 'installer kit'], powerBrands, ['tight spaces', 'cabinet install', 'between studs']),
  ]),
  category('Fastening', 105, [
    template('Impact Driver', ['impact drill', 'screw gun'], ['drive screws', 'drive lag bolts', 'assemble frames'], ['lumber', 'deck boards', 'hardware'], ['deck', 'workbench', 'shed'], 'Battery', 'Beginner', ['12V compact', '18V', '20V MAX', 'brushless', '1/4 in. hex', 'kit with charger', 'subcompact', 'high torque'], powerBrands, ['drive screws', 'lag bolts', 'impact bits']),
    template('Impact Wrench', ['impact gun', 'air impact'], ['loosen lug nuts', 'tighten bolts', 'remove stuck fasteners'], ['metal fasteners', 'automotive'], ['oil change', 'brakes', 'machinery repair'], 'Battery or Corded', 'Intermediate', ['1/2 in. drive', '3/8 in. drive', 'mid torque', 'high torque', 'air', '20V MAX', 'M18', 'compact'], powerBrands, ['lug nuts', 'automotive', 'impact sockets']),
    template('Air Compressor Hose', ['air hose', 'pneumatic hose', 'compressor hose'], ['connect air tools', 'power pneumatic nailers', 'extend compressor reach'], ['compressed air', 'air fittings', 'pneumatic couplers'], ['trim install', 'automotive', 'shop setup'], 'Manual', 'Beginner', ['25 ft 1/4 in.', '50 ft 1/4 in.', '25 ft 3/8 in.', '50 ft 3/8 in.', '100 ft 3/8 in.', 'hybrid polymer', 'rubber', 'recoil hose'], ['Milton', 'Flexzilla', 'DeWalt', 'Husky', 'Campbell Hausfeld', 'Generic'], ['air compressor hose', 'quick coupler', 'pneumatic tools']),
    template('Brad Nailer', ['18 gauge nailer', 'finish nailer'], ['attach trim', 'pin thin boards', 'fasten moldings'], ['trim', 'plywood', 'softwood'], ['cabinet trim', 'shelves', 'molding'], 'Pneumatic', 'Intermediate', ['18 gauge', '2 in. capacity', 'oil free', 'air', 'cordless', 'narrow nose', 'depth adjust', 'no-mar tip'], ['DeWalt', 'Metabo HPT', 'Milwaukee', 'Makita', 'Porter-Cable', 'Bostitch', 'Generic'], ['trim nailer', 'brad nails', 'molding']),
    template('Finish Nailer', ['16 gauge nailer', 'trim nailer'], ['attach trim', 'fasten casing', 'install baseboards'], ['trim', 'wood', 'molding'], ['baseboards', 'door casing', 'cabinet trim'], 'Pneumatic', 'Intermediate', ['15 gauge', '16 gauge', 'angled', 'straight', '2-1/2 in. capacity', 'air', 'cordless', 'depth adjust'], ['DeWalt', 'Metabo HPT', 'Milwaukee', 'Makita', 'Porter-Cable', 'Bostitch', 'Generic'], ['finish nails', 'baseboard', 'casing']),
    template('Staple Gun', ['tacker', 'crown stapler'], ['attach fabric', 'fasten thin material', 'install screen'], ['fabric', 'screen', 'thin wood'], ['upholstery', 'screen repair', 'shop jigs'], 'Manual', 'Beginner', ['T50', 'narrow crown', 'electric', 'manual', 'pneumatic', '1/4-9/16 in.', 'heavy duty', 'upholstery'], ['Arrow', 'Stanley', 'DeWalt', 'Bostitch', 'Surebonder', 'Generic'], ['staples', 'screen repair', 'upholstery']),
    template('Socket Set', ['ratchet set', 'mechanics socket set'], ['tighten bolts', 'assemble hardware', 'remove fasteners'], ['metal fasteners', 'automotive'], ['automotive', 'bench hardware', 'furniture assembly'], 'Manual', 'Beginner', ['1/4 in. drive', '3/8 in. drive', '1/2 in. drive', 'metric', 'SAE', 'deep well', 'impact', 'spark plug'], handBrands, ['ratchet', 'nuts and bolts', 'socket wrench']),
    template('Torque Wrench', ['torque ratchet', 'click torque wrench'], ['tighten to specification', 'avoid overtightening', 'torque lug nuts'], ['bolts', 'nuts', 'automotive'], ['brakes', 'bike repair', 'machinery'], 'Manual', 'Intermediate', ['1/4 in. drive', '3/8 in. drive', '1/2 in. drive', 'inch-pound', 'foot-pound', 'beam', 'click', 'digital'], ['Tekton', 'Craftsman', 'Husky', 'Pittsburgh', 'Kobalt', 'Generic'], ['torque spec', 'lug nuts', 'precision tightening']),
  ]),
  category('Clamping', 105, [
    template('F-Style Clamp', ['f clamp', 'bar clamp'], ['clamp boards', 'hold assemblies', 'support glue-up'], ['wood', 'plywood'], ['tabletop', 'cabinet', 'frames'], 'Manual', 'Beginner', ['6 in.', '12 in.', '18 in.', '24 in.', '36 in.', '48 in.', '50 in.', 'deep reach'], clampBrands, ['glue up', 'wood clamp', 'hold work']),
    template('Quick Clamp', ['trigger clamp', 'one hand clamp'], ['hold parts', 'clamp light assemblies', 'temporary workholding'], ['wood', 'plastic', 'metal'], ['jigs', 'repairs', 'assembly'], 'Manual', 'Beginner', ['2 in.', '6 in.', '12 in.', '18 in.', '24 in.', '36 in.', 'spreader', 'mini'], clampBrands, ['quick grip', 'one hand', 'temporary clamp']),
    template('Pipe Clamp', ['pipe clamp fixture', 'panel clamp'], ['clamp wide glue-ups', 'edge glue boards', 'assemble panels'], ['wood', 'hardwood'], ['tabletop', 'bench top', 'cabinet panels'], 'Manual', 'Intermediate', ['1/2 in. pipe', '3/4 in. pipe', '36 in.', '48 in.', '60 in.', 'black pipe', 'deep jaw', 'panel glue-up'], clampBrands, ['panel glue up', 'wide clamp', 'pipe fixture']),
    template('Corner Clamp', ['right angle clamp', '90 degree clamp'], ['hold square corners', 'assemble frames', 'align cabinet boxes'], ['wood', 'plywood'], ['boxes', 'cabinet frames', 'picture frames'], 'Manual', 'Beginner', ['single corner', 'double handle', '90 degree', 'picture frame', 'cabinet assembly', 'quick release', 'mini', 'heavy duty'], clampBrands, ['square corner', 'box assembly', 'cabinet corner']),
    template('Spring Clamp', ['pinch clamp', 'small clamp'], ['hold light parts', 'temporary clamping', 'secure glue-ups'], ['wood', 'plastic', 'fabric'], ['jigs', 'small repairs', 'craft support'], 'Manual', 'Beginner', ['1 in.', '2 in.', '3 in.', '4 in.', 'rubber tip', 'metal spring', 'plastic jaw', 'set of 6'], clampBrands, ['small clamp', 'pinch clamp', 'light hold']),
    template('C-Clamp', ['g clamp', 'metal clamp'], ['clamp metal', 'hold fixtures', 'secure workpiece'], ['metal', 'wood'], ['repair', 'welding prep', 'drilling'], 'Manual', 'Beginner', ['2 in.', '3 in.', '4 in.', '6 in.', '8 in.', 'deep throat', 'locking', 'swivel pad'], clampBrands, ['metal clamp', 'secure work', 'fixture hold']),
    template('Bench Vise', ['shop vise', 'workbench vise'], ['hold boards', 'hold metal', 'clamp work'], ['wood', 'metal'], ['planing', 'filing', 'repair'], 'Manual', 'Intermediate', ['3 in.', '4 in.', '5 in.', '6 in.', 'swivel base', 'woodworking', 'pipe jaw', 'quick release'], ['Yost', 'Wilton', 'Pony', 'Irwin', 'Generic'], ['vise', 'hold metal', 'bench work']),
  ]),
  category('Measuring', 78, [
    template('Tape Measure', ['measuring tape', 'tape rule'], ['measure length', 'layout cuts', 'check fit'], ['lumber', 'rooms', 'sheet goods'], ['all projects', 'shelves', 'deck'], 'Manual', 'Beginner', ['12 ft', '16 ft', '25 ft', '30 ft', '35 ft', 'metric/imperial', 'wide blade', 'magnetic hook'], measuringBrands, ['measure', 'layout', 'room measurement']),
    template('Level', ['spirit level', 'bubble level'], ['check level', 'check plumb', 'align installations'], ['walls', 'shelves', 'cabinets'], ['floating shelves', 'cabinets', 'doors'], 'Manual', 'Beginner', ['9 in.', '24 in.', '48 in.', '72 in.', 'torpedo', 'box beam', 'magnetic', 'I-beam'], measuringBrands, ['level shelves', 'plumb', 'straight install']),
    template('Laser Level', ['cross line laser', 'laser line'], ['project level lines', 'align cabinets', 'layout tile'], ['walls', 'tile', 'cabinets'], ['shelf install', 'backsplash', 'renovation'], 'Battery', 'Intermediate', ['cross line', 'green beam', 'red beam', 'self-leveling', 'tripod', '3-plane', '360 degree', 'magnetic mount'], measuringBrands, ['laser layout', 'cabinet alignment', 'tile line']),
    template('Stud Finder', ['wall scanner', 'stud sensor'], ['find studs', 'avoid wires', 'locate framing'], ['drywall', 'walls'], ['shelf install', 'TV mount', 'cabinets'], 'Battery', 'Beginner', ['edge finder', 'center finder', 'deep scan', 'AC detect', 'metal scan', 'magnetic', 'multi-sensor', 'compact'], ['Zircon', 'Franklin Sensors', 'Bosch', 'Klein', 'Craftsman', 'Generic'], ['hang shelves', 'find studs', 'wall framing']),
    template('Digital Caliper', ['calipers', 'vernier caliper'], ['measure thickness', 'measure inside dimensions', 'measure hardware'], ['wood', 'metal', 'hardware'], ['joinery', 'hardware setup', 'repair'], 'Battery', 'Intermediate', ['6 in.', '8 in.', 'stainless', 'fractional', 'metric', 'dial', 'digital', 'inside outside'], measuringBrands, ['measure thickness', 'hardware sizing', 'precision']),
    template('Angle Finder', ['bevel gauge', 'digital angle gauge'], ['measure angles', 'set bevels', 'copy angles'], ['trim', 'lumber', 'tile'], ['miter cuts', 'stairs', 'trim'], 'Battery', 'Intermediate', ['digital', 'magnetic', 'sliding T-bevel', 'protractor', 'angle cube', 'bevel square', '12 in.', '7 in.'], measuringBrands, ['miter angle', 'bevel cut', 'trim layout']),
  ]),
  category('Sanding', 87, [
    template('Random Orbital Sander', ['orbital sander', 'ROS'], ['sand flat surfaces', 'smooth finish', 'remove swirl marks'], ['wood', 'paint', 'drywall'], ['tabletop', 'cabinet', 'shelves'], 'Battery or Corded', 'Beginner', ['5 in.', '6 in.', 'corded', 'dust bag', 'hook and loop', 'variable speed', 'brushless', 'compact'], powerBrands, ['sand wood', 'finish prep', 'sanding discs']),
    template('Belt Sander', ['portable belt sander'], ['remove material quickly', 'flatten rough boards', 'scribe edges'], ['wood', 'paint'], ['doors', 'bench tops', 'rough lumber'], 'Corded', 'Intermediate', ['3 x 18 in.', '3 x 21 in.', '4 x 24 in.', 'variable speed', 'dust bag', 'flush edge', 'heavy duty', 'portable'], ['Makita', 'DeWalt', 'Milwaukee', 'Bosch', 'WEN', 'Skil', 'Generic'], ['fast sanding', 'flatten', 'belt']),
    template('Detail Sander', ['mouse sander', 'corner sander'], ['sand corners', 'sand small profiles', 'prep trim'], ['wood', 'paint', 'trim'], ['chair repair', 'trim', 'cabinet doors'], 'Battery or Corded', 'Beginner', ['triangle pad', 'corded', '12V', '20V', 'finger attachment', 'dust bag', 'detail kit', 'compact'], powerBrands, ['corner sanding', 'detail work', 'mouse sander']),
    template('Sheet Sander', ['palm sander', 'finish sander'], ['sand flat surfaces', 'finish sand', 'prep paint'], ['wood', 'paint', 'primer'], ['furniture', 'doors', 'shelves'], 'Corded', 'Beginner', ['1/4 sheet', '1/3 sheet', '1/2 sheet', 'clamp paper', 'dust bag', 'corded', 'fine finish', 'palm grip'], powerBrands, ['finish sanding', 'sheet paper', 'paint prep']),
    template('Drywall Sander', ['pole sander', 'wall sander'], ['sand drywall compound', 'smooth wall repairs', 'prep paint'], ['drywall', 'joint compound'], ['drywall patch', 'room renovation', 'paint prep'], 'Manual', 'Beginner', ['pole', 'hand block', 'vacuum attachment', 'mesh screen', 'sponge', 'corner', 'swivel head', 'fine grit'], ['Hyde', '3M', 'Marshalltown', 'Goldblatt', 'Generic'], ['drywall patch', 'joint compound', 'dust control']),
    template('Bench Sander', ['disc sander', 'belt disc sander'], ['shape edges', 'sand curves', 'smooth small parts'], ['wood', 'plastic', 'metal'], ['shop fixtures', 'patterns', 'small parts'], 'Stationary', 'Intermediate', ['4 x 36 in.', '6 in. disc', '1 x 30 in.', 'oscillating', 'tilting table', 'dust port', 'bench top', 'combo'], ['WEN', 'Ryobi', 'Rikon', 'Grizzly', 'Generic'], ['bench sanding', 'shape edges', 'disc']),
  ]),
  category('Routing', 78, [
    template('Router', ['plunge router', 'fixed base router'], ['route edges', 'cut dados', 'make rabbets'], ['wood', 'plywood', 'laminate'], ['shelves', 'cabinets', 'tabletop'], 'Corded', 'Intermediate', ['1-3/4 hp', '2-1/4 hp', 'plunge base', 'fixed base', 'combo kit', '1/4 in. collet', '1/2 in. collet', 'variable speed'], powerBrands, ['route edges', 'dados', 'rabbets']),
    template('Trim Router', ['compact router', 'palm router'], ['round over edges', 'flush trim veneer', 'cut small profiles'], ['wood', 'laminate', 'plywood'], ['cabinet trim', 'signs', 'edge banding'], 'Battery or Corded', 'Intermediate', ['compact', 'cordless', 'corded', '1/4 in. collet', 'edge guide', 'plunge base', 'dust port', 'LED'], powerBrands, ['palm router', 'edge trim', 'flush trim']),
    template('Router Bit Set', ['router bits', 'bit set'], ['route profiles', 'cut grooves', 'shape edges'], ['wood', 'plywood', 'laminate'], ['cabinets', 'shelves', 'signs'], 'Manual', 'Intermediate', ['1/4 in. shank', '1/2 in. shank', 'straight bit', 'roundover', 'chamfer', 'rabbet', 'flush trim', 'starter set'], ['Freud', 'Bosch', 'Whiteside', 'Diablo', 'Yonico', 'Generic'], ['router bits', 'profiles', 'edge shape']),
    template('Pocket Hole Jig', ['pocket screw jig', 'pocket jig'], ['drill pocket holes', 'assemble cabinets', 'hide screws'], ['wood', 'plywood'], ['shelves', 'cabinets', 'face frames'], 'Manual', 'Beginner', ['mini', 'bench top', 'cabinet jig', 'portable', 'clamp included', 'dust port', '1-1/2 in. stock', 'repair kit'], ['Kreg', 'Milescraft', 'Massca', 'General Tools', 'Generic'], ['pocket screws', 'cabinet assembly', 'hidden fasteners']),
    template('Dado Blade Set', ['stack dado', 'dado set'], ['cut dados', 'cut grooves', 'make rabbets'], ['plywood', 'wood', 'hardwood'], ['bookcases', 'cabinets', 'shelves'], 'Manual', 'Advanced', ['6 in.', '8 in.', 'stacked', 'shim set', '1/4-13/16 in.', 'table saw', 'carbide', 'storage case'], ['Freud', 'Diablo', 'DeWalt', 'Oshlun', 'Forrest', 'Generic'], ['dado', 'groove', 'bookcase shelves']),
    template('Biscuit Joiner', ['plate joiner', 'biscuit cutter'], ['cut biscuit slots', 'align panels', 'reinforce joints'], ['wood', 'plywood'], ['tabletops', 'casework', 'face frames'], 'Corded', 'Intermediate', ['#0 biscuits', '#10 biscuits', '#20 biscuits', 'corded', 'fence adjust', 'dust bag', 'plate joiner', 'case included'], ['DeWalt', 'Makita', 'Porter-Cable', 'Ryobi', 'Generic'], ['panel alignment', 'biscuit slots', 'joinery']),
  ]),
  category('Finishing', 78, [
    template('Paint Sprayer', ['airless sprayer', 'paint gun'], ['spray paint', 'spray finish', 'coat large surfaces'], ['paint', 'stain', 'finish'], ['fence', 'cabinets', 'furniture'], 'Corded', 'Advanced', ['HVLP', 'airless', 'cup gun', 'detail finish', 'latex capable', 'stain capable', '1 qt cup', 'fine finish tip'], ['Wagner', 'Graco', 'Fuji', 'Homeright', 'Generic'], ['paint finish', 'spray cabinets', 'fence paint']),
    template('Caulk Gun', ['sealant gun', 'cartridge gun'], ['apply caulk', 'seal gaps', 'apply adhesive'], ['caulk', 'sealant', 'adhesive'], ['bathroom repair', 'trim', 'weatherproofing'], 'Manual', 'Beginner', ['10 oz', 'dripless', 'smooth rod', 'ratchet rod', 'high thrust', 'quart tube', 'sausage pack', 'compact'], ['Newborn', 'Dripless', 'Milwaukee', 'DeWalt', 'Generic'], ['caulking', 'sealant', 'bathroom']),
    template('Paint Roller Frame', ['roller handle', 'paint roller'], ['roll paint', 'coat walls', 'apply primer'], ['paint', 'primer', 'walls'], ['room painting', 'garage paint', 'cabinet primer'], 'Manual', 'Beginner', ['4 in.', '6 in.', '9 in.', '18 in.', 'extension pole', 'smooth surface', 'semi-rough', 'heavy duty'], ['Wooster', 'Purdy', 'Shur-Line', 'Bates', 'Generic'], ['paint walls', 'roller cover', 'primer']),
    template('Paint Brush Set', ['finish brush', 'brush set'], ['apply paint', 'cut in edges', 'apply finish'], ['paint', 'stain', 'finish'], ['trim painting', 'furniture', 'touch-ups'], 'Manual', 'Beginner', ['1 in.', '1-1/2 in.', '2 in.', '2-1/2 in.', '3 in.', 'angled sash', 'natural bristle', 'synthetic'], ['Purdy', 'Wooster', 'Bates', 'Zibra', 'Generic'], ['cut in', 'trim paint', 'brush finish']),
    template('Heat Gun', ['hot air gun', 'paint remover'], ['soften finish', 'shrink tubing', 'remove adhesive'], ['paint', 'plastic', 'vinyl'], ['refinishing', 'electrical', 'floor repair'], 'Corded', 'Beginner', ['dual temp', 'variable temp', 'nozzle kit', 'paint removal', 'shrink tube', 'scraper kit', 'corded', 'compact'], powerBrands, ['remove paint', 'heat shrink', 'soften adhesive']),
    template('Putty Knife', ['spackle knife', 'scraper knife'], ['spread filler', 'scrape surfaces', 'patch drywall'], ['spackle', 'drywall', 'paint'], ['drywall patch', 'paint prep', 'trim repair'], 'Manual', 'Beginner', ['1 in.', '2 in.', '3 in.', '4 in.', '6 in.', 'flexible', 'stiff', 'stainless'], ['Hyde', 'Warner', 'Purdy', 'Husky', 'Generic'], ['patch wall', 'spackle', 'scrape']),
  ]),
  category('Safety', 87, [
    template('Shop Vac', ['wet dry vac', 'vacuum'], ['collect dust', 'clean workspace', 'extract debris'], ['dust', 'chips', 'water'], ['all projects', 'sanding', 'cleanup'], 'Corded', 'Beginner', ['2 gal', '4 gal', '6 gal', '9 gal', '12 gal', '14 gal', '16 gal', 'HEPA filter'], ['RIDGID', 'Shop-Vac', 'DeWalt', 'Craftsman', 'Milwaukee', 'Vacmaster', 'Generic'], ['dust control', 'wet dry', 'shop vacuum']),
    template('Dust Separator', ['cyclone separator', 'dust deputy'], ['separate chips', 'protect vacuum filter', 'improve dust collection'], ['wood chips', 'dust'], ['shop cleanup', 'sanding', 'routing'], 'Manual', 'Beginner', ['5 gal bucket', 'cyclone lid', '2-1/2 in. port', '1-7/8 in. port', 'wall mount', 'bucket kit', 'shop vac adapter', 'anti-static'], ['Dust Deputy', 'Cen-Tec', 'POWERTEC', 'Rockler', 'Generic'], ['cyclone', 'shop vac filter', 'dust collection']),
    template('Respirator', ['dust mask', 'half mask'], ['filter dust', 'filter fumes', 'protect lungs'], ['dust', 'finish vapors', 'paint'], ['sanding', 'finishing', 'demo'], 'Manual', 'Beginner', ['N95', 'P100', 'half face', 'organic vapor', 'paint cartridge', 'medium', 'large', 'disposable'], safetyBrands, ['ppe', 'dust', 'paint fumes']),
    template('Safety Glasses', ['eye protection', 'shop glasses'], ['protect eyes', 'block chips', 'reduce dust exposure'], ['wood chips', 'metal chips', 'dust'], ['all projects', 'sawing', 'drilling'], 'Manual', 'Beginner', ['clear lens', 'anti-fog', 'tinted', 'over glasses', 'wraparound', 'gasketed', 'reader lens', 'scratch resistant'], safetyBrands, ['ppe', 'eye protection', 'chips']),
    template('Hearing Protection', ['ear muffs', 'ear plugs'], ['reduce noise exposure', 'protect hearing', 'work near loud tools'], ['noise', 'sawing', 'routing'], ['table saw', 'miter saw', 'planer'], 'Manual', 'Beginner', ['ear muffs', 'foam plugs', 'electronic', 'bluetooth', 'NRR 25', 'NRR 30', 'folding', 'corded plugs'], safetyBrands, ['ppe', 'noise', 'loud tools']),
    template('Extension Cord', ['power cord', 'outdoor cord'], ['extend power', 'power corded tools', 'support outdoor work'], ['electric tools', 'lights'], ['yard work', 'renovation', 'shop setup'], 'Manual', 'Beginner', ['25 ft 12/3', '50 ft 12/3', '100 ft 12/3', '25 ft 14/3', '50 ft 14/3', 'outdoor rated', 'lighted end', 'GFCI'], ['Southwire', 'Woods', 'Yellow Jacket', 'Ridgid', 'Generic'], ['corded tools', 'power', 'outdoor rated']),
  ]),
  category('Ladders / Handling', 70, [
    template('Step Ladder', ['folding ladder', 'A-frame ladder'], ['reach overhead work', 'paint walls', 'install fixtures'], ['rooms', 'walls', 'ceilings'], ['painting', 'lighting', 'shelf install'], 'Manual', 'Beginner', ['4 ft', '6 ft', '8 ft', '10 ft', 'fiberglass', 'aluminum', 'platform top', 'multi-position'], handlingBrands, ['ladder', 'reach ceiling', 'paint room']),
    template('Extension Ladder', ['tall ladder', 'telescoping ladder'], ['reach exterior work', 'clean gutters', 'access roof edge'], ['exterior walls', 'gutters', 'roof edge'], ['gutter cleaning', 'exterior painting', 'tree trimming'], 'Manual', 'Intermediate', ['16 ft', '20 ft', '24 ft', '28 ft', '32 ft', 'fiberglass', 'aluminum', 'telescoping', 'stabilizer'], handlingBrands, ['roof access', 'gutters', 'tall ladder']),
    template('Hand Truck', ['dolly', 'two wheel dolly'], ['move boxes', 'move tools', 'transport heavy items'], ['boxes', 'appliances', 'materials'], ['moving', 'shop setup', 'material handling'], 'Manual', 'Beginner', ['600 lb', '800 lb', 'convertible', 'pneumatic tires', 'folding', 'appliance strap', 'stair climber', 'compact'], handlingBrands, ['move heavy', 'dolly', 'material handling']),
    template('Appliance Dolly', ['appliance hand truck', 'moving dolly'], ['move appliances', 'move heavy cabinets', 'support stairs'], ['appliances', 'cabinets', 'furniture'], ['moving', 'kitchen remodel', 'shop setup'], 'Manual', 'Intermediate', ['strap', 'stair climber', '800 lb', '1000 lb', 'pneumatic tires', 'rubber belt', 'heavy duty', 'rental style'], handlingBrands, ['move refrigerator', 'heavy appliance', 'stairs']),
    template('Sawhorse Pair', ['folding sawhorses', 'work support'], ['support boards', 'support sheet goods', 'create work surface'], ['lumber', 'plywood', 'doors'], ['cutting', 'assembly', 'painting'], 'Manual', 'Beginner', ['folding', 'metal legs', 'plastic', 'adjustable height', '2x4 brackets', '1000 lb', 'compact', 'wide top'], handlingBrands, ['support plywood', 'cut lumber', 'work support']),
  ]),
  category('Plumbing', 96, [
    template('Pipe Wrench', ['plumber wrench', 'monkey wrench'], ['turn pipe fittings', 'loosen plumbing', 'hold pipe'], ['pipe', 'galvanized pipe', 'iron pipe'], ['plumbing repair', 'gas pipe prep', 'fixture repair'], 'Manual', 'Beginner', ['10 in.', '12 in.', '14 in.', '18 in.', '24 in.', 'aluminum', 'steel', 'offset'], plumbingBrands, ['pipe fitting', 'plumber', 'sink repair']),
    template('Basin Wrench', ['sink wrench', 'faucet wrench'], ['tighten faucet nuts', 'reach under sinks', 'remove faucet hardware'], ['plumbing fixtures', 'faucets'], ['sink repair', 'faucet install', 'bathroom repair'], 'Manual', 'Intermediate', ['telescoping', '11 in.', '17 in.', 'spring jaw', 'LED handle', 'faucet nut', 'compact', 'heavy duty'], plumbingBrands, ['sink repair', 'faucet install', 'under sink']),
    template('Tubing Cutter', ['pipe cutter', 'tube cutter'], ['cut copper pipe', 'cut plastic tubing', 'cut PEX'], ['copper', 'PEX', 'PVC'], ['plumbing repair', 'fixture install', 'water line'], 'Manual', 'Beginner', ['1/8-1-1/8 in.', '1/4-2 in.', 'mini', 'ratcheting', 'copper', 'PVC', 'PEX', 'quick adjust'], plumbingBrands, ['cut pipe', 'copper pipe', 'PEX']),
    template('PEX Crimp Tool', ['PEX clamp tool', 'crimp ring tool'], ['crimp PEX rings', 'install water lines', 'secure fittings'], ['PEX', 'brass fittings', 'water line'], ['plumbing repair', 'bathroom remodel', 'fixture install'], 'Manual', 'Intermediate', ['1/2 in.', '3/4 in.', '1 in.', 'cinch clamp', 'crimp ring', 'go/no-go gauge', 'multi-size', 'ratcheting'], plumbingBrands, ['pex', 'water line', 'crimp rings']),
    template('Drain Snake', ['drain auger', 'plumbing snake'], ['clear drains', 'remove clogs', 'snake pipes'], ['drains', 'pipe', 'hair clogs'], ['sink repair', 'tub drain', 'home repair'], 'Manual', 'Intermediate', ['15 ft', '25 ft', '50 ft', 'drum auger', 'toilet auger', 'flat tape', 'hand crank', 'powered'], plumbingBrands, ['clog', 'sink drain', 'tub drain']),
    template('Flaring Tool', ['tube flaring kit', 'brake line flare'], ['flare tubing', 'make compression flares', 'repair lines'], ['copper', 'brake line', 'soft metal tubing'], ['plumbing repair', 'automotive lines', 'HVAC'], 'Manual', 'Intermediate', ['single flare', 'double flare', '45 degree', '3/16-5/8 in.', 'clamp bar', 'deburring tool', 'mini cutter', 'case'], plumbingBrands, ['flare pipe', 'brake line', 'copper tubing']),
  ]),
  category('Electrical', 87, [
    template('Multimeter', ['volt meter', 'DMM'], ['measure voltage', 'test continuity', 'check resistance'], ['wire', 'circuits', 'batteries'], ['electrical repair', 'automotive', 'diagnostics'], 'Battery', 'Intermediate', ['auto ranging', 'manual ranging', 'clamp meter', 'CAT III', 'continuity buzzer', 'temperature probe', '600V', 'pocket'], electricalBrands, ['voltage', 'continuity', 'electrical testing']),
    template('Voltage Tester', ['non contact tester', 'NCVT'], ['detect live wires', 'check outlets', 'verify power off'], ['wire', 'outlets', 'switches'], ['electrical safety', 'fixture install', 'outlet repair'], 'Battery', 'Beginner', ['non-contact', 'dual range', 'GFCI', 'receptacle tester', 'pen style', 'flashlight', 'audible alert', 'low voltage'], electricalBrands, ['live wire', 'outlet tester', 'electrical safety']),
    template('Wire Stripper', ['wire cutter stripper', 'strippers'], ['strip wire', 'cut wire', 'prep conductors'], ['wire', 'cable'], ['outlets', 'fixtures', 'automotive wiring'], 'Manual', 'Beginner', ['10-18 AWG', '12-20 AWG', 'automatic', 'self-adjusting', 'NM cable', 'coax stripper', 'crimper combo', 'precision'], electricalBrands, ['strip wire', 'cut wire', 'fixture wiring']),
    template('Fish Tape', ['wire puller', 'fish wire'], ['pull wire through walls', 'route cable', 'fish conduit'], ['wire', 'conduit', 'walls'], ['renovation', 'fixture install', 'network cable'], 'Manual', 'Intermediate', ['25 ft', '50 ft', '100 ft', 'steel', 'fiberglass', 'low friction', 'case reel', 'glow rods'], electricalBrands, ['pull wire', 'run cable', 'inside wall']),
    template('Crimping Tool', ['wire crimper', 'terminal crimper'], ['crimp connectors', 'terminate wires', 'repair cables'], ['wire connectors', 'terminals'], ['automotive', 'electrical repair', 'low voltage'], 'Manual', 'Intermediate', ['insulated terminal', 'non-insulated', 'ratcheting', 'ferrule', 'coax', 'RJ45', 'heat shrink', 'multi-die'], electricalBrands, ['wire terminals', 'crimp connectors', 'low voltage']),
    template('Conduit Bender', ['EMT bender', 'pipe bender'], ['bend conduit', 'route electrical pipe', 'make offsets'], ['EMT conduit', 'metal conduit'], ['garage wiring', 'shop electrical', 'renovation'], 'Manual', 'Intermediate', ['1/2 in. EMT', '3/4 in. EMT', '1 in. EMT', 'aluminum head', 'steel handle', 'offset guide', 'degree marks', 'rigid conduit'], electricalBrands, ['bend conduit', 'emt', 'electrical pipe']),
  ]),
  category('Masonry / Tile / Drywall', 113, [
    template('Demolition Hammer', ['demo hammer', 'chipping hammer'], ['break concrete', 'remove tile', 'chip masonry'], ['concrete', 'tile', 'mortar'], ['demo', 'floor removal', 'masonry repair'], 'Corded', 'Advanced', ['SDS Max', '1-1/8 in.', '11 amp', '15 amp', 'tile chisel', 'point chisel', 'cart included', 'heavy duty'], ['Bosch', 'DeWalt', 'Milwaukee', 'Makita', 'Hilti', 'Generic'], ['break concrete', 'remove tile', 'demo']),
    template('Tile Cutter', ['manual tile cutter', 'score snap cutter'], ['score tile', 'snap ceramic tile', 'trim tile'], ['ceramic tile', 'porcelain tile'], ['backsplash', 'floor tile', 'bathroom repair'], 'Manual', 'Beginner', ['14 in.', '20 in.', '24 in.', '36 in.', 'porcelain wheel', 'rip guide', 'diagonal guide', 'portable'], masonryBrands, ['tile cut', 'backsplash', 'score tile']),
    template('Grout Saw', ['grout remover', 'grout rake'], ['remove grout', 'prep tile repair', 'clean joints'], ['grout', 'tile'], ['tile repair', 'bathroom repair', 'backsplash'], 'Manual', 'Beginner', ['carbide blade', 'diamond blade', 'handheld', 'replacement blade', 'narrow joint', 'wide joint', 'oscillating blade', 'ergonomic'], masonryBrands, ['remove grout', 'tile repair', 'bathroom']),
    template('Drywall Saw', ['jab saw', 'keyhole saw'], ['cut drywall', 'open wall cavities', 'trim panels'], ['drywall', 'plasterboard'], ['drywall patch', 'electrical box', 'plumbing access'], 'Manual', 'Beginner', ['6 in.', 'folding', 'jab point', 'utility blade', 'rasp edge', 'bi-metal', 'compact', 'sheath'], masonryBrands, ['drywall patch', 'cut wall', 'keyhole']),
    template('Taping Knife', ['drywall knife', 'joint knife'], ['spread joint compound', 'tape seams', 'finish drywall'], ['drywall compound', 'joint tape'], ['drywall patch', 'room renovation', 'paint prep'], 'Manual', 'Beginner', ['4 in.', '6 in.', '8 in.', '10 in.', '12 in.', 'stainless', 'blue steel', 'corner knife'], masonryBrands, ['joint compound', 'drywall mud', 'patch wall']),
    template('Floor Scraper', ['floor stripper', 'razor scraper'], ['remove flooring', 'scrape adhesive', 'prep subfloor'], ['vinyl', 'adhesive', 'tile'], ['floor repair', 'demo', 'remodel'], 'Manual', 'Intermediate', ['4 in.', '7 in.', '14 in.', 'long handle', 'razor blade', 'heavy duty', 'replaceable blade', 'chisel edge'], masonryBrands, ['remove flooring', 'scrape glue', 'subfloor']),
    template('Masonry Trowel', ['brick trowel', 'pointing trowel'], ['spread mortar', 'point joints', 'patch masonry'], ['mortar', 'brick', 'concrete'], ['masonry repair', 'pavers', 'brickwork'], 'Manual', 'Intermediate', ['pointing', 'margin', 'brick', 'notched', 'pool trowel', '6 in.', '10 in.', '12 in.'], masonryBrands, ['mortar', 'brick repair', 'concrete patch']),
  ]),
  category('Outdoor / Yard', 113, [
    template('Pressure Washer', ['power washer', 'electric washer'], ['clean surfaces', 'wash decks', 'remove grime'], ['decking', 'concrete', 'siding'], ['deck prep', 'driveway cleaning', 'house wash'], 'Corded', 'Beginner', ['1600 PSI', '1800 PSI', '2000 PSI', '2300 PSI', 'surface cleaner', 'foam cannon', 'hose reel', 'electric'], ['Ryobi', 'Greenworks', 'DeWalt', 'Sun Joe', 'Karcher', 'Generic'], ['wash deck', 'clean concrete', 'outdoor cleaning']),
    template('Post Hole Digger', ['post digger', 'manual auger'], ['dig post holes', 'set posts', 'plant shrubs'], ['soil', 'clay', 'gravel'], ['fence', 'deck', 'garden bed'], 'Manual', 'Intermediate', ['6 in.', '8 in.', '10 in.', 'clamshell', 'auger', 'long handle', 'fiberglass handle', 'heavy duty'], outdoorBrands, ['fence post', 'deck posts', 'soil']),
    template('Tamper', ['hand tamper', 'compactor'], ['compact soil', 'level gravel', 'prep pavers'], ['soil', 'gravel', 'sand'], ['paver patio', 'garden path', 'fence post'], 'Manual', 'Beginner', ['8 x 8 in.', '10 x 10 in.', '12 x 12 in.', 'steel handle', 'wood handle', 'cast iron', 'long handle', 'heavy duty'], outdoorBrands, ['compact gravel', 'pavers', 'level soil']),
    template('Lawn Aerator', ['yard aerator', 'core aerator'], ['aerate lawn', 'reduce compaction', 'prep overseeding'], ['grass', 'soil'], ['yard maintenance', 'lawn repair', 'garden prep'], 'Manual', 'Intermediate', ['spike shoes', 'rolling spike', 'core plug', 'tow behind', 'manual step', '36 in.', 'compact', 'weighted'], outdoorBrands, ['lawn care', 'grass', 'soil compaction']),
    template('Pruning Saw', ['tree saw', 'folding saw'], ['cut branches', 'trim limbs', 'prune shrubs'], ['green wood', 'branches'], ['yard work', 'tree trimming', 'garden maintenance'], 'Manual', 'Beginner', ['7 in.', '10 in.', '13 in.', 'folding', 'curved blade', 'straight blade', 'pole compatible', 'sheath'], outdoorBrands, ['branches', 'tree trimming', 'prune']),
    template('Hedge Trimmer', ['shrub trimmer', 'hedger'], ['trim hedges', 'shape shrubs', 'cut light branches'], ['shrubs', 'hedges', 'green wood'], ['yard maintenance', 'landscaping', 'cleanup'], 'Battery or Corded', 'Beginner', ['18 in.', '20 in.', '22 in.', '24 in.', 'corded', '40V', '20V', 'dual action'], outdoorBrands, ['trim hedge', 'landscaping', 'yard tool']),
    template('Wheelbarrow', ['garden cart', 'yard cart'], ['move soil', 'move mulch', 'haul debris'], ['soil', 'mulch', 'gravel'], ['garden beds', 'cleanup', 'landscaping'], 'Manual', 'Beginner', ['4 cu ft', '6 cu ft', 'steel tray', 'poly tray', 'dual wheel', 'flat-free tire', 'garden cart', 'contractor'], outdoorBrands, ['move soil', 'mulch', 'yard hauling']),
  ]),
  category('Automotive', 113, [
    template('Floor Jack', ['car jack', 'hydraulic jack'], ['lift vehicle', 'support maintenance setup', 'raise car'], ['vehicle', 'automotive'], ['oil change', 'brakes', 'tire rotation'], 'Manual', 'Intermediate', ['2 ton', '2.5 ton', '3 ton', 'low profile', 'aluminum', 'rapid pump', 'long reach', 'SUV'], automotiveBrands, ['lift car', 'oil change', 'brake job']),
    template('Jack Stands', ['vehicle stands', 'axle stands'], ['support vehicle safely', 'hold car raised', 'stabilize work'], ['vehicle', 'automotive'], ['oil change', 'brakes', 'suspension'], 'Manual', 'Intermediate', ['2 ton pair', '3 ton pair', '6 ton pair', 'pin lock', 'ratchet lock', 'wide base', 'low profile', 'SUV'], automotiveBrands, ['support car', 'safety', 'vehicle stands']),
    template('Oil Filter Wrench', ['filter wrench', 'oil wrench'], ['remove oil filter', 'tighten filter', 'perform oil change'], ['oil filter', 'automotive'], ['oil change', 'vehicle maintenance'], 'Manual', 'Beginner', ['cap style', 'strap', 'pliers', '3-jaw', '2-1/2 in.', '3-1/2 in.', 'universal', 'Toyota style'], automotiveBrands, ['oil change', 'filter removal', 'car maintenance']),
    template('Battery Charger', ['trickle charger', 'maintainer'], ['charge car battery', 'maintain battery', 'jump support'], ['battery', 'vehicle'], ['automotive', 'winter prep', 'battery maintenance'], 'Corded', 'Beginner', ['2 amp', '6V/12V', '10 amp', 'smart charger', 'maintainer', 'AGM', 'lithium mode', 'clamp leads'], automotiveBrands, ['car battery', 'maintainer', 'dead battery']),
    template('Tire Inflator', ['air inflator', 'portable compressor'], ['inflate tires', 'check pressure', 'top off air'], ['tires', 'sports balls', 'air'], ['vehicle care', 'bike tire', 'road trip'], 'Battery or Corded', 'Beginner', ['12V car plug', '20V', 'M18', 'cordless', 'digital gauge', '150 PSI', 'hose kit', 'auto shutoff'], automotiveBrands, ['inflate tire', 'air pressure', 'vehicle care']),
    template('OBD-II Scanner', ['code reader', 'diagnostic scanner'], ['read vehicle codes', 'diagnose check engine', 'clear codes'], ['vehicle electronics', 'OBD port'], ['automotive troubleshooting', 'used car check'], 'Battery', 'Beginner', ['Bluetooth', 'handheld', 'live data', 'ABS capable', 'SRS capable', 'freeze frame', 'app connected', 'basic code'], automotiveBrands, ['check engine', 'diagnostic', 'car codes']),
    template('Gear Puller', ['bearing puller', 'pulley puller'], ['pull gears', 'remove bearings', 'remove pulleys'], ['metal parts', 'automotive'], ['automotive repair', 'small engines', 'machinery'], 'Manual', 'Intermediate', ['2 jaw', '3 jaw', '4 in.', '6 in.', '8 in.', 'reversible', 'slide hammer', 'pitman arm'], automotiveBrands, ['pull bearing', 'remove pulley', 'mechanical']),
  ]),
  category('Specialty', 52, [
    template('Rotary Tool', ['dremel', 'multi rotary tool'], ['grind small parts', 'cut detail work', 'polish surfaces'], ['wood', 'metal', 'plastic'], ['repair', 'craft support', 'detail work'], 'Battery or Corded', 'Beginner', ['corded', '12V', 'variable speed', 'flex shaft', 'cutoff wheel kit', 'sanding drum', 'engraving bit', 'polishing kit'], specialtyBrands, ['dremel', 'detail grinding', 'cutoff wheel']),
    template('Inspection Camera', ['borescope', 'boroscope'], ['inspect walls', 'inspect pipes', 'see hidden spaces'], ['walls', 'pipes', 'vehicles'], ['plumbing access', 'automotive diagnostics', 'renovation'], 'Battery', 'Intermediate', ['9 mm camera', '16 ft cable', 'WiFi', 'USB-C', 'screen included', 'LED light', 'waterproof probe', 'magnet hook'], specialtyBrands, ['inside wall', 'pipe inspection', 'hidden space']),
    template('Soldering Iron', ['soldering station', 'electronics iron'], ['solder wires', 'repair electronics', 'join small metal'], ['wire', 'electronics', 'solder'], ['electrical repair', 'small appliance repair', 'hobby'], 'Corded', 'Intermediate', ['30W', '60W', 'temperature controlled', 'station', 'fine tip', 'chisel tip', 'stand included', 'desoldering pump'], specialtyBrands, ['solder wire', 'electronics repair', 'heat tip']),
    template('Metal Detector', ['utility locator', 'detector'], ['locate metal', 'find buried hardware', 'scan soil'], ['soil', 'metal'], ['yard work', 'utility caution', 'lost hardware'], 'Battery', 'Beginner', ['waterproof coil', 'pinpointer', 'LCD display', 'beginner', 'deep scan', 'discrimination mode', 'folding', 'headphones'], specialtyBrands, ['find metal', 'yard search', 'buried hardware']),
  ]),
]

export function buildPublicInventoryExpansion(): PublicInventoryExpansionSeed {
  const familyMap = new Map<string, ToolFamily>()
  const toolTypeMap = new Map<string, ToolType>()
  const aliasMap = new Map<string, ToolAlias>()
  const brandMap = new Map<string, Brand>()
  const batteryPlatformMap = new Map<string, BatteryPlatform>()
  const capabilityMap = new Map<string, Capability>()
  const typeCapabilityMap = new Map<string, ToolTypeCapability>()
  const catalogItemMap = new Map<string, ToolCatalogItem>()
  const specs = new Map<string, ToolCatalogSpec>()
  const sourceNotes = new Map<string, ToolCatalogSourceNote>()
  const publicCatalogItemIds: string[] = []

  for (const plan of expansionCategories) {
    const familyId = slugify(plan.category)
    familyMap.set(familyId, {
      id: familyId,
      name: plan.category,
      category: plan.category,
      description: `${plan.category} tools curated from public tool-library inventories for BenchOS catalog search and readiness.`,
      createdAt: today,
      updatedAt: today,
    })

    const candidates = plan.templates.flatMap((item) => makeCandidates(item))
    if (candidates.length < plan.target) {
      throw new Error(`Public inventory expansion for ${plan.category} only produced ${candidates.length} candidates for target ${plan.target}.`)
    }

    candidates.slice(0, plan.target).forEach((candidate, index) => {
      const templateItem = candidate.template
      const toolTypeId = slugify(templateItem.name)
      const catalogItemId = publicCatalogItemIdFor(toolTypeId, candidate.displayName)
      const source = PUBLIC_INVENTORY_SOURCES[(index + plan.category.length) % PUBLIC_INVENTORY_SOURCES.length]
      const extraSource = index % 9 === 0 ? PUBLIC_INVENTORY_SOURCES[(index + plan.category.length + 1) % PUBLIC_INVENTORY_SOURCES.length] : undefined

      if (!toolTypeMap.has(toolTypeId)) {
        toolTypeMap.set(toolTypeId, {
          id: toolTypeId,
          name: templateItem.name,
          category: templateItem.category,
          familyId,
          description: `${templateItem.name} supports ${templateItem.capabilities.slice(0, 2).join(' and ')} for ${templateItem.commonProjects.slice(0, 2).join(' and ')} work.`,
          materials: templateItem.materials,
          commonProjects: templateItem.commonProjects,
          powerType: templateItem.powerType,
          skillLevel: templateItem.skillLevel,
          safety: defaultSafety(templateItem.powerType),
          createdAt: today,
          updatedAt: today,
        })
      }

      for (const alias of templateItem.aliases) {
        aliasMap.set(`${toolTypeId}-alias-${slugify(alias)}`, { id: `${toolTypeId}-alias-${slugify(alias)}`, toolTypeId, alias })
      }

      templateItem.capabilities.forEach((capabilityName, capabilityIndex) => {
        const capabilityId = slugify(capabilityName)
        if (!capabilityMap.has(capabilityId)) {
          capabilityMap.set(capabilityId, {
            id: capabilityId,
            name: capabilityName,
            description: `Ability to ${capabilityName} during workshop projects.`,
            materials: templateItem.materials,
            projectTypes: templateItem.commonProjects,
          })
        }
        typeCapabilityMap.set(`${toolTypeId}-capability-${capabilityId}`, {
          id: `${toolTypeId}-capability-${capabilityId}`,
          toolTypeId,
          capabilityId,
          strength: capabilityIndex === 0 ? 'primary' : 'secondary',
        })
      })

      const brandId = slugify(candidate.brand)
      if (!brandMap.has(brandId)) {
        brandMap.set(brandId, {
          id: brandId,
          name: candidate.brand,
          aliases: brandAliases(candidate.brand),
          createdAt: today,
          updatedAt: today,
        })
      }

      const batteryPlatform = inferBatteryPlatform(candidate.brand, candidate.displayName, templateItem.powerType)
      if (batteryPlatform && !batteryPlatformMap.has(slugify(batteryPlatform))) {
        batteryPlatformMap.set(slugify(batteryPlatform), {
          id: slugify(batteryPlatform),
          brand: candidate.brand,
          name: batteryPlatform,
          voltage: inferVoltage(batteryPlatform),
          aliases: brandAliases(candidate.brand).map((alias) => `${alias} ${inferVoltage(batteryPlatform) ?? 'battery'}`),
          createdAt: today,
          updatedAt: today,
        })
      }

      const sourceNoteIds = [sourceNoteIdFor(catalogItemId, source)]
      const extraSourceNoteIds = extraSource ? [sourceNoteIdFor(catalogItemId, extraSource)] : []
      const priorityLabels = templateItem.priorityLabels ?? priorityLabelsForTemplate(templateItem)
      const tagInputs = [
        candidate.displayName,
        candidate.brand,
        candidate.model ?? '',
        templateItem.name,
        templateItem.category,
        templateItem.powerType,
        batteryPlatform ?? '',
        ...templateItem.aliases,
        ...templateItem.capabilities,
        ...templateItem.materials,
        ...templateItem.commonProjects,
        ...templateItem.tags,
        ...candidate.tags,
        ...priorityLabels,
      ]
      const searchTags = buildCatalogSearchTags({
        brand: candidate.brand,
        model: candidate.model,
        displayName: candidate.displayName,
        toolTypeName: templateItem.name,
        aliases: templateItem.aliases,
        capabilities: templateItem.capabilities,
        materials: templateItem.materials,
        commonProjects: templateItem.commonProjects,
        category: templateItem.category,
        powerType: templateItem.powerType,
        batteryPlatform,
        specs: candidate.specLabel ? [candidate.specLabel] : [],
        extraTags: tagInputs,
      })

      catalogItemMap.set(catalogItemId, {
        id: catalogItemId,
        internalToolTypeId: toolTypeId,
        familyId,
        brand: candidate.brand,
        model: candidate.model,
        displayName: candidate.displayName,
        powerType: templateItem.powerType,
        batteryPlatform,
        voltage: batteryPlatform ? inferVoltage(batteryPlatform) : undefined,
        cordedOrCordless: cordedState(templateItem.powerType),
        costTier: inferCostTier(candidate.brand, candidate.displayName),
        compatibilityTags: buildCompatibilityTags(candidate.brand, batteryPlatform, templateItem.powerType, templateItem.name, candidate.specLabel),
        priorityLabels,
        searchTags,
        sourceNoteIds: [...sourceNoteIds, ...extraSourceNoteIds],
        createdAt: today,
        updatedAt: today,
      })
      publicCatalogItemIds.push(catalogItemId)

      addSourceNote(sourceNotes, catalogItemId, source, candidate, templateItem, toolTypeId)
      if (extraSource) addSourceNote(sourceNotes, catalogItemId, extraSource, candidate, templateItem, toolTypeId)

      if (candidate.specLabel) {
        specs.set(`${catalogItemId}-spec-observed`, {
          id: `${catalogItemId}-spec-observed`,
          catalogItemId,
          key: 'observedSpec',
          label: 'Observed size/spec',
          value: candidate.specLabel,
          createdAt: today,
          updatedAt: today,
        })
      }
    })
  }

  const support = buildSupportSeeds()

  return {
    toolFamilies: [...familyMap.values()],
    toolTypes: [...toolTypeMap.values()],
    toolAliases: [...aliasMap.values()],
    brands: [...brandMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
    batteryPlatforms: [...batteryPlatformMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
    toolCatalogItems: [...catalogItemMap.values()],
    toolCatalogSpecs: [...specs.values()],
    toolCatalogSourceNotes: [...sourceNotes.values()],
    capabilities: [...capabilityMap.values()],
    toolTypeCapabilities: [...typeCapabilityMap.values()],
    toolAccessories: support.toolAccessories,
    toolConsumables: support.toolConsumables,
    toolCompatibilityRules: support.toolCompatibilityRules,
    publicCatalogItemIds: [...new Set(publicCatalogItemIds)],
  }
}

export function buildCatalogSearchTags(input: {
  brand: string
  model?: string
  displayName: string
  toolTypeName: string
  aliases: string[]
  capabilities: string[]
  materials: string[]
  commonProjects: string[]
  category: string
  powerType: PowerType
  batteryPlatform?: string
  specs?: string[]
  extraTags?: string[]
}) {
  const tags = new Set<string>()
  const add = (value?: string) => {
    const normalized = normalizeSearchTag(value)
    if (normalized) tags.add(normalized)
  }

  add(input.displayName)
  add(input.brand)
  add(input.model)
  add(input.toolTypeName)
  add(`${input.brand} ${input.toolTypeName}`)
  for (const alias of input.aliases) {
    add(alias)
    add(`${input.brand} ${alias}`)
  }
  for (const alias of brandAliases(input.brand)) add(alias)
  if (input.model) add(`${input.brand} ${input.model}`)
  if (input.batteryPlatform) add(input.batteryPlatform)
  add(input.category)
  add(input.powerType)
  input.capabilities.forEach(add)
  input.materials.forEach(add)
  input.commonProjects.forEach(add)
  input.specs?.forEach((spec) => {
    add(spec)
    add(`${spec} ${input.toolTypeName}`)
    if (spec.includes('1/2')) add(`half inch ${input.toolTypeName}`)
    if (spec.includes('1/4')) add(`quarter inch ${input.toolTypeName}`)
    if (spec.includes('3/8')) add(`three eighths ${input.toolTypeName}`)
  })
  input.extraTags?.forEach(add)

  const fallbackTags = [
    `${input.toolTypeName} tool`,
    `${input.category} tool`,
    `${input.toolTypeName} project`,
    `${input.toolTypeName} accessory`,
    `${input.brand} tool`,
    ...input.commonProjects.map((project) => `${project} tool`),
  ]
  fallbackTags.forEach(add)

  return [...tags].slice(0, 48)
}

function makeCandidates(templateItem: ExpansionTemplate): Candidate[] {
  const brands = templateItem.brands ?? brandPoolFor(templateItem)
  const candidates: Candidate[] = []

  for (const brand of brands) {
    if (brand === 'Generic') continue
    const descriptor = brandDescriptor(brand, templateItem.powerType)
    const displayName = [brand, descriptor, templateItem.name].filter(Boolean).join(' ')
    candidates.push({
      template: templateItem,
      brand,
      model: descriptor || undefined,
      displayName,
      specLabel: descriptor || undefined,
      tags: [descriptor, `${brand} ${templateItem.name}`, ...brandAliases(brand)],
    })
  }

  for (const spec of templateItem.genericSpecs) {
    candidates.push({
      template: templateItem,
      brand: 'Generic',
      displayName: ['Generic', spec, templateItem.name].filter(Boolean).join(' '),
      specLabel: spec,
      tags: [spec, `${spec} ${templateItem.name}`],
    })
  }

  return dedupeBy(candidates, (candidate) => publicCatalogItemIdFor(slugify(candidate.template.name), candidate.displayName))
}

function buildSupportSeeds() {
  const accessoryConfigs = [
    ['circular-saw', 'Fine-Tooth Plywood Blade', 'Saw Blades', ['cut plywood', 'clean sheet goods']],
    ['circular-saw', 'Straight Edge Guide', 'Cutting Guides', ['cut plywood', 'straight cut']],
    ['track-saw', 'Guide Rail Clamp Pair', 'Cutting Guides', ['track saw', 'sheet goods']],
    ['jigsaw', 'Fine Tooth Jigsaw Blade Set', 'Saw Blades', ['curves', 'plywood']],
    ['reciprocating-saw', 'Demolition Blade Set', 'Saw Blades', ['demo', 'metal cutting']],
    ['cordless-drill', 'Driver Bit Assortment', 'Bits', ['drive screws', 'pilot holes']],
    ['cordless-drill', 'Countersink Bit Set', 'Bits', ['countersink', 'flush screws']],
    ['rotary-hammer', 'SDS Plus Chisel Set', 'Masonry Bits', ['drill concrete', 'chip masonry']],
    ['shop-vac', 'HEPA Cartridge Filter', 'Dust Collection', ['dust control', 'fine dust']],
    ['shop-vac', 'Dust Collection Hose Adapter Set', 'Dust Collection', ['sanding', 'routing']],
    ['air-compressor', 'Air Hose Quick Coupler Kit', 'Air Fittings', ['air tools', 'nailers']],
    ['paint-sprayer', 'Fine Finish Spray Tip', 'Paint Sprayer Parts', ['cabinets', 'finish']],
    ['tile-saw', 'Porcelain Tile Blade', 'Tile Blades', ['tile cut', 'backsplash']],
    ['floor-jack', 'Rubber Jack Pad', 'Automotive Support', ['oil change', 'lift car']],
    ['pressure-washer', 'Surface Cleaner Attachment', 'Outdoor Cleaning', ['clean concrete', 'deck wash']],
  ] as const

  const consumableConfigs = [
    ['random-orbital-sander', '5 in. Hook-and-Loop Sanding Discs', 'disc', ['sand wood', 'finish prep']],
    ['detail-sander', 'Detail Sanding Sheets', 'sheet', ['corner sanding', 'paint prep']],
    ['drywall-sander', 'Drywall Sanding Screens', 'screen', ['drywall patch', 'joint compound']],
    ['brad-nailer', '18 Gauge Brad Nails', 'box', ['trim', 'molding']],
    ['finish-nailer', '16 Gauge Finish Nails', 'box', ['baseboards', 'casing']],
    ['staple-gun', 'T50 Staples', 'box', ['screen repair', 'upholstery']],
    ['caulk-gun', 'Paintable Acrylic Caulk', 'tube', ['trim', 'bathroom repair']],
    ['paint-roller-frame', '9 in. Roller Covers', 'pack', ['paint walls', 'primer']],
    ['respirator', 'P100 Replacement Filters', 'pair', ['dust control', 'sanding']],
    ['shop-vac', 'Disposable Shop Vac Bags', 'bag', ['dust collection', 'cleanup']],
    ['drill-bit-set', 'Replacement Twist Drill Bits', 'set', ['pilot holes', 'metal drilling']],
    ['driver-bit-set', 'Impact-Rated Driver Bits', 'set', ['drive screws', 'deck']],
    ['masonry-bit-set', 'Carbide Masonry Bits', 'set', ['concrete anchors', 'brick']],
    ['tile-cutter', 'Replacement Scoring Wheel', 'wheel', ['tile repair', 'backsplash']],
    ['oil-filter-wrench', 'Oil Drain Pan Liners', 'pack', ['oil change', 'vehicle care']],
  ] as const

  const toolAccessories: ToolAccessory[] = accessoryConfigs.map(([toolTypeId, name, categoryName, tags]) => ({
    id: `public-accessory-${toolTypeId}-${slugify(name)}`,
    toolTypeId,
    name,
    category: categoryName,
    description: `${name} helps ${tags.join(' and ')} workflows.`,
    compatibilityTags: tags.map(slugify),
    requiredForProjectTypes: [...tags],
    priorityLabels: ['Accessory', 'Project Unlocker'],
    createdAt: today,
    updatedAt: today,
  }))

  const toolConsumables: ToolConsumable[] = consumableConfigs.map(([toolTypeId, name, unit, tags]) => ({
    id: `public-consumable-${toolTypeId}-${slugify(name)}`,
    toolTypeId,
    name,
    category: 'Consumables',
    unit,
    description: `${name} is commonly consumed during ${tags.join(' and ')} work.`,
    compatibilityTags: tags.map(slugify),
    createdAt: today,
    updatedAt: today,
  }))

  const toolCompatibilityRules: ToolCompatibilityRule[] = [
    compatibility('cordless-drill', 'driver-bit-set', 'accepts', 'Drills and impact drivers accept standard 1/4 in. hex driver bits.'),
    compatibility('impact-driver', 'driver-bit-set', 'requires', 'Impact drivers need impact-rated driver bits for repeated fastening.'),
    compatibility('circular-saw', 'saw-blade-set', 'requires', 'Circular saws require a blade size and tooth count that fits the cut.'),
    compatibility('shop-vac', 'dust-separator', 'prefers', 'Dust separators improve shop vac filter life when sanding or routing.'),
    compatibility('air-compressor', 'brad-nailer', 'accepts', 'Pneumatic nailers require a compressor, air hose, and compatible couplers.'),
    compatibility('floor-jack', 'jack-stands', 'requires', 'Vehicle work requires jack stands after lifting with a floor jack.'),
  ]

  return { toolAccessories, toolConsumables, toolCompatibilityRules }
}

function compatibility(sourceToolTypeId: string, targetToolTypeId: string, ruleType: ToolCompatibilityRule['ruleType'], description: string): ToolCompatibilityRule {
  return {
    id: `public-compat-${sourceToolTypeId}-${targetToolTypeId}-${ruleType}`,
    sourceToolTypeId,
    targetToolTypeId,
    tag: `${sourceToolTypeId}:${targetToolTypeId}`,
    ruleType,
    description,
    createdAt: today,
    updatedAt: today,
  }
}

function category(categoryName: string, target: number, templates: ExpansionTemplate[]): ExpansionCategory {
  return { category: categoryName, target, templates: templates.map((item) => ({ ...item, category: categoryName })) }
}

function template(
  name: string,
  aliases: string[],
  capabilities: string[],
  materials: string[],
  commonProjects: string[],
  powerType: PowerType,
  skillLevel: SkillLevel,
  genericSpecs: string[],
  brands: string[] | undefined,
  tags: string[],
): ExpansionTemplate {
  return {
    name,
    category: '',
    aliases,
    capabilities,
    materials,
    commonProjects,
    powerType,
    skillLevel,
    genericSpecs,
    brands,
    tags,
  }
}

function addSourceNote(
  sourceNotes: Map<string, ToolCatalogSourceNote>,
  catalogItemId: string,
  source: PublicInventorySource,
  candidate: Candidate,
  templateItem: ExpansionTemplate,
  toolTypeId: string,
) {
  const id = sourceNoteIdFor(catalogItemId, source)
  sourceNotes.set(id, {
    id,
    catalogItemId,
    sourceName: source.name,
    sourceUrl: source.url,
    observedLabel: candidate.specLabel ? `${templateItem.name} (${candidate.specLabel})` : templateItem.name,
    observedCategory: templateItem.category,
    normalizedToolTypeId: toolTypeId,
    normalizedCatalogItemId: catalogItemId,
    confidence: candidate.brand === 'Generic' ? 0.78 : 0.86,
    notes: 'Curated into a BenchOS canonical catalog item from public tool-library inventory patterns.',
    observedAt: today,
    createdAt: today,
  })
}

function brandPoolFor(templateItem: ExpansionTemplate) {
  if (templateItem.category === 'Clamping') return clampBrands
  if (templateItem.category === 'Measuring') return measuringBrands
  if (templateItem.category === 'Plumbing') return plumbingBrands
  if (templateItem.category === 'Electrical') return electricalBrands
  if (templateItem.category === 'Outdoor / Yard') return outdoorBrands
  if (templateItem.category === 'Automotive') return automotiveBrands
  if (templateItem.category === 'Safety') return safetyBrands
  if (templateItem.category === 'Ladders / Handling') return handlingBrands
  if (templateItem.category === 'Masonry / Tile / Drywall') return masonryBrands
  if (templateItem.category === 'Specialty') return specialtyBrands
  if (templateItem.powerType === 'Manual') return handBrands
  return powerBrands
}

function defaultSafety(powerType: PowerType) {
  if (powerType === 'Manual') return ['stable work surface', 'clear layout marks', 'secure the workpiece']
  if (powerType === 'Battery') return ['eye protection', 'battery handling', 'secure the workpiece']
  if (powerType === 'Stationary') return ['eye protection', 'hearing protection', 'keep hands clear']
  if (powerType === 'Pneumatic') return ['eye protection', 'disconnect air before service', 'check pressure']
  return ['eye protection', 'hearing protection', 'dust control']
}

function brandDescriptor(brand: string, powerType: PowerType) {
  if (powerType === 'Battery') return batteryDescriptor(brand)
  if (powerType === 'Battery or Corded') return batteryDescriptor(brand)
  if (powerType === 'Corded') return 'Corded'
  if (powerType === 'Pneumatic') return 'Pneumatic'
  if (powerType === 'Stationary') return 'Stationary'
  return ''
}

function batteryDescriptor(brand: string) {
  const descriptors: Record<string, string> = {
    DeWalt: '20V MAX',
    Milwaukee: 'M18',
    Makita: 'LXT 18V',
    Bosch: '18V',
    RIDGID: '18V',
    Ryobi: 'ONE+ 18V',
    Craftsman: 'V20',
    'Metabo HPT': '18V',
    Skil: 'PWRCore 20',
    'Porter-Cable': '20V MAX',
    EGO: '56V',
    Greenworks: '40V',
  }
  return descriptors[brand] ?? 'Cordless'
}

function inferBatteryPlatform(brand: string, displayName: string, powerType: PowerType) {
  if (brand === 'Generic' || (powerType !== 'Battery' && powerType !== 'Battery or Corded')) return undefined
  const text = displayName.toLowerCase()
  if (text.includes('20v max')) return `${brand} 20V MAX`
  if (text.includes('m18')) return `${brand} M18`
  if (text.includes('lxt')) return `${brand} LXT`
  if (text.includes('one+')) return `${brand} ONE+`
  if (text.includes('v20')) return `${brand} V20`
  if (text.includes('56v')) return `${brand} 56V`
  if (text.includes('40v')) return `${brand} 40V`
  if (text.includes('18v')) return `${brand} 18V`
  if (text.includes('12v')) return `${brand} 12V`
  return `${brand} cordless platform`
}

function inferVoltage(platform: string) {
  const match = platform.match(/\b(\d{2})v\b/i)
  return match ? `${match[1]}V` : undefined
}

function cordedState(powerType: PowerType): ToolCatalogItem['cordedOrCordless'] {
  if (powerType === 'Battery') return 'cordless'
  if (powerType === 'Corded') return 'corded'
  if (powerType === 'Manual') return 'manual'
  if (powerType === 'Stationary') return 'stationary'
  if (powerType === 'Pneumatic') return 'pneumatic'
  return undefined
}

function inferCostTier(brand: string, displayName: string): ToolCostTier {
  const text = `${brand} ${displayName}`.toLowerCase()
  if (text.includes('festool') || text.includes('sawstop') || text.includes('hilti') || text.includes('fluke') || text.includes('stabila')) return 'pro'
  if (text.includes('bosch') || text.includes('makita') || text.includes('milwaukee') || text.includes('dewalt') || text.includes('ridgid')) return 'balanced'
  if (text.includes('generic') || text.includes('wen') || text.includes('pittsburgh') || text.includes('ryobi')) return 'budget'
  return 'balanced'
}

function priorityLabelsForTemplate(templateItem: ExpansionTemplate): ToolPriorityLabel[] {
  const labels = new Set<ToolPriorityLabel>()
  if (templateItem.skillLevel === 'Beginner') labels.add('First Shop Essential')
  if (['Safety', 'Masonry / Tile / Drywall'].includes(templateItem.category)) labels.add('Safety Critical')
  if (['Cutting', 'Drilling', 'Fastening', 'Clamping', 'Measuring'].includes(templateItem.category)) labels.add('Project Unlocker')
  if (templateItem.skillLevel === 'Advanced') labels.add('Specialty Tool')
  if (['Automotive', 'Outdoor / Yard', 'Ladders / Handling', 'Specialty'].includes(templateItem.category)) labels.add('Borrow/Rent Candidate')
  if (labels.size === 0) labels.add('Nice to Have')
  return [...labels]
}

function buildCompatibilityTags(brand: string, batteryPlatform: string | undefined, powerType: PowerType, toolName: string, spec?: string) {
  const tags = new Set<string>([slugify(toolName), slugify(brand), slugify(powerType)])
  if (batteryPlatform) tags.add(slugify(batteryPlatform))
  if (spec) tags.add(slugify(spec))
  return [...tags]
}

function brandAliases(brand: string) {
  const aliases: Record<string, string[]> = {
    DeWalt: ['dewalt', 'de walt', 'de-walt'],
    RIDGID: ['ridgid', 'rigid'],
    'Black+Decker': ['black decker', 'black and decker', 'black+decker'],
    'Metabo HPT': ['metabo', 'hitachi'],
    Milwaukee: ['milwaukee', 'm18', 'm12'],
    Makita: ['makita', 'lxt'],
    Ryobi: ['ryobi', 'one plus', 'one+'],
    Bosch: ['bosch'],
    Klein: ['klein', 'klein tools'],
    Generic: ['generic', 'unbranded'],
  }
  return aliases[brand] ?? [brand.toLowerCase()]
}

function publicCatalogItemIdFor(toolTypeId: string, displayName: string) {
  return `public-catalog-${toolTypeId}-${slugify(displayName)}`
}

function sourceNoteIdFor(catalogItemId: string, source: PublicInventorySource) {
  return `${catalogItemId}-source-${source.id}`
}

function normalizeSearchTag(value?: string) {
  if (!value) return ''
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/["']/g, ' inch ')
    .replace(/[^a-z0-9/.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function dedupeBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = getKey(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
