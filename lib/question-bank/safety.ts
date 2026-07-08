import type { Question } from "@/lib/questions/types";

// =============================================================
// Module: Safety
// CSCS HS&E sample questions (AI-authored seed content — review for factual
// accuracy before shipping). 10 questions.
// Schema: lib/questions/types.ts
// =============================================================

export const SAFETY_QUESTIONS: Question[] = [
  {
    "id": "safety-001",
    "module": "safety",
    "topic": "ppe_selection",
    "question_text": "When controlling a risk on site, where does personal protective equipment (PPE) sit in the hierarchy of control measures?",
    "options": [
      "It should be the first and main way of controlling any risk",
      "It should be used only as a last resort, after other controls have been considered",
      "It removes the need to assess the risk in the first place",
      "It is only needed for visitors, not for trained workers"
    ],
    "correct_answer": [
      1
    ],
    "explanation": "PPE only protects the person wearing it and depends on correct use and fit, so the law requires higher-level controls (eliminate, reduce, isolate) to be applied first, leaving PPE as the last line of defence.",
    "question_type": "multiple_choice"
  },
  {
    "id": "safety-002",
    "module": "safety",
    "topic": "manual_handling",
    "question_text": "You need to lift a load from the floor by hand. What is the correct technique to reduce the risk of injury?",
    "options": [
      "Keep your legs straight and bend your back to reach the load",
      "Bend your knees, keep your back straight and hold the load close to your body",
      "Lift quickly with a twisting movement to get it over with",
      "Keep the load at arm's length so it does not mark your clothing"
    ],
    "correct_answer": [
      1
    ],
    "explanation": "Bending the knees, keeping the back straight and holding the load close to your body keeps the weight over your base and greatly reduces the strain placed on your spine.",
    "question_type": "multiple_choice"
  },
  {
    "id": "safety-003",
    "module": "safety",
    "topic": "slips_trips_falls",
    "question_text": "Slips and trips are one of the most common causes of injury on construction sites. What is the best way to help prevent them?",
    "options": [
      "Wear a high-visibility vest at all times",
      "Keep walkways and work areas clear of trailing cables and debris",
      "Walk more quickly across the site",
      "Only report a spillage if someone has already slipped on it"
    ],
    "correct_answer": [
      1
    ],
    "explanation": "Most slips and trips are caused by spillages, uneven surfaces and obstructions such as trailing cables, so keeping routes clear and cleaning up spills promptly is the most effective prevention.",
    "question_type": "multiple_choice"
  },
  {
    "id": "safety-004",
    "module": "safety",
    "topic": "housekeeping",
    "question_text": "Why is good housekeeping important on a construction site?",
    "options": [
      "It only makes the site look tidy for visitors",
      "It reduces hazards such as slips, trips, fire and falling objects",
      "It removes the need for personal protective equipment",
      "It is solely the responsibility of the site cleaner"
    ],
    "correct_answer": [
      1
    ],
    "explanation": "Clearing waste and materials as work proceeds removes trip hazards, reduces the fuel available for a fire and stops loose items falling onto people working below.",
    "question_type": "multiple_choice"
  },
  {
    "id": "safety-005",
    "module": "safety",
    "topic": "power_tools",
    "question_text": "What voltage of portable electric power tool is generally preferred for use on a UK construction site?",
    "options": [
      "230 volts",
      "110 volts",
      "400 volts",
      "12 volts"
    ],
    "correct_answer": [
      1
    ],
    "explanation": "110V tools are supplied through a centre-tapped transformer that reduces the voltage to earth to 55V, which greatly lowers the severity of an electric shock if a fault or cable damage occurs.",
    "question_type": "multiple_choice"
  },
  {
    "id": "safety-006",
    "module": "safety",
    "topic": "storage_stacking",
    "question_text": "What is a safe practice when stacking materials such as bricks or blocks on site?",
    "options": [
      "Stack them as high as possible to save floor space",
      "Stack on firm, level ground and keep the height sensible and stable",
      "Lean the stack against a temporary fence for support",
      "Place the heaviest items on the very top of the stack"
    ],
    "correct_answer": [
      1
    ],
    "explanation": "Stacks must sit on firm, level ground and be kept to a safe, stable height so they cannot topple, and heavier items should be stored low to keep the centre of gravity down.",
    "question_type": "multiple_choice"
  },
  {
    "id": "safety-007",
    "module": "safety",
    "topic": "safe_behaviour",
    "question_text": "You notice an unsafe condition on site that could injure someone. What should you do?",
    "options": [
      "Ignore it, as it is not your job to deal with it",
      "Report it to your supervisor and, if safe to do so, take action to prevent harm",
      "Wait to see if anyone gets hurt before saying anything",
      "Remove any warning signs so that work can continue"
    ],
    "correct_answer": [
      1
    ],
    "explanation": "Everyone on site has a legal duty to look after their own and others' safety, so unsafe conditions should be reported promptly and, where you can do so safely, made safe to prevent an accident.",
    "question_type": "multiple_choice"
  },
  {
    "id": "safety-008",
    "module": "safety",
    "topic": "ppe_use",
    "question_text": "How should a safety helmet be worn to give the best protection?",
    "options": [
      "Tilted back so you can see more easily",
      "Squarely on the head with the harness adjusted to fit correctly",
      "Over a woolly hat to make it more comfortable",
      "Only when the supervisor is watching"
    ],
    "correct_answer": [
      1
    ],
    "explanation": "A helmet only protects the head if it is worn squarely with its internal harness adjusted to fit, so that it stays in place and can absorb the force of a falling object or a knock.",
    "question_type": "multiple_choice"
  },
  {
    "id": "safety-009",
    "module": "safety",
    "topic": "ppe_selection",
    "question_text": "You are about to use a disc cutter to cut concrete blocks, creating dust and flying particles. Which items of PPE are appropriate for this task? (Select all that apply.)",
    "options": [
      "Eye protection such as goggles or a face shield",
      "Suitable respiratory protection (a dust mask/RPE)",
      "Sandals or open-toed footwear",
      "A loose scarf worn near the cutting disc"
    ],
    "correct_answer": [
      0,
      1
    ],
    "explanation": "Cutting concrete produces harmful silica dust and flying fragments, so both eye protection and correctly fitting respiratory protection are needed; open footwear and loose clothing near a rotating disc would only increase the risk of injury.",
    "question_type": "multiple_answer"
  },
  {
    "id": "safety-010",
    "module": "safety",
    "topic": "slips_trips_falls",
    "question_text": "Which of the following actions help to prevent slips and trips on site? (Select all that apply.)",
    "options": [
      "Clearing up spillages and wet materials promptly",
      "Keeping cables and hoses off walkways or covering them properly",
      "Leaving offcuts and packaging where they fall until the end of the week",
      "Providing and using adequate lighting in walkways"
    ],
    "correct_answer": [
      0,
      1,
      3
    ],
    "explanation": "Slips and trips are reduced by removing their causes - wet surfaces, trailing cables and obstructions - and by making sure people can clearly see where they are walking; leaving waste lying around simply creates more trip hazards.",
    "question_type": "multiple_answer"
  }
];
