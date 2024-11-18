import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("autores");

    const id = parseInt(req.query.id as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    if (req.method === 'DELETE') {
      // Tentar deletar o autor
      const result = await collection.deleteOne({ id });

      if (result.deletedCount === 1) {
        return res.status(200).json({ message: 'Autor deletado com sucesso' });
      } else {
        return res.status(404).json({ error: 'Autor não encontrado' });
      }
    } else if (req.method === 'PUT') {
      const { nome } = req.body;
      if (!nome || typeof nome !== 'string') {
        return res.status(400).json({ error: 'Nome do autor é obrigatório e deve ser uma string' });
      }

      const result = await collection.updateOne({ id }, { $set: { nome } });

      if (result.modifiedCount === 1) {
        return res.status(200).json({ message: 'Autor atualizado com sucesso' });
      } else {
        return res.status(404).json({ error: 'Autor não encontrado ou nenhuma mudança feita' });
      }
    } else {
      res.setHeader('Allow', ['DELETE', 'PUT']);
      return res.status(405).end(`Método ${req.method} não permitido`);
    }
  } catch (error) {
    console.error('Erro ao manipular o autor:', error);
    return res.status(500).json({ error: 'Erro ao manipular o autor' });
  }
}
