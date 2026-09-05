# SpecSmith — Global Prompt Authority Design

## Objective
Upgrade SpecSmith so every generated app/product prompt follows one canonical high-authority instruction hierarchy. The hierarchy must orient the downstream builder before it starts making layout or architecture decisions, automatically resolve the most appropriate expert role, preserve the user’s explicit product intent, and improve first-screen and screen-by-screen build quality globally rather than per domain template.

## Core Product Decision
SpecSmith will keep its existing deterministic domain-profile architecture, isolated fresh-plan compilation, and contamination protection. The upgrade happens at the global plan/rendering layer so every domain benefits automatically.

The canonical app prompt order is:
1. Role
2. Product Mission / Objective
3. Idea Lock
4. Design & UX Standard
5. Target User
6. Primary Workflow
7. Screen Architecture
8. Screen-by-Screen Composition
9. Product Behavior & Calculations
10. Interaction & State Rules
11. Scope Lock / Forbidden Behavior
12. Implementation / Tool Guidance
13. Verification + Done When

## Automatic Role Resolver
SpecSmith chooses the most appropriate role from the current idea and compiled plan. Explicit user platform intent always wins.

Supported role families:
- Android: Senior Android Product Engineer + Mobile UI/UX Specialist
- iOS: Senior iOS Product Engineer + Mobile UI/UX Specialist
- Web: Senior Web Product Engineer + UI/UX Specialist
- Full-Stack: Senior Full-Stack Product Engineer
- Product/UI: Senior Product Engineer + UI/UX Specialist when no platform is explicit and no backend-heavy requirement is present

Resolution rules:
- Explicit Android wording resolves Android.
- Explicit iOS/iPhone wording resolves iOS.
- Explicit web/website/browser wording resolves Web.
- Explicit backend/database/API/account/sync requirements can resolve Full-Stack when the build actually requires those concerns.
- Otherwise infer conservatively from the product and workflow.
- Role guidance must never change the user’s requested platform, product purpose, workflow, features, exclusions, or build target.
- SpecSmith’s existing Arena-friendly self-contained web implementation guidance remains the default when the idea does not explicitly request a native target. A role is expert framing, not permission to silently switch implementation platforms.

## Product Mission / Objective
State what is being built, the one job it performs, and for whom. Use the compiled domain purpose and audience only when justified by the current idea.

## Idea Lock
Repeat the normalized current idea as the non-negotiable product definition. Explicitly preserve purpose, workflow, required features, exclusions, and one-job focus. Domain defaults may improve execution but must not contradict or broaden the idea.

## Automatic Design & UX Standard
Every app prompt receives a mandatory premium design contract near the top, before screen construction instructions. It requires:
- production-ready visual hierarchy
- intentional spacing, typography, density, grouping, and component hierarchy
- one obvious next primary action on workflow screens
- coherent platform/workflow-appropriate navigation
- polished empty, active, loading, completed, saved, edited, disabled, and error states only when relevant
- consistent component language rather than unrelated cards and default generated UI
- restrained surfaces, borders, elevation, color, and effects
- purposeful micro-interactions and restrained animation for navigation, state changes, sheets/dialogs, button feedback, progress, and completion
- reduced-motion respect when supported
- no random motion, excessive glass, neon, gradients, or decorative effects that slow the task

Global quality gate:
A functional prototype is not complete. The first main screen must look like a finished premium product. If the result resembles a generic prototype, dashboard, stack of cards, default generated UI, or placeholder composition, redesign it before presenting the build.

## Primary Workflow
Render the domain/profile workflow as the explicit start-to-finish user journey. If the user supplies a more specific workflow, that explicit sequence takes authority over profile defaults.

## Screen Architecture
Separate primary workflow screens from supporting and configuration screens.
- Primary screens directly advance or explain the product’s main job.
- Supporting screens such as History, Calendar, Reports, Saved items, or secondary detail views remain secondary unless the idea makes them primary.
- Settings and configuration remain secondary and should not compete with the main workflow.
- Avoid dashboard-first layouts unless the product explicitly requires a dashboard.

## Screen-by-Screen Composition
Use each compiled domain screen as a spatial composition brief, not merely a screen name. Each screen instruction should describe:
- top/header information
- dominant content or status area
- primary action placement
- supporting information placement
- secondary controls or sheets
- state-specific behavior when relevant

The renderer should preserve domain-specific screen descriptions and improve them into coherent composition instructions without inventing unrelated features.

## Product Behavior & Calculations
Combine the domain profile’s core features, key logic, calculations, persistence, and data rules into one implementation-focused behavior section. Requirements must be working behavior, not labels or decorative UI. Shared data must use one source of truth so screens cannot disagree.

## Interaction & State Rules
Preserve the useful current interaction rules while removing forced decorative behavior. Require immediate feedback, purposeful transitions, working controls, persistent state where required, confirmation for destructive actions, and only relevant empty/loading/error/completion states. Celebration effects are allowed only when meaningful to the product and should never be mandatory globally.

## Scope Lock / Forbidden Behavior
- Do not invent unrelated pages, fields, metrics, dashboards, services, accounts, analytics, backend, teams, or automation.
- Do not import features from a previous generated app.
- Do not allow domain-profile defaults to override explicit exclusions.
- Do not silently switch the requested implementation platform.
- Preserve SpecSmith’s contamination detection and clean generic fallback behavior.

## Implementation / Tool Guidance
Keep the implementation guidance appropriate to the current build target. For the default SpecSmith Arena/web path, prefer one self-contained `index.html` with inline HTML/CSS/JavaScript, state-driven multi-screen UI, no unnecessary frameworks or external services, mobile-first 360–430 px portrait, and no fake device frame. If the user explicitly asks for another implementation target, platform-specific guidance may replace the default where technically appropriate.

## Compiler Architecture
Existing flow remains authoritative:
Current idea → domain match → fresh isolated plan → contamination check → canonical global renderer → finished prompt.

New responsibilities:
1. Normalize explicit platform/build signals.
2. Resolve automatic expert role.
3. Preserve explicit workflow over profile defaults when provided.
4. Classify profile screens into primary/supporting/settings roles.
5. Render the canonical global prompt hierarchy.
6. Generate screen-by-screen composition from existing profile screens.
7. Apply automatic Design & UX Standard and first-screen quality gate.
8. Keep contamination checks and fallback behavior intact.

No parallel prompt compiler is introduced.

## Testing
Use TDD. Add failing tests before production changes for:
- canonical section order
- automatic Android/iOS/Web/Full-Stack/neutral role resolution
- explicit platform winning over inference
- role not changing product purpose or build target
- Design & UX Standard present in every app prompt
- first-screen quality gate present
- Screen Architecture present
- Screen-by-Screen Composition present and derived from the selected profile
- Settings kept secondary when present
- existing timesheet, trucking/utility, finance, and generic profiles preserving their own content
- contamination protection still rejecting previous-app carryover
- no unrelated feature invention
- existing generation/history/reset behavior remaining intact

## Done When
- Every SpecSmith app prompt uses the canonical authority order.
- Role is automatically chosen and never contradicts explicit platform intent.
- Premium UI/UX and purposeful motion are automatic requirements, not optional style choices.
- Every generated app includes explicit Screen Architecture and screen-by-screen composition guidance.
- Domain-specific workflow, features, calculations, logic, persistence, and exclusions remain intact.
- Previous-generation contamination protections remain intact.
- Tests pass on the feature branch and merged `main`.
- Completed changes are committed/pushed to the connected GitHub repository so the linked Vercel deployment can update when deployment capacity is available.
