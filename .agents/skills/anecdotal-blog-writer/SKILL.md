---
name: anecdotal-blog-writer
description: >-
  Use this skill when the user asks to write, rewrite, or refine a technical blog post.
  This skill guides the agent to produce blog posts in an anecdotal, story-driven style
  that explains core technology through real-life stories, system analogies, and
  relatable metaphors — ending with structured key takeaways. The blog format follows
  the Astro content collection schema used in this site.
---

# Anecdotal Blog Writer Skill

Write technical blog posts that teach through **storytelling and analogy** rather than
dry documentation. Every blog should feel like a senior engineer explaining a concept
over coffee — grounded in real experience, peppered with vivid analogies, and landing
on concrete takeaways.

---

## Blog Structure (Mandatory Sections)

Every blog post MUST follow this structure:

### 1. **The Hook — A Real-Life Story or Analogy** (Opening)
- Start with an **anecdote**, a **real-world scenario**, or a **system/everyday analogy**
  that the reader can immediately relate to.
- This is NOT an abstract intro. It should be a vivid, specific story:
  - A restaurant kitchen during rush hour → feed architecture
  - A hospital ER triage system → request prioritization
  - A post office sorting facility → message queues
  - A city traffic control center → load balancing
  - A team of specialists in a consulting firm → multi-agent systems
- The analogy must **directly map** to the core technology being discussed.
- Use a comparison table or inline mappings to show the analogy-to-tech correspondence.

### 2. **Bridging the Analogy — The Technical Deep Dive**
- Transition from the analogy into the actual technology.
- Use the phrase pattern: *"Now, translate this to software..."* or *"Back in the digital world..."*
- Include:
  - **Architecture diagrams** (ASCII art or text-based flow diagrams)
  - **Tiered breakdowns** with numbered sub-sections (Tier 1, Tier 2, etc.)
  - **Concrete specifics**: name real tools, protocols, and patterns (Redis, Kafka, ONNX, gRPC, etc.)
  - **Real numbers**: latency targets (sub-100ms p99), throughput figures, data sizes
- Keep explanations **accessible but not shallow** — the reader should learn something
  they can use in a real system, not just a surface overview.

### 3. **Deep Insights — The "What Most People Miss"**
- Add a section with **non-obvious insights** or **battle-tested lessons** that go beyond
  textbook knowledge:
  - Edge cases, failure modes, counter-intuitive behaviors
  - Trade-offs that only show up at scale
  - Common mistakes and how to avoid them
  - Why the "obvious" approach fails
- Frame these as insights from experience, not as dry warnings.

### 4. **Hardening / Production Reality** (Optional but Recommended)
- If applicable, discuss how the system behaves under real-world stress:
  - Failure handling, graceful degradation, circuit breakers
  - Stampede protection, cache thundering herd prevention
  - Observability, tracing, monitoring patterns

### 5. **Key Takeaways — The "Walk Away With This"** (Closing)
- End with a structured **"Key Takeaways"** or **"What to Remember"** section.
- Use a numbered list or bullet points (3–7 items).
- Each takeaway should be a **standalone, actionable insight** — something the reader
  can apply immediately without re-reading the full article.
- Optionally close with a forward-looking statement or a teaser for a follow-up post.

---

## Writing Style Guidelines

### Tone & Voice
- **Conversational but authoritative**: Write like a senior engineer mentoring a
  mid-level developer — warm, direct, and knowledgeable.
- **First-person where appropriate**: Use "I've seen...", "In my experience...",
  "We ran into this at scale..." to ground technical claims in lived experience.
- **Avoid pure academic tone**: No "In this paper we propose..." or
  "This section describes..." — these are blogs, not whitepapers.

### Technical Depth
- **Deep but not dense**: Explain *why* something works, not just *what* it is.
- **No jargon without context**: If you use a term like "fan-out" or "bloom filter",
  briefly explain it inline or through the analogy on first use.
- **Show, don't just tell**: Use code snippets, ASCII diagrams, tables, and math
  formulas where they add clarity — but always surround them with plain-language
  explanation.

### Formatting
- Use **horizontal rules** (`---`) to separate major sections.
- Use **tables** to map analogies to technical concepts.
- Use **bold text** for key terms on first introduction.
- Use **inline code** for tool names, commands, config keys.
- Use **blockquotes** for key insights or memorable one-liners.
- Keep paragraphs short (3–5 sentences max).

---

## Frontmatter Template (Astro Content Collection)

Every blog file must start with this YAML frontmatter:

```yaml
---
draft: false
featured: "1"  # "none", "1", "2", or "3"
title: "Your Engaging Title Here"
description: "A concise one-liner summarizing what the reader will learn."
authors:
  - "Kaushik Kumar Mahato"
pubDate: YYYY-MM-DD
license: mit
tags:
  - Tag1
  - Tag2
image:
  src: "/images/your-image.jpg"
  alt: "Descriptive alt text for the image"
---
```

---

## Quality Checklist (Before Finalizing)

Before marking a blog as complete, verify:

- [ ] Opens with a vivid, relatable analogy or real-life story
- [ ] Analogy maps cleanly to the technical concept (table or inline mapping)
- [ ] Smooth transition from story to technical deep dive
- [ ] Architecture diagrams or visual aids included
- [ ] Real tools, numbers, and patterns are named (not vague hand-waving)
- [ ] At least 2–3 non-obvious insights or "what most people miss" points
- [ ] Key takeaways section at the end (3–7 actionable items)
- [ ] Conversational but authoritative tone throughout
- [ ] Frontmatter is valid per the Astro schema
- [ ] No orphaned technical jargon (everything is explained or analogized)

---

## Example Flow

See [examples/blog-template.md](./examples/blog-template.md) for a reference template
showing the full structure in action.
