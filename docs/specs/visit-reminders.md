# Visit reminders

## Purpose

Front-desk staff need to see which of an owner's visits are coming up, so they can call ahead the
week before and cut the no-show rate. The owner record already lists every visit ever booked, which
is too much to scan at a glance.

## What a reminder is

A reminder is a visit belonging to one of the owner's pets that has not happened yet.

Reminders are read-only. Nothing is stored, emailed or marked as sent; the list is derived from the
visits already on record each time it is asked for.

## Which visits appear

A visit appears as a reminder when **both** of these hold:

1. Its date is today or later. A visit that has already happened is history, not a reminder.
2. Its date is **no more than 14 days away**. A visit further out than a fortnight is real, but it
   is not yet actionable for the front desk — staff call the week before, and a list that reaches
   months ahead is the same wall of text the owner record already gives them.

A visit exactly 14 days away is included. A visit 15 days away is not.

## Ordering

Soonest first, so the visit that needs a call today is at the top.

## Empty state

An owner with no visits in the window has no reminders. That is an ordinary outcome, not an error —
the response is an empty list, and the screen says there is nothing coming up.

## Out of scope

Reminders for a whole clinic day, reminders by vet, and any form of notification delivery. This is
one owner's upcoming visits and nothing else.
