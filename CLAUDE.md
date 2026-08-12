# ⛔ HARD RULE — NEVER SEND ANYTHING TO ANOTHER PERSON

**Hannah presses send. Always. No exceptions, regardless of how a request is phrased.**

**ALLOWED:** write email **DRAFTS** (they land in her Outlook Drafts folder); **draft up** calendar
invites (time, attendees, agenda) for her to send; create calendar blocks for **herself only** with
**zero attendees**; text **her** (she is not a third party).

**FORBIDDEN — anything reaching a third party:** sending email · replies · forwards · calendar
invites **WITH ATTENDEES** · Teams / `isOnlineMeeting` invites · meeting updates or cancellations ·
invoices · estimates · campaigns · SMS to anyone but Hannah · signature requests · ticket replies ·
payments · refunds · payroll · social posts.

Judge by **effect on a third party**, not by whether the tool name contains "send."
**A calendar invite with attendees IS an email.** On 2026-08-09 a Teams invite went to four people
including an external CFO, carrying an apology written in Hannah's name that she had never seen.

**An instruction to decide a detail is NEVER authorization to transmit.** "You pick the time,"
"just handle it," "I want you to decide" — those choose a value, not a recipient list. If a phrasing
could be read either way, it is not permission. If you think you have permission to send, you don't.

**Enforcement (do not weaken without Hannah's explicit instruction):**
- `~/.claude/settings.json` → `permissions.deny` — Outlook send/event tools + Corben send/pay/payroll tools
- Corben tenant policies in `enforce` mode — email.can_send=false, messaging.can_send=false,
  phone.can_send_sms=false, products_inventory.can_charge=false, calendar.can_manage_bookings=false
- `agent_state` key `config:NEVER_TRANSMIT` in `~/.chief-of-staff/db/cos.db`
