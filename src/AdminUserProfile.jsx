import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function AdminUserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', secondName: '', email: '', phone: '' });
  const [copiedVehicleId, setCopiedVehicleId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const [uRes, vRes] = await Promise.all([
          fetch(`http://localhost:5000/api/admin/users/${id}?stats=true`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/admin/users/${id}/vehicles`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const uData = await uRes.json();
        if (!uRes.ok) throw new Error(uData?.error || 'Failed to load user');
        const vData = await vRes.json();
        if (!vRes.ok) throw new Error(vData?.error || 'Failed to load vehicles');
        setUser(uData);
        setVehicles(vData);
        setEditForm({
          firstName: uData.firstName || '',
          secondName: uData.secondName || '',
          email: uData.email || '',
          phone: uData.phone || ''
        });
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const saveBasic = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update');
      setUser(data);
    } catch (e) {
      setError(e.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-gray-100 p-6">Loading...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-gray-100 p-6">{error}</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">User Profile (Admin View)</h1>
          <Link to="/admin/participants" className="text-sm text-gray-300 hover:text-white">← Back to Participants</Link>
        </div>

        {/* Header card (match Profile layout) */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 border border-gray-600">
                {user.profilePhotoUrl ? (
                  <img src={user.profilePhotoUrl} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No photo</div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.firstName} {user.secondName}</h2>
                <div className="text-green-100">{user.email}</div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>Role: <span className="capitalize text-gray-200">{user.role}</span></div>
              <div>Verified: <span className={user.isEmailVerified ? 'text-green-400' : 'text-gray-400'}>{user.isEmailVerified ? 'Yes' : 'No'}</span></div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicles (read-only) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Vehicles</h3>
                </div>
                <div className="p-6">
                  {vehicles.length === 0 ? (
                    <div className="text-gray-400">No vehicles found.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {vehicles.map(v => (
                        <div key={v._id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex gap-4 items-center">
                          <div className="w-24 h-16 bg-gray-800 border border-gray-700 rounded overflow-hidden flex-shrink-0">
                            {v.photoUrl ? (
                              <img src={v.photoUrl} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No photo</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-semibold">{v.make} {v.model}</div>
                            <div className="text-gray-400 text-sm flex items-center gap-2">
                              <span>{v.type} • {v.year || 'N/A'} •</span>
                              <span className="text-gray-300 font-mono">{v.registrationNumber}</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(v.registrationNumber || '');
                                    setCopiedVehicleId(v._id);
                                    setTimeout(() => setCopiedVehicleId(null), 1500);
                                  } catch (e) {
                                    alert('Copy failed');
                                  }
                                }}
                                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                              >
                                {copiedVehicleId === v._id ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information (editable) */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">First Name</label>
                    <input className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2" value={editForm.firstName} onChange={e=>setEditForm({...editForm, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                    <input className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2" value={editForm.secondName} onChange={e=>setEditForm({...editForm, secondName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2" value={editForm.email} onChange={e=>setEditForm({...editForm, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone</label>
                    <input className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2" value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <button onClick={saveBasic} disabled={saving} className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Meta/info */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-400">Created</div>
                  <div className="text-gray-200">{new Date(user.createdAt).toLocaleString()}</div>
                  <div className="text-gray-400">DL Number</div>
                  <div className="text-gray-200">{user.drivingLicenseNumber || '-'}</div>
                  <div className="text-gray-400">License Doc</div>
                  <div className={user.hasLicenseDoc ? 'text-green-400' : 'text-gray-400'}>
                    {user.hasLicenseDoc ? (
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`http://localhost:5000/api/admin/users/${id}/license/url`, { headers: { Authorization: `Bearer ${token}` } });
                            const data = await res.json();
                            if (!res.ok || !data?.url) throw new Error(data?.error || 'Failed to get URL');
                            window.open(data.url, '_blank');
                          } catch (e) {
                            alert(e.message || 'Failed to get download link');
                          }
                        }}
                        className="text-green-400 hover:underline"
                      >
                        Download
                      </button>
                    ) : 'No'}
                  </div>
                  <div className="text-gray-400">Vehicles</div>
                  <div className="text-gray-200">{user.vehicleCount ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}