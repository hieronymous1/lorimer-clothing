# Managing the LORIMER Website

This is a quick guide to making everyday changes to the site yourself — no developer needed.

Everything below happens on one page: **lorimerclothing.com/admin**

## Logging in

1. Go to **lorimerclothing.com/admin**
2. Enter the admin password (ask your developer if you don't have it)
3. Click **Log in**

When you're done, click **Log out** in the top-right corner — especially on a shared computer.

---

## Editing a product (name, description, price, photo)

1. Log in, then click the **Products** tab (it's open by default)
2. You'll see a card for each product: **Name**, **Description**, **Price (EUR)**, and **Images**
3. Change whatever you like directly in the boxes
4. Click **Save** at the bottom of that product's card
5. Refresh the live site to see your change — it's instant, no waiting

**About images:** the "Images" box holds a web address (URL) per line, not a file. To swap in a new photo, ask your developer for the new image's address, or use an image hosting step they've set up for you — this current version doesn't yet let you upload a photo directly from this screen.

---

## Updating stock levels

1. Click the **Inventory** tab
2. You'll see a table listing every product and size, with a stock number next to each
3. Change the number to however many you actually have in that size
4. Click **Save** on that row

**Why this matters:** if a size shows 0 in stock, customers physically cannot buy it — the "Pay Now" button will refuse the order with an out-of-stock message. Whenever you restock or a size sells out through another channel, update it here so the website stays accurate.

---

## Viewing and fulfilling orders

1. Click the **Orders** tab
2. Every paid order appears here automatically — no need to check anywhere else. It shows the customer's email, what they bought, and the total charged
3. Once you've packed and shipped an order, tick **Fulfilled** and type the tracking number into the **Tracking** box, then click **Save**

This is just for your own record-keeping — it doesn't email the customer. If you want customers notified automatically, that's a future addition your developer can add.

**Where the money actually is:** this Orders tab is a convenient summary. For refunds, disputes, or anything involving the actual charge, use your Stripe Dashboard (dashboard.stripe.com) — that's the real source of truth for payments.

---

## Editing site text (About page, footer)

1. Click the **Content** tab
2. You'll see a list of text sections: things like the footer's copyright line and address, and the About page's sections (Brand story, Terms, Delivery info, Payments, Pricing, Returns policy)
3. Edit the text in the box
4. Click **Save** on that section

**A few things to know:**
- These boxes can contain basic HTML (the kind of formatting used on web pages) — things like `<p>` around a paragraph or `<br>` for a line break. If you're only changing wording and leaving the tags alone, you don't need to understand them, just don't delete the bits in angle brackets `< >`.
- Only the sections listed here are editable this way. Anything else on the site (layout, images that aren't product photos, new pages) still needs a developer.

---

## Quick troubleshooting

| Problem | What to do |
|---|---|
| "Incorrect password" when logging in | Double-check for typos; ask your developer to confirm the current password if it's been changed |
| A change isn't showing on the live site | Hard-refresh your browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac) — your browser sometimes caches the old page |
| A product shows "out of stock" but you have some | Go to Inventory and check that size's stock number is above 0 |
| A customer says checkout failed | Check Inventory for that item/size — it likely sold out between when they added it and when they paid |
| You're logged out unexpectedly | Sessions expire automatically after 12 hours for security — just log back in |

---

## What you should never need to touch

- The Stripe Dashboard's API keys — those are configured once by your developer and shouldn't change
- The database — everything you need is in the admin tabs above
- Any files in the website's code — all day-to-day changes happen through this admin page

If something looks broken and none of the above fixes it, contact your developer with a screenshot and a description of what you were trying to do.
