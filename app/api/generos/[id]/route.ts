import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { NextRequest } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("generos");

    // Converter o id para número, já que ele é numérico
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Tentar deletar o gênero
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Gênero deletado com sucesso' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Gênero não encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('Erro ao deletar o gênero:', error);
    return NextResponse.json({ error: 'Erro ao deletar o gênero' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("generos");

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const { nome } = await req.json();
    if (!nome || typeof nome !== 'string') {
      return NextResponse.json({ error: 'Nome do gênero é obrigatório e deve ser uma string' }, { status: 400 });
    }

    const result = await collection.updateOne({ id }, { $set: { nome } });

    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: 'Gênero atualizado com sucesso' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Gênero não encontrado ou nenhuma mudança feita' }, { status: 404 });
    }
  } catch (error) {
    console.error('Erro ao atualizar o gênero:', error);
    return NextResponse.json({ error: 'Erro ao atualizar o gênero' }, { status: 500 });
  }
}
