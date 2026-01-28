import React, { useEffect, useRef, useState } from 'react';
import { FaCar, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaImage, FaBolt, FaTools, FaCogs, FaUsers } from 'react-icons/fa';
import API_BASE_URL from './config/api';

const initialForm = {
  type: '', make: '', model: '', year: '', registrationNumber: '', color: '', engineCC: '', seatingCapacity: ''
};

export default function VehiclesSection() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [createPhotoFile, setCreatePhotoFile] = useState(null);
  const [createPhotoPreview, setCreatePhotoPreview] = useState('');
  const createFileRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const editFileRef = useRef(null);
  const [uploadingPhotoId, setUploadingPhotoId] = useState(null);
  const cardFileRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchVehicles = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/vehicles`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load vehicles');
      const data = await res.json();
      setVehicles(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const validateImage = (file) => {
    if (!file) return 'No file selected';
    if (!/(jpe?g|png|webp)$/i.test(file.name)) return 'Only JPG/PNG/WEBP images are allowed';
    if (file.size > 5 * 1024 * 1024) return 'File is too large. Max 5MB';
    return '';
  };

  const uploadVehiclePhoto = async (vehicleId, file) => {
    const err = validateImage(file);
    if (err) { setError(err); return null; }
    try {
      setPhotoUploading(true);
      const fd = new FormData(); fd.append('photo', file);
      const res = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/photo`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to upload photo');
      setVehicles((prev) => prev.map((v) => (v._id === data._id ? data : v)));
      return data;
    } catch (e) { setError(e.message); return null; }
    finally { setPhotoUploading(false); }
  };

  const removeVehiclePhoto = async (vehicleId) => {
    try {
      setPhotoUploading(true);
      const res = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/photo`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setVehicles((prev) => prev.map((v) => (v._id === data._id ? data : v)));
    } catch (e) { } finally { setPhotoUploading(false); }
  };

  const createVehicle = async () => {
    if (!form.type || !form.make || !form.model || !form.registrationNumber) { setError('REQUIRED: TYPE, MAKE, MODEL, REG'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to add vehicle');
      if (createPhotoFile) await uploadVehiclePhoto(data._id, createPhotoFile);
      else setVehicles([data, ...vehicles]);
      setForm(initialForm); setCreating(false); setCreatePhotoFile(null); setCreatePhotoPreview('');
      fetchVehicles();
    } catch (e) { setError(e.message); }
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vehicles/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Update failed');
      if (editPhotoFile) await uploadVehiclePhoto(editingId, editPhotoFile);
      setEditingId(null); setEditPhotoFile(null); setEditPhotoPreview('');
      fetchVehicles();
    } catch (e) { setError(e.message); }
  };

  const deleteVehicle = async (id) => {
    if (!window.confirm('ABORT UNIT FROM MOTOR POOL?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/vehicles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setVehicles(vehicles.filter((v) => v._id !== id));
    } catch (e) { }
  };

  return (
    <div className="bg-stone-900/40 border border-stone-800 rounded-[2.5rem] overflow-hidden">
      <div className="p-8 border-b border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6 bg-stone-950/20">
        <div className="flex items-center space-x-4">
          <FaCar size={20} className="text-orange-500" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Motor Pool</h2>
        </div>
        {!creating ? (
          <button onClick={() => setCreating(true)} className="px-6 py-3 bg-orange-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-orange-500/20">ENLIST NEW UNIT</button>
        ) : (
          <button onClick={() => { setCreating(false); setForm(initialForm); }} className="px-6 py-3 bg-stone-800 text-stone-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">ABORT ENLISTMENT</button>
        )}
      </div>

      <div className="p-8 space-y-8">
        {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</div>}

        {creating && (
          <div className="bg-stone-950 border border-stone-800 rounded-[2rem] p-8 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              <div className="w-full lg:w-48 h-32 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center overflow-hidden group relative">
                {createPhotoPreview ? <img src={createPhotoPreview} className="w-full h-full object-cover" /> : <FaImage className="text-stone-700" size={32} />}
                <button onClick={() => createFileRef.current.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black uppercase text-white transition-all">UPLOAD PHOTO</button>
                <input ref={createFileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) { setCreatePhotoFile(f); setCreatePhotoPreview(URL.createObjectURL(f)) } }} />
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                {['type', 'make', 'model', 'year', 'registrationNumber', 'color', 'engineCC', 'seatingCapacity'].map(f => (
                  <input key={f} name={f} placeholder={f.replace(/([A-Z])/g, ' $1').toUpperCase()} value={form[f]} onChange={onChange} className="bg-stone-900 border border-stone-800 p-4 rounded-xl text-[10px] font-bold tracking-widest text-white focus:border-orange-500 outline-none uppercase placeholder-stone-700" />
                ))}
              </div>
            </div>
            <div className="flex justify-end"><button onClick={createVehicle} className="px-10 h-14 bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-xl shadow-orange-500/20">CONFIRM ENLISTMENT</button></div>
          </div>
        )}

        <div className="grid gap-6">
          {vehicles.map((v) => (
            <div key={v._id} className="group relative bg-stone-950/50 border border-stone-800 rounded-[2rem] p-8 hover:border-orange-500/30 transition-all duration-500">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="relative w-full lg:w-56 h-36 bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 group-hover:border-stone-700 transition-all">
                  {v.photoUrl ? <img src={v.photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-stone-800"><FaCar size={48} /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <button onClick={() => { setUploadingPhotoId(v._id); cardFileRef.current.click(); }} className="absolute bottom-3 right-3 p-2 bg-black/80 backdrop-blur border border-stone-700 rounded-lg text-stone-400 hover:text-white transition-all"><FaImage size={12} /></button>
                </div>

                <div className="flex-1 space-y-4 text-center lg:text-left">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-orange-500 transition-colors">{v.make} {v.model}</h3>
                    <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">{v.type} • {v.year || 'VINTAGE UNK'}</p>
                  </div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <div className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl flex items-center space-x-2"><FaBolt className="text-orange-500" size={10} /><span className="text-[10px] font-black text-stone-300 tracking-widest">{v.engineCC || 'N/A CC'}</span></div>
                    <div className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl flex items-center space-x-2"><FaUsers className="text-orange-500" size={10} /><span className="text-[10px] font-black text-stone-300 tracking-widest">{v.seatingCapacity || '2'} SEATS</span></div>
                    <div className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl flex items-center space-x-2"><FaTools className="text-orange-500" size={10} /><span className="text-[10px] font-black text-stone-300 tracking-widest">{v.registrationNumber}</span></div>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col gap-3">
                  <button onClick={() => { setEditingId(v._id); setEditForm(v); }} className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-500 hover:text-orange-500 hover:border-orange-500/50 transition-all"><FaEdit /></button>
                  <button onClick={() => deleteVehicle(v._id)} className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-500 hover:text-red-500 hover:border-red-500/50 transition-all"><FaTrash /></button>
                </div>
              </div>

              {editingId === v._id && (
                <div className="mt-8 pt-8 border-t border-stone-800 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {['type', 'make', 'model', 'year', 'registrationNumber', 'color', 'engineCC', 'seatingCapacity'].map(f => (
                      <input key={f} name={f} value={editForm[f]} onChange={onEditChange} className="bg-stone-900 border border-stone-800 p-4 rounded-xl text-[10px] font-bold tracking-widest text-white outline-none uppercase" />
                    ))}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={saveEdit} className="px-8 h-12 bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all">SAVE MODS</button>
                    <button onClick={() => setEditingId(null)} className="px-8 h-12 bg-stone-800 text-stone-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:text-white transition-all">CANCEL</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {vehicles.length === 0 && !creating && (
          <div className="py-12 text-center opacity-50">
            <FaCar size={48} className="mx-auto mb-4 text-stone-700" />
            <p className="text-[10px] font-black uppercase tracking-widest">No units in inventory. Enlist your fleet to proceed.</p>
          </div>
        )}
      </div>
      <input ref={cardFileRef} type="file" className="hidden" onChange={(e) => { if (e.target.files[0]) uploadVehiclePhoto(uploadingPhotoId, e.target.files[0]) }} />
    </div>
  );
}