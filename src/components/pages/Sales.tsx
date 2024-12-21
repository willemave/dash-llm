import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Sales.css';

export interface SalesData {
  date: string;
  location: string;
  sales: number;
}

const dummyData: SalesData[] = [
  { date: '2023-09-01', location: 'New York', sales: 400 },
  { date: '2023-09-02', location: 'Los Angeles', sales: 300 },
  { date: '2023-09-03', location: 'Chicago', sales: 200 },
  { date: '2023-09-04', location: 'Houston', sales: 278 },
  { date: '2023-09-05', location: 'Phoenix', sales: 189 },
  // Add more dummy data as needed
];

const Sales: React.FC = () => {
  const [data, setData] = useState<SalesData[]>(dummyData);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<string>('All Locations');

  useEffect(() => {
    // Filter data based on selectedDate and currentLocation
    let filteredData = dummyData;

    if (selectedDate) {
      filteredData = filteredData.filter(item => item.date === selectedDate);
    }

    if (currentLocation && currentLocation !== 'All Locations') {
      filteredData = filteredData.filter(item => item.location === currentLocation);
    }

    setData(filteredData);
  }, [selectedDate, currentLocation]);

  // API to update chart data
  const updateChartData = (newData: SalesData[]) => {
    setData(newData);
  };

  // Expose the API to the LLM
  (window as any).updateChartData = updateChartData;

  // Expose the function to window for OpenAI service to use
  useEffect(() => {
    (window as any).changeLocation = (newLocation: string) => {
      setCurrentLocation(newLocation);
      setSelectedLocation(newLocation === 'All Locations' ? '' : newLocation);
      return true; // Return success
    };

    return () => {
      delete (window as any).changeLocation;
    };
  }, []);

  const uniqueDates = Array.from(new Set(dummyData.map(item => item.date)));
  const uniqueLocations = Array.from(new Set(dummyData.map(item => item.location)));

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const location = e.target.value;
    setSelectedLocation(location);
    setCurrentLocation(location || 'All Locations');
  };

  return (
    <div className="sales-page">
      <h1>Sales</h1>
      <h2>Current Location: {currentLocation}</h2>
      <div className="filters">
        <label>
          Date:
          <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
            <option value="">All</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </label>
        <label>
          Location:
          <select value={selectedLocation} onChange={handleLocationChange}>
            <option value="">All</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </label>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sales;