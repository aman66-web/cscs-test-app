import type { LessonNotes } from "./types";

// CSCS HS&E study lessons — module: occupational_health (AI-authored seed content).

export const OCCUPATIONAL_HEALTH_NOTES: Record<string, LessonNotes> = {
  "dust_and_asbestos": {
    "title": "Dust, silica & asbestos",
    "intro": "The dust and fibres you breathe in on site today can kill you decades later, long after the job is finished. Protecting your lungs is one of the most important things you can do on any job.",
    "bullets": [
      "Construction dust is not just a nuisance — breathing it in over years causes **serious, often fatal lung diseases**.",
      "**Respirable crystalline silica (RCS)** is the fine dust released when you cut, grind or drill stone, concrete, mortar, brick or sand.",
      "Regular exposure to silica dust can cause **silicosis, lung cancer and COPD**, and the damage is permanent.",
      "The workplace exposure limit for respirable crystalline silica is **0.1 mg/m³** averaged over an 8-hour day.",
      "Control dust at source by **damping down with water** and using **on-tool extraction (LEV)** rather than relying on masks alone.",
      "Where dust remains in the air, wear an **FFP3 mask that has been face-fit tested** to you.",
      "**Asbestos is the single biggest cause of work-related deaths in the UK**, killing around 5,000 people every year.",
      "Any building built or refurbished before **the year 2000** may contain asbestos, so assume it does until proven otherwise.",
      "You **cannot tell asbestos by its colour**, and the fibres are invisible once they are in the air.",
      "If you disturb or suspect asbestos, **stop work immediately**, warn others and report it — never carry on."
    ],
    "figures": [
      {
        "emoji": "😷",
        "title": "FFP3 mask",
        "caption": "Only protects you if it is face-fit tested to your face."
      },
      {
        "emoji": "⚠️",
        "title": "Before 2000",
        "caption": "Older buildings may hide asbestos — assume it is there."
      }
    ]
  },
  "noise_and_vibration": {
    "title": "Noise & hand-arm vibration",
    "intro": "Noise and vibration cause hidden, permanent damage that builds up slowly — you often do not notice until it is too late. Neither can be cured, so prevention is everything.",
    "bullets": [
      "Loud noise causes **noise-induced hearing loss and tinnitus**, and once your hearing is gone it does not come back.",
      "A rough test: if you have to **shout to be heard by someone 2 metres away**, noise levels are probably a problem.",
      "Under the Control of Noise at Work Regulations 2005 the **lower action value is 80 dB(A)** and the **upper action value is 85 dB(A)**.",
      "At or above **85 dB(A)** hearing protection is required and **hearing protection zones** must be marked and worn in.",
      "**Hand-arm vibration syndrome (HAVS)** comes from regular use of vibrating tools like breakers, grinders and drills.",
      "Early HAVS signs are **tingling, numbness and fingers going white**, plus loss of grip and dexterity.",
      "HAVS is **permanent and cannot be cured**, but it is completely preventable.",
      "The vibration **exposure action value is 2.5 m/s²** and the **exposure limit value is 5 m/s²** over an 8-hour day.",
      "Cut the risk with **low-vibration tools**, limiting **trigger time**, keeping your hands warm and taking regular breaks.",
      "Your employer should provide **health surveillance** to catch hearing damage and HAVS early."
    ],
    "figures": [
      {
        "emoji": "👂",
        "title": "Hearing zone",
        "caption": "Ear protection must be worn — the damage is permanent."
      },
      {
        "emoji": "✋",
        "title": "White finger",
        "caption": "Numb, blanching fingertips are early HAVS warnings."
      }
    ]
  },
  "hazardous_substances": {
    "title": "Hazardous substances (COSHH)",
    "intro": "From cement to solvents, many everyday site materials can harm you, which is why COSHH sets out how they must be controlled. Knowing the hazard and the control keeps it off your skin and out of your lungs.",
    "bullets": [
      "**COSHH** stands for the Control of Substances Hazardous to Health Regulations 2002, covering almost every harmful substance on site.",
      "Before work starts your employer must complete a **COSHH assessment** for each hazardous substance used.",
      "Harmful substances can enter your body four ways: **breathing in, swallowing, through the skin, and injection**.",
      "Every hazardous product comes with a **Safety Data Sheet (SDS)** setting out the hazards and the controls.",
      "Hazards are shown by **orange or red diamond pictograms** on the label under the CLP system.",
      "Controls follow a hierarchy: **eliminate or substitute first**, then engineering controls like LEV, with **PPE and RPE as the last resort**.",
      "**Wet cement is corrosive** and can cause serious skin burns and dermatitis, so keep it off your skin.",
      "Repeated skin contact with oils, solvents and chemicals can cause **dermatitis**, so use gloves and wash your hands.",
      "Never store chemicals in **unlabelled bottles**, and never in old drink containers.",
      "Any **RPE (mask) you rely on must be face-fit tested** and suitable for that substance."
    ],
    "figures": [
      {
        "emoji": "🧪",
        "title": "CLP pictogram",
        "caption": "Orange/red diamond on the label = hazardous substance."
      },
      {
        "emoji": "🧱",
        "title": "Wet cement",
        "caption": "Corrosive — it burns skin, so keep it covered."
      }
    ]
  },
  "health_and_welfare": {
    "title": "Manual handling, welfare & wellbeing",
    "intro": "Looking after your body and mind is as much a part of the job as any task, and the law backs this up. Small habits and proper facilities prevent injuries that can end a career.",
    "bullets": [
      "**Musculoskeletal disorders (MSDs)** — back, neck and joint injuries — are among the most common health problems in construction.",
      "The Manual Handling Operations Regulations 1992 say you should **avoid, assess and reduce** manual handling.",
      "Assess a lift using **TILE**: the Task, the Individual, the Load and the Environment.",
      "There is **no legal maximum lifting weight**, but HSE guideline figures suggest around **25 kg** for a man lifting at knuckle height close to the body.",
      "Lift safely by keeping the **load close, back straight, knees bent and avoiding twisting**.",
      "Where a load is too heavy or awkward, **get help or use a mechanical aid** rather than struggling on.",
      "Under CDM 2015, **welfare facilities** — toilets, washing, drinking water, rest area and somewhere to warm up and eat — must be provided before work starts.",
      "Working outdoors means **UV exposure**, so cover up and use sunscreen to cut your skin cancer risk.",
      "**Mental health matters** — construction has high stress and suicide rates, so talk to someone if you are struggling.",
      "Fatigue, drugs and alcohol all impair judgement, and turning up **unfit for work** puts you and others at risk."
    ],
    "figures": [
      {
        "emoji": "📦",
        "title": "TILE",
        "caption": "Task, Individual, Load, Environment — assess before you lift."
      },
      {
        "emoji": "🚻",
        "title": "Welfare",
        "caption": "Toilets, washing, water and rest — required from day one."
      }
    ]
  }
};
