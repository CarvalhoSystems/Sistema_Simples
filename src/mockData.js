export const BANCO_PRODUTOS = [
  {
    codigo: "1",
    descricao: "PÃO FRANCÊS (UN)",
    preco: 0.8,
    solicitarQuantidade: true,
    estoque: 250, // Estoque atual
    estoqueMinimo: 50, // Estoque mínimo para alerta
    categoriaId: "padaria", // ID da categoria
  },
  {
    codigo: "2",
    descricao: "LEITE INTEGRAL PIRACANJUBA 1L",
    preco: 4.8,
    solicitarQuantidade: false,
    estoque: 8, // Estoque baixo para teste
    estoqueMinimo: 10,
    categoriaId: "mercearia",
  },
  {
    codigo: "3",
    descricao: "QUEIJO MUSSARELA FATIADO (KG)",
    preco: 4.2,
    solicitarQuantidade: true,
    estoque: 15.5,
    estoqueMinimo: 5,
    categoriaId: "frios",
  },
  {
    codigo: "4",
    descricao: "REFRIGERANTE COCA-COLA 2L",
    preco: 8.5,
    solicitarQuantidade: false,
    estoque: 0, // Sem estoque para teste
    estoqueMinimo: 12,
    categoriaId: "bebidas",
  },
  {
    codigo: "5",
    descricao: "PRESUNTO FATIADO (KG)",
    preco: 5.99,
    solicitarQuantidade: true,
    estoque: 12.8,
    estoqueMinimo: 4,
    categoriaId: "frios",
  },
  {
    codigo: "6",
    descricao: "QUEIJO PARMESÃO (KG)",
    preco: 7.99,
    solicitarQuantidade: true,
    estoque: 10.2,
    estoqueMinimo: 2,
    categoriaId: "frios",
  },
  {
    codigo: "7",
    descricao: "PAO NA CHAPA",
    preco: 2.99,
    solicitarQuantidade: false,
    estoque: 50, // Não tem estoque mínimo definido, não aparecerá como baixo
  },
];

export const VENDAS_REALIZADAS = [
  { id: 1, total: 48.5, data: "2024-07-20T10:30:00" },
  { id: 2, total: 12.9, data: "2024-07-20T11:15:00" },
  { id: 3, total: 85.2, data: "2024-07-21T09:05:00" },
];

export const CLIENTES_CADASTRADOS = [
  { id: 1, nome: "João Silva", desde: "2023-01-15" },
  { id: 2, nome: "Maria Oliveira", desde: "2023-03-22" },
  { id: 3, nome: "Carlos Pereira", desde: "2024-05-10" },
];

// Adicione as categorias para o inventário
export const CATEGORIAS_MOCK = [
  { id: "padaria", name: "Padaria" },
  { id: "mercearia", name: "Mercearia" },
  { id: "frios", name: "Frios e Laticínios" },
  { id: "bebidas", name: "Bebidas" },
];
