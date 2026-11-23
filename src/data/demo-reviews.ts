import type { ReviewRowInput } from "@/lib/types";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86400000 - Math.floor(Math.random() * 6) * 3600000);
}

type Seed = [sku: string, author: string, rating: number, title: string, body: string, days: number, area: string];

const SEEDS: Seed[] = [
  ["IP15-PINK", "Ananya Negi", 5, "Pink iPhone at the best price in Dehradun", "Ordered at 2 PM, the phone was at my door in Ballupur by 5 PM. Genuine sealed box, GST bill and they even transferred my data from the old phone.", 2, "Ballupur"],
  ["IP15-PINK", "Rohit Bhatt", 5, "0% finance made it easy", "Took the Bajaj EMI at 0% for 9 months. Zero down payment, approved in ten minutes. Best mobile shop on Rajpur Road.", 9, "Rajpur Road"],
  ["IP15-PINK", "Sakshi Painuly", 4, "Lovely colour, smooth setup", "The pink shade is softer in person. Got a free tempered glass and a trolley bag with the bill. Packing was excellent.", 16, "Sahastradhara"],
  ["IP15PRO", "Vikram Rawat", 5, "Genuine product, instant delivery", "Called the shop at noon, they kept a Natural Titanium unit aside for me and I picked it up the same day with a proper tax invoice.", 5, "Jakhan"],
  ["IP15PRO", "Meenal Thapliyal", 5, "Great exchange bonus", "Traded in my iPhone 12 for a fair price and upgraded to the 15 Pro. Staff knew every feature and helped set up the Action button.", 21, "Clement Town"],
  ["S24-128", "Karan Chand", 5, "Galaxy AI is brilliant", "The yellow colour turns heads. Circle to Search works great for my CA studies. Price was lower than the big online stores.", 3, "GMS Road"],
  ["S24-128", "Pooja Dwivedi", 4, "Good deal with free gifts", "Got a Noise watch free with the phone. Delivery was same day as promised, though the packaging box had a small dent on the outside.", 12, "Patel Nagar"],
  ["S24FE", "Aakash Verma", 5, "Perfect for my daughter", "Bought for my daughter's college. Camera is fantastic and the screen is very smooth. The owner explained everything patiently.", 18, "Subhash Nagar"],
  ["M35", "Neha Rana", 4, "Battery lasts two days", "Great phone for the price. Battery easily lasts two days. Got a small discount plus a back cover free.", 8, "Nehru Colony"],
  ["CE4L", "Arjun Panwar", 5, "Charging is unbelievably fast", "80W charging is no joke — full in under an hour. Shop delivered to Ajabpur the same evening I ordered.", 6, "Ajabpur"],
  ["12R", "Devansh Joshi", 5, "Flagship killer indeed", "Was sceptical about buying offline but the price here was better than online. Gaming on BGMI is super smooth at 120fps.", 14, "Kanwali"],
  ["12R", "Ishita Garg", 4, "Big bright display", "The display is gorgeous and very bright in Dehradun sunlight. Slightly heavy for my liking but performance is top notch.", 27, "Rajpur Road"],
  ["RN13P", "Manish Kumar", 5, "200MP camera is superb", "Took it on a trip to Dhanaulti — photos came out crisp. Shop gave a free screen guard and installed it in front of me.", 4, "Dharampur"],
  ["R12P", "Shreya Bhandari", 4, "Zoom is impressive at this price", "The periscope zoom is great for concerts. Colour looks premium. Would have liked a charger in the box, but they gave me a discount on one.", 11, "Ballupur"],
  ["RENO11", "Tanvi Uniyal", 5, "Portraits look professional", "Portrait photos have lovely blur. Got it on IDFC EMI with zero interest. Staff were very polite.", 19, "Sahastradhara"],
  ["V29", "Rahul Bisht", 4, "Great selfies", "The front camera is excellent for video calls with family abroad. Same day delivery to Majra, very happy.", 7, "Majra"],
  ["EDGE40N", "Prerna Vashisht", 5, "Beautiful vegan leather finish", "The Caneel Bay colour is stunning. IP68 gives me peace of mind in the monsoon. Good discount compared to online.", 23, "Clement Town"],
  ["AIRPODS3", "Aditya Saini", 5, "Pairing took two seconds", "Opened the case near my iPhone and it was connected. Sound is clear and Spatial Audio is fun. Genuine Apple warranty verified online.", 10, "Rajpur Road"],
  ["AIRPODS3", "Kashish Kandari", 4, "Worth the upgrade", "Coming from a cheap TWS, the difference is night and day. Wish they came in pink though. Fast delivery to Nehru Colony.", 31, "Nehru Colony"],
  ["BUDSFE", "Sumit Rathi", 5, "Noise cancellation really works", "ANC blocks out the traffic noise on my bus ride to work. Got them at a lower price than the big app, with a proper bill.", 13, "Patel Nagar"],
  ["RK255", "Gaurav Aswal", 5, "Bass is punchy", "Bought two, one for me and one for my brother. Battery lasts forever and the yellow colour looks cool. Great value.", 2, "Chakrata Road"],
  ["AD141", "Riya Lohani", 4, "Good for the price", "For around a thousand rupees these are excellent. Call quality is clear. Delivery was same day to GMS Road.", 5, "GMS Road"],
  ["JBL510", "Abhinav Maulik", 5, "Classic JBL bass", "Bought for gym sessions. Comfortable for long wear and the bass is exactly what JBL is known for. Free headphone stand gift was a surprise.", 8, "Ballupur"],
  ["VS104", "Sneha Purohit", 4, "Battery goes on and on", "Charged it once and used for a week. Sound is balanced. Would recommend to anyone on a budget.", 17, "Subhash Nagar"],
  ["MIVI", "Yashwardhan Singh", 5, "Tiny speaker, big sound", "Took it to a picnic by the Rispana river. Everyone was surprised how loud this little pink thing gets.", 3, "Rajpur Road"],
  ["AWS9", "Ritika Tandon", 5, "Pink strap matches everything", "The double tap gesture is so handy when my hands are full. Staff helped me choose the right size and set it up in store.", 9, "Rajpur Road"],
  ["AWS9", "Nikhil Durgapal", 4, "Health tracking is very accurate", "Upgraded from Series 6. The brighter screen is noticeable outdoors. Price matched the online sale with a gift included.", 25, "Jakhan"],
  ["GW6", "Harsh Mehta", 5, "Sleep coaching is useful", "The watch nudges me to sleep on time. Battery easily lasts two days. Got a great exchange offer on my old watch.", 15, "Clement Town"],
  ["CFPRO4", "Preeti Bhandari", 5, "Best budget smartwatch", "Rose pink looks much more expensive than it is. Calls are clear and the battery lasts a full week. Delivered same day to Dharampur.", 1, "Dharampur"],
  ["CFPRO4", "Aman Singh Bisht", 4, "Great value", "Big bright screen, lots of watch faces, sleep tracking. Good companion for my morning walks on Rajpur Road.", 6, "Rajpur Road"],
  ["XTALK", "Khushi Bartwal", 4, "Pretty and practical", "Cherry Blossom colour is lovely. Alexa works. Battery is about five days with heavy use instead of seven.", 20, "Ballupur"],
  ["ANKER20", "Sandeep Rawat", 5, "Charges iPhone 15 really fast", "Tiny size, charges fast and does not heat up. Counter staff gave good advice on choosing between 20W and 45W.", 4, "Majra"],
  ["PB20K", "Lakshita Jaguri", 5, "Saved my Mussoorie trip", "Took it on a weekend trip, charged two phones and still had power left. Pink colour is cute.", 7, "Sahastradhara"],
  ["AMB65", "Rajat Uniyal", 5, "One charger for laptop and phone", "Charges my MacBook Air and phone together. Build quality feels solid. Got it at a nice discount.", 12, "GMS Road"],
  ["SPIGEN", "Alisha Gurung", 5, "Fits perfectly", "Snug fit, the pink matches the phone and the kickstand is great for watching lectures.", 3, "Nehru Colony"],
  ["JETECH", "Mohit Thapa", 4, "Installed free at store", "Good quality glass with no bubbles. They installed it on the spot when I collected my phone.", 10, "Ajabpur"],
  ["SAM25", "Ekta Semwal", 5, "Original Samsung adapter", "Super fast charging on my S24. Verified serial number with Samsung support.", 22, "Patel Nagar"],
  ["KONNEKT", "Gaurav Dobhal", 5, "Sturdy cable", "Thick braided cable, charges at full speed. Much better than the thin cables that fray in three months.", 5, "Kanwali"],
  ["DYAZO", "Shivangi Nautiyal", 4, "Handy for hill drives", "Keeps everyone's phone charged on the way to Mussoorie. Compact and does not block the cup holder.", 16, "Subhash Nagar"],
];

export const DEMO_REVIEWS: ReviewRowInput[] = SEEDS.map(([sku, author, rating, title, body, days]) => ({
  sku,
  author,
  rating,
  title,
  body,
  verified: true,
  date: daysAgo(days),
}));
