// =============================================================================
// CASE 02 — "The Dog That Bit First"
//
// The tutorial case. Difficulty 1: a nervous witness who over-explains, and
// three conditions that are almost handed to you if you ask anything specific.
// A first-time player should crack this one and immediately want another.
//
// Shape of the trap: the claimant is a frail-seeming 61-year-old with a
// genuine wound. Go at him hard and the vicar and the salon owner will bury
// you regardless of what he admits.
// =============================================================================

import type { Case } from "../types";

export const theDog: Case = {
  id: "the-dog",
  title: "The Dog That Bit First",
  premise:
    "He says the dog came through the fence at him. The vet's bill says the dog had been poisoned twice that month.",
  court: "Hallam County Small Claims Court",
  judge: {
    name: "District Judge Aurelia Kem",
    temperament:
      "Patient, dry, and allergic to speeches. Will let you run, then ask what the point was.",
  },

  side: "You act for Nadia Oyelaran, the defendant — the dog's owner.",
  clientStatement:
    "Bruno is nine years old and he has never bitten anybody. He'd been ill twice in three weeks and the vet couldn't say why. On the day, I heard him screaming — screaming, not barking — and by the time I got to the fence Mr Threadgold was walking back to his house. He didn't say a word to me. The first I heard of a bite was a letter eleven days later.",
  opposingClaim:
    "Colin Threadgold claims Bruno forced his way through a gap in the boundary fence and bit him on the leg without provocation, and that Ms Oyelaran is liable for his A&E attendance, a ruined pair of trousers and three weeks off his allotment. He seeks £1,150.",
  stake: "£1,150, and whether a nine-year-old dog is recorded as dangerous.",

  exhibits: [
    {
      ref: "A",
      name: "A&E discharge note",
      detail:
        "Puncture wounds x2, inner aspect of the left calf. No tendon involvement. Time of attendance recorded as 19:40.",
      aliases: [
        "a&e note",
        "discharge note",
        "hospital note",
        "the note",
        "19:40",
        "inner calf",
        "puncture wounds",
        "the wound",
      ],
      pivotal: true,
    },
    {
      ref: "B",
      name: "Veterinary invoice, Marchgate Veterinary",
      detail:
        "Twelve days before the incident. 'Presented vomiting, suspected metaldehyde ingestion.' Metaldehyde is the active ingredient in slug pellets. Second attendance nine days later.",
      aliases: [
        "vet invoice",
        "vet bill",
        "marchgate",
        "the vet",
        "metaldehyde",
        "slug pellets",
        "poisoning",
        "the pellets",
      ],
      pivotal: true,
    },
    {
      ref: "C",
      name: "Photograph of the boundary fence",
      detail:
        "Taken the following morning. A gap of roughly 30cm at the base of the third panel. A garden cane is leaning against the fence on the Threadgold side.",
      aliases: [
        "the photograph",
        "photo of the fence",
        "the fence",
        "the gap",
        "the cane",
        "garden cane",
      ],
      pivotal: true,
    },
    {
      ref: "D",
      name: "Council complaint log",
      detail:
        "Four noise and nuisance complaints from Mr Threadgold over fourteen months. All four closed with no action. The last was refused three weeks before the incident.",
      aliases: [
        "council log",
        "complaints",
        "the complaints",
        "council complaints",
        "noise complaints",
      ],
      pivotal: false,
    },
    {
      ref: "E",
      name: "The trousers",
      detail:
        "Two punctures, low on the left leg, at the back. No tearing along the seam. No mud at the knee.",
      aliases: ["the trousers", "trousers", "his trousers", "the clothing"],
      pivotal: false,
    },
  ],

  witnesses: [
    {
      id: "threadgold",
      name: "Colin Threadgold",
      age: 61,
      occupation: "Retired postal worker",
      personality: "nervous",
      demeanour:
        "Holds the rail with both hands. Answers before the question has finished.",
      publicStatement:
        "I was stood at the bottom of my garden, minding my own business, and the dog came through that gap like a train and went for my ankle. I backed away as fast as I could. I did nothing to provoke it. I've got the trousers and I've got the hospital note and I've had enough of that animal.",

      hiddenFacts: [
        "He had been laying slug pellets in a line along the base of the boundary fence for about a month. He knew the dog nosed along that fence.",
        "On the day, he had a garden cane in his right hand and had been using it to push the dog back through the gap. He swung it at least twice. He would not call it hitting.",
        "The dog bit the inside of his left calf, low down. He was standing over the gap, leaning across it, when it happened — not backing away.",
        "He waited. He did not go to A&E for nearly two hours; he went to the Fleece and had two pints first, and told two people there what had happened.",
        "He has made four complaints about the dog to the council. All four were refused. The last refusal, three weeks earlier, annoyed him a great deal.",
        "He is genuinely frightened of the dog and genuinely was bitten. He is not inventing the injury. He is leaving out what he was doing when it happened.",
        "He did not know the pellets were making the dog ill. When he found out, it did not change his behaviour.",
        "He is 61, he lives alone, and being in a courtroom is the worst thing that has happened to him in years.",
      ],

      contradiction:
        "He says the dog came through the gap and went for him while he backed away. But a bite to the inside of the calf, low and at the back, with no mud on the knees and a cane at the fence, is what happens to a man leaning over a gap pushing a dog back through it — and he waited two hours before anyone official saw the wound.",

      crackConditions: [
        {
          id: "c1",
          label: "He had the cane in his hand at the fence",
          establishedWhen:
            "The advocate gets him to accept he was holding something — a cane, a stick, anything — at the fence, or that he was using it on or near the dog. Naming the cane in the photograph counts.",
        },
        {
          id: "c2",
          label: "The wound position contradicts backing away",
          establishedWhen:
            "The advocate gets him to accept where the bite actually is (inner or rear of the calf, low), or that he was leaning over or reaching towards the gap rather than retreating.",
        },
        {
          id: "c3",
          label: "The two-hour gap before A&E",
          establishedWhen:
            "The advocate gets him to accept that he did not go straight to hospital, or pins him to a time for the incident that cannot be reconciled with the 19:40 attendance.",
        },
      ],

      crackResponse:
        "All right — yes. I had the cane. I had the cane because that is the only thing that moves him and I am sixty-one years of age and I am not putting my hands near that animal. I was pushing him back through the gap where he came from and he turned and he got me, and I went and sat down because my leg was shaking, and then I went to the pub because I did not want to sit in that house on my own. That is what happened. I would like somebody to say that the dog should not have been in my garden in the first place.",
      crackDemeanour:
        "He lets go of the rail. He is not defending himself any more; he is just telling you.",
    },
  ],

  difficulty: 1,

  winningThreads: [
    "The wound position: an inner-calf bite, low and at the back, is not what a retreating man collects.",
    "The cane in the photograph, on his side of the fence, the morning after.",
    "The vet invoices: metaldehyde poisoning twice in three weeks, in a dog that patrols that fence line.",
    "The two-hour gap: a man being savaged without provocation does not stop for two pints on the way.",
  ],

  trapThreads: [
    "Going at him hard because he is nervous and gives ground easily. He is 61, he was genuinely bitten, and the vicar and the salon owner are watching how you treat him.",
    "Arguing he deserved it. Even if true, it is not a defence, and it reads as cruelty.",
    "Leading with the poisoning as an accusation of malice. You cannot prove he meant to poison the dog, and claiming it costs you with the sergeant.",
    "Relying on the council complaints to paint him as a crank. Four refused complaints about a real dog make him look persistent, not mad.",
  ],

  jurorIds: ["j-vicar", "j-owner", "j-nurse", "j-plumber", "j-tester"],
};
