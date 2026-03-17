# Focus Critters — Project Context

Focus Critters is a lightweight gamified Pomodoro-style focus timer.

The goal of the project is to create a simple productivity tool that rewards completed focus sessions with collectible emoji-based creatures.

The application is intentionally designed to be:

- lightweight
- offline-first
- installable as a PWA
- modular for easy iteration

---

# Core Gameplay Loop

1. User starts a focus session
2. Timer counts down
3. Completing focus grants **+10 Nectar**
4. The timer automatically proceeds to the rest session
5. Completing rest advances the cycle count
6. When all cycles complete, the round resets to the user’s saved cycle preference
7. Nectar can be spent in the shop
8. Purchased Critters appear in the Collection
9. Activity appears in the Run Log
10. Game state and timer preferences persist via localStorage

---

# Current Default Values

Focus duration: **25 minutes**

Rest duration: **5 minutes**

Timer adjustment step: **5 minutes**

Cycle adjustment step: **1**

Critter cost: **10 Nectar**

---

# Timer System

The timer supports:

- configurable focus duration
- configurable rest duration
- automatic focus → rest progression
- configurable cycle count
- cycle countdown tracking
- skip behavior that sets the current timer to **5 seconds remaining**

Timer durations are stored in seconds internally.

---

# Settings Panel

The "Round Settings" panel allows the user to configure:

- focus duration
- rest duration
- cycle count

The panel is collapsible and the collapsed state is persisted.

---

# Game State Model

The application stores the following state in localStorage:

```
{
  nectar: number,
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
```

---

# Critters

There are currently **100 emoji critters** available.

Each critter:

- costs **10 Nectar**
- can only be purchased once
- appears in the collection after purchase

---

# Data Persistence

All progress is saved using:

```
localStorage
```

Key:

```
focusCrittersEmojiTestV1
```

This includes:

- nectar balance
- owned critters
- run log
- timer settings
- cycle settings
- UI state

---

# Planned Features

Future improvements being considered:

- Google Drive save slots
- PWA installation
- daily streak system
- critter rarity tiers
- shop rotation system
- sound cues
- small animations