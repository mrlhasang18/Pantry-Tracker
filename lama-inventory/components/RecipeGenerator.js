const RecipeGenerator = {
    generateRecipe: async (ingredients) => {
      const API_KEY = process.env.REACT_APP_RECIPE_API_KEY;
      const API_URL = 'https://api.spoonacular.com/recipes/findByIngredients';
    
      try {
        const ingredientsString = ingredients.join(',');
        const response = await fetch(`${API_URL}?apiKey=${API_KEY}&ingredients=${ingredientsString}&number=1`);
        const data = await response.json();
    
        if (data && data.length > 0) {
          const recipe = data[0];
          const recipeDetails = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${API_KEY}`);
          const recipeData = await recipeDetails.json();
          
          return {
            name: recipe.title,
            ingredients: recipeData.extendedIngredients.map(ingredient => ingredient.original),
            instructions: recipeData.instructions.replace(/<[^>]*>/g, '').split('\n').filter(step => step.trim() !== ''),
            image: recipe.image,
          };
        } else {
          console.error('No recipe found');
          return null;
        }
      } catch (error) {
        console.error('Error generating recipe:', error);
        return null;
      }
    }
  };
  
  export default RecipeGenerator;