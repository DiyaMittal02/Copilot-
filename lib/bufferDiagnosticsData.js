// lib/bufferDiagnosticsData.js — Buffering latency, playback drops, and churn data

export const bufferDataPoints = [
  { latency: 50,  bitrate: 128, bufferingRatio: 0.8,  d1Churn: 12.4, label: "Metro (Fiber/5G)" },
  { latency: 120, bitrate: 128, bufferingRatio: 2.1,  d1Churn: 18.6, label: "Tier 1 (4G Good)" },
  { latency: 250, bitrate: 128, bufferingRatio: 5.4,  d1Churn: 29.8, label: "Tier 2 (4G Spotty)" },
  { latency: 450, bitrate: 128, bufferingRatio: 12.8, d1Churn: 48.2, label: "Rural (3G/Poor 4G)" },
  { latency: 600, bitrate: 128, bufferingRatio: 18.5, d1Churn: 62.1, label: "Deep Rural (Edge)" },
];

export const bufferOptimizedDataPoints = [
  { latency: 50,  bitrate: 64, bufferingRatio: 0.2,  d1Churn: 8.5,  label: "Metro (Fiber/5G)" },
  { latency: 120, bitrate: 64, bufferingRatio: 0.6,  d1Churn: 11.2, label: "Tier 1 (4G Good)" },
  { latency: 250, bitrate: 64, bufferingRatio: 1.4,  d1Churn: 16.4, label: "Tier 2 (4G Spotty)" },
  { latency: 450, bitrate: 64, bufferingRatio: 3.2,  d1Churn: 22.8, label: "Rural (3G/Poor 4G)" },
  { latency: 600, bitrate: 64, bufferingRatio: 5.1,  d1Churn: 31.0, label: "Deep Rural (Edge)" },
];

export const bufferingAnomaliesList = [
  {
    region: "Bihar & Jharkhand Circles",
    network: "Jio 4G / Airtel 4G",
    avgLatency: "380ms",
    playbackFailures: "8.4%",
    d1ChurnImpact: "+14.2% spike",
    remedy: "Force 64kbps HE-AACv2 audio streaming codec profile for latency measurements > 300ms."
  },
  {
    region: "Uttar Pradesh East",
    network: "Vi Mobile Edge",
    avgLatency: "510ms",
    playbackFailures: "12.1%",
    d1ChurnImpact: "+21.8% spike",
    remedy: "Enable aggressive progressive pre-caching (buffer next 3 episodes during active audio stream)."
  }
];
