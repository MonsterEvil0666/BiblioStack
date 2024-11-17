import clientPromise from './mongodb';

const COLLECTION_NAME = "autores";

interface Autor {
  id?: number; // Novo campo id numérico sequencial
  nome: string;
}

export async function addAutor(autor: Autor) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    // Buscar o maior `id` existente
    const ultimoAutor = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const novoId = ultimoAutor.length > 0 ? ultimoAutor[0].id + 1 : 1;

    // Adicionar o novo autor com o `id` sequencial
    const autorComId = { ...autor, id: novoId };
    const result = await collection.insertOne(autorComId);

    if (result.acknowledged) {
      return autorComId; // Retornar o autor completo, incluindo o nome
    } else {
      throw new Error('Erro ao inserir o autor no banco de dados');
    }
  } catch (error) {
    console.error('Erro ao adicionar autor:', error);
    throw new Error('Erro ao adicionar autor');
  }
}

export async function getAutorByName(nome: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    const autor = await collection.findOne({ nome });
    return autor;
  } catch (error) {
    console.error('Erro ao buscar autor por nome:', error);
    throw new Error('Erro ao buscar autor por nome');
  }
}

export async function getAllAutores() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection(COLLECTION_NAME);

  // Buscar todos os autores e ordenar pelo campo `id` em ordem decrescente
  const autores = await collection.find().sort({ id: -1 }).toArray();
  return autores;
}
