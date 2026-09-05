/* ─────────────────────────────────────────────────────────────
   Specsmith — app-build prompt generator
   Idea in → intelligent interpretation → finished build prompt.
   ───────────────────────────────────────────────────────────── */

"use strict";

/* ── Storage keys ───────────────────────────────────────── */

const LS_HISTORY = "specsmith.history.v2";
const LS_LAST = "specsmith.last.v2";
const LS_THEME = "specsmith.theme.v1";

/* ── Shared prompt blocks ───────────────────────────────── */

const INTERACTION = [
  "Every visible control responds immediately and performs its stated action.",
  "Use purposeful restrained transitions for navigation and state changes; avoid decorative motion that slows the task.",
  "Preserve user-entered and active state through normal navigation where the product requires it.",
  "Design empty, loading, completed, saved, edited, disabled, and error states only where relevant.",
];

const BUILD =
  "Deliver one self-contained index.html with inline HTML, CSS, and JavaScript. No build step, no " +
  "frameworks, no external CDNs. Navigation is state-driven (JavaScript shows/hides screen elements — no " +
  "page reloads). Mobile-first and fully polished at 360–430 px portrait.";

/* ── Domain profiles ────────────────────────────────────── */

const DOMAINS = [
  {
    id: "habit",
    match: /\bhabits?\b|\bstreaks?\b|\brituals?\b|\bdaily (?:log|check|habits?|check-?ins?)\b/i,
    hint: /\broutines?\b|\bcheck-?ins?\b|\bconsisten(?:t|cy)\b|\bevery ?day\b/i,
    name: "Ritual",
    purpose: "help one person build and keep daily habits with a low-friction check-in and satisfying streaks",
    user: "a single user building routines — no accounts, no social feed, judgment-free",
    workflow: "open the app → see today's habits → tap one to mark it done → watch the day's progress and streaks update instantly → add or edit habits as life changes",
    screens: [
      ["Today", "today's date, the day's habits with large tap-to-complete controls, a 7-day strip, and an overall daily progress ring"],
      ["Habit detail", "one habit's stats — current and longest streak, completion history by week, edit and delete"],
      ["Add / edit", "name, emoji or icon, weekly target, and a reminder toggle"],
      ["Settings", "light/dark theme, notifications, export and clear data"],
    ],
    features: [
      "Tap to mark a habit done or undone for today",
      "Current + longest streak, with a celebration when a milestone is hit",
      "7-day week strip for at-a-glance consistency",
      "Add, edit, and delete habits with inline validation",
    ],
    logic: [
      "Completion is keyed by calendar date, not a boolean — each day resets",
      "Streaks break only on a genuinely missed day; honor a custom weekly target (e.g. “4× a week”)",
      "Days roll over at local midnight; past days become read-only",
      "Milestones (7, 30, 100) trigger a short celebratory animation",
    ],
    persistence: "Habits and history in localStorage; seed 3 sample habits on first run",
  },
  {
    id: "todo",
    match: /\bto-?dos?\b|\bto do list\b|\btasks?\b|\bchecklists?\b|\berrands?\b|\bchores?\b/i,
    hint: /\bpriorit(?:y|ies)\b|\bdue dates?\b|\bdone\b/i,
    name: "Taskline",
    purpose: "capture and clear tasks with the least possible friction",
    user: "one busy person who wants a fast, focused list — no accounts, no clutter",
    workflow: "open → see tasks grouped by state → add a task with one tap → check it off → filter or reorder as needed",
    screens: [
      ["Today", "the task list grouped into Today / Upcoming / Done, a quick-add bar, and inline checkboxes"],
      ["Upcoming", "tasks scheduled for later dates"],
      ["Add / edit", "title, due date, priority, and an optional note"],
      ["Settings", "theme, sort order, clear completed"],
    ],
    features: [
      "One-tap add with an inline input at the top",
      "Check off / uncheck with a satisfying animation",
      "Filter (all / active / done) and sort by due date or priority",
      "Edit, delete, and reorder tasks",
    ],
    logic: [
      "Completed tasks move to a Done section and can be restored",
      "Tasks due today highlight; overdue dates turn a warning color",
      "An empty state prompts the first task — no blank screens",
    ],
    persistence: "Tasks in localStorage; seed a few sample tasks on first run",
  },
  {
    id: "notes",
    match: /\bnotes?\b|\bnotebooks?\b|\bnote-?taking\b|\bjournal(?:ing|s)?\b|\bdiar(?:y|ies)\b|\bmemos?\b/i,
    hint: /\bthoughts?\b|\bwriting\b|\breflections?\b|\bentries\b/i,
    name: "Daynote",
    purpose: "capture notes and journal entries quickly, and find them again easily",
    user: "one person capturing ideas, thoughts, and daily reflections privately",
    workflow: "open → see recent notes → write a new note → search and pin the ones that matter",
    screens: [
      ["Home", "notes (newest first) with search and a pinned section"],
      ["Editor", "full-screen writing with a title + body that auto-saves"],
      ["Note view", "formatted read view with edit and delete"],
      ["Settings", "theme, font size, export and clear data"],
    ],
    features: [
      "Create and edit notes with auto-save as you type",
      "Full-text search across titles and bodies",
      "Pin important notes to the top",
      "Word count and last-edited timestamps",
    ],
    logic: [
      "Drafts persist continuously — there is no manual save step",
      "Pinned notes sort above unpinned",
      "Deleting asks for confirmation (no undo)",
    ],
    persistence: "Notes in localStorage; seed 2 sample notes on first run",
  },
  {
    id: "expense",
    match: /\bexpenses?\b|\bbudget(?:s|ing)?\b|\bfinanc(?:e|es|ial)\b|\bmoney\b|\bspend(?:ing|s)?\b|\breceipts?\b|\bbills?\b|\bsavings\b|\bsettle[- ]?up\b|\bsplit(?:ter|ting)? (?:the )?(?:bill|costs?|expenses?|rent)\b/i,
    hint: /\bcosts?\b|\bsplit(?:s|ting|ter)?\b|\bowes?\b|\bpaid\b|\bprices?\b|\bpurchases?\b|\bcurrency\b|\binvoices?\b/i,
    name: "Spendly",
    purpose: "track spending and split shared costs so money never gets awkward",
    user: "an individual — or a small group splitting shared expenses — who wants clarity with minimal data entry",
    workflow: "open → see this month's totals → add an expense in seconds → split it among people → see who owes whom",
    screens: [
      ["Overview", "month total, spending by category, a simple bar chart, and recent activity"],
      ["Add expense", "amount, category, an optional note, and people to split with"],
      ["Balances", "who owes whom, with a settle-up suggestion"],
      ["Settings", "currency, monthly budget, export and clear data"],
    ],
    features: [
      "Fast-add with amount, category, and an optional note",
      "Category breakdown with a simple chart",
      "Split an expense evenly across people and track balances",
      "Monthly budget with a soft warning when near the limit",
    ],
    logic: [
      "Amounts are always positive; category defaults to “Other”",
      "Splits divide evenly with cent-rounding; the leftover cent goes to the first person",
      "Totals are computed live, never stored as a single number",
    ],
    persistence: "Expenses in localStorage; seed a small sample month on first run",
  },
  {
    id: "timesheet",
    match: /\btime ?sheets?\b|\btime[- ]?track(?:ing|er)\b|\bclock(?:ing)?[- ]?(?:in|out)\b|\bbillable hours?\b|\bwork(?:ed|ing)? hours\b|\bhours? (?:log|tracker|worked)\b|\bshift (?:log|tracker)\b/i,
    hint: /\bhours?\b|\bprojects?\b|\bclients?\b|\bweekly\b|\bovertime\b|\binvoic(?:e|es|ing)\b|\bbillable\b|\bshifts?\b|\bpay(?:roll)?\b|\bfreelanc(?:e|er|ers|ing)\b|\bwork\b/i,
    name: "Timesheet",
    purpose: "log working hours accurately with minimal effort and turn them into clear weekly totals",
    user: "a freelancer, contractor, or shift worker who needs a trustworthy record of time worked — no team admin, no approvals",
    workflow: "open → tap clock in → work → tap clock out (or add hours manually) → review the day and week → export a summary when it's time to bill or report",
    screens: [
      ["Today", "a large clock-in / clock-out control, the running entry with elapsed time, and today's entries tagged by project"],
      ["Week", "a day-by-day bar of hours worked against a weekly target, per-project totals, and an editable list of the week's entries"],
      ["Projects", "projects or clients with a color, an optional hourly rate, and lifetime hours"],
      ["Settings", "weekly target, week start day, rounding rule, currency, export and clear data"],
    ],
    features: [
      "One-tap clock in / clock out with a live elapsed readout",
      "Manual entries with start, end, project, and an optional note",
      "Weekly summary with per-project totals and progress toward a target",
      "Export the week as CSV or a copyable text summary",
    ],
    logic: [
      "Entries store start and end timestamps; durations are always derived, never stored",
      "A running entry survives a page reload and can never overlap another entry",
      "Rounding (none / 6 / 15 minutes) applies only to displayed totals, never to raw timestamps",
      "Weeks start on the configured day; the current week is highlighted",
    ],
    persistence: "Entries and projects in localStorage; seed two projects and a sample week on first run",
  },
  {
    id: "timer",
    match: /\btimers?\b|\bpomodoro\b|\bstopwatch\b|\bfocus (?:timer|sessions?|mode|app)\b|\bdeep work\b|\btime-?boxing\b/i,
    hint: /\bfocus\b|\bproductivity\b|\bwork (?:sessions?|intervals?)\b|\bbreaks?\b|\bsessions?\b|\bdistractions?\b|\bconcentrat(?:e|ion)\b/i,
    name: "Focus",
    purpose: "structure focused work into timed sessions with breaks",
    user: "one person who wants to stay on task without fiddling with settings",
    workflow: "open → pick a focus length → start → work until the timer ends → take a break → repeat",
    screens: [
      ["Timer", "a large circular countdown, start/pause/reset, and the current session type"],
      ["Sessions", "today's completed sessions and total focus time"],
      ["Settings", "focus length, break length, long-break interval, and theme"],
    ],
    features: [
      "Start / pause / reset with large, obvious controls",
      "Automatic switch between focus and break, with a sound + visual cue",
      "Long break every 4 sessions",
      "Track daily completed sessions and total focus time",
    ],
    logic: [
      "The timer is accurate to the second using timestamps, not a naive countdown",
      "When a session ends, show a brief transition screen before the break starts",
      "A running timer survives a page reload",
    ],
    persistence: "Settings and session history in localStorage",
  },
  {
    id: "flashcards",
    match: /\bflash ?cards?\b|\bquiz(?:zes)?\b|\bmemoriz(?:e|ation|ing)\b|\bvocab(?:ulary)?\b|\btest prep\b|\brevision\b|\bspaced repetition\b|\bstudy (?:cards|deck|sets?|guide)\b|\blearn(?:ing)? (?:a |an |new )?(?:language|words|phrases)\b/i,
    hint: /\blearn(?:ing|er)?\b|\bstudy(?:ing)?\b|\blessons?\b|\breview\b|\bpractice\b/i,
    name: "Recall",
    purpose: "learn anything with flashcards and honest self-grading",
    user: "a student or self-learner reviewing material in short bursts",
    workflow: "open → pick a deck → flip through cards → self-grade → review the ones you missed",
    screens: [
      ["Decks", "a list of decks with card counts and mastery progress"],
      ["Study", "one card at a time — tap to flip, then self-grade Hard / Good / Easy"],
      ["Add / edit cards", "front, back, and an optional hint"],
      ["Results", "session summary with the missed cards queued for review"],
    ],
    features: [
      "Tap to flip cards with a smooth flip animation",
      "Self-grade each card; missed cards come back until you get them",
      "Create, edit, and delete decks and cards",
      "Session results with accuracy and time",
    ],
    logic: [
      "Shuffle the deck each session; missed cards re-queue at the end",
      "Grades update a simple mastery meter per card",
      "Empty decks show a prompt to add the first card",
    ],
    persistence: "Decks and cards in localStorage; seed one sample deck on first run",
  },
  {
    id: "workout",
    match: /\bworkouts?\b|\bfitness\b|\bexercises?\b|\bgym\b|\bhiit\b|\breps?\b|\bstrength training\b|\bweight ?lifting\b|\bcardio\b|\bstretch(?:ing|es)?\b|\byoga\b|\brunning (?:log|tracker|app|plan)\b|\bjogging\b/i,
    hint: /\brunn(?:ing|er)s?\b|\bstrength\b|\bsets\b|\bmuscles?\b|\btraining\b/i,
    name: "Reps",
    purpose: "plan and log workouts so progress is visible",
    user: "one person training alone who wants a simple routine and a log, not a social network",
    workflow: "open → pick today's workout → log sets and reps as you go → see history and progress",
    screens: [
      ["Today", "the planned workout with exercises, sets, and a rest timer"],
      ["Exercise log", "set-by-set entry with weight and reps"],
      ["History", "past workouts and personal records"],
      ["Settings", "rest time, units (kg/lb), and theme"],
    ],
    features: [
      "Pre-built routine with exercises and target sets/reps",
      "Log weight and reps per set with quick +/− steppers",
      "Rest timer between sets",
      "Personal records highlighted automatically",
    ],
    logic: [
      "A new personal record is flagged in the log and history",
      "The rest timer counts down automatically after a set is logged",
      "Progress is stored per exercise for a trend view",
    ],
    persistence: "Workouts in localStorage; seed a sample routine on first run",
  },
  {
    id: "recipe",
    match: /\brecipes?\b|\bcook(?:ing|book)?\b|\bmeals?\b|\bmeal[- ]?(?:plan|planner|planning|prep)\b|\bdinners?\b|\blunch(?:es)?\b|\bbreakfasts?\b|\bingredients?\b|\bkitchen\b|\bfoods?\b|\bleftovers?\b/i,
    hint: /\bdishes\b|\bservings?\b|\bcalories\b|\bdiet\b/i,
    name: "Cookbook",
    purpose: "keep recipes organized and cook them without a fuss",
    user: "a home cook who wants favorites and a shopping list at a glance",
    workflow: "open → browse saved recipes → open one → follow step-by-step → add missing ingredients to a shopping list",
    screens: [
      ["Recipes", "a grid of saved recipes with search and category filters"],
      ["Recipe detail", "ingredients, steps, and an “add to list” action"],
      ["Shopping list", "ingredients grouped by category with check-off"],
      ["Add / edit", "name, ingredients, steps, and category"],
    ],
    features: [
      "Save, edit, and search recipes",
      "Step-by-step cooking view with large, readable steps",
      "One-tap add ingredients to a shopping list",
      "Check off shopping items as you go",
    ],
    logic: [
      "The shopping list merges duplicate ingredients (summing quantities)",
      "Recipe steps stay in order and render as a numbered list",
      "Empty states offer a starter recipe",
    ],
    persistence: "Recipes in localStorage; seed 2 sample recipes on first run",
  },
  {
    id: "shopping",
    match: /\bshopping\b|\bgrocer(?:y|ies)\b|\bsupermarket\b|\bstore list\b|\bmarket list\b|\bwish ?list\b/i,
    hint: /\bbuy(?:ing)?\b|\bbought\b|\bpurchases?\b|\baisles?\b|\bcart\b|\brestock(?:ing)?\b/i,
    name: "Basket",
    purpose: "make a shopping list that is easy to check off while shopping",
    user: "one person (or a household) coordinating groceries",
    workflow: "open → add items → check them off while shopping → see what's left",
    screens: [
      ["List", "items grouped by aisle/category with tap-to-check"],
      ["Add item", "name, quantity, and category"],
      ["History", "previously bought items to re-add in one tap"],
      ["Settings", "categories, theme, clear list"],
    ],
    features: [
      "Quick add with autocomplete from past items",
      "Tap to check off with a strikethrough",
      "Group by category (produce, dairy, pantry…)",
      "Re-add frequent items from history",
    ],
    logic: [
      "Duplicate items merge their quantities",
      "Checked items move to a Done section at the bottom",
      "An empty list prompts the first item",
    ],
    persistence: "The list in localStorage; seed a small sample list on first run",
  },
  {
    id: "water",
    match: /\bwater\b|\bhydrat(?:e|ion|ing)\b|\bdrink (?:log|tracker|water|more)\b|\bfluid intake\b/i,
    hint: /\bglasses\b|\bounces\b|\bml\b|\bthirst/i,
    name: "Hydrate",
    purpose: "track daily water intake with minimal taps",
    user: "one person building a hydration habit",
    workflow: "open → see today's progress toward a goal → tap to add a glass → adjust the goal as needed",
    screens: [
      ["Today", "a large progress ring, an add-glass button, and today's log"],
      ["History", "the past week's daily totals"],
      ["Settings", "daily goal, glass size, reminder toggle, and theme"],
    ],
    features: [
      "One-tap add with a configurable glass size",
      "Progress ring toward a daily goal",
      "Weekly history",
      "Gentle reminders (if enabled)",
    ],
    logic: [
      "Goal defaults to 8 glasses; glass size defaults to 250 ml",
      "Progress resets each calendar day",
      "Adding is one tap; undoing is one tap",
    ],
    persistence: "Goal and history in localStorage",
  },
  {
    id: "sleep",
    match: /\bsleep(?:ing)?\b|\bbedtime\b|\bnaps?\b|\binsomnia\b|\bslumber\b|\bwake[- ]?up\b/i,
    hint: /\bwake\b|\brest(?:ed|ful)?\b|\bdreams?\b|\bmorning\b|\bnight\b/i,
    name: "Slumber",
    purpose: "track sleep duration and spot patterns",
    user: "one person improving sleep, not obsessing over it",
    workflow: "open → log bedtime and wake time → see duration and a weekly average",
    screens: [
      ["Today", "last night's duration, quality, and a log button"],
      ["History", "weekly chart of duration and averages"],
      ["Settings", "sleep goal, reminders, and theme"],
    ],
    features: [
      "Log sleep with a simple start/end time picker",
      "Weekly duration chart and average",
      "Sleep-goal ring",
      "Edit past entries",
    ],
    logic: [
      "Duration accounts for crossing midnight",
      "Averages use the last 7 completed nights",
      "A gentle note when sleep is short — never shaming",
    ],
    persistence: "Sleep entries in localStorage; seed 3 sample nights on first run",
  },
  {
    id: "reading",
    match: /\bbooks?\b|\breading\b|\bbookshelf\b|\bshelf\b|\bkindle\b|\baudiobooks?\b|\bnovels?\b|\be-?books?\b|\bbook ?list\b/i,
    hint: /\bread\b|\blibrary\b|\bpages?\b|\bchapters?\b|\bauthors?\b/i,
    name: "Shelf",
    purpose: "track what you're reading and what you want to read next",
    user: "a reader managing a personal queue of books",
    workflow: "open → see the current book with progress → update pages read → browse a wishlist",
    screens: [
      ["Reading now", "the current book with a progress bar and a one-tap page update"],
      ["Library", "want-to-read and finished shelves"],
      ["Book detail", "cover, progress, notes, and move-to-finished"],
      ["Add book", "title, author, and a generated cover color"],
    ],
    features: [
      "Update progress in one tap (pages or percent)",
      "Shelves: reading / want-to-read / finished",
      "Reading notes per book",
      "A subtle “finished!” celebration",
    ],
    logic: [
      "Progress is a percent; finishing updates the shelf automatically",
      "Books sort by recently updated",
      "The cover uses a generated color when no image is provided",
    ],
    persistence: "Books in localStorage; seed 2 sample books on first run",
  },
  {
    id: "chat",
    match: /\bchats?\b|\bchatroom\b|\bmessag(?:e|es|ing|er|enger)\b|\bconversations?\b|\bdms?\b|\binbox\b/i,
    hint: /\bthreads?\b|\brepl(?:y|ies)\b|\bcontacts?\b/i,
    name: "Thread",
    purpose: "a clean local chat with realistic conversation flow",
    user: "people exchanging messages in threaded conversations",
    workflow: "open → pick a conversation → read and send messages → see replies appear",
    screens: [
      ["Inbox", "conversation list with previews and unread badges"],
      ["Chat", "message bubbles, an input bar, and a send button"],
      ["Contacts", "people you can start a conversation with"],
      ["Settings", "theme, profile name, clear conversations"],
    ],
    features: [
      "Message bubbles with timestamps and delivered/read state",
      "Send messages and receive scripted replies (simulated)",
      "Unread badges on the inbox",
      "Start new conversations from contacts",
    ],
    logic: [
      "Simulated replies fire after a short, realistic delay",
      "Messages append at the bottom and auto-scroll",
      "An empty conversation shows a friendly prompt",
    ],
    persistence: "Conversations in localStorage; seed one sample conversation on first run",
  },
  {
    id: "weather",
    match: /\bweather\b|\bforecasts?\b|\bclimate\b|\bskycast\b|\brain(?:y|fall)?\b|\bumbrella\b/i,
    hint: /\btemperatures?\b|\bsky\b|\bsunny\b|\bhumidity\b|\bwind\b|\boutdoors?\b/i,
    name: "Skycast",
    purpose: "show the weather at a glance with an honest, elegant presentation",
    user: "one person checking today's conditions and the week ahead",
    workflow: "open → see current conditions and today's forecast → scroll for the week → switch locations",
    screens: [
      ["Now", "current conditions, temperature, and today's hourly forecast"],
      ["Week", "7-day forecast with icons and high/low"],
      ["Locations", "saved places with search and add"],
      ["Settings", "units (°C/°F) and theme"],
    ],
    features: [
      "Current conditions with a large temperature and condition icon",
      "Hourly and 7-day forecast",
      "Multiple saved locations",
      "Celsius/Fahrenheit toggle",
    ],
    logic: [
      "Uses generated sample data when no API key is present (clearly labeled)",
      "The units toggle converts display, not stored data",
      "Defaults to a saved or sample location",
    ],
    persistence: "Locations and preferences in localStorage; seed one sample location",
  },
  {
    id: "music",
    match: /\bmusic\b|\bplaylists?\b|\bsongs?\b|\balbums?\b|\bmixtapes?\b|\bdj\b|\bnow playing\b|\bpodcasts?\b|\baudio player\b/i,
    hint: /\btracks?\b|\bartists?\b|\bplayer\b|\blisten(?:ing)?\b|\baudio\b/i,
    name: "Mix",
    purpose: "curate playlists and enjoy a clean now-playing experience",
    user: "a listener who wants a tidy library, not a storefront",
    workflow: "open → browse playlists → play a track → see a now-playing bar with controls",
    screens: [
      ["Library", "playlists and albums as cards"],
      ["Playlist", "track list with play and add-to-queue"],
      ["Now playing", "large artwork, progress, and play/pause/skip"],
      ["Settings", "theme and default sort"],
    ],
    features: [
      "Play/pause/skip with a persistent now-playing bar",
      "Track progress and seeking",
      "Create and edit playlists",
      "Shuffle toggle",
    ],
    logic: [
      "Playback is simulated (no real audio required); progress advances on a timer",
      "The now-playing bar persists across screens",
      "Tracks use a generated artwork color when no image is present",
    ],
    persistence: "Playlists in localStorage; seed one sample playlist",
  },
  {
    id: "events",
    match: /\bcountdowns?\b|\bevents?\b|\bbirthdays?\b|\banniversar(?:y|ies)\b|\bholidays?\b|\bcelebrations?\b|\bdeadlines?\b|\bimportant dates\b|\bdays (?:until|left|to go)\b/i,
    hint: /\bupcoming\b|\bdates?\b|\bcalendar\b|\bmilestones?\b|\boccasions?\b/i,
    name: "Countdown",
    purpose: "count down to the moments that matter",
    user: "one person tracking upcoming events and milestones",
    workflow: "open → see the next event front and center → add events → watch the days tick down",
    screens: [
      ["Next up", "the nearest event with a large live countdown (days / hours / minutes)"],
      ["Events", "all upcoming events, sorted soonest first"],
      ["Add / edit", "title, date, optional emoji, and color"],
      ["Settings", "theme and hide-past-events"],
    ],
    features: [
      "Live countdown to the next event",
      "Add events with a date picker, emoji, and color",
      "Sort by soonest; past events dim and auto-archive",
      "A celebration when a countdown hits zero",
    ],
    logic: [
      "The countdown computes from the current time and updates every second",
      "Past events move to an archive, not deleted",
      "Each event has a color accent",
    ],
    persistence: "Events in localStorage; seed 2 sample events on first run",
  },
  {
    id: "gratitude",
    match: /\bgratitude\b|\bgrateful\b|\baffirmations?\b|\bthankful(?:ness)?\b|\bthree good things\b/i,
    hint: /\bpositiv(?:e|ity)\b|\bmanifest(?:ation|ing)?\b|\bmindset\b|\bjoy\b|\bappreciat/i,
    name: "Grateful",
    purpose: "build a daily gratitude or affirmation practice",
    user: "one person practicing daily reflection and positivity",
    workflow: "open → see today's prompt or affirmation → write a few gratitudes → review past entries",
    screens: [
      ["Today", "a gentle prompt, a text area for entries, and today's affirmation"],
      ["History", "past entries by date"],
      ["Settings", "daily reminder, theme, and export"],
    ],
    features: [
      "A rotating daily prompt or affirmation",
      "Write and save daily entries",
      "Review past entries by date",
      "A gentle daily reminder",
    ],
    logic: [
      "Entries are dated — one entry set per day",
      "The affirmation rotates deterministically by date",
      "An empty state offers a starter prompt",
    ],
    persistence: "Entries in localStorage; seed one sample entry on first run",
  },
  {
    id: "meditation",
    match: /\bmeditat(?:e|ion|ions|ing)\b|\bbreath(?:e|ing|work)\b|\bmindful(?:ness)?\b|\bzen\b|\bbox breathing\b|\b4-7-8\b/i,
    hint: /\bcalm(?:ing)?\b|\brelax(?:ation|ing)?\b|\bstress\b|\banxiety\b|\bunwind\b|\bbreaths?\b/i,
    name: "Breathe",
    purpose: "guide short breathing and meditation sessions",
    user: "one person taking a few minutes to reset",
    workflow: "open → pick a session → follow the animated breath guide → finish and log it",
    screens: [
      ["Home", "session cards (breathing, body scan…) and a daily streak"],
      ["Session", "an animated inhale/hold/exhale guide with a timer"],
      ["History", "completed sessions and total minutes"],
      ["Settings", "session lengths, sound, and theme"],
    ],
    features: [
      "Animated breathing guide (expanding/contracting circle)",
      "Timed sessions with a gentle completion chime",
      "Daily streak and total minutes",
      "A few session types to pick from",
    ],
    logic: [
      "The breath guide is a timed animation loop (e.g. 4-7-8)",
      "Completing a session logs it and bumps the streak",
      "Sessions can be exited early without penalty",
    ],
    persistence: "Streak and history in localStorage; seed one sample session on first run",
  },
  {
    id: "mood",
    match: /\bmoods?\b|\bemotions?\b|\bemotional\b|\bfeelings?\b|\bmental health\b|\bhow (?:i|I) feel\b|\bwell-?being\b/i,
    hint: /\bfeel(?:s|ing)?\b|\benergy\b|\bstress\b|\bcheck-?ins?\b/i,
    name: "Moodlog",
    purpose: "log daily mood and spot patterns over time",
    user: "one person tracking how they feel, privately",
    workflow: "open → tap a mood → add a short note → see trends over the week",
    screens: [
      ["Today", "a row of mood options and a note field"],
      ["Trends", "a week/month view of mood over time"],
      ["Settings", "reminders, theme, and export"],
    ],
    features: [
      "One-tap mood selection (5 levels, color-coded)",
      "An optional short note with each entry",
      "Weekly/monthly trend visualization",
      "Gentle reminders",
    ],
    logic: [
      "One mood entry per day, editable until midnight",
      "Trends average and color-code moods",
      "Entries are private and local",
    ],
    persistence: "Entries in localStorage; seed a sample week on first run",
  },
  {
    id: "care",
    match: /\bplants?\b|\bgarden(?:ing|s)?\b|\bwatering\b|\bhouseplants?\b|\bpets?\b|\bdogs?\b|\bcats?\b|\bpupp(?:y|ies)\b|\bkittens?\b|\bpet care\b|\bcare (?:for|schedule|log)\b|\bfeeding\b|\bvet\b/i,
    hint: /\bwalks?\b|\bgrooming\b|\bsunlight\b|\bsoil\b/i,
    name: "Tend",
    purpose: "keep plants or pets cared for with watering and feeding schedules",
    user: "one person juggling a few plants or pets",
    workflow: "open → see what needs care today → mark it done → add plants/pets with schedules",
    screens: [
      ["Today", "items needing care, grouped by due"],
      ["Collection", "all plants/pets with their next-due date"],
      ["Add / edit", "name, type, care interval, and an optional note"],
      ["Settings", "theme and notifications"],
    ],
    features: [
      "A care schedule per item (e.g. water every 3 days)",
      "“Due today” surfaced prominently",
      "Mark care done with one tap",
      "Track last-cared and next-due",
    ],
    logic: [
      "Next-due computes from last-cared + interval",
      "Overdue items highlight in a warning color",
      "Marking done resets the interval",
    ],
    persistence: "Items in localStorage; seed 2 sample plants on first run",
  },
  {
    id: "travel",
    match: /\btravel(?:l?ing|s)?\b|\btrips?\b|\bitinerar(?:y|ies)\b|\bpacking\b|\bvacations?\b|\bflights?\b|\bdestinations?\b|\broad[- ]?trips?\b|\bsuitcase\b|\bpassports?\b|\bhotels?\b|\bbackpacking\b/i,
    hint: /\bpack\b|\bpacked\b|\bmileage\b|\bdriv(?:e|es|ing)\b|\broutes?\b|\bluggage\b/i,
    name: "Pack",
    purpose: "plan trips and pack without forgetting anything",
    user: "one traveler organizing a trip",
    workflow: "open → create a trip → build an itinerary → pack from a smart checklist",
    screens: [
      ["Trips", "upcoming trips with dates and a packing progress bar"],
      ["Itinerary", "day-by-day plans with times and notes"],
      ["Packing list", "a smart checklist grouped by category"],
      ["Settings", "theme and default list items"],
    ],
    features: [
      "Trip cards with a countdown and packing progress",
      "Day-by-day itinerary entries",
      "A packing checklist that pre-populates from trip type",
      "Check off items as you pack",
    ],
    logic: [
      "The packing list pre-fills with essentials, then you add specifics",
      "Progress = checked / total",
      "Past trips auto-archive",
    ],
    persistence: "Trips in localStorage; seed one sample trip on first run",
  },
  {
    id: "dictionary",
    match: /\btranslat(?:e|es|or|ion|ing)\b|\bdictionar(?:y|ies)\b|\bdefinitions?\b|\bword of the day\b|\bthesaurus\b|\bglossary\b|\bsynonyms?\b/i,
    hint: /\bmeanings?\b|\bwords?\b|\bphrases?\b|\blanguages?\b|\bpronunciation\b/i,
    name: "Wordbook",
    purpose: "look up words and build a personal vocabulary",
    user: "one person improving their vocabulary or language",
    workflow: "open → search or see a word → read its definition → save it to your list",
    screens: [
      ["Word of the day", "a featured word with definition and example"],
      ["Search", "look up words and view definitions"],
      ["Saved", "your saved words, searchable"],
      ["Settings", "theme and word source"],
    ],
    features: [
      "Word of the day with definition and example sentence",
      "Search with instant results from a bundled sample dictionary",
      "Save words to a personal list",
      "Review saved words",
    ],
    logic: [
      "Search matches titles and prefixes against a bundled word list",
      "Word of the day rotates deterministically by date",
      "Saved words de-duplicate",
    ],
    persistence: "Saved words in localStorage; seed a few saved words",
  },
  {
    id: "game",
    match: /\bgames?\b|\bpuzzles?\b|\bsudoku\b|\bwordle\b|\btic[- ]?tac[- ]?toe\b|\barcade\b|\bmatch[- ]?3\b|\btrivia\b|\bboard game\b|\bminesweeper\b|\bsolitaire\b|\bmemory game\b|\b2048\b|\bhangman\b|\bcrosswords?\b/i,
    hint: /\bscores?\b|\blevels?\b|\bplayers?\b|\bplay\b|\bhigh score\b/i,
    name: null,
    purpose: "a small, polished, instantly playable game",
    user: "one person looking for a quick, satisfying game",
    workflow: "open → start → play → see the score or result → replay",
    screens: [
      ["Start", "title, brief instructions, and a play button"],
      ["Play", "the game board or interface"],
      ["Result", "score, best score, and play again"],
      ["Settings", "theme and difficulty"],
    ],
    features: [
      "Instant play with clear win/lose/score feedback",
      "Best score persisted",
      "Replay in one tap",
      "Difficulty options where relevant",
    ],
    logic: [
      "Game state lives in JavaScript — no network",
      "Score and best score update live",
      "Reset is instant with no reload",
    ],
    persistence: "Best score in localStorage",
  },
  {
    id: "calc",
    match: /\bcalculators?\b|\bcalc\b|\bconverters?\b|\bunit conver(?:sion|ter)\b|\btip calc(?:ulator)?\b|\bcurrency converter\b|\bbmi\b|\bmortgage\b/i,
    hint: /\bconvert(?:ing)?\b|\bunits?\b|\bconversions?\b|\bmeasure(?:ment|ments)?\b|\bformulas?\b|\bmath\b/i,
    name: "Calc",
    purpose: "a focused calculator or unit converter",
    user: "one person doing quick, everyday math",
    workflow: "open → enter values → see results instantly",
    screens: [
      ["Calculator", "a clean keypad and display"],
      ["Converter", "unit conversion with category tabs (length, weight, temperature…)"],
      ["History", "recent calculations"],
      ["Settings", "theme and number formatting"],
    ],
    features: [
      "Standard calculator with keyboard support",
      "Unit conversion across common categories",
      "Calculation history",
      "A large, clear display",
    ],
    logic: [
      "Expressions evaluate with correct operator precedence",
      "Conversions use precise factors and round sensibly",
      "History caps at the last 50 entries",
    ],
    persistence: "History in localStorage",
  },
];

const GENERIC = {
  id: "generic",
  name: null,
  purpose: "the concept described above, realized as a clean, single-purpose tool with no unnecessary features",
  user: "one person doing one job well — no accounts, no clutter",
  workflow: "open → see the primary view → act on or add an item → drill into detail as needed",
  screens: [
    ["Home", "an overview of the primary data with quick actions"],
    ["Detail", "a single item in full, with edit and delete"],
    ["Add / edit", "a form for creating or editing an item"],
    ["Settings", "theme and data management"],
  ],
  features: [
    "Create, view, edit, and delete the core item(s)",
    "Search or filter when there are many items",
    "One primary action always reachable in one tap",
    "Empty, loading, and error states that look intentional",
  ],
  logic: [
    "Primary state lives in JavaScript and re-renders on change",
    "IDs are unique and stable (no array-index keys)",
    "Actions that destroy data confirm first",
  ],
  persistence: "Data in localStorage; seed a few sample items on first run",
};

// The catalog is immutable: templates are permanent inputs, never state.
function deepFreeze(o) {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.freeze(o);
    Object.values(o).forEach(deepFreeze);
  }
  return o;
}
deepFreeze(DOMAINS);
deepFreeze(GENERIC);

/* ── Interpretation helpers ─────────────────────────────── */

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "with", "my", "me", "i", "we", "you",
  "your", "want", "need", "please", "make", "build", "create", "app", "web", "website", "mobile",
  "simple", "basic", "that", "this", "is", "are", "be", "it", "its", "like", "kind", "sort", "quick",
  "easy", "nice", "good", "small", "tiny", "one", "track", "tracker", "log",
  "something", "totally", "novel", "concept", "thing", "things", "idea", "lets", "let", "allows", "help", "helps",
  "which", "who", "what", "when", "where", "how", "can", "could", "should", "would", "will", "into", "from",
  "by", "at", "as", "so", "if", "then", "than", "also", "just", "only", "each", "any", "all", "some", "own",
  "shows", "show", "see", "sees", "get", "gets", "keep", "keeps", "use", "uses", "using", "turn", "turns", "goes",
]);

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function titleCase(s) {
  return s.split(/\s+/).map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(" ");
}

function cleanIdea(s) {
  let t = s.replace(/\s+/g, " ").trim();
  t = t.replace(/[.\s]+$/, "");
  if (!t) return "";
  if (!/[.!?]$/.test(t)) t += ".";
  return t;
}

function detectName(idea) {
  let m = idea.match(/["“']([A-Za-z0-9][A-Za-z0-9'&.\- ]{1,30}?)["”']/);
  if (m && /[A-Za-z0-9]/.test(m[1])) return titleCase(m[1].trim());
  m = idea.match(/\b(?:called|named|titled)\s+([A-Z][A-Za-z0-9'&.\-]*(?:\s+[A-Za-z0-9'&.\-]+){0,3})/);
  if (m) return titleCase(m[1].trim());
  return detectTitleCasedName(idea);
}

// "Smart Timesheet", "Smart Timesheet — log hours per project", "A Pocket Garden app"…
// A deliberately capitalised phrase of 2–5 words is treated as the app's name.
function detectTitleCasedName(idea) {
  const runs = idea.match(/\b[A-Z][A-Za-z0-9'&-]*(?:\s+[A-Z][A-Za-z0-9'&-]*)*/g) || [];
  const wholeIdea = idea.trim().replace(/[.!?]+$/, "");
  for (const run of runs) {
    const words = run.trim().split(/\s+/);
    while (words.length && STOPWORDS.has(words[0].toLowerCase())) words.shift();
    while (words.length && STOPWORDS.has(words[words.length - 1].toLowerCase())) words.pop();
    const isWhole = run.trim() === wholeIdea;
    if (!words.length || words.length > 5) continue;
    if (words.length < 2 && !isWhole) continue;
    if (words.length === 1 && words[0].length < 4) continue;
    return titleCase(words.join(" "));
  }
  return null;
}

function deriveName(idea) {
  // Prefer the most specific fragment (e.g. text after a colon or dash).
  const frag = idea.split(/[:—–]\s*/).map((s) => s.trim()).filter(Boolean);
  const source = frag.length > 1 ? frag[frag.length - 1] : idea;
  const words = source
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  const sig = words.slice(0, 3);
  return sig.length ? titleCase(sig.join(" ")) : "App";
}

function detectAudience(idea) {
  if (/for (kids|children)/i.test(idea))
    return "kids — large type, simple language, and playful but not childish visuals";
  const group = idea.match(/for (teams|roommates|groups|friends|famil(?:y|ies)|couples|housemates)/i);
  if (group)
    return "a small group (" + group[1] + ") sharing the app, with clear attribution of who did what";
  if (/for (seniors|older)/i.test(idea))
    return "older users, with larger text and extra-clear affordances";
  if (/for (students|school)/i.test(idea))
    return "students, with a focused, distraction-free feel";
  return null;
}

function countMatches(re, s) {
  const g = new RegExp(re.source, "gi");
  return (s.match(g) || []).length;
}

// Broad catch-all domains lose ties against specialized domains.
const BROAD = new Set(["todo", "notes", "generic", "music"]);

// A profile is only *eligible* when the idea names that kind of app (a strong
// `match` trigger). Soft `hint` words merely rank eligible profiles — they can
// never select a template on their own, so "productivity" or "focus" in an
// unrelated idea cannot pull in the timer template.
function matchDomain(idea) {
  let best = null, bestScore = 0;
  for (const d of DOMAINS) {
    const strong = countMatches(d.match, idea);
    if (!strong) continue;
    const score = strong * 3 + (d.hint ? countMatches(d.hint, idea) : 0);
    if (score > bestScore) {
      bestScore = score; best = d;
    } else if (score === bestScore && best && BROAD.has(best.id) && !BROAD.has(d.id)) {
      best = d;
    }
  }
  return best || GENERIC;
}

/* ── Generation state ───────────────────────────────────── */

// Every generation compiles from a brand-new, isolated plan object. Nothing
// from a previous run is read here — not the last plan, not the last output,
// not the last profile. `freshPlan()` is the reset: it yields empty slots for
// every app-specific value, and `compilePlan()` fills them from exactly two
// inputs — (1) the current idea and (2) the frozen DOMAINS/GENERIC catalog.
function freshPlan(idea) {
  return {
    idea: cleanIdea(idea),
    profileId: null,
    name: null,
    purpose: null,
    user: null,
    workflow: null,
    screens: [],
    features: [],
    logic: [],
    persistence: null,
  };
}

// Copy (never reference) template content so a plan shares no arrays with the
// catalog or with any earlier plan — later mutation can't leak across runs.
function compilePlan(idea, profile) {
  const plan = freshPlan(idea);
  plan.profileId = profile.id;
  plan.name = detectName(idea) || profile.name || deriveName(idea);
  plan.purpose = profile.purpose;
  plan.user = detectAudience(idea) || profile.user;
  plan.workflow = SpecsmithPromptAuthority.extractExplicitWorkflow(idea) || profile.workflow;
  plan.screens = profile.screens.map((s) => [s[0], s[1]]);
  plan.features = profile.features.slice();
  plan.logic = profile.logic.slice();
  plan.persistence = profile.persistence;
  return plan;
}

function planLines(plan) {
  return [plan.purpose, plan.workflow, ...plan.screens.map((s) => s.join(" — ")), ...plan.features, ...plan.logic];
}

/* ── Contamination check ────────────────────────────────── */

// Does the compiled plan carry anything that does not belong to *this* idea?
// Generic by construction — it reads only the catalog, the current idea and
// (for the carry-over test) the previous plan; there is no hard-coded word
// list, so it protects against any previous app, not just one.
//   1. Template justification — the profile that supplied purpose, workflow,
//      screens, features and logic must be named by the idea: one of its
//      strong triggers has to occur in the idea text.
//   2. Name — another template's codename may only be the app name when the
//      idea itself contains that word.
//   3. Carry-over — no purpose/workflow/screen/feature/logic line may be
//      shared with the previous generation if that was a different app.
function contaminationReport(plan, idea, previous) {
  const problems = [];
  const profile = DOMAINS.find((d) => d.id === plan.profileId) || GENERIC;

  if (profile !== GENERIC && !countMatches(profile.match, idea)) {
    problems.push("template “" + profile.id + "” is not named by the idea");
  }

  for (const d of DOMAINS) {
    if (!d.name || d === profile) continue;
    if (String(plan.name).toLowerCase() === d.name.toLowerCase() && !new RegExp("\\b" + d.name + "\\b", "i").test(idea)) {
      problems.push("foreign app name “" + d.name + "”");
    }
  }

  if (previous && previous.idea !== plan.idea && previous.profileId !== plan.profileId) {
    const prevLines = new Set(planLines(previous));
    const carried = planLines(plan).filter((l) => prevLines.has(l));
    if (carried.length) problems.push(carried.length + " line(s) carried over from the previous app");
  }

  return problems;
}

/* ── Prompt assembly ────────────────────────────────────── */

function renderPlan(plan) {
  const role = SpecsmithPromptAuthority.resolveRole(plan.idea, plan);
  return SpecsmithPromptAuthority.renderCanonicalPrompt(plan, {
    role,
    interactionRules: INTERACTION,
    defaultBuildGuidance: BUILD,
  });
}

// Entry point. `previous` (the last compiled plan, if any) is used *only* by
// the contamination check to prove the new plan shares nothing with it — it
// is never an input to compilation.
function buildPrompt(idea, previous) {
  let plan = compilePlan(idea, matchDomain(idea));
  let problems = contaminationReport(plan, idea, previous || null);
  const rejected = problems;
  if (problems.length) {
    // Regenerate from a clean state: fresh plan, permanent generic rules only.
    plan = compilePlan(idea, GENERIC);
    problems = contaminationReport(plan, idea, previous || null);
  }
  return { name: plan.name, text: renderPlan(plan), plan, problems, fallback: rejected.length > 0, rejected };
}

/* ── State ──────────────────────────────────────────────── */

let promptHistory = loadHistory();
let current = loadLast(); // { idea, name, text, ts } | null

// Generated-output state. `plan` is the last compiled plan (kept only so the
// contamination check can prove the next result shares nothing with it);
// `stale` flips on as soon as the Idea input diverges from the idea the
// visible prompt was built from — a stale result is display-only.
const gen = { seq: 0, plan: null, stale: false };

// Wipe every trace of the previous generation: compiled plan, app name,
// purpose, user, workflow, screens, features, logic, persistence, rendered
// text, stats, stale flag and the persisted "last prompt".
function resetGenerationState() {
  gen.seq += 1;
  gen.plan = null;
  gen.stale = false;
  current = null;
  persistLast();
  renderOutput();
}

function markStaleIfIdeaChanged() {
  if (!el.outputPanel) return;
  const typed = cleanIdea(el.idea.value || "");
  const stale = !!current && typed !== "" && typed !== current.idea;
  gen.stale = stale;
  el.outputPanel.classList.toggle("is-stale", stale);
}

const EXAMPLES = [
  "a habit tracker with streaks",
  "an expense splitter for roommates",
  "a flashcard app for learning Spanish",
  "a 4-7-8 breathing app",
  "a trip packing checklist",
  "a mood tracker with weekly trends",
];

/* ── DOM refs ───────────────────────────────────────────── */

const $ = (sel) => document.querySelector(sel);

const el = {
  idea: $("#idea"),
  chips: $("#ideaChips"),
  generateBtn: $("#generateBtn"),
  genLabel: $("#genLabel"),
  output: $("#output"),
  emptyHero: $("#emptyHero"),
  outputPanel: $("#outputPanel"),
  outputActions: $("#outputActions"),
  outputName: $("#outputName"),
  outputBadge: $("#outputBadge"),
  statChars: $("#statChars"),
  statWords: $("#statWords"),
  history: $("#history"),
  historyCount: $("#historyCount"),
  copyBtn: $("#copyBtn"),
  downloadBtn: $("#downloadBtn"),
  clearBtn: $("#clearBtn"),
  toast: $("#toast"),
};

/* ── Persistence ────────────────────────────────────────── */

function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((p) => p && p.idea && p.text).slice(0, 60)
      : [];
  } catch { return []; }
}

function persistHistory() {
  try { localStorage.setItem(LS_HISTORY, JSON.stringify(promptHistory)); } catch { /* ignore */ }
}

function loadLast() {
  try {
    const raw = localStorage.getItem(LS_LAST);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && d.text ? d : null;
  } catch { return null; }
}

function persistLast() {
  try {
    if (current) localStorage.setItem(LS_LAST, JSON.stringify(current));
    else localStorage.removeItem(LS_LAST);
  } catch { /* ignore */ }
}

/* ── Utilities ──────────────────────────────────────────── */

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "h-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function slug(name) {
  return (name || "prompt").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "prompt";
}

/* ── Rendering ──────────────────────────────────────────── */

function renderChips() {
  if (!el.chips) return;
  el.chips.innerHTML = "";
  EXAMPLES.forEach((ex) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "idea-chip";
    b.textContent = ex;
    b.addEventListener("click", () => {
      el.idea.value = ex;
      el.idea.focus();
    });
    el.chips.appendChild(b);
  });
}

function renderOutput() {
  if (!current) {
    if (el.outputPanel) { el.outputPanel.hidden = true; el.outputPanel.classList.remove("is-stale"); }
    if (el.emptyHero) el.emptyHero.hidden = true;
    el.output.hidden = true;
    el.output.textContent = "";
    el.outputActions.hidden = true;
    el.outputBadge.hidden = true;
    el.outputName.textContent = "Build prompt";
    el.statChars.textContent = "0";
    el.statWords.textContent = "0";
    return;
  }

  if (el.outputPanel) el.outputPanel.hidden = false;
  if (el.emptyHero) el.emptyHero.hidden = true;
  el.output.hidden = false;
  el.outputActions.hidden = false;
  el.outputBadge.hidden = false;
  el.outputBadge.textContent = "✦";
  el.outputName.textContent = current.name;
  el.output.textContent = current.text;
  el.statChars.textContent = current.text.length.toLocaleString();
  el.statWords.textContent = current.text.trim().split(/\s+/).length.toLocaleString();
  markStaleIfIdeaChanged();
}

function renderHistory() {
  el.historyCount.textContent = promptHistory.length;
  el.history.innerHTML = "";

  if (!promptHistory.length) {
    const div = document.createElement("div");
    div.className = "history-empty";
    div.innerHTML = "Generated prompts appear here.<br>Click one to load it back.";
    el.history.appendChild(div);
    return;
  }

  promptHistory.forEach((h, i) => {
    const item = document.createElement("div");
    item.className = "hist-item";
    item.style.animationDelay = (i * 22) + "ms";
    item.innerHTML =
      '<div class="hist-name">' + escapeAttr(h.name || "Untitled") + "</div>" +
      '<div class="hist-snip">' + escapeAttr(h.idea.slice(0, 120)) + "</div>" +
      '<div class="hist-meta">' + fmtDate(h.ts) + "</div>" +
      '<div class="hist-actions">' +
        '<button type="button" class="load" title="Load" aria-label="Load">' +
          '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>' +
        "</button>" +
        '<button type="button" class="copy" title="Copy prompt" aria-label="Copy prompt">' +
          '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 14.5H4.5A2.5 2.5 0 0 1 2 12V4.5A2.5 2.5 0 0 1 4.5 2H12a2.5 2.5 0 0 1 2.5 2.5V5"/></svg>' +
        "</button>" +
        '<button type="button" class="del" title="Delete" aria-label="Delete">' +
          '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>' +
        "</button>" +
      "</div>";

    item.addEventListener("click", () => loadHistoryItem(h));
    item.querySelector(".copy").addEventListener("click", (e) => {
      e.stopPropagation();
      copyText(h.text, "Prompt copied to clipboard");
    });
    item.querySelector(".del").addEventListener("click", (e) => {
      e.stopPropagation();
      promptHistory = promptHistory.filter((x) => x.id !== h.id);
      persistHistory();
      renderHistory();
      toast("Deleted");
    });
    el.history.appendChild(item);
  });
}

function fmtDate(ts) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(ts);
}

/* ── Generate ───────────────────────────────────────────── */

function generate() {
  const idea = el.idea.value.trim();
  if (!idea) {
    toast("Describe your app idea first");
    el.idea.focus();
    return;
  }

  el.generateBtn.disabled = true;
  el.generateBtn.classList.add("is-busy");
  el.genLabel.textContent = "Forging…";

  // 1. Detach the previous plan. It is handed to the contamination check
  //    only, so the check can prove the new result shares nothing with it.
  const previous = gen.plan;

  // 2. Full reset: no prior name/purpose/screens/features/output survive.
  resetGenerationState();
  const seq = gen.seq;

  // Short beat so the transition reads as real work.
  setTimeout(() => {
    try {
      if (seq !== gen.seq) return; // cleared or superseded meanwhile
      // 3. Compile from the current idea + permanent rules only.
      const result = buildPrompt(idea, previous);
      gen.plan = result.plan;
      gen.stale = false;
      // 4. Replace — never merge — the visible output.
      current = { idea: result.plan.idea, name: result.name, text: result.text, ts: Date.now() };
      pushHistory(idea, result.name, result.text);
      persistLast();
      renderOutput();
      toast("Prompt ready");
    } finally {
      el.generateBtn.disabled = false;
      el.generateBtn.classList.remove("is-busy");
      el.genLabel.textContent = "Generate prompt";
    }
  }, 380);
}

function pushHistory(idea, name, text) {
  const key = idea.toLowerCase().replace(/\s+/g, " ").trim();
  const existing = promptHistory.find((h) => h.idea.toLowerCase().replace(/\s+/g, " ").trim() === key);
  const now = Date.now();
  if (existing) {
    existing.name = name;
    existing.text = text;
    existing.ts = now;
    promptHistory = [existing, ...promptHistory.filter((h) => h !== existing)];
  } else {
    promptHistory.unshift({ id: uid(), idea: cleanIdea(idea), name, text, ts: now });
    promptHistory = promptHistory.slice(0, 60);
  }
  persistHistory();
  renderHistory();
}

function loadHistoryItem(h) {
  resetGenerationState(); // a loaded prompt is display-only; it is never compiler context
  el.idea.value = h.idea.replace(/[.]$/, "");
  current = { idea: h.idea, name: h.name, text: h.text, ts: h.ts };
  persistLast();
  renderOutput();
  toast("Loaded “" + (h.name || "Untitled") + "”");
}

function clearPrompt() {
  resetGenerationState(); // removes the result and its state; el.idea is deliberately untouched
  toast("Prompt cleared");
}

/* ── Copy / download ────────────────────────────────────── */

async function copyText(text, msg) {
  if (!text) { toast("Nothing to copy yet"); return; }
  try {
    await navigator.clipboard.writeText(text);
    toast(msg || "Copied to clipboard");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast(msg || "Copied to clipboard"); }
    catch { toast("Copy failed — select the prompt text instead"); }
    ta.remove();
  }
}

function downloadPrompt() {
  if (!current) { toast("Generate a prompt first"); return; }
  const blob = new Blob([current.text], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = slug(current.name) + ".md";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast("Downloaded .md");
}

/* ── Toast ──────────────────────────────────────────────── */

let toastTimer = null;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.hidden = false;
  requestAnimationFrame(() => el.toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.classList.remove("show");
    setTimeout(() => { el.toast.hidden = true; }, 240);
  }, 2200);
}

/* ── Theme ──────────────────────────────────────────────── */

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  try { localStorage.setItem(LS_THEME, theme); } catch { /* ignore */ }
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(LS_THEME); } catch { /* ignore */ }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

const PROMPT_IDEAS = [
  ["Pocket garden", "A gentle plant-care companion with watering reminders and a simple sunlight log."],
  ["Weekend planner", "Plan a weekend with a shared list of places, times, and must-do moments."],
  ["Tiny pantry", "Track what is in the pantry and get a quick view of what needs using soon."],
  ["Decision deck", "Turn a difficult choice into a calm, weighted comparison with notes."],
  ["Reading nook", "Save books to read, track pages, and keep a short reflection after each session."],
  ["Home reset", "A room-by-room checklist for small cleaning sessions that feel achievable."]
];
const EVERYDAY = {
  "Productivity": ["A focused daily task list with three priorities and a done archive.", "A meeting notes app with decisions, owners, and follow-ups.", "A simple project board for a personal goal.", "A weekly planner that turns intentions into small next steps.", "A distraction log that shows where focus time goes."],
  "Money & Finance": ["A monthly spending snapshot with categories and a gentle budget bar.", "A roommate expense splitter with settle-up balances.", "A savings goal tracker with milestones and encouraging check-ins.", "A bill calendar with due dates and paid status.", "A receipt log with amount, store, category, and notes."],
  "Shopping": ["A grocery list grouped by aisle with one-tap check-off.", "A price comparison note for a planned purchase.", "A reusable packing list for different kinds of shopping trips.", "A gift ideas list with recipient, budget, and occasion.", "A pantry restock list that remembers frequently bought items."],
  "Health & Wellness": ["A water tracker with a daily goal and quick-add buttons.", "A mood check-in with weekly patterns and private notes.", "A medication reminder with a simple taken-today log.", "A five-minute stretch routine with step-by-step cards.", "A sleep journal for bedtime, wake time, and how rested you feel."],
  "Food & Cooking": ["A recipe box with favorites, tags, and a cooking mode.", "A meal planner that turns selected recipes into a grocery list.", "A leftover tracker showing what to eat next.", "A kitchen timer board for several dishes at once.", "A weekly lunch planner with quick, repeatable ideas."],
  "Home & Family": ["A shared household chore board with recurring tasks.", "A home inventory with rooms, photos, and replacement notes.", "A family calendar for appointments, school, and activities.", "A pet care log for feeding, walks, and appointments.", "A home maintenance list with seasonal reminders."],
  "Travel & Driving": ["A road-trip checklist with stops, fuel, and notes.", "A trip itinerary with day-by-day places and reservation details.", "A mileage log for drives with purpose and distance.", "A packing list that can be reused for every trip.", "A parking spot saver with location, floor, and photo."],
  "Personal Records": ["A private contacts log for important details and dates.", "A warranty tracker with purchase date and expiry reminders.", "A personal document checklist with renewal dates.", "A keepsake journal for memorable moments and photos.", "A home measurements notebook for rooms and furniture."],
  "Learning": ["A flashcard deck for a language with honest self-grading.", "A reading notes app with quotes and takeaways.", "A study session timer with a small progress history.", "A vocabulary builder with daily review cards.", "A course tracker with lessons, notes, and completion progress."],
  "Utilities": ["A unit converter for the measurements you use most.", "A simple countdown board for important dates.", "A QR code bookmark list with labels and notes.", "A recurring date calculator for renewals and anniversaries.", "A personal link saver with tags and quick search."]
};
function showPage(name) {
  if (!["home","ideas","everyday","settings"].includes(name)) name = "home";
  document.querySelectorAll(".page").forEach((p) => p.hidden = p.dataset.page !== name);
  if (name === "ideas" && !$("#ideaCards").children.length) renderInspiration();
  if (name === "everyday" && !$("#everydayCategories").children.length) renderEveryday();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function renderInspiration() {
  $("#ideaCards").innerHTML = PROMPT_IDEAS.map((x) => `<article class="idea-card"><h3>${x[0]}</h3><p>${x[1]}</p><button type="button" data-idea="${escapeAttr(x[1])}">Use this idea →</button></article>`).join("");
  $("#ideaCards").querySelectorAll("[data-idea]").forEach((b) => b.addEventListener("click", () => { el.idea.value = b.dataset.idea; showPage("home"); window.history.replaceState(null,"","#home"); el.idea.focus(); }));
}
function renderEveryday() {
  $("#everydayCategories").innerHTML = Object.entries(EVERYDAY).map(([cat, items]) => `<details class="category"><summary>${cat}<span>⌄</span></summary><div class="category-items">${items.map((x) => `<button class="category-item" type="button" data-idea="${escapeAttr(x)}"><span>${x}</span><small>›</small></button>`).join("")}</div></details>`).join("");
  $("#everydayCategories").querySelectorAll("[data-idea]").forEach((b) => b.addEventListener("click", () => openBrief(b.dataset.idea)));
}
function openBrief(text) {
  const modal = document.createElement("div"); modal.className = "brief-overlay";
  modal.innerHTML = `<div class="brief" role="dialog" aria-modal="true"><button class="brief-close" aria-label="Close">×</button><p class="eyebrow">App idea brief</p><h2>${text}</h2><p>Use this as a starting point, then add the details that matter to you. Specsmith can turn it into a full build prompt.</p><div><button class="btn btn-primary brief-copy">Copy brief</button><button class="btn btn-ghost brief-home">Use on Home</button></div></div>`;
  document.body.appendChild(modal);
  modal.querySelector(".brief-close").onclick = () => modal.remove();
  modal.querySelector(".brief-copy").onclick = () => copyText(text, "Brief copied");
  modal.querySelector(".brief-home").onclick = () => { modal.remove(); el.idea.value = text; window.history.replaceState(null,"","#home"); showPage("home"); el.idea.focus(); };
}

/* ── Wiring ─────────────────────────────────────────────── */

function wire() {
  el.generateBtn.addEventListener("click", generate);
  el.copyBtn.addEventListener("click", () => {
    if (current) copyText(current.text, "Prompt copied to clipboard");
  });
  el.downloadBtn.addEventListener("click", downloadPrompt);

  el.idea.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  });
  el.idea.addEventListener("input", markStaleIfIdeaChanged);

  if (el.clearBtn) el.clearBtn.addEventListener("click", clearPrompt);
  const menuToggle = $("#menuToggle");
  const menu = $("#menu");
  menuToggle.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    menuToggle.setAttribute("aria-expanded", String(!menu.hidden));
  });
  document.querySelectorAll("[data-page-link]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(link.dataset.pageLink);
    menu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  }));
  const themeSelect = $("#themeSelect");
  if (themeSelect) { themeSelect.value = document.body.dataset.theme; themeSelect.addEventListener("change", () => applyTheme(themeSelect.value)); }
  window.addEventListener("hashchange", () => showPage(location.hash.slice(1) || "home"));
  showPage(location.hash.slice(1) || "home");
}

/* ── Boot ───────────────────────────────────────────────── */

initTheme();
renderChips();
renderHistory();
renderOutput();
wire();
el.idea.focus();
