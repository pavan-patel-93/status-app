'use client'
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UptimeGraph({ serviceId }) {
  const [uptimeData, setUptimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUptimeData = async () => {
      try {
        const response = await fetch(`/api/services/${serviceId}/uptime?days=30`);
        if (!response.ok) throw new Error('Failed to fetch uptime data');
        const data = await response.json();
        setUptimeData(data);
      } catch (error) {
        console.error('Error fetching uptime data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUptimeData();
  }, [serviceId]);

  if (loading) return <div>Loading uptime data...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>30-Day Uptime Percentage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={uptimeData}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value.toFixed(2)}%`, 'Uptime']}
                labelFormatter={(date) => format(parseISO(date), 'MMM d, yyyy')}
              />
              <Line 
                type="monotone" 
                dataKey="uptimePercentage" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 