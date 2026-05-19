-- Tastly Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists restaurants (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  logo_url    text,
  cover_url   text,
  address     text,
  phone       text,
  cuisine_type text,
  primary_color text,
  owner_id    text not null default 'owner-001',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          text not null,
  description   text,
  position      int not null default 1,
  created_at    timestamptz not null default now()
);

create table if not exists dishes (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id   uuid not null references categories(id) on delete cascade,
  name          text not null,
  description   text not null default '',
  price         numeric(10,2) not null default 0,
  image_url     text,
  allergens     text[] not null default '{}',
  calories      numeric,
  proteins      numeric,
  carbs         numeric,
  fat           numeric,
  is_available  boolean not null default true,
  is_featured   boolean not null default false,
  tags          text[] not null default '{}',
  position      int not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table restaurants enable row level security;
alter table categories enable row level security;
alter table dishes enable row level security;

-- Public can read all data (no auth needed for the menu)
create policy "public read restaurants" on restaurants for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read dishes" on dishes for select using (true);

-- Service role bypasses RLS — admin writes use service role key (server-side only)

-- ============================================================
-- SEED DATA — Casa do Mar
-- ============================================================

-- Insert restaurant
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
  'owner-001'
) on conflict (slug) do nothing;

-- Insert categories
with rest as (select id from restaurants where slug = 'casa-do-mar')
insert into categories (id, restaurant_id, name, description, position) values
  ('b1000000-0000-0000-0000-000000000001', (select id from rest), 'Entradas', 'Para começar', 1),
  ('b1000000-0000-0000-0000-000000000002', (select id from rest), 'Pratos Principais', 'Os nossos clássicos', 2),
  ('b1000000-0000-0000-0000-000000000003', (select id from rest), 'Sobremesas', 'Para terminar em beleza', 3),
  ('b1000000-0000-0000-0000-000000000004', (select id from rest), 'Vinhos', 'Seleção da cave', 4),
  ('b1000000-0000-0000-0000-000000000005', (select id from rest), 'Bebidas', 'Bebidas e cocktails', 5)
on conflict do nothing;

-- Insert dishes
with rest as (select id from restaurants where slug = 'casa-do-mar')
insert into dishes (restaurant_id, category_id, name, description, price, image_url, allergens, is_available, is_featured, tags, position) values
  -- Entradas
  ((select id from rest), 'b1000000-0000-0000-0000-000000000001', 'Polvo à Lagareiro', 'Polvo assado no forno com azeite extra virgem, alho confitado e batata a murro com ervas aromáticas.', 14.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', '{}', true, true, '{"popular","peixe"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000001', 'Alheira de Caça com Ovo', 'Alheira artesanal de caça com ovo escalfado, pão torrado e pickles da casa.', 10.50, 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800', '{"gluten","ovos"}', true, false, '{"tradicional"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000001', 'Creme de Mariscos', 'Creme rico de marisco da costa com natas, brandy e torradas de pão alentejano.', 9.50, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', '{"crustaceos","leite","gluten"}', true, false, '{"popular"}', 3),
  -- Pratos Principais
  ((select id from rest), 'b1000000-0000-0000-0000-000000000002', 'Bacalhau à Brás', 'Bacalhau desfiado salteado com batata palha, ovos mexidos, azeitonas e salsa.', 22.00, 'https://images.unsplash.com/photo-1764333580740-b327847301b1?w=800', '{"ovos","peixe"}', true, true, '{"popular","tradicional","peixe"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000002', 'Robalo Grelhado', 'Robalo do dia grelhado com legumes da época, azeite de ervas e limão confitado.', 28.00, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800', '{"peixe"}', true, true, '{"saudável","peixe"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000002', 'Secretos de Porco Preto', 'Secretos de porco preto alentejano com migas de broa e amêijoas em cataplana.', 24.00, 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800', '{"gluten","moluscos"}', true, false, '{"popular","carne"}', 3),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000002', 'Arroz de Lingueirão', 'Arroz caldoso de lingueirão com coentros frescos e azeite virgem extra.', 19.50, 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800', '{"moluscos"}', true, false, '{"tradicional","peixe"}', 4),
  -- Sobremesas
  ((select id from rest), 'b1000000-0000-0000-0000-000000000003', 'Pastel de Nata da Casa', 'Pastel de nata artesanal com canela e açúcar em pó, servido morno.', 2.50, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', '{"gluten","leite","ovos"}', true, false, '{"popular","tradicional"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000003', 'Tarte de Limão Merengada', 'Tarte de limão com merengue tostado e base de bolacha.', 6.50, 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800', '{"gluten","leite","ovos"}', true, false, '{"popular"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000003', 'Mousse de Chocolate', 'Mousse de chocolate negro 70% com flor de sal e azeite extra virgem.', 6.00, 'https://images.unsplash.com/photo-1488477181228-c84996bc851f?w=800', '{"leite","ovos"}', true, false, '{"vegetariano"}', 3),
  -- Vinhos
  ((select id from rest), 'b1000000-0000-0000-0000-000000000004', 'Anselmo Mendes Alvarinho', 'Vinho branco Alvarinho premium, Monção e Melgaço. Fresco e mineral com notas cítricas.', 32.00, 'https://images.unsplash.com/photo-1682071308366-1d098905b498?w=800', '{"sulfitos"}', true, true, '{"sem álcool","vinho branco"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000004', 'Quinta do Crasto Reserva', 'Vinho tinto Douro com uvas Touriga Nacional e Touriga Franca. Complexo e encorpado.', 38.00, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', '{"sulfitos"}', true, false, '{"com álcool"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000004', 'Niepoort Nat''Cool Rosé', 'Vinho rosé ligeiro e fresco com notas de frutos vermelhos e pêssego. Ideal para aperitivo.', 28.00, 'https://images.unsplash.com/photo-1622119396095-378684e4bfa8?w=800', '{"sulfitos"}', true, false, '{"com álcool"}', 3),
  -- Bebidas
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Gin Tónico da Casa', 'Gin premium com tónica artesanal, pepino, limão e especiarias.', 12.00, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800', '{}', true, false, '{"cocktail","com álcool"}', 1),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Aperol Spritz', 'Aperol, prosecco, água com gás e laranja. O clássico aperitivo italiano.', 10.00, 'https://images.unsplash.com/photo-1585975776023-29a0dbc51407?w=800', '{"sulfitos"}', true, true, '{"cocktail","com álcool"}', 2),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Limonada Fresca da Casa', 'Limonada artesanal com limão, hortelã, mel e água com gás.', 4.50, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800', '{}', true, false, '{"sem álcool","saudável"}', 3),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Cerveja Artesanal IPA', 'IPA artesanal portuguesa com notas cítricas e amargor equilibrado.', 5.50, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800', '{"gluten"}', true, false, '{"com álcool"}', 4),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Água com Gás Pedras', 'Água mineral com gás Pedras Salgadas, garrafa 50cl.', 3.00, 'https://images.unsplash.com/photo-1705413085032-77fec96871cf?w=800', '{}', true, false, '{"sem álcool"}', 5),
  ((select id from rest), 'b1000000-0000-0000-0000-000000000005', 'Espresso Duplo', 'Café expresso duplo de blend de especialidade.', 2.50, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800', '{}', true, false, '{"café","sem álcool"}', 6)
on conflict do nothing;
