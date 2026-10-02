---
draft: false
featured: "2"
title: "Scaling High-Throughput Feeds: Lessons from Millions of Users"
description: "Key insights on low-latency caching, event-driven pipelines, and distributed fan-out architectures under extreme concurrency."
authors:
  - "Kaushik Kumar Mahato"
pubDate: 2026-09-27
license: mit
tags:
  - Distributed Systems
  - Scaling
  - Performance
  - Architecture
image:
  src: "/images/developer-desk.jpg"
  alt: "Scaling high-throughput feeds under extreme concurrency"
---

Serving real-time content feeds to millions of concurrent users is one of the most demanding problems in software engineering. When user engagement spikes, database bottlenecks, network saturation, and cache invalidation stampedes can rapidly cascade across an entire infrastructure.

Over years of engineering feed mechanics and real-time ingestion pipelines across consumer platforms, several architectural patterns proved indispensable for maintaining sub-100ms p99 latencies under extreme load.

## 1. Fan-Out on Write vs. Fan-Out on Read

The classic dilemma in timeline and feed generation revolves around when to do the aggregation work:

- **Fan-Out on Write (Push)**: When a creator posts, fan out that event into the pre-computed feed caches of every follower.
  - *Pros*: O(1) read latency. Users instantly fetch their ready-made timeline.
  - *Cons*: Catastrophic write amplification when a user with millions of followers posts.
- **Fan-Out on Read (Pull)**: When a user loads their feed, query and merge the latest posts of all accounts they follow.
  - *Pros*: Instant writes, zero fan-out storage amplification.
  - *Cons*: Heavy read amplification and slow tail latencies.

### The Hybrid Solution
In real-world consumer systems, a hybrid architecture yields the best tradeoffs:
1. **Standard Users (<10,000 followers)**: Use fan-out on write into low-latency memory stores (Redis / Aerospike).
2. **High-Follower Accounts**: Avoid write fan-out. Instead, dynamically inject their latest posts into the client's feed at read time via a secondary merge layer.

## 2. Preventing Cache Stampedes

Under high concurrency, when a popular cache key expires, thousands of incoming requests can simultaneously hit the underlying database—a classic cache stampede.

Two patterns effectively eliminate this failure mode:

- **Probabilistic Early Recomputation (XFetch)**: Before a key strictly expires, incoming reads evaluate an exponential probability function based on time-to-live and query computation cost. A background worker refreshes the cache before eviction ever occurs.
- **Single-Flight Request Mutexes**: In Go or distributed workers, mutex locks ensure that only one thread computes the expensive backend query while all concurrent callers wait on the same channel for the result.

## 3. Tiered Caching & Graceful Degradation

No single caching layer is sufficient when serving millions of requests per second:
1. **Edge / CDN Caching**: Stale-while-revalidate policies at the edge serve warm responses while asynchronous requests update underlying data.
2. **Local In-Memory Cache (LRU in service process)**: Bypasses network overhead for the hottest keys (top 1% traffic).
3. **Distributed In-Memory Tier (Redis Cluster)**: Shared cache pool with cluster sharding and read replicas.

When downstream backpressure mounts, the feed service sheds optional computationally heavy ranking heuristics and serves chronological fallbacks rather than degrading into timeouts.

Building systems capable of handling massive consumer scale is fundamentally about managing complexity, bounding blast radiuses, and designing every component with failure as an expected baseline.
