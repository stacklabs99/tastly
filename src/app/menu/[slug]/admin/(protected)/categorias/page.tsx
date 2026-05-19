"use client";

import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

type EditState = { id: string; name: string; description: string } | null;

export default function CategoriasPage() {
  const { categories, dishes, restaurant, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editing, setEditing] = useState<EditState>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sortedCats = [...categories].sort((a, b) => a.position - b.position);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory({ restaurant_id: restaurant.id, name: newName.trim(), description: newDesc.trim() || undefined, position: categories.length + 1 });
    setNewName(""); setNewDesc("");
  };

  const handleSaveEdit = () => {
    if (!editing?.name.trim()) return;
    updateCategory(editing.id, { name: editing.name.trim(), description: editing.description.trim() || undefined });
    setEditing(null);
  };

  const inputCls = "rounded-xl px-3 py-2 text-sm text-[#e8e8e0] outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#f5f5f0]">Categorias</h1>
        <p className="text-[#626250] text-sm mt-1">Organiza o menu em secções</p>
      </div>

      <div className="space-y-2 mb-8">
        {sortedCats.map((cat) => {
          const count = dishes.filter((d) => d.category_id === cat.id).length;
          const isEditing = editing?.id === cat.id;

          return (
            <div key={cat.id} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {isEditing ? (
                <div className="space-y-2">
                  <input autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls + " w-full"} style={inputStyle} placeholder="Nome da categoria" />
                  <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls + " w-full"} style={inputStyle} placeholder="Descrição (opcional)" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleSaveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: "rgba(230,168,30,0.2)", color: "#e6a81e" }}>
                      <Check className="w-3.5 h-3.5" /> Guardar
                    </button>
                    <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#7a7a62]">
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-[#e6a81e] flex-shrink-0" style={{ background: "rgba(230,168,30,0.1)" }}>
                    {cat.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e8e8e0] font-medium">{cat.name}</p>
                    {cat.description && <p className="text-xs text-[#626250] mt-0.5">{cat.description}</p>}
                  </div>
                  <span className="text-xs text-[#484640] flex-shrink-0">{count} pratos</span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditing({ id: cat.id, name: cat.name, description: cat.description ?? "" })} className="text-[#484640] hover:text-[#e8e8e0] transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => { deleteCategory(cat.id); setConfirmDeleteId(null); }} className="text-xs text-[#e67e4b] font-medium hover:underline">Confirmar</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-[#626250]">×</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(cat.id)} className="text-[#484640] hover:text-[#e67e4b] transition-colors" disabled={count > 0} style={{ opacity: count > 0 ? 0.3 : 1 }} title={count > 0 ? "Elimina os pratos primeiro" : "Eliminar"}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.12)" }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Nova Categoria</h2>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className={inputCls + " w-full"} style={inputStyle} placeholder="Nome (ex: Entradas)" />
        <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className={inputCls + " w-full"} style={inputStyle} placeholder="Descrição curta (opcional)" />
        <button onClick={handleAdd} disabled={!newName.trim()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#1a1916] bg-[#e6a81e] disabled:opacity-40 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Criar Categoria
        </button>
      </div>
    </div>
  );
}
