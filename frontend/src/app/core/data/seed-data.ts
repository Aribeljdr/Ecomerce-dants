import { SavedAddress } from '../models/auth.model';

export interface SeedCategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
}

export interface SeedProduct {
  _id: string;
  name: string;
  slug: string;
  categorySlug: string;
  category: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  description: string;
  specs: Record<string, string>;
  tags: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface SeedUser {
  _id: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: 'admin' | 'user';
  savedAddress: SavedAddress | null;
  createdAt: string;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  { _id: '8f25e4d4-ab5c-4473-9252-3055a274e340', name: 'Procesadores',      slug: 'procesadores',      order: 1  },
  { _id: '9f5a0dcf-2b1c-453d-bb6a-a921a5df4f50', name: 'Tarjetas Gráficas', slug: 'tarjetas-graficas',  order: 2  },
  { _id: '0189aabe-23ef-4ff5-a5a0-450ca03f0c7b', name: 'Memoria RAM',        slug: 'memoria-ram',        order: 3  },
  { _id: '5aabba81-3060-4bae-8f03-b3a845a96afd', name: 'Tarjetas Madre',     slug: 'tarjetas-madre',     order: 4  },
  { _id: 'c117a8aa-f822-4bcc-9a48-8d42ddd85c25', name: 'Almacenamiento',     slug: 'almacenamiento',     order: 5  },
  { _id: '64ada383-646b-4ffa-b70a-19bbdb0a0187', name: 'Fuentes de Poder',   slug: 'fuentes-de-poder',   order: 6  },
  { _id: '4e27f703-efd0-43ac-9930-29775a1492b0', name: 'Refrigeración',      slug: 'refrigeracion',      order: 7  },
  { _id: '06ea5725-41b9-4818-907f-9f6ddf5b6508', name: 'Cases',              slug: 'cases',              order: 8  },
  { _id: '4147be81-ac43-4b6e-8e76-9709b9a235b8', name: 'Monitores',          slug: 'monitores',          order: 9  },
  { _id: '89b0e7a2-8751-4d45-a530-7f06ade4f265', name: 'Teclados',           slug: 'teclados',           order: 10 },
  { _id: '917e87e7-a828-41fe-b896-e006c8b9293b', name: 'Mouse',              slug: 'mouse',              order: 11 },
];

const NOW = new Date().toISOString();

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    _id: '21434b62-78ba-4c9c-9f02-9ca263f1c02c',
    name: 'AMD Ryzen 5 7600X 4.7GHz',
    slug: 'amd-ryzen-5-7600x-47ghz',
    categorySlug: 'procesadores',
    category: '8f25e4d4-ab5c-4473-9252-3055a274e340',
    brand: 'AMD', price: 1100, compareAtPrice: 1250, stock: 20,
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000'],
    description: 'Procesador de última generación con arquitectura Zen 4. Ideal para gaming competitivo y multitarea exigente.',
    specs: { 'Núcleos': '6', 'Hilos': '12', 'Base': '4.7 GHz', 'Boost': '5.3 GHz', 'Socket': 'AM5', 'TDP': '105W', 'Caché L3': '32MB' },
    tags: ['gaming', 'amd', 'am5', 'zen4'],
    featured: true, rating: 4.8, reviewCount: 315, isActive: true, createdAt: NOW,
  },
  {
    _id: 'adb4c383-d79b-4823-ab4e-58b8851ef7d8',
    name: 'Intel Core i5-13600K 3.5GHz',
    slug: 'intel-core-i5-13600k-35ghz',
    categorySlug: 'procesadores',
    category: '8f25e4d4-ab5c-4473-9252-3055a274e340',
    brand: 'Intel', price: 1350, compareAtPrice: 1490, stock: 18,
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000'],
    description: 'Procesador híbrido con 14 núcleos (6P+8E). Excelente para gaming y streaming simultáneo.',
    specs: { 'Núcleos': '14 (6P+8E)', 'Hilos': '20', 'Base': '3.5 GHz', 'Boost': '5.1 GHz', 'Socket': 'LGA1700', 'TDP': '125W', 'Caché L3': '24MB' },
    tags: ['gaming', 'intel', 'lga1700', 'productivity'],
    featured: false, rating: 4.7, reviewCount: 201, isActive: true, createdAt: NOW,
  },
  {
    _id: 'c1ab2455-a908-4e5e-9c00-dc42fb41d254',
    name: 'NVIDIA GeForce RTX 4060 8GB GDDR6',
    slug: 'nvidia-geforce-rtx-4060-8gb-gddr6',
    categorySlug: 'tarjetas-graficas',
    category: '9f5a0dcf-2b1c-453d-bb6a-a921a5df4f50',
    brand: 'NVIDIA', price: 1650, compareAtPrice: 1850, stock: 8,
    images: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=1000'],
    description: 'Rendimiento 1080p excepcional con DLSS 3 y trazado de rayos. La GPU mid-range definitiva.',
    specs: { 'VRAM': '8GB GDDR6', 'TDP': '115W', 'DLSS': '3.0', 'Ray Tracing': 'Sí', 'Interfaz': 'PCIe 4.0' },
    tags: ['gaming', '1080p', 'nvidia', 'ray-tracing'],
    featured: true, rating: 4.7, reviewCount: 142, isActive: true, createdAt: NOW,
  },
  {
    _id: 'd09b8592-7669-42b9-a68c-3744d8e73ccc',
    name: 'AMD Radeon RX 7600 8GB GDDR6',
    slug: 'amd-radeon-rx-7600-8gb-gddr6',
    categorySlug: 'tarjetas-graficas',
    category: '9f5a0dcf-2b1c-453d-bb6a-a921a5df4f50',
    brand: 'AMD', price: 1350, stock: 10,
    images: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=1000'],
    description: 'Gran relación precio-rendimiento para gaming en 1080p con AMD FSR 3.',
    specs: { 'VRAM': '8GB GDDR6', 'TDP': '165W', 'FSR': '3.0', 'Interfaz': 'PCIe 4.0' },
    tags: ['gaming', '1080p', 'amd', 'value'],
    featured: true, rating: 4.5, reviewCount: 98, isActive: true, createdAt: NOW,
  },
  {
    _id: '5a2cd286-7dee-4dbb-84ba-fb9e380b7305',
    name: 'Memoria RAM 32GB (2x16GB) DDR5 6000MHz',
    slug: 'memoria-ram-32gb-2x16gb-ddr5-6000mhz',
    categorySlug: 'memoria-ram',
    category: '0189aabe-23ef-4ff5-a5a0-450ca03f0c7b',
    brand: 'Corsair', price: 450, stock: 25,
    images: ['https://images.unsplash.com/photo-1562976540-1502f7592306?q=80&w=1000'],
    description: 'Kit de memorias DDR5 de alta velocidad con disipador de aluminio. Optimizado para AM5 e Intel 13th Gen.',
    specs: { 'Capacidad': '32GB (2x16GB)', 'Tipo': 'DDR5', 'Velocidad': '6000MHz', 'Latencia': 'CL36', 'Voltaje': '1.35V', 'XMP/EXPO': 'Sí' },
    tags: ['ddr5', 'gaming', 'corsair', 'high-speed'],
    featured: true, rating: 4.9, reviewCount: 87, isActive: true, createdAt: NOW,
  },
  {
    _id: 'fd110d1a-ce85-405c-a249-7ae36111f8fe',
    name: 'Motherboard ATX B650 AM5',
    slug: 'motherboard-atx-b650-am5',
    categorySlug: 'tarjetas-madre',
    category: '5aabba81-3060-4bae-8f03-b3a845a96afd',
    brand: 'ASUS', price: 850, stock: 12,
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000'],
    description: 'Placa base ATX con soporte para memorias DDR5 y PCIe 5.0. Compatible con procesadores AMD Ryzen 7000.',
    specs: { 'Socket': 'AM5', 'Chipset': 'B650', 'Form Factor': 'ATX', 'DDR5': 'Sí', 'PCIe 5.0': 'Sí', 'M.2 slots': '4' },
    tags: ['am5', 'amd', 'ddr5', 'atx'],
    featured: false, rating: 4.6, reviewCount: 73, isActive: true, createdAt: NOW,
  },
  {
    _id: 'a577d580-db1b-4b08-b30c-ab1bb78973d4',
    name: 'Samsung 990 Pro NVMe SSD 1TB PCIe 4.0',
    slug: 'samsung-990-pro-nvme-ssd-1tb-pcie-40',
    categorySlug: 'almacenamiento',
    category: 'c117a8aa-f822-4bcc-9a48-8d42ddd85c25',
    brand: 'Samsung', price: 320, compareAtPrice: 420, stock: 50,
    images: ['https://images.unsplash.com/photo-1628557044797-f21a177c37ec?q=80&w=1000'],
    description: 'SSD NVMe con velocidades de lectura de hasta 7450 MB/s. El estándar de la industria.',
    specs: { 'Capacidad': '1TB', 'Interfaz': 'PCIe 4.0 x4', 'Lectura': '7450 MB/s', 'Escritura': '6900 MB/s', 'Factor': 'M.2 2280', 'DRAM': 'Sí' },
    tags: ['nvme', 'pcie4', 'samsung', 'fast'],
    featured: true, rating: 4.8, reviewCount: 423, isActive: true, createdAt: NOW,
  },
  {
    _id: 'a7112529-6d43-46ba-bf84-4be113deb5c5',
    name: 'Fuente de Poder 750W 80+ Gold Modular',
    slug: 'fuente-de-poder-750w-80-gold-modular',
    categorySlug: 'fuentes-de-poder',
    category: '64ada383-646b-4ffa-b70a-19bbdb0a0187',
    brand: 'Corsair', price: 480, stock: 15,
    images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1000'],
    description: 'Eficiencia energética certificada 80+ Gold con cableado 100% modular para un build limpio.',
    specs: { 'Potencia': '750W', 'Certificación': '80+ Gold', 'Modular': '100%', 'Ventilador': '135mm', 'Protecciones': 'OVP, OCP, SCP' },
    tags: ['psu', 'gold', 'modular', 'corsair'],
    featured: false, rating: 4.7, reviewCount: 156, isActive: true, createdAt: NOW,
  },
  {
    _id: '5601ee97-38bd-4abb-a838-4fb8b179603c',
    name: 'Refrigeración Líquida AIO 240mm RGB',
    slug: 'refrigeracion-liquida-aio-240mm-rgb',
    categorySlug: 'refrigeracion',
    category: '4e27f703-efd0-43ac-9930-29775a1492b0',
    brand: 'be quiet!', price: 420, stock: 18,
    images: ['https://images.unsplash.com/photo-1600456899121-68eda5705257?q=80&w=1000'],
    description: 'Enfriamiento líquido todo en uno con radiador de 240mm. Compatible con LGA1700 y AM5.',
    specs: { 'Radiador': '240mm', 'TDP máx': '220W', 'Bombeo': '2800 RPM', 'Fans': '2x 120mm RGB', 'Compatibilidad': 'AM5, AM4, LGA1700' },
    tags: ['aio', 'liquid-cooling', 'rgb', '240mm'],
    featured: false, rating: 4.6, reviewCount: 94, isActive: true, createdAt: NOW,
  },
  {
    _id: '93b64846-ea5d-422b-9fab-a873192be6cc',
    name: 'Case Mid Tower Cristal Templado Mesh',
    slug: 'case-mid-tower-cristal-templado-mesh',
    categorySlug: 'cases',
    category: '06ea5725-41b9-4818-907f-9f6ddf5b6508',
    brand: 'Lian Li', price: 380, stock: 10,
    images: ['https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1000'],
    description: 'Gabinete Mid Tower con panel frontal mesh para máximo flujo de aire y panel lateral de cristal templado.',
    specs: { 'Form Factor': 'Mid Tower', 'Placa': 'ATX, mATX, ITX', 'Fans incluidos': '3x 120mm', 'Panel': 'Cristal templado', 'USB-C': 'Sí' },
    tags: ['case', 'mid-tower', 'mesh', 'cristal'],
    featured: true, rating: 4.8, reviewCount: 211, isActive: true, createdAt: NOW,
  },
  {
    _id: 'a2c25275-e66d-4e5c-aa11-255ad1894533',
    name: "Monitor Gamer 27'' QHD 144Hz IPS",
    slug: 'monitor-gamer-27-qhd-144hz-ips',
    categorySlug: 'monitores',
    category: '4147be81-ac43-4b6e-8e76-9709b9a235b8',
    brand: 'LG', price: 1250, compareAtPrice: 1450, stock: 15,
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000'],
    description: 'Monitor sin bordes con panel IPS, resolución QHD 2560x1440 y 144Hz. Ideal para gaming y diseño.',
    specs: { 'Tamaño': '27 pulgadas', 'Resolución': '2560x1440 (QHD)', 'Panel': 'IPS', 'Refresco': '144Hz', 'Tiempo respuesta': '1ms GtG', 'HDR': 'HDR400' },
    tags: ['monitor', 'qhd', '144hz', 'ips', 'gaming'],
    featured: true, rating: 4.8, reviewCount: 302, isActive: true, createdAt: NOW,
  },
  {
    _id: '9f6bc514-66e9-4dd3-a605-8e98ade0477f',
    name: 'Teclado Mecánico RGB TKL Switch Red',
    slug: 'teclado-mecanico-rgb-tkl-switch-red',
    categorySlug: 'teclados',
    category: '89b0e7a2-8751-4d45-a530-7f06ade4f265',
    brand: 'Keychron', price: 350, stock: 30,
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000'],
    description: 'Teclado formato TKL (80%) con switches lineales Cherry MX Red. Silencioso y preciso.',
    specs: { 'Layout': 'TKL (80%)', 'Switches': 'Cherry MX Red', 'Retroiluminación': 'RGB por tecla', 'Conexión': 'USB-C + Bluetooth', 'Material': 'Aluminio' },
    tags: ['teclado', 'mecanico', 'tkl', 'rgb', 'cherry-mx'],
    featured: false, rating: 4.7, reviewCount: 189, isActive: true, createdAt: NOW,
  },
  {
    _id: '1694610d-de54-4b2f-8c9c-21161ca6925a',
    name: 'Mouse Gamer Ultraligero 26K DPI',
    slug: 'mouse-gamer-ultraligero-26k-dpi',
    categorySlug: 'mouse',
    category: '917e87e7-a828-41fe-b896-e006c8b9293b',
    brand: 'Logitech', price: 180, stock: 45,
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000'],
    description: 'Mouse ultraligero de 60g con sensor óptico HERO 26K. Hasta 70 horas de batería en modo inalámbrico.',
    specs: { 'Sensor': 'HERO 26K', 'DPI': '100 - 26,000', 'Peso': '60g', 'Botones': '6 programables', 'Conexión': 'USB + 2.4GHz', 'Batería': '70 horas' },
    tags: ['mouse', 'gaming', 'ultraligero', 'logitech', 'inalambrico'],
    featured: true, rating: 4.9, reviewCount: 534, isActive: true, createdAt: NOW,
  },
];

export const SEED_USERS: SeedUser[] = [
  {
    _id: '189b5589-1f25-4f40-8674-d69fda521a7c',
    name: 'Admin', lastName: '', dni: '',
    email: 'admin@pcparts.com',
    passwordHash: '77d213eccad2f274546d6340d0618455875fa6996c60142304ebe7b5c6985fc7',
    passwordSalt: 'ec653483d0286046eda2a61a2423db88',
    role: 'admin', savedAddress: null, createdAt: NOW,
  },
  {
    _id: '3d5fa22d-721f-4cdc-81b6-84063cfd5072',
    name: 'Admin Dat', lastName: '', dni: '',
    email: 'admin@dat.com',
    passwordHash: 'e29de0ee39e0289d7eae4e860c6694a08cf8bf15e66ba216277a1508f9020f48',
    passwordSalt: 'b8664e00e46d1d86a9128def75941677',
    role: 'admin', savedAddress: null, createdAt: NOW,
  },
  {
    _id: 'cde24186-c4a6-48cb-81cf-801e0109d6b2',
    name: 'Cliente', lastName: '', dni: '',
    email: 'cli@dat.com',
    passwordHash: '6ca2ed8446e49350e0414d8f56b588604f8beaabade428eb2d06fce866d00fae',
    passwordSalt: '53925b02ea41e433fd5090419e713890',
    role: 'user', savedAddress: null, createdAt: NOW,
  },
];
