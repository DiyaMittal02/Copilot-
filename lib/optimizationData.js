// lib/optimizationData.js — Data models for Coin Pricing Simulator and Content Release Optimizer

export const pricingPresets = [
  {
    name: "Aggressive Coins (Current)",
    coinCost: 10,
    dailyFreeKeys: 2,
    adKeysEnabled: false,
    d1: 48.3,
    d7: 26.1,
    d30: 14.2,
    arpu: 84.5,
    projectedLtv: 114.2,
    conversion: 7.4
  },
  {
    name: "Balanced Ads + Coins",
    coinCost: 7,
    dailyFreeKeys: 3,
    adKeysEnabled: true,
    d1: 53.5,
    d7: 31.2,
    d30: 18.0,
    arpu: 92.1,
    projectedLtv: 148.5,
    conversion: 9.2
  },
  {
    name: "Low Friction Acquisition",
    coinCost: 4,
    dailyFreeKeys: 5,
    adKeysEnabled: true,
    d1: 61.2,
    d7: 38.6,
    d30: 22.4,
    arpu: 68.2,
    projectedLtv: 134.8,
    conversion: 11.5
  }
];

export const optimizerShows = [
  {
    id: "ishq",
    title: "Ishq Mein Marjawan",
    targetAudience: "The Weekend Binger (Romance/Drama)",
    currentSchedule: "Mon-Wed morning releases",
    optimalDays: ["Friday", "Saturday"],
    optimalHour: "8 PM",
    engagementBoost: "+18.4% D7 Retention",
    insights: "Bingers listen during Friday night through Sunday evening. Releasing during weekdays creates high episode backlogs which increases churn probability."
  },
  {
    id: "crime",
    title: "Crime Patrol Stories",
    targetAudience: "The Daily Commuter (Thriller/Mystery)",
    currentSchedule: "Sunday night batch releases",
    optimalDays: ["Monday", "Wednesday", "Friday"],
    optimalHour: "7:30 AM",
    engagementBoost: "+12.2% D7 Retention",
    insights: "Commuters listen morning and evening during transit. Small regular drops during weekday commute windows capture highest Day-1 repeat playrates."
  },
  {
    id: "raat",
    title: "Raat Ka Safar",
    targetAudience: "The Late Night Explorer (Horror)",
    currentSchedule: "Friday midday releases",
    optimalDays: ["Thursday", "Friday", "Saturday"],
    optimalHour: "10:30 PM",
    engagementBoost: "+24.5% Listen Depth",
    insights: "Atmospheric horror peaks in engagement in late-night streams. Midday pushes result in low open rates. Optimize push delivery to 10:00 PM."
  }
];
