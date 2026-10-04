const mongoose = require('mongoose');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    price: 199.99,
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
    category: "Electronics",
    stock: 15
  },
  {
    name: "Smart Watch Pro",
    price: 299.99,
    description: "Fitness tracker with heart rate monitor, GPS, and smartphone notifications. Track your health in style.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    category: "Electronics",
    stock: 10
  },
  {
    name: "Classic Leather Backpack",
    price: 89.99,
    description: "Durable leather backpack perfect for daily use and travel. Spacious and stylish.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300",
    category: "Fashion",
    stock: 20
  },
  {
    name: "Minimalist Desk Lamp",
    price: 49.99,
    description: "LED desk lamp with adjustable brightness and color temperature. Modern design for your workspace.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300",
    category: "Home",
    stock: 25
  },
  {
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    description: "Insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. Eco-friendly and durable.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300",
    category: "Sports",
    stock: 50
  },
  {
    name: "Wireless Gaming Mouse",
    price: 79.99,
    description: "High-precision gaming mouse with customizable RGB lighting. Ultimate control for gamers.",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300",
    category: "Electronics",
    stock: 12
  }
];

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    
    // Clear existing products
    await Product.deleteMany();
    console.log('Existing products removed');
    
    // Insert new products
    await Product.insertMany(sampleProducts);
    console.log(`${sampleProducts.length} products added successfully!`);
    
    console.log('Sample products:');
    sampleProducts.forEach(p => {
      console.log(`- ${p.name} ($${p.price})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();