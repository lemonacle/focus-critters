# Focus Critters — Architecture

Focus Critters is a modular browser-based JavaScript application.

---

# High-Level Structure

UI Modules
↓
app.js (controller)
↓
Core Systems
↓
Storage

---

# File Structure

focus-critters/

index.html
styles.css

js/
app.js
core/
timer.js
storage.js
data/
critters.js
ui/
collection.js
runlog.js
screens.js

---

# Core Systems

## timer.js

* countdown logic
* focus/rest switching
* cycle tracking
* skip behavior

## storage.js

* load state
* save state
* persistence via localStorage

Key:
focusCrittersEmojiTestV1

---

# UI Modules

## collection.js

* renders owned critters

## runlog.js

* renders activity log 

## screens.js

* handles tab switching 

---

# Application Controller

## app.js

Central coordinator responsible for:

* initializing state
* handling action selection
* controlling timer
* applying rewards
* updating UI
* saving state

---

# UI Flow

From index.html :

1. User selects action
2. Timer panel appears
3. Timer runs
4. Controls update dynamically
5. Rewards applied on completion

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

# Timer State Machine

Action → Rest → Cycle Countdown → Next Action

When cycles reach 0:

* round resets
* cycles restore

---

# Design Principles

* no frameworks
* minimal dependencies
* clear separation
* small modules

---

# Recent Changes

* replaced start button with actions
* removed shop system
* added materials resource
* shifted to discovery model

---

# Future Architecture

* critter modifiers
* reward pipelines
* cloud save layer
* service worker support
