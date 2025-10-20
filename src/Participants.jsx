import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFilter,
  FaInfoCircle,
  FaPhoneAlt,
  FaSave,
  FaSearch,
  FaSync,
  FaTimes,
  FaUserEdit,
  FaUsers
} from 'react-icons/fa';
import API_BASE_URL from './config/api';

/* ============================================================================
   CONSTANTS & CONFIGURATION
   ============================================================================ */

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'user', label: 'User' },
  { value: 'driver', label: 'Driver' }
];

const VERIFICATION_OPTIONS = [
  { value: '', label: 'Any Verification' },
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Not Verified' }
];

const BADGE_VARIANTS = {
  accent: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/30',
  positive: 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30',
  negative: 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30',
  neutral: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30'
};

const inputBaseClasses =
  'w-full bg-gray-800/80 border border-gray-600/50 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors';

const badge = (variant) =>
  `${BADGE_VARIANTS[variant]} inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold`;

/* ============================================================================
   UTILITY FUNCTIONS
   ============================================================================ */

const createEditState = (user = {}) => ({
  firstName: user.firstName || '',
  secondName: user.secondName || '',
  email: user.email || '',
  phone: user.phone || '',
  role: user.role || 'user',
  isEmailVerified: Boolean(user.isEmailVerified),
  dob: user.dob ? user.dob.substring(0, 10) : '',
  drivingLicenseNumber: user.drivingLicenseNumber || ''
});

/* ============================================================================
   REUSABLE UI COMPONENTS
   ============================================================================ */

const SectionCard = ({ children }) => (
  <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-3xl border border-gray-700/50 shadow-2xl backdrop-blur-sm overflow-hidden">
    {children}
  </div>
);

const SectionHeader = ({ children, className = '' }) => (
  <div className={`p-8 border-b border-gray-700/50 ${className}`}>{children}</div>
);

const SectionBody = ({ children, className = '' }) => (
  <div className={`p-8 ${className}`}>{children}</div>
);

const EmptyState = () => (
  <div className="text-center py-20">
    <div className="relative mb-8">
      <FaUsers className="text-8xl text-gray-600 mx-auto mb-6 opacity-50" />
      <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-3xl opacity-30" />
    </div>
    <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-600 mb-6">
      No participants found
    </h3>
    <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
      No users match your current search criteria. Try adjusting your filters.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="text-center py-16">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4" />
    <p className="text-gray-300 text-lg">Loading participants...</p>
  </div>
);

const ErrorBanner = ({ message }) => (
  <div className="text-red-200 bg-gradient-to-r from-red-900/60 to-red-800/60 border border-red-600/50 px-6 py-4 rounded-2xl mb-6 backdrop-blur-sm">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-red-500/20 rounded-xl">
        <FaUsers className="text-red-400" />
      </div>
      <span className="font-semibold">{message}</span>
    </div>
  </div>
);

const Badge = ({ variant, icon: Icon, children }) => (
  <span className={badge(variant)}>
    {Icon ? <Icon className="mr-2" /> : null}
    {children}
  </span>
);

const Field = ({ label, value }) => (
  <div>
    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
    <p className="text-white text-sm font-medium">{value || '—'}</p>
  </div>
);

const EditableField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  options = null
}) => (
  <label className="block text-sm text-gray-300">
    <span className="block mb-2 font-medium">{label}</span>
    {options ? (
      <select
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className={`${inputBaseClasses} appearance-none`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        value={value}
        onChange={(event) =>
          onChange(name, type === 'checkbox' ? event.target.checked : event.target.value)
        }
        type={type}
        className={inputBaseClasses}
        placeholder={placeholder}
      />
    )}
  </label>
);

/* ============================================================================
   FILTER SECTION COMPONENT
   ============================================================================ */

const FiltersSection = ({
  searchTerm,
  roleFilter,
  verifiedFilter,
  onSearchChange,
  onRoleChange,
  onVerifiedChange,
  onRefresh
}) => (
  <SectionCard>
    <SectionHeader className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-orange-500/20 rounded-2xl">
          <FaUsers className="text-orange-400 text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600">
            Participants Management
          </h1>
          <p className="text-gray-400 text-lg mt-1">Manage and monitor all registered users</p>
        </div>
      </div>
      <button
        onClick={onRefresh}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-6 py-3 rounded-2xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        <FaSync ssName="text-lg" /> Refresh Data
      </button>
    </SectionHeader>
    <SectionBody>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 text-lg" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, email, or phone number..."
            className="w-full bg-gray-800/60 border border-gray-600 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20  transition-all duration-300"
          />
        </div>
        <div className="relative">
          <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 text-lg" />
          <select
            value={roleFilter}
            onChange={(event) => onRoleChange(event.target.value)}
            className="w-full bg-gray-800/60 border border-gray-600 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20  transition-all duration-300"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={verifiedFilter}
            onChange={(event) => onVerifiedChange(event.target.value)}
            className="w-full bg-gray-800/60 border border-gray-600 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-300"
          >
            {VERIFICATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </SectionBody>
  </SectionCard>
);

/* ============================================================================
   MOBILE CARD COMPONENT
   ============================================================================ */

const MobileCard = ({
  user,
  isEditing,
  editForm,
  onStartEdit,
  onCancelEdit,
  onSave,
  onChange
}) => (
  <div className="relative group">
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 p-6 backdrop-blur-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-orange-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(249,115,22,0.3)]">
              <FaUsers className="text-white text-xl" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  user.isEmailVerified ? 'bg-white' : 'bg-gray-400'
                }`}
              />
            </div>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  value={editForm.firstName}
                  onChange={(event) => onChange('firstName', event.target.value)}
                  className={inputBaseClasses}
                  placeholder="First Name"
                />
                <input
                  value={editForm.secondName}
                  onChange={(event) => onChange('secondName', event.target.value)}
                  className={inputBaseClasses}
                  placeholder="Last Name"
                />
              </div>
            ) : (
              <div>
                <Link
                  to={`/dashboard/users/${user._id}`}
                  className="text-xl font-bold text-white hover:text-orange-400 transition-colors duration-300"
                >
                  {user.firstName} {user.secondName}
                </Link>
                <p className="text-gray-400 text-sm capitalize">
                  {user.role} • {user.isEmailVerified ? 'Verified' : 'Unverified'}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300"
              >
                <FaSave /> Save
              </button>
              <button
                onClick={onCancelEdit}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg transition-all duration-300"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartEdit(user)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
            >
              <FaUserEdit /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700/30">
          <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            Contact Information
          </h4>
          <div className="space-y-3">
            {isEditing ? (
              <>
                <EditableField
                  label="Email"
                  name="email"
                  value={editForm.email}
                  onChange={onChange}
                  type="email"
                  placeholder="Email address"
                />
                <EditableField
                  label="Phone"
                  name="phone"
                  value={editForm.phone}
                  onChange={onChange}
                  placeholder="Phone number"
                />
              </>
            ) : (
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <FaInfoCircle className="text-orange-400" />
                  <span>{user.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhoneAlt className="text-orange-400" />
                  <span>{user.phone || 'No phone number'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700/30">
          <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            Account Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {isEditing ? (
              <>
                <EditableField
                  label="Role"
                  name="role"
                  value={editForm.role}
                  onChange={onChange}
                  options={ROLE_OPTIONS}
                />
                <EditableField
                  label="Email Verified"
                  name="isEmailVerified"
                  value={editForm.isEmailVerified ? 'true' : 'false'}
                  onChange={(field, value) => onChange(field, value === 'true')}
                  options={VERIFICATION_OPTIONS}
                />
                <EditableField
                  label="Date of Birth"
                  name="dob"
                  value={editForm.dob}
                  onChange={onChange}
                  type="date"
                />
                <EditableField
                  label="Driving License"
                  name="drivingLicenseNumber"
                  value={editForm.drivingLicenseNumber}
                  onChange={onChange}
                  placeholder="License number"
                />
              </>
            ) : (
              <>
                <Field label="Role" value={user.role} />
                <Field label="Account" value={user.isEmailVerified ? 'Verified' : 'Unverified'} />
                <Field
                  label="Date of Birth"
                  value={
                    user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'
                  }
                />
                <Field label="License" value={user.drivingLicenseNumber || 'Not provided'} />
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700/30">
          <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            Engagement Summary
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vehicles Registered" value={user.vehicleCount ?? 0} />
            <Field
              label="License Document"
              value={user.hasLicenseDoc ? 'Uploaded' : 'Not uploaded'}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ============================================================================
   DESKTOP TABLE COMPONENT
   ============================================================================ */

const DesktopTable = ({
  users,
  editingId,
  editForm,
  onStartEdit,
  onCancelEdit,
  onSave,
  onChange
}) => (
  <div className="hidden md:block">
    <div className="overflow-x-auto rounded-3xl border border-gray-700/40">
      <table className="min-w-full divide-y divide-gray-700/40">
        <thead className="bg-gray-900/70">
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
            <th className="px-6 py-4">Participant</th>
            <th className="px-6 py-4">Account</th>
            <th className="px-6 py-4">Contact</th>
            <th className="px-6 py-4">Role & License</th>
            <th className="px-6 py-4">Stats</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-900/40 divide-y divide-gray-800/40">
          {users.map((user) => {
            const isEditing = editingId === user._id;
            const formState = isEditing ? editForm : createEditState(user);
            return (
              <tr key={user._id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <FaUsers className="text-white" />
                    </div>
                    <div>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            value={formState.firstName}
                            onChange={(event) => onChange('firstName', event.target.value)}
                            className={inputBaseClasses}
                          />
                          <input
                            value={formState.secondName}
                            onChange={(event) => onChange('secondName', event.target.value)}
                            className={inputBaseClasses}
                          />
                        </div>
                      ) : (
                        <Link
                          to={`/dashboard/users/${user._id}`}
                          className="font-semibold text-white text-sm hover:text-orange-400 transition-colors"
                        >
                          {user.firstName} {user.secondName}
                        </Link>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{user._id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 space-y-2">
                  <Badge variant={user.isEmailVerified ? 'positive' : 'negative'}>
                    {user.isEmailVerified ? 'Verified Account' : 'Unverified'}
                  </Badge>
                  <Badge variant="accent">
                    Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </Badge>
                </td>
                <td className="px-6 py-5">
                  {isEditing ? (
                    <div className="space-y-2">
                      <EditableField
                        label="Email"
                        name="email"
                        value={formState.email}
                        onChange={onChange}
                        type="email"
                      />
                      <EditableField
                        label="Phone"
                        name="phone"
                        value={formState.phone}
                        onChange={onChange}
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <FaInfoCircle className="text-orange-400" />
                        <span>{user.email || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhoneAlt className="text-orange-400" />
                        <span>{user.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    {isEditing ? (
                      <>
                        <EditableField
                          label="Role"
                          name="role"
                          value={formState.role}
                          onChange={onChange}
                          options={ROLE_OPTIONS}
                        />
                        <EditableField
                          label="DOB"
                          name="dob"
                          value={formState.dob}
                          onChange={onChange}
                          type="date"
                        />
                        <EditableField
                          label="Driving License"
                          name="drivingLicenseNumber"
                          value={formState.drivingLicenseNumber}
                          onChange={onChange}
                        />
                        <EditableField
                          label="Verified"
                          name="isEmailVerified"
                          value={formState.isEmailVerified ? 'true' : 'false'}
                          onChange={(field, value) => onChange(field, value === 'true')}
                          options={VERIFICATION_OPTIONS}
                        />
                      </>
                    ) : (
                      <div className="space-y-2 text-sm text-white/80">
                        <p className="font-medium capitalize">{user.role}</p>
                        <p>{user.dob ? new Date(user.dob).toLocaleDateString() : 'DOB not set'}</p>
                        <p>{user.drivingLicenseNumber || 'No license on file'}</p>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 space-y-3">
                  <Badge variant="accent">Vehicles: {user.vehicleCount ?? 0}</Badge>
                  <Badge variant={user.hasLicenseDoc ? 'positive' : 'neutral'}>
                    License Doc {user.hasLicenseDoc ? 'Uploaded' : 'Missing'}
                  </Badge>
                </td>
                <td className="px-6 py-5 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={onSave}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold"
                      >
                        <FaSave /> Save
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onStartEdit(user)}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold"
                    >
                      <FaUserEdit /> Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

/* ============================================================================
   PARTICIPANTS CONTENT COMPONENT
   ============================================================================ */

const ParticipantsContent = ({
  users,
  loading,
  error,
  editingId,
  editForm,
  onStartEdit,
  onCancelEdit,
  onSave,
  onChange
}) => (
  <SectionCard>
    <SectionBody>
      {error && <ErrorBanner message={error} />}
      {loading ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="md:hidden space-y-6">
            {users.map((user) => (
              <MobileCard
                key={user._id}
                user={user}
                isEditing={editingId === user._id}
                editForm={editForm}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onSave={onSave}
                onChange={onChange}
              />
            ))}
          </div>
          <DesktopTable
            users={users}
            editingId={editingId}
            editForm={editForm}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSave={onSave}
            onChange={onChange}
          />
        </>
      )}
    </SectionBody>
  </SectionCard>
);

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

export default function Participants() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (verifiedFilter) params.append('verified', verifiedFilter);
      params.append('stats', 'true');

      const response = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch users');
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, verifiedFilter, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.secondName || ''}`.trim().toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [users, searchTerm]);

  const startEdit = useCallback((user) => {
    setEditingId(user._id);
    setEditForm(createEditState(user));
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm({});
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingId) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update user');
      }

      setUsers((previousUsers) =>
        previousUsers.map((user) => (user._id === data._id ? data : user))
      );
      cancelEdit();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  }, [cancelEdit, editForm, editingId, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <FiltersSection
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          verifiedFilter={verifiedFilter}
          onSearchChange={setSearchTerm}
          onRoleChange={setRoleFilter}
          onVerifiedChange={setVerifiedFilter}
          onRefresh={fetchUsers}
        />

        <ParticipantsContent
          users={filteredUsers}
          loading={loading}
          error={error}
          editingId={editingId}
          editForm={editForm}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={handleSave}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}