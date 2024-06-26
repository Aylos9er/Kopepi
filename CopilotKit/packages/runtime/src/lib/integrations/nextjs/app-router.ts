import { createYoga } from "graphql-yoga";
import { getCommonConfig } from "../shared";
import { CopilotRuntime } from "../../copilot-runtime";
import { CopilotServiceAdapter } from "../../../service-adapters";

export function copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  endpoint,
  serviceAdapter,
  debug,
}: {
  runtime: CopilotRuntime;
  serviceAdapter: CopilotServiceAdapter;
  endpoint: string;
  debug?: boolean;
}) {
  const commonConfig = getCommonConfig({ runtime, serviceAdapter, debug });

  const yoga = createYoga({
    ...commonConfig,
    graphqlEndpoint: endpoint,
    fetchAPI: { Response: globalThis.Response },
  });

  return {
    handleRequest: yoga,
    GET: yoga,
    POST: yoga,
    OPTIONS: yoga,
  };
}
