# 🧚‍♀️ Zixie — Code Plagiarism, Collusion & AI Detection Platform

> **Real-time structural code integrity, cheating ring clustering, and AI detection for technical assessments.**

---

## ⚡ What is Zixie?

In online and remote technical interviews, candidates frequently copy code from peers, use generative AI, or collaborate in cheating groups while renaming variables to evade detection.

**Zixie** solves this through deep static analysis and graph theory:
1. **Structural Token Normalization:** Strips comments, whitespace, and masks variable/function identifiers to neutralize variable-renaming tricks.
2. **Winnowing Algorithm (MOSS-style):** Rolling Karp-Rabin hashing with sliding-window minimum fingerprinting.
3. **Running Karp-Rabin Greedy String Tiling (RKR-GST, JPlag-style):** Detects moved, reordered, and verbatim code logic tiles.
4. **AI Generation Pipeline:** Heuristic stylometry and perplexity analysis detecting ChatGPT, Claude, and Copilot patterns.
5. **Collusion Ring Clustering:** Graph theory (Union-Find) clustering candidates into connected cheating networks.
6. **Side-by-Side Visual Diff:** Interactive split-screen inspector with highlighted match tiles.

---

## 🏗️ Architecture & Monorepo Structure

```
zixie/
├── packages/
│   ├── engine/          # Pure TypeScript algorithmic core (Winnowing, RKR-GST, AST, AI Detector)
│   ├── server/          # Fastify backend REST API (Multipart uploads, session reports)
│   └── client/          # React 19 + Vite + Tailwind CSS dashboard (Stitch screens, Graph diffs)
├── package.json         # Root npm workspaces
└── tsconfig.base.json   # Unified TypeScript configuration
```

---

## 🚀 Quickstart

```bash
# Install dependencies across all workspaces
npm install

# Build all packages
npm run build

# Run unit test suite
npm run test

# Launch development servers
npm run dev:server    # Backend API on http://localhost:4000
npm run dev:client    # Web Dashboard on http://localhost:3000
```

---

## 🛣️ Phased Roadmap

- [x] **Phase 1:** Project Scaffolding, Monorepo Setup & Git Remote Configuration
- [ ] **Phase 2:** Core Algorithmic Engine (Winnowing, RKR-GST & AI Heuristics)
- [ ] **Phase 3:** Multi-Language AST Parsing & Collusion Graph Clustering
- [ ] **Phase 4:** Fastify Backend REST API & Batch Ingestion
- [ ] **Phase 5:** Stitch Frontend Integration, Smooth Transitions & Diff Viewer
- [ ] **Phase 6:** Sample Benchmarks, Documentation & Final Polish

---

## 📜 License
MIT © Abhijeet Singh
