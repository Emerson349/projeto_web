import { NextResponse } from 'next/server';
import { createProduct, getProducts } from '@/repositories/productsRepository';
import { getRequestPassword, isValidAdminPassword, unauthorizedResponse } from '@/lib/auth';

export async function GET(request) {
  try {
    const products = await getProducts(); 
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Erro detalhado na API de Products:", error);
    return NextResponse.json(
      { 
        message: "Não foi possível carregar os produtos.",
        detalheDoErro: error.message 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!isValidAdminPassword(getRequestPassword(request))) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const product = await createProduct(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { 
        message: "Não foi possível criar o produto.",
        detalheDoErro: error.message 
      }, 
      { status: 400 }
    );
  }
}