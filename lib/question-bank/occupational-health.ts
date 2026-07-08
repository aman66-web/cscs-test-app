import type { Question } from "@/lib/questions/types";

// =============================================================
// Module: Occupational Health
// CSCS HS&E sample questions (AI-authored seed content — review for factual
// accuracy before shipping). 10 questions.
// Schema: lib/questions/types.ts
// =============================================================

export const OCCUPATIONAL_HEALTH_QUESTIONS: Question[] = [
  {
    "id": "occupational_health-001",
    "module": "occupational_health",
    "topic": "dust_and_silica",
    "question_text": "When using a cut-off saw to cut concrete blocks, what is the most effective way to reduce the amount of harmful dust in the air?",
    "options": [
      "Use water to damp down the dust at the point of cutting",
      "Work as quickly as possible to finish the task sooner",
      "Rely on a lightweight cotton nuisance mask on its own",
      "Open nearby doors and windows to let the dust blow away"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Cutting materials that contain silica releases respirable crystalline silica, which permanently damages the lungs. Water suppression (or on-tool dust extraction) stops the dust becoming airborne, which is far more effective than relying on a mask alone.",
    "question_type": "multiple_choice"
  },
  {
    "id": "occupational_health-002",
    "module": "occupational_health",
    "topic": "asbestos_awareness",
    "question_text": "While working in an older building you disturb a material that you think might contain asbestos. What should you do first?",
    "options": [
      "Stop work, leave the area undisturbed and report it to your supervisor",
      "Carry on working but try to hold your breath",
      "Damp the material down and put it in the general waste skip",
      "Sweep up any debris and continue with the job"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Asbestos fibres cause fatal lung diseases and cannot be seen once they are in the air. Stopping work and reporting it prevents further disturbance so that trained, licensed specialists can assess and deal with it safely.",
    "question_type": "multiple_choice"
  },
  {
    "id": "occupational_health-003",
    "module": "occupational_health",
    "topic": "noise",
    "question_text": "How is hearing damage caused by exposure to loud noise at work best described?",
    "options": [
      "Permanent, because the damage to the inner ear cannot be repaired",
      "Temporary, as it always recovers fully within a week",
      "Only a problem for people who are already over 60",
      "Easily reversed by wearing ear defenders after the work is done"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Noise-induced hearing loss and tinnitus develop gradually and are permanent because the delicate structures of the inner ear cannot heal. This is why hearing protection must be worn before the damage occurs, not afterwards.",
    "question_type": "multiple_choice"
  },
  {
    "id": "occupational_health-004",
    "module": "occupational_health",
    "topic": "havs",
    "question_text": "Which of the following is an early warning sign of hand-arm vibration syndrome (HAVS)?",
    "options": [
      "Tingling and numbness in the fingers",
      "A rash on the back of the hands",
      "Aching shoulders at the end of the shift",
      "Redness of the palms after washing"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "HAVS is caused by regular use of vibrating tools and damages the nerves and blood vessels in the hands. Tingling, numbness and fingers going white are early signs, and reporting them promptly can prevent permanent disability.",
    "question_type": "multiple_choice"
  },
  {
    "id": "occupational_health-005",
    "module": "occupational_health",
    "topic": "coshh",
    "question_text": "What information does a product's safety data sheet (SDS) give you?",
    "options": [
      "The hazards of the substance and how to use, store and handle it safely",
      "Only the price and the supplier of the product",
      "The delivery date of the material to site",
      "A list of everyone who has previously used the product"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Under COSHH, employers must assess the risks from hazardous substances before they are used. The safety data sheet provides the information needed to do this, including the hazards, safe handling and storage, the PPE required and first-aid measures.",
    "question_type": "multiple_choice"
  },
  {
    "id": "occupational_health-006",
    "module": "occupational_health",
    "topic": "manual_handling",
    "question_text": "When you have to lift a load by hand, what is the correct technique?",
    "options": [
      "Bend your knees, keep your back straight and hold the load close to your body",
      "Keep your legs straight and bend forwards from the waist",
      "Hold the load at arm's length to keep it away from your clothes",
      "Twist your body as you lift to get the job done faster"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Keeping the load close and using your leg muscles rather than your back greatly reduces the strain on the spine. Bending or twisting the back while lifting is a common cause of long-term back injury.",
    "question_type": "multiple_choice"
  },
  {
    "id": "occupational_health-007",
    "module": "occupational_health",
    "topic": "welfare_facilities",
    "question_text": "Which of the following welfare facilities must be provided on a construction site? (Choose all that apply)",
    "options": [
      "Toilets",
      "Somewhere to wash your hands",
      "A supply of drinking water",
      "A free hot cooked meal every lunchtime"
    ],
    "correct_answer": [
      0,
      1,
      2
    ],
    "explanation": "Employers must provide basic welfare, including toilets, washing facilities, a supply of drinking water and somewhere to rest and warm up. Providing a free cooked meal is not a legal requirement.",
    "question_type": "multiple_answer"
  },
  {
    "id": "occupational_health-008",
    "module": "occupational_health",
    "topic": "health_surveillance",
    "question_text": "What is the main purpose of health surveillance at work?",
    "options": [
      "To spot the early signs of work-related ill health so that action can be taken",
      "To decide which workers should be paid the most",
      "To remove the need to control the hazard at its source",
      "To measure how fast workers can complete their tasks"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Health surveillance monitors workers who are exposed to certain risks, such as noise, vibration or dust, so that early signs of harm are detected and further exposure can be prevented. It supports, but never replaces, controlling the hazard at source.",
    "question_type": "multiple_choice"
  },
  {
    "id": "occupational_health-009",
    "module": "occupational_health",
    "topic": "mental_health",
    "question_text": "You have been feeling very stressed and are struggling to cope at work. What is the best thing to do?",
    "options": [
      "Talk to someone, such as your supervisor, a mental health first aider or your GP",
      "Say nothing and hope the feeling goes away on its own",
      "Work longer hours to try to take your mind off it",
      "Ignore it, because stress is not a genuine health issue"
    ],
    "correct_answer": [
      0
    ],
    "explanation": "Mental health matters as much as physical health, and stress can affect your concentration and safety on site. Talking to someone early means you can get support and make changes before things get worse.",
    "question_type": "multiple_choice"
  },
  {
    "id": "occupational_health-010",
    "module": "occupational_health",
    "topic": "coshh",
    "question_text": "In which of the following ways can hazardous substances get into your body while working on site? (Choose all that apply)",
    "options": [
      "Breathing them in as dust, fumes or vapour",
      "Absorbing them through the skin",
      "Swallowing them, for example from unwashed hands before eating",
      "Hearing them while working nearby"
    ],
    "correct_answer": [
      0,
      1,
      2
    ],
    "explanation": "Hazardous substances typically enter the body by inhalation, absorption through the skin and ingestion. Good controls and washing your hands before eating or smoking reduce these routes; hearing is not a way substances enter the body.",
    "question_type": "multiple_answer"
  }
];
