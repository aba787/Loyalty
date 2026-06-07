---
name: Workflow port support
description: Only specific ports trigger the workflow "port open" detection; using unsupported ports causes restart_workflow to always timeout.
---

The `restart_workflow` tool and `restartWorkflow()` callback only detect ports from a fixed allowlist:
3000, 3001, 3002, 3003, 4200, 5000, 5173, 6000, 6800, 8000, 8008, 8080, 8099, 9000

**Why:** The workflow health-check mechanism polls these ports. If the service binds to any other port (e.g. 19751, which the artifact system may assign by default), the restart call times out with DIDNT_OPEN_A_PORT even though the server is actually running and serving traffic.

**How to apply:** When a react-vite (or other) artifact gets assigned a non-standard port by `createArtifact()`, use `verifyAndReplaceArtifactToml()` to change `localPort` and `[services.env] PORT` to a supported value (e.g. 3000), then reconfigure or restart the workflow. Use `configureWorkflow({ waitForPort: <supported-port> })` if needed.
