import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_DESTINATIONS = [
  {
    slug: "chitrakote-falls",
    name: "Chitrakote Waterfalls",
    categorySlug: "waterfalls",
    district: "Bastar",
    tagline: "The Majestic 'Niagara of India'",
    latitude: 19.2006,
    longitude: 81.6961,
    heroImage: "/chitrakote.png",
    story: "According to ancient Bastar folk belief, the Indravati river is a mother goddess descending from the heavens. Chitrakote is where she showcases her supreme cosmic energy (Shakti). Local tribal elders narrate that during the monsoon, the heavy roar of the waterfall represents the celestial drums of Lord Shiva. The mist rising from the gorge is believed to carry the prayers of the forest spirits directly to the heavens.",
    bestTime: "July to October (Monsoon flow is jaw-dropping); November to February (Scenic emerald water)",
    safety: "Stay strictly within designated security railings. Do not attempt swimming in the base whirlpools under any conditions. Watch for wet, slippery stone structures.",
    ecoGuidance: "Chhattisgarh state environmental protection rules strictly prohibit carrying plastic water bottles or packages down to the river bank. Bring reusable flasks. Ensure zero litter is left behind to safeguard the pristine aquatic life of the Indravati.",
    audioUrl: "/audio/chitrakote_falls.mp3",
    audioNarrator: "Aarav Mandavi",
    panoramaUrls: ["/chitrakote.png"]
  },
  {
    slug: "sirpur-monuments",
    name: "Sirpur Heritage Complex",
    categorySlug: "temples",
    district: "Raipur",
    tagline: "Ancient Crimson Brickwork & Lost Dynasties",
    latitude: 21.3414,
    longitude: 82.1764,
    heroImage: "/sirpur.png",
    story: "Sirpur, historically known as Shripura, was the ancient capital of Panduvansh kings in the 6th century. The centerpiece, Laxman Temple, stands as one of the finest surviving brick temples in India. Constructed with intricately carved red clay bricks, it was funded by Queen Vasata in memory of her late husband. Archaeological excavations reveal that Sirpur was a major international center for Buddhist, Hindu, and Jain learning, outdating even the famous Nalanda University.",
    bestTime: "October to March (Mild weather ideal for outdoor archaeological exploration)",
    safety: "Do not touch or lean on ancient brick friezes and stone carvings. Keep voice levels low inside the hollow main sanctum to preserve its tranquil energy.",
    ecoGuidance: "Sirpur is a protected heritage zone. Do not step on ancient moss/lichen growing on brick foundations. Stay strictly on gravel walkways to prevent foundation erosion.",
    audioUrl: "/audio/sirpur_monuments.mp3",
    audioNarrator: "Devi Sahu"
  },
  {
    slug: "bhoramdeo-temple",
    name: "Bhoramdeo Temple",
    categorySlug: "temples",
    district: "Kawardha",
    tagline: "The 'Khajuraho of Chhattisgarh'",
    latitude: 22.1158,
    longitude: 81.1542,
    heroImage: "/bhoramdeo.png",
    story: "Nestled in the lush Maikal Hills, Bhoramdeo was built by King Ramachandra of the Phani Nagvanshi dynasty in the 11th century. Dedicated to Lord Shiva, its design blends Nagara temple style with local tribal Gond symbolism. The temple walls are carved with incredible depictions of mythological deities, warriors, mythical beasts, and sensual carvings. It gets its name from 'Bhoramdeo', an ancient tribal deity of the Gond community who is worshipped here alongside Shiva.",
    bestTime: "November to March. The sacred Shivratri festival in March brings vibrant local fairs.",
    safety: "Monkeys inhabit the temple trees; keep foodstuffs inside zip bags. Maintain respectful attire inside the active inner sanctum.",
    ecoGuidance: "The nearby Bhoramdeo Wildlife Sanctuary is fragile. Respect quiet zones and throw all organic waste only in designated clay bins to prevent disrupting forest fauna."
  },
  {
    slug: "kanger-valley",
    name: "Kanger Valley National Park",
    categorySlug: "forests",
    district: "Bastar",
    tagline: "Pristine Sal Canopies & Subterranean Caves",
    latitude: 18.8789,
    longitude: 81.8596,
    heroImage: "/kanger.png",
    story: "Covering 200 sq km of dense, untouched forest, Kanger Valley is one of the most biodiverse zones in central India. It is famous for the Bastar Hill Myna (the official state bird) which can mimic human speech. The park hides ancient geological limestone formations like the Kutumsar Caves. Deep inside these damp, pitch-black chambers live unique blind and transparent fish species, adapted over millions of years of complete isolation.",
    bestTime: "November to May (Caves are accessible and wildlife spotting is highly active)",
    safety: "Never wander off marked forest trails. Kutumsar Caves have narrow crevices and low oxygen levels deep inside; visitors with breathing conditions should remain in the wider cavern halls.",
    ecoGuidance: "The caves contain delicate stalactite and stalagmite columns formed over thousands of years. Do not touch them, as oils from human skin permanently halt their crystal growth. Flashlights must be handled with care."
  },
  {
    slug: "tirathgarh-falls",
    name: "Tirathgarh Waterfalls",
    categorySlug: "waterfalls",
    district: "Bastar",
    tagline: "The Milky-White Cascade of Kanger River",
    latitude: 18.9161,
    longitude: 81.8654,
    heroImage: "/tirathgarh.png",
    story: "Tirathgarh Falls is a block-type waterfall where the Kanger River drops 300 feet in multiple layered steps. The water breaks into countless white streams, giving it a stunning milky appearance, often referred to as 'the forest queen's silk sari.' A small, ancient temple dedicated to Shiva stands on one of the rocky steps of the cascade, where hermits used to meditate amid the roaring water.",
    bestTime: "September to January (Monsoon runoff transitions to highly detailed, step-wise flows)",
    safety: "Steps leading down are extremely steep and can become slick with moss. Walk slowly and hold the handrails. Do not cross warning signs placed near deep water drop-offs.",
    ecoGuidance: "Avoid carrying disposable plastic packages. The waterfall basin is a critical habitat for unique mountain crabs and fish. Do not discard food crumbs into the water."
  },
  {
    slug: "barnawapara",
    name: "Barnawapara Wildlife Sanctuary",
    categorySlug: "forests",
    district: "Raipur",
    tagline: "Lush Teak Forests & Sanctuary of the Indian Bison",
    latitude: 21.4012,
    longitude: 82.4208,
    heroImage: "/barnawapara.png",
    story: "Covering 244 sq km of deciduous forests, Barnawapara is named after twin forest villages: Bar and Nawa Para. Local folklore integrates this forest with the epic Ramayana; it is believed that Sage Valmiki's ashram was located here, where Luv and Kush were born. Today, it is a crucial conservation zone for the Gaur (Indian Bison), Leopards, Sloth Bears, and over 150 species of vibrant tropical birds.",
    bestTime: "November to April (Optimal foliage for mammal spotting and migratory birds)",
    safety: "Do not wear bright colors (red, white) during safaris. Remain strictly inside the safari vehicle. Never try to feed or call out to wild animals.",
    ecoGuidance: "Strict zero-noise policy inside the sanctuary boundary. Keep mobile devices on silent. Avoid flash photography as it can disorient and agitate nocturnal sloth bears."
  },
  {
    slug: "achanakmar",
    name: "Achanakmar Tiger Reserve",
    categorySlug: "forests",
    district: "Bilaspur",
    tagline: "Lost in the Sal-Teak Heartland of Central India",
    latitude: 22.5300,
    longitude: 81.8800,
    heroImage: "/achanakmar.png",
    story: "Achanakmar Tiger Reserve sprawls across the Maikal Hills, a forgotten highland corridor linking Kanha and Pench tiger reserves. Ancient tribal communities have coexisted with the forest's tigers for centuries, developing sacred groves ('Dev Vans') where no trees are ever felled. Local oral tradition holds that the spirit of the forest tiger is the guardian of the tribal boundary — its roar signals both danger and protection.",
    bestTime: "November to March (Peak wildlife activity and dry-season water pooling)",
    safety: "Stay inside safari vehicles at all times. Do not use flash photography near wildlife. Maintain strict silence near waterholes and salt licks.",
    ecoGuidance: "Achanakmar is a UNESCO-recognised biosphere reserve. Carry zero plastic. All biodegradable waste must be packed out. Leave only footprints."
  },
  {
    slug: "gangrel-dam",
    name: "Gangrel Dam & Reservoir",
    categorySlug: "waterfalls",
    district: "Dhamtari",
    tagline: "The Largest Reservoir of Chhattisgarh",
    latitude: 20.6667,
    longitude: 81.4833,
    heroImage: "/gangrel.png",
    story: "Built across the Mahanadi River, the Gangrel (Ravishankar Sagar) Dam is the largest reservoir in Chhattisgarh. It is the birthplace of the Mahanadi water story — this colossal water body feeds the plains of Odisha and sustains 40% of the state's agriculture. During the monsoon overflow discharge, the dam's spillway thunder can be heard from 5 km away, as 36 gates open simultaneously in a breathtaking water spectacle.",
    bestTime: "August to November (Monsoon overflow discharge is spectacular)",
    safety: "Do not cross safety barriers near the spillway. Strong undertow currents exist near the dam base. Children must be supervised near water edges at all times.",
    ecoGuidance: "The reservoir is a Ramsar-nominated migratory bird habitat. Do not litter or discharge cleaning agents near the water. Avoid disturbing waterfowl colonies on the southern shore islands."
  },
  {
    slug: "labed-falls",
    name: "Labed Waterfall",
    categorySlug: "waterfalls",
    district: "Sakti",
    tagline: "A Pristine Hidden Cascade in the Sakti Wilderness",
    latitude: 22.1856,
    longitude: 82.8542,
    heroImage: "/labed.jpg",
    story: "Labed Waterfall is a hidden gem tucked away in the pristine valleys bordering the Sakti and Korba districts of Chhattisgarh. Surrounded by lush, dense forests of Sal and mixed canopy, the waterfall cascades down in multiple beautiful streams over dark, ancient rocks into a cool, emerald pool. Local villagers revere this secluded canyon, describing it as a sacred retreat where the forest gods gather during the monsoon rains. The dense tree cover keeps the valley cool and filled with mist year-round, creating a sanctuary for wild flora and quiet bird life.",
    bestTime: "July to November (Best monsoon flow and green foliage)",
    safety: "Rocks near the base pool are wet and slippery. Do not climb without precautions.",
    ecoGuidance: "Carry all plastic trash back with you. Help keep the forest pool clean."
  },
  {
    slug: "siddhi-vinayak",
    name: "Siddhi Vinayak Mandir",
    categorySlug: "temples",
    district: "Bilaspur",
    tagline: "Revered Abode of the Stone Ganesha in Ratanpur",
    latitude: 22.2920,
    longitude: 82.1610,
    heroImage: "/siddhi_vinayak.png",
    story: "Siddhi Vinayak Mandir is a historical temple in Ratanpur housing a unique and magnificent stone idol of Lord Ganesha in a standing posture. Surrounded by ancient trees and a serene temple pond, it has been a major pilgrimage hub since the Kalachuri era. Devotees believe that praying to this special Siddhi Vinayak ensures the removal of all obstacles (Vighnas) and brings good fortune.",
    bestTime: "September to March (Pleasant weather; spectacular during Ganesh Chaturthi festival)",
    safety: "Mind the steps leading to the pond. Keep leather items outside the main sanctum.",
    ecoGuidance: "Do not throw coconut shells or plastic packaging into the sacred pond. Keep the temple complex clean."
  },
  {
    slug: "kaal-bhairav",
    name: "Kaal Bhairav Mandir",
    categorySlug: "temples",
    district: "Bilaspur",
    tagline: "The Fierce Monolithic Guardian Deity of Ratanpur",
    latitude: 22.2780,
    longitude: 82.1720,
    heroImage: "/kaal_bhairav.png",
    story: "Kaal Bhairav Mandir houses a spectacular, towering 9-foot monolithic stone statue of Lord Bhairav, historically worshipped as the guardian king and absolute protector of the Ratanpur kingdom. The deity is depicted with fierce features, holding a trident and a skull cup, standing alongside his vehicle (a dog). Pilgrims visit this temple to seek protection from negative energies and to mark their presence in the sacred city of Ratanpur.",
    bestTime: "October to March (Ideal weather; highly vibrant during Bhairav Ashtami)",
    safety: "Maintain silence inside the prayer halls. Watch out for monkeys around the temple gates.",
    ecoGuidance: "Keep the temple bypass area clean. Avoid feeding the monkeys with plastic bags."
  },
  {
    slug: "ram-tekri",
    name: "Ram Tekri Mandir",
    categorySlug: "temples",
    district: "Bilaspur",
    tagline: "Fortress Temple of Bimbaji Bhonsle atop Ratanpur Hills",
    latitude: 22.2750,
    longitude: 82.1680,
    heroImage: "/ram_tekri.png",
    story: "Ram Tekri Mandir is a magnificent hilltop temple constructed in a fortress style by the Maratha ruler Bimbaji Bhonsle. Reached by climbing a scenic flight of stone steps, the temple houses exquisite idols of Lord Rama, Sita, and Laxmana, alongside an unusual stone statue of Bimbaji Bhonsle himself. The hill offers breathtaking panoramic views of Ratanpur's historic landscape, its dense green foliage, and numerous tranquil lakes.",
    bestTime: "October to February (Cool hill breezes and clear panoramic views)",
    safety: "Exercise caution while climbing the stone steps, especially during rain. Hold handrails where available.",
    ecoGuidance: "Do not discard water bottles along the trekking stairs. Keep the hilltop sanctuary litter-free."
  },
  {
    slug: "ratanpur-fort",
    name: "Ratanpur Fort",
    categorySlug: "temples",
    district: "Bilaspur",
    tagline: "11th-Century Citadel of the Kalachuri Kings",
    latitude: 22.2980,
    longitude: 82.1550,
    heroImage: "/ratanpur_fort.png",
    story: "Ratanpur Fort is an architectural masterpiece constructed in the 11th century by King Ratnadeva of the Kalachuri dynasty. Famous for its towering stone entrance known as the 'Gaj Kila' (Elephant Fort), it features ancient carvings of deities, dry moats, and stone-paved ramparts. Inside the fort lie the historic temples of Goddess Laxmi and various ruins that whisper tales of medieval sovereignty and battles for the heart of Chhattisgarh.",
    bestTime: "October to March (Excellent weather for walking around the outdoor ruins)",
    safety: "Watch your step on uneven stone paths. Keep away from deep dry moats and dark cellar entrances.",
    ecoGuidance: "Zero-tolerance for plastic littering inside the heritage site. Do not write or carve on the ancient stone walls."
  },
  {
    slug: "lakhni-devi",
    name: "Mahalakshmi Lakhni Devi Mandir Ratanpur",
    categorySlug: "temples",
    district: "Bilaspur",
    tagline: "Hilltop Sanctuary of Goddess Lakhni Devi on Ekbira Hill",
    latitude: 22.2850,
    longitude: 82.1580,
    heroImage: "/lakhni_devi.png",
    story: "Mahalakshmi Lakhni Devi Mandir is a stunning hilltop temple dedicated to Lakhni Devi, considered an incarnation of Goddess Mahalakshmi. Built by the Kalachuri kings on Ekbira Hill, the temple features a unique shell-like design. Pilgrims climb a winding flight of stone steps surrounded by lush green landscapes. The hilltop temple provides breathtaking panoramic views of Ratanpur valley, its lakes, and surrounding forests, making it both a spiritual and scenic retreat.",
    bestTime: "September to March (Very pleasant; spectacular during Navratri festivals when the hill is beautifully illuminated)",
    safety: "Hold on to the handrails along the hilltop stairs. Avoid climbing late at night.",
    ecoGuidance: "Please carry your water bottles back. Ekbira Hill is a clean sanctuary — do not litter."
  },
  {
    slug: "budha-mahadev",
    name: "Budha Mahadev Mandir Ratanpur",
    categorySlug: "temples",
    district: "Bilaspur",
    tagline: "Ancient Underground Sanctum beside Ratanpur's Sacred Pond",
    latitude: 22.2830,
    longitude: 82.1620,
    heroImage: "/budha_mahadev.png",
    story: "Budha Mahadev Mandir is an extremely ancient Shiva temple situated on the banks of a historical pond in Ratanpur. The temple is unique for its underground stone sanctum holding a swayambhu (self-manifested) Shiva Lingam, which lies below the surface level. Revered as one of the oldest spiritual seats of the Kalachuri kingdom, it draws yogis and devotees seeking absolute peace and deep meditation inside its cool, subterranean stone chambers.",
    bestTime: "October to March (Very peaceful; highly active during Mahashivratri festival)",
    safety: "Steps descending to the underground sanctum are steep and dark. Move slowly and watch your step.",
    ecoGuidance: "Do not throw ritual flowers or plastic items into the adjacent historical pond. Keep the inner sanctuary dry."
  },
  {
    slug: "khuntaghat-overflow",
    name: "Khuntaghat Ulat (Overflow)",
    categorySlug: "waterfalls",
    district: "Bilaspur",
    tagline: "The Thundering Stepped Spillway Waterfall of Sanjay Gandhi Reservoir",
    latitude: 22.2514,
    longitude: 82.1950,
    heroImage: "/khuntaghat_overflow.png",
    story: "Khuntaghat Ulat is the spectacular stepped overflow spillway of the historic Khuntaghat Dam (Sanjay Gandhi Reservoir). During peak monsoon months, the reservoir overflows in an incredible thundering cascade over massive concrete stairs, creating a roaring artificial waterfall that draws thousands of eco-tourists for cold-pool dips and scenic photography.",
    bestTime: "July to October (Monsoon overflow peak when the stepped falls are active)",
    safety: "Never cross safety barriers near the stepped overflow spillway. Strictly avoid deep-water currents near the main release basin.",
    ecoGuidance: "Help protect the nesting migratory birds. Carry all food packets and bottles back with you."
  },
  {
    slug: "tiger-point-mainpat",
    name: "Tiger Point Waterfall",
    categorySlug: "waterfalls",
    district: "Mainpat",
    tagline: "The Majestic Fall of Mainpat",
    latitude: 22.8223,
    longitude: 83.2842,
    heroImage: "/tiger_point.jpg",
    story: "Tiger Point is the most famous waterfall in Mainpat, plunging from a height of approximately 50-60 meters. According to locals, tigers used to visit this spot to drink water, which gave it its name. The surrounding dense forests and the roar of the cascading water make it an ideal spot for photography and picnics.",
    bestTime: "July to September (Monsoon) and October to February",
    safety: "Do not venture close to the edge of the falls. The rocks can be extremely slippery.",
    ecoGuidance: "Maintain cleanliness and do not throw plastic waste in the forest area."
  },
  {
    slug: "ulta-pani",
    name: "Ulta Pani (Bisar Pani)",
    categorySlug: "forests",
    district: "Mainpat",
    tagline: "The Gravity-Defying Stream",
    latitude: 22.8150,
    longitude: 83.2800,
    heroImage: "/ulta_pani.jpg",
    story: "Ulta Pani is a unique and mind-boggling location in Mainpat where water appears to flow uphill. This optical illusion is similar to 'magnetic hills' found elsewhere in the world. Visitors often test the phenomenon by placing a water bottle or turning off their vehicle's engine to watch it roll uphill against gravity.",
    bestTime: "All year round",
    safety: "Safe for all ages. Keep an eye out for vehicles testing the uphill roll on the road.",
    ecoGuidance: "Respect the local village surroundings and do not litter."
  },
  {
    slug: "jaljali-mainpat",
    name: "Jaljali (Daldali)",
    categorySlug: "forests",
    district: "Mainpat",
    tagline: "The Bouncing Earth of Mainpat",
    latitude: 22.8250,
    longitude: 83.2900,
    heroImage: "/jaljali.jpg",
    story: "Jaljali is a fascinating natural wonder where the earth literally bounces under your feet. The ground here has a spongy, trampoline-like texture due to a unique geological phenomenon involving trapped subterranean water and specialized soil structure. Visitors love to jump together to feel the seismic ripples travel through the earth.",
    bestTime: "October to March",
    safety: "Safe to jump, but avoid areas that look too wet or marshy.",
    ecoGuidance: "Do not dig or attempt to puncture the spongy ground layer."
  },
  {
    slug: "buddha-temple-mainpat",
    name: "Buddha Temple (Tibetan Monastery)",
    categorySlug: "temples",
    district: "Mainpat",
    tagline: "A Slice of Tibet in Chhattisgarh",
    latitude: 22.8100,
    longitude: 83.2750,
    heroImage: "https://images.unsplash.com/photo-1548625361-f6dbca5c71b3?auto=format&fit=crop&w=1200&q=80",
    story: "Often referred to as the 'Mini Tibet' of Chhattisgarh, Mainpat is home to a significant Tibetan refugee community resettled here in the 1960s. The Buddha Temple (Dhakpo Shedupling Monastery) is the spiritual heart of this community. It features beautiful Tibetan architecture, colorful prayer flags fluttering in the cool breeze, and a peaceful ambiance.",
    bestTime: "All year round. Especially vibrant during Tibetan New Year (Losar).",
    safety: "Maintain silence and respect the monastic rules while inside the prayer halls.",
    ecoGuidance: "Respect the serene environment; do not play loud music."
  },
  {
    slug: "fish-point-mainpat",
    name: "Fish Point Waterfall",
    categorySlug: "waterfalls",
    district: "Mainpat",
    tagline: "A Hidden Cascade in the Dense Woods",
    latitude: 22.8300,
    longitude: 83.3000,
    heroImage: "https://images.unsplash.com/photo-1546948630-1149ea60dc86?auto=format&fit=crop&w=1200&q=80",
    story: "Fish Point gets its name from the Machhali Nadi (Fish River) that flows through this region. The river takes a steep plunge deep within the forested hills, creating a highly scenic and secluded waterfall. It is a highly popular picnic destination, offering a pristine natural environment away from the usual crowds.",
    bestTime: "August to January",
    safety: "Swimming is not advised due to underwater rocks and strong currents.",
    ecoGuidance: "Pack out whatever you bring in; there are no garbage disposal facilities near the falls."
  },
  {
    slug: "mehta-point-mainpat",
    name: "Mehta Point",
    categorySlug: "forests",
    district: "Mainpat",
    tagline: "The Grand Panorama of Mainpat",
    latitude: 22.8000,
    longitude: 83.2600,
    heroImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    story: "Mehta Point offers a spectacular, unobstructed view of the deep valleys and vast green forests stretching across the Surguja district. It is widely considered the best location in Mainpat for watching the sunrise and sunset, as the sky turns into a canvas of vibrant colors over the rolling hills.",
    bestTime: "October to February for clear skies and misty mornings.",
    safety: "There are steep drop-offs; keep children away from the edges.",
    ecoGuidance: "Do not throw any objects or litter into the valley."
  },
  {
    slug: "ghaghi-waterfall",
    name: "Ghaghi Waterfall",
    categorySlug: "waterfalls",
    district: "Mainpat",
    tagline: "Mainpat's Best Kept Secret",
    latitude: 22.8400,
    longitude: 83.3100,
    heroImage: "https://images.unsplash.com/photo-1506159904225-f0529ce1fb29?auto=format&fit=crop&w=1200&q=80",
    story: "Ghaghi Waterfall is a beautiful, lesser-known cascade hidden deep within the dense forests of Mainpat. Because it is less commercialized than Tiger Point, it offers a tranquil escape for nature lovers. The waterfall is most breathtaking during or just after the monsoon when the water flow is robust and the surrounding foliage is vibrantly green.",
    bestTime: "August to November",
    safety: "Travel in a group as the area is quite secluded. Wear sturdy hiking shoes.",
    ecoGuidance: "This is a pristine environment. Please practice 'Leave No Trace' principles strictly."
  },
  {
    slug: "parpatiya-sunset-point",
    name: "Parpatiya Sunset Point",
    categorySlug: "forests",
    district: "Mainpat",
    tagline: "A Canvas of Golden Hues",
    latitude: 22.7900,
    longitude: 83.2500,
    heroImage: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
    story: "Parpatiya is renowned as one of the best places in Chhattisgarh to enjoy panoramic sunset views. From this vantage point, you can see a seemingly endless expanse of valleys, forests, and distant mountain ranges. As the sun dips below the horizon, the entire landscape is bathed in a warm, golden glow, making it highly popular among nature lovers and photographers.",
    bestTime: "September to March",
    safety: "Stay behind any barriers and watch your step as it gets dark quickly after sunset.",
    ecoGuidance: "Keep the viewpoint clean for everyone to enjoy."
  },
  {
    slug: "madwa-mahal",
    name: "Madwa Mahal",
    categorySlug: "temples",
    district: "Kawardha",
    tagline: "The Historical Monument of the Nagvanshis",
    latitude: 22.1000,
    longitude: 81.1600,
    heroImage: "https://images.unsplash.com/photo-1548625361-f6dbca5c71b3?auto=format&fit=crop&w=1200&q=80",
    story: "Located just a kilometer away from the famous Bhoramdeo Temple, Madwa Mahal is an ancient archaeological site built in 1349 AD by the Nagvanshi ruler Ramachandra Deo. Originally constructed as a 'Mandap' (marriage hall) to commemorate the marriage between a Nagvanshi king and a Haihaya princess, the temple is dedicated to Lord Shiva. It features a stunning Shiva Linga and exquisite carvings reflecting the rich culture of that era.",
    bestTime: "October to March",
    safety: "Do not climb the ancient fragile structures.",
    ecoGuidance: "Maintain the sanctity of the archaeological site. Do not touch or deface the carvings."
  },
  {
    slug: "chherki-mahal",
    name: "Chherki Mahal",
    categorySlug: "temples",
    district: "Kawardha",
    tagline: "A Serene Retreat for History Lovers",
    latitude: 22.0950,
    longitude: 81.1650,
    heroImage: "/chherki_mahal.jpg",
    story: "Chherki Mahal is another fascinating archaeological monument forming the Bhoramdeo temple trio. Constructed by the Nagvanshi kings during the 14th century, it is dedicated to Lord Shiva but holds a unique charm with its unpretentious, slightly unfinished architectural style. Set amidst tranquil surroundings, it smells faintly of goat ('chheri' in local dialect), which gives it its peculiar name. It is less crowded and offers a deeply peaceful environment for history enthusiasts.",
    bestTime: "October to March",
    safety: "The site is safe but somewhat secluded; best visited during daylight hours.",
    ecoGuidance: "Keep the monument surroundings clean."
  },
  {
    slug: "chilphi-valley",
    name: "Chilphi Valley",
    categorySlug: "forests",
    district: "Kawardha",
    tagline: "The Winding Hill Station of Maikal",
    latitude: 22.1800,
    longitude: 81.0500,
    heroImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    story: "Chilphi Valley is a breathtakingly beautiful hill station-like destination nestled in the Maikal Hills range. The journey through the valley features steep, winding roads cutting through lush, dense forests. It is famous for its cool, misty weather, panoramic views, and is a favorite route for bikers and nature enthusiasts looking for adventure and serenity.",
    bestTime: "July to October (Monsoon) and November to February",
    safety: "Drive carefully as the mountain roads have sharp hairpin bends and can be foggy.",
    ecoGuidance: "Do not throw plastic waste out of your vehicle while driving through the forest."
  },
  {
    slug: "ranidhara-waterfall",
    name: "Ranidhara Waterfall",
    categorySlug: "waterfalls",
    district: "Kawardha",
    tagline: "A Scenic Plunge in the Maikal Forests",
    latitude: 22.2500,
    longitude: 81.0000,
    heroImage: "https://images.unsplash.com/photo-1432405972618-c60002a157c5?auto=format&fit=crop&w=1200&q=80",
    story: "Ranidhara is a picturesque waterfall hidden within the dense greenery of the Kabirdham district. Translating to 'The Queen's Stream', it offers a tranquil environment where water plunges down rocky steps surrounded by lush forests. It is a highly popular picnic destination for locals and a great spot for nature photography, especially after the monsoon.",
    bestTime: "July to November",
    safety: "Be careful of slippery rocks near the waterfall base. Swimming is not recommended during heavy flow.",
    ecoGuidance: "Pack out whatever you pack in. Maintain the pristine condition of the waterfall area."
  },
  {
    slug: "bhoramdeo-wildlife-sanctuary",
    name: "Bhoramdeo Wildlife Sanctuary",
    categorySlug: "forests",
    district: "Kawardha",
    tagline: "The Emerald Wilderness of Central India",
    latitude: 22.1500,
    longitude: 81.1000,
    heroImage: "https://images.unsplash.com/photo-1589656966895-2f331719b5d9?auto=format&fit=crop&w=1200&q=80",
    story: "Sharing a border with the famous Kanha National Park in Madhya Pradesh, the Bhoramdeo Wildlife Sanctuary covers 352 sq. km of pristine deciduous forests. It acts as a critical wilderness corridor and is home to a rich diversity of fauna including leopards, sloth bears, Indian gaur (bison), spotted deer, and numerous bird species. It offers an authentic, off-the-beaten-path jungle experience.",
    bestTime: "November to June",
    safety: "Always travel with a registered forest guide during safaris. Do not step out of the vehicle.",
    ecoGuidance: "Maintain absolute silence and avoid flash photography during the safari."
  },
  {
    slug: "jain-tirth-bakela",
    name: "Jain Tirth Bakela",
    categorySlug: "temples",
    district: "Kawardha",
    tagline: "A Peaceful Jain Pilgrimage Site",
    latitude: 22.0500,
    longitude: 81.2500,
    heroImage: "https://images.unsplash.com/photo-1548625361-f6dbca5c71b3?auto=format&fit=crop&w=1200&q=80",
    story: "Bakela is an important pilgrimage destination for the Jain community, located in the Kabirdham district. The site features beautiful, intricately carved Jain temples set in a deeply peaceful and meditative environment. It attracts devotees from across the state who come to seek spiritual solace and admire the immaculate white marble architecture.",
    bestTime: "All year round",
    safety: "Respect the religious customs; appropriate attire is required.",
    ecoGuidance: "The temple complex is kept immaculately clean; strictly no littering."
  },
  {
    slug: "saroda-dadar",
    name: "Saroda Dadar",
    categorySlug: "forests",
    district: "Kawardha",
    tagline: "The Scenic Viewpoint of Kabirdham",
    latitude: 22.1200,
    longitude: 81.0800,
    heroImage: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
    story: "Saroda Dadar is a stunning hilltop viewpoint that offers sweeping, panoramic vistas of the surrounding Maikal Hills and dense forests. Known for its cool weather, it is a highly popular picnic destination. Visitors flock here to witness spectacular sunrise and sunset views that paint the sky in brilliant hues.",
    bestTime: "October to March",
    safety: "Stay away from the steep edges of the viewpoint, especially with children.",
    ecoGuidance: "Do not throw any trash down the hillside."
  },
  {
    slug: "pachrahi",
    name: "Pachrahi",
    categorySlug: "forests",
    district: "Kawardha",
    tagline: "A Historic Eco-Tourism Haven",
    latitude: 22.2000,
    longitude: 81.1800,
    heroImage: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1200&q=80",
    story: "Pachrahi is a prominent archaeological site intertwined with a scenic natural environment. Excavations have revealed fascinating ancient artifacts, coins, and structural ruins dating back centuries, suggesting a significant historical settlement. Surrounded by peaceful forests, it is now an emerging eco-tourism destination perfect for day trips and history enthusiasts.",
    bestTime: "October to March",
    safety: "Do not touch or move any archaeological artifacts you might encounter.",
    ecoGuidance: "Help preserve the archaeological integrity; stick to the marked walking paths."
  }
];

const SEED_CATEGORIES = [
  { name: "Waterfalls", slug: "waterfalls" },
  { name: "Forests & Parks", slug: "forests" },
  { name: "Historic Temples", slug: "temples" },
  { name: "Tribal Villages", slug: "villages" }
];

interface LangTranslation {
  name: string;
  description?: string;
  bestSeason?: string;
  history?: string;
  safetyInfo?: string;
  rules?: string;
}

const CATEGORY_TRANSLATIONS: Record<string, Record<string, { name: string }>> = {
  waterfalls: {
    hi: { name: "जलप्रपात" },
    cg: { name: "जलप्रपात" },
    en: { name: "Waterfalls" }
  },
  forests: {
    hi: { name: "घने जंगल" },
    cg: { name: "घने जंगल" },
    en: { name: "Forests & Parks" }
  },
  temples: {
    hi: { name: "ऐतिहासिक मंदिर" },
    cg: { name: "पुरानी मंदिर" },
    en: { name: "Historic Temples" }
  },
  villages: {
    hi: { name: "आदिवासी गाँव" },
    cg: { name: "आदिवासी गाँव" },
    en: { name: "Tribal Villages" }
  }
};

const PLACE_TRANSLATIONS: Record<string, Record<string, LangTranslation>> = {
  "chitrakote-falls": {
    hi: {
      name: "चित्रकोट जलप्रपात",
      description: "भव्य 'भारत का नियाग्रा'",
      history: "प्राचीन बस्तर लोक विश्वास के अनुसार, इंद्रावती नदी स्वर्ग से उतरने वाली एक मातृ देवी है। चित्रकोट वह जगह है जहां वह अपनी सर्वोच्च ब्रह्मांडीय ऊर्जा (शक्ति) का प्रदर्शन करती हैं। स्थानीय आदिवासी बुजुर्ग बताते हैं कि मानसून के दौरान, झरने की भारी गर्जना भगवान शिव के दिव्य डमरू का प्रतिनिधित्व करती है। कण्ठ से उठने वाला कोहरा सीधे स्वर्ग में वन आत्माओं की प्रार्थना ले जाने के लिए माना जाता है।",
      bestSeason: "जुलाई से अक्टूबर (मानसून का प्रवाह अद्भुत है); नवंबर से फरवरी (सुंदर पन्ना पानी)",
      safetyInfo: "निर्दिष्ट सुरक्षा रेलिंग के भीतर ही रहें। किसी भी परिस्थिति में बेस भंवरों में तैरने का प्रयास न करें। गीली, फिसलन वाली पत्थर की संरचनाओं से सावधान रहें।",
      rules: "छत्तीसगढ़ राज्य पर्यावरण संरक्षण नियम नदी तट पर प्लास्टिक की पानी की बोतलें या पैकेज ले जाने पर कड़ाई से प्रतिबंध लगाते हैं। पुन: प्रयोज्य फ्लास्क लाएं। इंद्रावती के प्राचीन जलीय जीवन की सुरक्षा के लिए शून्य कचरा छोड़ना सुनिश्चित करें।"
    },
    cg: {
      name: "चित्रकोट जलप्रपात",
      description: "भव्य 'भारत के नियाग्रा'",
      history: "पुराना बस्तर के पुरखा गोठ के हिसाब से, इंद्रावती नदी ह सुरग ले उतरइया एक दाई (माता) आय। चित्रकोट ओ जगह ए जिहां दाई अपन भारी शक्ति देखाथे। हमर आदिवासी सियन मन बताथें कि चौमास म, पानी गिरे के भारी आवाज ह महादेव के डमरू जइसन बाजथे। घाटी ले उठइया कोहरा ह सुरग म जंगल के देव मन तक हमर अरजी पहुंचाथे।",
      bestSeason: "जुलाई से अक्टूबर (चौमास म पानी ह भारी बहथे); नवंबर से फरवरी (हरियर गोठ जइसन पानी)",
      safetyInfo: "सुरक्षा रेलिंग के भीतर ही रहव। पानी के भंवर म झन तैरव। गीला अउ पिछलहा पथरा मन से बचके रहव।",
      rules: "छत्तीसगढ़ सरकार के पर्यावरण नियम के हिसाब से नदी तीर म प्लास्टिक के बोतल या कछरा ले जाना मना हे। अपन संग म तांबा या स्टील के बोतल लाव। नदी ला साफ रखव ताकि इंद्रावती के मछरी अउ जीव मन सुरक्षित रह सकें।"
    },
    en: {
      name: "Chitrakote Waterfalls",
      description: "The Majestic 'Niagara of India'",
      history: "According to ancient Bastar folk belief, the Indravati river is a mother goddess descending from the heavens. Chitrakote is where she showcases her supreme cosmic energy (Shakti). Local tribal elders narrate that during the monsoon, the heavy roar of the waterfall represents the celestial drums of Lord Shiva. The mist rising from the gorge is believed to carry the prayers of the forest spirits directly to the heavens.",
      bestSeason: "July to October (Monsoon flow is jaw-dropping); November to February (Scenic emerald water)",
      safetyInfo: "Stay strictly within designated security railings. Do not attempt swimming in the base whirlpools under any conditions. Watch for wet, slippery stone structures.",
      rules: "Chhattisgarh state environmental protection rules strictly prohibit carrying plastic water bottles or packages down to the river bank. Bring reusable flasks. Ensure zero litter is left behind to safeguard the pristine aquatic life of the Indravati."
    }
  },
  "sirpur-monuments": {
    hi: {
      name: "सिरपुर विरासत स्थल",
      description: "प्राचीन लाल ईंटवर्क और खोए हुए राजवंश",
      history: "सिरपुर, जिसे ऐतिहासिक रूप से श्रीपुर के नाम से जाना जाता था, छठी शताब्दी में पांडुवंशी राजाओं की प्राचीन राजधानी थी। इसका मुख्य आकर्षण लक्ष्मण मंदिर है, जो भारत में सबसे बेहतरीन बचे हुए ईंट मंदिरों में से एक है। जटिल रूप से नक्काशीदार लाल मिट्टी की ईंटों से निर्मित, इसे रानी वासटा ने अपने दिवंगत पति की स्मृति में बनवाया था। पुरातात्विक उत्खनन से पता चलता है कि सिरपुर बौद्ध, हिंदू और जैन शिक्षा का एक प्रमुख अंतरराष्ट्रीय केंद्र था, जो प्रसिद्ध नालंदा विश्वविद्यालय से भी पुराना था।",
      bestSeason: "अक्टूबर से मार्च (बाहरी पुरातात्विक अन्वेषण के लिए आदर्श मौसम)",
      safetyInfo: "प्राचीन ईंटों की नक्काशी और पत्थर की नक्काशियों को न छूएं और न ही उन पर झुकें। शांत ऊर्जा को बनाए रखने के लिए गर्भगृह के भीतर आवाज धीमी रखें।",
      rules: "सिरपुर एक संरक्षित विरासत क्षेत्र है। ईंटों की नींव पर उगने वाली प्राचीन काई को नुकसान न पहुंचाएं। नींव के क्षरण को रोकने के लिए निर्धारित पैदल मार्गों पर ही चलें।"
    },
    cg: {
      name: "सिरपुर पुरखा धरोहर",
      description: "पुराना लाल ईंट कला अउ हराय राजवंश",
      history: "सिरपुर, जेला पुराना समय म श्रीपुर कहे जाय, ६वीं सदी म पांडुवंशी राजा मन के राजधानी रहीस। सबले सुंदर मंदिर लक्ष्मण मंदिर ए, जउन ह ईंट ले बने मंदिर मन म सबले पुराना अउ जीवित हे। लाल मटी के ईंट ले सुंदर नक्काशी करके रानी वासटा ह अपन पति के सुरता म बनवाए रहीस। खुदाई म पता चले हे कि सिरपुर ह बौद्ध, हिंदू अउ जैन धरम के बड़े पढ़ाई के जगह रहीस, जउन ह नालंदा ले घलो पुराना रहीस।",
      bestSeason: "अक्टूबर से मार्च (घूमे अउ इतिहास जाने बर बढ़िया मौसम)",
      safetyInfo: "पुरानी ईंट अउ मूर्ति मन ला झन छुव अउ ओमा झन झुकव। गर्भगृह के भीतर शांत रहव अउ आवाज धीमी रखव।",
      rules: "सिरपुर ह एक सुरक्षित जगह ए। ईंट मन म उगे काई ला झन छुव। रद्दा म ही चलव ताकि पुरानी नींव ला नुकसान झन पहुंचे।"
    },
    en: {
      name: "Sirpur Heritage Complex",
      description: "Ancient Crimson Brickwork & Lost Dynasties",
      history: "Sirpur, historically known as Shripura, was the ancient capital of Panduvansh kings in the 6th century. The centerpiece, Laxman Temple, stands as one of the finest surviving brick temples in India. Constructed with intricately carved red clay bricks, it was funded by Queen Vasata in memory of her late husband. Archaeological excavations reveal that Sirpur was a major international center for Buddhist, Hindu, and Jain learning, outdating even the famous Nalanda University.",
      bestSeason: "October to March (Mild weather ideal for outdoor archaeological exploration)",
      safetyInfo: "Do not touch or lean on ancient brick friezes and stone carvings. Keep voice levels low inside the hollow main sanctum to preserve its tranquil energy.",
      rules: "Sirpur is a protected heritage zone. Do not step on ancient moss/lichen growing on brick foundations. Stay strictly on gravel walkways to prevent foundation erosion."
    }
  },
  "bhoramdeo-temple": {
    hi: {
      name: "भोरमदेव मंदिर",
      description: "छत्तीसगढ़ का 'खजुराहो'",
      history: "मैकल पहाड़ियों में बसा भोरमदेव मंदिर 11वीं शताब्दी में फणि नागवंशी राजवंश के राजा रामचंद्र द्वारा बनवाया गया था। भगवान शिव को समर्पित यह मंदिर नागर शैली और स्थानीय गोंड आदिवासी प्रतीकों का मिश्रण है। दीवारों पर देवताओं, योद्धाओं और कामुक मूर्तियां उकेरी गई हैं। इसका नाम गोंड समुदाय के प्राचीन देवता 'भोरमदेव' के नाम पर पड़ा है।",
      bestSeason: "नवंबर से मार्च। मार्च में महाशिवरात्रि पर जीवंत स्थानीय मेला लगता है।",
      safetyInfo: "बंदरों से सावधान रहें, खाद्य सामग्री बैग में रखें। गर्भगृह में मर्यादित वस्त्र पहनें।",
      rules: "भोरमदेव वन्यजीव अभयारण्य संवेदनशील क्षेत्र है। वन्यजीवों को परेशान न करें, जैविक कचरा मिट्टी के बर्तनों में ही डालें।"
    },
    cg: {
      name: "भोरमदेव मंदिर",
      description: "छत्तीसगढ़ के 'खजुराहो'",
      history: "मैकल पहाड़ म बसे भोरमदेव मंदिर ला ११वीं सदी म फणि नागवंशी राजा रामचंद्र ह बनवाए रहीस। महादेव ला समर्पित ये मंदिर नागर कला अउ गोंड आदिवासी चिन्ह मन के सुंदर मेल ए। मंदिर के दीवार म भगवान, वीर अउ सुंदर मूर्ति बने हे। गोंड समाज के पुरखा देव 'भोरमदेव' के नाम म ये मंदिर के नाम रखे गे हे।",
      bestSeason: "नवंबर से मार्च। मार्च म महाशिवरात्रि म भारी मेला भराथे।",
      safetyInfo: "बंदर मन ले बचके रहव, खइया सामान ला बैग म रखव। मंदिर म ढंग के कपड़ा पहिर के जाव।",
      rules: "भोरमदेव जंगल ह बहुत संवेदनशील ए। हल्ला झन करव, कचरा ला माटी के डब्बा म ही डांड़व।"
    },
    en: {
      name: "Bhoramdeo Temple",
      description: "The 'Khajuraho of Chhattisgarh'",
      history: "Nestled in the lush Maikal Hills, Bhoramdeo was built by King Ramachandra of the Phani Nagvanshi dynasty in the 11th century. Dedicated to Lord Shiva, its design blends Nagara temple style with local tribal Gond symbolism. The temple walls are carved with incredible depictions of mythological deities, warriors, mythical beasts, and sensual carvings. It gets its name from 'Bhoramdeo', an ancient tribal deity of the Gond community who is worshipped here alongside Shiva.",
      bestSeason: "November to March. The sacred Shivratri festival in March brings vibrant local fairs.",
      safetyInfo: "Monkeys inhabit the temple trees; keep foodstuffs inside zip bags. Maintain respectful attire inside the active inner sanctum.",
      rules: "The nearby Bhoramdeo Wildlife Sanctuary is fragile. Respect quiet zones and throw all organic waste only in designated clay bins to prevent disrupting forest fauna."
    }
  },
  "kanger-valley": {
    hi: {
      name: "कांगेर घाटी राष्ट्रीय उद्यान",
      description: "साल वन और भूमिगत गुफाएं",
      history: "200 वर्ग किमी में फैला कांगेर घाटी मध्य भारत के सबसे जैव-विविधता वाले क्षेत्रों में से एक है। यह बस्तर पहाड़ी मैना (राजकीय पक्षी) के लिए प्रसिद्ध है जो इंसानों की नकल कर सकती है। यहाँ कुटुमसर जैसी चूना पत्थर की गुफाएं हैं जहाँ बिना आंखों वाली अनोखी मछलियां पाई जाती हैं।",
      bestSeason: "नवंबर से मई (गुफाएं खुली रहती हैं और वन्यजीव सक्रिय रहते हैं)",
      safetyInfo: "चिह्नित रास्तों से अलग न जाएं। कुटुमसर गुफाओं में ऑक्सीजन की कमी हो सकती है; सांस के रोगी प्रवेश न करें।",
      rules: "गुफा की आकृतियां (स्टैलेक्टाइट) छूने से उनकी वृद्धि रुक जाती है। उन्हें न छूएं। टॉर्च सावधानी से जलाएं।"
    },
    cg: {
      name: "कांगेर घाटी राष्ट्रीय उद्यान",
      description: "साल जंगल अउ भीतर के गुफा मन",
      history: "२०० वर्ग किमी म फैले कांगेर घाटी ह मध्य भारत के सबले सुंदर जंगल ए। ये हमर राजकीय चिरई 'बस्तर पहाड़ी मैना' बर प्रसिद्ध हे जउन ह मनुख जइसन बोलथे। इहाँ कुटुमसर जइसन चूना पत्थर के गुफा हे जिहां बिना आंखी के अनोखी मछरी मन रहथें।",
      bestSeason: "नवंबर से मई (गुफा मन खुले रहथें अउ जंगली जीव देखथें)",
      safetyInfo: "जंगल के मुख्य रद्दा ले अलग झन जाव। कुटुमसर गुफा के भीतर ऑक्सीजन कम हो सकथे, दमा के मरीज भीतर झन जाव।",
      rules: "गुफा के भीतर बने चूना पत्थर के खंभा मन ला झन छुव, हाथ लगाए से ओ मन बढ़ना बंद हो जाथें। टॉर्च ला संभाल के जलाओ।"
    },
    en: {
      name: "Kanger Valley National Park",
      description: "Pristine Sal Canopies & Subterranean Caves",
      history: "Covering 200 sq km of dense, untouched forest, Kanger Valley is one of the most biodiverse zones in central India. It is famous for the Bastar Hill Myna (the official state bird) which can mimic human speech. The park hides ancient geological limestone formations like the Kutumsar Caves. Deep inside these damp, pitch-black chambers live unique blind and transparent fish species, adapted over millions of years of complete isolation.",
      bestSeason: "November to May (Caves are accessible and wildlife spotting is highly active)",
      safetyInfo: "Never wander off marked forest trails. Kutumsar Caves have narrow crevices and low oxygen levels deep inside; visitors with breathing conditions should remain in the wider cavern halls.",
      rules: "The caves contain delicate stalactite and stalagmite columns formed over thousands of years. Do not touch them, as oils from human skin permanently halt their crystal growth. Flashlights must be handled with care."
    }
  },
  "tirathgarh-falls": {
    hi: {
      name: "तीरथगढ़ जलप्रपात",
      description: "कांगेर नदी की दूधिया जलधारा",
      history: "तीरथगढ़ जलप्रपात में कांगेर नदी 300 फीट की ऊंचाई से कई सीढ़ियों में गिरती है। पानी दूधिया सफेद दिखाई देता है, जिसे 'वन रानी की रेशमी साड़ी' कहा जाता है। चट्टानों पर भगवान शिव का एक प्राचीन मंदिर है जहाँ साधु तपस्या करते थे।",
      bestSeason: "सितंबर से जनवरी (सीढ़ीदार झरने का सुंदर प्रवाह)",
      safetyInfo: "नीचे जाने वाली सीढ़ियां बेहद खड़ी और फिसलन भरी हैं। धीरे चलें और रेलिंग पकड़ें। खतरे के संकेतों को पार न करें।",
      rules: "कांगेर घाटी राष्ट्रीय उद्यान में प्लास्टिक ले जाना वर्जित है। झरना क्षेत्र केकड़ों और मछलियों का आवास है। पानी में भोजन के टुकड़े न फेंकें।"
    },
    cg: {
      name: "तीरथगढ़ जलप्रपात",
      description: "कांगेर नदी के दूध जइसन पानी",
      history: "तीरथगढ़ झरना म कांगेर नदी ह ३०० फीट ऊपर ले सीढ़ी जइसन गिरथे। पानी ह दूध जइसन सफेद दिखथे, जेला 'जंगल के रानी के रेशमी साड़ी' घलो कहे जाथे। चट्टान म महादेव के एक पुराना मंदिर हे जिहां साधु मन तपस्या करत रहीन।",
      bestSeason: "सितंबर से जनवरी (सीढ़ी जइसन गिरत पानी ह बहुत सुंदर दिखथे)",
      safetyInfo: "नीचे जाय के सीढ़ी मन बहुत खड़ी अउ पिछलहा हे। धीरे-धीरे जाव अउ रेलिंग ला धरव। चेतावनी बोर्ड ला पार झन करव।",
      rules: "प्लास्टिक ले जाना मना हे। झरना तीर म केकड़ा अउ मछरी मन रहथें, पानी म खइया सामान झन फेंकव।"
    },
    en: {
      name: "Tirathgarh Waterfalls",
      description: "The Milky-White Cascade of Kanger River",
      history: "Tirathgarh Falls is a block-type waterfall where the Kanger River drops 300 feet in multiple layered steps. The water breaks into countless white streams, giving it a stunning milky appearance, often referred to as 'the forest queen's silk sari.' A small, ancient temple dedicated to Shiva stands on one of the rocky steps of the cascade, where hermits used to meditate amid the roaring water.",
      bestSeason: "September to January (Monsoon runoff transitions to highly detailed, step-wise flows)",
      safetyInfo: "Steps leading down are extremely steep and can become slick with moss. Walk slowly and hold the handrails. Do not cross warning signs placed near deep water drop-offs.",
      rules: "Avoid carrying disposable plastic packages. The waterfall basin is a critical habitat for unique mountain crabs and fish. Do not discard food crumbs into the water."
    }
  },
  "barnawapara": {
    hi: {
      name: "बारनवापारा वन्यजीव अभयारण्य",
      description: "सागौन वन और गौर (भारतीय बायसन) का निवास",
      history: "244 वर्ग किमी में फैला बारनवापारा सागौन वनों के लिए प्रसिद्ध है। लोककथाओं के अनुसार यहाँ महर्षि वाल्मीकि का आश्रम था जहाँ लव और कुश का जन्म हुआ था। आज यह गौर, तेंदुए और भालू का प्रमुख संरक्षण क्षेत्र है।",
      bestSeason: "नवंबर से अप्रैल (वन्यजीवों को देखने के लिए सर्वोत्तम)",
      safetyInfo: "सफारी के दौरान चमकीले कपड़े न पहनें। वाहन के भीतर ही रहें। वन्यजीवों को खाना खिलाने का प्रयास न करें।",
      rules: "अभयारण्य में शांत रहें। मोबाइल साइलेंट रखें। भालूओं को परेशान होने से बचाने के लिए फ्लैश फोटोग्राफी से बचें।"
    },
    cg: {
      name: "बारनवापारा वन्यजीव अभयारण्य",
      description: "सागौन जंगल अउ गौर (बनभैंसा) के घर",
      history: "२४४ वर्ग किमी म फैले बारनवापारा सागौन जंगल बर प्रसिद्ध हे। पुरखा गोठ के हिसाब से इहाँ महर्षि वाल्मीकि के आश्रम रहीस जिहां लव अउ कुश जनम धरे रहीन। आज इहाँ गौर, चीता अउ भालू मन सुरक्षित रहथें।",
      bestSeason: "नवंबर से अप्रैल (जंगली जानवर देखे बर बढ़िया मौसम)",
      safetyInfo: "सफारी के समय भड़कीला कपड़ा झन पहिरव। गाड़ी के भीतर ही रहव। जानवर मन ला खइया झन देव।",
      rules: "जंगल म शांत रहव। मोबाइल ला साइलेंट रखव। भालू मन डर जाथें, ओकर तीर म फ्लैश लाइट झन मारव।"
    },
    en: {
      name: "Barnawapara Wildlife Sanctuary",
      description: "Lush Teak Forests & Sanctuary of the Indian Bison",
      history: "Covering 244 sq km of deciduous forests, Barnawapara is named after twin forest villages: Bar and Nawa Para. Local folklore integrates this forest with the epic Ramayana; it is believed that Sage Valmiki's ashram was located here, where Luv and Kush were born. Today, it is a crucial conservation zone for the Gaur (Indian Bison), Leopards, Sloth Bears, and over 150 species of vibrant tropical birds.",
      bestSeason: "November to April (Optimal foliage for mammal spotting and migratory birds)",
      safetyInfo: "Do not wear bright colors (red, white) during safaris. Remain strictly inside the safari vehicle. Never try to feed or call out to wild animals.",
      rules: "Strict zero-noise policy inside the sanctuary boundary. Keep mobile devices on silent. Avoid flash photography as it can disorient and agitate nocturnal sloth bears."
    }
  },
  "achanakmar": {
    hi: {
      name: "अचानकमार टाइगर रिजर्व",
      description: "साल-सागौन के जंगलों का दिल",
      history: "अचानकमार टाइगर रिजर्व मैकल पहाड़ियों में फैला है। आदिवासियों ने 'देव वन' (पवित्र उपवन) विकसित किए हैं जहाँ पेड़ काटना वर्जित है। शेर के दहाड़ की आवाज को जंगल के संरक्षक के रूप में माना जाता है।",
      bestSeason: "नवंबर से मार्च (सूखे मौसम में वन्यजीवों की सक्रियता)",
      safetyInfo: "सफारी वाहनों के अंदर ही रहें। वन्यजीवों के पास फ्लैश फोटोग्राफी का उपयोग न करें। जलस्रोतों के पास पूर्ण शांति बनाए रखें।",
      rules: "अचानकमार एक यूनेस्को मान्यता प्राप्त बायोस्फीयर रिजर्व है। प्लास्टिक बिल्कुल न ले जाएं। अपना कचरा वापस लाएं।"
    },
    cg: {
      name: "अचानकमार टाइगर रिजर्व",
      description: "साल-सागौन जंगल के दिल",
      history: "अचानकमार टाइगर रिजर्व ह मैकल पहाड़ म फैले हे। इहाँ के आदिवासी मन सदियों से शेर मन के संग रहत आए हे अउ 'देव वन' बनाए हे जिहां पेड़ काटना पाप माने जाथे।",
      bestSeason: "नवंबर से मार्च (पानी तीर म जानवर मन देखथें)",
      safetyInfo: "सफारी गाड़ी के भीतर ही रहव। शेर मन के तीर म फ्लैश झन मारव। पानी घाट तीर म एकदम शांत रहव।",
      rules: "अचानकमार ह यूनेस्को द्वारा मान्यता प्राप्त जंगल ए। प्लास्टिक झन ले जाव। अपन कचरा ला वापस धरके लाव।"
    },
    en: {
      name: "Achanakmar Tiger Reserve",
      description: "Lost in the Sal-Teak Heartland of Central India",
      history: "Achanakmar Tiger Reserve sprawls across the Maikal Hills, a forgotten highland corridor linking Kanha and Pench tiger reserves. Ancient tribal communities have coexisted with the forest's tigers for centuries, developing sacred groves ('Dev Vans') where no trees are ever felled. Local oral tradition holds that the spirit of the forest tiger is the guardian of the tribal boundary — its roar signals both danger and protection.",
      bestSeason: "November to March (Peak wildlife activity and dry-season water pooling)",
      safetyInfo: "Stay inside safari vehicles at all times. Do not use flash photography near wildlife. Maintain strict silence near waterholes and salt licks.",
      rules: "Achanakmar is a UNESCO-recognised biosphere reserve. Carry zero plastic. All biodegradable waste must be packed out. Leave only footprints."
    }
  },
  "gangrel-dam": {
    hi: {
      name: "गंगरेल बांध और जलाशय",
      description: "छत्तीसगढ़ का सबसे बड़ा जलाशय",
      history: "महानदी नदी पर बना गंगरेल बांध छत्तीसगढ़ का सबसे बड़ा बांध है। यह जलाशय राज्य के कृषि क्षेत्र को सिंचित करता है। मानसून के दौरान इसके 36 गेट एक साथ खोले जाने पर भारी गर्जना सुनाई देती है।",
      bestSeason: "अगस्त से नवंबर (मानसून के समय पानी का बहाव शानदार होता है)",
      safetyInfo: "स्पिलवे के पास सुरक्षा घेरे को पार न करें। पानी के पास बच्चों की कड़ी निगरानी रखें।",
      rules: "जलाशय प्रवासी पक्षियों का निवास स्थान है। पानी के पास कचरा न फेंकें। दक्षिणी द्वीपों पर पक्षियों को परेशान न करें।"
    },
    cg: {
      name: "गंगरेल बांध अउ जलाशय",
      description: "छत्तीसगढ़ के सबले बड़े बांध",
      history: "महानदी म बने गंगरेल बांध ह छत्तीसगढ़ के सबले बड़े बांध ए। ये बांध के पानी ह हमर खेती-खार बर बहुत जरूरी ए। चौमास म जब ३६ फाटक एक साथ खुलथें, तो ५ किमी दूर तक गर्जना सुनाई देथे।",
      bestSeason: "अगस्त से नवंबर (फाटक खुले के समय पानी देखना बहुत सुंदर दिखथे)",
      safetyInfo: "फाटक तीर म सुरक्षा घेरा ला पार झन करव। पानी तीर म लइका मन के ध्यान रखव।",
      rules: "ये बांध म दूर-दूर से चिरई मन आथें। पानी तीर म कचरा झन फेंकव। चिरई मन ला परेशान झन करव।"
    },
    en: {
      name: "Gangrel Dam & Reservoir",
      description: "The Largest Reservoir of Chhattisgarh",
      history: "Built across the Mahanadi River, the Gangrel (Ravishankar Sagar) Dam is the largest reservoir in Chhattisgarh. It is the birthplace of the Mahanadi water story — this colossal water body feeds the plains of Odisha and sustains 40% of the state's agriculture. During the monsoon overflow discharge, the dam's spillway thunder can be heard from 5 km away, as 36 gates open simultaneously in a breathtaking water spectacle.",
      bestSeason: "August to November (Monsoon overflow discharge is spectacular)",
      safetyInfo: "Do not cross safety barriers near the spillway. Strong undertow currents exist near the dam base. Children must be supervised near water edges at all times.",
      rules: "The reservoir is a Ramsar-nominated migratory bird habitat. Do not litter or discharge cleaning agents near the water. Avoid disturbing waterfowl colonies on the southern shore islands."
    }
  },
  "labed-falls": {
    hi: {
      name: "लाबेद जलप्रपात",
      description: "सक्ती के जंगलों में छिपा एक प्राकृतिक झरना",
      history: "लाबेद जलप्रपात छत्तीसगढ़ के सक्ती और कोरबा जिलों की सीमा पर स्थित एक छिपा हुआ प्राकृतिक खजाना है। साल और सघन वन वृक्षों से घिरी यह जलधारा प्राचीन काली चट्टानों से होकर एक शांत और हरे कुंड में गिरती है। स्थानीय वनवासी इस घाटी को अत्यंत पवित्र मानते हैं, जहाँ मानसून में वन-देवताओं का वास माना जाता है। यहाँ का शांत और ठंडा वातावरण प्रकृति प्रेमियों के लिए एक अद्भुत स्वर्ग है।",
      bestSeason: "जुलाई से नवंबर (मानसून का बहाव और हरी पत्तियां सर्वोत्तम होती हैं)",
      safetyInfo: "कुंड के पास की चट्टानें गीली और फिसलन भरी हैं। बिना सुरक्षा के न चढ़ें।",
      rules: "सभी प्लास्टिक कचरा अपने साथ वापस लाएं। वन पूल को साफ रखने में मदद करें।"
    },
    cg: {
      name: "लाबेद जलप्रपात",
      description: "सक्ती के मयारू सुघ्घर झरना",
      history: "लाबेद झरना ह सक्ती अउ कोरबा जिला के सीमा म लुकाय एक गजब सुंदर झरना ए। साल अउ घने जंगल के बीच म ये झरना ह करिया पथरा ले बहते हुए एक सुघ्घर हरियर कुंड म गिरथे। गाँव के सियन मन बताथें कि चौमास म इहां वन-देवता मन के वास रहिथे। इहाँ के शांत अउ ठंडा हवा मन ला मोह लेथे।",
      bestSeason: "जुलाई से नवंबर (चौमास म पानी ह देखइ लायक रहिथे अउ जंगल म हरियाली रहिथे)",
      safetyInfo: "तालाब तीर के पथरा मन म फिसलन रहिथे, संभल के चलव।",
      rules: "प्लास्टिक अउ कचरा झन फैलाओ, अपन संग वापस ले जाव।"
    },
    en: {
      name: "Labed Waterfall",
      description: "A Pristine Hidden Cascade in the Sakti Wilderness",
      history: "Labed Waterfall is a hidden gem tucked away in the pristine valleys bordering the Sakti and Korba districts of Chhattisgarh. Surrounded by lush, dense forests of Sal and mixed canopy, the waterfall cascades down in multiple beautiful streams over dark, ancient rocks into a cool, emerald pool. Local villagers revere this secluded canyon, describing it as a sacred retreat where the forest gods gather during the monsoon rains. The dense tree cover keeps the valley cool and filled with mist year-round, creating a sanctuary for wild flora and quiet bird life.",
      bestSeason: "July to November (Best monsoon flow and green foliage)",
      safetyInfo: "Rocks near the base pool are wet and slippery. Do not climb without precautions.",
      rules: "Carry all plastic trash back with you. Help keep the forest pool clean."
    }
  },
  "siddhi-vinayak": {
    hi: {
      name: "सिद्धि विनायक मंदिर",
      description: "रतनपुर में विराजे शिला गणेश का पावन धाम",
      history: "रतनपुर का सिद्धि विनायक मंदिर एक ऐतिहासिक धरोहर है जहाँ भगवान गणेश की खड़ी मुद्रा में एक भव्य पाषाण मूर्ति स्थापित है। शांत सरोवर और घने पेड़ों से घिरा यह मंदिर कलचुरी काल से ही श्रद्धालुओं की आस्था का केंद्र रहा है। ऐसी मान्यता है कि यहाँ श्रद्धापूर्वक की गई पूजा से सभी विघ्न-बाधाएं दूर होती हैं और सुख-समृद्धि की प्राप्ति होती है।",
      bestSeason: "सितंबर से मार्च (सुहावना मौसम; गणेश चतुर्थी उत्सव के दौरान विशेष रौनक)",
      safetyInfo: "तालाब की सीढ़ियों पर सावधानी से चलें। गर्भगृह के बाहर चमड़े की वस्तुएं रखें।",
      rules: "पवित्र तालाब में नारियल के छिलके या प्लास्टिक का कचरा न फेंकें। मंदिर परिसर को स्वच्छ रखें।"
    },
    cg: {
      name: "सिद्धि विनायक मंदिर",
      description: "रतनपुर के शिला गणेश के मयारू धाम",
      history: "रतनपुर म बने सिद्धि विनायक मंदिर ह एक गजब पुरान मंदिर ए, जिहां भगवान गणेश के एक बड़े अउ सुंदर पथरा के मूर्ति ठाढ़े मुद्रा म विराजे हे। कलचुरी काल के ये मंदिर ह तालाब अउ बड़े रुख-राई के बीच म हे। गाँव के लोगन मन मानथें कि इहां मत्था टेके ले सबो दुःख-पीरा दूर होथे अउ सुख-शांति आथे।",
      bestSeason: "सितंबर से मार्च (गणेश चतुर्थी के समय इहां गजब मेला जइसन मेला लगथे)",
      safetyInfo: "तालाब के सीढ़ी म संभल के चलव अउ चमड़ा के सामान बाहिर रखव।",
      rules: "तालाब म नारियल के कतारा अउ कचरा झन डारव, मंदिर ला साफ रखव।"
    },
    en: {
      name: "Siddhi Vinayak Mandir",
      description: "Revered Abode of the Stone Ganesha in Ratanpur",
      history: "Siddhi Vinayak Mandir is a historical temple in Ratanpur housing a unique and magnificent stone idol of Lord Ganesha in a standing posture. Surrounded by ancient trees and a serene temple pond, it has been a major pilgrimage hub since the Kalachuri era. Devotees believe that praying to this special Siddhi Vinayak ensures the removal of all obstacles (Vighnas) and brings good fortune.",
      bestSeason: "September to March (Pleasant weather; spectacular during Ganesh Chaturthi festival)",
      safetyInfo: "Mind the steps leading to the pond. Keep leather items outside the main sanctum.",
      rules: "Do not throw coconut shells or plastic packaging into the sacred pond. Keep the temple complex clean."
    }
  },
  "kaal-bhairav": {
    hi: {
      name: "काल भैरव मंदिर",
      description: "रतनपुर के भव्य एकशिला रक्षक देवता",
      history: "काल भैरव मंदिर में भगवान भैरव की एक अत्यंत भव्य, 9 फीट ऊंची अखंड पाषाण प्रतिमा स्थापित है, जिन्हें ऐतिहासिक रूप से रतनपुर राज्य का सर्वशक्तिमान रक्षक माना जाता रहा है। यह मूर्ति त्रिशूल और कपाल धारण किए हुए है, और इनके साथ इनका वाहन श्वान (कुत्ता) भी अंकित है। श्रद्धालु नकारात्मक ऊर्जा से रक्षा और रतनपुर यात्रा के सफल समापन के लिए इनका आशीर्वाद लेते हैं।",
      bestSeason: "अक्टूबर से मार्च (भैरव अष्टमी उत्सव के दौरान विशेष पूजा-अर्चना)",
      safetyInfo: "प्रार्थना सभा में शांति बनाए रखें। मंदिर के मुख्य द्वारों के पास बंदरों से सावधान रहें।",
      rules: "मंदिर बाईपास क्षेत्र को साफ रखें। बंदरों को प्लास्टिक की थैलियों में खाना न दें।"
    },
    cg: {
      name: "काल भैरव मंदिर",
      description: "रतनपुर के सबले बड़े रक्षक देवता के धाम",
      history: "काल भैरव मंदिर म भगवान भैरव के एक गजब बड़े अउ सुघ्घर 9 फीट ऊंच पथरा के मूर्ति विराजे हे, जेला रतनपुर राज के रखवार देव माने जाथे। भैरव बाबा ह हाथ म त्रिशूल धरे ठाढ़े हें अउ तीर म उनकर वाहन कुकुर घलो बने हे। रतनपुर आए के बाद भैरव बाबा के दर्शन करना बहुत जरूरी माने जाथे।",
      bestSeason: "अक्टूबर से मार्च (भैरव अष्टमी के समय इहाँ गजब पूजा-पाठ होथे)",
      safetyInfo: "मंदिर तीर म बंदर मन बहुत हें, अपन सामान ला संभाल के रखव।",
      rules: "मंदिर तीर कचरा झन डारव अउ बंदर मन ला प्लास्टिक थैली म कुछ झन खवाव।"
    },
    en: {
      name: "Kaal Bhairav Mandir",
      description: "The Fierce Monolithic Guardian Deity of Ratanpur",
      history: "Kaal Bhairav Mandir houses a spectacular, towering 9-foot monolithic stone statue of Lord Bhairav, historically worshipped as the guardian king and absolute protector of the Ratanpur kingdom. The deity is depicted with fierce features, holding a trident and a skull cup, standing alongside his vehicle (a dog). Pilgrims visit this temple to seek protection from negative energies and to mark their presence in the sacred city of Ratanpur.",
      bestSeason: "October to March (Ideal weather; highly vibrant during Bhairav Ashtami)",
      safetyInfo: "Maintain silence inside the prayer halls. Watch out for monkeys around the temple gates.",
      rules: "Keep the temple bypass area clean. Avoid feeding the monkeys with plastic bags."
    }
  },
  "ram-tekri": {
    hi: {
      name: "राम टेकड़ी मंदिर",
      description: "पहाड़ी पर स्थित मराठा शैली का ऐतिहासिक किला-मंदिर",
      history: "राम टेकड़ी मंदिर रतनपुर की एक ऊंची पहाड़ी पर स्थित एक भव्य मंदिर है, जिसका निर्माण मराठा शासक बिम्बाजी भोंसले ने किले के रूप में करवाया था। पत्थर की सीढ़ियाँ चढ़कर पहुँचने वाले इस मंदिर में भगवान राम, सीता और लक्ष्मण की सुंदर मूर्तियाँ स्थापित हैं, साथ ही राजा बिम्बाजी भोंसले की भी एक अनूठी प्रतिमा है। यहाँ से पूरे रतनपुर शहर, तालाबों और प्राचीन खंडहरों का विहंगम दृश्य दिखाई देता है।",
      bestSeason: "अक्टूबर से फरवरी (ठंडी हवाएं और स्पष्ट दृश्य; रामनवमी के समय विशेष सजावट)",
      safetyInfo: "विशेष रूप से बारिश के दौरान पथरीली सीढ़ियों पर चढ़ते समय सावधानी बरतें। सीढ़ियों की रेलिंग का सहारा लें।",
      rules: "चढ़ाई वाली सीढ़ियों पर पानी की खाली बोतलें न फेंकें। पहाड़ी परिसर को कचरा मुक्त रखें।"
    },
    cg: {
      name: "राम टेकड़ी मंदिर",
      description: "रतनपुर पहाड़ी म विराजे श्री राम अउ मराठा इतिहास",
      history: "राम टेकड़ी मंदिर ह रतनपुर के एक ऊंच पहाड़ी म बने हे, जेला मराठा राजा बिम्बाजी भोंसले ह किला जइसन बनवाय रिहिस। पथरा के सीढ़ी मन ला चढ़ के जाए के बाद इहां प्रभु राम, माता सीता अउ लक्ष्मण जी के गजब सुंदर दर्शन होथे। पहाड़ी के ऊपर ले पूरा रतनपुर के तालाब, रुख-राई अउ पुरान खंडहर मन बहुत सुंदर दिखथें।",
      bestSeason: "अक्टूबर से फरवरी (ठंड के दिन म इहां के मौसम गजब सुहावना रहिथे अउ रामनवमी म भारी भीड़ होथे)",
      safetyInfo: "वरसात म पथरा के सीढ़ी मन म फिसलन हो सकथे, रेलिंग ला धर के धीरे-धीरे चलव।",
      rules: "सीढ़ी म कचरा अउ प्लास्टिक बोतल झन डारव, पहाड़ी ला साफ रखव।"
    },
    en: {
      name: "Ram Tekri Mandir",
      description: "Fortress Temple of Bimbaji Bhonsle atop Ratanpur Hills",
      history: "Ram Tekri Mandir is a magnificent hilltop temple constructed in a fortress style by the Maratha ruler Bimbaji Bhonsle. Reached by climbing a scenic flight of stone steps, the temple houses exquisite idols of Lord Rama, Sita, and Laxmana, alongside an unusual stone statue of Bimbaji Bhonsle himself. The hill offers breathtaking panoramic views of Ratanpur's historic landscape, its dense green foliage, and numerous tranquil lakes.",
      bestSeason: "October to February (Cool hill breezes and clear panoramic views)",
      safetyInfo: "Exercise caution while climbing the stone steps, especially during rain. Hold handrails where available.",
      rules: "Do not discard water bottles along the trekking stairs. Keep the hilltop sanctuary litter-free."
    }
  },
  "ratanpur-fort": {
    hi: {
      name: "रतनपुर किला",
      description: "कलचुरी राजाओं का गौरवशाली गढ़ और स्थापत्य कला",
      history: "रतनपुर किला 11वीं शताब्दी में कलचुरी राजवंश के राजा रत्नदेव द्वारा बनवाया गया एक ऐतिहासिक स्थापत्य है। अपने विशाल पत्थर के प्रवेश द्वार 'गज किला' (हाथी किला) के लिए प्रसिद्ध, इस किले में देवी-देवताओं की प्राचीन नक्काशी, सूखी खाइयां और पत्थर के परकोटे हैं। किले के भीतर देवी लक्ष्मी का ऐतिहासिक मंदिर और प्राचीन खंडहर मौजूद हैं, जो मध्यकालीन संप्रभुता की गवाही देते हैं।",
      bestSeason: "अक्टूबर से मार्च (खुले खंडहरों में घूमने के लिए सबसे अनुकूल मौसम)",
      safetyInfo: "असमान पथरीले रास्तों पर सावधानी से चलें। गहरी सूखी खाइयों और अंधेरे कोठरियों के प्रवेश द्वारों से दूर रहें।",
      rules: "विरासत स्थल के भीतर प्लास्टिक कचरा फैलाना मना है। प्राचीन पत्थरों की दीवारों पर कुछ न लिखें।"
    },
    cg: {
      name: "रतनपुर किला",
      description: "कलचुरी राजा मन के गजब पुरान गढ़",
      history: "रतनपुर किला ह 11वीं शताब्दी म कलचुरी राजा रत्नदेव द्वारा बनवाय गिस। ये किला अपन भारी पथरा के मुख्य फाटक 'गज किला' बर प्रसिद्ध हे, जिहां हाथी अउ देवी-देवता मन के सुंदर मूर्ति उकेरे गे हे। किला के भीतर देवी लक्ष्मी के एक ऐतिहासिक मंदिर हे अउ पुरान राजमहल के खंडहर हे, जे ह कलचुरी काल के वैभव ला देखाथे।",
      bestSeason: "अक्टूबर से मार्च (खुला मैदान म घूमे बर ठंड के मौसम ह सबले बढ़िया रहिथे)",
      safetyInfo: "किला के भीतर बने गहिरा खाई अउ अंधेरा कोठरी मन म झन जाव, पथरा मन म संभल के चलव।",
      rules: "किला परिसर म प्लास्टिक अउ कचरा झन फेंकव, दीवाल म नाम-पता झन लिखव।"
    },
    en: {
      name: "Ratanpur Fort",
      description: "11th-Century Citadel of the Kalachuri Kings",
      history: "Ratanpur Fort is an architectural masterpiece constructed in the 11th century by King Ratnadeva of the Kalachuri dynasty. Famous for its towering stone entrance known as the 'Gaj Kila' (Elephant Fort), it features ancient carvings of deities, dry moats, and stone-paved ramparts. Inside the fort lie the historic temples of Goddess Laxmi and various ruins that whisper tales of medieval sovereignty and battles for the heart of Chhattisgarh.",
      bestSeason: "October to March (Excellent weather for walking around the outdoor ruins)",
      safetyInfo: "Watch your step on uneven stone paths. Keep away from deep dry moats and dark cellar entrances.",
      rules: "Zero-tolerance for plastic littering inside the heritage site. Do not write or carve on the ancient stone walls."
    }
  },
  "lakhni-devi": {
    hi: {
      name: "महालक्ष्मी लाखनी देवी मंदिर",
      description: "एकबीरा पहाड़ी पर स्थित देवी लाखनी देवी का पावन विहंगम धाम",
      history: "महालक्ष्मी लाखनी देवी मंदिर एकबीरा पहाड़ी पर स्थित देवी लाखनी देवी को समर्पित एक सुंदर मंदिर है, जिन्हें देवी महालक्ष्मी का अवतार माना जाता है। कलचुरी राजाओं द्वारा निर्मित यह मंदिर अपनी शंख जैसी अनूठी वास्तुकला के लिए प्रसिद्ध है। हरी-भरी वादियों के बीच बनी पथरीली सीढ़ियों को चढ़कर भक्त यहाँ पहुँचते हैं। पहाड़ी की चोटी से रतनपुर घाटी, यहाँ के झीलों और जंगलों का भव्य दृश्य दिखाई देता है।",
      bestSeason: "सितंबर से मार्च (नवरात्रि उत्सव के दौरान पूरी पहाड़ी को दीपों से सजाया जाता है, जो देखने योग्य होता है)",
      safetyInfo: "पहाड़ी की सीढ़ियों के साथ लगी रेलिंग को पकड़कर चढ़ें। देर रात चढ़ने से बचें।",
      rules: "अपनी खाली पानी की बोतलें वापस लाएं। एकबीरा पहाड़ी एक स्वच्छ क्षेत्र है — यहाँ कचरा न फैलाएं।"
    },
    cg: {
      name: "महालक्ष्मी लाखनी देवी मंदिर",
      description: "एकबीरा पहाड़ी म विराजे माता लाखनी देवी के धाम",
      history: "महालक्ष्मी लाखनी देवी मंदिर ह रतनपुर के एकबीरा पहाड़ी के ऊपर म विराजे हे। माता लाखनी देवी ला महालक्ष्मी जी के रूप माने जाथे। कलचुरी राजा मन के बनाए ये मंदिर के बनावट शंख जइसन हे। भक्त मन हरियर पहाड़ी के बीच म बने सीढ़ी चढ़ के मंदिर पहुंचथें। पहाड़ी के ऊपर ले पूरा रतनपुर के तालाब अउ जंगल मन गजब सुंदर दिखथें।",
      bestSeason: "सितंबर से मार्च (क्वार अउ चइत नवरात्रि म इहां गजब मेला लगथे अउ बिजली बत्ती ले पूरा पहाड़ी जगमगा उठथे)",
      safetyInfo: "सीढ़ी के रेलिंग ला धर के धीरे-धीरे चढ़व अउ रात म चढ़े ले बचव।",
      rules: "पानी बोतल ला पहाड़ी म झन फेंकव, अपन संग वापस ले जाव अउ पहाड़ी ला साफ रखव।"
    },
    en: {
      name: "Mahalakshmi Lakhni Devi Mandir Ratanpur",
      description: "Hilltop Sanctuary of Goddess Lakhni Devi on Ekbira Hill",
      history: "Mahalakshmi Lakhni Devi Mandir is a stunning hilltop temple dedicated to Lakhni Devi, considered an incarnation of Goddess Mahalakshmi. Built by the Kalachuri kings on Ekbira Hill, the temple features a unique shell-like design. Pilgrims climb a winding flight of stone steps surrounded by lush green landscapes. The hilltop temple provides breathtaking panoramic views of Ratanpur valley, its lakes, and surrounding forests, making it both a spiritual and scenic retreat.",
      bestSeason: "September to March (Very pleasant; spectacular during Navratri festivals when the hill is beautifully illuminated)",
      safetyInfo: "Hold on to the handrails along the hilltop stairs. Avoid climbing late at night.",
      rules: "Please carry your water bottles back. Ekbira Hill is a clean sanctuary — do not litter."
    }
  },
  "budha-mahadev": {
    hi: {
      name: "बूढ़ा महादेव मंदिर",
      description: "रतनपुर के ऐतिहासिक तालाब के तट पर स्थित प्राचीन भूमिगत शिवालय",
      history: "बूढ़ा महादेव मंदिर रतनपुर का एक अत्यंत प्राचीन शिव मंदिर है जो एक ऐतिहासिक तालाब के किनारे स्थित है। यह मंदिर अपने अनोखे भूमिगत गर्भगृह के लिए प्रसिद्ध है, जहाँ धरातल से नीचे एक स्वयंभू शिव लिंग स्थापित है। कलचुरी साम्राज्य के सबसे पुराने आध्यात्मिक केंद्रों में से एक माना जाने वाला यह मंदिर अपनी शांत और ठंडी पाषाण कोठरियों के कारण योगियों और ध्यान लगाने वालों को आकर्षित करता है।",
      bestSeason: "अक्टूबर से मार्च (महाशिवरात्रि उत्सव के दौरान विशेष अभिषेक और मेला)",
      safetyInfo: "भूमिगत गर्भगृह की ओर जाने वाली सीढ़ियाँ संकरा और अंधेरी हैं। धीरे-धीरे चलें और अपने कदमों पर ध्यान दें।",
      rules: "पास के ऐतिहासिक तालाब में पूजा सामग्री या प्लास्टिक की थैलियां न फेंकें। गर्भगृह को सूखा रखें।"
    },
    cg: {
      name: "बूढ़ा महादेव मंदिर",
      description: "रतनपुर के तालाब तीर म बने भूमिगत शिव मंदिर",
      history: "बूढ़ा महादेव मंदिर ह रतनपुर के एक गजब पुरान मंदिर ए, जे ह तालाब के घाट म बने हे। ये मंदिर के विशेषता ए हे कि एकर गर्भगृह ह जमीन के नीचे हे, जिहां स्वयंभू शिव लिंग विराजे हे। कलचुरी काल के ये मंदिर म जमीन के भीतर गजब शांति अउ ठंडा वातावरण रहिथे, जिहां ध्यान लगाए बर साधु-संत मन आथें।",
      bestSeason: "अक्टूबर से मार्च (शिवरात्रि के समय इहाँ गजब अभिषेक अउ मेला के माहौल रहिथे)",
      safetyInfo: "जमीन के नीचे जाए के सीढ़ी मन संकरी अउ अंधियारी हे, धीरे-धीरे संभल के उतरव।",
      rules: "तालाब म पूजा के बासी फूल अउ प्लास्टिक झन फेंकव, मंदिर ला साफ रखव।"
    },
    en: {
      name: "Budha Mahadev Mandir Ratanpur",
      description: "Ancient Underground Sanctum beside Ratanpur's Sacred Pond",
      history: "Budha Mahadev Mandir is an extremely ancient Shiva temple situated on the banks of a historical pond in Ratanpur. The temple is unique for its underground stone sanctum holding a swayambhu (self-manifested) Shiva Lingam, which lies below the surface level. Revered as one of the oldest spiritual seats of the Kalachuri kingdom, it draws yogis and devotees seeking absolute peace and deep meditation inside its cool, subterranean stone chambers.",
      bestSeason: "October to March (Very pleasant; highly active during Mahashivratri festival)",
      safetyInfo: "Steps descending to the underground sanctum are steep and dark. Move slowly and watch your step.",
      rules: "Do not throw ritual flowers or plastic items into the adjacent historical pond. Keep the inner sanctuary dry."
    }
  },
  "khuntaghat-overflow": {
    hi: {
      name: "खूंटाघाट उलाट (ओवरफ्लो)",
      description: "संजय गांधी जलाशय का गरजता हुआ सीढ़ीदार जलप्रपात",
      history: "खूंटाघाट उलाट ऐतिहासिक खूंटाघाट बांध (संजय गांधी जलाशय) का एक भव्य सीढ़ीदार ओवरफ्लो स्पिलवे है। मानसून के चरम महीनों में, जलाशय का पानी भारी गर्जना के साथ विशाल कंक्रीट की सीढ़ियों से बहता है, जिससे एक सुंदर कृत्रिम जलप्रपात का निर्माण होता है। यह जलप्रपात पर्यटकों को ठंडे पानी में स्नान और फोटोग्राफी के लिए आकर्षित करता है।",
      bestSeason: "जुलाई से अक्टूबर (मानसून के चरम ओवरफ्लो के समय जब सीढ़ीदार प्रपात सक्रिय रहता है)",
      safetyInfo: "सीढ़ीदार ओवरफ्लो स्पिलवे के पास सुरक्षा बैरियर को कभी पार न करें। मुख्य बहाव बेसिन के पास गहरे पानी के प्रवाह से बचें।",
      rules: "प्रवासी पक्षियों के घोंसलों की रक्षा करें। अपने सभी खाद्य पैकेट और बोतलें वापस लाएं।"
    },
    cg: {
      name: "खूंटाघाट उलाट (ओवरफ्लो)",
      description: "संजय गांधी जलाशय के गरजते पथरीले झरना",
      history: "खूंटाघाट उलाट ह ऐतिहासिक खूंटाघाट बांध (संजय गांधी जलाशय) के गजब सुंदर सीढ़ीदार ओवरफ्लो स्पिलवे ए। चौमास म जब जलाशय ह पूरा भर जाथे, त एकर पानी ह भारी गरज के संग सीमेंट के बड़े सीढ़ी मन ले बहथे, जउन ह एक सुंदर झरना जइसन दिखथे। ये सुघ्घर नजारा ला देखे बर भारी भीड़ लगथे।",
      bestSeason: "जुलाई से अक्टूबर (जब चौमास म बांध ओवरफ्लो होथे त झरना ह देखइ लायक रहिथे)",
      safetyInfo: "उलाट के सुरक्षा घेरा ला पार झन करव अउ गहरा पानी म नहाए ले बचव।",
      rules: "इहाँ आथें प्रवासी चिरई मन, ओ मन ला परेशान झन करव अउ कचरा संग म वापस ले जाव।"
    },
    en: {
      name: "Khuntaghat Ulat (Overflow)",
      description: "The Thundering Stepped Spillway Waterfall of Sanjay Gandhi Reservoir",
      history: "Khuntaghat Ulat is the spectacular stepped overflow spillway of the historic Khuntaghat Dam (Sanjay Gandhi Reservoir). During peak monsoon months, the reservoir overflows in an incredible thundering cascade over massive concrete stairs, creating a roaring artificial waterfall that draws thousands of eco-tourists for cold-pool dips and scenic photography.",
      bestSeason: "July to October (Monsoon overflow peak when the stepped falls are active)",
      safetyInfo: "Never cross safety barriers near the stepped overflow spillway. Strictly avoid deep-water currents near the main release basin.",
      rules: "Help protect the nesting migratory birds. Carry all food packets and bottles back with you."
    }
  }
};

async function main() {
  console.log('Starting seed operations for CG Tourism database...');

  // 1. Clear existing records to ensure clean slate transitions
  await prisma.bookmark.deleteMany();
  await prisma.review.deleteMany();
  await prisma.image.deleteMany();
  await prisma.video.deleteMany();
  await prisma.festival.deleteMany();
  await prisma.localFood.deleteMany();
  await prisma.culture.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.place.deleteMany();
  await prisma.category.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.district.deleteMany();
  await prisma.adminSetting.deleteMany();
  await prisma.mediaLibrary.deleteMany();
  await prisma.syncEvent.deleteMany();

  console.log('Cleaned database tables successfully.');

  // 2. Create User Accounts
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('SuperSecureAdminPassword2026!', saltRounds);
  const creatorPasswordHash = await bcrypt.hash('SuperSecureCreatorPassword2026!', saltRounds);

  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Chhattisgarh Tourism Administrator',
      email: 'admin@cgtourism.gov.in',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const creatorUser = await prisma.user.create({
    data: {
      fullName: 'Aarav Mandavi',
      email: 'aarav.creator@cgtourism.org',
      password: creatorPasswordHash,
      role: 'CREATOR',
    },
  });

  // 3. Create Creator Profile
  const creatorProfile = await prisma.creatorProfile.create({
    data: {
      userId: creatorUser.id,
      displayName: 'Aarav Mandavi',
      username: 'aarav_bastar_explore',
      bio: 'Bastar-based explorer and folklore preservation volunteer.',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      coverImage: 'https://images.unsplash.com/photo-1621217646197-0b1961ee4768?auto=format&fit=crop&w=1200&q=80',
      isVerified: true,
      status: 'ACTIVE',
    },
  });

  console.log('Created basic User and Creator profiles.');

  // 4. Create Travel Categories and build mapping cache
  const categoryCache: { [slug: string]: string } = {};
  for (const cat of SEED_CATEGORIES) {
    const createdCat = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug }
    });
    categoryCache[cat.slug] = createdCat.id;

    // Seed translations for categories
    const catTranslations = CATEGORY_TRANSLATIONS[cat.slug];
    if (catTranslations) {
      for (const lang of ['en', 'hi', 'cg']) {
        const trans = catTranslations[lang];
        if (trans) {
          await prisma.translation.create({
            data: {
              lang,
              entityType: 'Category',
              entityId: createdCat.id,
              field: 'name',
              value: trans.name
            }
          });
        }
      }
    }
  }
  console.log('Populated travel categories and their translations successfully.');

  // 4b. Create Districts dynamically from complete Chhattisgarh list and SEED_DESTINATIONS
  const CHHATTISGARH_DISTRICTS = [
    "Balod",
    "Baloda Bazar",
    "Balrampur",
    "Bastar",
    "Bemetara",
    "Bijapur",
    "Bilaspur",
    "Dantewada",
    "Dhamtari",
    "Durg",
    "Gariaband",
    "Gaurela-Pendra-Marwahi",
    "Janjgir-Champa",
    "Jashpur",
    "Kawardha",
    "Kanker",
    "Kondagaon",
    "Korba",
    "Koriya",
    "Mahasamund",
    "Manendragarh-Chirmiri-Bharatpur",
    "Mohla-Manpur-Ambagarh Chowki",
    "Mungeli",
    "Narayanpur",
    "Raigarh",
    "Raipur",
    "Rajnandgaon",
    "Sakti",
    "Sarangarh-Bilaigarh",
    "Sukma",
    "Surajpur",
    "Surguja",
    "Khairagarh-Chhuikhadan-Gandai"
  ];
  const uniqueDistricts = Array.from(new Set([
    ...CHHATTISGARH_DISTRICTS,
    ...SEED_DESTINATIONS.map(d => d.district)
  ]));
  const districtCache: { [name: string]: string } = {};
  for (const distName of uniqueDistricts) {
    const createdDist = await prisma.district.create({
      data: {
        name: distName,
        slug: distName.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w-]/g, ''),
        description: `Scenic region of ${distName} in Chhattisgarh, home to unique cultural landmarks and natural ecosystems.`,
        image: SEED_DESTINATIONS.find(d => d.district === distName)?.heroImage || null
      }
    });
    districtCache[distName] = createdDist.id;
  }
  console.log(`Created ${uniqueDistricts.length} District profiles.`);

  // Seed sample Culture, Festivals, and Local Food for Bastar & Raipur
  const bastarId = districtCache['Bastar'];
  if (bastarId) {
    await prisma.festival.createMany({
      data: [
        { districtId: bastarId, name: 'Bastar Dussehra', description: 'The longest festival in the world spanning 75 days, celebrating Goddess Danteshwari.' },
        { districtId: bastarId, name: 'Goncha Festival', description: 'Tribal chariot festival associated with Lord Jagannath rituals.' }
      ]
    });
    await prisma.localFood.createMany({
      data: [
        { districtId: bastarId, name: 'Chapotda (Red Ant Chutney)', description: 'Sharp, tangy tribal chutney prepared from red ants and their eggs.' },
        { districtId: bastarId, name: 'Salphi / Sulfi', description: 'Natural alcoholic sap tapped from the Sulfi palm tree, known as tribal beer.' }
      ]
    });
    await prisma.culture.createMany({
      data: [
        { districtId: bastarId, type: 'dance', title: 'Bison Horn Maria Dance', description: 'Traditional dance performed wearing headgear decorated with wild bison horns.' },
        { districtId: bastarId, type: 'folklore', title: 'Legend of Lingo Pen', description: 'Tribal creator deity who established the social structure of the Gond people.' }
      ]
    });
  }

  // 5. Populate Landmark Destinations
  for (const destination of SEED_DESTINATIONS) {
    const categoryId = categoryCache[destination.categorySlug];
    if (!categoryId) {
      console.warn(`Category mapping failed for category slug: ${destination.categorySlug}`);
      continue;
    }

    const districtId = districtCache[destination.district];
    if (!districtId) {
      console.warn(`District mapping failed for district: ${destination.district}`);
      continue;
    }

    const createdPlace = await prisma.place.create({
      data: {
        slug: destination.slug,
        name: destination.name,
        shortDescription: destination.tagline,
        fullDescription: destination.story,
        districtId: districtId,
        categoryId: categoryId,
        latitude: destination.latitude,
        longitude: destination.longitude,
        heroImage: destination.heroImage,
        featuredImage: destination.heroImage,
        bestSeason: destination.bestTime,
        panoramaUrls: (destination as any).panoramaUrls ? JSON.stringify((destination as any).panoramaUrls) : '[]',
        verified: true,
      }
    });

    // Seed translations for places
    const placeTrans = PLACE_TRANSLATIONS[destination.slug];
    if (placeTrans) {
      for (const lang of ['en', 'hi', 'cg']) {
        const trans = placeTrans[lang];
        if (trans) {
          const fields: Array<keyof LangTranslation> = [
            'name',
            'description',
            'bestSeason',
            'history',
            'safetyInfo',
            'rules'
          ];
          for (const field of fields) {
            const val = trans[field];
            if (val !== undefined) {
              await prisma.translation.create({
                data: {
                  lang,
                  entityType: 'Place',
                  entityId: createdPlace.id,
                  field: field === 'description' ? 'shortDescription' : field,
                  value: val
                }
              });
            }
          }
        }
      }
    }

    // Seed initial image mapping
    await prisma.image.create({
      data: {
        imageUrl: destination.heroImage,
        caption: `Scenic view of ${destination.name}`,
        isFeatured: true,
        placeId: createdPlace.id,
      }
    });

    // Seed initial mock video if applicable
    if (destination.slug === 'chitrakote-falls') {
      await prisma.video.create({
        data: {
          title: 'Monsoon Grandeur of Chitrakote',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          duration: 10,
          placeId: createdPlace.id
        }
      });
    }

    // Seed mock reviews for first few items
    if (destination.slug === 'chitrakote-falls') {
      await prisma.review.create({
        data: {
          rating: 5,
          comment: 'Absolutely breathtaking! The roar of Chitrakote during late August is a spiritual experience.',
          userId: creatorUser.id,
          placeId: createdPlace.id,
        }
      });
    }
  }

  // ── Emergency Stations ──────────────────────────────────────────────────────
  // Seed the EmergencyStation table so the dynamic service works from day one.
  // upsert on name+district to stay idempotent across multiple seed runs.
  const EMERGENCY_STATIONS = [
    { name: 'Bastar Forest Ranger Headquarters',    phone: '+91-7782-222422', type: 'ranger',   district: 'Bastar',    latitude: 19.2000, longitude: 81.7000 },
    { name: 'Jagdalpur Government Medical College', phone: '+91-7782-223048', type: 'hospital', district: 'Bastar',    latitude: 19.0833, longitude: 82.0167 },
    { name: 'Jagdalpur Police Control Room',        phone: '+91-7782-220100', type: 'police',   district: 'Bastar',    latitude: 19.0700, longitude: 82.0200 },
    { name: 'Chitrakote Forest Range Office',       phone: '+91-7782-263011', type: 'ranger',   district: 'Bastar',    latitude: 19.2050, longitude: 81.7400 },
    { name: 'Kawardha Police PCR Station',          phone: '+91-7754-224333', type: 'police',   district: 'Kabirdham', latitude: 22.0167, longitude: 81.2500 },
    { name: 'Kawardha Community Health Centre',     phone: '+91-7754-224411', type: 'hospital', district: 'Kabirdham', latitude: 22.0200, longitude: 81.2600 },
    { name: 'Surguja Civil Rescue Camp',            phone: '+91-7774-222533', type: 'ranger',   district: 'Surguja',   latitude: 22.8167, longitude: 83.2833 },
    { name: 'Ambikapur District Hospital',          phone: '+91-7774-222100', type: 'hospital', district: 'Surguja',   latitude: 23.1200, longitude: 83.2000 },
    { name: 'Raipur State Emergency Operations',    phone: '+91-771-4000112', type: 'police',   district: 'Raipur',    latitude: 21.2514, longitude: 81.6296 },
    { name: 'Dr. BR Ambedkar State Hospital',       phone: '+91-771-2234500', type: 'hospital', district: 'Raipur',    latitude: 21.2300, longitude: 81.6400 },
  ];

  for (const station of EMERGENCY_STATIONS) {
    await prisma.emergencyStation.upsert({
      where: { id: station.name + '_' + station.district },  // synthetic ID fallback
      create: { ...station, active: true },
      update: { phone: station.phone, active: true },
    }).catch(async () => {
      // If unique constraint isn't on name+district, just createMany with skip
      await prisma.emergencyStation.create({ data: { ...station, active: true } }).catch(() => {/* already exists */});
    });
  }

  // ── Seed Media Library & Settings ──────────────────────────────────────────
  console.log('Seeding media library...');
  const chitrakotePlace = await prisma.place.findUnique({ where: { slug: 'chitrakote-falls' } });
  const sirpurPlace = await prisma.place.findUnique({ where: { slug: 'sirpur-monuments' } });

  if (chitrakotePlace) {
    await prisma.mediaLibrary.createMany({
      data: [
        {
          placeId: chitrakotePlace.id,
          districtId: chitrakotePlace.districtId,
          mediaType: 'image',
          title: 'Chitrakote Falls Monsoon View',
          filePath: '/places/bastar/chitrakote/monsoon.png',
          caption: 'Roaring falls during the peak monsoon season.',
          photographer: 'Aarav Mandavi',
          copyrightOwner: 'CG Tourism Board',
          status: 'APPROVED',
        },
        {
          placeId: chitrakotePlace.id,
          districtId: chitrakotePlace.districtId,
          mediaType: 'video',
          title: 'Chitrakote Drone Panorama',
          filePath: '/places/bastar/chitrakote/drone.mp4',
          caption: 'High-definition aerial video of the entire horse-shoe gorge.',
          photographer: 'Bastar Explorer',
          copyrightOwner: 'Tourism Department',
          status: 'APPROVED',
        },
        {
          placeId: chitrakotePlace.id,
          districtId: chitrakotePlace.districtId,
          mediaType: 'image',
          title: 'Chitrakote Falls Sunset View',
          filePath: '/places/bastar/chitrakote/sunset.png',
          caption: 'Vibrant sunset lighting behind the mist.',
          photographer: 'CG Tourism Official',
          copyrightOwner: 'CG Tourism',
          status: 'APPROVED',
        }
      ]
    });
  }

  if (sirpurPlace) {
    await prisma.mediaLibrary.createMany({
      data: [
        {
          placeId: sirpurPlace.id,
          districtId: sirpurPlace.districtId,
          mediaType: 'image',
          title: 'Laxman Temple Brick Carving Details',
          filePath: '/places/raipur/sirpur/details.png',
          caption: 'Exquisite brick detailing of the 6th century shrine.',
          photographer: 'Ancient Historian',
          copyrightOwner: 'Archeological Survey of India',
          status: 'APPROVED',
        }
      ]
    });
  }

  // Seed default admin configurations
  await prisma.adminSetting.createMany({
    data: [
      { key: 'auto_media_suggestions', value: 'true', description: 'Enable auto media suggestions for stories composer.' },
      { key: 'ai_draft_story_enabled', value: 'true', description: 'Enable automatic generative AI draft stories.' },
      { key: 'max_images_per_story', value: '15', description: 'Maximum allowed gallery images in a creator story.' },
    ]
  });

  // ── Seed Creator Stories ──────────────────────────────────────────────────
  console.log('Seeding creator stories...');
  const bhoramdeoPlace = await prisma.place.findUnique({ where: { slug: 'bhoramdeo-temple' } });

  const story1 = await prisma.creatorStory.create({
    data: {
      creatorId: creatorProfile.id,
      placeId: chitrakotePlace?.id || null,
      districtId: chitrakotePlace?.districtId || null,
      categoryId: chitrakotePlace?.categoryId || null,
      title: 'Chitrakote Falls at Sunrise - The Niagara of India 🌊',
      slug: 'chitrakote-falls-sunrise',
      description: 'Woke up at 5:00 AM to capture the glorious mist rising from the Indravati river gorge. Bastar in the monsoon is pure magic!',
      storyType: 'video',
      language: 'Hindi',
      coverImage: '/chitrakote.png',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      likes: 142,
      views: 1205,
      shares: 32,
    }
  });

  await prisma.storyMedia.create({
    data: {
      storyId: story1.id,
      mediaType: 'video',
      filePath: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: '/chitrakote.png',
      displayOrder: 0
    }
  });

  await prisma.storyLocation.create({
    data: {
      storyId: story1.id,
      latitude: 19.2006,
      longitude: 81.6961,
      nearestPlace: 'Chitrakote Falls'
    }
  });

  await prisma.storyStatistics.create({
    data: {
      storyId: story1.id,
      views: 1205,
      likes: 142,
      shares: 32
    }
  });

  const story2 = await prisma.creatorStory.create({
    data: {
      creatorId: creatorProfile.id,
      placeId: sirpurPlace?.id || null,
      districtId: sirpurPlace?.districtId || null,
      categoryId: sirpurPlace?.categoryId || null,
      title: 'Exploring Laxman Temple in Sirpur 🛕',
      slug: 'exploring-laxman-temple-sirpur',
      description: 'Captured the intricate carvings and ancient red brickwork built by Queen Vasata in the 6th century. A must visit heritage complex!',
      storyType: 'image',
      language: 'English',
      coverImage: '/sirpur.png',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      likes: 95,
      views: 840,
      shares: 18,
    }
  });

  await prisma.storyMedia.create({
    data: {
      storyId: story2.id,
      mediaType: 'image',
      filePath: '/sirpur.png',
      thumbnail: '/sirpur.png',
      displayOrder: 0
    }
  });

  await prisma.storyLocation.create({
    data: {
      storyId: story2.id,
      latitude: 21.3414,
      longitude: 82.1764,
      nearestPlace: 'Sirpur'
    }
  });

  await prisma.storyStatistics.create({
    data: {
      storyId: story2.id,
      views: 840,
      likes: 95,
      shares: 18
    }
  });

  console.log('Seeded creator stories successfully.');
  console.log(`Seeded ${EMERGENCY_STATIONS.length} emergency stations.`);
  console.log(`Seeded all ${SEED_DESTINATIONS.length} landmark destinations and translations successfully.`);
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error occurred during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
