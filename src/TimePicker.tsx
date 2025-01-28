import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface TimePickerProps {
    selectedTime: Date;
    setSelectedTime: (date: Date | null) => void;
}

const TimePicker: React.FC<TimePickerProps> = (props: TimePickerProps) => {
    const { selectedTime, setSelectedTime } = props;

    return (
        <div>
            <DatePicker
                selected={selectedTime}
                onChange={setSelectedTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={5}
                timeCaption="Time"
                dateFormat="hh:mm aa"
                showTimeCaption={false}
                timeClassName={() => "text-lg"}
                calendarClassName="custom-calendar"
                className="custom-datepicker"
            />
        </div>
    );
};

export default TimePicker;
