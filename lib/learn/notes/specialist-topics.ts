import type { LessonNotes } from "./types";

// CSCS HS&E study lessons — module: specialist_topics (AI-authored seed content).

export const SPECIALIST_TOPICS_NOTES: Record<string, LessonNotes> = {
  "road_works": {
    "title": "Highway & Road Works",
    "intro": "Road works put you within arm's reach of live, fast-moving traffic and heavy plant, so the way the site is laid out and how you behave inside it can be the difference between going home and not.",
    "bullets": [
      "Temporary traffic management on the highway must follow **Chapter 8 of the Traffic Signs Manual**, which sets out safe signing, lighting and guarding layouts.",
      "You must wear **high-visibility clothing** at all times near a live carriageway so drivers and plant operators can see you.",
      "Never step over, through or between cones into the **live carriageway** — the coned-off safety zone is there to keep you out of moving traffic.",
      "The tapered run of cones at the start of the works is the **lead-in taper**, which slows and steers traffic away safely before it reaches you.",
      "Before you dig, locate buried services using a **CAT and Genny (cable avoidance tool)** and mark them up, as striking a cable or main can be fatal.",
      "Most people struck on site are hit by **reversing vehicles**, so use a trained banksman and keep out of a machine's blind spots.",
      "Keep the public safe by providing a **segregated pedestrian route** with a firm, well-lit walkway separated from the works.",
      "Know your **emergency escape route** out of the works in case a vehicle enters the site, and never turn your back on live traffic.",
      "Prolonged use of breakers and pokers can cause **Hand-Arm Vibration Syndrome (HAVS)**, so limit trigger time and report tingling or whitening fingers early.",
      "Be aware of the **safety zone** around plant and never work or stand where an operator cannot see you."
    ],
    "figures": [
      {
        "emoji": "🚧",
        "title": "Coned-off works",
        "caption": "Cones mark the safety zone — never cross them into live traffic."
      },
      {
        "emoji": "🦺",
        "title": "High-vis is mandatory",
        "caption": "Wear high-visibility clothing at all times near a live carriageway."
      }
    ]
  },
  "gas_and_plumbing": {
    "title": "Gas & Plumbing Awareness",
    "intro": "Gas and water systems carry hidden dangers — explosion, poisoning, scalding and disease — and much of the work is legally reserved for registered specialists.",
    "bullets": [
      "Only a **Gas Safe registered** engineer is legally allowed to work on gas appliances, pipework and installations.",
      "Natural gas is odourless, so a **stenching agent (rotten-egg smell)** is added to help you detect a leak.",
      "If you smell gas, turn off the supply at the meter, open windows, avoid **naked flames and electrical switches**, and get everyone out.",
      "Report a suspected gas leak to the **National Gas Emergency Service on 0800 111 999**, which operates 24 hours a day.",
      "A poorly maintained boiler or flue can produce **carbon monoxide**, a colourless, odourless gas that can kill — never block ventilation.",
      "Stored and stagnant water systems can grow **Legionella bacteria**, which causes a serious form of pneumonia if inhaled as a fine spray.",
      "Old pipe lagging and boiler flues may contain **asbestos**, so stop and seek advice if you disturb suspect material.",
      "Always **isolate and lock off** the supply before working on pipework, and prove it is dead or drained before you start.",
      "Hot feeds and stored water can cause **scalding**, so treat pipes and cylinders as hot until proven otherwise.",
      "Service risers, ducts and plant rooms can be **confined spaces**, requiring gas testing and a permit before entry."
    ],
    "figures": [
      {
        "emoji": "☎️",
        "title": "Gas emergency line",
        "caption": "Smell gas? Ventilate, no flames, call 0800 111 999."
      },
      {
        "emoji": "🛠️",
        "title": "Gas Safe only",
        "caption": "Gas work is reserved for Gas Safe registered engineers."
      }
    ]
  },
  "demolition": {
    "title": "Demolition & Refurbishment",
    "intro": "Taking a structure down or stripping it out releases decades of hidden hazards — unstable structure, asbestos, dust and buried services — which is why demolition is one of the most tightly controlled activities on site.",
    "bullets": [
      "Under **CDM 2015**, demolition must be planned in writing and carried out under the supervision of a **competent person**.",
      "A **refurbishment and demolition asbestos survey** must be done before work starts, as older buildings commonly contain asbestos.",
      "Cutting or breaking concrete, brick and stone releases **respirable crystalline silica (RCS)**, so use water suppression and RPE to control the dust.",
      "Structures can **collapse without warning**, so follow the agreed sequence and never remove supporting elements out of order.",
      "Set up **exclusion zones** below and around the works to protect people from falling debris and dropped materials.",
      "Assume services are live until proven otherwise and locate **hidden gas, water and electrical supplies** before you disturb them.",
      "Old paintwork may contain **lead**, which is harmful if the dust or fumes are inhaled or swallowed during stripping or hot cutting.",
      "Hot cutting, burning and grinding create a **fire risk**, so control ignition sources with a hot works permit and keep extinguishers to hand.",
      "Working at height on partly demolished structures needs **edge protection and safe access**, not standing on unstable remains.",
      "Heavy, awkward debris makes **manual handling** injuries likely, so use plant and mechanical aids rather than lifting by hand."
    ],
    "figures": [
      {
        "emoji": "🏚️",
        "title": "Plan before you strip",
        "caption": "Asbestos survey and written plan needed before demolition begins."
      },
      {
        "emoji": "😷",
        "title": "Control the dust",
        "caption": "Silica from concrete and brick needs water suppression plus RPE."
      }
    ]
  },
  "water_and_tunnelling": {
    "title": "Working Near Water & Tunnelling",
    "intro": "Water and underground works combine drowning, disease and confined-space dangers that can overwhelm you fast, so rescue arrangements and atmosphere testing must be in place before you start.",
    "bullets": [
      "When there is a risk of falling in, wear a **life jacket or buoyancy aid** and never work over deep or fast water alone.",
      "Suitable **rescue equipment such as a throwline** and a trained person must be available whenever you work near water.",
      "Water contaminated by rat urine can cause **Weil's disease (leptospirosis)**, a flu-like illness that can be fatal if untreated.",
      "To reduce infection risk, **cover cuts, wash before eating** and tell your doctor you have worked near water if you feel ill.",
      "Tunnels and shafts are **confined spaces**, so the atmosphere must be tested and a permit-to-work issued before entry.",
      "Confined underground spaces can suffer **oxygen deficiency or a build-up of toxic or flammable gases**, which you cannot always smell.",
      "A sudden **inrush of water** underground is a serious hazard, so follow the ground and water control measures in the plan.",
      "Always know your **emergency escape route** and how the alarm will be raised before you go underground.",
      "Reliable **communication** with the surface is essential, especially where lone or restricted working is involved.",
      "Falling into cold water can cause **cold water shock**, which affects breathing and swimming within seconds."
    ],
    "figures": [
      {
        "emoji": "🦺",
        "title": "Buoyancy near water",
        "caption": "Life jacket plus a throwline and trained rescuer on standby."
      },
      {
        "emoji": "🐀",
        "title": "Weil's disease",
        "caption": "Cover cuts, wash up, and warn your doctor after working near water."
      }
    ]
  }
};
