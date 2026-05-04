import type {
  BatteryPlatform,
  Brand,
  Capability,
  PowerType,
  SkillLevel,
  ToolAlias,
  ToolAccessory,
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
  ToolVariant,
} from '../schema'
import { buildCatalogSearchTags, buildPublicInventoryExpansion } from './publicInventoryExpansion'

type ToolSeedTemplate = {
  name: string
  category: string
  aliases: string[]
  capabilities: string[]
  materials: string[]
  commonProjects: string[]
  powerType: PowerType
  skillLevel: SkillLevel
  safety: string[]
  variants: string[]
}

const today = '2026-05-03T00:00:00.000Z'

const categoryTools: Record<string, Omit<ToolSeedTemplate, 'category'>[]> = {
  Cutting: [
    tool('Circular Saw', ['skill saw', 'skilsaw', 'circ saw'], ['cut plywood', 'crosscut lumber', 'rip boards'], ['lumber', 'plywood', 'MDF'], ['deck', 'shelves', 'workbench'], 'Battery or Corded', 'Beginner', ['DeWalt DCS391', 'Makita XSH03Z', 'Milwaukee 2630-20']),
    tool('Miter Saw', ['chop saw', 'compound saw'], ['crosscut boards', 'miter trim', 'cut repeatable lengths'], ['lumber', 'trim'], ['hall tree', 'workbench', 'trim'], 'Stationary', 'Intermediate', ['DeWalt DWS779', 'Makita LS1018L']),
    tool('Table Saw', ['cabinet saw', 'jobsite saw'], ['rip boards', 'cut sheet goods', 'make dados'], ['lumber', 'plywood', 'hardwood'], ['cabinets', 'furniture', 'workbench'], 'Stationary', 'Advanced', ['DeWalt DWE7491RS', 'SawStop CTS']),
    tool('Jigsaw', ['saber saw'], ['cut curves', 'cut notches', 'rough cut shapes'], ['plywood', 'lumber', 'plastic'], ['shelves', 'decor', 'templates'], 'Battery or Corded', 'Beginner', ['Makita XVJ03Z', 'Bosch JS470E']),
    tool('Track Saw', ['plunge saw'], ['cut sheet goods', 'straight-line rip cuts', 'clean plywood cuts'], ['plywood', 'MDF', 'hardwood'], ['cabinets', 'built-ins', 'shelves'], 'Battery or Corded', 'Intermediate', ['Makita SP6000J', 'Festool TS 55']),
    tool('Hand Saw', ['panel saw'], ['hand cut lumber', 'trim small parts'], ['lumber', 'trim'], ['quick repairs', 'small projects'], 'Manual', 'Beginner', ['Stanley SharpTooth', 'Suizan Ryoba']),
  ],
  Drilling: [
    tool('Cordless Drill', ['drill driver', 'battery drill'], ['drill pilot holes', 'drive screws', 'countersink holes'], ['wood', 'drywall', 'plastic'], ['shelves', 'deck', 'workbench'], 'Battery', 'Beginner', ['DeWalt DCD777C2', 'Makita XFD131']),
    tool('Impact Driver', ['impact drill'], ['drive screws', 'drive lag bolts', 'assemble frames'], ['lumber', 'deck boards'], ['deck', 'workbench', 'shed'], 'Battery', 'Beginner', ['DeWalt DCF887B', 'Milwaukee 2853-20']),
    tool('Drill Press', ['bench drill press'], ['drill straight holes', 'repeatable drilling', 'mortise setup holes'], ['wood', 'metal', 'plastic'], ['jigs', 'furniture', 'shop fixtures'], 'Stationary', 'Intermediate', ['WEN 4214', 'Jet JDP-12']),
    tool('Right Angle Drill', ['angle drill'], ['drill tight spaces', 'drive screws in corners'], ['wood', 'drywall'], ['cabinets', 'plumbing access'], 'Battery', 'Intermediate', ['Milwaukee M18 Right Angle Drill']),
    tool('Rotary Hammer', ['hammer drill'], ['drill concrete', 'drill masonry', 'set anchors'], ['concrete', 'brick', 'stone'], ['garage storage', 'outdoor fixtures'], 'Corded', 'Advanced', ['Bosch Bulldog Xtreme', 'DeWalt D25263K']),
    tool('Hand Brace', ['brace drill'], ['manual drilling', 'controlled boring'], ['wood'], ['traditional joinery', 'repair'], 'Manual', 'Intermediate', ['WoodRiver Bit Brace']),
  ],
  Fastening: [
    tool('Screwdriver Set', ['drivers'], ['drive screws', 'adjust hardware', 'assemble fixtures'], ['wood', 'metal', 'plastic'], ['repairs', 'furniture', 'hardware'], 'Manual', 'Beginner', ['Klein Screwdriver Set', 'Wera Kraftform']),
    tool('Brad Nailer', ['finish nailer'], ['attach trim', 'pin thin boards', 'fasten moldings'], ['trim', 'plywood', 'softwood'], ['cabinet trim', 'shelves', 'molding'], 'Pneumatic', 'Intermediate', ['DeWalt DWFP12231', 'Metabo HPT NT50AE2']),
    tool('Pin Nailer', ['23 gauge nailer'], ['pin delicate trim', 'hold glue-ups'], ['trim', 'thin stock'], ['small boxes', 'cabinet trim'], 'Pneumatic', 'Intermediate', ['Grex P635', 'Metabo HPT NP35A']),
    tool('Staple Gun', ['tacker'], ['attach fabric', 'fasten thin material'], ['fabric', 'screen', 'thin wood'], ['upholstery', 'shop jigs'], 'Manual', 'Beginner', ['Arrow T50', 'Stanley TR110']),
    tool('Socket Set', ['ratchet set'], ['tighten bolts', 'assemble hardware'], ['metal fasteners'], ['automotive', 'bench hardware'], 'Manual', 'Beginner', ['Craftsman Socket Set', 'Tekton Socket Set']),
    tool('Torque Wrench', ['torque ratchet'], ['tighten to specification', 'avoid overtightening'], ['bolts', 'nuts'], ['automotive', 'machinery'], 'Manual', 'Intermediate', ['Tekton Torque Wrench']),
  ],
  Sanding: [
    tool('Random Orbital Sander', ['orbital sander', 'ROS'], ['sand flat surfaces', 'smooth finish', 'remove swirl marks'], ['wood', 'paint'], ['tabletop', 'cabinet', 'shelves'], 'Corded', 'Beginner', ['Bosch ROS20VSC', 'DeWalt DWE6423K']),
    tool('Belt Sander', ['portable belt sander'], ['remove material quickly', 'flatten rough boards'], ['wood', 'paint'], ['doors', 'bench tops'], 'Corded', 'Intermediate', ['Makita 9403', 'WEN 6321']),
    tool('Sanding Block', ['hand sander'], ['hand sand edges', 'break sharp corners'], ['wood', 'primer'], ['finishing', 'detail work'], 'Manual', 'Beginner', ['3M Sanding Block']),
    tool('Detail Sander', ['mouse sander'], ['sand corners', 'sand small profiles'], ['wood', 'paint'], ['chair repair', 'trim'], 'Corded', 'Beginner', ['Black+Decker Mouse']),
    tool('Spindle Sander', ['oscillating spindle sander'], ['sand curves', 'smooth inside radii'], ['wood'], ['patterns', 'chairs', 'decor'], 'Stationary', 'Intermediate', ['WEN 6510T']),
    tool('Sanding Sponge', ['foam sanding block'], ['sand contours', 'light finish sanding'], ['wood', 'paint', 'drywall'], ['touch-ups', 'finishing'], 'Manual', 'Beginner', ['3M Sanding Sponge']),
  ],
  Measuring: [
    tool('Tape Measure', ['measuring tape'], ['measure length', 'layout cuts', 'check fit'], ['lumber', 'rooms'], ['all projects'], 'Manual', 'Beginner', ['Stanley FatMax', 'Milwaukee Stud']),
    tool('Digital Caliper', ['calipers'], ['measure thickness', 'measure inside dimensions'], ['wood', 'metal', 'hardware'], ['joinery', 'hardware setup'], 'Battery', 'Intermediate', ['Mitutoyo Caliper', 'iGaging Caliper']),
    tool('Level', ['spirit level'], ['check level', 'check plumb', 'align installations'], ['walls', 'shelves'], ['floating shelves', 'cabinets'], 'Manual', 'Beginner', ['Empire Level', 'Stabila Level']),
    tool('Laser Measure', ['distance laser'], ['measure rooms', 'estimate materials'], ['rooms', 'walls'], ['built-ins', 'renovation'], 'Battery', 'Beginner', ['Bosch GLM20', 'Leica DISTO']),
    tool('Moisture Meter', ['wood moisture meter'], ['check wood moisture', 'avoid movement problems'], ['lumber', 'hardwood'], ['furniture', 'flooring'], 'Battery', 'Intermediate', ['General Tools MMD4E']),
    tool('Angle Finder', ['digital angle gauge'], ['measure angles', 'set bevels'], ['trim', 'lumber'], ['miter cuts', 'stairs'], 'Battery', 'Intermediate', ['Wixey Angle Gauge']),
  ],
  Layout: [
    tool('Speed Square', ['rafter square'], ['mark square lines', 'guide circular saw', 'mark angles'], ['lumber', 'plywood'], ['framing', 'shelves'], 'Manual', 'Beginner', ['Swanson Speed Square']),
    tool('Combination Square', ['combo square'], ['mark 90 degrees', 'set depth', 'transfer measurements'], ['wood', 'metal'], ['joinery', 'layout'], 'Manual', 'Beginner', ['Starrett Combination Square']),
    tool('Marking Gauge', ['mortise gauge'], ['scribe layout lines', 'mark joinery'], ['wood'], ['tenons', 'dovetails'], 'Manual', 'Intermediate', ['Veritas Marking Gauge']),
    tool('Chalk Line', ['snap line'], ['mark long straight lines', 'layout sheet goods'], ['plywood', 'concrete'], ['framing', 'deck'], 'Manual', 'Beginner', ['Irwin Chalk Reel']),
    tool('Framing Square', ['carpenter square'], ['layout rafters', 'check large square'], ['lumber', 'sheet goods'], ['framing', 'workbench'], 'Manual', 'Beginner', ['Empire Framing Square']),
    tool('Marking Knife', ['layout knife'], ['score accurate lines', 'layout joinery'], ['wood'], ['fine woodworking', 'joinery'], 'Manual', 'Intermediate', ['Narex Marking Knife']),
  ],
  Clamping: [
    tool('Bar Clamp', ['F clamp', 'quick clamp'], ['clamp boards', 'hold assemblies', 'support glue-up'], ['wood', 'plywood'], ['tabletop', 'cabinet'], 'Manual', 'Beginner', ['Irwin Quick-Grip', 'Bessey F-Clamp']),
    tool('Pipe Clamp', ['pipe clamp fixture'], ['clamp wide glue-ups', 'edge glue boards'], ['wood'], ['tabletop', 'bench top'], 'Manual', 'Intermediate', ['Pony Pipe Clamp']),
    tool('Spring Clamp', ['pinch clamp'], ['hold light parts', 'temporary clamping'], ['wood', 'plastic'], ['jigs', 'small repairs'], 'Manual', 'Beginner', ['Bessey Spring Clamp']),
    tool('Corner Clamp', ['right angle clamp'], ['hold square corners', 'assemble frames'], ['wood', 'plywood'], ['boxes', 'cabinet frames'], 'Manual', 'Beginner', ['Milescraft Corner Clamp']),
    tool('Parallel Clamp', ['cabinet clamp'], ['clamp panels square', 'even pressure glue-up'], ['wood'], ['cabinet doors', 'tabletops'], 'Manual', 'Intermediate', ['Bessey K Body']),
    tool('Toggle Clamp', ['hold-down clamp'], ['hold work to jig', 'repeatable clamping'], ['wood', 'metal'], ['jigs', 'fixtures'], 'Manual', 'Intermediate', ['POWERTEC Toggle Clamp']),
  ],
  Routing: [
    tool('Router', ['plunge router', 'fixed base router'], ['route edges', 'cut dados', 'make rabbets'], ['wood', 'plywood'], ['shelves', 'cabinets'], 'Corded', 'Intermediate', ['Bosch 1617EVSPK', 'DeWalt DW618PK']),
    tool('Trim Router', ['compact router'], ['round over edges', 'flush trim veneer'], ['wood', 'laminate'], ['cabinet trim', 'signs'], 'Battery or Corded', 'Intermediate', ['Makita RT0701C']),
    tool('Router Table', ['table router'], ['route small parts safely', 'repeat edge profiles'], ['wood'], ['doors', 'molding'], 'Stationary', 'Advanced', ['Kreg Router Table']),
    tool('Flush Trim Bit', ['pattern bit'], ['copy templates', 'flush trim edges'], ['wood', 'laminate'], ['templates', 'cabinet edges'], 'Manual', 'Intermediate', ['Freud Flush Trim Bit']),
    tool('Roundover Bit', ['edge rounding bit'], ['round edges', 'soften profiles'], ['wood'], ['tables', 'shelves'], 'Manual', 'Beginner', ['Bosch Roundover Bit']),
    tool('Dado Bit Set', ['straight router bit set'], ['cut grooves', 'route dados'], ['plywood', 'wood'], ['cabinets', 'bookcases'], 'Manual', 'Intermediate', ['Whiteside Straight Bit Set']),
  ],
  Planing: [
    tool('Block Plane', ['low angle block plane'], ['chamfer edges', 'trim end grain'], ['wood'], ['fitting parts', 'finish prep'], 'Manual', 'Intermediate', ['Stanley Block Plane']),
    tool('Bench Plane', ['jack plane'], ['flatten boards', 'smooth faces'], ['wood'], ['furniture', 'workbench'], 'Manual', 'Advanced', ['Stanley No. 5']),
    tool('Thickness Planer', ['portable planer'], ['surface boards to thickness', 'clean rough lumber'], ['lumber', 'hardwood'], ['furniture', 'tabletop'], 'Stationary', 'Advanced', ['DeWalt DW735']),
    tool('Handheld Power Planer', ['electric planer'], ['trim doors', 'level rough boards'], ['lumber'], ['door fitting', 'framing'], 'Corded', 'Intermediate', ['Makita KP0800K']),
    tool('Spokeshave', ['draw shave plane'], ['shape curves', 'smooth rounded parts'], ['wood'], ['chair parts', 'handles'], 'Manual', 'Advanced', ['Stanley Spokeshave']),
    tool('Card Scraper', ['cabinet scraper'], ['remove tearout', 'smooth difficult grain'], ['hardwood'], ['fine furniture', 'finish prep'], 'Manual', 'Intermediate', ['Bahco Card Scraper']),
  ],
  Chiseling: [
    tool('Bench Chisel Set', ['wood chisels'], ['pare joinery', 'clean corners', 'chop waste'], ['wood'], ['dovetails', 'mortises'], 'Manual', 'Intermediate', ['Narex Chisel Set']),
    tool('Mortise Chisel', ['mortising chisel'], ['chop mortises', 'square holes'], ['wood'], ['tables', 'chairs'], 'Manual', 'Advanced', ['Narex Mortise Chisel']),
    tool('Mallet', ['wooden mallet'], ['strike chisels', 'assemble joinery'], ['wood'], ['joinery', 'assembly'], 'Manual', 'Beginner', ['Wood Is Good Mallet']),
    tool('Paring Chisel', ['long chisel'], ['fine pare surfaces', 'trim joinery'], ['wood'], ['fine joinery'], 'Manual', 'Advanced', ['Veritas Paring Chisel']),
    tool('Cold Chisel', ['metal chisel'], ['cut metal', 'break fasteners'], ['metal', 'masonry'], ['repair', 'automotive'], 'Manual', 'Intermediate', ['Mayhew Cold Chisel']),
    tool('Utility Knife', ['box cutter'], ['score material', 'trim tape', 'cut packaging'], ['cardboard', 'drywall', 'plastic'], ['all projects'], 'Manual', 'Beginner', ['Milwaukee Fastback']),
  ],
  Joinery: [
    tool('Pocket Hole Jig', ['pocket screw jig'], ['drill pocket holes', 'assemble cabinets'], ['wood', 'plywood'], ['shelves', 'cabinets'], 'Manual', 'Beginner', ['Kreg K4', 'Milescraft PocketJig']),
    tool('Doweling Jig', ['dowel jig'], ['align dowels', 'reinforce joints'], ['wood'], ['frames', 'tables'], 'Manual', 'Intermediate', ['Jessem Doweling Jig']),
    tool('Biscuit Joiner', ['plate joiner'], ['cut biscuit slots', 'align panels'], ['wood', 'plywood'], ['tabletops', 'casework'], 'Corded', 'Intermediate', ['DeWalt DW682K']),
    tool('Domino Joiner', ['floating tenon joiner'], ['cut floating tenons', 'strong alignment'], ['wood'], ['furniture', 'chairs'], 'Corded', 'Advanced', ['Festool Domino DF 500']),
    tool('Dovetail Jig', ['drawer jig'], ['cut dovetails', 'make drawers'], ['wood'], ['drawers', 'boxes'], 'Manual', 'Advanced', ['Porter-Cable Dovetail Jig']),
    tool('Tenoning Jig', ['table saw tenon jig'], ['cut tenons', 'repeat joinery cuts'], ['wood'], ['tables', 'frames'], 'Manual', 'Advanced', ['Delta Tenoning Jig']),
  ],
  Finishing: [
    tool('Paint Brush Set', ['finish brush'], ['apply paint', 'apply finish'], ['wood', 'drywall'], ['furniture', 'trim'], 'Manual', 'Beginner', ['Purdy Brush Set']),
    tool('Foam Roller', ['paint roller'], ['apply finish evenly', 'paint panels'], ['wood', 'walls'], ['cabinets', 'rooms'], 'Manual', 'Beginner', ['Wooster Foam Roller']),
    tool('HVLP Sprayer', ['paint sprayer'], ['spray finish', 'spray paint'], ['wood', 'metal'], ['cabinets', 'furniture'], 'Corded', 'Advanced', ['Wagner Control Spray']),
    tool('Tack Cloth', ['dust cloth'], ['remove dust', 'prep finish'], ['wood'], ['finishing'], 'Manual', 'Beginner', ['Trimaco Tack Cloth']),
    tool('Finish Applicator Pad', ['stain pad'], ['wipe stain', 'apply oil'], ['wood'], ['tables', 'shelves'], 'Manual', 'Beginner', ['Varathane Applicator Pad']),
    tool('Paint Scraper', ['putty scraper'], ['remove paint', 'scrape glue'], ['wood', 'paint'], ['refinishing', 'repair'], 'Manual', 'Beginner', ['Hyde Paint Scraper']),
  ],
  Safety: [
    tool('Safety Glasses', ['eye protection'], ['protect eyes', 'block chips'], ['all materials'], ['all projects'], 'Manual', 'Beginner', ['3M SecureFit']),
    tool('Hearing Protection', ['ear muffs', 'ear plugs'], ['reduce noise exposure'], ['all materials'], ['sawing', 'routing'], 'Manual', 'Beginner', ['3M WorkTunes']),
    tool('Respirator', ['dust mask'], ['filter dust', 'filter fumes'], ['dust', 'finish vapors'], ['sanding', 'finishing'], 'Manual', 'Beginner', ['3M Half Face Respirator']),
    tool('Work Gloves', ['shop gloves'], ['protect hands', 'improve grip'], ['lumber', 'metal'], ['yard work', 'handling stock'], 'Manual', 'Beginner', ['Mechanix Work Gloves']),
    tool('Face Shield', ['full face shield'], ['protect face', 'block chips'], ['wood', 'metal'], ['turning', 'grinding'], 'Manual', 'Beginner', ['Uvex Face Shield']),
    tool('First Aid Kit', ['shop first aid'], ['treat minor injuries'], ['all materials'], ['shop safety'], 'Manual', 'Beginner', ['ANSI First Aid Kit']),
  ],
  'Dust Collection': [
    tool('Shop Vac', ['wet dry vac'], ['collect dust', 'clean workspace'], ['dust', 'chips'], ['all projects'], 'Corded', 'Beginner', ['RIDGID WD1450']),
    tool('Dust Collector', ['chip collector'], ['collect chips', 'support stationary tools'], ['wood chips', 'dust'], ['table saw', 'planer'], 'Stationary', 'Intermediate', ['Harbor Freight Dust Collector']),
    tool('Dust Separator', ['cyclone separator'], ['separate chips', 'protect vacuum filter'], ['wood chips', 'dust'], ['shop cleanup'], 'Manual', 'Beginner', ['Dust Deputy']),
    tool('Air Filtration Unit', ['shop air filter'], ['filter airborne dust'], ['wood dust'], ['sanding', 'shop cleanup'], 'Stationary', 'Intermediate', ['WEN Air Filtration']),
    tool('Vacuum Hose Kit', ['dust hose'], ['connect tools to vac', 'improve dust capture'], ['dust'], ['sanding', 'routing'], 'Manual', 'Beginner', ['Cen-Tec Hose Kit']),
    tool('Dust Mask', ['disposable respirator'], ['reduce dust inhalation'], ['dust'], ['sanding', 'sweeping'], 'Manual', 'Beginner', ['3M N95 Mask']),
  ],
  'Workbench / Holding': [
    tool('Workbench', ['shop bench'], ['hold projects', 'assemble parts'], ['wood'], ['all projects'], 'Stationary', 'Beginner', ['DIY Workbench']),
    tool('Bench Vise', ['woodworking vise'], ['hold boards', 'clamp work'], ['wood', 'metal'], ['planing', 'joinery'], 'Manual', 'Intermediate', ['Yost Bench Vise']),
    tool('Sawhorse Pair', ['folding sawhorses'], ['support boards', 'support sheet goods'], ['lumber', 'plywood'], ['cutting', 'assembly'], 'Manual', 'Beginner', ['Bora Sawhorses']),
    tool('Assembly Table', ['outfeed table'], ['assemble cabinets', 'support large projects'], ['wood', 'plywood'], ['cabinets', 'furniture'], 'Stationary', 'Beginner', ['DIY Assembly Table']),
    tool('Bench Dogs', ['workbench dogs'], ['hold workpieces', 'support planing'], ['wood'], ['hand tool work'], 'Manual', 'Intermediate', ['Veritas Bench Dogs']),
    tool('Holdfast', ['bench holdfast'], ['secure boards', 'quick clamping'], ['wood'], ['chiseling', 'planing'], 'Manual', 'Intermediate', ['Gramercy Holdfast']),
  ],
  Sharpening: [
    tool('Sharpening Stones', ['whetstones'], ['sharpen chisels', 'sharpen plane irons'], ['steel'], ['hand tools'], 'Manual', 'Intermediate', ['Shapton Stones']),
    tool('Honing Guide', ['sharpening guide'], ['hold bevel angle', 'repeat sharpening'], ['steel'], ['chisels', 'planes'], 'Manual', 'Beginner', ['Veritas Honing Guide']),
    tool('Bench Grinder', ['grinder'], ['grind bevels', 'shape metal'], ['steel'], ['tool maintenance'], 'Stationary', 'Intermediate', ['WEN Bench Grinder']),
    tool('Strop', ['leather strop'], ['polish edges', 'remove burr'], ['steel'], ['chisels', 'knives'], 'Manual', 'Beginner', ['BeaverCraft Strop']),
    tool('File Set', ['metal files'], ['shape metal', 'smooth edges'], ['metal', 'plastic'], ['repair', 'sharpening'], 'Manual', 'Beginner', ['Nicholson File Set']),
    tool('Diamond Plate', ['diamond stone'], ['flatten stones', 'sharpen tools'], ['steel', 'stones'], ['sharpening'], 'Manual', 'Intermediate', ['DMT Diamond Plate']),
  ],
  'Shop Equipment': [
    tool('Air Compressor', ['compressor'], ['power pneumatic tools', 'inflate tires'], ['air tools'], ['nailing', 'automotive'], 'Stationary', 'Beginner', ['California Air Tools Compressor']),
    tool('Band Saw', ['bandsaw'], ['cut curves', 'resaw boards'], ['wood', 'plastic'], ['furniture', 'templates'], 'Stationary', 'Advanced', ['Rikon Band Saw']),
    tool('Jointer', ['surface jointer'], ['flatten board faces', 'square edges'], ['lumber'], ['milling', 'furniture'], 'Stationary', 'Advanced', ['Wahuda Jointer']),
    tool('Oscillating Multi-Tool', ['multi tool'], ['flush cut', 'scrape material', 'cut openings'], ['wood', 'drywall', 'metal'], ['repair', 'remodel'], 'Battery or Corded', 'Beginner', ['Fein MultiMaster']),
    tool('Heat Gun', ['hot air gun'], ['soften finish', 'shrink tubing'], ['paint', 'plastic'], ['refinishing', 'electrical'], 'Corded', 'Beginner', ['Wagner Heat Gun']),
    tool('Work Light', ['shop light'], ['light workspace', 'inspect surfaces'], ['all materials'], ['all projects'], 'Battery or Corded', 'Beginner', ['Milwaukee Rover Light']),
  ],
  Electrical: [
    tool('Multimeter', ['volt meter'], ['measure voltage', 'test continuity'], ['wire', 'circuits'], ['electrical repair'], 'Battery', 'Intermediate', ['Klein Multimeter']),
    tool('Wire Stripper', ['wire cutter stripper'], ['strip wire', 'cut wire'], ['wire'], ['outlets', 'fixtures'], 'Manual', 'Beginner', ['Klein Wire Stripper']),
    tool('Voltage Tester', ['non contact tester'], ['detect live wires', 'check outlets'], ['wire', 'outlets'], ['electrical safety'], 'Battery', 'Beginner', ['Klein NCVT']),
    tool('Fish Tape', ['wire puller'], ['pull wire through walls'], ['wire'], ['renovation', 'fixtures'], 'Manual', 'Intermediate', ['Southwire Fish Tape']),
    tool('Crimping Tool', ['wire crimper'], ['crimp connectors', 'terminate wires'], ['wire connectors'], ['automotive', 'electrical'], 'Manual', 'Intermediate', ['Klein Crimper']),
    tool('Outlet Tester', ['receptacle tester'], ['test outlets', 'check wiring faults'], ['outlets'], ['home repair'], 'Battery', 'Beginner', ['Klein Outlet Tester']),
  ],
  Plumbing: [
    tool('Pipe Wrench', ['plumber wrench'], ['turn pipe fittings', 'loosen plumbing'], ['pipe'], ['plumbing repair'], 'Manual', 'Beginner', ['RIDGID Pipe Wrench']),
    tool('Adjustable Wrench', ['crescent wrench'], ['turn nuts', 'hold fittings'], ['metal fittings'], ['plumbing', 'assembly'], 'Manual', 'Beginner', ['Crescent Adjustable Wrench']),
    tool('Basin Wrench', ['sink wrench'], ['tighten faucet nuts', 'reach under sinks'], ['plumbing fixtures'], ['sink repair'], 'Manual', 'Intermediate', ['RIDGID Basin Wrench']),
    tool('Tubing Cutter', ['pipe cutter'], ['cut copper pipe', 'cut plastic tubing'], ['copper', 'PEX'], ['plumbing repair'], 'Manual', 'Beginner', ['RIDGID Tubing Cutter']),
    tool('Plunger', ['drain plunger'], ['clear clogs', 'restore drain flow'], ['drains'], ['home repair'], 'Manual', 'Beginner', ['Korky Plunger']),
    tool('Drain Snake', ['auger'], ['clear drains', 'remove clogs'], ['drains'], ['home repair'], 'Manual', 'Intermediate', ['RIDGID Drain Auger']),
  ],
  'Outdoor / Yard': [
    tool('Shovel', ['spade'], ['dig soil', 'move gravel'], ['soil', 'mulch'], ['garden beds', 'posts'], 'Manual', 'Beginner', ['Fiskars Shovel']),
    tool('Post Hole Digger', ['post digger'], ['dig post holes', 'set posts'], ['soil'], ['fence', 'deck'], 'Manual', 'Intermediate', ['Ames Post Hole Digger']),
    tool('Pruning Saw', ['tree saw'], ['cut branches', 'trim limbs'], ['green wood'], ['yard work'], 'Manual', 'Beginner', ['Corona Pruning Saw']),
    tool('String Trimmer', ['weed eater'], ['trim grass edges', 'clear weeds'], ['grass', 'weeds'], ['yard maintenance'], 'Battery', 'Beginner', ['EGO String Trimmer']),
    tool('Leaf Blower', ['blower'], ['clear leaves', 'clean driveway'], ['leaves', 'dust'], ['yard maintenance'], 'Battery', 'Beginner', ['EGO Leaf Blower']),
    tool('Garden Rake', ['bow rake'], ['level soil', 'spread mulch'], ['soil', 'mulch'], ['garden beds'], 'Manual', 'Beginner', ['Ames Bow Rake']),
  ],
  Automotive: [
    tool('Floor Jack', ['car jack'], ['lift vehicle', 'support maintenance setup'], ['vehicle'], ['oil change', 'brakes'], 'Manual', 'Intermediate', ['Pittsburgh Floor Jack']),
    tool('Jack Stands', ['vehicle stands'], ['support vehicle safely'], ['vehicle'], ['automotive repair'], 'Manual', 'Intermediate', ['Torin Jack Stands']),
    tool('Oil Filter Wrench', ['filter wrench'], ['remove oil filter'], ['automotive'], ['oil change'], 'Manual', 'Beginner', ['Lisle Filter Wrench']),
    tool('Battery Charger', ['trickle charger'], ['charge car battery', 'maintain battery'], ['battery'], ['automotive'], 'Corded', 'Beginner', ['NOCO Genius']),
    tool('Tire Inflator', ['air inflator'], ['inflate tires', 'check pressure'], ['tires'], ['vehicle care'], 'Battery or Corded', 'Beginner', ['DeWalt Tire Inflator']),
    tool('OBD-II Scanner', ['code reader'], ['read vehicle codes', 'diagnose check engine'], ['vehicle electronics'], ['automotive troubleshooting'], 'Battery', 'Beginner', ['BlueDriver OBD2 Scanner']),
  ],
}

function tool(
  name: string,
  aliases: string[],
  capabilities: string[],
  materials: string[],
  commonProjects: string[],
  powerType: PowerType,
  skillLevel: SkillLevel,
  variants: string[],
): Omit<ToolSeedTemplate, 'category'> {
  return {
    name,
    aliases,
    capabilities,
    materials,
    commonProjects,
    powerType,
    skillLevel,
    safety: defaultSafety(powerType),
    variants,
  }
}

function defaultSafety(powerType: PowerType) {
  if (powerType === 'Manual') return ['stable work surface', 'clear layout marks', 'secure the workpiece']
  if (powerType === 'Battery') return ['eye protection', 'battery handling', 'secure the workpiece']
  if (powerType === 'Stationary') return ['eye protection', 'hearing protection', 'keep hands clear']
  if (powerType === 'Pneumatic') return ['eye protection', 'disconnect air before service', 'check pressure']
  return ['eye protection', 'hearing protection', 'dust control']
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function catalogItemIdForVariant(toolTypeId: string, variantName: string) {
  return `catalog-${toolTypeId}-${slugify(variantName)}`
}

export function buildStarterToolLibrary() {
  const selectedTemplates = Object.entries(categoryTools).flatMap(([category, tools], categoryIndex) =>
    tools.slice(0, categoryIndex < 6 ? 5 : 6).map((item) => ({ ...item, category })),
  )
  const capabilityMap = new Map<string, Capability>()
  const familyMap = new Map<string, ToolFamily>()
  const brandMap = new Map<string, Brand>()
  const batteryPlatformMap = new Map<string, BatteryPlatform>()
  const toolTypes: ToolType[] = []
  const toolAliases: ToolAlias[] = []
  const toolVariants: ToolVariant[] = []
  const toolTypeCapabilities: ToolTypeCapability[] = []
  const toolCatalogItems: ToolCatalogItem[] = []
  const toolCatalogSpecs: ToolCatalogSpec[] = []
  const toolCatalogSourceNotes: ToolCatalogSourceNote[] = []
  const toolAccessories: ToolAccessory[] = []
  const toolConsumables: ToolConsumable[] = []
  const toolCompatibilityRules: ToolCompatibilityRule[] = []

  for (const template of selectedTemplates) {
    const toolTypeId = slugify(template.name)
    const familyId = slugify(template.category)
    if (!familyMap.has(familyId)) {
      familyMap.set(familyId, {
        id: familyId,
        name: template.category,
        category: template.category,
        description: `${template.category} tools and related workshop capability.`,
        createdAt: today,
        updatedAt: today,
      })
    }

    toolTypes.push({
      id: toolTypeId,
      name: template.name,
      category: template.category,
      familyId,
      description: `${template.name} supports ${template.capabilities.slice(0, 2).join(' and ')} for ${template.commonProjects.slice(0, 2).join(' and ')} work.`,
      materials: template.materials,
      commonProjects: template.commonProjects,
      powerType: template.powerType,
      skillLevel: template.skillLevel,
      safety: template.safety,
      createdAt: today,
      updatedAt: today,
    })

    template.aliases.forEach((alias) => {
      toolAliases.push({ id: `${toolTypeId}-alias-${slugify(alias)}`, toolTypeId, alias })
    })

    template.variants.forEach((variantName) => {
      const [brand, ...modelParts] = variantName.split(' ')
      const model = modelParts.join(' ')
      const brandId = slugify(brand)
      if (!brandMap.has(brandId)) {
        brandMap.set(brandId, {
          id: brandId,
          name: brand,
          aliases: [],
          createdAt: today,
          updatedAt: today,
        })
      }

      const batteryPlatform = inferBatteryPlatform(brand, variantName, template.powerType)
      if (batteryPlatform && !batteryPlatformMap.has(slugify(batteryPlatform))) {
        batteryPlatformMap.set(slugify(batteryPlatform), {
          id: slugify(batteryPlatform),
          brand,
          name: batteryPlatform,
          voltage: inferVoltage(batteryPlatform),
          aliases: [],
          createdAt: today,
          updatedAt: today,
        })
      }

      toolVariants.push({
        id: `${toolTypeId}-variant-${slugify(variantName)}`,
        toolTypeId,
        brand,
        model,
        name: variantName,
        powerType: template.powerType,
        batteryPlatform,
        createdAt: today,
        updatedAt: today,
      })

      const catalogItemId = catalogItemIdForVariant(toolTypeId, variantName)
      const sourceNoteId = `${catalogItemId}-source-benchos-v001`
      const parsedSpecs = specsFromVariant(catalogItemId, variantName)
      const priorityLabels = priorityLabelsForTemplate(template)
      toolCatalogItems.push({
        id: catalogItemId,
        internalToolTypeId: toolTypeId,
        familyId,
        brand,
        model: model || undefined,
        displayName: variantName,
        powerType: template.powerType,
        batteryPlatform,
        voltage: batteryPlatform ? inferVoltage(batteryPlatform) : undefined,
        cordedOrCordless: cordedState(template.powerType),
        costTier: inferCostTier(brand, variantName),
        compatibilityTags: buildCompatibilityTags(brand, batteryPlatform, template.powerType, template.name),
        priorityLabels,
        searchTags: buildCatalogSearchTags({
          brand,
          model,
          displayName: variantName,
          toolTypeName: template.name,
          aliases: template.aliases,
          capabilities: template.capabilities,
          materials: template.materials,
          commonProjects: template.commonProjects,
          category: template.category,
          powerType: template.powerType,
          batteryPlatform,
          specs: parsedSpecs.map((spec) => String(spec.value)),
          extraTags: [template.name, variantName, ...priorityLabels],
        }),
        sourceNoteIds: [sourceNoteId],
        createdAt: today,
        updatedAt: today,
      })
      toolCatalogSourceNotes.push({
        id: sourceNoteId,
        catalogItemId,
        sourceName: 'BenchOS v0.01 seed',
        observedLabel: variantName,
        observedCategory: template.category,
        normalizedToolTypeId: toolTypeId,
        normalizedCatalogItemId: catalogItemId,
        confidence: 1,
        observedAt: today,
        createdAt: today,
      })
      toolCatalogSpecs.push(...parsedSpecs)
    })

    template.capabilities.forEach((capabilityName, index) => {
      const capabilityId = slugify(capabilityName)
      if (!capabilityMap.has(capabilityId)) {
        capabilityMap.set(capabilityId, {
          id: capabilityId,
          name: capabilityName,
          description: `Ability to ${capabilityName} during workshop projects.`,
          materials: template.materials,
          projectTypes: template.commonProjects,
        })
      }
      toolTypeCapabilities.push({
        id: `${toolTypeId}-capability-${capabilityId}`,
        toolTypeId,
        capabilityId,
        strength: index === 0 ? 'primary' : 'secondary',
      })
    })
  }

  const publicExpansion = buildPublicInventoryExpansion()
  mergeFamilies(familyMap, publicExpansion.toolFamilies)
  mergeUnique(toolTypes, publicExpansion.toolTypes)
  mergeUnique(toolAliases, publicExpansion.toolAliases)
  mergeBrands(brandMap, publicExpansion.brands)
  mergeBatteryPlatforms(batteryPlatformMap, publicExpansion.batteryPlatforms)
  mergeCatalogItems(toolCatalogItems, publicExpansion.toolCatalogItems)
  mergeUnique(toolCatalogSpecs, publicExpansion.toolCatalogSpecs)
  mergeUnique(toolCatalogSourceNotes, publicExpansion.toolCatalogSourceNotes)
  mergeCapabilities(capabilityMap, publicExpansion.capabilities)
  mergeUnique(toolTypeCapabilities, publicExpansion.toolTypeCapabilities)
  mergeUnique(toolAccessories, publicExpansion.toolAccessories)
  mergeUnique(toolConsumables, publicExpansion.toolConsumables)
  mergeUnique(toolCompatibilityRules, publicExpansion.toolCompatibilityRules)

  return {
    toolFamilies: [...familyMap.values()],
    toolTypes,
    toolAliases,
    toolVariants,
    brands: [...brandMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
    batteryPlatforms: [...batteryPlatformMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
    toolCatalogItems,
    toolCatalogSpecs,
    toolCatalogSourceNotes,
    capabilities: [...capabilityMap.values()],
    toolTypeCapabilities,
    toolAccessories,
    toolConsumables,
    toolCompatibilityRules,
    publicInventoryExpansionCatalogItemIds: publicExpansion.publicCatalogItemIds,
  }
}

function mergeUnique<T extends { id: string }>(target: T[], incoming: T[]) {
  const existing = new Set(target.map((item) => item.id))
  for (const item of incoming) {
    if (existing.has(item.id)) continue
    target.push(item)
    existing.add(item.id)
  }
}

function mergeFamilies(familyMap: Map<string, ToolFamily>, incoming: ToolFamily[]) {
  for (const family of incoming) {
    if (!familyMap.has(family.id)) familyMap.set(family.id, family)
  }
}

function mergeBrands(brandMap: Map<string, Brand>, incoming: Brand[]) {
  for (const brand of incoming) {
    const existing = brandMap.get(brand.id)
    if (!existing) {
      brandMap.set(brand.id, brand)
      continue
    }
    existing.aliases = [...new Set([...existing.aliases, ...brand.aliases])]
  }
}

function mergeBatteryPlatforms(batteryPlatformMap: Map<string, BatteryPlatform>, incoming: BatteryPlatform[]) {
  for (const platform of incoming) {
    const existing = batteryPlatformMap.get(platform.id)
    if (!existing) {
      batteryPlatformMap.set(platform.id, platform)
      continue
    }
    existing.aliases = [...new Set([...existing.aliases, ...platform.aliases])]
  }
}

function mergeCapabilities(capabilityMap: Map<string, Capability>, incoming: Capability[]) {
  for (const capability of incoming) {
    if (!capabilityMap.has(capability.id)) capabilityMap.set(capability.id, capability)
  }
}

function mergeCatalogItems(target: ToolCatalogItem[], incoming: ToolCatalogItem[]) {
  const byId = new Map(target.map((item) => [item.id, item]))
  for (const item of incoming) {
    const existing = byId.get(item.id)
    if (!existing) {
      target.push(item)
      byId.set(item.id, item)
      continue
    }
    existing.compatibilityTags = [...new Set([...existing.compatibilityTags, ...item.compatibilityTags])]
    existing.priorityLabels = [...new Set([...existing.priorityLabels, ...item.priorityLabels])]
    existing.searchTags = [...new Set([...existing.searchTags, ...item.searchTags])]
    existing.sourceNoteIds = [...new Set([...existing.sourceNoteIds, ...item.sourceNoteIds])]
  }
}

function cordedState(powerType: PowerType): ToolCatalogItem['cordedOrCordless'] {
  if (powerType === 'Battery') return 'cordless'
  if (powerType === 'Corded') return 'corded'
  if (powerType === 'Manual') return 'manual'
  if (powerType === 'Stationary') return 'stationary'
  if (powerType === 'Pneumatic') return 'pneumatic'
  return undefined
}

function inferBatteryPlatform(brand: string, variantName: string, powerType: PowerType) {
  if (powerType !== 'Battery' && powerType !== 'Battery or Corded') return undefined
  const text = variantName.toLowerCase()
  if (text.includes('20v max')) return `${brand} 20V MAX`
  if (text.includes('m18')) return `${brand} M18`
  if (text.includes('lxt')) return `${brand} LXT`
  if (text.includes('one+')) return `${brand} ONE+`
  if (text.includes('v20')) return `${brand} V20`
  if (text.includes('18v')) return `${brand} 18V`
  if (text.includes('12v')) return `${brand} 12V`
  if (['DeWalt', 'Makita', 'Milwaukee', 'Ryobi', 'Bosch', 'Craftsman', 'RIDGID', 'EGO'].includes(brand)) {
    return `${brand} cordless platform`
  }
  return undefined
}

function inferVoltage(platform: string) {
  const match = platform.match(/\b(\d{2})v\b/i)
  return match ? `${match[1]}V` : undefined
}

function inferCostTier(brand: string, variantName: string): ToolCostTier {
  const text = `${brand} ${variantName}`.toLowerCase()
  if (text.includes('festool') || text.includes('sawstop') || text.includes('grex')) return 'pro'
  if (text.includes('veritas') || text.includes('starrett') || text.includes('jet') || text.includes('rikon')) return 'premium'
  if (text.includes('wen') || text.includes('harbor freight') || text.includes('pittsburgh') || text.includes('black+decker')) return 'budget'
  return 'balanced'
}

function buildCompatibilityTags(brand: string, batteryPlatform: string | undefined, powerType: PowerType, toolName: string) {
  const tags = new Set<string>([slugify(toolName), slugify(brand), slugify(powerType)])
  if (batteryPlatform) tags.add(slugify(batteryPlatform))
  return [...tags]
}

function priorityLabelsForTemplate(template: ToolSeedTemplate): ToolPriorityLabel[] {
  const labels = new Set<ToolPriorityLabel>()
  if (template.skillLevel === 'Beginner') labels.add('First Shop Essential')
  if (['Safety', 'Dust Collection'].includes(template.category)) labels.add('Safety Critical')
  if (['Cutting', 'Drilling', 'Fastening', 'Measuring', 'Layout', 'Clamping'].includes(template.category)) labels.add('Project Unlocker')
  if (template.skillLevel === 'Advanced') labels.add('Specialty Tool')
  if (['Shop Equipment', 'Automotive', 'Plumbing', 'Outdoor / Yard'].includes(template.category)) labels.add('Borrow/Rent Candidate')
  if (labels.size === 0) labels.add('Nice to Have')
  return [...labels]
}

function specsFromVariant(catalogItemId: string, variantName: string): ToolCatalogSpec[] {
  const specs: ToolCatalogSpec[] = []
  const sizeMatch = variantName.match(/\(([^)]+)\)/)
  if (sizeMatch) {
    specs.push({
      id: `${catalogItemId}-spec-observed-size`,
      catalogItemId,
      key: 'observedSize',
      label: 'Observed size/spec',
      value: sizeMatch[1],
      createdAt: today,
      updatedAt: today,
    })
  }
  return specs
}
