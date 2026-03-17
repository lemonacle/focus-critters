# Focus Critters — Architecture

Focus Critters is structured as a modular JavaScript application.

The architecture separates responsibilities into core logic, UI rendering, and application coordination.

---

# Application Layers

The application follows a simple layered model:

```
UI modules
   ↓
app.js
   ↓
core systems
   ↓
storage
```

---

# File Structure

```
focus-critters/

index.html
styles.css

js/

  app.js

  core/
    timer.js
    storage.js
    nectar.js

  data/
    critters.js

  ui/
    shop.js
    collection.js
    runlog.js
    screens.js
```

---

# Core Systems

## timer.js

Responsible for:

- timer countdown
- focus/rest phase switching
- cycle-aware round progression
- timer state reporting
- skip behavior (sets current phase to 5 seconds remaining)

Timer durations are stored in seconds.

---

## storage.js

Handles all persistence.

Responsibilities:

- loading saved state
- merging saved state with default values
- saving state updates
- exporting/importing saves

Data is stored in:

```
localStorage
```

Key:

```
focusCrittersEmojiTestV1
```

---

## nectar.js

Handles game reward logic.

Responsibilities:

- awarding nectar for completed focus sessions
- tracking focus and rest run counts
- critter purchase validation
- updating owned critters

---

# UI Modules

UI modules are responsible only for rendering interface elements.

They do not contain gameplay logic.

---

## shop.js

Renders the Critter shop grid.

Displays:

- critter emoji
- name
- purchase button
- owned state

---

## collection.js

Displays the player’s owned critters.

Only critters that have been purchased appear here.

---

## runlog.js

Displays the most recent activity events including:

- focus completion
- rest completion
- critter purchases

---

## screens.js

Handles tab switching between:

- Shop
- Collection
- Run Log

---

# Application Coordinator

## app.js

`app.js` acts as the central controller.

Responsibilities include:

- initializing the application
- binding UI event listeners
- coordinating timer behavior
- managing cycle countdown logic
- synchronizing state with UI
- handling settings panel visibility
- persisting state updates

---

# Timer Flow

The timer operates as a state machine:

```
Focus
  ↓
Rest
  ↓
Cycle countdown
  ↓
Next focus
```

When `cyclesRemaining` reaches zero:

- the round ends
- cycle count resets to `cycleTarget`
- the timer returns to the focus phase

---

# State Model

The application state is stored as:

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

# Design Goals

This architecture prioritizes:

- small file sizes
- simple mental model
- easy refactoring
- minimal dependencies
- offline capability