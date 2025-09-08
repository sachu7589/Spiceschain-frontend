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
  FaMapMarkerAlt
} from 'react-icons/fa';
import { locationAPI } from '../services/api';

const InventoryManagement = ({ user }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: 'Cardamom',
      image: '/api/placeholder/300/200',
      weight: 25.5,
      status: 'available',
      addedDate: '2024-01-15',
      location: 'Kerala, India'
    },
    {
      id: 2,
      name: 'Cardamom',
      image: '/api/placeholder/300/200',
      weight: 50.0,
      status: 'sold',
      addedDate: '2024-01-10',
      location: 'Kerala, India'
    },
    {
      id: 3,
      name: 'Cardamom',
      image: '/api/placeholder/300/200',
      weight: 15.0,
      status: 'pending_auction',
      addedDate: '2024-01-12',
      location: 'Kerala, India'
    }
  ]);
  
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

  const statusOptions = [
    { value: 'all', label: 'All Items', icon: FaBox, color: 'gray' },
    { value: 'available', label: 'Available', icon: FaCheckCircle, color: 'green' },
    { value: 'sold', label: 'Sold', icon: FaTimesCircle, color: 'red' },
    { value: 'pending_auction', label: 'Pending Auction', icon: FaClock, color: 'yellow' }
  ];

  const spiceOptions = ['Cardamom'];

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
    const allowedTypes = ['image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only JPG/JPEG image files');
      return;
    }
    
    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewItem({ ...newItem, image: e.target.result });
    };
    reader.readAsDataURL(file);
    
    // Detect cardamom grade
    detectCardamomGrade(file);
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

  const handleAddItem = (e) => {
    e.preventDefault();
    
    // Validate weight before adding
    if (!validateWeight(newItem.weight)) {
      return;
    }
    
    const newId = Math.max(...inventory.map(item => item.id)) + 1;
    const item = {
      ...newItem,
      id: newId,
      weight: parseFloat(newItem.weight),
      addedDate: new Date().toISOString().split('T')[0],
      status: 'available'
    };
    setInventory([...inventory, item]);
    setNewItem({
      name: 'Cardamom',
      weight: '',
      location: farmLocation,
      image: null
    });
    setWeightError('');
    setDetectedGrade('');
    setGradeConfidence(0);
    setGradeDetails(null);
    setShowAddForm(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      weight: item.weight.toString(),
      location: item.location,
      image: item.image
    });
    setShowAddForm(true);
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();
    
    // Validate weight before updating
    if (!validateWeight(newItem.weight)) {
      return;
    }
    
    const updatedInventory = inventory.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            ...newItem,
            weight: parseFloat(newItem.weight)
          }
        : item
    );
    setInventory(updatedInventory);
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
      image: null
    });
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'pending_auction': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
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
                   setNewItem({
                     name: 'Cardamom',
                     weight: '',
                     location: farmLocation,
                     image: null
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
                         <p className="text-gray-400 text-xs mt-1">JPG/JPEG format, max 2MB</p>
                       </div>
                     </div>
                  )}
                   <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/jpeg,image/jpg"
                     onChange={handleImageUpload}
                     className="hidden"
                   />
                </div>
                
                {/* Grade Detection Results */}
                {(isGrading || detectedGrade) && (
                  <div className="mt-2">
                    {isGrading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">Processing image...</span>
                      </div>
                    ) : (
                      <p className="text-lg text-gray-600 text-center">
                        Grade: <span className="font-bold text-blue-800 text-xl">{detectedGrade}</span>
                      </p>
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
                   setNewItem({
                     name: 'Cardamom',
                     weight: '',
                     location: farmLocation,
                     image: null
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
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/api/placeholder/100/100'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.name}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <FaWeight className="w-4 h-4" />
                              <span>{item.weight} kg</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaMapMarkerAlt className="w-4 h-4" />
                              <span>{item.location}</span>
                            </span>
                            <span>Added: {item.addedDate}</span>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end space-y-3">
                          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="capitalize">{item.status.replace('_', ' ')}</span>
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
                              onClick={() => handleDeleteItem(item.id)}
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
