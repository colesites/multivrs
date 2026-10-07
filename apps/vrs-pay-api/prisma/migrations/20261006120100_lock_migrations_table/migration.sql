-- Keep Prisma's bookkeeping table out of the Supabase Data API too.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
