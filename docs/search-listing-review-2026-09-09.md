# Search listing review — September 9, 2026

## Source and scope

Read the signed-in Google Search Console domain property `sc-domain:makermods.ai`, Performance → Search results, search type Web, last 28 days. The report explicitly displayed August 10–September 6, 2026; all countries and devices were included. Read the Pages table and exact-page query reports for XLeRobot, SO-101, Metal Arm, ElRobot, and MakerMods Lab.

Only the existing XLeRobot, Metal Arm, and SO-101 HTML title, meta description, and matching Open Graph/Twitter metadata were changed in this pass. No page body, URL, product price, checkout behavior, or Cloudflare setting was changed.

## Page baseline

| Page | Clicks | Impressions | CTR (displayed) | Average position |
| --- | ---: | ---: | ---: | ---: |
| Homepage | 218 | 1,076 | 20.3% | 5.3 |
| XLeRobot | 131 | 3,179 | 4.1% | 4.3 |
| Maker Arm | 69 | 556 | 12.4% | 3.4 |
| Metal Arm | 45 | 872 | 5.2% | 5.1 |
| ElRobot | 32 | 515 | 6.2% | 5.8 |
| MakerMods Lab | 10 | 546 | 1.8% | 3.4 |
| Maker Arm purchase | 5 | 200 | 2.5% | 3.3 |
| SO-101 | 4 | 290 | 1.4% | 5.9 |
| Metal Arm purchase | 3 | 148 | 2.0% | 3.2 |
| OpenBooth purchase | 2 | 72 | 2.8% | 5.1 |

These are the first ten page rows shown, not a complete property export. Page metrics and property metrics use different aggregation and should not be summed as unique visits. No universal CTR target was applied.

## Query evidence and decisions

| Exact page | Query | Clicks | Impressions | CTR | Position |
| --- | --- | ---: | ---: | ---: | ---: |
| XLeRobot | xlerobot | 84 | 1,628 | 5.2% | 3.6 |
| XLeRobot | xle robot | 3 | 49 | 6.1% | 5.2 |
| XLeRobot | xlerobot github | 0 | 47 | 0% | 6.1 |
| XLeRobot | xlerobot kit | 1 | 3 | 33.3% | 3.3 |
| Metal Arm | metal arm | 0 | 181 | 0% | 6.1 |
| Metal Arm | makermods metal arm | 12 | 18 | 66.7% | 1.1 |
| Metal Arm | metal robot arm | 0 | 6 | 0% | 12.5 |
| SO-101 | so101 | 0 | 11 | 0% | 7.4 |
| SO-101 | so-101 | 0 | 5 | 0% | 9.0 |
| SO-101 | so 101 | 0 | 4 | 0% | 7.5 |
| SO-101 | so-101 arm kit | 0 | 1 | 0% | 3.0 |
| ElRobot | elrobot | 14 | 74 | 18.9% | 2.7 |
| MakerMods Lab | makermods | 1 | 169 | 0.6% | 1.0 |
| MakerMods Lab | maker mods | 0 | 27 | 0% | 1.9 |

This is a selected transcription of visible query rows, not an exhaustive query export. Query rows do not account for every page impression or click. Small query samples are directional evidence, not proof of a poorly performing snippet.

- **XLeRobot:** Largest product-page impression opportunity. Preserve its exact product name, describe it as an assembled dual-arm mobile robot, and make pricing inquiry and source-file access clear. The listing cannot turn every GitHub-seeking search into buying intent.
- **Metal Arm:** The broad query “metal arm” generates impressions but is ambiguous. Explicit “robot arm,” seven-axis hardware, and the published $2,499 price make this a qualified product listing. Do not assume all 181 impressions represent potential robotics buyers.
- **SO-101:** Small but emerging non-brand impressions. Replace the software-led title with the hardware name, leader/follower configuration, and published $300 price. Retain MakerMods Lab in the description. Positions around 7–9 also limit CTR; the metadata change is a test, not a complete ranking solution.
- **MakerMods Lab:** Visible query data is mostly company-name searches at strong positions. Low page CTR may reflect sitelinks or visitors selecting the homepage; this is an inference, not a verified search-result layout. No new metadata change in this pass.
- **ElRobot:** Its exact-name query already gets 18.9% CTR. Preserve the current listing in this pass.
- **Maker Arm:** Page-level CTR is 12.4%; no additional metadata change in this pass.

## Exact edits

### xlerobot.html

Before title: XLeRobot, Bimanual Mobile Manipulator | MakerMods

After title: **XLeRobot Dual-Arm Mobile Robot, Assembled | MakerMods**

Before description: A bimanual mobile manipulator built for makers, students, and researchers. Ships fully assembled, LeRobot-compatible, ready to teleop and train the moment you unbox it.

After description: Get an assembled XLeRobot dual-arm mobile robot for LeRobot teleoperation and training. Explore specs and open-source files; contact MakerMods for pricing.

### metal-arm.html

Before title: MakerMods Metal Arm, Lightweight 7-Axis Robotic Arm

After title: **Metal Arm: 7-Axis Robot Arm, $2,499 | MakerMods**

Before description: A lightweight, all-metal seven-axis robotic arm built for embodied AI, research, and education. ±0.1 mm repeatability, 3 kg payload, open SDK, ROS1/ROS2 ready.

After description: Metal Arm is a $2,499 seven-axis aluminum robot arm with 3 kg payload, ±0.1 mm repeatability, and ROS1/ROS2 support. View specs and order from MakerMods.

### so101.html

Before title: SO-101 Robot Arm Kit for MakerMods Lab | MakerMods

After title: **SO-101 Robot Arm Kit: Leader + Follower, $300 | MakerMods**

Before description: SO-101 leader and follower robot arms for MakerMods Lab teleoperation, dataset recording, training, and OpenBooth skills. Open-source hardware documented by Hugging Face.

After description: Buy the SO-101 leader + follower robot arm kit for $300. Calibrate, teleoperate, record datasets, and train policies with MakerMods Lab. See specs and setup.

## Validation and measurement

- Validated one title and one instance of each target meta field per changed page, consistent Open Graph/Twitter copy, and matching structured-data prices for SO-101 and Metal Arm.
- Confirmed that each page body is unchanged by this pass.
- Targeted metadata validation, SO-101 positioning checks, and whitespace validation pass on the isolated branch. Each HTML change is limited to six title/description fields.
- Publication is through the normal pull-request review and deployment process, not direct editing of Google listings. Google chooses displayed title links and snippets and can rewrite the supplied text.
- After the reviewed changes are deployed, inspect the three live URLs and request recrawling. Record the deployment date and the first observed updated title/snippet.
- Review after 28 complete days of post-recrawl data. Compare the same page/query combinations, checking device, country, position, and impression mix before interpreting changes in CTR. Continue observing if relevant query samples remain small. The historical period above is a baseline, not a controlled A/B test.
- Track qualified product-page visits and purchases/inquiries alongside CTR. Clear prices can filter out unsuitable clicks, so maximizing raw CTR alone is not the goal.
- Keep title and description prices synchronized whenever product prices change.

References:

- [Search Console performance report](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Amakermods.ai)
- [Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link)
- [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet)
