import type { Question } from "@/lib/questions/types";

// =============================================================
// Module: Working Environment
// CSCS HS&E sample questions (AI-authored seed content — review for factual
// accuracy before shipping). 12 questions.
// Schema: lib/questions/types.ts
// =============================================================

export const WORKING_ENVIRONMENT_QUESTIONS: Question[] = [
  {
    "id": "working_environment-001",
    "module": "working_environment",
    "topic": "site_induction",
    "question_type": "multiple_choice",
    "question_text": "When must you normally complete a site induction?",
    "options": [
      "Before you start work for the first time on that site",
      "Only after you have worked on site for a full week",
      "Only if you are a new apprentice",
      "Only when you move to a different trade"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "A site induction gives you site-specific information such as the main hazards, emergency arrangements and welfare facilities, so it must be completed before you begin work rather than afterwards."
  },
  {
    "id": "working_environment-002",
    "module": "working_environment",
    "topic": "safety_signs_prohibition",
    "question_type": "multiple_choice",
    "question_text": "A round sign with a red border and a red diagonal line through it is telling you that:",
    "options": [
      "An action is prohibited and must not be carried out",
      "You must wear a particular item of PPE",
      "There is a hazard to warn you about nearby",
      "Where to find safety or first-aid equipment"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Prohibition signs are red circles with a diagonal bar and forbid an action, such as 'no smoking' or 'no pedestrians', so the activity shown must not take place."
  },
  {
    "id": "working_environment-003",
    "module": "working_environment",
    "topic": "safety_signs_mandatory",
    "question_type": "multiple_choice",
    "question_text": "What does a solid blue circular safety sign mean?",
    "options": [
      "You must carry out a specific action, such as wearing PPE",
      "An activity is forbidden",
      "There is danger ahead",
      "It shows the way to a fire exit"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Blue circular signs are mandatory signs; they instruct you that a specific action is required, for example wearing a hard hat, eye protection or high-visibility clothing."
  },
  {
    "id": "working_environment-004",
    "module": "working_environment",
    "topic": "good_housekeeping",
    "question_type": "multiple_choice",
    "question_text": "Poor housekeeping on a construction site most directly increases the risk of which common type of injury?",
    "options": [
      "Slips, trips and falls",
      "Hearing loss",
      "Skin cancer",
      "Vibration white finger"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Trailing cables, offcuts, materials and spillages left in walkways cause many slips, trips and falls; keeping routes clear and tidy is the simplest way to reduce this risk."
  },
  {
    "id": "working_environment-005",
    "module": "working_environment",
    "topic": "fire_emergency",
    "question_type": "multiple_choice",
    "question_text": "What should you normally do first if you discover a fire on site?",
    "options": [
      "Raise the alarm to warn other people",
      "Collect your personal belongings",
      "Try to put it out no matter how big it is",
      "Finish the task you are doing"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Raising the alarm warns everyone so they can evacuate safely; you should only attempt to tackle a small fire if you are trained and it is safe, never putting yourself at risk."
  },
  {
    "id": "working_environment-006",
    "module": "working_environment",
    "topic": "first_aid",
    "question_type": "multiple_choice",
    "question_text": "You come across a workmate who has collapsed. What is the first thing you should do?",
    "options": [
      "Check the area is safe before approaching, then get help",
      "Move the casualty to the canteen straight away",
      "Give the casualty something to eat and drink",
      "Wait until the end of the shift before doing anything"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Approaching an unsafe scene could make you a second casualty, so check for danger first, then summon the first aider and emergency services rather than moving or feeding the person."
  },
  {
    "id": "working_environment-007",
    "module": "working_environment",
    "topic": "riddor_reporting",
    "question_type": "multiple_choice",
    "question_text": "Under RIDDOR, who has the legal duty to report a reportable injury or dangerous occurrence?",
    "options": [
      "The responsible person, usually the employer or person in control of the work",
      "The injured person's family",
      "Any member of the public who witnessed it",
      "The first aider who treated the casualty"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "RIDDOR places the reporting duty on the responsible person, typically the employer or the person in control of the work, who must notify the enforcing authority of specified incidents."
  },
  {
    "id": "working_environment-008",
    "module": "working_environment",
    "topic": "risk_assessment",
    "question_type": "multiple_choice",
    "question_text": "What is the main purpose of a risk assessment?",
    "options": [
      "To identify hazards and decide what controls are needed to reduce the risk of harm",
      "To record how many workers are on site each day",
      "To calculate the total cost of the project",
      "To list all the tools kept in the store"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "A risk assessment identifies the hazards, considers who might be harmed and how, and sets out the control measures needed so the work can be carried out safely."
  },
  {
    "id": "working_environment-009",
    "module": "working_environment",
    "topic": "employee_duties",
    "question_type": "multiple_answer",
    "question_text": "Which of the following are legal duties placed on employees (workers) by health and safety law? (Choose all that apply)",
    "options": [
      "Take reasonable care of their own and other people's health and safety",
      "Cooperate with their employer on health and safety matters",
      "Not interfere with or misuse anything provided for health and safety",
      "Buy and pay for their own personal protective equipment (PPE)"
    ],
    "correct_answer": [
      0,
      1,
      2
    ],
    "explanation": "The Health and Safety at Work Act requires workers to take reasonable care, cooperate with the employer and not misuse safety provisions; supplying suitable PPE free of charge is the employer's duty, not the worker's."
  },
  {
    "id": "working_environment-010",
    "module": "working_environment",
    "topic": "fire_triangle",
    "question_type": "multiple_answer",
    "question_text": "A fire needs three elements to start and keep burning, known as the 'fire triangle'. Which three are they? (Choose all that apply)",
    "options": [
      "Heat (a source of ignition)",
      "Fuel (something that will burn)",
      "Oxygen",
      "Water"
    ],
    "correct_answer": [
      0,
      1,
      2
    ],
    "explanation": "Removing any one of heat, fuel or oxygen will extinguish a fire; water is commonly used to remove heat but is not itself one of the three sides of the fire triangle."
  },
  {
    "id": "working_environment-011",
    "module": "working_environment",
    "topic": "safety_signs",
    "question_type": "multiple_choice",
    "question_text": "What does this safety sign mean?",
    "options": [
      "You must wear ear protection",
      "No open flames or naked lights",
      "This is the fire assembly point",
      "Flammable materials are stored here"
    ],
    "correct_answer": [
      1
    ],
    "explanation": "A red circle with a diagonal bar through it is a PROHIBITION sign. This one tells you that open flames or naked lights are not allowed.",
    "image_url": "/questions/sample-sign.svg"
  },
  {
    "id": "working_environment-012",
    "module": "working_environment",
    "topic": "site_hazards",
    "question_type": "hotspot",
    "question_text": "Tap the biggest hazard in this site scene.",
    "options": [],
    "correct_answer": [],
    "explanation": "The unguarded floor opening is an immediate fall hazard. Openings must be securely covered or protected with a fixed barrier and clear warning signage.",
    "image_url": "/questions/sample-site.svg",
    "hotspot_zones": [
      {
        "id": "zone-1",
        "label": "Unguarded floor opening",
        "x": 0.6,
        "y": 0.66,
        "width": 0.28,
        "height": 0.22,
        "correct": true
      }
    ]
  }
];
