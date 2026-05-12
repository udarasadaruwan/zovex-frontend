import React, { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import {
  deleteProfileImage,
  requestProfilePasswordOtp,
  updatePassword,
  updateProfile,
  uploadProfileImage
} from '../services/userService';

export default function ProfileSettings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    line1: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', otp: '', password: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || '',
      phone: user.phone || '',
      line1: user.address?.line1 || '',
      city: user.address?.city || '',
      postalCode: user.address?.postalCode || '',
      country: user.address?.country || ''
    });
  }, [user]);

  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updatePasswordField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const updatedUser = await updateProfile({
        name: form.name,
        phone: form.phone,
        address: {
          line1: form.line1,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country
        }
      });
      setUser(updatedUser);
      setMessage('Profile updated.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update profile.');
    }
  };

  const handleImageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }

    try {
      const updatedUser = await uploadProfileImage(imageFile);
      setUser(updatedUser);
      setImageFile(null);
      setMessage('Profile image updated.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to upload profile image.');
    }
  };

  const handleDeleteImage = async () => {
    setMessage('');
    setError('');

    try {
      const updatedUser = await deleteProfileImage();
      setUser(updatedUser);
      setMessage('Profile image removed.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete profile image.');
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await updatePassword(passwordForm);
      setPasswordForm({ currentPassword: '', otp: '', password: '' });
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update password.');
    }
  };

  const handlePasswordOtpRequest = async () => {
    setMessage('');
    setError('');

    try {
      const response = await requestProfilePasswordOtp();
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send password OTP.');
    }
  };

  return (
    <section className="profile-page">
      <div className="dashboard-heading">
        <p className="eyebrow">Profile settings</p>
        <h1>Manage your account</h1>
        <p>Update your personal information, delivery address, and profile image.</p>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="alert">{error}</div>}

      <div className="profile-grid">
        <section className="dashboard-panel">
          <div>
            <p className="eyebrow">Account image</p>
            <h2>Profile photo</h2>
          </div>
          <div className="profile-avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user?.name?.charAt(0) || 'U'}</span>}
          </div>
          <form className="image-form" onSubmit={handleImageSubmit}>
            <label className="field" htmlFor="avatar">
              <span>Upload new image</span>
              <input
                className="file-input"
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              />
            </label>
            <div className="quick-actions">
              <Button>Change image</Button>
              <Button type="button" variant="ghost" onClick={handleDeleteImage}>
                Delete image
              </Button>
            </div>
          </form>
        </section>

        <section className="dashboard-panel">
          <div>
            <p className="eyebrow">Personal details</p>
            <h2>Profile information</h2>
          </div>
          <form className="product-form" onSubmit={handleProfileSubmit}>
            <Input id="name" name="name" label="Full name" value={form.name} onChange={updateField} required />
            <Input id="phone" name="phone" label="Phone" value={form.phone} onChange={updateField} />
            <Input id="line1" name="line1" label="Address line" value={form.line1} onChange={updateField} />
            <Input id="city" name="city" label="City" value={form.city} onChange={updateField} />
            <Input id="postalCode" name="postalCode" label="Postal code" value={form.postalCode} onChange={updateField} />
            <Input id="country" name="country" label="Country" value={form.country} onChange={updateField} />
            <Button>Save profile</Button>
          </form>
        </section>

        <section className="dashboard-panel profile-password-panel">
          <div>
            <p className="eyebrow">Security</p>
            <h2>Change password</h2>
          </div>
          <div className="security-note">
            A one-time code will be sent to {user?.email}. Enter it here before saving the new password.
          </div>
          <form className="product-form" onSubmit={handlePasswordSubmit}>
            <Input
              id="currentPassword"
              name="currentPassword"
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={updatePasswordField}
            />
            <Input
              id="otp"
              name="otp"
              label="Email OTP"
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              value={passwordForm.otp}
              onChange={updatePasswordField}
              required
            />
            <Input
              id="password"
              name="password"
              label="New password"
              type="password"
              minLength={6}
              value={passwordForm.password}
              onChange={updatePasswordField}
              required
            />
            <div className="password-actions">
              <Button type="button" variant="secondary" onClick={handlePasswordOtpRequest}>
                Send OTP
              </Button>
              <Button>Update password</Button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}
