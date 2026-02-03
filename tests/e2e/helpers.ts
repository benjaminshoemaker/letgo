import { expect, test } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";

type MockItem = {
  id: string;
  status: string;
  [key: string]: unknown;
};

type UserStatsOverrides = Partial<{
  scansToday: number;
  limit: number;
  scansRemaining: number;
  resetAt: string;
}>;

export async function mockAuthSession(context: BrowserContext) {
  await context.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "test-user-id",
          email: "test@example.com",
          name: "Test User",
          image: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });
}

export async function mockUserStats(
  context: BrowserContext,
  overrides: UserStatsOverrides = {}
) {
  const payload = {
    scansToday: 5,
    limit: 50,
    scansRemaining: 45,
    resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };

  await context.route("**/api/user/stats", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });
}

export async function mockUpload(context: BrowserContext, url: string) {
  await context.route("**/api/upload", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url }),
    });
  });
}

export async function mockItemsList(context: BrowserContext, items: MockItem[]) {
  await context.route("**/api/items?*", async (route) => {
    const url = new URL(route.request().url());
    const status = url.searchParams.get("status");

    let filteredItems = [...items];
    if (status === "TODO") {
      filteredItems = items.filter((item) => item.status === "TODO");
    } else if (status === "DONE") {
      filteredItems = items.filter((item) =>
        ["SOLD", "DONATED", "RECYCLED", "TRASHED"].includes(item.status)
      );
    } else if (status && status !== "all") {
      filteredItems = items.filter((item) => item.status === status);
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: filteredItems,
        nextCursor: null,
        hasMore: false,
        totalCount: filteredItems.length,
      }),
    });
  });
}

export async function mockItemEndpoint(
  context: BrowserContext,
  item: MockItem,
  options: {
    enableDelete?: boolean;
    enablePatch?: boolean;
    updatedStatus?: string;
  } = {}
) {
  await context.route(`**/api/items/${item.id}`, async (route) => {
    const method = route.request().method();

    if (options.enableDelete && method === "DELETE") {
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    if (options.enablePatch && method === "PATCH") {
      const updatedItem = {
        ...item,
        status: options.updatedStatus ?? item.status,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ item: updatedItem }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ item }),
    });
  });
}

export async function gotoPage(page: Page, path: string) {
  await page.waitForTimeout(100);
  await page.goto(path);
  await page.waitForLoadState("domcontentloaded");
}

export function expectOnPathOrSignIn(page: Page, path: string) {
  const url = page.url();
  expect(url.includes(path) || url.includes("/auth/signin")).toBeTruthy();
}

export function skipIfSignedOut(page: Page) {
  if (page.url().includes("/auth/signin")) {
    test.skip();
  }
}
