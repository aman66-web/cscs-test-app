import type { LessonNotes } from "./types";

// CSCS HS&E study lessons — module: high_risk_activities (AI-authored seed content).

export const HIGH_RISK_ACTIVITIES_NOTES: Record<string, LessonNotes> = {
  "working_at_height": {
    "title": "Working at Height",
    "intro": "Falls from height are the biggest single cause of death on UK construction sites, so knowing how to work safely above ground level could save your life.",
    "bullets": [
      "Under the Work at Height Regulations, height means **any place where you could fall a distance liable to cause injury** — even below ground level or at floor level near an opening.",
      "The first rule is to **avoid working at height** where you reasonably can, then prevent falls, then minimise the distance and consequences of a fall.",
      "Before using a ladder, ask whether it is the **right equipment** — ladders are only for light, short-duration work of around 30 minutes or less.",
      "A leaning ladder should be set at a **75-degree angle**, roughly one measure out for every four measures up (the 1 in 4 rule).",
      "Always maintain **three points of contact** on a ladder and never over-reach — move the ladder instead of stretching.",
      "A mobile tower scaffold must only be **erected, altered or dismantled by a trained, competent person** and never moved while someone is still on it.",
      "Scaffolding should have **double guard-rails and toe boards**, and a scaffold tag tells you whether it is safe to use.",
      "Never remove or climb over **guard-rails, edge protection or covers** over holes and openings — they are there to stop you falling.",
      "Wear a **harness with a lanyard clipped to a secure anchor point** only when collective protection like guard-rails is not reasonably possible.",
      "Fragile surfaces such as **asbestos cement or rooflights** will not take your weight, so use crawling boards and clear warning signs."
    ],
    "figures": [
      {
        "emoji": "🪜",
        "title": "1 in 4 ladder rule",
        "caption": "Foot the ladder out 1 measure for every 4 measures of height (75 degrees)."
      },
      {
        "emoji": "🦺",
        "title": "Fall protection order",
        "caption": "Avoid the work, then prevent the fall, then minimise the fall — harness is a last resort."
      }
    ]
  },
  "excavations_confined": {
    "title": "Excavations & Confined Spaces",
    "intro": "Trenches can collapse in seconds and confined spaces can kill you before you even feel unwell, so both demand strict controls and never a casual approach.",
    "bullets": [
      "A cubic metre of soil can weigh over **a tonne**, so an unsupported trench wall that collapses can crush or suffocate you almost instantly.",
      "Excavation sides must be made safe by **battering (sloping) them back, stepping them, or shoring/supporting with trench boxes**.",
      "Before you dig, check for **buried services** using drawings, a cable avoidance tool (CAT scanner) and careful hand-digging near known lines.",
      "Keep spoil heaps, plant and materials **well back from the edge** of an excavation so the extra load does not cause a collapse.",
      "Provide a **safe means of getting in and out**, such as a secure ladder, within easy reach of anyone working in the trench.",
      "Excavations should be **inspected by a competent person** at the start of each shift and after any event that could affect stability.",
      "A confined space is any largely enclosed space where there is a **foreseeable risk of serious injury from hazardous conditions**, such as a tank, sewer or deep chamber.",
      "The main confined-space killers are a **lack of oxygen and the build-up of toxic or flammable gases**, which you often cannot see or smell.",
      "Only enter a confined space with a **safe system of work and a permit to enter**, after the atmosphere has been tested with a gas monitor.",
      "Never attempt an unplanned rescue — put on breathing apparatus and follow the **rescue plan**, because many deaths are would-be rescuers who rushed in."
    ],
    "figures": [
      {
        "emoji": "⛏️",
        "title": "Support the sides",
        "caption": "Batter, step or shore every excavation — never trust an unsupported wall."
      },
      {
        "emoji": "☠️",
        "title": "Confined space gases",
        "caption": "Low oxygen and toxic gas kill silently — test the air and use a permit."
      }
    ]
  },
  "plant_and_traffic": {
    "title": "Plant, Vehicles & Traffic",
    "intro": "Being struck by a moving vehicle or plant is one of the top causes of site fatalities, so keeping people and machines apart is a constant priority.",
    "bullets": [
      "The best control is to **separate pedestrians and vehicles** using barriers, marked walkways and one-way traffic routes.",
      "Reversing causes many deaths, so sites should be **laid out to avoid reversing** and use banksmen, mirrors, reversing alarms and cameras where it is unavoidable.",
      "Never walk or stand in a machine's **blind spot** — if you cannot see the operator's eyes, they cannot see you.",
      "A **banksman (signaller)** must be trained, wear high-visibility clothing and use clear, agreed hand signals to guide plant.",
      "Always wear **high-visibility clothing** on site so drivers and operators can see you, especially in poor light.",
      "Only **trained, competent and authorised people** should operate plant such as excavators, dumpers and forklifts.",
      "Never ride on plant that is **not designed to carry passengers**, and never work under a raised load or bucket.",
      "Keep clear of the **slew (turning) area** of an excavator, as the counterweight can crush you against a wall.",
      "Plant should be **checked before use** and any defects reported, with keys removed to stop unauthorised or accidental use.",
      "Overhead power lines and soft ground mean plant can **strike cables or overturn**, so watch for goal posts, exclusion zones and edges."
    ],
    "figures": [
      {
        "emoji": "🚧",
        "title": "Keep them apart",
        "caption": "Barriers and walkways separate people from moving plant and vehicles."
      },
      {
        "emoji": "👷",
        "title": "Eye contact rule",
        "caption": "If you can't see the operator's eyes, assume they can't see you."
      }
    ]
  },
  "electricity_fire": {
    "title": "Electricity, Fire & Hot Works",
    "intro": "Electricity and fire can injure or kill without warning, and hot works are a leading cause of serious site fires, so both need careful control.",
    "bullets": [
      "On construction sites, **110-volt reduced-low-voltage tools (yellow plugs/leads)** are used because they are far safer than 230-volt mains equipment.",
      "Battery-powered cordless tools are safer still, and any 230-volt supply should be protected by an **RCD (residual current device)**.",
      "Inspect leads and tools before use, and take any equipment with **damaged cables or casings** out of use and report it.",
      "Assume **overhead power lines and buried cables are live**, keep clear of exclusion zones, and use a CAT scanner before digging.",
      "If someone gets an electric shock, **switch off the supply first** and do not touch them while they are still in contact with the current.",
      "Fire needs three things — the **fire triangle of heat, fuel and oxygen** — and removing any one will put it out.",
      "Use the right extinguisher for the fire: **water for wood/paper, CO2 or dry powder for electrical, and foam or powder for flammable liquids**.",
      "Hot works such as welding, grinding and cutting need a **hot works permit**, plus a fire watch kept for at least an hour after finishing.",
      "Keep the workplace tidy because **combustible waste and rubbish** are common fuel for site fires, and store gas cylinders and flammables safely.",
      "Know your site's **fire alarm, escape routes and assembly point**, keep exits clear, and never take a lift during a fire."
    ],
    "figures": [
      {
        "emoji": "🔌",
        "title": "110V is safer",
        "caption": "Yellow 110-volt tools reduce the risk of a fatal shock on site."
      },
      {
        "emoji": "🔥",
        "title": "Fire triangle",
        "caption": "Heat + fuel + oxygen = fire; remove any one to put it out."
      }
    ]
  }
};
