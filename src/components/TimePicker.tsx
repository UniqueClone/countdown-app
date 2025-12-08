import React from "react";
import dayjs, { Dayjs } from "dayjs";

interface TimePickerProps {
    handleEnterKey: () => void;
    selectedTime: Dayjs | null;
    setSelectedTime: (time: Dayjs | null) => void;
}

/**
 * TimePicker component allows the user to select a time using a time input field.
 * It accepts a selectedTime prop to display the current selected time and a setSelectedTime function to update the selected time.
 * @param selectedTime - The currently selected time as a Dayjs object.
 * @param setSelectedTime - Function to update the selected time state.
 */
function TimePicker({
    handleEnterKey,
    selectedTime,
    setSelectedTime,
}: TimePickerProps) {
    /**
     * Handle the change event of the time input.
     * This function updates the selected time state based on the input value.
     * It parses the input value to extract the hour and minute, then sets the selected time.
     * @param event - The event object from the input change event.
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const [hour, minute] = event.target.value.split(":").map(Number);
        const now = dayjs();
        const date = now
            .set("hour", hour)
            .set("minute", minute)
            .set("second", 0)
            .set("millisecond", 0);
        setSelectedTime(date);
    };

    return (
        <input
            autoFocus
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
            onKeyDown={(event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    handleEnterKey();
                }
            }}
            placeholder="Select Time"
            className="min-w-[90px] border rounded w-50 p-2 bg-white text-black hover:bg-gray-300 focus:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        />
    );
}

export default TimePicker;
