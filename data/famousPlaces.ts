/**
 * famousPlaces.ts — 100 Famous Places of Nepal
 * Curated destinations across trekking, temples, lakes, national parks, cities & culture
 */

export interface FamousPlace {
  title: string;
  location: string;
  rating: string;
  price: string;
  image: string;
  description: string;
  category: 'trek' | 'temple' | 'lake' | 'park' | 'city' | 'adventure' | 'heritage' | 'nature';
}

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=800`;

export const FAMOUS_PLACES: FamousPlace[] = [
  // ─── Iconic Treks ──────────────────────────────────────────────────────────
  { title: 'Everest Base Camp', location: 'Solukhumbu', rating: '4.9', price: '$1,400', image: '/assets/everest.png', description: 'The iconic trek to the base of the world\'s tallest peak with breathtaking Himalayan panoramas.', category: 'trek' },
  { title: 'Annapurna Base Camp', location: 'Kaski', rating: '4.9', price: '$800', image: '/assets/annapurna.png', description: 'A spectacular trek through diverse landscapes to the heart of the Annapurna massif.', category: 'trek' },
  { title: 'Langtang Valley Trek', location: 'Rasuwa', rating: '4.7', price: '$600', image: IMG('1544735716-392fe2489ffa'), description: 'Known as the valley of glaciers, offering stunning mountain views and rich Tamang culture.', category: 'trek' },
  { title: 'Manaslu Circuit Trek', location: 'Gorkha', rating: '4.8', price: '$1,200', image: IMG('1506905925346-21bda4d32df4'), description: 'A remote and pristine trek around the eighth highest mountain in the world.', category: 'trek' },
  { title: 'Annapurna Circuit', location: 'Manang', rating: '4.9', price: '$900', image: IMG('1464822759023-fed4e01cb64e'), description: 'One of the world\'s greatest long-distance treks crossing the Thorong La pass at 5,416m.', category: 'trek' },
  { title: 'Upper Mustang Trek', location: 'Mustang', rating: '4.8', price: '$1,800', image: IMG('1501785888108-acb900c1fdb9'), description: 'The forbidden kingdom with ancient Tibetan Buddhist culture and dramatic desert landscapes.', category: 'trek' },
  { title: 'Gokyo Lakes Trek', location: 'Solukhumbu', rating: '4.8', price: '$1,100', image: IMG('1507003211169-0a1dd7228f2d'), description: 'Turquoise glacial lakes surrounded by snow-capped peaks including Cho Oyu.', category: 'trek' },
  { title: 'Mardi Himal Trek', location: 'Kaski', rating: '4.7', price: '$500', image: IMG('1470071459604-3b5ec3a7fe05'), description: 'A hidden gem offering pristine mountain views with fewer crowds than popular routes.', category: 'trek' },
  { title: 'Poon Hill Trek', location: 'Myagdi', rating: '4.6', price: '$350', image: IMG('1454496522488-7a8e488e8606'), description: 'A short trek rewarding hikers with one of the best sunrise views over the Himalayas.', category: 'trek' },
  { title: 'Kanchenjunga Base Camp', location: 'Taplejung', rating: '4.8', price: '$2,000', image: IMG('1486870591958-9b9d0d1dda99'), description: 'Remote trek to the base of the third highest peak with pristine wilderness.', category: 'trek' },
  { title: 'Makalu Base Camp', location: 'Sankhuwasabha', rating: '4.7', price: '$1,500', image: IMG('1519681393784-d120267933ba'), description: 'Trek through untouched wilderness to the base of the fifth highest mountain.', category: 'trek' },
  { title: 'Dhaulagiri Circuit', location: 'Myagdi', rating: '4.7', price: '$1,600', image: IMG('1483728642387-6c3bdd6c3e5d'), description: 'A challenging trek around the seventh highest peak with French Pass crossing.', category: 'trek' },
  { title: 'Tilicho Lake Trek', location: 'Manang', rating: '4.8', price: '$700', image: IMG('1504280390367-361c6d9f38f4'), description: 'Trek to one of the highest lakes in the world at 4,919m elevation.', category: 'trek' },
  { title: 'Pikey Peak Trek', location: 'Solukhumbu', rating: '4.6', price: '$400', image: IMG('1464278533981-50106e6176b1'), description: 'A lesser-known viewpoint offering stunning Everest views, recommended by Sir Edmund Hillary.', category: 'trek' },
  { title: 'Khopra Ridge Trek', location: 'Myagdi', rating: '4.7', price: '$500', image: IMG('1433086966358-54859d0ed716'), description: 'A community-managed trek with panoramic views of Dhaulagiri and Annapurna ranges.', category: 'trek' },

  // ─── Temples & Heritage ────────────────────────────────────────────────────
  { title: 'Boudhanath Stupa', location: 'Kathmandu', rating: '4.9', price: '$5', image: '/assets/boudhanath.png', description: 'One of the largest stupas in the world and a center of Tibetan Buddhism in Nepal.', category: 'temple' },
  { title: 'Pashupatinath Temple', location: 'Kathmandu', rating: '4.9', price: '$10', image: IMG('1544735716-392fe2489ffa'), description: 'The holiest Hindu temple in Nepal dedicated to Lord Shiva on the banks of Bagmati River.', category: 'temple' },
  { title: 'Swayambhunath (Monkey Temple)', location: 'Kathmandu', rating: '4.8', price: '$3', image: IMG('1558862107-d49ef2451040'), description: 'An ancient religious complex atop a hill with the famous all-seeing eyes of Buddha.', category: 'temple' },
  { title: 'Lumbini (Buddha\'s Birthplace)', location: 'Rupandehi', rating: '4.9', price: '$5', image: IMG('1548013146-72479768bada'), description: 'The sacred birthplace of Lord Buddha, a UNESCO World Heritage Site and pilgrimage center.', category: 'temple' },
  { title: 'Changu Narayan Temple', location: 'Bhaktapur', rating: '4.7', price: '$3', image: IMG('1523712999610-f77fbcfc3843'), description: 'The oldest Hindu temple in Nepal, a masterpiece of Licchavi-era art and architecture.', category: 'heritage' },
  { title: 'Muktinath Temple', location: 'Mustang', rating: '4.8', price: '$15', image: IMG('1502602898657-3e91760cbb34'), description: 'A sacred temple for both Hindus and Buddhists at 3,710m with 108 water spouts.', category: 'temple' },
  { title: 'Manakamana Temple', location: 'Gorkha', rating: '4.6', price: '$10', image: IMG('1517048676732-d65bc937f952'), description: 'A wish-fulfilling temple accessible by cable car with stunning valley views.', category: 'temple' },
  { title: 'Janaki Temple', location: 'Janakpur', rating: '4.7', price: '$2', image: IMG('1516738901171-8eb4fc13bd20'), description: 'A stunning Mughal-style temple dedicated to Goddess Sita, a marvel of architecture.', category: 'temple' },
  { title: 'Namo Buddha', location: 'Kavrepalanchok', rating: '4.6', price: '$5', image: IMG('1493780474015-ba834fd0ce2f'), description: 'A sacred Buddhist pilgrimage site where Prince Mahasattva offered his body to a starving tigress.', category: 'temple' },
  { title: 'Kopan Monastery', location: 'Kathmandu', rating: '4.7', price: '$5', image: IMG('1545389336-cf090e21eb4d'), description: 'A Tibetan Buddhist monastery offering meditation courses with panoramic valley views.', category: 'temple' },
  { title: 'Tengboche Monastery', location: 'Solukhumbu', rating: '4.8', price: 'Free', image: IMG('1533577116850-6f09e94e3ee0'), description: 'The largest monastery in the Khumbu region with Everest, Lhotse, and Ama Dablam backdrop.', category: 'temple' },

  // ─── Heritage Cities & Squares ─────────────────────────────────────────────
  { title: 'Bhaktapur Durbar Square', location: 'Bhaktapur', rating: '4.7', price: '$15', image: '/assets/bhaktapur.png', description: 'A living museum of medieval art and architecture with stunning Newari craftsmanship.', category: 'heritage' },
  { title: 'Kathmandu Durbar Square', location: 'Kathmandu', rating: '4.7', price: '$10', image: IMG('1558862107-d49ef2451040'), description: 'The historic palace square with ancient temples, courtyards and the living goddess Kumari.', category: 'heritage' },
  { title: 'Patan Durbar Square', location: 'Lalitpur', rating: '4.8', price: '$10', image: IMG('1523712999610-f77fbcfc3843'), description: 'A concentration of Newari architecture with Krishna Mandir and the Patan Museum.', category: 'heritage' },
  { title: 'Thamel', location: 'Kathmandu', rating: '4.5', price: 'Free', image: IMG('1517048676732-d65bc937f952'), description: 'The vibrant tourist hub of Kathmandu, buzzing with shops, restaurants, and nightlife.', category: 'city' },
  { title: 'Bandipur', location: 'Tanahun', rating: '4.7', price: 'Free', image: IMG('1470071459604-3b5ec3a7fe05'), description: 'A hilltop settlement preserving Newari culture with stunning views and silk sari weaving.', category: 'city' },
  { title: 'Palpa (Tansen)', location: 'Palpa', rating: '4.6', price: 'Free', image: IMG('1504280390367-361c6d9f38f4'), description: 'A historic hill town with Rana-era palaces, Dhaka weaving, and panoramic Himalayan views.', category: 'city' },
  { title: 'Kirtipur', location: 'Kathmandu', rating: '4.5', price: 'Free', image: IMG('1502602898657-3e91760cbb34'), description: 'An ancient Newari hilltop city with centuries-old temples and traditional lifestyle.', category: 'heritage' },
  { title: 'Gorkha Palace', location: 'Gorkha', rating: '4.6', price: '$5', image: IMG('1486870591958-9b9d0d1dda99'), description: 'The ancestral palace of King Prithvi Narayan Shah with panoramic mountain views.', category: 'heritage' },

  // ─── Lakes ─────────────────────────────────────────────────────────────────
  { title: 'Phewa Lake', location: 'Pokhara', rating: '4.8', price: '$20', image: '/assets/pokhara.png', description: 'A serene lake reflecting the Annapurna range, perfect for boating and lakeside strolls.', category: 'lake' },
  { title: 'Rara Lake', location: 'Mugu', rating: '4.9', price: '$100', image: IMG('1504280390367-361c6d9f38f4'), description: 'Nepal\'s largest and deepest lake surrounded by pristine forests — the queen of lakes.', category: 'lake' },
  { title: 'Gosaikunda Lake', location: 'Rasuwa', rating: '4.8', price: '$50', image: IMG('1507003211169-0a1dd7228f2d'), description: 'A sacred alpine lake at 4,380m, formed by Lord Shiva\'s trident according to legend.', category: 'lake' },
  { title: 'Begnas Lake', location: 'Pokhara', rating: '4.6', price: '$10', image: IMG('1470071459604-3b5ec3a7fe05'), description: 'A tranquil alternative to Phewa Lake, perfect for kayaking and fishing.', category: 'lake' },
  { title: 'Panch Pokhari', location: 'Sindhupalchok', rating: '4.7', price: '$60', image: IMG('1483728642387-6c3bdd6c3e5d'), description: 'Five sacred holy lakes at high altitude, a popular pilgrimage during Janai Purnima.', category: 'lake' },
  { title: 'Tilicho Lake', location: 'Manang', rating: '4.8', price: '$80', image: IMG('1433086966358-54859d0ed716'), description: 'One of the highest altitude lakes in the world at 4,919m near Annapurna range.', category: 'lake' },
  { title: 'Shey Phoksundo Lake', location: 'Dolpa', rating: '4.9', price: '$150', image: IMG('1506905925346-21bda4d32df4'), description: 'Nepal\'s deepest lake with striking turquoise water in the remote Dolpo region.', category: 'lake' },
  { title: 'Tsho Rolpa Lake', location: 'Dolakha', rating: '4.6', price: '$70', image: IMG('1519681393784-d120267933ba'), description: 'One of the largest glacial lakes in Nepal offering stunning high-altitude scenery.', category: 'lake' },
  { title: 'Dipang Lake', location: 'Palpa', rating: '4.5', price: '$5', image: IMG('1454496522488-7a8e488e8606'), description: 'A scenic lake in Palpa district surrounded by hills and local village charm.', category: 'lake' },
  { title: 'Mai Pokhari', location: 'Ilam', rating: '4.6', price: '$5', image: IMG('1464822759023-fed4e01cb64e'), description: 'A Ramsar-listed wetland lake surrounded by dense forest in eastern Nepal.', category: 'lake' },

  // ─── National Parks & Wildlife ─────────────────────────────────────────────
  { title: 'Chitwan National Park', location: 'Chitwan', rating: '4.8', price: '$50', image: '/assets/chitwan.png', description: 'UNESCO World Heritage jungle safari with one-horned rhinos and Bengal tigers.', category: 'park' },
  { title: 'Sagarmatha National Park', location: 'Solukhumbu', rating: '4.9', price: '$30', image: IMG('1486870591958-9b9d0d1dda99'), description: 'Home to Mount Everest, this UNESCO site protects rare snow leopards and red pandas.', category: 'park' },
  { title: 'Bardia National Park', location: 'Bardia', rating: '4.8', price: '$40', image: IMG('1501785888108-acb900c1fdb9'), description: 'The largest national park in the Terai, famous for wild elephants and Bengal tigers.', category: 'park' },
  { title: 'Langtang National Park', location: 'Rasuwa', rating: '4.7', price: '$30', image: IMG('1533577116850-6f09e94e3ee0'), description: 'A biodiversity hotspot with red pandas, Himalayan tahr, and diverse plant species.', category: 'park' },
  { title: 'Shivapuri Nagarjun National Park', location: 'Kathmandu', rating: '4.5', price: '$5', image: IMG('1493780474015-ba834fd0ce2f'), description: 'A green oasis on the edge of Kathmandu with hiking trails and bird watching.', category: 'park' },
  { title: 'Koshi Tappu Wildlife Reserve', location: 'Sunsari', rating: '4.6', price: '$20', image: IMG('1545389336-cf090e21eb4d'), description: 'A wetland reserve and paradise for bird watchers with over 500 species recorded.', category: 'park' },
  { title: 'Shuklaphanta National Park', location: 'Kanchanpur', rating: '4.6', price: '$30', image: IMG('1464278533981-50106e6176b1'), description: 'Home to the largest herd of swamp deer in the world and grassland wilderness.', category: 'park' },
  { title: 'Makalu Barun National Park', location: 'Sankhuwasabha', rating: '4.7', price: '$30', image: IMG('1519681393784-d120267933ba'), description: 'One of the most ecologically diverse areas in the world with untouched wilderness.', category: 'park' },
  { title: 'Api Nampa Conservation Area', location: 'Darchula', rating: '4.5', price: '$20', image: IMG('1483728642387-6c3bdd6c3e5d'), description: 'Remote far-western conservation area with pristine forests and rare wildlife.', category: 'park' },
  { title: 'Dhorpatan Hunting Reserve', location: 'Baglung', rating: '4.4', price: '$30', image: IMG('1433086966358-54859d0ed716'), description: 'Nepal\'s only hunting reserve with blue sheep and Himalayan tahr in pristine wilderness.', category: 'park' },

  // ─── Adventure & Activities ────────────────────────────────────────────────
  { title: 'Paragliding in Pokhara', location: 'Pokhara', rating: '4.9', price: '$80', image: IMG('1507003211169-0a1dd7228f2d'), description: 'Soar above Phewa Lake with the Annapurna range as your backdrop — world-class paragliding.', category: 'adventure' },
  { title: 'Bungee Jumping (The Last Resort)', location: 'Sindhupalchok', rating: '4.7', price: '$100', image: IMG('1504280390367-361c6d9f38f4'), description: 'A 160m free fall over the Bhote Koshi River gorge — one of the highest bungee jumps in Asia.', category: 'adventure' },
  { title: 'White Water Rafting (Trisuli)', location: 'Dhading', rating: '4.7', price: '$40', image: IMG('1464822759023-fed4e01cb64e'), description: 'Thrilling rapids on the Trisuli River through lush valleys and gorges.', category: 'adventure' },
  { title: 'Zip Flyer Pokhara', location: 'Pokhara', rating: '4.6', price: '$50', image: IMG('1454496522488-7a8e488e8606'), description: 'One of the steepest and longest zip lines in the world with valley and lake views.', category: 'adventure' },
  { title: 'Mountain Biking (Kathmandu Valley)', location: 'Kathmandu', rating: '4.6', price: '$30', image: IMG('1502602898657-3e91760cbb34'), description: 'Ride through ancient trails, terraced farms, and Newari villages around the valley.', category: 'adventure' },
  { title: 'Canyoning in Jalbire', location: 'Sindhupalchok', rating: '4.7', price: '$60', image: IMG('1506905925346-21bda4d32df4'), description: 'Rappel down magnificent waterfalls through lush canyons near Kathmandu.', category: 'adventure' },
  { title: 'Ultralight Flight (Pokhara)', location: 'Pokhara', rating: '4.8', price: '$120', image: IMG('1470071459604-3b5ec3a7fe05'), description: 'Fly close to the Annapurna and Machhapuchhre peaks in an ultralight aircraft.', category: 'adventure' },
  { title: 'Mountain Flight (Everest)', location: 'Kathmandu', rating: '4.9', price: '$200', image: IMG('1548013146-72479768bada'), description: 'A scenic flight offering close-up views of Everest and the Himalayan range.', category: 'adventure' },
  { title: 'Skydiving in Everest', location: 'Solukhumbu', rating: '4.9', price: '$25,000', image: IMG('1486870591958-9b9d0d1dda99'), description: 'The ultimate adventure — tandem skydive with Mount Everest as your backdrop.', category: 'adventure' },
  { title: 'Kayaking on Phewa Lake', location: 'Pokhara', rating: '4.5', price: '$10', image: IMG('1501785888108-acb900c1fdb9'), description: 'Peaceful kayaking on the calm waters of Phewa Lake with mountain reflections.', category: 'adventure' },

  // ─── Nature & Scenic Spots ─────────────────────────────────────────────────
  { title: 'Nagarkot Sunrise', location: 'Bhaktapur', rating: '4.7', price: '$5', image: IMG('1519681393784-d120267933ba'), description: 'One of the best sunrise viewpoints near Kathmandu with panoramic Himalayan vistas.', category: 'nature' },
  { title: 'Dhulikhel', location: 'Kavrepalanchok', rating: '4.6', price: 'Free', image: IMG('1533577116850-6f09e94e3ee0'), description: 'A charming Newari town offering spectacular mountain views and cultural heritage.', category: 'nature' },
  { title: 'Sarangkot', location: 'Pokhara', rating: '4.8', price: '$5', image: IMG('1464278533981-50106e6176b1'), description: 'The premier sunrise and paragliding viewpoint overlooking Pokhara and the Annapurna range.', category: 'nature' },
  { title: 'World Peace Pagoda', location: 'Pokhara', rating: '4.7', price: 'Free', image: IMG('1545389336-cf090e21eb4d'), description: 'A beautiful stupa on a hilltop with panoramic views of the Himalayas and Phewa Lake.', category: 'nature' },
  { title: 'Ilam Tea Gardens', location: 'Ilam', rating: '4.6', price: 'Free', image: IMG('1493780474015-ba834fd0ce2f'), description: 'Rolling green tea plantations in eastern Nepal producing Nepal\'s finest orthodox tea.', category: 'nature' },
  { title: 'Ghandruk Village', location: 'Kaski', rating: '4.7', price: 'Free', image: IMG('1517048676732-d65bc937f952'), description: 'A picturesque Gurung village with stone houses and stunning Annapurna South views.', category: 'nature' },
  { title: 'Davis Falls', location: 'Pokhara', rating: '4.5', price: '$2', image: IMG('1516738901171-8eb4fc13bd20'), description: 'A unique waterfall where the Pardi Khola stream disappears underground into a cave.', category: 'nature' },
  { title: 'Gupteshwor Mahadev Cave', location: 'Pokhara', rating: '4.5', price: '$2', image: IMG('1523712999610-f77fbcfc3843'), description: 'A sacred limestone cave with a natural Shiva lingam, connected to Davis Falls.', category: 'nature' },
  { title: 'Kali Gandaki Gorge', location: 'Mustang', rating: '4.8', price: 'Free', image: IMG('1483728642387-6c3bdd6c3e5d'), description: 'The deepest gorge in the world, nestled between Dhaulagiri and Annapurna.', category: 'nature' },
  { title: 'Daman Viewpoint', location: 'Makwanpur', rating: '4.6', price: 'Free', image: IMG('1433086966358-54859d0ed716'), description: 'Offers the widest mountain panorama in Nepal, from Dhaulagiri to Everest.', category: 'nature' },
  { title: 'Chandragiri Hills', location: 'Kathmandu', rating: '4.6', price: '$10', image: IMG('1558862107-d49ef2451040'), description: 'A cable car ride to a hilltop with 360-degree Himalayan views and Bhaleshwor temple.', category: 'nature' },
  { title: 'Kakani', location: 'Nuwakot', rating: '4.5', price: 'Free', image: IMG('1504280390367-361c6d9f38f4'), description: 'A serene hilltop retreat with strawberry farms and mountain views near Kathmandu.', category: 'nature' },
  { title: 'Bardiya Babai Valley', location: 'Bardiya', rating: '4.6', price: '$20', image: IMG('1501785888108-acb900c1fdb9'), description: 'A remote and pristine valley with diverse wildlife and indigenous Tharu culture.', category: 'nature' },
  { title: 'Manaslu Region', location: 'Gorkha', rating: '4.7', price: '$100', image: IMG('1506905925346-21bda4d32df4'), description: 'A restricted area offering untouched natural beauty around the eighth highest peak.', category: 'nature' },
  { title: 'Dhampus', location: 'Kaski', rating: '4.5', price: 'Free', image: IMG('1454496522488-7a8e488e8606'), description: 'A charming Gurung village with close-up views of Machhapuchhre (Fishtail Mountain).', category: 'nature' },

  // ─── Cultural & Unique ─────────────────────────────────────────────────────
  { title: 'Garden of Dreams', location: 'Kathmandu', rating: '4.6', price: '$3', image: IMG('1502602898657-3e91760cbb34'), description: 'A neo-classical garden oasis from the 1920s, perfect for relaxation in Kathmandu.', category: 'heritage' },
  { title: 'Asan Bazaar', location: 'Kathmandu', rating: '4.5', price: 'Free', image: IMG('1516738901171-8eb4fc13bd20'), description: 'The oldest and most bustling marketplace in Kathmandu full of spices, fabrics, and culture.', category: 'city' },
  { title: 'Pokhara Old Bazaar', location: 'Pokhara', rating: '4.5', price: 'Free', image: IMG('1523712999610-f77fbcfc3843'), description: 'The historic trading center of Pokhara with Newari architecture and local artisan shops.', category: 'city' },
  { title: 'Namche Bazaar', location: 'Solukhumbu', rating: '4.7', price: 'Free', image: IMG('1544735716-392fe2489ffa'), description: 'The Sherpa capital and gateway to Everest, a vibrant mountain town at 3,440m.', category: 'city' },
  { title: 'Lo Manthang', location: 'Mustang', rating: '4.8', price: '$500', image: IMG('1548013146-72479768bada'), description: 'A walled medieval city and former capital of the kingdom of Lo in Upper Mustang.', category: 'heritage' },
  { title: 'Tharu Cultural Museum', location: 'Chitwan', rating: '4.4', price: '$3', image: IMG('1545389336-cf090e21eb4d'), description: 'A museum showcasing the indigenous Tharu people\'s traditional lifestyle and artifacts.', category: 'heritage' },
  { title: 'Bhimsen Tower (Dharahara)', location: 'Kathmandu', rating: '4.4', price: '$5', image: IMG('1517048676732-d65bc937f952'), description: 'A reconstructed historical tower offering 360-degree views of Kathmandu Valley.', category: 'heritage' },
  { title: 'Seto Machhindranath Temple', location: 'Kathmandu', rating: '4.5', price: 'Free', image: IMG('1493780474015-ba834fd0ce2f'), description: 'A beautiful pagoda-style temple in Kathmandu dedicated to the god of rain.', category: 'temple' },
  { title: 'Rato Machhindranath Temple', location: 'Lalitpur', rating: '4.6', price: 'Free', image: IMG('1558862107-d49ef2451040'), description: 'Home to Nepal\'s greatest chariot festival celebrated over several months.', category: 'temple' },
  { title: 'Nyatapola Temple', location: 'Bhaktapur', rating: '4.7', price: '$10', image: IMG('1464822759023-fed4e01cb64e'), description: 'The tallest pagoda-style temple in Nepal, a masterpiece of Newari architecture.', category: 'heritage' },
  { title: 'Panauti', location: 'Kavrepalanchok', rating: '4.5', price: 'Free', image: IMG('1470071459604-3b5ec3a7fe05'), description: 'One of the oldest towns in Nepal with well-preserved medieval Newari architecture.', category: 'heritage' },
  { title: 'International Mountain Museum', location: 'Pokhara', rating: '4.5', price: '$5', image: IMG('1507003211169-0a1dd7228f2d'), description: 'A museum dedicated to mountaineering history and the Himalayan mountains.', category: 'heritage' },

  // ─── More Hidden Gems ──────────────────────────────────────────────────────
  { title: 'Swargadwari', location: 'Pyuthan', rating: '4.6', price: '$5', image: IMG('1519681393784-d120267933ba'), description: 'A sacred pilgrimage site known as the gateway to heaven with panoramic hill views.', category: 'temple' },
  { title: 'Halesi Mahadev Cave', location: 'Khotang', rating: '4.5', price: '$5', image: IMG('1533577116850-6f09e94e3ee0'), description: 'A sacred cave complex revered by Hindus and Buddhists in eastern Nepal.', category: 'temple' },
  { title: 'Pathivara Devi Temple', location: 'Taplejung', rating: '4.6', price: '$5', image: IMG('1464278533981-50106e6176b1'), description: 'A hilltop temple in eastern Nepal with stunning views of Kanchenjunga.', category: 'temple' },
  { title: 'Dolpo Region', location: 'Dolpa', rating: '4.8', price: '$500', image: IMG('1486870591958-9b9d0d1dda99'), description: 'One of the most remote and culturally preserved regions, setting of "Himalaya" film.', category: 'nature' },
  { title: 'Janakpur', location: 'Dhanusha', rating: '4.5', price: 'Free', image: IMG('1548013146-72479768bada'), description: 'The birthplace of Goddess Sita with rich Mithila art, culture, and Ram-Sita temples.', category: 'city' },
  { title: 'Lumbini Peace Garden', location: 'Rupandehi', rating: '4.7', price: '$3', image: IMG('1502602898657-3e91760cbb34'), description: 'A sprawling complex of monasteries built by different countries around Buddha\'s birthplace.', category: 'heritage' },
  { title: 'Tatopani Hot Springs', location: 'Myagdi', rating: '4.5', price: '$5', image: IMG('1506905925346-21bda4d32df4'), description: 'Natural hot springs along the Kali Gandaki River, a perfect rest stop for trekkers.', category: 'nature' },
  { title: 'Siddha Gufa (Cave)', location: 'Tanahun', rating: '4.4', price: '$3', image: IMG('1504280390367-361c6d9f38f4'), description: 'One of the largest caves in Nepal with impressive stalactites and stalagmites.', category: 'nature' },
];
