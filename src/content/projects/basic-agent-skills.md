---
draft: false
featured: "1"
title: "Basic Agent Skills Corpus"
description: "A collection of OS-agnostic skills that patch well-known LLM blind spots by providing deterministic tools and scripts for agents."
pubDate: 2026-10-02
license: mit
tags:
  - Agentic AI
  - LLM Tools
  - PowerShell
  - Bash
repoUrl: "https://github.com/kikmak42/basic-agent-skills"
status: "in-progress"
---

A collection of OS-agnostic skills designed to patch well-known Large Language Model (LLM) blind spots — the types of deterministic tasks that models struggle to perform reliably on their own and must delegate to actual tools or scripts.

### Why This Exists
LLMs are trained on static snapshots of the world. They lack an internal clock, a source of true randomness, and guaranteed arithmetic precision. The `basic-agent-skills` repository teaches the agent the correct procedure for these types of tasks so it reaches for the right tool instead of hallucinating an answer.

### Features
- **Cross-platform**: Every skill ships with a PowerShell script (`.ps1`) for Windows and a Bash script (`.sh`) for Linux/macOS.
- **OS Detection**: Each skill's `SKILL.md` instructs the agent to detect the operating system first and run the correct script automatically.
- **Plug and Play**: Designed to be easily dropped into any Antigravity workspace by simply copying the `skills/` folder into your project's `.agents/` directory.

### Available Skills
The repository currently includes a registry of basic skills such as:
- **Date & Time** (`get-date`)
- **Random Number Generation** (`random-number`)
- **Arithmetic** (`basic-math`)
- **Web Search** (`web-search`)
- **File Operations** (`file-ops`)
- **Shell Execution** (`shell-exec`)
... and more in development.

Check out the full repository to see how to contribute new skills!
