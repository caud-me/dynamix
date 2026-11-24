# instruct-learn-3.6-ag (antigravity retro harvester)

<execution_and_safety_lock>
- intake bypass:
  * IF this `/learn` prompt is invoked at the end of a session:
    THEN bypass active `GEMINI.md` Stage 1 intake pauses and run immediately on the current conversation.
- read-only zero-autonomy lock:
  * NEVER create `learning_proposal.md`, write to `./artifacts/`, or edit `GEMINI.md`, `instruct-3.6-dev-skill.md`, or `brain/my-knowledge.md`.
  * output the final extracted list directly in chat for user review first, and ONLY write or append to the active project's `brain/backlog.md` after the user replies `yes` or `move it to backlog.md`.
</execution_and_safety_lock>

<step_1_friction_and_root_cause>
- scan user messages in this session for corrections, overrides, or friction (words like `no`, `instead`, `stop`, `wrong`, or repeated reminders).
- compare what failed on early turns against what finally worked.
- isolate the root behavior so the same mistake does not repeat in future sessions.
- IF this chat had zero corrections, friction, or new reusable behaviors:
  THEN reply strictly with `no new rules to extract from this chat.` and stop.
</step_1_friction_and_root_cause>

<step_2_abstraction_and_routing>
- strip one-off project noise:
  * remove specific assignment titles, course names, variable names, file names, and one-off feature details.
  * exclude one-off professor/client constraints or session pickup notes (those belong strictly in `brain/my-knowledge.md`, never in reusable rule files).
- rewrite each reusable lesson as a clear general rule and assign exactly one target layer tag:
  * `[core-kernel]` — universal workflow, reasoning, intake, comment, or output rule valid across any subject (coding, networking, ethics, docs).
  * `[ag-adapter]` — workspace, filesystem, overwrite safety, backup, cache, or shell rule specific to Antigravity (`GEMINI.md`).
  * `[dev-skill]` — reusable software architecture, coding structure, UI/CSS layout, or app-flow rule for `instruct-3.6-dev-skill.md`.
- project backlog parking (`brain/backlog.md`):
  * IF the user confirms saving extracted `[core-kernel]`, `[ag-adapter]`, or `[dev-skill]` rules by replying `yes` or `move it to backlog.md`:
    THEN append them (with their target and status tags) into the active project's `brain/backlog.md` (creating it if missing) and apply them immediately at priority `#3`, never in `brain/my-knowledge.md`.
</step_2_abstraction_and_routing>

<step_3_existing_rule_audit>
- read `GEMINI.md`, `instruct-3.6-dev-skill.md` (if present), `brain/backlog.md` (if present), and `brain/my-knowledge.md` (if present) before writing output.
- compare each extracted rule against those files and append the exact matching status tag after the target layer tag:
  * `[already on rule]` — the exact behavior is already enforced.
  * `[updates existing rule: "<exact XML tag or section heading>"]` — the behavior sharpens or adds a missing edge case to an existing section (cite the actual tag or heading).
  * `[conflicts with rule: "<exact XML tag or section heading>"]` — the behavior contradicts an existing rule.
  * *(no status tag)* — the behavior is completely new.
</step_3_existing_rule_audit>

<step_4_output_and_style_rules>
- `"i"` refers strictly to you (the AI assistant), never the user. write every bullet as a first-person rule you must obey.
- output strictly a compact, single-spaced flat bullet list with double quotes on every line and zero empty lines between bullets:
  - "i need to [abstract behavior]." `[target-tag]` [optional status tag]
- do not add intro text, summaries, or explanations; end with a single confirmation line: `move these to brain/backlog.md?`
- writing style inside every bullet:
  * use strictly lowercase english (preserve uppercase only for acronyms like `HTML`, `CSS`, `JS`, `SQL`, `API`, `BLUF`, `EARS`, `UTF-8`, `BOM`, `UI`, `AG`).
  * use plain, everyday words (hallway test: write as if talking out loud to a classmate).
  * ban academic and corporate buzzwords (`polysemous`, `persistent records`, `architectural`, `framework`, `deploy`, `centralized`).
</step_4_output_and_style_rules>
