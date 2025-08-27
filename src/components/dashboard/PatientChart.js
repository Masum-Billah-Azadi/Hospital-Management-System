// src/components/dashboard/PatientChart.js
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './PatientChart.module.scss';

// Temporary dummy data for the chart
const data = [
  { name: 'Mon', patients: 30 },
  { name: 'Tue', patients: 45 },
  { name: 'Wed', patients: 28 },
  { name: 'Thu', patients: 55 },
  { name: 'Fri', patients: 42 },
  { name: 'Sat', patients: 60 },
  { name: 'Sun', patients: 35 },
];

const PatientChart = () => {
  return (
    <div className={styles.chartContainer}>
      <h3>Number of patients</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="patients" 
            stroke="#4D44B5" 
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PatientChart;