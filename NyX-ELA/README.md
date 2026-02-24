# NyX-ELA

NyX-ELA is an autonomous cyber-orchestration framework that combines high-level reasoning with low-level system execution patterns for **authorized** security operations and system automation.

## Implemented MVP

- Cognitive architecture with episodic/semantic/procedural memory.
- Event bus for module coordination.
- Mind engine for response-vs-orchestration routing.
- Authorized pentest orchestration planner (safe-by-default dry-run execution).
- Report generator for structured findings.
- CLI shell entrypoint.

## Safety model

NyX-ELA requires explicit `authorized=True` engagement context for active checks and defaults terminal execution to dry-run mode.
