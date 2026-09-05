import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { LoadingState } from '../../components/StateViews';

const empty = {
  book_id: '', title: '', author: '', isbn: '', category: '', description: '',
  publisher: '', publication_year: '', language: 'English', total_copies: 1
};

export default function BookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [cover, setCover] = useState(null);
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/books/${id}`).then(res => {
      const b = res.data.book;
      setForm({
        book_id: b.book_id, title: b.title, author: b.author, isbn: b.isbn || '',
        category: b.category, description: b.description || '', publisher: b.publisher || '',
        publication_year: b.publication_year || '', language: b.language, total_copies: b.total_copies
      });
    }).catch(() => toast.error('Could not load book.')).finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && (!form.book_id || !form.title || !form.author || !form.category || !form.total_copies)) {
      return toast.error('Book ID, title, author, category, and total copies are required.');
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (cover) fd.append('cover', cover);
      if (ebook) fd.append('ebook', ebook);

      if (isEdit) {
        await api.put(`/books/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Book updated.');
      } else {
        await api.post('/books', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Book added successfully.');
      }
      navigate('/admin/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save book.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <h2>{isEdit ? 'Edit Book' : 'Add Book'}</h2>
      <p className="muted mb-24">{isEdit ? 'Update the details for this title.' : 'Add a new title to the catalog. A QR code will be generated automatically.'}</p>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 26, maxWidth: 640 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Book ID {isEdit && '(cannot be changed)'}</label>
            <input className="input" required disabled={isEdit} value={form.book_id} onChange={update('book_id')} placeholder="BK023" />
          </div>
          <div className="field">
            <label>Total Copies</label>
            <input className="input" type="number" min={1} required value={form.total_copies} onChange={update('total_copies')} />
          </div>
        </div>

        <div className="field">
          <label>Title</label>
          <input className="input" required value={form.title} onChange={update('title')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Author</label>
            <input className="input" required value={form.author} onChange={update('author')} />
          </div>
          <div className="field">
            <label>ISBN</label>
            <input className="input" value={form.isbn} onChange={update('isbn')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Category</label>
            <input className="input" required value={form.category} onChange={update('category')} placeholder="Computer Science" />
          </div>
          <div className="field">
            <label>Publisher</label>
            <input className="input" value={form.publisher} onChange={update('publisher')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Publication Year</label>
            <input className="input" type="number" value={form.publication_year} onChange={update('publication_year')} />
          </div>
          <div className="field">
            <label>Language</label>
            <input className="input" value={form.language} onChange={update('language')} />
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea className="input" rows={4} value={form.description} onChange={update('description')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Cover Image (JPG/PNG/WEBP)</label>
            <input className="input" type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} />
          </div>
          <div className="field">
            <label>E-book File (PDF)</label>
            <input className="input" type="file" accept="application/pdf" onChange={(e) => setEbook(e.target.files[0])} />
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Book'}
        </button>
      </form>
    </div>
  );
}
