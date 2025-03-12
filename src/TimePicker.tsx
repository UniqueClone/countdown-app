import React from "react";
import dayjs, { Dayjs } from 'dayjs';

interface TimePickerProps {
    selectedTime: Dayjs | null;
    setSelectedTime: (time: Dayjs | null) => void;
}

function TimePicker({ selectedTime, setSelectedTime }: TimePickerProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value) {
            const date = dayjs(value, "HH:mm");
            setSelectedTime(dayjs(date));
        } else {
            setSelectedTime(null);
        }
    };

    return (
        <input
            type="time"
            style={{
                justifyContent: "center",
                display: "flex",
                margin: "0 auto",
                width: "65%",
                maxWidth: "300px",
            }}
            value={selectedTime ? selectedTime.format("HH:mm") : ""}
            onChange={handleChange}
            placeholder="Select Time"
            className="border rounded w-50 p-2 bg-white text-black hover:bg-gray-300 focus:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        />
    );
}

export default TimePicker;
