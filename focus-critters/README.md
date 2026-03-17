Focus Critters

Focus Critters is a lightweight gamified Pomodoro timer built as a browser app.
Users complete focus sessions to earn Nectar, which can be spent to collect emoji-based Critters.

The project is designed to remain small, fast, and modular, with the long-term goal of becoming a progressive web app (PWA) with optional cloud save support.

Current Features
Timer
Focus session: 25 minutes
Rest session: 5 minutes

Timer adjustments:
Focus duration adjustable in 5-minute increments  
Rest duration adjustable in 5-minute increments  
Cycle count adjustable by 1

Timer supports:
Start
Pause
Reset
Skip (sets the current timer to 5 seconds remaining)

Reward Loop

Completing a focus session grants +10 Nectar

Nectar can be spent to buy critters

Critter Collection

100 collectible emoji critters

Each critter costs 10 Nectar

Purchased critters appear in the Collection tab

Run Log

Records recent activity such as:

focus completions

rest cycles

critter purchases

Persistent Save

Game state is saved using localStorage.

Save key:

focusCrittersEmojiTestV1
Development Environment

The project must be run through a local server because ES modules are used.

Recommended setup:

VS Code

Live Server extension

Start the app by right-clicking:

index.html → Open with Live Server
Project Architecture

The project intentionally separates responsibilities into small modules.

focus-critters/
│
│  index.html
│  styles.css
│
├─ js/
│  │
│  │  app.js                # main controller / startup
│  │
│  ├─ core/
│  │     timer.js           # pomodoro timer logic
│  │     nectar.js          # reward logic (nectar earned)
│  │     storage.js         # localStorage save/load
│  │
│  ├─ data/
│  │     critters.js        # list of 100 emoji creatures
│  │
│  ├─ ui/
│  │     screens.js         # navigation between screens
│  │     shop.js            # shop UI logic
│  │     collection.js      # collection UI logic
│  │     runlog.js          # focus session log
│  │
│  └─ integrations/
│        gdrive.js          # Google Drive save slots (planned)
│
├─ assets/
│  ├─ icons/
│  │     icon-192.png
│  │     icon-512.png
│  │
│  └─ critters/             # future art upgrades if emojis replaced
│
├─ pwa/
│     manifest.json
│     service-worker.js
│
└─ README.md
Module Responsibilities
app.js

Main application controller.

Responsibilities:

Initialize state

Bind UI events

Connect timer events to game logic

Coordinate UI updates

This file is the central integration point for the application.

core/timer.js

Handles the timer state machine.

Tracks:

focus/rest mode

time remaining

timer intervals

Exports:

startTimer

pauseTimer

resetCurrentTimer

skipPhase

formatTime

getTimerState

Timer logic does not update UI directly.

core/nectar.js

Handles reward and purchase logic.

Responsibilities:

apply focus rewards

track rest completions

validate critter purchases

update state

UI messaging is handled by app.js.

core/storage.js

Manages save persistence.

Responsibilities:

load state from localStorage

save state

reset state

export/import save data

Designed so cloud saves can be layered on top later.

data/critters.js

Contains the full critter list.

Each critter has:

name
emoji

Future expansions may include:

rarity
type
animation
ui/shop.js

Renders the critter shop.

Responsibilities:

generate critter cards

show ownership status

trigger purchase callbacks

ui/collection.js

Displays owned critters.

Filters the critter list based on:

state.owned
ui/runlog.js

Displays the activity log.

Each log entry includes:

text
timestamp

Maximum stored entries: 30

ui/screens.js

Handles tab navigation between:

Shop

Collection

Run Log

Game State Structure

The saved game state currently looks like:

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
Design Goals

The project aims to remain:

lightweight

easy to understand

modular

AI-friendly for iteration

Architecture choices favor:

small files

clear module boundaries

minimal dependencies

browser-native APIs

Current Development Priorities

Google Drive save slots

PWA installability

Improved reward feedback

Additional critter mechanics

Planned Features
Cloud Saves

Integration with Google Drive API.

Goals:

optional login

multiple save slots

cross-device progress

PWA Support

Allow the app to be installed on phones and desktops.

Components already scaffolded:

pwa/manifest.json
pwa/service-worker.js
Gameplay Expansion Ideas

Possible future systems:

critter rarity tiers

random shop rotation

unlock animations

daily rewards

achievements

sound effects

statistics dashboard

Development Notes for AI Collaboration

This README exists to provide sufficient project context when starting a new conversation with an AI assistant.

When requesting help:

Provide:

file path
file contents
goal of change

Example:

File: js/core/timer.js

Goal:
Persist timer progress if the page refreshes.

This allows the AI to modify only the relevant code without needing the entire project pasted.

License

This project is currently experimental and under active development.