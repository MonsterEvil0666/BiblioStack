import clientPromise from './mongodb';

const COLLECTION_NAME = "livros";

interface Livro {
  id?: number; // Novo campo id numérico sequencial
  nome: string;
}

export async function addLivro(livro: Livro) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    // Buscar o maior `id` existente
    const ultimoLivro = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const novoId = ultimoLivro.length > 0 ? ultimoLivro[0].id + 1 : 1;

    // Adicionar o novo livro com o `id` sequencial
    const livroComId = { ...livro, id: novoId };
    const result = await collection.insertOne(livroComId);

    if (result.acknowledged) {
      return livroComId; // Retornar o livro completo, incluindo o nome
    } else {
      throw new Error('Erro ao inserir o livro no banco de dados');
    }
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    throw new Error('Erro ao adicionar livro');
  }
}

export async function getLivroByName(nome: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    const livro = await collection.findOne({ nome });
    return livro;
  } catch (error) {
    console.error('Erro ao buscar livro por nome:', error);
    throw new Error('Erro ao buscar livro por nome');
  }
}

export async function getAllLivros() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection(COLLECTION_NAME);

  // Buscar todos os livros e ordenar pelo campo `id` em ordem decrescente
  const livros = await collection.find().sort({ id: -1 }).toArray();
  return livros;
}
