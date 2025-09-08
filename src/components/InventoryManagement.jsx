import React, { useState, useRef, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaUpload, 
  FaSearch, 
  FaFilter,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaRobot,
  FaImage,
  FaWeight,
  FaTag,
  FaMapMarkerAlt,
  FaRupeeSign
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { locationAPI, inventoryAPI, spicePricesAPI } from '../services/api';

const InventoryManagement = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [inventory, setInventory] = useState([]);
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [farmLocation, setFarmLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [newItem, setNewItem] = useState({
    name: 'Cardamom',
    weight: '',
    location: '',
    image: null
  });

  const [currentGrade, setCurrentGrade] = useState('');
  const [markAsSold, setMarkAsSold] = useState(false);
  const [cardamomPrices, setCardamomPrices] = useState(null);

  const [weightError, setWeightError] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [detectedGrade, setDetectedGrade] = useState('');
  const [gradeConfidence, setGradeConfidence] = useState(0);
  const [gradeDetails, setGradeDetails] = useState(null);

  // Fetch farm location from user's pincode
  useEffect(() => {
    const fetchFarmLocation = async () => {
      const pincode = user?.pincode || user?.address?.pincode || user?.location?.pincode;
      if (pincode) {
        setLocationLoading(true);
        try {
          const locationData = await locationAPI.getLocationFromPincode(pincode);
          if (locationData) {
            setFarmLocation(locationData.name);
            setNewItem(prev => ({ ...prev, location: locationData.name }));
          } else {
            // Fallback to mock data
            const mockLocation = await locationAPI.getMockLocation(pincode);
            setFarmLocation(mockLocation.name);
            setNewItem(prev => ({ ...prev, location: mockLocation.name }));
          }
        } catch (error) {
          console.error('Error fetching location:', error);
          setFarmLocation('Kerala, India');
          setNewItem(prev => ({ ...prev, location: 'Kerala, India' }));
        } finally {
          setLocationLoading(false);
        }
      } else {
        setFarmLocation('Kerala, India');
        setNewItem(prev => ({ ...prev, location: 'Kerala, India' }));
      }
    };

    fetchFarmLocation();
  }, [user]);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      if (user?.id) {
        try {
          const inventoryData = await inventoryAPI.getInventoryByUser(user.id);
          setInventory(inventoryData || []);
        } catch (error) {
          console.error('Error fetching inventory:', error);
          setInventory([]);
        }
      }
    };

    fetchInventory();
  }, [user?.id]);

  // Fetch cardamom prices for price calculation
  useEffect(() => {
    const fetchCardamomPrices = async () => {
      try {
        const latestPrice = await spicePricesAPI.getLatestCardamomPrice();
        setCardamomPrices(latestPrice);
      } catch (error) {
        console.error('Error fetching cardamom prices:', error);
        // Fallback to mock data
        setCardamomPrices({
          avg_amount: 2583.275,
          min_amount: 2565.8,
          max_amount: 2600.75
        });
      }
    };

    fetchCardamomPrices();
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Items', icon: FaBox, color: 'gray' },
    { value: 'available', label: 'Available', icon: FaCheckCircle, color: 'green' },
    { value: 'sold', label: 'Sold', icon: FaTimesCircle, color: 'red' },
    { value: 'pending_auction', label: 'Pending Auction', icon: FaClock, color: 'yellow' }
  ];

  const spiceOptions = ['Cardamom'];

  // Calculate expected price based on grade
  const calculateExpectedPrice = (grade, weight) => {
    if (!cardamomPrices || !grade || !weight) return null;
    
    let pricePerKg = 0;
    
    switch (grade.toUpperCase()) {
      case 'A':
        pricePerKg = cardamomPrices.max_amount || cardamomPrices.avg_amount || 2600;
        break;
      case 'B':
        pricePerKg = cardamomPrices.avg_amount || 2583;
        break;
      case 'C':
        pricePerKg = cardamomPrices.min_amount || cardamomPrices.avg_amount || 2565;
        break;
      case 'D':
        return { price: 0, message: 'Under quality product' };
      default:
        pricePerKg = cardamomPrices.avg_amount || 2583;
    }
    
    const totalPrice = pricePerKg * weight;
    return {
      price: Math.round(totalPrice),
      pricePerKg: Math.round(pricePerKg),
      weight: weight
    };
  };

  const detectCardamomGrade = async (file) => {
    setIsGrading(true);
    setDetectedGrade('');
    setGradeConfidence(0);
    setGradeDetails(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:8001/ml_grade', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to detect grade');
      }

      const result = await response.json();
      
      if (result.grade && result.confidence) {
        setDetectedGrade(result.grade);
        setGradeConfidence(result.confidence);
        setGradeDetails(result.details);
        
        // Auto-set the grade for the form
        setCurrentGrade(result.grade);
      } else {
        throw new Error('Invalid response from grading API');
      }
    } catch (error) {
      console.error('Error detecting grade:', error);
      alert('Failed to detect cardamom grade. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const validateWeight = (weight) => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weight === '') {
      setWeightError('Weight is required');
      return false;
    }
    if (weightNum < 1) {
      setWeightError('Weight must be at least 1 kg');
      return false;
    }
    setWeightError('');
    return true;
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    setNewItem({ ...newItem, weight: value });
    validateWeight(value);
  };

  const validateAndProcessFile = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only JPG/JPEG/PNG image files');
      return;
    }
    
    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewItem({ 
        ...newItem, 
        image: e.target.result,
        imageFile: file
      });
    };
    reader.readAsDataURL(file);
    
    // Detect cardamom grade if it's cardamom
    if (newItem.name === 'Cardamom') {
      detectCardamomGrade(file);
    } else {
      // For non-cardamom spices, set a default grade
      setCurrentGrade('Standard');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    // Validate weight before adding
    if (!validateWeight(newItem.weight)) {
      return;
    }

    if (!currentGrade) {
      alert('Please upload an image to detect the grade');
      return;
    }
    
    try {
      const inventoryData = {
        userid: user.id,
        spiceName: newItem.name,
        weight: parseFloat(newItem.weight),
        grade: currentGrade || 'Standard',
        status: 'available',
        spiceImage: newItem.imageFile || null
      };

      const response = await inventoryAPI.addInventory(inventoryData);
      
      // Refresh inventory list
      const updatedInventory = await inventoryAPI.getInventoryByUser(user.id);
      setInventory(updatedInventory || []);
      
      // Reset form
      setNewItem({
        name: 'Cardamom',
        weight: '',
        location: farmLocation,
        image: null,
        imageFile: null
      });
      setWeightError('');
      setDetectedGrade('');
      setGradeConfidence(0);
      setGradeDetails(null);
      setCurrentGrade('');
      setShowAddForm(false);
      
      // Show success alert and redirect
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Inventory Added Successfully!',
        text: `${newItem.name} has been added to your inventory`,
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: '#10B981',
        color: '#ffffff',
        iconColor: '#ffffff'
      }).then(() => {
        // Switch to inventory list tab
        setActiveTab('list');
      });
    } catch (error) {
      console.error('Error adding inventory item:', error);
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Failed to Add Inventory',
        text: 'Please try again later',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        background: '#EF4444',
        color: '#ffffff',
        iconColor: '#ffffff'
      });
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.spiceName || item.name,
      weight: item.weight.toString(),
      location: item.location || farmLocation,
      image: item.spiceImage 
        ? (item.spiceImage.startsWith('http') 
            ? item.spiceImage 
            : `http://localhost:3001${item.spiceImage}`)
        : (item.image || '/api/placeholder/100/100')
    });
    setCurrentGrade(item.grade || '');
    setMarkAsSold(item.status === 'sold');
    setShowAddForm(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    
    // Validate weight before updating
    if (!validateWeight(newItem.weight)) {
      return;
    }

    if (!currentGrade) {
      alert('Please upload an image to detect the grade');
      return;
    }
    
    try {
      const newStatus = markAsSold ? 'sold' : (editingItem.status || 'available');
      
      // If only status changed and no new image, use PATCH
      if (markAsSold !== (editingItem.status === 'sold') && !newItem.imageFile) {
        await inventoryAPI.updateInventoryStatus(editingItem._id || editingItem.id, newStatus);
      } else {
        // Full update with PUT
        const inventoryData = {
          spiceName: newItem.name,
          weight: parseFloat(newItem.weight),
          grade: currentGrade || 'Standard',
          status: newStatus,
          spiceImage: newItem.imageFile || null
        };

        await inventoryAPI.updateInventoryItem(editingItem._id || editingItem.id, inventoryData);
      }
      
      // Refresh inventory list
      const updatedInventory = await inventoryAPI.getInventoryByUser(user.id);
      setInventory(updatedInventory || []);
      
      setEditingItem(null);
      setShowAddForm(false);
      setWeightError('');
      setDetectedGrade('');
      setGradeConfidence(0);
      setGradeDetails(null);
      setNewItem({
        name: 'Cardamom',
        weight: '',
        location: farmLocation,
        image: null,
        imageFile: null
      });
      setMarkAsSold(false);
      
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Inventory Updated!',
        text: `${newItem.name} has been updated successfully`,
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: '#10B981',
        color: '#ffffff',
        iconColor: '#ffffff'
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Failed to Update',
        text: 'Please try again later',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        background: '#EF4444',
        color: '#ffffff',
        iconColor: '#ffffff'
      });
    }
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryAPI.deleteInventoryItem(item._id || item.id);
        
        // Refresh inventory list
        const updatedInventory = await inventoryAPI.getInventoryByUser(user.id);
        setInventory(updatedInventory || []);
        
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Inventory Deleted!',
          text: 'Item has been removed from your inventory',
          showConfirmButton: false,
          timer: 2000,
          toast: true,
          background: '#10B981',
          color: '#ffffff',
          iconColor: '#ffffff'
        });
      } catch (error) {
        console.error('Error deleting inventory item:', error);
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Failed to Delete',
          text: 'Please try again later',
          showConfirmButton: false,
          timer: 3000,
          toast: true,
          background: '#EF4444',
          color: '#ffffff',
          iconColor: '#ffffff'
        });
      }
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesStatus = filterStatus === 'all' || (item.status || 'available') === filterStatus;
    const itemName = item.spiceName || item.name || '';
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    const itemStatus = status || 'available';
    switch (itemStatus) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'pending_auction': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    const itemStatus = status || 'available';
    switch (itemStatus) {
      case 'available': return <FaCheckCircle className="w-4 h-4" />;
      case 'sold': return <FaTimesCircle className="w-4 h-4" />;
      case 'pending_auction': return <FaClock className="w-4 h-4" />;
      default: return <FaBox className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Manage your spice inventory and track sales</p>
        </div>
      </div>

      {/* Summary Cards */}
      {(() => {
        const totalKg = inventory.reduce((sum, item) => sum + (item.weight || 0), 0);
        const totalEstimatedAmount = inventory.reduce((sum, item) => {
          if (item.status === 'sold' || !item.grade || !item.weight) return sum;
          const priceInfo = calculateExpectedPrice(item.grade, item.weight);
          return sum + (priceInfo?.price || 0);
        }, 0);
        const availableItems = inventory.filter(item => item.status === 'available').length;
        const soldItems = inventory.filter(item => item.status === 'sold').length;

        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total Weight */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Weight</p>
                  <p className="text-2xl font-bold">{totalKg.toFixed(1)} kg</p>
                </div>
                <FaWeight className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            {/* Estimated Value */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Estimated Value</p>
                  <p className="text-2xl font-bold">₹{totalEstimatedAmount.toLocaleString()}</p>
                </div>
                <FaRupeeSign className="w-8 h-8 text-green-200" />
              </div>
            </div>

            {/* Available Items */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Available Items</p>
                  <p className="text-2xl font-bold">{availableItems}</p>
                </div>
                <FaCheckCircle className="w-8 h-8 text-emerald-200" />
              </div>
            </div>

            {/* Sold Items */}
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm font-medium">Sold Items</p>
                  <p className="text-2xl font-bold">{soldItems}</p>
                </div>
                <FaTimesCircle className="w-8 h-8 text-gray-200" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          View Inventory
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Add Stock
        </button>
      </div>

      {/* Filters and Search */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex space-x-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setFilterStatus(option.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === option.value
                        ? `bg-${option.color}-100 text-${option.color}-800 border border-${option.color}-200`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || activeTab === 'add') && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingItem ? 'Edit Stock Item' : 'Add New Spice Stock'}
            </h3>
             <button
                 onClick={() => {
                   setShowAddForm(false);
                   setEditingItem(null);
      setWeightError('');
      setDetectedGrade('');
      setGradeConfidence(0);
      setGradeDetails(null);
      setCurrentGrade('');
      setMarkAsSold(false);
      setNewItem({
        name: 'Cardamom',
        weight: '',
        location: farmLocation,
        image: null,
        imageFile: null
      });
                 }}
               className="text-gray-400 hover:text-gray-600"
             >
               <FaTimesCircle className="w-5 h-5" />
             </button>
          </div>

          <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FaImage className="inline w-4 h-4 mr-2" />
                  Spice Image
                </label>
                 <div 
                   className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors"
                   onDragOver={handleDragOver}
                   onDrop={handleDrop}
                 >
                  {newItem.image ? (
                    <div className="space-y-2">
                      <img
                        src={newItem.image}
                        alt="Spice preview"
                        className="w-full h-32 object-cover rounded-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                     <div className="space-y-2">
                       <FaUpload className="w-8 h-8 text-gray-400 mx-auto" />
                       <div>
                         <button
                           type="button"
                           onClick={() => fileInputRef.current?.click()}
                           className="text-emerald-600 hover:text-emerald-700 font-medium"
                         >
                           Upload Image
                         </button>
                         <p className="text-gray-500 text-sm">or drag and drop</p>
                         <p className="text-gray-400 text-xs mt-1">JPG/JPEG/PNG format, max 5MB</p>
                       </div>
                     </div>
                  )}
                   <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/jpeg,image/jpg,image/png"
                     onChange={handleImageUpload}
                     className="hidden"
                   />
                </div>
                
                {/* Grade Detection Results */}
                {(isGrading || currentGrade) && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {isGrading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">Analyzing image for grade detection...</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-blue-700 mb-1">Grade</p>
                        <p className="text-2xl font-bold text-blue-800">{currentGrade}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spice Name *
                  </label>
                  <select
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {spiceOptions.map(spice => (
                      <option key={spice} value={spice}>{spice}</option>
                    ))}
                  </select>
                </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     <FaWeight className="inline w-4 h-4 mr-1" />
                     Weight (kg) * (min 1 kg)
                   </label>
                   <input
                     type="number"
                     step="0.1"
                     min="1"
                     value={newItem.weight}
                     onChange={handleWeightChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                       weightError ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="1.0"
                   />
                   {weightError && (
                     <p className="mt-1 text-sm text-red-600">{weightError}</p>
                   )}
                 </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaMapMarkerAlt className="inline w-4 h-4 mr-1" />
                    Farm Location
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                    {locationLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                        <span>Loading location...</span>
                      </div>
                    ) : (
                      farmLocation || 'Kerala, India'
                    )}
                  </div>
                </div>

                {/* Mark as Sold Checkbox - Only show when editing */}
                {editingItem && (
                  <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="markAsSold"
                      checked={markAsSold}
                      onChange={(e) => setMarkAsSold(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                    <label htmlFor="markAsSold" className="text-sm font-medium text-yellow-800">
                      Mark as Sold
                    </label>
                    {markAsSold && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Status will be updated to "sold"
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>


            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
               <button
                 type="button"
                 onClick={() => {
                   setShowAddForm(false);
                   setEditingItem(null);
      setWeightError('');
      setDetectedGrade('');
      setGradeConfidence(0);
      setGradeDetails(null);
      setCurrentGrade('');
      setMarkAsSold(false);
      setNewItem({
        name: 'Cardamom',
        weight: '',
        location: farmLocation,
        image: null,
        imageFile: null
      });
                 }}
                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 Cancel
               </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                {editingItem ? 'Update Item' : 'Add to Inventory'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory List */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Inventory ({filteredInventory.length} items)
            </h3>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="p-12 text-center">
              <FaBox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first spice to inventory'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                >
                  <FaPlus />
                  <span>Add First Item</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <div key={item._id || item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={
                          item.spiceImage 
                            ? (item.spiceImage.startsWith('http') 
                                ? item.spiceImage 
                                : `http://localhost:3001${item.spiceImage}`)
                            : (item.image || '/api/placeholder/100/100')
                        }
                        alt={item.spiceName || item.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.spiceName || item.name}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <FaWeight className="w-4 h-4" />
                              <span>{item.weight} kg</span>
                            </span>
                            {item.grade && (
                              <span className="flex items-center space-x-1">
                                <FaTag className="w-4 h-4" />
                                <span>Grade: {item.grade}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <FaMapMarkerAlt className="w-4 h-4" />
                              <span>{item.location}</span>
                            </span>
                            <span>Added: {item.addedDate || item.createdAt?.split('T')[0] || 'Unknown'}</span>
                            
                            {/* Expected Price Display - Next to date */}
                            {item.grade && item.weight && (() => {
                              // Don't show price for sold items
                              if (item.status === 'sold') {
                                return (
                                  <div className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-center">
                                    <span className="text-gray-600 text-xs font-medium">
                                      Sold
                                    </span>
                                  </div>
                                );
                              }
                              
                              const priceInfo = calculateExpectedPrice(item.grade, item.weight);
                              if (!priceInfo) return null;
                              
                              if (priceInfo.message) {
                                return (
                                  <div className="px-2 py-1 bg-red-100 border border-red-200 rounded text-center">
                                    <span className="text-red-600 text-xs font-medium">
                                      Under quality product
                                    </span>
                                  </div>
                                );
                              }
                              
                              return (
                                <div className="px-2 py-1 bg-green-100 border border-green-200 rounded text-center">
                                  <div className="text-green-800 font-semibold text-sm">
                                    ₹{priceInfo.price.toLocaleString()}
                                  </div>
                                  <div className="text-green-600 text-xs">
                                    ₹{priceInfo.pricePerKg}/kg
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end space-y-3">
                          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="capitalize">{(item.status || 'available').replace('_', ' ')}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                              title="Edit item"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete item"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
