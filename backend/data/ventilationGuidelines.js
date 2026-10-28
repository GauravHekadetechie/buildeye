// data/ventilationGuidelines.js
//
// General passive-design conventions used for illustrative window/airflow
// suggestions. These are common architectural rules of thumb for the
// northern hemisphere / Indian subcontinent, not a substitute for a real
// climate and site-specific ventilation study.

const VENTILATION_GUIDE = {
  "Kitchen": {
    windowAdvice: "Place the exhaust window/vent on the wall facing away from the dining and living areas so cooking odours vent outward rather than drifting inward.",
    preferred: ["E", "NE"],
  },
  "Master Bedroom": {
    windowAdvice: "A window on the East wall brings gentle morning light; avoid a large unshaded West-facing window, which lets in strong afternoon heat.",
    preferred: ["E", "N"],
  },
  "Bedroom 2": {
    windowAdvice: "Cross-ventilation works best with two openings on opposite or adjacent walls rather than one large window on a single wall.",
    preferred: ["E", "N"],
  },
  "Bedroom 3": {
    windowAdvice: "Cross-ventilation works best with two openings on opposite or adjacent walls rather than one large window on a single wall.",
    preferred: ["E", "N"],
  },
  "Living Room": {
    windowAdvice: "Larger openings on the North side give even, glare-free daylight through most of the day.",
    preferred: ["N", "NE"],
  },
  "Dining Area": {
    windowAdvice: "A window near the dining area helps clear cooking smells faster when combined with the kitchen exhaust.",
    preferred: ["E", "N"],
  },
  "Bathroom 1": {
    windowAdvice: "A small high-level window or vent on an external wall is enough to control humidity and odour.",
    preferred: ["W", "S"],
  },
  "Bathroom 2": {
    windowAdvice: "A small high-level window or vent on an external wall is enough to control humidity and odour.",
    preferred: ["W", "S"],
  },
  "Study/Home Office": {
    windowAdvice: "An East or North window gives consistent daylight for screen work without glare.",
    preferred: ["N", "E"],
  },
  "Pooja Room": {
    windowAdvice: "A small East-facing window allows morning light in without excessive heat gain.",
    preferred: ["E"],
  },
  "Balcony": {
    windowAdvice: "Keep openings unobstructed on the prevailing-breeze side to maximise natural airflow into adjoining rooms.",
    preferred: ["N", "E"],
  },
};

module.exports = { VENTILATION_GUIDE };
