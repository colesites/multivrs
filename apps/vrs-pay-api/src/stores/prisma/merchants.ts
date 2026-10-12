import type { Db } from "../../db/client";
import { toUnix } from "../../db/convert";
import type { MerchantStore } from "../merchant.store";

export function createPrismaMerchantStore(db: Db): MerchantStore {
  return {
    async forUser(userId) {
      const member = await db.merchantMember.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      return member ? { merchantId: member.merchantId, role: member.role } : null;
    },
    async listForUser(userId) {
      const rows = await db.merchantMember.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        include: { merchant: { select: { name: true } } },
      });
      return rows.map((r) => ({ merchantId: r.merchantId, name: r.merchant.name, role: r.role }));
    },
    async createForUser(user, merchant) {
      await db.merchant.create({
        data: {
          id: merchant.id,
          name: merchant.name,
          email: merchant.email,
          platformFeeBps: merchant.platformFeeBps,
          members: { create: { userId: user.id, role: "owner" } },
        },
      });
    },
    async get(merchantId) {
      const m = await db.merchant.findUnique({ where: { id: merchantId } });
      return m
        ? {
            id: m.id,
            name: m.name,
            email: m.email,
            platformFeeBps: m.platformFeeBps,
            created: toUnix(m.createdAt),
          }
        : null;
    },
    async rename(merchantId, name) {
      await db.merchant.update({ where: { id: merchantId }, data: { name } });
    },
    async listKeys(merchantId, mode) {
      const keys = await db.apiKey.findMany({
        where: { merchantId, mode },
        orderBy: { createdAt: "desc" },
      });
      return keys.map((k) => ({
        id: k.id,
        object: "api_key" as const,
        kind: k.kind,
        livemode: k.mode === "live",
        display_prefix: k.displayPrefix,
        name: k.name,
        token: k.kind === "publishable" ? k.plaintext : null,
        revealable: k.sealedSecret !== null && k.revokedAt === null,
        last_used: k.lastUsedAt ? toUnix(k.lastUsedAt) : null,
        created: toUnix(k.createdAt),
        revoked: k.revokedAt !== null,
      }));
    },
    async addKey(merchantId, key) {
      await db.apiKey.create({
        data: {
          id: key.id,
          merchantId,
          mode: key.mode,
          kind: key.kind,
          hash: key.hash,
          displayPrefix: key.displayPrefix,
          name: key.name ?? null,
          plaintext: key.plaintext ?? null,
          sealedSecret: key.sealedSecret ?? null,
        },
      });
    },
    async getKey(merchantId, id) {
      const k = await db.apiKey.findFirst({ where: { id, merchantId } });
      return k
        ? {
            id: k.id,
            kind: k.kind,
            mode: k.mode,
            name: k.name,
            sealedSecret: k.sealedSecret,
            revoked: k.revokedAt !== null,
          }
        : null;
    },
    async revokeKey(merchantId, id) {
      // A revoked key's sealed copy is dropped: it can never be shown again.
      const { count } = await db.apiKey.updateMany({
        where: { id, merchantId, revokedAt: null },
        data: { revokedAt: new Date(), sealedSecret: null },
      });
      return count === 1;
    },
    async getProviderAccount(merchantId, mode, provider) {
      const a = await db.providerAccount.findUnique({
        where: { merchantId_mode_provider: { merchantId, mode, provider } },
      });
      if (!a) return null;
      const { externalId, status, chargesEnabled, payoutsEnabled, detailsSubmitted } = a;
      return { provider, externalId, status, chargesEnabled, payoutsEnabled, detailsSubmitted };
    },
    async saveProviderAccount(merchantId, mode, account) {
      const { provider, ...data } = account;
      await db.providerAccount.upsert({
        where: { merchantId_mode_provider: { merchantId, mode, provider } },
        create: { merchantId, mode, provider, ...data },
        update: data,
      });
    },
  };
}
