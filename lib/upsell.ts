import { listProducts } from './products';
import type { Product } from './data';

// Upsell : articles qui complètent le produit consulté (ex. oreiller -> masque de sommeil, bouchons d’oreilles).
// Chaque règle : when = mots du titre du produit consulté, want = articles complémentaires à chercher (expressions simples, au singulier),
// not = produits à exclure de la règle, skip = titres à ignorer parmi les articles proposés.
type Rule = { when: RegExp; want: string[]; not?: RegExp; skip?: RegExp };
const re = (s: string) => new RegExp('\\b(?:' + s + ')\\b', 'i');
const R = (when: string, want: string, not?: string, skip?: string): Rule => ({ when: re(when), want: want.split('|'), not: not ? re(not) : undefined, skip: skip ? re(skip) : undefined });

const RULES: Rule[] = [
  // Sommeil et maison
  R('neck pillow|travel pillow', 'eye mask|sleep mask|earplug|travel blanket|packing cube|luggage tag'),
  R('pillow', 'sleep mask|eye mask|earplug|pillowcase|lavender', 'pillowcase|case|cover|throw|decorative|couch|sofa|nursing|dog|pet|doll|body|baby|toy|cushion|neck|travel|sleep mask|eye mask'),
  R('sleep mask|eye mask|sleeping mask', 'pillow|earplug|lavender|essential oil', undefined, 'case|cover|dog|pet|baby'),
  R('blanket|throw|comforter|duvet', 'pillow|pillowcase|slipper|bed sheet', 'dog|pet|baby|swaddle|picnic|outdoor|camping|stadium|electric'),
  R('bed sheet|sheet set|bedding|pillowcase', 'pillow|comforter|blanket|mattress protector|sleep mask', 'dog|pet|baby|crib|doll'),
  R('essential oil', 'diffuser|candle|humidifier', 'diffuser|candle|burner|dog|pet|cat'),
  R('diffuser|humidifier', 'essential oil|lavender|candle', 'dog|pet|cat|air fryer'),
  R('candle', 'candle holder|snuffer|wick trimmer|diffuser', 'holder|snuffer|wick|diffuser|dog|pet|led|electric|battery|warmer|making|wax melt|mold'),
  // Cuisine et salle de bain
  R('coffee maker|espresso|french press|coffee machine', 'coffee mug|milk frother|coffee grinder|coffee filter|kettle', 'mug|grinder|filter|frother|cup|tumbler|bean'),
  R('air fryer', 'silicone liner|parchment|oven mitt|tongs|air fryer accessor'),
  R('blender|juicer', 'smoothie cup|tumbler|reusable straw|water bottle', 'cup|tumbler|bottle|straw|replacement|blade|parts'),
  R('knife|knives', 'cutting board|knife sharpener|knife block|cut resistant glove', 'board|sharpener|block|glove|pocket|swiss|hunting|multi|folding|butter|pet|dog'),
  R('cutting board', 'kitchen knife|peeler|kitchen scissors|mixing bowl'),
  R('pan|pot|skillet|cookware|saucepan|wok', 'spatula|oven mitt|pot holder|cooking utensil|trivet', 'holder|mitt|spatula|utensil|plant|flower|dog|pet|tea|coffee|chamber|flower|hot'),
  R('water bottle|tumbler|thermos|flask', 'straw|bottle brush|bottle sleeve|bottle carrier', 'straw|brush|sleeve|carrier|label|sticker|pet|dog|baby|replacement|lid|parts'),
  R('lunch box|bento', 'lunch bag|ice pack|food container|water bottle', 'bag|ice pack|container|kids|dog|pet'),
  R('towel', 'bath mat|shower curtain|soap dispenser|towel rack|bathrobe', 'mat|curtain|dispenser|rack|robe|beach|dog|pet|baby|kitchen|hand|paper|golf|cooling|travel|sports|yoga'),
  R('shower curtain', 'bath mat|bath towel|shower hook|soap dispenser'),
  // Électronique
  R('earbud|earphone|headphone|airpod', 'earbud case|charging cable|power bank|ear tip|headphone stand|aux cable', 'case|cable|tip|cushion|stand|cover|pad|dog|pet|replacement|hook|ear hook|adapter|splitter|baby|noise|muff|protector|kids'),
  R('phone case|iphone case|galaxy case|samsung case|pixel case|case for iphone|case for samsung|case for galaxy|case for pixel', 'screen protector|tempered glass|wireless charger|phone stand|phone grip|charging cable', 'screen|charger|stand|grip|cable|pet|dog|airpod|watch|ipad|tablet'),
  R('screen protector|tempered glass', 'phone case|wireless charger|charging cable|power bank', 'watch|camera|lens|dog|pet|case'),
  R('charger|charging cable|usb cable|lightning cable|usb-c', 'power bank|cable organizer|phone stand|wall charger|car charger', 'bank|organizer|stand|solar|car|battery|dog|pet|cable tie|baby|toy|dock|stand|station|watch|pad'),
  R('power bank', 'charging cable|usb cable|wall charger|phone case', 'cable|charger|case|solar|dog|pet'),
  R('smart watch|smartwatch|fitness tracker', 'watch band|watch strap|screen protector|wireless earbud|charging dock', 'band|strap|protector|dock|charger|kids|case|replacement|stand|dog|pet|holder|baby'),
  R('speaker|soundbar', 'power bank|aux cable|speaker stand|usb cable', 'stand|cable|bank|car|replacement|dog|pet|bracket|mount|cover|fabric|grill|wire|baby'),
  R('dash cam|dashcam|webcam|action camera', 'sd card|memory card|tripod|camera case|lens cleaning', 'card|tripod|case|lens|security|baby|pet|toy|kids|replica|fake|dummy|mount|holder|cover|battery|charger'),
  R('laptop|macbook|ipad|tablet', 'laptop sleeve|laptop stand|wireless mouse|mouse pad|usb hub', 'sleeve|stand|mouse|pad|hub|case|bag|backpack|cooler|skin|cover|dog|pet|kids|toy|desk|tray|table|holder|charger|battery|screen|keyboard|stylus|pen|bed|lap|cooling|pillow|sticker|decal'),
  R('keyboard', 'wireless mouse|wrist rest|mouse pad|laptop stand', 'mouse|rest|pad|stand|cover|skin|piano|toy|kids|keycap|protector|case|tray'),
  R('computer mouse|wireless mouse|gaming mouse', 'mouse pad|wrist rest|wireless keyboard|laptop stand', 'pad|rest|keyboard|stand|pet|cat|toy|trap|feet|skate|grip|cover|case|bungee'),
  R('gamepad|game controller|joystick', 'charging dock|controller case|thumb grip|gaming headset|mouse pad', 'dock|case|grip|headset|pad|skin|cover|stand|holder|dog|pet|baby|toy|kids|shell|charger'),
  // Beauté
  R('serum', 'moisturizer|face cream|facial cleanser|sunscreen|face mask|gua sha', 'moisturizer|cream|cleanser|sunscreen|mask|gua sha|hair|lash|brow|eyelash|nail|beard|dog|pet'),
  R('cleanser|face wash', 'toner|moisturizer|face serum|facial sponge|cotton pad', 'toner|moisturizer|serum|sponge|cotton|dish|surface|bath|floor|kitchen|toilet|brush|dog|pet|multi|glass|carpet|car|jewelry|screen|lens|air'),
  R('moisturizer|face cream|night cream', 'serum|sunscreen|lip balm|face mask|facial cleanser', 'serum|sunscreen|balm|mask|cleanser|hand|body|baby|dog|pet|diaper|nipple|paw'),
  R('face mask|sheet mask|facial mask', 'headband|face roller|serum|moisturizer', 'headband|roller|serum|moisturizer|cleanser|sleep|eye|covid|dust|surgical|ski|halloween|costume|cloth|n95|kn95|respirator|protective|reusable|neck|party|cover|snorkel|diving'),
  R('sunscreen|sun cream', 'lip balm|after sun|aloe vera|sunglasses|beach towel', 'balm|after|aloe|sunglasses|towel|dog|pet'),
  R('shampoo', 'conditioner|hair mask|hair brush|scalp massager|hair oil', 'conditioner|mask|brush|massager|oil|dog|pet|baby|carpet|upholstery|car|rug|cat'),
  R('conditioner', 'shampoo|hair mask|hair oil|hair brush', 'shampoo|mask|oil|brush|air conditioner|dog|pet|cat|leather'),
  R('hair dryer|blow dryer|hair straightener|flat iron|curling iron|hair curler', 'heat protectant|hair brush|hair clip|heat resistant mat|hair serum', 'protectant|brush|clip|mat|serum|dog|pet|travel adapter|holder|stand|attachment|diffuser'),
  R('makeup brush|foundation brush', 'brush cleaner|makeup sponge|makeup bag|makeup mirror|makeup organizer', 'cleaner|sponge|bag|mirror|organizer|nail|paint|art|cleaning|holder'),
  R('lipstick|lip gloss|lip liner', 'lip liner|lip balm|lip scrub|lip brush', 'liner|balm|scrub|brush|dog|pet'),
  R('mascara', 'eyelash curler|eye makeup remover|eyebrow pencil|false lashes', 'curler|remover|pencil|lashes|dog|pet'),
  R('foundation|concealer', 'makeup sponge|setting powder|setting spray|makeup brush|primer', 'sponge|powder|spray|brush|primer|house|crack|waterproofing|concrete|wall|foundation repair|dog|pet'),
  R('nail polish|gel polish', 'nail file|base coat|top coat|nail lamp|cuticle oil|nail polish remover', 'file|coat|lamp|oil|remover|kit|drill|dog|pet'),
  R('razor|shaver|shaving', 'shaving cream|aftershave|beard oil|razor blade|shaving brush', 'cream|aftershave|beard|blade|brush|dog|pet|stand|holder|cover|case|travel|bag|toy|kids|trimmer'),
  R('beard trimmer|beard', 'beard oil|beard balm|beard comb|beard brush|shaving cream', 'oil|balm|comb|brush|cream|dog|pet|costume|fake|hat|party|mask|santa|toy|kids'),
  R('toothbrush', 'toothpaste|dental floss|tongue scraper|toothbrush holder|mouthwash', 'toothpaste|floss|scraper|holder|mouthwash|dog|pet|baby|cat|aligner|travel|cover|case|head|replacement|sanitizer|sterilizer'),
  R('vitamin|supplement|capsule', 'pill organizer|shaker bottle|water bottle', 'organizer|shaker|bottle|dog|pet|cat|horse|bird|fish|hair'),
  // Sports et plein air
  R('yoga mat', 'yoga block|yoga strap|yoga towel|resistance band|water bottle', 'block|strap|towel|band|bottle|cleaner|bag|dog|pet|kids'),
  R('dumbbell|kettlebell|barbell', 'workout glove|exercise mat|resistance band|weight rack|gym towel', 'glove|mat|band|rack|towel|toy|kids|pet|dog|cover|bag|bar|collar|clip'),
  R('resistance band', 'yoga mat|jump rope|workout glove|exercise mat|foam roller', 'mat|rope|glove|roller|dog|pet|hair|door|anchor|handle|loop'),
  R('jump rope', 'workout glove|water bottle|exercise mat|resistance band|gym towel', 'glove|bottle|mat|band|towel|dog|pet|kids'),
  R('foam roller|massage ball', 'yoga mat|resistance band|stretching strap|exercise mat', 'mat|band|strap|dog|pet'),
  R('running shoe|sneaker|trainer', 'running sock|insole|shoe cleaner|shoe deodorizer|sports water bottle', 'sock|insole|cleaner|deodorizer|bottle|kids|baby|toddler|boys|girls|dog|pet|lace|pouch|slippers|skate|roller|clip|charm|bag|display|stand|rack|box|keeper|tree|stretcher'),
  R('tent', 'sleeping bag|camping lantern|camping mat|tent stake|camping chair', 'bag|lantern|mat|stake|chair|accessor|repair|light|fan|pegs|kids|toy|play|pop|dog|pet|baby|cat|hamster|shower|privacy|changing|bed|crib|cot|tunnel|doll|teepee|fort|canopy|screen|wall|vent|pole|footprint|tarp'),
  R('sleeping bag', 'sleeping pad|camping pillow|camping lantern|headlamp', 'pad|pillow|lantern|headlamp|baby|toddler|kids|doll|dog|pet|liner|stuff|compression|sack'),
  R('flashlight|headlamp|lantern', 'rechargeable battery|camping stove|multi tool|paracord', 'batter|stove|tool|dog|pet|holder|mount|holster|case|lens|charger|bulb'),
  R('fishing rod|fishing reel', 'fishing line|fishing lure|tackle box|fishing hook|fishing pliers', 'line|lure|tackle|hook|pliers|bag|sticker|decal|shirt|holder|case|display|rack|stand|tip|guide|handle|knob|repair'),
  R('bike|bicycle', 'bike helmet|bike lock|bike light|bike pump|water bottle cage', 'helmet|lock|light|pump|cage|tire|tube|seat|saddle|bell|basket|pedal|trainer|stand|rack|chain|brake|kids|toddler|balance|dog|pet|trailer|computer|mount|case|bag|cover|exerciser|stationary|desk|under|holder|spoke|tool|repair|cable|grip|handle|fender|kickstand|crank|frame|rim|wheel|cassette|derailleur|shifter|lever|pannier|carrier|toy|cart|stroller|exercise'),
  R('bike helmet|bicycle helmet', 'bike light|bike glove|bike lock|water bottle cage', 'light|glove|lock|cage|kids|toddler|baby|visor|liner|pad'),
  R('golf', 'golf ball|golf tee|golf glove|golf towel|golf rangefinder', 'tee|glove|towel|marker|hat|shirt|sticker|ornament|mug|cart cover|mat|net|swing|trainer|cleaner|cooler|umbrella|bag|poker|chips|retriev'),
  // Animaux
  R('dog leash', 'dog harness|dog collar|poop bag|dog treat', 'harness|collar|bag|treat'),
  R('dog collar', 'dog leash|dog tag|dog harness|poop bag', 'leash|tag|harness|bag|light|cat'),
  R('dog harness', 'dog leash|dog collar|poop bag|dog treat', 'leash|collar|bag|treat|cat'),
  R('dog bed|pet bed', 'pet blanket|dog toy|dog bowl|chew toy', 'blanket|toy|bowl|cover|cat|stairs|steps|ramp|cooling'),
  R('dog bowl|pet bowl|pet feeder|dog feeder', 'pet food mat|dog treat|dog food container|water fountain', 'mat|treat|container|fountain|cat|stand|slow'),
  R('dog toy|chew toy', 'dog treat|dog ball|dog bed|rope toy', 'treat|ball|bed|rope|cat'),
  R('cat tree|cat tower', 'cat scratching post|cat toy|cat bed|cat treat', 'post|toy|bed|treat|dog'),
  R('cat toy', 'cat treat|catnip|cat scratcher|cat tunnel', 'treat|catnip|scratcher|tunnel|dog'),
  R('litter box|cat litter', 'litter mat|litter scoop|litter bag|cat toy', 'mat|scoop|bag|toy|dog'),
  R('cat scratcher|scratching post', 'catnip|cat toy|cat tree', 'catnip|toy|tree|dog'),
  R('pet carrier|dog carrier|cat carrier', 'pet blanket|travel bowl|dog harness|pet water bottle', 'blanket|bowl|harness|bottle|cover|stroller|liner|pad'),
  R('dog crate|kennel', 'crate mat|dog bed|chew toy|dog bowl', 'mat|bed|toy|bowl|cover|pad|divider|tray|cat'),
  R('pet grooming|dog brush|pet brush|deshedding', 'pet shampoo|dog nail clipper|pet wipe|dog towel', 'shampoo|clipper|wipe|towel|cat'),
  // Bébé et enfants
  R('diaper bag', 'changing pad|baby wipe|baby bottle|diaper cream|burp cloth', 'pad|wipe|bottle|cream|cloth|dog|pet|backpack organizer|insert|liner|strap'),
  R('baby bottle', 'bottle brush|bottle warmer|pacifier|sterilizer|burp cloth', 'brush|warmer|pacifier|sterilizer|cloth|nipple|dog|pet|cat|holder|bag|cooler|sleeve|insert|liner'),
  R('pacifier', 'pacifier clip|pacifier case|teether|baby blanket', 'clip|case|teether|blanket|dog|pet|doll|wipes|holder|sterilizer'),
  R('baby blanket|swaddle', 'baby pillow|baby hat|pacifier|crib sheet|burp cloth', 'pillow|hat|pacifier|sheet|cloth|dog|pet|doll'),
  R('stroller', 'stroller organizer|rain cover|stroller fan|cup holder|baby blanket', 'organizer|cover|fan|holder|blanket|dog|pet|doll|toy|wheel|parts|hook|strap|bag|mosquito|net|footmuff|liner|canopy|seat pad'),
  R('baby monitor', 'night light|white noise machine|baby blanket|crib sheet', 'light|noise|blanket|sheet|cover|mount|stand|holder|dog|pet|battery|charger'),
  R('baby carrier', 'baby hat|burp cloth|baby blanket|diaper bag', 'hat|cloth|blanket|bag|dog|pet|cover|bib|strap|doll|cat|insert|hood|extender'),
  R('high chair', 'baby bib|baby plate|sippy cup|splat mat|baby spoon', 'bib|plate|cup|mat|spoon|dog|pet|cover|tray|cushion|liner|doll|toy|replacement|pad|parts|strap'),
  R('bib', 'baby spoon|baby plate|sippy cup|burp cloth', 'spoon|plate|cup|cloth|dog|pet|doll|overalls|apron|golf|sports|clip|barber'),
  R('teether', 'pacifier|baby toy|baby bib', 'pacifier|toy|bib|dog|pet|cat'),
  R('crib', 'crib sheet|baby blanket|night light|crib mobile', 'sheet|blanket|light|mobile|dog|pet|doll|toy|mattress|rail|guard|bumper|skirt|tent|organizer|conversion|parts|hardware'),
  R('building block|lego|brick', 'storage|play mat|building plate|baseplate|toy organizer', 'storage|mat|plate|organizer|dog|pet|cat|wall|panel|bag|box'),
  R('doll', 'doll clothes|doll accessor|doll house|doll stroller|doll furniture', 'clothes|accessor|house|stroller|furniture|dog|pet|cat|bed|crib|carrier|wig|hair|shoes|outfit|costume|case|bag|stand|display|holder|sleeping bag|bottle|pacifier|diaper|food|high chair|set'),
  R('puzzle', 'puzzle mat|puzzle glue|puzzle frame|puzzle board', 'mat|glue|frame|board|dog|pet|cat|storage|case|table|sorter|tray|holder|roll|felt|easel|stand|rack'),
  R('board game', 'dice|playing card|score pad|game storage', 'dice|card|pad|storage|dog|pet|cat|cover|tray|holder|box|mat|bag|organizer'),
  R('plush|stuffed animal', 'baby blanket|toy storage|night light|pillow', 'blanket|storage|light|pillow|dog toy|cat toy|pet|clothes|outfit|case|bag|hanger|holder|chair|net|hammock|display|keychain|backpack'),
  R('rc car|remote control car|rc truck', 'rechargeable battery|battery charger|spare part|carrying case', 'battery|charger|part|case|dog|pet|toy storage|track|ramp|tire|wheel|body|shell|motor|esc|servo|radio|receiver|bumper|arm|axle|shock|gear|driveshaft|diff'),
  R('crayon|marker|colored pencil', 'coloring book|drawing paper|sketch pad|pencil case|pencil sharpener', 'book|paper|pad|case|sharpener|dry erase|whiteboard|dog|pet|refill|ink|pen|tip|cleaner|stand|holder|organizer|storage|roll|easel'),
  R('kids backpack|school backpack|toddler backpack', 'lunch box|water bottle|pencil case|school supplies', 'lunch|bottle|case|supplies|dog|pet|doll|cover|rain|tag|charm|keychain|organizer|insert|patch|zipper'),
  // Bureau
  R('notebook|journal|planner', 'pen|highlighter|sticky note|pencil case|washi tape|sticker', 'pen|highlight|sticky|case|tape|sticker|diaper|laptop|cover|computer|gaming|cooling|refill|insert|holder|stand|tablet|binder|paper|dividers|page marker|index|tab|label|holder|bag|pouch|sleeve|protector'),
  R('pen|pencil', 'notebook|pencil case|highlighter|sticky note|planner', 'notebook|case|highlight|sticky|planner|pig|stylus|ink|fountain|refill|cartridge|dog|pet|bubble|holder|pigsty|sharpener|grip|cap|topper|tip|nib|lead|eraser|cover|box|bag|pouch|stand|rack|display|wall|dispenser|tablet|apple|digital|screen|touch|laser|writing|3d|tattoo|paint|art|craft|garden|fence|animal|livestock|play|kids'),
  R('desk organizer|pen holder', 'pen|sticky note|desk pad|paper clip|notebook', 'pen|sticky|pad|clip|notebook|dog|pet|cat'),
  R('desk lamp', 'led light bulb|desk organizer|monitor stand|usb hub', 'bulb|organizer|stand|hub|dog|pet|cat|replacement|shade|clip|stem|base|arm|cord|plug|switch|dimmer|battery|solar|garden|floor'),
  R('office chair', 'seat cushion|lumbar support|footrest|desk mat|chair mat', 'cushion|lumbar|footrest|mat|dog|pet|cat|cover|wheel|caster|arm|gas lift|base|plate|bolt|screw|hardware|replacement|parts'),
  R('monitor stand|laptop stand', 'wireless keyboard|wireless mouse|mouse pad|desk mat|usb hub', 'keyboard|mouse|pad|mat|hub|dog|pet|cat|riser|tray|bag|sleeve|case|cover|holder'),
  R('whiteboard|dry erase board', 'dry erase marker|whiteboard eraser|magnet|marker', 'marker|eraser|magnet|dog|pet|cat|cleaner|spray|cloth|stand|easel|tray|holder'),
  R('stapler', 'staple|paper clip|tape dispenser|hole punch', 'staple|clip|dispenser|punch|dog|pet|cat|remover|gun|nailer|cordless|electric|heavy|upholstery|industrial|pneumatic'),
  R('sticky note', 'pen|highlighter|planner|notebook', 'pen|highlight|planner|notebook|dog|pet|cat|holder|dispenser|pad holder|cube|stand|tray'),
  // Bricolage et jardin
  R('drill|drill driver', 'drill bit|screwdriver set|safety glasses|work glove|tool bag', 'bit|set|glasses|glove|bag|toy|kids|nail|dental|manicure|press|battery|dremel|dog|pet|cat|charger|chuck|key|stand|holder|guide|dust|collector|sharpener|attachment|adapter|accessor|case|block|bench|vise|template|jig|mount|clamp|depth|stop|hole|saw|cutter'),
  R('screwdriver', 'tool box|pliers|wrench set|tape measure|work glove', 'box|pliers|wrench|measure|glove|toy|kids|vodka|orange|dog|pet|cat|bit|holder|handle|magnetizer|jewelers|precision|eyeglass|watch|phone|laptop|repair kit'),
  R('hammer', 'nail|tape measure|level|work glove|safety glasses', 'nail|measure|level|glove|glasses|toy|kids|pet|dog|cat|handle|head|wedge|sledge|mallet|replacement|holder|strap|loop|holster|sleeve'),
  R('tape measure|spirit level|laser level', 'pencil|marker|utility knife|work glove|tool belt', 'pencil|marker|knife|glove|belt|dog|pet|cat|clip|holder|case|stand|tripod|mount|bracket|receiver|detector|target|glasses|sensor|spacer'),
  R('tool box|toolbox|tool set|tool kit', 'work glove|safety glasses|tape measure|flashlight|screw', 'glove|glasses|measure|flashlight|screw|dog|pet|cat|toy|kids|bag|tray|organizer|insert|foam|divider|lock|latch|handle|hinge|lid|cart'),
  R('paint roller', 'painter tape|drop cloth|paint tray|roller cover|paint scraper', 'tape|cloth|tray|cover|scraper|dog|pet|cat|frame|handle|extension|pole|sleeve|brush|kit|set'),
  R('work glove|gardening glove|garden glove', 'safety glasses|knee pad|pruning shear|garden tool', 'glasses|pad|shear|tool|dog|pet|cat|liner|sleeve|clip|holder|hook|rack|dispenser|stand'),
  R('garden hose', 'hose nozzle|hose reel|hose connector|sprinkler', 'nozzle|reel|connector|sprinkler|dog|pet|cat|washer|repair|mender|splitter|timer|filter|holder|hanger|guide|pot|stand|cart|storage|hook|bracket'),
  R('pruning shear|garden shear', 'garden glove|garden tool|garden kneeler', 'glove|tool|kneeler|dog|pet|cat|sharpener|holster|blade|replacement|spring|case|sheath|oil|lubricant|cleaner|holder|belt|cover'),
  R('planter|plant pot|flower pot', 'potting soil|plant stand|watering can|plant saucer|garden glove', 'soil|stand|can|saucer|glove|dog|pet|cat|liner|insert|tray|drainage|mesh|hook|hanger|bracket|holder|cover|decoration|figurine|statue|sticker|ornament'),
  R('wrench|socket set', 'tool box|screwdriver set|pliers|work glove', 'box|screwdriver|pliers|glove|dog|pet|cat|adapter|extension|holder|rack|organizer|tray|rail|storage|bag|case|key|handle|bit|torque'),
  R('pliers', 'screwdriver set|wire cutter|tool box|work glove', 'screwdriver|cutter|box|glove|dog|pet|cat|holder|rack|organizer|belt|pouch|sheath|holster|sharpener|spring|replacement|hook|loop'),
  R('soldering iron', 'solder wire|soldering flux|solder stand|desoldering', 'wire|flux|stand|desoldering|dog|pet|cat|tip|station|holder|kit|case|fume|extractor|helping hand|cleaner|sponge|brass|mat|paste'),
  R('multimeter', 'test lead|battery|wire stripper|electrical tape', 'lead|battery|stripper|tape|dog|pet|cat|clamp|probe|case|holder|stand|adapter|fuse'),
  // Auto
  R('car phone mount|car phone holder|phone mount for car|phone holder for car|phone mount for dash', 'car charger|charging cable|cable organizer|phone case|dash mat'),
  R('seat cover', 'steering wheel cover|floor mat|seat cushion|car organizer|seat belt pad', 'steering|mat|cushion|organizer|pad|dog|pet|cat|baby|child|booster|infant|toddler|kids|pet seat|hammock|protector|liner|belt'),
  R('floor mat', 'seat cover|trunk mat|steering wheel cover|car organizer', 'seat|trunk|steering|organizer|dog|pet|cat|baby|kids|bath|kitchen|door|yoga|exercise|gym|play|puzzle|interlocking|foam|anti|fatigue|garage|boot|shoe|pet food|litter|dining|entry|welcome|rug|runner|carpet|bar|bathroom|shower|tub|mud'),
  R('car vacuum', 'microfiber cloth|air freshener|detailing brush|cleaning gel', 'cloth|freshener|brush|gel|dog|pet|cat|filter|hose|attachment|bag|replacement|battery|charger|part|nozzle|handheld|robot|cordless|stick|upright|canister|wet|dry|shop|workshop|garage'),
  R('car wash|car wax|car polish|car detailing', 'microfiber cloth|wash mitt|applicator pad|detailing brush|spray bottle', 'cloth|mitt|pad|brush|bottle|dog|pet|cat|sponge|bucket|soap|foam|cannon|gun|hose|wheel|tire|glass|towel|drying|clay|bar|mist|kit|set|ceramic|coating|sealant'),
  R('jump starter', 'jumper cable|tire inflator|car charger|emergency kit', 'cable|inflator|charger|kit|dog|pet|cat|clamp|battery pack|case|bag|replacement|part|holder|mount'),
  R('tire inflator|air compressor', 'tire pressure gauge|jump starter|emergency kit|tire repair kit', 'gauge|starter|kit|dog|pet|cat|hose|chuck|valve|adapter|nozzle|needle|ball|sports|bicycle|bike|mattress|pool|inflatable|toy|float|boat|paddle|kayak'),
  R('steering wheel cover', 'seat cover|floor mat|car organizer|phone mount', 'seat|mat|organizer|mount|dog|pet|cat|knob|spinner|lock|brace|booster|extension|lighted|wheel cover for|golf cart|boat|truck'),
  R('car organizer|trunk organizer', 'floor mat|seat cover|emergency kit|cargo net', 'mat|seat|kit|net|dog|pet|cat|hook|backseat|seat back|console|visor|sunglasses|trash|cup|key|coin|tissue|hanger|cell|phone|tablet|wallet|umbrella|bag holder|cooler|tray|table|desk'),
  R('motorcycle helmet', 'motorcycle glove|helmet visor|riding jacket|bluetooth headset|balaclava', 'glove|visor|jacket|headset|balaclava|dog|pet|cat|lock|bag|cover|light|decal|sticker|liner|pad|strap|speaker|mount|camera|cleaner|shield|mirror|spoiler|cap|scarf|chin|neck'),
  // Mode et accessoires
  R('wallet', 'belt|keychain|card holder|sunglasses', 'belt|keychain|holder|dog|pet|cat|travel|passport|phone|chain|insert|case|cover|clip|zip|lanyard|strap|tracker|apple|airtag|magsafe|sticker|adhesive|id|credit|rfid|blocking|protector|sleeve|pouch|organizer|cleaner|polish|conditioner|oil|spray|wax'),
  R('belt', 'wallet|watch|sunglasses|socks', 'wallet|watch|sunglasses|socks|dog|pet|cat|fanny|waist|tool|baby|seat|utility|pelvic|back|lumbar|trainer|garter|buckle|loop|holder|clip|extender|keeper|organizer|hook|hanger|rack|stand|display|box|case|bag|pouch|holster|sheath|sander|conveyor|drive|timing|v-belt|serpentine|fan|alternator|pulley|tensioner|idler|cover|guard|tray|weight|lifting|support|brace|corset|slimming|sweat|shaper|workout|boxing|martial|judo|karate|taekwondo|bjj|gi|uniform|rank'),
  R('sunglasses', 'sunglass case|glasses chain|cleaning cloth|hat|lens cleaner', 'case|chain|cloth|hat|cleaner|kids|baby|dog|pet|cat|toddler|boys|girls|clip|replacement|lens|nose pad|temple|screw|repair|kit|strap|cord|holder|stand|rack|organizer|display|box|pouch|bag|sleeve|visor|cover|goggle|shield|mask'),
  R('necklace|pendant', 'earring|bracelet|jewelry box|ring', 'earring|bracelet|box|ring|dog|pet|cat|display|stand|holder|organizer|hook|cleaner|cord|chain extender|clasp|bail|charm|bead|finding|making|supplies|kit|tool|plier|wire|thread|string|rope|leather|waxed|silk|elastic|stretch'),
  R('earring', 'necklace|bracelet|ring|jewelry box', 'necklace|bracelet|ring|box|stand|holder|organizer|back|hook|cleaner|dog|pet|cat|display|stud finder|tool|plier|finding|making|supplies|kit|wire|post|clutch|lock|stopper|lifter|tape|adhesive|pad|support|guard|stabilizer|protector|saver|helper'),
  R('bracelet', 'necklace|earring|ring|watch', 'necklace|earring|ring|watch|dog|pet|cat|kids|baby|stand|holder|box|cleaner|medical|id|tracker|anklet|wristband|hospital|bead|making|supplies|kit|tool|clasp|charm|cord|string|thread|rope|leather|elastic|stretch|findings|display|organizer|hanger|hook|rack|tree|bar|tray|pouch|bag'),
  R('ring', 'necklace|earring|bracelet|jewelry box', 'necklace|earring|bracelet|box|stand|holder|light|teething|binder|keychain|key|curtain|shower|bell|toss|pull|nose|cat|dog|pet|o-ring|piston|seal|gasket|snap|split|key ring|sizer|adjuster|guard|saver|resizer|tool|stretcher|mandrel|cleaner|polish|cloth|dish|tray|organizer|display|tree|cone|tower|pillow|cushion|bearer|case|pouch|bag'),
  R('scarf|scarves', 'glove|beanie|winter hat|earmuff', 'glove|beanie|hat|earmuff|dog|pet|cat|baby|head|hijab|silk|hair|neck|bandana|ring|clip|holder|pin|brooch|rack|hanger|organizer|display|stand|tie|slide|hook|box|bag'),
  R('beanie|winter hat', 'glove|scarf|earmuff|neck warmer', 'glove|scarf|earmuff|warmer|dog|pet|cat|baby|light|led|speaker|bluetooth|music|headphone|camera|holder|stand|rack|display|pompom|pom|fur|maker|loom|knitting|crochet|pattern|kit|yarn'),
  R('glove', 'beanie|scarf|neck warmer|hand warmer', 'beanie|scarf|warmer|dog|pet|cat|baby|work|garden|boxing|latex|nitrile|disposable|oven|baseball|golf|goalie|batting|cleaning|dishwashing|rubber|welding|cut|safety|mechanic|tactical|shooting|cycling|motorcycle|riding|ski|snow|weight|lifting|gym|workout|fitness|yoga|grip|exfoliating|bath|shower|spa|massage|hair|dye|color|hand|foot|nail|beauty|cosmetic|skin|care|moisturizing|spa|hair|grooming|pet|bathing|brush|deshedding|wash|mitt|cloth|towel|kitchen|bbq|grill|heat|resistant|silicone|fire|fireproof|hot|cold|freezer|insulated'),
  R('handbag|purse|tote bag', 'wallet|scarf|keychain|makeup bag|sunglasses', 'wallet|scarf|keychain|makeup|sunglasses|dog|pet|cat|insert|organizer|hook|charm|strap|cover|liner|shaper|protector|base|bottom|feet|stud|zipper|chain|handle|clasp|lock|buckle|ring|hardware|replacement|part|repair|kit|conditioner|cleaner|polish|waterproof|spray|stand|holder|hanger|rack|display|box|case|dust|storage|travel|bag in bag|pouch|sleeve|stuffing|filler|pillow|cushion|tissue|paper|wrap|tag|label|id|name|monogram|personalized|custom|embroidery|patch|sticker|decal|badge|pin|brooch|bow|ribbon|tassel|fringe|pom|fur|plush|bear|animal|cartoon|cute|kawaii|anime|character'),
  R('backpack', 'rain cover|water bottle|pencil case|lunch box|laptop sleeve', 'cover|bottle|case|lunch|sleeve|dog|pet|cat|baby|diaper|kids|toddler|doll|replacement|pocket|part|zipper|strap|organizer|hook|patch|charm|keychain|clip|carrier|harness|cooler|insulated|hydration|bladder|reservoir|tube|bite|valve|mouthpiece|rain|waterproof|liner|dry|bag|pouch|stuff|sack|compression|packing|cube|travel|tag|lock|alarm|tracker|airtag|gps|safe|anti|theft|cable|usb|charging|solar|power|bank|light|led|reflective|safety|visibility|vest|armband|band|slap|bracelet'),
  R('luggage|suitcase', 'luggage tag|packing cube|luggage cover|travel pillow|tsa lock|luggage scale', 'tag|cube|cover|pillow|lock|scale|strap|spinner wheel|replacement|part|dog|pet|cat|toy|doll|kids|miniature|model|decoration|bear|cart|trolley|dolly|handle|wheel|caster|zipper|pull|tab|puller|hook|clip|organizer|compression|bag|pouch|sleeve|protector|guard|corner|bumper|sticker|decal|label|id|name|monogram|personalized|custom|embroidery|patch|badge|pin|brooch|bow|ribbon|tassel|fringe|pom|fur|plush|animal|cartoon|cute|kawaii|anime|character|set of|piece|pc|pcs'),
  R('packing cube|toiletry bag', 'luggage tag|travel bottle|passport holder|travel pillow|luggage scale', 'tag|bottle|holder|pillow|scale|dog|pet|cat|cover|lock|strap|organizer|compression|bag|pouch|sleeve'),
  R('passport holder|passport cover', 'luggage tag|travel pillow|packing cube|travel adapter|toiletry bag', 'tag|pillow|cube|adapter|bag|dog|pet|cat|wallet|case|cover|protector|sleeve|organizer'),
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 40);
const SENSITIVE = /\b(dog|cat|pet|baby|doll|toy|kids?|toddler|costume)\b/i;

// Renvoie jusqu’à n articles complémentaires du produit (tableau vide si aucune règle ne s’applique).
export async function complements(p: Product, n = 3): Promise<Product[]> {
  try {
    const rule = RULES.find((r) => r.when.test(p.name) && !(r.not && r.not.test(p.name)));
    if (!rule) return [];
    const groups = await Promise.all(
      rule.want.map(async (kw) => {
        const rx = new RegExp('\\b' + esc(kw) + '(?:s|es)?\\b', 'i');
        const { items } = await listProducts({ q: kw, per: 16 });
        return items
          .filter((c) => c.id !== p.id && rx.test(c.name) && !(rule.skip && rule.skip.test(c.name)) && (SENSITIVE.test(p.name) || !SENSITIVE.test(c.name)) && c.price <= p.price * 1.5 + 15 && key(c.name) !== key(p.name))
          .sort((a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0) || a.price - b.price);
      }),
    );
    const out: Product[] = [];
    const seen = new Set<number>([p.id]);
    for (let i = 0; i < 4 && out.length < n; i++) {
      for (const g of groups) {
        const c = g[i];
        if (c && !seen.has(c.id)) { seen.add(c.id); out.push(c); if (out.length >= n) break; }
      }
    }
    return out;
  } catch {
    return [];
  }
}
