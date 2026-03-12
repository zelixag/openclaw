export { resolveSessionStoreTargets } from "../config/sessions.js";
import { resolveSessionStoreTargets } from "../config/sessions.js";
import type { SessionStoreSelectionOptions, SessionStoreTarget } from "../config/sessions.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { RuntimeEnv } from "../runtime.js";
export type { SessionStoreSelectionOptions, SessionStoreTarget } from "../config/sessions.js";

export function resolveSessionStoreTargetsOrExit(params: {
  cfg: OpenClawConfig;
  opts: SessionStoreSelectionOptions;
  runtime: RuntimeEnv;
}): SessionStoreTarget[] | null {
  try {
    return resolveSessionStoreTargets(params.cfg, params.opts);
  } catch (error) {
    params.runtime.error(error instanceof Error ? error.message : String(error));
    params.runtime.exit(1);
    return null;
  }
}
