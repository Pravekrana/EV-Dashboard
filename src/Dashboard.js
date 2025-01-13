import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import 'tailwindcss/tailwind.css';
import Papa from 'papaparse'; // CSV parser

const ElectricVehicleData = '/Electric_Vehicle_Population_Data.csv';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [eligibleVehicles, setEligibleVehicles] = useState(0);
  const [teslaModels, setTeslaModels] = useState({});
  const [averageRange, setAverageRange] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ElectricVehicleData);
        if (!response.ok) throw new Error('Failed to fetch CSV data');
        const text = await response.text();

        // Log raw CSV data to check if it's fetched properly
        console.log('Raw CSV Data:', text);

        // Parse CSV data
        Papa.parse(text, {
          complete: (result) => {
            // Log parsed data to check if it's parsed correctly
            console.log('Parsed Data:', result.data);

            const parsedData = result.data.slice(1).map((row) => {
              const [
                VIN, County, City, State, ZipCode, Year, Make, Model, Type,
                Eligibility, Range, CO2_Emission, ElectricUtility
              ] = row;

              if (!VIN || !Eligibility || !Range) return null;

              return {
                VIN,
                County,
                City,
                State,
                ZipCode: parseInt(ZipCode) || 0,
                Year: parseInt(Year) || 0,
                Make,
                Model,
                Type,
                Eligibility,
                Range: parseInt(Range) || 0,
                CO2_Emission: parseFloat(CO2_Emission) || 0.0,
                ElectricUtility
              };
            }).filter(Boolean);

            // Log filtered parsed data
            console.log('Filtered Parsed Data:', parsedData);

            setData(parsedData);
            setTotalVehicles(parsedData.length);
            setEligibleVehicles(parsedData.filter((item) => item.Eligibility.includes('Eligible')).length);

            // Tesla Models Data
            const models = parsedData.reduce((acc, item) => {
              acc[item.Model] = (acc[item.Model] || 0) + 1;
              return acc;
            }, {});
            setTeslaModels(models);

            // Average Range
            const totalRange = parsedData.reduce((acc, item) => acc + item.Range, 0);
            setAverageRange((totalRange / parsedData.length).toFixed(2));
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Process data for visualizations
  const pieData = {
    labels: Object.keys(teslaModels),
    datasets: [
      {
        data: Object.values(teslaModels),
        backgroundColor: ['#FF6347', '#32CD32', '#1E90FF', '#FFD700', '#8A2BE2'],
      },
    ],
  };

  const barData = {
    labels: data.map((item) => item.Year),
    datasets: [
      {
        label: 'Range (miles)',
        data: data.map((item) => item.Range),
        backgroundColor: '#FF4500',
        borderColor: '#FF6347',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 min-h-screen">
      <h1 className="text-4xl font-bold text-white text-center mb-8">EV Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Vehicles</h2>
          <p className="text-3xl font-bold text-blue-600">{totalVehicles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Eligible Vehicles</h2>
          <p className="text-3xl font-bold text-green-600">{eligibleVehicles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Tesla Vehicle Models</h2>
          <Pie data={pieData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Range by Year</h2>
          <Bar data={barData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Average Range (miles)</h2>
          <p className="text-3xl font-bold text-purple-600">{averageRange} miles</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
