import { useState, useEffect } from "react";

export default function ProductModal({ product, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    descricao: "",
    categoriaId: "",
    estoque: 0,
    estoqueMinimo: 0,
    preco: 0,
    codigo: "",
    gtin: "",
    ncm: "",
    cfop: "",
    unidadeComercial: "UN",
    origem: "",
    csosn: "",
    cstIcms: "",
    aliquotaIcms: "",
    cstPis: "",
    aliquotaPis: "",
    cstCofins: "",
    aliquotaCofins: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        descricao: product.descricao || "",
        categoriaId: product.categoriaId || "",
        estoque: product.estoque || 0,
        estoqueMinimo: product.estoqueMinimo || 0,
        preco: product.preco || 0,
        codigo: product.codigo || "",
        gtin: product.gtin || "",
        ncm: product.ncm || "",
        cfop: product.cfop || "",
        unidadeComercial: product.unidadeComercial || "UN",
        origem: product.origem || "",
        csosn: product.csosn || "",
        cstIcms: product.cstIcms || "",
        aliquotaIcms: product.aliquotaIcms ?? "",
        cstPis: product.cstPis || "",
        aliquotaPis: product.aliquotaPis ?? "",
        cstCofins: product.cstCofins || "",
        aliquotaCofins: product.aliquotaCofins ?? "",
      });
    } else {
      // Se for um novo produto, seleciona a primeira categoria por padrão
      // e gera um código sequencial
      setFormData((prev) => ({
        ...prev,
        categoriaId: categories[0]?.id || "",
        codigo: "",
      }));
    }
  }, [product, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        e.target.type === "number"
          ? name.startsWith("aliquota") && value === ""
            ? ""
            : parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {product ? "Editar Produto" : "Novo Produto"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="descricao"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome do Produto
              </label>
              <input
                type="text"
                name="descricao"
                id="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="codigo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Código do Produto
              </label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                value={formData.codigo} // Ou o nome da sua variável de estado
                onChange={handleChange} // Função que atualiza o estado
                placeholder="Ex: camisa-001"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="preco"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Preço de Venda
                </label>
                <input
                  type="number"
                  name="preco"
                  id="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="estoque"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Estoque Inicial
                </label>
                <input
                  type="number"
                  name="estoque"
                  id="estoque"
                  value={formData.estoque}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="estoqueMinimo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estoque Mínimo
              </label>
              <input
                type="number"
                name="estoqueMinimo"
                id="estoqueMinimo"
                value={formData.estoqueMinimo}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                O sistema irá alertar quando o estoque atingir este valor.
              </p>
            </div>

            <section className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-1">
                Dados fiscais para NFC-e
              </h4>
              <p className="text-xs text-amber-700 mb-3">
                Preencha conforme orientação do contador. O sistema não
                estima códigos ou alíquotas fiscais.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm text-gray-700">
                  NCM
                  <input
                    name="ncm"
                    value={formData.ncm}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={8}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  CFOP
                  <input
                    name="cfop"
                    value={formData.cfop}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={4}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  GTIN / EAN
                  <input
                    name="gtin"
                    value={formData.gtin}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Unidade comercial
                  <input
                    name="unidadeComercial"
                    value={formData.unidadeComercial}
                    onChange={handleChange}
                    maxLength={6}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Origem da mercadoria
                  <select
                    name="origem"
                    value={formData.origem}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="">Selecione</option>
                    {Array.from({ length: 9 }, (_, index) => (
                      <option key={index} value={String(index)}>
                        {index} - {index === 0 ? "Nacional" : "Conforme tabela fiscal"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-gray-700">
                  CSOSN
                  <input
                    name="csosn"
                    value={formData.csosn}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={3}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  CST ICMS (Regime Normal)
                  <input
                    name="cstIcms"
                    value={formData.cstIcms}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={2}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Alíquota ICMS (%)
                  <input
                    type="number"
                    name="aliquotaIcms"
                    value={formData.aliquotaIcms}
                    onChange={handleChange}
                    min="0"
                    step="0.0001"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  CST PIS
                  <input
                    name="cstPis"
                    value={formData.cstPis}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={2}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Alíquota PIS (%)
                  <input
                    type="number"
                    name="aliquotaPis"
                    value={formData.aliquotaPis}
                    onChange={handleChange}
                    min="0"
                    step="0.0001"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  CST COFINS
                  <input
                    name="cstCofins"
                    value={formData.cstCofins}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={2}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Alíquota COFINS (%)
                  <input
                    type="number"
                    name="aliquotaCofins"
                    value={formData.aliquotaCofins}
                    onChange={handleChange}
                    min="0"
                    step="0.0001"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  />
                </label>
              </div>
            </section>
          </div>
        </form>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Salvar Produto
          </button>
        </div>
      </div>
    </div>
  );
}
