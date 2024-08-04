'use client'
import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';

const RecipeGenerator = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [open, setOpen] = useState(false);

  const generateRecipes = async () => {
    try {
      const response = await axios.get('https://api.gemini.com/your-endpoint');
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleOpenDialog = (recipe) => {
    setSelectedRecipe(recipe);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" onClick={generateRecipes} sx={{ mb: 3 }}>
        Generate Recipes
      </Button>
      <Grid container spacing={3}>
        {recipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{recipe.name}</Typography>
                <Typography variant="body2">{recipe.description}</Typography>
                <Button size="small" onClick={() => handleOpenDialog(recipe)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{selectedRecipe?.name}</DialogTitle>
        <DialogContent>
          <Typography>
            {/* Fetch detailed recipe information from Gemini API */}
            Detailed recipe information for {selectedRecipe?.name} would be displayed here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RecipeGenerator;
