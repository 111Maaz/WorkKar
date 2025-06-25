import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';

interface Category {
  id: number;
  category_id: string;
  category_name: string;
  is_active: boolean;
}
interface Subcategory {
  id: number;
  category_id: string;
  subcategory_name: string;
  is_active: boolean;
}

type EditType = 'category' | 'subcategory';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editType, setEditType] = useState<EditType>('category');
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [confirmDelete, setConfirmDelete] = useState<{ type: EditType; id: number } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: cats } = await supabase.from('service_categories').select('*').order('id');
    const { data: subs } = await supabase.from('service_subcategories').select('*').order('category_id');
    setCategories(cats || []);
    setSubcategories(subs || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // CRUD Handlers
  const openModal = (type: EditType, item?: any) => {
    setEditType(type);
    setEditItem(item || null);
    setForm(item ? { ...item } : {});
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditItem(null); setForm({}); };

  const handleSave = async () => {
    if (editType === 'category') {
      if (editItem) {
        // Assuming category_id is also editable or pre-filled if needed
        await supabase.from('service_categories').update({ category_name: form.category_name, category_id: form.category_id }).eq('id', editItem.id);
      } else {
        await supabase.from('service_categories').insert({ category_name: form.category_name, category_id: form.category_id, is_active: true });
      }
    } else {
      if (editItem) {
        await supabase.from('service_subcategories').update({ subcategory_name: form.subcategory_name, category_id: form.category_id }).eq('id', editItem.id);
      } else {
        await supabase.from('service_subcategories').insert({ subcategory_name: form.subcategory_name, category_id: form.category_id, is_active: true });
      }
    }
    closeModal();
    fetchData();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'category') {
      await supabase.from('service_categories').delete().eq('id', confirmDelete.id);
    } else {
      await supabase.from('service_subcategories').delete().eq('id', confirmDelete.id);
    }
    setConfirmDelete(null);
    fetchData();
  };

  const handleToggleActive = async (type: EditType, id: number, isActive: boolean) => {
    if (type === 'category') {
      await supabase.from('service_categories').update({ is_active: !isActive }).eq('id', id);
    } else {
      await supabase.from('service_subcategories').update({ is_active: !isActive }).eq('id', id);
    }
    fetchData();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Category Management</h1>
      <div className="flex gap-4 mb-4">
        <Button onClick={() => openModal('category')}>Add Category</Button>
        <Button onClick={() => openModal('subcategory')}>Add Subcategory</Button>
      </div>
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Categories</h2>
            <table className="min-w-full divide-y divide-border bg-card rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Active</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No categories found.</td></tr>}
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-muted">
                    <td className="px-4 py-2">{cat.category_name}</td>
                    <td className="px-4 py-2">
                      <button
                        className={`px-2 py-1 rounded ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        onClick={() => handleToggleActive('category', cat.id, cat.is_active)}
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openModal('category', cat)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => setConfirmDelete({ type: 'category', id: cat.id })}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Subcategories */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Subcategories</h2>
            <table className="min-w-full divide-y divide-border bg-card rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Active</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No subcategories found.</td></tr>}
                {subcategories.map(sub => (
                  <tr key={sub.id} className="hover:bg-muted">
                    <td className="px-4 py-2">{sub.subcategory_name}</td>
                    <td className="px-4 py-2">{categories.find(c => c.category_id === sub.category_id)?.category_name || 'Unknown'}</td>
                    <td className="px-4 py-2">
                      <button
                        className={`px-2 py-1 rounded ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        onClick={() => handleToggleActive('subcategory', sub.id, sub.is_active)}
                      >
                        {sub.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openModal('subcategory', sub)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => setConfirmDelete({ type: 'subcategory', id: sub.id })}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Modal for create/edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={closeModal}>&times;</button>
            <h2 className="text-xl font-bold mb-4">{editItem ? 'Edit' : 'Add'} {editType === 'category' ? 'Category' : 'Subcategory'}</h2>
            <div className="space-y-4">
              {editType === 'category' ? (
                <>
                  <Input
                    placeholder="Category Name (e.g., Plumbing)"
                    value={form.category_name || ''}
                    onChange={e => setForm((f: any) => ({ ...f, category_name: e.target.value }))}
                  />
                  <Input
                    placeholder="Category ID (e.g., plumbing)"
                    value={form.category_id || ''}
                    onChange={e => setForm((f: any) => ({ ...f, category_id: e.target.value }))}
                  />
                </>
              ) : (
                <>
                  <Input
                    placeholder="Subcategory Name"
                    value={form.subcategory_name || ''}
                    onChange={e => setForm((f: any) => ({ ...f, subcategory_name: e.target.value }))}
                  />
                  <select
                    value={form.category_id || ''}
                    onChange={e => setForm((f: any) => ({ ...f, category_id: e.target.value }))}
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.category_id}>{cat.category_name}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button variant="default" onClick={handleSave}>{editItem ? 'Save' : 'Add'}</Button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this {confirmDelete.type === 'category' ? 'category' : 'subcategory'}?</p>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 