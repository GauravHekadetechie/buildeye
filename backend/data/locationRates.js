// data/locationRates.js
//
// Illustrative regional planning multipliers for Indian cities — NOT
// authoritative real-estate valuations. Actual land prices vary enormously
// even within a single locality (by neighbourhood, road width, plot
// orientation, approvals, etc.) and change constantly. Treat every number
// here as a broad planning range for comparing "roughly how much more
// expensive is building in Mumbai vs. a Tier-3 town", not as a quote —
// always get a local valuation before making a financial decision.
//
// constructionMultiplier: relative to the app's baseline construction
// rate (~₹1800-2600/sqft), reflecting that skilled labour, transport and
// material costs are themselves higher in metros.
// landRatePerSqft: an illustrative MIDPOINT of a wide typical range for
// land value in that city, used only to produce a ballpark "if you were
// buying this plot" figure alongside the construction estimate.

const LOCATIONS = [
  // --- Tier 1 metros ---
  { key: "mumbai", city: "Mumbai", state: "Maharashtra", tier: 1, constructionMultiplier: 1.55, landRatePerSqft: 25000 },
  { key: "delhi_ncr", city: "Delhi NCR", state: "Delhi", tier: 1, constructionMultiplier: 1.4, landRatePerSqft: 15000 },
  { key: "bengaluru", city: "Bengaluru", state: "Karnataka", tier: 1, constructionMultiplier: 1.35, landRatePerSqft: 9500 },
  { key: "hyderabad", city: "Hyderabad", state: "Telangana", tier: 1, constructionMultiplier: 1.25, landRatePerSqft: 6500 },
  { key: "chennai", city: "Chennai", state: "Tamil Nadu", tier: 1, constructionMultiplier: 1.25, landRatePerSqft: 6000 },
  { key: "kolkata", city: "Kolkata", state: "West Bengal", tier: 1, constructionMultiplier: 1.15, landRatePerSqft: 5000 },
  { key: "pune", city: "Pune", state: "Maharashtra", tier: 1, constructionMultiplier: 1.3, landRatePerSqft: 7500 },
  { key: "ahmedabad", city: "Ahmedabad", state: "Gujarat", tier: 1, constructionMultiplier: 1.15, landRatePerSqft: 5500 },

  // --- Tier 2 cities ---
  { key: "jaipur", city: "Jaipur", state: "Rajasthan", tier: 2, constructionMultiplier: 1.05, landRatePerSqft: 3500 },
  { key: "lucknow", city: "Lucknow", state: "Uttar Pradesh", tier: 2, constructionMultiplier: 1.0, landRatePerSqft: 3000 },
  { key: "chandigarh", city: "Chandigarh", state: "Chandigarh", tier: 2, constructionMultiplier: 1.15, landRatePerSqft: 7000 },
  { key: "indore", city: "Indore", state: "Madhya Pradesh", tier: 2, constructionMultiplier: 1.0, landRatePerSqft: 3200 },
  { key: "nagpur", city: "Nagpur", state: "Maharashtra", tier: 2, constructionMultiplier: 1.0, landRatePerSqft: 2800 },
  { key: "surat", city: "Surat", state: "Gujarat", tier: 2, constructionMultiplier: 1.05, landRatePerSqft: 4000 },
  { key: "coimbatore", city: "Coimbatore", state: "Tamil Nadu", tier: 2, constructionMultiplier: 1.0, landRatePerSqft: 3500 },
  { key: "kochi", city: "Kochi", state: "Kerala", tier: 2, constructionMultiplier: 1.1, landRatePerSqft: 4500 },
  { key: "bhopal", city: "Bhopal", state: "Madhya Pradesh", tier: 2, constructionMultiplier: 0.95, landRatePerSqft: 2500 },
  { key: "vadodara", city: "Vadodara", state: "Gujarat", tier: 2, constructionMultiplier: 1.0, landRatePerSqft: 3200 },
  { key: "visakhapatnam", city: "Visakhapatnam", state: "Andhra Pradesh", tier: 2, constructionMultiplier: 1.0, landRatePerSqft: 3000 },

  // --- Tier 3 / smaller towns & a generic fallback ---
  { key: "patna", city: "Patna", state: "Bihar", tier: 3, constructionMultiplier: 0.9, landRatePerSqft: 2200 },
  { key: "ranchi", city: "Ranchi", state: "Jharkhand", tier: 3, constructionMultiplier: 0.9, landRatePerSqft: 1800 },
  { key: "raipur", city: "Raipur", state: "Chhattisgarh", tier: 3, constructionMultiplier: 0.9, landRatePerSqft: 1800 },
  { key: "guwahati", city: "Guwahati", state: "Assam", tier: 3, constructionMultiplier: 0.95, landRatePerSqft: 2500 },
  { key: "dehradun", city: "Dehradun", state: "Uttarakhand", tier: 3, constructionMultiplier: 0.95, landRatePerSqft: 2800 },
  { key: "other", city: "Other city / town", state: "", tier: 3, constructionMultiplier: 0.85, landRatePerSqft: 1500 },
];

function getLocationByKey(key) {
  return LOCATIONS.find((l) => l.key === key) || LOCATIONS.find((l) => l.key === "other");
}

function listLocations() {
  return LOCATIONS.map(({ key, city, state, tier }) => ({ key, city, state, tier }));
}

module.exports = { LOCATIONS, getLocationByKey, listLocations };
