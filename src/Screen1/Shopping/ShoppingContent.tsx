import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import CategoryItem from './CategoryItem';
import ProductCard from './ProductCard';
import SmallProductCard from './SmallProductCard';

interface ShoppingContentProps {
  categories: any[];
  products: any[];
  addToCart: (product: any) => void;
}

const ShoppingContent: React.FC<ShoppingContentProps> = ({ categories, products, addToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const getCategoryIcon = (category: string) => {
    return 'category'; // change if you have logic
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const sections = categories.map((cat) => ({
    title: cat.name,
    data: products.filter((p) => p.category === cat.name),
  }));

  const renderSection = ({ item }: { item: { title: string; data: any[] } }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{item.title}</Text>
      <FlatList
        data={item.data}
        renderItem={({ item }) => (
          <SmallProductCard product={item} addToCart={addToCart} />
        )}
        keyExtractor={(item, index) => (item._id ? item._id.toString() : index.toString())}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category List */}
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryItem
            category={item}
            getCategoryIcon={getCategoryIcon}
            onPress={() => setSelectedCategory(item.name)}
            isSelected={selectedCategory === item.name}
          />
        )}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
      />

      {/* Main List */}
      <FlatList
        data={searchText ? [{ title: 'Search Results', data: filteredProducts }] : sections}
        renderItem={
          searchText
            ? ({ item }) => (
                <FlatList
                  data={item.data}
                  renderItem={({ item }) => (
                    <ProductCard product={item} addToCart={addToCart} />
                  )}
                  keyExtractor={(item, index) => (item._id ? item._id.toString() : index.toString())}
                />
              )
            : renderSection
        }
        keyExtractor={(item, index) =>
          item.title ? item.title.toString() : index.toString()
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoryList: { marginBottom: 10 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
  },
});

export default ShoppingContent;






// import { ScrollView, View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import ProductCard from './ProductCard';
// import SmallProductCard from './SmallProductCard';
// import CategoryItem from './CategoryItem';

// // Create context for cart functionality
// export const CartContext = createContext({
//   cartItems: [],
//   addToCart: (product: any) => {},
//   removeFromCart: (productId: string) => {},
//   clearCart: () => {},
// });

// type Product = {
//   _id: string;
//   name: string;
//   description: string;
//   price: number;
//   originalPrice: number;
//   discount: number;
//   category: string;
//   images: string[];
//   createdAt: string;
// };

// type Category = {
//   id: string;
//   name: string;
// };

// type Section = {
//   title: string;
//   data: Product[];
//   viewAll?: () => void;
// };

// const BASE_URL = 'https://fullbackend-g3e5.onrender.com'; // Adjust to your backend IP if needed

// const ShoppingContent: React.FC = () => {
//   const navigation = useNavigation();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [searchText, setSearchText] = useState<string>('');
//   const [selectedCategory, setSelectedCategory] = useState<string>('All');
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [cartItems, setCartItems] = useState<any[]>([]);

//   // Cart functions
//   const addToCart = (product: Product) => {
//     setCartItems(prevItems => {
//       const existingItem = prevItems.find(item => item._id === product._id);
//       if (existingItem) {
//         return prevItems.map(item =>
//           item._id === product._id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       } else {
//         return [...prevItems, { ...product, quantity: 1 }];
//       }
//     });
//   };

//   const removeFromCart = (productId: string) => {
//     setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
//   };

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   const cartContextValue = {
//     cartItems,
//     addToCart,
//     removeFromCart,
//     clearCart,
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       setIsLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/groceries`);
//       const fetchedProducts = res.data.map((p: any) => ({
//         ...p,
//         createdAt: new Date(p.createdAt),
//       }));
//       setProducts(fetchedProducts);
//       const uniqueCats = Array.from(new Set(fetchedProducts.map((p: Product) => p.category)));
//       setCategories([{ id: 'all', name: 'All' }, ...uniqueCats.map((cat, index) => ({ id: index.toString(), name: cat }))]);
//     } catch (err) {
//       console.error('Error fetching products:', err);
//       Alert.alert('Error', 'Failed to fetch products. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getCategoryIcon = (categoryName: string): string => {
//     switch (categoryName.toLowerCase()) {
//       case 'all':
//         return 'apps';
//       case 'for you':
//         return 'star';
//       case 'recent update':
//         return 'update';
//       case 'electronics':
//         return 'devices';
//       case 'clothing':
//         return 'local-mall';
//       case 'books':
//         return 'book';
//       case 'grocery':
//         return 'shopping-basket';
//       default:
//         return 'category';
//     }
//   };

//   const filteredProducts = useMemo(() => {
//     let filtered = products;
//     if (selectedCategory !== 'All') {
//       filtered = filtered.filter((p) => p.category === selectedCategory);
//     }
//     if (searchText) {
//       filtered = filtered.filter((p) =>
//         p.name.toLowerCase().includes(searchText.toLowerCase()) ||
//         p.description.toLowerCase().includes(searchText.toLowerCase())
//       );
//     }
//     return filtered;
//   }, [products, selectedCategory, searchText]);

//   const sections: Section[] = useMemo(() => {
//     return [
//       {
//         title: 'Suggestions for you',
//         data: filteredProducts.sort(() => 0.5 - Math.random()).slice(0, 10),
//       },
//       {
//         title: 'Recent Updates',
//         data: [...filteredProducts].sort((a, b) => 
//           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//         ).slice(0, 10),
//       },
//       {
//         title: 'Grocery',
//         data: filteredProducts.filter((p) => p.category === 'Grocery').slice(0, 10),
//       },
//       {
//         title: 'Electronics',
//         data: filteredProducts.filter((p) => p.category === 'Electronics').slice(0, 10),
//       },
//       {
//         title: 'Clothing',
//         data: filteredProducts.filter((p) => p.category === 'Clothing').slice(0, 10),
//       },
//       {
//         title: 'Books',
//         data: filteredProducts.filter((p) => p.category === 'Books').slice(0, 10),
//       },
//       {
//         title: 'Top Deals',
//         data: filteredProducts.filter((p) => p.discount > 15).slice(0, 10),
//       },
//     ].filter((section) => section.data.length > 0); // Only show sections with data
//   }, [filteredProducts]);

//   const handleViewAll = (title: string) => {
//     navigation.navigate('ViewAll', { 
//       title, 
//       products: sections.find(s => s.title === title)?.data || [] 
//     });
//   };

//   const renderSection = ({ item }: { item: Section }) => (
//     <View style={styles.sectionContainer}>
//       <View style={styles.sectionHeader}>
//         <Text style={styles.sectionTitle}>{item.title}</Text>
//         <TouchableOpacity onPress={() => handleViewAll(item.title)} style={styles.viewAll}>
//           <Text style={styles.viewAllText}>View All</Text>
//           <MaterialIcons name="arrow-forward" size={16} color="#4caf50" />
//         </TouchableOpacity>
//       </View>
//       <FlatList
//         data={item.data}
//         renderItem={({ item }) => <SmallProductCard product={item} addToCart={addToCart} />}
//         keyExtractor={(item) => item._id}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.horizontalList}
//       />
//     </View>
//   );

//   const handleHomePress = () => {
//     setSelectedCategory('All');
//     setSearchText('');
//   };

//   const handleCartPress = () => {
//     navigation.navigate('Cart');
//   };

//   const handleOrderPress = () => {
//     navigation.navigate('Order');
//   };

//   const handleTopSalePress = () => {
//     navigation.navigate('TopSale');
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loading}>Loading products...</Text>
//       </View>
//     );
//   }

//   return (
//     <CartContext.Provider value={cartContextValue}>
//       <View style={styles.container}>
//         <View style={styles.searchContainer}>
//           <MaterialIcons name="search" size={24} color="#A9A9A9" style={styles.searchIcon} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search products..."
//             value={searchText}
//             onChangeText={setSearchText}
//             placeholderTextColor="#A9A9A9"
//           />
//           {searchText.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchText('')}>
//               <MaterialIcons name="cancel" size={20} color="#A9A9A9" />
//             </TouchableOpacity>
//           )}
//         </View>
        
//         <FlatList
//           data={searchText ? [{ title: 'Search Results', data: filteredProducts }] : sections}
//           renderItem={searchText ? ({ item }) => (
//             <FlatList
//               data={item.data}
//               renderItem={({ item }) => <ProductCard product={item} addToCart={addToCart} />}
//               keyExtractor={(item) => item._id}
//               contentContainerStyle={styles.verticalList}
//               showsVerticalScrollIndicator={false}
//             />
//           ) : renderSection}
//           keyExtractor={(item) => item.title}
//           ListHeaderComponent={
//             !searchText ? (
//               <>
//                 <Text style={styles.categoriesTitle}>Categories</Text>
//                 <FlatList
//                   data={categories}
//                   renderItem={({ item }) => (
//                     <CategoryItem
//                       category={item}
//                       getCategoryIcon={getCategoryIcon}
//                       onPress={() => setSelectedCategory(item.name)}
//                       isSelected={selectedCategory === item.name}
//                     />
//                   )}
//                   keyExtractor={(item) => item.id}
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   contentContainerStyle={styles.categoriesScroll}
//                 />
//               </>
//             ) : null
//           }
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 100 }} // Add padding for bottom nav
//         />
        
//         <View style={styles.bottomNav}>
//           <TouchableOpacity style={styles.navItem} onPress={handleHomePress}>
//             <MaterialIcons name="home" size={24} color={selectedCategory === 'All' && !searchText ? "#4caf50" : "#757575"} />
//             <Text style={[styles.navText, selectedCategory === 'All' && !searchText && styles.activeNavText]}>Home</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.navItem} onPress={handleTopSalePress}>
//             <MaterialIcons name="whatshot" size={24} color="#757575" />
//             <Text style={styles.navText}>Top Sale</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.navItem} onPress={handleCartPress}>
//             <MaterialIcons name="shopping-cart" size={24} color="#757575" />
//             <Text style={styles.navText}>Cart</Text>
//             {cartItems.length > 0 && (
//               <View style={styles.cartBadge}>
//                 <Text style={styles.cartBadgeText}>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.navItem} onPress={handleOrderPress}>
//             <MaterialIcons name="receipt" size={24} color="#757575" />
//             <Text style={styles.navText}>Order</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </CartContext.Provider>
//   );
// };

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#FFFFFF',
//     position: 'relative',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 25,
//     margin: 15,
//     paddingHorizontal: 15,
//     height: 50,
//   },
//   searchIcon: { marginRight: 10 },
//   searchInput: { 
//     flex: 1, 
//     fontSize: 16, 
//     paddingVertical: 12,
//     color: '#333',
//   },
//   categoriesTitle: { 
//     fontSize: 20, 
//     fontWeight: '700', 
//     marginLeft: 15, 
//     marginBottom: 10, 
//     color: '#333',
//     marginTop: 5,
//   },
//   categoriesScroll: { 
//     paddingHorizontal: 15, 
//     paddingBottom: 15,
//   },
//   sectionContainer: { 
//     marginBottom: 25,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     marginBottom: 15,
//   },
//   sectionTitle: { 
//     fontSize: 18, 
//     fontWeight: '600', 
//     color: '#333',
//   },
//   viewAll: { 
//     flexDirection: 'row', 
//     alignItems: 'center',
//   },
//   viewAllText: { 
//     fontSize: 14, 
//     color: '#4caf50', 
//     marginRight: 5,
//     fontWeight: '500',
//   },
//   horizontalList: { 
//     paddingHorizontal: 15,
//     paddingBottom: 5,
//   },
//   verticalList: { 
//     paddingHorizontal: 15,
//     paddingBottom: 20,
//   },
//   bottomNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     borderTopWidth: 1,
//     borderColor: '#eee',
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: -2 },
//   },
//   navItem: { 
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//   },
//   navText: { 
//     fontSize: 12, 
//     color: '#757575', 
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   activeNavText: {
//     color: '#4caf50',
//   },
//   cartBadge: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: '#e53935',
//     borderRadius: 10,
//     minWidth: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 4,
//   },
//   cartBadgeText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   loading: { 
//     fontSize: 18, 
//     color: '#4caf50',
//     fontWeight: '500',
//   },
// });

// export default ShoppingContent;

