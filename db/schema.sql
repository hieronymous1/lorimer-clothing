create table if not exists products (
  id text primary key,
  name text not null,
  description text not null,
  price_cents integer not null,
  images jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists inventory (
  product_id text not null references products(id),
  size text not null,
  stock integer not null default 0,
  primary key (product_id, size)
);

create table if not exists content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists order_notes (
  session_id text primary key,
  fulfilled boolean not null default false,
  tracking text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);
