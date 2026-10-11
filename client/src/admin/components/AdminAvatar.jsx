import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAdminPhoto } from '../hooks/useAdminPhoto.js';
import Avatar from './Avatar.jsx';

// The admin's profile photo when one is saved, otherwise the usual initials avatar.
function AdminAvatar({ name, seed, size = 40 }) {
  const { admin } = useApp();
  const photo = useAdminPhoto(admin);

  if (!photo) return <Avatar name={name} seed={seed} size={size} />;

  return (
    <img
      src={photo}
      alt={name || 'Admin'}
      width={size}
      height={size}
      style={{ display: 'block', width: size, height: size, flex: 'none', borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}

export default AdminAvatar;