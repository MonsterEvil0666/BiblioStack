import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === 'development') {
  // Verifica se já existe um cliente Mongo no global para evitar várias conexões em desenvolvimento
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  // Em produção, cria um novo cliente a cada vez
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
