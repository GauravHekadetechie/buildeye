// data/vastuGuidelines.js
//
// Reference points drawn from commonly cited, traditional Vastu Shastra
// conventions for Indian residential layouts. This is presented as
// traditional/cultural design guidance that many Indian homeowners choose
// to follow — not as a structural, safety or legal requirement. Buildeye
// surfaces it as an optional layer on top of the engineering plan.

const VASTU_GUIDE = {
  "Kitchen": {
    ideal: ["SE"],
    acceptable: ["NW"],
    avoid: ["NE", "SW"],
    rationale:
      "The South-East corner is traditionally associated with Agni (fire) and is considered the ideal placement for a kitchen.",
  },
  "Master Bedroom": {
    ideal: ["SW"],
    acceptable: ["S", "W"],
    avoid: ["NE", "SE"],
    rationale:
      "The South-West is traditionally considered the most stable direction, associated with strength and is favoured for the primary bedroom.",
  },
  "Bedroom 2": {
    ideal: ["W", "NW", "S"],
    acceptable: ["E"],
    avoid: ["NE"],
    rationale: "Secondary bedrooms are traditionally placed away from the North-East, which is reserved for worship and open space.",
  },
  "Bedroom 3": {
    ideal: ["W", "NW", "S"],
    acceptable: ["E"],
    avoid: ["NE"],
    rationale: "Secondary bedrooms are traditionally placed away from the North-East, which is reserved for worship and open space.",
  },
  "Pooja Room": {
    ideal: ["NE"],
    acceptable: ["E", "N"],
    avoid: ["S", "SW"],
    rationale:
      "The North-East, or 'Ishaan' corner, is traditionally regarded as the most sacred zone and the customary placement for a prayer room.",
  },
  "Living Room": {
    ideal: ["N", "E", "NE"],
    acceptable: ["NW"],
    avoid: ["SW"],
    rationale: "Living and reception areas are traditionally placed toward the North or East to welcome morning light and guests.",
  },
  "Dining Area": {
    ideal: ["W"],
    acceptable: ["N", "E"],
    avoid: ["NE"],
    rationale: "The West is traditionally considered favourable for a dining area, ideally adjoining the kitchen.",
  },
  "Bathroom 1": {
    ideal: ["NW", "W"],
    acceptable: ["S"],
    avoid: ["NE", "SW"],
    rationale: "Bathrooms and toilets are traditionally kept away from the North-East and South-West corners.",
  },
  "Bathroom 2": {
    ideal: ["NW", "W"],
    acceptable: ["S"],
    avoid: ["NE", "SW"],
    rationale: "Bathrooms and toilets are traditionally kept away from the North-East and South-West corners.",
  },
  "Staircase": {
    ideal: ["S", "SW", "W"],
    acceptable: ["WSW"],
    avoid: ["NE", "N"],
    rationale: "A staircase is traditionally positioned in the South, South-West or West of the plot.",
  },
  "Study/Home Office": {
    ideal: ["N", "E"],
    acceptable: ["NE"],
    avoid: ["S"],
    rationale: "Study areas are traditionally oriented North or East to support focus and clarity.",
  },
  "Main Entrance": {
    ideal: ["N", "E", "NE"],
    acceptable: ["W"],
    avoid: ["S", "SW"],
    rationale: "The main entrance is traditionally favoured facing North, East or North-East for positive energy flow.",
  },
  "Garage": {
    ideal: ["NW", "N"],
    acceptable: ["W"],
    avoid: ["NE", "SW"],
    rationale: "Vehicle parking is traditionally placed in the North-West of the plot.",
  },
  "Utility Area": {
    ideal: ["NW"],
    acceptable: ["N"],
    avoid: ["NE"],
    rationale: "Utility and storage areas are traditionally kept in the North-West.",
  },
  "Balcony": {
    ideal: ["N", "E"],
    acceptable: ["NE"],
    avoid: ["SW"],
    rationale: "Open balconies traditionally face North or East to maximise pleasant morning light without harsh afternoon heat.",
  },
};

module.exports = { VASTU_GUIDE };
