import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import TextField from "@mui/material/TextField";

const CustomDateTimePicker = () => {
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        label=""
        value={selectedDateTime}
        onChange={(newValue) => setSelectedDateTime(newValue)}
        ampm={false} // 24 saat formatı için
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                "& fieldset": {
                  borderColor: "#007E85",
                },
                "&:hover fieldset": {
                  borderColor: "#005F63",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#007E85",
                },
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default CustomDateTimePicker;
