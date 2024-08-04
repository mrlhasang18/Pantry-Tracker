'use client'
import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Drawer, List, ListItem, ListItemText, ListItemIcon, Grid, Card, CardContent, CardMedia, Snackbar, IconButton } from '@mui/material';
import { Home as HomeIcon, Inventory as InventoryIcon, Add as AddIcon, Menu as MenuIcon, Close as CloseIcon, Reddit } from '@mui/icons-material';
import { Facebook, LinkedIn, YouTube, Twitter } from '@mui/icons-material';
import { collection, getDocs, query, setDoc, deleteDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { firestore, auth } from "@/firebase";
import ImageCapture from "@/components/ImageCapture";
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import CursorFollower from "../components/CursorFollower";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [theme, setTheme] = useState('light'); 
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        updateInventory();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setFilteredInventory(
      inventory.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [inventory, searchQuery]);

  const updateInventory = async () => {
    if (!user) return;
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const removeItem = async (item) => {
    if (!user) return;
    try {
      const docRef = doc(firestore, "inventory", item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity <= 1) {
          await deleteDoc(docRef);
        } else {
          await updateDoc(docRef, { quantity: quantity - 1 });
        }
      }

      await updateInventory();
      setSnackbarMessage(`Removed one ${item}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const addItem = async () => {
    if (!user || !itemName.trim()) return;
    try {
      const docRef = doc(firestore, "inventory", itemName.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await updateDoc(docRef, { quantity: quantity + itemQuantity });
      } else {
        await setDoc(docRef, { quantity: itemQuantity });
      }

      await updateInventory();
      setItemName("");
      setItemQuantity(1);
      setSnackbarMessage(`Added ${itemQuantity} ${itemName}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleItemDetected = (item) => {
    setItemName(item);
    setShowImageCapture(false);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold' }}>Level-up your work and life</Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Follow our socials for career advice, jobseeker tips and savings hacks to make life easy 🌴.
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {[
                { name: 'Reddit', icon: Reddit, color: '#FF4500', link: 'https://www.reddit.com/lamalhasang/' },
                { name: 'LinkedIn', icon: LinkedIn, color: '#0A66C2', link: 'https://www.linkedin.com/tulku18/' },
                { name: 'YouTube', icon: YouTube, color: '#FF0000', link: 'https://www.youtube.com/@lhasanglama8171' },
                { name: 'Twitter', icon: Twitter, color: '#1DA1F2', link: 'https://x.com/tulku14383' },
              ].map((social) => (
                <Grid item key={social.name}>
                  <IconButton
                    component="a"
                    href={`https://www.${social.name.toLowerCase()}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: 'white',
                      '&:hover': { backgroundColor: '#f0f0f0' },
                      transition: 'background-color 0.3s',
                    }}
                  >
                    <social.icon sx={{ color: social.color }} />
                  </IconButton>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 'inventory':
        return (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Typography variant="h4" sx={{ mb: 2 }}>Laventory</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your smart inventory management solution
            </Typography>
            <Grid container spacing={3}>
              {filteredInventory.map(({ name, quantity }) => (
                <Grid item xs={12} sm={6} md={4} key={name}>
                  <Card sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={`/api/placeholder/400/320?text=${encodeURIComponent(name)}`}
                      alt={name}
                    />
                    <CardContent>
                      <Typography variant="h6">{name}</Typography>
                      <Typography variant="body2">Quantity: {quantity}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button size="small" onClick={() => removeItem(name)}>Remove</Button>
                        <Button size="small" onClick={() => addItem(name, 1)}>Add</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 'addItems':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Add Items</Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter item name"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="Enter quantity"
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={addItem} 
              sx={{ mr: 2 }}
            >
              Add Item
            </Button>
            <Button variant="outlined" onClick={() => setShowImageCapture(true)}>
              Add with Camera
            </Button>
            {showImageCapture && (
              <ImageCapture onItemDetected={handleItemDetected} />
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CursorFollower/>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 250, bgcolor: 'primary.main', color: 'white', height: '100%' }}
          role="presentation"
        >
          <List>
            <ListItem>
              <ListItemText primary="Laventory" primaryTypographyProps={{ variant: 'h6' }} />
            </ListItem>
            {user && (
              <ListItem>
                <ListItemText primary={user.email} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            )}
            <ListItem button onClick={() => { setActivePage('home'); setDrawerOpen(false); }}>
              <ListItemIcon><HomeIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => { setActivePage('inventory'); setDrawerOpen(false); }}>
              <ListItemIcon><InventoryIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Inventory" />
            </ListItem>
            <ListItem button onClick={() => { setActivePage('addItems'); setDrawerOpen(false); }}>
              <ListItemIcon><AddIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Add Items" />
            </ListItem>
          </List>
          <Box sx={{ position: 'absolute', bottom: 16, width: '100%' }}>
            <ListItem button onClick={handleSignOut}>
              <ListItemText primary="Logout" />
            </ListItem>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            Laventory
          </Typography>
          {user ? (
            <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
          ) : (
            <Button color="inherit" onClick={handleGoogleSignIn}>Sign In</Button>
          )}
        </Box>
        {renderContent()}
      </Box>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}