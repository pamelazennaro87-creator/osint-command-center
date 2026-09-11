# UI Phase 1 next boundary

This branch isolates graph behavior from the application core. Before merging, verify:

1. Quality Gate is green.
2. Graph controller is loaded exactly once.
3. Existing Entity Inspector remains the only inspector.
4. No legacy `alert()` path exists.
5. Graph selection, 1-hop emphasis, edge status and empty state work without changing stored analytical data.
6. Pages deployment is performed from the exact merged HEAD.

Do not merge while any of these conditions is unverified.
