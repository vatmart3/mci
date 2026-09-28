-- ─────────────────────────────────────────────────────────────
-- MCI Sète — schéma initial (Postgres / Supabase)
-- Catalogue public, comptes pros, commandes B2B, documents, réglages.
-- Sécurité : RLS sur toutes les tables ; écritures sensibles via fonctions SECURITY DEFINER.
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ─────────── Catalogue ───────────
create table if not exists public.families (
  slug text primary key,
  name text not null,
  code text not null,
  position int not null default 0,
  intro text,
  seo jsonb not null default '[]',
  biocide boolean not null default false
);

create table if not exists public.sectors (
  slug text primary key,
  name text not null,
  grp text not null check (grp in ('administrations','industries','loisirs')),
  buyer text,
  problem text,
  seo jsonb not null default '[]',
  position int not null default 0
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  code text not null,
  short text not null,
  description text not null default '',
  families text[] not null default '{}',
  sectors text[] not null default '{}',
  properties text[] not null default '{}',
  formats text[] not null default '{}',
  container text not null default 'can5' check (container in ('aerosol','spray','can5','jerrican20','bucket','cartridge')),
  packagings jsonb not null default '[]',
  usages text[] not null default '{}',
  variants text,
  instructions text,
  dilution text,
  technical_sheet_url text,
  sds_url text,
  image_url text,
  related text[] not null default '{}',
  to_confirm text[] not null default '{}',
  admin_note text,
  active boolean not null default true,
  featured boolean not null default false,
  position int not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists products_families_idx on public.products using gin (families);
create index if not exists products_sectors_idx on public.products using gin (sectors);

-- ─────────── Comptes ───────────
create table if not exists public.price_grids (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- { "<product_id>:<packaging_id>": prix_ht }
  prices jsonb not null default '{}'
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  siret text not null,
  kind text not null check (kind in ('entreprise','collectivite','association')),
  status text not null default 'pending' check (status in ('pending','active','suspended')),
  price_grid_id uuid references public.price_grids(id) on delete set null,
  requires_approval boolean not null default false,
  chorus boolean not null default false,
  chorus_service_code text,
  billing jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  role text not null default 'approver' check (role in ('buyer','approver','admin','sales')),
  account_id uuid references public.accounts(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  label text,
  company text,
  line1 text not null,
  line2 text,
  postal_code text not null,
  city text not null,
  access_notes text,
  is_default boolean not null default false
);

-- ─────────── Commandes ───────────
create table if not exists public.order_counters (
  year int primary key,
  value int not null
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  account_id uuid references public.accounts(id) on delete set null,
  status text not null check (status in ('pending_approval','received','confirmed','preparing','shipped','delivered','cancelled')),
  customer jsonb not null,
  delivery jsonb not null,
  billing jsonb,
  po_number text,
  chorus boolean not null default false,
  chorus_service_code text,
  delivery_slots text,
  comment text,
  lead_time text,
  mci_note text,
  customer_accepted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  notified_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_account_idx on public.orders(account_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status);

create table if not exists public.order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  position int not null default 0,
  product_id text not null,
  code text not null,
  name text not null,
  packaging_id text not null,
  packaging_label text not null,
  quantity int not null check (quantity > 0 and quantity <= 9999),
  note text,
  unit_price_ht numeric(10,2)
);
create index if not exists order_lines_order_idx on public.order_lines(order_id);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  at timestamptz not null default now(),
  by uuid references auth.users(id) on delete set null
);
create index if not exists order_events_order_idx on public.order_events(order_id, at);

-- ─────────── Espace pro ───────────
create table if not exists public.favorite_lists (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  lines jsonb not null default '[]'
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  kind text not null check (kind in ('proforma','bl','facture','autre')),
  name text not null,
  url text not null,
  created_at timestamptz not null default now()
);

-- ─────────── Réglages & journal ───────────
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  price_mode text not null default 'on_request' check (price_mode in ('on_request','per_account','public')),
  notify_emails text[] not null default array['contactmci@sfr.fr'],
  hours text not null default '',
  banner text not null default '',
  socials jsonb not null default '[]',
  lead_time_default text not null default ''
);
insert into public.settings (id) values (1) on conflict do nothing;

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  "to" text[] not null,
  subject text not null,
  text text not null,
  kind text not null,
  delivered text not null check (delivered in ('resend','console','demo'))
);

-- ─────────── Fonctions d'aide RLS ───────────
create or replace function public.my_account_id() returns uuid
language sql stable security definer set search_path = public as $$
  select account_id from public.profiles where id = auth.uid()
$$;

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin','sales') from public.profiles where id = auth.uid()), false)
$$;

-- ─────────── Création du profil + compte à l'inscription ───────────
-- Les données de la structure sont passées dans raw_user_meta_data lors du signUp.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  app jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  acc uuid;
  r text := 'approver';
begin
  if app ? 'account_id' then
    -- utilisateur ajouté à une structure existante par un valideur ou par MCI (route serveur,
    -- app_metadata n'est modifiable qu'avec la clé service : impossible à forger depuis le navigateur)
    acc := (app->>'account_id')::uuid;
    r := case when app->>'role' in ('buyer','approver') then app->>'role' else 'buyer' end;
  elsif meta ? 'company' then
    insert into public.accounts (company, siret, kind, chorus)
    values (meta->>'company', regexp_replace(coalesce(meta->>'siret',''), '\s', '', 'g'),
            case when meta->>'kind' in ('entreprise','collectivite','association') then meta->>'kind' else 'entreprise' end,
            coalesce(meta->>'kind','') = 'collectivite')
    returning id into acc;
    if meta ? 'address' and coalesce(meta->'address'->>'line1','') <> '' then
      insert into public.addresses (account_id, label, line1, line2, postal_code, city, is_default)
      values (acc, coalesce(meta->'address'->>'label','Adresse principale'), meta->'address'->>'line1',
              meta->'address'->>'line2', coalesce(meta->'address'->>'postalCode',''), coalesce(meta->'address'->>'city',''), true);
    end if;
  end if;
  insert into public.profiles (id, email, full_name, phone, role, account_id)
  values (new.id, new.email, coalesce(meta->>'full_name',''), meta->>'phone', r, acc);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Un client ne peut pas modifier lui-même statut, grille tarifaire ou validation obligatoire.
-- (pas de SECURITY DEFINER : current_user doit rester le rôle appelant ; la clé service et les migrations passent)
create or replace function public.guard_account_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user in ('anon', 'authenticated') and not public.is_staff() then
    new.status := old.status;
    new.price_grid_id := old.price_grid_id;
    new.requires_approval := old.requires_approval;
    new.is_demo := old.is_demo;
  end if;
  return new;
end $$;
drop trigger if exists accounts_guard on public.accounts;
create trigger accounts_guard before update on public.accounts
for each row execute function public.guard_account_update();

create or replace function public.guard_profile_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user in ('anon', 'authenticated') and not public.is_staff() then
    new.role := old.role;
    new.account_id := old.account_id;
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles
for each row execute function public.guard_profile_update();

-- ─────────── Passage de commande (invité ou connecté) ───────────
create or replace function public.next_order_number() returns text
language plpgsql security definer set search_path = public as $$
declare y int := extract(year from now())::int; v int;
begin
  insert into public.order_counters(year, value) values (y, 1)
  on conflict (year) do update set value = public.order_counters.value + 1
  returning value into v;
  return 'MCI-' || y || '-' || lpad(v::text, 5, '0');
end $$;

create or replace function public.place_order(payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  prof public.profiles;
  acc public.accounts;
  s public.settings;
  o public.orders;
  l jsonb;
  p public.products;
  pack jsonb;
  price numeric;
  grid jsonb;
  st text := 'received';
  i int := 0;
begin
  if jsonb_array_length(coalesce(payload->'lines','[]')) = 0 then
    raise exception 'Bon de commande vide';
  end if;
  if jsonb_array_length(payload->'lines') > 200 then
    raise exception 'Trop de lignes';
  end if;
  select * into s from public.settings where id = 1;
  if uid is not null then
    select * into prof from public.profiles where id = uid;
    if prof.account_id is not null then
      select * into acc from public.accounts where id = prof.account_id;
    end if;
  end if;
  if acc.id is not null and acc.requires_approval and prof.role = 'buyer' then
    st := 'pending_approval';
  end if;
  if acc.id is not null and acc.status = 'active' and acc.price_grid_id is not null then
    select prices into grid from public.price_grids where id = acc.price_grid_id;
  end if;
  if s.price_mode = 'public' then
    select prices into grid from public.price_grids order by name limit 1;
  end if;

  insert into public.orders (number, account_id, status, customer, delivery, billing, po_number, chorus,
    chorus_service_code, delivery_slots, comment, created_by)
  values (public.next_order_number(), acc.id, st, payload->'customer', payload->'delivery', payload->'billing',
    nullif(payload->>'poNumber',''), coalesce((payload->>'chorus')::boolean, false),
    nullif(payload->>'chorusServiceCode',''), nullif(payload->>'deliverySlots',''), nullif(payload->>'comment',''), uid)
  returning * into o;

  for l in select * from jsonb_array_elements(payload->'lines') loop
    select * into p from public.products where id = l->>'productId' and active;
    if p.id is null then raise exception 'Produit inconnu : %', l->>'productId'; end if;
    select e into pack from jsonb_array_elements(p.packagings) e where e->>'id' = l->>'packagingId' limit 1;
    if pack is null then pack := p.packagings->0; end if;
    price := null;
    if s.price_mode <> 'on_request' and grid is not null then
      price := (grid->>(p.id || ':' || (pack->>'id')))::numeric;
    end if;
    insert into public.order_lines (order_id, position, product_id, code, name, packaging_id, packaging_label, quantity, note, unit_price_ht)
    values (o.id, i, p.id, p.code, p.short, pack->>'id', pack->>'label', greatest(1, least(9999, (l->>'quantity')::int)), nullif(l->>'note',''), price);
    i := i + 1;
  end loop;

  insert into public.order_events (order_id, status, note, by)
  values (o.id, st, case when st = 'pending_approval' then 'En attente du valideur de la structure.' end, uid);

  return jsonb_build_object('id', o.id, 'number', o.number);
end $$;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- Lecture d'une commande invité : numéro + email du contact
create or replace function public.get_guest_order(p_number text, p_email text) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(o) || jsonb_build_object(
    'order_lines', (select coalesce(jsonb_agg(to_jsonb(ol) order by ol.position), '[]') from public.order_lines ol where ol.order_id = o.id),
    'order_events', (select coalesce(jsonb_agg(to_jsonb(ev) order by ev.at), '[]') from public.order_events ev where ev.order_id = o.id))
  from public.orders o
  where o.number = p_number and lower(o.customer->>'email') = lower(p_email) and o.account_id is null
$$;
grant execute on function public.get_guest_order(text, text) to anon, authenticated;

-- Validation interne (valideur de la structure)
create or replace function public.approve_order(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_id;
  if o.id is null then raise exception 'Commande introuvable'; end if;
  if not (public.is_staff() or (public.my_role() = 'approver' and public.my_account_id() = o.account_id)) then
    raise exception 'Seul un valideur peut valider cette commande';
  end if;
  if o.status <> 'pending_approval' then return; end if;
  update public.orders set status = 'received', approved_by = auth.uid(), updated_at = now(), notified_at = null where id = p_id;
  insert into public.order_events (order_id, status, note, by) values (p_id, 'received', 'Validée en interne', auth.uid());
end $$;
grant execute on function public.approve_order(uuid) to authenticated;

-- Validation de la pro-forma par le client
create or replace function public.accept_proforma(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_id;
  if o.id is null or not (public.is_staff() or public.my_account_id() = o.account_id) then
    raise exception 'Accès refusé';
  end if;
  update public.orders set customer_accepted_at = now(), updated_at = now() where id = p_id;
  insert into public.order_events (order_id, status, note, by) values (p_id, o.status, 'Pro-forma validée par le client.', auth.uid());
end $$;
grant execute on function public.accept_proforma(uuid) to authenticated;

-- ─────────── RLS ───────────
alter table public.families enable row level security;
alter table public.sectors enable row level security;
alter table public.products enable row level security;
alter table public.price_grids enable row level security;
alter table public.accounts enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.order_counters enable row level security;
alter table public.orders enable row level security;
alter table public.order_lines enable row level security;
alter table public.order_events enable row level security;
alter table public.favorite_lists enable row level security;
alter table public.documents enable row level security;
alter table public.settings enable row level security;
alter table public.email_log enable row level security;

-- Catalogue : lecture publique (produits actifs), écriture MCI
create policy "families read" on public.families for select using (true);
create policy "families staff" on public.families for all using (public.is_staff()) with check (public.is_staff());
create policy "sectors read" on public.sectors for select using (true);
create policy "sectors staff" on public.sectors for all using (public.is_staff()) with check (public.is_staff());
create policy "products read" on public.products for select using (active or public.is_staff());
create policy "products staff" on public.products for all using (public.is_staff()) with check (public.is_staff());

-- Réglages : lecture publique, écriture MCI
create policy "settings read" on public.settings for select using (true);
create policy "settings staff" on public.settings for update using (public.is_staff()) with check (public.is_staff());

-- Grilles : MCI, ou la grille de mon compte validé
create policy "grids read own" on public.price_grids for select using (
  public.is_staff() or id = (select price_grid_id from public.accounts where id = public.my_account_id() and status = 'active')
  or (select price_mode from public.settings where id = 1) = 'public');
create policy "grids staff" on public.price_grids for all using (public.is_staff()) with check (public.is_staff());

-- Comptes
create policy "accounts read" on public.accounts for select using (public.is_staff() or id = public.my_account_id());
create policy "accounts update" on public.accounts for update using (public.is_staff() or id = public.my_account_id());
create policy "accounts staff insert" on public.accounts for insert with check (public.is_staff());
create policy "accounts staff delete" on public.accounts for delete using (public.is_staff());

create policy "profiles read" on public.profiles for select using (
  id = auth.uid() or public.is_staff() or (account_id is not null and account_id = public.my_account_id()));
create policy "profiles update" on public.profiles for update using (id = auth.uid() or public.is_staff());

create policy "addresses rw" on public.addresses for all
  using (public.is_staff() or account_id = public.my_account_id())
  with check (public.is_staff() or account_id = public.my_account_id());

-- Commandes : lecture par la structure ou MCI ; création via place_order ; mise à jour MCI
create policy "orders read" on public.orders for select using (public.is_staff() or (account_id is not null and account_id = public.my_account_id()));
create policy "orders staff" on public.orders for update using (public.is_staff()) with check (public.is_staff());
create policy "orders staff delete" on public.orders for delete using (public.is_staff());
create policy "lines read" on public.order_lines for select using (
  exists (select 1 from public.orders o where o.id = order_id and (public.is_staff() or o.account_id = public.my_account_id())));
create policy "lines staff" on public.order_lines for all using (public.is_staff()) with check (public.is_staff());
create policy "events read" on public.order_events for select using (
  exists (select 1 from public.orders o where o.id = order_id and (public.is_staff() or o.account_id = public.my_account_id())));
create policy "events staff" on public.order_events for insert with check (public.is_staff());

create policy "favorites rw" on public.favorite_lists for all
  using (account_id = public.my_account_id() or public.is_staff())
  with check (account_id = public.my_account_id() or public.is_staff());

create policy "documents read" on public.documents for select using (account_id = public.my_account_id() or public.is_staff());
create policy "documents staff" on public.documents for all using (public.is_staff()) with check (public.is_staff());

create policy "emails staff" on public.email_log for select using (public.is_staff());

-- ─────────── Storage ───────────
insert into storage.buckets (id, name, public) values ('product-files', 'product-files', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict do nothing;

create policy "product files read" on storage.objects for select using (bucket_id = 'product-files');
create policy "product files staff" on storage.objects for all
  using (bucket_id = 'product-files' and public.is_staff()) with check (bucket_id = 'product-files' and public.is_staff());
-- documents/<account_id>/<fichier>
create policy "documents files read" on storage.objects for select using (
  bucket_id = 'documents' and (public.is_staff() or (storage.foldername(name))[1] = public.my_account_id()::text));
create policy "documents files staff" on storage.objects for all
  using (bucket_id = 'documents' and public.is_staff()) with check (bucket_id = 'documents' and public.is_staff());
