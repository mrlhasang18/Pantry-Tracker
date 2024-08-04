"use client"
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button, TextField, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      {auth.currentUser ? (
        <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
      ) : (
        <Button color="inherit" onClick={handleClickOpen}>Sign In</Button>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleEmailAuth}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            {error && <Typography color="error">{error}</Typography>}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
          </Button>
          <Button onClick={handleEmailAuth}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          <Button onClick={handleGoogleSignIn}>
            Sign In with Google
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Auth;