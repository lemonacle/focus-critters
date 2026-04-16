# Focus Critters

Focus Critters is a lightweight gamified focus timer that turns productivity into a simple progression system.

Instead of just starting a timer, users choose actions that drive different outcomes.

---

# Core Idea

You don’t just “focus.”

You:

* Explore → discover critters
* Extract → earn nectar
* Expand → gather materials

---

# Features

## Action-Based Timer

* Explore
* Extract
* Expand

Each action starts a focus session and produces different rewards.

---

## Timer System

* Focus + Rest loop
* Adjustable durations
* Adjustable cycles
* Pause, Reset, Skip

---

## Resources

* Nectar
* Materials

---

## Critter Collection

* 100 emoji critters
* Found via Explore
* Stored in your Stable

---

## Run Log

Tracks:

* actions completed
* rest cycles

---

## Persistent Save

Uses localStorage
No backend required

---

# Running the Project

Requires a local server due to ES modules.

Recommended:

* VS Code
* Live Server

Run:
index.html → Open with Live Server

---

# Project Structure

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

# Design Goals

* lightweight
* fast
* modular
* easy to modify

---

# Development Notes

Recent changes:

* removed shop system
* added action-based gameplay
* introduced materials resource

---

# Future Direction

* critter passives
* progression upgrades
* PWA install
* cloud saves

---

# License

Experimental project under active development.
