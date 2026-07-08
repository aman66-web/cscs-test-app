import type { LessonNotes } from "./types";

// CSCS HS&E study lessons — module: working_environment (AI-authored seed content).

export const WORKING_ENVIRONMENT_NOTES: Record<string, LessonNotes> = {
  "responsibilities": {
    "title": "Your responsibilities & the law",
    "intro": "Health and safety on site is a shared legal duty — knowing what the law expects of you and your employer keeps you and your workmates safe and out of trouble.",
    "bullets": [
      "The main law covering everyone at work is the **Health and Safety at Work etc. Act 1974 (HASAWA)**, which places duties on both employers and workers.",
      "Your employer must, **so far as is reasonably practicable**, provide a safe place to work, safe equipment, training, supervision and any PPE free of charge.",
      "As a worker you must **take reasonable care** of your own safety and that of others affected by what you do.",
      "You must **co-operate** with your employer and **never misuse or interfere** with anything provided for health and safety.",
      "Construction work is also governed by the **Construction (Design and Management) Regulations 2015 (CDM 2015)**, which set duties for the client, principal contractor, contractors and workers.",
      "Work should follow a planned **safe system of work** set out in the risk assessment and method statement (**RAMS**) — read it before you start.",
      "PPE is the **last line of defence**; the hierarchy of control means the hazard should first be eliminated or reduced at source.",
      "Certain serious accidents, dangerous occurrences and diseases must be reported to the HSE under **RIDDOR**.",
      "The enforcing body is the **Health and Safety Executive (HSE)**, whose inspectors can issue improvement or prohibition notices and stop work.",
      "If you believe a job is genuinely dangerous you have the **right to stop and refuse** to carry it out until it is made safe."
    ],
    "figures": [
      {
        "emoji": "⚖️",
        "title": "Two-way duty",
        "caption": "HASAWA 1974: the employer keeps you safe, and you must take care too."
      },
      {
        "emoji": "📋",
        "title": "RAMS",
        "caption": "Risk Assessment & Method Statement — the safe way to do the job, read it first."
      }
    ]
  },
  "site_induction": {
    "title": "Site induction & signing in",
    "intro": "You are not allowed to start work on a construction site until you have been inducted — the induction tells you the site's specific dangers and what to do in an emergency.",
    "bullets": [
      "Every worker must attend a **site induction before starting work**, and it is usually a legal condition of being on site.",
      "The induction covers the **site-specific hazards**, rules, and the safe way things are done on that particular job.",
      "You will be shown the location of **welfare facilities** — toilets, washing, drying room and somewhere to take breaks.",
      "You must be told the **emergency arrangements**: the alarm sound, escape routes and the location of the **assembly point**.",
      "The induction identifies who the **first aiders** are and where the **first aid kit** is kept.",
      "**Signing in and out** keeps an accurate record of who is on site, which is vital for the headcount if the alarm sounds.",
      "You may be asked to show proof of competence such as your **CSCS card** or relevant qualifications.",
      "Site rules covered usually include compulsory **PPE**, speed limits, no-go areas and any **permit-to-work** zones.",
      "If the site or your task changes significantly, you may need a **refresher or new induction**.",
      "If anything in the induction is unclear, **ask questions** rather than guessing — never assume."
    ],
    "figures": [
      {
        "emoji": "✍️",
        "title": "Sign in, sign out",
        "caption": "The register shows who is on site — essential for the emergency headcount."
      },
      {
        "emoji": "🦺",
        "title": "Know the rules",
        "caption": "Induction tells you the PPE, hazards and escape routes for that site."
      }
    ]
  },
  "safety_signs": {
    "title": "Safety signs & signals",
    "intro": "Safety signs use set shapes and colours so you can understand them instantly, even at a distance or without reading the words — learn the code and you can read any site.",
    "bullets": [
      "A **red circle with a diagonal bar** on a white background means **prohibition** — you must NOT do it (e.g. no smoking).",
      "A **yellow or amber triangle** with a black border means **warning** — a hazard is present, so take care.",
      "A **solid blue circle** with a white symbol means **mandatory** — you MUST do it (e.g. wear a hard hat or eye protection).",
      "A **green rectangle or square** means **safe condition** — fire exits, first aid, and assembly points.",
      "A **red rectangle or square** shows the location of **fire-fighting equipment** such as extinguishers and alarm points.",
      "These colours and shapes are set out in the **Health and Safety (Safety Signs and Signals) Regulations 1996**.",
      "Learning the **shape and colour** lets you understand a sign's meaning even if the wording is faded or in another language.",
      "When banksmen or **signallers** direct crane and vehicle movements, only a **trained, authorised signaller** should give the hand signals.",
      "**Acoustic signals** such as alarms and reversing beepers are also safety signals and must never be ignored.",
      "A sign is a warning, not a cure — it **does not remove the hazard**, so still follow the safe system of work."
    ],
    "figures": [
      {
        "emoji": "🚫",
        "title": "Prohibition",
        "caption": "Red circle + bar = you must NOT do this."
      },
      {
        "emoji": "🔵",
        "title": "Mandatory",
        "caption": "Solid blue circle = you MUST do this, e.g. wear your PPE."
      }
    ]
  },
  "emergencies": {
    "title": "Emergencies, fire & first aid",
    "intro": "When something goes wrong, quick and correct action saves lives — know the alarm, your escape route and the basics of fire and first aid before you ever need them.",
    "bullets": [
      "Fire needs three things — the **fire triangle** of fuel, oxygen and heat — so removing any one puts it out.",
      "If you discover a fire, **raise the alarm first**, only tackle it if trained and safe, then leave by the nearest exit to the assembly point.",
      "**Never use lifts** in a fire, and do not go back for belongings.",
      "Extinguishers are colour-coded: **water (red), foam (cream), CO2 (black), dry powder (blue) and wet chemical (yellow)**, all on a red body.",
      "**Never use water on electrical or flammable-liquid fires** — use CO2 or dry powder on electrical fires.",
      "**Hot works** such as cutting or welding need a permit and a **fire watch** kept for a period after finishing, commonly at least an hour.",
      "If you find a casualty, **check for danger first** and never make yourself a second casualty.",
      "Call **999** for the emergency services and give a clear location, then know who your trained **first aiders** are.",
      "The basic priorities are **DR ABC** — Danger, Response, Airway, Breathing, Circulation.",
      "**Do not move a seriously injured person** unless they are in immediate danger, and report every accident and near miss in the **accident book**."
    ],
    "figures": [
      {
        "emoji": "🔥",
        "title": "Fire triangle",
        "caption": "Fuel + oxygen + heat — remove one to stop the fire."
      },
      {
        "emoji": "🧯",
        "title": "Right extinguisher",
        "caption": "Water for wood/paper, CO2 or powder for electrics — never water on electrics."
      }
    ]
  }
};
