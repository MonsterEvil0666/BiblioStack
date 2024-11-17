import clientPromise from './mongodb';

const COLLECTION_NAME = "generos";

interface Genero {
  id?: number; // Novo campo id numérico sequencial
  nome: string;
}

export async function addGenero(genero: Genero) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    // Buscar o maior `id` existente
    const ultimoGenero = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const novoId = ultimoGenero.length > 0 ? ultimoGenero[0].id + 1 : 1;

    // Adicionar o novo gênero com o `id` sequencial
    const generoComId = { ...genero, id: novoId };
    const result = await collection.insertOne(generoComId);

    if (result.acknowledged) {
      return generoComId; // Retornar o gênero completo, incluindo o id
    } else {
      throw new Error('Erro ao inserir o gênero no banco de dados');
    }
  } catch (error) {
    console.error('Erro ao adicionar gênero:', error);
    throw new Error('Erro ao adicionar gênero');
  }
}

export async function getGeneroByName(nome: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    const genero = await collection.findOne({ nome });
    return genero;
  } catch (error) {
    console.error('Erro ao buscar gênero por nome:', error);
    throw new Error('Erro ao buscar gênero por nome');
  }
}

export async function getAllGeneros() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    // Buscar todos os gêneros e ordenar pelo campo `id` em ordem decrescente
    const generos = await collection.find().sort({ id: -1 }).toArray();
    return generos;
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    throw new Error('Erro ao buscar gêneros');
  }
}

export async function getGeneroById(id: number) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    const genero = await collection.findOne({ id });
    return genero;
  } catch (error) {
    console.error('Erro ao buscar gênero por ID:', error);
    throw new Error('Erro ao buscar gênero por ID');
  }
}

export async function updateGenero(id: number, genero: Genero) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.updateOne({ id }, { $set: genero });
    if (result.modifiedCount === 0) {
      throw new Error('Nenhum gênero foi atualizado');
    }

    return { message: 'Gênero atualizado com sucesso' };
  } catch (error) {
    console.error('Erro ao atualizar gênero:', error);
    throw new Error('Erro ao atualizar gênero');
  }
}

export async function deleteGenero(id: number) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({ id });
    if (result.deletedCount === 0) {
      throw new Error('Nenhum gênero foi deletado');
    }
  } catch (error) {
    console.error('Erro ao deletar gênero:', error);
    throw new Error('Erro ao deletar gênero');
  }
}
