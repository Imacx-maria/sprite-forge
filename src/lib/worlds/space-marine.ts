import type { WorldDefinition } from "./types";

/**
 * Space Marine World
 *
 * Feel: "Mission briefing just before deployment"
 * Reference: 16-bit sci-fi shooters, retro platformer corridors
 * Character: On duty, alert and ready, not mid-combat
 */
export const spaceMarine: WorldDefinition = {
  id: "space-marine",
  displayName: "Space Marine",
  description: "Futuristic soldier in cosmic warfare",
  icon: "🚀",
  promptModifier:
    "Sci-fi military aesthetic. Metallic blues and grays, tech highlights. Ready stance, alert and disciplined. Tactical and focused mood.",
  scenePromptModifier:
    "16-BIT SCI-FI SHOOTER CORRIDOR STAGE. Futuristic military base interior, metallic walls and floors, control panels, pipes and vents, window views into space. CONTAINED AND TACTICAL environment. Strong horizontal lines. Character ON DUTY, alert ready stance, not mid-combat. Feels like mission briefing before deployment. Claustrophobic industrial atmosphere.",
  sceneCamera: "Side view or three-quarter perspective. Fixed angle. Enclosed corridor perspective emphasizing horizontal movement.",
  cardTitles: [
    "MARINE CARD",
    "STAR SOLDIER",
    "VOID WALKER",
    "COSMIC GUARD",
    "ORBITAL ACE",
  ],
  classLabel: "Space Marine",
  framePath: "/frames/space-marine.png",
};
