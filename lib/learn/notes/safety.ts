import type { LessonNotes } from "./types";

// CSCS HS&E study lessons — module: safety (AI-authored seed content).

export const SAFETY_NOTES: Record<string, LessonNotes> = {
  "ppe": {
    "title": "Personal Protective Equipment (PPE)",
    "intro": "PPE protects you from hazards that cannot be fully removed by other means, but it only works if it is the right type, worn correctly and kept in good condition. Knowing where PPE fits in and how to look after it is core to passing the test and staying safe.",
    "bullets": [
      "PPE is always the **last line of defence** and is used only after you have tried to remove or reduce the hazard at source.",
      "Your employer must provide the PPE you need **free of charge** and cannot ask you to pay for it.",
      "A **hard hat** must be worn where there is a risk of falling objects, and it should be replaced if it is damaged or past its expiry date.",
      "**Safety boots** with toe protection and a midsole guard against crushing and against nails penetrating the sole.",
      "Wear **eye protection** for tasks like grinding, cutting, chiselling or using chemicals where debris or splashes could reach your eyes.",
      "**Hearing protection** should be worn once noise reaches the levels where you have to shout to be heard about 2 metres apart.",
      "Tight-fitting **respiratory protection (RPE)** must be face-fit tested and only works if you are clean shaven where it seals to the skin.",
      "You must **check PPE before use**, look after it, store it properly and report any damaged or missing kit to your supervisor.",
      "PPE should carry a **UKCA or CE mark** showing it meets the required safety standard.",
      "**Hi-vis clothing** must be worn where you could be struck by vehicles, plant or moving machinery."
    ],
    "figures": [
      {
        "emoji": "🦺",
        "title": "Last line of defence",
        "caption": "Remove the hazard first — PPE is what protects you when the risk can't be fully designed out."
      },
      {
        "emoji": "🪖",
        "title": "Check before you wear",
        "caption": "Damaged, cracked or out-of-date PPE gives no real protection — replace it."
      }
    ]
  },
  "slips_trips_falls": {
    "title": "Slips, Trips & Falls",
    "intro": "Slips, trips and falls are the most common cause of major injuries on UK construction sites, and falls from height are the single biggest cause of workplace deaths. Most of these accidents are easily prevented by good habits and a tidy work area.",
    "bullets": [
      "Slips, trips and falls are the **most common cause of major injuries** on site.",
      "**Falls from height** are the biggest single cause of fatal accidents in construction.",
      "**Slips** are usually caused by wet, oily or contaminated surfaces, so spills should be cleaned up straight away.",
      "**Trips** are usually caused by trailing cables, uneven ground, offcuts or materials left in walkways.",
      "**Good housekeeping** — keeping walkways clear and clean — is the single most effective way to prevent these accidents.",
      "Route cables and hoses **overhead or covered** so they do not cross walkways at foot level.",
      "Wear **suitable footwear** with a good grip and the correct sole for the surfaces you work on.",
      "**Cover or guard** floor openings, holes and edges so no one can step or fall into them.",
      "Make sure the work area is **well lit** so hazards can be seen, especially on stairs and in changing light.",
      "Report and deal with hazards **immediately** rather than stepping over or around them."
    ],
    "figures": [
      {
        "emoji": "⚠️",
        "title": "Number one injury cause",
        "caption": "Slips, trips and falls cause more major injuries than anything else on site."
      }
    ]
  },
  "housekeeping_storage": {
    "title": "Housekeeping & Storage",
    "intro": "A tidy, well-organised site is a safe site — poor housekeeping causes trips, fires and falling-object injuries. Storing materials correctly keeps walkways clear and stops loads from collapsing.",
    "bullets": [
      "**Good housekeeping** cuts slips and trips, reduces fire risk and keeps escape routes clear.",
      "Keep **walkways, stairs and emergency exits** clear of materials, tools and waste at all times.",
      "Stack materials on **firm, level ground**, keep stacks stable and do not build them too high.",
      "Do not **overload** racking, floors, scaffolds or storage areas beyond their safe limit.",
      "Clear up **waste and offcuts** as you go and put them in the correct skip or bin.",
      "Nails sticking out of timber should be **removed or knocked flat** to prevent puncture injuries.",
      "Store **flammable materials and gas cylinders** away from ignition sources and clear of exits.",
      "**Gas cylinders** should be stored upright, secured from falling and kept in a well-ventilated area.",
      "Keep **fire points, extinguishers and assembly points** clear and accessible.",
      "Cleaning up **as you work** is far safer and easier than leaving it all until the end of the day."
    ],
    "figures": [
      {
        "emoji": "🧹",
        "title": "Tidy as you go",
        "caption": "Clearing waste and offcuts continuously beats one big clean-up at the end."
      },
      {
        "emoji": "🛢️",
        "title": "Store cylinders safely",
        "caption": "Gas cylinders: upright, secured and well ventilated, away from ignition sources."
      }
    ]
  },
  "tools": {
    "title": "Hand & Power Tools",
    "intro": "Hand and power tools cause serious injuries when they are damaged, misused or missing their guards, and long-term risks from vibration and dust can be just as harmful. Choosing the right tool and checking it before use keeps you safe.",
    "bullets": [
      "Always use the **right tool for the job** and never improvise with a damaged or unsuitable one.",
      "**Inspect tools before use** and do not use anything with damaged casings, guards, plugs or cables — report it.",
      "On site, **110 volt** reduced low-voltage tools (yellow plug) are much safer than 230 volt mains tools.",
      "**Guards** on grinders, saws and other rotating tools must be fitted and in place before use.",
      "Only a **trained, competent person** should mount or change an abrasive wheel on a grinder.",
      "**Isolate or unplug** a power tool before changing a blade, disc or bit.",
      "**Hand-arm vibration syndrome (HAVS)** is a permanent injury caused by regular use of vibrating tools, so limit your trigger time.",
      "Cutting, grinding and drilling create harmful **dust such as silica**, so use water suppression or on-tool extraction and wear RPE.",
      "Wear **eye protection** whenever there is a risk of flying particles from cutting, grinding or chiselling.",
      "Never **carry or pull a tool by its cable**, and keep leads clear of blades, water and walkways."
    ],
    "figures": [
      {
        "emoji": "🔌",
        "title": "110V on site",
        "caption": "Reduced low-voltage 110V tools (yellow) are safer than 230V mains on a construction site."
      },
      {
        "emoji": "✋",
        "title": "Watch the trigger time",
        "caption": "Too much vibrating-tool use causes HAVS — a permanent injury to hands and arms."
      }
    ]
  }
};
