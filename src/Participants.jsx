import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaUserEdit, FaSave, FaTimes, FaUsers } from 'react-icons/fa';

// Admin Participants page: list and manage non-admin users
export default function Participants() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [roleFilter, setRoleFilter] = useState(''); // '', 'user', 'driver', etc.
  const [verifiedFilter, setVerifiedFilter] = useState(''); // '', 'true', 'false'
  const [search, setSearch] = useState('');

  // Editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (verifiedFilter) params.append('verified', verifiedFilter);
      // ask for stats: vehicleCount and hasLicenseDoc
      params.append('stats', 'true');
      const res = await fetch(`http://localhost:5000/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch users');
      setUsers(data);
    } catch (e) {
      setError(e.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, verifiedFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.firstName + ' ' + u.secondName).toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditForm({
      firstName: u.firstName || '',
      secondName: u.secondName || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'user',
      isEmailVerified: !!u.isEmailVerified,
      dob: u.dob ? u.dob.substring(0, 10) : '',
      drivingLicenseNumber: u.drivingLicenseNumber || ''
    });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update user');
      setUsers(prev => prev.map(u => (u._id === data._id ? data : u)));
      setEditingId(null);
      setEditForm({});
    } catch (e) {
      setError(e.message || 'Failed to update user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6 scrollbar-dark">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUsers className="text-green-500" />
              Participants
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={fetchUsers} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm">Refresh</button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
              <FaSearch className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone"
                className="w-full bg-transparent focus:outline-none text-sm placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm">
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <div>
              <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm">
                <option value="">Any Verification</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6">
            {error && (
              <div className="text-sm text-red-200 bg-red-900/40 border border-red-700 px-3 py-2 rounded mb-4">{error}</div>
            )}

            {loading ? (
              <div className="text-gray-400">Loading users...</div>
            ) : filtered.length === 0 ? (
              <div className="text-gray-400">No users found.</div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filtered.map(u => (
                    <div key={u._id} className="border border-gray-700 rounded-lg p-4 bg-gray-900/40">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">
                          {editingId === u._id ? (
                            <div className="flex gap-2">
                              <input value={editForm.firstName} onChange={(e)=>setEditForm({...editForm, firstName:e.target.value})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-28" />
                              <input value={editForm.secondName} onChange={(e)=>setEditForm({...editForm, secondName:e.target.value})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-28" />
                            </div>
                          ) : (
                            <Link to={`/dashboard/users/${u._id}`} className="text-white hover:underline">{u.firstName} {u.secondName}</Link>
                          )}
                        </div>
                        <div className="shrink-0">
                          {editingId === u._id ? (
                            <div className="flex gap-2">
                              <button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-2 text-xs"><FaSave /> Save</button>
                              <button onClick={()=>{setEditingId(null); setEditForm({});}} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-2 text-xs"><FaTimes /> Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => startEdit(u)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-2 text-xs"><FaUserEdit /> Edit</button>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">Email</span>
                        <div className="flex-1 text-right">
                          {editingId === u._id ? (
                            <input value={editForm.email} onChange={(e)=>setEditForm({...editForm, email:e.target.value})} className="w-full max-w-[220px] bg-gray-900 border border-gray-700 rounded px-2 py-1" />
                          ) : (
                            <span className="break-all">{u.email}</span>
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">Phone</span>
                        <div className="flex-1 text-right">
                          {editingId === u._id ? (
                            <input value={editForm.phone} onChange={(e)=>setEditForm({...editForm, phone:e.target.value})} className="w-full max-w-[180px] bg-gray-900 border border-gray-700 rounded px-2 py-1" />
                          ) : (
                            <span>{u.phone}</span>
                          )}
                        </div>
                      </div>

                      {/* Role */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">Role</span>
                        <div className="flex-1 text-right">
                          {editingId === u._id ? (
                            <select value={editForm.role} onChange={(e)=>setEditForm({...editForm, role:e.target.value})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1">
                              <option value="user">User</option>
                              <option value="driver">Driver</option>
                            </select>
                          ) : (
                            <span className="capitalize">{u.role}</span>
                          )}
                        </div>
                      </div>

                      {/* Verified */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">Verified</span>
                        <div className="flex-1 text-right">
                          {editingId === u._id ? (
                            <select value={String(editForm.isEmailVerified)} onChange={(e)=>setEditForm({...editForm, isEmailVerified: e.target.value === 'true'})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1">
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <span className={u.isEmailVerified ? 'text-green-400' : 'text-gray-400'}>{u.isEmailVerified ? 'Yes' : 'No'}</span>
                          )}
                        </div>
                      </div>

                      {/* Attempts */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">Attempts</span>
                        <div className="flex-1 text-right text-gray-300">{u.failedLoginAttempts ?? 0}</div>
                      </div>

                      {/* Blocked */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">Blocked</span>
                        <div className="flex-1 text-right">
                          <span className={u.isBlocked ? 'text-red-400' : 'text-gray-300'}>{u.isBlocked ? 'Yes' : 'No'}</span>
                        </div>
                      </div>

                      {/* Created */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">Created</span>
                        <div className="flex-1 text-right text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</div>
                      </div>

                      {/* DL No */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">DL No</span>
                        <div className="flex-1 text-right">
                          {editingId === u._id ? (
                            <input value={editForm.drivingLicenseNumber} onChange={(e)=>setEditForm({...editForm, drivingLicenseNumber:e.target.value})} className="w-full max-w-[180px] bg-gray-900 border border-gray-700 rounded px-2 py-1" />
                          ) : (
                            <span>{u.drivingLicenseNumber || '-'}</span>
                          )}
                        </div>
                      </div>

                      {/* License Doc */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">License Doc</span>
                        <div className="flex-1 text-right">
                          <span className={u.hasLicenseDoc ? 'text-green-400' : 'text-gray-400'}>{u.hasLicenseDoc ? 'Yes' : 'No'}</span>
                        </div>
                      </div>

                      {/* Vehicles */}
                      <div className="flex justify-between gap-3 py-1">
                        <span className="text-gray-400 w-28">Vehicles</span>
                        <div className="flex-1 text-right text-gray-300">{u.vehicleCount ?? 0}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto scrollbar-dark">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-300 border-b border-gray-700">
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Phone</th>
                        <th className="py-2 pr-4">Role</th>
                        <th className="py-2 pr-4">Verified</th>
                        <th className="py-2 pr-4">Attempts</th>
                        <th className="py-2 pr-4">Blocked</th>
                        <th className="py-2 pr-4">Created</th>
                        <th className="py-2 pr-4">DL No</th>
                        <th className="py-2 pr-4">License Doc</th>
                        <th className="py-2 pr-4">Vehicles</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(u => (
                        <tr key={u._id} className="border-b border-gray-800">
                          <td className="py-2 pr-4">
                            {editingId === u._id ? (
                              <div className="flex gap-2">
                                <input value={editForm.firstName} onChange={(e)=>setEditForm({...editForm, firstName:e.target.value})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-28" />
                                <input value={editForm.secondName} onChange={(e)=>setEditForm({...editForm, secondName:e.target.value})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-28" />
                              </div>
                            ) : (
                              <Link to={`/dashboard/users/${u._id}`} className="text-white hover:underline">{u.firstName} {u.secondName}</Link>
                            )}
                          </td>
                          <td className="py-2 pr-4">
                            {editingId === u._id ? (
                              <input value={editForm.email} onChange={(e)=>setEditForm({...editForm, email:e.target.value})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-56" />
                            ) : (
                              <span>{u.email}</span>
                            )}
                          </td>
                          <td className="py-2 pr-4">
                            {editingId === u._id ? (
                              <input value={editForm.phone} onChange={(e)=>setEditForm({...editForm, phone:e.target.value})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-40" />
                            ) : (
                              <span>{u.phone}</span>
                            )}
                          </td>
                          <td className="py-2 pr-4">
                            {editingId === u._id ? (
                              <select value={editForm.role} onChange={(e)=>setEditForm({...editForm, role:e.target.value})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1">
                                <option value="user">User</option>
                                <option value="driver">Driver</option>
                              </select>
                            ) : (
                              <span className="capitalize">{u.role}</span>
                            )}
                          </td>
                          <td className="py-2 pr-4">
                            {editingId === u._id ? (
                              <select value={String(editForm.isEmailVerified)} onChange={(e)=>setEditForm({...editForm, isEmailVerified: e.target.value === 'true'})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1">
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            ) : (
                              <span className={u.isEmailVerified ? 'text-green-400' : 'text-gray-400'}>{u.isEmailVerified ? 'Yes' : 'No'}</span>
                            )}
                          </td>
                          <td className="py-2 pr-4 text-gray-300">{u.failedLoginAttempts ?? 0}</td>
                          <td className="py-2 pr-4">
                            <span className={u.isBlocked ? 'text-red-400' : 'text-gray-300'}>{u.isBlocked ? 'Yes' : 'No'}</span>
                          </td>
                          <td className="py-2 pr-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 pr-4">
                            {editingId === u._id ? (
                              <input value={editForm.drivingLicenseNumber} onChange={(e)=>setEditForm({...editForm, drivingLicenseNumber:e.target.value})} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-40" />
                            ) : (
                              <span>{u.drivingLicenseNumber || '-'}</span>
                            )}
                          </td>
                          <td className="py-2 pr-4">
                            <span className={u.hasLicenseDoc ? 'text-green-400' : 'text-gray-400'}>{u.hasLicenseDoc ? 'Yes' : 'No'}</span>
                          </td>
                          <td className="py-2 pr-4 text-gray-300">{u.vehicleCount ?? 0}</td>
                          <td className="py-2 pr-4">
                            {editingId === u._id ? (
                              <div className="flex gap-2">
                                <button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-2 text-xs"><FaSave /> Save</button>
                                <button onClick={()=>{setEditingId(null); setEditForm({});}} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-2 text-xs"><FaTimes /> Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => startEdit(u)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-2 text-xs"><FaUserEdit /> Edit</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}