import type { Question } from "@/lib/questions/types";

// =============================================================
// Module: High Risk Activities
// CSCS HS&E sample questions (AI-authored seed content — review for factual
// accuracy before shipping). 10 questions.
// Schema: lib/questions/types.ts
// =============================================================

export const HIGH_RISK_ACTIVITIES_QUESTIONS: Question[] = [
  {
    "id": "high_risk_activities-001",
    "module": "high_risk_activities",
    "topic": "working_at_height_ladders",
    "question_text": "You need to use a leaning ladder for access to a higher level. What is the correct angle to set it at for safe use?",
    "options": [
      "1 in 4 (about 75 degrees) — one unit out at the base for every four units up",
      "1 in 1 (about 45 degrees) — one unit out for every one unit up",
      "1 in 6 — one unit out for every six units up",
      "As steep as possible, resting almost vertical against the wall"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "A leaning ladder set at roughly 75 degrees (the 1 in 4 rule) gives the best balance against the two main failures: if it is too shallow the foot slides out, and if it is too steep it can topple backwards. The ladder should also be secured and extend about a metre above the landing point.",
    "question_type": "multiple_choice"
  },
  {
    "id": "high_risk_activities-002",
    "module": "high_risk_activities",
    "topic": "underground_services",
    "question_text": "Before digging with a mechanical excavator where buried services may be present, what should you do first?",
    "options": [
      "Use up-to-date service drawings together with a cable avoidance tool (CAT and Genny) to locate buried services",
      "Start digging quickly so any cable is exposed before the machine bucket reaches it",
      "Assume the ground is clear because nothing is marked on the surface",
      "Dig only after dark when the site is quieter"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Buried cables and pipes cannot be seen from the surface, so their position must be found using drawings and a locator, then confirmed by careful hand-digging before machine work. Striking a live cable can cause fatal burns, and hitting a gas pipe can cause an explosion.",
    "question_type": "multiple_choice"
  },
  {
    "id": "high_risk_activities-003",
    "module": "high_risk_activities",
    "topic": "confined_spaces",
    "question_text": "Which TWO of the following are recognised dangers of working in a confined space?",
    "options": [
      "A lack of oxygen in the atmosphere",
      "A build-up of toxic or flammable gases or fumes",
      "Too much natural daylight entering the space",
      "The space being too large to fit your tools inside"
    ],
    "correct_answer": [
      0,
      1
    ],
    "explanation": "A confined space can become deadly because oxygen may be displaced or used up, and toxic or flammable gases can build up with little or no ventilation. The atmosphere must be tested and monitored before and during entry, and a rescue plan must be in place.",
    "question_type": "multiple_answer"
  },
  {
    "id": "high_risk_activities-004",
    "module": "high_risk_activities",
    "topic": "plant_and_vehicles",
    "question_text": "Reversing vehicles cause many serious injuries on site each year. What is the best way to reduce this risk?",
    "options": [
      "Keep pedestrians and moving vehicles apart, and use a trained banksman (signaller) to control reversing",
      "Ask pedestrians to walk quickly behind vehicles that are reversing",
      "Rely only on the driver's mirrors and the reversing alarm",
      "Allow vehicles to reverse as long as the horn is sounded continuously"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "The most reliable control is to separate people from vehicles using dedicated routes, and where reversing cannot be avoided a trained signaller guides the driver through blind areas. Mirrors and alarms help but do not remove the blind spots behind a vehicle.",
    "question_type": "multiple_choice"
  },
  {
    "id": "high_risk_activities-005",
    "module": "high_risk_activities",
    "topic": "electricity_overhead_lines",
    "question_text": "The boom of the machine you are operating touches an overhead power line. What should you normally do?",
    "options": [
      "Stay in the cab and, if you can, drive the machine clear of the line",
      "Climb down from the cab straight away using the steps",
      "Get out of the cab and push the machine away by hand",
      "Touch the metal frame and the ground at the same time to earth it"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "While seated in the cab you are not part of a path to earth, so you remain safe as long as you stay put; stepping or jumping down can put your body across the voltage and be fatal. If you cannot drive clear, stay in the cab until you are told the supply is switched off.",
    "question_type": "multiple_choice"
  },
  {
    "id": "high_risk_activities-006",
    "module": "high_risk_activities",
    "topic": "fire_and_hot_works",
    "question_text": "You have just finished hot works such as grinding or welding. What is a key precaution once the work is complete?",
    "options": [
      "Keep a fire watch on the area for a period afterwards, because smouldering can start a fire later",
      "Leave the area straight away so any sparks can cool down on their own",
      "Cover any hot metal with cardboard to keep the heat in",
      "Store the gas bottles next to the warm work area to save carrying them"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Sparks and hot material can smoulder unnoticed in surrounding materials and burst into flames well after the work has stopped, so the area must be checked and watched for a time afterwards. This fire watch is normally a condition of the hot work permit.",
    "question_type": "multiple_choice"
  },
  {
    "id": "high_risk_activities-007",
    "module": "high_risk_activities",
    "topic": "lifting_operations",
    "question_text": "A crane is lifting a load overhead. Where is the most dangerous place to be?",
    "options": [
      "Standing directly underneath the suspended load",
      "Well outside the marked exclusion zone",
      "In the site canteen, away from the lifting area",
      "Behind a solid barrier away from the lift"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "If the load, sling or lifting gear fails, anything directly beneath it is in the fall path, which is why an exclusion zone is set up and no one may stand under a suspended load. Loads should also never be carried over people.",
    "question_type": "multiple_choice"
  },
  {
    "id": "high_risk_activities-008",
    "module": "high_risk_activities",
    "topic": "scaffolding",
    "question_text": "Who is allowed to erect, alter or dismantle a tube-and-fitting scaffold?",
    "options": [
      "Only a trained and competent scaffolder",
      "Any labourer who happens to be available that day",
      "Anyone who is wearing a hard hat and high-visibility vest",
      "The first person to arrive on site each morning"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Scaffolds must be put up, changed or taken down only by people who are trained and competent, because mistakes in the structure can lead to collapse and falls. If a scaffold looks incomplete or has been altered, do not use it and report it.",
    "question_type": "multiple_choice"
  },
  {
    "id": "high_risk_activities-009",
    "module": "high_risk_activities",
    "topic": "mewp_fall_protection",
    "question_text": "You are working from a boom-type MEWP (cherry picker). What personal fall protection is normally required?",
    "options": [
      "A full-body harness with a short restraint lanyard clipped to the manufacturer's anchor point inside the basket",
      "No harness at all, because the guard rails are enough on every type of MEWP",
      "A harness clipped to a nearby scaffold tube outside the basket",
      "A waist belt attached to a fixed point on the ground below the machine"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "A boom-type MEWP can jolt and catapult an operator over the guard rails, so a harness with a short lanyard anchored inside the basket keeps you within the platform. It must be clipped only to the designated anchor point, never to a structure outside the basket.",
    "question_type": "multiple_choice"
  },
  {
    "id": "high_risk_activities-010",
    "module": "high_risk_activities",
    "topic": "excavations",
    "question_text": "Which TWO measures help prevent people being injured at an open excavation?",
    "options": [
      "Support the sides by shoring, or batter (slope) them back to a safe angle",
      "Provide barriers or guard rails around the edge of the excavation",
      "Store the excavated spoil right at the very edge of the trench",
      "Park heavy plant as close to the trench edge as possible"
    ],
    "correct_answer": [
      0,
      1
    ],
    "explanation": "Trench sides can collapse without warning, so they are held back by shoring or cut to a safe slope, while edge barriers stop people and vehicles falling in. Spoil and heavy plant are kept well back because their weight near the edge can trigger a collapse.",
    "question_type": "multiple_answer"
  }
];
