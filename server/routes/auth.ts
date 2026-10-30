import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    // Check duplicate
    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    // Hash password with bcrypt
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({
      name,
      email,
      password_hash,
      role: 'USER'
    });

    // Set session
    if (req.session) {
      (req.session as any).userId = newUser.id;
    }

    const { password_hash: _, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Account successfully registered.',
      user: safeUser,
      token: String(newUser.id)
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed due to an internal server error.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ error: 'This account has been deactivated. Please contact an administrator.' });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (req.session) {
      (req.session as any).userId = user.id;
    }

    const { password_hash: _, ...safeUser } = user;
    res.json({
      message: 'Login successful.',
      user: safeUser,
      token: String(user.id)
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed due to an internal server error.' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout session destroy error:', err);
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully.' });
    });
  } else {
    res.json({ message: 'Logged out successfully.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  if (!req.user) {
    res.json({ user: null });
    return;
  }
  const { password_hash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// PUT /api/auth/profile
authRouter.put('/profile', (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const updates: { name?: string; email?: string; password_hash?: string } = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        res.status(400).json({ error: 'Please provide a valid email address.' });
        return;
      }
      const existing = db.findUserByEmail(email.trim());
      if (existing && existing.id !== req.user.id) {
        res.status(409).json({ error: 'This email is already in use by another account.' });
        return;
      }
      updates.email = email.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required to set a new password.' });
        return;
      }
      const valid = bcrypt.compareSync(currentPassword, req.user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Current password is incorrect.' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        return;
      }
      const salt = bcrypt.genSaltSync(10);
      updates.password_hash = bcrypt.hashSync(newPassword, salt);
    }

    const updatedUser = db.updateUserProfile(req.user.id, updates);
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { password_hash: _, ...safeUser } = updatedUser;
    res.json({
      message: 'Profile updated successfully.',
      user: safeUser
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

