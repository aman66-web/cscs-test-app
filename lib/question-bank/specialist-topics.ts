import type { Question } from "@/lib/questions/types";

// =============================================================
// Module: Specialist Topics
// CSCS HS&E sample questions (AI-authored seed content — review for factual
// accuracy before shipping). 10 questions.
// Schema: lib/questions/types.ts
// =============================================================

export const SPECIALIST_TOPICS_QUESTIONS: Question[] = [
  {
    "id": "specialist_topics-001",
    "module": "specialist_topics",
    "topic": "road_works",
    "question_text": "When working on or beside a live highway, which item of PPE is most important for reducing the risk of being struck by moving traffic?",
    "options": [
      "High-visibility clothing of the correct class",
      "Knee pads",
      "Safety goggles",
      "Ear defenders"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "High-visibility clothing makes you far more conspicuous to approaching drivers, and on higher-speed roads it must be of the appropriate class so you can be seen in good time.",
    "question_type": "multiple_choice"
  },
  {
    "id": "specialist_topics-002",
    "module": "specialist_topics",
    "topic": "working_near_water",
    "question_text": "You are working close to deep, fast-flowing water. Which TWO precautions specifically help protect you from drowning?",
    "options": [
      "Wearing a buoyancy aid or life jacket",
      "Having rescue equipment such as a throwline close by",
      "Removing the edge protection so you can see the water",
      "Working alone so nobody else is at risk"
    ],
    "correct_answer": [
      0,
      1
    ],
    "explanation": "A buoyancy aid or life jacket keeps you afloat if you fall in, and having a throwline or other rescue gear to hand allows someone to recover you quickly; removing protection or working alone would increase the danger.",
    "question_type": "multiple_answer"
  },
  {
    "id": "specialist_topics-003",
    "module": "specialist_topics",
    "topic": "gas_awareness",
    "question_text": "If you smell gas while working, what is the correct first action to take?",
    "options": [
      "Turn off the supply at the emergency control valve and ventilate the area",
      "Switch on the lights so you can see the pipework",
      "Light a match to trace where the leak is coming from",
      "Carry on working and report it at the end of the shift"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Stopping the gas at the emergency control valve removes the source and opening up ventilates and disperses the gas; operating electrical switches or using naked flames could provide an ignition source and cause an explosion.",
    "question_type": "multiple_choice"
  },
  {
    "id": "specialist_topics-004",
    "module": "specialist_topics",
    "topic": "demolition_refurbishment",
    "question_text": "During refurbishment of a building constructed before the year 2000, which hidden material is most likely to present a serious health risk if it is disturbed?",
    "options": [
      "Asbestos",
      "Plasterboard",
      "Softwood timber",
      "PVC pipework"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Buildings constructed or last refurbished before 2000 may contain asbestos, and disturbing it releases fibres that can cause fatal lung diseases; work must stop until the material is identified and properly controlled.",
    "question_type": "multiple_choice"
  },
  {
    "id": "specialist_topics-005",
    "module": "specialist_topics",
    "topic": "tunnelling",
    "question_text": "Tunnelling work takes place in enclosed conditions. Which hazard is a particular concern because of the confined nature of a tunnel?",
    "options": [
      "A build-up of harmful gases or an oxygen-deficient atmosphere",
      "Excessive natural daylight",
      "High wind speeds",
      "Rain washing away the work"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "An enclosed tunnel can trap toxic gases or become short of oxygen, so the atmosphere must be monitored and mechanically ventilated to keep it safe to breathe.",
    "question_type": "multiple_choice"
  },
  {
    "id": "specialist_topics-006",
    "module": "specialist_topics",
    "topic": "activity_ppe",
    "question_text": "You are about to use a petrol-driven cut-off saw (disc cutter) to cut paving slabs outdoors. Which TWO controls should you use to protect your health and safety?",
    "options": [
      "Suppress the dust by feeding water to the blade",
      "Wear suitable eye protection",
      "Remove the blade guard to get a cleaner cut",
      "Work in a closed shed to keep the dust contained"
    ],
    "correct_answer": [
      0,
      1
    ],
    "explanation": "Water suppression greatly reduces the harmful silica dust produced when cutting stone, and eye protection guards against flying fragments; removing the guard or cutting in an unventilated space would sharply increase the risk of injury and lung disease.",
    "question_type": "multiple_answer"
  },
  {
    "id": "specialist_topics-007",
    "module": "specialist_topics",
    "topic": "road_works",
    "question_text": "Road works on a public road must be signed, lit and guarded. What is the main purpose of the advance traffic signs and cones set out before the works?",
    "options": [
      "To warn and guide road users safely around the works",
      "To advertise the contractor carrying out the job",
      "To provide a place for operatives to rest their tools",
      "To mark out parking spaces for site vehicles"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Advance signs and cones give drivers time to slow down and move into the correct position before they reach the works, protecting both road users and the people working there.",
    "question_type": "multiple_choice"
  },
  {
    "id": "specialist_topics-008",
    "module": "specialist_topics",
    "topic": "demolition_refurbishment",
    "question_text": "A survey should be carried out before a structure is demolished. What is one of the main reasons for doing this survey?",
    "options": [
      "To identify hazardous materials and how the structure will behave as it is weakened",
      "To decide what colour to paint the site hoarding",
      "To count how many windows the building has",
      "To choose the menu for the site canteen"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "A pre-demolition survey identifies dangers such as asbestos and reveals how the building carries its loads, so the demolition sequence can be planned to avoid an uncontrolled or premature collapse.",
    "question_type": "multiple_choice"
  },
  {
    "id": "specialist_topics-009",
    "module": "specialist_topics",
    "topic": "gas_awareness",
    "question_text": "A poorly maintained or badly ventilated gas appliance can give off a dangerous gas that has no colour and no smell. What is this gas?",
    "options": [
      "Carbon monoxide",
      "Oxygen",
      "Nitrogen",
      "Steam"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Carbon monoxide is colourless and odourless and can cause unconsciousness and death because it stops the blood carrying oxygen; only competent, registered gas engineers should work on or commission gas appliances.",
    "question_type": "multiple_choice"
  },
  {
    "id": "specialist_topics-010",
    "module": "specialist_topics",
    "topic": "working_near_water",
    "question_text": "Workers near rivers, canals or other places where rats may be present can catch an illness from water contaminated with rat urine. What is this disease commonly known as?",
    "options": [
      "Weil's disease (leptospirosis)",
      "Dermatitis",
      "Vibration white finger",
      "Tinnitus"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Weil's disease is spread through water contaminated by rat urine and can enter the body through cuts, grazes or the eyes and mouth; covering cuts and washing your hands before eating help reduce the risk.",
    "question_type": "multiple_choice"
  }
];
