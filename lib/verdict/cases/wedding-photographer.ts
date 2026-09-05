// =============================================================================
// CASE 01 — "The Wedding Photographer Who Deleted Everything"
//
// The flagship. Difficulty 2, one smug witness, three crack conditions that can
// be established in any order. This is the case new players should meet first
// after the tutorial, and the one to record clips from.
//
// Shape of the trap: the contract genuinely does cap his liability, so an
// advocate who attacks the contract loses. The case is won on the TIMELINE —
// he cannot have lost photographs he never took.
// =============================================================================

import type { Case } from "../types";

export const weddingPhotographer: Case = {
  id: "wedding-photographer",
  title: "The Wedding Photographer Who Deleted Everything",
  premise:
    "Every photograph of their wedding is gone. He says the memory card failed. His own invoice says he was somewhere else.",
  court: "Hallam County Small Claims Court",
  judge: {
    name: "District Judge Aurelia Kem",
    temperament:
      "Patient, dry, and allergic to speeches. Will let you run, then ask what the point was.",
  },

  side: "You act for Nia and Tomas Okwuosa, the claimants.",
  clientStatement:
    "We paid £4,200 for full-day coverage through to nine o'clock. What we got back was 61 photographs, none of them after five in the afternoon, and then nothing at all. No speeches. No first dance. No cutting the cake. My mother died in November. There are no photographs of her at my wedding.",
  opposingClaim:
    "Marcus Vane says a memory card failed on the drive home, that data loss is a known hazard of the profession, and that clause 9 of his contract caps his liability at the fee already partly refunded. He offered 50% back within the week and says the matter is closed.",
  stake: "£4,200 plus the cost of the reprint album — £4,760 in total.",

  exhibits: [
    {
      ref: "A",
      name: "The photography contract",
      detail:
        "Signed 4 February. Clause 3: coverage from 11:00 to 21:00, 'including speeches and first dance'. Clause 9: liability for data loss capped at the fee paid.",
      aliases: ["contract", "clause 9", "clause 3", "the agreement", "clause nine"],
      pivotal: false,
    },
    {
      ref: "B",
      name: "Data recovery invoice",
      detail:
        "From Copperfield Data, £45, dated the 22nd — eleven days after the wedding. Describes the item as 'SD card, 64GB, no fault found on presented media'.",
      aliases: [
        "recovery invoice",
        "copperfield",
        "the invoice",
        "data recovery",
        "sixty-four",
        "64gb",
        "no fault found",
      ],
      pivotal: true,
    },
    {
      ref: "C",
      name: "The delivered photographs",
      detail:
        "61 images. The final frame is timestamped 17:04. Camera metadata shows all 61 came off a 128GB card, not a 64GB one.",
      aliases: [
        "the photographs",
        "the photos",
        "the images",
        "metadata",
        "timestamp",
        "17:04",
        "five oh four",
        "128gb",
        "the sixty-one",
      ],
      pivotal: true,
    },
    {
      ref: "D",
      name: "Portfolio post, 'Ravensmoor Barn'",
      detail:
        "Published on Vane's own public portfolio. A different wedding, same date, captioned 'second shoot of the day — what a night'. First image timestamped 18:12.",
      aliases: [
        "portfolio",
        "ravensmoor",
        "the second wedding",
        "second shoot",
        "the post",
        "his website",
        "18:12",
      ],
      pivotal: true,
    },
    {
      ref: "E",
      name: "Call log",
      detail:
        "Four voicemails from the claimants over six days. The fifth call, on the 19th, did not connect.",
      aliases: ["call log", "voicemails", "the calls", "phone records", "blocked"],
      pivotal: false,
    },
  ],

  witnesses: [
    {
      id: "vane",
      name: "Marcus Vane",
      age: 34,
      occupation: "Wedding photographer, eleven years in business",
      personality: "smug",
      demeanour:
        "Leans back. Answers the court as though explaining a menu to a tourist.",
      publicStatement:
        "The card failed on the drive home. I had it looked at by a recovery firm at my own expense and there was nothing to be done — these things happen, which is precisely why clause 9 exists and why every photographer in the country has one. I offered them half the fee back within the week. I'd say that's more than fair.",

      hiddenFacts: [
        "He was double-booked that Saturday: a second wedding at Ravensmoor Barn, forty minutes away, with a contracted arrival time of 17:45.",
        "He left the Okwuosa reception at approximately 17:10 — before the speeches, before the first dance, before the cake. He told nobody he was leaving.",
        "He had run out of empty cards. In the car park at Ravensmoor he formatted the card containing the Okwuosa wedding so he could shoot the second job on it. He had not backed it up.",
        "Nothing failed. There was no fault. He knows exactly what happened to the photographs because he did it himself.",
        "Eleven days later, when the claimants would not stop calling, he took a spare 64GB card from his bag — not the card he had used — to Copperfield Data and paid £45 for an invoice he could show them. The report says 'no fault found' because there was no fault.",
        "He blocked their number after the fourth voicemail.",
        "He has done this once before, in 2022, with a christening. That client accepted 50% and went away. He expects the same here.",
        "He is not sorry. He believes a wedding is one day's work and that the couple are being hysterical about it.",
      ],

      contradiction:
        "He says a card failed on the drive home from the Okwuosa wedding. But he did not drive home — he drove to a second booking; the card he took to the recovery firm is not the card the photographs were on; and the 61 surviving images stop at 17:04 because he left, not because anything broke.",

      crackConditions: [
        {
          id: "c1",
          label: "He left early for a second booking",
          establishedWhen:
            "The advocate gets him to accept, in any form of words, that he had another job that evening, or that he left the Okwuosa reception before the speeches. Pinning him to a departure time, to the Ravensmoor booking, or to the 17:04 cut-off all count.",
        },
        {
          id: "c2",
          label: "The recovery invoice is for a different card",
          establishedWhen:
            "The advocate gets him to accept that the card described on the Copperfield invoice (64GB) is not the card the wedding was shot on (128GB), or that 'no fault found' means the presented card was working, or that he cannot explain the eleven-day gap.",
        },
        {
          id: "c3",
          label: "He had no backup and reused the card",
          establishedWhen:
            "The advocate gets him to accept that he made no copy before the card left his possession, or that he was short of cards that day, or that the same card was used for both jobs.",
        },
      ],

      crackResponse:
        "…Fine. Fine. I had Ravensmoor at quarter to six and I was out of cards, and I was not going to walk into a second wedding with nothing to shoot on. So yes. I formatted it in the car park. It took four seconds. I have been photographing weddings for eleven years and nobody has ever asked me what happened to a card before — they take the fifty per cent and they move on, and I don't know why these two couldn't do the same.",
      crackDemeanour:
        "The lean is gone. He is sitting forward now, talking too fast, and he cannot stop.",
    },
  ],

  difficulty: 2,

  winningThreads: [
    "The timeline: the last photograph is 17:04 and the Ravensmoor post is 18:12. He cannot have lost photographs of speeches he was not present for.",
    "The invoice mismatch: a 64GB card eleven days later, described as having no fault, when the wedding was shot on a 128GB card.",
    "No backup: he accepted a £4,200 job and kept the only copy on a card he then needed for another client.",
    "Clause 3 before clause 9: he is not defending a partial performance, he is defending an absence — the contract he wants to rely on is the same contract that required him to stay until nine.",
  ],

  trapThreads: [
    "Attacking clause 9 as unfair. It is a normal clause, it was signed, and the bookkeeper on this jury will side with the document every time.",
    "Attacking his prices, his taste, or his character. It reads as spite and costs credibility with anyone who dislikes being lectured.",
    "Demanding damages for emotional distress in a small claim. It overreaches, and the retired sergeant will mark you down for claiming more than you proved.",
    "Accusing him of deleting the photographs before he has conceded he had a reason to. Assert it early and he simply denies it; the accusation is worth nothing until the timeline is nailed down.",
  ],

  jurorIds: ["j-bookkeeper", "j-barista", "j-teacher", "j-sergeant", "j-novelist"],
};
