# Orchestration 1.0 Repository Rules

## Purpose
Build Orchestration 1.0 as a local-first, single-user-first, ops-first control plane.

## Non-negotiable Rules
- local-first, single-user-first, ops-first
- source of truth for policy/contracts is repo files
- v1 scope = development pack only
- do not introduce office-first UI, messenger-first, ranking, OAuth, or multi-provider-first
- project_path is required before any execution
- review before done
- approval before commit
- builder must not silently change architecture
- prefer thin-slice / vertical-slice
- propose a plan before multi-file edits
- do not edit files until approval when the task explicitly asks for planning first

## Required Read Order
1. AGENTS.md
2. docs/00_master-brief.md
3. docs/01_decision-log.md
4. docs/02_ia-v1.md
5. docs/03_architecture-roadmap-v1.md
6. packs/development/pack.md
7. tasks/todo.md
8. tasks/lessons.md

## Required Output Format
- changed files
- why
- commands run
- test/check results
- remaining [OPEN]
