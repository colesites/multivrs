/** Whether an endpoint subscribed to `type` ("*" means everything). */
export function endpointAccepts(enabledEvents: readonly string[], type: string): boolean {
  return enabledEvents.includes("*") || enabledEvents.includes(type);
}
