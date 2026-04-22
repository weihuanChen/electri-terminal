# Copy Tasks Template

Use `copy-tasks.published.json` as the machine-readable source for agent workflows.

Recommended workflow:
1. Load one task from the JSON file.
2. Pass `instructions`, `context`, and `target` to the agent.
3. Ask the agent to return only the `proposed` object in valid JSON.
4. Review before writing back to Convex/admin.
