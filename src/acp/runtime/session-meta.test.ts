import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OpenClawConfig } from "../../config/config.js";

const hoisted = vi.hoisted(() => {
  const resolveSessionStoreTargetsMock = vi.fn();
  const loadSessionStoreMock = vi.fn();
  return {
    resolveSessionStoreTargetsMock,
    loadSessionStoreMock,
  };
});

vi.mock("../../config/sessions.js", async () => {
  const actual = await vi.importActual<typeof import("../../config/sessions.js")>(
    "../../config/sessions.js",
  );
  return {
    ...actual,
    resolveSessionStoreTargets: (cfg: OpenClawConfig, opts: unknown) =>
      hoisted.resolveSessionStoreTargetsMock(cfg, opts),
    loadSessionStore: (storePath: string) => hoisted.loadSessionStoreMock(storePath),
  };
});

const { listAcpSessionEntries } = await import("./session-meta.js");

describe("listAcpSessionEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads ACP sessions from resolved configured store targets", async () => {
    const cfg = {
      session: {
        store: "/custom/sessions/{agentId}.json",
      },
    } as OpenClawConfig;
    hoisted.resolveSessionStoreTargetsMock.mockReturnValue([
      {
        agentId: "ops",
        storePath: "/custom/sessions/ops.json",
      },
    ]);
    hoisted.loadSessionStoreMock.mockReturnValue({
      "agent:ops:acp:s1": {
        updatedAt: 123,
        acp: {
          backend: "acpx",
          agent: "ops",
          mode: "persistent",
          state: "idle",
        },
      },
    });

    const entries = await listAcpSessionEntries({ cfg });

    expect(hoisted.resolveSessionStoreTargetsMock).toHaveBeenCalledWith(cfg, { allAgents: true });
    expect(hoisted.loadSessionStoreMock).toHaveBeenCalledWith("/custom/sessions/ops.json");
    expect(entries).toEqual([
      expect.objectContaining({
        cfg,
        storePath: "/custom/sessions/ops.json",
        sessionKey: "agent:ops:acp:s1",
        storeSessionKey: "agent:ops:acp:s1",
      }),
    ]);
  });
});
