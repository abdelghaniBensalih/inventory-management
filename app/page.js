"use client";

import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Function to update the inventory from Firestore
  const updateInventory = async () => {
    const categorySnapshot = await getDocs(collection(firestore, "inventory"));
    const inventoryList = [];
    const categoriesList = [];

    for (const categoryDoc of categorySnapshot.docs) {
      const itemsSnapshot = await getDocs(
        collection(firestore, "inventory", categoryDoc.id, "items")
      );

      const items = itemsSnapshot.docs.map((itemDoc) => ({
        name: itemDoc.id,
        ...itemDoc.data(),
      }));

      inventoryList.push({
        category: categoryDoc.id,
        items,
      });

      categoriesList.push(categoryDoc.id);
    }

    setInventory(inventoryList);
    setCategories(categoriesList);
    setFilteredInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    setFilteredInventory(
      inventory
        .filter(
          (category) =>
            (selectedCategory === "" ||
              category.category === selectedCategory) &&
            category.items.some((item) =>
              item.name.toLowerCase().includes(filter.toLowerCase())
            )
        )
        .map((category) => ({
          ...category,
          items: category.items.filter((item) =>
            item.name.toLowerCase().includes(filter.toLowerCase())
          ),
        }))
    );
  }, [filter, inventory, selectedCategory]);

  const addItem = async (item, category) => {
    const docRef = doc(
      collection(firestore, "inventory", category, "items"),
      item
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const reduceItem = async (item, category) => {
    const docRef = doc(firestore, "inventory", category, "items", item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const removeItem = async (item, category) => {
    const docRef = doc(firestore, "inventory", category, "items", item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredInventory.length / ITEMS_PER_PAGE)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPaginatedItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = [];
    filteredInventory.forEach(({ category, items }) => {
      if (startIndex < items.length) {
        paginatedItems.push({
          category,
          items: items.slice(startIndex, Math.min(endIndex, items.length)),
        });
      }
    });
    return paginatedItems;
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgcolor="#f5f5f5"
      overflow="auto" // Allow scrolling
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="90%"
          maxWidth="400px"
          bgcolor="#fff"
          borderRadius={2}
          boxShadow={3}
          display="flex"
          flexDirection="column"
          gap={2}
          p={3}
        >
          <Typography variant="h6" color="#333">
            Add Item
          </Typography>
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName, itemCategory);
                setItemName("");
                setItemCategory("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Typography
        variant="h4"
        sx={{
          color: "#333",
          margin: "20px 0",
          backgroundColor: "#e3f2fd",
          padding: "10px",
          textAlign: "center",
          width: "100%",
          fontWeight: "bold",
          borderRadius: 2,
        }}
      >
        Welcome to your Inventory Management
      </Typography>

      <Box border="1px solid #ddd" width="100%" maxWidth="1200px" padding={2}>
        <Box
          height="80px"
          bgcolor="#bbdefb"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius={1}
          marginBottom={2}
        >
          <Typography variant="h5" color="#333">
            All your Inventory Items
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          padding={2}
          gap={2}
          marginBottom={2}
        >
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Add New Item
          </Button>
          <Typography variant="h6" color="#333">
            Total:{" "}
            {filteredInventory.reduce(
              (sum, category) => sum + category.items.length,
              0
            )}{" "}
            items
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems="center"
          padding={2}
          gap={2}
          marginBottom={2}
        >
          <TextField
            label="Filter items"
            variant="outlined"
            fullWidth
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel id="filter-category-label">Category</InputLabel>
            <Select
              labelId="filter-category-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Stack width="100%" maxHeight="60vh" overflow="auto" padding={2}>
          {getPaginatedItems().map(({ category, items }) => (
            <Box key={category} marginBottom={2}>
              <Typography variant="h6" color="#333">
                {category}
              </Typography>
              {items.map(({ name, quantity }) => (
                <Box
                  key={name}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                  padding={2}
                  bgcolor="#e3f2fd"
                  borderRadius={1}
                  boxShadow={1}
                  marginBottom={1}
                >
                  <Typography variant="h5" color="#333">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h6" color="#333">
                    Quantity: {quantity}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => addItem(name, category)}
                    >
                      Add
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => reduceItem(name, category)}
                    >
                      Reduce
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => removeItem(name, category)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Box>
          ))}
        </Stack>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          padding={2}
        >
          <Button
            variant="contained"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Typography variant="body1" color="#333" marginX={2}>
            Page {currentPage} of{" "}
            {Math.ceil(filteredInventory.length / ITEMS_PER_PAGE)}
          </Typography>
          <Button
            variant="contained"
            onClick={handleNextPage}
            disabled={
              currentPage ===
              Math.ceil(filteredInventory.length / ITEMS_PER_PAGE)
            }
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
