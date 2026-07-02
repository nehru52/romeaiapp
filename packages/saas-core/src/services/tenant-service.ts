/**
 * TenantService — multi-tenant lifecycle with Supabase persistence.
 */

import { dbInsert, dbQuery, dbUpdate } from "../db/adapter.js";
import { type SubscriptionTier, type Tenant, TIER_FEATURES } from "../types.js";

export class TenantService {
  private tenants: Map<string, Tenant> = new Map();
  private loaded = false;

  async loadFromDB(): Promise<void> {
    if (this.loaded) return;
    try {
      const rows = await dbQuery<{
        id: string;
        name: string;
        slug: string;
        email: string;
        tier: string;
        status: string;
        trial_ends_at: string | null;
        features_json: string;
        metadata_json: string;
        created_at: string;
        updated_at: string;
      }>("tenants");
      for (const r of rows) {
        // Safe JSON parse — some rows may have malformed JSON
        let features = {};
        let metadata = {};
        try {
          features = JSON.parse(r.features_json ?? "{}");
        } catch {
          features = {};
        }
        try {
          metadata = JSON.parse(r.metadata_json ?? "{}");
        } catch {
          metadata = {};
        }

        const tenant: Tenant = {
          id: r.id,
          name: r.name,
          slug: r.slug,
          email: r.email,
          tier: r.tier as SubscriptionTier,
          status: r.status as Tenant["status"],
          trialEndsAt: r.trial_ends_at,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          features: features as Tenant["features"],
          metadata: metadata as Record<string, string>,
        };
        this.tenants.set(r.id, tenant);
      }
      console.log(`[saas-core] Loaded ${rows.length} tenants from Supabase`);
    } catch (e: any) {
      console.log(
        "[saas-core] Could not load tenants from Supabase:",
        e?.message ?? e,
      );
    }
    this.loaded = true;
  }

  createTenant(params: {
    name: string;
    slug: string;
    email: string;
    tier?: SubscriptionTier;
  }): Tenant {
    const now = new Date().toISOString();
    const tier = params.tier ?? "free";
    const tenant: Tenant = {
      id: `tenant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: params.name,
      slug: params.slug,
      email: params.email,
      tier,
      status: "trial",
      trialEndsAt:
        tier === "free"
          ? null
          : new Date(Date.now() + 14 * 86400000).toISOString(),
      createdAt: now,
      updatedAt: now,
      features: { ...TIER_FEATURES[tier] },
      metadata: {},
    };
    this.tenants.set(tenant.id, tenant);
    dbInsert("tenants", {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      email: tenant.email,
      tier: tenant.tier,
      status: tenant.status,
      trial_ends_at: tenant.trialEndsAt,
      features_json: JSON.stringify(tenant.features),
      metadata_json: JSON.stringify(tenant.metadata),
      created_at: tenant.createdAt,
      updated_at: tenant.updatedAt,
    }).catch(() => {});
    return { ...tenant, features: { ...tenant.features } };
  }

  getTenant(id: string): Tenant | undefined {
    const t = this.tenants.get(id);
    return t ? { ...t, features: { ...t.features } } : undefined;
  }

  listTenants(filter?: { status?: string; tier?: string }): Tenant[] {
    let result = [...this.tenants.values()];
    if (filter?.status)
      result = result.filter((t) => t.status === filter.status);
    if (filter?.tier) result = result.filter((t) => t.tier === filter.tier);
    return result.map((t) => ({ ...t, features: { ...t.features } }));
  }

  updateTier(id: string, tier: SubscriptionTier): Tenant | null {
    const t = this.tenants.get(id);
    if (!t) return null;
    t.tier = tier;
    t.features = { ...TIER_FEATURES[tier] };
    t.updatedAt = new Date().toISOString();
    dbUpdate("tenants", id, {
      tier,
      features_json: JSON.stringify(t.features),
      updated_at: t.updatedAt,
    }).catch(() => {});
    return { ...t, features: { ...t.features } };
  }

  updateStatus(id: string, status: Tenant["status"]): Tenant | null {
    const t = this.tenants.get(id);
    if (!t) return null;
    t.status = status;
    t.updatedAt = new Date().toISOString();
    dbUpdate("tenants", id, { status, updated_at: t.updatedAt }).catch(
      () => {},
    );
    return { ...t, features: { ...t.features } };
  }

  updateMetadata(id: string, metadata: Record<string, string>): Tenant | null {
    const t = this.tenants.get(id);
    if (!t) return null;
    t.metadata = { ...t.metadata, ...metadata };
    t.updatedAt = new Date().toISOString();
    dbUpdate("tenants", id, {
      metadata_json: JSON.stringify(t.metadata),
      updated_at: t.updatedAt,
    }).catch(() => {});
    return { ...t, features: { ...t.features } };
  }

  deleteTenant(id: string): boolean {
    return this.tenants.delete(id);
  }

  getActiveTenantCount(): number {
    return [...this.tenants.values()].filter(
      (t) => t.status === "active" || t.status === "trial",
    ).length;
  }
}

export const tenantService = new TenantService();
export async function initTenantStore(): Promise<void> {
  await tenantService.loadFromDB();
}
