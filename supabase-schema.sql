-- Tastly — Full Database Schema (rebuild)
-- Run in: Supabase Dashboard → SQL Editor → New Query (or `psql`).
-- Idempotent: safe to run on a fresh project. Reflects the current app code
-- (profiles + approval flow, billing, themes, daily specials, pairings,
-- translations, analytics). The demo "Casa do Mar" seed at the bottom is OPTIONAL.

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: one row per auth user. Created automatically on signup by the
-- handle_new_user trigger below. `approved` gates access until a super admin
-- approves the account (see src/actions/superadmin.ts).
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  approved    boolean not null default false,
  approved_at timestamptz,
  approved_by uuid,
  created_at  timestamptz not null default now()
);

create table if not exists restaurants (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  name                  text not null,
  description           text,
  logo_url              text,
  cover_url             text,
  address               text,
  phone                 text,
  cuisine_type          text,
  primary_color         text,
  review_url            text,
  theme                 text not null default 'elegante',
  owner_id              uuid not null,
  is_active             boolean not null default true,
  plan                  text not null default 'starter',
  trial_ends_at         timestamptz not null default (now() + interval '15 days'),
  trial_warning_sent_at timestamptz,
  stripe_customer_id    text,
  created_at            timestamptz not null default now()
);
create index if not exists restaurants_owner_id_idx on restaurants(owner_id);
create index if not exists restaurants_stripe_customer_idx on restaurants(stripe_customer_id);

create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          text not null,
  description   text,
  position      int not null default 1,
  translations  jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists categories_restaurant_id_idx on categories(restaurant_id);

create table if not exists dishes (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid not null references restaurants(id) on delete cascade,
  category_id     uuid not null references categories(id) on delete cascade,
  name            text not null,
  description     text not null default '',
  price           numeric(10,2) not null default 0,
  image_url       text,
  allergens       text[] not null default '{}',
  calories        numeric,
  proteins        numeric,
  carbs           numeric,
  fat             numeric,
  is_available    boolean not null default true,
  is_featured     boolean not null default false,
  is_special      boolean not null default false,
  tags            text[] not null default '{}',
  position        int not null default 1,
  manual_pairings jsonb,
  translations    jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists dishes_restaurant_id_idx on dishes(restaurant_id);
create index if not exists dishes_category_id_idx on dishes(category_id);

create table if not exists analytics_events (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  type          text not null,
  dish_id       uuid references dishes(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists analytics_events_restaurant_idx on analytics_events(restaurant_id, created_at);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- Public (anon) may read menu data only. profiles & analytics are written/read
-- exclusively via the service-role client (bypasses RLS), so they get RLS
-- enabled with no anon policies (deny-by-default).
-- ============================================================
alter table restaurants     enable row level security;
alter table categories      enable row level security;
alter table dishes          enable row level security;
alter table profiles        enable row level security;
alter table analytics_events enable row level security;

drop policy if exists "public read restaurants" on restaurants;
drop policy if exists "public read categories"  on categories;
drop policy if exists "public read dishes"      on dishes;
create policy "public read restaurants" on restaurants for select using (true);
create policy "public read categories"  on categories  for select using (true);
create policy "public read dishes"      on dishes      for select using (true);

-- ============================================================
-- STORAGE — public bucket for dish/restaurant images (src/app/api/upload)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('dish-images', 'dish-images', true)
on conflict (id) do nothing;

drop policy if exists "public read dish-images" on storage.objects;
create policy "public read dish-images" on storage.objects
  for select using (bucket_id = 'dish-images');

-- ============================================================
-- DEMO SEED — "Casa do Mar"  (OPTIONAL — delete this block if not wanted)
-- ============================================================
insert into restaurants (id, slug, name, description, cuisine_type, cover_url, address, phone, owner_id)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'casa-do-mar',
  'Casa do Mar',
  'Restaurante de cozinha portuguesa contemporânea com vista para o oceano.',
  'Portuguesa Contemporânea',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600',
  'Av. Marginal, 42, Cascais',
  '+351 21 000 0000',
  '00000000-0000-0000-0000-0000000000aa'
) on conflict (slug) do nothing;

with rest as (select id from restaurants where slug = 'casa-do-mar')
insert into categories (id, restaurant_id, name, description, position) values
  ('b1000000-0000-0000-0000-000000000001', (select id from rest), 'Entradas', 'Para começar', 1),
  ('b1000000-0000-0000-0000-000000000002', (select id from rest), 'Pratos Principais', 'Os nossos clássicos', 2),
  ('b1000000-0000-0000-0000-000000000003', (select id from rest), 'Sobremesas', 'Para terminar em beleza', 3),
  ('b1000000-0000-0000-0000-000000000004', (select id from rest), 'Vinhos', 'Seleção da cave', 4),
  ('b1000000-0000-0000-0000-000000000005', (select id from rest), 'Bebidas', 'Bebidas e cocktails', 5)
on conflict (id) do nothing;

with rest as (select id from restaurants where slug = 'casa-do-mar')
insert into dishes (restaurant_id, category_id, name, description, price, image_url, allergens, is_available, is_featured, tags, position) values
  ((select id from rest), 'b1000000-0000-0000-0000-000000000001', 'Polvo à Lagareiro', 'Polvo assado no forno com azeite extra virgem, alho confitado e batata a murro com ervas aromáticas.', 14.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', '{}', true, true, '{"popular","peixe"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000001', 'Alheira de Caça com Ovo', 'Alheira artesanal de caça com ovo escalfado, pão torrado e pickles da casa.', 10.50, 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800', '{"gluten","ovos"}', true, false, '{"tradicional"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000001', 'Creme de Mariscos', 'Creme rico de marisco da costa com natas, brandy e torradas de pão alentejano.', 9.50, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', '{"crustaceos","leite","gluten"}', true, false, '{"popular"}', 3),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000002', 'Bacalhau à Brás', 'Bacalhau desfiado salteado com batata palha, ovos mexidos, azeitonas e salsa.', 22.00, 'https://images.unsplash.com/photo-1764333580740-b327847301b1?w=800', '{"ovos","peixe"}', true, true, '{"popular","tradicional","peixe"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000002', 'Robalo Grelhado', 'Robalo do dia grelhado com legumes da época, azeite de ervas e limão confitado.', 28.00, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800', '{"peixe"}', true, true, '{"saudável","peixe"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000002', 'Secretos de Porco Preto', 'Secretos de porco preto alentejano com migas de broa e amêijoas em cataplana.', 24.00, 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800', '{"gluten","moluscos"}', true, false, '{"popular","carne"}', 3),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000002', 'Arroz de Lingueirão', 'Arroz caldoso de lingueirão com coentros frescos e azeite virgem extra.', 19.50, 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800', '{"moluscos"}', true, false, '{"tradicional","peixe"}', 4),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000003', 'Pastel de Nata da Casa', 'Pastel de nata artesanal com canela e açúcar em pó, servido morno.', 2.50, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', '{"gluten","leite","ovos"}', true, false, '{"popular","tradicional"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000003', 'Tarte de Limão Merengada', 'Tarte de limão com merengue tostado e base de bolacha.', 6.50, 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800', '{"gluten","leite","ovos"}', true, false, '{"popular"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000003', 'Mousse de Chocolate', 'Mousse de chocolate negro 70% com flor de sal e azeite extra virgem.', 6.00, 'https://images.unsplash.com/photo-1488477181228-c84996bc851f?w=800', '{"leite","ovos"}', true, false, '{"vegetariano"}', 3),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000004', 'Anselmo Mendes Alvarinho', 'Vinho branco Alvarinho premium, Monção e Melgaço. Fresco e mineral com notas cítricas.', 32.00, 'https://images.unsplash.com/photo-1682071308366-1d098905b498?w=800', '{"sulfitos"}', true, true, '{"com álcool","vinho branco"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000004', 'Quinta do Crasto Reserva', 'Vinho tinto Douro com uvas Touriga Nacional e Touriga Franca. Complexo e encorpado.', 38.00, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', '{"sulfitos"}', true, false, '{"com álcool"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000004', 'Niepoort Nat''Cool Rosé', 'Vinho rosé ligeiro e fresco com notas de frutos vermelhos e pêssego. Ideal para aperitivo.', 28.00, 'https://images.unsplash.com/photo-1622119396095-378684e4bfa8?w=800', '{"sulfitos"}', true, false, '{"com álcool"}', 3),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Gin Tónico da Casa', 'Gin premium com tónica artesanal, pepino, limão e especiarias.', 12.00, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800', '{}', true, false, '{"cocktail","com álcool"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Aperol Spritz', 'Aperol, prosecco, água com gás e laranja. O clássico aperitivo italiano.', 10.00, 'https://images.unsplash.com/photo-1585975776023-29a0dbc51407?w=800', '{"sulfitos"}', true, true, '{"cocktail","com álcool"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Limonada Fresca da Casa', 'Limonada artesanal com limão, hortelã, mel e água com gás.', 4.50, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800', '{}', true, false, '{"sem álcool","saudável"}', 3),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Espresso Duplo', 'Café expresso duplo de blend de especialidade.', 2.50, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800', '{}', true, false, '{"café","sem álcool"}', 4)
on conflict do nothing;
