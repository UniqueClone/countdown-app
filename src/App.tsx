import { useState } from "react";
import "./App.css";
import Countdown from "./Countdown";
import TimePicker from "./TimePicker";

const nowPlusOneMinute = () => new Date(+new Date().setSeconds(0) + 1000 * 60);
const timePlusOneDay = (time: Date) => new Date(+time + 1000 * 60 * 60 * 24);

function App() {
    const [targetTime, setTargetTime] = useState<Date>(nowPlusOneMinute());
    const [countdownStarted, setCountdownStarted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleStartCountdown = () => {
        if (targetTime.getTime() <= Date.now()) {
            setTargetTime(timePlusOneDay(targetTime));
        } else {
            setTargetTime(targetTime);
        }
        setCountdownStarted(true);
    };

    const handleTargetTimeChange = (date: Date | null) => {
        if (date && !isNaN(date.getTime())) {
            if (date.getTime() > Date.now()) {
                if (date.getTime() > Date.now() + 1000 * 60 * 60 * 24) {
                    setTargetTime(new Date(+date - 1000 * 60 * 60 * 24));
                } else {
                    // if the selected time is in the future
                    setTargetTime(date);
                }
                setErrorMessage(null); // clear any previous error message
                setCountdownStarted(false); // reset the countdown
            } else if (date.getTime() < Date.now()) {
                // if the selected time is in the past, add 24 hours to it
                setTargetTime(new Date(+date + 1000 * 60 * 60 * 24)); // 24 hours in milliseconds
                setErrorMessage(null); // clear any previous error message
                setCountdownStarted(false); // reset the countdown
            } else {
                // Display a custom message or use a modal instead of alert
                console.log("Please select a future time.");
                // You can also use a state to show a message in the UI
                setErrorMessage("Please select a future time.");
            }
        }
    };

    return (
        <main className="container p-4 mx-auto">
            <div className="mb-4">
                <label
                    htmlFor="target-time"
                    className="block text-lg font-medium mb-2"
                >
                    Select Target Time:
                </label>
                <TimePicker
                    selectedTime={targetTime}
                    setSelectedTime={handleTargetTimeChange}
                />
                <div
                    onClick={() =>
                        handleTargetTimeChange(
                            nowPlusOneMinute() // 1 minute in the future
                        )
                    }
                    className="text-sm text-blue-500 cursor-pointer underline mt-2"
                >
                    Reset
                </div>
            </div>

            {countdownStarted ? (
                <>
                    <Countdown targetDate={targetTime} />
                    <button
                        onClick={() => {
                            setCountdownStarted(false);
                        }}
                        className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Stop Countdown
                    </button>
                </>
            ) : (
                <button
                    onClick={() => handleStartCountdown()}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
