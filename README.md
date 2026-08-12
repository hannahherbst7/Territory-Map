# Territory Map

Interactive US sales-territory map for Golden Hour Medical. Hovering a state
shows which rep covers it; clicking opens a pre-addressed email.

| Territory | Rep | States |
|---|---|---|
| West | John Cornejo | AK, AZ, AR, CA, CO, HI, ID, IL, IN, IA, KS, LA, MN, MO, MT, NE, NV, NM, ND, OK, OR, SD, TX, UT, WA, WI, WY |
| East | John Morrison | AL, CT, DE, DC, FL, GA, KY, ME, MD, MA, MI, MS, NH, NJ, NY, NC, OH, PA, RI, SC, TN, VT, VA, WV |

## Files

| File | Use |
|---|---|
| `territory-map.html` | Standalone page — open directly in a browser |
| `squarespace-embed.html` | Full-detail embed for a Squarespace Code Block |
| `squarespace-embed-compact.html` | Same embed with simplified geometry (~4x smaller, visually identical at display size) |

## Squarespace

Edit page → Add Block → **Code** → set mode to **HTML**, uncheck *Display Source* →
paste the contents of an embed file. The map does not run inside the editor
preview; save and view the live page to test hover.

All CSS is scoped to `.ghm-map` and every class is prefixed `ghm-`, so the block
cannot affect the rest of the site. To drop the black background, delete the
`background: #000;` line in the `.ghm-map` rule.

## Design

Follows theautotq.com: Inter Tight headings, Inter body, brand red `#D12020`,
60x4px red rule motif, pill CTAs. Geography is an Albers USA projection of the
US Census state boundaries (`us-atlas` 10m).
