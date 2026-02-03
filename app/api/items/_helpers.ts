export function itemSelect() {
  return {
    id: true,
    photoUrl: true,
    identifiedName: true,
    userOverrideName: true,
    condition: true,
    recommendation: true,
    reasoning: true,
    estimatedValueLow: true,
    estimatedValueHigh: true,
    guidance: true,
    isHazardous: true,
    hazardWarning: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  } as const;
}
