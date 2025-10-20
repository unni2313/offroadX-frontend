import React, { useEffect, useRef, useState } from 'react';
import { FaCar, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaImage } from 'react-icons/fa';
import API_BASE_URL from './config/api';

const initialForm = {
  type: '',
  make: '',
  model: '',
  year: '',
  registrationNumber: '',
  color: '',
  engineCC: '',
  seatingCapacity: ''
};

export default function VehiclesSection() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create flow
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [createPhotoFile, setCreatePhotoFile] = useState(null);
  const [createPhotoPreview, setCreatePhotoPreview] = useState('');
  const createFileRef = useRef(null);

  // Edit flow
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const editFileRef = useRef(null);

  // Per-card upload
  const [uploadingPhotoId, setUploadingPhotoId] = useState(null);
  const cardFileRef = useRef(null);

  const [photoUploading, setPhotoUploading] = useState(false);

  const token = localStorage.getItem('token');

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load vehicles');
      const data = await res.json();
      setVehicles(data);
    } catch (e) {
      setError(e.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (err) {
      setError(err);
      return null;
    }
    try {
      setPhotoUploading(true);
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to upload photo');
      setVehicles((prev) => prev.map((v) => (v._id === data._id ? data : v)));
      return data;
    } catch (e) {
      setError(e.message || 'Failed to upload photo');
      return null;
    } finally {
      setPhotoUploading(false);
    }
  };

  const removeVehiclePhoto = async (vehicleId) => {
    try {
      setPhotoUploading(true);
      const res = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/photo`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to delete photo');
      setVehicles((prev) => prev.map((v) => (v._id === data._id ? data : v)));
    } catch (e) {
      setError(e.message || 'Failed to delete photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const createVehicle = async () => {
    setError('');
    if (!form.type || !form.make || !form.model || !form.registrationNumber) {
      setError('Type, Make, Model, Registration are required');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to add vehicle');

      // If a photo was selected in the create form, upload it now
      if (createPhotoFile) {
        const uploaded = await uploadVehiclePhoto(data._id, createPhotoFile);
        if (uploaded) {
          setVehicles([uploaded, ...vehicles.filter((v) => v._id !== data._id)]);
        } else {
          setVehicles([data, ...vehicles]);
        }
      } else {
        setVehicles([data, ...vehicles]);
      }

      // Reset create form
      setForm(initialForm);
      setCreating(false);
      setCreatePhotoFile(null);
      setCreatePhotoPreview('');
      if (createFileRef.current) createFileRef.current.value = '';
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (v) => {
    setEditingId(v._id);
    setEditForm({
      type: v.type || '',
      make: v.make || '',
      model: v.model || '',
      year: v.year || '',
      registrationNumber: v.registrationNumber || '',
      color: v.color || '',
      engineCC: v.engineCC || '',
      seatingCapacity: v.seatingCapacity || ''
    });
    setEditPhotoFile(null);
    setEditPhotoPreview('');
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const saveEdit = async () => {
    try {
      // Save fields first
      const res = await fetch(`${API_BASE_URL}/api/vehicles/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update');
      let updatedVehicle = data;

      // If a new photo was chosen in edit form, upload/replace
      if (editPhotoFile) {
        const uploaded = await uploadVehiclePhoto(editingId, editPhotoFile);
        if (uploaded) updatedVehicle = uploaded;
      }

      setVehicles((prev) => prev.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v)));
      setEditingId(null);
      setEditPhotoFile(null);
      setEditPhotoPreview('');
      if (editFileRef.current) editFileRef.current.value = '';
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to delete');
      setVehicles(vehicles.filter((v) => v._id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  // Card-level choose/upload (kept)
  const choosePhoto = (id) => {
    setUploadingPhotoId(id);
    cardFileRef.current?.click();
  };

  const onCardPhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadVehiclePhoto(uploadingPhotoId, file);
    e.target.value = '';
    setUploadingPhotoId(null);
  };

  // Create form photo handlers
  const onCreatePhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err) {
      setError(err);
      e.target.value = '';
      return;
    }
    setCreatePhotoFile(file);
    setCreatePhotoPreview(URL.createObjectURL(file));
  };

  const clearCreatePhoto = () => {
    setCreatePhotoFile(null);
    if (createFileRef.current) createFileRef.current.value = '';
    if (createPhotoPreview) URL.revokeObjectURL(createPhotoPreview);
    setCreatePhotoPreview('');
  };

  // Edit form photo handlers
  const onEditPhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err) {
      setError(err);
      e.target.value = '';
      return;
    }
    setEditPhotoFile(file);
    setEditPhotoPreview(URL.createObjectURL(file));
  };

  const clearEditPhoto = () => {
    setEditPhotoFile(null);
    if (editFileRef.current) editFileRef.current.value = '';
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoPreview('');
  };

  return (
    <div className="bg-gradient-to-br from-stone-900/80 to-stone-800/80 backdrop-blur-md rounded-2xl border border-orange-500/20 overflow-hidden shadow-lg shadow-orange-500/5">
      {/* Header (match Profile card header) */}
      <div className="p-6 border-b border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FaCar className="text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Vehicles</span>
        </h2>
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-medium shadow-lg shadow-orange-500/20"
          >
            <FaPlus /> <span>Add Vehicle</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setCreating(false);
              setForm(initialForm);
              clearCreatePhoto();
            }}
            className="bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-medium shadow-lg shadow-stone-500/20"
          >
            <FaTimes /> <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="text-sm text-red-200 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Create form */}
        {creating && (
          <div className="bg-black/30 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 grid md:grid-cols-4 gap-4">
            {/* Photo selector + preview */}
            <div className="md:col-span-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-44 h-32 bg-stone-900/50 border border-orange-500/30 rounded-xl flex items-center justify-center overflow-hidden backdrop-blur-sm">
                  {createPhotoPreview ? (
                    <img src={createPhotoPreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <FaImage className="text-orange-400/50 text-4xl" />
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => createFileRef.current?.click()}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium shadow-lg shadow-orange-500/20"
                  >
                    Choose Photo
                  </button>
                  {createPhotoFile && (
                    <button
                      type="button"
                      onClick={clearCreatePhoto}
                      className="bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 text-white px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium shadow-lg shadow-stone-500/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={createFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onCreatePhotoSelected}
                  className="hidden"
                />
              </div>
            </div>

            <input
              name="type"
              value={form.type}
              onChange={onChange}
              placeholder="Type (car/bike)"
              className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
            <input
              name="make"
              value={form.make}
              onChange={onChange}
              placeholder="Make"
              className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
            <input
              name="model"
              value={form.model}
              onChange={onChange}
              placeholder="Model"
              className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
            <input
              name="year"
              value={form.year}
              onChange={onChange}
              placeholder="Year"
              className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
            <input
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={onChange}
              placeholder="Registration No"
              className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
            <input
              name="color"
              value={form.color}
              onChange={onChange}
              placeholder="Color"
              className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
            <input
              name="engineCC"
              value={form.engineCC}
              onChange={onChange}
              placeholder="Engine/CC"
              className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
            <input
              name="seatingCapacity"
              value={form.seatingCapacity}
              onChange={onChange}
              placeholder="Seating"
              className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />

            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={createVehicle}
                disabled={photoUploading}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-70 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-medium shadow-lg shadow-orange-500/20"
              >
                <FaSave /> <span>Save Vehicle</span>
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-stone-400 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500/30 border-t-orange-500 mx-auto mb-2"></div>
            Loading vehicles...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 text-center">
            <FaCar className="text-orange-400/50 text-4xl mx-auto mb-4" />
            <p className="text-stone-300 text-lg font-medium mb-2">No vehicles yet</p>
            <p className="text-stone-400">Click "Add Vehicle" to create your first one.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {vehicles.map((v) => (
              <div key={v._id} className="bg-black/30 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-6 shadow-lg shadow-orange-500/5">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-full md:w-44 h-32 bg-stone-900/50 border border-orange-500/30 rounded-xl flex items-center justify-center overflow-hidden backdrop-blur-sm">
                    {v.photoUrl ? (
                      <img src={v.photoUrl} alt="vehicle" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <FaImage className="text-orange-400/50 text-4xl" />
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    {editingId === v._id ? (
                      <div className="grid md:grid-cols-4 gap-3">
                        {/* Edit photo replace inline */}
                        <div className="md:col-span-4 flex items-center gap-4">
                          <div className="w-40 h-28 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                            {editPhotoPreview ? (
                              <img src={editPhotoPreview} alt="new" className="w-full h-full object-cover" />
                            ) : v.photoUrl ? (
                              <img src={v.photoUrl} alt="current" className="w-full h-full object-cover" />
                            ) : (
                              <FaImage className="text-gray-500 text-3xl" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => editFileRef.current?.click()}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition text-sm"
                            >
                              {v.photoUrl ? 'Change Photo' : 'Add Photo'}
                            </button>
                            {v.photoUrl && (
                              <button
                                type="button"
                                onClick={() => removeVehiclePhoto(v._id)}
                                disabled={photoUploading}
                                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-70 text-white px-3 py-2 rounded-lg transition text-sm"
                              >
                                Remove Photo
                              </button>
                            )}
                            {editPhotoFile && (
                              <button
                                type="button"
                                onClick={clearEditPhoto}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition text-sm"
                              >
                                Clear New
                              </button>
                            )}
                          </div>
                          <input
                            ref={editFileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={onEditPhotoSelected}
                            className="hidden"
                          />
                        </div>

                        <input name="type" value={editForm.type} onChange={onEditChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" />
                        <input name="make" value={editForm.make} onChange={onEditChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" />
                        <input name="model" value={editForm.model} onChange={onEditChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" />
                        <input name="year" value={editForm.year} onChange={onEditChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" />
                        <input name="registrationNumber" value={editForm.registrationNumber} onChange={onEditChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" />
                        <input name="color" value={editForm.color} onChange={onEditChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" />
                        <input name="engineCC" value={editForm.engineCC} onChange={onEditChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" />
                        <input name="seatingCapacity" value={editForm.seatingCapacity} onChange={onEditChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none" />
                        <div className="md:col-span-4 flex gap-2 justify-end mt-1">
                          <button onClick={saveEdit} disabled={photoUploading} className="bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm"><FaSave /> Save</button>
                          <button onClick={() => { setEditingId(null); clearEditPhoto(); }} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm"><FaTimes /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="text-white font-semibold text-lg">{v.make} {v.model} <span className="text-gray-400 font-normal">({v.type})</span></div>
                        <div className="text-gray-300 text-sm">Reg: <span className="text-gray-100">{v.registrationNumber}</span> {v.color ? <span className="text-gray-400">• {v.color}</span> : ''} {v.year ? <span className="text-gray-400">• {v.year}</span> : ''}</div>
                        <div className="text-gray-400 text-xs">Engine: {v.engineCC || 'N/A'} • Seating: {v.seatingCapacity || 'N/A'}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                    <button onClick={() => choosePhoto(v._id)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition text-sm w-full md:w-auto">Upload Photo</button>
                    {v.photoUrl && (
                      <button onClick={() => removeVehiclePhoto(v._id)} disabled={photoUploading} className="bg-gray-700 hover:bg-gray-600 disabled:opacity-70 text-white px-3 py-2 rounded-lg transition text-sm w-full md:w-auto">Remove Photo</button>
                    )}
                    {editingId === v._id ? null : (
                      <>
                        <button onClick={() => startEdit(v)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm w-full md:w-auto"><FaEdit /> Edit</button>
                        <button onClick={() => deleteVehicle(v._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm w-full md:w-auto"><FaTrash /> Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hidden inputs for uploads */}
        <input ref={cardFileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onCardPhotoSelected} className="hidden" />
      </div>
    </div>
  );
}