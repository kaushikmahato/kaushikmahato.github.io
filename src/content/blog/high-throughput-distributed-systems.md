---
draft: false
featured: "2"
title: "Scaling High-Throughput Feeds: Lessons from Millions of Users"
description: "How to achieve sub-100ms p99 latency in real-time feeds by splitting offline computation from low-latency runtime re-ranking."
authors:
  - "Kaushik Kumar Mahato"
pubDate: 2026-09-27
license: mit
tags:
  - Distributed Systems
  - Scaling
  - Performance
  - Architecture
  - GolBol
image:
  src: "/images/golbol-feed-scaling.jpg"
  alt: "GolBol feed scaling and high-throughput architecture illustration"
---

Building a real-time feed that achieves sub-100ms p99 latency requires treating feed generation not as a single query, but as an assembly line that splits heavy offline computation from low-latency runtime re-ranking.

---

## The Restaurant Kitchen Analogy: The Art of "Mise en Place"

I once walked into a tiny, legendary ramen shop in Tokyo during the peak of lunch rush. The line snaked around the block, but it moved incredibly fast. If you watched the chef, it looked like sheer chaos—orders shouted over the din, steam billowing, bowls flying across the counter.

But look closer, and it wasn’t chaos at all. It was a meticulously engineered system.

If that chef waited until you sat down to peel the garlic, boil the pork bones from scratch for 12 hours, and hand-pull the noodles, you'd wait all day for a single bowl. The shop would collapse within 10 minutes.

Instead, professional kitchens run on *mise en place* ("everything in its place"). Building a sub-100ms feed architecture requires the exact same philosophy. You cannot compute a customized feed from scratch when the user opens the app. You must have the ingredients prepped.

| Kitchen Station | Feed Architecture Equivalent | What It Does |
| :--- | :--- | :--- |
| **Morning Bulk Prep**<br>*(12-hour pork broth, blanched noodles)* | **Big Data / Offline Tier**<br>*(Spark, Ray, Databricks)* | Computes heavy long-term affinity graphs, vector embeddings, and baseline candidate pools over millions of items. |
| **The Line Cook's Counter**<br>*(Pre-chopped scallions, sliced chashu in chilled bins)* | **In-Memory Materialized Cache**<br>*(Redis, Aerospike, KeyDB)* | Fast, read-optimized storage holding hot candidate IDs, standard-user fan-out timelines, and real-time counters (likes). |
| **The VIP Whiteboard**<br>*(Daily specials, urgent 86-list)* | **Real-Time Event Stream**<br>*(Kafka, Flink)* | Captures breaking viral content, celebrity posts, and immediate session updates (e.g., skips, rapid clicks). |
| **The 90-Second Flash Fry in the Wok** | **Online Scoring & Assembly Engine** | Pulls the prepped base, tosses in the guest’s real-time modifiers, applies lightweight scoring, and plates the feed in 15ms. |

None of the pre-boiled noodles are wasted. Blanched noodles and chopped scallions form the common baseline for dozens of distinct menu items. If an order never comes for the spicy miso ramen, those noodles can just as easily go into the shoyu ramen. This is the essence of scaling feed architectures.

---

## What Most People Miss: The Hidden Realities of Scale

Before diving into the architecture, we need to address the hard truths of scaling feeds. Most textbook architectures fail in production because they ignore these realities.

### 1. The Taylor Swift Problem (Why Pure Fan-Out Fails)
If you build a feed by eagerly pushing every new post to every follower's timeline ("fan-out-on-write"), it works beautifully—until a celebrity with 100 million followers posts a photo. Suddenly, you're writing 100 million database rows in seconds. The database melts. At scale, you *must* isolate high-follower accounts and handle them via "fan-out-on-read."

### 2. The Hidden Cost of Cache Invalidation
Materialized timelines are great, but cache invalidation is the silent killer. When a post gets deleted or its privacy changes, trying to find and remove that specific post ID from millions of cached timelines is a nightmare. Instead of purging, smart systems use "tombstones" or check a central valid-state service during the final hydration step.

### 3. Why p99 Matters More Than p50
Your average response time (p50) might be a blazing 30ms, but if your 99th percentile (p99) is 800ms, that means 1% of requests are painfully slow. In a microservice architecture where loading one page requires dozens of internal requests, a bad p99 almost guarantees a terrible user experience. The long tail kills retention.

### 4. The Counter-Intuitive Truth About Precomputation
It feels wasteful to compute things you might never use. Why calculate a feed for a user who might not log in today? Because computing things you *may* never serve is infinitely cheaper than trying to compute *everything* on the fly for the users who *do* log in. CPU cycles in batch offline processing are cheap; CPU cycles blocking a live user request are priceless.

---

## Deep Dive: Hybrid Recommendation & In-Memory Architecture

Translating this kitchen analogy into an end-to-end feed pipeline creates a tiered system that keeps the primary database completely out of the critical read path:

```text
[ Offline / Big Data Batch ]          [ Real-Time Stream (Kafka / Flink) ]
 (Collaborative Filtering,               (User Clicks, Celebrity Posts,
  Vector Embeddings, Graph)                      Session Intent)
            │                                           │
            ▼                                           ▼
[ Candidate Generation Pools ]            [ Live Signals & Real-time Churn ]
            │                                           │
            └───────────────────┬───────────────────────┘
                                ▼
               ┌──────────────────────────────────┐
               │    IN-MEMORY DATA TIER           │
               │    (Redis / Aerospike Cluster)   │
               │  • Materialized Friend Timelines │
               │  • Pre-filtered Candidate Sets   │
               │  • Real-Time Feature Store       │
               └────────────────┬─────────────────┘
                                │ (Sub-10ms fetch)
                                ▼
               ┌──────────────────────────────────┐
               │      ONLINE RANKING ENGINE       │
               │  • Merge High-Follower Posts     │
               │  • Light ML Scoring (GBDT/ONNX)  │
               │  • Deduplication & Freshness     │
               └────────────────┬─────────────────┘
                                │ (Sub-50ms assemble)
                                ▼
                       [ Client Device ]
```

---

### 1. The Offline / Big Data Tier (Morning Bulk Prep)

Just like simmering the 12-hour pork broth, this tier does the heavy lifting:
- **Candidate Generation Retrieval**: Runs periodic matrix factorization, two-tower embedding generation, or graph walks across millions of candidates.
- **Coarse Pruning**: Reduces a universe of $10^7$ pieces of content down to a few thousand potential candidate items per topic, cohort, or active user.
- **Storage Target**: Writes pre-computed candidate lists directly to fast key-value storage or vector indices (Milvus, Pinecone, or Redis HNSW).

---

### 2. The In-Memory Tier & Core Content Churn (The Line Cook's Counter)

This is your chilled prep station holding the pre-chopped scallions, ready for instant access.

#### Hybrid Fan-Out Handling
- **Standard creators ($<10{,}000$ followers)**: Posts fan out on write directly to the in-memory follower timelines (`LPUSH` / `ZADD` in Redis with capped lengths, e.g., 800 IDs).
- **High-follower accounts ("celebrities")**: Remember the Taylor Swift problem? Write fan-out is skipped to prevent write amplification. Their posts land in an isolated hot-item timeline that gets dynamically merged on read (the "VIP Whiteboard").

#### Handling High Churn
- Instead of storing full post payloads in the feed lists, store only compact 64-bit integer IDs. The actual content metadata lives in a secondary replicated memory store.
- Fast state updates (view counts, likes, deletion flags) occur via in-memory atomic counters (`INCRBY`) and Bloom filters or Cuckoo filters for viewed-item deduplication.

---

### 3. Real-Time Event Stream (The "Specials Board")

A user's intent shifts minute-by-minute. Streaming pipelines (Kafka + Flink) track live session signals (e.g., the user just watched three skateboarding videos in a row).

Flink writes ephemeral session feature vectors directly to the user's live memory profile with a short TTL (5–15 minutes), acting as the urgent "specials of the day" for the online ranker to incorporate immediately.

---

### 4. The Online Serving Layer (The 90-Second Flash Fry in the Wok)

When a user opens the app (`GET /feed`), it’s time to throw the ingredients into the wok:

1. **Parallel Fetch (5–10ms)**: Fetch the user's pre-computed candidate list from Redis (the blanched noodles), pull recent posts from high-follower accounts they follow (VIP specials), and fetch the real-time session vector.
2. **Set Deduplication**: Exclude already-viewed IDs (checked against an in-memory Redis bitset or Bloom filter stored per user).
3. **Hybrid Re-Ranking (15–30ms)**: Pass the combined 200–500 candidate items through a lightweight online scoring model (e.g., an ONNX-runtime cross-encoder or GBDT) evaluated against the live session vector (tossing in the guest's real-time modifiers).
4. **Hydration & Assembly (5ms)**: Hydrate only the top 20 chosen IDs with their UI metadata and ship the JSON response (plating the dish).

---

## Hardening Against Stampedes and Degradation

To ensure this pipeline maintains sub-100ms p99 latency during peak traffic spikes (the unexpected busload of tourists walking into the ramen shop):

### Single-Flight Request Mutex
Using request deduplication (e.g., `golang/sync/singleflight`): when a user's candidate cache expires or needs re-ranking, single-flight ensures only one backend thread computes the ML inference or database fetch. Thousands of concurrent requests block on the same shared channel and receive the identical result simultaneously.

### Probabilistic Pre-Computation (XFetch)
The serving layer evaluates:

$$\Delta - \beta \cdot \delta \cdot \ln(\text{rand}()) > \text{TTL}$$

where $\delta$ is computation time and $\beta > 0$. High-traffic keys asynchronously recompute in a background worker before cache eviction happens, preventing zero-cache fallthroughs and thundering herd cascades. The kitchen prep cooks restock the scallions *before* the line cook completely runs out.

### Graceful Degradation (Load Shedding)
Under CPU pressure or network saturation, the ranker cuts expensive floating-point inference loops and immediately falls back to pure chronological order from the in-memory fan-out timeline. Serving a slightly less personalized feed in 20ms beats a perfect feed that times out at 500ms. In a kitchen rush, getting a good bowl of ramen out quickly is better than striving for Michelin-star perfection and making the customer wait an hour.

---

## Key Takeaways

- **Precompute Everything Possible:** Shift heavy lifting to offline batch processes. CPU time in the background is cheap; latency in the user request path is deadly.
- **Hybrid Fan-out is Mandatory:** Use fan-out-on-write for standard users, but fan-out-on-read for celebrities to avoid write amplification (The Taylor Swift problem).
- **Store IDs, Not Payloads:** Keep timelines extremely lightweight by only storing 64-bit IDs. Hydrate the full UI metadata at the very last step.
- **Protect the p99:** Use Singleflight to deduplicate concurrent requests and XFetch for probabilistic cache refreshing to prevent stampedes.
- **Fail Gracefully:** Build load-shedding mechanisms that fall back to chronological feeds when ML scoring is saturated. Fast and good is better than slow and perfect.
