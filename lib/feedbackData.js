// lib/feedbackData.js — Structured feedback, app store reviews, and alert configurations for PocketFM

export const churnAlerts = [
  {
    id: "alert-1",
    metric: "D7 Retention Dip",
    currentValue: "26.1%",
    threshold: "< 27.0%",
    severity: "danger",
    timeDetected: "2 hours ago",
    status: "Active",
    triggerReason: "D7 retention dipped 0.9% below target threshold of 27.0% for the May cohort.",
    actionPlan: [
      "Review recently added friction steps in the language selection screen.",
      "Check push notification delivery rates for cohorts entering days 5 to 7.",
      "Trigger targeted coin bonus re-engagement campaign to high-risk free listeners."
    ]
  },
  {
    id: "alert-2",
    metric: "Binge Session Churn",
    currentValue: "34.2 min/session",
    threshold: "< 38.0 min",
    severity: "warning",
    timeDetected: "1 day ago",
    status: "Active",
    triggerReason: "Average listening session duration dropped from 43.7 min to 34.2 min.",
    actionPlan: [
      "Analyze coin pricing adjustments introduced on Wednesday.",
      "Investigate playback buffer failure rate spikes from app version 4.12.0 update.",
      "Run targeted content discovery widgets in the main feed for casual listeners."
    ]
  },
  {
    id: "alert-3",
    metric: "Weekly Episode Completion",
    currentValue: "55.0% (Kahaani)",
    threshold: "< 60.0%",
    severity: "warning",
    timeDetected: "3 days ago",
    status: "Investigating",
    triggerReason: "Completion rate on Episode 10 of thriller series 'Kahaani' fell to 55.0%.",
    actionPlan: [
      "Audit script pacing of Kahaani Episodes 8 to 12 via creator group feedback.",
      "A/B test teaser trailer thumbnail and audio hook options for Episode 11.",
      "Deploy custom 'Next episode preview' popup to listeners exiting mid-story."
    ]
  }
];

export const userFeedbackData = {
  summary: {
    totalAnalyzed: 1420,
    averageRating: 3.8,
    topPositiveKeywords: ["Addictive Storytelling", "Voice Actors", "Diverse Genres", "Mythology Narrations"],
    topNegativeKeywords: ["Coin System Expensive", "Frequent Audio Buffering", "Sudden Paywalls", "App Crashes on Playback"]
  },
  topics: [
    {
      name: "Monetization & Pricing",
      mentions: 580,
      sentiment: "Highly Negative",
      summary: "Users find the coin progression system increasingly expensive, especially for long-running romance and drama series.",
      quotes: [
        { rating: 2, date: "Jun 14, 2026", text: "Too many coins required to unlock the next chapter. It's cheaper to watch streaming video services." },
        { rating: 3, date: "Jun 12, 2026", text: "Story is amazing but the pricing has ruined the fun. Please give a monthly subscription plan instead of coins." }
      ],
      recommendations: [
        "A/B test a local monthly pass tier in India (e.g. ₹99/mo) for single-show access.",
        "Introduce reward coins for watching opt-in rewarded video ads to retain low-LTV free users."
      ]
    },
    {
      name: "App Playback Performance",
      mentions: 340,
      sentiment: "Negative",
      summary: "High buffering frequency and frequent crashes mid-audio track, especially on low-bandwidth networks in Tier 2/3 cities.",
      quotes: [
        { rating: 1, date: "Jun 15, 2026", text: "The app keeps loading and buffering even when my connection is strong. Very frustrating experience." },
        { rating: 2, date: "Jun 11, 2026", text: "Whenever I lock my phone screen, the audio player pauses automatically and doesn't resume." }
      ],
      recommendations: [
        "Optimize audio bitrates (introduce a 64kbps Low Data mode) for rural regions.",
        "Fix background audio service execution constraints in Android battery saver settings."
      ]
    },
    {
      name: "Content Quality & Story Pacing",
      mentions: 290,
      sentiment: "Positive / Mixed",
      summary: "Narrators and voice actors get highly praised, but users complain about show length inflation and artificial fillers.",
      quotes: [
        { rating: 4, date: "Jun 13, 2026", text: "Voices are outstanding. It feels like watching a movie with closed eyes. But stories are stretched too much." },
        { rating: 3, date: "Jun 10, 2026", text: "The first 50 episodes are peak drama. After that, they repeat the same conflict to drag it out." }
      ],
      recommendations: [
        "Set strict episode length and count limits for creators based on completion curves.",
        "Deploy audience feedback loops directly inside the audio player screen."
      ]
    }
  ]
};
