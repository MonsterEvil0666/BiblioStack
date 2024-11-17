import { MongoClient } from 'mongodb';

// URL de conexão, que você já obteve no Atlas
const MONGO_URI = process.env.MONGODB_URI as string;

if (!MONGO_URI) {
  throw new Error('Por favor, defina a variável de ambiente MONGODB_URI no arquivo .env.local');
}

declare global {
  // Para evitar problemas de tipo no TypeScript ao usar variáveis globais
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Durante o desenvolvimento, usa o MongoClient em modo não bloqueante (para evitar múltiplas conexões durante hot reload)
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGO_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Em produção, usa o MongoClient normalmente
  client = new MongoClient(MONGO_URI);
  clientPromise = client.connect();
}

export default clientPromise;
