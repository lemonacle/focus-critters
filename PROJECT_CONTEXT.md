# Focus Critters — Project Context

Focus Critters is a lightweight gamified focus timer built as a browser-based application.

The project combines a Pomodoro-style timer with simple resource collection and creature discovery mechanics.

The application is intentionally designed to be:

* lightweight
* offline-first
* modular
* fast to load
* easy to run on any device

---

# Core Gameplay Loop

1. User selects an action: Explore, Extract, or Expand
2. A focus timer begins
3. On completion, rewards are granted based on the action
4. The app transitions to a rest phase
5. Completing rest reduces remaining cycles
6. When cycles reach 0, the round resets
7. Progress is saved automatically

---

# Actions System

## Explore

* Primary progression mechanic
* Used to discover critters

## Extract

* Generates Nectar

## Expand

* Generates Materials

---

# Resources

## Nectar

* Earned through Extract
* Used for future progression systems

## Materials

* Earned through Expand
* Used for upgrades (planned)

---

# Critters

* 100 emoji-based critters
* Obtained through Explore
* Stored in owned collection

Future direction:

* duplicates allowed
* rarity tiers
* passive bonuses

---

# Timer System

* Focus + Rest loop
* Adjustable durations (5-minute steps)
* Adjustable cycle count
* Pause, Reset, Skip supported
* Skip sets timer to ~5 seconds remaining

---

# UI Flow

* Action buttons shown first
* Timer hidden until action is selected
* Timer controls shown dynamically

---

# State Model

{
nectar: number,
materials: number,
focusRuns: number,
restRuns: number,
owned: string[],
log: [
{
text: string,
time: string
}
],
focusDuration: number,
restDuration: number,
cycleTarget: number,
cyclesRemaining: number,
roundSettingsCollapsed: boolean
}

---

# Persistence

Stored using localStorage

Key:
focusCrittersEmojiTestV1

Includes:

* resources
* critters
* timer settings
* cycles
* UI state
* run log

---

# Current Focus

* action-based gameplay loop
* critter discovery system
* improving feedback clarity

---

# Planned Features

* critter passives
* rarity tiers
* upgrade systems
* Google Drive save slots
* PWA installability
* improved sound feedback
