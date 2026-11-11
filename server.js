const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1'; // Compliant localhost binding

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Categories
const categories = [
  { id: 'fiction', name: 'Fiction & Literature', icon: 'book-open', count: 6, color: 'from-amber-500 to-rose-500' },
  { id: 'scifi', name: 'Sci-Fi & Fantasy', icon: 'sparkles', count: 5, color: 'from-purple-500 to-indigo-600' },
  { id: 'tech', name: 'Technology & AI', icon: 'cpu', count: 5, color: 'from-cyan-500 to-blue-600' },
  { id: 'business', name: 'Business & Leadership', icon: 'trending-up', count: 4, color: 'from-emerald-500 to-teal-600' },
  { id: 'mystery', name: 'Mystery & Thriller', icon: 'shield-alert', count: 4, color: 'from-red-500 to-amber-600' },
  { id: 'biography', name: 'Biography & Memoir', icon: 'user-check', count: 3, color: 'from-blue-500 to-violet-600' }
];

// Brands / Publishers
const brands = [
  { id: 'penguin', name: 'Penguin Random House', tagline: 'World-renowned literature & bestsellers', logo: 'PRH' },
  { id: 'harper', name: 'HarperCollins Publishers', tagline: 'Award-winning fiction & non-fiction', logo: 'HC' },
  { id: 'oreilly', name: "O'Reilly Media", tagline: 'Leading tech, coding & AI publications', logo: 'ORM' },
  { id: 'simon', name: 'Simon & Schuster', tagline: 'Inspiring memoirs, thrillers & classics', logo: 'S&S' },
  { id: 'bloomsbury', name: 'Bloomsbury Publishing', tagline: 'Home of magical fantasy and literary art', logo: 'BP' },
  { id: 'mitpress', name: 'MIT Press', tagline: 'Cutting-edge science, computing & economics', logo: 'MIT' }
];

// Books database
let books = [
  {
    id: 'book-1',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'tech',
    brand: 'oreilly',
    price: 44.99,
    originalPrice: 54.99,
    discount: 18,
    rating: 4.9,
    reviews: 1420,
    isbn: '978-1449373320',
    pages: 616,
    year: 2017,
    format: 'Paperback',
    stock: 24,
    deliveryDays: 2,
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    description: 'The definitive guide to the system architectures of data systems. Learn how to navigate the diverse landscape of databases, stream processors, and distributed consensus.',
    tags: ['Architecture', 'Distributed Systems', 'Databases', 'Backend'],
    relatedIds: ['book-2', 'book-3', 'book-4']
  },
  {
    id: 'book-2',
    title: 'Generative AI on AWS & Cloud Systems',
    author: 'Chris Fregly & Antje Barth',
    category: 'tech',
    brand: 'oreilly',
    price: 49.99,
    originalPrice: 59.99,
    discount: 17,
    rating: 4.8,
    reviews: 840,
    isbn: '978-1098159221',
    pages: 480,
    year: 2024,
    format: 'Hardcover',
    stock: 18,
    deliveryDays: 3,
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: 'A comprehensive roadmap for architecting, fine-tuning, and deploying modern Large Language Models and Foundation Models into enterprise production.',
    tags: ['AI', 'LLM', 'Cloud', 'Machine Learning'],
    relatedIds: ['book-1', 'book-3', 'book-16']
  },
  {
    id: 'book-3',
    title: 'Deep Learning with Python (2nd Edition)',
    author: 'François Chollet',
    category: 'tech',
    brand: 'mitpress',
    price: 39.99,
    originalPrice: 49.99,
    discount: 20,
    rating: 4.9,
    reviews: 1120,
    isbn: '978-1617296864',
    pages: 504,
    year: 2022,
    format: 'Paperback',
    stock: 15,
    deliveryDays: 2,
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    description: 'Written by Keras creator François Chollet, this book introduces deep learning using Python and Keras with intuitive explanations and practical examples.',
    tags: ['Python', 'Deep Learning', 'Neural Networks', 'AI'],
    relatedIds: ['book-1', 'book-2', 'book-16']
  },
  {
    id: 'book-4',
    title: 'Clean Code: A Handbook of Agile Craftsmanship',
    author: 'Robert C. Martin',
    category: 'tech',
    brand: 'penguin',
    price: 37.50,
    originalPrice: 45.00,
    discount: 16,
    rating: 4.7,
    reviews: 3200,
    isbn: '978-0132350884',
    pages: 464,
    year: 2008,
    format: 'Paperback',
    stock: 35,
    deliveryDays: 1,
    cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e37229?auto=format&fit=crop&w=600&q=80',
    description: 'Even bad code can function. But if code is not clean, it can bring a development organization to its knees. Master the values of high-quality software craftsmanship.',
    tags: ['Clean Code', 'Refactoring', 'Agile', 'Best Practices'],
    relatedIds: ['book-1', 'book-12']
  },
  {
    id: 'book-5',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    category: 'fiction',
    brand: 'penguin',
    price: 18.99,
    originalPrice: 24.99,
    discount: 24,
    rating: 4.8,
    reviews: 4890,
    isbn: '978-0525559474',
    pages: 304,
    year: 2020,
    format: 'Hardcover',
    stock: 42,
    deliveryDays: 2,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    description: 'Between life and death there is a library with infinite shelves of books, where every book provides a chance to try another life you could have lived.',
    tags: ['Bestseller', 'Philosophical', 'Magical Realism'],
    relatedIds: ['book-6', 'book-7', 'book-8']
  },
  {
    id: 'book-6',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    category: 'fiction',
    brand: 'penguin',
    price: 17.50,
    originalPrice: 22.00,
    discount: 20,
    rating: 4.6,
    reviews: 2150,
    isbn: '978-0593318171',
    pages: 320,
    year: 2021,
    format: 'Paperback',
    stock: 28,
    deliveryDays: 2,
    cover: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80',
    description: 'From the Nobel Laureate Kazuo Ishiguro, a thrilling book that looks at our rapidly-changing modern world through the eyes of an unforgettable narrator.',
    tags: ['Literary', 'Nobel Prize', 'Future of AI'],
    relatedIds: ['book-5', 'book-8', 'book-9']
  },
  {
    id: 'book-7',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    category: 'fiction',
    brand: 'harper',
    price: 19.99,
    originalPrice: 28.00,
    discount: 28,
    rating: 4.9,
    reviews: 3820,
    isbn: '978-0593321201',
    pages: 416,
    year: 2022,
    format: 'Hardcover',
    stock: 31,
    deliveryDays: 2,
    cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    description: 'An exhilarating novel about two friends often in love, but never lovers, who come together as creative partners in the world of video game design.',
    tags: ['Gaming', 'Friendship', 'Art', 'Novel'],
    relatedIds: ['book-5', 'book-6', 'book-12']
  },
  {
    id: 'book-8',
    title: 'Dune: Deluxe Edition',
    author: 'Frank Herbert',
    category: 'scifi',
    brand: 'penguin',
    price: 26.99,
    originalPrice: 35.00,
    discount: 23,
    rating: 4.9,
    reviews: 5600,
    isbn: '978-0143111580',
    pages: 688,
    year: 2019,
    format: 'Hardcover Deluxe',
    stock: 50,
    deliveryDays: 1,
    cover: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is "spice".',
    tags: ['Sci-Fi Masterpiece', 'Epic', 'Space Opera'],
    relatedIds: ['book-9', 'book-10', 'book-11']
  },
  {
    id: 'book-9',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    category: 'scifi',
    brand: 'simon',
    price: 21.99,
    originalPrice: 28.99,
    discount: 24,
    rating: 4.9,
    reviews: 6200,
    isbn: '978-0593135204',
    pages: 496,
    year: 2021,
    format: 'Hardcover',
    stock: 38,
    deliveryDays: 2,
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission to save humanity from an extinction-level threat. And he just woke up with amnesia.',
    tags: ['Hard Sci-Fi', 'Space', 'Humor', 'Survival'],
    relatedIds: ['book-8', 'book-10', 'book-1']
  },
  {
    id: 'book-10',
    title: 'The Three-Body Problem',
    author: 'Cixin Liu',
    category: 'scifi',
    brand: 'bloomsbury',
    price: 16.99,
    originalPrice: 22.00,
    discount: 22,
    rating: 4.7,
    reviews: 4100,
    isbn: '978-0765382030',
    pages: 416,
    year: 2014,
    format: 'Paperback',
    stock: 22,
    deliveryDays: 3,
    cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    description: 'Set against the backdrop of China\'s Cultural Revolution, a secret military project sends signals into space to establish contact with aliens.',
    tags: ['Hugo Award', 'Cosmic Sci-Fi', 'Astrophysics'],
    relatedIds: ['book-8', 'book-9', 'book-6']
  },
  {
    id: 'book-11',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    category: 'mystery',
    brand: 'harper',
    price: 15.99,
    originalPrice: 20.99,
    discount: 24,
    rating: 4.7,
    reviews: 7300,
    isbn: '978-1250301696',
    pages: 336,
    year: 2019,
    format: 'Paperback',
    stock: 45,
    deliveryDays: 1,
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
    description: 'Alicia Berenson’s life is seemingly perfect. Then, one evening, she shoots her husband five times in the face and never speaks another word.',
    tags: ['Psychological Thriller', 'Twist Ending', 'Bestseller'],
    relatedIds: ['book-12', 'book-5', 'book-7']
  },
  {
    id: 'book-12',
    title: 'Atomic Habits: An Easy & Proven Way',
    author: 'James Clear',
    category: 'business',
    brand: 'penguin',
    price: 21.50,
    originalPrice: 27.00,
    discount: 20,
    rating: 4.9,
    reviews: 12500,
    isbn: '978-0735211292',
    pages: 320,
    year: 2018,
    format: 'Hardcover',
    stock: 60,
    deliveryDays: 1,
    cover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. Learn the system that makes good habits inevitable and bad habits impossible.',
    tags: ['Productivity', 'Self-Improvement', 'Psychology', 'Leadership'],
    relatedIds: ['book-13', 'book-14', 'book-4']
  },
  {
    id: 'book-13',
    title: 'Principles: Life and Work',
    author: 'Ray Dalio',
    category: 'business',
    brand: 'simon',
    price: 28.00,
    originalPrice: 35.00,
    discount: 20,
    rating: 4.8,
    reviews: 3100,
    isbn: '978-1501124020',
    pages: 592,
    year: 2017,
    format: 'Hardcover',
    stock: 19,
    deliveryDays: 2,
    cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    description: 'Ray Dalio, one of the world’s most successful investors and entrepreneurs, shares the unconventional principles that he’s developed, refined, and used over the past forty years.',
    tags: ['Finance', 'Decision Making', 'Management'],
    relatedIds: ['book-12', 'book-14', 'book-15']
  },
  {
    id: 'book-14',
    title: 'Steve Jobs: The Exclusive Biography',
    author: 'Walter Isaacson',
    category: 'biography',
    brand: 'simon',
    price: 24.50,
    originalPrice: 32.00,
    discount: 23,
    rating: 4.8,
    reviews: 4900,
    isbn: '978-1451648539',
    pages: 656,
    year: 2011,
    format: 'Hardcover',
    stock: 25,
    deliveryDays: 2,
    cover: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    description: 'Based on more than forty interviews with Steve Jobs conducted over two years, Isaacson tells the riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur.',
    tags: ['Biography', 'Tech Icon', 'Apple', 'Innovation'],
    relatedIds: ['book-13', 'book-15', 'book-1']
  },
  {
    id: 'book-15',
    title: 'Shoe Dog: A Memoir by the Creator of Nike',
    author: 'Phil Knight',
    category: 'biography',
    brand: 'simon',
    price: 19.99,
    originalPrice: 26.00,
    discount: 23,
    rating: 4.9,
    reviews: 4200,
    isbn: '978-1501135927',
    pages: 400,
    year: 2016,
    format: 'Paperback',
    stock: 29,
    deliveryDays: 1,
    cover: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=600&q=80',
    description: 'In this candid and riveting memoir, Nike founder and CEO Phil Knight shares the inside story of the company’s early days as an intrepid start-up and its evolution into one of the world’s most iconic brands.',
    tags: ['Entrepreneurship', 'Inspiration', 'Nike', 'Memoir'],
    relatedIds: ['book-12', 'book-13', 'book-14']
  },
  {
    id: 'book-16',
    title: 'Building LLM Powered Applications',
    author: 'Valentina Alto',
    category: 'tech',
    brand: 'bloomsbury',
    price: 38.99,
    originalPrice: 48.00,
    discount: 19,
    rating: 4.8,
    reviews: 510,
    isbn: '978-1804610992',
    pages: 362,
    year: 2024,
    format: 'Paperback',
    stock: 20,
    deliveryDays: 2,
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    description: 'Create intelligent bots, autonomous agents, and RAG pipelines using LangChain, vector embeddings, OpenAI, and modern Agentic frameworks.',
    tags: ['Agents', 'LangChain', 'RAG', 'AI Applications'],
    relatedIds: ['book-1', 'book-2', 'book-3']
  }
];

// Pre-seeded Demo Users
let users = [
  {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    giftPoints: 480, // 1 point = $0.05 ($24.00 value)
    addresses: [
      {
        id: 'addr-1',
        name: 'Jane Doe',
        type: 'Home',
        isDefault: true,
        street: '742 Evergreen Terrace, Apt 4B',
        city: 'Springfield',
        state: 'IL',
        zip: '62704',
        phone: '+1 (555) 234-5678'
      },
      {
        id: 'addr-2',
        name: 'Jane Doe (Office)',
        type: 'Work',
        isDefault: false,
        street: '100 Tech Enterprise Blvd, Suite 800',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        phone: '+1 (555) 987-6543'
      }
    ]
  },
  {
    id: 'user-2',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    giftPoints: 150,
    addresses: [
      {
        id: 'addr-3',
        name: 'Alex Rivera',
        type: 'Home',
        isDefault: true,
        street: '452 Pine Valley Way',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        phone: '+1 (512) 443-8899'
      }
    ]
  }
];

// Seed Order History (including recent orders for 48-hr cancellation demo and "Buy It Again")
let orders = [
  {
    id: 'ORD-8921',
    userId: 'user-1',
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago (Eligible for 48h cancellation)
    status: 'Confirmed',
    items: [
      {
        bookId: 'book-2',
        title: 'Generative AI on AWS & Cloud Systems',
        author: 'Chris Fregly & Antje Barth',
        price: 49.99,
        quantity: 1,
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        category: 'tech'
      },
      {
        bookId: 'book-16',
        title: 'Building LLM Powered Applications',
        author: 'Valentina Alto',
        price: 38.99,
        quantity: 1,
        cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
        category: 'tech'
      }
    ],
    subtotal: 88.98,
    discountAmount: 10.00,
    pointsRedeemed: 200, // $10 redeemed
    shippingFee: 0.00,
    total: 78.98,
    pointsEarned: 78,
    paymentMethod: 'Credit Card (•••• 4242)',
    address: {
      name: 'Jane Doe',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      zip: '62704'
    },
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'ORD-7640',
    userId: 'user-1',
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 days ago (Past 48 hrs - Delivered)
    status: 'Delivered',
    items: [
      {
        bookId: 'book-1',
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        price: 44.99,
        quantity: 1,
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        category: 'tech'
      },
      {
        bookId: 'book-12',
        title: 'Atomic Habits: An Easy & Proven Way',
        author: 'James Clear',
        price: 21.50,
        quantity: 1,
        cover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
        category: 'business'
      }
    ],
    subtotal: 66.49,
    discountAmount: 0.00,
    pointsRedeemed: 0,
    shippingFee: 0.00,
    total: 66.49,
    pointsEarned: 66,
    paymentMethod: 'UPI / NetBanking',
    address: {
      name: 'Jane Doe',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      zip: '62704'
    },
    estimatedDelivery: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

// Helper: calculate cancellation status (within 48 hours)
function attachOrderMeta(order) {
  const placedTime = new Date(order.placedAt).getTime();
  const now = Date.now();
  const elapsedHours = (now - placedTime) / (1000 * 60 * 60);
  const remainingHours = Math.max(0, 48 - elapsedHours);
  const canCancel = order.status !== 'Cancelled' && order.status !== 'Delivered' && remainingHours > 0;
  return {
    ...order,
    canCancel,
    cancellationHoursLeft: Math.round(remainingHours * 10) / 10
  };
}

// API Routes

// 1. Get Categories & Brands
app.get('/api/metadata', (req, res) => {
  res.json({ categories, brands });
});

// 2. Get Books (with filter, search, category, brand)
app.get('/api/books', (req, res) => {
  const { category, brand, search, sort } = req.query;
  let filtered = [...books];

  if (category && category !== 'all') {
    filtered = filtered.filter(b => b.category === category);
  }
  if (brand && brand !== 'all') {
    filtered = filtered.filter(b => b.brand === brand);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.author.toLowerCase().includes(q) ||
      b.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'discount') {
    filtered.sort((a, b) => b.discount - a.discount);
  }

  res.json({ books: filtered, total: filtered.length });
});

// 3. Get Single Book with Related Products & Tentative Delivery calculation
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Calculate tentative delivery date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + book.deliveryDays);
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const formattedDelivery = deliveryDate.toLocaleDateString('en-US', options);

  // Find related products
  let related = books.filter(b => b.id !== book.id && (b.category === book.category || b.brand === book.brand));
  if (book.relatedIds && book.relatedIds.length > 0) {
    const explicitRelated = books.filter(b => book.relatedIds.includes(b.id));
    related = [...new Set([...explicitRelated, ...related])].slice(0, 4);
  } else {
    related = related.slice(0, 4);
  }

  res.json({
    book: {
      ...book,
      tentativeDeliveryDate: formattedDelivery,
      estimatedDeliveryTimestamp: deliveryDate.toISOString()
    },
    related
  });
});

// 4. User Authentication (Login / Register / Demo users)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials. Try jane@example.com / password123' });
  }

  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
    giftPoints: 100, // 100 welcome bonus points ($5.00)
    addresses: [
      {
        id: `addr-${Date.now()}`,
        name,
        type: 'Home',
        isDefault: true,
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        phone: '+1 (555) 123-4567'
      }
    ]
  };

  users.push(newUser);
  const { password: _, ...userSafe } = newUser;
  res.status(201).json({ user: userSafe });
});

// 5. User Profile & Addresses
app.get('/api/users/:userId', (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

app.post('/api/users/:userId/addresses', (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, street, city, state, zip, phone, type, isDefault } = req.body;
  if (!name || !street || !city || !state || !zip || !phone) {
    return res.status(400).json({ error: 'All address fields are required' });
  }

  const newAddress = {
    id: `addr-${Date.now()}`,
    name,
    street,
    city,
    state,
    zip,
    phone,
    type: type || 'Home',
    isDefault: !!isDefault
  };

  if (newAddress.isDefault) {
    user.addresses.forEach(a => a.isDefault = false);
  }

  user.addresses.push(newAddress);
  res.status(201).json({ addresses: user.addresses, newAddress });
});

// 6. User Orders & "Buy It Again" Items
app.get('/api/users/:userId/orders', (req, res) => {
  const userOrders = orders
    .filter(o => o.userId === req.params.userId)
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))
    .map(attachOrderMeta);

  // Extract unique items purchased for "Buy It Again" feature
  const purchasedBookMap = new Map();
  userOrders.forEach(order => {
    order.items.forEach(item => {
      if (!purchasedBookMap.has(item.bookId)) {
        const fullBook = books.find(b => b.id === item.bookId);
        purchasedBookMap.set(item.bookId, {
          ...item,
          fullBook: fullBook || null,
          lastOrderedAt: order.placedAt,
          orderId: order.id
        });
      }
    });
  });

  const buyItAgain = Array.from(purchasedBookMap.values());

  res.json({
    orders: userOrders,
    buyItAgain
  });
});

// 7. Recommendations based on Order History
app.get('/api/users/:userId/recommendations', (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.params.userId && o.status !== 'Cancelled');
  
  // Collect purchased categories and book IDs
  const purchasedBookIds = new Set();
  const categoryCounts = {};

  userOrders.forEach(order => {
    order.items.forEach(item => {
      purchasedBookIds.add(item.bookId);
      const book = books.find(b => b.id === item.bookId);
      if (book) {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      }
    });
  });

  // Top categories
  const sortedCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
  const preferredCategory = sortedCategories[0] || 'tech';

  let recommended = books.filter(b => !purchasedBookIds.has(b.id) && b.category === preferredCategory);
  if (recommended.length < 4) {
    const extra = books.filter(b => !purchasedBookIds.has(b.id) && !recommended.includes(b));
    recommended = [...recommended, ...extra].slice(0, 4);
  } else {
    recommended = recommended.slice(0, 4);
  }

  res.json({
    preferredCategory,
    recommendations: recommended
  });
});

// 8. Place Order (Checkout) with Points Redemption
app.post('/api/orders', (req, res) => {
  const { userId, items, address, paymentMethod, pointsToRedeem } = req.body;

  if (!userId || !items || !items.length || !address || !paymentMethod) {
    return res.status(400).json({ error: 'Incomplete order payload' });
  }

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Calculate Subtotal
  let subtotal = 0;
  const processedItems = items.map(item => {
    const book = books.find(b => b.id === item.id || b.id === item.bookId);
    const price = book ? book.price : item.price;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal;
    return {
      bookId: book ? book.id : item.id,
      title: book ? book.title : item.title,
      author: book ? book.author : item.author,
      price: price,
      quantity: item.quantity,
      cover: book ? book.cover : item.cover,
      category: book ? book.category : 'fiction'
    };
  });

  // Points redemption: 20 points = $1.00 ($0.05 per point)
  let pointsUsed = Math.min(Number(pointsToRedeem) || 0, user.giftPoints);
  // Cap points to max 50% of subtotal
  const maxRedeemableDollars = subtotal * 0.5;
  const maxRedeemablePoints = Math.floor(maxRedeemableDollars * 20);
  pointsUsed = Math.min(pointsUsed, maxRedeemablePoints);

  const discountAmount = Math.round((pointsUsed * 0.05) * 100) / 100;
  const shippingFee = subtotal > 35 ? 0.00 : 4.99;
  const total = Math.max(0, Math.round((subtotal - discountAmount + shippingFee) * 100) / 100);

  // Deduct points and reward 1 point per $1 spent
  user.giftPoints -= pointsUsed;
  const pointsEarned = Math.floor(total);
  user.giftPoints += pointsEarned;

  // Estimated delivery in 2 business days
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);

  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: user.id,
    placedAt: new Date().toISOString(),
    status: 'Confirmed',
    items: processedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    pointsRedeemed: pointsUsed,
    shippingFee,
    total,
    pointsEarned,
    paymentMethod,
    address,
    estimatedDelivery: deliveryDate.toISOString()
  };

  orders.unshift(newOrder);

  res.status(201).json({
    order: attachOrderMeta(newOrder),
    updatedUser: {
      id: user.id,
      name: user.name,
      email: user.email,
      giftPoints: user.giftPoints,
      avatar: user.avatar
    }
  });
});

// 9. Cancel Order within 48 hours
app.post('/api/orders/:orderId/cancel', (req, res) => {
  const { reason } = req.body;
  const order = orders.find(o => o.id === req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const meta = attachOrderMeta(order);
  if (!meta.canCancel) {
    return res.status(400).json({ error: 'Order is no longer eligible for cancellation (exceeds 48-hour window or already cancelled/delivered).' });
  }

  // Perform cancellation
  order.status = 'Cancelled';
  order.cancellationReason = reason || 'Customer requested cancellation within 48h window';
  order.cancelledAt = new Date().toISOString();

  // Revert user points if any were used / earned
  const user = users.find(u => u.id === order.userId);
  if (user) {
    user.giftPoints += order.pointsRedeemed; // Refund redeemed points
    user.giftPoints = Math.max(0, user.giftPoints - order.pointsEarned); // Deduct earned points
  }

  res.json({
    message: 'Order successfully cancelled within the 48-hour window. Full refund and points reversal initiated.',
    order: attachOrderMeta(order),
    refundAmount: order.total,
    pointsRefunded: order.pointsRedeemed,
    userGiftPoints: user ? user.giftPoints : 0
  });
});

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`PageTurner Bookstore Server running securely at http://${HOST}:${PORT}`);
});
