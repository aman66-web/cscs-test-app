// =============================================================================
// CASE 04 — "The Deposit and the Ghost Tenant"
//
// Difficulty 4. The hostile witness: she attacks the question instead of
// answering it, and she is good at it. Ask her something vague and she will
// take the question apart in front of the jury and hand you back the pieces.
// The only way through is narrow, closed questions she cannot argue with.
//
// Shape of the trap: she is unpleasant, and it is very tempting to fight her.
// Every juror on this panel except one dislikes an advocate who scraps.
// =============================================================================

import type { Case } from "../types";

export const theDeposit: Case = {
  id: "the-deposit",
  title: "The Deposit and the Ghost Tenant",
  premise:
    "She kept £1,900 for an unauthorised sublet. The 'stranger' living there was the tenant's brother — and she'd already met him twice.",
  court: "Ashmount District Court, Small Claims List",
  judge: {
    name: "District Judge Peter Lowndes",
    temperament:
      "Pedantic. Will interrupt to ask which exhibit you mean, and expects you to know.",
  },

  side: "You act for Ruth Kavanagh, the former tenant.",
  clientStatement:
    "My brother stayed for six weeks while he was between places. He is not a subtenant, he never paid me a penny, and she met him twice — once on the stairs and once when she came to read the meter. She texted me about him. She called him my brother in the text.",
  opposingClaim:
    "Iris Bellhaven says she found an unknown adult living in the property in breach of clause 12, retained the deposit for that breach and for professional cleaning, and that the tenancy agreement entitles her to do exactly that.",
  stake: "£1,900 deposit, plus the £340 cleaning charge deducted from it.",

  exhibits: [
    {
      ref: "A",
      name: "Tenancy agreement, clause 12",
      detail:
        "'The Tenant shall not sublet without consent, such consent not to be unreasonably withheld. Any refusal shall be given in writing within 14 days of request.' No written refusal was ever sent.",
      aliases: [
        "clause 12",
        "clause twelve",
        "the agreement",
        "the tenancy",
        "the contract",
        "written refusal",
        "fourteen days",
      ],
      pivotal: true,
    },
    {
      ref: "B",
      name: "Text message, 14 March",
      detail:
        "From Bellhaven to Kavanagh: 'Saw your brother on the stairs again, tell him the front door needs pulling to.'",
      aliases: [
        "the text",
        "text message",
        "14 march",
        "fourteenth of march",
        "the message",
        "your brother",
        "the texts",
      ],
      pivotal: true,
    },
    {
      ref: "C",
      name: "Cleaning invoice",
      detail:
        "£340 from Bellhaven Property Services Ltd. Companies House lists the registered address as identical to the landlord's own home address. Sole director: I. Bellhaven.",
      aliases: [
        "cleaning invoice",
        "the invoice",
        "bellhaven property services",
        "the cleaning",
        "£340",
        "three forty",
        "her own company",
        "companies house",
      ],
      pivotal: true,
    },
    {
      ref: "D",
      name: "Check-out inventory photographs",
      detail:
        "Six photographs said to show the property at check-out. A grey two-seater sofa appears in three of them. That sofa was removed and replaced in January, four months before check-out.",
      aliases: [
        "inventory photographs",
        "the photographs",
        "check-out photos",
        "the inventory",
        "the sofa",
        "grey sofa",
      ],
      pivotal: true,
    },
    {
      ref: "E",
      name: "Re-letting advertisement",
      detail:
        "The flat was advertised three days after check-out at £180 per month above the previous rent. Let within a week.",
      aliases: [
        "re-letting",
        "the advertisement",
        "the new rent",
        "£180",
        "relet",
        "the new listing",
      ],
      pivotal: false,
    },
  ],

  witnesses: [
    {
      id: "bellhaven",
      name: "Iris Bellhaven",
      age: 58,
      occupation: "Landlord, six flats across two buildings",
      personality: "hostile",
      demeanour:
        "Arrived early. Has her own folder. Looks at the advocate rather than the judge.",
      publicStatement:
        "She sublet my flat without asking me. I attended the property and found an adult male living there who was not on the agreement, and I retained the deposit under clause 12, which is what clause 12 is for. If she had wanted permission she could have asked for it, in writing, like an adult.",

      hiddenFacts: [
        "She met the brother twice: on the stairs in March, and again when she came to read the meter in April. She knew who he was.",
        "On 14 March she texted the tenant referring to him, in her own words, as 'your brother'.",
        "She never sent a written refusal, because a refusal was never requested and she never treated it as a sublet at the time.",
        "The £340 cleaning invoice is from her own limited company. She is the sole director and the registered address is her house. No third-party cleaner attended.",
        "Three of the six check-out photographs are from the previous tenancy in 2023 — the grey sofa in them was taken to the tip in January.",
        "The flat was re-advertised three days after check-out at £180 a month more, and let inside a week. There was no void period and no cleaning gap.",
        "She has retained deposits in whole or in part from four of her last six tenants. None of them took it further.",
        "She does not think of this as dishonest. She thinks of it as the rent she should have been charging all along.",
      ],

      contradiction:
        "'An unknown adult, an unauthorised sublet, and a professional clean.' But she named him as the tenant's brother in her own text three weeks earlier, she never sent the written refusal clause 12 requires, the cleaner was her own company, and half the check-out photographs are of a sofa that had been at the tip since January.",

      crackConditions: [
        {
          id: "c1",
          label: "She knew he was the brother",
          establishedWhen:
            "The advocate gets her to accept she had met him, or to accept the 14 March text and the words in it. Getting her to read the message aloud counts.",
        },
        {
          id: "c2",
          label: "The cleaning invoice is her own company",
          establishedWhen:
            "The advocate gets her to accept she is the director of Bellhaven Property Services, or that no independent cleaner attended, or that the registered address is her home.",
        },
        {
          id: "c3",
          label: "The inventory photographs predate the tenancy",
          establishedWhen:
            "The advocate gets her to accept that some check-out photographs show the old sofa, or that they were taken before this tenancy, or that she cannot say when they were taken.",
        },
      ],

      crackResponse:
        "Yes, I knew who he was. Of course I knew who he was, I read the meter in that flat. Do you want me to say the rest of it? I invoiced the clean through my own company because it is my company and I am entitled to be paid for my own time, and I used the photographs I had. She was on a rent from four years ago and I had a flat I could get another hundred and eighty for, and clause 12 was the clause that was to hand.",
      crackDemeanour:
        "She closes the folder. She is not flustered — she is furious, and she has decided to stop pretending.",
    },
  ],

  difficulty: 4,

  winningThreads: [
    "The 14 March text. Her own words, in writing, three weeks before the 'discovery' of a stranger.",
    "Clause 12 cuts both ways: it required a written refusal within fourteen days, and she never sent one.",
    "The invoice from her own company — a deduction she paid to herself.",
    "The sofa. Three of the six check-out photographs cannot be of this check-out.",
  ],

  trapThreads: [
    "Fighting her. She is better at it than you and this panel dislikes a scrap — the vicar and the salon owner will mark you down for every exchange you lose your temper in.",
    "Open questions. 'Tell us what happened when you attended the property' hands her the floor, and she will use it.",
    "Attacking her for being a landlord. Two jurors here are self-employed and will hear it as an attack on themselves.",
    "Leading with the rent increase as proof of motive. It is suggestive, not probative, and claiming it as proof costs you with the sergeant.",
  ],

  jurorIds: ["j-vicar", "j-owner", "j-admin", "j-sergeant", "j-fundraiser"],
};
