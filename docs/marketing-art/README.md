# 水果連連看宣傳素材

使用內建 image_gen 生成並修正。正式素材皆為 1200 × 675，SEO 圖與無文字 cover 獨立構圖，原圖保留於本目錄。

- 分享圖：`public/assets/images/seo.webp`；舊分享網址相容圖：`public/og-image.png`。
- 遊戲大廳封面：`public/assets/images/cover.webp`（維持既有大廳引用）。
- SEO：`seo.config.json` 為來源，執行 `node scripts/inject-seo.js` 同步 HTML、Open Graph、Twitter Card 與 JSON-LD。

## 玩法核對

兩排四格；上排：橘子、葡萄、梨子、橘子；下排：草莓、葡萄、梨子、草莓。每種水果各兩張。草莓透過下方空白外圈連成 U 字，只有兩次直角轉彎，不穿越其他方塊。以現有 `Rules.link` 驗證補空白邊界後路徑 `[13, 19, 22, 16]` 合法。

## 最終修正提示詞

### SEO

Use case: precise-object-edit. Correct ONLY the fruit tile board and its connecting line in this SEO artwork. Preserve the beautiful clay orchard style, peach/mint palette, lighting and exact correct title 水果連連看 on the right unchanged. Replace the left board with exactly two rows of four tiles, aligned neatly, not touching the text. TOP ROW from left: orange, grapes, pear, orange. BOTTOM ROW from left: strawberry, grapes, pear, strawberry. Exactly eight tiles, every fruit occurs exactly twice. Only the two bottom strawberry tiles glow green. Connect ONLY those two bottom strawberry tiles with a simple U-shaped mint line entirely BELOW the board: descend vertically from bottom center of left strawberry, turn RIGHT once, run horizontally across empty space beneath the whole board, turn UP once and enter bottom center of right strawberry. Exactly THREE straight axis-aligned segments and TWO 90-degree corners. The path must never touch or cross any other tile. Leave ample empty space below board for U path. Remove ALL previous lines and all arrows. Preserve text and surroundings. No extra words.

### Cover

Use case: precise-object-edit. Correct the matching puzzle rules in this cover illustration. Keep the premium soft clay orchard environment, basket and box, warm peach and mint palette, lighting. No text at all. Completely replace the central 4x4 tile board and ALL old connecting lines. New board has exactly TWO rows of FOUR ivory rounded tiles, spaced evenly in a neat rectangular grid. TOP ROW from left: orange, grapes, pear, orange. BOTTOM ROW from left: strawberry, grapes, pear, strawberry. Exactly eight tiles, every fruit occurs exactly twice. Only bottom-left and bottom-right strawberries glow mint. Below the whole board, leave wide empty peach space. Connect those two strawberries with ONE very simple U-shaped mint green line: from the BOTTOM center of bottom-left strawberry go vertically DOWN to the empty margin, turn RIGHT 90 degrees, go horizontally across below ALL tiles, turn UP 90 degrees, go vertically UP to the BOTTOM center of bottom-right strawberry. Exactly THREE straight orthogonal segments and exactly TWO turns. No diagonal lines, no arrows, no extra turns, no lines inside the board, never cross an occupied tile. Lower the framing or reduce board size to make the U shape comfortably visible. Balanced centered composition, 16:9 wide image. No words, no brand, no watermark.

