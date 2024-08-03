'use client'
import Image from "next/image";
import { useState,useEffect } from "react";
import {firestore} from "@/firebase";
import {Box, Modal, Stack, TextField, Typography, Button} from "@mui/material"
import { collection, getDocs, query, setDoc, deleteDoc, getDoc, doc, updateDoc } from "firebase/firestore";
export default function Home() {

// adding helper funcitons
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false)
  // to store the name of the items
  const [itemName, setItemname] = useState("")
  
  // fetch inventory from firebase VVI for 
  const updateInventory = async () => {

    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })

    setInventory(inventoryList)
    }
  
    const removeItem = async (item) => {
      try {
        const docRef  = doc(firestore, "inventory", item)
        const docSnap = await getDoc(docRef)
    
        if(docSnap.exists()){
          const {quantity} = docSnap.data()
          if(quantity==1){
            await deleteDoc(docRef)
          }
          else{
            await updateDoc(docRef, {quantity: quantity-1})
          }
        }
    
        await updateInventory()
      } catch (error) {
        console.error("Error removing item:", error)
      }
    }
    const addItem = async (item) => {
      try {
        const docRef = doc(firestore, "inventory", item);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
          const { quantity } = docSnap.data();
          await updateDoc(docRef, { quantity: quantity + 1 });
        } else {
          await setDoc(docRef, { quantity: 1 });
        }
    
        await updateInventory();
      } catch (error) {
        console.error("Error adding item:", error);
      }
    };
  
  useEffect(()=>{
    updateInventory()
  },[])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
  <Box width="100vw" flexDirection="column" height="100vh" display="flex" justifyContent = "center" alignItems="Center" gap={2}>
    <Modal open={open} onClose={handleClose}>
      <Box position="absolute" top="50%" left="50%" width={400} bgcolor="white" border="2px solid #000" boxShadow={24} p={4} display="flex" flexDirection="column" gap={3}
      sx={{
        transform: "translate(-50%,-50%)",
      }}
      >
        <Typography variant="h6">Add Item</Typography>
        <Stack width="100%" direction="row" spacing={2}>
          <TextField variant="outlined" fullWidth value={itemName}
          onChange={(e)=> {
            setItemname(e.target.value)
          }}
            />

            <Button variant="outlined" onClick ={() =>{
              addItem(itemName)
              setItemname("")
              handleClose()
            }}
            >Add</Button>
        </Stack>
      </Box>
    </Modal>

    <Button variant="contained" onClick={()=>{
      handleOpen()
    }}>
      Add New Item</Button>
    <Box border="1px solid #333">
      <Box width="800px" height="100px" bgcolor="#ADDBE6" display="flex" justifyContent="center" alignItems="center"> 
      <Typography variant="h2" color="#333">
        Inventory Items
      </Typography>
      </Box>
    <Stack width="800px" height="300px" spacing={2} overflow="auto">
      {inventory.map(({name, quantity})=> (
          <Box key={name} width="100%" minHeight="150px" display="flex" alignItems="center" justifyContent="space-between" bgcolor="#f0f0f0" padding={5}>
            <Typography variant="h3" textAlign="slice-between">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>

            <Typography variant="h3" textAlign="center">
              {quantity}
            </Typography>

            <Button variant="contained" onClick={() =>{
              removeItem(name)
            }}>
              Remove
            </Button>
          </Box>
        ))}
    </Stack>
    </Box>
  </Box>
  )
  }