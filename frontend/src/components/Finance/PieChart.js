import * as React from 'react';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';

export default function PieChartComponent({ data }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <PieChart
        height={250}
        series={[
          {
            data: data.slice(0, data.length),
            innerRadius: 50,
            arcLabel: (params) => params.label ?? '',
            arcLabelMinAngle: 20,
            sx:{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                overflow: 'hidden',
                fontSize: '10px', // Legend yazı tipi boyutunu düşür
              },
          },
        ]}
      />
    </Box>
  );
}