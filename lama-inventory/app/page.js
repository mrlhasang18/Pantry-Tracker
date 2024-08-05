'use client'
import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Drawer, List, ListItem, ListItemText, ListItemIcon, Grid, Card, CardContent, Snackbar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Home as HomeIcon, Inventory as InventoryIcon, Add as AddIcon, Menu as MenuIcon, Close as CloseIcon, Restaurant as RecipeIcon } from '@mui/icons-material';
import { Reddit, LinkedIn, YouTube, Twitter } from '@mui/icons-material';
import { collection, getDocs, query, setDoc, deleteDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { firestore, auth } from "@/firebase";
import ImageCapture from "@/components/ImageCapture";
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import CursorFollower from "../components/CursorFollower";
import RecipeGenerator from '../components/RecipeGenerator';


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
  const [recipes, setRecipes] = useState([]);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        updateInventory();
      } else {
        setInventory([]);
        setRecipes([]);
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
    const inventoryRef = collection(firestore, `users/${user.uid}/inventory`);
    const snapshot = await getDocs(inventoryRef);
    const inventoryList = [];
    snapshot.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (nameToAdd, quantityToAdd) => {
    if (!user) return;
    const itemNameToAdd = nameToAdd || itemName.trim();
    const itemQuantityToAdd = parseInt(quantityToAdd) || parseInt(itemQuantity);
  
    if (!itemNameToAdd || isNaN(itemQuantityToAdd)) return;
  
    try {
      const inventoryRef = collection(firestore, `users/${user.uid}/inventory`);
      const itemRef = doc(inventoryRef, itemNameToAdd);
      const itemSnap = await getDoc(itemRef);
  
      if (itemSnap.exists()) {
        const { quantity } = itemSnap.data();
        await updateDoc(itemRef, { quantity: quantity + itemQuantityToAdd });
      } else {
        await setDoc(itemRef, { quantity: itemQuantityToAdd });
      }
  
      await updateInventory();
      setSnackbarMessage(`Added ${itemQuantityToAdd} ${itemNameToAdd}`);
      setSnackbarOpen(true);
      
      setItemName("");
      setItemQuantity(1);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };
  
  const removeItem = async (item) => {
    if (!user) return;
    try {
      const inventoryRef = collection(firestore, `users/${user.uid}/inventory`);
      const itemRef = doc(inventoryRef, item);
      const itemSnap = await getDoc(itemRef);
  
      if (itemSnap.exists()) {
        const { quantity } = itemSnap.data();
        if (quantity <= 1) {
          await deleteDoc(itemRef);
        } else {
          await updateDoc(itemRef, { quantity: quantity - 1 });
        }
      }
  
      await updateInventory();
      setSnackbarMessage(`Removed one ${item}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error removing item:", error);
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

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      setSnackbarMessage("Please select at least one ingredient");
      setSnackbarOpen(true);
      return;
    }
    
    const newRecipe = await RecipeGenerator.generateRecipe(selectedIngredients);
    if (newRecipe) {
      const existingRecipe = recipes.find(r => r.name === newRecipe.name);
      if (existingRecipe) {
        setSnackbarMessage(`Recipe "${newRecipe.name}" already exists in your recipes.`);
        setSnackbarOpen(true);
      } else {
        setRecipes(prevRecipes => [...prevRecipes, newRecipe]);
        setSelectedRecipe(newRecipe);
      }
    } else {
      setSnackbarMessage("Couldn't generate a recipe with the selected ingredients");
      setSnackbarOpen(true);
    }
    setRecipeDialogOpen(false);
  };


  const RecipeDialog = () => {
    if (!selectedRecipe) return null;
  
    return (
      <Dialog open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedRecipe.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Ingredients:</Typography>
              <ul>
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Instructions:</Typography>
              <ol>
                {selectedRecipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRecipe(null)}>Close</Button>
          <Button onClick={() => removeRecipe(selectedRecipe)}>Remove</Button>
        </DialogActions>
      </Dialog>
    );
  };

  
  const removeRecipe = (recipe) => {
    setRecipes(recipes.filter((r) => r !== recipe));
    setSelectedRecipe(null);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold' }}>Welcome to Laventory</Typography>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>Revolutionize Your Inventory Management</Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Laventory is where managing your inventory becomes a seamless and enjoyable experience. Designed for modern businesses, Laventory combines cutting-edge technology with an intuitive interface to help you streamline your operations and stay ahead in the competitive market.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={() => setActivePage('addItems')}
              sx={{ mb: 4 }}
            >
              Get Started
            </Button>
            <Grid container spacing={2} justifyContent="center">
              {[
                { name: 'Reddit', icon: Reddit, color: '#FF4500', link: 'https://www.reddit.com/user/lamalhasang/' },
                { name: 'LinkedIn', icon: LinkedIn, color: '#0A66C2', link: 'https://www.linkedin.com/in/tulku18/' },
                { name: 'YouTube', icon: YouTube, color: '#FF0000', link: 'https://www.youtube.com/@lhasanglama8171' },
                { name: 'Twitter', icon: Twitter, color: '#1DA1F2', link: 'https://x.com/tulku14383' },
              ].map((social) => (
                <Grid item key={social.name}>
                  <IconButton
                    component="a"
                    href={social.link}
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
                  onChange={(e) => setItemQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="contained" 
                  onClick={() => addItem()}
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

            
      case 'recipes':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Recipe Generator</Typography>
            <Button variant="contained" onClick={() => setRecipeDialogOpen(true)} sx={{ mb: 3 }}>
              Generate Recipe
            </Button>
            <Grid container spacing={3}>
              {recipes.map((recipe, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card onClick={() => setSelectedRecipe(recipe)} sx={{ cursor: 'pointer', borderRadius: '16px', overflow: 'hidden' }}>
                    <CardContent>
                      <Typography variant="h6">{recipe.name}</Typography>
                      <Typography variant="body2">{recipe.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
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
            <ListItem button onClick={() => { setActivePage('recipes'); setDrawerOpen(false); }}>
              <ListItemIcon><RecipeIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Recipes" />
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

      <Dialog open={recipeDialogOpen} onClose={() => setRecipeDialogOpen(false)}>
        <DialogTitle>Generate Recipe</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>Select ingredients:</Typography>
          <Grid container spacing={1}>
            {inventory.map((item) => (
              <Grid item key={item.name}>
                <Button
                  variant={selectedIngredients.includes(item.name) ? "contained" : "outlined"}
                  onClick={() => {
                    setSelectedIngredients(prev => 
                      prev.includes(item.name) 
                        ? prev.filter(i => i !== item.name)
                        : [...prev, item.name]
                    );
                  }}
                >
                  {item.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecipeDialogOpen(false)}>Cancel</Button>
          <Button onClick={generateRecipe} variant="contained">Generate Recipe</Button>
        </DialogActions>
      </Dialog>
      <RecipeDialog />
    </Box>
  );
}