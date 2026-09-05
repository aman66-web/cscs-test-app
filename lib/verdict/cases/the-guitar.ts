// =============================================================================
// CASE 03 — "The Guitar That Was Already Cracked"
//
// Difficulty 3. The rehearsed witness. He has ONE prepared sentence and he
// returns to it verbatim under pressure — which is itself the tell. A player
// who notices the repetition and asks him to say it a fourth time, then asks
// what is NOT in it, is playing the game the way it is meant to be played.
//
// Shape of the trap: the courier is the obvious villain and is not in the room.
// Spend the cross blaming the courier and you will lose to a man who agrees
// with you enthusiastically for six minutes.
// =============================================================================

import type { Case } from "../types";

export const theGuitar: Case = {
  id: "the-guitar",
  title: "The Guitar That Was Already Cracked",
  premise:
    "£3,100 for a 1968 Telecaster. It arrived in two pieces. He blames the courier — but he declined the insurance.",
  court: "Ashmount District Court, Small Claims List",
  judge: {
    name: "District Judge Peter Lowndes",
    temperament:
      "Pedantic. Will interrupt to ask which exhibit you mean, and expects you to know.",
  },

  side: "You act for Sam Idowu, the buyer.",
  clientStatement:
    "I bought it because the listing said structurally original, no repairs. I've been saving four years. It arrived with the neck off and there's old glue in the break — brown glue, not fresh timber. That neck has been off before. He knew.",
  opposingClaim:
    "Dermot Falk says the instrument left his shop in perfect condition, triple-boxed, and that the damage occurred in transit. He says his claim against the carrier is pending and that the buyer's argument is with them, not with him.",
  stake: "£3,100, plus £240 already spent on an independent inspection.",

  exhibits: [
    {
      ref: "A",
      name: "The listing",
      detail:
        "'1968 Telecaster, structurally original, no repairs, no breaks.' Four photographs. The neck heel is not visible in any of them.",
      aliases: [
        "the listing",
        "the advert",
        "the ad",
        "structurally original",
        "no repairs",
        "the description",
      ],
      pivotal: false,
    },
    {
      ref: "B",
      name: "Shipping receipt",
      detail:
        "Consignment weight 4.1kg. Declared value: £0. Box count: 1. Signed by D. Falk at the counter.",
      aliases: [
        "shipping receipt",
        "the receipt",
        "consignment",
        "4.1",
        "four point one",
        "declared value",
        "zero",
        "box count",
        "one box",
      ],
      pivotal: true,
    },
    {
      ref: "C",
      name: "Independent luthier's report",
      detail:
        "'Historic repair to the neck heel, hide glue, consistent with a break repaired 6–12 months prior. Repair line reopened along the original fracture.'",
      aliases: [
        "luthier's report",
        "the report",
        "the inspection",
        "hide glue",
        "historic repair",
        "the break",
        "old glue",
      ],
      pivotal: true,
    },
    {
      ref: "D",
      name: "Photograph comparison",
      detail:
        "The same four listing photographs appear on two of Falk's earlier sold listings, in 2023 and 2024, for the same instrument. Same angle. Same shadow.",
      aliases: [
        "photograph comparison",
        "the photographs",
        "the photos",
        "same photos",
        "earlier listings",
        "previous listings",
        "reused photos",
      ],
      pivotal: true,
    },
    {
      ref: "E",
      name: "Carrier's damage assessment",
      detail:
        "'Single carton, no internal bracing, no fragile marking. Packaging inadequate for declared contents.' Claim declined.",
      aliases: [
        "carrier's assessment",
        "damage assessment",
        "the carrier",
        "courier report",
        "claim declined",
        "packaging",
      ],
      pivotal: false,
    },
  ],

  witnesses: [
    {
      id: "falk",
      name: "Dermot Falk",
      age: 47,
      occupation: "Vintage instrument dealer, Falk & Sons",
      personality: "rehearsed",
      demeanour:
        "Sits very still. Waits a beat before every answer, as if checking it against something.",
      publicStatement:
        "That instrument left my shop in perfect condition, triple-boxed, exactly as it has left my shop for nineteen years. What happened to it after that is a matter for the carrier, and I have a claim in with them. I'm as sorry about it as he is.",

      hiddenFacts: [
        "The neck heel had been broken and repaired about eight months earlier by a luthier called Priya Sandhu, who works two streets away and who he has used for years.",
        "He listed it as 'structurally original, no repairs' knowing that was false. The repair is why he had it cheap.",
        "He photographed it deliberately from an angle that hides the heel. He has used those same four photographs on this instrument twice before, in 2023 and 2024, both times sold and returned.",
        "He declined the courier's declared-value cover at the counter — £0 declared — because a declared value over £1,000 triggers a condition report, and a condition report means somebody looks at the heel.",
        "He did not triple-box it. He used one carton and newspaper. The shipping weight of 4.1kg is the guitar and a box; a triple-boxed Telecaster is nine kilos and more.",
        "The carrier declined his claim four days before this hearing. He has not told anyone that.",
        "His prepared line is: 'That instrument left my shop in perfect condition, triple-boxed.' He returns to it word for word whenever he is pressed, and he does not hear himself doing it.",
        "He is not a fraudster by temperament. He is a man who has made this exact decision about eleven instruments and has never once been asked about it in a room with a judge in it.",
      ],

      contradiction:
        "'Perfect condition, triple-boxed, and the carrier's fault.' But the shipping receipt weighs 4.1kg in one box, he declined the cover that would have required someone to inspect it, and the break in the heel is an eight-month-old repair reopening along its own glue line.",

      crackConditions: [
        {
          id: "c1",
          label: "One box, not three",
          establishedWhen:
            "The advocate gets him to accept the shipping weight or the box count on the receipt, or that 4.1kg cannot be three cartons, or that he packed it himself in a single carton.",
        },
        {
          id: "c2",
          label: "He declined declared-value cover",
          establishedWhen:
            "The advocate gets him to accept that he declared £0, or that he chose not to insure a £3,100 instrument, or that a declared value would have required a condition report.",
        },
        {
          id: "c3",
          label: "The prior repair existed and he knew",
          establishedWhen:
            "The advocate gets him to accept the earlier repair, the luthier, or that the same photographs were used on his previous listings of this instrument.",
        },
      ],

      crackResponse:
        "It left my shop in — no. All right. Priya did the heel in the spring, and it was a good repair, it was a better repair than the factory joint, and it would have held for another fifty years if somebody had not put it on a van. That is what I believed. That is still what I believe. I did not insure it because I did not want a stranger at a counter opening my box and forming an opinion about a repair he would not have understood.",
      crackDemeanour:
        "He starts the sentence he always starts, and this time he cannot finish it.",
    },
  ],

  difficulty: 3,

  winningThreads: [
    "The weight: 4.1kg, one carton, against a claim of triple-boxing. Make him do the arithmetic out loud.",
    "The £0 declared value: he chose the one option that guaranteed nobody would inspect it.",
    "The reused photographs across three listings of the same guitar, always from the angle that hides the heel.",
    "The luthier's report: hide glue and a reopened repair line date the break to long before the van.",
  ],

  trapThreads: [
    "Blaming the courier. He will agree with you warmly and at length, and you will have spent your cross helping his defence.",
    "Arguing about what the guitar is worth. Value is not in dispute; condition is.",
    "Calling him a fraudster before he has conceded the repair. The accusation without the foundation reads as abuse and costs credibility.",
    "Getting lost in vintage-guitar jargon. The plumber and the taxi driver on this panel will stop following you, and Judge Lowndes will ask which exhibit you mean.",
  ],

  jurorIds: ["j-pharmacist", "j-plumber", "j-tester", "j-driver", "j-bookkeeper"],
};
