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

Imagine walking into a high-end wok restaurant during peak dinner rush.

If the chef waited until an order arrived to peel the carrots, chop the scallions, soak the noodles, and boil the rice from scratch, customers would wait 45 minutes for a single bowl. The kitchen would collapse within 10 minutes.

Instead, professional kitchens run on *mise en place* ("everything in its place"):

| Kitchen Station | Feed Architecture Equivalent | What It Does |
| :--- | :--- | :--- |
| **Morning Bulk Prep**<br>*(Boiled rice, blanched noodles, slow-simmered broth)* | **Big Data / Offline Tier**<br>*(Spark, Ray, Databricks)* | Computes long-term affinity graphs, historical embeddings, cold-start profiles, and baseline candidate pools over millions of items. |
| **The Line Cook's Counter**<br>*(Pre-chopped veggies, pre-marinated proteins in chilled bins)* | **In-Memory Materialized Cache**<br>*(Redis, Aerospike, KeyDB)* | Fast, read-optimized storage holding hot candidate IDs, standard-user fan-out timelines, and real-time counter states (likes, impressions). |
| **The VIP Whiteboard**<br>*(Specials of the day, urgent 86-list)* | **Real-Time Event Stream / Secondary Merge**<br>*(Kafka, Flink)* | Captures breaking viral content, high-follower/celebrity posts, and immediate session updates (e.g., skips, recent clicks). |
| **The 90-Second Flash Fry in the Wok** | **Online Scoring & Assembly Engine** | Pulls the prepped base (noodles), tosses in the guest’s real-time modifiers (extra spice, no peanuts), applies light scoring, and plates the feed in 15 milliseconds. |

None of the pre-boiled noodles are wasted because blanched noodles and pre-chopped greens form the common baseline for dozens of distinct menu items. If an order never comes for dish A, those noodles can just as easily go into dish B.

---

## Deep Dive: Hybrid Recommendation & In-Memory Architecture

Translating hybrid fan-out, probabilistic precomputation, and tiered caching into an end-to-end feed pipeline creates a tiered system that keeps the primary database completely out of the critical read path:

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

### 1. The Offline / Big Data Tier (Bulk Prep)

- **Candidate Generation Retrieval**: Runs periodic matrix factorization, two-tower embedding generation, or graph walks across millions of candidates.
- **Coarse Pruning**: Reduces a universe of $10^7$ pieces of content down to a few thousand potential candidate items per topic, cohort, or active user.
- **Storage Target**: Writes pre-computed candidate lists directly to fast key-value storage or vector indices (Milvus, Pinecone, or Redis HNSW).

---

### 2. The In-Memory Tier & Core Content Churn (Chilled Line Prep)

#### Hybrid Fan-Out Handling
- **Standard creators ($<10{,}000$ followers)**: Posts fan out on write directly to the in-memory follower timelines (`LPUSH` / `ZADD` in Redis with capped lengths, e.g., 800 IDs).
- **High-follower accounts ("celebrities")**: Write fan-out is skipped to prevent write amplification. Their posts land in an isolated hot-item timeline that gets dynamically merged on read.

#### Handling High Churn
- Instead of storing full post payloads in the feed lists, store only compact 64-bit integer IDs. The actual content metadata (captions, media URLs, author info) lives in a secondary replicated memory store.
- Fast state updates (view counts, likes, deletion flags) occur via in-memory atomic counters (`INCRBY`) and Bloom filters or Cuckoo filters for viewed-item deduplication.

---

### 3. Real-Time Event Stream (The "Specials Board")

A user's intent shifts minute-by-minute. Streaming pipelines (Kafka + Flink) track live session signals (e.g., the user just watched three skateboarding videos in a row).

Flink writes ephemeral session feature vectors directly to the user's live memory profile with a short TTL (5–15 minutes).

---

### 4. The Online Serving Layer (The Flash Wok)

When a user opens the app (`GET /feed`):

1. **Parallel Fetch (5–10ms)**: Fetch the user's pre-computed candidate list from Redis, pull recent posts from high-follower accounts they follow, and fetch the real-time session vector.
2. **Set Deduplication**: Exclude already-viewed IDs (checked against an in-memory Redis bitset or Bloom filter stored per user).
3. **Hybrid Re-Ranking (15–30ms)**: Pass the combined 200–500 candidate items through a lightweight online scoring model (e.g., an ONNX-runtime cross-encoder or GBDT) evaluated against the live session vector.
4. **Hydration & Assembly (5ms)**: Hydrate only the top 20 chosen IDs with their UI metadata and ship the JSON response.

---

## Hardening Against Stampedes and Degradation

To ensure this pipeline maintains sub-100ms p99 latency during peak traffic spikes:

### Single-Flight Request Mutex
Using request deduplication (e.g., `golang/sync/singleflight`): when a user's candidate cache expires or needs re-ranking, single-flight ensures only one backend thread computes the ML inference or database fetch. Thousands of concurrent requests block on the same shared channel and receive the identical result simultaneously.

### Probabilistic Pre-Computation (XFetch)
The serving layer evaluates:

$$\Delta - \beta \cdot \delta \cdot \ln(\text{rand}()) > \text{TTL}$$

where $\delta$ is computation time and $\beta > 0$. High-traffic keys asynchronously recompute in a background worker before cache eviction happens, preventing zero-cache fallthroughs and thundering herd cascades.

### Graceful Degradation (Load Shedding)
Under CPU pressure or network saturation, the ranker cuts expensive floating-point inference loops and immediately falls back to pure chronological order from the in-memory fan-out timeline. Serving a slightly less personalized feed in 20ms beats a perfect feed that times out at 500ms.
