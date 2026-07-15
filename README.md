# 🎯 PocketFM Product Insights Copilot Terminal

An advanced, responsive, and decision-driven product analytics dashboard built to monitor, model, and optimize user retention, coin-monetization pricing, release schedules, and audio playback latency profiles.

---

## 🚀 Key Decision Support Modules

### 1. 📈 Retention Analytics & Cohort Heatmaps
Descriptive cohort and daily retention decay analysis (D0–D30) mapping the user lifespan.
*   **Worked Formulas**: Explains step-by-step classic vs. rolling retention.
*   **Cohort Heatmap Grid**: Visualizes monthly retention milestones (D1 to D30) with density scaling.
*   **Show-Level Episode Funnel**: Select individual shows (e.g. *Ishq Mein Marjawan*, *Crime Patrol Stories*) to inspect episode-by-episode drop-offs and narrational exit triggers.
*   **Daily Cohort Journey**: Step-by-step cohort walkthroughs (Installs → Onboarded → Played >5m → Played >30m → Day 1 Retained → Day 30 Premium Convert).

### 2. 🧬 Audience Intelligence & Listening DNA
Deep behavioral archetype analysis transforming numbers into product personas.
*   **Genre DNA Radar Charts**: Dynamic mapping of genre affinity per user segment.
*   **24-Hour Listening Clocks**: Radial clock heatmaps highlighting peak session times.
*   **Binge Metrics**: Episode count ratios, session lengths, and weekly exploration volumes.
*   **🌊 Cross-Show Discovery Flow**: Custom SVG Sankey flow visualization tracking where listeners navigate after dropping or completing a show.

### 3. 🚨 Churn Alerts & Sentiment Monitors
Proactive triggers mapping technical and behavioral thresholds directly to remedial action plans.
*   **Custom Threshold Configurator**: Set active metrics monitors to alert you when target averages drop.
*   **Sentiment Keyword Cloud**: Extracts app store review patterns to contrast high retention drivers against paywall friction.

### 4. 🎚️ Coin Pricing & Release Schedulers
Decision-support modeling to forecast changes in product pricing and push delivery.
*   **Friction Pricing Simulator**: Sliders to model coin pricing per episode, free key limits, and ad bonuses to graph changes in conversion rates, ARPU, and LTV.
*   **Show Release Optimizer**: Align release batches with target segment listening routines to maximize organic lift.

---

## 🛠️ Playback Buffer & Network Diagnostics
Visual correlation metrics highlighting how playback buffering directly drives Day 1 uninstalls.
*   **Bitrate Mode Simulator**: Model switching streams from standard 128kbps to low-data 64kbps HE-AAC to reduce buffering ratios and improve rural network retention.
*   **Regional Anomalies List**: Operator scope flags identifying latency spikes across Indian network circles (like Bihar/Jharkhand or UP East).

---

## 💻 Tech Stack
*   **Framework**: Next.js 16 (App Router)
*   **Styling**: Modern, fluid variables system featuring responsive side-drawers and full Light & Dark mode support.
*   **Visualizations**: Recharts engine + custom SVG charts.
*   **AI Backend Integration**: Groq SDK + Llama 3.3 70B model logic.

---

## ⚙️ Getting Started

First, install the project dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** to explore the Product Insights Terminal.
