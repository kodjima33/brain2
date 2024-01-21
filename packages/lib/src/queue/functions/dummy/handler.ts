import { inngestEdgeClient } from "../../clients";
import { argSchema, eventName } from "./schema";

/**
 * Refine a raw recording note transcript, improving formatting and grammar
 */
export const handler = inngestEdgeClient.createFunction(
  { id: "dummy-handler" },
  { event: eventName },
  async ({ event }) => {
    const { argument } = argSchema.parse(event.data);
    console.log("Received argument", argument)

    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("5 seconds done");

    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("10 seconds done");

    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("15 seconds done");
    console.log("Done");
  },
);
