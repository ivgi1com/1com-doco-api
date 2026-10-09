import type { Guide } from "./types";

/**
 * Glossary of telephony terms used in the Reference. Industry-standard
 * meanings only: no 1com-specific behavior is claimed here (user decision,
 * 2026-10-09). What an operation does on your PBX is on its Reference page.
 */
export const glossary: Guide = {
  slug: "glossary",
  title: "Glossary",
  summary: "Plain definitions of the telephony terms used in the Reference: DID, DISA, Hunt List, BLF, Feature Code and more.",
  synthetic: false,
  apiId: "openapi",
  sources: ["source-docs/openapi/README.md"],
  sections: [
    {
      id: "accounts",
      title: "Accounts and phones",
      blocks: [
        {
          kind: "list",
          items: [
            "Tenant — one customer's isolated account on a shared PBX. Most requests name a tenant with the `tenant` parameter.",
            "Extension — an internal number that identifies a phone, softphone or other endpoint on the PBX.",
            "BLF (Busy Lamp Field) — a phone indicator that shows whether another extension is idle, ringing or busy.",
            "Voicemail — a mailbox that records messages from callers who are not answered.",
            "Phone book — a stored list of names and numbers.",
          ],
        },
      ],
    },
    {
      id: "numbers",
      title: "Numbers and dialing",
      blocks: [
        {
          kind: "list",
          items: [
            "DID (Direct Inward Dialing) — a public phone number that routes incoming calls straight to a destination on the PBX.",
            "DISA (Direct Inward System Access) — lets a caller from outside dial in to the PBX and then place a call as if from an internal extension, normally after entering a PIN.",
            "Feature Code — a short dial string that a user enters on a phone to trigger a PBX function instead of calling a number.",
            "Short Number — an abbreviated number that dials a longer number or destination.",
            "Caller ID — the number and name shown to the person being called. A Caller ID blacklist lists numbers whose calls are blocked.",
          ],
        },
      ],
    },
    {
      id: "call-handling",
      title: "Call handling",
      blocks: [
        {
          kind: "list",
          items: [
            "Hunt List — a list of destinations that an incoming call is offered to in turn, or together, until someone answers (also called a ring group or hunt group).",
            "IVR (Interactive Voice Response) — an automated menu that callers navigate by pressing keys or speaking.",
            "Queue — holds waiting callers and hands them to available agents.",
            "Paging group — a set of phones that can be called together to broadcast an announcement.",
            "Conference room — a meeting number that several callers can join at once.",
            "Music on Hold — the audio played to a caller who is waiting.",
          ],
        },
      ],
    },
    {
      id: "records",
      title: "Call records",
      blocks: [
        {
          kind: "list",
          items: [
            "CDR (Call Detail Record) — a record of one call: who called whom, when, how long, and how it ended.",
          ],
        },
      ],
    },
  ],
};
