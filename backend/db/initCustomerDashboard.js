import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, schemaName } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runCustomerDashboardMigration() {
  console.log('[PostgreSQL Migration] Running 001_customer_dashboard.sql migration...');
  
  const sqlPath = path.join(__dirname, '../database/001_customer_dashboard.sql');
  const migrationSql = fs.readFileSync(sqlPath, 'utf8');

  await pool.query(migrationSql);
  console.log('[PostgreSQL Migration] All customer dashboard tables initialized successfully.');

  // Seed Categories
  const categoryList = [
    { name: 'Smartphones', desc: 'Flagship, mid-range & foldable smartphones', icon: 'Smartphone' },
    { name: 'Laptops & PCs', desc: 'AI PCs, ultrabooks, gaming laptops & workstations', icon: 'Laptop' },
    { name: 'Smart TVs', desc: '4K/8K OLED, QD-OLED & QLED Smart Televisions', icon: 'Tv' },
    { name: 'Audio', desc: 'Active noise-cancelling headphones, wireless earbuds & soundbars', icon: 'Headphones' },
    { name: 'Smartwatches', desc: 'Fitness trackers, cellular watches & premium smartwatches', icon: 'Watch' },
    { name: 'Appliances', desc: 'Smart home appliances, refrigerators & air purifiers', icon: 'Plug' },
    { name: 'Gaming', desc: 'Next-gen gaming consoles, handhelds & VR headsets', icon: 'Gamepad2' }
  ];

  const categoryMap = {};
  for (const c of categoryList) {
    const catRes = await pool.query(
      `INSERT INTO public.product_categories (category_name, description, icon, status)
       VALUES ($1, $2, $3, 'ACTIVE')
       ON CONFLICT (category_name) 
       DO UPDATE SET description = EXCLUDED.description, icon = EXCLUDED.icon
       RETURNING id, category_name`,
      [c.name, c.desc, c.icon]
    );
    categoryMap[c.name] = catRes.rows[0].id;

    // Mirror to tbl_categories
    await pool.query(
      `INSERT INTO ${schemaName}.tbl_categories (name, description, status)
       VALUES ($1, $2, 'ACTIVE')
       ON CONFLICT (name) DO NOTHING`,
      [c.name, c.desc]
    );
  }

  // Seed Brands
  const brandList = [
    { name: 'Samsung', desc: 'South Korean multinational electronics giant' },
    { name: 'Apple', desc: 'American technology innovator in smartphones, computers & wearables' },
    { name: 'Sony', desc: 'Japanese entertainment & display technology leader' },
    { name: 'LG', desc: 'Leader in OLED display panels & smart home appliances' },
    { name: 'Dell', desc: 'Global computing & enterprise hardware solution provider' },
    { name: 'HP', desc: 'Pioneer in consumer laptops, printers & workstations' },
    { name: 'Lenovo', desc: 'World leader in personal computers & ThinkPad laptops' },
    { name: 'Asus', desc: 'Innovator in ROG gaming hardware & OLED laptops' },
    { name: 'OnePlus', desc: 'Flagship smartphone & ecosystem brand' }
  ];

  const brandMap = {};
  for (const b of brandList) {
    const brandRes = await pool.query(
      `INSERT INTO public.brands (brand_name, description, status)
       VALUES ($1, $2, 'ACTIVE')
       ON CONFLICT (brand_name)
       DO UPDATE SET description = EXCLUDED.description
       RETURNING id, brand_name`,
      [b.name, b.desc]
    );
    brandMap[b.name] = brandRes.rows[0].id;
  }

  // 15 Realistic Electronics Products in INR (₹)
  const productsList = [
    {
      name: 'Apple iPhone 15 Pro Max',
      model: 'MU773HN/A',
      category: 'Smartphones',
      brand: 'Apple',
      price: 134900,
      originalPrice: 149900,
      discount: 10,
      rating: 4.9,
      reviewCount: 3420,
      stock: 25,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      desc: 'Featuring Aerospace-grade Titanium design, A17 Pro chip with 6-core GPU, and 5x optical telephoto camera system.',
      specs: [
        { name: 'Processor', value: 'Apple A17 Pro (3nm)' },
        { name: 'Display', value: '6.7" Super Retina XDR OLED 120Hz ProMotion' },
        { name: 'RAM & Storage', value: '8GB RAM | 256GB NVMe Storage' },
        { name: 'Main Camera', value: '48MP Main + 12MP Ultra-Wide + 12MP 5x Telephoto' },
        { name: 'Battery', value: '4,422 mAh with USB-C 3.0 speeds' }
      ]
    },
    {
      name: 'Samsung Galaxy S24 Ultra AI',
      model: 'SM-S928B/DS',
      category: 'Smartphones',
      brand: 'Samsung',
      price: 129999,
      originalPrice: 144999,
      discount: 10,
      rating: 4.8,
      reviewCount: 2890,
      stock: 18,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      desc: 'Galaxy AI Enabled smartphone featuring 200MP Quad Telephoto camera, titanium frame, and built-in S-Pen stylus.',
      specs: [
        { name: 'Processor', value: 'Qualcomm Snapdragon 8 Gen 3 for Galaxy' },
        { name: 'Display', value: '6.8" Dynamic AMOLED 2X 120Hz (2600 nits)' },
        { name: 'RAM & Storage', value: '12GB LPDDR5X | 512GB UFS 4.0' },
        { name: 'Main Camera', value: '200MP Main + 50MP 5x Zoom + 10MP 3x Zoom + 12MP Ultra-Wide' },
        { name: 'Battery', value: '5,000 mAh with 45W Fast Super Charge' }
      ]
    },
    {
      name: 'Asus ROG Zephyrus G16 OLED (2024)',
      model: 'GU605MI-QR065WS',
      category: 'Laptops & PCs',
      brand: 'Asus',
      price: 189999,
      originalPrice: 209999,
      discount: 9,
      rating: 4.9,
      reviewCount: 1120,
      stock: 3,
      stockStatus: 'LOW_STOCK',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
      desc: 'Ultra-thin CNC aluminum gaming laptop powered by Intel Core Ultra 9 NPU and 240Hz ROG Nebula OLED display.',
      specs: [
        { name: 'Processor', value: 'Intel Core Ultra 9 185H (16-Core AI CPU)' },
        { name: 'GPU', value: 'NVIDIA GeForce RTX 4070 8GB GDDR6' },
        { name: 'Display', value: '16.0" 2.5K (2560x1600) 240Hz 0.2ms ROG Nebula OLED' },
        { name: 'RAM & Storage', value: '32GB LPDDR5X 7467MHz | 1TB PCIe 4.0 NVMe SSD' },
        { name: 'Weight', value: '1.85 kg CNC Unibody Chassis' }
      ]
    },
    {
      name: 'Apple MacBook Pro 16" M3 Max',
      model: 'MUW63HN/A',
      category: 'Laptops & PCs',
      brand: 'Apple',
      price: 349900,
      originalPrice: 379900,
      discount: 7,
      rating: 5.0,
      reviewCount: 940,
      stock: 12,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      desc: 'The ultimate professional workstation laptop featuring 16-Core CPU, 40-Core GPU, Liquid Retina XDR display, and 22-hour battery life.',
      specs: [
        { name: 'Processor', value: 'Apple M3 Max (16-Core CPU, 40-Core GPU)' },
        { name: 'Display', value: '16.2" Liquid Retina XDR (3456x2234) 120Hz ProMotion' },
        { name: 'Memory & SSD', value: '36GB Unified Memory | 1TB High-Speed SSD' },
        { name: 'Ports', value: '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3' }
      ]
    },
    {
      name: 'Sony BRAVIA XR A95L 65" QD-OLED',
      model: 'XR-65A95L',
      category: 'Smart TVs',
      brand: 'Sony',
      price: 279990,
      originalPrice: 329990,
      discount: 15,
      rating: 4.9,
      reviewCount: 780,
      stock: 2,
      stockStatus: 'LOW_STOCK',
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
      desc: 'Flagship QD-OLED 4K Smart TV powered by Cognitive Processor XR and Acoustic Surface Audio+ technology.',
      specs: [
        { name: 'Display Panel', value: '65" Quantum Dot OLED (3840x2160) 120Hz' },
        { name: 'Picture Engine', value: 'Cognitive Processor XR with XR Clear Image' },
        { name: 'Audio Output', value: 'Acoustic Surface Audio+ (60W 2.2 Channel)' },
        { name: 'OS', value: 'Google TV with Bravia Core streaming' }
      ]
    },
    {
      name: 'LG C3 55" 4K Smart OLED TV',
      model: 'OLED55C3PSA',
      category: 'Smart TVs',
      brand: 'LG',
      price: 139990,
      originalPrice: 169990,
      discount: 17,
      rating: 4.8,
      reviewCount: 1850,
      stock: 15,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
      desc: 'Self-lit OLED pixels with α9 AI Processor Gen6, Dolby Vision IQ, Dolby Atmos, and 4 HDMI 2.1 gaming ports.',
      specs: [
        { name: 'Display', value: '55" OLED evo 4K 120Hz (100% Color Fidelity)' },
        { name: 'Processor', value: 'α9 AI Processor 4K Gen6' },
        { name: 'Gaming Features', value: 'NVIDIA G-Sync, AMD FreeSync Premium, 0.1ms response' },
        { name: 'Audio', value: '9.1.2 Virtual Surround Sound 40W' }
      ]
    },
    {
      name: 'Sony WH-1000XM5 ANC Headphones',
      model: 'WH1000XM5/B',
      category: 'Audio',
      brand: 'Sony',
      price: 29990,
      originalPrice: 34990,
      discount: 14,
      rating: 4.8,
      reviewCount: 4210,
      stock: 40,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      desc: 'Industry-leading noise cancelling wireless headphones with 8 microphones, Auto NC Optimizer, and LDAC audio codec.',
      specs: [
        { name: 'Noise Cancellation', value: 'HD Noise Cancelling Processor QN1 & V1 Processor' },
        { name: 'Drivers', value: '30mm specially designed carbon fiber driver' },
        { name: 'Battery Life', value: '30 hours playback with quick 3-min charge for 3 hours' },
        { name: 'Weight', value: '250g Lightweight Synthetic Leather' }
      ]
    },
    {
      name: 'OnePlus 12 5G (Flowy Emerald)',
      model: 'CPH2573',
      category: 'Smartphones',
      brand: 'OnePlus',
      price: 64999,
      originalPrice: 69999,
      discount: 7,
      rating: 4.7,
      reviewCount: 1950,
      stock: 22,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      desc: 'Powered by Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera System, and 100W SUPERVOOC fast charging.',
      specs: [
        { name: 'Processor', value: 'Snapdragon 8 Gen 3 (4nm)' },
        { name: 'Display', value: '6.82" 2K 120Hz ProXDR AMOLED (4500 nits Peak)' },
        { name: 'Camera System', value: '50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-Wide' },
        { name: 'Battery & Charging', value: '5,400 mAh with 100W Wired + 50W Wireless Charging' }
      ]
    },
    {
      name: 'Samsung Galaxy Watch6 Classic 47mm',
      model: 'SM-R960NZSAINU',
      category: 'Smartwatches',
      brand: 'Samsung',
      price: 39990,
      originalPrice: 44990,
      discount: 11,
      rating: 4.7,
      reviewCount: 2150,
      stock: 14,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
      desc: 'Iconic rotating bezel smartwatch with BioActive health sensor, ECG, BIA body composition analysis, and Sapphire Crystal glass.',
      specs: [
        { name: 'Display', value: '1.5" Super AMOLED 480x480 Sapphire Crystal' },
        { name: 'Health Sensors', value: 'BioActive (ECG, HR, BIA), Temperature Sensor' },
        { name: 'Build', value: 'Stainless Steel Case with Rotating Bezel' },
        { name: 'Water Resistance', value: '5ATM + IP68 / MIL-STD-810H' }
      ]
    },
    {
      name: 'Sony PlayStation 5 Slim Digital Edition',
      model: 'CFI-2000B01',
      category: 'Gaming',
      brand: 'Sony',
      price: 44990,
      originalPrice: 49990,
      discount: 10,
      rating: 4.9,
      reviewCount: 8900,
      stock: 8,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      desc: 'Next-Gen 4K 120Hz gaming console with custom 1TB ultra-high speed SSD and DualSense haptic feedback controllers.',
      specs: [
        { name: 'CPU & GPU', value: 'x86-64-AMD Zen 2 8-Core | RDNA 2 (10.3 TFLOPS)' },
        { name: 'Storage', value: '1TB Custom High Speed NVMe SSD (5.5 GB/s Read)' },
        { name: 'Video Output', value: 'Supports 4K 120Hz TVs, 8K TVs, VRR (HDMI 2.1)' },
        { name: 'Audio', value: 'Tempest 3D AudioTech' }
      ]
    },
    {
      name: 'Dell XPS 16 Touch Laptop',
      model: 'XPS9640-7988SLV-PUS',
      category: 'Laptops & PCs',
      brand: 'Dell',
      price: 224990,
      originalPrice: 249990,
      discount: 10,
      rating: 4.7,
      reviewCount: 430,
      stock: 6,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      desc: 'Futuristic CNC aluminum design with seamless glass touchpad, 4K+ OLED touch screen, and Intel Core Ultra 7 processor.',
      specs: [
        { name: 'Processor', value: 'Intel Core Ultra 7 155H AI Processor' },
        { name: 'Display', value: '16.3" 4K+ (3840x2400) OLED Touch Display (400 nits)' },
        { name: 'RAM & Storage', value: '32GB LPDDR5X | 1TB M.2 PCIe NVMe SSD' },
        { name: 'GPU', value: 'NVIDIA GeForce RTX 4060 8GB GDDR6' }
      ]
    },
    {
      name: 'Lenovo ThinkPad X1 Carbon Gen 12',
      model: '21KC004UIG',
      category: 'Laptops & PCs',
      brand: 'Lenovo',
      price: 194990,
      originalPrice: 219990,
      discount: 11,
      rating: 4.8,
      reviewCount: 620,
      stock: 4,
      stockStatus: 'LOW_STOCK',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      desc: 'Ultra-lightweight carbon fiber business laptop with MIL-STD-810H durability, 2.8K OLED screen, and legendary TrackPoint keyboard.',
      specs: [
        { name: 'Processor', value: 'Intel Core Ultra 7 165H vPro Processor' },
        { name: 'Weight', value: '1.09 kg Ultra Lightweight Carbon Fiber' },
        { name: 'Display', value: '14.0" 2.8K (2880x1800) OLED 120Hz HDR 500' },
        { name: 'Battery', value: '57Wh Battery with Rapid Charge 80% in 60 mins' }
      ]
    },
    {
      name: 'HP Spectre x360 2-in-1 14" OLED',
      model: '14-eu0000TU',
      category: 'Laptops & PCs',
      brand: 'HP',
      price: 154990,
      originalPrice: 174990,
      discount: 11,
      rating: 4.8,
      reviewCount: 510,
      stock: 9,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=600&auto=format&fit=crop&q=80',
      desc: 'Convertible 360-degree 2-in-1 touchscreen laptop with 9MP AI camera, haptic touchpad, and IMAX Enhanced OLED display.',
      specs: [
        { name: 'Processor', value: 'Intel Core Ultra 7 155H (16 Cores)' },
        { name: 'Display', value: '14.0" 2.8K (2880x1800) 120Hz Variable Refresh OLED Touch' },
        { name: 'Stylus Pen', value: 'HP Rechargeable Tilt Pen Included' },
        { name: 'Audio', value: 'Quad Speakers Tuned by Poly Studio' }
      ]
    },
    {
      name: 'LG 655L Side-by-Side Smart Refrigerator',
      model: 'GL-B257HBPY',
      category: 'Appliances',
      brand: 'LG',
      price: 84990,
      originalPrice: 109990,
      discount: 22,
      rating: 4.7,
      reviewCount: 1420,
      stock: 7,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      desc: 'Smart Inverter Compressor refrigerator with DoorCooling+, Express Freeze, and ThinQ WiFi remote diagnostic control.',
      specs: [
        { name: 'Capacity', value: '655 Liters Side-by-Side' },
        { name: 'Compressor', value: 'Smart Inverter Compressor (10 Year Warranty)' },
        { name: 'Smart Tech', value: 'LG ThinQ WiFi with Smart Diagnosis' },
        { name: 'Energy Rating', value: '5-Star Energy Efficiency' }
      ]
    },
    {
      name: 'Samsung 9kg Front Load Washer Dryer AI',
      model: 'WD90T634DBN/TL',
      category: 'Appliances',
      brand: 'Samsung',
      price: 54990,
      originalPrice: 69990,
      discount: 21,
      rating: 4.8,
      reviewCount: 980,
      stock: 11,
      stockStatus: 'IN_STOCK',
      image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
      desc: 'AI Control washing machine with EcoBubble technology, Auto Dispense, Hygiene Steam, and 1400 RPM spin speed.',
      specs: [
        { name: 'Washing Capacity', value: '9.0 kg Washer / 6.0 kg Dryer' },
        { name: 'Technology', value: 'EcoBubble & AI Control Cycle Memory' },
        { name: 'Motor', value: 'Digital Inverter Motor (20 Year Warranty)' },
        { name: 'Hygiene', value: '99.9% Bacteria Elimination Hygiene Steam' }
      ]
    }
  ];

  for (const p of productsList) {
    const catId = categoryMap[p.category];
    const brandId = brandMap[p.brand];

    const prodRes = await pool.query(
      `INSERT INTO public.products (
        name, brand, category, category_id, brand_id, product_name, model_number, description,
        price, price_inr, original_price, original_price_inr, discount_percentage, rating, review_count,
        stock_quantity, stock_status, image_url, main_image_url, status
       )
       VALUES ($1, $2, $3, $4, $5, $1, $6, $7, $8, $8, $9, $9, $10, $11, $12, $13, $14, $15, $15, 'ACTIVE')
       RETURNING id, product_name`,
      [
        p.name, p.brand, p.category, catId, brandId, p.model, p.desc,
        p.price, p.originalPrice, p.discount, p.rating, p.reviewCount,
        p.stock, p.stockStatus, p.image
      ]
    );

    const productId = prodRes.rows[0].id;

    // Seed Specifications
    for (const spec of p.specs) {
      await pool.query(
        `INSERT INTO public.product_specifications (product_id, specification_name, specification_value)
         VALUES ($1, $2, $3)`,
        [productId, spec.name, spec.value]
      );
    }

    // Seed Gallery Images
    await pool.query(
      `INSERT INTO public.product_images (product_id, image_url, image_type, display_order)
       VALUES ($1, $2, 'MAIN', 1)`,
      [productId, p.image]
    );

    // Mirror to tbl_products for admin backward compatibility
    await pool.query(
      `INSERT INTO ${schemaName}.tbl_products (
        product_id, name, brand, category, price, original_price, rating, review_count, decision_score, stock_quantity, reorder_threshold, status, image_url, badge, specs, pros, cons
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 95, $9, 5, 'ACTIVE', $10, 'OptiBuy Verified', $11, $12, $13)
       ON CONFLICT (product_id) DO UPDATE
       SET price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity`,
      [
        productId, p.name, p.brand, p.category, p.price, p.originalPrice, p.rating, p.reviewCount,
        p.stock, p.image, JSON.stringify(p.specs), JSON.stringify(['High Performance', 'Premium Build']), JSON.stringify(['High Entry Price'])
      ]
    );
  }

  console.log(`[PostgreSQL Seed] 15 realistic products seeded in INR (₹) across 7 categories and 9 brands.`);
}
