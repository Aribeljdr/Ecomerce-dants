require('dotenv').config();

const mongoose = require('mongoose');
const slugify  = require('slugify');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pcparts';

async function seedDB() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Conectado:', mongoose.connection.host);

    const Category = require('./models/Category');
    const Product   = require('./models/Product');
    const User       = require('./models/User');

    console.log('Limpiando colecciones...');
    await Promise.all([Category.deleteMany(), Product.deleteMany(), User.deleteMany()]);

    // ─── Categorías ──────────────────────────────────────────────────────────
    const cats = await Category.insertMany([
      // Componentes principales
      { name: 'Procesadores',       slug: 'procesadores',       order: 1 },
      { name: 'Tarjetas Gráficas',  slug: 'tarjetas-graficas',  order: 2 },
      { name: 'Memoria RAM',        slug: 'memoria-ram',         order: 3 },
      { name: 'Tarjetas Madre',     slug: 'tarjetas-madre',      order: 4 },
      { name: 'Almacenamiento',     slug: 'almacenamiento',      order: 5 },
      { name: 'Fuentes de Poder',   slug: 'fuentes-de-poder',    order: 6 },
      { name: 'Refrigeración',      slug: 'refrigeracion',       order: 7 },
      { name: 'Cases',              slug: 'cases',               order: 8 },
      // Periféricos
      { name: 'Monitores',          slug: 'monitores',           order: 9  },
      { name: 'Teclados',           slug: 'teclados',            order: 10 },
      { name: 'Mouse',              slug: 'mouse',               order: 11 },
    ]);

    // Helper para buscar categoría por slug
    const cat = (slug) => cats.find(c => c.slug === slug)._id;

    // ─── Usuarios ────────────────────────────────────────────────────────────
    // insertMany no dispara pre-save → hasheamos manualmente
    const bcrypt = require('bcryptjs');
    const hash = (pwd) => bcrypt.hash(pwd, 12);

    await User.collection.insertMany([
      { name: 'Admin',      email: 'admin@pcparts.com', password: await hash('admin123'), role: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Admin Dat',  email: 'admin@dat.com',     password: await hash('admin123'), role: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Cliente',    email: 'cli@dat.com',        password: await hash('cli123'),   role: 'user',  createdAt: new Date(), updatedAt: new Date() },
    ]);

    // ─── Productos ────────────────────────────────────────────────────────────
    const products = [

      // ── PROCESADORES ─────────────────────────────────────────────────────
      {
        name: 'AMD Ryzen 5 7600X 4.7GHz',
        category: cat('procesadores'),
        brand: 'AMD',
        price: 1100,
        compareAtPrice: 1250,
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000',
        ],
        description: 'Procesador de última generación con arquitectura Zen 4. Ideal para gaming competitivo y multitarea exigente.',
        specs: { 'Núcleos': '6', 'Hilos': '12', 'Base': '4.7 GHz', 'Boost': '5.3 GHz', 'Socket': 'AM5', 'TDP': '105W', 'Caché L3': '32MB' },
        tags: ['gaming', 'amd', 'am5', 'zen4'],
        featured: true,
        rating: 4.8,
        reviewCount: 315,
      },
      {
        name: 'Intel Core i5-13600K 3.5GHz',
        category: cat('procesadores'),
        brand: 'Intel',
        price: 1350,
        compareAtPrice: 1490,
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000',
        ],
        description: 'Procesador híbrido con 14 núcleos (6P+8E). Excelente para gaming y streaming simultáneo.',
        specs: { 'Núcleos': '14 (6P+8E)', 'Hilos': '20', 'Base': '3.5 GHz', 'Boost': '5.1 GHz', 'Socket': 'LGA1700', 'TDP': '125W', 'Caché L3': '24MB' },
        tags: ['gaming', 'intel', 'lga1700', 'productivity'],
        featured: false,
        rating: 4.7,
        reviewCount: 201,
      },

      // ── TARJETAS GRÁFICAS ─────────────────────────────────────────────────
      {
        name: 'NVIDIA GeForce RTX 4060 8GB GDDR6',
        category: cat('tarjetas-graficas'),
        brand: 'NVIDIA',
        price: 1650,
        compareAtPrice: 1850,
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=1000',
        ],
        description: 'Rendimiento 1080p excepcional con DLSS 3 y trazado de rayos. La GPU mid-range definitiva.',
        specs: { 'VRAM': '8GB GDDR6', 'TDP': '115W', 'DLSS': '3.0', 'Ray Tracing': 'Sí', 'Interfaz': 'PCIe 4.0' },
        tags: ['gaming', '1080p', 'nvidia', 'ray-tracing'],
        featured: true,
        rating: 4.7,
        reviewCount: 142,
      },
      {
        name: 'AMD Radeon RX 7600 8GB GDDR6',
        category: cat('tarjetas-graficas'),
        brand: 'AMD',
        price: 1350,
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=1000',
        ],
        description: 'Gran relación precio-rendimiento para gaming en 1080p con AMD FSR 3.',
        specs: { 'VRAM': '8GB GDDR6', 'TDP': '165W', 'FSR': '3.0', 'Interfaz': 'PCIe 4.0' },
        tags: ['gaming', '1080p', 'amd', 'value'],
        featured: true,
        rating: 4.5,
        reviewCount: 98,
      },

      // ── MEMORIA RAM ───────────────────────────────────────────────────────
      {
        name: 'Memoria RAM 32GB (2x16GB) DDR5 6000MHz',
        category: cat('memoria-ram'),
        brand: 'Corsair',
        price: 450,
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1562976540-1502f7592306?q=80&w=1000',
        ],
        description: 'Kit de memorias DDR5 de alta velocidad con disipador de aluminio. Optimizado para AM5 e Intel 13th Gen.',
        specs: { 'Capacidad': '32GB (2x16GB)', 'Tipo': 'DDR5', 'Velocidad': '6000MHz', 'Latencia': 'CL36', 'Voltaje': '1.35V', 'XMP/EXPO': 'Sí' },
        tags: ['ddr5', 'gaming', 'corsair', 'high-speed'],
        featured: true,
        rating: 4.9,
        reviewCount: 87,
      },

      // ── TARJETAS MADRE ────────────────────────────────────────────────────
      {
        name: 'Motherboard ATX B650 AM5',
        category: cat('tarjetas-madre'),
        brand: 'ASUS',
        price: 850,
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000',
        ],
        description: 'Placa base ATX con soporte para memorias DDR5 y PCIe 5.0. Compatible con procesadores AMD Ryzen 7000.',
        specs: { 'Socket': 'AM5', 'Chipset': 'B650', 'Form Factor': 'ATX', 'DDR5': 'Sí', 'PCIe 5.0': 'Sí', 'M.2 slots': '4' },
        tags: ['am5', 'amd', 'ddr5', 'atx'],
        featured: false,
        rating: 4.6,
        reviewCount: 73,
      },

      // ── ALMACENAMIENTO ────────────────────────────────────────────────────
      {
        name: 'Samsung 990 Pro NVMe SSD 1TB PCIe 4.0',
        category: cat('almacenamiento'),
        brand: 'Samsung',
        price: 320,
        compareAtPrice: 420,
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?q=80&w=1000',
        ],
        description: 'SSD NVMe con velocidades de lectura de hasta 7450 MB/s. El estándar de la industria.',
        specs: { 'Capacidad': '1TB', 'Interfaz': 'PCIe 4.0 x4', 'Lectura': '7450 MB/s', 'Escritura': '6900 MB/s', 'Factor': 'M.2 2280', 'DRAM': 'Sí' },
        tags: ['nvme', 'pcie4', 'samsung', 'fast'],
        featured: true,
        rating: 4.8,
        reviewCount: 423,
      },

      // ── FUENTES DE PODER ──────────────────────────────────────────────────
      {
        name: 'Fuente de Poder 750W 80+ Gold Modular',
        category: cat('fuentes-de-poder'),
        brand: 'Corsair',
        price: 480,
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1000',
        ],
        description: 'Eficiencia energética certificada 80+ Gold con cableado 100% modular para un build limpio.',
        specs: { 'Potencia': '750W', 'Certificación': '80+ Gold', 'Modular': '100%', 'Ventilador': '135mm', 'Protecciones': 'OVP, OCP, SCP' },
        tags: ['psu', 'gold', 'modular', 'corsair'],
        featured: false,
        rating: 4.7,
        reviewCount: 156,
      },

      // ── REFRIGERACIÓN ─────────────────────────────────────────────────────
      {
        name: 'Refrigeración Líquida AIO 240mm RGB',
        category: cat('refrigeracion'),
        brand: 'be quiet!',
        price: 420,
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1600456899121-68eda5705257?q=80&w=1000',
        ],
        description: 'Enfriamiento líquido todo en uno con radiador de 240mm. Compatible con LGA1700 y AM5.',
        specs: { 'Radiador': '240mm', 'TDP máx': '220W', 'Bombeo': '2800 RPM', 'Fans': '2x 120mm RGB', 'Compatibilidad': 'AM5, AM4, LGA1700' },
        tags: ['aio', 'liquid-cooling', 'rgb', '240mm'],
        featured: false,
        rating: 4.6,
        reviewCount: 94,
      },

      // ── CASES ─────────────────────────────────────────────────────────────
      {
        name: 'Case Mid Tower Cristal Templado Mesh',
        category: cat('cases'),
        brand: 'Lian Li',
        price: 380,
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1000',
        ],
        description: 'Gabinete Mid Tower con panel frontal mesh para máximo flujo de aire y panel lateral de cristal templado.',
        specs: { 'Form Factor': 'Mid Tower', 'Placa': 'ATX, mATX, ITX', 'Fans incluidos': '3x 120mm', 'Panel': 'Cristal templado', 'USB-C': 'Sí' },
        tags: ['case', 'mid-tower', 'mesh', 'cristal'],
        featured: true,
        rating: 4.8,
        reviewCount: 211,
      },

      // ── MONITORES ─────────────────────────────────────────────────────────
      {
        name: "Monitor Gamer 27'' QHD 144Hz IPS",
        category: cat('monitores'),
        brand: 'LG',
        price: 1250,
        compareAtPrice: 1450,
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000',
        ],
        description: 'Monitor sin bordes con panel IPS, resolución QHD 2560x1440 y 144Hz. Ideal para gaming y diseño.',
        specs: { 'Tamaño': '27 pulgadas', 'Resolución': '2560x1440 (QHD)', 'Panel': 'IPS', 'Refresco': '144Hz', 'Tiempo respuesta': '1ms GtG', 'HDR': 'HDR400' },
        tags: ['monitor', 'qhd', '144hz', 'ips', 'gaming'],
        featured: true,
        rating: 4.8,
        reviewCount: 302,
      },

      // ── TECLADOS ──────────────────────────────────────────────────────────
      {
        name: 'Teclado Mecánico RGB TKL Switch Red',
        category: cat('teclados'),
        brand: 'Keychron',
        price: 350,
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000',
        ],
        description: 'Teclado formato TKL (80%) con switches lineales Cherry MX Red. Silencioso y preciso.',
        specs: { 'Layout': 'TKL (80%)', 'Switches': 'Cherry MX Red', 'Retroiluminación': 'RGB por tecla', 'Conexión': 'USB-C + Bluetooth', 'Material': 'Aluminio' },
        tags: ['teclado', 'mecanico', 'tkl', 'rgb', 'cherry-mx'],
        featured: false,
        rating: 4.7,
        reviewCount: 189,
      },

      // ── MOUSE ─────────────────────────────────────────────────────────────
      {
        name: 'Mouse Gamer Ultraligero 26K DPI',
        category: cat('mouse'),
        brand: 'Logitech',
        price: 180,
        stock: 45,
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000',
        ],
        description: 'Mouse ultraligero de 60g con sensor óptico HERO 26K. Hasta 70 horas de batería en modo inalámbrico.',
        specs: { 'Sensor': 'HERO 26K', 'DPI': '100 - 26,000', 'Peso': '60g', 'Botones': '6 programables', 'Conexión': 'USB + 2.4GHz', 'Batería': '70 horas' },
        tags: ['mouse', 'gaming', 'ultraligero', 'logitech', 'inalambrico'],
        featured: true,
        rating: 4.9,
        reviewCount: 534,
      },
    ];

    // insertMany no dispara pre-save hooks → generamos slugs aquí
    const productsWithSlugs = products.map(p => ({
      ...p,
      slug: slugify(p.name, { lower: true, strict: true }),
    }));

    await Product.insertMany(productsWithSlugs);

    console.log('');
    console.log('Seed completado exitosamente:');
    console.log(`  Categorias: ${cats.length}`);
    console.log(`  Productos:  ${products.length}`);
    console.log('  Usuarios:');
    console.log('    admin@pcparts.com / admin123  (admin)');
    console.log('    admin@dat.com     / admin123  (admin)');
    console.log('    cli@dat.com       / cli123    (usuario)');
    console.log('');

    await mongoose.connection.close();
    process.exit(0);

  } catch (err) {
    console.error('Error en el seed:', err.message);
    process.exit(1);
  }
}

seedDB();
