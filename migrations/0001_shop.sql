CREATE TABLE IF NOT EXISTS shop_orders (
 id TEXT PRIMARY KEY,
 request_key TEXT NOT NULL UNIQUE,
 fingerprint TEXT NOT NULL,
 total_cents INTEGER NOT NULL CHECK(total_cents > 0),
 mode TEXT NOT NULL CHECK(mode IN ('test','live')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','expired')),
 payload TEXT NOT NULL,
 stripe_session TEXT UNIQUE,
 checkout_url TEXT,
 created_at INTEGER NOT NULL,
 paid_at INTEGER
);
CREATE TABLE IF NOT EXISTS shop_mail (
 order_id TEXT NOT NULL REFERENCES shop_orders(id),
 recipient TEXT NOT NULL CHECK(recipient IN ('customer','seller')),
 sent_at INTEGER,
 PRIMARY KEY(order_id,recipient)
);

CREATE TABLE IF NOT EXISTS shop_rate (
 bucket TEXT PRIMARY KEY,
 hits INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
