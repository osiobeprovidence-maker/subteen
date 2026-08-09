/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ads from "../ads.js";
import type * as articles from "../articles.js";
import type * as authors from "../authors.js";
import type * as categories from "../categories.js";
import type * as communities from "../communities.js";
import type * as crons from "../crons.js";
import type * as lib_ai from "../lib/ai.js";
import type * as lib_automation from "../lib/automation.js";
import type * as lib_roles from "../lib/roles.js";
import type * as lib_rss from "../lib/rss.js";
import type * as media from "../media.js";
import type * as newsAutomation from "../newsAutomation.js";
import type * as rssSources from "../rssSources.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as tags from "../tags.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ads: typeof ads;
  articles: typeof articles;
  authors: typeof authors;
  categories: typeof categories;
  communities: typeof communities;
  crons: typeof crons;
  "lib/ai": typeof lib_ai;
  "lib/automation": typeof lib_automation;
  "lib/roles": typeof lib_roles;
  "lib/rss": typeof lib_rss;
  media: typeof media;
  newsAutomation: typeof newsAutomation;
  rssSources: typeof rssSources;
  seed: typeof seed;
  settings: typeof settings;
  tags: typeof tags;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
