import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "./App.css";
import Countdown from "./Countdown";
import TimePicker from "./TimePicker";
import { requestNotificationPermission } from "./ShowNotification";

const nowPlusOneMinute = () => dayjs().second(0).add(1, 'minute');
const timePlusOneDay = (time: Dayjs) => dayjs(time).add(1, 'day');

function App() {
    const [targetTime, setTargetTime] = useState<Dayjs>(nowPlusOneMinute());
    const [countdownStarted, setCountdownStarted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        requestNotificationPermission(); // request permission when the app loads, unsure if this is necessary
    }, []);

    const handleStartCountdown = () => {
        const now = dayjs();
        const target = dayjs(targetTime);
        if (target.isBefore(now) || target.isAfter(now.add(1, 'day'))) {
            // if the selected time is more than 24 hours in the past or in the future
            if (target.isBefore(now.subtract(1, 'day')) || target.isAfter(now.add(1, 'day'))) {
                setTargetTime(dayjs(targetTime).date(now.date()));
                handleStartCountdown();
                return;
            } else {
                // if the selected time is in the past but less than 24 hours
                setTargetTime(timePlusOneDay(targetTime));
            }
        } else {
            // if the selected time is in the future
            setTargetTime(targetTime);
        }
        setCountdownStarted(true);
    };

    const handleTargetTimeChange = (date: Dayjs | null) => {
        if (date && date.isValid()) {
            const selectedTime = dayjs(date);
            if (selectedTime.isAfter(dayjs())) {
                if (selectedTime.isAfter(dayjs().add(1, 'day'))) {
                    setTargetTime(selectedTime.subtract(1, 'day'));
                } else {
                    // if the selected time is in the future
                    setTargetTime(dayjs(date));
                }
                setErrorMessage(null); // clear any previous error message
                setCountdownStarted(false); // reset the countdown
            } else if (selectedTime.isBefore(dayjs())) {
                // if the selected time is in the past, add 24 hours to it
                setTargetTime(selectedTime.add(1, 'day')); // 24 hours in milliseconds
                setErrorMessage(null); // clear any previous error message
                setCountdownStarted(false); // reset the countdown
            } else {
                // Display a custom message or use a modal instead of alert
                console.log("Please select a future time.");
                // You can also use a state to show a message in the UI
                setErrorMessage("Please select a future time.");
            }
        } else {
            console.log("Invalid date selected", date);
            setErrorMessage("Invalid date selected. Please select a valid time.");
        }
    };

    return (
        <main className="container p-4 pt-0 mx-auto">
            <div className="mb-4">
                <label
                    htmlFor="target-time"
                    className="block text-lg font-medium mb-2"
                >
                    Select Target Time
                </label>
                <TimePicker
                    selectedTime={targetTime}
                    setSelectedTime={handleTargetTimeChange}
                />
            </div>
            
            <button
                aria-label="Reset countdown and set target time to 1 minute from now"
                onClick={() =>
                    handleTargetTimeChange(
                        nowPlusOneMinute() // 1 minute in the future
                    )
                }
                className="m-auto mb-4 px-4 py-2 w-30 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
            >
                Reset
            </button>

            {countdownStarted ? (
                <>
                    <button
                        onClick={() => {
                            setCountdownStarted(false);
                        }}
                        className="mb-4 mx-8 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 focus:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Stop Countdown
                    </button>

                    <Countdown targetDate={targetTime} />
                </>
            ) : (
                <button
                    onClick={() => handleStartCountdown()}
                    className="mx-8 bg-green-700 text-white font-semibold rounded-md shadow hover:bg-green-800 focus:bg-green-800 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Start Countdown
                </button>
            )}
            {errorMessage && (
                <div className="text-red-500 mt-2">{errorMessage}</div>
            )}
        </main>
    );
}

export default App;
