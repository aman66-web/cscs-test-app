// =============================================================================
// CASE 05 — "The Reference That Cost Her the Job"
//
// Difficulty 5, and the hardest case in the game for a reason that has nothing
// to do with the facts. The witness is warm, apologetic, and entirely likeable.
// She concedes almost everything you ask for, gracefully, and every concession
// makes the jury like her more and you less.
//
// Shape of the trap: the facts are easy and the room is not. This panel weights
// credibility heavily on purpose. A player who wins here has learned the thing
// the game is actually teaching — that being right is a separate skill from
// being persuasive.
//
// The crack is quiet. She does not explode; she goes still and tells the truth,
// and it is worse for her than shouting would have been.
// =============================================================================

import type { Case } from "../types";

export const theReference: Case = {
  id: "the-reference",
  title: "The Reference That Cost Her the Job",
  premise:
    "'I would not rehire her.' The offer was withdrawn the same afternoon. She had never opened the file.",
  court: "Hallam County Small Claims Court",
  judge: {
    name: "District Judge Aurelia Kem",
    temperament:
      "Patient, dry, and allergic to speeches. Will let you run, then ask what the point was.",
  },

  side: "You act for Femi Adesanya, the claimant.",
  clientStatement:
    "I had the offer in writing on the Tuesday. They rang for the reference on the Thursday. By four o'clock the offer was withdrawn and nobody would tell me why until I made a subject access request. Three days off in two years. All of them certified. I have the certificates.",
  opposingClaim:
    "Gwen Marchetti says she was asked for an honest reference and gave one — that the claimant had attendance problems and that she would not rehire her. She says she said what she believed to be true and is sorry it caused difficulty.",
  stake: "£2,400 — the difference in salary over the eight months it took to find other work.",

  exhibits: [
    {
      ref: "A",
      name: "Attendance spreadsheet",
      detail:
        "Rows in surname order. Row 14: ADESANYA, F — 3 days, all certified. Row 13, immediately above: ADEYEMI, F — 31 days, 9 uncertified.",
      aliases: [
        "the spreadsheet",
        "attendance record",
        "the record",
        "row 13",
        "row 14",
        "adeyemi",
        "the rows",
        "the file",
        "the attendance file",
      ],
      pivotal: true,
    },
    {
      ref: "B",
      name: "Reference call note",
      detail:
        "Taken by the recruiter. 'Spoke GM 14:26, 4 mins. Attendance issues. Would not rehire.' Duration four minutes.",
      aliases: [
        "the call note",
        "the note",
        "recruiter's note",
        "four minutes",
        "14:26",
        "the phone call",
        "the call",
      ],
      pivotal: true,
    },
    {
      ref: "C",
      name: "Company reference policy",
      detail:
        "'All reference requests must be routed to HR. Line managers must not provide references. References are factual only: dates and job title.'",
      aliases: [
        "the policy",
        "reference policy",
        "company policy",
        "hr policy",
        "routed to hr",
        "factual only",
      ],
      pivotal: true,
    },
    {
      ref: "D",
      name: "Medical certificates",
      detail: "Three fit notes covering all three absences over two years.",
      aliases: [
        "the certificates",
        "fit notes",
        "sick notes",
        "medical certificates",
        "the certs",
      ],
      pivotal: false,
    },
    {
      ref: "E",
      name: "Withdrawal email",
      detail:
        "Sent 16:02 the same day. 'Following our pre-employment checks we are unable to proceed.'",
      aliases: [
        "the withdrawal",
        "withdrawal email",
        "the email",
        "16:02",
        "the offer withdrawal",
      ],
      pivotal: false,
    },
  ],

  witnesses: [
    {
      id: "marchetti",
      name: "Gwen Marchetti",
      age: 63,
      occupation: "Office manager, 22 years with the company",
      personality: "sympathetic",
      demeanour:
        "Thanked the usher. Keeps looking over at the claimant with an expression of real distress.",
      publicStatement:
        "I was asked for an honest reference and I gave an honest one. I said there had been attendance problems and that I would not rehire, because that was my understanding. I'm terribly sorry if I've caused this young woman trouble — that was never what I wanted. But I was asked a direct question and I answered it truthfully.",

      hiddenFacts: [
        "She never opened the attendance file. She answered the call from memory, standing at the reception desk, while covering somebody's lunch.",
        "The attendance record she was remembering is the row above: ADEYEMI, F — 31 days, nine uncertified. Two names, one letter apart, in surname order.",
        "The call lasted four minutes. She has given eleven references this way over the years and has never once looked anything up.",
        "Company policy required all references to go to HR, and expressly forbade line managers from giving them. She knows the policy exists. She has never followed it.",
        "Six weeks earlier, the departing director had told her in passing that the claimant 'made a bit of a fuss' about unpaid overtime. It stayed with her. She would not say it was why she said what she said, and she is not certain that it wasn't.",
        "She genuinely likes the claimant and has thought about this almost every day since the letter arrived.",
        "She is not lying to the court. She said what she believed. She has simply never once checked whether what she believed was true, and nobody has ever made her look at that before today.",
      ],

      contradiction:
        "An honest reference 'from the record' — given in four minutes, from memory, at a reception desk, by someone who was not permitted to give it at all, about a row of the spreadsheet belonging to a different woman whose surname is one letter away.",

      crackConditions: [
        {
          id: "c1",
          label: "She answered from memory without opening the file",
          establishedWhen:
            "The advocate gets her to accept she did not look at the attendance record before or during the call, or pins her to where she was standing, or to the four-minute duration.",
        },
        {
          id: "c2",
          label: "The name one row above",
          establishedWhen:
            "The advocate gets her to look at or accept the spreadsheet ordering — that ADEYEMI sits immediately above ADESANYA — or that the 31-day record is not the claimant's.",
        },
        {
          id: "c3",
          label: "She was not authorised to give the reference",
          establishedWhen:
            "The advocate gets her to accept that policy required references to go through HR, or that line managers were not to give them, or that she had never routed one that way.",
        },
      ],

      crackResponse:
        "…It's the row above. It's the row above, isn't it. I've been sat here since half past nine telling myself I'd remember her file and I don't remember her file, because I never had it open. I was on reception covering Denise's lunch and I said what was in my head, and what was in my head was thirty-one days, and thirty-one days is Fiona. I'm so sorry. I have done that phone call eleven times in twenty-two years and I have never once opened anything.",
      crackDemeanour:
        "She stops. She looks at the spreadsheet for a long moment and something in her face gives way.",
    },
  ],

  difficulty: 5,

  winningThreads: [
    "Four minutes. Establish the call was four minutes long and that no file was open, and the 'honest reference from the record' has no record in it.",
    "The row above: two surnames one letter apart, in a list sorted by surname, and a 31-day figure that belongs to the other one.",
    "The policy: she was not permitted to give a reference at all, and has never routed one to HR in twenty-two years.",
    "Be gentle. On this panel, the concessions are worth more if you let her make them with her dignity intact.",
  ],

  trapThreads: [
    "Pressing her hard. She will not fight back, and every juror will watch you push a 63-year-old woman who is already crying. This panel weights credibility above everything.",
    "Alleging she did it deliberately because of the overtime complaint. You cannot prove it, she does not believe it herself, and the accusation will cost you the case even if you land every other point.",
    "Arguing the company is liable rather than her. Not the claim before this court, and Judge Kem will ask what the point was.",
    "Labouring the medical certificates. Nobody disputes the absences were certified; the dispute is whose absences they were.",
  ],

  jurorIds: ["j-vicar", "j-fundraiser", "j-nurse", "j-driver", "j-pharmacist"],
};
